import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`  const handleSave = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isSaved) playSaveSound();
    if (!currentUser?.id) {
      toast.error('🔐 Please Login or Register to Save posts!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    const wasSaved = isSaved;
    const nextState = !wasSaved;
    setIsSaved(nextState);
    setPostSavedInLocalStorage(post.id, nextState);
    toast.success(nextState ? 'Saved post!' : 'Removed from saved');

    // Direct Firestore Sync
    const fsRes = await savePostInFirestore(post.id, currentUser.id, wasSaved, post);
    if (fsRes && fsRes.success) {
      setIsSaved(fsRes.isSaved);
      return;
    }`,
`  const handleSave = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isSaved) playSaveSound();
    if (!currentUser?.id) {
      toast.error('🔐 Please Login or Register to Save posts!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    const wasSaved = isSaved;
    const nextState = !wasSaved;
    const nextCount = wasSaved ? Math.max(0, savedCount - 1) : savedCount + 1;
    setIsSaved(nextState);
    setSavedCount(nextCount);
    setPostSavedInLocalStorage(post.id, nextState);
    toast.success(nextState ? 'Saved post!' : 'Removed from saved');

    // Direct Firestore Sync
    const fsRes = await savePostInFirestore(post.id, currentUser.id, wasSaved, post);
    if (fsRes && fsRes.success) {
      setIsSaved(fsRes.isSaved);
      if (fsRes.savedCount !== undefined) setSavedCount(fsRes.savedCount);
      return;
    }`
);

fs.writeFileSync('src/App.tsx', content);
