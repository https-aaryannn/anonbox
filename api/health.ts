import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const db = initFirebaseAdmin();
  res.json({
    ok: true,
    service: 'anonbox-api',
    dbReady: !!db,
  });
}