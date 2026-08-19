import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    orderBy,
    query,
    where,
    limit,
    Timestamp
} from 'firebase/firestore';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { Confession, ApiKeyStatus, ApiKeyResult } from '../types';

// Initialize Firebase
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Collection References
const CONFESSIONS_COLLECTION = 'confessions';
const API_KEYS_COLLECTION = 'apiKeys';

// --- Confession Functions (tenant-scoped) ---
// Every confession is stored with the ownerUid of the account whose page it
// was submitted on. Reads/writes are always filtered to the current user's uid
// AND enforced server-side by Firestore security rules.

export const saveConfessionForOwner = async (ownerUid: string, content: string): Promise<void> => {
    if (!content.trim()) return;
    if (!ownerUid || ownerUid.length === 0) {
        throw new Error('Invalid confession page.');
    }

    await addDoc(collection(db, CONFESSIONS_COLLECTION), {
        content,
        ownerUid,
        createdAt: Timestamp.now(),
        read: false,
        archived: false
    });
};

export const getMyConfessions = async (): Promise<Confession[]> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    const q = query(
        collection(db, CONFESSIONS_COLLECTION),
        where('ownerUid', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(500)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
            id: docSnapshot.id,
            content: data.content,
            createdAt: data.createdAt?.toMillis() || Date.now(),
            isRead: data.read || false,
            archived: data.archived || false,
        } as Confession;
    });
};

export const updateConfession = async (id: string, updates: Partial<Confession>): Promise<void> => {
    const confessionRef = doc(db, CONFESSIONS_COLLECTION, id);
    const { id: _id, createdAt: _createdAt, ...dataToUpdate } = updates as any;
    await updateDoc(confessionRef, dataToUpdate);
};

export const markConfessionRead = async (id: string, read: boolean): Promise<void> => {
    const confessionRef = doc(db, CONFESSIONS_COLLECTION, id);
    await updateDoc(confessionRef, { read });
};

export const archiveConfession = async (id: string, archived: boolean): Promise<void> => {
    const confessionRef = doc(db, CONFESSIONS_COLLECTION, id);
    await updateDoc(confessionRef, { archived });
};

export const deleteConfession = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, CONFESSIONS_COLLECTION, id));
};

// --- Auth Functions ---

export const registerUser = async (email: string, pass: string) => {
    return await createUserWithEmailAndPassword(auth, email, pass);
};

export const signInUser = async (email: string, pass: string) => {
    return await signInWithEmailAndPassword(auth, email, pass);
};

export const signOutUser = async () => {
    return await signOut(auth);
};

export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// --- API Key Functions ---
// Keys are stored as SHA-256 hashes (never raw). The raw key only exists
// server-side / in the caller's hands at generation time.

async function sha256Hex(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export type PublicKeyRecord = {
    id: string;
    createdAt: number;
    lastUsedAt: number | null;
    preview: string;
};

export async function generateApiKey(ownerUid: string): Promise<ApiKeyResult> {
    const currentUser = auth.currentUser;
    if (!currentUser) return { ok: false, error: 'Not authenticated.' };

    const rawKey = `anbx_${crypto.getRandomValues(new Uint32Array(4))
        .map(n => n.toString(16).padStart(8, '0')).join('')}_${crypto.randomUUID().replace(/-/g, '')}`;

    const keyHash = await sha256Hex(rawKey);
    const existing = await getApiKey(ownerUid);

    if (existing) {
        // Re-generate: remove the old hash first (server rules keep it scoped).
        await deleteDoc(doc(db, API_KEYS_COLLECTION, existing.id));
    }

    await addDoc(collection(db, API_KEYS_COLLECTION), {
        ownerUid,
        keyHash,
        createdAt: Timestamp.now(),
        lastUsedAt: null
    });

    return { ok: true, key: rawKey };
}

async function getApiKey(ownerUid: string): Promise<PublicKeyRecord | null> {
    const q = query(
        collection(db, API_KEYS_COLLECTION),
        where('ownerUid', '==', ownerUid),
        limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0].data();
    return {
        id: snap.docs[0].id,
        createdAt: d.createdAt?.toMillis() || Date.now(),
        lastUsedAt: d.lastUsedAt?.toMillis() ?? null,
        preview: `${d.keyHash.slice(0, 8)}…${d.keyHash.slice(-4)}`
    };
}

export async function getApiKeyStatus(ownerUid: string): Promise<ApiKeyStatus> {
    const record = await getApiKey(ownerUid);
    if (!record) return { hasKey: false, createdAt: null, lastUsedAt: null, preview: null };
    return {
        hasKey: true,
        createdAt: record.createdAt,
        lastUsedAt: record.lastUsedAt,
        preview: record.preview
    };
}

export async function revokeApiKey(ownerUid: string): Promise<void> {
    const record = await getApiKey(ownerUid);
    if (record) {
        await deleteDoc(doc(db, API_KEYS_COLLECTION, record.id));
    }
}