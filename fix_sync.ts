import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const target = `const fbUserMap = new Map(fbUsers.map(u => [String(u.id), u]));
        // Ignore users that have been explicitly deleted locally
        fbUsers = fbUsers.filter(u => !(db.deletedUserIds || []).includes(String(u.id)));
        db.users = db.users.filter(u => u.role === 'admin' || String(u.id) === '1' || fbUserMap.has(String(u.id)));
        for (const u of fbUsers) {`;

const replacement = `// Ignore users that have been explicitly deleted locally
        fbUsers = fbUsers.filter(u => !(db.deletedUserIds || []).includes(String(u.id)));
        const fbUserMap = new Map(fbUsers.map(u => [String(u.id), u]));
        db.users = db.users.filter(u => u.role === 'admin' || String(u.id) === '1' || fbUserMap.has(String(u.id)));
        for (const u of fbUsers) {`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
