/**
 * AnonBox API Server
 *
 * Runs alongside the Vite app in dev (see vite.config.ts server.proxy) and can
 * be deployed standalone in production.
 *
 * Responsibilities:
 *   - GET /api/confessions  -> public, authenticated via Bearer API key.
 *       Returns ONLY the confessions owned by the API key's owner.
 *   - GET /api/health      -> health check.
 *
 * Keys are stored in Firestore as SHA-256 hashes under `apiKeys/{doc}` and are
 * validated on every request. The raw key is never stored, logged, or returned.
 *
 * Env: firebaseAdmin, serviceAccount (path to a firebase-admin JSON), port.
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import admin from 'firebase-admin';

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

/**
 * Initialize Firebase Admin.
 */
let db = null;
let dbError = null;

function initFirebaseAdmin() {
    if (db) return db;

    const serviceAccountPath =
        process.env.serviceAccount || process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountPath) {
        dbError =
            'Missing serviceAccount env var. Set it to the path of your firebase-admin service account JSON for this project to look up API keys.';
        return null;
    }

    try {
        const serviceAccount = JSON.parse(
            fs.readFileSync(path.resolve(process.cwd(), serviceAccountPath), 'utf-8')
        );
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
        db = admin.firestore();
        dbError = null;
    } catch (err) {
        dbError = err.message || 'Failed to initialize Firebase Admin';
    }
    return db;
}

const CONFESSIONS_COLLECTION = 'confessions';
const API_KEYS_COLLECTION = 'apiKeys';

// ---------------------------------------------------------------------------
// Rate limiting (per IP, in-memory). Fine for a single instance. For a
// multi-instance deployment swap this for a Redis/proxy-backed limiter.
// ---------------------------------------------------------------------------
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 60;
const rateHits = new Map();

function rateLimit(req, res, next) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const current = rateHits.get(ip);

    if (!current || current.resetAt <= now) {
        rateHits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return next();
    }

    current.count += 1;
    if (current.count > MAX_REQUESTS) {
        res.set('Retry-After', Math.ceil((current.resetAt - now) / 1000));
        return res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil((current.resetAt - now) / 1000),
        });
    }
    return next();
}

// Periodic cleanup of the rate map so it doesn't grow unboundedly.
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateHits) {
        if (entry.resetAt <= now) rateHits.delete(ip);
    }
}, WINDOW_MS).unref?.();

// ---------------------------------------------------------------------------
// Key helpers
// ---------------------------------------------------------------------------
function sha256Hex(input) {
    return crypto.createHash('sha256').update(input, 'utf-8').digest('hex');
}

// Validates the Authorization header and returns the owning account uid.
// No user-facing document leaks the raw key; only the hash is stored.
async function authFromRequest(req) {
    const header = req.headers['authorization'] || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match || !match[1]) return null;

    const keyHash = sha256Hex(match[1]);
    const snapshot = await db
        .collection(API_KEYS_COLLECTION)
        .where('keyHash', '==', keyHash)
        .limit(1)
        .get();

    if (snapshot.empty) return null;

    const docData = snapshot.docs[0].data();
    const keyDocRef = snapshot.docs[0].ref;

    // Opportunistically record last used (fire-and-forget).
    keyDocRef
        .update({ lastUsedAt: admin.firestore.FieldValue.serverTimestamp() })
        .catch(() => {});

    return docData.ownerUid;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'anonbox-api', dbReady: !!db });
});

app.get('/api/confessions', rateLimit, async (req, res) => {
    if (!db) {
        return res.status(500).json({
            error: 'Server not configured',
            detail: dbError || 'Firebase Admin not initialized',
        });
    }

    let ownerUid;
    try {
        ownerUid = await authFromRequest(req);
    } catch (err) {
        console.error('[api/confessions] auth lookup failed:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }

    if (!ownerUid) {
        return res.status(401).json({ error: 'Invalid or missing API key' });
    }

    // Query params: ?limit=, ?offset=, ?archived=true|false
    const rawLimit = parseInt(req.query.limit, 10);
    const rawOffset = parseInt(req.query.offset, 10);

    const itemLimit = Number.isNaN(rawLimit)
        ? 10
        : Math.min(Math.max(rawLimit, 1), 50);
    const itemOffset = Number.isNaN(rawOffset) ? 0 : Math.max(rawOffset, 0);

    const archivedParam =
        req.query.archived === undefined
            ? undefined
            : String(req.query.archived).toLowerCase() === 'true';

    try {
        let q = db
            .collection(CONFESSIONS_COLLECTION)
            .where('ownerUid', '==', ownerUid)
            .orderBy('createdAt', 'desc');

        const snapshot = await q
            .limit(itemLimit)
            .offset(itemOffset)
            .get();

        const confessions = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (
                archivedParam !== undefined &&
                (data.archived || false) !== archivedParam
            ) {
                return;
            }
            const ts = data.createdAt;
            confessions.push({
                id: docSnap.id,
                content: data.content,
                archived: data.archived || false,
                created_at: ts?.toDate?.()
                    ? ts.toDate().toISOString()
                    : new Date().toISOString(),
            });
        });

        res.json({
            confessions,
            count: confessions.length,
            limit: itemLimit,
            offset: itemOffset,
        });
    } catch (err) {
        console.error('[api/confessions] query failed:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`AnonBox API server listening on port ${PORT}`);
});