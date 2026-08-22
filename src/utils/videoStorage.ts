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
    const rawKey = String(id);
    const bareKey = rawKey.replace(/^post_|^reel_/, '');
    const postKey = 'post_' + bareKey;
    const reelKey = 'reel_' + bareKey;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      store.put(fileOrBlob, rawKey);
      store.put(fileOrBlob, bareKey);
      store.put(fileOrBlob, postKey);
      store.put(fileOrBlob, reelKey);

      tx.oncomplete = () => {
        resolve(true);
      };

      tx.onerror = () => {
        console.warn(`IndexedDB save failed for ${id}:`, tx.error);
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
  const rawKey = String(id);
  const bareKey = rawKey.replace(/^post_|^reel_/, '');
  const keysToTry = Array.from(new Set([rawKey, bareKey, 'post_' + bareKey, 'reel_' + bareKey]));

  for (const k of keysToTry) {
    if (objectUrlCache.has(k)) {
      const cached = objectUrlCache.get(k)!;
      if (cached && !cached.startsWith('data:image')) return cached;
    }
  }

  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      let foundUrl: string | null = null;
      let pendingCount = keysToTry.length;

      keysToTry.forEach(key => {
        const req = store.get(key);
        req.onsuccess = () => {
          const result = req.result;
          if (!foundUrl && result && (result instanceof Blob || result instanceof File)) {
            foundUrl = URL.createObjectURL(result);
            keysToTry.forEach(k => objectUrlCache.set(k, foundUrl!));
          }
          pendingCount--;
          if (pendingCount === 0 || foundUrl) {
            resolve(foundUrl);
          }
        };
        req.onerror = () => {
          pendingCount--;
          if (pendingCount === 0) resolve(foundUrl);
        };
      });
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
    const rawKey = String(id);
    const bareKey = rawKey.replace(/^post_|^reel_/, '');
    objectUrlCache.set(rawKey, url);
    objectUrlCache.set(bareKey, url);
    objectUrlCache.set('post_' + bareKey, url);
    objectUrlCache.set('reel_' + bareKey, url);
  }
}

export function getCachedVideoUrlInMemory(id: string): string | null {
  if (!id) return null;
  const rawKey = String(id);
  const bareKey = rawKey.replace(/^post_|^reel_/, '');
  const keysToTry = [rawKey, bareKey, 'post_' + bareKey, 'reel_' + bareKey];

  for (const k of keysToTry) {
    const found = objectUrlCache.get(k);
    if (found && !found.startsWith('data:image')) return found;
  }
  return null;
}
