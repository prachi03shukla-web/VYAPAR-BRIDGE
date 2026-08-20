// Persistent Helper for Like & Save States across Session & Page Refreshes

export function isPostLikedByUser(post: any, currentUserId?: string | number): boolean {
  if (!post) return false;
  const pId = String(post.id || '');
  if (!pId) return false;

  // 1. Check local storage persistent list (instant zero-delay, works across refreshes)
  try {
    const localLiked: string[] = JSON.parse(localStorage.getItem('vyapar_liked_posts') || '[]');
    if (Array.isArray(localLiked) && localLiked.includes(pId)) {
      return true;
    }
  } catch (e) {}

  // 2. Check explicitly set isLiked property on post
  if (post.isLiked === true) return true;

  // 3. Check likedBy array from Firestore or backend API
  const activeUserId = String(currentUserId || localStorage.getItem('vyapar_user_id') || '').trim();
  if (activeUserId && Array.isArray(post.likedBy)) {
    return post.likedBy.some((uId: any) => String(uId).trim() === activeUserId);
  }

  return false;
}

export function setPostLikedInLocalStorage(postId: string | number, isLiked: boolean) {
  try {
    const pId = String(postId);
    if (!pId) return;
    const localLiked: string[] = JSON.parse(localStorage.getItem('vyapar_liked_posts') || '[]');
    let updated: string[];
    if (isLiked) {
      updated = Array.from(new Set([...localLiked, pId]));
    } else {
      updated = localLiked.filter(id => id !== pId);
    }
    localStorage.setItem('vyapar_liked_posts', JSON.stringify(updated));
  } catch (e) {}
}

export function isPostSavedByUser(post: any, currentUserId?: string | number): boolean {
  if (!post) return false;
  const pId = String(post.id || '');
  if (!pId) return false;

  try {
    const localSaved: string[] = JSON.parse(localStorage.getItem('vyapar_saved_posts') || '[]');
    if (Array.isArray(localSaved) && localSaved.includes(pId)) {
      return true;
    }
  } catch (e) {}

  if (post.isSaved === true) return true;

  const activeUserId = String(currentUserId || localStorage.getItem('vyapar_user_id') || '').trim();
  if (activeUserId && Array.isArray(post.savedBy)) {
    return post.savedBy.some((uId: any) => String(uId).trim() === activeUserId);
  }

  return false;
}

export function setPostSavedInLocalStorage(postId: string | number, isSaved: boolean) {
  try {
    const pId = String(postId);
    if (!pId) return;
    const localSaved: string[] = JSON.parse(localStorage.getItem('vyapar_saved_posts') || '[]');
    let updated: string[];
    if (isSaved) {
      updated = Array.from(new Set([...localSaved, pId]));
    } else {
      updated = localSaved.filter(id => id !== pId);
    }
    localStorage.setItem('vyapar_saved_posts', JSON.stringify(updated));
  } catch (e) {}
}
