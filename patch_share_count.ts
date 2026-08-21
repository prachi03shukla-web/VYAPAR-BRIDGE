import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// ReelCard handleShare
content = content.replace(
`  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reel?.id) recordShareInFirestore(reel.id);`,
`  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSharesCount(prev => prev + 1);
    playShareSound();
    if (reel?.id) recordShareInFirestore(reel.id);`
);

// ReelCard handleShare with playShareSound() that we might have already added
content = content.replace(
`  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    playShareSound();`,
`  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    playShareSound();
    setSharesCount(prev => prev + 1);`
);


// And in PostItem:
content = content.replace(
`            <button onClick={() => { playShareSound(); setIsShareModalOpen(true); }} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 active:scale-95 transition-all duration-700">
              <svg aria-label="Share Post" className="w-6 h-6" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
            </button>`,
`            <button onClick={() => { playShareSound(); setSharesCount(prev => prev + 1); setIsShareModalOpen(true); }} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 active:scale-95 transition-all duration-700">
              <svg aria-label="Share Post" className="w-6 h-6" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
              {sharesCount > 0 && <span className="font-semibold">{sharesCount}</span>}
            </button>`
);

fs.writeFileSync('src/App.tsx', content);
