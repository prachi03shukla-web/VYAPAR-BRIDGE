import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`    const q = query(
      collection(db, 'users', String(user.id), 'notifications'),
      where('read', '==', false)
    );`,
`    const q = query(
      collection(firestoreDb, 'users', String(user.id), 'notifications'),
      where('read', '==', false)
    );`
);

fs.writeFileSync('src/App.tsx', content);
