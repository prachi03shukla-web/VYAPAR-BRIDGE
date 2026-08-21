import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `const [isDeletingUser, setIsDeletingUser] = useState(false);`,
  `const [isDeletingUser, setIsDeletingUser] = useState(false);\n  const [deleteFromFirebase, setDeleteFromFirebase] = useState(true);`
);

content = content.replace(
  `        fetch(\`/api/users/\${uId}\`, { method: 'DELETE' })`,
  `        fetch(\`/api/users/\${uId}?firebase=\${deleteFromFirebase}\`, { method: 'DELETE' })`
);

const modalReplaceTarget = `<p className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-2.5 rounded-xl leading-relaxed">
              ⚠️ This will purge their profile, posts, reels, comments, and account data completely from Firestore and server storage.
            </p>`;

const modalReplacement = `<p className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-2.5 rounded-xl leading-relaxed">
              ⚠️ This will purge their profile, posts, reels, comments, and account data completely from server storage.
            </p>
            <label className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 cursor-pointer p-2 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
              <input type="checkbox" checked={deleteFromFirebase} onChange={(e) => setDeleteFromFirebase(e.target.checked)} className="w-4 h-4 rounded text-red-600 focus:ring-0" />
              Delete from Firebase & Storage (Irreversible)
            </label>`;

content = content.replace(modalReplaceTarget, modalReplacement);

fs.writeFileSync('src/App.tsx', content);
