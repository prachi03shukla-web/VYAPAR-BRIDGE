import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// 1. Add deletedUserIds to db
content = content.replace(
  `  reports: [],\n};`,
  `  reports: [],\n  deletedUserIds: []\n};`
);

// 2. Ignore deletedUserIds in syncFromFirestore
const syncTarget = `const fbUserMap = new Map(fbUsers.map(u => [String(u.id), u]));`;
const syncReplacement = `const fbUserMap = new Map(fbUsers.map(u => [String(u.id), u]));\n        // Ignore users that have been explicitly deleted locally\n        fbUsers = fbUsers.filter(u => !(db.deletedUserIds || []).includes(String(u.id)));`;
content = content.replace(syncTarget, syncReplacement);

// 3. Add to deletedUserIds when deleting in API
const deleteApiTarget = `// Delete user profile and all associated data
  app.delete('/api/users/:id', async (req, res) => {`;
const deleteApiReplacement = `// Delete user profile and all associated data
  app.delete('/api/users/:id', async (req, res) => {
    const isFirebaseDelete = req.query.firebase === 'true';`;
content = content.replace(deleteApiTarget, deleteApiReplacement);

const deleteLogicTarget = `const match = uId === lowerParam || uUname === lowerParam || uPhone === rawParam || (uEmail && uEmail === lowerParam);
      return !match;
    });`;
const deleteLogicReplacement = `const match = uId === lowerParam || uUname === lowerParam || uPhone === rawParam || (uEmail && uEmail === lowerParam);
      if (match) {
        if (!db.deletedUserIds) db.deletedUserIds = [];
        if (!db.deletedUserIds.includes(String(u.id))) db.deletedUserIds.push(String(u.id));
      }
      return !match;
    });`;
content = content.replace(deleteLogicTarget, deleteLogicReplacement);

const firestoreDeleteTarget = `if (firestoreDb) {`;
const firestoreDeleteReplacement = `if (firestoreDb && isFirebaseDelete) {`;
content = content.replace(firestoreDeleteTarget, firestoreDeleteReplacement);

fs.writeFileSync('server.ts', content);
