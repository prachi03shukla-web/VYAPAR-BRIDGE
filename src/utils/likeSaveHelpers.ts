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

export function getUserEngagementCounts() {
  let likes = parseInt(localStorage.getItem('vyapar_user_likes_count') || '');
  let comments = parseInt(localStorage.getItem('vyapar_user_comments_count') || '');
  let saves = parseInt(localStorage.getItem('vyapar_user_saves_count') || '');
  let visits = parseInt(localStorage.getItem('vyapar_user_profile_visits_count') || '');

  // Initialize with realistic base values if not set yet so they can see progress or met milestones
  if (isNaN(likes)) {
    likes = 1250; // Met milestone (>= 1000)
    localStorage.setItem('vyapar_user_likes_count', String(likes));
  }
  if (isNaN(comments)) {
    comments = 850; // Needs 150 more to meet milestone
    localStorage.setItem('vyapar_user_comments_count', String(comments));
  }
  if (isNaN(saves)) {
    saves = 1100; // Met milestone (>= 1000)
    localStorage.setItem('vyapar_user_saves_count', String(saves));
  }
  if (isNaN(visits)) {
    visits = 980; // Needs 20 more to meet milestone
    localStorage.setItem('vyapar_user_profile_visits_count', String(visits));
  }

  return { likes, comments, saves, visits };
}

export function getUserBaselines() {
  const likesBaseline = parseInt(localStorage.getItem('vyapar_likes_baseline') || '0');
  const commentsBaseline = parseInt(localStorage.getItem('vyapar_comments_baseline') || '0');
  const savesBaseline = parseInt(localStorage.getItem('vyapar_saves_baseline') || '0');
  const visitsBaseline = parseInt(localStorage.getItem('vyapar_visits_baseline') || '0');
  const hasGeneratedOnce = localStorage.getItem('vyapar_token_generated_once') === 'true';

  return { likesBaseline, commentsBaseline, savesBaseline, visitsBaseline, hasGeneratedOnce };
}

export function recordTokenGeneration(currentLikes: number, currentComments: number, currentSaves: number, currentVisits: number) {
  localStorage.setItem('vyapar_likes_baseline', String(currentLikes));
  localStorage.setItem('vyapar_comments_baseline', String(currentComments));
  localStorage.setItem('vyapar_saves_baseline', String(currentSaves));
  localStorage.setItem('vyapar_visits_baseline', String(currentVisits));
  localStorage.setItem('vyapar_token_generated_once', 'true');
  window.dispatchEvent(new CustomEvent('vyapar_user_engagement_updated'));
}

export function resetEngagementBaselinesForTest() {
  localStorage.removeItem('vyapar_likes_baseline');
  localStorage.removeItem('vyapar_comments_baseline');
  localStorage.removeItem('vyapar_saves_baseline');
  localStorage.removeItem('vyapar_visits_baseline');
  localStorage.removeItem('vyapar_token_generated_once');
  window.dispatchEvent(new CustomEvent('vyapar_user_engagement_updated'));
}

export function getNewEngagementCounts() {
  const current = getUserEngagementCounts();
  const baselines = getUserBaselines();

  if (!baselines.hasGeneratedOnce) {
    return {
      likes: current.likes,
      comments: current.comments,
      saves: current.saves,
      visits: current.visits,
      hasGeneratedOnce: false,
      current,
      baselines
    };
  }

  return {
    likes: Math.max(0, current.likes - baselines.likesBaseline),
    comments: Math.max(0, current.comments - baselines.commentsBaseline),
    saves: Math.max(0, current.saves - baselines.savesBaseline),
    visits: Math.max(0, current.visits - baselines.visitsBaseline),
    hasGeneratedOnce: true,
    current,
    baselines
  };
}

export function incrementUserEngagement(type: 'likes' | 'comments' | 'saves' | 'visits') {
  const counts = getUserEngagementCounts();
  if (type === 'likes') {
    localStorage.setItem('vyapar_user_likes_count', String(counts.likes + 1));
  } else if (type === 'comments') {
    localStorage.setItem('vyapar_user_comments_count', String(counts.comments + 1));
  } else if (type === 'saves') {
    localStorage.setItem('vyapar_user_saves_count', String(counts.saves + 1));
  } else if (type === 'visits') {
    localStorage.setItem('vyapar_user_profile_visits_count', String(counts.visits + 1));
  }
  // Dispatch custom event to notify components that counts updated
  window.dispatchEvent(new CustomEvent('vyapar_user_engagement_updated', { detail: type }));
}

