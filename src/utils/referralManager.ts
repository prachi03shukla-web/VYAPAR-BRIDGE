import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { LOCAL_USERS_CACHE_KEY, sanitizeForFirestore, getIsFirestoreQuotaExhausted } from '../services/firebaseDataSync';

export interface ReferredUserRecord {
  userId: string;
  userName: string;
  userRole?: string;
  userAvatar?: string;
  userCity?: string;
  joinedAt: number;
  hasPosted: boolean;
  firstPostAt?: number | null;
  postsCount?: number;
}

export interface UserReferralStats {
  referralCode: string;
  totalReferred: number;
  qualifiedCount: number; // Members who joined AND made at least 1 post
  targetCount: number; // 10
  rewardClaimed: boolean;
  rewardExpiresAt: number | null;
  referrals: ReferredUserRecord[];
}

/**
 * Deterministically generates or retrieves a unique System Device Fingerprint ID for a user.
 * Format: FP-VB-XXXX-XXXX-XXXX
 */
export function generateUserFingerprint(userId?: string | number, username?: string, phone?: string): string {
  const seed = `${String(userId || '')}_${String(username || '')}_${String(phone || '')}_vyapar_bridge_sec_2026`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  
  const absHash = Math.abs(hash);
  const part1 = (absHash & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  const part2 = ((absHash >> 16) & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  
  // Create second hash for randomness & length
  let hash2 = 5381;
  for (let i = seed.length - 1; i >= 0; i--) {
    hash2 = (hash2 * 33) ^ seed.charCodeAt(i);
    hash2 |= 0;
  }
  const part3 = Math.abs(hash2 & 0xffff).toString(16).toUpperCase().padStart(4, '0');

  return `FP-VB-${part1}-${part2}-${part3}`;
}

/**
 * Gets or assigns fingerprint ID on a user object.
 */
export function getOrCreateFingerprint(user: any): string {
  if (user?.fingerprintId && typeof user.fingerprintId === 'string' && user.fingerprintId.startsWith('FP-')) {
    return user.fingerprintId;
  }
  return generateUserFingerprint(user?.id, user?.username, user?.phone);
}

/**
 * Generates user's referral code / identifier based on their profile name / username.
 */
export function getUserReferralCode(user: any): string {
  if (!user) return 'VB_INVITE';
  if (user.username && String(user.username).trim()) {
    return String(user.username).trim();
  }
  if (user.name && String(user.name).trim()) {
    return String(user.name).trim().replace(/\s+/g, '_');
  }
  if (user.referralCode) return String(user.referralCode);
  return String(user.id || 'trader');
}

/**
 * Generates the official user referral sharing link using their clean profile path.
 * Format: https://vyapar-bridge.vercel.app/profile/<username_or_name>
 */
export function getUserReferralLink(user: any): string {
  const profileIdentifier = getUserReferralCode(user);
  const encoded = encodeURIComponent(profileIdentifier);

  // Preferred deployed production domain
  const primaryDomain = 'https://vyapar-bridge.vercel.app';
  
  if (typeof window !== 'undefined' && window.location.origin) {
    // If running on custom production domain or local dev
    const origin = window.location.origin;
    if (origin.includes('vercel.app') || origin.includes('vyaparbridge.in') || origin.includes('localhost')) {
      return `${origin}/profile/${encoded}`;
    }
  }
  
  return `${primaryDomain}/profile/${encoded}`;
}

/**
 * Captures referral query parameter or profile path from URL
 * Examples:
 * - https://vyapar-bridge.vercel.app/profile/synlogic
 * - https://vyapar-bridge.vercel.app/profile/admin_manit_1
 * - https://vyapar-bridge.vercel.app?ref=synlogic
 * Saves into local storage for the ongoing session until registration.
 */
export function captureReferralCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    // 1. Check query parameters (?ref=... or ?referral=...)
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || urlParams.get('referral') || urlParams.get('invite');
    if (refCode && refCode.trim()) {
      const cleanRef = decodeURIComponent(refCode.trim()).toLowerCase();
      localStorage.setItem('vyapar_referred_by_code', cleanRef);
      return cleanRef;
    }

    // 2. Check path name (/profile/:username or /profile/:id)
    const pathname = window.location.pathname || '';
    const match = pathname.match(/\/profile\/([^/?#]+)/i);
    if (match && match[1]) {
      const pathParam = decodeURIComponent(match[1].trim()).toLowerCase();
      // Ignore system routes or generic actions
      if (pathParam && pathParam !== 'edit' && pathParam !== 'settings' && pathParam !== 'saved') {
        localStorage.setItem('vyapar_referred_by_code', pathParam);
        return pathParam;
      }
    }
  } catch (e) {}
  return localStorage.getItem('vyapar_referred_by_code');
}

/**
 * Attaches referral relationship when a new user registers.
 */
export async function recordNewUserReferral(newUser: any, refCodeInput?: string): Promise<boolean> {
  if (!newUser || !newUser.id) return false;
  const refCode = (refCodeInput || localStorage.getItem('vyapar_referred_by_code') || '').trim().toLowerCase();
  if (!refCode) return false;

  const newUserId = String(newUser.id);
  const newUserName = newUser.name || newUser.username || 'Vyapar Member';
  const newUserRole = newUser.role || 'dealer';
  const newUserAvatar = newUser.avatarUrl || newUser.avatar || '';
  const newUserCity = newUser.city || 'India';

  try {
    // 1. Find the referrer in local cache or Firestore
    let referrerUser: any = null;
    let referrerDocId: string | null = null;

    // Check local cache
    try {
      const cachedUsersStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
      if (cachedUsersStr) {
        const usersList: any[] = JSON.parse(cachedUsersStr);
        if (Array.isArray(usersList)) {
          referrerUser = usersList.find(u => {
            const uId = String(u.id || '').toLowerCase();
            const uUsername = String(u.username || '').toLowerCase();
            const uName = String(u.name || '').toLowerCase();
            const uNameSlug = uName.replace(/\s+/g, '_');
            const uRefCode = String(u.referralCode || '').toLowerCase();
            return uId === refCode || uUsername === refCode || uName === refCode || uNameSlug === refCode || uRefCode === refCode;
          });
          if (referrerUser) referrerDocId = String(referrerUser.id);
        }
      }
    } catch (e) {}

    // Check Firestore if not found locally
    if (!referrerUser && !getIsFirestoreQuotaExhausted()) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        for (const d of snap.docs) {
          const data = d.data();
          const dId = d.id.toLowerCase();
          const uId = String(data.id || '').toLowerCase();
          const uUsername = String(data.username || '').toLowerCase();
          const uName = String(data.name || '').toLowerCase();
          const uNameSlug = uName.replace(/\s+/g, '_');
          const uRefCode = String(data.referralCode || '').toLowerCase();
          if (
            dId === refCode ||
            uId === refCode ||
            uUsername === refCode ||
            uName === refCode ||
            uNameSlug === refCode ||
            uRefCode === refCode
          ) {
            referrerUser = { ...data, id: d.id };
            referrerDocId = d.id;
            break;
          }
        }
      } catch (fErr) {
        console.warn('Firestore lookup for referrer note:', fErr);
      }
    }

    if (!referrerUser || !referrerDocId) {
      console.log(`Referral code "${refCode}" provided, but referrer not found in database.`);
      return false;
    }

    // Avoid self-referral
    if (String(referrerUser.id) === newUserId || String(referrerUser.username || '').toLowerCase() === String(newUser.username || '').toLowerCase()) {
      return false;
    }

    // 2. Prepare new referral record
    const newReferralRecord: ReferredUserRecord = {
      userId: newUserId,
      userName: newUserName,
      userRole: newUserRole,
      userAvatar: newUserAvatar,
      userCity: newUserCity,
      joinedAt: Date.now(),
      hasPosted: false,
      firstPostAt: null,
      postsCount: 0
    };

    const existingReferrals: ReferredUserRecord[] = Array.isArray(referrerUser.referrals) ? [...referrerUser.referrals] : [];
    
    // Check if already in referrals list
    const isAlreadyReferral = existingReferrals.some(r => String(r.userId) === newUserId);
    if (!isAlreadyReferral) {
      existingReferrals.unshift(newReferralRecord);
    }

    const totalReferred = existingReferrals.length;
    const qualifiedCount = existingReferrals.filter(r => r.hasPosted === true).length;

    const updatedReferrer = {
      ...referrerUser,
      referrals: existingReferrals,
      referralCount: totalReferred,
      qualifiedReferralCount: qualifiedCount,
      updatedAt: Date.now()
    };

    // 3. Update local cache for referrer
    try {
      const cachedUsersStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
      if (cachedUsersStr) {
        const usersList: any[] = JSON.parse(cachedUsersStr);
        if (Array.isArray(usersList)) {
          const updatedList = usersList.map(u => String(u.id) === referrerDocId ? updatedReferrer : u);
          localStorage.setItem(LOCAL_USERS_CACHE_KEY, JSON.stringify(updatedList));
        }
      }
      // Also update currently logged in user if match
      const currentUserStr = localStorage.getItem('user');
      if (currentUserStr) {
        const curUser = JSON.parse(currentUserStr);
        if (String(curUser.id) === referrerDocId) {
          localStorage.setItem('user', JSON.stringify(updatedReferrer));
          localStorage.setItem('Vyapar Bridge_user', JSON.stringify(updatedReferrer));
        }
      }
    } catch (e) {}

    // 4. Update Firestore for referrer
    if (!getIsFirestoreQuotaExhausted()) {
      await setDoc(doc(db, 'users', referrerDocId), sanitizeForFirestore({
        referrals: existingReferrals,
        referralCount: totalReferred,
        qualifiedReferralCount: qualifiedCount,
        updatedAt: Date.now()
      }), { merge: true });
    }

    // 5. Update the new user doc with referredBy metadata
    newUser.referredBy = referrerDocId;
    newUser.referredByCode = refCode;
    newUser.referredByName = referrerUser.name || referrerUser.username;

    // Clear session referral code after use
    localStorage.removeItem('vyapar_referred_by_code');
    console.log(`✅ Successfully recorded referral for ${newUserName} by ${referrerUser.name}`);
    return true;
  } catch (err) {
    console.warn('recordNewUserReferral error:', err);
    return false;
  }
}

/**
 * Called whenever ANY user creates a post or reel.
 * Checks if the user was referred by someone.
 * If this is their first post, updates the referrer's record (hasPosted: true).
 * If the referrer reaches 10 qualified referrals, automatically unlocks 1-Month Free Blue Badge (30 days)!
 */
export async function checkAndUpdateReferralOnPost(authorUserId: string | number): Promise<{
  rewardUnlocked: boolean;
  referrerName?: string;
  referrerId?: string;
}> {
  if (!authorUserId) return { rewardUnlocked: false };
  const uId = String(authorUserId);

  try {
    // 1. Find the author's user profile to get `referredBy`
    let authorUser: any = null;
    try {
      const cachedUsersStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
      if (cachedUsersStr) {
        const usersList: any[] = JSON.parse(cachedUsersStr);
        if (Array.isArray(usersList)) {
          authorUser = usersList.find(u => String(u.id) === uId || String(u.username) === uId);
        }
      }
      if (!authorUser) {
        const curUserStr = localStorage.getItem('user');
        if (curUserStr) {
          const cur = JSON.parse(curUserStr);
          if (String(cur.id) === uId || String(cur.username) === uId) {
            authorUser = cur;
          }
        }
      }
    } catch (e) {}

    // Lookup author from Firestore if needed
    if (!authorUser && !getIsFirestoreQuotaExhausted()) {
      try {
        const authorSnap = await getDoc(doc(db, 'users', uId));
        if (authorSnap.exists()) {
          authorUser = authorSnap.data();
        }
      } catch (e) {}
    }

    if (!authorUser || !authorUser.referredBy) {
      return { rewardUnlocked: false };
    }

    const referrerId = String(authorUser.referredBy);

    // 2. Fetch Referrer
    let referrerUser: any = null;
    try {
      const cachedUsersStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
      if (cachedUsersStr) {
        const usersList: any[] = JSON.parse(cachedUsersStr);
        if (Array.isArray(usersList)) {
          referrerUser = usersList.find(u => String(u.id) === referrerId);
        }
      }
    } catch (e) {}

    if (!referrerUser && !getIsFirestoreQuotaExhausted()) {
      try {
        const refSnap = await getDoc(doc(db, 'users', referrerId));
        if (refSnap.exists()) {
          referrerUser = { ...refSnap.data(), id: refSnap.id };
        }
      } catch (e) {}
    }

    if (!referrerUser) return { rewardUnlocked: false };

    // 3. Check and update the author's status in referrer's referrals list
    let referralsList: ReferredUserRecord[] = Array.isArray(referrerUser.referrals) ? [...referrerUser.referrals] : [];
    let updated = false;
    let authorEntry = referralsList.find(r => String(r.userId) === uId);

    if (authorEntry) {
      if (!authorEntry.hasPosted) {
        authorEntry.hasPosted = true;
        authorEntry.firstPostAt = Date.now();
        authorEntry.postsCount = (authorEntry.postsCount || 0) + 1;
        updated = true;
      } else {
        authorEntry.postsCount = (authorEntry.postsCount || 0) + 1;
      }
    } else {
      // Author wasn't present in list yet; add them as posted
      referralsList.unshift({
        userId: uId,
        userName: authorUser.name || authorUser.username || 'Vyapar Member',
        userRole: authorUser.role || 'dealer',
        userAvatar: authorUser.avatarUrl || authorUser.avatar || '',
        userCity: authorUser.city || 'India',
        joinedAt: authorUser.createdAt ? new Date(authorUser.createdAt).getTime() : Date.now(),
        hasPosted: true,
        firstPostAt: Date.now(),
        postsCount: 1
      });
      updated = true;
    }

    const totalReferred = referralsList.length;
    const qualifiedCount = referralsList.filter(r => r.hasPosted === true).length;
    let rewardUnlocked = false;

    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const newExpiresAt = now + thirtyDaysMs;

    let updatedReferrer = {
      ...referrerUser,
      referrals: referralsList,
      referralCount: totalReferred,
      qualifiedReferralCount: qualifiedCount,
      updatedAt: now
    };

    // 4. CHECK 10 QUALIFIED REFERRALS REWARD TRIGGER!
    // If qualified count is >= 10, grant 1-Month Free Blue Badge!
    if (qualifiedCount >= 10 && (!referrerUser.isVerified || referrerUser.verifiedPlan === 'referral_1month_free' || (referrerUser.expiresAt && referrerUser.expiresAt < now))) {
      rewardUnlocked = true;
      updatedReferrer = {
        ...updatedReferrer,
        isVerified: true,
        verifiedBadge: true,
        verifiedPlan: 'referral_1month_free',
        verifiedAt: now,
        validityDays: 30,
        expiresAt: newExpiresAt,
        referralRewardClaimed: true,
        referralRewardClaimedAt: now
      };

      console.log(`🏆 1-MONTH FREE BLUE BADGE AUTOMATICALLY UNLOCKED for Referrer: ${referrerUser.name || referrerId} (10 Qualified Referrals Completed!)`);
    }

    // 5. Save to local cache
    try {
      const cachedUsersStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
      if (cachedUsersStr) {
        const usersList: any[] = JSON.parse(cachedUsersStr);
        if (Array.isArray(usersList)) {
          const newList = usersList.map(u => String(u.id) === referrerId ? updatedReferrer : u);
          localStorage.setItem(LOCAL_USERS_CACHE_KEY, JSON.stringify(newList));
        }
      }

      // If logged in user is the referrer, update their live state
      const curUserStr = localStorage.getItem('user');
      if (curUserStr) {
        const curUser = JSON.parse(curUserStr);
        if (String(curUser.id) === referrerId) {
          localStorage.setItem('user', JSON.stringify(updatedReferrer));
          localStorage.setItem('Vyapar Bridge_user', JSON.stringify(updatedReferrer));
          window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: updatedReferrer }));
        }
      }
    } catch (e) {}

    // 6. Save to Firestore
    if (!getIsFirestoreQuotaExhausted()) {
      await setDoc(doc(db, 'users', referrerId), sanitizeForFirestore(updatedReferrer), { merge: true });
    }

    return {
      rewardUnlocked,
      referrerName: referrerUser.name || referrerUser.username,
      referrerId: referrerId
    };
  } catch (err) {
    console.warn('checkAndUpdateReferralOnPost error:', err);
    return { rewardUnlocked: false };
  }
}

/**
 * Returns formatted referral statistics for any user.
 */
export function getReferralStats(user: any): UserReferralStats {
  if (!user) {
    return {
      referralCode: 'VB_INVITE',
      totalReferred: 0,
      qualifiedCount: 0,
      targetCount: 10,
      rewardClaimed: false,
      rewardExpiresAt: null,
      referrals: []
    };
  }

  const code = getUserReferralCode(user);
  const referrals: ReferredUserRecord[] = Array.isArray(user.referrals) ? user.referrals : [];
  const qualifiedCount = referrals.filter(r => r.hasPosted === true).length;
  const totalReferred = referrals.length;
  const rewardClaimed = Boolean(user.referralRewardClaimed || (user.isVerified && user.verifiedPlan === 'referral_1month_free'));
  const rewardExpiresAt = user.expiresAt || null;

  return {
    referralCode: code,
    totalReferred,
    qualifiedCount,
    targetCount: 10,
    rewardClaimed,
    rewardExpiresAt,
    referrals
  };
}
