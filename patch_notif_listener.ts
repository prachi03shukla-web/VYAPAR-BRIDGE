import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const notifEffect = `
  useEffect(() => {
    if (!user?.id) return;
    let isInitialLoad = true;
    const q = query(
      collection(db, 'users', String(user.id), 'notifications'),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let currentUnread = snapshot.docs.length;
      setUnreadNotifs(currentUnread);
      
      // If it's not the initial load and we have new notifications
      if (!isInitialLoad) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            playMessageSound();
            toast(data.message || 'You have a new notification', {
              icon: '🔔',
              style: {
                borderRadius: '10px',
                background: isDark ? '#18181b' : '#fff',
                color: isDark ? '#fff' : '#000',
              },
            });
          }
        });
      }
      isInitialLoad = false;
    }, (error) => {
      console.log('Notifs listener error:', error);
    });

    return () => unsubscribe();
  }, [user?.id, isDark]);
`;

content = content.replace(
`function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);`,
`function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

${notifEffect}`
);

fs.writeFileSync('src/App.tsx', content);
