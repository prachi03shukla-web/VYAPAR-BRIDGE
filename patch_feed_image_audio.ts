import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const imageWithAudioComponent = `
function FeedImageWithAudio({
  src,
  audioSrc
}: {
  src: string;
  audioSrc: string;
}) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
          if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            setIsMuted(true);
          }
        }
      });
    }, { threshold: [0.1, 0.2] });
    
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
      if (!newMuted) {
        audioRef.current.play().catch(()=>{});
      } else {
        audioRef.current.pause();
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <img 
        src={src} 
        alt="Post media" 
        className="w-full h-full max-h-[80vh] object-contain bg-black pointer-events-none" 
        onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?auto=format&fit=crop&w=800&q=80';
        }}
      />
      <audio ref={audioRef} src={audioSrc} loop preload="metadata" muted={isMuted} />
      <button
        onClick={toggleMute}
        className="absolute bottom-3 right-3 z-20 p-2.5 rounded-full bg-black/65 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 transition-transform active:scale-95 shadow-xl cursor-pointer"
        title={isMuted ? "Unmute Music" : "Mute Music"}
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
      </button>
    </div>
  );
}
`;

content = content.replace('function FeedVideoPlayer', imageWithAudioComponent + '\nfunction FeedVideoPlayer');
fs.writeFileSync('src/App.tsx', content);
