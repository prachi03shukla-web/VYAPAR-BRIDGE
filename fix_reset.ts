import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// 1. Add deletedPostIds to db
content = content.replace(
  `  deletedUserIds: []`,
  `  deletedUserIds: [],\n  deletedPostIds: []`
);

// 2. Modify app.post('/api/admin/reset-database') to populate blocklists
const resetTarget = `      db.users = db.users.filter(u => u.role === 'admin' || String(u.id) === '1');
      db.posts = [];`;
const resetReplacement = `      if (!db.deletedUserIds) db.deletedUserIds = [];
      if (!db.deletedPostIds) db.deletedPostIds = [];
      
      db.users.forEach(u => {
        if (u.role !== 'admin' && String(u.id) !== '1') db.deletedUserIds.push(String(u.id));
      });
      db.posts.forEach(p => db.deletedPostIds.push(String(p.id)));

      db.users = db.users.filter(u => u.role === 'admin' || String(u.id) === '1');
      db.posts = [];`;
content = content.replace(resetTarget, resetReplacement);

// 3. Update syncFromFirestore for posts
const postSyncTarget = `        for (const p of fbPosts) {
          const pUid = String(p.userId || p.user?.id || '');
          if ((db.deletedUserIds || []).includes(pUid)) continue;`;
const postSyncReplacement = `        for (const p of fbPosts) {
          if ((db.deletedPostIds || []).includes(String(p.id))) continue;
          const pUid = String(p.userId || p.user?.id || '');
          if ((db.deletedUserIds || []).includes(pUid)) continue;`;
content = content.replace(postSyncTarget, postSyncReplacement);

// 4. Update the delete post api to populate deletedPostIds
const deletePostApiTarget = `  // Delete a post by ID
  app.delete('/api/posts/:id', async (req, res) => {
    const postId = req.params.id;`;
const deletePostApiReplacement = `  // Delete a post by ID
  app.delete('/api/posts/:id', async (req, res) => {
    const postId = req.params.id;
    if (!db.deletedPostIds) db.deletedPostIds = [];
    if (!db.deletedPostIds.includes(String(postId))) db.deletedPostIds.push(String(postId));`;
content = content.replace(deletePostApiTarget, deletePostApiReplacement);

fs.writeFileSync('server.ts', content);
