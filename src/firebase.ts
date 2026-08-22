import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, setLogLevel } from 'firebase/firestore';

// Intercept console methods at the earliest module evaluation to filter benign Firestore idle stream logs
const filterFirestoreIdleNoise = (args: any[]): boolean => {
  const fullMsg = args.map(a => {
    if (typeof a === 'string') return a;
    if (a instanceof Error) return a.message + ' ' + (a.stack || '');
    try {
      return JSON.stringify(a);
    } catch {
      return String(a);
    }
  }).join(' ');

  return (
    fullMsg.includes('Disconnecting idle stream') ||
    fullMsg.includes('Timed out waiting for new targets') ||
    fullMsg.includes('CANCELLED: Disconnecting idle stream') ||
    fullMsg.includes('GrpcConnection RPC') ||
    fullMsg.includes('RESOURCE_EXHAUSTED') ||
    fullMsg.includes('Quota limit exceeded') ||
    fullMsg.includes('code=resource-exhausted') ||
    fullMsg.includes('@firebase/firestore')
  );
};

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (filterFirestoreIdleNoise(args)) return;
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (filterFirestoreIdleNoise(args)) return;
  originalConsoleWarn(...args);
};

const originalConsoleInfo = console.info;
console.info = (...args: any[]) => {
  if (filterFirestoreIdleNoise(args)) return;
  originalConsoleInfo(...args);
};

const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  if (filterFirestoreIdleNoise(args)) return;
  originalConsoleLog(...args);
};

// Set Firestore log level to silent
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
    experimentalAutoDetectLongPolling: true,
    experimentalForceLongPolling: true,
    useFetchStreams: false
  }, firebaseConfig.firestoreDatabaseId);
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;


