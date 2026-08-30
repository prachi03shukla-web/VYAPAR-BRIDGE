import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// AI Studio provisioned config
import defaultConfig from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig?.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig?.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig?.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig?.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig?.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig?.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIRESTORE_DATABASE_ID || defaultConfig?.firestoreDatabaseId
};

// Diagnostic Check
console.log("--- Firebase Configuration Audit ---");
console.log("Project ID:", firebaseConfig.projectId);
console.log("Database ID:", firebaseConfig.firestoreDatabaseId || "(default)");

if (!firebaseConfig.projectId) {
  console.error("CRITICAL: Firebase Project ID is missing!");
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const storage = getStorage(app);

// Force connection to exact database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

console.log("Firebase initialized successfully.");


