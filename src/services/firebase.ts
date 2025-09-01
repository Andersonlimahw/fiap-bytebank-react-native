// Firebase modular SDK (v9+)
// Centralized Firebase initialization and auth helpers
import { initializeApp, getApps } from 'firebase/app';
import {
  // initializeAuth, // Not used to avoid RN-specific deps during build
  getAuth,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  query,
  where,
} from 'firebase/firestore';

import { getFirebaseConfig } from '~/config/firebase';

const firebaseConfig = getFirebaseConfig();

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Use default auth without RN-specific persistence to avoid extra native deps
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function emailPasswordSignIn(email: string, password: string) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  } catch (e: any) {
    // If user not found, create an account then sign-in
    if (e?.code === 'auth/user-not-found') {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      return res.user;
    }
    throw e;
  }
}

// Google Sign-In using optional native module '@react-native-google-signin/google-signin'
export async function googleSignIn() {
  let GoogleSignin: any;
  try {
    // Use eval to avoid Metro static resolution when module is not installed
    // eslint-disable-next-line no-eval
    GoogleSignin = (eval('require')('@react-native-google-signin/google-signin') as any).GoogleSignin;
  } catch (_) {
    throw new Error(
      "Google Sign-In not configured. Install '@react-native-google-signin/google-signin' and follow the native setup."
    );
  }

  // Make sure it is configured at least once; consumers can configure elsewhere as needed
  try {
    GoogleSignin.configure({});
  } catch (_) {
    // ignore if already configured
  }

  const { idToken } = await GoogleSignin.signIn();
  if (!idToken) throw new Error('Google Sign-In failed: no idToken');
  const credential = GoogleAuthProvider.credential(idToken);
  const res = await signInWithCredential(auth, credential);
  return res.user;
}

export function isGoogleSignInAvailable(): boolean {
  try {
    // eslint-disable-next-line no-eval
    eval('require')("@react-native-google-signin/google-signin");
    return true;
  } catch (_) {
    return false;
  }
}

// Apple Sign-In using optional native module '@invertase/react-native-apple-authentication'
export async function appleSignIn() {
  let appleAuth: any;
  try {
    // eslint-disable-next-line no-eval
    appleAuth = (eval('require')('@invertase/react-native-apple-authentication') as any).default;
  } catch (_) {
    throw new Error(
      "Apple Sign-In not configured. Install '@invertase/react-native-apple-authentication' and follow the native setup."
    );
  }

  // Simple nonce – for production consider a cryptographically strong nonce
  const nonce = Math.random().toString(36).slice(2);
  const response = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    nonce,
  });
  const idToken = response?.identityToken;
  if (!idToken) throw new Error('Apple Sign-In failed: no identityToken');

  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({ idToken, rawNonce: nonce });
  const res = await signInWithCredential(auth, credential);
  return res.user;
}

export function isAppleSignInAvailable(): boolean {
  try {
    // eslint-disable-next-line no-eval
    eval('require')("@invertase/react-native-apple-authentication");
    return true;
  } catch (_) {
    return false;
  }
}

export async function signOut() {
  await fbSignOut(auth);
}

// User profile helpers (users/{uid})
export async function getOrCreateUserProfile(uid: string, fallback?: Partial<{ name: string; email: string }>) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: uid, ...(snap.data() as any) };
  const payload = {
    name: fallback?.name ?? 'User',
    email: fallback?.email ?? '',
  };
  await setDoc(ref, payload, { merge: true });
  return { id: uid, ...payload };
}

export async function updateUserProfile(uid: string, payload: Partial<{ name: string; email: string }>) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, payload, { merge: true });
}

// Simple CRUD example for collection 'accounts'
export async function createAccount(payload: any) {
  const uid = auth.currentUser?.uid;
  const withOwner = { ...payload, ownerId: uid ?? null };
  const ref = await addDoc(collection(db, 'accounts'), withOwner);
  return ref.id;
}

export async function listAccounts() {
  const uid = auth.currentUser?.uid;
  const base = collection(db, 'accounts');
  const q = uid ? query(base, where('ownerId', '==', uid)) : base;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateAccount(id: string, payload: any) {
  await updateDoc(doc(db, 'accounts', id), payload);
}

export async function deleteAccount(id: string) {
  await deleteDoc(doc(db, 'accounts', id));
}

// Transactions CRUD (collection: transactions)
export async function createTransaction(payload: any) {
  const uid = auth.currentUser?.uid;
  const withMeta = { ...payload, ownerId: uid ?? null, createdAt: Date.now() };
  const ref = await addDoc(collection(db, 'transactions'), withMeta);
  // Try to update related account balance (client-side consistency)
  try {
    const accRef = doc(db, 'accounts', withMeta.accountId);
    const accSnap = await getDoc(accRef);
    if (accSnap.exists()) {
      const acc = accSnap.data() as any;
      const currentBalance = Number(acc.balance) || 0;
      const delta = withMeta.type === 'DEPOSIT' ? Number(withMeta.value) : -Number(withMeta.value);
      await updateDoc(accRef, { balance: currentBalance + delta });
    }
  } catch (_) {
    // ignore to avoid blocking
  }
  return ref.id;
}

export async function listTransactions(accountId: string) {
  const base = collection(db, 'transactions');
  const q = query(base, where('accountId', '==', accountId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateTransaction(id: string, payload: any) {
  const txRef = doc(db, 'transactions', id);
  const prevSnap = await getDoc(txRef);
  await updateDoc(txRef, payload);
  try {
    if (prevSnap.exists()) {
      const prev = prevSnap.data() as any;
      const accRef = doc(db, 'accounts', prev.accountId);
      const accSnap = await getDoc(accRef);
      if (accSnap.exists()) {
        const acc = accSnap.data() as any;
        const currentBalance = Number(acc.balance) || 0;
        const prevDelta = prev.type === 'DEPOSIT' ? Number(prev.value) : -Number(prev.value);
        const nextType = (payload.type ?? prev.type) as 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';
        const nextValue = Number(payload.value ?? prev.value);
        const nextDelta = nextType === 'DEPOSIT' ? nextValue : -nextValue;
        await updateDoc(accRef, { balance: currentBalance - prevDelta + nextDelta });
      }
    }
  } catch (_) {
    // ignore
  }
}

export async function deleteTransaction(id: string) {
  try {
    const txRef = doc(db, 'transactions', id);
    const snap = await getDoc(txRef);
    if (snap.exists()) {
      const tx = snap.data() as any;
      const accRef = doc(db, 'accounts', tx.accountId);
      const accSnap = await getDoc(accRef);
      if (accSnap.exists()) {
        const acc = accSnap.data() as any;
        const currentBalance = Number(acc.balance) || 0;
        const delta = tx.type === 'DEPOSIT' ? Number(tx.value) : -Number(tx.value);
        await updateDoc(accRef, { balance: currentBalance - delta });
      }
    }
  } catch (_) {
    // ignore
  }
  await deleteDoc(doc(db, 'transactions', id));
}
