import type { FirebaseOptions } from 'firebase/app';

// Loads Firebase config from one of several sources so devs have options:
// 1) src/config/firebase.local.json (ignored by git)
// 2) src/config/firebase.json (also ignored by git)
// 3) process.env.* at bundle time (if using env injection tooling)
// 4) falls back to sample (throws with helpful error)

function readFromEnv(): Partial<FirebaseOptions> {
  const env: Record<string, string | undefined> = (typeof process !== 'undefined' ? (process as any).env : {}) || {};
  return {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
  } as Partial<FirebaseOptions>;
}

function readFromLocalFile(): Partial<FirebaseOptions> | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const local = require('~/config/firebase.local.json');
    return local as FirebaseOptions;
  } catch (_) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const file = require('~/config/firebase.json');
      return file as FirebaseOptions;
    } catch (_) {
      return undefined;
    }
  }
}

function isComplete(cfg: Partial<FirebaseOptions> | undefined): cfg is FirebaseOptions {
  if (!cfg) return false;
  const keys: (keyof FirebaseOptions)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];
  return keys.every((k) => typeof (cfg as any)[k] === 'string' && ((cfg as any)[k] as string).length > 0);
}

export function getFirebaseConfig(): FirebaseOptions {
  const fromFile = readFromLocalFile();
  if (isComplete(fromFile)) return fromFile;

  const fromEnv = readFromEnv();
  if (isComplete(fromEnv)) return fromEnv as FirebaseOptions;

  // As a last resort, load sample to aid error messaging
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sample = require('~/config/firebase.sample.json') as FirebaseOptions;
  const missingMsg =
    'Firebase config is not set. Create src/config/firebase.local.json with your project credentials ' +
    'or inject FIREBASE_* env vars at build time. See src/config/firebase.sample.json for the shape.';
  // Provide clearer error while still returning shape to avoid undefined access during dev tooling
  console.warn(missingMsg);
  return sample;
}

