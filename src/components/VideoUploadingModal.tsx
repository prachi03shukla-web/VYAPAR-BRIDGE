import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Video, Upload, Play, Loader2, CheckCircle2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { createVideoPostUrl } from '../services/mediaUrlService';

interface VideoUploadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (payload: { mediaUrl: string; thumbnailUrl: string; duration: number }) => void;
  userId: string;
}

export function VideoUploadingModal({ isOpen, onClose, onUploadSuccess, userId }: VideoUploadingModalProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  
  // Upload status states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const resetState = () => {
    setVideoFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview(null);
    setThumbnailUrl('');
    setVideoDuration(0);
    setUploadProgress(0);
    setIsUploading(false);
    setStatus('idle');
    setErrorMessage('');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('video/') && !selected.name.match(/\.(mp4|webm|mov|m4v)$/i)) {
      toast.error('❌ Please select a valid video file (MP4, WebM, MOV, M4V).');
      return;
    }

    // Maximum video size limit (150MB)
    if (selected.size > 150 * 1024 * 1024) {
      toast.error('❌ Video is too large. Maximum supported size is 150MB.');
      return;
    }

    setStatus('processing');
    setVideoFile(selected);
    const blobUrl = URL.createObjectURL(selected);
    setFilePreview(blobUrl);

    // Auto-generate video thumbnail and duration
    setIsGeneratingThumb(true);
    try {
      const thumb = await generateVideoThumbnail(selected);
      if (thumb) {
        setThumbnailUrl(thumb);
      }
    } catch (err) {
      console.warn('Failed to auto-generate video thumbnail:', err);
    } finally {
      setIsGeneratingThumb(false);
      setStatus('idle');
    }
  };

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const duration = e.currentTarget.duration || 0;
    setVideoDuration(duration);
  };

  const handleUpload = async () => {
    if (!videoFile) return;

    setIsUploading(true);
    setStatus('uploading');
    setUploadProgress(0);

    try {
      const result = await createVideoPostUrl(videoFile, userId, (progressPercent) => {
        setUploadProgress(progressPercent);
      });

      // Successfully uploaded!
      setStatus('success');
      toast.success('🎉 Video uploaded and verified successfully!');
      
      // Delay to show success animation
      setTimeout(() => {
        onUploadSuccess({
          mediaUrl: result.mediaUrl,
          thumbnailUrl: result.thumbnailUrl || thumbnailUrl || BRAND_FALLBACK_THUMB,
          duration: Math.round(videoDuration)
        });
        resetState();
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error('Video upload error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Storage write or quota error');
      toast.error('❌ Upload failed. Please verify your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const BRAND_FALLBACK_THUMB = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="video-upload-modal" className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isUploading) {
              resetState();
              onClose();
            }
          }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Upload Video Post</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Stream high-quality business reels</p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={() => {
                  resetState();
                  onClose();
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6">
            {!videoFile ? (
              /* Drop area */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50 dark:bg-zinc-900/50 hover:bg-amber-50/10"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="video/*"
                  className="hidden"
                />
                <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-zinc-200 mb-1 text-sm">Select high-quality B2B Video</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mb-4">
                  Drag & drop your files or tap to browse. Supports MP4, WebM, MOV (Max 150MB)
                </p>
                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-amber-500/20 transition-all">
                  Browse File
                </button>
              </div>
            ) : (
              /* Video Selected & Processing preview state */
              <div className="space-y-4">
                <div className="aspect-[9/16] max-h-[320px] mx-auto bg-black rounded-2xl overflow-hidden relative border border-slate-200 dark:border-zinc-800">
                  <video
                    ref={videoRef}
                    src={filePreview || undefined}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    controls
                    className="w-full h-full object-cover"
                  />
                  
                  {isGeneratingThumb && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white gap-2 text-xs">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                      <span>Generating video thumbnail...</span>
                    </div>
                  )}
                </div>

                {/* Details list */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">File Name</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">
                      {videoFile.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Video Duration</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {videoDuration ? `${Math.round(videoDuration)} seconds` : 'Reading...'}
                    </span>
                  </div>
                </div>

                {/* Thumbnail Preview strip */}
                {thumbnailUrl && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/20 rounded-xl">
                    <img
                      src={thumbnailUrl}
                      alt="Extracted frame"
                      className="w-12 h-16 object-cover rounded-lg border border-amber-500/30 shadow"
                    />
                    <div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-bold uppercase tracking-wider">
                        Auto Thumbnail Generated
                      </span>
                      <p className="text-xs text-slate-600 dark:text-zinc-300">
                        This preview frame will be displayed on client grids and search results.
                      </p>
                    </div>
                  </div>
                )}

                {/* Progress Bar or Action Buttons */}
                {status === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-zinc-300 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        {uploadProgress < 90 ? 'High-Speed Stream Uploading...' : 'Generating Permanent Stream Link...'}
                      </span>
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-zinc-700/50">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-200 ease-out"
                        style={{ width: `${Math.max(5, uploadProgress)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 text-center">
                      ⚡ Video is directly prepared for zero-buffering global streaming playback.
                    </p>
                  </div>
                )}

                {status === 'success' && (
                  <div className="flex flex-col items-center justify-center p-4 text-center bg-green-500/10 dark:bg-green-500/20 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl gap-2">
                    <CheckCircle2 className="w-8 h-8 animate-bounce" />
                    <span className="text-sm font-bold">Successfully Connected & Verified URL!</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="flex flex-col p-4 bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl gap-2 text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Upload Error Encountered</span>
                    </div>
                    <p>{errorMessage}</p>
                  </div>
                )}

                {/* Footer Controls */}
                {status !== 'uploading' && status !== 'success' && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetState}
                      className="flex-1 py-2.5 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                    >
                      Choose Different Video
                    </button>
                    <button
                      type="button"
                      onClick={handleUpload}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Start Uploading
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
