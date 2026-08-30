/**
 * High-reliability Safe Storage Manager
 * Prevents "DOMException: Setting the value exceeded the quota" errors
 * by automatically evicting large temporary items (e.g. video blobs, bulky caches)
 * and safely compressing/sanitizing stored user and app records.
 */

// In-memory fallback map if localStorage is strictly full or disabled
const memoryFallbackStore = new Map<string, string>();

/**
 * Purge non-critical large items from localStorage when quota is tight
 */
export function cleanupStorageQuota(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const keysToRemove: string[] = [];
    const keysToTrim: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;

      // 1. Remove any video data strings in localStorage (videos belong in IndexedDB!)
      if (k.startsWith('vyapar_video_') || k.startsWith('video_blob_') || k.startsWith('reel_media_')) {
        keysToRemove.push(k);
      }
      // 2. Remove obsolete or heavy temporary caches
      else if (
        k.startsWith('temp_') || 
        k === 'VyaparBridge_deleted_posts' || 
        k === 'vyapar_barcode_url' ||
        k.startsWith('vyapar_catalogues_')
      ) {
        keysToRemove.push(k);
      }
      // 3. User lists cache can be trimmed
      else if (k === 'local_users_cache' || k === 'local_brand_ads') {
        keysToTrim.push(k);
      }
    }

    // Execute removals
    keysToRemove.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    });

    // Execute trimming of bulky arrays
    keysToTrim.forEach(k => {
      try {
        const item = localStorage.getItem(k);
        if (item) {
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed) && parsed.length > 20) {
            // Keep only essential 20 items and strip big media
            const trimmed = parsed.slice(0, 20).map(obj => {
              if (obj && typeof obj === 'object') {
                const copy = { ...obj };
                // Strip huge base64 strings if any
                Object.keys(copy).forEach(prop => {
                  if (typeof copy[prop] === 'string' && copy[prop].length > 10000 && copy[prop].startsWith('data:')) {
                    delete copy[prop];
                  }
                });
                return copy;
              }
              return obj;
            });
            localStorage.setItem(k, JSON.stringify(trimmed));
          }
        }
      } catch (e) {
        try { localStorage.removeItem(k); } catch (err) {}
      }
    });

    console.info(`🧹 SafeStorage: Cleaned up ${keysToRemove.length} large storage items to free quota.`);
  } catch (err) {
    console.warn('Storage cleanup notice:', err);
  }
}

/**
 * Sanitize user object to ensure compact size before saving to localStorage
 */
export function sanitizeUserForStorage(user: any): any {
  if (!user || typeof user !== 'object') return user;

  const sanitized: any = {};
  
  // Whitelist of valid user fields to prevent deep nested bloat
  const allowedKeys = [
    'id', 'username', 'name', 'role', 'phone', 'email', 'bio', 'city', 'state',
    'address', 'gstNumber', 'isVerified', 'verifiedBadge', 'verifiedPlan',
    'membershipType', 'activeFreeOneYearPlan', 'subscriptionPlan', 'subscriptionAmount',
    'goldenBadge', 'fingerprintId', 'referralCode', 'referredBy', 'referralCount',
    'qualifiedReferralCount', 'referralRewardEligible', 'avatarUrl', 'avatar',
    'bannerUrl', 'visitingCard', 'qrCodeUrl', 'createdAt', 'updatedAt', 'lastLoginAt',
    'isAdmin', 'permissions', 'sellerDiscountsGiven', 'upiId'
  ];

  allowedKeys.forEach(k => {
    if (user[k] !== undefined) {
      let val = user[k];
      // If a base64 field is abnormally huge (> 300KB), truncate or skip it in localStorage
      // Firestore already holds the full asset
      if (typeof val === 'string' && val.length > 300000 && val.startsWith('data:')) {
        console.warn(`User field ${k} exceeds 300KB, compressing for localStorage safety.`);
        // We do not save huge 5MB data URLs inside user object in localStorage
        return;
      }
      sanitized[k] = val;
    }
  });

  return sanitized;
}

/**
 * Set Item with Quota Protection and Auto-Eviction Fallback
 */
export function safeSetLocalStorage(key: string, value: any): boolean {
  if (typeof window === 'undefined') return false;

  const stringVal = typeof value === 'string' ? value : JSON.stringify(value);

  try {
    localStorage.setItem(key, stringVal);
    memoryFallbackStore.set(key, stringVal);
    return true;
  } catch (error: any) {
    console.warn(`⚠️ localStorage quota exceeded for key '${key}'. Triggering eviction...`, error);
    
    // 1. First trigger cleanup
    cleanupStorageQuota();

    // 2. Retry setItem
    try {
      localStorage.setItem(key, stringVal);
      memoryFallbackStore.set(key, stringVal);
      return true;
    } catch (retryError) {
      console.warn(`⚠️ Secondary localStorage write failed for '${key}'. Falling back to sessionStorage.`, retryError);
      
      // 3. Fallback to sessionStorage
      try {
        sessionStorage.setItem(key, stringVal);
      } catch (sErr) {}

      // 4. Fallback to memory
      memoryFallbackStore.set(key, stringVal);
      return false;
    }
  }
}

/**
 * Get Item from LocalStorage with fallback chain
 */
export function safeGetLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const val = localStorage.getItem(key);
    if (val !== null) return val;
  } catch (e) {}

  try {
    const sessionVal = sessionStorage.getItem(key);
    if (sessionVal !== null) return sessionVal;
  } catch (e) {}

  return memoryFallbackStore.get(key) || null;
}

/**
 * Remove item safely from all storage locations
 */
export function safeRemoveLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;

  try { localStorage.removeItem(key); } catch (e) {}
  try { sessionStorage.removeItem(key); } catch (e) {}
  memoryFallbackStore.delete(key);
}

/**
 * Primary Helper to safely persist the current user without crashing
 */
export function safeSaveUser(user: any): void {
  if (!user) {
    safeRemoveLocalStorage('user');
    safeRemoveLocalStorage('Vyapar Bridge_user');
    return;
  }

  const compactUser = sanitizeUserForStorage(user);
  const userJson = JSON.stringify(compactUser);

  safeSetLocalStorage('user', userJson);
  safeSetLocalStorage('Vyapar Bridge_user', userJson);

  if (compactUser.id) {
    safeSetLocalStorage('vyapar_user_id', String(compactUser.id));
  }
  if (compactUser.fingerprintId) {
    safeSetLocalStorage('vyapar_user_fingerprint', compactUser.fingerprintId);
  }
}
