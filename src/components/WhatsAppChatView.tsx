import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  Smile, 
  Phone, 
  Search, 
  CheckCheck, 
  MessageSquare, 
  BadgeCheck, 
  Crown, 
  ExternalLink, 
  Trash2, 
  X, 
  Camera, 
  Sparkles,
  Lock,
  Download,
  Palette,
  RotateCcw,
  Upload,
  Check,
  Settings,
  FileText,
  MapPin,
  UserPlus,
  Volume2,
  VolumeX,
  Shield,
  Eye,
  Navigation,
  Share2,
  Sliders,
  FileSpreadsheet,
  Reply,
  Copy,
  Info,
  Star,
  Mail,
  BookUser,
  Contact,
  Smartphone,
  UserCheck,
  Bot,
  Wand2,
  Lightbulb,
  Zap,
  MessageSquarePlus,
  HelpCircle,
  Video,
  Package,
  MoreVertical,
  Mic,
  MicOff,
  Store,
  BarChart2,
  Calendar,
  QrCode,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { 
  subscribeToUsersFromFirestore, 
  isUserActiveOnline, 
  getUserLastActiveFormatted 
} from '../services/firebaseDataSync';
import { cn } from '../lib/utils';
import { BRAND_LOGO_SRC, BRAND_NAME } from '../constants/brandLogo';
import { resolveUserAvatar } from '../utils/userAvatar';
import { optimizeImageForPersistence } from '../utils/imageOptimizer';
import { 
  playMessageSentSound, 
  playMessageReceivedSound, 
  playDoubleTickSound 
} from '../utils/chatSoundEffects';

interface WhatsAppChatViewProps {
  user: any;
  userLocation?: { lat: number; lng: number } | null;
  onOpenSubscription?: () => void;
}

interface RecommendedPost {
  id: string;
  title: string;
  price?: number | string;
  unit?: string;
  moq?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt?: any;
  likesCount?: number;
  viewsCount?: number;
  category?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  imageUrl?: string;
  mediaType?: 'image' | 'pdf' | 'location' | 'contact' | 'audio';
  documentUrl?: string;
  documentName?: string;
  fileSize?: string;
  locationData?: {
    lat: number;
    lng: number;
    address?: string;
    mapUrl?: string;
  };
  contactData?: {
    name: string;
    phone?: string;
    email?: string;
    companyName?: string;
    city?: string;
  };
  audioDuration?: number;
  quotedMessage?: {
    id: string;
    text: string;
    senderName: string;
  };
  isAiGenerated?: boolean;
  aiAssistantName?: string;
  recommendedPosts?: RecommendedPost[];
  reactions?: Array<{ emoji: string; userId: string; userName?: string }>;
  createdAt: number | string;
  status?: 'sent' | 'delivered' | 'read';
  read?: boolean;
  readAt?: number;
  deletedForEveryone?: boolean;
  deletedForMe?: string[];
  isStarred?: boolean;
}

const TRADE_QUICK_EMOJIS = ['👍', '🙏', '🤝', '📦', '💰', '🏢', '✨', '💯', '✅', '🔥', '🚚', '📍', '📋', '🏷️'];

// Comprehensive Theme Color Spectrum & Swatches
const COLOR_SPECTRUM_SWATCHES = [
  { name: 'WhatsApp Dark', color: '#0b141a', textColor: '#ffffff' },
  { name: 'Teal Forest', color: '#005c4b', textColor: '#ffffff' },
  { name: 'Emerald Green', color: '#0d2822', textColor: '#ffffff' },
  { name: 'Navy Midnight', color: '#0f172a', textColor: '#ffffff' },
  { name: 'Deep Indigo', color: '#1e1b4b', textColor: '#ffffff' },
  { name: 'Royal Slate', color: '#182229', textColor: '#ffffff' },
  { name: 'Charcoal Noir', color: '#18181b', textColor: '#ffffff' },
  { name: 'Wine Velvet', color: '#4c0519', textColor: '#ffffff' },
  { name: 'Warm Mocha', color: '#271c19', textColor: '#ffffff' },
  { name: 'Sunset Bronze', color: '#431407', textColor: '#ffffff' },
  { name: 'Classic Beige', color: '#efeae2', textColor: '#111827' },
  { name: 'Cream Linen', color: '#f8fafc', textColor: '#0f172a' },
  { name: 'Mint Soft', color: '#e6f4ea', textColor: '#064e3b' },
  { name: 'Rose Petal', color: '#fdf2f8', textColor: '#831843' },
  { name: 'Ocean Sky', color: '#f0f9ff', textColor: '#0c4a6e' }
];

export interface BubbleThemeConfig {
  preset: string;
  sentColor1: string;
  sentColor2: string;
  sentTextColor: string;
  receivedColor1: string;
  receivedColor2: string;
  receivedTextColor: string;
  gradientAngle: number;
  animationEnabled: boolean;
  animationType: 'gradient_flow' | 'glow_pulse' | 'chroma_shimmer' | 'both';
  animationSpeed: number; // in seconds, e.g. 2.5
}

export const BUBBLE_PRESETS: { id: string; name: string; icon: string; desc: string; config: BubbleThemeConfig }[] = [
  {
    id: 'emerald_glow',
    name: 'Emerald Mint Glow',
    icon: '🌿',
    desc: 'B2B Verified Mint with Neon Shimmer',
    config: {
      preset: 'emerald_glow',
      sentColor1: '#059669',
      sentColor2: '#10b981',
      sentTextColor: '#ffffff',
      receivedColor1: '#0f766e',
      receivedColor2: '#14b8a6',
      receivedTextColor: '#ffffff',
      gradientAngle: 135,
      animationEnabled: true,
      animationType: 'both',
      animationSpeed: 2.5
    }
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Neon Twilight',
    icon: '🌌',
    desc: 'Electric Blue into Ultraviolet Glow',
    config: {
      preset: 'cyber_neon',
      sentColor1: '#2563eb',
      sentColor2: '#8b5cf6',
      sentTextColor: '#ffffff',
      receivedColor1: '#1e293b',
      receivedColor2: '#334155',
      receivedTextColor: '#ffffff',
      gradientAngle: 135,
      animationEnabled: true,
      animationType: 'both',
      animationSpeed: 2.0
    }
  },
  {
    id: 'sunset_fire',
    name: 'Sunset Amber Fire',
    icon: '🔥',
    desc: 'Vibrant Orange to Gold Pulse',
    config: {
      preset: 'sunset_fire',
      sentColor1: '#ea580c',
      sentColor2: '#f59e0b',
      sentTextColor: '#ffffff',
      receivedColor1: '#7c2d12',
      receivedColor2: '#9a3412',
      receivedTextColor: '#ffffff',
      gradientAngle: 120,
      animationEnabled: true,
      animationType: 'glow_pulse',
      animationSpeed: 3.0
    }
  },
  {
    id: 'royal_sapphire',
    name: 'Royal Sapphire & Cyan',
    icon: '💎',
    desc: 'Cobalt Blue with Vibrant Cyan Flow',
    config: {
      preset: 'royal_sapphire',
      sentColor1: '#1e40af',
      sentColor2: '#06b6d4',
      sentTextColor: '#ffffff',
      receivedColor1: '#0f172a',
      receivedColor2: '#1e293b',
      receivedTextColor: '#ffffff',
      gradientAngle: 140,
      animationEnabled: true,
      animationType: 'gradient_flow',
      animationSpeed: 2.2
    }
  },
  {
    id: 'rose_gold',
    name: 'Rose Gold & Ruby',
    icon: '🌸',
    desc: 'Deep Magenta into Luminous Pink',
    config: {
      preset: 'rose_gold',
      sentColor1: '#be185d',
      sentColor2: '#f43f5e',
      sentTextColor: '#ffffff',
      receivedColor1: '#831843',
      receivedColor2: '#9d174d',
      receivedTextColor: '#ffffff',
      gradientAngle: 135,
      animationEnabled: true,
      animationType: 'both',
      animationSpeed: 2.8
    }
  },
  {
    id: 'obsidian_amber',
    name: 'Obsidian Gold VIP',
    icon: '🪐',
    desc: 'Charcoal Black with Honey Amber Aura',
    config: {
      preset: 'obsidian_amber',
      sentColor1: '#27272a',
      sentColor2: '#b45309',
      sentTextColor: '#fef08a',
      receivedColor1: '#18181b',
      receivedColor2: '#3f3f46',
      receivedTextColor: '#e4e4e7',
      gradientAngle: 135,
      animationEnabled: true,
      animationType: 'glow_pulse',
      animationSpeed: 3.5
    }
  },
  {
    id: 'chroma_rainbow',
    name: 'Rainbow Chroma Wave',
    icon: '🌈',
    desc: 'Continuous Prismatic Spectrum Cycle',
    config: {
      preset: 'chroma_rainbow',
      sentColor1: '#ec4899',
      sentColor2: '#6366f1',
      sentTextColor: '#ffffff',
      receivedColor1: '#06b6d4',
      receivedColor2: '#10b981',
      receivedTextColor: '#ffffff',
      gradientAngle: 90,
      animationEnabled: true,
      animationType: 'chroma_shimmer',
      animationSpeed: 1.8
    }
  },
  {
    id: 'classic_whatsapp',
    name: 'Classic WhatsApp',
    icon: '💬',
    desc: 'Standard WhatsApp Pale Green & Slate',
    config: {
      preset: 'classic_whatsapp',
      sentColor1: '#d9fdd3',
      sentColor2: '#d9fdd3',
      sentTextColor: '#111b21',
      receivedColor1: '#ffffff',
      receivedColor2: '#ffffff',
      receivedTextColor: '#111b21',
      gradientAngle: 180,
      animationEnabled: false,
      animationType: 'gradient_flow',
      animationSpeed: 3.0
    }
  }
];

const QUICK_PALETTE_COLORS = [
  '#059669', '#10b981', '#005c4b', '#0d9488',
  '#2563eb', '#3b82f6', '#7c3aed', '#8b5cf6',
  '#ea580c', '#f59e0b', '#e11d48', '#f43f5e',
  '#18181b', '#27272a', '#d97706', '#06b6d4',
  '#0284c7', '#4f46e5', '#9333ea', '#db2777'
];

const DEFAULT_BUBBLE_CONFIG: BubbleThemeConfig = BUBBLE_PRESETS[0].config;

export function WhatsAppChatView({ user, userLocation }: WhatsAppChatViewProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserIdParam = searchParams.get('user') || searchParams.get('userId');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeContact, setActiveContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [selectedMsgForAction, setSelectedMsgForAction] = useState<ChatMessage | null>(null);
  const [showReactionPickerForMsg, setShowReactionPickerForMsg] = useState<ChatMessage | null>(null);
  const [onlineHandoverNotice, setOnlineHandoverNotice] = useState<string | null>(null);
  const prevContactOnlineRef = useRef<boolean>(false);
  const longPressTimerRef = useRef<any>(null);

  // Settings Modal State (Gear Button)
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'bubbles' | 'theme' | 'sound' | 'privacy' | 'ai_assistant'>('bubbles');

  // Custom Bubble Theme & Animated Glow Engine State
  const [bubbleConfig, setBubbleConfig] = useState<BubbleThemeConfig>(() => {
    try {
      const saved = localStorage.getItem('vyapar_bubble_theme_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return DEFAULT_BUBBLE_CONFIG;
  });

  const handleUpdateBubbleConfig = (newConfig: Partial<BubbleThemeConfig>) => {
    setBubbleConfig(prev => {
      const updated = { ...prev, ...newConfig, preset: newConfig.preset || 'custom' };
      try {
        localStorage.setItem('vyapar_bubble_theme_config', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleSelectBubblePreset = (presetObj: typeof BUBBLE_PRESETS[0]) => {
    setBubbleConfig(presetObj.config);
    try {
      localStorage.setItem('vyapar_bubble_theme_config', JSON.stringify(presetObj.config));
    } catch (e) {}
    toast.success(`✨ Chat Bubble style "${presetObj.name}" applied!`);
  };

  // Helper function to generate CSS styles for bubbles
  const getBubbleStyle = (isOwn: boolean): React.CSSProperties => {
    if (bubbleConfig.preset === 'classic_whatsapp' && !bubbleConfig.animationEnabled) {
      return {};
    }

    const c1 = isOwn ? bubbleConfig.sentColor1 : bubbleConfig.receivedColor1;
    const c2 = isOwn ? bubbleConfig.sentColor2 : bubbleConfig.receivedColor2;
    const textColor = isOwn ? bubbleConfig.sentTextColor : bubbleConfig.receivedTextColor;
    const angle = bubbleConfig.gradientAngle || 135;

    const style: React.CSSProperties = {
      background: `linear-gradient(${angle}deg, ${c1}, ${c2})`,
      backgroundSize: bubbleConfig.animationEnabled ? '220% 220%' : '100% 100%',
      color: textColor || '#ffffff',
    };

    (style as any)['--bubble-glow-color'] = `${c2}bb`;

    if (bubbleConfig.animationEnabled) {
      const dur = Math.max(0.6, bubbleConfig.animationSpeed || 2.5);
      const speedStr = `${dur}s`;
      if (bubbleConfig.animationType === 'gradient_flow') {
        style.animation = `bubbleGradientFlow ${speedStr} ease-in-out infinite`;
      } else if (bubbleConfig.animationType === 'glow_pulse') {
        style.animation = `bubbleGlowPulse ${speedStr} ease-in-out infinite`;
      } else if (bubbleConfig.animationType === 'chroma_shimmer') {
        style.animation = `bubbleChromaShimmer ${speedStr} linear infinite, bubbleGlowPulse ${speedStr} ease-in-out infinite`;
      } else if (bubbleConfig.animationType === 'both') {
        style.animation = `bubbleGradientFlow ${speedStr} ease-in-out infinite, bubbleGlowPulse ${speedStr} ease-in-out infinite`;
      }
    }

    return style;
  };


  // AI Assistant & Auto-Reply State
  const [showAiAssistBar, setShowAiAssistBar] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isGeneratingAiSuggestion, setIsGeneratingAiSuggestion] = useState(false);
  const [aiAutoReplyEnabled, setAiAutoReplyEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('vyapar_ai_auto_reply_enabled');
    if (saved !== null) return saved === 'true';
    return user?.aiAutoReplyEnabled ?? true;
  });
  const [aiAutoReplyMode, setAiAutoReplyMode] = useState<'when_offline' | 'always'>(() => {
    return (localStorage.getItem('vyapar_ai_auto_reply_mode') as any) || user?.aiAutoReplyMode || 'when_offline';
  });
  const [aiCustomInstructions, setAiCustomInstructions] = useState<string>(() => {
    return localStorage.getItem('vyapar_ai_custom_instructions') || user?.aiCustomInstructions || '';
  });
  const [aiTone, setAiTone] = useState<string>(() => {
    return localStorage.getItem('vyapar_ai_tone') || user?.aiTone || 'professional_courteous';
  });
  const [testAiResponse, setTestAiResponse] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);

  // Sub-modals for Attachments
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [customContactName, setCustomContactName] = useState('');
  const [customContactPhone, setCustomContactPhone] = useState('');
  const [customContactEmail, setCustomContactEmail] = useState('');
  const [customContactCompany, setCustomContactCompany] = useState('');
  const [directoryContactSearch, setDirectoryContactSearch] = useState('');
  const vcfInputRef = useRef<HTMLInputElement>(null);

  // Custom Wallpaper (Stored strictly in client-side LocalStorage, 0 database hits!)
  const [customWallpaper, setCustomWallpaper] = useState<string>(() => {
    return localStorage.getItem('vyapar_chat_custom_wallpaper') || 'default';
  });

  // Sound Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('vyapar_chat_sound_enabled') !== 'false';
  });

  // Privacy Settings
  const [onlinePrivacy, setOnlinePrivacy] = useState<boolean>(() => {
    return localStorage.getItem('vyapar_chat_online_privacy') !== 'false';
  });

  const [readReceipts, setReadReceipts] = useState<boolean>(() => {
    return localStorage.getItem('vyapar_chat_read_receipts') !== 'false';
  });

  // File uploading refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [pendingImagePreview, setPendingImagePreview] = useState<string>('');
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  // Voice recording & Speech recognition state
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleToggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast('🎙️ Voice message / Speech recognition not supported in this browser.', { icon: '🎙️' });
      return;
    }

    if (isListeningVoice) {
      try { recognitionRef.current?.stop(); } catch (e) {}
      setIsListeningVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListeningVoice(true);
        try { navigator.vibrate?.(40); } catch (e) {}
        toast('🎙️ Listening... Bolna shuru kijiye', { id: 'voice-toast', duration: 3000 });
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setNewMessage(prev => (prev ? prev + ' ' : '') + transcript);
      };

      recognition.onerror = () => {
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListeningVoice(false);
    }
  };

  // Message scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch & Subscribe to Users for Contact List
  useEffect(() => {
    if (!user?.id) return;

    const unsub = subscribeToUsersFromFirestore((fbUsers) => {
      if (Array.isArray(fbUsers) && fbUsers.length > 0) {
        const otherUsers = fbUsers.filter((u: any) => String(u.id) !== String(user.id));
        setContacts(otherUsers);
      }
    });

    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setContacts(prev => {
            const map = new Map();
            data.filter((u: any) => String(u.id) !== String(user.id)).forEach(u => map.set(String(u.id), u));
            prev.forEach(u => map.set(String(u.id), { ...map.get(String(u.id)), ...u }));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [user?.id]);

  // 2. Fetch Messages from Local/Backend API & Local Storage
  useEffect(() => {
    if (!user?.id) return;

    const loadLocalMessages = () => {
      try {
        const saved = localStorage.getItem(`vyapar_chat_messages_${user.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {}
    };
    loadLocalMessages();

    fetch(`/api/messages?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.items || []);
        if (list.length > 0) {
          setMessages(prev => {
            const map = new Map();
            prev.forEach(m => map.set(m.id, m));
            list.forEach((m: any) => map.set(m.id, m));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    fetch('/api/messages/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    }).catch(() => {});
  }, [user?.id]);

  // Mark messages from active contact as read
  useEffect(() => {
    if (!user?.id || !activeContact?.id) return;
    fetch('/api/messages/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, contactId: activeContact.id })
    }).then(() => {
      setMessages(prev => prev.map(m => (m.receiverId === user.id && m.senderId === activeContact.id) ? { ...m, read: true, status: 'read' } : m));
    }).catch(() => {});
  }, [user?.id, activeContact?.id]);

  // 3. Save messages to local cache
  useEffect(() => {
    if (user?.id && messages.length > 0) {
      try {
        localStorage.setItem(`vyapar_chat_messages_${user.id}`, JSON.stringify(messages));
      } catch (e) {}
    }
  }, [messages, user?.id]);

  // 4. Auto select contact if passed in URL
  useEffect(() => {
    if (targetUserIdParam && contacts.length > 0 && !activeContact) {
      const found = contacts.find(c => 
        String(c.id) === String(targetUserIdParam) || 
        String(c.username) === String(targetUserIdParam) ||
        String(c.name) === String(targetUserIdParam)
      );
      if (found) {
        setActiveContact(found);
      }
    }
  }, [targetUserIdParam, contacts, activeContact]);

  // Scroll to bottom on new messages & sound
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContact]);

  // Online / Offline Handover Notice Listener
  useEffect(() => {
    if (!activeContact?.id) {
      setOnlineHandoverNotice(null);
      return;
    }

    const isOnline = isUserActiveOnline(activeContact);
    if (isOnline && !prevContactOnlineRef.current) {
      const notice = `🟢 ${activeContact.companyName || activeContact.name} अब ऑनलाइन हैं! आप इनसे सीधे बातचीत कर सकते हैं। 🤝`;
      setOnlineHandoverNotice(notice);
      const timer = setTimeout(() => {
        setOnlineHandoverNotice(null);
      }, 8000);
      prevContactOnlineRef.current = true;
      return () => clearTimeout(timer);
    } else if (!isOnline) {
      prevContactOnlineRef.current = false;
      setOnlineHandoverNotice(null);
    }
  }, [activeContact, activeContact?.lastActive, activeContact?.lastSeen]);

  // Emoji Reaction Handler (Optimistic UI + LocalStorage + API Sync)
  const handleReactToMessage = (messageId: string, emoji: string, reactorUserId = user.id, reactorName = user.name) => {
    setMessages(prev => {
      const updated = prev.map(m => {
        if (m.id !== messageId) return m;
        const reactions = Array.isArray(m.reactions) ? [...m.reactions] : [];
        const existingIdx = reactions.findIndex(r => String(r.userId) === String(reactorUserId));
        if (existingIdx !== -1) {
          if (reactions[existingIdx].emoji === emoji) {
            reactions.splice(existingIdx, 1); // toggle off
          } else {
            reactions[existingIdx].emoji = emoji;
          }
        } else {
          reactions.push({ emoji, userId: reactorUserId, userName: reactorName || 'User' });
        }
        return { ...m, reactions };
      });
      try {
        localStorage.setItem(`vyapar_chat_messages_${user.id}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    playDoubleTickSound();
    try { navigator.vibrate?.(25); } catch (e) {}

    fetch('/api/messages/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId,
        userId: reactorUserId,
        userName: reactorName,
        emoji
      })
    }).catch(() => {});
  };

  // Long press / Context menu handlers for WhatsApp actions (Reduced sensitivity: 650ms)
  const handleTouchStart = (msg: ChatMessage) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      try { navigator.vibrate?.(45); } catch (e) {}
      setShowReactionPickerForMsg(msg);
    }, 650);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleDeleteForMe = (msg: ChatMessage) => {
    setSelectedMsgForAction(null);
    setMessages(prev => prev.filter(m => m.id !== msg.id));
    try {
      const saved = localStorage.getItem(`vyapar_chat_messages_${user.id}`);
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        const filtered = parsed.filter(m => m.id !== msg.id);
        localStorage.setItem(`vyapar_chat_messages_${user.id}`, JSON.stringify(filtered));
      }
    } catch (e) {}
    toast.success('🗑️ Message deleted for you (मेरे लिए चैट हटाई गई)');

    fetch('/api/messages/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId: msg.id,
        userId: user.id,
        deleteType: 'for_me'
      })
    }).catch(() => {});
  };

  const handleDeleteForEveryone = (msg: ChatMessage) => {
    setSelectedMsgForAction(null);
    setMessages(prev => prev.map(m => m.id === msg.id ? {
      ...m,
      deletedForEveryone: true,
      text: '🚫 This message was deleted',
      imageUrl: undefined,
      documentUrl: undefined,
      locationData: undefined,
      contactData: undefined
    } : m));

    try {
      const saved = localStorage.getItem(`vyapar_chat_messages_${user.id}`);
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        const updated = parsed.map(m => m.id === msg.id ? {
          ...m,
          deletedForEveryone: true,
          text: '🚫 This message was deleted',
          imageUrl: undefined,
          documentUrl: undefined,
          locationData: undefined,
          contactData: undefined
        } : m);
        localStorage.setItem(`vyapar_chat_messages_${user.id}`, JSON.stringify(updated));
      }
    } catch (e) {}

    toast.success('🚫 Message marked as deleted for everyone (दोनों तरफ "Deleted" दिखाया गया)');

    fetch('/api/messages/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId: msg.id,
        userId: user.id,
        deleteType: 'for_everyone'
      })
    }).catch(() => {});
  };

  // Permanent Purge Both Sides: Removes the message completely without leaving any placeholder div
  const handlePermanentPurgeBothSides = (msg: ChatMessage) => {
    setSelectedMsgForAction(null);
    setMessages(prev => prev.filter(m => m.id !== msg.id));

    try {
      const saved = localStorage.getItem(`vyapar_chat_messages_${user.id}`);
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        const filtered = parsed.filter(m => m.id !== msg.id);
        localStorage.setItem(`vyapar_chat_messages_${user.id}`, JSON.stringify(filtered));
      }
    } catch (e) {}

    toast.success('💥 Message completely removed from both sides (दोनों तरफ से पूरी तरह गायब कर दिया गया)');

    fetch('/api/messages/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId: msg.id,
        userId: user.id,
        deleteType: 'purge_both'
      })
    }).catch(() => {});
  };

  const handleCopyText = (text: string) => {
    setSelectedMsgForAction(null);
    navigator.clipboard?.writeText(text);
    toast.success('📋 Message text copied!');
  };

  const handleToggleStar = (msg: ChatMessage) => {
    setSelectedMsgForAction(null);
    const newStarred = !msg.isStarred;
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isStarred: newStarred } : m));
    toast.success(newStarred ? '⭐ Message starred' : '☆ Message unstarred');
  };

  // Handle Wallpaper Change (Device Local Storage ONLY)
  const handleSetWallpaper = (val: string) => {
    setCustomWallpaper(val);
    try {
      localStorage.setItem('vyapar_chat_custom_wallpaper', val);
      toast.success('🎨 Chat Theme Wallpaper set on this device!');
    } catch (e) {
      console.warn('Storage save notice:', e);
    }
  };

  // Toggle Sound
  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('vyapar_chat_sound_enabled', enabled ? 'true' : 'false');
    if (enabled) {
      playMessageSentSound();
      toast.success('🔊 Chat sound effects enabled!');
    } else {
      toast.success('🔇 Chat sound effects muted');
    }
  };

  // Toggle Online Privacy
  const handleToggleOnlinePrivacy = (enabled: boolean) => {
    setOnlinePrivacy(enabled);
    localStorage.setItem('vyapar_chat_online_privacy', enabled ? 'true' : 'false');
    toast.success(enabled ? '🟢 Online status is now visible' : '🔒 Online status hidden');
  };

  // Toggle Read Receipts
  const handleToggleReadReceipts = (enabled: boolean) => {
    setReadReceipts(enabled);
    localStorage.setItem('vyapar_chat_read_receipts', enabled ? 'true' : 'false');
    toast.success(enabled ? '✅ Blue Read Receipts turned ON' : '⚪ Read Receipts turned OFF');
  };

  // Handle Wallpaper Upload from Device Gallery
  const handleCustomWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      toast.error('❌ Videos cannot be set as chat wallpaper. Please pick an image.');
      return;
    }

    try {
      const compressedDataUrl = await optimizeImageForPersistence(file, 1280, 1280, 0.75);
      if (compressedDataUrl) {
        handleSetWallpaper(compressedDataUrl);
      }
    } catch (err) {
      toast.error('Failed to load wallpaper image');
    }
  };

  // Auto Download / Save Image to Device Memory
  const handleDownloadFile = (url: string, filename = 'vyapar_file') => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('📥 Saved to your device memory!');
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  // Handle Image Selection with Strict Video Blocking & Compression in KB
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeContact) return;

    // Strict NO Video Constraint
    if (file.type.startsWith('video/') || /\.(mp4|mov|avi|webm|mkv)$/i.test(file.name)) {
      toast.error('🚫 Video sharing chat mein band hai. Chat keval text aur compressed photos ke liye hai.');
      if (e.target) e.target.value = '';
      return;
    }

    try {
      toast.loading('⚡ Compressing photo in lightweight KB...', { id: 'chat-compress' });
      const compressedDataUrl = await optimizeImageForPersistence(file, 1024, 1024, 0.65);
      toast.dismiss('chat-compress');

      if (compressedDataUrl) {
        setPendingImagePreview(compressedDataUrl);
        setPendingImageFile(file);
        setShowAttachMenu(false);
        toast.success('📷 Photo ready to send (KB compressed)');
      }
    } catch (err) {
      toast.dismiss('chat-compress');
      toast.error('Could not process image');
    }
  };

  // Handle Document / PDF Selection
  const handleDocSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeContact) return;

    setShowAttachMenu(false);

    // Validate if it is a document (PDF, Excel, Word, Text)
    if (file.type.startsWith('video/')) {
      toast.error('🚫 Videos cannot be sent in chat.');
      return;
    }

    const tempId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;

    // Local preview URL
    const localUrl = URL.createObjectURL(file);

    const docMsg: ChatMessage = {
      id: tempId,
      senderId: user.id,
      receiverId: activeContact.id,
      text: file.name,
      mediaType: 'pdf',
      documentUrl: localUrl,
      documentName: file.name,
      fileSize: sizeStr,
      createdAt: new Date().toISOString(),
      status: 'read'
    };

    setMessages(prev => [...prev, docMsg]);
    playMessageSentSound();

    try {
      setUploadingMedia(true);
      const formData = new FormData();
      formData.append('document', file);
      formData.append('senderId', user.id);
      formData.append('receiverId', activeContact.id);
      formData.append('text', file.name);

      const res = await fetch('/api/messages/document', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...data.message, status: 'read' } : m));
        playDoubleTickSound();
      }
    } catch (err) {
      console.warn('Doc upload notice:', err);
    } finally {
      setUploadingMedia(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  // Share Live / Shop GPS Location
  const handleShareCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('GPS location is not supported on this browser.');
      return;
    }

    toast.loading('📍 Fetching GPS location...', { id: 'loc-share' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss('loc-share');
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;

        const tempId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const locMsg: ChatMessage = {
          id: tempId,
          senderId: user.id,
          receiverId: activeContact.id,
          text: `📍 Live Business Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          mediaType: 'location',
          locationData: {
            lat,
            lng,
            address: user.city ? `${user.city}, India` : 'Shared Business GPS Location',
            mapUrl
          },
          createdAt: new Date().toISOString(),
          status: 'read'
        };

        setMessages(prev => [...prev, locMsg]);
        setShowAttachMenu(false);
        setShowLocationModal(false);
        playMessageSentSound();

        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: user.id,
            receiverId: activeContact.id,
            text: locMsg.text,
            mediaType: 'location',
            locationData: locMsg.locationData
          })
        }).then(() => playDoubleTickSound()).catch(() => {});
      },
      () => {
        toast.dismiss('loc-share');
        // Fallback to user profile coordinates or standard city
        const fallbackLat = userLocation?.lat || 26.8467;
        const fallbackLng = userLocation?.lng || 80.9462;
        const mapUrl = `https://maps.google.com/?q=${fallbackLat},${fallbackLng}`;

        const tempId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const locMsg: ChatMessage = {
          id: tempId,
          senderId: user.id,
          receiverId: activeContact.id,
          text: `📍 Business Address: ${user.companyName || user.name}, ${user.city || 'India'}`,
          mediaType: 'location',
          locationData: {
            lat: fallbackLat,
            lng: fallbackLng,
            address: `${user.companyName || user.name} (${user.city || 'India'})`,
            mapUrl
          },
          createdAt: new Date().toISOString(),
          status: 'read'
        };

        setMessages(prev => [...prev, locMsg]);
        setShowAttachMenu(false);
        setShowLocationModal(false);
        playMessageSentSound();

        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: user.id,
            receiverId: activeContact.id,
            text: locMsg.text,
            mediaType: 'location',
            locationData: locMsg.locationData
          })
        }).catch(() => {});
      },
      { timeout: 8000 }
    );
  };

  // Share Profile Registered Location directly
  const handleShareProfileLocation = () => {
    if (!user || !activeContact) return;
    const address = user.address || user.location || `${user.companyName || user.name}, ${user.city || user.state || 'India'}`;
    const query = encodeURIComponent(`${user.companyName || user.name} ${user.city || ''} ${user.address || ''}`.trim());
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    
    const tempId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const locMsg: ChatMessage = {
      id: tempId,
      senderId: user.id,
      receiverId: activeContact.id,
      text: `📍 Registered Business Location:\n🏢 ${user.companyName || user.name}\n📌 ${address}\n🗺️ Google Maps: ${mapUrl}`,
      mediaType: 'location',
      locationData: {
        address,
        mapUrl,
        lat: userLocation?.lat || 26.8467,
        lng: userLocation?.lng || 80.9462
      },
      createdAt: new Date().toISOString(),
      status: 'read'
    };

    setMessages(prev => [...prev, locMsg]);
    setShowAttachMenu(false);
    setShowLocationModal(false);
    playMessageSentSound();

    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: user.id,
        receiverId: activeContact.id,
        text: locMsg.text,
        mediaType: 'location',
        locationData: locMsg.locationData
      })
    }).then(() => playDoubleTickSound()).catch(() => {});
    toast.success('📍 Profile Business Location shared!');
  };

  // Share Catalog Link
  const handleShareCatalog = () => {
    if (!user || !activeContact) return;
    const catUrl = `${window.location.origin}/profile/${user.id}`;
    handleSendMessage(`🛍️ Trade Catalogue & Products:\nExplore our complete collection and live wholesale rates: ${catUrl}`);
    setShowAttachMenu(false);
    toast.success('🛍️ Catalogue shared!');
  };

  // Share Quick Poll
  const handleSharePoll = () => {
    if (!user || !activeContact) return;
    const pollText = `📊 Wholesale Deal Poll: What is your preferred order batch size?\n1️⃣ 50 - 200 units\n2️⃣ 200 - 1000 units\n3️⃣ Bulk Container Load\n(Reply with option 1, 2, or 3)`;
    handleSendMessage(pollText);
    setShowAttachMenu(false);
    toast.success('📊 Trade Poll shared!');
  };

  // Share Event / Visit Invite
  const handleShareEvent = () => {
    if (!user || !activeContact) return;
    const eventText = `📅 Trade Expo & Factory Visit Invitation:\n🏢 Venue: ${user.companyName || user.name}, ${user.city || 'Trade Hub'}\n⏰ Visiting Hours: Mon - Sat (10:00 AM - 7:00 PM)\n🤝 You are welcome for factory inspection & bulk deal closure!`;
    handleSendMessage(eventText);
    setShowAttachMenu(false);
    toast.success('📅 Event Invitation shared!');
  };

  // Share UPI QR & Payment Info
  const handleShareUpiQr = () => {
    if (!user || !activeContact) return;
    const upiId = user.upiId || (user.phone ? `${user.phone}@upi` : `${(user.email || 'vyapar').split('@')[0]}@okhdfcbank`);
    const upiText = `💳 UPI Payment Details:\n👤 Payee: ${user.companyName || user.name}\n🆔 UPI ID: ${upiId}\n🔒 Verified Merchant Payment for Token / Advance`;
    handleSendMessage(upiText);
    setShowAttachMenu(false);
    toast.success('💳 UPI details shared!');
  };

  // Share Contact Card
  const handleShareContact = (contactToShare: any) => {
    if (!activeContact) return;

    const name = contactToShare.name || contactToShare.companyName || 'Trader';
    const phone = contactToShare.phone || contactToShare.mobile || '';
    const email = contactToShare.email || '';
    const company = contactToShare.companyName || contactToShare.businessName || '';
    const city = contactToShare.city || '';

    const tempId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const contactMsg: ChatMessage = {
      id: tempId,
      senderId: user.id,
      receiverId: activeContact.id,
      text: `👤 Contact Card: ${name}${phone ? ` • ${phone}` : ''}${email ? ` • ${email}` : ''}`,
      mediaType: 'contact',
      contactData: {
        name,
        phone,
        email,
        companyName: company,
        city
      },
      createdAt: new Date().toISOString(),
      status: 'read'
    };

    setMessages(prev => [...prev, contactMsg]);
    setShowAttachMenu(false);
    setShowContactModal(false);
    setCustomContactName('');
    setCustomContactPhone('');
    setCustomContactEmail('');
    setCustomContactCompany('');
    setDirectoryContactSearch('');
    playMessageSentSound();

    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: user.id,
        receiverId: activeContact.id,
        text: contactMsg.text,
        mediaType: 'contact',
        contactData: contactMsg.contactData
      })
    }).then(() => playDoubleTickSound()).catch(() => {});
  };

  // 1. Native Mobile Contacts Picker API (Chrome Android / Mobile Web) & Fallback
  const handlePickFromNativePhonebook = async () => {
    try {
      if ('contacts' in navigator && 'ContactsManager' in window && typeof (navigator as any).contacts?.select === 'function') {
        const props = ['name', 'tel', 'email'];
        const contactsResult = await (navigator as any).contacts.select(props, { multiple: false });
        if (contactsResult && contactsResult.length > 0) {
          const selected = contactsResult[0];
          const name = (selected.name && selected.name[0]) || 'Phone Contact';
          const phone = (selected.tel && selected.tel[0]) || '';
          const email = (selected.email && selected.email[0]) || '';
          
          handleShareContact({
            name,
            phone,
            email,
            companyName: 'From Mobile Phonebook'
          });
          toast.success(`📱 Phonebook Contact "${name}" shared!`);
          return;
        }
      }
      // If native API is unavailable or returns empty, open the contact selection sheet
      setShowContactModal(true);
    } catch (err: any) {
      console.warn('Native contacts error, opening modal fallback:', err);
      setShowContactModal(true);
    }
  };

  // 2. VCF / vCard file parser from phone memory
  const handleVcfImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let name = '';
      let phone = '';
      let email = '';
      let org = '';

      const lines = text.split(/\r\n|\r|\n/);
      for (const line of lines) {
        if (line.startsWith('FN:') || line.startsWith('FN;')) {
          name = line.split(':')[1]?.trim() || name;
        } else if (line.startsWith('N:') && !name) {
          const parts = line.split(':')[1]?.split(';') || [];
          name = [parts[1], parts[0]].filter(Boolean).join(' ').trim();
        } else if (line.includes('TEL') && !phone) {
          phone = line.split(':')[1]?.trim() || '';
        } else if (line.includes('EMAIL') && !email) {
          email = line.split(':')[1]?.trim() || '';
        } else if (line.startsWith('ORG:')) {
          org = line.split(':')[1]?.replace(/;/g, ' ').trim() || '';
        }
      }

      if (name || phone || email) {
        handleShareContact({
          name: name || file.name.replace(/\.vcf$/i, ''),
          phone,
          email,
          companyName: org || 'Imported Contact'
        });
        toast.success(`📱 Contact "${name || 'vCard'}" shared!`);
      } else {
        toast.error('Could not extract contact info from vCard');
      }
    } catch (err) {
      toast.error('Error reading contact file');
    }
    if (e.target) e.target.value = '';
  };

  // 3. Share Current User's Registered Profile & Email Card
  const handleShareMyProfileContact = () => {
    if (!user || !activeContact) return;
    handleShareContact({
      name: user.name || user.displayName || 'My Profile',
      phone: user.phone || user.mobile || '',
      email: user.email || '',
      companyName: user.companyName || user.businessName || '',
      city: user.city || ''
    });
    toast.success('👤 Your Business Profile & Email Card shared!');
  };

  // 4. Download / Save Contact to Phonebook (vCard generation)
  const handleSaveContactToPhone = (cData: { name: string; phone?: string; email?: string; companyName?: string }) => {
    try {
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${cData.name}`,
        cData.companyName ? `ORG:${cData.companyName}` : '',
        cData.phone ? `TEL;TYPE=CELL,VOICE:${cData.phone}` : '',
        cData.email ? `EMAIL;TYPE=INTERNET:${cData.email}` : '',
        'END:VCARD'
      ].filter(Boolean).join('\r\n');

      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cData.name.replace(/\s+/g, '_')}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('📥 Contact VCF downloaded! Tap file to save to Mobile Phonebook.');
    } catch (e) {
      toast.error('Could not export contact');
    }
  };

  // Save AI Assistant Settings
  const handleSaveAiSettings = async () => {
    try {
      localStorage.setItem('vyapar_ai_auto_reply_enabled', aiAutoReplyEnabled ? 'true' : 'false');
      localStorage.setItem('vyapar_ai_auto_reply_mode', aiAutoReplyMode);
      localStorage.setItem('vyapar_ai_custom_instructions', aiCustomInstructions);
      localStorage.setItem('vyapar_ai_tone', aiTone);

      if (user?.id) {
        await fetch(`/api/users/${user.id}/ai-settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aiAutoReplyEnabled,
            aiAutoReplyMode,
            aiCustomInstructions,
            aiTone
          })
        });
      }
      toast.success('🤖 Vyapar AI Trade Assistant settings saved!');
    } catch (e) {
      toast.success('🤖 Settings saved on this device!');
    }
  };

  // Test AI Auto-Reply Generation
  const handleTestAiAutoReply = async () => {
    setIsTestingAi(true);
    setTestAiResponse(null);
    try {
      const res = await fetch('/api/ai/chat-auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: user?.id,
          senderId: 'buyer_sample',
          lastMessageText: 'नमस्ते! क्या आपके पास प्रीमियम सेरामिक टाइल्स / हार्डवेयर का स्टॉक उपलब्ध है? होलसेल रेट और MOQ बताएं।'
        })
      });
      const data = await res.json();
      if (data.replyText) {
        setTestAiResponse(data.replyText);
        toast.success('✨ AI Reply test generated!');
      } else {
        toast.error('Could not generate test response');
      }
    } catch (e) {
      toast.error('AI test request failed');
    } finally {
      setIsTestingAi(false);
    }
  };

  // 1-Tap Smart AI Assistant Actions for Current Chat
  const handleTriggerSmartAiAction = async (actionType: string) => {
    if (!activeContact) return;
    setIsGeneratingAiSuggestion(true);
    try {
      const res = await fetch('/api/ai/smart-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          lastMessages: messages.filter(
            m => (m.senderId === user.id && m.receiverId === activeContact?.id) || 
                 (m.senderId === activeContact?.id && m.receiverId === user.id)
          ).slice(-4),
          traderProfile: activeContact,
          userProfile: user,
          currentDraft: newMessage
        })
      });
      const data = await res.json();
      if (data.suggestion) {
        setNewMessage(data.suggestion);
        setShowAiAssistBar(false);
        toast.success('✨ AI drafted your message! Review and press Send.');
      }
    } catch (e) {
      toast.error('Could not generate AI draft');
    } finally {
      setIsGeneratingAiSuggestion(false);
    }
  };

  // Automatic AI Auto-Reply Trigger when active contact is offline/away or has AI auto-reply enabled
  const triggerAiAutoReply = async (buyerMessageText: string, buyerMsgId?: string) => {
    if (!activeContact || !buyerMessageText) return;
    
    // Check if auto-reply should trigger:
    // If contact is offline, or if contact's auto-reply is on, or in demo simulation
    const isContactOnline = isUserActiveOnline(activeContact);
    const shouldReply = !isContactOnline || activeContact.aiAutoReplyEnabled === true;
    
    if (!shouldReply) return;

    setIsAiTyping(true);

    try {
      // Realistic typing delay for authentic human experience
      await new Promise(r => setTimeout(r, 1500));

      const chatHistory = messages.filter(
        m => (m.senderId === user.id && m.receiverId === activeContact?.id) || 
             (m.senderId === activeContact?.id && m.receiverId === user.id)
      ).slice(-6);

      const res = await fetch('/api/ai/chat-auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: activeContact.id,
          senderId: user.id,
          lastMessageText: buyerMessageText,
          conversationHistory: chatHistory
        })
      });
      const data = await res.json();

      // Human-like emoji reaction on buyer's message by AI
      if (data.aiReaction && buyerMsgId) {
        handleReactToMessage(buyerMsgId, data.aiReaction, activeContact.id, activeContact.name || activeContact.companyName);
      }

      if (data.replyText) {
        const rawName = activeContact.companyName || activeContact.name || 'Trader';
        const cleanContactName = rawName.replace(/\s*\([^)]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '').trim();

        const aiMsg: ChatMessage = {
          id: 'msg_ai_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          senderId: activeContact.id,
          receiverId: user.id,
          text: data.replyText,
          isAiGenerated: true,
          aiAssistantName: `${cleanContactName} AI Desk`,
          recommendedPosts: Array.isArray(data.recommendedPosts) ? data.recommendedPosts : undefined,
          createdAt: new Date().toISOString(),
          status: 'read',
          read: true
        };

        // When AI responds on behalf of trader, mark all previous sent messages as read (Rainbow Double Tick glow!)
        setMessages(prev => {
          const updatedPrev = prev.map(m => {
            if (m.senderId === user.id && m.receiverId === activeContact.id) {
              return { ...m, status: 'read' as const, read: true };
            }
            return m;
          });
          const nextList = [...updatedPrev, aiMsg];
          try {
            localStorage.setItem(`vyapar_chat_messages_${user.id}`, JSON.stringify(nextList));
          } catch (e) {}
          return nextList;
        });

        playMessageReceivedSound();
        playDoubleTickSound();

        // Also persist in backend
        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: activeContact.id,
            receiverId: user.id,
            text: data.replyText,
            isAiGenerated: true
          })
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('AI Auto-reply trigger notice:', e);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : newMessage).trim();
    if ((!textToSend && !pendingImagePreview) || !activeContact) return;

    const isContactOnline = Boolean(activeContact && isUserActiveOnline(activeContact));
    const tempId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newMsgObj: ChatMessage = {
      id: tempId,
      senderId: user.id,
      receiverId: activeContact.id,
      text: textToSend || (pendingImagePreview ? '📷 Photo' : ''),
      imageUrl: pendingImagePreview || undefined,
      mediaType: pendingImagePreview ? 'image' : undefined,
      quotedMessage: replyingTo ? {
        id: replyingTo.id,
        text: replyingTo.text,
        senderName: replyingTo.senderId === user.id ? 'You' : (activeContact.name || 'Trader')
      } : undefined,
      createdAt: new Date().toISOString(),
      status: isContactOnline ? 'read' : 'sent',
      read: isContactOnline
    };

    // Play Instant WhatsApp Sent Audio Feedback
    playMessageSentSound();

    // Optimistic UI update
    setMessages(prev => [...prev, newMsgObj]);
    setNewMessage('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    setShowAiAssistBar(false);

    const imageToSendPreview = pendingImagePreview;
    const imageToSendFile = pendingImageFile;
    setPendingImageFile(null);
    setPendingImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';

    try {
      if (imageToSendFile || imageToSendPreview) {
        setUploadingMedia(true);
        const formData = new FormData();
        if (imageToSendFile) formData.append('image', imageToSendFile);
        formData.append('senderId', user.id);
        formData.append('receiverId', activeContact.id);
        formData.append('text', textToSend || '[Image]');
        if (imageToSendPreview) {
          formData.append('compressedPreview', imageToSendPreview);
        }

        const res = await fetch('/api/messages/image', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success && data.message) {
          setMessages(prev => prev.map(m => m.id === tempId ? { ...data.message, status: 'read' } : m));
          playDoubleTickSound();
        }
      } else {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: user.id,
            receiverId: activeContact.id,
            text: textToSend,
            imageUrl: imageToSendPreview || undefined
          })
        });
        playDoubleTickSound();
      }

      // Trigger AI Auto-Reply if recipient is offline / away
      if (textToSend) {
        triggerAiAutoReply(textToSend, tempId);
      }
    } catch (err) {
      console.warn('Message send notice:', err);
    } finally {
      setUploadingMedia(false);
    }
  };

  // WhatsApp External Link Open with Referral Link & Business Profile info
  const handleOpenWhatsAppDirect = () => {
    if (!activeContact) return;
    const rawPhone = activeContact.phone || activeContact.mobile || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const partnerName = activeContact.companyName || activeContact.name || 'Trader';
    
    // Referral link & Business profile of current logged-in user
    const origin = window.location.origin;
    const refCode = user?.referralCode || user?.id || 'join';
    const userRefAppUrl = `${origin}/?ref=${refCode}`;
    const userProfileUrl = `${origin}/profile/${user?.id || ''}?ref=${refCode}`;
    const myBusinessName = user?.companyName || user?.name || 'Verified Trader';
    const myLocation = user?.city ? `${user.city}, ${user.state || 'India'}` : (user?.state || 'India');

    const formattedMessage = [
      `Namaste ${partnerName}! 🙏`,
      ``,
      `I found your business profile on *Vyapar Bridge (B2B Trade Network)* and would like to inquire regarding wholesale deals & supply rates.`,
      ``,
      `🏢 *My Business Profile:* ${myBusinessName} (📍 ${myLocation})`,
      `🔗 *View My Profile & Catalog:* ${userProfileUrl}`,
      `📲 *Trade on Vyapar Bridge App:* ${userRefAppUrl}`,
      ``,
      `Please let me know your available stock, catalogue & wholesale price list.`
    ].join('\n');

    const textMsg = encodeURIComponent(formattedMessage);
    
    let url = '';
    if (cleanPhone.length >= 10) {
      const pNum = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      url = `https://wa.me/${pNum}?text=${textMsg}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${textMsg}`;
    }
    window.open(url, '_blank');
  };

  if (!user) {
    return (
      <div className="h-[calc(100dvh-4rem-4rem)] md:h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center p-8 bg-[#f0f2f5] dark:bg-[#111b21] text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
          <MessageSquare className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Login to Vyapar WhatsApp Chat</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-sm mb-6 text-xs leading-relaxed">
          Sign in to connect directly with manufacturers, wholesalers, and verified traders across India with zero brokerage!
        </p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))} 
          className="bg-[#00a884] hover:bg-[#008f6f] text-white font-bold py-2.5 px-6 rounded-full transition-all shadow-md cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  // Active contact's messages
  const activeMessages = useMemo(() => {
    return messages.filter(
      m => (m.senderId === user.id && m.receiverId === activeContact?.id) || 
           (m.senderId === activeContact?.id && m.receiverId === user.id)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, user?.id, activeContact?.id]);

  // Sort contacts list:
  // 1. Most recent active conversation (latest message sent or received) ALWAYS sits at the very TOP
  // 2. Followed by earlier conversations in descending chronological order (newest to oldest)
  // 3. Followed by other registered contacts
  const sortedContacts = useMemo(() => {
    // Build map of contactId -> latest message epoch timestamp
    const contactActivityMap = new Map<string, number>();

    messages.forEach(m => {
      const otherId = m.senderId === user.id ? m.receiverId : m.receiverId === user.id ? m.senderId : null;
      if (otherId) {
        const time = new Date(m.createdAt).getTime();
        const existing = contactActivityMap.get(String(otherId)) || 0;
        if (time > existing) {
          contactActivityMap.set(String(otherId), time);
        }
      }
    });

    return [...contacts].sort((a, b) => {
      const timeA = contactActivityMap.get(String(a.id)) || 0;
      const timeB = contactActivityMap.get(String(b.id)) || 0;

      // 1. Newest chat activity first
      if (timeA !== timeB) {
        return timeB - timeA;
      }

      // 2. Unread messages priority if time is same
      const unreadA = messages.filter(m => m.senderId === a.id && m.receiverId === user.id && !m.read).length;
      const unreadB = messages.filter(m => m.senderId === b.id && m.receiverId === user.id && !m.read).length;
      if (unreadB !== unreadA) {
        return unreadB - unreadA;
      }

      // 3. Fallback alphabetical
      const nameA = a.companyName || a.name || '';
      const nameB = b.companyName || b.name || '';
      return nameA.localeCompare(nameB);
    });
  }, [contacts, messages, user?.id]);

  // Filtered contacts list matching search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return sortedContacts;
    const q = searchQuery.toLowerCase();
    return sortedContacts.filter(c => {
      const nameMatch = (c.name || '').toLowerCase().includes(q);
      const companyMatch = (c.companyName || '').toLowerCase().includes(q);
      const cityMatch = (c.city || '').toLowerCase().includes(q);
      const phoneMatch = (c.phone || '').includes(q);
      return nameMatch || companyMatch || cityMatch || phoneMatch;
    });
  }, [sortedContacts, searchQuery]);

  return (
    <div className="max-w-[1280px] mx-auto w-full h-[calc(100dvh-4rem-4rem)] md:h-[calc(100vh-4.5rem)] flex flex-col md:py-2 md:px-4 select-none">
      {/* Hidden File Inputs for Rich Media */}
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleImageSelect} 
        accept="image/jpeg,image/png,image/webp,image/jpg" 
        capture="environment"
        className="hidden" 
      />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageSelect} 
        accept="image/jpeg,image/png,image/webp,image/jpg" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={docInputRef} 
        onChange={handleDocSelect} 
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={wallpaperInputRef} 
        onChange={handleCustomWallpaperUpload}
        accept="image/*" 
        className="hidden" 
      />

      {/* WhatsApp Main Window Frame */}
      <div className="flex-1 bg-[#efeae2] dark:bg-[#0b141a] rounded-none md:rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 flex overflow-hidden relative">
        
        {/* ======================================================== */}
        {/* LEFT SIDEBAR: CONTACTS & RECENT CHATS                    */}
        {/* ======================================================== */}
        <div className={cn(
          "w-full md:w-[360px] lg:w-[400px] bg-white dark:bg-[#111b21] border-r border-slate-200 dark:border-zinc-800 flex flex-col shrink-0 z-20 transition-all",
          activeContact ? "hidden md:flex" : "flex"
        )}>
          {/* Header Bar */}
          <div className="h-14 sm:h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-3.5 sm:px-4 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img 
                  src={resolveUserAvatar(user)} 
                  alt={user.name || 'User'} 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-300 dark:border-zinc-700 shadow-2xs" 
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#202c33] rounded-full" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {user.name || 'My WhatsApp'}
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  🟢 {onlinePrivacy ? 'Online & Active' : 'Status: Hidden'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => { setSettingsTab('theme'); setShowSettingsModal(true); }}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Chat Settings & Themes (थीम व सेटिंग्स)"
              >
                <Settings className="w-4.5 h-4.5 text-slate-700 dark:text-slate-300" />
              </button>
              <button 
                onClick={() => navigate('/')}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Back to Feed"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-2.5 bg-white dark:bg-[#111b21] border-b border-slate-100 dark:border-zinc-800">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search traders & suppliers..."
                className="w-full bg-[#f0f2f5] dark:bg-[#202c33] pl-9 pr-8 py-2 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">No matching traders found.</p>
              </div>
            ) : (
              filteredContacts.map(contact => {
                const isOnline = isUserActiveOnline(contact);
                const lastMsg = messages
                  .filter(m => (m.senderId === user.id && m.receiverId === contact.id) || (m.senderId === contact.id && m.receiverId === user.id))
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                
                const isSelected = activeContact?.id === contact.id;
                const isGolden = Boolean(contact.goldenBadge || contact.verifiedPlan === 'yearly');
                const isBlue = Boolean(contact.isVerified && !isGolden);

                const unreadCount = messages.filter(
                  m => m.senderId === contact.id && 
                       m.receiverId === user.id && 
                       !m.read && 
                       (!m.deletedForMe || !m.deletedForMe.includes(String(user.id)))
                ).length;

                const handleSelectContact = () => {
                  setActiveContact(contact);
                  // Mark as read in local state
                  if (unreadCount > 0) {
                    setMessages(prev => {
                      const updated = prev.map(m => 
                        (m.senderId === contact.id && m.receiverId === user.id) 
                          ? { ...m, read: true, status: 'read' as const } 
                          : m
                      );
                      try {
                        localStorage.setItem(`vyapar_chat_messages_${user.id}`, JSON.stringify(updated));
                      } catch (e) {}
                      return updated;
                    });
                    fetch('/api/messages/read', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: user.id, contactId: contact.id })
                    }).then(() => {
                      window.dispatchEvent(new CustomEvent('vyapar_unread_messages_updated'));
                    }).catch(() => {});
                  }
                };

                return (
                  <div 
                    key={contact.id}
                    onClick={handleSelectContact}
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer transition-colors relative",
                      isSelected 
                        ? "bg-[#f0f2f5] dark:bg-[#2a3942]" 
                        : "hover:bg-slate-50 dark:hover:bg-[#202c33]/70"
                    )}
                  >
                    {/* Avatar with Colorful Glowing Ring on Unread Messages */}
                    <div className="relative shrink-0">
                      <div className={cn(
                        "rounded-full p-0.5 transition-all",
                        unreadCount > 0 
                          ? "bg-gradient-to-tr from-emerald-500 via-amber-400 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse"
                          : ""
                      )}>
                        <div className={cn(
                          "w-11 h-11 rounded-full overflow-hidden border-2 bg-slate-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-slate-600 dark:text-zinc-300",
                          isGolden ? "border-amber-400 shadow-2xs" : isBlue ? "border-blue-500" : "border-transparent"
                        )}>
                          {contact.avatarUrl || contact.photoURL || contact.profileImage ? (
                            <img 
                              src={contact.avatarUrl || contact.photoURL || contact.profileImage} 
                              alt={contact.name || 'User'} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <span>{(contact.name || contact.companyName || 'U').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      </div>

                      {/* Unread Counter Badge Directly on Avatar */}
                      {unreadCount > 0 ? (
                        <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-[#111b21] animate-bounce">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      ) : (
                        isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#111b21] rounded-full" />
                        )
                      )}
                    </div>

                    {/* Contact Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className={cn(
                            "font-bold text-xs sm:text-sm truncate",
                            unreadCount > 0 ? "text-emerald-700 dark:text-emerald-300 font-black" : "text-slate-900 dark:text-white"
                          )}>
                            {contact.companyName || contact.name}
                          </span>
                          {isGolden && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                          {isBlue && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500 shrink-0" />}
                        </div>
                        {lastMsg && (
                          <span className={cn(
                            "text-[10px] shrink-0 font-mono",
                            unreadCount > 0 ? "text-emerald-600 font-bold" : "text-slate-400"
                          )}>
                            {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <p className="truncate text-[11px] flex items-center gap-1 flex-1 min-w-0 pr-1">
                          {lastMsg ? (
                            <>
                              {lastMsg.senderId === user.id && (
                                lastMsg.read || isOnline ? (
                                  <span className="rainbow-double-tick inline-flex items-center shrink-0">
                                    <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center shrink-0 text-rose-500">
                                    <Check className="w-3.5 h-3.5 text-rose-500 font-black" strokeWidth={3} />
                                  </span>
                                )
                              )}
                              <span className={cn("truncate", unreadCount > 0 ? "font-bold text-slate-900 dark:text-white" : "")}>
                                {lastMsg.text || '📷 Photo'}
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">Tap to open WhatsApp chat</span>
                          )}
                        </p>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[10px] shadow-2xs">
                              {unreadCount}
                            </span>
                          )}
                          {contact.city && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                              {contact.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT AREA: ACTIVE WHATSAPP CHAT CONVERSATION            */}
        {/* ======================================================== */}
        <div className={cn(
          "flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] relative z-10 overflow-hidden",
          !activeContact ? "hidden md:flex" : "flex"
        )}>
          {!activeContact ? (
            // No Active Chat Selected Placeholder
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-[#f0f2f5] dark:bg-[#222e35]">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-md">
                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Vyapar WhatsApp B2B Trade Chat
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Connect directly with verified manufacturers, suppliers & wholesalers. Share catalogues, price lists, GPS locations and trade quotes.
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-[#111b21] border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 shadow-2xs">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified B2B Direct Commerce</span>
                </span>
              </div>
            </div>
          ) : (
            // Active Conversation View
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              
              {/* WhatsApp Chat Top Header */}
              <div className="h-14 sm:h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-3 sm:px-4 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 shrink-0 shadow-2xs z-30">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <button 
                    onClick={() => setActiveContact(null)}
                    className="md:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-full transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div 
                    onClick={() => navigate(`/profile/${activeContact.id}`)}
                    className="relative cursor-pointer shrink-0"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-slate-300 dark:border-zinc-700 bg-slate-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-slate-700">
                      {activeContact.avatarUrl || activeContact.photoURL || activeContact.profileImage ? (
                        <img 
                          src={activeContact.avatarUrl || activeContact.photoURL || activeContact.profileImage} 
                          alt={activeContact.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span>{(activeContact.name || activeContact.companyName || 'U').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    {isUserActiveOnline(activeContact) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#202c33] rounded-full" />
                    )}
                  </div>

                  <div className="min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${activeContact.id}`)}>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[220px]">
                        {activeContact.companyName || activeContact.name}
                      </span>
                      {activeContact.goldenBadge && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                      {activeContact.isVerified && !activeContact.goldenBadge && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 font-medium">
                      {isUserActiveOnline(activeContact) ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> online
                        </span>
                      ) : (
                        <span>{getUserLastActiveFormatted(activeContact)}</span>
                      )}
                      {activeContact.city && (
                        <span>• {activeContact.city}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Icons (Settings Gear + WhatsApp + Phone Call) */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Settings Gear Icon (Themes, Sound, Privacy, AI) */}
                  <button 
                    onClick={() => { setSettingsTab('theme'); setShowSettingsModal(true); }}
                    className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Chat Theme, Sound & Settings (सेटिंग्स)"
                  >
                    <Settings className="w-4.5 h-4.5 text-slate-700 dark:text-slate-200 hover:rotate-45 transition-transform" />
                  </button>

                  {/* WhatsApp Direct wa.me Button */}
                  <button 
                    onClick={handleOpenWhatsAppDirect}
                    title="Open in WhatsApp Web / App"
                    className="px-2.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-black flex items-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  {/* Phone Call */}
                  {activeContact.phone && (
                    <a 
                      href={`tel:${activeContact.phone}`}
                      className="p-1.5 sm:p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Direct Call"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Messages Scroll Area with Watermark Wallpaper Layer */}
              <div className="flex-1 relative overflow-hidden flex flex-col justify-between">
                
                {/* 1. BACKGROUND WALLPAPER LAYER */}
                <div 
                  className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
                  style={
                    customWallpaper !== 'default' && customWallpaper.startsWith('data:image')
                      ? {
                          backgroundImage: `url(${customWallpaper})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          opacity: 0.90
                        }
                      : customWallpaper !== 'default' && (customWallpaper.startsWith('#') || customWallpaper.startsWith('rgb'))
                      ? {
                          backgroundColor: customWallpaper
                        }
                      : {}
                  }
                >
                  {/* Default Vyapar Bridge Logo Watermark (Clean, Smooth - No Dots) */}
                  {customWallpaper === 'default' && (
                    <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#efeae2]/80 dark:bg-[#0b141a]/95">
                      {/* Blurred Logo Watermark in the center */}
                      <div className="flex flex-col items-center justify-center text-center select-none pointer-events-none">
                        <div className="w-44 h-44 sm:w-60 sm:h-60 rounded-full flex items-center justify-center p-4">
                          <img 
                            src={BRAND_LOGO_SRC} 
                            alt={BRAND_NAME} 
                            className="w-full h-full object-contain opacity-[0.12] dark:opacity-[0.08] blur-[1px] grayscale contrast-125" 
                          />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-slate-800 dark:text-slate-200 opacity-[0.20] dark:opacity-[0.14] uppercase mt-1">
                          {BRAND_NAME} TRADE ENCRYPTED
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. MESSAGES SCROLL CONTAINER */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 relative z-10">
                  {/* Live Online Handover Alert Banner */}
                  {onlineHandoverNotice && (
                    <div className="flex justify-center my-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-lg border border-emerald-400/50 max-w-md text-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
                        <span className="truncate">{onlineHandoverNotice}</span>
                        <button
                          type="button"
                          onClick={() => setOnlineHandoverNotice(null)}
                          className="ml-1 text-white/80 hover:text-white cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Privacy Badge Date Pill */}
                  <div className="flex justify-center my-1.5">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-lg bg-[#ffeecd]/90 dark:bg-[#182229]/90 text-[#54656f] dark:text-[#8696a0] shadow-2xs border border-amber-200/60 dark:border-zinc-800 text-center max-w-sm backdrop-blur-xs">
                      🔒 Messages are protected with Verified B2B Trade Encryption.
                    </span>
                  </div>

                  {/* Messages List */}
                  {activeMessages.map((msg, index) => {
                    const isOwn = msg.senderId === user.id;
                    const isContactOnline = Boolean(activeContact && isUserActiveOnline(activeContact));
                    const hasIncomingReplyAfter = activeMessages.some(
                      m => m.senderId === activeContact?.id && 
                           new Date(m.createdAt).getTime() >= new Date(msg.createdAt).getTime()
                    );
                    const isMessageRead = Boolean(
                      msg.read || 
                      msg.status === 'read' || 
                      (isContactOnline && activeContact?.id === msg.receiverId) || 
                      hasIncomingReplyAfter
                    );

                    if (msg.deletedForEveryone) {
                      return (
                        <div key={msg.id || index} className={cn("flex w-full my-1 items-center gap-1.5 group/delmsg select-none", isOwn ? "justify-end" : "justify-start")}>
                          <div 
                            onClick={() => setSelectedMsgForAction(msg)}
                            onContextMenu={(e) => { e.preventDefault(); setSelectedMsgForAction(msg); }}
                            className="max-w-[85%] rounded-2xl p-2.5 px-3.5 bg-slate-100/90 dark:bg-zinc-800/80 hover:bg-slate-200/90 dark:hover:bg-zinc-700/90 text-slate-500 dark:text-zinc-400 italic text-xs flex items-center gap-2 border border-slate-200/50 dark:border-zinc-700/50 cursor-pointer shadow-2xs transition-colors"
                            title="Click or hold to permanently remove this deleted message box"
                          >
                            <span className="opacity-75">🚫</span>
                            <span>This message was deleted</span>
                            <span className="text-[9px] font-mono not-italic ml-2 opacity-60">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* 1-Tap Permanent Purge for both sides / me */}
                          <button
                            type="button"
                            onClick={() => handlePermanentPurgeBothSides(msg)}
                            className="p-1.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-500 hover:text-rose-700 opacity-60 sm:opacity-0 group-hover/delmsg:opacity-100 transition-all cursor-pointer shrink-0"
                            title="Delete this message box completely from both sides (दोनों तरफ से इस डिब्बे को भी हटाएं)"
                            aria-label="Delete message placeholder"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={msg.id || index}
                        className="relative w-full group/msg overflow-visible select-none my-1"
                      >
                        {/* Swipe-to-reply hint icon */}
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 opacity-0 group-hover/msg:opacity-60 transition-opacity pointer-events-none z-0">
                          <Reply className="w-3.5 h-3.5" />
                        </div>

                        <motion.div
                          drag="x"
                          dragSnapToOrigin={true}
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={{ left: 0.01, right: 0.22 }}
                          dragTransition={{ bounceStiffness: 600, bounceDamping: 28 }}
                          onDragEnd={(_e, info) => {
                            if (info.offset.x > 80 && (info.velocity?.x || 0) >= 0) {
                              setReplyingTo(msg);
                              playMessageSentSound();
                              try { navigator.vibrate?.(30); } catch (e) {}
                              toast.success(`↩️ Replying to ${isOwn ? 'your message' : (activeContact.name || 'trader')}`, { duration: 1200 });
                            }
                          }}
                          onTouchStart={() => handleTouchStart(msg)}
                          onTouchEnd={handleTouchEnd}
                          onTouchMove={handleTouchMove}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setShowReactionPickerForMsg(msg);
                          }}
                          className={cn(
                            "flex w-full touch-pan-y relative z-10 cursor-grab active:cursor-grabbing",
                            isOwn ? "justify-end" : "justify-start"
                          )}
                        >
                          <div 
                            style={getBubbleStyle(isOwn)}
                            className={cn(
                              "max-w-[88%] sm:max-w-[75%] rounded-2xl p-2.5 sm:p-3 relative text-xs sm:text-sm font-medium leading-relaxed transition-all",
                              isOwn 
                                ? (bubbleConfig.preset === 'classic_whatsapp' && !bubbleConfig.animationEnabled
                                    ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] shadow-xs" 
                                    : "shadow-md") + " rounded-tr-none" 
                                : (bubbleConfig.preset === 'classic_whatsapp' && !bubbleConfig.animationEnabled
                                    ? "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none border border-slate-200/50 dark:border-zinc-700/50 shadow-xs" 
                                    : "shadow-md") + " rounded-tl-none"
                            )}
                          >
                            {/* Floating Reaction Bar Popover when Long Pressed */}
                            {showReactionPickerForMsg?.id === msg.id && (
                              <div 
                                className="absolute -top-12 z-50 left-1/2 -translate-x-1/2 bg-white dark:bg-[#233138] border border-slate-200 dark:border-zinc-700 shadow-2xl rounded-full px-2.5 py-1.5 flex items-center gap-1.5 animate-in fade-in zoom-in-90 duration-150"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {['❤️', '👍', '😂', '😮', '😢', '🙏', '🤝', '🔥'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      handleReactToMessage(msg.id, emoji);
                                      setShowReactionPickerForMsg(null);
                                    }}
                                    className="text-lg hover:scale-135 transition-transform active:scale-95 cursor-pointer p-0.5"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                                <div className="h-4 w-px bg-slate-300 dark:bg-zinc-600 mx-0.5" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowReactionPickerForMsg(null);
                                    setSelectedMsgForAction(msg);
                                  }}
                                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-500 cursor-pointer"
                                  title="More options (Delete, Star, Copy)"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowReactionPickerForMsg(null)}
                                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-400 cursor-pointer"
                                  title="Close"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Starred Indicator */}
                            {msg.isStarred && (
                              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center text-[9px] shadow-xs">
                                ★
                              </span>
                            )}

                            {/* AI Assistant Badge if message was generated by AI */}
                            {msg.isAiGenerated && (
                              <div className="mb-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black text-emerald-800 dark:text-emerald-300 w-fit select-none shadow-2xs">
                                <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>🤖 {msg.aiAssistantName || 'Vyapar AI Auto-Reply (व्यापार AI ऑटो-रिप्लाई)'}</span>
                                <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse shrink-0" />
                              </div>
                            )}

                            {/* Quoted Message */}
                            {msg.quotedMessage && (
                              <div className="mb-2 p-2 rounded-lg bg-black/5 dark:bg-black/20 border-l-4 border-emerald-600 text-[11px]">
                                <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                                  {msg.quotedMessage.senderName}
                                </span>
                                <span className="truncate block opacity-80">
                                  {msg.quotedMessage.text}
                                </span>
                              </div>
                            )}

                            {/* 1. Image Media Preview */}
                            {msg.imageUrl && (
                              <div className="rounded-xl overflow-hidden mb-2 border border-black/10 relative group/img max-h-72">
                                <img 
                                  src={msg.imageUrl} 
                                  alt="Shared Photo" 
                                  className="w-full h-full object-cover cursor-pointer hover:scale-102 transition-transform" 
                                  onClick={() => window.open(msg.imageUrl, '_blank')}
                                />
                                {/* 1-Tap Save to Device Memory Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadFile(msg.imageUrl!, `vyapar_${Date.now()}.jpg`);
                                  }}
                                  className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-[10px] font-bold flex items-center gap-1 shadow-md cursor-pointer transition-transform active:scale-95"
                                  title="Download to Phone Memory"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Save</span>
                                </button>
                              </div>
                            )}

                            {/* 2. PDF / Document Card */}
                            {msg.mediaType === 'pdf' && (
                              <div className="p-3 bg-black/5 dark:bg-black/20 rounded-xl mb-2 flex items-center justify-between gap-3 border border-black/10">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-xs truncate block text-slate-900 dark:text-white">
                                      {msg.documentName || msg.text || 'Document.pdf'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                                      {msg.fileSize || 'PDF Document'}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => msg.documentUrl && handleDownloadFile(msg.documentUrl, msg.documentName || 'document.pdf')}
                                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shrink-0 transition-transform active:scale-95"
                                  title="Download PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {/* 3. GPS Location Card */}
                            {msg.mediaType === 'location' && msg.locationData && (
                              <div className="rounded-xl overflow-hidden mb-2 border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 space-y-2">
                                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-black text-xs block">Business Location</span>
                                    <span className="text-[10px] opacity-80 truncate block">{msg.locationData.address || 'GPS Coordinates'}</span>
                                  </div>
                                </div>
                                <a
                                  href={msg.locationData.mapUrl || `https://maps.google.com/?q=${msg.locationData.lat},${msg.locationData.lng}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Navigation className="w-3.5 h-3.5" />
                                  <span>Open in Google Maps</span>
                                </a>
                              </div>
                            )}

                            {/* 4. Contact Card */}
                            {msg.mediaType === 'contact' && msg.contactData && (
                              <div className="p-3 bg-black/5 dark:bg-black/30 rounded-2xl mb-2 border border-blue-500/30 space-y-2.5 min-w-[210px] sm:min-w-[240px]">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                                    {msg.contactData.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="font-extrabold text-xs block text-slate-900 dark:text-white truncate">
                                      {msg.contactData.name}
                                    </span>
                                    {msg.contactData.companyName && (
                                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-medium">
                                        🏢 {msg.contactData.companyName} {msg.contactData.city ? `(${msg.contactData.city})` : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-1 text-[11px] bg-white/60 dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 font-mono">
                                  {msg.contactData.phone && (
                                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span className="truncate">{msg.contactData.phone}</span>
                                    </div>
                                  )}
                                  {msg.contactData.email && (
                                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                      <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                                      <span className="truncate">{msg.contactData.email}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Direct Action Buttons */}
                                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                  {msg.contactData.phone && (
                                    <a
                                      href={`tel:${msg.contactData.phone}`}
                                      className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center gap-1 text-center shadow-2xs transition-colors"
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>Call</span>
                                    </a>
                                  )}
                                  {msg.contactData.phone && (
                                    <a
                                      href={`https://wa.me/91${msg.contactData.phone.replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="py-1.5 px-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] font-bold flex items-center justify-center gap-1 text-center shadow-2xs transition-colors"
                                    >
                                      <span>WhatsApp</span>
                                    </a>
                                  )}
                                  {msg.contactData.email && (
                                    <a
                                      href={`mailto:${msg.contactData.email}`}
                                      className="py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center gap-1 text-center shadow-2xs transition-colors col-span-1"
                                    >
                                      <Mail className="w-3 h-3" />
                                      <span>Email</span>
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleSaveContactToPhone(msg.contactData!)}
                                    className="py-1.5 px-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center gap-1 text-center shadow-2xs transition-colors cursor-pointer"
                                    title="Save to Phone Contacts (VCF)"
                                  >
                                    <BookUser className="w-3 h-3 text-amber-400" />
                                    <span>Save VCF</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Text Content */}
                            {msg.text && msg.mediaType !== 'pdf' && msg.mediaType !== 'location' && msg.mediaType !== 'contact' && (
                              <div className={cn(
                                "whitespace-pre-wrap break-words pr-12",
                                bubbleConfig.preset !== 'classic_whatsapp' ? "text-inherit" : "text-slate-900 dark:text-slate-100"
                              )}>
                                {msg.text}
                              </div>
                            )}

                            {/* Recommended Post / Catalogue Item Link Card from Smart Activity Algorithmic Engine */}
                            {Array.isArray(msg.recommendedPosts) && msg.recommendedPosts.length > 0 && (
                              <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-white/10 space-y-2">
                                <div className="text-[11px] font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                                  <span>Recommended Post & Live Rate Link:</span>
                                </div>
                                {msg.recommendedPosts.map(post => (
                                  <div
                                    key={post.id}
                                    onClick={() => {
                                      // Deep link directly to feed post or reel
                                      navigate(`/?postId=${post.id}#post-${post.id}`);
                                    }}
                                    className="p-2.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 border border-amber-500/40 hover:border-amber-500 shadow-xs cursor-pointer transition-all hover:scale-[1.01] active:scale-95 group/postcard select-none"
                                  >
                                    <div className="flex items-start gap-2.5">
                                      {post.imageUrl ? (
                                        <img 
                                          src={post.imageUrl} 
                                          alt={post.title} 
                                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-zinc-700 shrink-0" 
                                        />
                                      ) : post.videoUrl ? (
                                        <div className="w-14 h-14 rounded-lg bg-zinc-800 text-white flex flex-col items-center justify-center shrink-0 border border-zinc-700">
                                          <Video className="w-5 h-5 text-rose-400" />
                                          <span className="text-[8px] font-bold mt-0.5">Reel 🎥</span>
                                        </div>
                                      ) : (
                                        <div className="w-14 h-14 rounded-lg bg-amber-500/10 text-amber-600 flex flex-col items-center justify-center shrink-0 border border-amber-500/20">
                                          <Package className="w-5 h-5" />
                                          <span className="text-[8px] font-bold mt-0.5">Trade</span>
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover/postcard:text-blue-600 dark:group-hover/postcard:text-blue-400">
                                          {post.title}
                                        </h4>
                                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                          {post.price && (
                                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300/40">
                                              ₹{post.price} {post.unit ? `/${post.unit}` : ''}
                                            </span>
                                          )}
                                          {post.moq && (
                                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                                              MOQ: {post.moq}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between mt-1 text-[9px] text-slate-500 dark:text-zinc-400">
                                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                                            🔥 Trending Post
                                          </span>
                                          <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 underline">
                                            Open Post & Rate ↗
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Emoji Reaction Badges attached to bubble */}
                            {Array.isArray(msg.reactions) && msg.reactions.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-1 pt-1">
                                {Object.entries(
                                  msg.reactions.reduce((acc, r) => {
                                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                    return acc;
                                  }, {} as Record<string, number>)
                                ).map(([emoji, count]) => {
                                  const reactedByMe = msg.reactions?.some(r => String(r.userId) === String(user.id) && r.emoji === emoji);
                                  return (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => handleReactToMessage(msg.id, emoji)}
                                      className={cn(
                                        "px-1.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-0.5 transition-transform active:scale-95 cursor-pointer shadow-2xs border",
                                        reactedByMe 
                                          ? "bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-800 dark:text-emerald-300"
                                          : "bg-white/80 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300"
                                      )}
                                      title={msg.reactions?.filter(r => r.emoji === emoji).map(r => r.userName || 'User').join(', ')}
                                    >
                                      <span>{emoji}</span>
                                      {count > 1 && <span className="text-[9px]">{count}</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Timestamp & Status Ticks inside WhatsApp Bubble */}
                            <div className="absolute bottom-1 right-2 flex items-center gap-1 select-none pointer-events-none">
                              <span className="text-[9px] text-[#667781] dark:text-[#8696a0] font-mono">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isOwn && (
                                <div className="flex items-center ml-0.5">
                                  {isMessageRead ? (
                                    <span className="rainbow-double-tick inline-flex items-center" title="Read & Delivered (Rainbow Reflection Double Tick)">
                                      <CheckCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center text-rose-500 font-bold" title="Sent / Offline (Single Red Tick)">
                                      <Check className="w-3.5 h-3.5 shrink-0 text-rose-500 font-black" strokeWidth={3} />
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}

                  {/* AI Auto-Reply Typing Indicator */}
                  {isAiTyping && (
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-[#202c33]/95 border border-slate-200/80 dark:border-zinc-700/80 w-fit text-xs text-slate-700 dark:text-slate-200 shadow-sm animate-fade-in my-1.5">
                      <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse shrink-0" />
                      <span className="font-bold text-[11px]">
                        🤖 {activeContact?.companyName || activeContact?.name || 'Trader'} AI Assistant is typing...
                      </span>
                      <span className="flex items-center gap-1 ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* WhatsApp-Style Slide/Quote Replying Banner with Cut/Cancel Button */}
                <AnimatePresence>
                  {replyingTo && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: 10, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="bg-[#f0f2f5] dark:bg-[#202c33] p-2.5 px-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 z-20 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 border-l-4 border-emerald-500 pl-3 py-0.5">
                        <Reply className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="font-extrabold text-[11px] text-emerald-700 dark:text-emerald-400 block leading-tight truncate">
                            Replying to {replyingTo.senderId === user.id ? 'You (आपका संदेश)' : (activeContact.name || activeContact.companyName || 'Trader')}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-300 truncate block font-medium mt-0.5">
                            {replyingTo.imageUrl 
                              ? '📷 Photo' 
                              : replyingTo.mediaType === 'pdf' 
                                ? `📄 ${replyingTo.documentName || 'PDF Document'}` 
                                : replyingTo.mediaType === 'location' 
                                  ? `📍 Location: ${replyingTo.locationData?.address || 'Map Pin'}` 
                                  : replyingTo.mediaType === 'contact' 
                                    ? `👤 Contact: ${replyingTo.contactData?.name || 'Contact Card'}` 
                                    : (replyingTo.text || 'Message')}
                          </span>
                        </div>
                      </div>

                      {/* Prominent Cut / Cancel Reply Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null);
                          try { navigator.vibrate?.(20); } catch (e) {}
                        }}
                        className="p-1.5 sm:px-2.5 sm:py-1 rounded-full sm:rounded-xl bg-slate-200 hover:bg-rose-500 dark:bg-zinc-700 dark:hover:bg-rose-600 text-slate-600 dark:text-slate-300 hover:text-white dark:hover:text-white transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs group"
                        title="Cut / Cancel Reply (जवाब रद्द करें)"
                        aria-label="Cancel Reply"
                      >
                        <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold hidden sm:inline">Cut / Cancel</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pending Image Preview Box */}
                {pendingImagePreview && (
                  <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-3 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-3 z-20">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md shrink-0">
                      <img src={pendingImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => { setPendingImageFile(null); setPendingImagePreview(''); }}
                        className="absolute top-1 right-1 p-0.5 bg-black/70 rounded-full text-white hover:bg-black"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex-1 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-bold block text-emerald-600">📷 Photo ready (KB compressed)</span>
                      <span className="text-[10px] text-slate-400">Lightweight photo will be sent</span>
                    </div>
                  </div>
                )}

                {/* Floating WhatsApp Attachment Menu (+ / Paperclip Popover) matching Authentic WhatsApp Drawer */}
                <AnimatePresence>
                  {showAttachMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      className="absolute bottom-16 left-2 right-2 sm:left-4 sm:right-auto sm:w-[350px] bg-[#111b21] text-white p-4 pt-2.5 rounded-3xl shadow-2xl border border-white/10 z-40 backdrop-blur-md select-none"
                    >
                      {/* Top Grab Handle */}
                      <div className="w-9 h-1 rounded-full bg-zinc-600/70 mx-auto mb-3.5" />

                      {/* 4x2 Grid of Attachment Buttons matching Screenshot */}
                      <div className="grid grid-cols-4 gap-y-3.5 gap-x-1.5 text-center">
                        {/* 1. Document */}
                        <button
                          type="button"
                          onClick={() => { setShowAttachMenu(false); docInputRef.current?.click(); }}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none"
                        >
                          <div className="w-14 h-8 sm:w-16 sm:h-9 rounded-full bg-[#1f2c34] hover:bg-[#2a3942] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-all shadow-xs">
                            <FileText className="w-4.5 h-4.5 text-[#c084fc]" />
                          </div>
                          <span className="text-[11px] font-semibold text-white/95 whitespace-nowrap leading-tight">
                            Document
                          </span>
                        </button>

                        {/* 2. Catalog */}
                        <button
                          type="button"
                          onClick={handleShareCatalog}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none"
                        >
                          <div className="w-14 h-8 sm:w-16 sm:h-9 rounded-full bg-[#1f2c34] hover:bg-[#2a3942] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-all shadow-xs">
                            <Store className="w-4.5 h-4.5 text-[#22d3ee]" />
                          </div>
                          <span className="text-[11px] font-semibold text-white/95 whitespace-nowrap leading-tight">
                            Catalog
                          </span>
                        </button>

                        {/* 3. Quick Reply */}
                        <button
                          type="button"
                          onClick={() => { setShowAttachMenu(false); setShowAiAssistBar(true); }}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none"
                        >
                          <div className="w-14 h-8 sm:w-16 sm:h-9 rounded-full bg-[#1f2c34] hover:bg-[#2a3942] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-all shadow-xs">
                            <Zap className="w-4.5 h-4.5 text-[#fbbf24] fill-[#fbbf24]" />
                          </div>
                          <span className="text-[11px] font-semibold text-white/95 whitespace-nowrap leading-tight">
                            Quick Reply
                          </span>
                        </button>

                        {/* 4. Location */}
                        <button
                          type="button"
                          onClick={() => { setShowAttachMenu(false); setShowLocationModal(true); }}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none"
                        >
                          <div className="w-14 h-8 sm:w-16 sm:h-9 rounded-full bg-[#1f2c34] hover:bg-[#2a3942] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-all shadow-xs">
                            <MapPin className="w-4.5 h-4.5 text-[#34d399] fill-[#34d399]" />
                          </div>
                          <span className="text-[11px] font-semibold text-white/95 whitespace-nowrap leading-tight">
                            Location
                          </span>
                        </button>

                        {/* 5. Contact (Direct Native Mobile Phonebook Hit) */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachMenu(false);
                            handlePickFromNativePhonebook();
                          }}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none"
                          title="Open Mobile Phonebook / Share Contact"
                        >
                          <div className="w-14 h-8 sm:w-16 sm:h-9 rounded-full bg-[#1f2c34] hover:bg-[#2a3942] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-all shadow-xs">
                            <User className="w-4.5 h-4.5 text-[#38bdf8] fill-[#38bdf8]" />
                          </div>
                          <span className="text-[11px] font-semibold text-white/95 whitespace-nowrap leading-tight">
                            Contact
                          </span>
                        </button>

                        {/* 6. Poll */}
                        <button
                          type="button"
                          onClick={handleSharePoll}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none"
                        >
                          <div className="w-14 h-8 sm:w-16 sm:h-9 rounded-full bg-[#1f2c34] hover:bg-[#2a3942] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-all shadow-xs">
                            <BarChart2 className="w-4.5 h-4.5 text-[#facc15]" />
                          </div>
                          <span className="text-[11px] font-semibold text-white/95 whitespace-nowrap leading-tight">
                            Poll
                          </span>
                        </button>

                        {/* 7. Event */}
                        <button
                          type="button"
                          onClick={handleShareEvent}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none"
                        >
                          <div className="w-14 h-8 sm:w-16 sm:h-9 rounded-full bg-[#1f2c34] hover:bg-[#2a3942] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-all shadow-xs">
                            <Calendar className="w-4.5 h-4.5 text-[#f472b6]" />
                          </div>
                          <span className="text-[11px] font-semibold text-white/95 whitespace-nowrap leading-tight">
                            Event
                          </span>
                        </button>

                        {/* 8. Share UPI QR */}
                        <button
                          type="button"
                          onClick={handleShareUpiQr}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none"
                        >
                          <div className="w-14 h-8 sm:w-16 sm:h-9 rounded-full bg-[#1f2c34] hover:bg-[#2a3942] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-all shadow-xs">
                            <QrCode className="w-4.5 h-4.5 text-[#38bdf8]" />
                          </div>
                          <span className="text-[11px] font-semibold text-white/95 whitespace-nowrap leading-tight">
                            Share UPI QR
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Emojis Bar */}
                {showEmojiPicker && (
                  <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-3 py-2 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto z-20">
                    {TRADE_QUICK_EMOJIS.map((em, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewMessage(prev => prev + em)}
                        className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}

                {/* AI Smart Trade Suggestions Tray */}
                <AnimatePresence>
                  {showAiAssistBar && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-emerald-50/90 dark:bg-[#182a24]/90 p-2.5 px-3 border-t border-emerald-500/20 z-20 flex flex-col gap-2 backdrop-blur-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
                          <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Vyapar AI Assistant (स्मार्ट व्यापार उत्तर):</span>
                          {isGeneratingAiSuggestion && (
                            <span className="text-[10px] text-emerald-600 font-normal flex items-center gap-1">
                              <Sparkles className="w-3 h-3 animate-spin" /> Drafting...
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAiAssistBar(false)}
                          className="p-1 rounded-full text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/40 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 1-Tap AI Action Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        <button
                          type="button"
                          disabled={isGeneratingAiSuggestion}
                          onClick={() => handleTriggerSmartAiAction('auto_reply')}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shadow-2xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>⚡ Auto-Draft Reply (जवाब बनाएं)</span>
                        </button>

                        <button
                          type="button"
                          disabled={isGeneratingAiSuggestion}
                          onClick={() => handleTriggerSmartAiAction('inquire_moq_rates')}
                          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shadow-2xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          <span>📦 MOQ & Rate Card</span>
                        </button>

                        <button
                          type="button"
                          disabled={isGeneratingAiSuggestion}
                          onClick={() => handleTriggerSmartAiAction('request_catalog')}
                          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shadow-2xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          <span>📄 Catalog & GST Bill</span>
                        </button>

                        <button
                          type="button"
                          disabled={isGeneratingAiSuggestion}
                          onClick={() => handleTriggerSmartAiAction('ask_delivery_dispatch')}
                          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shadow-2xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          <span>🚚 Dispatch & Logistics</span>
                        </button>

                        <button
                          type="button"
                          disabled={isGeneratingAiSuggestion}
                          onClick={() => handleTriggerSmartAiAction('confirm_deal')}
                          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shadow-2xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          <span>🤝 Confirm Deal (सौदा पक्का)</span>
                        </button>

                        {newMessage.trim() && (
                          <button
                            type="button"
                            disabled={isGeneratingAiSuggestion}
                            onClick={() => handleTriggerSmartAiAction('polish_draft')}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-black flex items-center gap-1 whitespace-nowrap shadow-2xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>✍️ Polish My Draft</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* WhatsApp Message Input Bar (Authentic WhatsApp Mobile / Web Design) */}
                <div className="bg-[#f0f2f5] dark:bg-[#0b141a] p-2 sm:p-2.5 flex items-end gap-1.5 sm:gap-2 border-t border-slate-200/80 dark:border-zinc-800/80 shrink-0 z-30">
                  {/* Rounded Pill Container (Holds Emoji, Message Input, Paperclip, Camera, and AI) */}
                  <div className="flex-1 min-h-[46px] sm:min-h-[48px] bg-white dark:bg-[#1f2c34] rounded-[24px] sm:rounded-[26px] px-2 sm:px-3 py-1 flex items-center gap-1 sm:gap-1.5 shadow-xs border border-slate-200/70 dark:border-zinc-700/60">
                    {/* Emoji Button (Inside Left) */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={cn(
                        "p-1.5 rounded-full transition-colors cursor-pointer shrink-0",
                        showEmojiPicker 
                          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" 
                          : "text-[#54656f] dark:text-[#8696a0] hover:text-slate-800 dark:hover:text-white"
                      )}
                      title="Emojis (इमोजी)"
                      aria-label="Emoji Picker"
                    >
                      <Smile className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                    </button>

                    {/* Input Text Box */}
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                      className="flex-1 flex items-center min-w-0"
                    >
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message"
                        className="w-full bg-transparent text-slate-900 dark:text-white text-sm sm:text-[15px] focus:outline-none placeholder-[#8696a0] dark:placeholder-[#8696a0] py-1.5 px-1 min-w-0"
                      />
                    </form>

                    {/* WhatsApp Paperclip Attachment Button (Inside Right) */}
                    <button
                      type="button"
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      className={cn(
                        "p-1.5 rounded-full transition-colors cursor-pointer shrink-0",
                        showAttachMenu 
                          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" 
                          : "text-[#54656f] dark:text-[#8696a0] hover:text-slate-800 dark:hover:text-white"
                      )}
                      title="Share Attachments (Documents, Location, Photos, Contacts)"
                      aria-label="Attach Media"
                    >
                      <Paperclip className="w-5 h-5 sm:w-5.5 sm:h-5.5 -rotate-45" strokeWidth={2} />
                    </button>

                    {/* Direct Camera Capture Button (Inside Right) */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-1.5 text-[#54656f] dark:text-[#8696a0] hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full transition-colors cursor-pointer shrink-0"
                      title="Take Photo from Camera (फोटो खींचें)"
                      aria-label="Camera"
                    >
                      <Camera className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2} />
                    </button>

                    {/* AI Trade Assistant Trigger (Inside Right) */}
                    <button
                      type="button"
                      onClick={() => setShowAiAssistBar(!showAiAssistBar)}
                      className={cn(
                        "p-1.5 rounded-full transition-all cursor-pointer shrink-0",
                        showAiAssistBar 
                          ? "bg-emerald-600 text-white shadow-2xs" 
                          : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      )}
                      title="Vyapar AI Trade Assistant (AI उत्तर व सुझाव)"
                      aria-label="AI Assistant"
                    >
                      <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                  </div>

                  {/* Circular Floating Action Button (Outside Pill on Right) */}
                  {newMessage.trim() || pendingImagePreview ? (
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={uploadingMedia}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-md cursor-pointer transition-all shrink-0 active:scale-95 disabled:opacity-50"
                      title="Send Message (भेजें)"
                      aria-label="Send Message"
                    >
                      <Send className="w-5 h-5 translate-x-0.5" strokeWidth={2.2} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      className={cn(
                        "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all shrink-0 active:scale-95",
                        isListeningVoice 
                          ? "bg-rose-500 text-white animate-pulse ring-4 ring-rose-400/50" 
                          : "bg-[#00a884] hover:bg-[#008f6f] text-white"
                      )}
                      title={isListeningVoice ? "Listening... Tap to stop" : "Voice Message (बोलकर मैसेज लिखें)"}
                      aria-label="Voice Message"
                    >
                      <Mic className="w-5 h-5" strokeWidth={2.2} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: CHAT SETTINGS (THEME, COLOR BAR, SOUND, PRIVACY)  */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    Chat Settings & Preferences
                  </h3>
                </div>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Settings Tabs (Bubbles | Wallpaper | Sounds | Privacy | AI) */}
              <div className="flex border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSettingsTab('bubbles')}
                  className={cn(
                    "px-3 py-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0",
                    settingsTab === 'bubbles' 
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20" 
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>💬 Bubbles & Glow</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsTab('theme')}
                  className={cn(
                    "px-3 py-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0",
                    settingsTab === 'theme' 
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20" 
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>🎨 Wallpaper</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsTab('sound')}
                  className={cn(
                    "px-3 py-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0",
                    settingsTab === 'sound' 
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20" 
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>🔊 Sounds</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsTab('privacy')}
                  className={cn(
                    "px-3 py-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0",
                    settingsTab === 'privacy' 
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20" 
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>🔒 Privacy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsTab('ai_assistant')}
                  className={cn(
                    "px-3 py-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0",
                    settingsTab === 'ai_assistant' 
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20" 
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>🤖 AI Auto-Reply</span>
                </button>
              </div>

              {/* Tab Content Body */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
                
                {/* 0. CUSTOM CHAT BUBBLE BLENDING & ANIMATED GLOW STUDIO */}
                {settingsTab === 'bubbles' && (
                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                          Chat Bubble Color Blend & Glowing Light Studio
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {bubbleConfig.animationEnabled ? `⚡ Glow ON (${bubbleConfig.animationSpeed}s)` : 'Standard'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Apne chat bubbles me custom colors ko aapas me blend (gradient) karein aur animated light glow effect with speed button control karein.
                      </p>
                    </div>

                    {/* LIVE INTERACTIVE PREVIEW BOX */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 dark:bg-black/90 border border-slate-700 shadow-inner space-y-2.5 relative overflow-hidden">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-emerald-400" /> Live Bubble Preview (लाइव प्रिव्यू)
                        </span>
                        <span className="font-mono text-emerald-400">
                          {bubbleConfig.preset !== 'custom' ? bubbleConfig.preset.toUpperCase() : 'CUSTOM BLEND'}
                        </span>
                      </div>

                      {/* Mock Sent Bubble (Outgoing) */}
                      <div className="flex justify-end">
                        <div
                          style={getBubbleStyle(true)}
                          className="max-w-[85%] rounded-2xl rounded-tr-none p-2.5 text-xs font-medium relative shadow-lg"
                        >
                          <span>Namaste Trader! Wholesale rate list check kijiye 📦</span>
                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-80 font-mono">
                            <span>10:45 AM</span>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                        </div>
                      </div>

                      {/* Mock Received Bubble (Incoming) */}
                      <div className="flex justify-start">
                        <div
                          style={getBubbleStyle(false)}
                          className="max-w-[85%] rounded-2xl rounded-tl-none p-2.5 text-xs font-medium relative shadow-lg"
                        >
                          <span>Deal confirmed! Ready for 500 units shipment 🚀</span>
                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-80 font-mono">
                            <span>10:46 AM</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 1-TAP DESIGNER PRESETS */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          1-Tap Designer Preset Styles:
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">8 Presets</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {BUBBLE_PRESETS.map((preset) => {
                          const isSelected = bubbleConfig.preset === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectBubblePreset(preset)}
                              className={cn(
                                "p-2 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-20 shadow-xs hover:scale-102 active:scale-98",
                                isSelected 
                                  ? "border-emerald-500 ring-2 ring-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/30" 
                                  : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-base">{preset.icon}</span>
                                {isSelected ? (
                                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </span>
                                ) : (
                                  <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-zinc-600" />
                                )}
                              </div>
                              <div>
                                <span className="text-xs font-bold block text-slate-900 dark:text-white truncate">
                                  {preset.name}
                                </span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span 
                                    className="w-3.5 h-2 rounded-full border border-black/20" 
                                    style={{ backgroundColor: preset.config.sentColor1 }} 
                                  />
                                  <span 
                                    className="w-3.5 h-2 rounded-full border border-black/20" 
                                    style={{ backgroundColor: preset.config.sentColor2 }} 
                                  />
                                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono ml-auto">
                                    {preset.config.animationEnabled ? `${preset.config.animationSpeed}s` : 'Static'}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* DUAL COLOR BLEND CUSTOMIZER */}
                    <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/70 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                          <Palette className="w-3.5 h-3.5 text-emerald-600" />
                          Custom Dual-Color Blend (दो रंगों का मिश्रण)
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Custom Blend</span>
                      </div>

                      {/* Outgoing (Sent) Message Bubble Colors */}
                      <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                          📤 Outgoing / Sent Bubbles (मेरे भेजे संदेश):
                        </span>
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* Color 1 */}
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bubbleConfig.sentColor1}
                              onChange={(e) => handleUpdateBubbleConfig({ sentColor1: e.target.value })}
                              className="w-8 h-8 rounded-lg border-none cursor-pointer p-0 bg-transparent shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-slate-500 block">Color 1 (Base)</span>
                              <span className="text-[10px] font-mono text-slate-900 dark:text-white truncate block">{bubbleConfig.sentColor1}</span>
                            </div>
                          </div>

                          {/* Color 2 */}
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bubbleConfig.sentColor2}
                              onChange={(e) => handleUpdateBubbleConfig({ sentColor2: e.target.value })}
                              className="w-8 h-8 rounded-lg border-none cursor-pointer p-0 bg-transparent shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-slate-500 block">Color 2 (Blend)</span>
                              <span className="text-[10px] font-mono text-slate-900 dark:text-white truncate block">{bubbleConfig.sentColor2}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Palette Circles for Sent */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {QUICK_PALETTE_COLORS.map((c, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleUpdateBubbleConfig({ sentColor1: c })}
                              style={{ backgroundColor: c }}
                              className="w-5 h-5 rounded-full border border-black/20 hover:scale-120 transition-transform cursor-pointer shadow-2xs"
                              title={`Set Sent Base: ${c}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Incoming (Received) Message Bubble Colors */}
                      <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                          📥 Incoming / Received Bubbles (आए हुए संदेश):
                        </span>
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* Color 1 */}
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bubbleConfig.receivedColor1}
                              onChange={(e) => handleUpdateBubbleConfig({ receivedColor1: e.target.value })}
                              className="w-8 h-8 rounded-lg border-none cursor-pointer p-0 bg-transparent shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-slate-500 block">Color 1 (Base)</span>
                              <span className="text-[10px] font-mono text-slate-900 dark:text-white truncate block">{bubbleConfig.receivedColor1}</span>
                            </div>
                          </div>

                          {/* Color 2 */}
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bubbleConfig.receivedColor2}
                              onChange={(e) => handleUpdateBubbleConfig({ receivedColor2: e.target.value })}
                              className="w-8 h-8 rounded-lg border-none cursor-pointer p-0 bg-transparent shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-slate-500 block">Color 2 (Blend)</span>
                              <span className="text-[10px] font-mono text-slate-900 dark:text-white truncate block">{bubbleConfig.receivedColor2}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Palette Circles for Received */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {QUICK_PALETTE_COLORS.map((c, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleUpdateBubbleConfig({ receivedColor1: c })}
                              style={{ backgroundColor: c }}
                              className="w-5 h-5 rounded-full border border-black/20 hover:scale-120 transition-transform cursor-pointer shadow-2xs"
                              title={`Set Received Base: ${c}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Gradient Angle Direction */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          Blend Direction Angle (कोण):
                        </span>
                        <div className="flex gap-1">
                          {[
                            { label: '45°', val: 45 },
                            { label: '90°', val: 90 },
                            { label: '135°', val: 135 },
                            { label: '180°', val: 180 }
                          ].map((ang) => (
                            <button
                              key={ang.val}
                              type="button"
                              onClick={() => handleUpdateBubbleConfig({ gradientAngle: ang.val })}
                              className={cn(
                                "px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                                bubbleConfig.gradientAngle === ang.val
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                              )}
                            >
                              {ang.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ANIMATED GLOW & LIGHT ENGINE TOGGLE & CONTROLS */}
                    <div className="p-3.5 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-blue-950/40 rounded-2xl border border-emerald-300/50 dark:border-emerald-700/50 space-y-3">
                      {/* Master Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                            Animated Glowing Light & Breathing Aura (एनिमेटेड लाइट व ग्लो)
                          </span>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Chat bubbles ko animated glowing aura aur smooth gradient movement ke sath chamkayen.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateBubbleConfig({ animationEnabled: !bubbleConfig.animationEnabled })}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-xs",
                            bubbleConfig.animationEnabled 
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-2 ring-emerald-400/50" 
                              : "bg-slate-300 dark:bg-zinc-700 text-slate-700 dark:text-slate-300"
                          )}
                        >
                          {bubbleConfig.animationEnabled ? 'GLOW ON ✨' : 'OFF'}
                        </button>
                      </div>

                      {/* Animation FX Styles Selection */}
                      {bubbleConfig.animationEnabled && (
                        <div className="space-y-2 pt-1 border-t border-emerald-200/50 dark:border-emerald-800/50">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            Glow Effect Style:
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { id: 'both', label: '✨ Dual Flow & Aura (फ्लो + ऑरा)', desc: 'Continuous shimmer + pulsing halo' },
                              { id: 'gradient_flow', label: '💫 Shimmer Flow (रंगों का प्रवाह)', desc: 'Smooth gradient movement' },
                              { id: 'glow_pulse', label: '💡 Neon Breathing (पल्सिंग ग्लो)', desc: 'Gentle glowing light pulse' },
                              { id: 'chroma_shimmer', label: '🌈 Chroma Rainbow (इंद्रधनुष)', desc: 'Prismatic hue rotation' }
                            ].map((fx) => (
                              <button
                                key={fx.id}
                                type="button"
                                onClick={() => handleUpdateBubbleConfig({ animationType: fx.id as any })}
                                className={cn(
                                  "p-2 rounded-xl text-left border transition-all cursor-pointer",
                                  bubbleConfig.animationType === fx.id
                                    ? "bg-white dark:bg-zinc-900 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-black shadow-xs ring-1 ring-emerald-500/40"
                                    : "bg-white/60 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300"
                                )}
                              >
                                <span className="text-xs font-bold block">{fx.label}</span>
                                <span className="text-[9px] text-slate-400 block truncate">{fx.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SPEED CONTROLLER SLIDER */}
                      {bubbleConfig.animationEnabled && (
                        <div className="space-y-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/50">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1">
                              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                              Animation & Glow Speed (स्पीड बटन व स्लाइडर):
                            </span>
                            <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60">
                              {bubbleConfig.animationSpeed}s {bubbleConfig.animationSpeed <= 1.5 ? '⚡ Turbo' : bubbleConfig.animationSpeed <= 3.0 ? '✨ Smooth' : '🧘 Calm Slow'}
                            </span>
                          </div>

                          {/* Range Slider */}
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400">Fast (0.8s)</span>
                            <input
                              type="range"
                              min="0.8"
                              max="8.0"
                              step="0.2"
                              value={bubbleConfig.animationSpeed}
                              onChange={(e) => handleUpdateBubbleConfig({ animationSpeed: parseFloat(e.target.value) })}
                              className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg"
                            />
                            <span className="text-[10px] font-bold text-slate-400">Slow (8.0s)</span>
                          </div>

                          {/* 1-Tap Speed Preset Buttons */}
                          <div className="grid grid-cols-4 gap-1.5 pt-1">
                            {[
                              { label: '⚡ Fast (1.2s)', speed: 1.2 },
                              { label: '✨ Normal (2.5s)', speed: 2.5 },
                              { label: '🧘 Calm (4.5s)', speed: 4.5 },
                              { label: '🌙 Slow (7.0s)', speed: 7.0 }
                            ].map((sp) => (
                              <button
                                key={sp.speed}
                                type="button"
                                onClick={() => handleUpdateBubbleConfig({ animationSpeed: sp.speed })}
                                className={cn(
                                  "py-1.5 px-1 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer",
                                  bubbleConfig.animationSpeed === sp.speed
                                    ? "bg-emerald-600 text-white shadow-xs font-black"
                                    : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-zinc-700"
                                )}
                              >
                                {sp.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reset Button */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSelectBubblePreset(BUBBLE_PRESETS.find(p => p.id === 'classic_whatsapp')!)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Classic WhatsApp Bubbles</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectBubblePreset(BUBBLE_PRESETS[0])}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Reset to Emerald Glow</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 1. THEME & COLOR SPECTRUM BAR */}
                {settingsTab === 'theme' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        Full Color Palette & Spectrum Bar (रंग चुनें)
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Apni pasand ka koi bhi color choose karein. Yeh background kewal aapke browser me rahega (0 DB hits).
                      </p>
                    </div>

                    {/* Color Spectrum Swatches */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Preset Color Spectrum Bar:
                      </span>
                      <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
                        {COLOR_SPECTRUM_SWATCHES.map((swatch, idx) => {
                          const isSelected = customWallpaper === swatch.color;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSetWallpaper(swatch.color)}
                              className={cn(
                                "h-11 rounded-xl border-2 flex items-center justify-center p-1 relative transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95",
                                isSelected ? "border-emerald-500 ring-2 ring-emerald-500/50" : "border-slate-300 dark:border-zinc-700"
                              )}
                              style={{ backgroundColor: swatch.color }}
                              title={swatch.name}
                            >
                              <span className="text-[9px] font-bold truncate" style={{ color: swatch.textColor }}>
                                {swatch.name}
                              </span>
                              {isSelected && (
                                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xs">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Color Input */}
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input 
                          type="color" 
                          value={customWallpaper.startsWith('#') ? customWallpaper : '#005c4b'} 
                          onChange={(e) => handleSetWallpaper(e.target.value)}
                          className="w-9 h-9 rounded-xl border-none cursor-pointer p-0 bg-transparent"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            Custom Color Picker (पसंदीदा रंग)
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {customWallpaper.startsWith('#') ? customWallpaper : 'Default Theme'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Tap</span>
                    </div>

                    {/* Upload from Device Gallery */}
                    <div className="p-3 bg-amber-50 dark:bg-zinc-800/80 rounded-2xl border border-amber-200 dark:border-zinc-700 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          Upload Custom Photo (फोन से फोटो लगाएं)
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Set any image from phone gallery as wallpaper
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => wallpaperInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Photo</span>
                      </button>
                    </div>

                    {/* Reset to Default Watermark Logo */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSetWallpaper('default')}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset to Official Logo Watermark</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. SOUNDS & VIBRATION SETTINGS */}
                {settingsTab === 'sound' && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          Chat Sound Effects (मैसेज सेंड व रिसीव साउंड)
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          WhatsApp-style audio chime on sending and receiving messages.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleSound(!soundEnabled)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer",
                          soundEnabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-slate-300"
                        )}
                      >
                        {soundEnabled ? 'ON' : 'Muted'}
                      </button>
                    </div>

                    {/* Sound Test Buttons */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Test Sound Tones:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => playMessageSentSound()}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4 text-emerald-600" />
                          <span>Sent Pop Tone</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => playMessageReceivedSound()}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4 text-blue-600" />
                          <span>Receive Chime</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => playDoubleTickSound()}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CheckCheck className="w-4 h-4 text-emerald-600" />
                          <span>Double Tick Tone</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PRIVACY & SECURITY SETTINGS */}
                {settingsTab === 'privacy' && (
                  <div className="space-y-4">
                    {/* Online Status */}
                    <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          Online Status Visibility
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Show other traders when you are active on Vyapar Bridge.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleOnlinePrivacy(!onlinePrivacy)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer",
                          onlinePrivacy ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-slate-300"
                        )}
                      >
                        {onlinePrivacy ? 'Visible' : 'Hidden'}
                      </button>
                    </div>

                    {/* Read Receipts */}
                    <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          Read Receipts (Blue Ticks)
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          If turned off, you won't send or receive blue read ticks.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleReadReceipts(!readReceipts)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer",
                          readReceipts ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-slate-300"
                        )}
                      >
                        {readReceipts ? 'Active' : 'Off'}
                      </button>
                    </div>

                    {/* Security Info */}
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/30 text-emerald-900 dark:text-emerald-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Shield className="w-4 h-4" />
                        <span>Verified B2B Trade Protection</span>
                      </div>
                      <p className="text-[11px] opacity-80 leading-relaxed">
                        All trade conversations, quotations, documents and invoices on Vyapar Bridge are strictly between you and verified Indian suppliers.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. AI ASSISTANT & AUTO-REPLY SETTINGS */}
                {settingsTab === 'ai_assistant' && (
                  <div className="space-y-4">
                    {/* Header Banner */}
                    <div className="p-3.5 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/5 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-zinc-900 rounded-2xl border border-emerald-500/30 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            Vyapar AI Trade Assistant & 24/7 Auto-Reply
                          </span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                            व्यापार AI ऑटो-रिप्लाई असिस्टेंट
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
                        Jab aap offline ya vyast rahenge, to aapka Vyapar AI assistant aapke business profile, wholesale MOQ aur policy ke mutabik customers ko instant response dekar deal pakki karega.
                      </p>
                    </div>

                    {/* Auto-Reply Master Toggle */}
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          AI Auto-Reply System (ऑटो-रिप्लाई सेवा)
                        </span>
                        <p className="text-[10px] text-slate-500">
                          Automatically answers buyer chats using your company catalog & policy
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAiAutoReplyEnabled(!aiAutoReplyEnabled)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs",
                          aiAutoReplyEnabled ? "bg-emerald-600 text-white ring-2 ring-emerald-500/30" : "bg-slate-300 dark:bg-zinc-700 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {aiAutoReplyEnabled ? 'Active (ON)' : 'Disabled (OFF)'}
                      </button>
                    </div>

                    {/* When should AI Reply */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                        Auto-Reply Trigger Condition (कब रिप्लाई दे):
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAiAutoReplyMode('when_offline')}
                          className={cn(
                            "p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                            aiAutoReplyMode === 'when_offline'
                              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500"
                              : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300"
                          )}
                        >
                          <span className="text-xs font-bold block">🌙 When I am Offline</span>
                          <span className="text-[10px] opacity-75 block">जब मैं ऑफलाइन या व्यस्त रहूं</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAiAutoReplyMode('always')}
                          className={cn(
                            "p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                            aiAutoReplyMode === 'always'
                              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500"
                              : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300"
                          )}
                        >
                          <span className="text-xs font-bold block">⚡ 24/7 Always Active</span>
                          <span className="text-[10px] opacity-75 block">हर समय तुरंत उत्तर दे</span>
                        </button>
                      </div>
                    </div>

                    {/* AI Assistant Tone */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                        Response Tone & Style (बातचीत की शैली):
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'professional_courteous', label: 'विनम्र व व्यावसायिक', desc: 'Polite & Courteous' },
                          { id: 'deal_focused', label: 'डील व कोटेशन', desc: 'MOQ & Rates' },
                          { id: 'concise_fast', label: 'संक्षिप्त व तेज़', desc: 'Short & Direct' }
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setAiTone(t.id)}
                            className={cn(
                              "p-2 rounded-xl border text-center transition-all cursor-pointer",
                              aiTone === t.id 
                                ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-bold ring-1 ring-emerald-500" 
                                : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-300"
                            )}
                          >
                            <span className="text-[11px] block">{t.label}</span>
                            <span className="text-[9px] opacity-75 block">{t.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Business Rules & Policies for AI */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-900 dark:text-white block">
                          Business Instructions & Policy (व्यापारिक निर्देश):
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">AI will follow this</span>
                      </div>
                      <textarea
                        rows={2}
                        value={aiCustomInstructions}
                        onChange={(e) => setAiCustomInstructions(e.target.value)}
                        placeholder="उदा: न्यूनतम 50 पेटी ऑर्डर, 20% टोकन एडवांस, ऑल इंडिया ट्रांसपोर्ट उपलब्ध, केवल थोक माल..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* AI Knowledge Profile Card */}
                    <div className="p-3 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Connected Profile Info (AI को पता जानकारी):</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          Auto-Synced
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="truncate font-medium">🏢 {user.companyName || user.name || 'Your Business'}</div>
                        <div className="truncate font-medium">📍 {user.city || user.state || 'India'}</div>
                        <div className="truncate font-medium">🏷️ {user.category || 'General Wholesale'}</div>
                        <div className="truncate font-medium">📞 {user.phone ? `+91 ${user.phone}` : 'Connected'}</div>
                      </div>
                    </div>

                    {/* Live Test AI Response */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          Test AI Reply Live (AI का जवाब देखें):
                        </span>
                        <button
                          type="button"
                          disabled={isTestingAi}
                          onClick={handleTestAiAutoReply}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isTestingAi ? 'Generating...' : '🧪 Test Live'}</span>
                        </button>
                      </div>

                      {testAiResponse && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/40 text-xs text-slate-800 dark:text-slate-200 space-y-1.5 animate-fade-in">
                          <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <Bot className="w-3.5 h-3.5" />
                            <span>Generated AI Auto-Reply Preview:</span>
                          </div>
                          <p className="leading-relaxed bg-white/70 dark:bg-zinc-800/70 p-2 rounded-xl">
                            {testAiResponse}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Save Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveAiSettings}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save AI Assistant Settings</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 border-t border-slate-200 dark:border-zinc-700 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: SHARE LOCATION                                    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-sm w-full p-5 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Share Location</h3>
                    <span className="text-[10px] text-slate-500 block">लोकेशन साझा करें</span>
                  </div>
                </div>
                <button onClick={() => setShowLocationModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Choose to send your registered business profile address or your current real-time GPS coordinates directly to {activeContact?.name || 'trader'}.
              </p>

              <div className="space-y-2.5">
                {/* 1. Share Profile Location */}
                <button
                  type="button"
                  onClick={handleShareProfileLocation}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-zinc-700 text-left transition-all cursor-pointer flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block leading-tight">
                      Share Profile Address
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                      {user.city || user.state ? `📍 ${user.city || user.state}, India` : 'Registered Business Location'}
                    </span>
                  </div>
                </button>

                {/* 2. Share Live GPS Location */}
                <button
                  type="button"
                  onClick={handleShareCurrentLocation}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all cursor-pointer flex items-center gap-3 shadow-md active:scale-98"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Navigation className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <span className="font-bold text-xs text-white block leading-tight">
                      Share Live GPS Location
                    </span>
                    <span className="text-[10px] text-emerald-100 block mt-0.5">
                      Send real-time device coordinates
                    </span>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL: SHARE CONTACT CARD                                */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-5 space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                    <BookUser className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Share Contact & Email Card</h3>
                    <span className="text-[10px] text-slate-500 block">फोनबुक या ईमेल से संपर्क साझा करें</span>
                  </div>
                </div>
                <button onClick={() => setShowContactModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Hidden VCF File Input for mobile phonebook fallback */}
              <input
                type="file"
                ref={vcfInputRef}
                accept=".vcf,text/vcard"
                onChange={handleVcfImport}
                className="hidden"
              />

              <div className="overflow-y-auto space-y-3.5 flex-1 pr-1">
                {/* 1. Quick Native Phonebook & My Profile Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handlePickFromNativePhonebook}
                    className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl flex items-center gap-2.5 shadow-xs cursor-pointer text-left transition-all active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs block leading-tight">Mobile Phonebook</span>
                      <span className="text-[10px] opacity-90 block truncate">फ़ोनबुक से चुनें</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareMyProfileContact}
                    className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl flex items-center gap-2.5 shadow-xs cursor-pointer text-left transition-all active:scale-98"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs block leading-tight">Share My Profile</span>
                      <span className="text-[10px] opacity-90 block truncate">{user.email || 'Registered Email'}</span>
                    </div>
                  </button>
                </div>

                {/* 2. Manual Custom Contact Form (with Email as registered base) */}
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/70 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Direct Contact Details (ईमेल व मोबाइल आधार)
                    </span>
                    <span className="text-[9px] text-blue-600 font-bold">Custom Card</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Trader / Person Name *"
                    value={customContactName}
                    onChange={(e) => setCustomContactName(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 p-2.5 rounded-xl text-xs border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                      <input
                        type="tel"
                        placeholder="Mobile (e.g. 9889104477)"
                        value={customContactPhone}
                        onChange={(e) => setCustomContactPhone(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 pl-8 pr-2.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                      <input
                        type="email"
                        placeholder="Email ID (e.g. trader@mail.com)"
                        value={customContactEmail}
                        onChange={(e) => setCustomContactEmail(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 pl-8 pr-2.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Business / Company Name (Optional)"
                    value={customContactCompany}
                    onChange={(e) => setCustomContactCompany(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 p-2.5 rounded-xl text-xs border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    disabled={!customContactName.trim() || (!customContactPhone.trim() && !customContactEmail.trim())}
                    onClick={() => handleShareContact({ 
                      name: customContactName, 
                      phone: customContactPhone, 
                      email: customContactEmail,
                      companyName: customContactCompany 
                    })}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl disabled:opacity-50 cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send Contact Card to Chat</span>
                  </button>
                </div>

                {/* 3. Pick from Registered Traders Directory with Search */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Or Pick from Registered Traders:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {contacts.length} Members
                    </span>
                  </div>

                  {/* Directory Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by name, email or mobile..."
                      value={directoryContactSearch}
                      onChange={(e) => setDirectoryContactSearch(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-zinc-800 pl-8 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-100 dark:border-zinc-800 rounded-2xl">
                    {contacts
                      .filter(c => {
                        if (!directoryContactSearch.trim()) return true;
                        const q = directoryContactSearch.toLowerCase();
                        return (
                          (c.name && c.name.toLowerCase().includes(q)) ||
                          (c.companyName && c.companyName.toLowerCase().includes(q)) ||
                          (c.email && c.email.toLowerCase().includes(q)) ||
                          (c.phone && c.phone.includes(q)) ||
                          (c.city && c.city.toLowerCase().includes(q))
                        );
                      })
                      .slice(0, 20)
                      .map(c => (
                        <div 
                          key={c.id}
                          onClick={() => handleShareContact(c)}
                          className="p-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {c.companyName || c.name}
                              </span>
                              {c.goldenBadge && <Crown className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                              {c.email && <span className="truncate">✉️ {c.email}</span>}
                              {c.phone && <span>📞 {c.phone}</span>}
                            </div>
                          </div>
                          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
                            <Share2 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 5. WHATSAPP LONG-PRESS MESSAGE ACTION POPUP MODAL */}
        {selectedMsgForAction && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white dark:bg-[#1f2c34] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-zinc-700/80"
            >
              {/* Header preview of the selected message */}
              <div className="p-4 bg-slate-50 dark:bg-[#111b21] border-b border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider">
                    Message Options
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate mt-0.5 max-w-xs">
                    {selectedMsgForAction.text || (selectedMsgForAction.mediaType === 'image' ? '📷 Photo' : '📎 Attachment')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMsgForAction(null)}
                  className="w-7 h-7 rounded-full bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons List */}
              <div className="p-2 space-y-1">
                {/* If selected message is already marked as deleted */}
                {selectedMsgForAction.deletedForEveryone ? (
                  <>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                      यह संदेश पहले से हटाया गया है। आप इस बचे हुए डिब्बे को भी दोनों तरफ से पूरी तरह गायब कर सकते हैं।
                    </div>

                    {/* Purge Both Sides */}
                    <button
                      type="button"
                      onClick={() => handlePermanentPurgeBothSides(selectedMsgForAction)}
                      className="w-full p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 flex items-center gap-3 text-rose-700 dark:text-rose-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold">Purge for Both Sides (दोनों तरफ से पूरी तरह हटाएं)</span>
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 block">Remove placeholder div from both traders</span>
                      </div>
                    </button>

                    {/* Delete for me */}
                    <button
                      type="button"
                      onClick={() => handleDeleteForMe(selectedMsgForAction)}
                      className="w-full p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold">Remove for Me (सिर्फ मेरे स्क्रीन से हटाएं)</span>
                        <span className="text-[10px] text-slate-500 block">Hide from your chat only</span>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Reply */}
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingTo(selectedMsgForAction);
                        setSelectedMsgForAction(null);
                        playMessageSentSound();
                      }}
                      className="w-full p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#2a3942] flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                        <Reply className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold">Reply (जवाब दें)</span>
                        <span className="text-[10px] text-slate-500 block">Quote this message in chat</span>
                      </div>
                    </button>

                    {/* Copy Text */}
                    {selectedMsgForAction.text && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(selectedMsgForAction.text)}
                        className="w-full p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#2a3942] flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                          <Copy className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="block font-bold">Copy Text (कॉपी करें)</span>
                          <span className="text-[10px] text-slate-500 block">Copy message to clipboard</span>
                        </div>
                      </button>
                    )}

                    {/* Star / Unstar */}
                    <button
                      type="button"
                      onClick={() => handleToggleStar(selectedMsgForAction)}
                      className="w-full p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#2a3942] flex items-center gap-3 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                        <Star className={cn("w-4 h-4", selectedMsgForAction.isStarred ? "fill-amber-500 text-amber-500" : "")} />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold">{selectedMsgForAction.isStarred ? 'Unstar Message' : 'Star Message (महत्वपूर्ण चिन्ह)'}</span>
                        <span className="text-[10px] text-slate-500 block">Bookmark for quick reference</span>
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

                    {/* Delete for me */}
                    <button
                      type="button"
                      onClick={() => handleDeleteForMe(selectedMsgForAction)}
                      className="w-full p-3 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-3 text-rose-600 dark:text-rose-400 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold">Delete for Me (मेरे लिए हटाएं)</span>
                        <span className="text-[10px] text-rose-500/80 block">Remove from your chat window only</span>
                      </div>
                    </button>

                    {/* Permanent Purge Both Sides (No placeholder left) */}
                    {(selectedMsgForAction.senderId === user.id || selectedMsgForAction.receiverId === user.id) && (
                      <button
                        type="button"
                        onClick={() => handlePermanentPurgeBothSides(selectedMsgForAction)}
                        className="w-full p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 flex items-center gap-3 text-rose-700 dark:text-rose-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="block font-bold">Permanent Purge Both Sides (दोनों तरफ से पूरी तरह गायब करें)</span>
                          <span className="text-[10px] text-rose-600/90 block">Erase completely without leaving any deleted box</span>
                        </div>
                      </button>
                    )}

                    {/* Delete for everyone (Show 'Deleted' tag placeholder) */}
                    {selectedMsgForAction.senderId === user.id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteForEveryone(selectedMsgForAction)}
                        className="w-full p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="block font-bold">Delete for Everyone (दोनों तरफ 'Deleted' दिखाएं)</span>
                          <span className="text-[10px] text-slate-500 block">Show WhatsApp-style "This message was deleted"</span>
                        </div>
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
