import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

const env =
  ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}) as
    Record<string, string | undefined>;

const REQUIRED_KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

const missing = REQUIRED_KEYS.filter((key) => !env[key]);
if (missing.length > 0) {
  throw new Error(`Missing Firebase environment variables: ${missing.join(', ')}`);
}

const firebaseConfig: FirebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID!,
  measurementId: env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

export { app, db, firebaseConfig };
