// Server-side Firestore using the Firebase Web SDK (NOT firebase-admin).
// AI Studio's runtime does not provide privileged Admin credentials, so we use
// the public web config + Security Rules, exactly like the client does.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../../firebase-applet-config.json';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Use the named applet database id from the config.
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Backwards-compatible accessor used by server.ts
export function getDb(): Firestore {
  return db;
}
