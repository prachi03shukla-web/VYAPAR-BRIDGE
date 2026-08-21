import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `onPostDeleted={(id) => setPosts(posts.filter(p => p.id !== id))}`;
const replacementStr = `onPostDeleted={(id) => setPosts(prev => prev.filter(p => p.id !== id))}`;

content = content.replace(targetStr, replacementStr);

const targetStr2 = `onPostUpdated={(updatedPost) => setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p))}`;
const replacementStr2 = `onPostUpdated={(updatedPost) => setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))}`;

content = content.replace(targetStr2, replacementStr2);

fs.writeFileSync('src/App.tsx', content);
