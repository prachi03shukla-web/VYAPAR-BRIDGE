import React from 'react';
import { X, Download, ZoomIn, ZoomOut, Maximize2, ExternalLink } from 'lucide-react';

interface CommentMediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  userName?: string;
  userAvatar?: string;
  commentText?: string;
}

export function CommentMediaLightbox({
  isOpen,
  onClose,
  imageUrl,
  userName = 'Member',
  userAvatar,
  commentText
}: CommentMediaLightboxProps) {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (isOpen) {
      setScale(1);
    }
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `comment_media_${Date.now()}.${imageUrl.includes('image/gif') || imageUrl.endsWith('.gif') ? 'gif' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl w-full max-h-[90vh] bg-zinc-950/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-7 h-7 rounded-full object-cover border border-zinc-700" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-white leading-tight">{userName}</p>
              <p className="text-[10px] text-zinc-400">Comment Attachment Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScale((s) => Math.min(3, s + 0.25))}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.open(imageUrl, '_blank')}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Open full size in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 ml-1 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Container */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden bg-black/40 min-h-[300px]">
          <img
            src={imageUrl}
            alt="Full comment media preview"
            style={{ transform: `scale(${scale})` }}
            className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg transition-transform duration-150 shadow-md cursor-zoom-in"
            onClick={() => setScale((s) => (s === 1 ? 1.6 : 1))}
          />
        </div>

        {/* Caption footer if present */}
        {commentText && (
          <div className="px-4 py-2.5 bg-zinc-900/80 border-t border-zinc-800 text-xs text-zinc-200">
            <span className="text-zinc-400 font-semibold">{userName}:</span> {commentText}
          </div>
        )}
      </div>
    </div>
  );
}
