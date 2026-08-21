import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `const [userToDelete, setUserToDelete] = useState<any | null>(null);`,
  `const [userToDelete, setUserToDelete] = useState<any | null>(null);\n  const [deleteFromFirebaseM, setDeleteFromFirebaseM] = useState(true);`
);

// We need to find the `confirmDeleteUser` method inside `MasterDeveloperConsoleModal`
// and replace the fetch URL.
content = content.replace(
  `const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const uId = String(userToDelete.id);
    const uName = userToDelete.name || uId;

    // 1. Instant optimistic state update & close modal immediately
    setUsersList(prev => prev.filter(u => String(u.id) !== uId && String(u.username) !== uId));
    setPosts(prev => prev.filter(p => String(p.userId) !== uId && String(p.user?.id) !== uId));
    window.dispatchEvent(new CustomEvent('userDeleted', { detail: { userId: uId } }));
    window.dispatchEvent(new CustomEvent('postDeleted', { detail: { userId: uId } }));

    const tid = toast.loading(\`Deleting \${uName}...\`);
    setUserToDelete(null);

    // 2. Fast non-blocking deletion from Firestore & Server
    try {
      await Promise.allSettled([
        deleteUserFromFirestore(uId, { username: userToDelete.username, phone: userToDelete.phone, email: userToDelete.email }),
        fetch(\`/api/users/\${uId}\`, { method: 'DELETE' })
      ]);
      toast.success(\`User \${uName} deleted completely from Firebase & Server\`, { id: tid });
    } catch (e) {
      toast.success(\`User \${uName} deleted completely\`, { id: tid });
    }
  };`,
  `const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const uId = String(userToDelete.id);
    const uName = userToDelete.name || uId;

    // 1. Instant optimistic state update & close modal immediately
    setUsersList(prev => prev.filter(u => String(u.id) !== uId && String(u.username) !== uId));
    setPosts(prev => prev.filter(p => String(p.userId) !== uId && String(p.user?.id) !== uId));
    window.dispatchEvent(new CustomEvent('userDeleted', { detail: { userId: uId } }));
    window.dispatchEvent(new CustomEvent('postDeleted', { detail: { userId: uId } }));

    const tid = toast.loading(\`Deleting \${uName}...\`);
    setUserToDelete(null);

    // 2. Fast non-blocking deletion from Firestore & Server
    try {
      const promises: Promise<any>[] = [
        fetch(\`/api/users/\${uId}?firebase=\${deleteFromFirebaseM}\`, { method: 'DELETE' })
      ];
      if (deleteFromFirebaseM) {
        promises.push(deleteUserFromFirestore(uId, { username: userToDelete.username, phone: userToDelete.phone, email: userToDelete.email }));
      }
      await Promise.allSettled(promises);
      toast.success(\`User \${uName} deleted completely\`, { id: tid });
    } catch (e) {
      toast.success(\`User \${uName} deleted completely\`, { id: tid });
    }
  };`
);

const masterModalTarget = `<p className="text-xs text-rose-300/90 leading-relaxed bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-xl">
              ⚠️ This will completely purge their profile, posts, catalogs, verification badges, and app data from the server.
            </p>`;

const masterModalReplacement = `<p className="text-xs text-rose-300/90 leading-relaxed bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-xl">
              ⚠️ This will completely purge their profile, posts, catalogs, verification badges, and app data from the server.
            </p>
            <label className="flex items-center gap-2 text-xs font-bold text-rose-500 cursor-pointer p-2 bg-rose-950/20 rounded-xl border border-rose-900/30">
              <input type="checkbox" checked={deleteFromFirebaseM} onChange={(e) => setDeleteFromFirebaseM(e.target.checked)} className="w-4 h-4 rounded text-rose-600 focus:ring-0" />
              Delete from Firebase & Storage (Irreversible)
            </label>`;

content = content.replace(masterModalTarget, masterModalReplacement);

fs.writeFileSync('src/App.tsx', content);
