import { uploadFileToFirebaseStorage, syncPostToFirestore } from './firebaseDataSync';
import { generateVideoThumbnail } from '../utils/imageOptimizer';
import { optimizeImageForPersistence } from '../utils/imageOptimizer';
import { extractPdfFirstPageThumbnail, generateFallbackPdfCover } from '../utils/pdfThumbnail';
import { cacheVideoUrlInMemory, saveVideoBlob } from '../utils/videoStorage';

/**
 * Interface representing the payload needed to create a post from media URLs
 */
export interface MediaPostPayload {
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  title: string;
  content: string;
  hashtags?: string;
  type: 'image' | 'video' | 'pdf' | 'link';
  mediaUrl?: string; // Firebase or external URL
  images?: string[]; // Array of image URLs for carousel/showcase
  pdfUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  externalLink?: string;
  minRate?: number;
  maxRate?: number;
  unit?: string;
  category?: string;
  visibility?: 'public' | 'unlisted' | 'private' | 'scheduled';
}

/**
 * Service to centralize media URL generation, upload coordination, and Firebase Firestore synchronization.
 */

/**
 * 1. Coordinates Video uploading and thumbnail extraction
 */
export async function createVideoPostUrl(
  file: File,
  userId: string,
  onProgress?: (pct: number) => void
): Promise<{ mediaUrl: string; thumbnailUrl: string; duration: number }> {
  if (!file) throw new Error('No video file selected.');

  const generatedId = `video_post_${Date.now()}`;
  const sanitizedName = (file.name || 'video.mp4').replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `posts/${userId}/${generatedId}_${sanitizedName}`;

  // Step A: Save raw video Blob directly to IndexedDB for permanent local device persistence
  try {
    await saveVideoBlob(generatedId, file);
    const objectUrl = URL.createObjectURL(file);
    cacheVideoUrlInMemory(generatedId, objectUrl);
  } catch (idbErr) {
    console.warn('IndexedDB video cache note:', idbErr);
  }

  // Step B: Extract video thumbnail cover frame
  let thumbUrl = '';
  try {
    const extractedThumb = await generateVideoThumbnail(file);
    if (extractedThumb) {
      thumbUrl = extractedThumb;
    }
  } catch (err) {
    console.warn('Failed to extract thumbnail cover inside media service:', err);
  }

  // Step C: Upload file directly to Cloud CDN / Server / Firebase Storage
  let downloadUrl = '';
  try {
    downloadUrl = await uploadFileToFirebaseStorage(file, storagePath, onProgress);
  } catch (uploadErr) {
    console.warn('Media upload warning, utilizing IndexedDB fallback:', uploadErr);
  }

  if (downloadUrl) {
    cacheVideoUrlInMemory(generatedId, downloadUrl);
  }

  const fallbackThumb = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
  const resolvedMedia = downloadUrl || `indexeddb:${generatedId}`;

  return {
    mediaUrl: resolvedMedia,
    thumbnailUrl: thumbUrl || fallbackThumb,
    duration: 0 // Will be read by the video element client-side
  };
}

/**
 * 2. Handles multi-image showcase uploading and client-side optimization
 */
export async function createImagePostUrls(
  files: File[],
  userId: string,
  onProgress?: (pct: number) => void
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const uploadedUrls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Client-side image optimization
    let blobToUpload: Blob = file;
    try {
      const optimizedDataUrl = await optimizeImageForPersistence(file);
      if (optimizedDataUrl && optimizedDataUrl.startsWith('data:')) {
        const arr = optimizedDataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        blobToUpload = new Blob([u8arr], { type: mime });
      }
    } catch (optimizeErr) {
      console.warn('Image optimization warning inside media service:', optimizeErr);
    }

    const generatedId = `img_${Date.now()}_${i}`;
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `posts/${userId}/${generatedId}_${sanitizedName}`;

    // Upload optimized image
    const url = await uploadFileToFirebaseStorage(
      blobToUpload,
      storagePath,
      (pct) => {
        if (typeof onProgress === 'function') {
          const individualWeight = 100 / files.length;
          const currentBase = i * individualWeight;
          const currentProg = currentBase + (pct / 100) * individualWeight;
          onProgress(Math.round(currentProg));
        }
      }
    );

    if (url) {
      uploadedUrls.push(url);
    }
  }

  if (uploadedUrls.length === 0) {
    throw new Error('All image uploads failed or were rejected by Firestore cloud storage.');
  }

  return uploadedUrls;
}

/**
 * 3. Handles catalog PDF uploads and thumbnail page extraction
 */
export async function createPdfCatalogUrl(
  file: File,
  userId: string,
  onProgress?: (pct: number) => void
): Promise<{ mediaUrl: string; thumbnailUrl: string }> {
  if (!file) throw new Error('No PDF catalog file selected.');

  const generatedId = `pdf_post_${Date.now()}`;
  const sanitizedName = (file.name || 'catalog.pdf').replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `posts/${userId}/${generatedId}_${sanitizedName}`;

  // Step A: Auto-generate catalog thumbnail cover from first page of PDF
  let thumbUrl = '';
  try {
    const pdfThumbResult = await extractPdfFirstPageThumbnail(file);
    if (pdfThumbResult && pdfThumbResult.thumbnailUrl) {
      thumbUrl = pdfThumbResult.thumbnailUrl;
    } else {
      thumbUrl = generateFallbackPdfCover(file.name.replace('.pdf', ''), 'Vyapar Bridge Catalogue');
    }
  } catch (err) {
    console.warn('Failed to extract PDF first page cover in media service:', err);
    thumbUrl = generateFallbackPdfCover(file.name.replace('.pdf', ''), 'Vyapar Bridge Catalogue');
  }

  // Step B: Upload PDF Catalog to permanent Storage
  const downloadUrl = await uploadFileToFirebaseStorage(file, storagePath, onProgress);
  if (!downloadUrl) {
    throw new Error('Firebase Storage rejected the PDF Catalog upload.');
  }

  return {
    mediaUrl: downloadUrl,
    thumbnailUrl: thumbUrl
  };
}

/**
 * 4. Resolves and extracts metadata from external URLs (YouTube, Facebook, Vimeo, Web link)
 */
export async function resolveExternalPostLink(
  rawUrl: string
): Promise<{ resolvedUrl: string; title: string; provider: string; thumbnailUrl?: string }> {
  if (!rawUrl) throw new Error('No external URL provided.');

  const cleanUrl = rawUrl.trim();
  let provider = 'website';
  let title = 'External Business Portfolio';
  let thumbnailUrl = '';

  try {
    const parsed = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      provider = 'youtube';
      title = 'YouTube Video Showcase';
      // Standard YouTube thumbnail resolver
      const vidMatch = parsed.searchParams.get('v') || parsed.pathname.split('/').pop();
      if (vidMatch) {
        thumbnailUrl = `https://img.youtube.com/vi/${vidMatch}/0.jpg`;
      }
    } else if (host.includes('vimeo.com')) {
      provider = 'vimeo';
      title = 'Vimeo Product Demo';
    } else if (host.includes('facebook.com') || host.includes('fb.watch')) {
      provider = 'facebook';
      title = 'Facebook B2B Video Stream';
      
      // Hit backend Facebook URL Resolver for real-time video stream metadata extraction
      try {
        const response = await fetch(`/api/resolve-facebook-url?url=${encodeURIComponent(cleanUrl)}`);
        if (response.ok) {
          const fbMeta = await response.json();
          if (fbMeta) {
            return {
              resolvedUrl: fbMeta.resolvedUrl || cleanUrl,
              title: fbMeta.title || 'Facebook Video Post',
              provider: 'facebook',
              thumbnailUrl: fbMeta.thumbnailUrl || ''
            };
          }
        }
      } catch (fbErr) {
        console.warn('Backend FB resolver skip fallback:', fbErr);
      }
    }

    return {
      resolvedUrl: parsed.href,
      title,
      provider,
      thumbnailUrl
    };
  } catch (err) {
    console.warn('URL structure validation issue inside media service:', err);
    return {
      resolvedUrl: cleanUrl,
      title: 'External Web Link',
      provider: 'website'
    };
  }
}

/**
 * 5. Primary Sync Function: Hits Firebase TS / Firestore to create and persist the post.
 * The backend then processes this to show us whatever is retrieved from the links!
 */
export async function syncMediaPostToFirebase(payload: MediaPostPayload): Promise<boolean> {
  const generatedId = `post_${Date.now()}`;
  
  // Clean up and construct standard post structure
  const postData: any = {
    id: generatedId,
    userId: String(payload.userId),
    userName: payload.userName,
    userRole: payload.userRole,
    userAvatar: payload.userAvatar || '',
    title: payload.title || '',
    content: payload.content || '',
    description: payload.content || '',
    hashtags: payload.hashtags || '#vyaparbridge #wholesale',
    type: payload.type,
    category: payload.category || 'Commercial Wholesale',
    visibility: payload.visibility || 'public',
    status: 'approved',
    likesCount: 0,
    viewsCount: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPermanent: true,
    user: {
      id: String(payload.userId),
      name: payload.userName,
      avatar: payload.userAvatar || '',
      avatarUrl: payload.userAvatar || '',
      role: payload.userRole
    }
  };

  // Assign type-specific attributes
  if (payload.type === 'video') {
    postData.mediaUrl = payload.mediaUrl;
    postData.videoUrl = payload.videoUrl || payload.mediaUrl;
    postData.video = payload.videoUrl || payload.mediaUrl;
    postData.thumbnailUrl = payload.thumbnailUrl || '';
    postData.persistentMediaUrl = payload.mediaUrl;
  } else if (payload.type === 'image') {
    postData.mediaUrl = payload.mediaUrl || (payload.images && payload.images[0]) || '';
    postData.images = payload.images || [];
    postData.mediaUrls = payload.images || [];
    postData.thumbnailUrl = payload.thumbnailUrl || postData.mediaUrl;
    postData.persistentMediaUrl = postData.mediaUrl;
  } else if (payload.type === 'pdf') {
    postData.mediaUrl = payload.mediaUrl;
    postData.pdfUrl = payload.pdfUrl || payload.mediaUrl;
    postData.thumbnailUrl = payload.thumbnailUrl || '';
    postData.persistentMediaUrl = payload.mediaUrl;
  } else if (payload.type === 'link') {
    postData.externalLink = payload.externalLink || payload.mediaUrl;
    postData.mediaUrl = payload.thumbnailUrl || '';
    postData.thumbnailUrl = payload.thumbnailUrl || '';
    
    // If it is embeddable video, standard video player can stream it
    const isEmbedVideo = payload.externalLink && (
      payload.externalLink.includes('youtube.com') ||
      payload.externalLink.includes('youtu.be') ||
      payload.externalLink.includes('vimeo.com') ||
      payload.externalLink.includes('facebook.com')
    );
    if (isEmbedVideo) {
      postData.type = 'video';
      postData.videoUrl = payload.externalLink;
      postData.video = payload.externalLink;
    }
  }

  // Set pricing rates if available
  if (payload.minRate !== undefined) postData.minRate = payload.minRate;
  if (payload.maxRate !== undefined) postData.maxRate = payload.maxRate;
  if (payload.unit !== undefined) postData.unit = payload.unit;

  console.log('⚡ Hitting Firebase Data Sync with modular media URL post:', postData.id);

  // Directly hit firebaseDataSync's primary sync mechanism
  const success = await syncPostToFirestore(postData);

  if (success) {
    // Notify application views immediately to render the updated posts stream
    window.dispatchEvent(new CustomEvent('postCreated', { detail: postData }));
  }

  return success;
}
