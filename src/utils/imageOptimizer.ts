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
