import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

// Firebase Admin initialization
let adminApp;

export function getAdminApp() {
  if (!getApps().length) {
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // If GOOGLE_APPLICATION_CREDENTIALS is set, it will automatically be used by default credential application.
      // If not, we still need to initialize the app with the project config.
      // Wait, in AI Studio, Application Default Credentials are provided.
      adminApp = initializeApp({
        projectId: config.projectId,
      });
    } catch (e) {
      console.error('Error initializing Firebase Admin:', e);
      adminApp = initializeApp();
    }
  } else {
    adminApp = getApps()[0];
  }
  return adminApp;
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
