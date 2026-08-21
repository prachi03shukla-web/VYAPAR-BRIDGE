import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const target = `      const postsSnap = await getDocs(collection(firestoreDb, 'posts'));
      if (!postsSnap.empty) {
        const fbPosts = postsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
        for (const p of fbPosts) {`;

const replacement = `      const postsSnap = await getDocs(collection(firestoreDb, 'posts'));
      if (!postsSnap.empty) {
        const fbPosts = postsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
        for (const p of fbPosts) {
          const pUid = String(p.userId || p.user?.id || '');
          if ((db.deletedUserIds || []).includes(pUid)) continue;`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
