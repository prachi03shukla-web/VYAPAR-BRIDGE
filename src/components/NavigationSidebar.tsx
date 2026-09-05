import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Home,
  MessageSquare,
  Plus,
  User,
  Shield,
  ShoppingCart,
  Scan,
  Megaphone,
  Gift,
  Calculator,
  Star,
  FileText,
  LogOut,
  LogIn,
  UserPlus,
  BadgeCheck,
  Building2,
  Phone,
  ChevronRight,
  Sparkles,
  Crown,
  Terminal,
  KeyRound,
  Wrench,
  Bot,
  ArrowDownToDot,
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { BRAND_LOGO_SRC, BRAND_NAME } from '../constants/brandLogo';
import { resolveUserAvatar } from '../utils/userAvatar';
import { safeSaveUser } from '../utils/safeStorage';

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdateUser: (u: any) => void;
  onOpenCreatePost: () => void;
  onOpenCart: () => void;
  onOpenScanner: () => void;
  onOpenBoost: () => void;
  onOpenReferral: () => void;
  onOpenCalculator: () => void;
  onOpenRating: () => void;
  onOpenTerms: () => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onLogOut: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  isOpen,
  onClose,
  user,
  onOpenCreatePost,
  onOpenCart,
  onOpenScanner,
  onOpenBoost,
  onOpenReferral,
  onOpenCalculator,
  onOpenRating,
  onOpenTerms,
  onOpenAuth,
  onLogOut
}) => {
  const navigate = useNavigate();
  const { isDark, toggleDark } = useTheme();
  const [isAiOnHome, setIsAiOnHome] = useState<boolean>(() => {
    return localStorage.getItem('vyapar_ai_pinned_home') === 'true';
  });

  useEffect(() => {
    const syncState = () => {
      setIsAiOnHome(localStorage.getItem('vyapar_ai_pinned_home') === 'true');
    };
    window.addEventListener('extractAiToHomeScreen', syncState);
    window.addEventListener('dockAiToMenu', syncState);
    return () => {
      window.removeEventListener('extractAiToHomeScreen', syncState);
      window.removeEventListener('dockAiToMenu', syncState);
    };
  }, []);

  const handleExtractAiToHome = () => {
    localStorage.setItem('vyapar_ai_pinned_home', 'true');
    setIsAiOnHome(true);
    window.dispatchEvent(new CustomEvent('extractAiToHomeScreen'));
    toast.success('🤖 AI Assistant होम स्क्रीन पर आ गया! (मेन्यू बटन की तरफ ड्रैग करके वापस भी डाल सकते हैं)');
    onClose();
  };

  const handleDockAiToMenu = () => {
    localStorage.setItem('vyapar_ai_pinned_home', 'false');
    setIsAiOnHome(false);
    window.dispatchEvent(new CustomEvent('dockAiToMenu'));
    toast.success('📥 AI Assistant वापस 3-लाइन मेन्यू में सुरक्षित डाल दिया गया!');
  };

  if (!isOpen) return null;

  const isAdmin = user && (user.role === 'admin' || user.isAdmin === true || user.username === 'manit' || user.phone === '9889104477');

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div className="relative w-84 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300 border-r border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden p-1 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md flex items-center justify-center">
              <img src={BRAND_LOGO_SRC} alt="Vyapar Bridge" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-sm tracking-tight leading-none uppercase block">{BRAND_NAME}</span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none block mt-0.5">Navigation Menu</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* User Profile Card */}
          {user ? (
            <div className="p-3.5 bg-gradient-to-br from-blue-50/60 to-indigo-50/50 border border-blue-100/80 rounded-2xl shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={resolveUserAvatar(user)}
                    alt={user.name || 'User'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm bg-white"
                  />
                  {(user.goldenBadge || user.isVerified) && (
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-xs" title="Verified Trader">
                      <BadgeCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-slate-900 truncate">
                      {user.name || user.companyName || 'Trader'}
                    </span>
                    {user.goldenBadge && (
                      <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                  </div>
                  {user.companyName && user.companyName !== user.name && (
                    <p className="text-xs text-slate-600 truncate flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{user.companyName}</span>
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {user.role || 'Member'}
                    </span>
                    {user.goldenBadge ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-600 fill-amber-600" />
                        <span>Golden VIP</span>
                      </span>
                    ) : user.isVerified ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3 text-blue-600 fill-blue-600" />
                        <span>Blue Verified</span>
                      </span>
                    ) : (
                      <button 
                        onClick={() => { onClose(); onOpenBoost(); }}
                        className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 flex items-center gap-1 shadow-2xs cursor-pointer animate-pulse"
                      >
                        <Crown className="w-3 h-3" />
                        <span>Upgrade Plan</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleNav(`/profile/${user.id}`)}
                className="w-full mt-3 py-1.5 px-3 bg-white hover:bg-slate-50 border border-blue-200 text-blue-600 hover:text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-between shadow-2xs"
              >
                <span>View Full Profile & Catalogues</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 rounded-2xl text-center space-y-3 shadow-xs">
              <div className="w-11 h-11 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Welcome to Vyapar Bridge</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Sign in to connect, post catalogues & trade directly.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => { onClose(); onOpenAuth('login'); }}
                  className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => { onClose(); onOpenAuth('register'); }}
                  className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black uppercase rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            </div>
          )}

          {/* Vyapar Gemini AI Assistant Section inside 3-Line Menu */}
          <div className="p-3.5 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-amber-600/15 border-2 border-amber-300/80 rounded-2xl space-y-2.5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 100 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 40 || info.velocity.x > 150) {
                      handleExtractAiToHome();
                    }
                  }}
                  className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-black flex items-center justify-center text-2xl shadow-md border-2 border-amber-400 cursor-grab active:cursor-grabbing shrink-0 relative select-none touch-none hover:scale-105 transition-transform"
                  title="👉 उंगली रखकर बाहर खींचें (Drag out to Home Screen)"
                >
                  <span>🤖</span>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-black"></span>
                  </span>
                </motion.div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-slate-900 truncate">
                      Vyapar Gemini AI
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                      {isAiOnHome ? 'Screen Pinned' : 'In 3-Line Menu'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-tight truncate">
                    व्यापार AI असिस्टेंट व समाधान
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              {isAiOnHome 
                ? '🤖 AI अभी आपकी होम स्क्रीन पर फ्लोट कर रहा है। इसे कभी भी मेन्यू में वापस भेज सकते हैं।' 
                : '🤖 AI 3-लाइन मेन्यू में सुरक्षित है। बाहर निकालने के लिए 🤖 पर उंगली रखकर खींचें या बटन दबाएं।'}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('openVyaparAiChat'));
                }}
                className="py-2 px-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-black text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Chat with AI</span>
              </button>

              {isAiOnHome ? (
                <button
                  type="button"
                  onClick={handleDockAiToMenu}
                  className="py-2 px-2 bg-white hover:bg-slate-50 active:scale-98 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 border border-slate-300 shadow-2xs cursor-pointer"
                  title="मेन्यू के अंदर वापस रखें"
                >
                  <ArrowDownToDot className="w-3.5 h-3.5 text-amber-600" />
                  <span className="truncate">Dock to Menu</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleExtractAiToHome}
                  className="py-2 px-2 bg-amber-200/80 hover:bg-amber-300 active:scale-98 text-amber-950 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1 border border-amber-400/70 shadow-2xs cursor-pointer"
                  title="होम स्क्रीन पर निकालें"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-800" />
                  <span className="truncate">Drag to Screen</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Navigation */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Core Navigation
            </p>
            <button
              onClick={() => handleNav('/')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 transition-colors text-xs font-bold"
            >
              <Home className="w-4.5 h-4.5 text-blue-600" />
              <span>Home Feed (होम फ़ीड)</span>
            </button>
            <button
              onClick={() => handleNav('/directory')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:text-amber-600 hover:bg-amber-50/70 transition-colors text-xs font-bold"
            >
              <Building2 className="w-4.5 h-4.5 text-amber-500" />
              <span>Business Directory (व्यापार डायरेक्टरी)</span>
            </button>
            <button
              onClick={() => handleNav('/chat')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 transition-colors text-xs font-bold"
            >
              <MessageSquare className="w-4.5 h-4.5 text-indigo-600" />
              <span>B2B WhatsApp Chat (चैट व पूछताछ)</span>
            </button>
            <button
              onClick={() => { onClose(); onOpenBoost(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-amber-950 bg-gradient-to-r from-amber-200/90 via-yellow-100 to-amber-200/90 hover:from-amber-300 hover:to-amber-200 transition-all text-xs font-black border border-amber-300 shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-4.5 h-4.5 text-amber-700 fill-amber-500 animate-bounce" />
                <span>Subscription Mode (प्लान व पेमेंट)</span>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-amber-500 text-slate-950 rounded-md shadow-2xs">
                ₹99 / ₹1,188
              </span>
            </button>
            <button
              onClick={() => {
                onClose();
                if (!user) {
                  onOpenAuth('login');
                } else {
                  onOpenCreatePost();
                }
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-700 bg-blue-50/90 hover:bg-blue-100 transition-colors text-xs font-extrabold"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>Create Post / Upload Catalogue (पोस्ट बनाएं)</span>
            </button>
            {user && (
              <button
                onClick={() => handleNav(`/profile/${user.id}`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 transition-colors text-xs font-bold"
              >
                <User className="w-4.5 h-4.5 text-teal-600" />
                <span>My Business Profile (मेरी प्रोफाइल)</span>
              </button>
            )}
          </div>

          {/* Business Tools & Utilities */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Trader Tools & Services
            </p>
            <button
              onClick={() => { onClose(); onOpenCart(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors text-xs font-bold"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4.5 h-4.5 text-amber-500" />
                <span>Customer Cart & Coupons</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => { onClose(); onOpenScanner(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors text-xs font-bold"
            >
              <div className="flex items-center gap-3">
                <Scan className="w-4.5 h-4.5 text-emerald-500" />
                <span>Seller Discount Scanner</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => { onClose(); onOpenBoost(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors text-xs font-bold"
            >
              <div className="flex items-center gap-3">
                <Megaphone className="w-4.5 h-4.5 text-purple-600" />
                <span>Boost Business & Verification</span>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-md">Ad</span>
            </button>
            <button
              onClick={() => { onClose(); onOpenReferral(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors text-xs font-bold"
            >
              <div className="flex items-center gap-3">
                <Gift className="w-4.5 h-4.5 text-rose-500" />
                <span>Referral & Rewards</span>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-md">₹1000</span>
            </button>
            <button
              onClick={() => { onClose(); onOpenCalculator(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors text-xs font-bold"
            >
              <div className="flex items-center gap-3">
                <Calculator className="w-4.5 h-4.5 text-cyan-600" />
                <span>Tile & Material Calculator</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => { onClose(); onOpenRating(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors text-xs font-bold"
            >
              <div className="flex items-center gap-3">
                <Star className="w-4.5 h-4.5 text-yellow-500 fill-yellow-500/30" />
                <span>Rate Platform & Feedback</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => { onClose(); onOpenTerms(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors text-xs font-bold"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4.5 h-4.5 text-slate-500" />
                <span>Terms & Privacy Policy</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Admin Console & Controls - ONLY VISIBLE TO AUTHENTICATED ADMIN */}
          {isAdmin && (
            <div className="pt-2 border-t border-slate-200">
              <div className="p-3 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl space-y-2.5 shadow-md border border-indigo-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider block">
                        👑 Admin & Dev Console
                      </span>
                      <span className="text-[9px] text-slate-300 font-medium block -mt-0.5">
                        ब्रांडिंग, पेमेंट्स व सिस्टम नियंत्रण
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Logged In
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleNav('/admin?tab=branding')}
                    className="py-2 px-2.5 bg-amber-600 hover:bg-amber-500 active:scale-98 text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Top Branding</span>
                  </button>
                  <button
                    onClick={() => handleNav('/admin?tab=dev_console')}
                    className="py-2 px-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Dev Console</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 space-y-2">
          {/* Dark / Light Theme Mode Switcher */}
          <button
            onClick={toggleDark}
            className="w-full py-2.5 px-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700/80 text-slate-800 dark:text-zinc-100 text-xs font-bold rounded-xl transition-colors flex items-center justify-between cursor-pointer shadow-2xs"
            title="Toggle Light / Dark Mode"
          >
            <div className="flex items-center gap-2.5">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              <span>{isDark ? 'Light Theme (लाइट थीम)' : 'Dark Theme (डार्क थीम)'}</span>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </button>

          {user ? (
            <button
              onClick={() => { onClose(); onLogOut(); }}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-black uppercase rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Account</span>
            </button>
          ) : (
            <button
              onClick={() => { onClose(); onOpenAuth('login'); }}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Your Account</span>
            </button>
          )}

          <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Vyapar Bridge Network • v2.6</span>
          </div>
        </div>
      </div>
    </div>
  );
};
