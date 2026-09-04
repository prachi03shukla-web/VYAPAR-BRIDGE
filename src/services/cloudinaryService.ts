/**
 * Cloudinary Universal Upload Service for Vyapar Bridge
 * Direct high-speed CDN upload for Videos, Reels, Photos, Voice Notes, & Catalogs.
 * Works seamlessly on Vercel, Localhost, Android & Desktop (Tauri).
 */

export const CLOUDINARY_CONFIG = {
  cloudName: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME) || 'wwssqpep',
  uploadPreset: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET) || 'Vyapar-bridge',
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
 * with real-time percentage progress callback and automatic retry without folder restriction.
 */
export async function uploadToCloudinary(
  file: File | Blob,
  onProgress?: (percent: number) => void,
  folder?: string
): Promise<string> {
  const cloudName = CLOUDINARY_CONFIG.cloudName || 'wwssqpep';
  const uploadPreset = CLOUDINARY_CONFIG.uploadPreset || 'Vyapar-bridge';

  if (!file) return '';

  const isVideo = Boolean(
    file.type?.includes('video') ||
    (file instanceof File && /\.(mp4|webm|mov|m4v|avi|mkv|3gp|flv)$/i.test(file.name))
  );
  const isAudio = Boolean(file.type?.includes('audio') || (file instanceof File && /\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name)));
  const endpointType = isVideo ? 'video' : (isAudio ? 'video' : 'auto');

  // Internal helper to perform XMLHttpRequest
  const attemptUpload = (useFolder?: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/${endpointType}/upload`;
        const formData = new FormData();

        let filename = 'upload';
        if (file instanceof File && file.name) {
          filename = file.name;
        } else if (file.type) {
          if (isVideo) filename = 'video.mp4';
          else if (isAudio) filename = 'audio.mp3';
          else if (file.type.includes('pdf')) filename = 'catalog.pdf';
          else filename = 'image.jpg';
        }

        formData.append('file', file, filename);
        formData.append('upload_preset', uploadPreset);
        if (useFolder) {
          formData.append('folder', useFolder);
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
          reject(new Error(`Cloudinary status ${xhr.status}: ${xhr.responseText}`));
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error connecting to Cloudinary'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Cloudinary upload aborted by user'));
        });

        xhr.timeout = 70000;
        xhr.addEventListener('timeout', () => {
          reject(new Error('Cloudinary upload timed out'));
        });

        xhr.open('POST', url, true);
        xhr.send(formData);
      } catch (err) {
        reject(err);
      }
    });
  };

  try {
    // First try with folder (if specified)
    return await attemptUpload(folder);
  } catch (err: any) {
    if (folder) {
      console.warn('Retrying Cloudinary upload without folder constraint:', err?.message);
      try {
        return await attemptUpload(undefined);
      } catch (retryErr) {
        console.error('Cloudinary retry without folder failed:', retryErr);
        throw retryErr;
      }
    }
    throw err;
  }
}
