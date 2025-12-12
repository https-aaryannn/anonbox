import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    orderBy,
    query,
    limit,
    Timestamp
} from 'firebase/firestore';
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { Confession } from '../types';

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

// Collection Reference
const CONFESSIONS_COLLECTION = 'confessions';

// --- Confession Functions ---

export const saveConfession = async (content: string): Promise<void> => {
    if (!content.trim()) return;

    await addDoc(collection(db, CONFESSIONS_COLLECTION), {
        content,
        createdAt: Timestamp.now(),
        read: false,     // Renamed from isRead to match user request (read/unread)
        archived: false
    });
};

export const getConfessions = async (): Promise<Confession[]> => {
    const q = query(
        collection(db, CONFESSIONS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(100) // Safety limit
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
            id: docSnapshot.id,
            content: data.content,
            // Handle Timestamp conversion to number for compatibility with existing types
            createdAt: data.createdAt?.toMillis() || Date.now(),
            isRead: data.read || false, // Mapping 'read' from Firestore to 'isRead' in app type
            // Add other fields that might be missing or optional
        } as Confession;
    });
};

export const updateConfession = async (id: string, updates: Partial<Confession>): Promise<void> => {
    const confessionRef = doc(db, CONFESSIONS_COLLECTION, id);
    // We need to handle the case where updates contains undefined values or incompatible types if strictly typed,
    // but for Firestore we usually just pass the object. 
    // However, Confession type has 'id' which we shouldn't update, and 'createdAt' is number.
    // Firestore stores Date/Timestamp. 
    // For simplicity in this helper, we'll exclude id.
    const { id: _id, ...dataToUpdate } = updates as any;
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

export const loginAdmin = async (email: string, pass: string) => {
    return await signInWithEmailAndPassword(auth, email, pass);
};

export const logoutAdmin = async () => {
    return await signOut(auth);
};

export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
};
