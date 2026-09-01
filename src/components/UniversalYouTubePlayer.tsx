import React from 'react';

/**
 * Extracts YouTube video/short ID from any URL format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const str = String(url).trim();
  if (!str) return null;
  
  // Standard 11 character video ID matching
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) return match[1];
  
  // Generic fallback if query params or trailing slashes exist
  const fallback = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([^#&?\/]{11})/);
  if (fallback && fallback[1]) return fallback[1];

  return null;
}

export function isYouTubeUrl(url?: string | null): boolean {
  if (!url) return false;
  const s = String(url).toLowerCase();
  return s.includes('youtube.com') || s.includes('youtu.be');
}

interface UniversalYouTubePlayerProps {
  url: string;
  isReel?: boolean;
  aspectRatio?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
}

export const UniversalYouTubePlayer = React.memo(function UniversalYouTubePlayer({
  url,
  isReel = false,
  aspectRatio,
  className = '',
  autoPlay = false,
  muted = true
}: UniversalYouTubePlayerProps) {
  const ytId = extractYouTubeId(url);

  if (!ytId) {
    return (
      <div className={`relative w-full aspect-video bg-zinc-950 flex flex-col items-center justify-center p-4 rounded-xl text-center border border-zinc-800 ${className}`}>
        <p className="text-xs text-zinc-400 font-medium">Invalid or unsupported video link</p>
      </div>
    );
  }

  const isVertical = isReel || url.includes('/shorts/') || aspectRatio === '9:16' || aspectRatio === '9/16';
  
  // High-performance embed parameters:
  // - playsinline=1 avoids hijacking fullscreen on mobile iOS/Android
  // - rel=0 disables unrelated recommended videos
  // - modestbranding=1 minimizes player overlays
  // - enablejsapi=0 prevents cross-origin postMessage lag
  const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=${autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}&controls=1&rel=0&playsinline=1&modestbranding=1&enablejsapi=0${isVertical ? `&loop=1&playlist=${ytId}` : ''}`;

  return (
    <div
      className={`relative w-full overflow-hidden bg-black flex items-center justify-center rounded-xl shadow-lg select-none ${
        isVertical
          ? 'aspect-[9/16] max-h-[85vh] max-w-[460px] mx-auto'
          : 'aspect-video max-h-[75vh] max-w-full mx-auto'
      } ${className}`}
    >
      <iframe
        key={`yt_${ytId}`}
        src={embedUrl}
        title="YouTube Player"
        className="w-full h-full border-0 pointer-events-auto object-cover"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        loading="eager"
      />
    </div>
  );
});
