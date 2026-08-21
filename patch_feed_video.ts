import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`function FeedVideoPlayer({
  src,
  poster,
  className
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);`,
`function FeedVideoPlayer({
  src,
  poster,
  className,
  audioSrc
}: {
  src: string;
  poster?: string;
  className?: string;
  audioSrc?: string;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);`
);

content = content.replace(
`          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            }
          } else {
            video.pause();
            setIsPlaying(false);
          }`,
`          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                  if (audioRef.current) audioRef.current.play().catch(()=>{});
                })
                .catch(() => setIsPlaying(false));
            }
          } else {
            video.pause();
            if (audioRef.current) audioRef.current.pause();
            setIsPlaying(false);
          }`
);

content = content.replace(
`    if (video.paused) {
      const p = video.play();
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }`,
`    if (video.paused) {
      const p = video.play();
      if (p !== undefined) {
        p.then(() => {
          setIsPlaying(true);
          if (audioRef.current) audioRef.current.play().catch(()=>{});
        }).catch(() => {});
      }
    } else {
      video.pause();
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    }`
);

content = content.replace(
`  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };`,
`  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !isMuted;
    video.muted = newMuted;
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
      if (!newMuted && isPlaying) {
        audioRef.current.play().catch(()=>{});
      }
    }
    setIsMuted(newMuted);
  };`
);

content = content.replace(
`        onError={() => setHasError(true)}
        className={className || "w-full h-full max-h-[80vh] object-contain bg-black transform-gpu will-change-transform"}
      />`,
`        onError={() => setHasError(true)}
        className={className || "w-full h-full max-h-[80vh] object-contain bg-black transform-gpu will-change-transform"}
      />
      {audioSrc && <audio ref={audioRef} src={audioSrc} loop preload="metadata" muted={isMuted} />}`
);

fs.writeFileSync('src/App.tsx', content);
