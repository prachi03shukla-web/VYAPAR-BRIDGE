import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="flex flex-col items-center gap-1 text-white group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center transition-all group-active:scale-125">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold drop-shadow-md">{sharesCount}</span>
        </button>`,
`        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="flex flex-col items-center gap-1 text-white group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center transition-all group-active:scale-125">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold drop-shadow-md">{sharesCount}</span>
        </button>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          className="flex flex-col items-center gap-1 text-white group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center transition-all group-active:scale-125">
            <Bookmark className={cn("w-6 h-6", isSaved && "fill-white")} />
          </div>
          <span className="text-xs font-semibold drop-shadow-md">{savedCount}</span>
        </button>
        
        {/* Enquiry Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (currentUser?.role === 'customer' && currentUser?.membershipType === 'local') {
              const targetCoords = reel?.user?.gpsCoords || reel?.gpsCoords;
              if (userLocation && targetCoords) {
                const dist = calculateDistance(userLocation.lat, userLocation.lng, targetCoords.lat, targetCoords.lng);
                if (dist > 100) {
                  window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: \`📍 Distance Restriction: As a Local Member, you can only inquire with dealers within 100km. This business is \${Math.round(dist)}km away.\` } }));
                  return;
                }
              }
            }
            if (reel.id) {
              setEnquiriesCount(prev => prev + 1);
              fetch(\`/api/posts/\${reel.id}/enquiry\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.id, userName: currentUser?.name || 'A user', postId: reel.id })
              }).catch(()=>{});
            }
            if (onClose) onClose();
            navigate('/chat');
          }}
          className="flex flex-col items-center gap-1 text-emerald-400 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center transition-all group-active:scale-125">
            <MessageSquare className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold drop-shadow-md text-white">{enquiriesCount}</span>
        </button>`
);

fs.writeFileSync('src/App.tsx', content);
