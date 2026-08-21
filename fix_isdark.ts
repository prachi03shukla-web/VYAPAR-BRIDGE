import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { isDark, toggleDark } = React.useContext(ThemeContext);`,
`  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
`
);

content = content.replace(
`function AppContent() {
  const [user, setUser] = useState<any>(null);`,
`function AppContent() {
  const { isDark, toggleDark } = React.useContext(ThemeContext);
  const [user, setUser] = useState<any>(null);`
);

fs.writeFileSync('src/App.tsx', content);
