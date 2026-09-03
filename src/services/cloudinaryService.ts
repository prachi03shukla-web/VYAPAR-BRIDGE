/**
 * Cloudinary Universal Upload Service for Vyapar Bridge
 * Direct high-speed CDN upload for Videos, Reels, Photos, Voice Notes, & Catalogs.
 * Works seamlessly on Vercel, Localhost, Android & Desktop (Tauri).
 */

export const CLOUDINARY_CONFIG = {
  cloudName: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME) || 'wwssqpep',
  uploadPreset: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET) || 'ml_default',
  apiKey: '277689186734617'
};

export interface CloudinaryUploadResponse {
  asset_id?: string;
  public_id?: string;
  version?: number;
  format?: string;
  resource_type?: string;
  created_at?: string;
  bytes?: number;
  type?: string;
  url?: string;
  secure_url?: string;
  duration?: number;
  width?: number;
  height?: number;
  playback_url?: string;
  error?: {
    message?: string;
  };
}

/**
 * Uploads a file (video, image, audio, pdf) directly to Cloudinary via Unsigned Preset
 * with real-time percentage progress callback.
 */
export async function uploadToCloudinary(
  file: File | Blob,
  onProgress?: (percent: number) => void,
  folder?: string
): Promise<string> {
  const cloudName = CLOUDINARY_CONFIG.cloudName || 'wwssqpep';
  const uploadPreset = CLOUDINARY_CONFIG.uploadPreset || 'ml_default';

  if (!file) return '';

  return new Promise<string>((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      const formData = new FormData();

      let filename = 'upload';
      if (file instanceof File && file.name) {
        filename = file.name;
      } else if (file.type) {
        if (file.type.includes('video')) filename = 'video.mp4';
        else if (file.type.includes('audio')) filename = 'audio.mp3';
        else if (file.type.includes('pdf')) filename = 'catalog.pdf';
        else filename = 'image.jpg';
      }

      formData.append('file', file, filename);
      formData.append('upload_preset', uploadPreset);
      if (folder) {
        formData.append('folder', folder);
      }

      // Track granular upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && e.total > 0 && typeof onProgress === 'function') {
          const pct = Math.min(99, Math.round((e.loaded / e.total) * 100));
          onProgress(pct);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
            if (data.secure_url || data.url) {
              const finalUrl = data.secure_url || data.url || '';
              if (typeof onProgress === 'function') onProgress(100);
              console.log('⚡ Cloudinary CDN upload complete:', finalUrl);
              resolve(finalUrl);
              return;
            }
          } catch (err) {
            console.warn('Cloudinary JSON parse error:', err);
          }
        }
        reject(new Error(`Cloudinary responded with status ${xhr.status}: ${xhr.responseText}`));
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error connecting to Cloudinary'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Cloudinary upload aborted by user'));
      });

      // 60-second timeout for large 4K / HD videos
      xhr.timeout = 60000;
      xhr.addEventListener('timeout', () => {
        reject(new Error('Cloudinary upload timed out'));
      });

      xhr.open('POST', url, true);
      xhr.send(formData);
    } catch (err) {
      reject(err);
    }
  });
}
