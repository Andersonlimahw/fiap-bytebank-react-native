// Firebase modular SDK (v9)
// Fill the config with your Firebase project credentials
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export async function emailPasswordSignIn(email: string, password: string) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
}

export async function signOut() {
  await fbSignOut(auth);
}

// Simple CRUD example for collection 'accounts'
export async function createAccount(payload: any) {
  const ref = await addDoc(collection(db, 'accounts'), payload);
  return ref.id;
}

export async function listAccounts() {
  const snap = await getDocs(collection(db, 'accounts'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateAccount(id: string, payload: any) {
  await updateDoc(doc(db, 'accounts', id), payload);
}

export async function deleteAccount(id: string) {
  await deleteDoc(doc(db, 'accounts', id));
}

