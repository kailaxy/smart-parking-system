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

const getEnv = (name: string): string | undefined => {
  const value = (import.meta.env as Record<string, string | undefined>)[name];
  if (!value || !value.trim()) {
    return undefined;
  }
  return value;
};

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const missing = REQUIRED_KEYS.filter((key) => !getEnv(key));
if (missing.length > 0) {
  throw new Error(`Missing Firebase environment variables: ${missing.join(', ')}`);
}

const firebaseConfig: FirebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY')!,
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN')!,
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID')!,
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET')!,
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID')!,
  appId: getEnv('VITE_FIREBASE_APP_ID')!,
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID'),
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

export { app, db, firebaseConfig };
