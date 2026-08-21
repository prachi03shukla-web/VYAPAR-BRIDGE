import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    try {
      await Promise.allSettled([
        deleteUserFromFirestore(uId, { username: userToDelete.username, phone: userToDelete.phone, email: userToDelete.email }),
        fetch(\`/api/users/\${uId}?firebase=\${deleteFromFirebase}\`, { method: 'DELETE' })
      ]);
      toast.success(\`User "\${uName}" deleted permanently from Firebase & Server\`, { id: tid });`;

const replacement = `    try {
      const promises: Promise<any>[] = [
        fetch(\`/api/users/\${uId}?firebase=\${deleteFromFirebase}\`, { method: 'DELETE' })
      ];
      if (deleteFromFirebase) {
        promises.push(deleteUserFromFirestore(uId, { username: userToDelete.username, phone: userToDelete.phone, email: userToDelete.email }));
      }
      await Promise.allSettled(promises);
      toast.success(\`User "\${uName}" deleted permanently\`, { id: tid });`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
