import { db, auth } from '../firebase';
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
    
    // Ensure mediaUrl is a persistent cloud/data URL, not an ephemeral local /uploads link
    let resolvedMediaUrl = postData.mediaUrl || '';
    if (resolvedMediaUrl.startsWith('/uploads') || resolvedMediaUrl.startsWith('blob:')) {
      resolvedMediaUrl = postData.persistentMediaUrl || postData.fileDataUrl || postData.mediaBase64 || postData.thumbnailUrl || resolvedMediaUrl;
    }

    const cleanData = sanitizeForFirestore({
      ...postData,
      id: postId,
      mediaUrl: resolvedMediaUrl,
      updatedAt: Date.now(),
      createdAt: postData.createdAt || Date.now()
    });

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

    // 2. Direct Firestore Persistence
    const postRef = doc(db, 'posts', postId);
    await setDoc(postRef, {
      ...cleanData,
      serverSyncedAt: serverTimestamp()
    }, { merge: true });
    
    console.log(`✅ Post synced directly to Firestore: ${postId}`);
    return true;
  } catch (error) {
    console.warn('Firestore syncPost error:', error);
    return false;
  }
}

export async function fetchPostsFromFirestore(): Promise<any[]> {
  const postsMap = new Map<string, any>();

  // 1. Load from local cache first for zero-latency display
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

  // 2. Load latest real-time documents from Firestore
  try {
    const snap = await getDocs(collection(db, 'posts'));
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && docSnap.id) {
        const existing = postsMap.get(String(docSnap.id)) || {};
        postsMap.set(String(docSnap.id), { ...existing, ...data, id: docSnap.id });
      }
    });
  } catch (error) {
    console.warn('Firestore fetchPosts note:', error);
  }

  const result = Array.from(postsMap.values())
    .filter(p => {
      if (!p) return false;
      const media = String(p.mediaUrl || p.thumbnailUrl || '');
      if (media.startsWith('blob:')) return false;
      if (p.description === 'My tree' || p.title === 'Tree' || p.id === 'post_admin_1787027595927' || p.id === 'post_admin_1787027350660') return false;
      return true;
    })
    .sort((a, b) => {
      const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
      const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

  // Update local cache with merged freshest state
  try {
    localStorage.setItem(LOCAL_POSTS_CACHE_KEY, JSON.stringify(result.slice(0, 100)));
  } catch (e) {}

  return result;
}

// 2. Real-Time Firestore Subscription Listeners (Instant Multi-Device Sync for Free Vercel Deployments)
export function subscribeToPostsFromFirestore(callback: (posts: any[]) => void): () => void {
  try {
    const postsRef = collection(db, 'posts');
    return onSnapshot(postsRef, (snapshot) => {
      const postsMap = new Map<string, any>();

      // Load baseline from local cache
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

      // Deep merge real-time snapshot documents over baseline
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && docSnap.id) {
          const existing = postsMap.get(String(docSnap.id)) || {};
          postsMap.set(String(docSnap.id), { ...existing, ...data, id: docSnap.id });
        }
      });

      const result = Array.from(postsMap.values())
        .filter(p => {
          if (!p) return false;
          const media = String(p.mediaUrl || p.thumbnailUrl || '');
          if (media.startsWith('blob:')) return false;
          if (p.description === 'My tree' || p.title === 'Tree' || p.id === 'post_admin_1787027595927' || p.id === 'post_admin_1787027350660') return false;
          return true;
        })
        .sort((a, b) => {
          const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
          const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

      if (result.length > 0) {
        try { localStorage.setItem(LOCAL_POSTS_CACHE_KEY, JSON.stringify(result.slice(0, 100))); } catch (e) {}
      }
      callback(result);
    }, (error) => {
      console.warn('Firestore real-time posts subscription note:', error);
    });
  } catch (err) {
    console.warn('Real-time posts listener setup note:', err);
    return () => {};
  }
}

export function subscribeToUsersFromFirestore(callback: (users: any[]) => void): () => void {
  try {
    const usersRef = collection(db, 'users');
    return onSnapshot(usersRef, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data) {
          list.push({ ...data, id: docSnap.id });
        }
      });
      callback(list);
    }, (error) => {
      console.warn('Firestore real-time users subscription note:', error);
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
      callback(list);
    }, (error) => {
      console.warn('Firestore real-time payments subscription note:', error);
    });
  } catch (err) {
    console.warn('Real-time payments listener setup note:', err);
    return () => {};
  }
}

// 3. Inquiries / Requirements
export async function submitRequirementToFirestore(reqData: FirestoreInquiry) {
  try {
    await addDoc(collection(db, 'requirements'), {
      ...reqData,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.warn('Firestore submitRequirement note:', error);
    return false;
  }
}

// 4. Platform Feedback / Rating
export async function submitFeedbackToFirestore(feedbackData: any) {
  try {
    await addDoc(collection(db, 'feedback'), {
      ...feedbackData,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.warn('Firestore submitFeedback note:', error);
    return false;
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
  try {
    const paymentId = `pay_${Date.now()}`;
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
    console.warn('Firestore payment submission note:', error);
    return { success: true, paymentId: `pay_${Date.now()}` };
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
    console.warn('Firestore getAdminSettings note:', error);
  }
  return null;
}

export async function saveAdminSettingsToFirestore(settingsData: any) {
  try {
    const settingsRef = doc(db, 'system', 'adminSettings');
    await setDoc(settingsRef, {
      ...settingsData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore saveAdminSettings note:', error);
    return false;
  }
}

// 7. Post & Reel Interactions Direct Firestore Handlers (Client-Side Compatible)
export async function likePostInFirestore(postId: string | number, userId: string | number, wasLiked: boolean, fullPost?: any) {
  try {
    const pId = String(postId);
    const postRef = doc(db, 'posts', pId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const data = postSnap.data();
      const likedBy = Array.isArray(data.likedBy) ? data.likedBy : [];
      const currentLikes = typeof data.likesCount === 'number' && data.likesCount > 0 
        ? data.likesCount 
        : likedBy.length;
      let newCount = currentLikes;
      let newLikedBy = [...likedBy];

      if (wasLiked) {
        newCount = Math.max(0, currentLikes - 1);
        newLikedBy = newLikedBy.filter(id => String(id) !== String(userId));
      } else {
        newCount = currentLikes + 1;
        if (!newLikedBy.includes(String(userId))) {
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

      return { success: true, isLiked: !wasLiked, likesCount: newCount };
    } else {
      const newCount = wasLiked ? 0 : 1;
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
      return { success: true, isLiked: !wasLiked, likesCount: newCount };
    }
  } catch (err) {
    console.warn('Firestore likePost note:', err);
    return null;
  }
}

export async function savePostInFirestore(postId: string | number, userId: string | number, wasSaved: boolean, fullPost?: any) {
  try {
    const pId = String(postId);
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
        if (!newSavedBy.includes(String(userId))) {
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

      return { success: true, isSaved: !wasSaved, savedCount: newCount };
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
      return { success: true, isSaved: !wasSaved, savedCount: newCount };
    }
  } catch (err) {
    console.warn('Firestore savePost note:', err);
    return null;
  }
}

export async function addCommentToFirestore(postId: string | number, commentData: any) {
  try {
    const commentsRef = collection(db, 'posts', String(postId), 'comments');
    const newComment = {
      ...commentData,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };
    const docRef = await addDoc(commentsRef, newComment);

    const postRef = doc(db, 'posts', String(postId));
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentCount = postSnap.data().commentsCount || 0;
      await updateDoc(postRef, { commentsCount: currentCount + 1 });
    } else {
      await setDoc(postRef, { id: String(postId), commentsCount: 1 }, { merge: true });
    }

    return { id: docRef.id, ...newComment };
  } catch (err) {
    console.warn('Firestore addComment note:', err);
    return null;
  }
}

export async function fetchCommentsFromFirestore(postId: string | number) {
  try {
    const commentsRef = collection(db, 'posts', String(postId), 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    const comments: any[] = [];
    snap.forEach((docSnap) => {
      comments.push({ id: docSnap.id, ...docSnap.data() });
    });
    return comments;
  } catch (err) {
    console.warn('Firestore fetchComments note:', err);
    return [];
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
    console.warn('Firestore followUser note:', err);
    return null;
  }
}

export async function recordViewInFirestore(postId: string | number) {
  try {
    const postRef = doc(db, 'posts', String(postId));
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentViews = postSnap.data().viewsCount || 0;
      await updateDoc(postRef, { viewsCount: currentViews + 1 });
      return currentViews + 1;
    } else {
      await setDoc(postRef, { id: String(postId), viewsCount: 1 }, { merge: true });
      return 1;
    }
  } catch (err) {
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
    const cleanData = sanitizeForFirestore({
      ...userData,
      id: uId,
      updatedAt: Date.now()
    });

    // 1. Instant Local Storage Backup
    try {
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

    return true;
  } catch (err) {
    console.warn('Firestore syncUser note:', err);
    return false;
  }
}

export async function fetchAllUsersFromFirestore(): Promise<any[]> {
  const usersMap = new Map<string, any>();

  // 1. Load from local cache first
  try {
    const localStr = localStorage.getItem(LOCAL_USERS_CACHE_KEY);
    if (localStr) {
      const localList = JSON.parse(localStr);
      if (Array.isArray(localList)) {
        localList.forEach(u => {
          if (u && (u.id || u.username) && (u.name || u.username)) {
            const uId = String(u.id || u.username);
            usersMap.set(uId, u);
          }
        });
      }
    }
    const curUserStr = localStorage.getItem('user') || localStorage.getItem('Vyapar Bridge_user');
    if (curUserStr) {
      const curUser = JSON.parse(curUserStr);
      if (curUser && (curUser.id || curUser.username) && (curUser.name || curUser.username)) {
        const uId = String(curUser.id || curUser.username);
        usersMap.set(uId, curUser);
      }
    }
  } catch (e) {}

  // 2. Fetch all from Firestore 'users' collection
  try {
    const snap = await getDocs(collection(db, 'users'));
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && docSnap.id !== 'undefined') {
        const uId = String(data.id || docSnap.id);
        const existing = usersMap.get(uId) || {};
        usersMap.set(uId, { ...existing, ...data, id: uId });
      }
    });
  } catch (error) {
    console.warn('Firestore fetchAllUsers note:', error);
  }

  // 3. Also extract registered user profiles attached to Firestore posts
  try {
    const postSnap = await getDocs(collection(db, 'posts'));
    postSnap.forEach((docSnap) => {
      const p = docSnap.data();
      if (p) {
        if (p.user && (p.user.id || p.user.name)) {
          const uId = String(p.user.id || p.userId || p.user.username);
          if (uId && !usersMap.has(uId)) {
            usersMap.set(uId, {
              id: uId,
              name: p.user.name || p.userName || 'Business Member',
              username: p.user.username || p.userName?.toLowerCase().replace(/\s+/g, '') || `user_${uId}`,
              role: p.user.role || p.userRole || 'factory',
              avatar: p.user.avatar || p.userAvatar || '',
              avatarUrl: p.user.avatarUrl || p.userAvatar || '',
              city: p.user.city || p.city || 'Morbi',
              state: p.user.state || p.state || 'Gujarat',
              isVerified: Boolean(p.user.isVerified)
            });
          }
        } else if (p.userId && p.userName) {
          const uId = String(p.userId);
          if (!usersMap.has(uId)) {
            usersMap.set(uId, {
              id: uId,
              name: p.userName,
              username: p.userName.toLowerCase().replace(/\s+/g, ''),
              role: p.userRole || 'factory',
              avatar: p.userAvatar || '',
              avatarUrl: p.userAvatar || '',
              city: p.city || 'Morbi',
              state: p.state || 'Gujarat',
              isVerified: false
            });
          }
        }
      }
    });
  } catch (err) {
    console.warn('Post user extraction note:', err);
  }

  // 4. Fallback to API if available
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
              const existing = usersMap.get(uId) || {};
              usersMap.set(uId, { ...existing, ...u, id: uId });
            }
          });
        }
      }
    }
  } catch (e) {}

  const result = Array.from(usersMap.values());
  try {
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

export async function deleteUserFromFirestore(userId: string | number): Promise<boolean> {
  try {
    const uId = String(userId);
    // 1. Delete user doc
    await deleteDoc(doc(db, 'users', uId));
    
    // 2. Delete all posts by this user
    try {
      const postsSnap = await getDocs(collection(db, 'posts'));
      for (const pDoc of postsSnap.docs) {
        const pData = pDoc.data();
        if (String(pData.userId || pData.user?.id) === uId) {
          await deleteDoc(pDoc.ref);
        }
      }
    } catch (pe) {
      console.warn('Error deleting user posts in Firestore:', pe);
    }

    // 3. Delete any pending payments
    try {
      const paySnap = await getDocs(collection(db, 'payments'));
      for (const pDoc of paySnap.docs) {
        const pData = pDoc.data();
        if (String(pData.userId) === uId) {
          await deleteDoc(pDoc.ref);
        }
      }
    } catch (paye) {}

    console.log(`🗑️ Deleted user ${uId} and all associated records from Firestore`);
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
    
    await setDoc(doc(db, 'users', uId), {
      isVerified,
      verifiedPlan: isVerified ? plan : null,
      verifiedAt: isVerified ? now : null,
      expiresAt: expiresAt,
      validityDays: isVerified ? validityDays : null
    }, { merge: true });

    return true;
  } catch (err) {
    console.warn('Firestore updateUserVerification error:', err);
    return false;
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
        callback({
          totalVisitors: typeof data.totalVisitors === 'number' ? data.totalVisitors : 5420,
          totalReviews: typeof data.totalReviews === 'number' ? data.totalReviews : 24,
          averageRating: typeof data.averageRating === 'number' ? data.averageRating : 5.0,
          feedbacks: Array.isArray(data.feedbacks) ? data.feedbacks : []
        });
      }
    }, (err) => {
      console.warn('Firestore subscribeToPlatformStats note:', err);
    });
  } catch (err) {
    console.warn('Firestore subscribeToPlatformStats init error:', err);
    return () => {};
  }
}

export async function incrementVisitorCountInFirestore(): Promise<number> {
  try {
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
    console.warn('Firestore incrementVisitorCount note:', err);
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
    const statsRef = doc(db, 'platform_stats', 'analytics');
    const snap = await getDoc(statsRef);
    let currentStats = snap.exists() ? snap.data() : { totalVisitors: 5420, totalReviews: 24, averageRating: 5.0, feedbacks: [] };
    
    const existingFeedbacks = Array.isArray(currentStats.feedbacks) ? currentStats.feedbacks : [];
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
    console.warn('Firestore submitPlatformRating note:', err);
    return null;
  }
}

export async function clearDefaultDataFromFirestore() {
  try {
    // Delete default and dummy posts from Firestore
    const defaultPostIds = [
      'post_b2b_101', 'post_b2b_102', 'post_b2b_103', 'post_b2b_104',
      'post_1786913295313', 'reel_1786970917881', '1786915808301', '1786961789782', 'reel_1786946107574',
      'post_admin_1787027595927', 'post_admin_1787027350660'
    ];
    for (const pId of defaultPostIds) {
      try { await deleteDoc(doc(db, 'posts', pId)); } catch (e) {}
    }

    // Scan posts collection and remove any posts with blob: URLs or test descriptions
    try {
      const snap = await getDocs(collection(db, 'posts'));
      for (const d of snap.docs) {
        const data = d.data();
        if (
          d.id.startsWith('post_b2b_') ||
          (data.mediaUrl && String(data.mediaUrl).startsWith('blob:')) ||
          data.description === 'My tree' ||
          data.title === 'Tree' ||
          data.title === 'Tile'
        ) {
          try { await deleteDoc(doc(db, 'posts', d.id)); } catch (e) {}
        }
      }
    } catch (e) {}

    // Delete default users and dummy users from Firestore
    const defaultUserIds = [
      'factory_balaji_1', 'dealer_apex_2', 'factory_somany_style_3', 'factory_royal_ceramic_4',
      'usr_1786909912788_ey47m', 'admin_manit_1', 'undefined'
    ];
    for (const uId of defaultUserIds) {
      try { await deleteDoc(doc(db, 'users', uId)); } catch (e) {}
    }
    return true;
  } catch (err) {
    console.warn('Firestore clearDefaultData note:', err);
    return false;
  }
}




