import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db: any = null;
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
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
    db = getFirestore();
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
    detail: dbError,
  });
}