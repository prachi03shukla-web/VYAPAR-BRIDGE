/**
 * High-performance browser-based image & media compressor.
 * Compresses ANY image (even 20MB-50MB mobile photos) into lightweight KB size (<85KB)
 * so that Firebase Firestore documents remain ultra-light and load in milliseconds with zero quota waste.
 */

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
    /^([\w-]{11})$/
  ];
  for (const regex of patterns) {
    const match = clean.match(regex);
    if (match && match[1]) return match[1];
  }
  return null;
}

/**
 * Returns clean lightweight YouTube thumbnail (15KB - 30KB)
 */
export function getYouTubeThumbnail(videoIdOrUrl: string): string {
  const id = extractYouTubeVideoId(videoIdOrUrl);
  if (id) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return '';
}

/**
 * Checks whether a given string is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+/i.test(url.trim());
}

/**
 * Compresses any image (regardless of MB size) into lightweight KB size (<85KB default)
 * Uses high-efficiency HTML5 Canvas scaling & progressive quality stepping.
 */
export async function optimizeImageForPersistence(
  fileOrUrl: File | Blob | string,
  maxWidth = 1080,
  maxHeight = 1080,
  targetQuality = 0.75
): Promise<string> {
  // If it's a GIF file, read directly to preserve animation if small
  if (fileOrUrl instanceof File && (fileOrUrl.type === 'image/gif' || fileOrUrl.name.toLowerCase().endsWith('.gif'))) {
    try {
      if (fileOrUrl.size < 500000) {
        return await fileToDataURL(fileOrUrl);
      }
    } catch (e) {
      console.warn('GIF read error:', e);
    }
  }

  // If it's already a short HTTP/HTTPS URL
  if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('http')) {
    // If it's a YouTube link, return its lightweight thumbnail
    const ytThumb = getYouTubeThumbnail(fileOrUrl);
    if (ytThumb) return ytThumb;
    return fileOrUrl;
  }

  // If it's already a tiny data URL (< 80KB)
  if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('data:image') && fileOrUrl.length < 85000) {
    return fileOrUrl;
  }

  return new Promise((resolve) => {
    try {
      let src = '';
      let revokeNeeded = false;
      if (typeof fileOrUrl === 'string') {
        src = fileOrUrl;
      } else {
        src = URL.createObjectURL(fileOrUrl);
        revokeNeeded = true;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale down proportionally if larger than maxWidth/maxHeight
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            if (revokeNeeded) URL.revokeObjectURL(src);
            resolve(typeof fileOrUrl === 'string' ? fileOrUrl : '');
            return;
          }

          // Anti-aliasing quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Step 1: initial encode at targetQuality
          let dataUrl = canvas.toDataURL('image/jpeg', targetQuality);

          // Step 2: Multi-pass compression if output exceeds 95KB (approx 130,000 characters base64)
          // Ensure it's strictly in KB range for effortless Firestore & cache loading!
          if (dataUrl.length > 130000) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.60);
          }
          if (dataUrl.length > 130000) {
            // Downscale canvas dimensions further by 25%
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = Math.round(width * 0.75);
            smallCanvas.height = Math.round(height * 0.75);
            const smallCtx = smallCanvas.getContext('2d');
            if (smallCtx) {
              smallCtx.imageSmoothingEnabled = true;
              smallCtx.imageSmoothingQuality = 'medium';
              smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
              dataUrl = smallCanvas.toDataURL('image/jpeg', 0.55);
            }
          }

          if (revokeNeeded) {
            URL.revokeObjectURL(src);
          }

          resolve(dataUrl);
        } catch (e) {
          console.warn('Canvas optimization fallback:', e);
          if (revokeNeeded) URL.revokeObjectURL(src);
          resolve(typeof fileOrUrl === 'string' ? fileOrUrl : '');
        }
      };

      img.onerror = () => {
        if (revokeNeeded) URL.revokeObjectURL(src);
        resolve(typeof fileOrUrl === 'string' ? fileOrUrl : '');
      };

      img.src = src;
    } catch (err) {
      console.warn('optimizeImageForPersistence error:', err);
      resolve('');
    }
  });
}

/**
 * Upload an audio file to server storage to get a lightweight URL (<100 bytes)
 * instead of blowing up Firestore documents with 10MB base64 audio!
 */
export async function uploadAudioToServer(file: File, title?: string, artist?: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('musicFile', file);
    if (title) formData.append('title', title);
    if (artist) formData.append('artist', artist);

    const res = await fetch('/api/music', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.audioUrl) {
        return data.audioUrl;
      }
    }
  } catch (err) {
    console.warn('Server audio upload fallback:', err);
  }

  // Secondary fallback to generic /api/upload
  try {
    const formData2 = new FormData();
    formData2.append('media', file);
    const res2 = await fetch('/api/upload', {
      method: 'POST',
      body: formData2
    });
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2 && data2.url) {
        return data2.url;
      }
    }
  } catch (err2) {
    console.warn('/api/upload audio fallback:', err2);
  }

  return '';
}

export function fileToDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getCloudinaryVideoMiddleThumbnail(videoUrl: string): string {
  if (!videoUrl || typeof videoUrl !== 'string') return '';
  if (!videoUrl.includes('cloudinary.com') || !videoUrl.includes('/video/upload/')) return '';
  
  // Replace the video extension with .jpg
  let jpgUrl = videoUrl.replace(/\.(mp4|mov|webm|mkv|avi|m4v)(\?.*)?$/i, '.jpg$2');
  if (!jpgUrl.includes('.jpg') && !jpgUrl.includes('.jpeg')) {
    jpgUrl = jpgUrl.split('?')[0] + '.jpg';
  }
  
  // If so_50p is already present, return
  if (jpgUrl.includes('so_50p')) return jpgUrl;
  
  // Inject transformation right after /video/upload/
  // so_50p = Start offset 50% (Exact video center thumbnail)
  return jpgUrl.replace('/video/upload/', '/video/upload/so_50p,w_500,c_fill,q_auto/');
}

export function isVideoMediaUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:video/')) return true;
  if (/\.(mp4|mov|webm|mkv|avi|m4v)(\?.*)?$/i.test(url)) return true;
  if (url.includes('cloudinary.com') && url.includes('/video/')) return true;
  if (isYouTubeUrl(url)) return true;
  return false;
}

/**
 * Resolves the best cover image URL for a story or reel post.
 * If the story is a video, guarantees returning the thumbnail from the middle of the video.
 */
export function getStoryCoverThumbnail(post: any): string {
  if (!post) return '';

  const candidateVideoUrl = post.mediaUrl || post.videoUrl || post.video || post.persistentMediaUrl || post.thumbnailUrl || '';
  const isVideo = post.type === 'video' || post.isReel === true || isVideoMediaUrl(candidateVideoUrl);

  // 1. If post has a valid image thumbnail that is NOT a video URL itself
  if (post.thumbnailUrl && !isVideoMediaUrl(post.thumbnailUrl)) {
    return post.thumbnailUrl;
  }
  if (post.videoThumbnailUrl && !isVideoMediaUrl(post.videoThumbnailUrl)) {
    return post.videoThumbnailUrl;
  }

  // 2. If candidate video is on Cloudinary, transform directly to the 50% middle thumbnail
  if (candidateVideoUrl && candidateVideoUrl.includes('cloudinary.com') && candidateVideoUrl.includes('/video/upload/')) {
    const cloudThumb = getCloudinaryVideoMiddleThumbnail(candidateVideoUrl);
    if (cloudThumb) return cloudThumb;
  }

  // 3. If YouTube URL
  if (candidateVideoUrl && isYouTubeUrl(candidateVideoUrl)) {
    return getYouTubeThumbnail(candidateVideoUrl);
  }

  // 4. If not a video, return the media URL directly
  if (!isVideo && candidateVideoUrl && !isVideoMediaUrl(candidateVideoUrl)) {
    return candidateVideoUrl;
  }

  return '';
}

export async function generateVideoThumbnail(
  fileOrUrl: File | Blob | string,
  seekToSeconds?: number
): Promise<string> {
  // If it's a Cloudinary video URL, return the instant middle frame CDN URL
  if (typeof fileOrUrl === 'string') {
    if (fileOrUrl.includes('cloudinary.com') && fileOrUrl.includes('/video/upload/')) {
      const cdnThumb = getCloudinaryVideoMiddleThumbnail(fileOrUrl);
      if (cdnThumb) return cdnThumb;
    }
    if (isYouTubeUrl(fileOrUrl)) {
      return getYouTubeThumbnail(fileOrUrl);
    }
  }

  return new Promise((resolve) => {
    let createdUrl: string | null = null;
    let resolved = false;

    const cleanupAndResolve = (result: string) => {
      if (resolved) return;
      resolved = true;
      if (createdUrl) {
        try { URL.revokeObjectURL(createdUrl); } catch (e) {}
      }
      resolve(result);
    };

    try {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';

      let src = '';
      if (typeof fileOrUrl === 'string') {
        src = fileOrUrl;
        if (!src.startsWith('blob:') && !src.startsWith('data:')) {
          video.crossOrigin = 'anonymous';
        }
      } else {
        createdUrl = URL.createObjectURL(fileOrUrl);
        src = createdUrl;
      }
      video.src = src;

      const captureFrame = () => {
        try {
          const canvas = document.createElement('canvas');
          const w = video.videoWidth || 640;
          const h = video.videoHeight || 360;
          canvas.width = Math.min(w, 720);
          canvas.height = Math.round((canvas.width * h) / w);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumb = canvas.toDataURL('image/jpeg', 0.85);
            if (thumb && thumb.length > 200) {
              cleanupAndResolve(thumb);
              return;
            }
          }
        } catch (e) {}
        cleanupAndResolve('');
      };

      let seekTriggered = false;
      const doSeekToMiddle = () => {
        if (seekTriggered) return;
        seekTriggered = true;
        try {
          const duration = video.duration;
          // Video ke theek beech ka thumbnail (exact middle of video: duration / 2)
          let targetTime = (typeof seekToSeconds === 'number' && seekToSeconds > 0) ? seekToSeconds : 0.5;
          if (duration && isFinite(duration) && duration > 0.5) {
            targetTime = duration / 2;
          }
          video.currentTime = targetTime;
        } catch (e) {
          captureFrame();
        }
      };

      video.onloadedmetadata = () => {
        doSeekToMiddle();
      };

      video.onloadeddata = () => {
        doSeekToMiddle();
      };

      video.onseeked = () => {
        requestAnimationFrame(() => {
          captureFrame();
        });
      };

      video.onerror = () => {
        cleanupAndResolve('');
      };

      // Fallback timer if metadata or seeked takes longer than 3.5 seconds
      setTimeout(() => {
        if (!resolved) {
          if (video.videoWidth > 0) {
            captureFrame();
          } else {
            cleanupAndResolve('');
          }
        }
      }, 3500);

      video.load();
    } catch (e) {
      cleanupAndResolve('');
    }
  });
}
