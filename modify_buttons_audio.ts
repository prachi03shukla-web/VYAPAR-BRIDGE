import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Inside PostItem
content = content.replace(
`  const handleLike = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser?.id) {`,
`  const handleLike = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isLiked) playLikeSound();
    if (!currentUser?.id) {`
);

content = content.replace(
`  const handleSave = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser?.id) {`,
`  const handleSave = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isSaved) playSaveSound();
    if (!currentUser?.id) {`
);

content = content.replace(
`            <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 active:scale-95 transition-all duration-700">`,
`            <button onClick={() => { playShareSound(); setIsShareModalOpen(true); }} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 active:scale-95 transition-all duration-700">`
);

// We need to inject playEnquirySound in the enquiry button clicks (PostItem)
content = content.replace(
`                // Increment enquiry count locally
                if (post.id) {
                  setEnquiriesCount(prev => prev + 1);
                  recordEnquiryInFirestore(post.id, currentUser?.id || 'anonymous', currentUser?.name || 'A user').catch(()=>{});
                }

                navigate('/chat'); `,
`                // Increment enquiry count locally
                playEnquirySound();
                if (post.id) {
                  setEnquiriesCount(prev => prev + 1);
                  recordEnquiryInFirestore(post.id, currentUser?.id || 'anonymous', currentUser?.name || 'A user').catch(()=>{});
                }

                navigate('/chat'); `
);

content = content.replace(
`                   // Increment enquiry count locally for Send Req
                   if (post.id) {
                     setEnquiriesCount(prev => prev + 1);
                     recordEnquiryInFirestore(post.id, currentUser?.id || 'anonymous', currentUser?.name || 'A user').catch(()=>{});
                   }
                   setIsReqModalOpen(true);`,
`                   // Increment enquiry count locally for Send Req
                   playEnquirySound();
                   if (post.id) {
                     setEnquiriesCount(prev => prev + 1);
                     recordEnquiryInFirestore(post.id, currentUser?.id || 'anonymous', currentUser?.name || 'A user').catch(()=>{});
                   }
                   setIsReqModalOpen(true);`
);

// Inside ReelCard
content = content.replace(
`  const handleLike = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const wasLiked = isLiked;`,
`  const handleLike = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isLiked) playLikeSound();
    
    const wasLiked = isLiked;`
);

content = content.replace(
`  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.id) {`,
`  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSaved) playSaveSound();
    if (!currentUser?.id) {`
);

content = content.replace(
`  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();`,
`  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    playShareSound();`
);

// Fix Enquiry inside ReelCard
content = content.replace(
`            if (reel.id) {
              setEnquiriesCount(prev => prev + 1);
              recordEnquiryInFirestore(reel.id, currentUser?.id || 'anonymous', currentUser?.name || 'A user').catch(()=>{});
            }`,
`            playEnquirySound();
            if (reel.id) {
              setEnquiriesCount(prev => prev + 1);
              recordEnquiryInFirestore(reel.id, currentUser?.id || 'anonymous', currentUser?.name || 'A user').catch(()=>{});
            }`
);

fs.writeFileSync('src/App.tsx', content);
