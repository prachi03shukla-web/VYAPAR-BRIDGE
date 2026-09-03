import { db, auth, storage } from '../firebase';
import { optimizeImageForPersistence, getYouTubeThumbnail, isYouTubeUrl } from '../utils/imageOptimizer';
import { uploadToCloudinary } from './cloudinaryService';
import { saveVideoBlob, getVideoBlobUrl, cacheVideoUrlInMemory, getCachedVideoUrlInMemory } from '../utils/videoStorage';
import { safeSaveUser, safeSetLocalStorage } from '../utils/safeStorage';
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
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export async function uploadFileToFirebaseStorage(
  file: File | Blob, 
  customPath?: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (!file) return '';

  // [JUGAD] 1. Compress Image client-side before uploading to make it extremely tiny
  let fileToUpload = file;
  if (file.type && file.type.startsWith('image/')) {
    try {
      const optimizedDataUrl = await optimizeImageForPersistence(file);
      if (optimizedDataUrl && optimizedDataUrl.startsWith('data:')) {
        // Convert Data URL back to a Blob
        const arr = optimizedDataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        fileToUpload = new Blob([u8arr], { type: mime });
      }
    } catch (compressErr) {
      console.warn('Client-side compression fallback:', compressErr);
    }
  }

  // 1. PRIMARY: Direct High-Speed Cloudinary CDN Upload (Bypasses Vercel payload limits, global CDN streaming)
  try {
    const cloudUrl = await uploadToCloudinary(fileToUpload, onProgress);
    if (cloudUrl && cloudUrl.startsWith('http')) {
      console.log('⚡ Cloudinary direct CDN upload succeeded:', cloudUrl);
      return cloudUrl;
    }
  } catch (cloudinaryErr) {
    console.warn('Cloudinary upload notice, proceeding to backend/firebase storage fallback:', cloudinaryErr);
  }

  // 2. SECONDARY: High-Speed Backend Stream Upload with accurate real-time XHR Progress
  try {
    const uploadViaBackend = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      const filename = (fileToUpload instanceof File && fileToUpload.name) ? fileToUpload.name : (fileToUpload.type?.includes('video') ? 'video.mp4' : 'media.jpg');
      formData.append('media', fileToUpload, filename);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && e.total > 0 && typeof onProgress === 'function') {
          const pct = Math.min(99, Math.round((e.loaded / e.total) * 100));
          onProgress(pct);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data && data.url) {
              if (typeof onProgress === 'function') onProgress(100);
              resolve(data.url);
              return;
            }
          } catch (parseErr) {
            reject(parseErr);
            return;
          }
        }
        reject(new Error(`Server upload returned status ${xhr.status}`));
      });

      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

      // 45 second timeout for large videos
      xhr.timeout = 45000;
      xhr.addEventListener('timeout', () => reject(new Error('Upload timed out')));

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });

    if (uploadViaBackend && (uploadViaBackend.startsWith('http') || uploadViaBackend.startsWith('/uploads/') || uploadViaBackend.startsWith('data:'))) {
      console.log('⚡ High-speed backend upload succeeded:', uploadViaBackend);
      return uploadViaBackend;
    }
  } catch (backendErr) {
    console.warn('Backend stream upload notice, trying Firebase Storage client direct fallback:', backendErr);
  }

  // 3. Fallback: Direct Firebase Client SDK Storage Upload with race timeout
  const ext = (fileToUpload instanceof File && fileToUpload.name) ? fileToUpload.name.split('.').pop() : (fileToUpload.type && fileToUpload.type.includes('video') ? 'mp4' : 'jpg');
  const filePath = customPath || `uploads/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  try {
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload, {
      contentType: fileToUpload.type || (ext === 'mp4' ? 'video/mp4' : 'application/octet-stream')
    });

    const downloadUrl = await Promise.race([
      new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0 && typeof onProgress === 'function') {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              onProgress(pct);
            }
          },
          (error) => {
            console.warn('Firebase Storage direct upload notice:', error?.message || error);
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('✅ Firebase Storage download URL acquired:', url);
              if (typeof onProgress === 'function') onProgress(100);
              resolve(url);
            } catch (urlErr) {
              reject(urlErr);
            }
          }
        );
      }),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Firebase Storage timeout')), 8000))
    ]);

    if (downloadUrl && downloadUrl.startsWith('http')) {
      return downloadUrl;
    }
  } catch (err) {
    console.warn('Firebase Storage client direct upload timed out or failed:', err);
  }

  // 4. Fallback: Standalone Data URL for small/medium files (< 15MB)
  if (fileToUpload.size <= 15 * 1024 * 1024) {
    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(fileToUpload);
      });
      if (dataUrl && dataUrl.startsWith('data:')) {
        if (typeof onProgress === 'function') onProgress(100);
        return dataUrl;
      }
    } catch (readErr) {
      console.warn('DataURL fallback note:', readErr);
    }
  }
  
  return '';
}

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
    if (
      !msg.includes('CANCELLED') &&
      !msg.includes('Disconnecting idle stream') &&
      !msg.includes('Database is closing') &&
      !msg.includes('The database connection is closing') &&
      !msg.includes('InvalidStateError') &&
      !msg.includes('IndexedDB') &&
      !msg.includes('indexedDb') &&
      !msg.includes('closing/hidden') &&
      !msg.includes('client is offline')
    ) {
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
    if (typeof resolvedMediaUrl === 'string' && resolvedMediaUrl.startsWith('blob:')) {
      resolvedMediaUrl = postData.persistentMediaUrl || postData.fileDataUrl || postData.mediaBase64 || postData.thumbnailUrl || '';
      if (typeof resolvedMediaUrl === 'string' && resolvedMediaUrl.startsWith('blob:')) resolvedMediaUrl = '';
    }

    let resolvedThumbnailUrl = postData.thumbnailUrl || postData.posterUrl || postData.persistentMediaUrl || resolvedMediaUrl || '';
    if (typeof resolvedThumbnailUrl === 'string' && resolvedThumbnailUrl.startsWith('blob:')) {
      resolvedThumbnailUrl = postData.persistentMediaUrl || resolvedMediaUrl || '';
      if (typeof resolvedThumbnailUrl === 'string' && resolvedThumbnailUrl.startsWith('blob:')) resolvedThumbnailUrl = '';
    }

    // Process and compress image array so total payload never exceeds Firestore 1MB limits (strictly in KB)
    let rawImagesList: any[] = Array.isArray(postData.images) ? postData.images : (Array.isArray(postData.mediaUrls) ? postData.mediaUrls : []);
    let compressedImagesList: string[] = [];
    if (rawImagesList.length > 0) {
      const topImages = rawImagesList.slice(0, 8);
      for (const imgItem of topImages) {
        if (typeof imgItem === 'string' && imgItem.trim()) {
          if (imgItem.startsWith('data:image') && imgItem.length > 85000) {
            const compressed = await optimizeImageForPersistence(imgItem, 1080, 1080, 0.70);
            compressedImagesList.push(compressed || imgItem);
          } else if (!imgItem.startsWith('blob:') && !imgItem.startsWith('indexeddb:')) {
            compressedImagesList.push(imgItem);
          }
        }
      }
    }

    if (compressedImagesList.length > 0 && !resolvedMediaUrl) {
      resolvedMediaUrl = compressedImagesList[0];
      resolvedThumbnailUrl = compressedImagesList[0];
    }

    // Compress resolved mediaUrl if it is a heavy data:image
    if (typeof resolvedMediaUrl === 'string' && resolvedMediaUrl.startsWith('data:image') && resolvedMediaUrl.length > 85000) {
      resolvedMediaUrl = await optimizeImageForPersistence(resolvedMediaUrl, 1080, 1080, 0.70);
    }
    if (typeof resolvedThumbnailUrl === 'string' && resolvedThumbnailUrl.startsWith('data:image') && resolvedThumbnailUrl.length > 85000) {
      resolvedThumbnailUrl = await optimizeImageForPersistence(resolvedThumbnailUrl, 720, 720, 0.65);
    }

    let cleanData = sanitizeForFirestore({
      ...postData,
      id: postId,
      mediaUrl: resolvedMediaUrl,
      thumbnailUrl: resolvedThumbnailUrl,
      persistentMediaUrl: postData.persistentMediaUrl || resolvedMediaUrl,
      images: compressedImagesList.length > 0 ? compressedImagesList : (resolvedMediaUrl ? [resolvedMediaUrl] : []),
      mediaUrls: compressedImagesList.length > 0 ? compressedImagesList : (resolvedMediaUrl ? [resolvedMediaUrl] : []),
      status: postData.status || 'approved',
      visibility: postData.visibility || 'public',
      updatedAt: Date.now(),
      createdAt: postData.createdAt || Date.now()
    });

    // Strip unneeded heavy temporary keys
    delete cleanData.fileDataUrl;
    delete cleanData.mediaBase64;
    delete cleanData.rawMedia;
    delete cleanData.pendingFile;
    delete cleanData.pendingReelFile;

    // Check for YouTube URLs & Video links
    const targetVideoLink = cleanData.externalLink || (cleanData.mediaUrl && isYouTubeUrl(cleanData.mediaUrl) ? cleanData.mediaUrl : '');
    if (targetVideoLink && isYouTubeUrl(targetVideoLink)) {
      const ytThumb = getYouTubeThumbnail(targetVideoLink);
      cleanData.type = 'video';
      cleanData.videoUrl = targetVideoLink;
      cleanData.video = targetVideoLink;
      cleanData.mediaUrl = targetVideoLink;
      if (!cleanData.thumbnailUrl || cleanData.thumbnailUrl.startsWith('blob:') || cleanData.thumbnailUrl.length > 100000) {
        cleanData.thumbnailUrl = ytThumb;
      }
    } else {
      const isLinkVideoCandidate = cleanData.externalLink && (
        cleanData.externalLink.includes('vimeo.com') ||
        cleanData.externalLink.includes('dailymotion.com') ||
        cleanData.externalLink.includes('tiktok.com') ||
        /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(cleanData.externalLink)
      );

      if (isLinkVideoCandidate) {
        if (!cleanData.mediaUrl) cleanData.mediaUrl = cleanData.externalLink;
        cleanData.type = 'video';
        cleanData.videoUrl = cleanData.externalLink;
        cleanData.video = cleanData.externalLink;
      }
    }

    // Audio payload safety guard: If attached music audioUrl is a massive multi-MB base64 string,
    // do not store giant raw base64 directly in Firestore (as it causes write rejections & lost stories)
    if (cleanData.music && cleanData.music.audioUrl && typeof cleanData.music.audioUrl === 'string') {
      if (cleanData.music.audioUrl.startsWith('data:audio') && cleanData.music.audioUrl.length > 100000) {
        // Keep music metadata but avoid Firestore document size crash
        cleanData.music = {
          ...cleanData.music,
          audioUrl: cleanData.music.audioUrl.slice(0, 50000) // Truncated or stored on server
        };
      }
    }

    // Video stream caching
    const videoStreamCandidate = cleanData.videoUrl || cleanData.video || (cleanData.mediaUrl && !cleanData.mediaUrl.startsWith('data:image') ? cleanData.mediaUrl : '');
    if (videoStreamCandidate) {
      cacheVideoUrlInMemory(postId, videoStreamCandidate);
    }

    if (cleanData.type === 'video' || (cleanData.mediaUrl && (cleanData.mediaUrl.startsWith('data:video') || cleanData.mediaUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i)))) {
      cleanData.type = 'video';
      
      let safeVideoThumb = cleanData.thumbnailUrl && cleanData.thumbnailUrl.startsWith('data:image') ? cleanData.thumbnailUrl : '';
      if (!safeVideoThumb) {
        safeVideoThumb = cleanData.posterUrl || cleanData.thumbnail || '';
      }
      cleanData.thumbnailUrl = safeVideoThumb;

      if (cleanData.mediaUrl && cleanData.mediaUrl.length > 500000 && cleanData.mediaUrl.startsWith('data:video')) {
        cleanData.videoUrl = cleanData.mediaUrl.length < 800000 ? cleanData.mediaUrl : '';
        cleanData.mediaUrl = cleanData.videoUrl;
        cleanData.persistentMediaUrl = '';
      } else if (cleanData.mediaUrl && cleanData.mediaUrl.startsWith('data:image')) {
        cleanData.mediaUrl = cleanData.videoUrl || '';
        cleanData.persistentMediaUrl = '';
      }
    } else if (cleanData.mediaUrl && cleanData.mediaUrl.startsWith('data:image')) {
      if (cleanData.mediaUrl.length > 250000) {
        cleanData.mediaUrl = await optimizeImageForPersistence(cleanData.mediaUrl, 800, 800, 0.65);
      }
    }

    // Double check and strip any remaining blob: or indexeddb: values from all fields
    Object.keys(cleanData).forEach(k => {
      if (typeof cleanData[k] === 'string' && (cleanData[k].startsWith('blob:') || cleanData[k].startsWith('indexeddb:'))) {
        cleanData[k] = '';
      }
    });

    // 0. Store immediately in Local Storage Cache so post is ALWAYS preserved across refreshes
    try {
      const localStr = localStorage.getItem(LOCAL_POSTS_CACHE_KEY);
      let localList = localStr ? JSON.parse(localStr) : [];
      if (!Array.isArray(localList)) localList = [];
      const filtered = localList.filter((p: any) => p && String(p.id) !== String(postId));
      safeSetLocalStorage(LOCAL_POSTS_CACHE_KEY, [cleanData, ...filtered].slice(0, 50));
    } catch (e) {}

    // Multi-tab BroadcastChannel notification
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('vyapar_posts_sync');
        bc.postMessage({ type: 'POST_SAVED', post: cleanData });
        bc.close();
      }
    } catch (e) {}

    // 1. Direct Firestore Persistence
    try {
      const postRef = doc(db, 'posts', postId);
      await setDoc(postRef, {
        ...cleanData,
        serverSyncedAt: serverTimestamp()
      }, { merge: true });
      console.log(`✅ Post synced directly to Firestore: ${postId}`);
    } catch (fsErr: any) {
      handleFirestoreError('syncPostToFirestore', fsErr);
      
      // Emergency size-reduction fallback retry if Firestore rejected the payload size
      try {
        console.warn(`🔄 Retrying Firestore setDoc with emergency compressed thumbnail for ${postId}...`);
        let miniThumb = cleanData.thumbnailUrl || cleanData.mediaUrl || '';
        if (miniThumb.startsWith('data:image')) {
          miniThumb = await optimizeImageForPersistence(miniThumb, 400, 400, 0.5);
        } else if (miniThumb.length > 100000) {
          miniThumb = '';
        }
        const postRef = doc(db, 'posts', postId);
        await setDoc(postRef, {
          ...cleanData,
          images: miniThumb ? [miniThumb] : [],
          mediaUrls: miniThumb ? [miniThumb] : [],
          mediaUrl: miniThumb,
          thumbnailUrl: miniThumb,
          persistentMediaUrl: miniThumb,
          serverSyncedAt: serverTimestamp()
        }, { merge: true });
        console.log(`✅ Emergency Firestore sync succeeded for: ${postId}`);
      } catch (retryErr) {
        handleFirestoreError('syncPost emergency retry', retryErr);
      }
    }

    return true;
  } catch (error: any) {
    handleFirestoreError('syncPostToFirestore', error);
    return true; // Local cache is already preserved
  }
}

export async function fetchPostsFromFirestore(): Promise<any[]> {
  const postsMap = new Map<string, any>();
  const activeUserId = localStorage.getItem('vyapar_user_id') || '';

  // 1. Fetch latest real-time documents from Firestore (All Posts & Members Uncapped)
  try {
    let snap;
    try {
      snap = await getDocs(collection(db, 'posts'));
    } catch (directErr) {
      const postsQuery = query(collection(db, 'posts'), limit(50));
      snap = await getDocs(postsQuery);
    }
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

    // Server fallback if local cache is still empty
    if (postsMap.size === 0) {
      try {
        const resp = await fetch('/api/posts');
        if (resp.ok) {
          const sData = await resp.json();
          const pList = sData?.posts || (Array.isArray(sData) ? sData : []);
          pList.forEach((p: any) => {
            if (p && p.id) postsMap.set(String(p.id), p);
          });
        }
      } catch (serverErr) {}
    }
  }

  // If still empty (e.g. fresh device login), query backend server API directly
  if (postsMap.size === 0) {
    try {
      const resp = await fetch('/api/posts');
      if (resp.ok) {
        const sData = await resp.json();
        const pList = sData?.posts || (Array.isArray(sData) ? sData : []);
        pList.forEach((p: any) => {
          if (p && p.id) postsMap.set(String(p.id), p);
        });
      }
    } catch (serverErr) {}
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
    safeSetLocalStorage(LOCAL_POSTS_CACHE_KEY, result.slice(0, 50));
  } catch (e) {}

  return result;
}

// 2. Real-Time Firestore Subscription Listeners (Instant Multi-Device Sync with Free Tier Optimization)

let cachedPosts = [];
let lastPostsFetch = 0;
let cachedUsers = [];
let lastUsersFetch = 0;

export function subscribeToPostsFromFirestore(callback: (posts: any[]) => void): () => void {
  try {
    const postsQuery = query(collection(db, 'posts'));

    // Fast-deliver memory cache if populated to keep UI snappy
    if (cachedPosts.length > 0) {
      setTimeout(() => callback(cachedPosts), 0);
    }

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {

      const postsMap = new Map<string, any>();
      const activeUserId = localStorage.getItem('vyapar_user_id') || '';

      // Direct snapshot mapping - authoritative source of truth
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && docSnap.id) {
          const docId = String(docSnap.id);
          const memoryVideo = getCachedVideoUrlInMemory(docId);
          const localStoredVideo = memoryVideo || (typeof localStorage !== 'undefined' ? localStorage.getItem('vyapar_video_' + docId) : null);
          
          const isExplicitImage = data.type === 'image' || data.type === 'photo' || Boolean(data.mediaUrl && (String(data.mediaUrl).startsWith('data:image') || String(data.mediaUrl).match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i)));
          
          const isVideoPost = !isExplicitImage && (
            data.type === 'video' || data.type === 'reel' ||
            Boolean(data.mediaUrl && (String(data.mediaUrl).startsWith('data:video') || String(data.mediaUrl).match(/\.(mp4|webm|mov|m4v|mkv|3gp)(\?.*)?$/i))) ||
            Boolean(data.videoUrl && !String(data.videoUrl).startsWith('data:image') && !String(data.videoUrl).match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) ||
            Boolean(data.video && !String(data.video).startsWith('data:image') && !String(data.video).match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i))
          );

          let safeMediaUrl = data.mediaUrl || data.persistentMediaUrl || data.videoUrl || '';
          let safeThumbnailUrl = data.thumbnailUrl || data.posterUrl || data.persistentMediaUrl || '';

          if (isVideoPost) {
            if (!safeMediaUrl || safeMediaUrl.startsWith('data:image') || safeMediaUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) {
              if (localStoredVideo && !localStoredVideo.startsWith('data:image')) {
                safeMediaUrl = localStoredVideo;
              } else if (data.videoUrl && !data.videoUrl.startsWith('data:image')) {
                safeMediaUrl = data.videoUrl;
              } else if (data.video && !data.video.startsWith('data:image')) {
                safeMediaUrl = data.video;
              } else {
                safeMediaUrl = '';
              }
            }
          } else {
            if (!safeMediaUrl || safeMediaUrl.startsWith('blob:') || safeMediaUrl.startsWith('indexeddb:')) {
              safeMediaUrl = data.persistentMediaUrl || data.thumbnailUrl || safeMediaUrl || '';
            }
          }

          if (safeThumbnailUrl && (safeThumbnailUrl.startsWith('blob:') || safeThumbnailUrl.startsWith('indexeddb:'))) {
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
            mediaUrl: safeMediaUrl || safeThumbnailUrl || '',
            videoUrl: isVideoPost ? (safeMediaUrl !== safeThumbnailUrl ? safeMediaUrl : (data.videoUrl || safeMediaUrl)) : undefined,
            thumbnailUrl: safeThumbnailUrl || safeMediaUrl || '',
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

      const now = Date.now();
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
        safeSetLocalStorage(LOCAL_POSTS_CACHE_KEY, result.slice(0, 50)); 
      } catch (e) {}
      
      cachedPosts = result as any;
      lastPostsFetch = Date.now();
      callback(result);
    }, (error: any) => {
      if (error?.message?.includes('Quota') || error?.code === 'resource-exhausted') {
        console.warn('Firestore real-time posts: Free daily read units limit reached. Local cache active.');
      } else if (error?.code === 'cancelled' || error?.message?.includes('CANCELLED') || error?.message?.includes('Disconnecting idle stream')) {
        // Normal gRPC stream lifecycle event when idle, ignore
      } else {
        console.warn('Firestore real-time posts subscription note:', error);
      }

      // Safe immediate delivery of cached or server posts so screen is NEVER blank
      try {
        const localStr = localStorage.getItem(LOCAL_POSTS_CACHE_KEY);
        if (localStr) {
          const parsed = JSON.parse(localStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            callback(parsed);
          }
        }
      } catch (e) {}

      // Safe background fetch from /api/posts
      fetch('/api/posts')
        .then(async (r) => {
          const ct = r.headers.get('content-type');
          if (r.ok && ct && ct.includes('application/json')) {
            return r.json();
          }
          return null;
        })
        .then((d) => {
          if (!d) return;
          const serverPosts = d?.posts || (Array.isArray(d) ? d : []);
          if (serverPosts && serverPosts.length > 0) {
            callback(serverPosts);
          }
        })
        .catch(() => {});
    });

    // Cross-tab BroadcastChannel listener for instant real-time synchronization
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('vyapar_posts_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'POST_SAVED' && event.data?.post) {
            const newP = event.data.post;
            const curStr = localStorage.getItem(LOCAL_POSTS_CACHE_KEY);
            let curList: any[] = curStr ? JSON.parse(curStr) : [];
            if (!Array.isArray(curList)) curList = [];
            const filtered = curList.filter((p: any) => p && String(p.id) !== String(newP.id));
            const updated = [newP, ...filtered];
            safeSetLocalStorage(LOCAL_POSTS_CACHE_KEY, updated.slice(0, 50));
            callback(updated);
          }
        };
      }
    } catch (e) {}

    return () => {
      try { unsubscribe(); } catch (e) {}
      try { bc?.close(); } catch (e) {}
    };
  } catch (err) {
    console.warn('Real-time posts listener setup note:', err);
    return () => {};
  }
}

export function subscribeToUsersFromFirestore(callback: (users: any[]) => void): () => void {
  try {
    // 1. Immediately deliver local cache / memory cache if present
    if (cachedUsers.length > 0) {
      setTimeout(() => callback(cachedUsers), 0);
    } else {
      try {
        const localStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
        if (localStr) {
          const parsed = JSON.parse(localStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            callback(parsed);
          }
        }
      } catch (e) {}
    }

    // 2. Fetch authoritative merged users asynchronously (Firestore + local storage + /api/users)
    fetchAllUsersFromFirestore().then((allUsers) => {
      if (Array.isArray(allUsers) && allUsers.length > 0) {
        cachedUsers = allUsers;
        lastUsersFetch = Date.now();
        callback(allUsers);
      }
    }).catch(() => {});

    // 3. Setup Firestore real-time listener if available
    const usersQuery = query(collection(db, 'users'));
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const list: any[] = [];
        const deletedSet = getDeletedUserIds();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && docSnap.id) {
            const uId = String(data.id || docSnap.id);
            if (!deletedSet.has(uId)) {
              list.push({ ...data, id: uId });
            }
          }
        });

        // Merge with local cached users
        const map = new Map<string, any>();
        list.forEach(u => map.set(String(u.id), u));

        try {
          const localStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
          if (localStr) {
            const localList = JSON.parse(localStr);
            if (Array.isArray(localList)) {
              localList.forEach(u => {
                if (u && u.id && !deletedSet.has(String(u.id)) && !map.has(String(u.id))) {
                  map.set(String(u.id), u);
                }
              });
            }
          }
        } catch (e) {}

        const merged = Array.from(map.values());
        updateCachedUsers(merged);
        cachedUsers = merged;
        lastUsersFetch = Date.now();
        callback(merged);
      }, (error: any) => {
        if (error?.message?.includes('Quota') || error?.code === 'resource-exhausted') {
          console.warn('Firestore real-time users: Free daily read quota reached. Using cached & local directory.');
        }
        fetchAllUsersFromFirestore().then(fallbackUsers => {
          if (Array.isArray(fallbackUsers) && fallbackUsers.length > 0) {
            callback(fallbackUsers);
          }
        }).catch(() => {});
      });
    } catch (listenerErr) {
      console.warn('Real-time users listener setup note:', listenerErr);
    }

    // 4. Cross-tab BroadcastChannel listener for instant user synchronization
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('vyapar_users_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'USER_SYNCED' && event.data?.user) {
            const newUser = event.data.user;
            fetchAllUsersFromFirestore().then(updatedUsers => {
              callback(updatedUsers);
            }).catch(() => {});
          }
        };
      }
    } catch (e) {}

    return () => {
      try { unsubscribe(); } catch (e) {}
      try { bc?.close(); } catch (e) {}
    };
  } catch (err) {
    console.warn('subscribeToUsersFromFirestore error:', err);
    fetchAllUsersFromFirestore().then(fallbackUsers => {
      if (Array.isArray(fallbackUsers)) callback(fallbackUsers);
    }).catch(() => {});
    return () => {};
  }
}


let cachedPayments = [];
let lastPaymentsFetch = 0;

export function subscribeToPaymentsFromFirestore(callback: (payments: any[]) => void): () => void {
  try {
    const payRef = collection(db, 'payments');

    const now = Date.now();
    if (cachedPayments.length > 0 && now - lastPaymentsFetch < 300000) {
      setTimeout(() => callback(cachedPayments), 0);
      return () => {};
    }
    getDocs(payRef).then((snapshot) => {

      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data) {
          list.push({ ...data, id: docSnap.id });
        }
      });

      try { localStorage.setItem('tileance_payments_cache', JSON.stringify(list)); } catch (e) {}
      cachedPayments = list;
      lastPaymentsFetch = Date.now();
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
    }).catch(err => console.warn(err));
    return () => {};
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

      // Also store the reference text link (ID) in the user's profile to keep database size small
      try {
        const userRef = doc(db, 'users', String(userId));
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          let savedPostIds = Array.isArray(userData.savedPostIds) ? userData.savedPostIds : [];
          if (isNowSaved) {
            if (!savedPostIds.includes(pId)) savedPostIds.push(pId);
          } else {
            savedPostIds = savedPostIds.filter(id => String(id) !== pId);
          }
          await updateDoc(userRef, { savedPostIds, updatedAt: serverTimestamp() });
        }
      } catch (userErr) {
        console.warn('Could not update user savedPostIds reference link', userErr);
      }

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

      // Also store the reference text link (ID) in the user's profile to keep database size small
      try {
        const userRef = doc(db, 'users', String(userId));
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          let savedPostIds = Array.isArray(userData.savedPostIds) ? userData.savedPostIds : [];
          if (isNowSaved) {
            if (!savedPostIds.includes(pId)) savedPostIds.push(pId);
          } else {
            savedPostIds = savedPostIds.filter(id => String(id) !== pId);
          }
          await updateDoc(userRef, { savedPostIds, updatedAt: serverTimestamp() });
        }
      } catch (userErr) {
        console.warn('Could not update user savedPostIds reference link', userErr);
      }

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
  const pId = String(postId);
  const localCommentsKey = 'vyapar_comments_' + pId;
  
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
    const commentsRef = collection(db, 'posts', pId, 'comments');
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
      try {
        localStorage.setItem(localCommentsKey, JSON.stringify(liveComments));
      } catch (e) {}
      callback(liveComments);
    }, (err) => {
      console.warn('Firestore comments snapshot notice:', err);
      // Fallback one-time fetch
      getDocs(q).then((snap) => {
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
          callback(liveComments);
        }
      }).catch(() => {});
    });
  } catch (err) {
    console.warn('Error setting up comments listener:', err);
    return () => {};
  }
}

export async function deleteCommentFromFirestore(postId: string | number, commentId: string) {
  try {
    const pId = String(postId);
    const cRef = doc(db, 'posts', pId, 'comments', String(commentId));
    await deleteDoc(cRef);
    
    // Decrement commentsCount on post
    try {
      const postRef = doc(db, 'posts', pId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const currentCount = postSnap.data().commentsCount || 0;
        await updateDoc(postRef, { commentsCount: Math.max(0, currentCount - 1) });
      }
    } catch (e) {}
    
    // Update local cache
    try {
      const localCommentsKey = 'vyapar_comments_' + pId;
      const cached = localStorage.getItem(localCommentsKey);
      if (cached) {
        const list = JSON.parse(cached);
        const filtered = list.filter((c: any) => c.id !== commentId);
        localStorage.setItem(localCommentsKey, JSON.stringify(filtered));
      }
    } catch (e) {}
    return true;
  } catch (err) {
    handleFirestoreError('deleteComment', err);
    return false;
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

    // 1. Instant Master Admin Recognition (manit, 5503, admin, or phone 9889104477)
    const isAdminUserMatch = 
      cleanInput === 'manit' || 
      cleanInput === 'manit 5503' || 
      cleanInput === 'manit5503' || 
      cleanInput === '5503' || 
      cleanInput === 'admin' || 
      cleanInput === 'admin_manit_1' || 
      cleanInput === '9889104477' || 
      cleanInput === 'ashishkumarverma4477@gmail.com';

    const isValidAdminPass = 
      cleanPassword === '5503' || 
      cleanPassword === 'admin' || 
      cleanPassword === 'admin1234@#' || 
      cleanPassword === '123456';

    if (isAdminUserMatch && isValidAdminPass) {
      const masterAdmin = {
        id: 'admin_manit_1',
        username: 'manit',
        name: 'Vyapar Bridge Admin (Manit)',
        companyName: 'Vyapar Bridge Enterprise',
        role: 'admin',
        isAdmin: true,
        category: 'IT Software Developer SaaS Model Apps and Logic Founder',
        isVerified: true,
        verifiedBadge: true,
        goldenBadge: true,
        verifiedPlan: 'yearly',
        bio: 'Vyapar Bridge Master Developer & System Administrator',
        phone: '9889104477',
        email: 'ashishkumarverma4477@gmail.com',
        address: 'Lal Bangla Kanpur Post Harjindar Nagar 208007',
        city: 'Kanpur',
        state: 'Uttar Pradesh',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        membershipType: 'yearly',
        password: cleanPassword,
        createdAt: Date.now()
      };
      
      // Auto-persist to localStorage & sync to Firestore
      try {
        localStorage.setItem('user', JSON.stringify(masterAdmin));
        localStorage.setItem('Vyapar Bridge_user', JSON.stringify(masterAdmin));
        const userRef = doc(db, 'users', 'admin_manit_1');
        setDoc(userRef, masterAdmin, { merge: true }).catch(() => {});
      } catch {}

      return { success: true, user: masterAdmin };
    }

    // Query Firestore users collection
    const usersRef = collection(db, 'users');
    
    // Retry logic: Firestore might be still syncing the new user
    let snap;
    for (let i = 0; i < 3; i++) {
        snap = await getDocs(usersRef);
        let matched = false;
        snap.forEach((docSnap) => {
            const u = docSnap.data();
            const uName = (u.username || '').trim().toLowerCase();
            const uPhone = (u.phone || '').trim();
            const uEmail = (u.email || '').trim().toLowerCase();
            const uId = String(u.id || '').trim().toLowerCase();
            
            if (uName === cleanInput || uPhone === cleanInput || uEmail === cleanInput || uId === cleanInput) {
                matched = true;
            }
        });
        if (matched) break;
        await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
    }

    let matchedUser: any = null;
    snap?.forEach((docSnap) => {
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
          safeSaveUser(parsed);
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
export async function userChangeOwnPassword(userId: string | number, currentPass: string, newPass: string, cachedOldPass?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanId = String(userId).trim();
    const cleanCurrent = currentPass.trim();
    const cleanNew = newPass.trim();

    if (!cleanId) return { success: false, error: 'User not logged in.' };
    if (!cleanNew || cleanNew.length < 4) return { success: false, error: 'New password must be at least 4 characters.' };

    // 1. Verify current password (using cached password to avoid Firebase Read Quota!)
    if (cachedOldPass && cachedOldPass !== cleanCurrent) {
      return { success: false, error: 'Incorrect current password (वर्तमान पासवर्ड गलत है)!' };
    } else if (!cachedOldPass) {
      // Fallback to Firestore ONLY if cached password is not provided (to save quota)
      try {
        const userRef = doc(db, 'users', cleanId);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.password && data.password !== cleanCurrent) {
            return { success: false, error: 'Incorrect current password (वर्तमान पासवर्ड गलत है)!' };
          }
        }
      } catch (e: any) {
        console.warn("Could not verify password via Firestore (Quota exceeded?), trusting currentPass match if possible", e);
      }
    }

    // 2. Update Firebase Authentication (Developer Console) if user is logged in via Auth
    if (auth.currentUser) {
      try {
        const { updatePassword } = await import('firebase/auth');
        await updatePassword(auth.currentUser, cleanNew);
      } catch (authErr: any) {
        console.error("Firebase Auth update password failed. Note: Re-authentication might be required.", authErr);
        // We will proceed to update Firestore even if Firebase Auth fails due to "requires-recent-login"
        // as we want to keep the custom app DB synced.
      }
    }

    // 3. Update Firestore with new password
    const userRef = doc(db, 'users', cleanId);
    await setDoc(userRef, {
      password: cleanNew,
      passwordUpdatedAt: Date.now()
    }, { merge: true });

    // 4. Update localStorage
    try {
      const localUserStr = localStorage.getItem('user') || localStorage.getItem('Vyapar Bridge_user');
      if (localUserStr) {
        const parsed = JSON.parse(localUserStr);
        if (String(parsed.id) === cleanId) {
          parsed.password = cleanNew;
          safeSaveUser(parsed);
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

    // Ensure Golden Badge status is permanently locked and never reverted
    const isGoldUser = Boolean(
      userData.goldenBadge === true ||
      userData.verifiedPlan === 'yearly' ||
      userData.verifiedPlan === '1_year_pro' ||
      userData.subscriptionPlan === 'yearly' ||
      userData.subscriptionPlan === '1_year_pro' ||
      userData.plan === 'yearly' ||
      (typeof userData.subscriptionAmount === 'number' && userData.subscriptionAmount >= 1188) ||
      localStorage.getItem(`vyapar_sticky_gold_${uId.toLowerCase()}`) === 'true' ||
      uId === 'admin_manit_1' ||
      userData.username === 'manit' ||
      userData.role === 'admin'
    );

    if (isGoldUser) {
      cleanData.goldenBadge = true;
      cleanData.isVerified = true;
      cleanData.verifiedBadge = true;
      cleanData.verifiedPlan = 'yearly';
      cleanData.plan = 'yearly';
      cleanData.subscriptionPlan = 'yearly';
      try {
        localStorage.setItem(`vyapar_sticky_gold_${uId.toLowerCase()}`, 'true');
        if (cleanData.name) {
          localStorage.setItem(`vyapar_sticky_gold_name_${cleanData.name.trim().toLowerCase()}`, 'true');
        }
      } catch (e) {}
    }

    // Force exact custom admin details requested by user (respecting any user-provided updates)
    if (uId === 'admin_manit_1' || userData.username === 'manit' || userData.role === 'admin' || userData.phone === '9889104477' || userData.email === 'ashishkumarverma4477@gmail.com') {
      cleanData.name = userData.name || cleanData.name || 'Vyapar Bridge Admin';
      cleanData.category = userData.category || cleanData.category || 'IT Software Developer SaaS Model Apps and Logic Founder';
      cleanData.phone = userData.phone || cleanData.phone || '9889104477';
      cleanData.email = userData.email || cleanData.email || 'ashishkumarverma4477@gmail.com';
      cleanData.address = userData.address || cleanData.address || 'Lal Bangla Kanpur Post Harjindar Nagar 208007';
      cleanData.city = userData.city || cleanData.city || 'Kanpur';
      cleanData.state = userData.state || cleanData.state || 'Uttar Pradesh';
      cleanData.role = 'admin';
      cleanData.goldenBadge = true;
      cleanData.isVerified = true;
      cleanData.verifiedBadge = true;
      cleanData.verifiedPlan = 'yearly';
      cleanData.plan = 'yearly';
      cleanData.subscriptionPlan = 'yearly';
    }

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
      if (Array.isArray(cachedUsers)) {
        cachedUsers = cachedUsers.map(u => {
          if (String(u.id) === uId) {
            return { ...u, ...cleanData };
          }
          return u;
        });
        if (!cachedUsers.some(u => String(u.id) === uId)) {
          cachedUsers.push(cleanData);
        }
      }
      const existingStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
      let list: any[] = existingStr ? JSON.parse(existingStr) : [];
      if (!Array.isArray(list)) list = [];
      const filtered = list.filter(u => String(u.id) !== uId);
      safeSetLocalStorage(LOCAL_USERS_CACHE_KEY, [cleanData, ...filtered].slice(0, 50));
    } catch (localErr) {
      console.warn('Local users cache backup note:', localErr);
    }

    // 2. Direct Firestore Persistence
    try {
      const userRef = doc(db, 'users', uId);
      await setDoc(userRef, {
        ...cleanData,
        serverSyncedAt: serverTimestamp()
      }, { merge: true });
      console.log(`✅ User profile synced to Firestore: ${uId}`);
    } catch (fsErr) {
      console.warn('Firestore syncUser notice (using server & local fallback):', fsErr);
    }

    // 3. Sync to Node.js backend server API
    try {
      fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: cleanData })
      }).catch(() => {});
    } catch (e) {}

    // 4. Broadcast to other open tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('vyapar_users_sync');
        bc.postMessage({ type: 'USER_SYNCED', user: cleanData });
        bc.close();
      }
    } catch (e) {}

    return true;
  } catch (err) {
    console.warn('syncUserToFirestore error:', err);
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
  }

  // Always merge local cached users so no previously connected user is lost
  try {
    const localStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
    if (localStr) {
      const localList = JSON.parse(localStr);
      if (Array.isArray(localList)) {
        localList.forEach(u => {
          if (u && (u.id || u.username) && (u.name || u.username)) {
            const uId = String(u.id || u.username);
            if (!deletedSet.has(uId) && !deletedSet.has(String(u.username || '')) && !deletedSet.has(String(u.id || ''))) {
              const existing = usersMap.get(uId) || {};
              const isGold = Boolean(
                existing.goldenBadge ||
                u.goldenBadge ||
                existing.verifiedPlan === 'yearly' ||
                u.verifiedPlan === 'yearly' ||
                localStorage.getItem(`vyapar_sticky_gold_${uId.toLowerCase()}`) === 'true'
              );
              usersMap.set(uId, {
                ...u,
                ...existing,
                id: uId,
                goldenBadge: isGold || existing.goldenBadge || u.goldenBadge,
                isVerified: isGold || Boolean(existing.isVerified || u.isVerified),
                verifiedPlan: isGold ? 'yearly' : (existing.verifiedPlan || u.verifiedPlan)
              });
            }
          }
        });
      }
    }
  } catch (e) {}

  // Current logged in user
  try {
    const curUserStr = localStorage.getItem('user') || localStorage.getItem('Vyapar Bridge_user');
    if (curUserStr) {
      const curUser = JSON.parse(curUserStr);
      if (curUser && (curUser.id || curUser.username) && (curUser.name || curUser.username)) {
        const uId = String(curUser.id || curUser.username);
        if (!deletedSet.has(uId) && !deletedSet.has(String(curUser.username || '')) && !deletedSet.has(String(curUser.id || ''))) {
          const existing = usersMap.get(uId) || {};
          const isGold = Boolean(
            existing.goldenBadge ||
            curUser.goldenBadge ||
            existing.verifiedPlan === 'yearly' ||
            curUser.verifiedPlan === 'yearly' ||
            localStorage.getItem(`vyapar_sticky_gold_${uId.toLowerCase()}`) === 'true'
          );
          usersMap.set(uId, {
            ...curUser,
            ...existing,
            id: uId,
            goldenBadge: isGold || existing.goldenBadge || curUser.goldenBadge,
            isVerified: isGold || Boolean(existing.isVerified || curUser.isVerified),
            verifiedPlan: isGold ? 'yearly' : (existing.verifiedPlan || curUser.verifiedPlan)
          });
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
                const isGold = Boolean(
                  existing.goldenBadge ||
                  u.goldenBadge ||
                  existing.verifiedPlan === 'yearly' ||
                  u.verifiedPlan === 'yearly' ||
                  localStorage.getItem(`vyapar_sticky_gold_${uId.toLowerCase()}`) === 'true'
                );
                usersMap.set(uId, {
                  ...existing,
                  ...u,
                  id: uId,
                  goldenBadge: isGold || existing.goldenBadge || u.goldenBadge,
                  isVerified: isGold || Boolean(existing.isVerified || u.isVerified),
                  verifiedPlan: isGold ? 'yearly' : (existing.verifiedPlan || u.verifiedPlan)
                });
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
    safeSetLocalStorage(LOCAL_USERS_CACHE_KEY, result.slice(0, 50));
  } catch (e) {}
  return result;
}

export async function deletePostFromFirestore(postId: string | number): Promise<boolean> {
  try {
    const pId = String(postId);

    // Update in-memory cache immediately
    if (Array.isArray(cachedPosts)) {
      cachedPosts = cachedPosts.filter(p => String(p?.id || p?.postId || '') !== pId);
    }

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

export async function deleteUserFromFirestore(userId: string | number, extraIdentifiers?: { username?: string; phone?: string; email?: string; fingerprintId?: string }): Promise<boolean> {
  try {
    const uId = String(userId);
    const uUname = extraIdentifiers?.username ? String(extraIdentifiers.username).toLowerCase() : '';
    const uPhone = extraIdentifiers?.phone ? String(extraIdentifiers.phone).trim() : '';
    const uFingerprint = extraIdentifiers?.fingerprintId ? String(extraIdentifiers.fingerprintId).trim() : '';

    // 1. Immediately mark deleted locally to protect UI & cache
    markUserDeletedLocally(uId);
    if (uUname) markUserDeletedLocally(uUname);
    if (uFingerprint) markUserDeletedLocally(uFingerprint);

    // 2. Direct deletion of user doc by ID
    const userRef = doc(db, 'users', uId);
    const deleteUserDocPromise = deleteDoc(userRef).catch(err => {
      console.warn('deleteDoc user error:', err);
    });

    // 3. Scan & delete any user docs matching id, username, phone, or fingerprint
    const deleteUserQueryPromise = (async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const matchedUserDocs = usersSnap.docs.filter(d => {
          if (d.id === uId || d.id === uUname) return true;
          const data = d.data();
          const dId = String(data.id || '');
          const dUname = String(data.username || '').toLowerCase();
          const dPhone = String(data.phone || '').trim();
          const dFingerprint = String(data.fingerprintId || '').trim();
          return dId === uId || (uUname && dUname === uUname) || (uPhone && dPhone === uPhone) || (uFingerprint && dFingerprint === uFingerprint);
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
          const pFingerprint = String(data.fingerprintId || data.user?.fingerprintId || '').trim();
          return pUserId === uId || (uUname && pUserName === uUname) || (uFingerprint && pFingerprint === uFingerprint);
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
  validityDays: number = 365,
  options?: {
    goldenBadge?: boolean;
    subscriptionAmount?: number;
    activeFreeOneYearPlan?: boolean;
  }
): Promise<boolean> {
  try {
    const uId = String(userId);
    const now = Date.now();
    const expiresAt = isVerified ? now + (validityDays * 24 * 60 * 60 * 1000) : null;
    
    const updatePayload: any = {
      isVerified,
      verifiedPlan: isVerified ? plan : null,
      plan: isVerified ? plan : null,
      subscriptionPlan: isVerified ? plan : null,
      verifiedAt: isVerified ? now : null,
      expiresAt,
      validityDays: isVerified ? validityDays : null,
      verifiedBadge: isVerified
    };

    if (options) {
      if (options.goldenBadge !== undefined) updatePayload.goldenBadge = options.goldenBadge;
      if (options.subscriptionAmount !== undefined) updatePayload.subscriptionAmount = options.subscriptionAmount;
      if (options.activeFreeOneYearPlan !== undefined) updatePayload.activeFreeOneYearPlan = options.activeFreeOneYearPlan;
    }

    // Update local user cache
    try {
      if (Array.isArray(cachedUsers)) {
        cachedUsers = cachedUsers.map(u => {
          if (String(u.id) === uId) {
            return { ...u, ...updatePayload };
          }
          return u;
        });
      }
      const existingStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
      if (existingStr) {
        const list: any[] = JSON.parse(existingStr);
        if (Array.isArray(list)) {
          const updated = list.map(u => {
            if (String(u.id) === uId) {
              return { ...u, ...updatePayload };
            }
            return u;
          });
          safeSetLocalStorage(LOCAL_USERS_CACHE_KEY, updated.slice(0, 50));
        }
      }
    } catch (e) {}

    if (isFirestoreQuotaExhausted) return true;

    await setDoc(doc(db, 'users', uId), updatePayload, { merge: true });

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

export async function submitAdRatingToFirestore(ratingData: {
  id?: string;
  adId: string;
  rating: number;
  fingerprintId: string;
  companyName?: string;
  userName?: string;
  userRole?: string;
  userCity?: string;
  userId?: string | null;
  timestamp?: number;
}) {
  try {
    const rateId = ratingData.id || `rate_${ratingData.adId}_${ratingData.fingerprintId}`;
    const ratingDoc = {
      id: rateId,
      adId: String(ratingData.adId),
      companyName: ratingData.companyName || 'Brand Partner',
      rating: Number(ratingData.rating) || 5,
      fingerprintId: ratingData.fingerprintId,
      userName: ratingData.userName || 'Verified Trader',
      userRole: ratingData.userRole || 'buyer',
      userCity: ratingData.userCity || 'India',
      userId: ratingData.userId || null,
      timestamp: ratingData.timestamp || Date.now(),
      createdAt: serverTimestamp()
    };

    if (isFirestoreQuotaExhausted) {
      return { success: true, rating: ratingDoc };
    }

    // 1. Save in individual rating log
    await setDoc(doc(db, 'brand_ad_ratings', rateId), ratingDoc, { merge: true });

    // 2. Update advertisement parent document with ratings list & calculated average
    const adDocRef = doc(db, 'advertisements', String(ratingData.adId));
    const adSnap = await getDoc(adDocRef);
    if (adSnap.exists()) {
      const adData = adSnap.data();
      const existingList = Array.isArray(adData.ratingsList) ? adData.ratingsList : [];
      const idx = existingList.findIndex((r: any) => r.fingerprintId === ratingData.fingerprintId);
      if (idx >= 0) {
        existingList[idx] = ratingDoc;
      } else {
        existingList.unshift(ratingDoc);
      }
      const uniqueFPs = new Set(existingList.map((r: any) => r.fingerprintId || r.userId));
      const count = uniqueFPs.size;
      const sum = existingList.reduce((acc: number, cur: any) => acc + (Number(cur.rating) || 5), 0);
      const avg = count > 0 ? (sum / count).toFixed(1) : '5.0';

      await setDoc(adDocRef, {
        ratingCount: count,
        totalRating: sum,
        rating: avg,
        ratingsList: existingList.slice(0, 100),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    return { success: true, rating: ratingDoc };
  } catch (err) {
    handleFirestoreError('submitAdRating', err);
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
          safeSetLocalStorage(LOCAL_USERS_CACHE_KEY, updated.slice(0, 50));
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
