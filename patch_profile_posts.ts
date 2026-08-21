import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`          {/* Posts Wall Grid */}
          <div className="grid grid-cols-3 gap-1 sm:gap-4">
            {userPosts.map((post, idx) => (
              <div 
                key={post.id} 
                onClick={() => setActiveProfilePostIndex(idx)}
                className="relative aspect-square bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden group cursor-pointer shadow-sm"
              >
                {post.type === 'video' && post.mediaUrl ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={post.thumbnailUrl || 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?auto=format&fit=crop&w=400&q=80'} 
                      alt={post.title || 'Post'} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white backdrop-blur-sm">
                      <Film className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ) : post.mediaUrl ? (
                  <img src={post.mediaUrl} alt={post.title || 'Post'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full p-3 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-slate-500/10 flex flex-col justify-center items-center text-center">
                    <Sparkles className="w-6 h-6 text-blue-500 mb-1" />
                    <p className="text-[11px] font-bold text-black dark:text-zinc-100 line-clamp-2 px-1">{post.title || post.content || 'Vyapar Post'}</p>
                    <span className="text-[9px] text-black/60 dark:text-zinc-400 mt-1 uppercase tracking-wider">{post.userRole || 'Member'}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-black font-bold text-sm">
                  <span className="flex items-center gap-1.5"><Heart className="w-5 h-5 fill-white" /> {post.likesCount || 0}</span>
                  <span className="flex items-center gap-1.5"><MessageCircle className="w-5 h-5 fill-white" /> {post.commentsCount || 0}</span>
                </div>
                {post.type === 'video' && (
                  <div className="absolute top-2 right-2 text-black drop-shadow-md">
                    <Film className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {userPosts.length === 0 && (
              <div className="col-span-3 py-16 text-center text-black/60 font-medium">
                No posts found on this profile wall yet.
              </div>
            )}
          </div>`,
`          {/* Posts Wall Feed */}
          <div className="flex flex-col gap-4">
            {userPosts.map((post, idx) => (
              <PostItem
                key={post.id}
                post={post}
                currentUser={currentUser}
                onPostClick={() => setActiveProfilePostIndex(idx)}
                onReelClick={() => setActiveProfilePostIndex(idx)}
              />
            ))}
            {userPosts.length === 0 && (
              <div className="py-16 text-center text-black/60 font-medium">
                No posts found on this profile wall yet.
              </div>
            )}
          </div>`
);

fs.writeFileSync('src/App.tsx', content);
