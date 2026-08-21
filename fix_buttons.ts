import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`            <button onClick={handleLike} className="text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 transition-colors duration-700">
              <Heart className={cn("w-6 h-6 transition-all duration-700 active:scale-95", isLiked ? "text-red-500 fill-red-500" : "")} />
            </button>
            <button onClick={() => setShowComments(!showComments)} className="text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 active:scale-95 transition-all duration-700"><MessageCircle className="w-6 h-6" /></button>
            <button onClick={() => setIsShareModalOpen(true)} className="text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 active:scale-95 transition-all duration-700">
              <svg aria-label="Share Post" className="w-6 h-6" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
            </button>`,
`            <button onClick={handleLike} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 transition-colors duration-700">
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
            </button>`
);

content = content.replace(
`            <button onClick={handleSave} className="text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 transition-colors duration-700">
              <Bookmark className={cn("w-6 h-6 transition-all duration-700 active:scale-95", isSaved ? "text-black fill-black dark:text-white dark:fill-white" : "")} />
            </button>`,
`            <button onClick={handleSave} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 transition-colors duration-700">
              <Bookmark className={cn("w-6 h-6 transition-all duration-700 active:scale-95", isSaved ? "text-black fill-black dark:text-white dark:fill-white" : "")} />
              {savedCount > 0 && <span className="text-sm font-semibold">{savedCount}</span>}
            </button>`
);

fs.writeFileSync('src/App.tsx', content);
