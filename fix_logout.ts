import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`  const handleLogout = () => {
    setIsSettingsDrawerOpen(false);
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };`,
`  const handleLogout = () => {
    setIsSettingsDrawerOpen(false);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('Vyapar Bridge_user');
    toast.success('Logged out successfully');
  };`
);

fs.writeFileSync('src/App.tsx', content);
