import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`  const handleLike = async () => {
    // Optimistic Update`,
`  const handleLike = async () => {
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    // Optimistic Update`
);

content = content.replace(
`  const handleSave = async () => {
    // Optimistic Update`,
`  const handleSave = async () => {
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    // Optimistic Update`
);

fs.writeFileSync('src/App.tsx', content);
