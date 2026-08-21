import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
`function Chat({ user, onOpenVerify, userLocation }: { user: any; onOpenVerify?: () => void; userLocation?: {lat: number, lng: number} | null }) {
  const [messages, setMessages] = useState<any[]>([]);`,
`function Chat({ user, onOpenVerify, userLocation }: { user: any; onOpenVerify?: () => void; userLocation?: {lat: number, lng: number} | null }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate('/');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
    }
  }, [user]);

  const [messages, setMessages] = useState<any[]>([]);`
);

content = content.replace(
`  if (!user) {
    return (
      <div className="h-[calc(100vh-60px)] flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
        <MessageCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Sign in to view messages</h2>
        <p className="text-slate-500 mb-6 max-w-sm">Connect directly with factories, dealers, and customers on Vyapar Bridge.</p>
        <Link to="/" onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors">Sign In</Link>
      </div>
    );
  }`,
`  if (!user) return null;`
);

fs.writeFileSync('src/App.tsx', content);
