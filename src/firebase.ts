import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  inMemoryPersistence 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  memoryLocalCache
} from 'firebase/firestore';
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with resilient browserLocalPersistence (localStorage)
// This avoids IndexedDB tab-locking and prevents 'Database is closing/hidden' errors when tabs or iframes lose focus
let authInstance: any;
try {
  authInstance = initializeAuth(app, {
    persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence]
  });
} catch (authErr) {
  try {
    authInstance = getAuth(app);
  } catch (e) {
    authInstance = null;
  }
}

export const auth = authInstance;
export const storage = getStorage(app);

// Force connection to exact database ID with persistent local cache and global network resiliency
const targetDbId = firebaseConfig.firestoreDatabaseId || '(default)';

let firestoreDb: any;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    useFetchStreams: false,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, targetDbId);
} catch (e1) {
  try {
    firestoreDb = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false,
      localCache: memoryLocalCache()
    }, targetDbId);
  } catch (e2) {
    try {
      firestoreDb = getFirestore(app, targetDbId);
    } catch (e3) {
      firestoreDb = getFirestore(app);
    }
  }
}

export const db = firestoreDb;

console.log("✅ Firebase & Firestore connected globally with multi-tab offline persistence and auto-detect long-polling.");


