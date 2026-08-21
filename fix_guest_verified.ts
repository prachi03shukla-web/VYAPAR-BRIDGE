import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix 1: Create Post - don't give guest true isVerified
content = content.replace(
`      isVerified: Boolean(user?.isVerified ?? true)`,
`      isVerified: Boolean(user?.isVerified ?? false)`
);

// Fix 2: Reel Upload - don't give guest true isVerified
content = content.replace(
`    const activeUser = currentUser?.id ? currentUser : {
      id: \`user_guest_\${Date.now()}\`,
      name: localStorage.getItem('vyapar_user_name') || 'Vyapar Member',
      role: 'dealer',
      avatarUrl: localStorage.getItem('vyapar_user_avatar') || BRAND_LOGO_SRC,
      avatar: localStorage.getItem('vyapar_user_avatar') || BRAND_LOGO_SRC,
      isVerified: true
    };`,
`    const activeUser = currentUser?.id ? currentUser : {
      id: \`user_guest_\${Date.now()}\`,
      name: localStorage.getItem('vyapar_user_name') || 'Vyapar Member',
      role: 'dealer',
      avatarUrl: localStorage.getItem('vyapar_user_avatar') || BRAND_LOGO_SRC,
      avatar: localStorage.getItem('vyapar_user_avatar') || BRAND_LOGO_SRC,
      isVerified: false
    };`
);

fs.writeFileSync('src/App.tsx', content);
