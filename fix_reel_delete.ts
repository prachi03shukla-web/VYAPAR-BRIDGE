import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetFunc = `  const handleDelete = async () => {
    const reelId = String(reel?.id || '');
    if (!reelId) return;
    try {
      // 1. Direct Firestore & LocalStorage permanent deletion
      await deletePostFromFirestore(reelId);

      // 2. Background API sync
      try {
        await safeFetch(\`/api/posts/\${reelId}\`, { method: 'DELETE' });
      } catch (e) {}

      toast.success('Reel deleted successfully');
      setShowOptionsModal(false);
      if (onClose) onClose();
      // Notify other components
      window.dispatchEvent(new CustomEvent('reelDeleted', { detail: { reelId } }));
      window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId: reelId } }));
    } catch (err) {
      toast.success('Reel deleted');
      setShowOptionsModal(false);
      if (onClose) onClose();
      window.dispatchEvent(new CustomEvent('reelDeleted', { detail: { reelId } }));
      window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId: reelId } }));
    }
  };`;

const replacementFunc = `  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const reelId = String(reel?.id || '');
    if (!reelId) return;
    
    // Immediate Optimistic UI updates
    setShowOptionsModal(false);
    if (onClose) onClose();
    window.dispatchEvent(new CustomEvent('reelDeleted', { detail: { reelId } }));
    window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId: reelId } }));

    try {
      // 1. Direct Firestore & LocalStorage permanent deletion
      await deletePostFromFirestore(reelId);

      // 2. Background API sync
      try {
        await safeFetch(\`/api/posts/\${reelId}\`, { method: 'DELETE' });
      } catch (e) {}

      toast.success('Reel deleted successfully');
    } catch (err) {
      toast.success('Reel deleted');
    }
  };`;

content = content.replace(targetFunc, replacementFunc);

// Update JSX binding
content = content.replace(
  `<button onClick={handleDelete} className="w-full text-left px-4 py-3 hover:bg-zinc-800 border-b border-zinc-800 font-semibold text-red-500 cursor-pointer">
                Delete Reel
              </button>`,
  `<button onClick={(e) => handleDelete(e)} className="w-full text-left px-4 py-3 hover:bg-zinc-800 border-b border-zinc-800 font-semibold text-red-500 cursor-pointer">
                Delete Reel
              </button>`
);

fs.writeFileSync('src/App.tsx', content);
