import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

// Firebase Admin initialization
let adminApp;

export function getAdminApp() {
  const existing = getApps();
  if (existing.length) return existing[0];

  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  // AI Studio provides Application Default Credentials at runtime;
  // we only need to pin the projectId.
  return initializeApp({ projectId: config.projectId });
}

export function getAdminDb() {
  const app = getAdminApp();
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return getFirestore(app, config.firestoreDatabaseId);
}

export function getAdminAuth() {
  const app = getAdminApp();
  return getAuth(app);
}
