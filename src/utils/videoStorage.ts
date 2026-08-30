/**
 * High-capacity Resilient IndexedDB Video Blob Storage Manager
 * Stores uploaded video files directly in browser IndexedDB (up to 2GB+)
 * Prevents video Reels and Feed videos from disappearing after real-time Firestore syncs.
 * Built with full lifecycle safety against "Database is closing/hidden" and tab transitions.
 */

const DB_NAME = 'VyaparBridge_VideoDB';
const STORE_NAME = 'videos';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase | null> | null = null;

function resetDB() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (e) {}
  }
  dbInstance = null;
  dbPromise = null;
}

// Reset connections safely on tab visibility hidden, freeze, or pagehide
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => resetDB());
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        resetDB();
      }
    });
  }
}

function isDbOpen(db: IDBDatabase | null): boolean {
  if (!db) return false;
  try {
    // If database connection is closing or closed, accessing transaction will throw InvalidStateError
    const tx = db.transaction(STORE_NAME, 'readonly');
    tx.abort();
    return true;
  } catch (e) {
    return false;
  }
}

async function getDB(forceFresh: boolean = false): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return null;
  }

  if (forceFresh) {
    resetDB();
  }

  if (dbInstance && isDbOpen(dbInstance)) {
    return dbInstance;
  } else if (dbInstance) {
    resetDB();
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        try {
          const db = event.target?.result || request.result;
          if (db && !db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        } catch (err) {}
      };

      request.onsuccess = (event: any) => {
        const db: IDBDatabase = event.target?.result || request.result;
        if (db) {
          dbInstance = db;
          db.onclose = () => resetDB();
          db.onversionchange = () => resetDB();
          db.onerror = () => resetDB();
        }
        resolve(db);
      };

      request.onerror = () => {
        resetDB();
        resolve(null);
      };

      request.onblocked = () => {
        resetDB();
        resolve(null);
      };
    } catch (e) {
      resetDB();
      resolve(null);
    }
  });

  return dbPromise;
}

/**
 * Save a video Blob/File to IndexedDB under postId or reelId
 */
export async function saveVideoBlob(id: string, fileOrBlob: Blob | File): Promise<boolean> {
  if (!id || !fileOrBlob) return false;

  const rawKey = String(id);
  const bareKey = rawKey.replace(/^post_|^reel_/, '');
  const postKey = 'post_' + bareKey;
  const reelKey = 'reel_' + bareKey;

  const attemptSave = async (retryFresh: boolean = false): Promise<boolean> => {
    try {
      const db = await getDB(retryFresh);
      if (!db) return false;

      return await new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);

          store.put(fileOrBlob, rawKey);
          store.put(fileOrBlob, bareKey);
          store.put(fileOrBlob, postKey);
          store.put(fileOrBlob, reelKey);

          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
          tx.onabort = () => resolve(false);
        } catch (txErr: any) {
          const msg = String(txErr?.message || txErr || '');
          if (msg.includes('closing') || msg.includes('InvalidStateError')) {
            resetDB();
          }
          resolve(false);
        }
      });
    } catch (e: any) {
      const msg = String(e?.message || e || '');
      if (msg.includes('closing') || msg.includes('InvalidStateError')) {
        resetDB();
      }
      return false;
    }
  };

  let saved = await attemptSave(false);
  if (!saved) {
    // Retry once with a freshly opened connection
    saved = await attemptSave(true);
  }
  return saved;
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

  const attemptGet = async (retryFresh: boolean = false): Promise<string | null> => {
    try {
      const db = await getDB(retryFresh);
      if (!db) return null;

      return await new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          let foundUrl: string | null = null;
          let pendingCount = keysToTry.length;

          keysToTry.forEach((key) => {
            try {
              const req = store.get(key);
              req.onsuccess = () => {
                const result = req.result;
                if (!foundUrl && result && (result instanceof Blob || result instanceof File)) {
                  let safeBlob = result;
                  if (!result.type || result.type === 'application/octet-stream' || result.type === '') {
                    safeBlob = new Blob([result], { type: 'video/mp4' });
                  }
                  foundUrl = URL.createObjectURL(safeBlob);
                  keysToTry.forEach((k) => objectUrlCache.set(k, foundUrl!));
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
            } catch (getErr) {
              pendingCount--;
              if (pendingCount === 0) resolve(foundUrl);
            }
          });
        } catch (txErr: any) {
          const msg = String(txErr?.message || txErr || '');
          if (msg.includes('closing') || msg.includes('InvalidStateError')) {
            resetDB();
          }
          resolve(null);
        }
      });
    } catch (e: any) {
      const msg = String(e?.message || e || '');
      if (msg.includes('closing') || msg.includes('InvalidStateError')) {
        resetDB();
      }
      return null;
    }
  };

  let found = await attemptGet(false);
  if (!found) {
    found = await attemptGet(true);
  }
  return found;
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
