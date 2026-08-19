import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import crypto from 'crypto';

// Lazy init Firebase Admin
let db: admin.firestore.Firestore | null = null;
let dbError: string | null = null;

function initFirebaseAdmin() {
  if (db) return db;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    dbError = 'Missing FIREBASE_SERVICE_ACCOUNT_JSON env var';
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    db = admin.firestore();
    dbError = null;
  } catch (err: any) {
    dbError = err.message || 'Failed to init Firebase Admin';
  }
  return db;
}

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf-8').digest('hex');
}

async function authenticateKey(req: VercelRequest): Promise<string | null> {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1]) return null;

  const keyHash = sha256Hex(match[1]);
  const db = initFirebaseAdmin();
  if (!db) return null;

  const snapshot = await db
    .collection('apiKeys')
    .where('keyHash', '==', keyHash)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const docData = snapshot.docs[0].data();
  // Fire-and-forget lastUsedAt update
  snapshot.docs[0].ref
    .update({ lastUsedAt: admin.firestore.FieldValue.serverTimestamp() })
    .catch(() => {});

  return docData.ownerUid;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const db = initFirebaseAdmin();
  if (!db) {
    return res.status(500).json({
      error: 'Server not configured',
      detail: dbError,
    });
  }

  const ownerUid = await authenticateKey(req);
  if (!ownerUid) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  // Rate limiting (simple in-memory per instance - acceptable for serverless)
  // Vercel isolates instances; for stricter limits use Upstash Redis or similar.

  const rawLimit = parseInt((req.query.limit as string) || '10', 10);
  const rawOffset = parseInt((req.query.offset as string) || '0', 10);
  const itemLimit = Number.isNaN(rawLimit) ? 10 : Math.min(Math.max(rawLimit, 1), 50);
  const itemOffset = Number.isNaN(rawOffset) ? 0 : Math.max(rawOffset, 0);

  const archivedParam = req.query.archived;
  const archivedFilter =
    archivedParam === undefined
      ? undefined
      : String(archivedParam).toLowerCase() === 'true';

  try {
    let q = db
      .collection('confessions')
      .where('ownerUid', '==', ownerUid)
      .orderBy('createdAt', 'desc');

    const snapshot = await q.limit(itemLimit).offset(itemOffset).get();

    const confessions: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (
        archivedFilter !== undefined &&
        (data.archived || false) !== archivedFilter
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
    res.status(500).json({ error: 'Internal server error' });
  }
}