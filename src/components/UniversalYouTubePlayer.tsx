import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

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

export interface UniversalYouTubePlayerProps {
  url: string;
  isReel?: boolean;
  aspectRatio?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  id?: string;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export const UniversalYouTubePlayer = React.memo(function UniversalYouTubePlayer({
  url,
  isReel = false,
  aspectRatio,
  className = '',
  autoPlay = false,
  muted = true,
  id,
  onEnded,
  onPlay,
  onPause
}: UniversalYouTubePlayerProps) {
  const ytId = extractYouTubeId(url);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isPlayingRef = useRef(false);
  const isMountedRef = useRef(true);

  const playerId = useMemo(() => {
    return id || `yt_${ytId || 'media'}_${Math.random().toString(36).substring(2, 8)}`;
  }, [id, ytId]);

  // Command sender via postMessage to YouTube IFrame API
  const sendCommand = useCallback((func: string, args: any[] = []) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: func,
            args: args
          }),
          '*'
        );
      }
    } catch (err) {
      // Ignored cross-domain errors
    }
  }, []);

  const safePause = useCallback(() => {
    isPlayingRef.current = false;
    sendCommand('pauseVideo');
    // Immediately clear browser MediaSession so Android/iOS notification bar removes audio controls
    try {
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
        if (navigator.mediaSession.metadata) {
          navigator.mediaSession.metadata = null;
        }
      }
    } catch (e) {}
  }, [sendCommand]);

  // Reactive sync with autoPlay prop
  useEffect(() => {
    if (!ytId) return;
    if (autoPlay) {
      // Do not autoplay if document is already hidden (e.g. background tab or locked screen)
      if (typeof document !== 'undefined' && document.hidden) {
        safePause();
        return;
      }
      sendCommand('playVideo');
      isPlayingRef.current = true;
    } else {
      safePause();
    }
  }, [autoPlay, ytId, sendCommand, safePause]);

  // Reactive sync with muted prop
  useEffect(() => {
    if (!ytId) return;
    if (muted) {
      sendCommand('mute');
    } else {
      sendCommand('unMute');
    }
  }, [muted, ytId, sendCommand]);

  // CRITICAL: Stop playback when screen turns off, tab switches, or page hides
  useEffect(() => {
    isMountedRef.current = true;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Mobile screen turned off or user switched tab/app
        safePause();
      }
    };

    const handlePageHide = () => {
      safePause();
    };

    const handleWindowBlur = () => {
      // On mobile devices, window blur often fires when power button is pressed
      if (window.innerWidth < 768) {
        safePause();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      isMountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [safePause]);

  // CONFLICT RESOLUTION: Pause when other video plays, or story/reel opens
  useEffect(() => {
    const handleGlobalPlay = (e: any) => {
      const activeId = e?.detail?.id;
      if (activeId && activeId !== playerId) {
        safePause();
      }
    };

    const handlePauseAll = () => {
      safePause();
    };

    const handleReelActive = (e: any) => {
      const active = Boolean(e?.detail?.active);
      // If a reel or story is open, and this YouTube player is in the background feed, pause immediately!
      if (active && !isReel) {
        safePause();
      }
    };

    const handleGlobalMute = (e: any) => {
      const isMuted = Boolean(e?.detail?.muted);
      if (isMuted) sendCommand('mute');
      else sendCommand('unMute');
    };

    window.addEventListener('globalVideoPlay', handleGlobalPlay);
    window.addEventListener('pause_all_feed_videos', handlePauseAll);
    window.addEventListener('vyapar_reel_viewing_active', handleReelActive);
    window.addEventListener('vyapar_global_mute_change', handleGlobalMute);

    return () => {
      window.removeEventListener('globalVideoPlay', handleGlobalPlay);
      window.removeEventListener('pause_all_feed_videos', handlePauseAll);
      window.removeEventListener('vyapar_reel_viewing_active', handleReelActive);
      window.removeEventListener('vyapar_global_mute_change', handleGlobalMute);
    };
  }, [playerId, isReel, safePause, sendCommand]);

  // IntersectionObserver for feed players: pause when scrolled out of view
  useEffect(() => {
    if (isReel) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.25) {
            safePause();
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isReel, safePause]);

  // Listen to incoming postMessage from YouTube Iframe Player
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data) return;
      let data: any = e.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      if (data?.event === 'onReady') {
        if (autoPlay && !(typeof document !== 'undefined' && document.hidden)) {
          sendCommand('playVideo');
        }
        if (muted) sendCommand('mute');
        else sendCommand('unMute');
      }

      if (data?.event === 'onStateChange') {
        // info: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
        if (data.info === 1) {
          // Video started playing
          if (typeof document !== 'undefined' && document.hidden) {
            // Screen is off or tab in background - do not allow playback!
            safePause();
            return;
          }
          isPlayingRef.current = true;
          // Notify the entire platform to pause all other HTML5 videos & YouTube players
          window.dispatchEvent(new CustomEvent('globalVideoPlay', { detail: { id: playerId } }));
          if (isReel) {
            window.dispatchEvent(new CustomEvent('pause_all_feed_videos'));
          }
          onPlay?.();
        } else if (data.info === 0) {
          // Video ended
          isPlayingRef.current = false;
          safePause();
          onEnded?.();
        } else if (data.info === 2) {
          // Video paused
          isPlayingRef.current = false;
          safePause();
          onPause?.();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [playerId, autoPlay, muted, isReel, onEnded, onPlay, onPause, safePause, sendCommand]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      safePause();
      sendCommand('stopVideo');
    };
  }, [safePause, sendCommand]);

  if (!ytId) {
    return (
      <div className={`relative w-full aspect-video bg-zinc-950 flex flex-col items-center justify-center p-4 rounded-xl text-center border border-zinc-800 ${className}`}>
        <p className="text-xs text-zinc-400 font-medium">Invalid or unsupported video link</p>
      </div>
    );
  }

  const isVertical = isReel || url.includes('/shorts/') || aspectRatio === '9:16' || aspectRatio === '9/16';
  const origin = typeof window !== 'undefined' && window.location.origin ? encodeURIComponent(window.location.origin) : '';

  // High-performance embed parameters:
  // - enablejsapi=1 enables programmatic postMessage pauseVideo & mute commands
  // - origin sets security boundary for postMessage
  // - playsinline=1 avoids hijacking fullscreen on mobile iOS/Android
  // - rel=0 disables unrelated recommended videos
  // - modestbranding=1 minimizes player overlays
  const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=${autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}&controls=1&rel=0&playsinline=1&modestbranding=1&enablejsapi=1${origin ? `&origin=${origin}` : ''}${isVertical ? `&loop=1&playlist=${ytId}` : ''}`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-black flex items-center justify-center rounded-xl shadow-lg select-none ${
        isVertical
          ? 'aspect-[9/16] max-h-[85vh] max-w-[460px] mx-auto'
          : 'aspect-video max-h-[75vh] max-w-full mx-auto'
      } ${className}`}
    >
      <iframe
        ref={iframeRef}
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
