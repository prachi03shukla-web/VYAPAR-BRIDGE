import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`  const mediaSrc = post.mediaUrl || post.persistentMediaUrl || post.videoUrl || post.thumbnailUrl || (post.id ? localStorage.getItem('vyapar_video_' + post.id) : null);
  const [isFollowing, setIsFollowing] = useState(() => isUserFollowed(post.userId));`,
`  const mediaSrc = post.mediaUrl || post.persistentMediaUrl || post.videoUrl || post.thumbnailUrl || (post.id ? localStorage.getItem('vyapar_video_' + post.id) : null);
  const postMusic = post.music || (post.musicTitle ? { title: post.musicTitle, artist: post.musicArtist, audioUrl: post.musicUrl } : null);
  const [isFollowing, setIsFollowing] = useState(() => isUserFollowed(post.userId));`
);

content = content.replace(
`          ) : (post.type === 'video' || mediaSrc.startsWith('data:video') || mediaSrc.includes('/uploads/') || mediaSrc.match(/\\.(mp4|webm|mov|m4v|mkv|3gp)(\\?.*)?$/i)) && !mediaSrc.match(/\\.(jpg|jpeg|png|webp|gif|svg|avif)(\\?.*)?$/i) ? (
            <FeedVideoPlayer src={mediaSrc} poster={post.thumbnailUrl} className="w-full h-full max-h-[80vh] object-contain bg-black" />`,
`          ) : (post.type === 'video' || mediaSrc.startsWith('data:video') || mediaSrc.includes('/uploads/') || mediaSrc.match(/\\.(mp4|webm|mov|m4v|mkv|3gp)(\\?.*)?$/i)) && !mediaSrc.match(/\\.(jpg|jpeg|png|webp|gif|svg|avif)(\\?.*)?$/i) ? (
            <FeedVideoPlayer src={mediaSrc} poster={post.thumbnailUrl} className="w-full h-full max-h-[80vh] object-contain bg-black" audioSrc={postMusic?.audioUrl} />`
);

content = content.replace(
`          ) : (
            <img 
              src={mediaSrc} 
              alt="Post media" 
              className="w-full h-full max-h-[80vh] object-contain bg-black pointer-events-none" 
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?auto=format&fit=crop&w=800&q=80';
              }}
            />
          )}`,
`          ) : postMusic?.audioUrl ? (
            <FeedImageWithAudio src={mediaSrc} audioSrc={postMusic.audioUrl} />
          ) : (
            <img 
              src={mediaSrc} 
              alt="Post media" 
              className="w-full h-full max-h-[80vh] object-contain bg-black pointer-events-none" 
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?auto=format&fit=crop&w=800&q=80';
              }}
            />
          )}`
);

fs.writeFileSync('src/App.tsx', content);
