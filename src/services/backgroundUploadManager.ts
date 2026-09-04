/**
 * Background Upload Manager for Vyapar Bridge
 * Facebook / Instagram-style asynchronous background uploader with floating progress ring.
 * Uploads media directly to Cloudinary CDN & Firestore without blocking user navigation.
 */

import { uploadToCloudinary } from './cloudinaryService';
import { syncPostToFirestore } from './firebaseDataSync';
import { playBubblePopSound } from '../utils/audioEffects';
import { getCloudinaryVideoMiddleThumbnail, generateVideoThumbnail } from '../utils/imageOptimizer';

export interface UploadTask {
  id: string;
  type: 'post' | 'story' | 'catalog';
  title: string;
  previewUrl?: string;
  progress: number;
  status: 'uploading' | 'syncing' | 'completed' | 'error';
  errorMessage?: string;
  createdAt: number;
}

type TaskListener = (tasks: UploadTask[]) => void;

class BackgroundUploadService {
  private tasks: Map<string, UploadTask> = new Map();
  private listeners: Set<TaskListener> = new Set();

  public subscribe(listener: TaskListener): () => void {
    this.listeners.add(listener);
    listener(this.getAllTasks());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const list = this.getAllTasks();
    this.listeners.forEach((l) => {
      try {
        l(list);
      } catch (e) {}
    });
  }

  public getAllTasks(): UploadTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  private updateTask(id: string, updates: Partial<UploadTask>) {
    const existing = this.tasks.get(id);
    if (existing) {
      this.tasks.set(id, { ...existing, ...updates });
      this.notify();
    }
  }

  public removeTask(id: string) {
    this.tasks.delete(id);
    this.notify();
  }

  /**
   * Uploads a post in background to Cloudinary CDN & syncs with Firestore + Node Backend
   */
  public async uploadPostInBackground(params: {
    postDraft: any;
    imageFiles?: File[];
    videoFile?: File | null;
    pdfFile?: File | null;
    thumbnailFile?: File | null;
    audioFile?: File | null;
    previewUrl?: string;
  }): Promise<void> {
    const { postDraft, imageFiles = [], videoFile, pdfFile, thumbnailFile, audioFile, previewUrl } = params;
    const taskId = `task_${postDraft.id || Date.now()}`;

    const task: UploadTask = {
      id: taskId,
      type: 'post',
      title: postDraft.title || postDraft.content?.slice(0, 30) || 'New Vyapar Post',
      previewUrl: previewUrl || postDraft.thumbnailUrl || postDraft.mediaUrl || '',
      progress: 5,
      status: 'uploading',
      createdAt: Date.now()
    };

    this.tasks.set(taskId, task);
    this.notify();

    try {
      let finalMediaUrls: string[] = [];
      let finalMediaUrl: string = postDraft.mediaUrl || '';
      let finalThumbnailUrl: string = postDraft.thumbnailUrl || '';
      let finalVideoUrl: string = postDraft.videoUrl || '';
      let finalPdfUrl: string = postDraft.pdfUrl || '';
      let finalAudioUrl: string = postDraft.music?.audioUrl || '';

      const totalFilesToUpload = (imageFiles.length || 0) + (videoFile ? 1 : 0) + (pdfFile ? 1 : 0) + (thumbnailFile ? 1 : 0) + (audioFile ? 1 : 0);
      let completedFilesCount = 0;

      const getFileWeight = () => (totalFilesToUpload > 0 ? 80 / totalFilesToUpload : 80);

      // 1. Upload multiple images to Cloudinary CDN
      if (imageFiles.length > 0) {
        const uploadedImgs: string[] = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const imgFile = imageFiles[i];
          try {
            const cdnUrl = await uploadToCloudinary(imgFile, (pct) => {
              const fileBase = completedFilesCount * getFileWeight();
              const currentWeight = (pct / 100) * getFileWeight();
              this.updateTask(taskId, { progress: Math.min(85, Math.round(fileBase + currentWeight)) });
            }, 'vyapar_posts');

            if (cdnUrl) {
              uploadedImgs.push(cdnUrl);
            }
          } catch (imgErr) {
            console.warn('Image upload fallback to backend:', imgErr);
            // Fallback: upload to backend server
            const fallbackUrl = await this.uploadToBackendFallback(imgFile);
            if (fallbackUrl) uploadedImgs.push(fallbackUrl);
          }
          completedFilesCount++;
        }

        if (uploadedImgs.length > 0) {
          finalMediaUrls = uploadedImgs;
          finalMediaUrl = uploadedImgs[0];
          if (!finalThumbnailUrl) finalThumbnailUrl = uploadedImgs[0];
        }
      }

      // 2. Upload Video to Cloudinary CDN
      if (videoFile) {
        try {
          const videoCdnUrl = await uploadToCloudinary(videoFile, (pct) => {
            const fileBase = completedFilesCount * getFileWeight();
            const currentWeight = (pct / 100) * getFileWeight();
            this.updateTask(taskId, { progress: Math.min(85, Math.round(fileBase + currentWeight)) });
          }, 'vyapar_videos');

          if (videoCdnUrl) {
            finalVideoUrl = videoCdnUrl;
            finalMediaUrl = videoCdnUrl;
          }
        } catch (vidErr) {
          console.warn('Video CDN upload fallback:', vidErr);
          const fallbackUrl = await this.uploadToBackendFallback(videoFile);
          if (fallbackUrl) {
            finalVideoUrl = fallbackUrl;
            finalMediaUrl = fallbackUrl;
          }
        }
        completedFilesCount++;
      }

      // 3. Upload PDF Catalogue
      if (pdfFile) {
        try {
          const pdfCdnUrl = await uploadToCloudinary(pdfFile, (pct) => {
            const fileBase = completedFilesCount * getFileWeight();
            const currentWeight = (pct / 100) * getFileWeight();
            this.updateTask(taskId, { progress: Math.min(85, Math.round(fileBase + currentWeight)) });
          }, 'vyapar_catalogues');

          if (pdfCdnUrl) {
            finalPdfUrl = pdfCdnUrl;
            finalMediaUrl = pdfCdnUrl;
          }
        } catch (pdfErr) {
          console.warn('PDF upload fallback:', pdfErr);
          const fallbackUrl = await this.uploadToBackendFallback(pdfFile);
          if (fallbackUrl) {
            finalPdfUrl = fallbackUrl;
            finalMediaUrl = fallbackUrl;
          }
        }
        completedFilesCount++;
      }

      // 4. Upload Custom Thumbnail
      if (thumbnailFile) {
        try {
          const thumbCdnUrl = await uploadToCloudinary(thumbnailFile, undefined, 'vyapar_thumbs');
          if (thumbCdnUrl) {
            finalThumbnailUrl = thumbCdnUrl;
          }
        } catch (thumbErr) {
          console.warn('Thumbnail upload fallback:', thumbErr);
        }
        completedFilesCount++;
      }

      // 5. Upload Attached Audio
      if (audioFile) {
        try {
          const audioCdnUrl = await uploadToCloudinary(audioFile, undefined, 'vyapar_audio');
          if (audioCdnUrl) {
            finalAudioUrl = audioCdnUrl;
          }
        } catch (audioErr) {
          console.warn('Audio upload fallback:', audioErr);
        }
        completedFilesCount++;
      }

      // 6. Sync to Global Firestore & Backend Node Server
      this.updateTask(taskId, { progress: 90, status: 'syncing' });

      const finalPost = {
        ...postDraft,
        mediaUrl: finalMediaUrl || postDraft.mediaUrl || '',
        images: finalMediaUrls.length > 0 ? finalMediaUrls : (finalMediaUrl ? [finalMediaUrl] : (postDraft.images || [])),
        mediaUrls: finalMediaUrls.length > 0 ? finalMediaUrls : (finalMediaUrl ? [finalMediaUrl] : (postDraft.mediaUrls || [])),
        thumbnailUrl: finalThumbnailUrl || postDraft.thumbnailUrl || (finalMediaUrl ? finalMediaUrl : ''),
        videoUrl: finalVideoUrl || postDraft.videoUrl || undefined,
        video: finalVideoUrl || postDraft.video || undefined,
        pdfUrl: finalPdfUrl || postDraft.pdfUrl || undefined,
        persistentMediaUrl: finalMediaUrl || postDraft.persistentMediaUrl || '',
        music: finalAudioUrl ? {
          ...(postDraft.music || {}),
          audioUrl: finalAudioUrl
        } : postDraft.music,
        status: 'approved',
        pending_admin_approval: false,
        createdAt: postDraft.createdAt || Date.now()
      };

      // Node Backend Persistence
      try {
        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalPost)
        });
      } catch (e) {}

      // Direct Firestore Persistence (Do not await to prevent hanging on quota exceed)
      syncPostToFirestore(finalPost).catch(() => {});

      // Dispatch local event for instant UI inclusion across views
      window.dispatchEvent(new CustomEvent('postCreated', { detail: finalPost }));

      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('vyapar_posts_sync');
          bc.postMessage({ type: 'POST_SAVED', post: finalPost });
          bc.close();
        }
      } catch (e) {}

      // 7. Complete!
      this.updateTask(taskId, { progress: 100, status: 'completed' });
      playBubblePopSound();

      // Auto-remove completed task after 4 seconds
      setTimeout(() => {
        this.removeTask(taskId);
      }, 4000);
    } catch (err: any) {
      console.error('Background upload error:', err);
      this.updateTask(taskId, {
        status: 'error',
        errorMessage: err.message || 'Upload failed'
      });
    }
  }

  /**
   * Uploads a Story / Reel in background to Cloudinary CDN
   */
  public async uploadStoryInBackground(params: {
    storyDraft: any;
    mediaFile: File;
    previewUrl?: string;
  }): Promise<void> {
    const { storyDraft, mediaFile, previewUrl } = params;
    const taskId = `story_${storyDraft.id || Date.now()}`;

    const task: UploadTask = {
      id: taskId,
      type: 'story',
      title: storyDraft.content || 'Uploaded Story & Reel',
      previewUrl: previewUrl || storyDraft.mediaUrl || '',
      progress: 5,
      status: 'uploading',
      createdAt: Date.now()
    };

    this.tasks.set(taskId, task);
    this.notify();

    try {
      // 1. Upload to Cloudinary CDN
      let cdnMediaUrl = '';
      try {
        cdnMediaUrl = await uploadToCloudinary(mediaFile, (pct) => {
          this.updateTask(taskId, { progress: Math.min(88, Math.round(pct * 0.88)) });
        }, 'vyapar_stories');
      } catch (cdnErr) {
        console.warn('Story CDN upload fallback to backend:', cdnErr);
        cdnMediaUrl = await this.uploadToBackendFallback(mediaFile);
      }

      if (!cdnMediaUrl) {
        throw new Error('Failed to upload story media to Cloud storage');
      }

      this.updateTask(taskId, { progress: 92, status: 'syncing' });

      // Generate middle thumbnail for video stories so the story card shows the video's center frame
      let videoMiddleThumb = storyDraft.thumbnailUrl || '';
      if (storyDraft.type === 'video' || mediaFile.type?.includes('video')) {
        if (cdnMediaUrl.includes('cloudinary.com')) {
          videoMiddleThumb = getCloudinaryVideoMiddleThumbnail(cdnMediaUrl);
        } else if (!videoMiddleThumb) {
          try {
            videoMiddleThumb = await generateVideoThumbnail(mediaFile);
          } catch (e) {}
        }
      }

      const finalStory = {
        ...storyDraft,
        mediaUrl: cdnMediaUrl,
        thumbnailUrl: videoMiddleThumb || storyDraft.thumbnailUrl || '',
        videoThumbnailUrl: videoMiddleThumb || undefined,
        videoUrl: storyDraft.type === 'video' ? cdnMediaUrl : undefined,
        persistentMediaUrl: cdnMediaUrl,
        status: 'approved',
        createdAt: Date.now()
      };

      // Sync to Server (Reliable Fallback)
      try {
        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalStory)
        });
      } catch (e) {}

      // Sync to Firestore (Fire and forget, do not block)
      syncPostToFirestore(finalStory).catch(() => {});

      window.dispatchEvent(new CustomEvent('postCreated', { detail: finalStory }));
      
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('vyapar_posts_sync');
          bc.postMessage({ type: 'POST_SAVED', post: finalStory });
          bc.close();
        }
      } catch (e) {}

      this.updateTask(taskId, { progress: 100, status: 'completed' });
      playBubblePopSound();

      setTimeout(() => {
        this.removeTask(taskId);
      }, 4000);
    } catch (err: any) {
      console.error('Story background upload error:', err);
      this.updateTask(taskId, {
        status: 'error',
        errorMessage: err.message || 'Story upload failed'
      });
    }
  }

  private async uploadToBackendFallback(file: File | Blob): Promise<string> {
    const formData = new FormData();
    const filename = (file instanceof File && file.name) ? file.name : (file.type?.includes('video') ? 'video.mp4' : 'media.jpg');
    formData.append('media', file, filename);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.url || '';
  }
}

export const backgroundUploader = new BackgroundUploadService();
