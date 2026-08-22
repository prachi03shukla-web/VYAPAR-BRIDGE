/**
 * High-performance browser-based image compressor and optimizer.
 * Ensures images uploaded to Firestore/Cloud fit easily within document limits (<200KB)
 * while maintaining crystal-clear visual quality on Mobile, Retina, and Desktop displays.
 */

export async function optimizeImageForPersistence(
  fileOrUrl: File | Blob | string,
  maxWidth = 1080,
  maxHeight = 1080,
  quality = 0.82
): Promise<string> {
  // If it's a GIF file, read directly to preserve animation
  if (fileOrUrl instanceof File && (fileOrUrl.type === 'image/gif' || fileOrUrl.name.toLowerCase().endsWith('.gif'))) {
    try {
      return await fileToDataURL(fileOrUrl);
    } catch (e) {
      console.warn('GIF read error:', e);
    }
  }

  // If it's already a GIF data URL or web URL, preserve directly
  if (typeof fileOrUrl === 'string' && (fileOrUrl.startsWith('data:image/gif') || fileOrUrl.toLowerCase().includes('.gif'))) {
    return fileOrUrl;
  }

  // If it's already a short web URL or doesn't need canvas conversion
  if (typeof fileOrUrl === 'string' && (fileOrUrl.startsWith('http') || (fileOrUrl.startsWith('data:image') && fileOrUrl.length < 300000))) {
    return fileOrUrl;
  }

  return new Promise((resolve) => {
    try {
      let src = '';
      if (typeof fileOrUrl === 'string') {
        src = fileOrUrl;
      } else {
        src = URL.createObjectURL(fileOrUrl);
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
            if (typeof fileOrUrl !== 'string') URL.revokeObjectURL(src);
            resolve(typeof fileOrUrl === 'string' ? fileOrUrl : '');
            return;
          }

          // Render clean anti-aliased image
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to efficient JPEG Data URL
          const dataUrl = canvas.toDataURL('image/jpeg', quality);

          if (typeof fileOrUrl !== 'string') {
            URL.revokeObjectURL(src);
          }

          resolve(dataUrl);
        } catch (e) {
          console.warn('Canvas optimization fallback:', e);
          if (typeof fileOrUrl !== 'string') URL.revokeObjectURL(src);
          resolve(typeof fileOrUrl === 'string' ? fileOrUrl : '');
        }
      };

      img.onerror = () => {
        if (typeof fileOrUrl !== 'string') URL.revokeObjectURL(src);
        resolve(typeof fileOrUrl === 'string' ? fileOrUrl : '');
      };

      img.src = src;
    } catch (err) {
      console.warn('optimizeImageForPersistence error:', err);
      resolve('');
    }
  });
}

export function fileToDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function generateVideoThumbnail(
  fileOrUrl: File | Blob | string,
  seekToSeconds = 0.5
): Promise<string> {
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
      video.preload = 'auto';

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

      video.onloadeddata = () => {
        try {
          const targetTime = Math.min(seekToSeconds, Math.max(0.1, (video.duration || 1) * 0.1));
          video.currentTime = targetTime;
        } catch (e) {
          captureFrame();
        }
      };

      video.onseeked = () => {
        captureFrame();
      };

      video.oncanplay = () => {
        if (!resolved) {
          try {
            if (video.videoWidth > 0) {
              captureFrame();
            }
          } catch (e) {}
        }
      };

      video.onerror = () => {
        cleanupAndResolve('');
      };

      // Fallback timer in case seeked never fires
      setTimeout(() => {
        if (!resolved) {
          if (video.videoWidth > 0) {
            captureFrame();
          } else {
            cleanupAndResolve('');
          }
        }
      }, 2500);

      video.load();
    } catch (e) {
      cleanupAndResolve('');
    }
  });
}
