import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetFunc = `  const handleDeletePost = async () => {
    const postId = String(post.id);
    try {
      // 1. Direct Firestore & LocalStorage permanent deletion
      await deletePostFromFirestore(postId);

      // 2. Background API sync
      try {
        await fetch(\`/api/posts/\${postId}\`, { method: 'DELETE' });
      } catch (e) {}

      toast.success('Post deleted successfully');
      if (onPostDeleted) onPostDeleted(post.id);
      window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId } }));
      window.dispatchEvent(new CustomEvent('reelDeleted', { detail: { reelId: postId } }));
    } catch (e) {
      toast.success('Post deleted');
      if (onPostDeleted) onPostDeleted(post.id);
      window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId } }));
    }
    setShowOptions(false);
  };`;

const replacementFunc = `  const handleDeletePost = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const postId = String(post.id);
    
    // Immediate Optimistic UI updates
    setShowOptions(false);
    if (onPostDeleted) onPostDeleted(post.id);
    window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId } }));
    window.dispatchEvent(new CustomEvent('reelDeleted', { detail: { reelId: postId } }));

    try {
      // 1. Direct Firestore & LocalStorage permanent deletion
      await deletePostFromFirestore(postId);

      // 2. Background API sync
      try {
        await fetch(\`/api/posts/\${postId}\`, { method: 'DELETE' });
      } catch (e) {}

      toast.success('Post deleted successfully');
    } catch (e) {
      toast.success('Post deleted');
    }
  };`;

content = content.replace(targetFunc, replacementFunc);

// Update JSX binding
content = content.replace(
  `<button onClick={handleDeletePost} className="w-full text-left px-4 py-3 text-red-600 font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 border-b border-slate-100 dark:border-zinc-800">
                    Delete Post
                  </button>`,
  `<button onClick={(e) => handleDeletePost(e)} className="w-full text-left px-4 py-3 text-red-600 font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 border-b border-slate-100 dark:border-zinc-800">
                    Delete Post
                  </button>`
);

fs.writeFileSync('src/App.tsx', content);
