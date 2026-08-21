import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 transition-colors duration-700">
              <Heart className={cn("w-6 h-6 transition-all duration-700 active:scale-95", isLiked ? "text-red-500 fill-red-500" : "")} />
            </button>
            <button onClick={() => setShowComments(!showComments)} className="text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 active:scale-95 transition-all duration-700"><MessageCircle className="w-6 h-6" /></button>
            <button onClick={() => setIsShareModalOpen(true)} className="text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 active:scale-95 transition-all duration-700">
              <svg aria-label="Share Post" className="w-6 h-6" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                
                // Distance Check for Local Customer Members
                if (currentUser?.role === 'customer' && currentUser?.membershipType === 'local') {
                  const targetCoords = post?.user?.gpsCoords || post?.gpsCoords;
                  if (userLocation && targetCoords) {
                    const dist = calculateDistance(userLocation.lat, userLocation.lng, targetCoords.lat, targetCoords.lng);
                    if (dist > 100) {
                      toast.error(\`📍 Distance Restriction: As a Local Member, you can only inquire with dealers within 100km. This business is \${Math.round(dist)}km away. Upgrade to 'Direct Company' plan for nationwide access!\`);
                      return;
                    }
                  } else if (!userLocation) {
                    toast.error("📍 Please enable GPS/Location to verify distance for Local Membership.");
                    return;
                  }
                }

                navigate('/chat'); 
              }} 
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-95 transition-all duration-700 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700/60"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Inquiry</span>
            </button>
            {currentUser?.role === 'customer' && (post?.user?.role === 'dealer' || post?.user?.role === 'factory') && (
              <button
                 onClick={(e) => {
                   e.stopPropagation();
                   if (!currentUser?.isVerified) {
                     toast.error('Only Verified (Paid) Customers can send direct requirements. Please upgrade your account to Premium.');
                     return;
                   }
                   setIsReqModalOpen(true);
                 }}
                 className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 active:scale-95 transition-all duration-700 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-700/60"
                 title="Send Requirements to Company"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Send Req</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
          {isOwnPost && (
          <button 
            onClick={() => setShowStatsModal(true)}
            className="flex items-center gap-1.5 text-[11px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <BarChart2 className="w-4 h-4 text-blue-500" />
            <span>Insights</span>
          </button>
          )}
          <button onClick={handleSave} className="text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 transition-colors duration-700">
            <Bookmark className={cn("w-6 h-6 transition-all duration-700 active:scale-95", isSaved ? "text-black dark:text-zinc-50 fill-slate-900 dark:fill-white" : "")} />
          </button>
        </div>`,
`          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 transition-colors duration-700">
              <Heart className={cn("w-6 h-6 transition-all duration-700 active:scale-95", isLiked ? "text-red-500 fill-red-500" : "")} />
              {likesCount > 0 && <span className="text-sm font-semibold">{likesCount}</span>}
            </button>
            <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 active:scale-95 transition-all duration-700">
              <MessageCircle className="w-6 h-6" />
              {commentsCount > 0 && <span className="text-sm font-semibold">{commentsCount}</span>}
            </button>
            <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 active:scale-95 transition-all duration-700">
              <svg aria-label="Share Post" className="w-6 h-6" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
              {sharesCount > 0 && <span className="text-sm font-semibold">{sharesCount}</span>}
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                
                // Distance Check for Local Customer Members
                if (currentUser?.role === 'customer' && currentUser?.membershipType === 'local') {
                  const targetCoords = post?.user?.gpsCoords || post?.gpsCoords;
                  if (userLocation && targetCoords) {
                    const dist = calculateDistance(userLocation.lat, userLocation.lng, targetCoords.lat, targetCoords.lng);
                    if (dist > 100) {
                      toast.error(\`📍 Distance Restriction: As a Local Member, you can only inquire with dealers within 100km. This business is \${Math.round(dist)}km away. Upgrade to 'Direct Company' plan for nationwide access!\`);
                      return;
                    }
                  } else if (!userLocation) {
                    toast.error("📍 Please enable GPS/Location to verify distance for Local Membership.");
                    return;
                  }
                }

                // Increment enquiry count locally
                if (post.id) {
                  setEnquiriesCount(prev => prev + 1);
                  // Fire and forget fetch request
                  fetch(\`/api/posts/\${post.id}/enquiry\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser?.id, userName: currentUser?.name || 'A user', postId: post.id })
                  }).catch(()=>{});
                }

                navigate('/chat'); 
              }} 
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-95 transition-all duration-700 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700/60"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Inquiry</span>
              {enquiriesCount > 0 && <span className="text-[10px] font-bold">{enquiriesCount}</span>}
            </button>
            {currentUser?.role === 'customer' && (post?.user?.role === 'dealer' || post?.user?.role === 'factory') && (
              <button
                 onClick={(e) => {
                   e.stopPropagation();
                   if (!currentUser?.isVerified) {
                     toast.error('Only Verified (Paid) Customers can send direct requirements. Please upgrade your account to Premium.');
                     return;
                   }
                   
                   // Increment enquiry count locally for Send Req
                   if (post.id) {
                     setEnquiriesCount(prev => prev + 1);
                     fetch(\`/api/posts/\${post.id}/enquiry\`, {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ userId: currentUser?.id, userName: currentUser?.name || 'A user', postId: post.id })
                     }).catch(()=>{});
                   }
                   setIsReqModalOpen(true);
                 }}
                 className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 active:scale-95 transition-all duration-700 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-700/60"
                 title="Send Requirements to Company"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Send Req</span>
                {enquiriesCount > 0 && <span className="text-[10px] font-bold">{enquiriesCount}</span>}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
          {isOwnPost && (
          <button 
            onClick={() => setShowStatsModal(true)}
            className="flex items-center gap-1.5 text-[11px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <BarChart2 className="w-4 h-4 text-blue-500" />
            <span>Insights</span>
          </button>
          )}
          <button onClick={handleSave} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 transition-colors duration-700">
            <Bookmark className={cn("w-6 h-6 transition-all duration-700 active:scale-95", isSaved ? "text-black dark:text-zinc-50 fill-slate-900 dark:fill-white" : "")} />
            {savedCount > 0 && <span className="text-sm font-semibold">{savedCount}</span>}
          </button>
        </div>`
);

fs.writeFileSync('src/App.tsx', content);
