import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace in Reel comment handler
content = content.replace(
`  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !reelCommentImagePreview) return;`,
`  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    if (!commentText.trim() && !reelCommentImagePreview) return;`
);

// Replace in Post comment handler
content = content.replace(
`  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && !commentImage && !commentImagePreview) return;`,
`  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    if (!newComment.trim() && !commentImage && !commentImagePreview) return;`
);

fs.writeFileSync('src/App.tsx', content);
