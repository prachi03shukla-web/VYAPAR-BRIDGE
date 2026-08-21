import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// First replace the signature to add local state and import our settings functions if needed (they are already imported globally if we put them at the top)

content = content.replace(
`function ProfileSettingsDrawer({ 
  isOpen, 
  onClose, 
  user, 
  onLogout, 
  onOpenEditProfile, 
  onOpenVerify, 
  onOpenApprovalCenter,
  onOpenCalculator,
  onToggleTheme, 
  isDark, 
  onOpenMasterConsole,
  deferredPrompt,
  setDeferredPrompt
}: { `,
`function ProfileSettingsDrawer({ 
  isOpen, 
  onClose, 
  user, 
  onLogout, 
  onOpenEditProfile, 
  onOpenVerify, 
  onOpenApprovalCenter,
  onOpenCalculator,
  onToggleTheme, 
  isDark, 
  onOpenMasterConsole,
  deferredPrompt,
  setDeferredPrompt
}: { `
);

content = content.replace(
`  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(false);`,
`  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(false);
  const [activeView, setActiveView] = useState<'menu' | 'sounds'>('menu');
  const [soundSettings, setSoundSettings] = useState(() => getSoundSettingsSync());
  
  const toggleSound = (key: keyof typeof soundSettings) => {
    const next = { ...soundSettings, [key]: !soundSettings[key] };
    setSoundSettings(next);
    updateSoundSettings(next);
  };
  
  // Reset view when opening/closing
  useEffect(() => {
    if (!isOpen) setActiveView('menu');
  }, [isOpen]);
`
);

content = content.replace(
`        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/90 dark:bg-zinc-900/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Menu className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base tracking-wide">Settings & Navigation</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-black/70 dark:text-zinc-400 hover:text-black dark:hover:text-black cursor-pointer"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>`,
`        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/90 dark:bg-zinc-900/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {activeView === 'sounds' ? (
              <button onClick={() => setActiveView('menu')} className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full cursor-pointer"><ArrowLeft className="w-5 h-5 text-blue-500" /></button>
            ) : (
              <Menu className="w-5 h-5 text-blue-500" />
            )}
            <h3 className="font-bold text-base tracking-wide">{activeView === 'sounds' ? 'Sound Settings' : 'Settings & Navigation'}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-black/70 dark:text-zinc-400 hover:text-black dark:hover:text-black cursor-pointer"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>`
);

fs.writeFileSync('src/App.tsx', content);
