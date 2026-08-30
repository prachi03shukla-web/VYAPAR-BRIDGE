import { BRAND_LOGO_SRC } from '../constants/brandLogo';

/**
 * Universal User Avatar & Profile Resolution Utility
 * Ensures consistent, reliable avatar resolution across all Posts, Reels, Stories, Comments, and Profiles.
 */

// In-memory quick lookup cache
const memoryUsersCache = new Map<string, any>();

/**
 * Generate a deterministic high-resolution inline SVG initials avatar for any user name.
 * 100% offline & instant - zero external network requests!
 */
export function getInitialsAvatar(name?: string): string {
  const cleanName = (name || 'Member').trim();
  const firstLetter = (cleanName.charAt(0) || 'V').toUpperCase();
  const secondChar = cleanName.length > 1 && cleanName.includes(' ') ? cleanName.split(' ').filter(Boolean)[1]?.charAt(0).toUpperCase() : '';
  const initials = (firstLetter + (secondChar || '')).slice(0, 2) || firstLetter;

  // Generate deterministic gradient colors
  const palettes = [
    ['#2563EB', '#1D4ED8'],
    ['#059669', '#047857'],
    ['#7C3AED', '#6D28D9'],
    ['#D97706', '#B45309'],
    ['#DC2626', '#B91C1C'],
    ['#0891B2', '#0E7490'],
    ['#4F46E5', '#4338CA'],
    ['#DB2777', '#BE185D'],
  ];
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % palettes.length;
  const [col1, col2] = palettes[colorIndex];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${col1}"/>
        <stop offset="100%" stop-color="${col2}"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#grad)" rx="50"/>
    <text x="50%" y="54%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="40" font-weight="bold" fill="#ffffff" dominant-baseline="middle" text-anchor="middle">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Load cached users from local storage into memory map
 */
function ensureCacheHydrated() {
  if (memoryUsersCache.size > 0 || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('VyaparBridge_cached_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(u => {
          if (u && (u.id || u.username || u.name)) {
            const key = String(u.id || u.username || u.name);
            memoryUsersCache.set(key, u);
            if (u.username) memoryUsersCache.set(String(u.username), u);
            if (u.name) memoryUsersCache.set(String(u.name).toLowerCase(), u);
          }
        });
      }
    }
  } catch (e) {}

  // Also check active user
  try {
    const activeStr = localStorage.getItem('user') || localStorage.getItem('Vyapar Bridge_user');
    if (activeStr) {
      const active = JSON.parse(activeStr);
      if (active && active.id) {
        memoryUsersCache.set(String(active.id), active);
      }
    }
  } catch (e) {}
}

/**
 * Update single user or array of users into cache
 */
export function updateCachedUsers(users: any | any[]) {
  if (!users) return;
  const arr = Array.isArray(users) ? users : [users];
  arr.forEach(u => {
    if (u && (u.id || u.username || u.name)) {
      if (u.id) memoryUsersCache.set(String(u.id), u);
      if (u.username) memoryUsersCache.set(String(u.username), u);
      if (u.name) memoryUsersCache.set(String(u.name).toLowerCase(), u);
    }
  });
}

/**
 * Extract clean, valid avatar string if present
 */
function isValidAvatarUrl(url: any): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 5) return false;
  if (trimmed === 'null' || trimmed === 'undefined' || trimmed === '[object Object]') return false;
  return true;
}

/**
 * Resolves the freshest, most accurate profile image for any post, reel, comment, or user object.
 * Checks all possible properties, user cache, current user session, and falls back to a clean initials avatar.
 */
export function resolveUserAvatar(postOrUser: any, fallbackName?: string): string {
  if (!postOrUser) {
    return getInitialsAvatar(fallbackName);
  }

  ensureCacheHydrated();

  // 1. If it's a string, check if it's already a valid avatar URL
  if (typeof postOrUser === 'string') {
    if (isValidAvatarUrl(postOrUser)) return postOrUser;
    return getInitialsAvatar(postOrUser);
  }

  // 2. Extract potential direct avatar fields
  const directAvatarCandidates = [
    postOrUser.avatarUrl,
    postOrUser.avatar,
    postOrUser.photoURL,
    postOrUser.profileImage,
    postOrUser.image,
    postOrUser.logoUrl,
    postOrUser.businessLogo,
    postOrUser.userAvatar,
    postOrUser.authorAvatar,
    postOrUser.user?.avatarUrl,
    postOrUser.user?.avatar,
    postOrUser.user?.photoURL,
    postOrUser.user?.profileImage,
    postOrUser.user?.image,
    postOrUser.user?.logoUrl,
    postOrUser.user?.businessLogo,
    postOrUser.author?.avatarUrl,
    postOrUser.author?.avatar,
    postOrUser.author?.photoURL
  ];

  for (const cand of directAvatarCandidates) {
    if (isValidAvatarUrl(cand)) {
      return cand;
    }
  }

  // 3. Extract identifier to look up in cached users
  const userId = String(
    postOrUser.userId || 
    postOrUser.user?.id || 
    postOrUser.id || 
    postOrUser.uid || 
    ''
  ).trim();

  const authorName = String(
    postOrUser.userName || 
    postOrUser.user?.name || 
    postOrUser.name || 
    postOrUser.companyName || 
    fallbackName || 
    ''
  ).trim();

  // 4. Check active logged in user if ID or name matches
  try {
    const activeUserId = typeof localStorage !== 'undefined' ? localStorage.getItem('vyapar_user_id') : null;
    const activeAvatar = typeof localStorage !== 'undefined' ? localStorage.getItem('vyapar_user_avatar') : null;
    if (userId && activeUserId && (userId === activeUserId || userId === '1' || userId === 'current')) {
      if (isValidAvatarUrl(activeAvatar)) return activeAvatar!;
    }
  } catch (e) {}

  // 5. Look up in cached users map
  if (userId && memoryUsersCache.has(userId)) {
    const cached = memoryUsersCache.get(userId);
    const cand = cached?.avatarUrl || cached?.avatar || cached?.photoURL || cached?.profileImage || cached?.image || cached?.logoUrl;
    if (isValidAvatarUrl(cand)) return cand;
  }

  if (authorName && memoryUsersCache.has(authorName.toLowerCase())) {
    const cached = memoryUsersCache.get(authorName.toLowerCase());
    const cand = cached?.avatarUrl || cached?.avatar || cached?.photoURL || cached?.profileImage || cached?.image || cached?.logoUrl;
    if (isValidAvatarUrl(cand)) return cand;
  }

  // 6. Look up in localStorage cache directly if not yet in memory
  try {
    const raw = localStorage.getItem('VyaparBridge_cached_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const found = parsed.find(u => 
          (userId && String(u.id) === userId) || 
          (userId && String(u.username) === userId) ||
          (authorName && u.name && String(u.name).toLowerCase() === authorName.toLowerCase()) ||
          (authorName && u.companyName && String(u.companyName).toLowerCase() === authorName.toLowerCase())
        );
        if (found) {
          const cand = found.avatarUrl || found.avatar || found.photoURL || found.profileImage || found.image || found.logoUrl;
          if (isValidAvatarUrl(cand)) {
            updateCachedUsers(found);
            return cand;
          }
        }
      }
    }
  } catch (e) {}

  // 7. Fallback to clean, unique, high quality initials avatar
  return getInitialsAvatar(authorName || fallbackName || 'Member');
}

/**
 * Returns complete enriched author profile info (avatar, name, role, verified badge)
 */
export function resolveAuthorInfo(postOrItem: any, fallbackUser?: any) {
  if (!postOrItem) {
    const fallbackAv = getInitialsAvatar(fallbackUser?.name);
    return {
      ...fallbackUser,
      id: fallbackUser?.id || '1',
      name: fallbackUser?.name || 'Member',
      avatar: fallbackAv,
      avatarUrl: fallbackAv,
      role: fallbackUser?.role || 'dealer',
      isVerified: Boolean(fallbackUser?.isVerified)
    };
  }

  const name = postOrItem.user?.name || postOrItem.userName || postOrItem.name || postOrItem.companyName || fallbackUser?.name || 'Verified Member';
  const avatar = resolveUserAvatar(postOrItem, name);
  const id = String(postOrItem.userId || postOrItem.user?.id || postOrItem.id || fallbackUser?.id || '1');
  const role = postOrItem.user?.role || postOrItem.userRole || postOrItem.role || fallbackUser?.role || 'dealer';
  const isVerified = Boolean(postOrItem.user?.isVerified || postOrItem.isVerified || fallbackUser?.isVerified);

  let cachedUser = null;
  if (id && memoryUsersCache.has(id)) {
    cachedUser = memoryUsersCache.get(id);
  } else if (name && memoryUsersCache.has(name.toLowerCase())) {
    cachedUser = memoryUsersCache.get(name.toLowerCase());
  } else {
    try {
      const raw = localStorage.getItem('VyaparBridge_cached_users');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          cachedUser = parsed.find(u => 
             (id && String(u.id) === id) || 
             (id && String(u.username) === id) ||
            (name && u.name && String(u.name).toLowerCase() === name.toLowerCase()) ||
            (name && u.companyName && String(u.companyName).toLowerCase() === name.toLowerCase())
          );
        }
      }
    } catch (e) {}
  }

  const isGolden = Boolean(
    cachedUser?.goldenBadge ||
    postOrItem.user?.goldenBadge ||
    postOrItem.goldenBadge ||
    (cachedUser && (cachedUser.verifiedPlan === 'yearly' || cachedUser.verifiedPlan === '1_year_pro' || cachedUser.subscriptionPlan === 'yearly')) ||
    (postOrItem.user && (postOrItem.user.verifiedPlan === 'yearly' || postOrItem.user.verifiedPlan === '1_year_pro' || postOrItem.user.subscriptionPlan === 'yearly'))
  );

  return { 
    ...(cachedUser || {}),
    ...(postOrItem.user || {}),
    id, 
    name, 
    avatar, 
    avatarUrl: avatar, 
    role, 
    isVerified: cachedUser ? Boolean(cachedUser.isVerified) : isVerified,
    goldenBadge: isGolden || Boolean(cachedUser?.goldenBadge || postOrItem.user?.goldenBadge || postOrItem.goldenBadge),
    verifiedPlan: isGolden ? 'yearly' : (cachedUser?.verifiedPlan || postOrItem.user?.verifiedPlan || postOrItem.verifiedPlan)
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('ratingUpdated', (e: any) => {
    const { userId, ratingAverage, ratingCount } = e.detail || {};
    if (userId) {
      const uIdStr = String(userId);
      const existing = memoryUsersCache.get(uIdStr) || {};
      existing.ratingAverage = ratingAverage;
      existing.ratingCount = ratingCount;
      memoryUsersCache.set(uIdStr, existing);

      try {
        const raw = localStorage.getItem('VyaparBridge_cached_users');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const updated = parsed.map(u => {
              if (String(u.id) === uIdStr) {
                return { ...u, ratingAverage, ratingCount };
              }
              return u;
            });
            localStorage.setItem('VyaparBridge_cached_users', JSON.stringify(updated));
          }
        }
      } catch (err) {}
    }
  });
}
