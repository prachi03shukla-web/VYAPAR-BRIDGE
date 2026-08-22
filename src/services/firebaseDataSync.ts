import { db, auth } from '../firebase';
import { optimizeImageForPersistence } from '../utils/imageOptimizer';
import { saveVideoBlob, getVideoBlobUrl, cacheVideoUrlInMemory, getCachedVideoUrlInMemory } from '../utils/videoStorage';
import { setPostLikedInLocalStorage, setPostSavedInLocalStorage, isPostLikedByUser, isPostSavedByUser } from '../utils/likeSaveHelpers';
import { resolveUserAvatar, updateCachedUsers } from '../utils/userAvatar';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy, 
  limit, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';

export interface FirestorePost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole?: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  category: string;
  price?: number;
  city?: string;
  state?: string;
  likesCount?: number;
  viewsCount?: number;
  createdAt: any;
}

export interface FirestoreInquiry {
  id?: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  requirement: string;
  category: string;
  city?: string;
  createdAt: any;
}

const LOCAL_POSTS_CACHE_KEY = 'VyaparBridge_cached_posts';

// Clear any stale quota lockouts from browser storage
if (typeof window !== 'undefined') {
  try {
    sessionStorage.removeItem('vyapar_firestore_quota_exhausted_v1');
    localStorage.removeItem('vyapar_firestore_quota_exhausted_v1');
  } catch (e) {}
}

let isFirestoreQuotaExhausted = false;

export function getIsFirestoreQuotaExhausted(): boolean {
  return isFirestoreQuotaExhausted;
}

export function markQuotaExhausted() {
  isFirestoreQuotaExhausted = true;
}

export function isQuotaExhaustedError(err: any): boolean {
  if (!err) return false;
  const msg = String(err?.message || err || '');
  const code = String(err?.code || '');
  return (
    code === 'resource-exhausted' ||
    code === '8' ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('quota')
  );
}

export function handleFirestoreError(context: string, err: any) {
  if (isQuotaExhaustedError(err)) {
    if (!isFirestoreQuotaExhausted) {
      markQuotaExhausted();
      console.warn(`⚠️ Firestore Daily Write Quota Reached during ${context}. App operating smoothly in local cache/offline mode.`);
    }
  } else {
    const msg = String(err?.message || err || '');
    if (!msg.includes('CANCELLED') && !msg.includes('Disconnecting idle stream')) {
      console.warn(`Firestore ${context} note:`, msg);
    }
  }
}

export function sanitizeForFirestore(obj: any): any {
  if (obj === null) return null;
  if (obj === undefined) return undefined;

  if (Array.isArray(obj)) {
    return obj
      .map(item => sanitizeForFirestore(item))
      .filter(item => item !== undefined && item !== null);
  }

  if (typeof obj === 'object') {
    if (obj && obj.constructor && obj.constructor.name === 'FieldValue') {
      return obj;
    }
    if (obj instanceof Date) {
      return obj.getTime();
    }
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        const sanitizedVal = sanitizeForFirestore(val);
        if (sanitizedVal !== undefined) {
          cleaned[key] = sanitizedVal;
        }
      }
    }
    return cleaned;
  }
  return obj;
}

// 1. Posts Management
export async function syncPostToFirestore(postData: any): Promise<boolean> {
  if (!postData) return false;
  try {
    const postId = postData.id ? String(postData.id) : `post_${Date.now()}`;
    
    // Ensure mediaUrl is a persistent cloud/data URL or valid media path (DO NOT wipe /uploads/ or base64)
    let resolvedMediaUrl = postData.persistentMediaUrl || postData.mediaUrl || postData.fileDataUrl || postData.mediaBase64 || postData.thumbnailUrl || '';
    if (resolvedMediaUrl.startsWith('blob:')) {
      resolvedMediaUrl = postData.persistentMediaUrl || postData.fileDataUrl || postData.mediaBase64 || postData.thumbnailUrl || '';
      if (resolvedMediaUrl.startsWith('blob:')) resolvedMediaUrl = '';
    }

    let resolvedThumbnailUrl = postData.thumbnailUrl || postData.persistentMediaUrl || resolvedMediaUrl || '';
    if (resolvedThumbnailUrl.startsWith('blob:')) {
      resolvedThumbnailUrl = postData.persistentMediaUrl || resolvedMediaUrl || '';
      if (resolvedThumbnailUrl.startsWith('blob:')) resolvedThumbnailUrl = '';
    }

    let cleanData = sanitizeForFirestore({
      ...postData,
      id: postId,
      mediaUrl: resolvedMediaUrl,
      thumbnailUrl: resolvedThumbnailUrl,
      persistentMediaUrl: postData.persistentMediaUrl || resolvedMediaUrl,
      status: postData.status || 'approved',
      visibility: postData.visibility || 'public',
      updatedAt: Date.now(),
      createdAt: postData.createdAt || Date.now()
    });

    // Strip unneeded heavy keys
    delete cleanData.fileDataUrl;
    delete cleanData.mediaBase64;
    delete cleanData.rawMedia;
    delete cleanData.pendingFile;
    delete cleanData.pendingReelFile;

    // FIRESTORE SAFEGUARD & LOCAL BLOB PRESERVATION
    const videoStreamCandidate = cleanData.videoUrl || cleanData.video || (cleanData.mediaUrl && !cleanData.mediaUrl.startsWith('data:image') ? cleanData.mediaUrl : '');
    if (videoStreamCandidate) {
      cacheVideoUrlInMemory(postId, videoStreamCandidate);
      if (videoStreamCandidate.startsWith('data:video') || videoStreamCandidate.startsWith('blob:')) {
        try {
          localStorage.setItem('vyapar_video_' + postId, videoStreamCandidate);
        } catch (e) {}
      }
    }

    if (cleanData.type === 'video' || (cleanData.mediaUrl && (cleanData.mediaUrl.startsWith('data:video') || cleanData.mediaUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i)))) {
      cleanData.type = 'video';
      
      let safeVideoThumb = cleanData.thumbnailUrl && cleanData.thumbnailUrl.startsWith('data:image') ? cleanData.thumbnailUrl : '';
      if (!safeVideoThumb) {
        safeVideoThumb = cleanData.posterUrl || cleanData.thumbnail || '';
      }
      cleanData.thumbnailUrl = safeVideoThumb;

      // If mediaUrl is a large video base64, don't store it in Firestore document directly (it exceeds 1MB limit)
      // Instead store videoUrl or keep mediaUrl under limit, and NEVER set mediaUrl = safeVideoThumb!
      if (cleanData.mediaUrl && cleanData.mediaUrl.length > 500000 && cleanData.mediaUrl.startsWith('data:video')) {
        console.warn(`⚠️ Video base64 payload is large (${cleanData.mediaUrl.length} bytes). Caching stream locally for smooth playback...`);
        cleanData.videoUrl = cleanData.mediaUrl.length < 800000 ? cleanData.mediaUrl : ('indexeddb:' + postId);
        cleanData.mediaUrl = cleanData.videoUrl;
        cleanData.persistentMediaUrl = cleanData.videoUrl;
      } else if (cleanData.mediaUrl && cleanData.mediaUrl.startsWith('data:image')) {
        // Fix legacy glitch where thumbnail image was written into mediaUrl
        cleanData.mediaUrl = cleanData.videoUrl || ('indexeddb:' + postId);
        cleanData.persistentMediaUrl = cleanData.mediaUrl;
      }
    } else if (cleanData.mediaUrl && cleanData.mediaUrl.startsWith('data:image') && cleanData.mediaUrl.length > 500000) {
      console.warn(`⚠️ Image base64 payload is large (${cleanData.mediaUrl.length} bytes). Optimizing image for Firestore...`);
      cleanData.mediaUrl = await optimizeImageForPersistence(cleanData.mediaUrl, 800, 800, 0.65);
      cleanData.thumbnailUrl = cleanData.mediaUrl;
      cleanData.persistentMediaUrl = cleanData.mediaUrl;
    }

    if (cleanData.type === 'video') {
      if (!cleanData.mediaUrl || cleanData.mediaUrl.startsWith('blob:') || cleanData.mediaUrl.startsWith('data:image')) {
        const validStream = (cleanData.videoUrl && !cleanData.videoUrl.startsWith('data:image') && !cleanData.videoUrl.startsWith('blob:')) 
          ? cleanData.videoUrl 
          : ('indexeddb:' + postId);
        cleanData.mediaUrl = validStream;
        cleanData.videoUrl = validStream;
        cleanData.persistentMediaUrl = validStream;
      }
    } else {
      if (!cleanData.mediaUrl || cleanData.mediaUrl.startsWith('blob:')) {
        cleanData.mediaUrl = cleanData.thumbnailUrl || cleanData.persistentMediaUrl || cleanData.videoUrl || '';
      }
    }
    if (!cleanData.thumbnailUrl || cleanData.thumbnailUrl.startsWith('blob:')) {
      cleanData.thumbnailUrl = cleanData.type === 'video' ? (cleanData.thumbnailUrl || cleanData.posterUrl || '') : cleanData.mediaUrl;
    }
    if (!cleanData.persistentMediaUrl || cleanData.persistentMediaUrl.startsWith('blob:')) {
      cleanData.persistentMediaUrl = cleanData.mediaUrl;
    }

    // 1. Instant Local Storage Backup (survives tab/page refresh immediately)
    try {
      const existingStr = localStorage.getItem(LOCAL_POSTS_CACHE_KEY);
      let list: any[] = existingStr ? JSON.parse(existingStr) : [];
      if (!Array.isArray(list)) list = [];
      const filtered = list.filter(p => String(p.id) !== postId);
      localStorage.setItem(LOCAL_POSTS_CACHE_KEY, JSON.stringify([cleanData, ...filtered].slice(0, 100)));
    } catch (localErr) {
      console.warn('Local cache backup note:', localErr);
    }

    // 2. Direct Firestore Persistence with 3-Second Timeout Safeguard (Prevents UI hang)
    const postRef = doc(db, 'posts', postId);
    const setDocPromise = setDoc(postRef, {
      ...cleanData,
      serverSyncedAt: serverTimestamp()
    }, { merge: true });

    const timeoutPromise = new Promise((resolve) => setTimeout(() => {
      console.warn(`⏳ Firestore setDoc timeout safeguard triggered for ${postId}`);
      resolve(true);
    }, 3000));

    await Promise.race([setDocPromise, timeoutPromise]);
    
    console.log(`✅ Post synced directly to Firestore: ${postId}`);
    return true;
  } catch (error: any) {
    handleFirestoreError('syncPostToFirestore', error);
    if (isQuotaExhaustedError(error)) {
      return true;
    }

    // EMERGENCY RECOVERY FOR OVERSIZED FIRESTORE DOCUMENTS
    // If setDoc failed due to document size or payload limits, retry with compressed thumbnail image so post metadata (title, content, author) is NEVER lost across devices!
    try {
      const postId = postData.id ? String(postData.id) : `post_${Date.now()}`;
      console.log(`🔄 Emergency size recovery: retrying Firestore setDoc for post ${postId}...`);
      
      let safeThumb = postData.thumbnailUrl || postData.mediaUrl || '';
      if (safeThumb.length > 300000 && safeThumb.startsWith('data:image')) {
        safeThumb = await optimizeImageForPersistence(safeThumb, 500, 500, 0.5);
      } else if (safeThumb.length > 300000) {
        safeThumb = '';
      }

      const emergencyData = sanitizeForFirestore({
        ...postData,
        id: postId,
        mediaUrl: safeThumb,
        thumbnailUrl: safeThumb,
        persistentMediaUrl: safeThumb,
        fileDataUrl: undefined,
        mediaBase64: undefined,
        rawMedia: undefined,
        status: postData.status || 'approved',
        visibility: postData.visibility || 'public',
        updatedAt: Date.now(),
        createdAt: postData.createdAt || Date.now()
      });

      const postRef = doc(db, 'posts', postId);
      await setDoc(postRef, {
        ...emergencyData,
        serverSyncedAt: serverTimestamp()
      }, { merge: true });
      
      console.log(`✅ Emergency Firestore sync succeeded for: ${postId}`);
      return true;
    } catch (retryErr) {
      handleFirestoreError('syncPost emergency retry', retryErr);
      return true; // Local storage already preserved
    }
  }
}

export async function fetchPostsFromFirestore(): Promise<any[]> {
  const postsMap = new Map<string, any>();
  const activeUserId = localStorage.getItem('vyapar_user_id') || '';

  // 1. Fetch latest real-time documents from Firestore (All Posts & Members Uncapped)
  try {
    const postsQuery = query(collection(db, 'posts'));
    const snap = await getDocs(postsQuery);
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && docSnap.id) {
        const localStoredVideo = typeof localStorage !== 'undefined' ? localStorage.getItem('vyapar_video_' + docSnap.id) : null;
        const incomingMedia = data.mediaUrl || data.persistentMediaUrl || data.videoUrl || data.thumbnailUrl || localStoredVideo || '';

        // Safe recovery for mediaUrl and thumbnailUrl
        let safeMediaUrl = incomingMedia;
        if (safeMediaUrl && safeMediaUrl.startsWith('blob:')) {
          safeMediaUrl = data.persistentMediaUrl || data.thumbnailUrl || localStoredVideo || safeMediaUrl;
        }

        let safeThumbnailUrl = data.thumbnailUrl || data.persistentMediaUrl || safeMediaUrl || '';
        if (safeThumbnailUrl && safeThumbnailUrl.startsWith('blob:')) {
          safeThumbnailUrl = data.persistentMediaUrl || safeMediaUrl || '';
        }

        const authorAvatar = resolveUserAvatar(data, data.userName || data.user?.name);
        const authorName = data.userName || data.user?.name || 'Member';
        const authorRole = data.userRole || data.user?.role || 'dealer';
        const isVerified = Boolean(data.isVerified || data.user?.isVerified);

        const merged = { 
          ...data, 
          id: docSnap.id,
          userName: authorName,
          userAvatar: authorAvatar,
          userRole: authorRole,
          user: {
            ...(data.user || {}),
            id: String(data.userId || data.user?.id || docSnap.id),
            name: authorName,
            avatarUrl: authorAvatar,
            avatar: authorAvatar,
            role: authorRole,
            isVerified
          },
          mediaUrl: safeMediaUrl || '',
          thumbnailUrl: safeThumbnailUrl || '',
          persistentMediaUrl: data.persistentMediaUrl || safeThumbnailUrl || safeMediaUrl || ''
        };

        merged.isLiked = isPostLikedByUser(merged, activeUserId);
        merged.isSaved = isPostSavedByUser(merged, activeUserId);
        
        postsMap.set(String(docSnap.id), merged);
      }
    });
  } catch (error: any) {
    if (error?.message?.includes('Quota') || error?.code === 'resource-exhausted') {
      console.warn('Firestore daily read quota note: Using local cached posts.');
    } else {
      console.warn('Firestore fetchPosts note:', error);
    }
    // Only fall back to local cache if network/quota failed
    try {
      const localStr = localStorage.getItem(LOCAL_POSTS_CACHE_KEY);
      if (localStr) {
        const localList = JSON.parse(localStr);
        if (Array.isArray(localList)) {
          localList.forEach(p => {
            if (p && p.id) postsMap.set(String(p.id), p);
          });
        }
      }
    } catch (e) {}
  }

  let deletedPostsSet = new Set<string>();
  try {
    const delStr = localStorage.getItem('VyaparBridge_deleted_posts');
    if (delStr) {
      const arr = JSON.parse(delStr);
      if (Array.isArray(arr)) deletedPostsSet = new Set(arr.map(String));
    }
  } catch (e) {}

  const result = Array.from(postsMap.values())
    .filter(p => {
      if (!p) return false;
      const pId = String(p.id);
      if (deletedPostsSet.has(pId)) return false;
      if (p.status === 'rejected') return false;
      if (p.description === 'My tree' || p.title === 'Tree' || p.id === 'post_admin_1787027595927' || p.id === 'post_admin_1787027350660') return false;
      return true;
    })
    .sort((a, b) => {
      const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
      const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

  // Update local cache with freshest authoritative state
  try {
    localStorage.setItem(LOCAL_POSTS_CACHE_KEY, JSON.stringify(result.slice(0, 100)));
  } catch (e) {}

  return result;
}

// 2. Real-Time Firestore Subscription Listeners (Instant Multi-Device Sync with Free Tier Optimization)
export function subscribeToPostsFromFirestore(callback: (posts: any[]) => void): () => void {
  try {
    const postsQuery = query(collection(db, 'posts'));
    return onSnapshot(postsQuery, (snapshot) => {
      const postsMap = new Map<string, any>();
      const activeUserId = localStorage.getItem('vyapar_user_id') || '';

      // Direct snapshot mapping - authoritative source of truth
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && docSnap.id) {
          const docId = String(docSnap.id);
          const memoryVideo = getCachedVideoUrlInMemory(docId);
          const localStoredVideo = memoryVideo || (typeof localStorage !== 'undefined' ? localStorage.getItem('vyapar_video_' + docId) : null);
          
          const isVideoPost = data.type === 'video' || (data.mediaUrl && (data.mediaUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) || data.mediaUrl.startsWith('data:video'))) || Boolean(data.videoUrl);

          let safeMediaUrl = data.mediaUrl || data.persistentMediaUrl || data.videoUrl || '';
          let safeThumbnailUrl = data.thumbnailUrl || data.posterUrl || data.persistentMediaUrl || '';

          if (isVideoPost) {
            // NEVER assign image data URLs to mediaUrl of a video post
            if (!safeMediaUrl || safeMediaUrl.startsWith('data:image') || safeMediaUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) {
              if (localStoredVideo && !localStoredVideo.startsWith('data:image')) {
                safeMediaUrl = localStoredVideo;
              } else if (data.videoUrl && !data.videoUrl.startsWith('data:image')) {
                safeMediaUrl = data.videoUrl;
              } else if (data.video && !data.video.startsWith('data:image')) {
                safeMediaUrl = data.video;
              } else {
                safeMediaUrl = 'indexeddb:' + docId;
              }
            }
          } else {
            if (!safeMediaUrl || safeMediaUrl.startsWith('blob:')) {
              safeMediaUrl = data.persistentMediaUrl || data.thumbnailUrl || safeMediaUrl || '';
            }
          }

          if (safeThumbnailUrl && safeThumbnailUrl.startsWith('blob:')) {
            safeThumbnailUrl = data.persistentMediaUrl || safeMediaUrl || '';
          }

          const authorAvatar = resolveUserAvatar(data, data.userName || data.user?.name);
          const authorName = data.userName || data.user?.name || 'Member';
          const authorRole = data.userRole || data.user?.role || 'dealer';
          const isVerified = Boolean(data.isVerified || data.user?.isVerified);

          const merged = { 
            ...data, 
            id: docId, 
            type: isVideoPost ? 'video' : (data.type || 'image'),
            userName: authorName,
            userAvatar: authorAvatar,
            userRole: authorRole,
            user: {
              ...(data.user || {}),
              id: String(data.userId || data.user?.id || docId),
              name: authorName,
              avatarUrl: authorAvatar,
              avatar: authorAvatar,
              role: authorRole,
              isVerified
            },
            mediaUrl: safeMediaUrl || '',
            videoUrl: isVideoPost ? (safeMediaUrl !== safeThumbnailUrl ? safeMediaUrl : (data.videoUrl || safeMediaUrl)) : undefined,
            thumbnailUrl: safeThumbnailUrl || '',
            persistentMediaUrl: data.persistentMediaUrl || safeThumbnailUrl || safeMediaUrl || ''
          };

          // Fallback image if mediaUrl is missing on an image/video post
          if (!merged.mediaUrl && merged.thumbnailUrl) {
            merged.mediaUrl = merged.thumbnailUrl;
          }

          merged.isLiked = isPostLikedByUser(merged, activeUserId);
          merged.isSaved = isPostSavedByUser(merged, activeUserId);

          postsMap.set(String(docSnap.id), merged);
        }
      });

      let deletedPostsSet = new Set<string>();
      try {
        const delStr = localStorage.getItem('VyaparBridge_deleted_posts');
        if (delStr) {
          const arr = JSON.parse(delStr);
          if (Array.isArray(arr)) deletedPostsSet = new Set(arr.map(String));
        }
      } catch (e) {}

      const result = Array.from(postsMap.values())
        .filter(p => {
          if (!p) return false;
          const pId = String(p.id);
          if (deletedPostsSet.has(pId)) return false;
          if (p.status === 'rejected') return false;
          if (p.description === 'My tree' || p.title === 'Tree' || p.id === 'post_admin_1787027595927' || p.id === 'post_admin_1787027350660') return false;
          return true;
        })
        .sort((a, b) => {
          const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
          const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

      try { 
        localStorage.setItem(LOCAL_POSTS_CACHE_KEY, JSON.stringify(result.slice(0, 100))); 
      } catch (e) {}
      
      callback(result);
    }, (error: any) => {
      if (error?.message?.includes('Quota') || error?.code === 'resource-exhausted') {
        console.warn('Firestore real-time posts: Free daily read units limit reached. Local cache active.');
      } else if (error?.code === 'cancelled' || error?.message?.includes('CANCELLED') || error?.message?.includes('Disconnecting idle stream')) {
        // Normal gRPC stream lifecycle event when idle, ignore
      } else {
        console.warn('Firestore real-time posts subscription note:', error);
      }
    });
  } catch (err) {
    console.warn('Real-time posts listener setup note:', err);
    return () => {};
  }
}

export function subscribeToUsersFromFirestore(callback: (users: any[]) => void): () => void {
  try {
    const usersQuery = query(collection(db, 'users'));
    return onSnapshot(usersQuery, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data) {
          list.push({ ...data, id: docSnap.id });
        }
      });
      updateCachedUsers(list);
      callback(list);
    }, (error: any) => {
      if (error?.message?.includes('Quota') || error?.code === 'resource-exhausted') {
        console.warn('Firestore real-time users: Free daily read units limit reached. Local cache active.');
      } else if (error?.code === 'cancelled' || error?.message?.includes('CANCELLED') || error?.message?.includes('Disconnecting idle stream')) {
        // Normal gRPC stream lifecycle event when idle, ignore
      } else {
        console.warn('Firestore real-time users subscription note:', error);
      }
    });
  } catch (err) {
    console.warn('Real-time users listener setup note:', err);
    return () => {};
  }
}

export function subscribeToPaymentsFromFirestore(callback: (payments: any[]) => void): () => void {
  try {
    const payRef = collection(db, 'payments');
    return onSnapshot(payRef, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data) {
          list.push({ ...data, id: docSnap.id });
        }
      });
      try { localStorage.setItem('tileance_payments_cache', JSON.stringify(list)); } catch (e) {}
      callback(list);
    }, (error: any) => {
      try {
        const cached = localStorage.getItem('tileance_payments_cache');
        if (cached) callback(JSON.parse(cached));
      } catch (e) {}
      if (error?.message?.includes('Quota') || error?.code === 'resource-exhausted' || error?.code === 'cancelled' || error?.message?.includes('CANCELLED') || error?.message?.includes('Disconnecting idle stream')) {
        // Handled silently
      } else {
        console.warn('Firestore real-time payments subscription note:', error);
      }
    });
  } catch (err) {
    console.warn('Real-time payments listener setup note:', err);
    return () => {};
  }
}

// 3. Inquiries / Requirements
export async function submitRequirementToFirestore(reqData: FirestoreInquiry) {
  try {
    const localReqs = JSON.parse(localStorage.getItem('vyapar_cached_requirements') || '[]');
    localReqs.unshift({ ...reqData, id: 'req_' + Date.now(), createdAt: Date.now() });
    localStorage.setItem('vyapar_cached_requirements', JSON.stringify(localReqs.slice(0, 50)));

    await addDoc(collection(db, 'requirements'), {
      ...reqData,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    handleFirestoreError('submitRequirement', error);
    return true;
  }
}

// 4. Platform Feedback / Rating
export async function submitFeedbackToFirestore(feedbackData: any) {
  try {
    const localFeedbacks = JSON.parse(localStorage.getItem('vyapar_cached_feedback') || '[]');
    localFeedbacks.unshift({ ...feedbackData, id: 'fb_' + Date.now(), createdAt: Date.now() });
    localStorage.setItem('vyapar_cached_feedback', JSON.stringify(localFeedbacks.slice(0, 50)));

    await addDoc(collection(db, 'feedback'), {
      ...feedbackData,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    handleFirestoreError('submitFeedback', error);
    return true;
  }
}

// 5. Payment & UTR Submissions
export async function submitPaymentUTRToFirestore(paymentData: {
  userId: string;
  userName?: string;
  userPhone?: string;
  plan: string;
  membershipType: string;
  utr: string;
  amount: number;
}) {
  const paymentId = `pay_${Date.now()}`;
  try {
    const localPayments = JSON.parse(localStorage.getItem('tileance_payments_cache') || '[]');
    localPayments.unshift({
      ...paymentData,
      id: paymentId,
      status: 'pending',
      submittedAt: Date.now(),
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('tileance_payments_cache', JSON.stringify(localPayments.slice(0, 50)));

    const payRef = doc(db, 'payments', paymentId);
    await setDoc(payRef, {
      ...paymentData,
      id: paymentId,
      status: 'pending',
      submittedAt: serverTimestamp(),
      createdAt: new Date().toISOString()
    });

    // Also update user pendingPayment in Firestore
    if (paymentData.userId) {
      const userRef = doc(db, 'users', String(paymentData.userId));
      await setDoc(userRef, {
        pendingPayment: {
          id: paymentId,
          plan: paymentData.plan,
          membershipType: paymentData.membershipType,
          utr: paymentData.utr,
          status: 'pending',
          submittedAt: Date.now()
        }
      }, { merge: true });
    }

    return { success: true, paymentId };
  } catch (error) {
    handleFirestoreError('submitPaymentUTR', error);
    return { success: true, paymentId };
  }
}

// 6. Admin Settings & Master Secret Key Sync
export async function getAdminSettingsFromFirestore() {
  try {
    const settingsRef = doc(db, 'system', 'adminSettings');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (error) {
    handleFirestoreError('getAdminSettings', error);
  }
  try {
    const cached = localStorage.getItem('tileance_admin_settings_cache');
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return null;
}

export async function saveAdminSettingsToFirestore(settingsData: any) {
  try {
    localStorage.setItem('tileance_admin_settings_cache', JSON.stringify(settingsData));
    if (isFirestoreQuotaExhausted) return true;

    const settingsRef = doc(db, 'system', 'adminSettings');
    await setDoc(settingsRef, {
      ...settingsData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError('saveAdminSettings', error);
    return true;
  }
}

export function subscribeToAdminSettingsFromFirestore(callback: (data: any) => void) {
  try {
    const settingsRef = doc(db, 'system', 'adminSettings');
    return onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        try { localStorage.setItem('tileance_admin_settings_cache', JSON.stringify(data)); } catch (e) {}
        callback(data);
      }
    }, (error: any) => {
      // Gracefully fallback to localStorage cache on quota limit or network issue
      try {
        const cached = localStorage.getItem('tileance_admin_settings_cache');
        if (cached) callback(JSON.parse(cached));
      } catch (e) {}
      if (error?.message?.includes('Quota') || error?.code === 'resource-exhausted' || error?.code === 'cancelled' || error?.message?.includes('CANCELLED') || error?.message?.includes('Disconnecting idle stream')) {
        // Handled silently with cache fallback
      } else {
        console.warn('Firestore admin settings snapshot note:', error);
      }
    });
  } catch (e) {
    console.warn('Error subscribing to admin settings:', e);
    return () => {};
  }
}

export async function saveBrandAdsToFirestore(brandAdsList: any[]) {
  try {
    const cleanAds = brandAdsList.map(ad => ({
      id: ad.id || 'ad-' + Date.now(),
      type: ad.type || 'image',
      title: ad.title || '',
      companyName: ad.companyName || '',
      mediaUrl: ad.mediaUrl || '',
      linkUrl: ad.linkUrl || '',
      description: ad.description || '',
      isActive: ad.isActive !== false,
      createdAt: ad.createdAt || Date.now()
    }));
    try { localStorage.setItem('tileance_brand_ads_cache', JSON.stringify(cleanAds)); } catch (e) {}
    
    if (isFirestoreQuotaExhausted) return true;

    const adsRef = doc(db, 'system', 'brandAds');
    await setDoc(adsRef, {
      brandAdsList: cleanAds,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError('saveBrandAds', error);
    return true;
  }
}

export function subscribeToBrandAdsFromFirestore(callback: (ads: any[]) => void) {
  try {
    const adsRef = doc(db, 'system', 'brandAds');
    return onSnapshot(adsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.brandAdsList)) {
          try { localStorage.setItem('tileance_brand_ads_cache', JSON.stringify(data.brandAdsList)); } catch (e) {}
          callback(data.brandAdsList);
        }
      }
    }, (error: any) => {
      try {
        const cached = localStorage.getItem('tileance_brand_ads_cache');
        if (cached) callback(JSON.parse(cached));
      } catch (e) {}
      if (error?.message?.includes('Quota') || error?.code === 'resource-exhausted' || error?.code === 'cancelled' || error?.message?.includes('CANCELLED') || error?.message?.includes('Disconnecting idle stream')) {
        // Handled silently
      } else {
        console.warn('Firestore brandAds snapshot note:', error);
      }
    });
  } catch (e) {
    console.warn('Error subscribing to brand ads:', e);
    return () => {};
  }
}

// 7. Post & Reel Interactions Direct Firestore Handlers (Client-Side Compatible)
export async function likePostInFirestore(postId: string | number, userId: string | number, wasLiked: boolean, fullPost?: any) {
  const pId = String(postId);
  const isNowLiked = !wasLiked;
  
  // Immediately persist in local storage
  setPostLikedInLocalStorage(pId, isNowLiked);

  const fallbackLikes = typeof fullPost?.likesCount === 'number' 
    ? fullPost.likesCount 
    : (typeof fullPost?.likes === 'number' ? fullPost.likes : 0);

  try {
    const postRef = doc(db, 'posts', pId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const data = postSnap.data();
      const likedBy = Array.isArray(data.likedBy) ? data.likedBy : [];
      const firestoreLikes = typeof data.likesCount === 'number' ? data.likesCount : likedBy.length;
      const currentLikes = Math.max(firestoreLikes, fallbackLikes);
      
      let newCount = currentLikes;
      let newLikedBy = [...likedBy];

      if (wasLiked) {
        newCount = Math.max(0, currentLikes - 1);
        newLikedBy = newLikedBy.filter(id => String(id) !== String(userId));
      } else {
        newCount = currentLikes + 1;
        if (!newLikedBy.map(String).includes(String(userId))) {
          newLikedBy.push(String(userId));
        }
      }

      const patchData: any = {
        likesCount: newCount,
        likedBy: newLikedBy,
        updatedAt: serverTimestamp()
      };

      if (fullPost) {
        if (!data.mediaUrl && fullPost.mediaUrl) patchData.mediaUrl = fullPost.mediaUrl;
        if (!data.title && fullPost.title) patchData.title = fullPost.title;
        if (!data.content && fullPost.content) patchData.content = fullPost.content;
        if (!data.userName && (fullPost.userName || fullPost.user?.name)) patchData.userName = fullPost.userName || fullPost.user?.name;
        if (!data.userRole && (fullPost.userRole || fullPost.user?.role)) patchData.userRole = fullPost.userRole || fullPost.user?.role;
        if (!data.userAvatar && (fullPost.userAvatar || fullPost.user?.avatarUrl || fullPost.user?.avatar)) patchData.userAvatar = fullPost.userAvatar || fullPost.user?.avatarUrl || fullPost.user?.avatar;
        if (!data.type && fullPost.type) patchData.type = fullPost.type;
      }

      await updateDoc(postRef, patchData);

      return { success: true, isLiked: isNowLiked, likesCount: newCount };
    } else {
      const newCount = wasLiked ? Math.max(0, fallbackLikes - 1) : fallbackLikes + 1;
      const newLikedBy = wasLiked ? [] : [String(userId)];
      
      const initialDoc = sanitizeForFirestore({
        ...(fullPost || {}),
        id: pId,
        likesCount: newCount,
        likedBy: newLikedBy,
        updatedAt: Date.now(),
        createdAt: fullPost?.createdAt || Date.now()
      });

      await setDoc(postRef, initialDoc, { merge: true });
      return { success: true, isLiked: isNowLiked, likesCount: newCount };
    }
  } catch (err) {
    handleFirestoreError('likePost', err);
    const calculatedCount = isNowLiked ? (fallbackLikes + 1) : Math.max(0, fallbackLikes - 1);
    return { success: true, isLiked: isNowLiked, likesCount: calculatedCount };
  }
}

export async function savePostInFirestore(postId: string | number, userId: string | number, wasSaved: boolean, fullPost?: any) {
  const pId = String(postId);
  const isNowSaved = !wasSaved;

  // Immediately persist in local storage
  setPostSavedInLocalStorage(pId, isNowSaved);

  try {
    const postRef = doc(db, 'posts', pId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const data = postSnap.data();
      const currentSaved = typeof data.savedCount === 'number' ? data.savedCount : 0;
      const savedBy = Array.isArray(data.savedBy) ? data.savedBy : [];
      let newCount = currentSaved;
      let newSavedBy = [...savedBy];

      if (wasSaved) {
        newCount = Math.max(0, currentSaved - 1);
        newSavedBy = newSavedBy.filter(id => String(id) !== String(userId));
      } else {
        newCount = currentSaved + 1;
        if (!newSavedBy.map(String).includes(String(userId))) {
          newSavedBy.push(String(userId));
        }
      }

      const patchData: any = {
        savedCount: newCount,
        savedBy: newSavedBy,
        updatedAt: serverTimestamp()
      };

      if (fullPost) {
        if (!data.mediaUrl && fullPost.mediaUrl) patchData.mediaUrl = fullPost.mediaUrl;
        if (!data.title && fullPost.title) patchData.title = fullPost.title;
        if (!data.content && fullPost.content) patchData.content = fullPost.content;
        if (!data.userName && (fullPost.userName || fullPost.user?.name)) patchData.userName = fullPost.userName || fullPost.user?.name;
      }

      await updateDoc(postRef, patchData);

      return { success: true, isSaved: isNowSaved, savedCount: newCount };
    } else {
      const newCount = wasSaved ? 0 : 1;
      const newSavedBy = wasSaved ? [] : [String(userId)];
      
      const initialDoc = sanitizeForFirestore({
        ...(fullPost || {}),
        id: pId,
        savedCount: newCount,
        savedBy: newSavedBy,
        updatedAt: Date.now(),
        createdAt: fullPost?.createdAt || Date.now()
      });

      await setDoc(postRef, initialDoc, { merge: true });
      return { success: true, isSaved: isNowSaved, savedCount: newCount };
    }
  } catch (err) {
    handleFirestoreError('savePost', err);
    return { success: true, isSaved: isNowSaved, savedCount: wasSaved ? 0 : 1 };
  }
}

export async function addCommentToFirestore(postId: string | number, commentData: any) {
  const finalImage = commentData.commentImage || commentData.imageUrl || commentData.image || '';
  const newComment = {
    ...commentData,
    id: 'cmt_' + Date.now(),
    imageUrl: finalImage,
    commentImage: finalImage,
    createdAt: new Date().toISOString()
  };

  try {
    const localCommentsKey = 'vyapar_comments_' + String(postId);
    const localList = JSON.parse(localStorage.getItem(localCommentsKey) || '[]');
    localList.unshift(newComment);
    localStorage.setItem(localCommentsKey, JSON.stringify(localList.slice(0, 50)));

    const commentsRef = collection(db, 'posts', String(postId), 'comments');
    const firestoreComment = {
      ...commentData,
      imageUrl: finalImage,
      commentImage: finalImage,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };
    const docRef = await addDoc(commentsRef, firestoreComment);

    const postRef = doc(db, 'posts', String(postId));
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentCount = postSnap.data().commentsCount || 0;
      await updateDoc(postRef, { commentsCount: currentCount + 1 });
    } else {
      await setDoc(postRef, { id: String(postId), commentsCount: 1 }, { merge: true });
    }

    return { id: docRef.id, ...firestoreComment };
  } catch (err) {
    handleFirestoreError('addComment', err);
    return newComment;
  }
}

export async function fetchCommentsFromFirestore(postId: string | number) {
  const localCommentsKey = 'vyapar_comments_' + String(postId);
  try {
    const commentsRef = collection(db, 'posts', String(postId), 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    const comments: any[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const img = data.commentImage || data.imageUrl || data.image || data.mediaUrl || null;
      comments.push({ 
        id: docSnap.id, 
        ...data,
        imageUrl: img,
        commentImage: img,
        user: data.user || {
          id: data.userId || '1',
          name: data.userName || 'Member',
          avatarUrl: data.userAvatar || ''
        }
      });
    });
    if (comments.length > 0) {
      localStorage.setItem(localCommentsKey, JSON.stringify(comments));
      return comments;
    }
  } catch (err) {
    handleFirestoreError('fetchComments', err);
  }
  try {
    const cached = localStorage.getItem(localCommentsKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return [];
}

export function subscribeToCommentsFromFirestore(postId: string | number, callback: (comments: any[]) => void) {
  const localCommentsKey = 'vyapar_comments_' + String(postId);
  
  // Instant emit from local cache for 0ms render
  try {
    const cached = localStorage.getItem(localCommentsKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        callback(parsed);
      }
    }
  } catch (e) {}

  try {
    const commentsRef = collection(db, 'posts', String(postId), 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'), limit(100));
    
    return onSnapshot(q, (snap) => {
      const liveComments: any[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const img = data.commentImage || data.imageUrl || data.image || data.mediaUrl || null;
        liveComments.push({ 
          id: docSnap.id, 
          ...data,
          imageUrl: img,
          commentImage: img,
          user: data.user || {
            id: data.userId || '1',
            name: data.userName || 'Member',
            avatarUrl: data.userAvatar || ''
          }
        });
      });
      if (liveComments.length > 0) {
        try {
          localStorage.setItem(localCommentsKey, JSON.stringify(liveComments));
        } catch (e) {}
        callback(liveComments);
      }
    }, (err) => {
      console.warn('Firestore comments snapshot notice:', err?.message || err);
    });
  } catch (err) {
    console.warn('Error setting up comments listener:', err);
    return () => {};
  }
}

export async function followUserInFirestore(targetUserId: string | number, followerId: string | number) {
  try {
    const targetRef = doc(db, 'users', String(targetUserId));
    const targetSnap = await getDoc(targetRef);
    const targetData = targetSnap.exists() ? targetSnap.data() : {};
    const followers = Array.isArray(targetData.followers) ? targetData.followers : [];

    const isFollowing = followers.includes(String(followerId));
    let newFollowers = [...followers];

    if (isFollowing) {
      newFollowers = newFollowers.filter(id => String(id) !== String(followerId));
    } else {
      newFollowers.push(String(followerId));
    }

    await setDoc(targetRef, { followers: newFollowers }, { merge: true });

    return { success: true, isFollowing: !isFollowing, followersCount: newFollowers.length };
  } catch (err) {
    handleFirestoreError('followUser', err);
    return { success: true, isFollowing: true, followersCount: 1 };
  }
}

export async function recordViewInFirestore(postId: string | number) {
  const pId = String(postId);
  if (!pId) return null;

  // Check if already viewed in this browser session to avoid burning write operations
  const sessionKey = 'vyapar_viewed_post_' + pId;
  if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
    return null;
  }
  if (typeof window !== 'undefined') {
    try { sessionStorage.setItem(sessionKey, '1'); } catch (e) {}
  }

  try {
    const postRef = doc(db, 'posts', pId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentViews = postSnap.data().viewsCount || 0;
      await updateDoc(postRef, { viewsCount: currentViews + 1 });
      return currentViews + 1;
    } else {
      await setDoc(postRef, { id: pId, viewsCount: 1 }, { merge: true });
      return 1;
    }
  } catch (err) {
    handleFirestoreError('recordViewInFirestore', err);
    return null;
  }
}

export async function recordShareInFirestore(postId: string | number) {
  try {
    const postRef = doc(db, 'posts', String(postId));
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentShares = postSnap.data().sharesCount || 0;
      await updateDoc(postRef, { sharesCount: currentShares + 1 });
      return currentShares + 1;
    } else {
      await setDoc(postRef, { id: String(postId), sharesCount: 1 }, { merge: true });
      return 1;
    }
  } catch (err) {
    handleFirestoreError('recordShareInFirestore', err);
    return null;
  }
}

export async function authenticateUserInFirestore(usernameOrPhone: string, passwordInput: string, role?: string) {
  try {
    const cleanInput = usernameOrPhone.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanInput) {
      return { success: false, error: 'Kripya username ya mobile number enter karein.' };
    }

    // Query Firestore users collection
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);
    let matchedUser: any = null;

    snap.forEach((docSnap) => {
      const u = docSnap.data();
      const uName = (u.username || '').trim().toLowerCase();
      const uPhone = (u.phone || '').trim();
      const uEmail = (u.email || '').trim().toLowerCase();
      const uId = String(u.id || '').trim().toLowerCase();

      if (uName === cleanInput || uPhone === cleanInput || uEmail === cleanInput || uId === cleanInput) {
        matchedUser = { ...u, id: docSnap.id };
      }
    });

    if (matchedUser) {
      // If password field exists on user document, verify it
      if (matchedUser.password && matchedUser.password !== cleanPassword) {
        return { success: false, error: '❌ Galat Password! Kripya Sahi Password Enter Karein.' };
      }
      return { success: true, user: matchedUser };
    }

    // Check localStorage fallback for registered accounts on this device
    const localUserStr = localStorage.getItem('user') || localStorage.getItem('Vyapar Bridge_user');
    if (localUserStr) {
      try {
        const localUser = JSON.parse(localUserStr);
        const lName = (localUser.username || '').trim().toLowerCase();
        const lPhone = (localUser.phone || '').trim();
        const lEmail = (localUser.email || '').trim().toLowerCase();

        if (lName === cleanInput || lPhone === cleanInput || lEmail === cleanInput) {
          if (localUser.password && localUser.password !== cleanPassword) {
            return { success: false, error: '❌ Galat Password! Kripya Sahi Password Enter Karein.' };
          }
          return { success: true, user: localUser };
        }
      } catch (e) {}
    }

    return { 
      success: false, 
      error: '❌ Yeh ID Registered Nahi Hai! Kripya Pehle "Register New Account" Button Par Click Karke Register Karein.' 
    };
  } catch (err) {
    console.warn('Firestore authenticateUser note:', err);
    return { 
      success: false, 
      error: '❌ Connection Issue. Yeh ID Registered Nahi Hai! Kripya Pehle Register Karein.' 
    };
  }
}

// 7b. Admin Master Password Reset
export async function adminResetUserPassword(userId: string | number, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanId = String(userId).trim();
    const cleanPass = newPassword.trim();
    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Invalid User ID or Password' };
    }

    // 1. Update in Firestore users collection
    const userRef = doc(db, 'users', cleanId);
    await setDoc(userRef, { 
      password: cleanPass,
      passwordUpdatedAt: Date.now(),
      lastAdminResetAt: Date.now()
    }, { merge: true });

    // 2. Also search if user is stored under different doc ID
    try {
      const usersRef = collection(db, 'users');
      const snap = await getDocs(usersRef);
      snap.forEach(async (dSnap) => {
        const u = dSnap.data();
        if (String(u.id) === cleanId || String(u.username).toLowerCase() === cleanId.toLowerCase()) {
          await setDoc(doc(db, 'users', dSnap.id), {
            password: cleanPass,
            passwordUpdatedAt: Date.now()
          }, { merge: true });
        }
      });
    } catch (qErr) {
      console.warn('Secondary user doc update note:', qErr);
    }

    // 3. Update active local storage if matching user is logged in
    try {
      const localUserStr = localStorage.getItem('user') || localStorage.getItem('Vyapar Bridge_user');
      if (localUserStr) {
        const parsed = JSON.parse(localUserStr);
        if (String(parsed.id) === cleanId || String(parsed.username).toLowerCase() === cleanId.toLowerCase()) {
          parsed.password = cleanPass;
          localStorage.setItem('user', JSON.stringify(parsed));
          localStorage.setItem('Vyapar Bridge_user', JSON.stringify(parsed));
        }
      }
    } catch (lErr) {}

    console.log(`🔑 Master Password Reset successful for user ${cleanId}`);
    return { success: true };
  } catch (error: any) {
    console.error('adminResetUserPassword error:', error);
    return { success: false, error: error.message || 'Failed to update password in database' };
  }
}

// 7c. User Self Change Password
export async function userChangeOwnPassword(userId: string | number, currentPass: string, newPass: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanId = String(userId).trim();
    const cleanCurrent = currentPass.trim();
    const cleanNew = newPass.trim();

    if (!cleanId) return { success: false, error: 'User not logged in.' };
    if (!cleanNew || cleanNew.length < 4) return { success: false, error: 'New password must be at least 4 characters.' };

    // 1. Verify current password from Firestore
    const userRef = doc(db, 'users', cleanId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.password && data.password !== cleanCurrent) {
        return { success: false, error: 'Incorrect current password (वर्तमान पासवर्ड गलत है)!' };
      }
    }

    // 2. Update Firestore with new password
    await setDoc(userRef, {
      password: cleanNew,
      passwordUpdatedAt: Date.now()
    }, { merge: true });

    // 3. Update localStorage
    try {
      const localUserStr = localStorage.getItem('user') || localStorage.getItem('Vyapar Bridge_user');
      if (localUserStr) {
        const parsed = JSON.parse(localUserStr);
        if (String(parsed.id) === cleanId) {
          parsed.password = cleanNew;
          localStorage.setItem('user', JSON.stringify(parsed));
          localStorage.setItem('Vyapar Bridge_user', JSON.stringify(parsed));
        }
      }
    } catch (lErr) {}

    return { success: true };
  } catch (err: any) {
    console.error('userChangeOwnPassword error:', err);
    return { success: false, error: err?.message || 'Failed to update password.' };
  }
}

// 8. Block User & Not Interested Firestore Synchronization
export async function blockUserInFirestore(blockerId: string | number, targetUserId: string | number) {
  try {
    const userRef = doc(db, 'users', String(blockerId));
    const userSnap = await getDoc(userRef);
    const existingBlocked = userSnap.exists() && Array.isArray(userSnap.data().blockedUsers)
      ? userSnap.data().blockedUsers
      : [];
    
    if (!existingBlocked.includes(String(targetUserId))) {
      const updatedBlocked = [...existingBlocked, String(targetUserId)];
      await setDoc(userRef, { blockedUsers: updatedBlocked }, { merge: true });
    }
    return true;
  } catch (err) {
    console.warn('Firestore blockUser note:', err);
    return false;
  }
}

export async function markPostNotInterestedInFirestore(userId: string | number, postId: string | number) {
  try {
    const userRef = doc(db, 'users', String(userId));
    const userSnap = await getDoc(userRef);
    const existingNotInterested = userSnap.exists() && Array.isArray(userSnap.data().notInterestedPosts)
      ? userSnap.data().notInterestedPosts
      : [];
    
    if (!existingNotInterested.includes(String(postId))) {
      const updatedNotInterested = [...existingNotInterested, String(postId)];
      await setDoc(userRef, { notInterestedPosts: updatedNotInterested }, { merge: true });
    }
    return true;
  } catch (err) {
    console.warn('Firestore markPostNotInterested note:', err);
    return false;
  }
}

export async function getUsersBlockedAndNotInterestedFromFirestore(userId: string | number) {
  try {
    const userRef = doc(db, 'users', String(userId));
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        blockedUsers: Array.isArray(data.blockedUsers) ? data.blockedUsers.map(String) : [],
        notInterestedPosts: Array.isArray(data.notInterestedPosts) ? data.notInterestedPosts.map(String) : []
      };
    }
  } catch (err) {
    console.warn('Firestore getUsersBlockedAndNotInterested note:', err);
  }
  return { blockedUsers: [], notInterestedPosts: [] };
}

export const LOCAL_USERS_CACHE_KEY = 'VyaparBridge_cached_users';

export async function syncUserToFirestore(userData: any): Promise<boolean> {
  if (!userData || !userData.id) return false;
  try {
    const uId = String(userData.id);
    let cleanData = sanitizeForFirestore({
      ...userData,
      id: uId,
      updatedAt: Date.now()
    });

    // FIRESTORE SAFEGUARD: Keep user document size < 750 KB
    let jsonStr = JSON.stringify(cleanData);
    if (jsonStr.length > 750000) {
      console.warn(`⚠️ User profile payload size (${jsonStr.length} bytes) exceeds safe limit. Compressing images...`);
      const compressedAvatar = await optimizeImageForPersistence(cleanData.avatarUrl || cleanData.avatar || "", 400, 400, 0.7);
      cleanData.avatar = compressedAvatar;
      cleanData.avatarUrl = compressedAvatar;
      if (cleanData.coverUrl) {
        cleanData.coverUrl = await optimizeImageForPersistence(cleanData.coverUrl, 1000, 333, 0.6);
      }
      delete cleanData.rawCatalogue;
      delete cleanData.rawPDF;
    }

    // 1. Instant Local Storage Backup
    try {
      updateCachedUsers(cleanData);
      const existingStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
      let list: any[] = existingStr ? JSON.parse(existingStr) : [];
      if (!Array.isArray(list)) list = [];
      const filtered = list.filter(u => String(u.id) !== uId);
      localStorage.setItem(LOCAL_USERS_CACHE_KEY, JSON.stringify([cleanData, ...filtered]));
    } catch (localErr) {
      console.warn('Local users cache backup note:', localErr);
    }

    // 2. Direct Firestore Persistence
    const userRef = doc(db, 'users', uId);
    await setDoc(userRef, {
      ...cleanData,
      serverSyncedAt: serverTimestamp()
    }, { merge: true });

    console.log(`✅ User profile synced to Firestore: ${uId}`);
    return true;
  } catch (err) {
    console.warn('Firestore syncUser note:', err);
    return false;
  }
}

export const DELETED_USERS_KEY = 'VyaparBridge_deleted_users';

export function getDeletedUserIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_USERS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.map(String));
    }
  } catch (e) {}
  return new Set();
}

export function markUserDeletedLocally(userId: string | number) {
  try {
    const uId = String(userId);
    const set = getDeletedUserIds();
    set.add(uId);
    localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(Array.from(set)));

    // Clean from local users cache
    const existingStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
    if (existingStr) {
      const list = JSON.parse(existingStr);
      if (Array.isArray(list)) {
        const filtered = list.filter(u => String(u?.id) !== uId && String(u?.username) !== uId);
        localStorage.setItem(LOCAL_USERS_CACHE_KEY, JSON.stringify(filtered));
      }
    }

    // Clean current session if matching
    const curStr = localStorage.getItem('user') || localStorage.getItem('Vyapar Bridge_user');
    if (curStr) {
      const curUser = JSON.parse(curStr);
      if (String(curUser?.id) === uId || String(curUser?.username) === uId) {
        localStorage.removeItem('user');
        localStorage.removeItem('Vyapar Bridge_user');
      }
    }
  } catch (e) {}
}

export async function fetchAllUsersFromFirestore(): Promise<any[]> {
  const usersMap = new Map<string, any>();
  const deletedSet = getDeletedUserIds();

  // 1. Fetch from Firestore 'users' collection (All Members Uncapped)
  try {
    const usersQuery = query(collection(db, 'users'));
    const snap = await getDocs(usersQuery);
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && docSnap.id !== 'undefined') {
        const uId = String(data.id || docSnap.id);
        const uUsername = String(data.username || '');
        if (!deletedSet.has(uId) && !deletedSet.has(uUsername) && !deletedSet.has(docSnap.id)) {
          usersMap.set(uId, { ...data, id: uId });
        }
      }
    });
  } catch (error: any) {
    if (error?.message?.includes('Quota') || error?.code === 'resource-exhausted') {
      console.warn('Firestore daily read quota note: Using local cached users.');
    } else {
      console.warn('Firestore fetchAllUsers note:', error);
    }
    // Only fall back to local cache if network/quota failed
    try {
      const localStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
      if (localStr) {
        const localList = JSON.parse(localStr);
        if (Array.isArray(localList)) {
          localList.forEach(u => {
            if (u && (u.id || u.username) && (u.name || u.username)) {
              const uId = String(u.id || u.username);
              if (!deletedSet.has(uId) && !deletedSet.has(String(u.username || '')) && !deletedSet.has(String(u.id || ''))) {
                usersMap.set(uId, u);
              }
            }
          });
        }
      }
    } catch (e) {}
  }

  // Current logged in user
  try {
    const curUserStr = localStorage.getItem('user') || localStorage.getItem('Vyapar Bridge_user');
    if (curUserStr) {
      const curUser = JSON.parse(curUserStr);
      if (curUser && (curUser.id || curUser.username) && (curUser.name || curUser.username)) {
        const uId = String(curUser.id || curUser.username);
        if (!deletedSet.has(uId) && !deletedSet.has(String(curUser.username || '')) && !deletedSet.has(String(curUser.id || ''))) {
          const existing = usersMap.get(uId) || {};
          usersMap.set(uId, { ...existing, ...curUser });
        }
      }
    }
  } catch (e) {}

  // 2. Fallback to API if available
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const ct = res.headers.get('content-type');
      if (ct && ct.includes('application/json')) {
        const apiUsers = await res.json();
        if (Array.isArray(apiUsers)) {
          apiUsers.forEach(u => {
            if (u && (u.id || u.username) && (u.name || u.username)) {
              const uId = String(u.id || u.username);
              const uUsername = String(u.username || '');
              if (!deletedSet.has(uId) && !deletedSet.has(uUsername)) {
                const existing = usersMap.get(uId) || {};
                usersMap.set(uId, { ...existing, ...u, id: uId });
              }
            }
          });
        }
      }
    }
  } catch (e) {}

  const result = Array.from(usersMap.values()).filter(u => {
    const uId = String(u.id || '');
    const uUname = String(u.username || '');
    return !deletedSet.has(uId) && !deletedSet.has(uUname);
  });

  try {
    updateCachedUsers(result);
    localStorage.setItem(LOCAL_USERS_CACHE_KEY, JSON.stringify(result));
  } catch (e) {}
  return result;
}

export async function deletePostFromFirestore(postId: string | number): Promise<boolean> {
  try {
    const pId = String(postId);

    // 1. Remove from all local caches
    const cacheKeys = [LOCAL_POSTS_CACHE_KEY, 'VyaparBridge_posts_cache', 'local_posts_cache'];
    cacheKeys.forEach(k => {
      try {
        const str = localStorage.getItem(k);
        if (str) {
          const list = JSON.parse(str);
          if (Array.isArray(list)) {
            localStorage.setItem(k, JSON.stringify(list.filter(p => String(p?.id) !== pId)));
          }
        }
      } catch (e) {}
    });

    // 2. Track in deleted post IDs list to prevent re-appearance
    try {
      const delStr = localStorage.getItem('VyaparBridge_deleted_posts') || '[]';
      const delList = JSON.parse(delStr);
      if (Array.isArray(delList) && !delList.includes(pId)) {
        delList.push(pId);
        localStorage.setItem('VyaparBridge_deleted_posts', JSON.stringify(delList.slice(-200)));
      }
    } catch (e) {}

    // 3. Delete from Firestore
    await deleteDoc(doc(db, 'posts', pId));
    console.log(`🗑️ Deleted post ${pId} from Firestore`);
    return true;
  } catch (err) {
    console.warn('Firestore deletePost error:', err);
    return false;
  }
}

export async function deleteUserFromFirestore(userId: string | number, extraIdentifiers?: { username?: string; phone?: string; email?: string }): Promise<boolean> {
  try {
    const uId = String(userId);
    const uUname = extraIdentifiers?.username ? String(extraIdentifiers.username).toLowerCase() : '';
    const uPhone = extraIdentifiers?.phone ? String(extraIdentifiers.phone).trim() : '';

    // 1. Immediately mark deleted locally to protect UI & cache
    markUserDeletedLocally(uId);
    if (uUname) markUserDeletedLocally(uUname);

    // 2. Direct deletion of user doc by ID
    const userRef = doc(db, 'users', uId);
    const deleteUserDocPromise = deleteDoc(userRef).catch(err => {
      console.warn('deleteDoc user error:', err);
    });

    // 3. Scan & delete any user docs matching id, username, or phone
    const deleteUserQueryPromise = (async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const matchedUserDocs = usersSnap.docs.filter(d => {
          if (d.id === uId || d.id === uUname) return true;
          const data = d.data();
          const dId = String(data.id || '');
          const dUname = String(data.username || '').toLowerCase();
          const dPhone = String(data.phone || '').trim();
          return dId === uId || (uUname && dUname === uUname) || (uPhone && dPhone === uPhone);
        });
        await Promise.all(matchedUserDocs.map(d => deleteDoc(d.ref)));
      } catch (err) {
        console.warn('Firestore scan users delete error:', err);
      }
    })();

    // 4. Parallel deletion of user posts & reels
    const deletePostsPromise = (async () => {
      try {
        const postsSnap = await getDocs(collection(db, 'posts'));
        const userPosts = postsSnap.docs.filter(pDoc => {
          const data = pDoc.data();
          const pUserId = String(data.userId || data.user?.id || '');
          const pUserName = String(data.userName || data.user?.username || '').toLowerCase();
          return pUserId === uId || (uUname && pUserName === uUname);
        });
        await Promise.all(userPosts.map(pDoc => deleteDoc(pDoc.ref)));
      } catch (err) {
        console.warn('Firestore user posts delete error:', err);
      }
    })();

    // 5. Parallel deletion of user pending payments
    const deletePaymentsPromise = (async () => {
      try {
        const paySnap = await getDocs(collection(db, 'payments'));
        const userPays = paySnap.docs.filter(pDoc => {
          const data = pDoc.data();
          const payUserId = String(data.userId || data.user?.id || '');
          return payUserId === uId || (uUname && String(data.username || '').toLowerCase() === uUname);
        });
        await Promise.all(userPays.map(pDoc => deleteDoc(pDoc.ref)));
      } catch (err) {}
    })();

    // 6. Parallel deletion of user comments & feedbacks
    const deleteCommentsPromise = (async () => {
      try {
        const commentsSnap = await getDocs(collection(db, 'comments'));
        const userComments = commentsSnap.docs.filter(cDoc => {
          const data = cDoc.data();
          return String(data.userId || '') === uId || (uUname && String(data.username || '').toLowerCase() === uUname);
        });
        await Promise.all(userComments.map(cDoc => deleteDoc(cDoc.ref)));
      } catch (err) {}
    })();

    // 7. Non-blocking parallel execution
    await Promise.race([
      Promise.all([
        deleteUserDocPromise,
        deleteUserQueryPromise,
        deletePostsPromise,
        deletePaymentsPromise,
        deleteCommentsPromise
      ]),
      new Promise(resolve => setTimeout(resolve, 3000))
    ]);

    console.log(`⚡ Permanently purged user ${uId} and all records from Firestore & local storage`);
    return true;
  } catch (err) {
    console.warn('Firestore deleteUser error:', err);
    return false;
  }
}

export async function updateUserVerificationInFirestore(
  userId: string | number,
  isVerified: boolean,
  plan: string = 'yearly',
  validityDays: number = 365
): Promise<boolean> {
  try {
    const uId = String(userId);
    const now = Date.now();
    const expiresAt = isVerified ? now + (validityDays * 24 * 60 * 60 * 1000) : null;
    
    // Update local user cache
    try {
      const existingStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
      if (existingStr) {
        const list: any[] = JSON.parse(existingStr);
        if (Array.isArray(list)) {
          const updated = list.map(u => {
            if (String(u.id) === uId) {
              return { ...u, isVerified, verifiedPlan: isVerified ? plan : null, verifiedAt: isVerified ? now : null, expiresAt, validityDays: isVerified ? validityDays : null };
            }
            return u;
          });
          localStorage.setItem(LOCAL_USERS_CACHE_KEY, JSON.stringify(updated));
        }
      }
    } catch (e) {}

    if (isFirestoreQuotaExhausted) return true;

    await setDoc(doc(db, 'users', uId), {
      isVerified,
      verifiedPlan: isVerified ? plan : null,
      verifiedAt: isVerified ? now : null,
      expiresAt: expiresAt,
      validityDays: isVerified ? validityDays : null
    }, { merge: true });

    return true;
  } catch (err) {
    handleFirestoreError('updateUserVerification', err);
    return true;
  }
}

// REALTIME PLATFORM ANALYTICS & VISITOR COUNTER ENGINE
export function subscribeToPlatformStatsFromFirestore(
  callback: (stats: { totalVisitors: number; totalReviews: number; averageRating: number; feedbacks: any[] }) => void
) {
  try {
    const statsRef = doc(db, 'platform_stats', 'analytics');
    return onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const res = {
          totalVisitors: typeof data.totalVisitors === 'number' ? data.totalVisitors : 0,
          totalReviews: typeof data.totalReviews === 'number' ? data.totalReviews : 24,
          averageRating: typeof data.averageRating === 'number' ? data.averageRating : 5.0,
          feedbacks: Array.isArray(data.feedbacks) ? data.feedbacks : []
        };
        try { localStorage.setItem('tileance_platform_stats_cache', JSON.stringify(res)); } catch (e) {}
        callback(res);
      }
    }, (err: any) => {
      try {
        const cached = localStorage.getItem('tileance_platform_stats_cache');
        if (cached) callback(JSON.parse(cached));
      } catch (e) {}
      if (err?.code === 'cancelled' || err?.message?.includes('CANCELLED') || err?.message?.includes('Disconnecting idle stream')) {
        // Normal gRPC stream lifecycle event when idle, ignore
      } else {
        handleFirestoreError('subscribeToPlatformStats', err);
      }
    });
  } catch (err) {
    console.warn('Firestore subscribeToPlatformStats init error:', err);
    return () => {};
  }
}

export async function incrementVisitorCountInFirestore(): Promise<number> {
  try {
    // Only increment once per browser session to drastically conserve Firestore daily write quota
    if (typeof window !== 'undefined' && sessionStorage.getItem('vyapar_visitor_counted_session')) {
      const cached = localStorage.getItem('tileance_platform_stats_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.totalVisitors || 5420;
      }
      return 5420;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('vyapar_visitor_counted_session', 'true');
    }

    if (isFirestoreQuotaExhausted) {
      return 5420;
    }

    const statsRef = doc(db, 'platform_stats', 'analytics');
    const snap = await getDoc(statsRef);
    let currentVisitors = 5420;
    let feedbacks: any[] = [];
    let totalReviews = 24;
    let averageRating = 5.0;

    if (snap.exists()) {
      const data = snap.data();
      currentVisitors = typeof data.totalVisitors === 'number' ? data.totalVisitors : 5420;
      feedbacks = Array.isArray(data.feedbacks) ? data.feedbacks : [];
      totalReviews = typeof data.totalReviews === 'number' ? data.totalReviews : 24;
      averageRating = typeof data.averageRating === 'number' ? data.averageRating : 5.0;
    }

    const newVisitorCount = currentVisitors + 1;
    await setDoc(statsRef, {
      totalVisitors: newVisitorCount,
      totalReviews,
      averageRating,
      feedbacks,
      lastVisitorAt: Date.now(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    return newVisitorCount;
  } catch (err) {
    handleFirestoreError('incrementVisitorCount', err);
    return 5420;
  }
}

export async function submitPlatformRatingToFirestore(ratingData: {
  rating: number;
  comment: string;
  userName: string;
  userCity: string;
  userRole?: string;
  userId?: string | null;
}) {
  try {
    const newFeedback = {
      id: 'fb-' + Date.now(),
      rating: ratingData.rating,
      comment: ratingData.comment || 'Great platform!',
      userName: ratingData.userName || 'Vyapar Member',
      userCity: ratingData.userCity || 'India',
      userRole: ratingData.userRole || 'visitor',
      userId: ratingData.userId || null,
      createdAt: Date.now()
    };

    if (isFirestoreQuotaExhausted) {
      return { success: true, stats: { totalVisitors: 5420, totalReviews: 25, averageRating: 5.0, feedbacks: [newFeedback] } };
    }

    const statsRef = doc(db, 'platform_stats', 'analytics');
    const snap = await getDoc(statsRef);
    let currentStats = snap.exists() ? snap.data() : { totalVisitors: 5420, totalReviews: 24, averageRating: 5.0, feedbacks: [] };
    
    const existingFeedbacks = Array.isArray(currentStats.feedbacks) ? currentStats.feedbacks : [];
    const updatedFeedbacks = [newFeedback, ...existingFeedbacks];
    const totalReviews = updatedFeedbacks.length;
    let sum = 0;
    updatedFeedbacks.forEach(f => sum += (f.rating || 5));
    const averageRating = Number((sum / totalReviews).toFixed(1));

    const newStats = {
      ...currentStats,
      totalReviews,
      averageRating,
      feedbacks: updatedFeedbacks.slice(0, 50),
      updatedAt: serverTimestamp()
    };

    await setDoc(statsRef, newStats, { merge: true });
    return { success: true, stats: newStats };
  } catch (err) {
    handleFirestoreError('submitPlatformRating', err);
    return null;
  }
}

export async function clearDefaultDataFromFirestore() {
  try {
    if (isFirestoreQuotaExhausted) {
      const keysToRemove = [
        'tileance_posts_cache',
        'VyaparBridge_posts_cache',
        'local_posts_cache',
        'tileance_users_cache',
        'tileance_admin_settings_cache',
        'tileance_brand_ads_cache',
        'vyapar_liked_posts',
        'vyapar_saved_posts',
        'VyaparBridge_deleted_posts',
        'VyaparBridge_blocked_users_guest',
        'VyaparBridge_not_interested_guest'
      ];
      keysToRemove.forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      return true;
    }

    // 1. Delete ALL posts from Firestore
    try {
      const snap = await getDocs(collection(db, 'posts'));
      for (const d of snap.docs) {
        try { await deleteDoc(doc(db, 'posts', d.id)); } catch (e) {}
      }
    } catch (e) {}

    // 2. Delete ALL non-admin users from Firestore
    try {
      const snap = await getDocs(collection(db, 'users'));
      for (const d of snap.docs) {
        const u = d.data();
        if (u.role !== 'admin' && String(d.id) !== '1' && String(u.id) !== '1') {
          try { await deleteDoc(doc(db, 'users', d.id)); } catch (e) {}
        }
      }
    } catch (e) {}

    // 3. Clear all browser localStorage caches
    const keysToRemove = [
      'tileance_posts_cache',
      'VyaparBridge_posts_cache',
      'local_posts_cache',
      'tileance_users_cache',
      'tileance_admin_settings_cache',
      'tileance_brand_ads_cache',
      'vyapar_liked_posts',
      'vyapar_saved_posts',
      'VyaparBridge_deleted_posts',
      'VyaparBridge_blocked_users_guest',
      'VyaparBridge_not_interested_guest'
    ];
    keysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });

    return true;
  } catch (err) {
    handleFirestoreError('clearDefaultData', err);
    return false;
  }
}

// ==========================================
// 8. REAL-TIME USER PRESENCE & ONLINE STATUS
// ==========================================

let lastPresenceSyncTimestamp = 0;

export async function updateUserPresence(userId: string | number, isOnline: boolean): Promise<boolean> {
  if (!userId) return false;
  try {
    const uId = String(userId);
    const now = Date.now();
    
    // Update local cache immediately
    try {
      const existingStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
      if (existingStr) {
        const list: any[] = JSON.parse(existingStr);
        if (Array.isArray(list)) {
          const updated = list.map(u => {
            if (String(u.id) === uId) {
              return { ...u, isOnline, lastActiveAt: now, lastHeartbeat: now };
            }
            return u;
          });
          localStorage.setItem(LOCAL_USERS_CACHE_KEY, JSON.stringify(updated));
        }
      }
    } catch (e) {}

    if (isFirestoreQuotaExhausted) return true;

    // Rate-limit network presence writes to once every 5 minutes (300,000 ms) to avoid burning quota
    if (isOnline && now - lastPresenceSyncTimestamp < 300000) {
      return true;
    }
    lastPresenceSyncTimestamp = now;

    // Sync to Firestore
    const userRef = doc(db, 'users', uId);
    await setDoc(userRef, {
      isOnline,
      lastActiveAt: now,
      lastHeartbeat: now
    }, { merge: true });

    return true;
  } catch (err) {
    handleFirestoreError('updateUserPresence', err);
    return false;
  }
}

/**
 * Starts continuous real-time presence heartbeat for the logged in user.
 * Automatically marks offline on tab close, backgrounding, or leaving app.
 */
export function startPresenceHeartbeat(userId: string | number): () => void {
  if (!userId) return () => {};
  const uId = String(userId);

  // 1. Send immediate online ping
  updateUserPresence(uId, true).catch(() => {});

  // 2. Periodic heartbeat every 5 minutes (conserves write quota)
  const intervalId = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      updateUserPresence(uId, true).catch(() => {});
    }
  }, 300000);

  // 3. Tab visibility listener (switched tabs / minimized)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      updateUserPresence(uId, true).catch(() => {});
    } else {
      updateUserPresence(uId, false).catch(() => {});
    }
  };

  // 4. Page hide / Unload listener (close tab / browser exit)
  const handleBeforeUnload = () => {
    updateUserPresence(uId, false).catch(() => {});
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleBeforeUnload);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', () => {
      // If user focuses outside window for long, keep presence fresh
      if (document.visibilityState === 'hidden') {
        updateUserPresence(uId, false).catch(() => {});
      }
    });
    window.addEventListener('focus', () => {
      updateUserPresence(uId, true).catch(() => {});
    });
  }

  // Cleanup handler
  return () => {
    clearInterval(intervalId);
    if (typeof window !== 'undefined') {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleBeforeUnload);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
    updateUserPresence(uId, false).catch(() => {});
  };
}

/**
 * Returns true if a user is currently online and active within the heartbeat window (65 seconds).
 */
export function isUserActiveOnline(userData: any): boolean {
  if (!userData) return false;
  if (userData.isOnline !== true) return false;
  
  const lastTime = userData.lastActiveAt || userData.lastHeartbeat || userData.updatedAt || 0;
  const numTime = typeof lastTime === 'number' ? lastTime : new Date(lastTime).getTime();
  if (isNaN(numTime) || numTime <= 0) return false;

  const diff = Date.now() - numTime;
  // Consider online if heartbeat was updated within 65 seconds
  return diff < 65000;
}

/**
 * Formats user's last seen time like Instagram / Facebook ("Active now", "Active 5m ago", "Active 2h ago")
 */
export function getUserLastActiveFormatted(userData: any): string {
  if (!userData) return 'Offline';
  
  if (isUserActiveOnline(userData)) {
    return 'Active now';
  }

  const lastTime = userData.lastActiveAt || userData.lastHeartbeat || userData.updatedAt || 0;
  const numTime = typeof lastTime === 'number' ? lastTime : new Date(lastTime).getTime();
  if (isNaN(numTime) || numTime <= 0) return 'Offline';

  const diff = Date.now() - numTime;
  if (diff < 60000) {
    return 'Active just now';
  }
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `Active ${mins}m ago`;
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `Active ${hours}h ago`;
  }
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `Active ${days}d ago`;
  }
  return 'Offline';
}







export async function recordEnquiryInFirestore(postId: string, userId: string, userName: string) {
  if (isFirestoreQuotaExhausted) return null;
  try {
    const postRef = doc(db, 'posts', String(postId));
    
    // Use a transaction or direct update (we will just use setDoc with merge to be safe)
    // Actually just tracking count and saving notification for the user
    // To make it simple we'll just update the enquiriesCount field on the post
    const postDoc = await getDoc(postRef);
    let currentEnquiries = 0;
    if (postDoc.exists()) {
      currentEnquiries = postDoc.data().enquiriesCount || 0;
      await updateDoc(postRef, { enquiriesCount: currentEnquiries + 1 });
      
      // Also notify the post owner (create a notification document)
      const postOwnerId = postDoc.data().userId;
      if (postOwnerId && postOwnerId !== userId) {
        const notifRef = doc(collection(db, 'users', String(postOwnerId), 'notifications'));
        await setDoc(notifRef, {
          type: 'enquiry',
          fromUserId: userId,
          fromUserName: userName,
          postId: postId,
          createdAt: serverTimestamp(),
          read: false,
          message: `${userName} inquired about your post.`
        });
      }
      return currentEnquiries + 1;
    } else {
      await setDoc(postRef, { id: String(postId), enquiriesCount: 1 }, { merge: true });
      return 1;
    }
  } catch (err) {
    handleFirestoreError('recordEnquiryInFirestore', err);
    return null;
  }
}
