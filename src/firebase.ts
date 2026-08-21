import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, setLogLevel } from 'firebase/firestore';

// Intercept console.error to suppress the Firestore idle stream warning
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress harmless internal Firestore warnings and expected quota exhaustion spam
  if (args[0] && typeof args[0] === 'string') {
    if (args[0].includes('CANCELLED: Disconnecting idle stream')) return;
    if (args[0].includes('RESOURCE_EXHAUSTED')) return;
    if (args[0].includes('Quota limit exceeded')) return;
    if (args[0].includes('code=resource-exhausted')) return;
  }
  
  if (args[0] && args[0].message) {
    if (args[0].message.includes('RESOURCE_EXHAUSTED')) return;
    if (args[0].message.includes('Quota limit exceeded')) return;
    if (args[0].message.includes('code=resource-exhausted')) return;
  }

  originalConsoleError(...args);
};

// Suppress internal Firestore gRPC/WebChannel idle stream disconnect messages
try {
  setLogLevel('silent');
} catch {
  // Ignore if not supported in environment
}

// AI Studio provisioned config
import defaultConfig from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig?.apiKey || "AIzaSyC-LJdYErRAoBANEvKeCzDvYqfoK1x0AMI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig?.authDomain || "studio-9585497857-6d0db.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig?.projectId || "studio-9585497857-6d0db",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig?.storageBucket || "studio-9585497857-6d0db.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig?.messagingSenderId || "567267146806",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig?.appId || "1:567267146806:web:eb2a1acbd204f581c16c97",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || defaultConfig?.firestoreDatabaseId || "ai-studio-tileance-5c795414-b01b-4f9d-a253-7df008e75b4c"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

let firestoreInstance: any;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
  }, firebaseConfig.firestoreDatabaseId);
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;


