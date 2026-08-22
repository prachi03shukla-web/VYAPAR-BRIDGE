/**
 * High-capacity IndexedDB Video Blob Storage Manager
 * Stores uploaded video files directly in browser IndexedDB (up to 2GB+)
 * Prevents video Reels and Feed videos from disappearing after real-time Firestore syncs.
 */

const DB_NAME = 'VyaparBridge_VideoDB';
const STORE_NAME = 'videos';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      console.warn('IndexedDB video storage open error:', event.target.error);
      reject(event.target.error);
    };
  });

  return dbPromise;
}

/**
 * Save a video Blob/File to IndexedDB under postId or reelId
 */
export async function saveVideoBlob(id: string, fileOrBlob: Blob | File): Promise<boolean> {
  if (!id || !fileOrBlob) return false;
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(fileOrBlob, String(id));

      req.onsuccess = () => {
        resolve(true);
      };

      req.onerror = () => {
        console.warn(`IndexedDB save failed for ${id}:`, req.error);
        resolve(false);
      };
    });
  } catch (e) {
    console.warn('saveVideoBlob error:', e);
    return false;
  }
}

/**
 * Retrieve a stored video Blob from IndexedDB and return an object URL or null
 */
const objectUrlCache = new Map<string, string>();

export async function getVideoBlobUrl(id: string): Promise<string | null> {
  if (!id) return null;
  const key = String(id);

  if (objectUrlCache.has(key)) {
    return objectUrlCache.get(key)!;
  }

  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        const result = req.result;
        if (result && (result instanceof Blob || result instanceof File)) {
          const url = URL.createObjectURL(result);
          objectUrlCache.set(key, url);
          resolve(url);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch (e) {
    return null;
  }
}

/**
 * Sync memory cache for fast synchronous lookup
 */
export function cacheVideoUrlInMemory(id: string, url: string) {
  if (id && url && (url.startsWith('blob:') || url.startsWith('http') || url.startsWith('data:video') || url.startsWith('/uploads/'))) {
    objectUrlCache.set(String(id), url);
  }
}

export function getCachedVideoUrlInMemory(id: string): string | null {
  return objectUrlCache.get(String(id)) || null;
}
