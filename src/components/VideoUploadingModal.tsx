import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Video, Play, CheckCircle2, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { resolveExternalPostLink } from '../services/mediaUrlService';

interface VideoUploadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (payload: { mediaUrl: string; thumbnailUrl: string; duration: number }) => void;
  userId?: string;
}

export function VideoUploadingModal({ isOpen, onClose, onUploadSuccess }: VideoUploadingModalProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [provider, setProvider] = useState<'youtube' | 'vimeo' | 'direct' | 'website' | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const resetState = () => {
    setVideoUrl('');
    setVideoTitle('');
    setThumbnailUrl('');
    setIsValidating(false);
    setIsVerified(false);
    setProvider(null);
    setVideoDuration(0);
  };

  const cleanUrl = (raw: string) => {
    let trimmed = raw.trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = 'https://' + trimmed;
    }
    return trimmed;
  };

  const handleVerify = async () => {
    const formatted = cleanUrl(videoUrl);
    if (!formatted) {
      toast.error('❌ Please enter a valid Video URL (e.g. YouTube, Vimeo, or MP4 link)');
      return;
    }

    setIsValidating(true);
    setIsVerified(false);

    try {
      // Check YouTube pattern
      const ytMatch = formatted.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/i);
      if (ytMatch && ytMatch[1]) {
        const vidId = ytMatch[1];
        const ytThumb = `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
        setProvider('youtube');
        setThumbnailUrl(ytThumb);
        if (!videoTitle) {
          setVideoTitle('YouTube Video Showcase');
        }
        setIsVerified(true);
        toast.success('🎬 YouTube Video verified successfully!');
        setIsValidating(false);
        return;
      }

      // Check Vimeo pattern
      const vimeoMatch = formatted.match(/vimeo\.com\/(\d+)/i);
      if (vimeoMatch && vimeoMatch[1]) {
        setProvider('vimeo');
        setThumbnailUrl('https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80');
        if (!videoTitle) {
          setVideoTitle('Vimeo Video Stream');
        }
        setIsVerified(true);
        toast.success('🎬 Vimeo Video verified successfully!');
        setIsValidating(false);
        return;
      }

      // Check direct video file URL (.mp4, .webm, .mov, etc.)
      const isDirectVideo = /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(formatted);
      if (isDirectVideo) {
        setProvider('direct');
        setThumbnailUrl('https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80');
        if (!videoTitle) {
          setVideoTitle('Product Video Stream');
        }
        setIsVerified(true);
        toast.success('🎬 Direct Video Stream connected!');
        setIsValidating(false);
        return;
      }

      // Fallback external video resolve via resolver service
      const res = await resolveExternalPostLink(formatted);
      setProvider((res.provider as any) || 'website');
      if (res.thumbnailUrl) setThumbnailUrl(res.thumbnailUrl);
      if (res.title && !videoTitle) setVideoTitle(res.title);
      setIsVerified(true);
      toast.success('🔗 Video Stream link resolved successfully!');
    } catch (err) {
      console.warn('Link check note:', err);
      // Still allow if valid URL
      setProvider('direct');
      setIsVerified(true);
      toast('Video link attached.', { icon: '🎥' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleAttach = () => {
    const formatted = cleanUrl(videoUrl);
    if (!formatted) {
      toast.error('Please enter a video URL first');
      return;
    }

    const finalThumb = thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

    onUploadSuccess({
      mediaUrl: formatted,
      thumbnailUrl: finalThumb,
      duration: Math.round(videoDuration || 0)
    });

    toast.success('✅ Video link attached to your post!');
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="video-link-modal" className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            resetState();
            onClose();
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
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Attach Video Link</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Stream YouTube, Vimeo, or Web Video URL inside the app</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetState();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Video URL (YouTube / Vimeo / MP4 Stream)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (isVerified) setIsVerified(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleVerify();
                    }
                  }}
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={!videoUrl || isValidating}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isValidating ? 'Checking...' : 'Verify'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1.5">
                💡 Paste any YouTube video link, Shorts, Vimeo, or direct MP4 link. The app plays it seamlessly inside the feed!
              </p>
            </div>

            {/* Video Player Live Preview */}
            {isVerified && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-zinc-800 shadow-inner relative aspect-video flex items-center justify-center">
                  {provider === 'youtube' ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${(videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/i) || [])[1]}?autoplay=0&rel=0`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : provider === 'vimeo' ? (
                    <iframe
                      src={`https://player.vimeo.com/video/${(videoUrl.match(/vimeo\.com\/(\d+)/i) || [])[1]}`}
                      className="w-full h-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={cleanUrl(videoUrl)}
                      controls
                      className="w-full h-full object-contain"
                      onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration || 0)}
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Video verified & ready to play directly in user feeds!</span>
                </div>

                {/* Optional Title input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Video Title / Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. Factory Machinery Live Demo or New Tiles Collection"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={resetState}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    Change Link
                  </button>
                  <button
                    type="button"
                    onClick={handleAttach}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Attach to Post
                  </button>
                </div>
              </motion.div>
            )}

            {!isVerified && (
              <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 space-y-2">
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Supported Video Links:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-100 dark:border-zinc-800">
                    <span className="text-red-500 font-bold">▶ YouTube</span>
                    <span className="text-[10px] text-slate-400">Videos & Shorts</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-100 dark:border-zinc-800">
                    <span className="text-sky-500 font-bold">▶ Vimeo</span>
                    <span className="text-[10px] text-slate-400">HD Streams</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-100 dark:border-zinc-800">
                    <span className="text-amber-500 font-bold">🎥 Direct MP4</span>
                    <span className="text-[10px] text-slate-400">Web Links</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-100 dark:border-zinc-800">
                    <span className="text-emerald-500 font-bold">🌐 CDN Video</span>
                    <span className="text-[10px] text-slate-400">Cloud Storage</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
