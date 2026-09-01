import { UniversalYouTubePlayer, extractYouTubeId, isYouTubeUrl } from './components/UniversalYouTubePlayer';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Home, Shield, Moon, Sun, PlusSquare, MessageCircle, MessageSquare, Menu, LogOut, LogIn, Check, X, XCircle, Search, Compass, Film, Heart, Calculator, Bookmark, Info, MoreHorizontal, MoreVertical, Music, Image, ImageIcon, ImagePlus, Eye, EyeOff, Camera, Upload, Trash2, Plus, ShieldCheck, BadgeCheck, Sparkles, QrCode, CheckCircle, CheckCircle2, Award, Smile, Volume2, VolumeX, Play, Pause, ChevronUp, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight, UserPlus, UserCheck, Share2, Phone, Mail, Globe, Building2, Store, MapPin, Locate, Navigation, Tag, Filter, ShieldAlert, User, UserX, Lock, Key, Clock, FileText, FileCheck, Maximize2, Crop, Loader2, Send, BarChart2, Users, Map as MapIcon, Hash, Pencil, Rocket, ExternalLink, Star, Scale, Video, TrendingUp, ClipboardList, Bell, CreditCard, Calendar, Copy, RefreshCw, AlertTriangle, Gift, Fingerprint, Megaphone, Download, Settings, ShoppingCart, Scan } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

if (typeof (toast as any).info !== 'function') {
  (toast as any).info = (msg: string | React.ReactNode, opts?: any) => toast(msg, { icon: '‚ÑπÔ∏è', ...opts });
}
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import { TileCalculatorDrawer } from "./components/TileCalculatorDrawer";
import { UserAnalyticsCard } from './components/UserAnalyticsCard';
import { AIChatbotWidget } from './components/AIChatbotWidget';
import { SinglePostStatsModal } from './components/SinglePostStatsModal';
import { GstInput } from './components/GstInput';
import { validateGSTIN } from './utils/gstinValidator';
import { StealthLockoutScreen } from './components/StealthLockoutScreen';
import { WelcomeSplash } from './components/WelcomeSplash';
import { TermsPage } from './components/TermsPage';
import { PlatformRatingWidget } from './components/PlatformRatingWidget';
import { isAppLockedOut, recordFailedAdminAttempt, recordSuccessfulAdminLogin, setStealthLockout } from './utils/lockoutManager';
import { AdRatingComponent } from './components/AdRatingComponent';
import { ALL_INDUSTRIES, ALL_CATEGORY_OPTIONS, matchIndustryOrSubcategory } from './constants/industryData';
import { IndustryCommerceHub } from './components/IndustryCommerceHub';
import { PdfCardViewer } from './components/PdfCardViewer';
import { MultiImageCollage } from './components/MultiImageCollage';
import { extractPdfFirstPageThumbnail, generateFallbackPdfCover } from './utils/pdfThumbnail';
import { BRAND_LOGO_SRC, BRAND_NAME } from './constants/brandLogo';
import { auth, db as firestoreDb } from './firebase';
import { collection, doc, setDoc, getDocs, getDoc, query, where, deleteDoc, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { DEFAULT_B2B_POSTS } from './data/defaultPosts';
import { fetchPostsFromFirestore, syncPostToFirestore, subscribeToPostsFromFirestore, subscribeToUsersFromFirestore, subscribeToPaymentsFromFirestore, submitPaymentUTRToFirestore, getAdminSettingsFromFirestore, saveAdminSettingsToFirestore, subscribeToAdminSettingsFromFirestore, saveBrandAdsToFirestore, subscribeToBrandAdsFromFirestore, likePostInFirestore, savePostInFirestore, recordEnquiryInFirestore, addCommentToFirestore, fetchCommentsFromFirestore, subscribeToCommentsFromFirestore, deleteCommentFromFirestore, uploadFileToFirebaseStorage, followUserInFirestore, recordViewInFirestore, recordShareInFirestore, authenticateUserInFirestore, adminResetUserPassword, userChangeOwnPassword, blockUserInFirestore, markPostNotInterestedInFirestore, getUsersBlockedAndNotInterestedFromFirestore, clearDefaultDataFromFirestore, deleteUserFromFirestore, deletePostFromFirestore, syncUserToFirestore, fetchAllUsersFromFirestore, sanitizeForFirestore, updateUserVerificationInFirestore, subscribeToPlatformStatsFromFirestore, startPresenceHeartbeat, updateUserPresence, isUserActiveOnline, getUserLastActiveFormatted } from './services/firebaseDataSync';
import { ConnectUserModal } from './components/ConnectUserModal';
import { suggestHashtagsWithAI } from './services/aiService';
import { optimizeImageForPersistence, fileToDataURL, generateVideoThumbnail } from './utils/imageOptimizer';
import { saveVideoBlob, getVideoBlobUrl, cacheVideoUrlInMemory, getCachedVideoUrlInMemory } from './utils/videoStorage';
import { decodeUpiIdFromImageFile, extractUpiIdFromPayload } from './utils/qrUpiDecoder';
import { moderateContentUniversally } from './services/moderationService';
import { playBubblePopSound, playLikeSound, playSaveSound, playShareSound, playEnquirySound, playMessageSound, getSoundSettingsSync, updateSoundSettings } from './utils/audioEffects';
import { CommentMediaLightbox } from './components/CommentMediaLightbox';
import { GifPickerModal } from './components/GifPickerModal';
import { VideoUploadingModal } from './components/VideoUploadingModal';
import { ImageUploadingModal } from './components/ImageUploadingModal';
import { PdfUploadingModal } from './components/PdfUploadingModal';
import { LinkUploadingModal } from './components/LinkUploadingModal';
import { handleClipboardMediaPaste } from './utils/clipboardHelper';
import { isPostLikedByUser, isPostSavedByUser, setPostLikedInLocalStorage, setPostSavedInLocalStorage, getUserEngagementCounts, incrementUserEngagement, getNewEngagementCounts, recordTokenGeneration, resetEngagementBaselinesForTest } from './utils/likeSaveHelpers';
import { ReferralRewardsModal } from './components/ReferralRewardsModal';
import { BoostBusinessModal } from './components/BoostBusinessModal';
import { AdminUserDetailModal } from './components/AdminUserDetailModal';
import { CustomerCartCouponsModal } from './components/CustomerCartCouponsModal';
import { SellerDiscountScannerModal } from './components/SellerDiscountScannerModal';
import { captureReferralCodeFromUrl, recordNewUserReferral, checkAndUpdateReferralOnPost, getOrCreateFingerprint, getReferralStats, getUserReferralLink } from './utils/referralManager';
import { resolveUserAvatar, getInitialsAvatar, updateCachedUsers, resolveAuthorInfo } from './utils/userAvatar';
import { addToCart, isItemInCart, getCartItems } from './utils/cartManager';
import { safeSaveUser, safeSetLocalStorage, safeGetLocalStorage, safeRemoveLocalStorage, cleanupStorageQuota } from './utils/safeStorage';


export function renderSafeCommentText(content: string, isAuthorOrAdmin = false): { text: string; masked: boolean } {
  if (!content) return { text: '', masked: false };
  // Detect phone numbers (10-digit Indian, +91, space-separated digits) or emails
  const phoneOrContactRegex = /(\+?91[\s\-]?)?[6-9]\d{9}|\b\d{5}[\s\-]?\d{5}\b|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  if (!isAuthorOrAdmin && phoneOrContactRegex.test(content)) {
    const maskedText = content.replace(phoneOrContactRegex, 'üîí [Contact Masked - Use "Inquire / Trade Connect" to Connect Directly]');
    return { text: maskedText, masked: true };
  }

  return { text: content, masked: false };
}

export class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Vyapar Bridge Error Boundary Caught Exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">vyapar bridge</h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400">Application auto-recovered from a temporary loading issue.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              Reload & Refresh App üîÑ
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getStarColorClass(starNum: number, isFilled: boolean, unfilledClass: string = 'text-zinc-400') {
  if (!isFilled) return `${unfilledClass} stroke-slate-400/60 dark:stroke-zinc-500/80 stroke-[0.8] opacity-70`;
  switch (starNum) {
    case 1: return 'text-rose-500 fill-rose-500 stroke-rose-700/40 dark:stroke-black/60 stroke-[0.8] drop-shadow-[0_0_2px_rgba(244,63,94,0.8)]';
    case 2: return 'text-amber-500 fill-amber-500 stroke-amber-700/40 dark:stroke-black/60 stroke-[0.8] drop-shadow-[0_0_2px_rgba(245,158,11,0.8)]';
    case 3: return 'text-yellow-400 fill-yellow-400 stroke-yellow-700/40 dark:stroke-black/60 stroke-[0.8] drop-shadow-[0_0_2px_rgba(250,204,21,0.8)]';
    case 4: return 'text-emerald-500 fill-emerald-500 stroke-emerald-700/40 dark:stroke-black/60 stroke-[0.8] drop-shadow-[0_0_2px_rgba(16,185,129,0.8)]';
    case 5: return 'text-cyan-400 fill-cyan-400 stroke-cyan-700/40 dark:stroke-black/60 stroke-[0.8] drop-shadow-[0_0_2px_rgba(34,211,238,0.8)]';
    default: return 'text-amber-400 fill-amber-400 stroke-amber-700/40 dark:stroke-black/60 stroke-[0.8]';
  }
}

export function getUserHiddenFilters(userId?: string | number) {
  const uid = userId ? String(userId) : 'guest';
  const localBlockedKey = `VyaparBridge_blocked_users_${uid}`;
  const localNotInterestedKey = `VyaparBridge_not_interested_${uid}`;
  
  let blockedUsers: string[] = [];
  let notInterestedPosts: string[] = [];

  try {
    const bStr = localStorage.getItem(localBlockedKey);
    if (bStr) blockedUsers = JSON.parse(bStr);
  } catch (e) {}

  try {
    const niStr = localStorage.getItem(localNotInterestedKey);
    if (niStr) notInterestedPosts = JSON.parse(niStr);
  } catch (e) {}

  return { blockedUsers, notInterestedPosts, localBlockedKey, localNotInterestedKey };
}

export function mergePostSafely(existing: any, incoming: any) {
  if (!existing) return incoming || {};
  if (!incoming) return existing || {};
  
  const merged = { ...existing, ...incoming };
  
  // Guard against 'indexeddb:' or empty values overwriting valid media/video/thumbnail/pdf URLs
  const keysToPreserve = ['mediaUrl', 'videoUrl', 'persistentMediaUrl', 'video', 'thumbnailUrl', 'posterUrl', 'pdfUrl', 'externalLink'];
  keysToPreserve.forEach(key => {
    const incomingVal = incoming[key] || '';
    const existingVal = existing[key] || '';
    
    const isIncomingInvalid = !incomingVal || incomingVal.startsWith('indexeddb:');
    const isExistingValid = existingVal && !existingVal.startsWith('indexeddb:');
    
    if (isIncomingInvalid && isExistingValid) {
      merged[key] = existingVal;
    }
  });
  
  // Preserve isPermanent and postedFrom fields if they exist
  if (existing.isPermanent !== undefined && incoming.isPermanent === undefined) {
    merged.isPermanent = existing.isPermanent;
  }
  if (existing.postedFrom !== undefined && incoming.postedFrom === undefined) {
    merged.postedFrom = existing.postedFrom;
  }
  
  return merged;
}

export function getTimestampMs(val: any): number {
  if (!val) return Date.now();
  if (typeof val === 'number') {
    return val < 99999999999 ? val * 1000 : val;
  }
  if (typeof val === 'object') {
    if (typeof val.toDate === 'function') {
      try { return val.toDate().getTime(); } catch (e) {}
    }
    if (typeof val.seconds === 'number') {
      return val.seconds * 1000 + (val.nanoseconds ? val.nanoseconds / 1000000 : 0);
    }
    if (val._seconds !== undefined) {
      return val._seconds * 1000;
    }
  }
  if (typeof val === 'string') {
    const parsed = Date.parse(val);
    if (!isNaN(parsed)) return parsed;
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      return num < 99999999999 ? num * 1000 : num;
    }
  }
  return Date.now();
}

export function filterOutHiddenContent(items: any[], userId?: string | number) {
  if (!Array.isArray(items)) return [];
  const { blockedUsers, notInterestedPosts } = getUserHiddenFilters(userId);
  const blockedSet = new Set(blockedUsers.map(String));
  const notInterestedSet = new Set(notInterestedPosts.map(String));
  let deletedPostsSet = new Set<string>();
  try {
    const delStr = localStorage.getItem('VyaparBridge_deleted_posts');
    if (delStr) {
      const arr = JSON.parse(delStr);
      if (Array.isArray(arr)) deletedPostsSet = new Set(arr.map(String));
    }
  } catch (e) {}
  return items.filter(item => {
    if (!item) return false;
    const itemId = String(item.id || '');
    const itemUserId = String(item.userId || item.user?.id || item.actorId || '');
    if (item.status === 'rejected') return false;
    if (itemId && deletedPostsSet.has(itemId)) return false;
    if (itemId && notInterestedSet.has(itemId)) return false;
    if (itemUserId && blockedSet.has(itemUserId)) return false;

    // Filter out completely blank posts that have no text and no media of any form
    const hasText = Boolean((item.title || '').trim() || (item.content || '').trim());
    const hasMedia = Boolean((item.mediaUrl || '').trim() || (item.videoUrl || '').trim() || (item.externalLink || '').trim() || (item.pdfUrl || '').trim() || (item.images && item.images.length > 0));
    if (!hasText && !hasMedia) {
      return false;
    }

    // Ephemeral story check (only true 24-hour stories expire after 24h, regular posts and reels remain permanent)
    const isEphemeralStory = item.type === 'story' || item.isStory === true;
    if (isEphemeralStory) {
      const createdAtMs = getTimestampMs(item.createdAt);
      const ageMs = Date.now() - createdAtMs;
      if (ageMs > 24 * 60 * 60 * 1000) {
        return false;
      }
    }

    return true;
  });
}

async function safeFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      let errorMsg = `Server error: ${res.status}`;
      try {
        if (contentType && contentType.includes('application/json')) {
          const errData = await res.json();
          errorMsg = errData.error || errorMsg;
        }
      } catch (e) {}
      return { success: false, items: [], error: errorMsg };
    }
    if (!contentType || !contentType.includes('application/json')) {
      // If received HTML (like on Vercel 404/SPA rewrite fallback)
      return { success: true, message: 'OK', items: [] };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, items: [], error: err?.message || 'Network error' };
  }
}

// IndexedDB Local Media Mirror Manager (Stores video files on local device disk without consuming RAM)
const MEDIA_DB_NAME = 'ShowroomLocalMediaDB';
const MEDIA_STORE = 'videos';

function openMediaDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = window.indexedDB.open(MEDIA_DB_NAME, 1);
      request.onupgradeneeded = () => {
        try {
          const db = request.result;
          if (db && !db.objectStoreNames.contains(MEDIA_STORE)) {
            db.createObjectStore(MEDIA_STORE);
          }
        } catch (e) {}
      };
      request.onsuccess = () => {
        const db = request.result;
        if (db) {
          db.onversionchange = () => {
            try { db.close(); } catch (e) {}
          };
        }
        resolve(db);
      };
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

export async function saveMediaToLocalDisk(key: string, blob: Blob): Promise<void> {
  if (!key || !blob) return;
  try {
    const db = await openMediaDB();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(MEDIA_STORE, 'readwrite');
        const store = tx.objectStore(MEDIA_STORE);
        store.put(blob, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.onabort = () => resolve();
      } catch (txErr) {
        resolve();
      }
    });
  } catch (err) {
    // Non-blocking fail-safe
  }
}

export async function getMediaFromLocalDisk(key: string): Promise<string | null> {
  if (!key) return null;
  try {
    const db = await openMediaDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(MEDIA_STORE, 'readonly');
        const store = tx.objectStore(MEDIA_STORE);
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result) {
            try {
              resolve(URL.createObjectURL(req.result as Blob));
            } catch (e) {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch (txErr) {
        resolve(null);
      }
    });
  } catch (err) {
    return null;
  }
}

export function cleanFacebookUrl(rawUrl: string): string {
  return rawUrl || '';
}

export async function resolveVideoLinkForPost(rawLink: string): Promise<string> {
  return rawLink || '';
}

export function openFacebookVideo(rawUrl: string) {
  if (!rawUrl) return;
  const cleanUrl = cleanFacebookUrl(rawUrl) || rawUrl;
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Try native Facebook app protocol deep link
    const fbAppUri = `fb://facewebmodal/f?href=${encodeURIComponent(cleanUrl)}`;
    const start = Date.now();
    window.location.href = fbAppUri;
    setTimeout(() => {
      // If still within the page, open clean web link in new window
      if (Date.now() - start < 1800) {
        window.open(cleanUrl, '_blank', 'noopener,noreferrer');
      }
    }, 800);
  } else {
    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
  }
}

// Global video audio / mute manager across all feed, reels, and ad players
let globalVideoMutedState = true;
try {
  const stored = localStorage.getItem('vyapar_global_video_muted');
  if (stored !== null) {
    globalVideoMutedState = stored === 'true';
  }
} catch (e) {}

export const isGlobalVideoMuted = () => globalVideoMutedState;

export const setGlobalVideoMuted = (muted: boolean) => {
  globalVideoMutedState = muted;
  try {
    localStorage.setItem('vyapar_global_video_muted', String(muted));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent('vyapar_global_mute_change', { detail: { muted } }));
};


export function FacebookSdkLoader({ url, containerRef }: { url: string; containerRef: any }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.FB) {
        // give it a short tick for the DOM to render the fb-video div
        setTimeout(() => {
          if (containerRef.current) win.FB.XFBML.parse(containerRef.current);
        }, 100);
      } else {
        const id = 'facebook-jssdk';
        if (!document.getElementById(id)) {
          const script = document.createElement('script');
          script.id = id;
          script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
          script.async = true;
          script.defer = true;
          script.crossOrigin = 'anonymous';
          script.onload = () => {
            setTimeout(() => {
              if (win.FB && containerRef.current) win.FB.XFBML.parse(containerRef.current);
            }, 100);
          };
          document.body.appendChild(script);
        }
      }
    }
  }, [url, containerRef]);
  return null;
}
export function AdMediaDisplay({ ad, className, onMediaEnded, autoPlay = false }: { ad: any; className?: string; onMediaEnded?: () => void; autoPlay?: boolean }) {
  const initialAdMedia = ad?.mediaUrl || ad?.externalLink || ad?.videoUrl || ad?.video || '';
  const [mediaSrc, setMediaSrc] = useState<string>(initialAdMedia);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => isGlobalVideoMuted());
  const [isInView, setIsInView] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(() => !!autoPlay);
  const [hasStartedPlaying, setHasStartedPlaying] = useState<boolean>(() => !!autoPlay);
  const [playAnimation, setPlayAnimation] = useState<'play' | 'pause' | null>(null);

  const [serverAspectRatio, setServerAspectRatio] = useState<string | null>(ad?.aspectRatio || null);
  const [thumbnailAspectRatio, setThumbnailAspectRatio] = useState<string | null>(null);
  const [detectedVideoAspectRatio, setDetectedVideoAspectRatio] = useState<string | null>(null);
  const resolvedFbUrl = '';

  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen to global mute changes & global video playback
  useEffect(() => {
    const handleMuteChange = (e: any) => {
      const newMuted = !!e.detail?.muted;
      setIsMuted(newMuted);
      if (videoRef.current) {
        videoRef.current.muted = newMuted;
      }
      if (iframeRef.current?.contentWindow) {
        const cmd = newMuted ? 'mute' : 'unMute';
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: cmd, args: '' }), '*');
      }
    };
    const handleGlobalPlay = (e: any) => {
      const playingId = e.detail?.id;
      if (playingId && playingId !== (ad?.id || mediaSrc)) {
        setIsPlaying(false);
        if (videoRef.current) videoRef.current.pause();
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*');
        }
      }
    };
    window.addEventListener('vyapar_global_mute_change', handleMuteChange);
    window.addEventListener('globalVideoPlay', handleGlobalPlay);
    return () => {
      window.removeEventListener('vyapar_global_mute_change', handleMuteChange);
      window.removeEventListener('globalVideoPlay', handleGlobalPlay);
    };
  }, [ad?.id, mediaSrc]);

  // Load local media if stored locally
  useEffect(() => {
    let active = true;
    let localBlobUrl: string | null = null;
    setVideoError(false);
    async function loadLocalMedia() {
      if (ad?.localMediaKey) {
        const url = await getMediaFromLocalDisk(ad.localMediaKey);
        if (url && active) {
          localBlobUrl = url;
          setMediaSrc(url);
          return;
        }
      }
      if (active) {
        setMediaSrc(ad?.mediaUrl || ad?.externalLink || ad?.videoUrl || ad?.video || '');
      }
    }
    loadLocalMedia();
    return () => {
      active = false;
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [ad?.id, ad?.mediaUrl, ad?.localMediaKey]);



  // Client-side image dimension analysis from thumbnail
  useEffect(() => {
    const thumb = ad?.thumbnailUrl || ad?.posterUrl;
    if (!thumb) return;
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        const r = img.naturalWidth / img.naturalHeight;
        if (r < 0.7) setThumbnailAspectRatio('9:16');
        else if (r <= 0.9) setThumbnailAspectRatio('4:5');
        else if (r <= 1.15) setThumbnailAspectRatio('1:1');
        else if (r <= 1.45) setThumbnailAspectRatio('4:3');
        else setThumbnailAspectRatio('16:9');
      }
    };
    img.src = thumb;
  }, [ad?.thumbnailUrl, ad?.posterUrl]);

  // Adaptive Aspect Ratio Determination
  const activeAspectRatio = useMemo(() => {
    if (ad?.aspectRatio) {
      const r = String(ad.aspectRatio).toLowerCase();
      if (r === '9:16' || r === '9/16' || r === 'vertical' || r === 'portrait') return '9:16';
      if (r === '4:5' || r === '4/5') return '4:5';
      if (r === '1:1' || r === 'square') return '1:1';
      if (r === '16:9' || r === '16/9' || r === 'landscape') return '16:9';
    }

    if (detectedVideoAspectRatio) return detectedVideoAspectRatio;

    if (ad?.isReel || ad?.isShort || ad?.isVertical) return '9:16';

    const allUrls = [
      resolvedFbUrl,
      mediaSrc,
      ad?.mediaUrl,
      ad?.externalLink,
      ad?.videoUrl,
      ad?.video
    ].filter(Boolean).map(u => String(u).toLowerCase());

    for (const u of allUrls) {
      if (

        u.includes('/reel/') ||
        u.includes('/reels/') ||
        u.includes('/r/') ||
        u.includes('/share/r/') ||
        u.includes('/share/v/') ||
        u.includes('/shorts/') ||
        u.includes('#shorts') ||
        u.includes('shorts') ||
        u.includes('tiktok.com') ||
        u.includes('/stories/')
      ) {
        return '9:16';
      }
    }

    if (serverAspectRatio) return serverAspectRatio;
    if (thumbnailAspectRatio) return thumbnailAspectRatio;

    return '16:9';
  }, [ad, resolvedFbUrl, mediaSrc, serverAspectRatio, thumbnailAspectRatio, detectedVideoAspectRatio]);

  const isVertical916 = activeAspectRatio === '9:16';

  // Sizing Class Generator for Responsive Container
    const getContainerClasses = () => {
    return 'w-full mx-auto rounded-xl overflow-hidden shadow-sm bg-transparent';
  };

  const getContainerStyle = (): React.CSSProperties => {
    // Determine a dynamic max width that respects the screen height (85vh/82vh max) to preserve aspect ratio
    switch (activeAspectRatio) {
      case '9:16':
        return { aspectRatio: '9/16', maxHeight: '85vh', maxWidth: 'min(100%, calc(85vh * 9 / 16), 460px)' };
      case '4:5':
        return { aspectRatio: '4/5', maxHeight: '85vh', maxWidth: 'min(100%, calc(85vh * 4 / 5), 540px)' };
      case '1:1':
        return { aspectRatio: '1/1', maxHeight: '82vh', maxWidth: 'min(100%, calc(82vh * 1 / 1), 600px)' };
      case '4:3':
        return { aspectRatio: '4/3', maxHeight: '82vh', maxWidth: 'min(100%, calc(82vh * 4 / 3), 680px)' };
      case '16:9':
      default:
        return { aspectRatio: '16/9', maxHeight: '82vh', maxWidth: 'min(100%, calc(82vh * 16 / 9), 800px)' };
    }
  };
  // IntersectionObserver to observe visibility in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
          setIsInView(inView);
          if (inView) {
            if (autoPlay || hasStartedPlaying) {
              window.dispatchEvent(new CustomEvent('globalVideoPlay', { detail: { id: ad?.id || mediaSrc } }));
              if (videoRef.current) {
                videoRef.current.muted = isGlobalVideoMuted();
                videoRef.current.play().catch(() => {});
              }
              if (iframeRef.current?.contentWindow) {
                const muteCmd = isGlobalVideoMuted() ? 'mute' : 'unMute';
                iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: muteCmd, args: '' }), '*');
                iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*');
              }
            }
          } else {
            if (videoRef.current) {
              videoRef.current.pause();
            }
            if (iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*');
            }
          }
        });
      },
      { threshold: [0.0, 0.2, 0.35, 0.6, 0.8] }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [ad?.id, mediaSrc, autoPlay, hasStartedPlaying]);

  // HTML5 auto play / pause on scroll
  useEffect(() => {
    const shouldPlay = isInView && isPlaying;
    if (videoRef.current) {
      if (shouldPlay) {
        videoRef.current.play().catch(e => console.warn('Video autoplay failed:', e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView, isPlaying, mediaSrc]);

  // Handle tap on HTML5 video
  const handleToggleHtmlVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetState = !isPlaying;
    setIsPlaying(targetState);
    if (targetState) {
      setHasStartedPlaying(true);
    }
    setPlayAnimation(targetState ? 'play' : 'pause');
    setTimeout(() => setPlayAnimation(null), 600);
    if (videoRef.current) {
      if (targetState) {
        window.dispatchEvent(new CustomEvent('globalVideoPlay', { detail: { id: ad?.id || mediaSrc } }));
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  };

  const finalSrc = videoError ? null : (mediaSrc || ad?.mediaUrl);

  const isVideoType = ad?.type === 'video' || 
                      /\.(mp4|webm|mov|m4v|avi|mkv|3gp|flv)$/i.test(mediaSrc || ad?.mediaUrl || '') || 
                      (mediaSrc || ad?.mediaUrl || '').toLowerCase().includes('video') || 
                      (mediaSrc || ad?.mediaUrl || '').startsWith('blob:');

  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {});
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  // 1. Universal YouTube Player (Fast, Smooth, Zero Stutter)
  if (finalSrc && isYouTubeUrl(finalSrc)) {
    return (
      <UniversalYouTubePlayer 
        url={finalSrc} 
        isReel={ad?.isReel || isVertical916} 
        aspectRatio={activeAspectRatio} 
        className={className} 
        autoPlay={autoPlay || hasStartedPlaying}
        muted={isMuted}
      />
    );
  }



  // 3. Fallback when no media
  if (!finalSrc) {
    return (
      <div ref={containerRef} className={`relative w-full h-full min-h-[220px] sm:min-h-[280px] bg-gradient-to-br from-amber-950 via-zinc-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden select-none ${className || "w-full max-h-[480px]"}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 bg-gradient-to-tr from-amber-500/20 to-amber-400/30 border border-amber-500/40 shadow-xl flex items-center justify-center backdrop-blur-md">
            <img
              src={BRAND_LOGO_SRC}
              alt="Vyapar Bridge"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black tracking-widest uppercase mb-1.5">
              ‚ú® Official Showcase ‚ú®
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
              {ad?.companyName || 'Vyapar Bridge Trade Partner'}
            </h3>
            <p className="text-xs text-amber-200/80 line-clamp-2 mt-1 max-w-xs sm:max-w-sm">
              {ad?.title || ad?.description || 'India‚Äôs Leading Verified B2B Ceramic & Building Material Network'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. HTML5 Video (Clean tap to play/pause + mute button)
  if (isVideoType && finalSrc) {
    return (
      <div 
        ref={containerRef} 
        className={`relative w-full bg-transparent flex items-center justify-center overflow-hidden group border-0 ${getContainerClasses()}`}
        style={getContainerStyle()}
      >
        <video
          ref={videoRef}
          key={finalSrc}
          src={finalSrc}
          muted={isMuted}
          playsInline
          autoPlay={isInView && isPlaying}
          controls={false}
          controlsList="nodownload noremoteplayback"
          preload="auto"
          loop
          onEnded={() => {
            if (onMediaEnded) onMediaEnded();
          }}
          onError={() => {
            setVideoError(false);
          }}
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;
            if (video && video.videoWidth && video.videoHeight) {
              const r = video.videoWidth / video.videoHeight;
              if (r < 0.75) setDetectedVideoAspectRatio('9:16');
              else if (r <= 0.9) setDetectedVideoAspectRatio('4:5');
              else if (r <= 1.15) setDetectedVideoAspectRatio('1:1');
              else if (r <= 1.45) setDetectedVideoAspectRatio('4:3');
              else setDetectedVideoAspectRatio('16:9');
            }
          }}
          className={className || "w-full h-full object-contain bg-transparent rounded-xl"}
        />

        {/* Tap to Play / Pause Overlay for HTML5 video */}
        <div 
          onClick={handleToggleHtmlVideo}
          className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-transparent"
        />

        {/* Play/Pause Animation Feedback */}
        {playAnimation && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-fade-in">
            <div className="p-4 rounded-full bg-black/75 text-white scale-110 transition-transform duration-300 flex items-center justify-center shadow-2xl border border-white/10">
              {playAnimation === 'play' ? (
                <Play className="w-7 h-7 text-emerald-400 fill-emerald-400" />
              ) : (
                <Pause className="w-7 h-7 text-amber-500 fill-amber-500" />
              )}
            </div>
          </div>
        )}

        {/* Action Controls: Fullscreen Stretch & Speaker Mute/Unmute */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 border border-white/15 shadow-md flex items-center justify-center cursor-pointer active:scale-95"
            title="Stretch / Full Screen"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const nextMuted = !isMuted;
              setGlobalVideoMuted(nextMuted);
            }}
            className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 border border-white/15 shadow-md flex items-center justify-center cursor-pointer active:scale-95"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    );
  }

  // 5. Image Display
  if (finalSrc) {
    return (
      <img
        ref={containerRef}
        src={finalSrc}
        alt={ad?.title || 'Brand Advertisement'}
        onError={() => {
          setVideoError(true);
          if (onMediaEnded) onMediaEnded();
        }}
        className={className || "w-full max-h-[480px] object-contain bg-transparent transform-gpu will-change-transform"}
      />
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full min-h-[220px] sm:min-h-[280px] bg-gradient-to-br from-amber-950 via-zinc-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden select-none ${className || "w-full max-h-[480px]"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 bg-gradient-to-tr from-amber-500/20 to-amber-400/30 border border-amber-500/40 shadow-xl flex items-center justify-center backdrop-blur-md">
          <img
            src={BRAND_LOGO_SRC}
            alt="Vyapar Bridge"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black tracking-widest uppercase mb-1.5">
            ‚ú® Official Showcase ‚ú®
          </div>
          <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
            {ad?.companyName || 'Vyapar Bridge Trade Partner'}
          </h3>
          <p className="text-xs text-amber-200/80 line-clamp-2 mt-1 max-w-xs sm:max-w-sm">
            {ad?.title || ad?.description || 'India‚Äôs Leading Verified B2B Ceramic & Building Material Network'}
          </p>
        </div>
      </div>
    </div>
  );
}

export const ThemeContext = React.createContext<{ isDark: boolean; toggleDark: () => void }>({
  isDark: false,
  toggleDark: () => {},
});

export function getFollowedUsers(): string[] {
  try {
    const data = localStorage.getItem('followedUsers');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isUserFollowed(identifier: string): boolean {
  if (!identifier) return false;
  const list = getFollowedUsers();
  return list.includes(String(identifier));
}

export function toggleFollowUser(identifier: string): boolean {
  if (!identifier) return false;
  const idStr = String(identifier).trim();
  
  // Prevent self-follow at utility core
  try {
    const rawUser = localStorage.getItem('user') || localStorage.getItem('Vyapar Bridge_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u) {
        const myId = String(u.id || '').trim().toLowerCase();
        const myName = String(u.name || u.companyName || '').trim().toLowerCase();
        const myUsername = String(u.username || '').trim().toLowerCase();
        const targetLower = idStr.toLowerCase();
        if (targetLower === myId || (myName && targetLower === myName) || (myUsername && targetLower === myUsername)) {
          return false;
        }
      }
    }
  } catch (e) {}

  const list = getFollowedUsers();
  let newList: string[];
  let isNowFollowing = false;
  if (list.includes(idStr)) {
    newList = list.filter(id => id !== idStr);
    isNowFollowing = false;
  } else {
    newList = [...list, idStr];
    isNowFollowing = true;
  }
  localStorage.setItem('followedUsers', JSON.stringify(newList));
  window.dispatchEvent(new Event('followedUsersUpdated'));
  return isNowFollowing;
}

// --- Components ---

export function ReportModal({
  isOpen,
  onClose,
  currentUser,
  targetType,
  targetId,
  targetName
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  targetType: 'post' | 'comment' | 'user' | 'reel';
  targetId: string;
  targetName?: string;
}) {
  const [reason, setReason] = useState('Nudity or Explicit Sexual Content');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please log in to submit a report');
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await safeFetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: currentUser.id,
          targetType,
          targetId,
          targetName: targetName || '',
          reason,
          details
        })
      });
      if (data.success) {
        toast.success('üõ°Ô∏è Report submitted! Meta-style AI Safety team will review it.');
        onClose();
        setDetails('');
      } else {
        toast.error(data.error || 'Failed to submit report');
      }
    } catch (err) {
      toast.error('Error submitting report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span>Report {targetType === 'user' ? 'User Profile' : targetType.toUpperCase()}</span>
          </div>
          <button onClick={onClose} className="p-1 text-black/60 hover:text-black/80 dark:hover:text-white rounded-full">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-black/80 dark:text-zinc-400">
            Select a reason for reporting <span className="font-bold">{targetName || targetType}</span>. AI Guardrails will inspect the content immediately.
          </p>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-black dark:text-zinc-200">Violation Category:</label>
            <select 
              value={reason} 
              onChange={e => setReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 text-black dark:text-zinc-100"
            >
              <option value="Nudity or Explicit Sexual Content">üîû Nudity / Explicit Sexual Content</option>
              <option value="Abusive Language or Harassment">ü§¨ Abusive Language / Harassment</option>
              <option value="Fake Account / Scam / Spam">‚ö†Ô∏è Fake Account / Scam / Spam</option>
              <option value="Non-Tile Unrelated Content">üö´ Non-Tile Unrelated Content</option>
              <option value="Other Safety Violation">‚ùì Other Safety Violation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-black dark:text-zinc-200">Details (Optional):</label>
            <textarea
              rows={3}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Describe what is wrong or offensive..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-black dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div></div>
  );
}

export function OfferTokenGeneratorModal({
  isOpen,
  onClose,
  currentUser,
  savedPosts = [],
  initialPost = null
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  savedPosts?: any[];
  initialPost?: any;
}) {
  const [selectedSnapshot, setSelectedSnapshot] = useState<string>('');
  const [selectedPostLink, setSelectedPostLink] = useState<string>('https://ais-dev-e6txzr4wozaorlknqcnr2z-705640465298.asia-southeast1.run.app/');
  const [assetValue, setAssetValue] = useState<string>('5000');
  const [engagement, setEngagement] = useState(() => getNewEngagementCounts());
  const [tokenId] = useState(() => `VB-OFFER-${Math.floor(100000 + Math.random() * 900000)}`);

  useEffect(() => {
    const handleUpdate = () => {
      setEngagement(getNewEngagementCounts());
    };
    window.addEventListener('vyapar_user_engagement_updated', handleUpdate);
    return () => {
      window.removeEventListener('vyapar_user_engagement_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialPost) {
        if (initialPost.mediaUrl || initialPost.thumbnailUrl) {
          setSelectedSnapshot(initialPost.mediaUrl || initialPost.thumbnailUrl);
        }
        setSelectedPostLink(`https://ais-dev-e6txzr4wozaorlknqcnr2z-705640465298.asia-southeast1.run.app/post/${initialPost.id || 'shared'}`);
      } else if (savedPosts.length > 0 && !selectedSnapshot) {
        const first = savedPosts.find(p => p.mediaUrl || p.thumbnailUrl);
        if (first) {
          setSelectedSnapshot(first.mediaUrl || first.thumbnailUrl);
          setSelectedPostLink(`https://ais-dev-e6txzr4wozaorlknqcnr2z-705640465298.asia-southeast1.run.app/post/${first.id || 'shared'}`);
        }
      }
    }
  }, [isOpen, initialPost, savedPosts]);

  if (!isOpen) return null;

  const numericAsset = parseFloat(assetValue) || 5000;

  // Calculate milestone-based discounts automatically based on clicks data
  const likesDiscount = engagement.likes >= 1000 ? 10 : 0;
  const commentsDiscount = engagement.comments >= 1000 ? 10 : 0;
  const savesDiscount = engagement.saves >= 1000 ? 10 : 0;
  const visitsDiscount = engagement.visits >= 1000 ? 10 : 0;
  const totalMilestoneDiscount = likesDiscount + commentsDiscount + savesDiscount + visitsDiscount;

  const calculatedDiscount = totalMilestoneDiscount;
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedPostLink)}`;

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-8" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2 font-black text-sm">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Vyapar Bridge Verified Offer Token & Discount PDF</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full text-white cursor-pointer">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2 text-black dark:text-zinc-200">
              1. Select Liked Item Snapshot / Post
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {savedPosts.filter(p => p.mediaUrl || p.thumbnailUrl).slice(0, 3).map((p, idx) => (
                <div 
                  key={p.id || idx}
                  onClick={() => {
                    setSelectedSnapshot(p.mediaUrl || p.thumbnailUrl);
                    setSelectedPostLink(`https://ais-dev-e6txzr4wozaorlknqcnr2z-705640465298.asia-southeast1.run.app/post/${p.id || 'shared'}`);
                    toast.success('Snapshot & Post link loaded!');
                  }}
                  className={cn(
                    "relative h-24 rounded-xl overflow-hidden border-2 cursor-pointer transition-all",
                    selectedSnapshot === (p.mediaUrl || p.thumbnailUrl) ? "border-blue-600 ring-2 ring-blue-500/50" : "border-slate-200 dark:border-zinc-800 opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={p.mediaUrl || p.thumbnailUrl} alt="Snapshot" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] p-1 truncate text-center">
                    {p.title || 'Product'}
                  </div>
                </div>
              ))}
            </div>

            <input 
              type="file" 
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setSelectedSnapshot(url);
                  toast.success('Custom snapshot uploaded!');
                }
              }}
              className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-black dark:text-zinc-200">Asset/Item Estimated Value (‚Çπ):</label>
              <input 
                type="number"
                value={assetValue}
                onChange={e => setAssetValue(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-black dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-black dark:text-zinc-200">Platform Engagement Discount (‚Çπ):</label>
              <div className="relative">
                <input 
                  type="text"
                  readOnly
                  value={`‚Çπ${totalMilestoneDiscount}`}
                  className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-xs font-black text-emerald-600 dark:text-emerald-400 select-none cursor-not-allowed focus:outline-none"
                  style={{ pointerEvents: 'none' }}
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                </div>
              </div>
            </div>
          </div>

          {/* User Milestone Breakdown Display */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-black/50 dark:text-zinc-400 block">
                Auto-Calculated Engagement Clicks & Milestones (1000 Thresholds)
              </span>
              {engagement.hasGeneratedOnce && (
                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Baseline Reset Active
                </span>
              )}
            </div>

            {engagement.hasGeneratedOnce && (
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/60 rounded-xl flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    Counting <strong>new</strong> actions since last token generation.
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    resetEngagementBaselinesForTest();
                    toast.success('üîÑ Restored absolute total clicks for testing!');
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[9px] uppercase shadow-xs transition-colors cursor-pointer"
                >
                  Clear Baseline
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-black dark:text-zinc-300">Likes Done</p>
                  <p className="text-[10px] text-black/60 dark:text-zinc-400 font-mono">
                    {engagement.likes} / 1000
                    {engagement.hasGeneratedOnce && ` (Total: ${engagement.current.likes})`}
                  </p>
                </div>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold",
                  engagement.likes >= 1000 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}>
                  {engagement.likes >= 1000 ? "+‚Çπ10" : "Pending"}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-black dark:text-zinc-300">Comments Done</p>
                  <p className="text-[10px] text-black/60 dark:text-zinc-400 font-mono">
                    {engagement.comments} / 1000
                    {engagement.hasGeneratedOnce && ` (Total: ${engagement.current.comments})`}
                  </p>
                </div>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold",
                  engagement.comments >= 1000 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}>
                  {engagement.comments >= 1000 ? "+‚Çπ10" : "Pending"}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-black dark:text-zinc-300">Reels/Posts Saved</p>
                  <p className="text-[10px] text-black/60 dark:text-zinc-400 font-mono">
                    {engagement.saves} / 1000
                    {engagement.hasGeneratedOnce && ` (Total: ${engagement.current.saves})`}
                  </p>
                </div>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold",
                  engagement.saves >= 1000 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}>
                  {engagement.saves >= 1000 ? "+‚Çπ10" : "Pending"}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-black dark:text-zinc-300">Profile Visits</p>
                  <p className="text-[10px] text-black/60 dark:text-zinc-400 font-mono">
                    {engagement.visits} / 1000
                    {engagement.hasGeneratedOnce && ` (Total: ${engagement.current.visits})`}
                  </p>
                </div>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold",
                  engagement.visits >= 1000 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}>
                  {engagement.visits >= 1000 ? "+‚Çπ10" : "Pending"}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-black/50 dark:text-zinc-500 italic">
              * Note: Discounts are non-editable and locked. They scale dynamically based on your profile's real action counters (Max: ‚Çπ40 discount).
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900 border-2 border-dashed border-blue-500/40 rounded-2xl p-5 space-y-4 shadow-sm relative">
            <div className="absolute top-3 right-3 bg-emerald-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Verified Token
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                VB
              </div>
              <div>
                <h4 className="font-black text-sm text-black dark:text-zinc-100">VYAPAR BRIDGE DIGITAL COMMERCE</h4>
                <p className="text-[11px] text-black/60 dark:text-zinc-400">Official Engagement Discount & Offer Pass</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200 dark:border-zinc-800">
              <div>
                <span className="text-black/60 dark:text-zinc-400 block text-[10px]">TOKEN ID:</span>
                <strong className="text-blue-600 dark:text-blue-400 font-mono">{tokenId}</strong>
              </div>
              <div>
                <span className="text-black/60 dark:text-zinc-400 block text-[10px]">BUYER MEMBER:</span>
                <strong className="text-black dark:text-zinc-200">{currentUser?.name || 'Verified Buyer'}</strong>
              </div>
              <div>
                <span className="text-black/60 dark:text-zinc-400 block text-[10px]">ESTIMATED ASSET:</span>
                <strong className="text-black dark:text-zinc-200">‚Çπ{numericAsset.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-black/60 dark:text-zinc-400 block text-[10px]">CALCULATED DISCOUNT:</span>
                <strong className="text-emerald-600 font-black text-sm">‚Çπ{calculatedDiscount} OFF</strong>
              </div>
            </div>

            {selectedSnapshot && (
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <img src={selectedSnapshot} alt="Snapshot" className="w-16 h-16 rounded-lg object-cover border" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Selected Item Snapshot</span>
                  <p className="text-[11px] text-black/80 dark:text-zinc-300 truncate">Verified via Vyapar Bridge Feed & Reels</p>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col items-center text-center space-y-2">
              <div className="w-32 h-32 bg-white p-1 rounded-lg border shadow-xs flex items-center justify-center">
                <img src={qrDataUrl} alt="Offer QR" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-1 w-full">
                <span className="text-[10px] text-black/60 dark:text-zinc-400 uppercase font-bold tracking-wider">Seller Direct Verification Link:</span>
                <input 
                  type="text" 
                  readOnly 
                  value={selectedPostLink} 
                  className="w-full p-1.5 bg-slate-100 dark:bg-zinc-900 rounded-lg text-[10px] text-blue-600 dark:text-blue-400 font-mono text-center select-all border border-slate-200 dark:border-zinc-800"
                />
                <p className="text-[9px] text-black/60 dark:text-zinc-400">Seller can scan this QR code or click/copy the link to view the exact post & catalogue instantly.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-black dark:text-zinc-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button 
              type="button"
              onClick={() => {
                window.print();
                recordTokenGeneration(engagement.current.likes, engagement.current.comments, engagement.current.saves, engagement.current.visits);
                toast.success('üñ®Ô∏è Offer Token PDF printed / downloaded successfully!');
                toast.success('üéâ Token generated! Future discount calculation has been reset to base on new engagements only.');
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Print / Download PDF Offer Token</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to calculate distance in KM between two coordinates
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isUser1188GoldenPlan(u: any): boolean {
  if (!u) return false;
  const isCurrentlyGolden = Boolean(
    u.verifiedPlan === '1_year_pro' ||
    u.verifiedPlan === 'yearly' ||
    u.subscriptionPlan === '1_year_pro' ||
    u.subscriptionPlan === 'yearly' ||
    u.plan === 'yearly' ||
    u.goldenBadge ||
    (typeof u.subscriptionAmount === 'number' && u.subscriptionAmount >= 1188) ||
    u.activeFreeOneYearPlan
  );

  const uid = u.id || u.userId || u.username;
  if (uid) {
    const key = `vyapar_sticky_gold_${String(uid).trim().toLowerCase()}`;
    if (isCurrentlyGolden) {
      try {
        localStorage.setItem(key, 'true');
      } catch (e) {}
      return true;
    }
    try {
      if (localStorage.getItem(key) === 'true') {
        return true;
      }
    } catch (e) {}
  }

  const nameKey = u.name || u.userName || u.companyName;
  if (nameKey) {
    const key = `vyapar_sticky_gold_name_${String(nameKey).trim().toLowerCase()}`;
    if (isCurrentlyGolden) {
      try {
        localStorage.setItem(key, 'true');
      } catch (e) {}
      return true;
    }
    try {
      if (localStorage.getItem(key) === 'true') {
        return true;
      }
    } catch (e) {}
  }

  return isCurrentlyGolden;
}

export function shouldShowVerifiedBadge(u: any): boolean {
  if (!u) return false;
  return Boolean(
    u.isVerified ||
    u.verifiedBadge ||
    u.goldenBadge ||
    u.isGold ||
    isUser1188GoldenPlan(u) ||
    u.verifiedPlan ||
    (u.subscriptionPlan && u.subscriptionPlan !== 'free') ||
    u.plan === 'yearly' ||
    u.plan === 'monthly' ||
    u.plan === '1_year_pro'
  );
}

export function VerifiedBadge({ 
  size = "md", 
  className = "",
  user,
  variant,
  role,
  plan
}: { 
  size?: "sm" | "md" | "lg"; 
  className?: string;
  user?: any;
  variant?: 'gold' | 'blue' | 'red';
  role?: string;
  plan?: string;
}) {
  const sizeMap = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  // Try to enrich user with full cached info for golden status
  let fullUser = user || {};
  if (user) {
    const fallbackId = user.id || user.userId;
    const fallbackName = user.name || user.userName || user.companyName;
    try {
      const raw = localStorage.getItem('VyaparBridge_cached_users');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cached = parsed.find(u => 
             (fallbackId && String(u.id) === String(fallbackId)) ||
             (fallbackId && String(u.username) === String(fallbackId)) ||
             (fallbackName && u.name && String(u.name).toLowerCase() === String(fallbackName).toLowerCase()) ||
             (fallbackName && u.companyName && String(u.companyName).toLowerCase() === String(fallbackName).toLowerCase())
          );
          if (cached) {
            fullUser = { ...user, ...cached };
          }
        }
      }
    } catch (e) {}
  }

  const effectiveRole = role || fullUser?.role;
  const isCustomer = effectiveRole === 'customer';

  // Logical check for Golden Badge (‚Çπ1,188 yearly plan or golden badge flag) vs Blue/Red
  const isGolden = variant === 'gold' || 
                   Boolean(fullUser?.goldenBadge) || 
                   Boolean(fullUser?.isGold) || 
                   isUser1188GoldenPlan(fullUser) || 
                   plan === 'yearly' || 
                   plan === '1_year_pro' ||
                   fullUser?.verifiedPlan === 'yearly' ||
                   fullUser?.verifiedPlan === '1_year_pro' ||
                   fullUser?.subscriptionPlan === 'yearly';

  let badgeType: 'gold' | 'blue' | 'red' = 'blue';
  if (variant) {
    badgeType = variant;
  } else if (isGolden) {
    badgeType = 'gold';
  } else if (isCustomer) {
    badgeType = 'red';
  } else {
    badgeType = 'blue';
  }

  if (badgeType === 'gold') {
    return (
      <span 
        className={cn("inline-flex items-center text-amber-500 dark:text-amber-400 shrink-0 drop-shadow-[0_0_8px_rgba(245,158,11,0.65)]", className)} 
        title="üëë ‚Çπ1,188 Golden Verified Seller (Top Priority #1 Ranking)"
      >
        <svg className={cn(sizeMap[size], "fill-current")} viewBox="0 0 24 24">
          <path d="M12 2l2.4 2.4 3.4-.5.5 3.4 3.2 1.3-1.3 3.2 1.3 3.2-3.2 1.3-.5 3.4-3.4-.5L12 22l-2.4-2.4-3.4.5-.5-3.4-3.2-1.3 1.3-3.2-1.3-3.2 3.2-1.3.5-3.4 3.4.5L12 2z" />
          <path d="M10 15.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4z" fill="#000000" />
        </svg>
      </span>
    );
  }

  if (badgeType === 'red') {
    return (
      <span 
        className={cn("inline-flex items-center text-rose-600 dark:text-rose-500 shrink-0 drop-shadow-[0_0_6px_rgba(225,29,72,0.5)]", className)} 
        title="üî¥ ‚Çπ99 Verified Buyer (Direct Connect & Discount Deals)"
      >
        <svg className={cn(sizeMap[size], "fill-current")} viewBox="0 0 24 24">
          <path d="M12 2l2.4 2.4 3.4-.5.5 3.4 3.2 1.3-1.3 3.2 1.3 3.2-3.2 1.3-.5 3.4-3.4-.5L12 22l-2.4-2.4-3.4.5-.5-3.4-3.2-1.3 1.3-3.2-1.3-3.2 3.2-1.3.5-3.4 3.4.5L12 2z" />
          <path d="M10 15.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4z" fill="#ffffff" />
        </svg>
      </span>
    );
  }

  // Default Blue Badge for ‚Çπ99 Verified Sellers
  return (
    <span 
      className={cn("inline-flex items-center text-[#0095f6] dark:text-[#3897f0] shrink-0", className)} 
      title="üî∑ ‚Çπ99 Verified Seller (Active B2B Member)"
    >
      <svg className={cn(sizeMap[size], "fill-current")} viewBox="0 0 24 24">
        <path d="M12 2l2.4 2.4 3.4-.5.5 3.4 3.2 1.3-1.3 3.2 1.3 3.2-3.2 1.3-.5 3.4-3.4-.5L12 22l-2.4-2.4-3.4.5-.5-3.4-3.2-1.3 1.3-3.2-1.3-3.2 3.2-1.3.5-3.4 3.4.5L12 2z" />
        <path d="M10 15.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4z" fill="#ffffff" />
      </svg>
    </span>
  );
}

export function VerifiedPaymentModal({ isOpen, onClose, user, onSuccess }: { isOpen: boolean, onClose: () => void, user: any, onSuccess: (u: any) => void }) {
  const isCustomer = user?.role === 'customer';
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [membershipType, setMembershipType] = useState<'local' | 'company'>(user?.role === 'customer' ? 'local' : 'company');
  const [step, setStep] = useState<'plan' | 'qr'>('plan');
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<any>({
    upiId: 'ashish660@ibl',
    accountName: 'Ashish Kumar Verma',
    barcodeImageUrl: '',
    barcodeSecretToken: 'SECURE-BARCODE-VERIFY-2026-X89',
    paymentLink: 'upi://pay?pa=ashish660@ibl&pn=Ashish%20Kumar%20Verma&cu=INR'
  });

  useEffect(() => {
    // Listen to real-time event for immediate instant UI update
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setPaymentSettings((prev: any) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('vyapar_payment_settings_updated', handleUpdate);

    // Subscribe to Firestore admin settings globally for all users
    const unsubscribe = subscribeToAdminSettingsFromFirestore((fbData) => {
      if (fbData && (fbData.upiId || fbData.barcodeImageUrl)) {
        setPaymentSettings((prev: any) => ({ ...prev, ...fbData }));
      }
    });

    if (isOpen) {
      setStep('plan');
      setUtr('');
      setLoading(false);
      setMembershipType(user?.role === 'customer' ? 'local' : 'company');
      setSelectedPlan('monthly');
      
      // Check local storage
      const localBarcode = localStorage.getItem('vyapar_barcode_url');
      if (localBarcode) {
        setPaymentSettings((prev: any) => ({ ...prev, barcodeImageUrl: localBarcode }));
      }

      safeFetch('/api/payment-settings')
        .then(data => {
          if (data && data.upiId) {
            setPaymentSettings((prev: any) => ({ ...prev, ...data }));
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('vyapar_payment_settings_updated', handleUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  const price = selectedPlan === 'monthly' ? '‚Çπ99' : '‚Çπ1,188';

  const handleCopyLink = () => {
    const textToCopy = paymentSettings.paymentLink || `upi://pay?pa=${paymentSettings.upiId}&pn=${encodeURIComponent(paymentSettings.accountName)}&cu=INR`;
    navigator.clipboard.writeText(textToCopy);
    toast.success('üìã Payment Link copied to clipboard!');
  };

  const handleCopyUpi = () => {
    const cleanUpi = (paymentSettings.upiId || 'ashish660@ibl').trim().replace(/\s+/g, '');
    navigator.clipboard.writeText(cleanUpi);
    toast.success(`üìã UPI ID copied: ${cleanUpi}`);
  };

  const handleOpenUpiApp = (appType?: 'gpay' | 'phonepe' | 'paytm' | 'generic') => {
    const rawUpi = (paymentSettings.upiId || 'ashish660@ibl').trim();
    const cleanUpi = rawUpi.replace(/\s+/g, '');
    const cleanName = encodeURIComponent(paymentSettings.accountName || 'Ashish Kumar Verma');
    const numAmount = selectedPlan === 'yearly' ? '1188' : '99';

    // 1. Copy UPI ID to clipboard as instant backup
    try {
      navigator.clipboard.writeText(cleanUpi);
    } catch (e) {}

    toast.success(`üìã UPI ID Copied: ${cleanUpi}\nOpening Payment App (${price})...`, { duration: 4000 });

    let upiUrl = `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${numAmount}&cu=INR`;

    if (appType === 'phonepe') {
      upiUrl = `phonepe://pay?pa=${cleanUpi}&pn=${cleanName}&am=${numAmount}&cu=INR`;
    } else if (appType === 'paytm') {
      upiUrl = `paytmmp://pay?pa=${cleanUpi}&pn=${cleanName}&am=${numAmount}&cu=INR`;
    } else if (appType === 'gpay') {
      upiUrl = `intent://pay?pa=${cleanUpi}&pn=${cleanName}&am=${numAmount}&cu=INR#Intent;scheme=upi;package=com.google.android.apps.nfp.p2p;end;`;
    }

    setTimeout(() => {
      window.location.href = upiUrl;
    }, 300);
  };

  const handleConfirmPayment = async () => {
    if (!utr || !utr.trim()) {
      toast.error('Please enter your 12-digit UTR or Transaction Reference Number!');
      return;
    }
    setLoading(true);
    const cleanUtr = utr.trim();
    const amountVal = selectedPlan === 'yearly' ? 1188 : 99;

    const pendingPaymentObj = {
      id: `pay_${Date.now()}`,
      plan: selectedPlan,
      membershipType: membershipType,
      utr: cleanUtr,
      amount: amountVal,
      status: 'pending',
      submittedAt: Date.now()
    };

    const updatedUserObj = {
      ...(user || {}),
      pendingPayment: pendingPaymentObj
    };

    // 1. Submit to Firestore
    try {
      await submitPaymentUTRToFirestore({
        userId: user?.id || '1',
        userName: user?.name || user?.companyName || 'Member',
        userPhone: user?.phone || '',
        plan: selectedPlan,
        membershipType: membershipType,
        utr: cleanUtr,
        amount: amountVal
      });
    } catch (fbErr) {
      console.warn('Firestore payment note:', fbErr);
    }

    // 2. Try backend API
    try {
      const data = await safeFetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || '1',
          plan: selectedPlan,
          membershipType: membershipType,
          utr: cleanUtr
        })
      });
      if (data && data.user) {
        onSuccess(data.user);
      } else {
        onSuccess(updatedUserObj);
      }
    } catch (e) {
      console.warn('Backend API note, using local & Firestore record:', e);
      onSuccess(updatedUserObj);
    } finally {
      setLoading(false);
      toast.success(`‚è≥ Payment UTR Submitted! Admin 24-Hour Verification is now active.`);
      
      // Open WhatsApp to send UTR directly to Admin with pre-filled message
      const adminWhatsApp = paymentSettings.whatsappNumber || '919825012345';
      const cleanPhone = adminWhatsApp.replace(/\D/g, '');
      const msgText = encodeURIComponent(
        `üôè Namaste Vyapar Bridge Admin,\n\nMaine Payment complete kar di hai:\n- User/Business: ${user?.name || user?.companyName || 'Member'}\n- Plan: ${selectedPlan === 'yearly' ? 'Yearly Plan (‚Çπ1,188)' : 'Monthly Plan (‚Çπ99)'}\n- 12-Digit UTR: ${cleanUtr}\n\nKripya verification approve karein aur Blue Badge activate karein. Dhanyawad!`
      );
      const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${msgText}`;
      window.open(waUrl, '_blank');
      
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-1.5">
                Vyapar Bridge Verified <Sparkles className="w-4 h-4 text-amber-300" />
              </h3>
              {isCustomer ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">Verified Member</span>
                  <Award className="w-4 h-4 text-amber-300" />
                </div>
              ) : (
                <p className="text-xs text-blue-100">Official B2B Authenticity Badge & Top 10 Rank</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Active Pending Verification Status Banner */}
          {user?.pendingPayment && user?.pendingPayment?.status === 'pending' && (
            <div className="bg-amber-500/10 border-2 border-amber-500/40 p-4 rounded-xl text-xs space-y-1.5 text-amber-800 dark:text-amber-300">
              <div className="font-extrabold text-sm flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span>‚è≥ Verification Pending (24-Hour Timer Active)</span>
              </div>
              <p>
                Your payment for <strong>{user.pendingPayment.plan === 'yearly' ? 'Yearly Plan (‚Çπ1,188)' : 'Monthly Plan (‚Çπ99)'}</strong> is under review by Vyapar Bridge Admin.
              </p>
              <p className="text-[11px] font-bold text-black/80 dark:text-slate-300">
                ‚úì Verified Badge will be activated as soon as Admin approves.
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                * Note: If not verified by Admin within 24 hours, money auto-refund triggers back to your UPI account. Please make sure you sent the screenshot on WhatsApp.
              </p>
            </div>
          )}

          {user?.pendingPayment && user?.pendingPayment?.status === 'refund_initiated' && (
            <div className="bg-rose-500/10 border-2 border-rose-500/40 p-4 rounded-xl text-xs space-y-1.5 text-rose-800 dark:text-rose-300">
              <div className="font-extrabold text-sm flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span>‚Ü© Refund Initiated / Unverified</span>
              </div>
              <p>
                Your payment was not verified within 24 hours or unmatched in statement. Refund has been initiated back to your bank account. You can re-submit a new payment request and message Admin.
              </p>
            </div>
          )}

          {user?.isVerified ? (() => {
            const isGoldenPlan = Boolean(
              user.goldenBadge || 
              user.verifiedPlan === 'yearly' || 
              user.verifiedPlan === '1_year_pro' || 
              isUser1188GoldenPlan(user)
            );
            const validityFromUser = typeof user.validityDays === 'number' ? user.validityDays : null;
            const totalDurationMs = validityFromUser 
              ? validityFromUser * 24 * 60 * 60 * 1000 
              : (isGoldenPlan ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000);
            
            const isYearly = validityFromUser === 365 || isGoldenPlan;
            
            const timePassedMs = Date.now() - (user.verifiedAt || Date.now());
            const daysRemaining = Math.ceil(Math.max(0, totalDurationMs - timePassedMs) / (1000 * 60 * 60 * 24));
            const progressPercent = Math.min(100, Math.max(0, 100 - (timePassedMs / totalDurationMs * 100)));
            const expiryDate = new Date((user.verifiedAt || Date.now()) + totalDurationMs).toLocaleDateString();

            return (
              <div className="flex flex-col gap-6 py-4">
                <div className="flex flex-col items-center justify-center py-8 gap-5 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-zinc-900 rounded-2xl border-2 border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative bg-emerald-600 p-5 rounded-full shadow-xl shadow-emerald-500/40">
                      <ShieldCheck className="w-14 h-14 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 p-1.5 rounded-full border-4 border-white dark:border-zinc-900">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-center px-4">
                    <h2 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter leading-none mb-2">
                      ACTIVE VERIFIED MEMBER
                    </h2>
                    <p className="text-xs text-black/70 dark:text-zinc-400 font-bold uppercase tracking-widest">
                      {isYearly ? 'Yearly Plan (365 Days)' : 'Monthly Plan (30 Days)'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-4">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-xs font-bold text-black/60 dark:text-zinc-400 uppercase tracking-wider">Plan Validity</span>
                      <div className="text-lg font-black text-black dark:text-zinc-100">
                        {daysRemaining} Days Remaining
                      </div>
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                      Active ‚úì
                    </div>
                  </div>
                  
                  <div className="relative w-full h-4 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${progressPercent}%` 
                      }}
                    />
                    {/* Animated shine effect on the progress bar */}
                    <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-black/50 dark:text-zinc-500 uppercase tracking-wider">
                    <span>Activated: {new Date(user.verifiedAt || Date.now()).toLocaleDateString()}</span>
                    <span>Expires: {expiryDate}</span>
                  </div>
                </div>
              </div>
            );
          })() : step === 'plan' ? (
            <>
              {/* Feature Highlights / Instructions */}
              {isCustomer ? (
                <div className="flex flex-col items-center justify-center py-8 gap-5 bg-gradient-to-b from-rose-50 to-white dark:from-rose-900/20 dark:to-zinc-900 rounded-2xl border-2 border-rose-100 dark:border-rose-800/50 shadow-sm">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-rose-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative bg-rose-600 p-5 rounded-full shadow-xl shadow-rose-500/40">
                      <ShieldCheck className="w-14 h-14 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 p-1.5 rounded-full border-4 border-white dark:border-zinc-900">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-center px-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-black mb-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                      üî¥ RED VERIFIED BUYER BADGE
                    </div>
                    <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-2">
                      DIRECT SELLER CONNECT & DISCOUNTS
                    </h2>
                    <p className="text-xs text-black/70 dark:text-zinc-400 font-bold">
                      Unlock direct phone calls, WhatsApp chat, and wholesale rates with verified suppliers across India!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs space-y-3">
                  <div className="font-bold text-black dark:text-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      Seller Verification Plans & Badges:
                    </div>
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Verified System
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <span className="text-amber-500 text-base leading-none">üëë</span>
                      <div className="text-[11px] leading-tight">
                        <strong className="text-amber-700 dark:text-amber-400">‚Çπ1,188 Pro Yearly (üåü Golden Badge):</strong>
                        <div className="text-black/80 dark:text-zinc-300 mt-0.5 font-medium">
                          #1 Highest Priority in Search & Nearby GPS, Full Buyer Contact & WhatsApp Unlock on all Cart leads.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <span className="text-blue-500 text-base leading-none">üî∑</span>
                      <div className="text-[11px] leading-tight">
                        <strong className="text-blue-700 dark:text-blue-400">‚Çπ99 Monthly (üî∑ Blue Badge):</strong>
                        <div className="text-black/80 dark:text-zinc-300 mt-0.5 font-medium">
                          Blue Verified Badge on Profile & Leaderboard display.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Select Plan / Dropdown for Customer */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-black dark:text-zinc-200">
                  {isCustomer ? '‡§ñ‡§∞‡•Ä‡§¶‡§æ‡§∞ ‡§µ‡•á‡§∞‡§ø‡§´‡§ø‡§ï‡•á‡§∂‡§® ‡§™‡•ç‡§≤‡§æ‡§® (Buyer Verification Plan):' : 'Select Seller Verification Plan (‚Çπ):'}
                </label>
                
                {isCustomer ? (
                  <div className="p-4 rounded-xl border-2 border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 shadow-md flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">üî¥</span>
                        <span className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                          Verified Buyer Member
                        </span>
                      </div>
                      <div className="text-2xl font-black text-black dark:text-white mt-1">‚Çπ99 <span className="text-xs font-normal text-black/60">/ Month</span></div>
                      <div className="text-[11px] text-black/70 dark:text-zinc-400 mt-0.5">
                        ‚úì Direct Contact with all verified sellers ‚Ä¢ Red Badge on profile
                      </div>
                    </div>
                    <div className="bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-sm">
                      SELECTED ‚úì
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Merchant Cards */}
                    <div 
                      onClick={() => {
                        setSelectedPlan('monthly');
                        setMembershipType('company');
                      }}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative",
                        selectedPlan === 'monthly'
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-md"
                          : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                          <span>üî∑</span> Blue Badge
                        </div>
                        <div className="text-2xl font-black text-black dark:text-white mt-1">‚Çπ99</div>
                        <div className="text-[10px] text-black/70 mt-1">Billed monthly</div>
                      </div>
                      <div className="mt-2 text-[10px] text-black/60 dark:text-zinc-400">
                        Standard verified status
                      </div>
                    </div>

                    <div 
                      onClick={() => {
                        setSelectedPlan('yearly');
                        setMembershipType('company');
                      }}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden",
                        selectedPlan === 'yearly'
                          ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-md ring-2 ring-amber-500/20"
                          : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                      )}
                    >
                      <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-bl-lg tracking-wider uppercase">
                        üëë TOP PRIORITY
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400">
                          <span>üåü</span> Golden Badge
                        </div>
                        <div className="text-2xl font-black text-black dark:text-white mt-1">‚Çπ1,188</div>
                        <div className="text-[10px] text-black/70 mt-1">12 Months Pro Access</div>
                      </div>
                      <div className="mt-2 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        #1 Rank in Search & Nearby GPS + Full Buyer Contact Unlock
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setStep('qr')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all text-sm shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                Proceed to Pay {price} <QrCode className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              {/* QR & Link Payment Step */}
              <div className="text-center space-y-3">
                <div className="font-bold text-lg text-black dark:text-white">
                  Amount: <span className="text-blue-600 dark:text-blue-400">{price} INR</span> ({selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'})
                </div>

                {/* Secure Barcode Image Section */}
                <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                    <QrCode className="w-4 h-4" />
                    <span>Official Verified Barcode & UPI Payment</span>
                  </div>

                  {paymentSettings.barcodeImageUrl ? (
                    <div className="relative inline-block bg-white p-3 rounded-xl shadow-md border border-slate-200 dark:border-zinc-700">
                      <img 
                        src={paymentSettings.barcodeImageUrl} 
                        alt="Payment Barcode QR" 
                        className="max-h-56 w-auto mx-auto object-contain rounded-lg" 
                      />
                    </div>
                  ) : (
                    <div className="inline-block bg-white p-3 rounded-2xl shadow-md border border-slate-200 dark:border-zinc-700">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${paymentSettings.upiId || 'ashish660@ibl'}&pn=${encodeURIComponent(paymentSettings.accountName || 'Ashish Kumar Verma')}&am=${selectedPlan === 'yearly' ? 1188 : 99}&cu=INR`)}`}
                        alt="Dynamic Scannable UPI QR"
                        className="w-48 h-48 mx-auto object-contain rounded-xl"
                      />
                    </div>
                  )}

                  {/* Direct UPI ID & Link Box */}
                  <div className="space-y-2 bg-slate-50 dark:bg-zinc-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-left">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-black/80 dark:text-zinc-300 font-bold">Official UPI ID:</span>
                      <button 
                        type="button"
                        onClick={handleCopyUpi} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy UPI ID</span>
                      </button>
                    </div>
                    <div className="font-mono font-black text-base text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-center tracking-wide select-all">
                      {paymentSettings.upiId || 'ashish660@ibl'}
                    </div>
                  </div>

                  {/* Highlighted Platform Fee Note in English */}
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 p-3.5 rounded-xl text-left shadow-sm space-y-1">
                    <div className="flex items-center gap-1.5 font-extrabold text-xs text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Platform Support Contribution</span>
                    </div>
                    <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
                      Note: We collect this nominal fee solely to support continuous platform developments, server infrastructure maintenance, and seamless enhancements of Vyapar Bridge. Thank you to our faithful users for your trust and support!
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-black dark:text-zinc-300">
                  Transaction / UTR Reference No. (Required)
                </label>
                <input 
                  type="text" 
                  value={utr}
                  onChange={e => setUtr(e.target.value)}
                  placeholder="e.g. 423891023812"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-black dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setStep('plan')}
                  className="w-1/3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-black dark:text-zinc-200 font-semibold py-2.5 rounded-xl transition-colors text-sm cursor-pointer"
                >
                  Back
                </button>
                <button 
                  type="button" 
                  disabled={loading}
                  onClick={handleConfirmPayment}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Activating...
                    </>
                  ) : (
                    'Payment Done - Get Verified ‚úì'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div></div>
  );
}


export function validateMediaDuration(file: File): Promise<{ valid: boolean; duration: number; message?: string }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video') && !file.name.match(/\.(mp4|webm|mov|m4v)$/i)) {
      resolve({ valid: true, duration: 0 });
      return;
    }
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      const duration = video.duration;
      if (duration > 60.5) {
        resolve({ 
          valid: false, 
          duration, 
          message: `Reel duration (${Math.round(duration)}s) exceeds 60 seconds limit. Please select a video under 60 seconds.` 
        });
      } else {
        resolve({ valid: true, duration });
      }
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: true, duration: 0 });
    };
    video.src = objectUrl;
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

function ReelCard({ 
  reel, 
  currentUser, 
  onClose,
  userLocation
}: { 
  reel: any; 
  currentUser: any; 
  onClose?: () => void;
  userLocation?: {lat: number, lng: number} | null;
}) {
  if (!reel) {
    return (
      <div className="relative w-full max-w-[420px] h-[85vh] bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-zinc-400 font-medium text-sm">Reel content unavailable</p>
      </div>
    );
  }

  const navigate = useNavigate();
  const authorIdentifier = reel?.userId || reel?.user?.id || reel?.user?.name || reel?.name || '';
  const activeUserId = currentUser?.id || localStorage.getItem('vyapar_user_id');
  const [isLiked, setIsLiked] = useState(() => isPostLikedByUser(reel, activeUserId));
  const [likesCount, setLikesCount] = useState(reel?.likesCount || 0);
  const [isSaved, setIsSaved] = useState(() => isPostSavedByUser(reel, activeUserId));
  const [savedCount, setSavedCount] = useState(reel?.savedCount || 0);

  useEffect(() => {
    setIsLiked(isPostLikedByUser(reel, activeUserId));
    setLikesCount(reel?.likesCount || 0);
    setIsSaved(isPostSavedByUser(reel, activeUserId));
    setSavedCount(reel?.savedCount || 0);
    if (typeof reel?.viewsCount === 'number' && reel.viewsCount > 0) {
      setViewsCount(prev => Math.max(prev, reel.viewsCount));
    }
  }, [reel?.id, reel?.isLiked, reel?.likesCount, reel?.isSaved, reel?.savedCount, reel?.viewsCount, reel?.likedBy, activeUserId]);
  const [sharesCount, setSharesCount] = useState(reel?.sharesCount || 0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsCount, setCommentsCount] = useState(reel?.commentsCount || 0);
  const [enquiriesCount, setEnquiriesCount] = useState(reel?.enquiriesCount || 0);
  const [viewsCount, setViewsCount] = useState(() => reel?.viewsCount || 0);
  const [commentText, setCommentText] = useState('');
  const [reelCommentImagePreview, setReelCommentImagePreview] = useState<string | null>(null);
  const [isReelGifModalOpen, setIsReelGifModalOpen] = useState(false);
  const [selectedReelLightboxImage, setSelectedReelLightboxImage] = useState<{ url: string; user?: string; avatar?: string; text?: string } | null>(null);
  const reelCommentFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => isGlobalVideoMuted());

  useEffect(() => {
    const handleMuteChange = (e: any) => {
      setIsMuted(!!e.detail?.muted);
    };
    window.addEventListener('vyapar_global_mute_change', handleMuteChange);
    return () => window.removeEventListener('vyapar_global_mute_change', handleMuteChange);
  }, []);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [, setForceVersion] = useState(0);
  const [reelRating, setReelRating] = useState<number>(reel?.averageRating || 4.8);
  const [reelRatingsCount, setReelRatingsCount] = useState<number>(reel?.ratingsCount || 0);
  const [isFollowing, setIsFollowing] = useState(() => isUserFollowed(authorIdentifier));
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('cover');
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [mediaAspectRatio, setMediaAspectRatio] = useState<number | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const isExplicitImage = Boolean(
    reel?.type === 'image' || 
    reel?.type === 'photo' || 
    reel?.type === 'picture' || 
    (reel?.mediaUrl && (
      reel.mediaUrl.startsWith('data:image/') || 
      reel.mediaUrl.match(/\.(jpg|jpeg|png|webp|gif|svg|avif|heic|bmp)(\?.*)?$/i)
    ))
  );

  const isExplicitPdf = Boolean(
    reel?.type === 'pdf' || 
    (reel?.mediaUrl && (
      reel.mediaUrl.startsWith('data:application/pdf') || 
      reel.mediaUrl.match(/\.pdf(\?.*)?$/i)
    ))
  );

  const localVideoData = (!isExplicitImage && !isExplicitPdf && reel?.id) ? localStorage.getItem('vyapar_video_' + reel.id) : null;
  const inMemoryVideo = reel?.id ? getCachedVideoUrlInMemory(String(reel.id)) : null;
  const rawVideoSrc = (isExplicitImage || isExplicitPdf) ? '' : (
    inMemoryVideo ||
    localVideoData || 
    reel?.videoUrl || 
    (reel?.mediaUrl && (
      reel.mediaUrl.startsWith('data:video') || 
      reel.mediaUrl.startsWith('blob:') || 
      reel.mediaUrl.startsWith('indexeddb:') ||
      reel.mediaUrl.startsWith('/uploads/') ||
      reel.mediaUrl.match(/\.(mp4|webm|mov|m4v|mkv|3gp)(\?.*)?$/i) || 
      reel.mediaUrl.includes('youtube.com') || 
      reel.mediaUrl.includes('youtu.be')
    ) ? reel.mediaUrl : '') || 
    reel?.video || 
    (reel?.type === 'video' || reel?.type === 'reel' || reel?.isReel ? (reel?.mediaUrl || '') : '') ||
    ''
  );
  
  const isEmbedVideo = Boolean(
    rawVideoSrc.includes('youtube.com') || 
    rawVideoSrc.includes('youtu.be')
  );

  const isPlayableVideo = !isExplicitImage && !isExplicitPdf && Boolean(
    rawVideoSrc && (
      rawVideoSrc.startsWith('data:video') || 
      rawVideoSrc.startsWith('blob:') || 
      rawVideoSrc.startsWith('indexeddb:') ||
      rawVideoSrc.startsWith('/uploads/') ||
      rawVideoSrc.startsWith('http') ||
      rawVideoSrc.match(/\.(mp4|webm|mov|m4v|mkv|3gp)(\?.*)?$/i) ||
      isEmbedVideo ||
      reel?.type === 'video' ||
      reel?.type === 'reel' ||
      reel?.isReel
    ) && !rawVideoSrc.startsWith('data:image') && !rawVideoSrc.match(/\.(jpg|jpeg|png|webp|gif|svg|avif|pdf)(\?.*)?$/i)
  );

  const [videoFailed, setVideoFailed] = useState(false);
  const posterSrc = reel?.thumbnailUrl || (reel?.mediaUrl && (reel.mediaUrl.startsWith('data:image') || reel.mediaUrl.match(/\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i)) ? reel.mediaUrl : '') || reel?.persistentMediaUrl || '';
  const isVideo = isPlayableVideo && !videoFailed;
  const mediaSrc = isVideo ? rawVideoSrc : (posterSrc || reel?.mediaUrl || rawVideoSrc);
  const authorName = reel?.user?.name || reel?.userName || reel?.name || 'User';
  const authorAvatar = resolveUserAvatar(reel, authorName);
  const isAuthorVerified = reel?.user?.isVerified || reel?.isVerified;
  const reelMusic = reel?.music || (reel?.musicTitle ? { title: reel.musicTitle, artist: reel.musicArtist, audioUrl: reel.musicUrl } : null);

  useEffect(() => {
    // Unique view tracking for reels (Runs once per session)
    if (reel?.id) {
      const trackReelView = async () => {
        const sessionKey = `vyapar_viewed_reel_${reel.id}`;
        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, '1');
          const fsViews = await recordViewInFirestore(reel.id);
          if (typeof fsViews === 'number' && fsViews > 0) {
            setViewsCount(prev => Math.max(prev, fsViews));
            if (reel) reel.viewsCount = Math.max(reel.viewsCount || 0, fsViews);
          }
        }
        fetch(`/api/posts/${reel.id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser?.id })
        })
        .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json')) ? res.json() : null)
        .then(data => {
          if (data && typeof data.viewsCount === 'number') {
            setViewsCount(prev => Math.max(prev, data.viewsCount));
            if (reel) reel.viewsCount = Math.max(reel.viewsCount || 0, data.viewsCount);
          }
          if (data && typeof data.likesCount === 'number' && data.likesCount > 0) {
            setLikesCount(prev => Math.max(prev, data.likesCount));
          }
        })
        .catch(() => {});
      };

      trackReelView();
    }
  }, [reel?.id]);

  useEffect(() => {
    // Notify all background feed videos that a Reel is playing so they pause immediately!
    window.dispatchEvent(new CustomEvent('vyapar_reel_viewing_active', { detail: { active: true } }));
    window.dispatchEvent(new CustomEvent('pause_all_feed_videos'));

    return () => {
      // Reel closed / exited: pause media and allow feed video to resume
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch (e) {}
      }
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
      }
      window.dispatchEvent(new CustomEvent('vyapar_reel_viewing_active', { detail: { active: false } }));
    };
  }, []);

  useEffect(() => {
    // Attempt to play on mount (triggered by user interaction from opening the modal)
    const playMedia = async () => {
      try {
        if (isPlaying) {
          const vp = videoRef.current?.play();
          if (vp !== undefined) vp.catch(()=>{});
          const ap = audioRef.current?.play();
          if (ap !== undefined) ap.catch(()=>{});
        }
      } catch (err) {
        console.log("Autoplay blocked, waiting for interaction");
      }
    };
    playMedia();
  }, [reel?.id, isPlaying]);

  useEffect(() => {
    if (showVolumeIndicator) {
      const timer = setTimeout(() => setShowVolumeIndicator(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showVolumeIndicator]);

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextMuted = !isMuted;
    setGlobalVideoMuted(nextMuted);
    setShowVolumeIndicator(true);
  };

  const clickTimerRef = React.useRef<any>(null);
  const lastTapInfo = React.useRef<{ x: number; y: number; time: number } | null>(null);
  const touchStartPos = React.useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTouchTime = React.useRef(0);

  const handleTouchStartReel = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  };

  const handleTouchEndReel = (e: React.TouchEvent) => {
    lastTouchTime.current = Date.now();
    if (!touchStartPos.current || e.changedTouches.length === 0) {
      touchStartPos.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const distX = Math.abs(touch.clientX - touchStartPos.current.x);
    const distY = Math.abs(touch.clientY - touchStartPos.current.y);
    const totalDist = Math.hypot(distX, distY);
    const touchDuration = Date.now() - touchStartPos.current.time;
    touchStartPos.current = null;

    // If finger moved more than 10px or touch was held longer than 400ms, it is a SWIPE/SLIDE/SCROLL gesture -> NOT a tap!
    if (totalDist > 10 || touchDuration > 400) {
      return;
    }

    // This is a verified stationary TAP
    const now = Date.now();
    const prevTap = lastTapInfo.current;

    if (prevTap) {
      const delay = now - prevTap.time;
      const tapDist = Math.hypot(touch.clientX - prevTap.x, touch.clientY - prevTap.y);
      // Double tap requires 80ms - 320ms between taps and within 40px radius
      if (delay >= 80 && delay <= 320 && tapDist <= 40) {
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
          clickTimerRef.current = null;
        }
        lastTapInfo.current = null;
        handleDoubleTap();
        return;
      }
    }

    // Potential first tap
    lastTapInfo.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    };

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      if (isVideo) {
        togglePlay();
      } else if (reelMusic?.audioUrl) {
        toggleMute();
      }
      lastTapInfo.current = null;
      clickTimerRef.current = null;
    }, 280);
  };

  const handleInteractionClick = (e: React.MouseEvent) => {
    // Ignore synthetic click from touch events to avoid double triggering
    if (Date.now() - lastTouchTime.current < 500) {
      return;
    }
    e.stopPropagation();
    if (isVideo) {
      togglePlay();
    } else if (reelMusic?.audioUrl) {
      toggleMute();
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
    setShowHeart(true);
    // Haptic feedback if available
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(60);
    }
    setTimeout(() => setShowHeart(false), 800);
  };

  useEffect(() => {
    const syncFollow = () => {
      setIsFollowing(isUserFollowed(authorIdentifier));
    };
    window.addEventListener('followedUsersUpdated', syncFollow);
    return () => window.removeEventListener('followedUsersUpdated', syncFollow);
  }, [authorIdentifier]);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.id) {
      toast.error('üîê Please Login or Register to Follow creators!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    const next = toggleFollowUser(authorIdentifier);
    setIsFollowing(next);
    if (next) {
      toast.success(`Following ${reel?.user?.name || authorIdentifier}`);
    } else {
      toast.success(`Unfollowed ${reel?.user?.name || authorIdentifier}`);
    }
    
    // Sync with backend
    try {
      await fetch(`/api/users/${authorIdentifier}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id })
      });
    } catch (err) {
      // Offline/local fallback
    }
  };

  useEffect(() => {
    if (reel?.id) {
      fetchCommentsFromFirestore(reel.id).then(fsComments => {
        if (Array.isArray(fsComments) && fsComments.length > 0) {
          setComments(fsComments);
          setCommentsCount(fsComments.length);
        } else {
          safeFetch(`/api/posts/${reel.id}/comments`)
            .then(data => {
              if (Array.isArray(data)) {
                setComments(data);
                if (data.length > 0) setCommentsCount(data.length);
              }
            })
            .catch(() => {});
        }
      });
    }
  }, [reel?.id]);

  const handleMediaEnded = () => {
    // Seamless continuous loop for Reel video & audio
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const vp = videoRef.current.play();
      if (vp !== undefined) vp.catch(() => {});
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      const ap = audioRef.current.play();
      if (ap !== undefined) ap.catch(() => {});
    }
    setIsPlaying(true);
  };

  const isSelfAuthor = Boolean(
    currentUser?.id && (
      String(currentUser.id) === String(reel?.userId || reel?.user?.id || authorIdentifier) ||
      (currentUser.name && authorName && String(currentUser.name).trim().toLowerCase() === String(authorName).trim().toLowerCase()) ||
      (currentUser.username && authorName && String(currentUser.username).trim().toLowerCase() === String(authorName).trim().toLowerCase())
    )
  );

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      const vp = videoRef.current?.play();
      if (vp !== undefined) vp.catch(()=>{});
      const ap = audioRef.current?.play();
      if (ap !== undefined) ap.catch(()=>{});
      setIsPlaying(true);
    }
  };

  const handleLike = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isLiked) playLikeSound();
    if (!currentUser?.id) {
      toast.error('üîê Please Login or Register to Like reels!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    
    const wasLiked = isLiked;
    const nextState = !wasLiked;
    const nextCount = wasLiked ? Math.max(0, likesCount - 1) : likesCount + 1;

    setIsLiked(nextState);
    setLikesCount(nextCount);
    if (nextState) {
      toast.success('Liked reel!');
      incrementUserEngagement('likes');
    }

    if (reel) {
      reel.isLiked = nextState;
      reel.likesCount = nextCount;
    }

    safeFetch(`/api/posts/${reel.id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    }).catch(() => {});

    // Direct Firestore sync (Works everywhere including Vercel)
    const fsRes = await likePostInFirestore(reel.id, currentUser.id, wasLiked, reel);
    if (fsRes && fsRes.success) {
      setIsLiked(fsRes.isLiked);
      setLikesCount(fsRes.likesCount);
      if (reel) {
        reel.isLiked = fsRes.isLiked;
        reel.likesCount = fsRes.likesCount;
      }
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSaved) playSaveSound();
    if (!currentUser?.id) {
      toast.error('üîê Please Login or Register to Save reels!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    const wasSaved = isSaved;
    const nextState = !wasSaved;
    const nextCount = wasSaved ? Math.max(0, savedCount - 1) : savedCount + 1;

    setIsSaved(nextState);
    setSavedCount(nextCount);
    if (nextState) {
      toast.success('Saved reel!');
      incrementUserEngagement('saves');
    } else {
      toast.success('Removed from saved');
    }

    // Direct Firestore sync
    const fsRes = await savePostInFirestore(reel.id, currentUser.id, wasSaved);
    if (fsRes && fsRes.success) {
      setIsSaved(fsRes.isSaved);
      setSavedCount(fsRes.savedCount);
      // We will also hit the server API so that in-memory algorithm engine stays in sync
    }

    try {
      const res = await safeFetch(`/api/posts/${reel.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id })
      });
      if (res && res.isSaved !== undefined) {
        setIsSaved(res.isSaved);
        setSavedCount(res.savedCount);
      }
    } catch (err) {
      console.warn('API fallback note:', err);
    }
  };

  const isReelOwnerOrAdmin = Boolean(
    !currentUser ||
    !(reel?.userId || reel?.user?.id) ||
    String(currentUser?.id) === String(reel?.userId || reel?.user?.id) ||
    currentUser?.role?.toLowerCase() === 'admin' ||
    currentUser?.role === 'Master Admin' ||
    currentUser?.isAdmin
  );

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const reelId = String(reel?.id || '');
    if (!reelId) return;
    
    // Immediate Optimistic UI updates
    setShowOptionsModal(false);
    if (onClose) onClose();
    window.dispatchEvent(new CustomEvent('reelDeleted', { detail: { reelId } }));
    window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId: reelId } }));

    try {
      // 1. Direct Firestore & LocalStorage permanent deletion
      await deletePostFromFirestore(reelId);

      // 2. Background API sync
      try {
        await safeFetch(`/api/posts/${reelId}`, { method: 'DELETE' });
      } catch (e) {}

      toast.success('Reel deleted successfully');
    } catch (err) {
      toast.success('Reel deleted');
    }
  };

  const handleNotInterested = async () => {
    if (!currentUser?.id || !reel?.id) {
      toast.error('Please login first');
      return;
    }
    try {
      await fetch(`/api/posts/${reel.id}/not-interested`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      toast.success('Reel marked as Not Interested. Hidden from your feed.');
      setShowOptionsModal(false);
      if (onClose) onClose();
      window.dispatchEvent(new CustomEvent('reelDeleted', { detail: { reelId: reel.id } }));
      window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId: reel.id } }));
    } catch (err) {
      toast.error('Failed to update preference');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSharesCount(prev => prev + 1);
    playShareSound();
    if (reel?.id) recordShareInFirestore(reel.id);
    if (currentUser?.id && reel?.id) {
      fetch(`/api/posts/${reel.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      }).catch(() => {});
    }
    if (navigator.share) {
      navigator.share({
        title: reel?.title || 'Vyapar Bridge Reel',
        text: reel?.content || 'Check out this Reel on Vyapar Bridge B2B Network!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Reel link copied!');
    }
    setSharesCount(prev => prev + 1);
  };

  useEffect(() => {
    if (showCommentsDrawer && reel?.id) {
      const unsubscribe = subscribeToCommentsFromFirestore(reel.id, (liveComments) => {
        if (Array.isArray(liveComments)) {
          setComments(liveComments);
          setCommentsCount(liveComments.length);
        }
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [showCommentsDrawer, reel?.id]);

  const handleReelCommentImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReelCommentImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      if (!isGif) {
        try {
          const compressed = await optimizeImageForPersistence(file, 640, 640, 0.72);
          if (compressed) {
            setReelCommentImagePreview(compressed);
          }
        } catch (err) {
          console.warn('Image optimization notice:', err);
        }
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    if (!commentText.trim() && !reelCommentImagePreview) return;

    const content = commentText.trim();
    const commentImg = reelCommentImagePreview;
    setCommentText('');
    setReelCommentImagePreview(null);
    setIsSubmittingComment(false);

    try { playBubblePopSound(); } catch (e) {}

    // 1. Instant optimistic comment display (0ms)
    const tempId = 'cmt_opt_' + Date.now();
    const optimisticComment = {
      id: tempId,
      content,
      commentImage: commentImg,
      imageUrl: commentImg,
      userId: currentUser?.id || '1',
      userName: currentUser?.name || 'You',
      userAvatar: currentUser?.avatarUrl || localStorage.getItem('vyapar_user_avatar') || BRAND_LOGO_SRC,
      createdAt: new Date().toISOString(),
      user: currentUser || { name: 'You', avatarUrl: BRAND_LOGO_SRC }
    };

    setComments(prev => [...prev, optimisticComment]);
    setCommentsCount(prev => prev + 1);
    toast.success('Comment sent in real time!');
    incrementUserEngagement('comments');

    // 2. Background non-blocking sync to Firestore & server
    (async () => {
      try {
        const moderation = await moderateContentUniversally({
          content,
          userId: currentUser?.id,
          userRole: currentUser?.role
        });

        if (!moderation.approved) {
          toast.error(moderation.reason || '‚õî Comment removed by AI Guardrail.');
          setComments(prev => prev.filter(c => c.id !== tempId));
          setCommentsCount(prev => Math.max(0, prev - 1));
          return;
        }

        const newCommentObj = {
          content,
          commentImage: commentImg,
          imageUrl: commentImg,
          userId: currentUser?.id || '1',
          userName: currentUser?.name || 'User',
          userAvatar: currentUser?.avatarUrl || '',
          createdAt: new Date().toISOString()
        };

        const fsComment = await addCommentToFirestore(reel?.id || '101', newCommentObj);
        if (fsComment && fsComment.id) {
          setComments(prev => prev.map(c => c.id === tempId ? { ...c, id: fsComment.id } : c));
          return;
        }

        await fetch(`/api/posts/${reel?.id || '101'}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            commentImage: commentImg,
            userId: currentUser?.id || '1'
          })
        });
      } catch (err) {
        console.warn('Background reel comment sync notice:', err);
      }
    })();
  };

  useEffect(() => {
    if (isPlaying) {
      const vp = videoRef.current?.play();
      if (vp !== undefined) vp.catch(() => {});
      const ap = audioRef.current?.play();
      if (ap !== undefined) ap.catch(() => {});
    } else {
      videoRef.current?.pause();
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.volume = reel?.musicVolume !== undefined ? reel.musicVolume : 1;
    }
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.muted = true;
      } else {
        const hasCustomOriginalVolume = reel?.originalVolume !== undefined;
        videoRef.current.muted = hasCustomOriginalVolume ? reel.originalVolume === 0 : (reelMusic ? true : false);
        videoRef.current.volume = hasCustomOriginalVolume ? reel.originalVolume : (reelMusic ? 0 : 1);
      }
    }
  }, [isMuted, reelMusic, reel?.originalVolume, reel?.musicVolume]);

  return (
    <div className="relative w-full h-full bg-black flex flex-col justify-between select-none overflow-hidden">

      {/* Audio Track for custom music */}
      {reelMusic?.audioUrl && (
        <audio 
          ref={(el) => {
            if (audioRef) audioRef.current = el;
            if (el && el.paused && isPlaying) { const p = el.play(); if (p !== undefined) p.catch(()=>{}); }
          }}
          src={reelMusic.audioUrl} 
          muted={isMuted}
          loop
          onEnded={handleMediaEnded}
          className="hidden"
        />
      )}

      {/* Main Media Player Canvas */}
      <div className="absolute inset-0 flex items-center justify-center bg-black overflow-hidden">
        {/* Ambient blurred background to fill any letterboxing / aspect ratio gaps elegantly */}
        {mediaSrc && (
          <div className="absolute inset-0 w-full h-full overflow-hidden opacity-50 blur-3xl scale-110 pointer-events-none z-0">
            <img 
              src={posterSrc || mediaSrc} 
              alt="" 
              className="w-full h-full object-cover select-none"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Interaction Overlay - only active when not embedded player to allow direct control */}
        {!(mediaSrc && (mediaSrc.includes('youtube.com') || mediaSrc.includes('youtu.be'))) && (
          <div 
            className="absolute inset-0 z-20 cursor-pointer" 
            onClick={handleInteractionClick}
            onTouchStart={handleTouchStartReel}
            onTouchEnd={handleTouchEndReel}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (Date.now() - lastTouchTime.current > 500) {
                handleDoubleTap();
              }
            }}
          />
        )}

        {/* Double Tap Heart Animation */}
        <AnimatePresence>
          {showHeart && (
            <div className="absolute inset-0 z-[40] flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, times: [0, 0.4, 0.8, 1] }}
                className="text-white drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
              >
                <Heart className="w-24 h-24 fill-red-500 text-red-500" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Sharp Foreground Media with Unified FeedVideoPlayer Engine */}
        {isExplicitPdf ? (
          <div className="relative z-10 w-full h-full flex items-center justify-center bg-slate-950 p-2 sm:p-4 overflow-y-auto">
            <PdfCardViewer post={{ ...reel, mediaUrl: mediaSrc || reel?.mediaUrl }} variant="feed" />
          </div>
        ) : (isYouTubeUrl(mediaSrc) || isYouTubeUrl(reel?.externalLink) || isYouTubeUrl(rawVideoSrc)) ? (
          <UniversalYouTubePlayer 
            url={mediaSrc || reel?.externalLink || rawVideoSrc} 
            isReel={true} 
            aspectRatio="9:16" 
            className="relative z-10 w-full h-full object-contain pointer-events-auto" 
            autoPlay={isPlaying}
            muted={isMuted}
          />
        ) : isVideo && mediaSrc ? (
          <FeedVideoPlayer
            id={reel?.id ? String(reel.id) : undefined}
            src={mediaSrc}
            poster={posterSrc || reel?.thumbnailUrl}
            className="w-full h-full object-contain bg-transparent relative z-10"
            audioSrc={reelMusic?.audioUrl}
            isReel={true}
            autoPlay={true}
            onDoubleTap={handleDoubleTap}
            defaultMuted={false}
            videoRefProp={videoRef}
            isMutedProp={isMuted}
            onMuteToggle={(muted) => setIsMuted(muted)}
          />
        ) : (
          <img 
            src={mediaSrc} 
            alt={reel?.title || 'Reel media'} 
            className="relative z-10 w-full h-full object-contain transition-all duration-300 m-auto bg-transparent"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Subtle bottom shadow overlay for readable captions */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

      {/* Right Side Vertical Action Column - Aligned right above the post info */}
      <div className="absolute right-2 sm:right-3 bottom-14 z-20 flex flex-col items-center gap-2.5 sm:gap-4">
        {/* Save Button - Moved to Top so it never gets cut off on mobile */}
        <button 
          onClick={handleSave}
          className="flex flex-col items-center gap-1 text-white group cursor-pointer"
          title="Save to Wall"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center transition-all group-active:scale-125">
            <Bookmark className={cn("w-5 h-5 sm:w-6 sm:h-6", isSaved && "fill-white")} />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold drop-shadow-md">{savedCount}</span>
        </button>

        {/* Like Button */}
        <button 
          onClick={handleLike}
          className="flex flex-col items-center gap-1 text-white group cursor-pointer"
        >
          <div className={cn(
            "w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all group-active:scale-125",
            isLiked ? "bg-red-500/30 text-red-500 border border-red-500/50" : "bg-black/40 hover:bg-black/60 text-white border border-white/15"
          )}>
            <Heart 
              className={cn("w-5 h-5 sm:w-6 sm:h-6 transition-transform", isLiked && "scale-110")} 
              fill={isLiked ? "#ef4444" : "none"} 
              stroke={isLiked ? "#ef4444" : "currentColor"}
            />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold drop-shadow-md">{likesCount > 999 ? (likesCount/1000).toFixed(1) + 'K' : likesCount}</span>
        </button>

        {/* Comment Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setShowCommentsDrawer(!showCommentsDrawer); }}
          className="flex flex-col items-center gap-1 text-white group cursor-pointer"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center transition-all group-active:scale-125">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold drop-shadow-md">{commentsCount}</span>
        </button>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="flex flex-col items-center gap-1 text-white group cursor-pointer"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center transition-all group-active:scale-125">
            <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold drop-shadow-md">{sharesCount}</span>
        </button>

        {/* Offer Token Button (Replacing old Save position) */}
        {!isVideo && (
          <>
            {/* Offer Token Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('open_offer_token_modal', { detail: { post: reel } }));
                toast.success('üéÅ Offer Token Generator opened with this post snapshot & QR code!');
              }}
              className="flex flex-col items-center gap-1 text-pink-400 group cursor-pointer"
              title="Generate Offer Token & Discount QR Pass"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center transition-all group-active:scale-125 shadow-lg shadow-blue-500/40 relative border-2 border-amber-300 transform group-hover:scale-110">
                <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black drop-shadow-md text-amber-300 uppercase tracking-tighter">Offer</span>
            </button>
            
            {/* Enquiry Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (currentUser?.role === 'customer' && currentUser?.membershipType === 'local') {
                  const targetCoords = reel?.user?.gpsCoords || reel?.gpsCoords;
                  if (userLocation && targetCoords) {
                    const dist = calculateDistance(userLocation.lat, userLocation.lng, targetCoords.lat, targetCoords.lng);
                    if (dist > 100) {
                      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: `üìç Distance Restriction: As a Local Member, you can only inquire with dealers within 100km. This business is ${Math.round(dist)}km away.` } }));
                      return;
                    }
                  }
                }
                playEnquirySound();
                if (reel.id) {
                  setEnquiriesCount(prev => prev + 1);
                  recordEnquiryInFirestore(reel.id, currentUser?.id || 'anonymous', currentUser?.name || 'A user').catch(()=>{});
                }
                if (onClose) onClose();
                navigate('/chat');
              }}
              className="flex flex-col items-center gap-1 text-emerald-400 group cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center transition-all group-active:scale-125">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold drop-shadow-md text-white">{enquiriesCount}</span>
            </button>
          </>
        )}

        {/* Animated Golden Round Boost Your Business Button with Speaker Icon */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent('open_boost_business_modal', { 
              detail: { post: reel, user: currentUser } 
            }));
          }}
          className="flex flex-col items-center gap-1 text-amber-400 group cursor-pointer"
          title="Boost Your Business & Reels across India"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center transition-all group-active:scale-125 shadow-lg shadow-amber-500/40 relative border-2 border-amber-300 transform group-hover:scale-110">
            <Megaphone className="w-4.5 h-4.5 sm:w-5 sm:h-5 animate-bounce text-slate-950" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-black drop-shadow-md text-amber-300 uppercase tracking-tighter">Boost</span>
        </button>

        {/* Options / More Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setShowOptionsModal(true); }}
          className="flex flex-col items-center gap-1 text-white group cursor-pointer"
          title="More options & Delete"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center transition-all group-active:scale-125">
            <MoreVertical className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Bottom Left Info: Profile Avatar, Name, Follow, Caption & Audio */}
      <div className="absolute left-3.5 bottom-12 right-18 z-20 text-white drop-shadow-lg flex flex-col gap-2">
        {/* User profile & Follow row */}
        <div className="flex items-center gap-2.5">
          <div 
            onClick={(e) => { e.stopPropagation(); if (onClose) onClose(); navigate(`/profile/${authorIdentifier}`); }}
            className={cn(
            "w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-105 transition-transform",
            isAuthorVerified ? "tiranga-border-circle" : "neon-border-circle"
          )}>
            <div className="w-full h-full bg-black rounded-full p-[1px] overflow-hidden">
              <img 
                src={authorAvatar || getInitialsAvatar(authorName)} 
                alt={authorName} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getInitialsAvatar(authorName);
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span 
              onClick={(e) => { e.stopPropagation(); if (onClose) onClose(); navigate(`/profile/${authorIdentifier}`); }}
              className="font-bold text-sm sm:text-base tracking-wide flex items-center gap-1 text-white cursor-pointer hover:underline"
            >
              {authorName}
              {(isAuthorVerified || shouldShowVerifiedBadge(reel?.user || reel?.authorInfo)) && <VerifiedBadge user={reel?.user || reel?.authorInfo} size="sm" />}
            
            {/* Interactive Star Reputation Badge in Reel Header */}
            {((reel?.user || reel?.authorInfo)?.role !== 'customer') && (
              <div className="rainbow-star-badge flex items-center gap-1 px-2 py-0.5 rounded-xl select-none shrink-0 ml-1.5 backdrop-blur-md transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const targetUser = reel?.user || reel?.authorInfo || {};
                    const currentAvg = Number(targetUser.ratingAverage || 0);
                    const isFilled = star <= Math.round(currentAvg);
                    const targetUserId = targetUser.id || reel.userId;
                    return (
                      <button
                        key={star}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!activeUserId) {
                            toast.error('üîê Please Login or Register to Rate users!');
                            window.dispatchEvent(new CustomEvent('openAuthModal'));
                            return;
                          }
                          if (String(targetUserId) === String(activeUserId)) {
                            toast.error("You cannot rate your own profile!");
                            return;
                          }
                          try {
                            const res = await fetch(`/api/users/${targetUserId}/rate`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ raterId: activeUserId, stars: star })
                            });
                            const resData = await res.json();
                            if (resData.success) {
                              toast.success(`‚≠ê Rated ${star} Stars!`);
                              
                              // Dispatch global event
                              window.dispatchEvent(new CustomEvent('ratingUpdated', { 
                                detail: { 
                                  userId: targetUserId, 
                                  ratingAverage: resData.ratingAverage, 
                                  ratingCount: resData.ratingCount 
                                } 
                              }));
                            } else {
                              toast.error(resData.error || "Failed to submit rating.");
                            }
                          } catch (err) {
                            toast.error("Failed to submit rating.");
                          }
                        }}
                        className={`p-0.5 transition-transform duration-200 hover:scale-125 focus:outline-none ${String(targetUserId) === String(activeUserId) ? 'cursor-default' : 'cursor-pointer'}`}
                        title={`Rate ${authorName} ${star} Stars`}
                      >
                        <Star
                          className={`w-2.5 h-2.5 ${getStarColorClass(star, isFilled, 'text-zinc-400')}`}
                          fill={isFilled ? 'currentColor' : 'none'}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-[10px] font-black text-amber-400">
                  {Number((reel?.user || reel?.authorInfo)?.ratingAverage || 0).toFixed(1)}
                  <span className="text-zinc-400 font-normal ml-0.5">({Number((reel?.user || reel?.authorInfo)?.ratingCount || 0)})</span>
                </span>
              </div>
            )}
            </span>
            {!isSelfAuthor && (
              <button 
                onClick={handleToggleFollow}
                className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer",
                  isFollowing 
                    ? "bg-white/20 text-white border-white/40" 
                    : "bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-md"
                )}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Item Shortage Alert Badge & Wholesale Price Range Badge for Reel */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {Boolean(reel?.isShortcut || reel?.stockStatus === 'out_of_stock') && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 border border-red-400 text-white text-xs font-black shadow-lg backdrop-blur-md w-fit animate-pulse">
              <span>‚ö†Ô∏è</span>
              <span className="tracking-tight uppercase">Item Shortage / ‡§∂‡•â‡§∞‡•ç‡§ü‡•á‡§ú</span>
            </div>
          )}

          {Boolean(reel?.minRate || reel?.maxRate) && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/35 via-yellow-500/25 to-amber-500/35 border border-amber-400/50 text-amber-300 text-xs font-black shadow-lg backdrop-blur-md w-fit">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Rate:</span>
              <span className="tracking-tight text-white font-extrabold text-xs sm:text-sm">
                {reel.minRate && reel.maxRate 
                  ? `‚Çπ${reel.minRate} - ‚Çπ${reel.maxRate}` 
                  : reel.minRate 
                    ? `‚Çπ${reel.minRate}+` 
                    : `Upto ‚Çπ${reel.maxRate}`}
              </span>
              <span className="text-[10px] font-medium text-amber-200/90 ml-0.5">
                /{reel.unit || 'Box'}
              </span>
            </div>
          )}
        </div>



        {/* Caption text with "... more" toggle */}
        <div className="text-xs sm:text-sm text-zinc-100 pr-2 leading-relaxed">
          {reel?.title && <div className="font-bold text-white mb-0.5">{reel.title}</div>}
          <p className={cn("transition-all", !showMore && "line-clamp-2")}>
            {reel?.content || 'Vyapar Bridge B2B Manufacturing and Vitrified Ceramics Collection.'}
          </p>
          {reel?.hashtags && (
            <p className="text-blue-300 font-semibold mt-1 text-xs">{reel.hashtags}</p>
          )}
          {reel?.content && reel.content.length > 50 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMore(!showMore); }}
              className="text-zinc-400 font-bold hover:text-white text-xs mt-0.5 cursor-pointer inline-block"
            >
              {showMore ? 'less' : '... more'}
            </button>
          )}
        </div>
      </div>

      {/* Comments Drawer / Sliding Panel */}
      {showCommentsDrawer && (
        <div className="absolute inset-x-0 bottom-0 top-1/3 bg-zinc-950/95 backdrop-blur-2xl rounded-t-2xl z-40 p-4 border-t border-zinc-800 flex flex-col justify-between shadow-2xl animate-in slide-in-from-bottom duration-700" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-2">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              Comments ({comments.length || commentsCount})
            </span>
            <button onClick={() => setShowCommentsDrawer(false)} className="text-zinc-400 hover:text-white p-1 cursor-pointer">
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 my-2 pr-1 scrollbar-thin">
            {comments.map((c, i) => (
              <div key={c.id || i} className="flex items-start gap-2.5 text-xs text-white">
                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[11px] text-zinc-300 shrink-0 overflow-hidden">
                  {(c.user?.avatarUrl || c.userAvatar) ? (
                    <img src={c.user?.avatarUrl || c.userAvatar} alt={c.user?.name || c.userName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    (c.user?.name || c.userName || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-zinc-200">{c.user?.name || c.userName || 'Vyapar Bridge Member'}</span>
                    {c.user?.role === 'customer' && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                        Customer Inquiry
                      </span>
                    )}
                  </div>
                  {(() => {
                    const { text: safeText, masked } = renderSafeCommentText(
                      c.content,
                      currentUser?.id === c.userId || currentUser?.role === 'admin'
                    );
                    return (
                      <>
                        {safeText && (
                          <p className="text-zinc-300 mt-0.5 leading-normal">{safeText}</p>
                        )}
                        {masked && (
                          <p className="text-[10px] text-amber-400 mt-1 bg-amber-500/10 p-1 rounded border border-amber-500/20 font-medium">
                            üîí Phone numbers in public comments are protected.
                          </p>
                        )}
                      </>
                    );
                  })()}
                  {(() => {
                    const img = c.commentImage || c.imageUrl || c.image || c.mediaUrl;
                    if (!img) return null;
                    return (
                      <div className="mt-1.5 rounded-lg overflow-hidden border border-zinc-700 max-w-[200px] group relative shadow-md">
                        <img 
                          src={img} 
                          alt="Attachment" 
                          className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-95 transition-all" 
                          onClick={() => setSelectedReelLightboxImage({
                            url: img,
                            user: c.user?.name || c.userName || 'Member',
                            avatar: c.user?.avatarUrl || c.userAvatar,
                            text: c.content
                          })} 
                        />
                        <div 
                          onClick={() => setSelectedReelLightboxImage({
                            url: img,
                            user: c.user?.name || c.userName || 'Member',
                            avatar: c.user?.avatarUrl || c.userAvatar,
                            text: c.content
                          })}
                          className="absolute bottom-1 right-1 bg-black/80 hover:bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-1"
                        >
                          <span>üîç Preview</span>
                        </div>
                      </div>
                    );
                  })()}
                  <button 
                    onClick={() => setCommentText('@' + (c.user?.name || c.userName || 'User').replace(/\s+/g, '') + ' ')} 
                    className="text-[10px] text-zinc-500 font-bold hover:text-zinc-300 mt-1 cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-xs">No comments yet. Be the first to comment!</div>
            )}
          </div>

          {reelCommentImagePreview && (
            <div className="relative w-20 h-20 mb-2 rounded-lg overflow-hidden border-2 border-blue-500 bg-black/40 group">
              <img 
                src={reelCommentImagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover cursor-pointer" 
                onClick={() => setSelectedReelLightboxImage({
                  url: reelCommentImagePreview,
                  user: currentUser?.name || 'You',
                  avatar: currentUser?.avatarUrl,
                  text: commentText
                })}
              />
              <button 
                onClick={() => setReelCommentImagePreview(null)}
                className="absolute top-1 right-1 bg-black/80 hover:bg-red-600 text-white rounded-full p-1 transition-colors cursor-pointer"
                title="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <form 
            onSubmit={handleAddComment} 
            onPaste={(e) => handleClipboardMediaPaste(e, (dataUrl) => {
              setReelCommentImagePreview(dataUrl);
            })}
            className="pt-2 border-t border-zinc-800 flex items-center gap-2 relative"
          >
            <input 
              type="file" 
              ref={reelCommentFileInputRef}
              className="hidden" 
              accept="image/*,.gif,image/gif"
              onChange={handleReelCommentImageChange}
            />
            <button 
              type="button" 
              onClick={() => reelCommentFileInputRef.current?.click()}
              className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
              title="Attach photo or GIF"
            >
              <Camera className="w-4 h-4" />
            </button>

            <button 
              type="button" 
              onClick={() => setIsReelGifModalOpen(true)}
              className="px-2 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/30 rounded-lg font-black text-[11px] transition-all cursor-pointer"
              title="Add animated GIF"
            >
              <span>GIF</span>
            </button>

            <input 
              type="text" 
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment or paste keyboard GIF..."
              enterKeyHint="send"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              onPaste={(e) => handleClipboardMediaPaste(e, (dataUrl) => {
                setReelCommentImagePreview(dataUrl);
              })}
            />
            <button 
              type="submit" 
              disabled={!commentText.trim() && !reelCommentImagePreview} 
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-lg disabled:opacity-40 cursor-pointer flex items-center gap-1 shadow-sm transition-all"
            >
              <Send className="w-3 h-3" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* Reel Comment Media Lightbox Modal */}
      <CommentMediaLightbox
        isOpen={Boolean(selectedReelLightboxImage)}
        onClose={() => setSelectedReelLightboxImage(null)}
        imageUrl={selectedReelLightboxImage?.url || ''}
        userName={selectedReelLightboxImage?.user}
        userAvatar={selectedReelLightboxImage?.avatar}
        commentText={selectedReelLightboxImage?.text}
      />

      {/* Reel GIF Picker Modal */}
      <GifPickerModal
        isOpen={isReelGifModalOpen}
        onClose={() => setIsReelGifModalOpen(false)}
        onSelectGif={(gifUrl) => {
          setReelCommentImagePreview(gifUrl);
          setIsReelGifModalOpen(false);
          toast.success('GIF attached! Send your comment.');
        }}
      />

      {/* Options Modal */}
      {showOptionsModal && (
        <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setShowOptionsModal(false)}>
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl text-white text-sm" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowOptionsModal(false); setShowRatingModal(true); }} className="w-full text-left px-4 py-3 hover:bg-zinc-800 border-b border-zinc-800 font-semibold text-amber-400 flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Rate Reel ({reelRating.toFixed(1)}‚òÖ)</span>
              </span>
              <span className="text-[11px] text-zinc-400">AI Boost</span>
            </button>
            <button onClick={() => { setShowOptionsModal(false); setShowStatsModal(true); }} className="w-full text-left px-4 py-3 hover:bg-zinc-800 border-b border-zinc-800 font-semibold text-blue-400 flex items-center gap-2 cursor-pointer">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <span>View Reel Insights</span>
            </button>
            <button onClick={() => { setFitMode(prev => prev === 'contain' ? 'cover' : 'contain'); setShowOptionsModal(false); }} className="w-full text-left px-4 py-3 hover:bg-zinc-800 border-b border-zinc-800 font-semibold flex items-center gap-2 cursor-pointer">
              <Eye className="w-4 h-4" />
              <span>Toggle Aspect Ratio ({fitMode === 'contain' ? 'Fill' : 'Original'})</span>
            </button>
            <button onClick={handleShare} className="w-full text-left px-4 py-3 hover:bg-zinc-800 border-b border-zinc-800 font-semibold cursor-pointer">
              Share Reel Link
            </button>
            <button onClick={(e) => { handleSave(e); setShowOptionsModal(false); }} className="w-full text-left px-4 py-3 hover:bg-zinc-800 border-b border-zinc-800 font-semibold cursor-pointer">
              {isSaved ? 'Remove from Saved' : 'Save Reel'}
            </button>
            <button onClick={handleNotInterested} className="w-full text-left px-4 py-3 hover:bg-zinc-800 border-b border-zinc-800 font-semibold text-amber-400 flex items-center gap-2 cursor-pointer">
              <EyeOff className="w-4 h-4 text-amber-400" />
              <span>Not Interested</span>
            </button>
            {isReelOwnerOrAdmin && (
              <>
                <button 
                  onClick={() => {
                    setShowOptionsModal(false);
                    setIsEditModalOpen(true);
                  }} 
                  className="w-full text-left px-4 py-3 hover:bg-zinc-800 border-b border-zinc-800 font-semibold text-blue-400 flex items-center gap-2 cursor-pointer"
                >
                  <Pencil className="w-4 h-4 text-blue-400" />
                  <span>Edit Reel & Rates / Shortage (‡§∂‡•â‡§∞‡•ç‡§ü‡•á‡§ú)</span>
                </button>
                <button onClick={(e) => handleDelete(e)} className="w-full text-left px-4 py-3 hover:bg-zinc-800 border-b border-zinc-800 font-semibold text-red-500 flex items-center gap-2 cursor-pointer">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Delete Reel</span>
                </button>
              </>
            )}
            <button onClick={() => setShowOptionsModal(false)} className="w-full text-center py-3 hover:bg-zinc-800 font-bold text-zinc-400 cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Reel Modal */}
      {isEditModalOpen && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={reel}
          onSave={(updated) => {
            Object.assign(reel, updated);
            setForceVersion(Date.now());
          }}
        />
      )}

      {showStatsModal && (
        <SinglePostStatsModal postId={reel.id} onClose={() => setShowStatsModal(false)} />
      )}

      {showRatingModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowRatingModal(false)}>
          <div className="bg-zinc-900 border border-amber-500/30 w-full max-w-sm rounded-2xl p-5 shadow-2xl text-white space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="font-bold text-sm text-amber-200">Rate Reel (AI Visibility Boost)</h3>
              </div>
              <button onClick={() => setShowRatingModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-zinc-300">
              ‡§Ü‡§™‡§ï‡•Ä ‡§∞‡•á‡§ü‡§ø‡§Ç‡§ó ‡§∏‡•Ä‡§ß‡•á ‡§π‡§Æ‡§æ‡§∞‡•á AI ‡§∞‡•à‡§Ç‡§ï‡§ø‡§Ç‡§ó ‡§è‡§≤‡•ç‡§ó‡•ã‡§∞‡§ø‡§¶‡§Æ ‡§ï‡•ã ‡§¨‡§¢‡§º‡§æ‡§µ‡§æ ‡§¶‡•á‡§§‡•Ä ‡§π‡•à‡•§ ‡§∏‡•ç‡§ü‡§æ‡§∞ ‡§∞‡•á‡§ü‡§ø‡§Ç‡§ó ‡§¶‡•á‡§®‡•á ‡§∏‡•á ‡§Ø‡§π ‡§∞‡•Ä‡§≤ ‡§∏‡§≠‡•Ä ‡§Ø‡•Ç‡§ú‡§º‡§∞‡•ç‡§∏ ‡§ï‡•á ‡§´‡§º‡•Ä‡§° ‡§Æ‡•á‡§Ç ‡§ä‡§™‡§∞ ‡§¶‡§ø‡§ñ‡•á‡§ó‡•Ä‡•§
            </p>

          </div>
        </div>
      )}</div>
  );
}

function FullScreenFeedViewerModal({
  posts,
  initialIndex = 0,
  currentUser,
  onClose,
  userLocation
}: {
  posts: any[];
  initialIndex?: number;
  currentUser?: any;
  onClose: () => void;
  userLocation?: {lat: number, lng: number} | null;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<number>(0);
  const isWheeling = React.useRef(false);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('vyapar_reel_viewing_active', { detail: { active: true } }));
    window.dispatchEvent(new CustomEvent('pause_all_feed_videos'));
    return () => {
      window.dispatchEvent(new CustomEvent('vyapar_reel_viewing_active', { detail: { active: false } }));
    };
  }, []);

  const goToNext = () => {
    if (currentIndex < posts.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Automated Stories Progression Timer
  useEffect(() => {
    setProgressPercent(0);
    const postItem = posts[currentIndex];
    if (!postItem) return;

    const isVideo = postItem.type === 'video' || (postItem.mediaUrl && (postItem.mediaUrl.includes('indexeddb:') || postItem.mediaUrl.includes('youtube.com') || postItem.mediaUrl.includes('youtu.be') || /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(postItem.mediaUrl)));

    let timer: any;
    let videoEl: HTMLVideoElement | null = null;
    let onEnded: (() => void) | null = null;
    let onTimeUpdate: (() => void) | null = null;

    if (isVideo) {
      let attempts = 0;
      const locateVideo = () => {
        videoEl = document.querySelector('video');
        if (videoEl) {
          videoEl.loop = false; // Disable video looping for automated transition
          
          onEnded = () => {
            goToNext();
          };
          onTimeUpdate = () => {
            if (videoEl && videoEl.duration) {
              const pct = (videoEl.currentTime / videoEl.duration) * 100;
              setProgressPercent(pct);
            }
          };

          videoEl.addEventListener('ended', onEnded);
          videoEl.addEventListener('timeupdate', onTimeUpdate);
        } else if (attempts < 15) {
          attempts++;
          timer = setTimeout(locateVideo, 150);
        }
      };
      locateVideo();
    } else {
      const duration = 5000; // 5 seconds for static media
      const startTime = Date.now();
      timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min((elapsed / duration) * 100, 100);
        setProgressPercent(pct);
        if (elapsed >= duration) {
          clearInterval(timer);
          goToNext();
        }
      }, 30);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (timer) clearTimeout(timer);
      if (videoEl) {
        if (onEnded) videoEl.removeEventListener('ended', onEnded);
        if (onTimeUpdate) videoEl.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
  }, [currentIndex]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J' || e.key === 'PageDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K' || e.key === 'PageUp') {
        goToPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, posts.length]);

  // Smooth mouse wheel trackpad navigation
  const handleWheel = (e: React.WheelEvent) => {
    if (isWheeling.current || posts.length <= 1) return;
    if (Math.abs(e.deltaY) > 25) {
      isWheeling.current = true;
      if (e.deltaY > 0) {
        goToNext();
      } else {
        goToPrev();
      }
      setTimeout(() => {
        isWheeling.current = false;
      }, 400);
    }
  };

  if (!posts || posts.length === 0 || currentIndex < 0 || currentIndex >= posts.length) {
    return null;
  }

  const currentPost = posts[currentIndex];
  if (!currentPost) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center backdrop-blur-xl overflow-hidden select-none"
      onWheel={handleWheel}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Top Header Overlay - Clean Close Button Only */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-6 z-50 pointer-events-auto">
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-black/60 hover:bg-black/80 rounded-full text-white flex items-center justify-center backdrop-blur-md border border-white/25 transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xl"
          title="Close Full Screen"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Center Reel/Post Display with YouTube Shorts / Instagram Smooth Swipe Physics */}
      <div onClick={e => e.stopPropagation()} className="relative z-10 w-full sm:max-w-[420px] h-full sm:h-[calc(100dvh-32px)] sm:max-h-[850px] aspect-auto sm:aspect-[9/16] flex items-center justify-center overflow-hidden sm:rounded-2xl border-0 sm:border border-zinc-800 shadow-2xl my-auto bg-black">
        
        {/* PROGRESS BARS (WhatsApp/Instagram style segmented bars) */}
        <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-4 z-40 flex items-center gap-1">
          {posts.map((postItem, idx) => {
            let widthPct = 0;
            if (idx < currentIndex) widthPct = 100;
            else if (idx === currentIndex) widthPct = progressPercent;
            
            return (
              <button
                key={postItem.id || idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className="flex-1 h-1.5 -my-2 py-2 cursor-pointer outline-none group"
                title={`Go to story ${idx + 1}`}
              >
                <div className="h-1 rounded-full bg-white/20 overflow-hidden backdrop-blur-xs">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-75"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* TAP TARGETS (Left 25% for Back, Right 75% for Forward) */}
        <div className="absolute inset-x-0 top-10 bottom-16 z-30 flex">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="w-1/4 h-full cursor-pointer pointer-events-auto"
            title="Previous Story"
          />
          <div 
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="w-3/4 h-full cursor-pointer pointer-events-auto"
            title="Next Story"
          />
        </div>

        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={currentPost?.id || currentIndex}
            custom={direction}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.25}
            onDragEnd={(_e, info) => {
              const offset = info.offset.y;
              const velocity = info.velocity.y;
              if (offset < -120 || velocity < -500) {
                goToNext();
              } else if (offset > 120 || velocity > 500) {
                goToPrev();
              }
            }}
            initial={(dir: number) => ({
              y: dir > 0 ? '100%' : dir < 0 ? '-100%' : 0,
              scale: 0.88,
              rotateX: dir > 0 ? 12 : dir < 0 ? -12 : 0,
              opacity: 0.8
            })}
            animate={{
              y: 0,
              scale: 1,
              rotateX: 0,
              opacity: 1,
              transition: {
                y: { type: 'spring', stiffness: 380, damping: 30 },
                scale: { duration: 0.22, ease: 'easeOut' },
                rotateX: { duration: 0.22, ease: 'easeOut' },
                opacity: { duration: 0.18 }
              }
            }}
            exit={(dir: number) => ({
              y: dir > 0 ? '-100%' : '100%',
              scale: 0.88,
              rotateX: dir > 0 ? -12 : 12,
              opacity: 0.8,
              transition: {
                y: { type: 'spring', stiffness: 380, damping: 30 },
                scale: { duration: 0.22 },
                opacity: { duration: 0.18 }
              }
            })}
            className="w-full h-full flex items-center justify-center relative overflow-hidden touch-pan-y"
          >
            <ReelCard 
              reel={currentPost} 
              currentUser={currentUser} 
              onClose={onClose} 
              userLocation={userLocation}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function EditPostModal({ isOpen, onClose, post, onSave }: { isOpen: boolean, onClose: () => void, post: any, onSave: (p: any) => void }) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [hashtags, setHashtags] = useState(post?.hashtags || '');
  const [minRate, setMinRate] = useState(post?.minRate || '');
  const [maxRate, setMaxRate] = useState(post?.maxRate || '');
  const [unit, setUnit] = useState(post?.unit || 'Box');
  const [isShortcut, setIsShortcut] = useState(Boolean(post?.isShortcut || post?.stockStatus === 'out_of_stock'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && post) {
      setTitle(post?.title || '');
      setContent(post?.content || '');
      setHashtags(post?.hashtags || '');
      setMinRate(post?.minRate || '');
      setMaxRate(post?.maxRate || '');
      setUnit(post?.unit || 'Box');
      setIsShortcut(Boolean(post?.isShortcut || post?.stockStatus === 'out_of_stock'));
    }
  }, [isOpen, post]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const stockStatus = isShortcut ? 'out_of_stock' : 'in_stock';
      const payload = {
        title,
        content,
        hashtags,
        minRate: minRate ? String(minRate).trim() : '',
        maxRate: maxRate ? String(maxRate).trim() : '',
        unit: unit || 'Box',
        isShortcut,
        stockStatus
      };

      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      const updatedPost = {
        ...post,
        ...payload,
        ...(data?.post || {})
      };

      // 1. Sync updated post to Firestore cloud database
      await syncPostToFirestore(updatedPost).catch(err => console.warn('Firestore post update note:', err));

      // 2. Broadcast updates across the applet
      window.dispatchEvent(new CustomEvent('postUpdated', { detail: updatedPost }));
      window.dispatchEvent(new CustomEvent('reelUpdated', { detail: updatedPost }));

      onSave(updatedPost);
      toast.success(isShortcut ? '‚ö†Ô∏è Post updated: Marked as Item Shortage (‡§∂‡•â‡§∞‡•ç‡§ü‡•á‡§ú)' : '‚úÖ Post & pricing details updated successfully!');
      onClose();
    } catch (e) {
      toast.error('Network error updating post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl my-auto text-black dark:text-zinc-100 max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-black dark:text-zinc-50">Edit Post & Wholesale Rates</h3>
              <p className="text-[11px] text-black/60 dark:text-zinc-400">Update pricing range, stock shortage status & description</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer">
            <XCircle className="w-6 h-6 text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col gap-3.5 overflow-y-auto">
          {/* Stock Status / Item Shortage Toggle (‡§∏‡•ç‡§ü‡•â‡§ï ‡§∏‡•ç‡§•‡§ø‡§§‡§ø) */}
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <span>üì¶ Stock Availability (‡§∏‡•ç‡§ü‡•â‡§ï ‡§∏‡•ç‡§•‡§ø‡§§‡§ø / ‡§∂‡•â‡§∞‡•ç‡§ü‡•á‡§ú)</span>
              </label>
              <span className={cn(
                "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                isShortcut 
                  ? "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40 animate-pulse" 
                  : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
              )}>
                {isShortcut ? "Item Shortage / ‡§∂‡•â‡§∞‡•ç‡§ü‡•á‡§ú" : "In Stock / ‡§â‡§™‡§≤‡§¨‡•ç‡§ß"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsShortcut(false)}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  !isShortcut
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white dark:bg-zinc-800 text-black/70 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500"
                )}
              >
                <span>üü¢ In Stock (‡§â‡§™‡§≤‡§¨‡•ç‡§ß ‡§π‡•à)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShortcut(true)}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  isShortcut
                    ? "bg-red-600 text-white border-red-600 shadow-sm"
                    : "bg-white dark:bg-zinc-800 text-black/70 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-red-500"
                )}
              >
                <span>‚ö†Ô∏è Item Shortage (‡§∂‡•â‡§∞‡•ç‡§ü‡•á‡§ú)</span>
              </button>
            </div>
            <p className="text-[10px] text-black/60 dark:text-zinc-400">
              ‡§Ö‡§ó‡§∞ ‡§´‡•à‡§ï‡•ç‡§ü‡•ç‡§∞‡•Ä ‡§Æ‡•á‡§Ç ‡§Ø‡§π ‡§Æ‡§æ‡§≤ ‡§ñ‡§§‡•ç‡§Æ ‡§π‡•ã ‡§ó‡§Ø‡§æ ‡§π‡•à ‡§Ø‡§æ ‡§∂‡•â‡§∞‡•ç‡§ü‡•á‡§ú ‡§π‡•à, ‡§§‡•ã ‡§á‡§∏‡•á <strong>Item Shortage</strong> ‡§Æ‡§æ‡§∞‡•ç‡§ï ‡§ï‡§∞‡•á‡§Ç‡•§ ‡§ó‡•ç‡§∞‡§æ‡§π‡§ï‡•ã‡§Ç ‡§ï‡•ã ‡§§‡•Å‡§∞‡§Ç‡§§ ‡§Ö‡§≤‡§∞‡•ç‡§ü ‡§¶‡§ø‡§ñ‡•á‡§ó‡§æ‡•§
            </p>
          </div>

          {/* Dynamic Price Range Fields */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-black/80 dark:text-zinc-300 flex items-center gap-1.5">
                <span className="text-amber-500 font-black">‚Çπ</span>
                <span>Wholesale Price Range (‡§ï‡•Ä‡§Æ‡§§ ‡§¶‡§æ‡§Ø‡§∞‡§æ)</span>
              </label>
              <span className="text-[10px] font-bold text-black/50 dark:text-zinc-500">Optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-black/70 dark:text-zinc-400 mb-1">
                  Min Rate (‚Çπ)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-black/40 dark:text-zinc-500">‚Çπ</span>
                  <input
                    type="number"
                    value={minRate}
                    onChange={e => setMinRate(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg pl-7 pr-2 py-2 text-xs font-bold text-black dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-black/70 dark:text-zinc-400 mb-1">
                  Max Rate (‚Çπ)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-black/40 dark:text-zinc-500">‚Çπ</span>
                  <input
                    type="number"
                    value={maxRate}
                    onChange={e => setMaxRate(e.target.value)}
                    placeholder="e.g. 240"
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg pl-7 pr-2 py-2 text-xs font-bold text-black dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-black/70 dark:text-zinc-400 mb-1">
                  Unit (‡§á‡§ï‡§æ‡§à)
                </label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-2 text-xs font-bold text-black dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Box">Per Box (‡§™‡•ç‡§∞‡§§‡§ø ‡§¨‡•â‡§ï‡•ç‡§∏)</option>
                  <option value="Sq.Ft">Per Sq.Ft (‡§™‡•ç‡§∞‡§§‡§ø ‡§µ‡§∞‡•ç‡§ó ‡§´‡•Å‡§ü)</option>
                  <option value="Sq.Mtr">Per Sq.Mtr (‡§™‡•ç‡§∞‡§§‡§ø ‡§µ‡§∞‡•ç‡§ó ‡§Æ‡•Ä‡§ü‡§∞)</option>
                  <option value="Piece">Per Piece (‡§™‡•ç‡§∞‡§§‡§ø ‡§™‡•Ä‡§∏)</option>
                  <option value="Ton">Per Ton (‡§™‡•ç‡§∞‡§§‡§ø ‡§ü‡§®)</option>
                  <option value="Kg">Per Kg (‡§™‡•ç‡§∞‡§§‡§ø ‡§ï‡§ø‡§ó‡•ç‡§∞‡§æ)</option>
                  <option value="Bag">Per Bag (‡§™‡•ç‡§∞‡§§‡§ø ‡§¨‡•à‡§ó)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black/80 dark:text-zinc-300 mb-1">Title (‡§∂‡•Ä‡§∞‡•ç‡§∑‡§ï)</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-black dark:text-zinc-100 focus:outline-none focus:border-blue-500"
              placeholder="e.g. 600x1200mm Vitrified Tiles Wholesale"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black/80 dark:text-zinc-300 mb-1">Caption / Description</label>
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-black dark:text-zinc-100 focus:outline-none focus:border-blue-500 resize-none h-20"
              placeholder="Write product specifications or details..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black/80 dark:text-zinc-300 mb-1">Hashtags</label>
            <input 
              type="text" 
              value={hashtags} 
              onChange={e => setHashtags(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-black dark:text-zinc-100 focus:outline-none focus:border-blue-500"
              placeholder="#tiles #morbi #ceramics #wholesale"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-black/70 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save & Update Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ShareModal({ isOpen, onClose, data, type }: { isOpen: boolean, onClose: () => void, data: any, type: string }) {
  if (!isOpen) return null;

  const shareText = `Check out this ${type} by ${data.user?.name || data.authorName || 'someone'} on Vyapar Bridge!\n\n"${data.content || 'Awesome content'}"`;
  const shareUrl = `${window.location.origin}/${type}/${data.id || Date.now()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    toast.success('Link copied to clipboard!');
    onClose();
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    onClose();
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
    onClose();
  };
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vyapar Bridge - ${data.user?.name || data.authorName || ''}`,
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch (err) {
        console.error(err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="font-semibold text-lg">Share</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <XCircle className="w-6 h-6 text-black/70" />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <button onClick={handleNativeShare} className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            </div>
            <span className="font-semibold">Share via...</span>
          </button>
          
          <button onClick={handleWhatsApp} className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </div>
            <span className="font-semibold">WhatsApp</span>
          </button>
          
          <button onClick={handleFacebook} className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </div>
            <span className="font-semibold">Facebook</span>
          </button>
          
          <button onClick={handleCopy} className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors mt-2 border-t border-slate-200 dark:border-zinc-700">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-black dark:text-slate-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
            <span className="font-semibold">Copy Link</span>
          </button>
        </div>
      </div></div>
  );
}



function ReelCircleMedia({
  user,
  reel,
  altName
}: {
  user?: any;
  reel?: any;
  uploadingMediaThumbnail?: string | null;
  altName?: string;
}) {
  const [imgError, setImgError] = useState(false);

  const avatar = user?.avatarUrl || user?.avatar || (typeof localStorage !== 'undefined' ? localStorage.getItem('vyapar_user_avatar') : null) || reel?.user?.avatarUrl || reel?.user?.avatar || reel?.userAvatar || reel?.avatar;

  // Custom user profile image if available and valid
  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={altName || user?.name || 'User profile'}
        className="w-full h-full object-cover rounded-full"
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback directly to Vyapar Bridge official logo in full fill round shape
  return (
    <img
      src="/icon.png"
      alt="Vyapar Bridge"
      onError={(e) => {
        e.currentTarget.src = BRAND_LOGO_SRC;
      }}
      className="w-full h-full object-cover rounded-full"
    />
  );
}

export function formatPostTimeAgo(createdAt: number | string | Date | undefined): string {
  if (!createdAt) return 'Just now';
  let ts = typeof createdAt === 'number' ? createdAt : new Date(createdAt).getTime();
  if (isNaN(ts) || ts <= 0) return 'Just now';
  
  const diffMs = Date.now() - ts;
  if (diffMs < 0) return 'Just now';
  
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}


function FeedImageWithAudio({
  src,
  audioSrc
}: {
  src: string;
  audioSrc: string;
}) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => isGlobalVideoMuted());

  useEffect(() => {
    const handleMuteChange = (e: any) => {
      const newMuted = !!e.detail?.muted;
      setIsMuted(newMuted);
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
        if (!newMuted) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      }
    };
    window.addEventListener('vyapar_global_mute_change', handleMuteChange);
    return () => window.removeEventListener('vyapar_global_mute_change', handleMuteChange);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const inView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        if (!inView) {
          if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
          }
        } else {
          if (audioRef.current && !isGlobalVideoMuted()) {
            audioRef.current.muted = false;
            audioRef.current.play().catch(() => {});
          }
        }
      });
    }, { threshold: [0.0, 0.2, 0.35, 0.6, 0.8] });
    
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setGlobalVideoMuted(newMuted);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <img 
        src={src} 
        alt="Post media" 
        className="w-full h-full max-h-[80vh] object-contain bg-black pointer-events-none" 
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <audio ref={audioRef} src={audioSrc} loop preload="metadata" muted={isMuted} />
      <button
        onClick={toggleMute}
        className="absolute bottom-3 right-3 z-20 p-2.5 rounded-full bg-black/65 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 transition-transform active:scale-95 shadow-xl cursor-pointer"
        title={isMuted ? "Unmute Music" : "Mute Music"}
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
      </button>
    </div>
  );
}

function FeedVideoPlayer({
  src,
  poster,
  className,
  audioSrc,
  isReel = false,
  aspectRatio,
  autoPlay = false,
  onDoubleTap,
  defaultMuted,
  id,
  videoRefProp,
  isMutedProp,
  onMuteToggle
}: {
  src: string;
  poster?: string;
  className?: string;
  audioSrc?: string;
  isReel?: boolean;
  aspectRatio?: string;
  autoPlay?: boolean;
  onDoubleTap?: () => void;
  defaultMuted?: boolean;
  id?: string;
  videoRefProp?: React.RefObject<HTMLVideoElement>;
  isMutedProp?: boolean;
  onMuteToggle?: (muted: boolean) => void;
}) {
  if (isYouTubeUrl(src)) {
    return (
      <UniversalYouTubePlayer 
        url={src} 
        isReel={isReel} 
        aspectRatio={aspectRatio || (isReel ? '9:16' : undefined)} 
        className={className} 
        autoPlay={autoPlay}
        muted={isMuted}
      />
    );
  }
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const videoRef = videoRefProp || localVideoRef;
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [localMuted, setLocalMuted] = useState(() => defaultMuted !== undefined ? defaultMuted : isGlobalVideoMuted());
  const isMuted = isMutedProp !== undefined ? isMutedProp : localMuted;
  
  const updateMuteState = (muted: boolean) => {
    if (onMuteToggle) {
      onMuteToggle(muted);
    } else {
      setLocalMuted(muted);
    }
  };

  useEffect(() => {
    const handleMuteChange = (e: any) => {
      const newMuted = !!e.detail?.muted;
      setLocalMuted(newMuted);
      const v = getVideoElement();
      if (v) v.muted = newMuted;
      if (audioRef.current) audioRef.current.muted = newMuted;
    };
    window.addEventListener('vyapar_global_mute_change', handleMuteChange);
    return () => window.removeEventListener('vyapar_global_mute_change', handleMuteChange);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [playAnimation, setPlayAnimation] = useState<'play' | 'pause' | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isReelActive, setIsReelActive] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPercent, setScrubPercent] = useState(0);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const [detectedAspectRatio, setDetectedAspectRatio] = useState<string | null>(() => aspectRatio || (isReel ? '9:16' : null));
  
  const isIntersectingRef = React.useRef(false);
  const isDraggingRef = React.useRef(false);
  const isPausedByUserRef = React.useRef(false);
  const lastTapTimeRef = React.useRef(0);
  const clickTimeoutRef = React.useRef<any>(null);
  const currentSrcRef = React.useRef<string>('');

  const BACKUP_VIDEO_SOURCES = [
    'https://vjs.zencdn.net/v/oceans.mp4',
    'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    'https://www.w3schools.com/html/mov_bbb.mp4'
  ];

  // Synchronously compute initial resolved URL from memory/cache/direct URL
  const getInitialResolvedSrc = (s: string, reelId?: string) => {
    if (!s) return '';
    const lookupKey = reelId || (s.startsWith('indexeddb:') ? s.replace('indexeddb:', '') : '');
    if (lookupKey) {
      const memCached = getCachedVideoUrlInMemory(lookupKey);
      if (memCached && !memCached.startsWith('data:image') && !memCached.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i) && (memCached.startsWith('blob:') || memCached.startsWith('data:video') || memCached.startsWith('http') || memCached.startsWith('/uploads/'))) {
        return memCached;
      }
      const localCached = localStorage.getItem('vyapar_video_' + lookupKey);
      if (localCached && !localCached.startsWith('data:image') && !localCached.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i) && (localCached.startsWith('blob:') || localCached.startsWith('data:video') || localCached.startsWith('http') || localCached.startsWith('/uploads/'))) {
        return localCached;
      }
    }
    if ((s.startsWith('data:video') || s.startsWith('blob:') || s.startsWith('http') || s.startsWith('/uploads/')) && !s.startsWith('data:image') && !s.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i)) {
      return s;
    }
    return '';
  };

  const [resolvedVideoSrc, setResolvedVideoSrc] = useState<string>(() => getInitialResolvedSrc(src, id));

  // Async source resolution from IndexedDB or remote storage
  const resolveSourceAsync = React.useCallback(async (targetSrc: string, targetId?: string) => {
    const lookupKey = targetId || (targetSrc && targetSrc.startsWith('indexeddb:') ? targetSrc.replace('indexeddb:', '') : '');

    if (lookupKey) {
      const memCache = getCachedVideoUrlInMemory(lookupKey);
      if (memCache && !memCache.startsWith('data:image') && !memCache.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i) && (memCache.startsWith('blob:') || memCache.startsWith('data:video') || memCache.startsWith('http') || memCache.startsWith('/uploads/'))) {
        return memCache;
      }
      const localCache = localStorage.getItem('vyapar_video_' + lookupKey);
      if (localCache && !localCache.startsWith('data:image') && !localCache.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i) && (localCache.startsWith('blob:') || localCache.startsWith('data:video') || localCache.startsWith('http') || localCache.startsWith('/uploads/'))) {
        return localCache;
      }
      try {
        const blobUrl = await getVideoBlobUrl(lookupKey);
        if (blobUrl && !blobUrl.startsWith('data:image') && !blobUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) {
          cacheVideoUrlInMemory(lookupKey, blobUrl);
          return blobUrl;
        }
      } catch (e) {}
    }

    if (targetSrc && !targetSrc.startsWith('indexeddb:') && !targetSrc.startsWith('data:image') && !targetSrc.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i)) {
      if (targetSrc.startsWith('data:video')) {
        try {
          const res = await fetch(targetSrc);
          const blob = await res.blob();
          return URL.createObjectURL(blob);
        } catch (e) {
          return targetSrc;
        }
      }
      return targetSrc;
    }

    return '';
  }, []);

  // Update source safely without resetting playing video if source hasn't changed
  useEffect(() => {
    let active = true;
    resolveSourceAsync(src, id).then(found => {
      if (active && found && found !== currentSrcRef.current) {
        currentSrcRef.current = found;
        setResolvedVideoSrc(found);
      }
    });
    return () => { active = false; };
  }, [src, id, resolveSourceAsync]);

  const getVideoElement = (): HTMLVideoElement | null => {
    return videoRef.current || containerRef.current?.querySelector('video') || null;
  };

  // Safe playback trigger
  const attemptPlay = React.useCallback(() => {
    if (isPausedByUserRef.current) return;
    if (!isReel && isReelActive) return;
    
    // Broadcast global event to pause other videos
    window.dispatchEvent(new CustomEvent('globalVideoPlay', { detail: { id: id || src } }));
    
    const video = getVideoElement();
    if (video) {
      const currentMuted = isGlobalVideoMuted();
      video.muted = currentMuted;
      if (audioRef.current) audioRef.current.muted = currentMuted;

      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setHasStartedPlaying(true);
              setIsVideoReady(true);
              if (audioRef.current && !currentMuted) {
                audioRef.current.play().catch(() => {});
              }
            })
            .catch(() => {
              // Browser autoplay policy: retry muted if unmuted was blocked by browser
              if (!video.muted) {
                video.muted = true;
                video.play()
                  .then(() => {
                    setIsPlaying(true);
                    setHasStartedPlaying(true);
                    setIsVideoReady(true);
                  })
                  .catch(() => {
                    setIsPlaying(false);
                  });
              } else {
                setIsPlaying(false);
              }
            });
        }
      } catch (e) {
        setIsPlaying(false);
      }
    }
  }, [id, src, isReel, isReelActive]);

  const attemptPause = React.useCallback(() => {
    const video = getVideoElement();
    if (video) {
      try { video.pause(); } catch(e) {}
    }
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch(e) {}
    }
    setIsPlaying(false);
  }, []);

  // Listen for global play events to ensure only one video plays at a time
  useEffect(() => {
    const handleGlobalPlay = (e: any) => {
      const playingId = e.detail?.id;
      if (playingId && playingId !== (id || src)) {
        attemptPause();
      }
    };
    window.addEventListener('globalVideoPlay', handleGlobalPlay);
    return () => window.removeEventListener('globalVideoPlay', handleGlobalPlay);
  }, [id, src, attemptPause]);

  // Reel view active events
  useEffect(() => {
    const handleReelEvent = (e: any) => {
      const active = Boolean(e?.detail?.active);
      setIsReelActive(active);
      if (!isReel) {
        if (active) {
          attemptPause();
        } else if (isIntersectingRef.current && !isPausedByUserRef.current) {
          if (autoPlay || (hasStartedPlaying && !isPausedByUserRef.current)) {
            attemptPlay();
          }
        }
      }
    };

    const handlePauseAll = () => {
      attemptPause();
    };

    window.addEventListener('vyapar_reel_viewing_active', handleReelEvent);
    window.addEventListener('pause_all_feed_videos', handlePauseAll);

    return () => {
      window.removeEventListener('vyapar_reel_viewing_active', handleReelEvent);
      window.removeEventListener('pause_all_feed_videos', handlePauseAll);
    };
  }, [isReel, attemptPlay, attemptPause, autoPlay, hasStartedPlaying]);

  // IntersectionObserver for Feed & Profile scrolling autoplay
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
          isIntersectingRef.current = inView;

          if (inView) {
            if (autoPlay || (hasStartedPlaying && !isPausedByUserRef.current)) {
              if (isReel || !isReelActive) {
                attemptPlay();
              }
            }
          } else {
            attemptPause();
          }
        });
      },
      { threshold: [0.0, 0.2, 0.35, 0.6, 0.8] }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [src, isReelActive, isReel, attemptPlay, attemptPause, autoPlay, hasStartedPlaying]);

  // Initial load / autoplay
  useEffect(() => {
    if (resolvedVideoSrc && (isReel || autoPlay)) {
      attemptPlay();
    }
  }, [resolvedVideoSrc, isReel, autoPlay, attemptPlay]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isDraggingRef.current) return;
    const video = getVideoElement();
    if (!video) return;

    if (isPlaying || !video.paused) {
      isPausedByUserRef.current = true;
      attemptPause();
      setPlayAnimation('pause');
      setTimeout(() => setPlayAnimation(null), 600);
    } else {
      isPausedByUserRef.current = false;
      attemptPlay();
      setPlayAnimation('play');
      setTimeout(() => setPlayAnimation(null), 600);
    }
  };

  const handlePlayerTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraggingRef.current) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;

    if (timeSinceLastTap > 0 && timeSinceLastTap < 300 && onDoubleTap) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      lastTapTimeRef.current = 0;
      onDoubleTap();
    } else {
      lastTapTimeRef.current = now;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => {
        togglePlay(e);
        lastTapTimeRef.current = 0;
      }, 250);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = getVideoElement();
    if (!video) return;
    const newMuted = !isMuted;
    setGlobalVideoMuted(newMuted);
    updateMuteState(newMuted);
    video.muted = newMuted;
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
      if (!newMuted && (isPlaying || !video.paused)) {
        try {
          audioRef.current.currentTime = video.currentTime || 0;
          audioRef.current.play().catch(() => {});
        } catch (e) {}
      }
    }
    if (video.paused && !newMuted) {
      isPausedByUserRef.current = false;
      attemptPlay();
    }
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {});
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (isDraggingRef.current) return;
    const video = getVideoElement();
    if (video && video.duration) {
      const dur = video.duration;
      const cur = video.currentTime;
      setDuration(dur);
      setCurrentTime(cur);
      setProgress((cur / dur) * 100);
      if (!isVideoReady && cur > 0) {
        setIsVideoReady(true);
      }
      if (audioRef.current && !audioRef.current.paused && Math.abs(audioRef.current.currentTime - cur) > 0.35) {
        try {
          audioRef.current.currentTime = cur;
        } catch (e) {}
      }
    }
  };

  const handleLoadedMetadata = () => {
    const video = getVideoElement();
    if (video && video.duration) {
      setDuration(video.duration);
      setIsVideoReady(true);
      if (video.videoWidth && video.videoHeight) {
        const r = video.videoWidth / video.videoHeight;
        if (r < 0.75) setDetectedAspectRatio('9:16');
        else if (r <= 0.9) setDetectedAspectRatio('4:5');
        else if (r <= 1.15) setDetectedAspectRatio('1:1');
        else if (r <= 1.45) setDetectedAspectRatio('4:3');
        else setDetectedAspectRatio('16:9');
      }
    }
  };

  // Helper to format time (e.g., 0:24)
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate seek percentage from a clientX coordinate
  const calculatePercentFromX = (clientX: number) => {
    const bar = progressBarRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const pos = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(100, pos * 100));
  };

  // Apply new time directly to video element and audio track
  const applySeekPercent = (pct: number) => {
    const video = getVideoElement();
    if (!video) return;
    const dur = video.duration || duration || 0;
    if (dur > 0) {
      const targetTime = (pct / 100) * dur;
      video.currentTime = targetTime;
      if (audioRef.current) {
        audioRef.current.currentTime = targetTime;
      }
      setCurrentTime(targetTime);
      setProgress(pct);
    }
  };

  // Mouse & Touch Scrubbing Handlers
  const handleScrubberStart = (clientX: number) => {
    isDraggingRef.current = true;
    setIsScrubbing(true);
    const pct = calculatePercentFromX(clientX);
    setScrubPercent(pct);
    applySeekPercent(pct);

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const movedPct = calculatePercentFromX(x);
      setScrubPercent(movedPct);
      applySeekPercent(movedPct);
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      setIsScrubbing(false);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('touchcancel', onPointerUp);
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchcancel', onPointerUp);
  };

  const displayProgress = isScrubbing ? scrubPercent : progress;
  const currentPreviewTime = isScrubbing 
    ? (scrubPercent / 100) * (duration || 1)
    : hoverPercent !== null 
      ? (hoverPercent / 100) * (duration || 1) 
      : currentTime;

  const resolvedPosterUrl = poster || 'https://images.unsplash.com/photo-1615719413546-198b25453f85?auto=format&fit=crop&w=800&q=80';

    const activeRatio = detectedAspectRatio || (isReel ? '9:16' : '16:9');
    const getFeedPlayerClasses = () => {
    return 'w-full mx-auto rounded-xl overflow-hidden shadow-md bg-black';
  };

  const getFeedPlayerStyle = (): React.CSSProperties => {
    switch (activeRatio) {
      case '9:16':
        return { aspectRatio: '9/16', maxHeight: '85vh', maxWidth: 'min(100%, calc(85vh * 9 / 16), 460px)' };
      case '4:5':
        return { aspectRatio: '4/5', maxHeight: '85vh', maxWidth: 'min(100%, calc(85vh * 4 / 5), 540px)' };
      case '1:1':
        return { aspectRatio: '1/1', maxHeight: '82vh', maxWidth: 'min(100%, calc(82vh * 1 / 1), 600px)' };
      case '4:3':
        return { aspectRatio: '4/3', maxHeight: '82vh', maxWidth: 'min(100%, calc(82vh * 4 / 3), 680px)' };
      case '16:9':
      default:
        return { aspectRatio: '16/9', maxHeight: '82vh', maxWidth: 'min(100%, calc(82vh * 16 / 9), 800px)' };
    }
  };
  return (
    <div 
      ref={containerRef} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative ${getFeedPlayerClasses()} flex items-center justify-center group overflow-hidden select-none`}
      style={getFeedPlayerStyle()}
    >
      {/* Background Poster ALWAYS rendered as a pristine foundation layer to prevent black screen */}
      <img
        src={resolvedPosterUrl}
        alt="Video preview poster"
        className={`absolute inset-0 w-full h-full pointer-events-none z-0 filter brightness-95 transition-opacity duration-300 ${isReel ? 'object-cover' : 'object-contain'} ${isVideoReady && isPlaying ? 'opacity-0' : 'opacity-100'}`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* HTML5 High-Performance Video Element */}
      <video
        ref={videoRef}
        src={resolvedVideoSrc || undefined}
        poster={resolvedPosterUrl}
        playsInline
        webkit-playsinline="true"
        loop
        muted={isMuted}
        preload="auto"
        controls={false}
        crossOrigin="anonymous"
        onPlay={() => { setIsPlaying(true); setHasStartedPlaying(true); setIsVideoReady(true); }}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => { setIsLoading(false); setIsVideoReady(true); }}
        onPlaying={() => { setIsLoading(false); setIsPlaying(true); setHasStartedPlaying(true); setIsVideoReady(true); }}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onError={() => {
          setIsLoading(false);
          // Auto-recovery without bricking with black screen
          if (resolvedVideoSrc && !resolvedVideoSrc.includes('vjs.zencdn.net')) {
            const fallback = BACKUP_VIDEO_SOURCES[0];
            setResolvedVideoSrc(fallback);
          }
        }}
        onClick={isReel ? undefined : handlePlayerTap}
        className={className ? `${className} bg-transparent relative z-10 cursor-pointer` : `w-full h-full max-h-[80vh] object-contain bg-transparent relative z-10 cursor-pointer`}
      />

      {audioSrc && <audio ref={audioRef} src={audioSrc} loop preload="auto" muted={isMuted} />}

      {/* Play/Pause Center Indicator Ripple */}
      <AnimatePresence>
        {playAnimation && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.15, opacity: 1 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
              {playAnimation === 'play' ? (
                <Play className="w-8 h-8 fill-white translate-x-0.5" />
              ) : (
                <Pause className="w-8 h-8 fill-white" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buffering Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full border-3 border-white/25 border-t-white animate-spin backdrop-blur-xs" />
        </div>
      )}

      {/* Action Controls: Fullscreen Stretch & Sound Mute/Unmute */}
      <div className="absolute bottom-5 right-3 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2.5 rounded-full bg-black/65 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
          title="Stretch / Full Screen"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>
        <button
          type="button"
          onClick={toggleMute}
          className="p-2.5 rounded-full bg-black/65 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Interactive Time & Progress Scrubber Bar */}
      <div 
        ref={progressBarRef}
        onMouseDown={(e) => { e.stopPropagation(); handleScrubberStart(e.clientX); }}
        onTouchStart={(e) => { e.stopPropagation(); if (e.touches.length > 0) handleScrubberStart(e.touches[0].clientX); }}
        onMouseMove={(e) => { const pct = calculatePercentFromX(e.clientX); setHoverPercent(pct); }}
        onMouseLeave={() => setHoverPercent(null)}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 h-6 pt-3 pb-1 px-0 z-30 cursor-pointer group/scrubber select-none"
        title="Slide or click to seek video"
      >
        {/* Hover / Scrub Floating Time Tooltip */}
        {(isScrubbing || (hoverPercent !== null && isHovered)) && duration > 0 && (
          <div 
            className="absolute -top-7 transform -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/85 text-white text-[10px] font-mono font-bold tracking-tight backdrop-blur-md border border-white/20 pointer-events-none shadow-lg whitespace-nowrap z-40 transition-all duration-75"
            style={{ 
              left: `${Math.max(5, Math.min(95, isScrubbing ? scrubPercent : (hoverPercent ?? displayProgress)))}%` 
            }}
          >
            {formatTime(currentPreviewTime)} <span className="opacity-60">/ {formatTime(duration)}</span>
          </div>
        )}

        {/* Scrubber Track Bar */}
        <div className="relative w-full h-1.5 group-hover/scrubber:h-2.5 transition-all duration-150 bg-white/25 rounded-full overflow-visible">
          {/* Hover preview marker */}
          {hoverPercent !== null && !isScrubbing && (
            <div 
              className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full pointer-events-none"
              style={{ width: `${hoverPercent}%` }}
            />
          )}

          {/* Active Blue Progress Fill */}
          <div 
            className="h-full bg-blue-500 rounded-full relative transition-all duration-75 shadow-sm"
            style={{ width: `${displayProgress}%` }}
          >
            {/* Draggable Scrubber Thumb / Head */}
            <div 
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-md border-2 border-blue-600 transition-all cursor-grab active:cursor-grabbing",
                isScrubbing 
                  ? "w-4 h-4 scale-125 ring-4 ring-blue-500/40" 
                  : "w-3.5 h-3.5 opacity-0 group-hover/scrubber:opacity-100 group-hover/scrubber:scale-110"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PostItem({ 
  post, 
  currentUser, 
  onPostDeleted, 
  onPostUpdated, 
  onReelClick, 
  onPostClick,
  userLocation
}: { 
  post: any, 
  currentUser: any, 
  onPostDeleted?: (id: string) => void, 
  onPostUpdated?: (p: any) => void, 
  onReelClick?: () => void, 
  onPostClick?: () => void,
  userLocation?: {lat: number, lng: number} | null
}) {
  const navigate = useNavigate();
  const activeUserId = currentUser?.id || localStorage.getItem('vyapar_user_id');
  const [isLiked, setIsLiked] = useState(() => isPostLikedByUser(post, activeUserId));
  const [isSaved, setIsSaved] = useState(() => isPostSavedByUser(post, activeUserId));

  const authorInfo = resolveAuthorInfo(post);
  const authorAvatar = authorInfo.avatarUrl;
  const authorName = authorInfo.name;

  const isSelfPost = Boolean(
    currentUser?.id && (
      String(currentUser.id) === String(post.userId) ||
      (currentUser.name && authorName && String(currentUser.name).trim().toLowerCase() === String(authorName).trim().toLowerCase()) ||
      (currentUser.username && authorName && String(currentUser.username).trim().toLowerCase() === String(authorName).trim().toLowerCase())
    )
  );

  const isVideoLink = Boolean(
    (post.externalLink && (
      post.externalLink.includes('youtube.com') ||
      post.externalLink.includes('youtu.be') ||
      /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(post.externalLink)
    )) ||
    (post.mediaUrl && (
      post.mediaUrl.includes('youtube.com') ||
      post.mediaUrl.includes('youtu.be') ||
      /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(post.mediaUrl)
    )) ||
    (post.videoUrl && (
      post.videoUrl.includes('youtube.com') ||
      post.videoUrl.includes('youtu.be') ||
      /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(post.videoUrl)
    ))
  );

  const isVideoPost = (
    post.type === 'video' || 
    post.type === 'reel' ||
    isVideoLink ||
    Boolean(post.videoUrl && !String(post.videoUrl).startsWith('data:image') && !String(post.videoUrl).match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) ||
    Boolean(post.video && !String(post.video).startsWith('data:image') && !String(post.video).match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) ||
    Boolean(post.mediaUrl && (String(post.mediaUrl).startsWith('data:video') || String(post.mediaUrl).match(/\.(mp4|webm|mov|m4v|mkv|3gp)(\?.*)?$/i) || (String(post.mediaUrl).includes('firebasestorage.googleapis.com') && !String(post.mediaUrl).match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)))) ||
    Boolean(post.persistentMediaUrl && (String(post.persistentMediaUrl).startsWith('data:video') || String(post.persistentMediaUrl).match(/\.(mp4|webm|mov|m4v|mkv|3gp)(\?.*)?$/i) || (String(post.persistentMediaUrl).includes('firebasestorage.googleapis.com') && !String(post.persistentMediaUrl).match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i))))
  );

  const isPdfPost = !isVideoPost && (post.type === 'pdf' || post.isPdf || Boolean(post.pdfUrl) || Boolean(post.mediaUrl && (String(post.mediaUrl).match(/\.pdf(\?.*)?$/i) || String(post.mediaUrl).startsWith('data:application/pdf'))));

  const isExplicitImage = !isVideoPost && !isPdfPost && (post.type === 'image' || post.type === 'photo' || Boolean(post.mediaUrl && (String(post.mediaUrl).startsWith('data:image') || String(post.mediaUrl).match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i))));

  const rawVideoUrl = isVideoPost ? (
    (post.externalLink && isVideoLink) ? post.externalLink :
    (post.mediaUrl && isVideoLink) ? post.mediaUrl :
    (post.videoUrl && isVideoLink) ? post.videoUrl :
    (post.videoUrl && !post.videoUrl.startsWith('data:image') && !post.videoUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) ? post.videoUrl :
    (post.video && !post.video.startsWith('data:image') && !post.video.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) ? post.video :
    (post.mediaUrl && !post.mediaUrl.startsWith('data:image') && !post.mediaUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) ? post.mediaUrl :
    (post.persistentMediaUrl && !post.persistentMediaUrl.startsWith('data:image') && !post.persistentMediaUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)) ? post.persistentMediaUrl :
    (post.externalLink || null)
  ) : null;

  const mediaSrc = isVideoPost
    ? (rawVideoUrl || '')
    : (post.mediaUrl || post.persistentMediaUrl || post.thumbnailUrl || (post.id ? localStorage.getItem('vyapar_video_' + post.id) : null) || '');
  const [imageLoadError, setImageLoadError] = useState(false);
  const postMusic = post.music || (post.musicTitle ? { title: post.musicTitle, artist: post.musicArtist, audioUrl: post.musicUrl } : null);
  
  // Media Type Checks for B2B Marketplace (Image & PDF Catalog vs Video/Reel)
  
  // Determine if content is vertical video to align actions properly on desktop
  const isVerticalContent = useMemo(() => {
    if (!isVideoPost && !mediaSrc) return false;
    
    if (post?.aspectRatio) {
      const r = String(post.aspectRatio).toLowerCase();
      if (r === '9:16' || r === '9/16' || r === 'vertical' || r === 'portrait') return true;
      if (r === '4:5' || r === '4/5') return true;
    }
    
    if (post?.isReel || post?.isShort || post?.isVertical || post?.type === 'reel') return true;
    
    const allUrls = [
      mediaSrc,
      post?.mediaUrl,
      post?.externalLink,
      post?.videoUrl,
      post?.video
    ].filter(Boolean).map(u => String(u).toLowerCase());
    
    for (const u of allUrls) {
      if (

        u.includes('/reel/') ||
        u.includes('/reels/') ||
        u.includes('/r/') ||
        u.includes('/share/r/') ||
        u.includes('/share/v/') ||
        u.includes('/shorts/') ||
        u.includes('#shorts') ||
        u.includes('shorts') ||
        u.includes('tiktok.com') ||
        u.includes('/stories/')
      ) {
        return true;
      }
    }
    return false;
  }, [post, isVideoPost, mediaSrc]);

  const isImagePost = !isVideoPost && !isPdfPost && (post.type === 'image' || post.type !== 'audio' && Boolean(mediaSrc || post.mediaUrl || post.image));

  const postImages: string[] = useMemo(() => {
    if (Array.isArray(post.images) && post.images.length > 0) {
      return post.images.filter(Boolean);
    }
    if (Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0) {
      return post.mediaUrls.filter(Boolean);
    }
    if (mediaSrc && !isVideoPost && !isPdfPost && post.type !== 'audio' && !mediaSrc.includes('youtube.com') && !mediaSrc.includes('youtu.be') && !mediaSrc.match(/\.pdf(\?.*)?$/i) && !mediaSrc.startsWith('data:application/pdf')) {
      return [mediaSrc];
    }
    return [];
  }, [post.images, post.mediaUrls, mediaSrc, isVideoPost, isPdfPost, post.type]);
  // Strict B2B Marketplace Cart Logic:
  // 1. If currentUser created this post, they do NOT see the Cart button on their own post.
  // 2. All other users (buyers, dealers, architects, factories, visitors) WILL see the Cart button to save the product to their Profile Cart.
  const isOwnPost = Boolean(
    currentUser && (
      String(currentUser.id) === String(post.userId) ||
      String(currentUser.id) === String(post.user?.id) ||
      (currentUser.phone && post.user?.phone && currentUser.phone === post.user.phone)
    )
  );
  const isEligibleForCart = !isOwnPost && !isVideoPost;

  const [isInCart, setIsInCart] = useState(() => isItemInCart(post.id));

  useEffect(() => {
    const handleCartSync = () => {
      setIsInCart(isItemInCart(post.id));
    };
    window.addEventListener('cart_updated', handleCartSync);
    return () => window.removeEventListener('cart_updated', handleCartSync);
  }, [post.id]);

  const [isFollowing, setIsFollowing] = useState(() => isUserFollowed(post.userId));

  useEffect(() => {
    const syncFollow = () => {
      setIsFollowing(isUserFollowed(post.userId));
    };
    window.addEventListener('followedUsersUpdated', syncFollow);
    return () => window.removeEventListener('followedUsersUpdated', syncFollow);
  }, [post.userId]);

  const initialPostAvg = Number(post.ratingAverage || post.averageRating || 0);
  const initialPostCount = Number(post.ratingCount || post.ratingsCount || 0);
  const [postRatingAverage, setPostRatingAverage] = useState<number>(initialPostAvg);
  const [postRatingCount, setPostRatingCount] = useState<number>(initialPostCount);
  const [userPostRating, setUserPostRating] = useState<number>(() => {
    if (typeof window !== 'undefined' && post.id) {
      const saved = localStorage.getItem(`vyapar_post_rate_${post.id}_${activeUserId || 'guest'}`);
      return saved ? Number(saved) : 0;
    }
    return 0;
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    setPostRatingAverage(Number(post.ratingAverage || post.averageRating || 0));
    setPostRatingCount(Number(post.ratingCount || post.ratingsCount || 0));
  }, [post.id, post.ratingAverage, post.averageRating, post.ratingCount, post.ratingsCount]);

  useEffect(() => {
    const handlePostRatingSync = (e: any) => {
      if (String(e.detail?.postId) === String(post.id)) {
        if (e.detail.ratingAverage !== undefined) setPostRatingAverage(Number(e.detail.ratingAverage));
        if (e.detail.ratingCount !== undefined) setPostRatingCount(Number(e.detail.ratingCount));
        if (e.detail.userRating !== undefined) setUserPostRating(Number(e.detail.userRating));
      }
    };
    window.addEventListener('postRatingUpdated', handlePostRatingSync);
    return () => window.removeEventListener('postRatingUpdated', handlePostRatingSync);
  }, [post.id]);

  const handleRatePost = async (star: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeUserId) {
      toast.error('üîê Please Login or Register to Rate posts!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    
    // Isolated Post Star Rating Calculation
    const previousRating = userPostRating;
    const isNewRating = previousRating === 0;
    const newCount = isNewRating ? postRatingCount + 1 : postRatingCount;
    const totalStars = (postRatingAverage * postRatingCount) - previousRating + star;
    const newAvg = Number((totalStars / Math.max(1, newCount)).toFixed(1));

    setPostRatingAverage(newAvg);
    setPostRatingCount(newCount);
    setUserPostRating(star);
    try {
      localStorage.setItem(`vyapar_post_rate_${post.id}_${activeUserId}`, String(star));
    } catch (e) {}

    toast.success(`‚≠ê Rated this post ${star} Stars!`);

    // Synchronize ONLY this post across feeds without affecting other posts by this user
    window.dispatchEvent(new CustomEvent('postRatingUpdated', {
      detail: {
        postId: post.id,
        ratingAverage: newAvg,
        ratingCount: newCount,
        userRating: star
      }
    }));

    // Server API & Firestore persistence
    try {
      fetch(`/api/posts/${post.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId, stars: star })
      }).catch(() => {});

      if (firestoreDb && post.id) {
        setDoc(doc(firestoreDb, 'posts', String(post.id)), {
          ratingAverage: newAvg,
          averageRating: newAvg,
          ratingCount: newCount,
          ratingsCount: newCount
        }, { merge: true }).catch(() => {});
      }
    } catch (err) {
      console.warn('Post rating sync error:', err);
    }
  };

  const [likesCount, setLikesCount] = useState(() => post.likesCount || post.likes || 0);
  const [savedCount, setSavedCount] = useState(() => post.savedCount || 0);
  const [sharesCount, setSharesCount] = useState(() => post.sharesCount || 0);
  const [commentsCount, setCommentsCount] = useState(() => post.commentsCount || 0);
  const [enquiriesCount, setEnquiriesCount] = useState(() => post.enquiriesCount || 0);

  useEffect(() => {
    setIsLiked(isPostLikedByUser(post, activeUserId));
    setIsSaved(isPostSavedByUser(post, activeUserId));
    setLikesCount(post.likesCount || post.likes || 0);
    setSavedCount(post.savedCount || 0);
    setSharesCount(post.sharesCount || 0);
    setCommentsCount(post.commentsCount || 0);
    setEnquiriesCount(post.enquiriesCount || 0);
  }, [post.id, post.isLiked, post.isSaved, post.likesCount, post.likes, post.likedBy, activeUserId, post.savedCount, post.sharesCount, post.commentsCount, post.enquiriesCount]);

  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [viewsCount, setViewsCount] = useState(() => post.viewsCount || 0);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [commentImagePreview, setCommentImagePreview] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isGifModalOpen, setIsGifModalOpen] = useState(false);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<{ url: string; user?: string; avatar?: string; text?: string } | null>(null);
  const commentFileInputRef = React.useRef<HTMLInputElement>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Customer Requirements State
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [reqTilesQty, setReqTilesQty] = useState('');
  const [reqEwcQty, setReqEwcQty] = useState('');
  const [reqMixerQty, setReqMixerQty] = useState('');
  const [reqOther, setReqOther] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  const handleSendRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReq(true);
    try {
      await fetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          targetId: post.userId,
          tilesQty: reqTilesQty,
          ewcQty: reqEwcQty,
          mixerQty: reqMixerQty,
          other: reqOther
        })
      });
      setIsSubmittingReq(false);
      setIsReqModalOpen(false);
      setReqTilesQty('');
      setReqEwcQty('');
      setReqMixerQty('');
      setReqOther('');
      toast.success('üéâ Your requirements have been sent to the company successfully! They will contact you shortly.');
    } catch (err) {
      setIsSubmittingReq(false);
      toast.error('Failed to send requirements');
    }
  };

  useEffect(() => {
    if (post?.id) {
      const unsubscribe = subscribeToCommentsFromFirestore(post.id, (liveComments) => {
        if (Array.isArray(liveComments)) {
          setComments(liveComments);
          setCommentsCount(Math.max(post.commentsCount || 0, liveComments.length));
        }
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [post?.id, post?.commentsCount]);

  useEffect(() => {
    // Unique view tracking on post mount (Runs once per session)
    if (post?.id) {
      const trackView = async () => {
        const sessionKey = `vyapar_viewed_post_${post.id}`;
        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, '1');
          const fsViews = await recordViewInFirestore(post.id);
          if (typeof fsViews === 'number' && fsViews > 0) {
            setViewsCount(prev => Math.max(prev, fsViews));
            if (post) post.viewsCount = Math.max(post.viewsCount || 0, fsViews);
          }
        }
        fetch(`/api/posts/${post.id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser?.id })
        })
        .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json')) ? res.json() : null)
        .then(data => {
          if (data && typeof data.viewsCount === 'number') {
            setViewsCount(prev => Math.max(prev, data.viewsCount));
            if (post) post.viewsCount = Math.max(post.viewsCount || 0, data.viewsCount);
          }
          if (data && typeof data.likesCount === 'number' && data.likesCount > 0) {
            setLikesCount(prev => Math.max(prev, data.likesCount));
          }
        })
        .catch(() => {});
      };

      trackView();
    }
  }, [post?.id, currentUser?.id]);

  const handleLike = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isLiked) playLikeSound();
    if (!currentUser?.id) {
      toast.error('üîê Please Login or Register to Like posts!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    const wasLiked = isLiked;
    const nextState = !wasLiked;
    const baseCount = typeof likesCount === 'number' ? likesCount : (post?.likesCount || post?.likes || 0);
    const nextCount = wasLiked ? Math.max(0, baseCount - 1) : baseCount + 1;

    setIsLiked(nextState);
    setLikesCount(nextCount);
    setPostLikedInLocalStorage(post.id, nextState);
    if (nextState) {
      toast.success('Liked post!');
      incrementUserEngagement('likes');
    }

    if (post) {
      post.isLiked = nextState;
      post.likesCount = nextCount;
      post.likes = nextCount;
    }

    // Sync with backend memory
    fetch(`/api/posts/${post.id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    }).catch(() => {});

    // Direct Firestore Sync (Works on Vercel & everywhere)
    const fsRes = await likePostInFirestore(post.id, currentUser.id, wasLiked, { ...post, likesCount: baseCount });
    if (fsRes && fsRes.success && typeof fsRes.likesCount === 'number') {
      setIsLiked(fsRes.isLiked);
      setLikesCount(fsRes.likesCount);
      if (post) {
        post.isLiked = fsRes.isLiked;
        post.likesCount = fsRes.likesCount;
        post.likes = fsRes.likesCount;
      }
    }
    if (onPostUpdated && post) {
      onPostUpdated({ ...post, isLiked: nextState, likesCount: post.likesCount || nextCount });
    }
  };

  const handleSave = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isSaved) playSaveSound();
    if (!currentUser?.id) {
      toast.error('üîê Please Login or Register to Save posts!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    const wasSaved = isSaved;
    const nextState = !wasSaved;

    setIsSaved(nextState);
    setPostSavedInLocalStorage(post.id, nextState);
    if (nextState) {
      toast.success('Saved post!');
      incrementUserEngagement('saves');
    } else {
      toast.success('Removed from saved');
    }

    // Direct Firestore Sync
    const fsRes = await savePostInFirestore(post.id, currentUser.id, wasSaved, post);
    if (fsRes && fsRes.success) {
      setIsSaved(fsRes.isSaved);
      // We will also hit the server API so that in-memory algorithm engine stays in sync
    }

    try {
      const res = await fetch(`/api/posts/${post.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setIsSaved(data.isSaved);
        }
      }
    } catch (err) {
      console.warn('API fallback note:', err);
    }
  };
  
  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.id) {
      toast.error('üîê Please Login or Register to Follow users!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    
    // Optimistic update
    const next = toggleFollowUser(post.userId);
    setIsFollowing(next);
    if (next) {
      toast.success('Following creator!');
    } else {
      toast.success('Unfollowed creator');
    }

    // Direct Firestore Sync
    await followUserInFirestore(post.userId, currentUser.id);

    try {
      await fetch(`/api/users/${post.userId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id })
      });
    } catch (err) {
      console.warn('API follow note:', err);
    }
  };

  const lastPostTapInfo = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchStartPostPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastPostTouchTime = useRef<number>(0);

  const triggerLikeWithHeart = () => {
    if (!isLiked) {
      handleLike();
    } else {
      playLikeSound();
    }
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(60);
    }
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 900);
  };

  const handleDoubleClickImage = (e: React.MouseEvent) => {
    if (Date.now() - lastPostTouchTime.current > 500) {
      triggerLikeWithHeart();
    }
  };

  const handleTouchStartImage = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPostPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  };

  const handleTouchEndImage = (e: React.TouchEvent) => {
    lastPostTouchTime.current = Date.now();
    if (!touchStartPostPos.current || e.changedTouches.length === 0) {
      touchStartPostPos.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const totalDist = Math.hypot(
      touch.clientX - touchStartPostPos.current.x,
      touch.clientY - touchStartPostPos.current.y
    );
    const duration = Date.now() - touchStartPostPos.current.time;
    touchStartPostPos.current = null;

    // If scrolling / swiping (movement > 15px or duration > 450ms), don't treat as tap!
    if (totalDist > 15 || duration > 450) {
      return;
    }

    const now = Date.now();
    const prevTap = lastPostTapInfo.current;

    if (prevTap) {
      const delay = now - prevTap.time;
      const tapDist = Math.hypot(touch.clientX - prevTap.x, touch.clientY - prevTap.y);
      if (delay >= 40 && delay <= 450 && tapDist <= 60) {
        lastPostTapInfo.current = null;
        triggerLikeWithHeart();
        return;
      }
    }

    lastPostTapInfo.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    };
  };

  const isPostOwnerOrAdmin = Boolean(
    currentUser?.id && (
      String(currentUser?.id) === String(post?.userId || post?.user?.id) ||
      currentUser?.role === 'admin' ||
      currentUser?.role === 'superadmin' ||
      currentUser?.email === 'admin@vyaparbridge.com'
    )
  );

  const [isPostNotifOn, setIsPostNotifOn] = useState(() => {
    try {
      const key = 'vyapar_post_notifs_' + (currentUser?.id || 'guest');
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(list) && list.includes(String(post.id));
    } catch { return false; }
  });

  const handleTogglePostNotifications = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = !isPostNotifOn;
    setIsPostNotifOn(next);
    setShowOptions(false);
    try {
      const key = 'vyapar_post_notifs_' + (currentUser?.id || 'guest');
      let list: string[] = [];
      const existing = localStorage.getItem(key);
      if (existing) list = JSON.parse(existing);
      if (next) {
        if (!list.includes(String(post.id))) list.push(String(post.id));
        toast.success('üîî Notifications turned ON for this post!');
      } else {
        list = list.filter(id => id !== String(post.id));
        toast.success('üîï Notifications turned OFF for this post.');
      }
      localStorage.setItem(key, JSON.stringify(list));
    } catch (err) {}
  };

  const handleCopyLink = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowOptions(false);
    const postUrl = `${window.location.origin}/#post-${post.id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(postUrl).then(() => {
        toast.success('üîó Post link copied to clipboard!');
      }).catch(() => {
        toast.success('üîó Post link: ' + postUrl);
      });
    } else {
      toast.success('üîó Post link: ' + postUrl);
    }
  };

  const handleBlockUser = async () => {
    const userId = currentUser?.id || 'guest';
    const authorId = String(post.userId || post.user?.id || '');
    if (!authorId) {
      toast.error('Unable to identify creator to block.');
      return;
    }
    
    // 1. Persist locally
    const { localBlockedKey } = getUserHiddenFilters(userId);
    try {
      let list: string[] = [];
      const existing = localStorage.getItem(localBlockedKey);
      if (existing) list = JSON.parse(existing);
      if (!list.includes(authorId)) list.push(authorId);
      localStorage.setItem(localBlockedKey, JSON.stringify(list));
    } catch (e) {}

    // 2. Persist in Firestore & Backend
    if (currentUser?.id) {
      blockUserInFirestore(currentUser.id, authorId);
      try {
        await fetch(`/api/users/${authorId}/block`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id })
        });
      } catch (e) {}
    }

    toast.success(`üö´ ${authorName || 'User'} has been blocked. All their posts are now permanently hidden.`);
    if (onPostDeleted) onPostDeleted(post.id);
    window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId: post.id } }));
    window.dispatchEvent(new CustomEvent('userBlocked', { detail: { blockedUserId: authorId } }));
    window.dispatchEvent(new CustomEvent('blockedUsersUpdated', { detail: { blockedUserId: authorId } }));
  };

  const handleNotInterestedPost = async () => {
    const userId = currentUser?.id || 'guest';
    const postId = String(post.id);
    
    // 1. Persist locally
    const { localNotInterestedKey } = getUserHiddenFilters(userId);
    try {
      let list: string[] = [];
      const existing = localStorage.getItem(localNotInterestedKey);
      if (existing) list = JSON.parse(existing);
      if (!list.includes(postId)) list.push(postId);
      localStorage.setItem(localNotInterestedKey, JSON.stringify(list));
    } catch (e) {}

    // 2. Persist in Firestore & Backend
    if (currentUser?.id) {
      markPostNotInterestedInFirestore(currentUser.id, postId);
      try {
        await fetch(`/api/posts/${postId}/not-interested`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id })
        });
      } catch (e) {}
    }

    toast.success('Post marked as Not Interested. Permanently hidden from your feed.');
    if (onPostDeleted) onPostDeleted(post.id);
    window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId: post.id } }));
    window.dispatchEvent(new CustomEvent('notInterestedUpdated', { detail: { postId: post.id } }));
  };

  const handleDeletePost = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const postId = String(post.id);
    
    // Immediate Optimistic UI updates
    setShowOptions(false);
    if (onPostDeleted) onPostDeleted(post.id);
    window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId } }));
    window.dispatchEvent(new CustomEvent('reelDeleted', { detail: { reelId: postId } }));

    try {
      // 1. Direct Firestore & LocalStorage permanent deletion
      await deletePostFromFirestore(postId);

      // 2. Background API sync
      try {
        await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      } catch (e) {}

      toast.success('Post deleted successfully');
    } catch (e) {
      toast.success('Post deleted');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    if (!newComment.trim() && !commentImage && !commentImagePreview) return;

    // Subscription & Verification Lock:
    // 1. Consumers/Buyers must have ‚Çπ99 Verified Plan or active membership
    const isVerifiedUser = Boolean(currentUser?.isVerified || currentUser?.verifiedPlan || currentUser?.membershipType || (currentUser?.planExpiry && currentUser.planExpiry > Date.now()) || isUser1188GoldenPlan(currentUser));
    const isConsumer = currentUser?.role === 'customer' || currentUser?.role === 'buyer';
    
    if (isConsumer && !isVerifiedUser) {
      toast.error("üîí Vyapar posts par comment karne ke liye ‚Çπ99 Verified Buyer Plan (Red Badge) lena zaroori hai.");
      window.dispatchEvent(new CustomEvent('openVerifyModal', { detail: { role: 'customer' } }));
      return;
    }

    const textContent = newComment.trim();
    const attachedImage = commentImagePreview || '';

    // Play instant sound feedback
    try { playBubblePopSound(); } catch (e) {}

    const myAvatar = currentUser?.avatarUrl || localStorage.getItem('vyapar_user_avatar') || BRAND_LOGO_SRC;
    const myName = currentUser?.name || localStorage.getItem('vyapar_user_name') || 'You';

    // 1. OPTIMISTIC 0MS REAL-TIME LOCAL DISPLAY
    const tempId = 'cmt_opt_' + Date.now();
    const optimisticComment = {
      id: tempId,
      content: textContent,
      userId: currentUser?.id || '1',
      userName: myName,
      userAvatar: myAvatar,
      commentImage: attachedImage,
      imageUrl: attachedImage,
      image: attachedImage,
      createdAt: new Date().toISOString(),
      user: {
        id: currentUser?.id || '1',
        name: myName,
        avatarUrl: myAvatar,
        role: currentUser?.role || 'wholesaler',
        isVerified: currentUser?.isVerified || false
      }
    };

    setComments(prev => [...prev, optimisticComment]);
    setCommentsCount(prev => prev + 1);
    setNewComment('');
    setCommentImage(null);
    setCommentImagePreview(null);
    if (commentFileInputRef.current) {
      commentFileInputRef.current.value = '';
    }
    setIsSubmittingComment(false);
    toast.success('Comment sent in real time!');
    incrementUserEngagement('comments');

    // 2. BACKGROUND NON-BLOCKING ASYNC SYNC TO FIRESTORE & SERVER
    (async () => {
      try {
        if (textContent) {
          const moderation = await moderateContentUniversally({
            content: textContent,
            userId: currentUser?.id,
            userRole: currentUser?.role
          });

          if (!moderation.approved) {
            toast.error(moderation.reason || '‚õî Comment removed by AI Guardrail.');
            setComments(prev => prev.filter(c => c.id !== tempId));
            setCommentsCount(prev => Math.max(0, prev - 1));
            return;
          }
        }

        const newCommentObj = {
          content: textContent,
          userId: currentUser?.id || '1',
          userName: myName,
          userAvatar: myAvatar,
          commentImage: attachedImage,
          imageUrl: attachedImage,
          image: attachedImage,
          createdAt: new Date().toISOString(),
          user: {
            id: currentUser?.id || '1',
            name: myName,
            avatarUrl: myAvatar,
            role: currentUser?.role || 'wholesaler',
            isVerified: currentUser?.isVerified || false
          }
        };

        const fsComment = await addCommentToFirestore(post.id, newCommentObj);
        if (fsComment && fsComment.id) {
          setComments(prev => prev.map(c => c.id === tempId ? { ...c, id: fsComment.id } : c));
          return;
        }

        // Fallback to Express backend if needed
        const formData = new FormData();
        formData.append('content', textContent);
        formData.append('userId', currentUser?.id || '1');
        if (attachedImage) {
          formData.append('commentImage', attachedImage);
          formData.append('imageUrl', attachedImage);
        }

        await fetch(`/api/posts/${post.id}/comments`, {
          method: 'POST',
          body: formData
        });
      } catch (err) {
        console.warn('Background comment sync notice:', err);
      }
    })();
  };

  const handleCommentImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCommentImage(file);
      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
      
      // 1. Instant Data URL read for 100% reliable preview & persistence
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCommentImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // 2. Pre-compression if not GIF
      if (!isGif) {
        try {
          const compressed = await optimizeImageForPersistence(file, 640, 640, 0.72);
          if (compressed) {
            setCommentImagePreview(compressed);
          }
        } catch (err) {
          console.warn('Image optimization notice:', err);
        }
      }
    }
  };

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete comment?')) return;
    try {
      setComments(prev => prev.filter(c => c.id !== commentId));
      setCommentsCount(prev => Math.max(0, prev - 1));
      await deleteCommentFromFirestore(post.id, commentId);
      try {
        await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      } catch (e) {}
      toast.success('Comment deleted');
    } catch (e) {
      toast.error('Failed to delete comment');
    }
  };

  const startEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editCommentText.trim()) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editCommentText })
      });
      const data = await res.json();
      if (data.success) {
        setComments(comments.map(c => c.id === commentId ? data.comment : c));
        setEditingCommentId(null);
        setEditCommentText('');
      }
    } catch (e) {
      toast.error('Failed to update comment');
    }
  };

  return (
    <div className={`bg-[#E6C76C] dark:bg-black border-b border-neutral-100 dark:border-neutral-900 md:border md:border-neutral-200 dark:md:border-neutral-800 md:rounded-xl pb-4 mb-5 w-full mx-auto shadow-sm ${isVerticalContent ? "md:max-w-[460px]" : ""}`}>
      {/* Post Header */}
      <div className="flex items-center justify-between p-3 relative">
        <div className="flex items-center gap-3">
           <div 
             onClick={() => navigate(`/profile/${authorInfo.id}`)}
             className={cn(
             "w-10 h-10 rounded-full cursor-pointer shrink-0 transition-transform hover:scale-105 overflow-hidden flex items-center justify-center bg-slate-200 dark:bg-zinc-800",
             (post.user?.isVerified || authorInfo.isVerified || (currentUser?.id === post.userId && currentUser?.isVerified))
               ? "tiranga-border-circle p-[2px]"
               : "neon-border-circle p-[2px]"
           )}>
             <img 
               src={authorAvatar || getInitialsAvatar(authorName)} 
               alt={authorName} 
               className="w-full h-full object-cover rounded-full select-none" 
               onError={(e) => { 
                 (e.currentTarget as HTMLImageElement).src = getInitialsAvatar(authorName); 
               }}
             />
           </div>
           <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span 
                  onClick={() => navigate(`/profile/${authorInfo.id}`)}
                  className={cn(
                    "font-black italic tracking-wider text-sm text-black dark:text-zinc-50 leading-none cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:underline",
                    (post.user?.isVerified || authorInfo.isVerified || (currentUser?.id === post.userId && currentUser?.isVerified)) && "text-blue-600 dark:text-blue-400 font-bold"
                  )}
                  style={{ fontFamily: "'Playfair Display', 'Dancing Script', serif", fontWeight: 900 }}
                >
                  {authorName}
                </span>
                {(shouldShowVerifiedBadge(post.user || authorInfo) || (currentUser?.id === post.userId && shouldShowVerifiedBadge(currentUser))) && (
                  <VerifiedBadge user={post.user || authorInfo} size="sm" />
                )}

                {/* Interactive Star Post Rating Badge (Individual Post Rating) */}
                <div className="rainbow-star-badge flex items-center gap-1 ml-2 px-2 py-0.5 rounded-xl select-none shrink-0 backdrop-blur-md transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center" onMouseLeave={() => setHoverRating(null)}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = hoverRating !== null ? star <= hoverRating : star <= Math.round(postRatingAverage);
                      return (
                        <button
                          key={star}
                          onClick={(e) => handleRatePost(star, e)}
                          onMouseEnter={() => setHoverRating(star)}
                          className="p-0.5 transition-transform duration-200 hover:scale-125 focus:outline-none cursor-pointer"
                          title={`Rate this post ${star} Stars`}
                        >
                          <Star
                            className={`w-2.5 h-2.5 ${getStarColorClass(star, isFilled, 'text-zinc-300 dark:text-zinc-600')}`}
                            fill={isFilled ? 'currentColor' : 'none'}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                    {postRatingAverage.toFixed(1)}
                    <span className="text-zinc-400 dark:text-zinc-500 font-normal ml-0.5">({postRatingCount})</span>
                  </span>
                </div>
              </div>
              {(() => {
                const pUser = post.user || authorInfo || {};
                const isAdm = pUser.role === 'admin' || post.userId === 'admin_manit_1' || String(post.userId).includes('admin') || pUser.username === 'manit';
                const userCat = pUser.category || (isAdm ? 'IT Software Developer SaaS Model Apps and Logic Founder' : null);
                
                if (isAdm) {
                  return (
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 truncate max-w-[280px]">
                      <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">[üëë ADMIN ‚Ä¢ {userCat || 'Founder & Platform Logic'}]</span>
                    </span>
                  );
                }
                
                if (pUser.role === 'customer') {
                  return (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate max-w-[280px]">
                      <ShoppingCart className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">[üõí BUYER{userCat ? ` ‚Ä¢ ${userCat}` : ''}]</span>
                    </span>
                  );
                }
                
                return (
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 truncate max-w-[280px]">
                    <Building2 className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">[üè¢ {userCat || (pUser.role === 'dealer' ? 'Dealer & Retailer' : 'Merchant & Business')}]</span>
                  </span>
                );
              })()}
              <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-black/50 dark:text-zinc-400">
                <Clock className="w-3 h-3 text-black/40 dark:text-zinc-500 shrink-0" />
                <span>{formatPostTimeAgo(post.createdAt)}</span>
                {!isSelfPost && (
                  <div className="flex items-center">
                    <span className="text-slate-300 dark:text-zinc-700 mx-1 text-[10px]">‚Ä¢</span>
                    <button 
                      onClick={handleFollow}
                      className={cn(
                        "text-[12px] font-bold transition-all duration-700 active:scale-95",
                        isFollowing 
                          ? "text-black/70 dark:text-zinc-500 hover:text-black dark:hover:text-zinc-300" 
                          : "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      )}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                )}
              </div>
           </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(!showOptions);
              }} 
              className="text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showOptions && (
              <>
                {/* Click outside anywhere on screen to close */}
                <div 
                  className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-[0.5px]" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(false);
                  }} 
                />

                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl z-50 border border-slate-200 dark:border-zinc-800 overflow-hidden text-sm animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100 dark:divide-zinc-800/60"
                >
                  {/* Notifications Option */}
                  <button 
                    onClick={handleTogglePostNotifications}
                    className="w-full text-left px-4 py-3 text-black dark:text-zinc-100 font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    {isPostNotifOn ? (
                      <>
                        <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                        <span>Turn Off Notifications</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 text-black/70 dark:text-zinc-400" />
                        <span>Turn On Notifications</span>
                      </>
                    )}
                  </button>

                  {/* Owner or Admin Options: Edit & Delete */}
                  {isPostOwnerOrAdmin ? (
                    <>
                      <button 
                        onClick={() => { setIsEditModalOpen(true); setShowOptions(false); }} 
                        className="w-full text-left px-4 py-3 text-black dark:text-zinc-50 font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4 text-blue-500" />
                        <span>Edit Post</span>
                      </button>
                      <button 
                        onClick={(e) => handleDeletePost(e)} 
                        className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                        <span>Delete Post</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => { setIsReportModalOpen(true); setShowOptions(false); }} 
                        className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span>Report Post / Nudity</span>
                      </button>
                      <button 
                        onClick={() => { handleBlockUser(); setShowOptions(false); }} 
                        className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <UserX className="w-4 h-4 text-red-500" />
                        <span>Block User</span>
                      </button>
                    </>
                  )}

                  {/* Not Interested */}
                  <button 
                    onClick={() => { handleNotInterestedPost(); setShowOptions(false); }} 
                    className="w-full text-left px-4 py-3 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <EyeOff className="w-4 h-4 text-amber-500" />
                    <span>Not Interested</span>
                  </button>

                  {/* Share Post */}
                  <button 
                    onClick={() => { setIsShareModalOpen(true); setShowOptions(false); }} 
                    className="w-full text-left px-4 py-3 text-black dark:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-black/70 dark:text-zinc-400" />
                    <span>Share Post</span>
                  </button>

                  {/* Copy Link */}
                  <button 
                    onClick={handleCopyLink}
                    className="w-full text-left px-4 py-3 text-black dark:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-black/70 dark:text-zinc-400" />
                    <span>Copy Link</span>
                  </button>

                  {/* Cancel */}
                  <button 
                    onClick={() => setShowOptions(false)} 
                    className="w-full text-left px-4 py-3 text-black/70 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentUser={currentUser}
        targetType="post"
        targetId={post.id}
        targetName={post.user?.name}
      />
      
      {/* Post Image/Video/PDF (Full Width) */}
      {(postImages.length > 0 || mediaSrc || isPdfPost || post.type === 'pdf') ? (
        <div 
          className="relative w-full flex items-center justify-center overflow-hidden cursor-pointer select-none my-1 rounded-xl"
          onDoubleClick={handleDoubleClickImage}
          onTouchStart={handleTouchStartImage}
          onTouchEnd={handleTouchEndImage}
        >
          {isPdfPost || post.type === 'pdf' || (mediaSrc && (mediaSrc.match(/\.pdf(\?.*)?$/i) || mediaSrc.startsWith('data:application/pdf'))) ? (
            <PdfCardViewer post={{ ...post, mediaUrl: mediaSrc || post.mediaUrl || post.pdfUrl || '' }} variant="feed" />
          ) : isVideoPost || (mediaSrc && (
              mediaSrc.includes('youtube.com') || 
              mediaSrc.includes('youtu.be') ||
              /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(mediaSrc)
            )) ? (
            <AdMediaDisplay ad={{ ...post, type: 'video', mediaUrl: mediaSrc || rawVideoUrl || post.externalLink, aspectRatio: post?.aspectRatio || (post?.isReel || isVerticalContent ? '9:16' : undefined), externalLink: post?.externalLink }} className="w-full h-full pointer-events-auto" />
          ) : post.type === 'audio' || mediaSrc.match(/\.(mp3|wav|ogg|m4a)(\?.*)?$/i) ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 p-8">
               <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-pulse">
                 <Volume2 className="w-16 h-16 text-indigo-300" />
               </div>
               <audio src={mediaSrc} controls className="w-full max-w-[300px]" />
               <p className="mt-4 text-xs font-bold text-indigo-200 text-center uppercase tracking-widest">{post.title || 'Audio Post'}</p>
            </div>
          ) : postMusic?.audioUrl ? (
            <FeedImageWithAudio src={mediaSrc} audioSrc={postMusic.audioUrl} />
          ) : postImages.length > 0 ? (
            <MultiImageCollage
              images={postImages}
              title={post.title || "Post"}
              onDoubleClick={handleDoubleClickImage}
              onTouchStart={handleTouchStartImage}
              onTouchEnd={handleTouchEndImage}
            />
          ) : !imageLoadError && mediaSrc ? (
            <img 
              src={mediaSrc} 
              alt={post.title || "Post media"} 
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl pointer-events-none" 
              onError={() => {
                setImageLoadError(true);
              }}
            />
          ) : (
            <div className="w-full min-h-[300px] max-h-[500px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-zinc-900 to-black text-white text-center">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-xl">
                <Building2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-zinc-100 max-w-md line-clamp-2 uppercase tracking-wide">
                {post.title || 'B2B Wholesale Ceramic Catalog'}
              </h4>
              <p className="text-xs text-zinc-400 mt-2 max-w-sm line-clamp-3">
                {post.content || post.description || 'Commercial tiles & ceramic products batch available for wholesale order.'}
              </p>
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-amber-300">
                <span>üè≠ {post.user?.name || post.userName || 'Verified Factory'}</span>
              </div>
            </div>
          )}
          {showHeartOverlay && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className="animate-bounce flex flex-col items-center">
                <Heart className="w-28 h-28 text-red-500 fill-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.95)]" />
                <span className="text-white text-[11px] font-black tracking-widest mt-1 bg-black/80 px-3 py-1 rounded-full border border-red-500/50 shadow-xl uppercase">
                  ‚ù§Ô∏è Liked!
                </span>
              </div>
            </div>
          )}
        </div>
      ) : null}
      
      {/* Wholesale Price Range Badge - Cleaned Style */}
      {Boolean(post.minRate || post.maxRate) && (
        <div className="px-3 pt-2 pb-1 flex items-center">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-black shadow-xs shrink-0">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400">Rate:</span>
            <span className="tracking-tight">
              {post.minRate && post.maxRate 
                ? `‚Çπ${post.minRate} - ‚Çπ${post.maxRate}` 
                : post.minRate 
                  ? `‚Çπ${post.minRate}+` 
                  : `Upto ‚Çπ${post.maxRate}`}
            </span>
            <span className="text-[10px] font-medium text-black/60 dark:text-zinc-400 ml-0.5">
              /{post.unit || 'Box'}
            </span>
          </div>
        </div>
      )}
      
      {/* Post Actions */}
      <div className="p-3">
        <div className={cn("flex flex-wrap items-center gap-2 mb-3", isVerticalContent && "md:ml-[50px]")}>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button onClick={handleLike} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 transition-colors duration-700">
              <Heart className={cn("w-5 h-5 sm:w-6 sm:h-6 transition-all duration-700 active:scale-95", isLiked ? "text-red-500 fill-red-500" : "")} />
              {likesCount > 0 && <span className="text-xs sm:text-sm font-semibold">{likesCount}</span>}
            </button>
            <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 active:scale-95 transition-all duration-700">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              {(commentsCount > 0 || comments.length > 0) ? (
                <span className="text-xs sm:text-sm font-semibold">{Math.max(commentsCount, comments.length)}</span>
              ) : null}
            </button>
            <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-1.5 text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 active:scale-95 transition-all duration-700">
              <svg aria-label="Share Post" className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
              {sharesCount > 0 && <span className="text-xs sm:text-sm font-semibold">{sharesCount}</span>}
            </button>
            {!isVideoPost && (
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                
                // Contact Permission Check:
                // 1. Buyer needs ‚Çπ99 Verified Buyer Plan (Red Badge)
                if (currentUser?.role === 'customer' || currentUser?.role === 'buyer') {
                  const isVerifiedBuyer = currentUser?.isVerified || currentUser?.verifiedPlan === '99' || currentUser?.membershipType;
                  if (!isVerifiedBuyer) {
                    toast.error("üîí Seller se direct inquiry/contact karne ke liye ‚Çπ99 Verified Buyer Plan (Red Badge) lena zaroori hai.");
                    window.dispatchEvent(new CustomEvent('openVerifyModal', { detail: { role: 'customer' } }));
                    return;
                  }
                }
                // 2. Seller needs ‚Çπ1188 Golden Plan to contact
                if (currentUser && currentUser.role !== 'customer' && currentUser.role !== 'buyer') {
                  if (!isUser1188GoldenPlan(currentUser)) {
                    toast.error("üîí Direct B2B Inquiry/Contact ke liye Seller ka ‚Çπ1,188/Year Golden Plan se verified hona zaroori hai.");
                    window.dispatchEvent(new CustomEvent('openVerifyModal', { detail: { role: currentUser.role } }));
                    return;
                  }
                }
                // Strict B2B Rule: Only verified sellers can be contacted via direct inquiry
                if (currentUser?.role === 'dealer' || currentUser?.role === 'wholesaler' || currentUser?.role === 'retailer') {
                  if (post?.user?.role === 'factory' && !post?.user?.isVerified) {
                    toast.error("üîí Direct B2B Inquiry/Contact ke liye Seller ka ‚Çπ1,188/Year Golden Plan se verified hona zaroori hai.");
                    window.dispatchEvent(new CustomEvent('openVerifyModal', { detail: { role: currentUser.role } }));
                    return;
                  }
                }
                // Distance Check for Local Customer Members
                if (currentUser?.role === 'customer' && currentUser?.membershipType === 'local') {
                  const targetCoords = post?.user?.gpsCoords || post?.gpsCoords;
                  if (userLocation && targetCoords) {
                    const dist = calculateDistance(userLocation.lat, userLocation.lng, targetCoords.lat, targetCoords.lng);
                    if (dist > 100) {
                      toast.error(`üìç Distance Restriction: As a Local Member, you can only inquire with dealers within 100km. This business is ${Math.round(dist)}km away. Upgrade to 'Direct Company' plan for nationwide access!`);
                      return;
                    }
                  } else if (!userLocation) {
                    toast.error("üìç Please enable GPS/Location to verify distance for Local Membership.");
                    return;
                  }
                }
                navigate('/chat'); 
              }} 
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-95 transition-all duration-700 flex items-center justify-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 p-2 sm:px-3 sm:py-1 rounded-full border border-emerald-200 dark:border-emerald-700/60 cursor-pointer shrink-0"
              title="Direct Inquiry"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline text-[10px] font-black uppercase">Inquiry</span>
            </button>
            )}

            {/* B2B Marketplace Cart Button (Visible for all users on other people's posts) */}
            {isEligibleForCart && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  try { playBubblePopSound(); } catch (err) {}
                  const res = addToCart(post);
                  setIsInCart(true);
                  toast.success(`üõí "${post.title || 'Product Batch'}" aapke Profile Cart me save ho gaya! (${res.cartCount} items)`);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1 rounded-full text-xs font-black transition-all transform active:scale-95 shadow-sm shrink-0 border cursor-pointer",
                  isInCart 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-500/20" 
                    : "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black border-amber-400 shadow-amber-400/30 hover:shadow-md"
                )}
                title={isInCart ? "Aapke Profile Cart me save hai (Click to add more)" : "Profile Cart me Save / Inquire karein"}
              >
                <ShoppingCart className="w-4 h-4 text-inherit shrink-0" />
                <span className="hidden sm:inline text-[10px] sm:text-[11px] font-black uppercase tracking-tight whitespace-nowrap">
                  {isInCart ? "In Cart ‚úì" : "Add to Cart"}
                </span>
              </button>
            )}

            {/* Wishlist Button (Saves the post to profile wishlist) */}
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1 rounded-full text-xs font-black transition-all transform active:scale-95 shadow-sm shrink-0 border cursor-pointer",
                isSaved 
                  ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-rose-500/20" 
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
              )}
              title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
            >
              <Bookmark className={cn("w-4 h-4 text-inherit shrink-0", isSaved && "fill-current")} />
              <span className="hidden sm:inline text-[10px] sm:text-[11px] font-black uppercase tracking-tight whitespace-nowrap">
                {isSaved ? "Wishlist ‚úì" : "Wishlist"}
              </span>
            </button>

            {/* Animated Golden Round Boost Your Business Button with Speaker Icon */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('open_boost_business_modal', { 
                  detail: { post, user: currentUser } 
                }));
              }}
              className="relative flex items-center justify-center gap-1 px-2.5 py-2 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md hover:shadow-amber-500/50 border border-amber-300/80 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group shrink-0"
              title="Boost Your Business & Reels across India"
            >
              <span className="relative flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-slate-950 text-amber-400 shadow-inner group-hover:rotate-12 transition-transform shrink-0">
                <Megaphone className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-bounce" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </span>
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-tight whitespace-nowrap">Boost</span>
            </button>
            {!isVideoPost && currentUser?.role === 'customer' && (post?.user?.role === 'dealer' || post?.user?.role === 'factory') && (
              <button
                 onClick={(e) => {
                   e.stopPropagation();
                   if (!currentUser?.isVerified) {
                     toast.error('Only Verified (Paid) Customers can send direct requirements. Please upgrade your account to Premium.');
                     return;
                   }
                   setIsReqModalOpen(true);
                 }}
                 className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 active:scale-95 transition-all duration-700 flex items-center justify-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 p-2 sm:px-3 sm:py-1 rounded-full border border-amber-200 dark:border-amber-700/60 cursor-pointer shrink-0"
                 title="Send Requirements to Company"
              >
                <ClipboardList className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline text-[10px] font-black uppercase">Send Req</span>
              </button>
            )}
            {!isVideoPost && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent('open_offer_token_modal', { detail: { post } }));
                  toast.success('üéÅ Offer Token Generator opened with this post snapshot & QR code!');
                }}
                className="flex items-center justify-center gap-1.5 p-2 sm:px-2.5 sm:py-1 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white transition-all text-xs font-bold cursor-pointer border border-blue-400/80 active:scale-95 shadow-md shrink-0"
                title="Generate Offer Token & Discount QR Pass"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
                <span className="hidden sm:inline text-[10px] font-black uppercase">Offer</span>
              </button>
            )}
          </div>
        </div>
        
        <div 
          onClick={() => setShowStatsModal(true)}
          className={cn("font-bold text-xs sm:text-sm text-black dark:text-zinc-50 flex items-center gap-2 sm:gap-3 mb-1.5 cursor-pointer hover:opacity-80 transition-opacity", isVerticalContent && "md:ml-[50px]")}
          title="Click to view engagement breakdown"
        >
          <span className="text-black/70 dark:text-zinc-400 font-medium">{viewsCount.toLocaleString()} views</span>
        </div>
        
        {/* Caption */}
        <div className={cn("text-sm text-black dark:text-zinc-50 whitespace-pre-wrap leading-snug", isVerticalContent && "md:ml-[50px]")}>
          {post.content || post.description || post.title || post.text || 'VyaparBridge Business Feed Post'}
        </div>
        {post.externalLink && !isVideoPost && (
          <div className="mt-2.5 flex items-center">
            <a 
              href={post.externalLink.startsWith('http') ? post.externalLink : `https://${post.externalLink}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-[11px] transition-all shadow-sm active:scale-95 border border-blue-400/20"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>üîó Shared Link: {post.externalLink.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</span>
            </a>
          </div>
        )}

        {/* 100% Public Star Rating & Feedback (No Login Needed) */}

        {post.commentsCount > 0 && !showComments && (
          <button 
            onClick={() => setShowComments(true)}
            className="text-black/70 dark:text-zinc-400 text-sm mt-1.5 hover:text-black dark:hover:text-zinc-300 transition-colors"
          >
            View all {post.commentsCount} comments
          </button>
        )}
        
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="px-3 pb-3">
          <div className="border-t border-slate-200 dark:border-zinc-800 pt-3 mt-3 max-h-60 overflow-y-auto space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="text-sm flex flex-col mb-1">
                <div className="flex items-start gap-2 group/comment">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                    {(() => {
                      const cName = comment.user?.name || comment.userName || 'User';
                      const cAvatar = resolveUserAvatar(comment, cName);
                      return (
                        <img 
                          src={cAvatar || getInitialsAvatar(cName)} 
                          alt={cName} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getInitialsAvatar(cName);
                          }}
                        />
                      );
                    })()}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                      <span className="font-semibold cursor-pointer text-xs text-black dark:text-zinc-100">{comment.user?.name || comment.userName || 'Vyapar Member'}</span>
                      {(shouldShowVerifiedBadge(comment.user) || (currentUser?.id === comment.userId && shouldShowVerifiedBadge(currentUser))) && (
                        <VerifiedBadge user={comment.user} size="sm" />
                      )}
                      {comment.user?.role === 'customer' && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded border border-amber-500/30">
                          Customer Inquiry
                        </span>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="flex-1 flex items-center gap-2 mt-1">
                        <input 
                          type="text" 
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="flex-1 border-b border-slate-300 dark:border-zinc-700 bg-transparent focus:outline-none text-sm text-black dark:text-white"
                          autoFocus
                        />
                        <button onClick={() => handleUpdateComment(comment.id)} className="text-blue-500 font-semibold text-xs">Save</button>
                        <button onClick={() => setEditingCommentId(null)} className="text-black/70 dark:text-zinc-400 text-xs hover:text-black dark:hover:text-zinc-200">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {(() => {
                          const { text: safeContent, masked } = renderSafeCommentText(
                            comment.content, 
                            currentUser?.id === comment.userId || currentUser?.role === 'admin'
                          );
                          return (
                            <>
                              {safeContent && (
                                <span className="flex-1 text-sm mt-0.5 text-black dark:text-zinc-100">{safeContent}</span>
                              )}
                              {masked && (
                                <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
                                  üîí Phone numbers in public comments are protected. Use "Inquire / Trade Connect" to chat directly.
                                </div>
                              )}
                            </>
                          );
                        })()}
                        {(() => {
                          const commentImg = comment.commentImage || comment.imageUrl || comment.image || comment.mediaUrl;
                          if (!commentImg) return null;
                          return (
                            <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 max-w-[240px] shadow-sm group relative">
                              <img 
                                src={commentImg} 
                                alt="Comment attachment" 
                                className="w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-95 transition-all rounded-lg"
                                onClick={() => setSelectedLightboxImage({
                                  url: commentImg,
                                  user: comment.user?.name || comment.userName || 'Member',
                                  avatar: comment.user?.avatarUrl || comment.userAvatar,
                                  text: comment.content
                                })}
                              />
                              <div 
                                onClick={() => setSelectedLightboxImage({
                                  url: commentImg,
                                  user: comment.user?.name || comment.userName || 'Member',
                                  avatar: comment.user?.avatarUrl || comment.userAvatar,
                                  text: comment.content
                                })}
                                className="absolute bottom-1.5 right-1.5 bg-black/70 hover:bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm cursor-pointer opacity-90 transition-opacity flex items-center gap-1"
                              >
                                <span>üîç Preview</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <button 
                        onClick={() => setNewComment('@' + (comment.user?.name?.replace(/\s+/g, '') || 'User') + ' ')} 
                        className="text-[10px] font-bold text-black/70 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                  {comment.userId === currentUser?.id && editingCommentId !== comment.id && (
                    <div className="opacity-0 group-hover/comment:opacity-100 transition-opacity flex items-center gap-2 text-xs text-black/60 dark:text-zinc-400 shrink-0 mt-0.5">
                      <button onClick={() => startEditComment(comment)} className="hover:text-blue-500">Edit</button>
                      <button onClick={() => handleDeleteComment(comment.id)} className="hover:text-red-500">Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {comments.length === 0 && <div className="text-sm text-black/70 dark:text-zinc-400 font-medium text-center py-4">No comments yet. Be the first to comment!</div>}
          </div>

          <div className="mt-4">
            {commentImagePreview && (
              <div className="relative w-24 h-24 mb-3 rounded-xl overflow-hidden border-2 border-blue-500 shadow-lg group bg-black/10">
                <img 
                  src={commentImagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover cursor-pointer" 
                  onClick={() => setSelectedLightboxImage({
                    url: commentImagePreview,
                    user: currentUser?.name || 'You',
                    avatar: currentUser?.avatarUrl,
                    text: newComment
                  })}
                />
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                  {commentImagePreview.includes('image/gif') || commentImagePreview.toLowerCase().includes('.gif') ? 'GIF' : 'IMG'}
                </div>
                <button 
                  onClick={() => { setCommentImage(null); setCommentImagePreview(null); }}
                  className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 transition-colors cursor-pointer"
                  title="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            <form 
              onSubmit={handleAddComment} 
              onPaste={(e) => handleClipboardMediaPaste(e, (dataUrl, file) => {
                setCommentImagePreview(dataUrl);
                if (file) setCommentImage(file as File);
              })}
              className="flex items-center pt-4 border-t border-slate-100 dark:border-zinc-800 gap-2 relative"
            >
              <input
                type="file"
                ref={commentFileInputRef}
                className="hidden"
                accept="image/*,.gif,image/gif"
                onChange={handleCommentImageChange}
              />
              <button 
                type="button"
                onClick={() => commentFileInputRef.current?.click()}
                className="p-2 text-black/70 dark:text-zinc-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all cursor-pointer"
                title="Add photo or GIF file to comment"
              >
                <Camera className="w-5 h-5" />
              </button>

              <button 
                type="button"
                onClick={() => setIsGifModalOpen(true)}
                className="px-2.5 py-1 bg-gradient-to-r from-pink-500/15 to-rose-500/15 hover:from-pink-500/25 hover:to-rose-500/25 text-pink-600 dark:text-pink-400 border border-pink-500/30 rounded-lg font-black text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                title="Select animated GIF sticker"
              >
                <span>GIF</span>
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Add a comment or paste keyboard GIF..."
                  enterKeyHint="send"
                  className="w-full text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-black dark:text-white rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder-slate-400 dark:placeholder-zinc-500"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onPaste={(e) => handleClipboardMediaPaste(e, (dataUrl, file) => {
                    setCommentImagePreview(dataUrl);
                    if (file) setCommentImage(file as File);
                  })}
                />
              </div>

              <button 
                type="submit" 
                disabled={(!newComment.trim() && !commentImage && !commentImagePreview) || isSubmittingComment}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-full disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Send comment"
              >
                {isSubmittingComment ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Comment Media Lightbox Modal */}
      <CommentMediaLightbox
        isOpen={Boolean(selectedLightboxImage)}
        onClose={() => setSelectedLightboxImage(null)}
        imageUrl={selectedLightboxImage?.url || ''}
        userName={selectedLightboxImage?.user}
        userAvatar={selectedLightboxImage?.avatar}
        commentText={selectedLightboxImage?.text}
      />

      {/* GIF Picker Modal */}
      <GifPickerModal
        isOpen={isGifModalOpen}
        onClose={() => setIsGifModalOpen(false)}
        onSelectGif={(gifUrl) => {
          setCommentImage(null);
          setCommentImagePreview(gifUrl);
          setIsGifModalOpen(false);
          toast.success('GIF attached! Add text and send.');
        }}
      />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} data={post} type="post" />
      <EditPostModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} post={post} onSave={(p) => { if (onPostUpdated) onPostUpdated(p); }} />
      {showStatsModal && (
        <SinglePostStatsModal postId={post.id} onClose={() => setShowStatsModal(false)} />
      )}

      {/* Customer Requirements Modal */}
      {isReqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-black dark:text-zinc-50 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-500" /> Send Requirements
              </h3>
              <button onClick={() => setIsReqModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-black/70" />
              </button>
            </div>
            <form onSubmit={handleSendRequirement} className="p-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-black dark:text-zinc-300 mb-1">Tiles Requirement (Sqft/Boxes)</label>
                <input
                  type="text"
                  placeholder="e.g. 500 boxes vitrified tiles"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  value={reqTilesQty}
                  onChange={(e) => setReqTilesQty(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black dark:text-zinc-300 mb-1">EWC / Toilets Quantity</label>
                <input
                  type="text"
                  placeholder="e.g. 5 One-Piece EWCs"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  value={reqEwcQty}
                  onChange={(e) => setReqEwcQty(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black dark:text-zinc-300 mb-1">Faucets / Mixers / Showers</label>
                <input
                  type="text"
                  placeholder="e.g. 10 Wall Mixers, 5 Showers"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  value={reqMixerQty}
                  onChange={(e) => setReqMixerQty(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black dark:text-zinc-300 mb-1">Other Accessories / Message</label>
                <textarea
                  placeholder="Any other specific requirements?"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 min-h-[60px]"
                  value={reqOther}
                  onChange={(e) => setReqOther(e.target.value)}
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmittingReq || (!reqTilesQty && !reqEwcQty && !reqMixerQty && !reqOther)}
                className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmittingReq ? 'Sending...' : 'Send Requirements to Company'}
              </button>
            </form>
          </div>
        </div>
      )}</div>
  );
}

function MusicSelectionModal({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (music: any) => void }) {
  const [music, setMusic] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      safeFetch('/api/music')
        .then(data => {
          setMusic(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Music fetch error:', err);
          setLoading(false);
        });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isOpen]);

  const togglePreview = (e: React.MouseEvent, track: any) => {
    e.stopPropagation();
    if (playingTrackId === track.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(track.audioUrl);
      const p = audioRef.current.play();
      if (p !== undefined) p.catch(()=>{});
      setPlayingTrackId(track.id);
      audioRef.current.onended = () => setPlayingTrackId(null);
    }
  };

  const handleApply = (track: any) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingTrackId(null);
    onSelect(track);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-black dark:text-zinc-50">Select Music for Reel</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => handleApply(null)}>
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <VolumeX className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-blue-700 dark:text-blue-400">Original Audio Only</div>
              <div className="text-[10px] text-blue-600/70">No background track</div>
            </div>
            <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Apply</button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-black/60 italic">Curating tracks from library...</div>
          ) : music.map(track => (
            <div key={track.id} className="p-3 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-900/50">
              <button 
                onClick={(e) => togglePreview(e, track)}
                className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 hover:scale-105 transition-transform"
              >
                {playingTrackId === track.id ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-black dark:text-zinc-50 truncate">{track.title}</div>
                <div className="text-[10px] text-black/70">{track.artist} ‚Ä¢ {track.duration}</div>
              </div>
              <button 
                onClick={() => handleApply(track)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Apply
              </button>
            </div>
          ))}

          {!loading && music.length === 0 && (
            <div className="py-12 text-center text-black/60">
              <p>No tracks available in the library.</p>
            </div>
          )}
        </div>
      </div></div>
  );
}

function SuggestedUsersRow({ 
  users,
  currentUser,
  onUpdateUser
}: { 
  users: any[];
  currentUser?: any;
  onUpdateUser?: (u: any) => void;
}) {
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    const myId = String(currentUser?.id || '').trim().toLowerCase();
    const myName = String(currentUser?.name || currentUser?.companyName || '').trim().toLowerCase();
    const myUsername = String(currentUser?.username || '').trim().toLowerCase();
    return users.filter(u => {
      const uid = String(u?.id || u?.userId || u?.username || '').trim().toLowerCase();
      const uname = String(u?.name || u?.companyName || u?.displayName || '').trim().toLowerCase();
      if (myId && (uid === myId || uname === myId)) return false;
      if (myName && (uname === myName || uid === myName)) return false;
      if (myUsername && (uid === myUsername || uname === myUsername)) return false;
      return true;
    });
  }, [users, currentUser]);

  useEffect(() => {
    const syncFollow = () => {
      const currentFollowed = getFollowedUsers();
      const newMap: Record<string, boolean> = {};
      if (Array.isArray(filteredUsers)) {
        filteredUsers.forEach(u => {
          const uid = String(u?.id || u?.userId || u?.username || '');
          if (uid) {
            newMap[uid] = currentFollowed.includes(uid);
          }
        });
      }
      setFollowedMap(newMap);
    };

    syncFollow();
    window.addEventListener('followedUsersUpdated', syncFollow);
    return () => window.removeEventListener('followedUsersUpdated', syncFollow);
  }, [filteredUsers]);

  if (!filteredUsers || filteredUsers.length === 0) return null;

  const handleFollowToggle = async (e: React.MouseEvent, targetUser: any) => {
    e.preventDefault();
    e.stopPropagation();

    const targetId = String(targetUser.id || targetUser.userId || targetUser.username || '');
    if (!targetId) return;

    if (!currentUser?.id) {
      toast.error('Please login to follow businesses and creators');
      return;
    }

    const userName = targetUser.name || targetUser.companyName || targetUser.displayName || targetUser.username || 'User';
    const nextStatus = toggleFollowUser(targetId);

    // Optimistic UI state update
    setFollowedMap(prev => ({ ...prev, [targetId]: nextStatus }));

    // Update target user followers count & current user following count
    const delta = nextStatus ? 1 : -1;
    const currentTargetFollowers = Number(targetUser.followersCount || targetUser.followers?.length || 0);
    const updatedTargetFollowers = Math.max(0, currentTargetFollowers + delta);
    targetUser.followersCount = updatedTargetFollowers;

    if (currentUser) {
      const currentMyFollowing = Number(currentUser.followingCount || currentUser.following?.length || 0);
      const updatedUserFollowing = Math.max(0, currentMyFollowing + delta);
      const updatedCurrentUser = {
        ...currentUser,
        followingCount: updatedUserFollowing,
        following: nextStatus 
          ? Array.from(new Set([...(currentUser.following || []), targetId]))
          : (currentUser.following || []).filter((id: string) => id !== targetId)
      };
      if (onUpdateUser) {
        onUpdateUser(updatedCurrentUser);
      }
      try {
        safeSaveUser(updatedCurrentUser);
        syncUserToFirestore(updatedCurrentUser).catch(() => {});
      } catch (err) {}
    }

    // Sync target user to Firestore
    try {
      syncUserToFirestore({
        ...targetUser,
        id: targetId,
        followersCount: updatedTargetFollowers
      }).catch(() => {});
    } catch (err) {}

    // Call backend API
    try {
      await fetch(`/api/users/${targetId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id })
      });
    } catch (err) {
      console.warn('Backend follow sync error:', err);
    }

    if (nextStatus) {
      toast.success(`‚úì Following ${userName}`);
    } else {
      toast(`Unfollowed ${userName}`, { icon: '‚ÑπÔ∏è' });
    }
  };

  return (
    <div className="py-5 border-y border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm my-3 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
      <div className="px-4 mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
          <h3 className="text-xs sm:text-sm font-black text-black dark:text-zinc-50 uppercase tracking-wider">Suggested for you</h3>
        </div>
        <Link to="/explore" className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1">
          See all
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 no-scrollbar scroll-smooth">
        {filteredUsers.map((u, i) => {
          const userId = u.id || u.userId || u.uid || u._id || u.username || `su-${i}`;
          const userName = u.name || u.companyName || u.displayName || u.username || u.title || 'Vyapar Member';
          const userRole = u.role || (u.companyName ? 'dealer' : 'member');
          const userCity = u.city || u.state || u.location;
          const userAvatar = resolveUserAvatar(u, userName);
          const isFollowing = isUserFollowed(String(userId)) || Boolean(followedMap[String(userId)]);

          return (
            <div 
              key={userId} 
              className="flex-shrink-0 w-36 sm:w-40 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              {/* Profile Avatar with click listener to open profile */}
              <Link 
                to={`/profile/${encodeURIComponent(String(userId))}`} 
                className="relative mb-2.5 block cursor-pointer transition-transform group-hover:scale-105"
                title={`View ${userName}'s profile`}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 dark:border-zinc-800 shadow-inner bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                  <img 
                    src={userAvatar || getInitialsAvatar(userName)} 
                    alt={userName} 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getInitialsAvatar(userName);
                    }}
                    className="w-full h-full object-cover" 
                  />
                </div>
                {u.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5 shadow-md">
                    <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />
                  </div>
                )}
              </Link>

              {/* Profile Name with click listener to open profile */}
              <Link 
                to={`/profile/${encodeURIComponent(String(userId))}`}
                className="w-full mb-1 cursor-pointer group/name block"
                title={`View ${userName}'s profile`}
              >
                <h4 className="font-black text-xs sm:text-sm text-black dark:text-zinc-50 truncate w-full group-hover/name:text-blue-600 transition-colors">
                  {userName}
                </h4>
                {userCity && (
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate w-full flex items-center justify-center gap-0.5 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{userCity}</span>
                  </p>
                )}
              </Link>

              {(u.category || (userRole && userRole !== 'customer')) && (
                <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 mb-3 border border-slate-200/60 dark:border-zinc-700/60 truncate max-w-full">
                  {u.category || userRole}
                </span>
              )}

              {/* Functional Follow / Following Button */}
              <button 
                type="button"
                onClick={(e) => handleFollowToggle(e, u)}
                className={cn(
                  "w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer mt-auto",
                  isFollowing
                    ? "bg-slate-100 hover:bg-red-50 text-slate-800 hover:text-red-600 dark:bg-zinc-800 dark:hover:bg-red-950/40 dark:text-zinc-200 dark:hover:text-red-400 border border-slate-300 dark:border-zinc-700"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
                )}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Feed({ user, onUpdateUser, userLocation }: { user: any, onUpdateUser?: (u: any) => void, userLocation?: {lat: number, lng: number} | null }) {
  // ‚ö° Instant Cache Loading: Synchronously load cached posts & DEFAULT_B2B_POSTS (0ms wait)
  const [posts, setPosts] = useState<any[]>(() => {
    const postMap = new Map<string, any>();
    if (Array.isArray(DEFAULT_B2B_POSTS)) {
      DEFAULT_B2B_POSTS.forEach(p => {
        if (p && p.id) postMap.set(String(p.id), p);
      });
    }
    try {
      const cached = localStorage.getItem('VyaparBridge_cached_posts') || localStorage.getItem('vyapar_posts_cache_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            if (p && p.id) {
              const existing = postMap.get(String(p.id)) || {};
              postMap.set(String(p.id), mergePostSafely(existing, p));
            }
          });
        }
      }
    } catch (e) {}
    const initialList = Array.from(postMap.values()).sort((a: any, b: any) => {
      const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
      const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
    return filterOutHiddenContent(initialList, user?.id);
  });
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('#All');
  const [verifiedUsers, setVerifiedUsers] = useState<any[]>([]);
  const [allDealersList, setAllDealersList] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeStoryPosts, setActiveStoryPosts] = useState<any[] | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Real-time rating synchronization inside Feed component
  useEffect(() => {
    const handleRatingSync = (e: CustomEvent) => {
      const { userId: updatedId, ratingAverage: newAvg, ratingCount: newCount } = e.detail || {};
      setPosts(prev => prev.map(p => {
        const pUser = p.user || {};
        const authorInfo = p.authorInfo || {};
        if (String(p.userId) === String(updatedId) || String(pUser.id) === String(updatedId) || String(authorInfo.id) === String(updatedId)) {
          return {
            ...p,
            user: {
              ...pUser,
              ratingAverage: newAvg,
              ratingCount: newCount
            },
            authorInfo: {
              ...authorInfo,
              ratingAverage: newAvg,
              ratingCount: newCount
            }
          };
        }
        return p;
      }));
    };
    window.addEventListener('ratingUpdated', handleRatingSync);
    return () => window.removeEventListener('ratingUpdated', handleRatingSync);
  }, []);

  // Dynamic Instagram-style Stories & Reels computed from all available posts (both followed & public)
  const userReelGroups = useMemo(() => {
    const cleanRealtime = filterOutHiddenContent(posts, user?.id);
    const reelGroups = new Map<string, any>();
    
    const isStoryPost = (p: any) => {
      if (!p) return false;
      if (p.type === 'video' || p.type === 'reel' || p.type === 'story' || p.type === 'image' || p.type === 'photo' || p.isReel || p.isStory) return true;
      if (p.hashtags && (p.hashtags.includes('#reel') || p.hashtags.includes('#story') || p.hashtags.includes('#tiles'))) return true;
      if (p.mediaUrl || p.videoUrl || p.video || (p.images && p.images.length > 0) || p.thumbnailUrl || p.externalLink) return true;
      return false;
    };

    const validReels = cleanRealtime.filter(p => {
      if (!isStoryPost(p)) return false;
      const createdAtMs = getTimestampMs(p.createdAt);
      const ageMs = Date.now() - createdAtMs;
      return ageMs <= 24 * 60 * 60 * 1000;
    });
    
    validReels.forEach(reel => {
      const uId = String(reel.userId || reel.user?.id || reel.userName || 'unknown');
      // Look up live profile details from database users to guarantee it never has broken/missing avatar
      const liveUser = allUsers.find(u => String(u.id) === uId || (u.username && String(u.username) === uId));
      const authorName = liveUser?.name || liveUser?.companyName || reel.userName || reel.user?.name || reel.user?.companyName || 'Vyapar Member';
      const authorAvatar = liveUser?.avatarUrl || liveUser?.avatar || reel.userAvatar || reel.user?.avatarUrl || reel.user?.avatar || getInitialsAvatar(authorName);
      const isGolden = Boolean(liveUser?.goldenBadge || reel.user?.goldenBadge || reel.goldenBadge || reel.user?.verifiedPlan === 'yearly' || liveUser?.verifiedPlan === 'yearly');
      const isVerified = Boolean(liveUser?.isVerified || reel.user?.isVerified || reel.isVerified || isGolden);

      if (!reelGroups.has(uId)) {
        reelGroups.set(uId, {
          userId: uId,
          userName: authorName,
          userAvatar: authorAvatar,
          isGolden,
          isVerified,
          posts: []
        });
      }
      reelGroups.get(uId).posts.push(reel);
    });

    const groupsList = Array.from(reelGroups.values()).map(g => ({
      ...g,
      posts: g.posts.sort((a: any, b: any) => {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      })
    }));

    // Followed creators appear first, then Golden/Verified accounts, then newest uploads
    return groupsList.sort((a: any, b: any) => {
      const isMe = (g: any) => {
        if (!user) return false;
        const uid = String(g.userId).trim().toLowerCase();
        const myId = String(user.id).trim().toLowerCase();
        const myName = String(user.name || user.companyName || '').trim().toLowerCase();
        const myUsername = String(user.username || '').trim().toLowerCase();
        return uid === myId || (myName && uid === myName) || (myUsername && uid === myUsername);
      };

      const aIsMe = isMe(a);
      const bIsMe = isMe(b);
      if (aIsMe && !bIsMe) return -1;
      if (!aIsMe && bIsMe) return 1;

      const aFollowed = isUserFollowed(a.userId) || (a.userName && isUserFollowed(a.userName));
      const bFollowed = isUserFollowed(b.userId) || (b.userName && isUserFollowed(b.userName));
      if (aFollowed && !bFollowed) return -1;
      if (!aFollowed && bFollowed) return 1;

      if (a.isGolden && !b.isGolden) return -1;
      if (!a.isGolden && b.isGolden) return 1;

      const aTime = a.posts[0]?.createdAt || 0;
      const bTime = b.posts[0]?.createdAt || 0;
      return (typeof bTime === 'number' ? bTime : new Date(bTime).getTime()) - (typeof aTime === 'number' ? aTime : new Date(aTime).getTime());
    });
  }, [posts, user?.id, user?.name, user?.companyName, user?.username, allUsers]);

  const currentUserReels = useMemo(() => {
    if (!user) return [];
    const isMe = (g: any) => {
      const uid = String(g.userId).trim().toLowerCase();
      const myId = String(user.id).trim().toLowerCase();
      const myName = String(user.name || user.companyName || '').trim().toLowerCase();
      const myUsername = String(user.username || '').trim().toLowerCase();
      return uid === myId || (myName && uid === myName) || (myUsername && uid === myUsername);
    };
    const meGroup = userReelGroups.find(g => isMe(g));
    return meGroup ? meGroup.posts : [];
  }, [userReelGroups, user]);

  const otherUserReelGroups = useMemo(() => {
    const isMe = (g: any) => {
      if (!user) return false;
      const uid = String(g.userId).trim().toLowerCase();
      const myId = String(user.id).trim().toLowerCase();
      const myName = String(user.name || user.companyName || '').trim().toLowerCase();
      const myUsername = String(user.username || '').trim().toLowerCase();
      return uid === myId || (myName && uid === myName) || (myUsername && uid === myUsername);
    };
    return userReelGroups.filter(g => !isMe(g));
  }, [userReelGroups, user]);
  const [isUploadingReel, setIsUploadingReel] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [pendingReelFile, setPendingReelFile] = useState<File | null>(null);
  const [reelOriginalVolume, setReelOriginalVolume] = useState<number>(1);
  const [reelMusicVolume, setReelMusicVolume] = useState<number>(1);
  const reelFileInputRef = React.useRef<HTMLInputElement>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<any>(null);
  const [reelPreviewUrl, setReelPreviewUrl] = useState<string | null>(null);
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [reelAspectRatio, setReelAspectRatio] = useState<'9/16' | '16/9' | '1/1'>('9/16');
  const [brandAdsList, setBrandAdsList] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [adSlideDirection, setAdSlideDirection] = useState<number>(1);
  const [isBrandAdDismissed, setIsBrandAdDismissed] = useState(false);

  // Facebook-style Header User Live Search states
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);

  // Facebook-style Live Upload Progress states
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingProgressVisible, setIsUploadingProgressVisible] = useState<boolean>(false);
  const [uploadingMediaThumbnail, setUploadingMediaThumbnail] = useState<string | null>(null);
  const [reelCaption, setReelCaption] = useState<string>('');

  const fetchPosts = async () => {
    if (user?.id) {
      getUsersBlockedAndNotInterestedFromFirestore(user.id).then(remoteHidden => {
        const { localBlockedKey, localNotInterestedKey } = getUserHiddenFilters(user.id);
        if (remoteHidden.blockedUsers.length > 0) {
          let bList: string[] = [];
          try { bList = JSON.parse(localStorage.getItem(localBlockedKey) || '[]'); } catch(e){}
          const mergedB = Array.from(new Set([...bList, ...remoteHidden.blockedUsers]));
          localStorage.setItem(localBlockedKey, JSON.stringify(mergedB));
        }
        if (remoteHidden.notInterestedPosts.length > 0) {
          let niList: string[] = [];
          try { niList = JSON.parse(localStorage.getItem(localNotInterestedKey) || '[]'); } catch(e){}
          const mergedNI = Array.from(new Set([...niList, ...remoteHidden.notInterestedPosts]));
          localStorage.setItem(localNotInterestedKey, JSON.stringify(mergedNI));
        }
      }).catch(() => {});
    }

    const query = user?.id ? `?currentUserId=${user.id}` : '';
    const [backendResult, firestoreResult] = await Promise.allSettled([
      safeFetch(`/api/posts${query}`),
      fetchPostsFromFirestore()
    ]);

    let fetchedBackendPosts: any[] = [];
    if (backendResult.status === 'fulfilled' && Array.isArray(backendResult.value)) {
      fetchedBackendPosts = backendResult.value;
    }

    let fbPosts: any[] = [];
    if (firestoreResult.status === 'fulfilled' && Array.isArray(firestoreResult.value)) {
      fbPosts = firestoreResult.value;
    }

    setPosts(prev => {
      const postMap = new Map<string, any>();
      DEFAULT_B2B_POSTS.forEach(p => {
        if (p && p.id) postMap.set(String(p.id), p);
      });
      prev.forEach(p => {
        if (p && p.id) postMap.set(String(p.id), p);
      });
      fetchedBackendPosts.forEach(p => {
        if (p && p.id) {
          const existing = postMap.get(String(p.id)) || {};
          postMap.set(String(p.id), mergePostSafely(existing, p));
        }
      });
      fbPosts.forEach(p => {
        if (p && p.id) {
          const existing = postMap.get(String(p.id)) || {};
          postMap.set(String(p.id), mergePostSafely(existing, p));
        }
      });

      const allCombined = Array.from(postMap.values()).sort((a, b) => {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      try {
        localStorage.setItem('VyaparBridge_cached_posts', JSON.stringify(allCombined.slice(0, 100)));
      } catch(e) {}

      return filterOutHiddenContent(allCombined, user?.id);
    });
    setLoading(false);
  };

  useEffect(() => {
    const handleDeleted = (e: any) => {
      const deletedId = e.detail?.postId || e.detail?.reelId;
      if (deletedId) {
        setPosts(prev => prev.filter(p => String(p.id) !== String(deletedId)));
      }
    };
    const handleBlocked = (e: any) => {
      const blockedId = e.detail?.userId;
      if (blockedId) {
        setPosts(prev => prev.filter(p => String(p.userId || p.user?.id) !== String(blockedId)));
        setSuggestedUsers(prev => prev.filter(u => String(u.id) !== String(blockedId)));
        setVerifiedUsers(prev => prev.filter(u => String(u.id) !== String(blockedId)));
        setAllDealersList(prev => prev.filter(u => String(u.id) !== String(blockedId)));
      }
    };
    const handleNotInterested = (e: any) => {
      const pId = e.detail?.postId;
      if (pId) {
        setPosts(prev => prev.filter(p => String(p.id) !== String(pId)));
      }
    };
    const handlePostCreated = (e: any) => {
      const newPost = e.detail;
      if (newPost && newPost.id) {
        setPosts(prev => {
          if (prev.some(p => String(p.id) === String(newPost.id))) {
            return prev.map(p => String(p.id) === String(newPost.id) ? { ...p, ...newPost } : p);
          }
          return [newPost, ...prev];
        });
      }
    };

    window.addEventListener('postDeleted', handleDeleted);
    window.addEventListener('reelDeleted', handleDeleted);
    window.addEventListener('userBlocked', handleBlocked);
    window.addEventListener('notInterestedUpdated', handleNotInterested);
    window.addEventListener('postCreated', handlePostCreated);
    return () => {
      window.removeEventListener('postDeleted', handleDeleted);
      window.removeEventListener('reelDeleted', handleDeleted);
      window.removeEventListener('userBlocked', handleBlocked);
      window.removeEventListener('notInterestedUpdated', handleNotInterested);
      window.removeEventListener('postCreated', handlePostCreated);
    };
  }, []);

  const fetchSuggestedUsers = () => {
    safeFetch(`/api/users/suggested?userId=${user?.id || ''}&limit=12`)
      .then(data => {
        if (Array.isArray(data)) {
          const cleanUsers = filterOutHiddenContent(data, user?.id);
          setSuggestedUsers(cleanUsers);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchPosts();
    fetchSuggestedUsers();

    // Instant real-time multi-device sync via Firestore WebSockets ($0/month on Vercel & Firebase)
    const unsubscribePosts = subscribeToPostsFromFirestore((realtimePosts) => {
      if (Array.isArray(realtimePosts)) {
        const cleanRealtime = filterOutHiddenContent(realtimePosts, user?.id);
        
        setPosts(prev => {
          const map = new Map<string, any>();
          DEFAULT_B2B_POSTS.forEach(p => {
            if (p && p.id) map.set(String(p.id), p);
          });
          prev.filter(p => p.isMyUpload || p.pending_admin_approval).forEach(p => {
             map.set(String(p.id), p);
          });
          cleanRealtime.forEach(p => {
             map.set(String(p.id), p);
          });
          return Array.from(map.values()).sort((a, b) => {
            const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
            const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
            return timeB - timeA;
          });
        });
        setLoading(false);
      }
    });

    const unsubscribeUsers = subscribeToUsersFromFirestore((realtimeUsers) => {
      if (Array.isArray(realtimeUsers) && realtimeUsers.length > 0) {
        const cleanUsers = filterOutHiddenContent(realtimeUsers, user?.id);
        setAllUsers(cleanUsers);
        setAllDealersList(cleanUsers.filter((u: any) => u.role === 'dealer' || u.role === 'factory'));
        setVerifiedUsers(cleanUsers.filter((u: any) => u.isVerified).map((u: any) => ({ ...u, isFollowing: isUserFollowed(u.id) })));
        setSuggestedUsers(cleanUsers.filter((u: any) => String(u.id) !== String(user?.id)).slice(0, 20));
      }
    });

    const usersQuery = user?.id ? `?currentUserId=${user.id}` : '';
    safeFetch(`/api/users${usersQuery}`)
      .then(data => {
        if (Array.isArray(data)) {
          const cleanUsers = filterOutHiddenContent(data, user?.id);
          setAllUsers(cleanUsers);
          setAllDealersList(cleanUsers.filter((u: any) => u.role === 'dealer' || u.role === 'factory'));
          setVerifiedUsers(cleanUsers.filter((u: any) => u.isVerified).map((u: any) => ({ ...u, isFollowing: isUserFollowed(u.id) })));
        }
      })
      .catch(() => {});

    safeFetch('/api/announcements')
      .then(data => {
        if (Array.isArray(data)) setAnnouncements(data);
      })
      .catch(() => {});

    fetchBrandAds();

    // Polling removed to save Firebase quota

    const unsubscribeBrandAds = subscribeToBrandAdsFromFirestore((fbAds) => {
      if (Array.isArray(fbAds) && fbAds.length > 0) {
        const activeAds = fbAds.filter((a: any) => a.isActive !== false);
        setBrandAdsList(activeAds);
        setIsBrandAdDismissed(false);
      }
    });

    const handleAdsUpdated = () => {
      setIsBrandAdDismissed(false);
      fetchBrandAds();
    };

    window.addEventListener('brandAdsUpdated', handleAdsUpdated);
    return () => {
      // clearInterval removed
      window.removeEventListener('brandAdsUpdated', handleAdsUpdated);
      if (typeof unsubscribeBrandAds === 'function') unsubscribeBrandAds();
      if (typeof unsubscribePosts === 'function') unsubscribePosts();
      if (typeof unsubscribeUsers === 'function') unsubscribeUsers();
    };
  }, [user?.id]);

  const fetchBrandAds = () => {
    safeFetch('/api/admin/showcase')
      .then(data => {
        let serverList: any[] = [];
        if (data && Array.isArray(data.brandAdsList)) {
          serverList = data.brandAdsList.filter((a: any) => a.isActive !== false);
        } else if (data && data.isActive && (data.videoUrl || data.mediaUrl)) {
          serverList = [{
            id: 'legacy-1',
            type: 'video',
            title: data.title || 'Brand Showcase',
            companyName: data.companyName || 'Featured Partner',
            mediaUrl: data.videoUrl || data.mediaUrl,
            linkUrl: data.linkUrl || '',
            description: data.description || '',
            isActive: true
          }];
        }

        try {
          const rawLocal = localStorage.getItem('local_brand_ads');
          if (rawLocal) {
            const localAds = JSON.parse(rawLocal);
            if (Array.isArray(localAds) && localAds.length > 0) {
              const activeLocal = localAds.filter((a: any) => a.isActive !== false);
              const map = new Map();
              serverList.forEach((ad: any) => map.set(ad.id, ad));
              activeLocal.forEach((ad: any) => {
                if (map.has(ad.id)) {
                  const existing = map.get(ad.id);
                  map.set(ad.id, { ...existing, ...ad, localMediaKey: ad.localMediaKey || existing.localMediaKey });
                } else {
                  map.set(ad.id, ad);
                }
              });
              setBrandAdsList(Array.from(map.values()));
              return;
            }
          }
        } catch (e) {}

        setBrandAdsList(serverList);
      })
      .catch(() => {
        try {
          const rawLocal = localStorage.getItem('local_brand_ads');
          if (rawLocal) {
            const localAds = JSON.parse(rawLocal);
            if (Array.isArray(localAds)) {
              setBrandAdsList(localAds.filter((a: any) => a.isActive !== false));
            }
          }
        } catch (e) {}
      });
  };

  // Automatic Slider for Top Brand Showcase Ads & Announcements (Rotates every 5s infinitely)
  useEffect(() => {
    const combinedList = [...brandAdsList].filter(a => a.isActive !== false);
    if (combinedList.length === 0 || isBrandAdDismissed) return;

    const currentAd = combinedList[((currentAdIndex % combinedList.length) + combinedList.length) % combinedList.length] || combinedList[0];
    const isVideo = currentAd?.type === 'video' || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(currentAd?.mediaUrl || '');
    const isYouTube = (currentAd?.mediaUrl || '').includes('youtube.com') || (currentAd?.mediaUrl || '').includes('youtu.be');

    // Interval time: 5000ms (5 seconds) for image banners/ads as requested, video safety timeout
    const slideInterval = isYouTube ? 15000 : (isVideo ? 35000 : 5000);

    const timer = setTimeout(() => {
      setAdSlideDirection(1);
      setCurrentAdIndex(prev => (prev + 1) % combinedList.length);
    }, slideInterval);

    return () => clearTimeout(timer);
  }, [brandAdsList, currentAdIndex, isBrandAdDismissed]);

  useEffect(() => {
    const syncFollow = () => {
      setVerifiedUsers(prev => prev.map(u => ({ ...u, isFollowing: isUserFollowed(u.id) })));
    };
    window.addEventListener('followedUsersUpdated', syncFollow);
    return () => window.removeEventListener('followedUsersUpdated', syncFollow);
  }, []);

  const handleFollowInSpotlight = async (userId: string) => {
    if (!user?.id) {
      toast.error('Please login to follow users');
      return;
    }

    // Optimistic update
    const next = toggleFollowUser(userId);
    setVerifiedUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isFollowing: next } : u
    ));

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: user.id })
      });
      const data = await response.json();
      if (!data.success) {
        // Revert
        toggleFollowUser(userId);
        setVerifiedUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isFollowing: !next } : u
        ));
        toast.error(data.error || 'Failed to update follow status');
      }
    } catch (err) {
      // Revert
      toggleFollowUser(userId);
      setVerifiedUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isFollowing: !next } : u
      ));
      console.error(err);
    }
  };

  const handleDirectReelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.id || user?.id?.startsWith('demo_')) {
      toast.error('üîê Only registered Buyers and Sellers can upload reels or stories. Please register or login!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      if (e.target) e.target.value = '';
      return;
    }
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Instant preview generation (0.001s zero delay)
    const isVideoFile = selectedFile.type.startsWith('video') || /\.(mp4|webm|mov|m4v|mkv)$/i.test(selectedFile.name);
    setIsMediaReady(!isVideoFile); // For images, media is ready INSTANTLY!
    setReelAspectRatio('9/16');
    setPendingReelFile(selectedFile);
    const objUrl = URL.createObjectURL(selectedFile);
    setReelPreviewUrl(objUrl);
    setIsPreviewModalOpen(true);
    if (e.target) e.target.value = '';

    // Asynchronous background duration check without auto-dismissing
    validateMediaDuration(selectedFile).then(validation => {
      if (!validation.valid) {
        toast.info('Note: Long videos (>60s) may process longer.', { id: 'reel_duration_note' });
      }
    }).catch(() => {});
  };

  const handleCustomAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const tid = toast.loading('Uploading sound...');
    try {
      const audioDataUrl = await fileToDataURL(file);
      const customMusicObj = {
        id: `music_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, "") || 'Custom Sound',
        artist: user?.name || 'User Upload',
        audioUrl: audioDataUrl,
        musicUrl: audioDataUrl,
        url: audioDataUrl
      };

      setSelectedMusic(customMusicObj);
      toast.success('üéµ Sound selected & previewing!', { id: tid });

      // Background upload to server
      try {
        const formData = new FormData();
        formData.append('musicFile', file);
        formData.append('title', customMusicObj.title);
        formData.append('artist', customMusicObj.artist);
        fetch('/api/music', { method: 'POST', body: formData }).catch(() => {});
      } catch (e) {}
    } catch (err) {
      toast.error('Upload failed', { id: tid });
    }
    if (e.target) e.target.value = '';
  };

  const finalizeReelUpload = async () => {
    if (!pendingReelFile) return;

    if (!user?.id || user?.id?.startsWith('demo_') || user?.id?.startsWith('user_guest_')) {
      toast.error('üîê Only registered Buyers and Sellers can upload reels or stories. Please register or login!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      setIsPreviewModalOpen(false);
      return;
    }

    const isVideoFile = pendingReelFile.type.startsWith('video') || /\.(mp4|webm|mov|m4v|mkv)$/i.test(pendingReelFile.name);
    const mediaType = isVideoFile ? 'video' : 'image';
    const reelId = `reel_${Date.now()}`;

    // Close preview modal and show live progress
    setIsPreviewModalOpen(false);
    setIsUploadingReel(true);
    setIsUploadingProgressVisible(true);
    setUploadProgress(25);
    
    if (isVideoFile) {
      setUploadingMediaThumbnail(null);
      generateVideoThumbnail(pendingReelFile).then(thumb => {
        setUploadingMediaThumbnail(thumb);
      }).catch(() => {
        setUploadingMediaThumbnail(reelPreviewUrl);
      });
    } else {
      setUploadingMediaThumbnail(reelPreviewUrl);
    }

    // Smooth responsive progress simulation without artificial stall caps
    let currentPct = 25;
    const progressTimer = setInterval(() => {
      currentPct += Math.floor(Math.random() * 15) + 12;
      if (currentPct > 95) currentPct = 95;
      setUploadProgress(currentPct);
    }, 150);

    // 1. Direct Firebase Storage Upload for Permanent Vercel & Multi-device Playback
    let firebaseStorageUrl = '';
    try {
      const sanitizedName = (pendingReelFile.name || 'video.mp4').replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `reels/${reelId}_${sanitizedName}`;
      uploadFileToFirebaseStorage(
        pendingReelFile,
        storagePath,
        (pct) => {
          setUploadProgress(Math.max(currentPct, Math.round(pct)));
        }
      ).then(url => {
        if (url) firebaseStorageUrl = url;
      }).catch(err => {
        console.warn('Storage background upload note:', err);
      });
    } catch (storageErr) {
      console.warn('Direct Firebase Storage upload note:', storageErr);
    }

    // Convert file to resilient persistent Data URL & Thumbnail
    let persistentMediaUrl = firebaseStorageUrl || '';
    let videoThumbnailUrl = '';
    let videoStreamUrl = firebaseStorageUrl || reelPreviewUrl || (pendingReelFile ? URL.createObjectURL(pendingReelFile) : '');
    try {
      if (!isVideoFile) {
        persistentMediaUrl = firebaseStorageUrl || (await optimizeImageForPersistence(pendingReelFile));
        videoThumbnailUrl = persistentMediaUrl;
      } else {
        videoThumbnailUrl = await generateVideoThumbnail(pendingReelFile);
        if (!firebaseStorageUrl && pendingReelFile.size <= 0.5 * 1024 * 1024) {
          try {
            const videoBase64 = await fileToDataURL(pendingReelFile);
            if (videoBase64 && videoBase64.startsWith('data:video')) {
              videoStreamUrl = videoBase64;
              persistentMediaUrl = videoBase64;
            }
          } catch (e) {}
        }
        if (!persistentMediaUrl) {
          persistentMediaUrl = firebaseStorageUrl || videoThumbnailUrl;
        }

        // Save local video cache
        try {
          await saveVideoBlob(reelId, pendingReelFile);
          cacheVideoUrlInMemory(reelId, videoStreamUrl || localMediaUrl);
        } catch (e) {
          console.warn('Failed to save reel video blob:', e);
        }
      }
    } catch (e) {
      console.warn('Reel file conversion note:', e);
    }

    const localMediaUrl = firebaseStorageUrl || (isVideoFile ? (videoStreamUrl || videoThumbnailUrl) : (persistentMediaUrl || videoThumbnailUrl));

    const authorName = user?.name || localStorage.getItem('vyapar_user_name') || 'Vyapar Member';
    const authorAvatar = user?.avatarUrl || user?.avatar || localStorage.getItem('vyapar_user_avatar') || BRAND_LOGO_SRC;
    const authorRole = user?.role || 'factory';

    const authorUser = {
      id: String(user?.id || `user_guest_${Date.now()}`),
      name: authorName,
      avatarUrl: authorAvatar,
      avatar: authorAvatar,
      role: authorRole,
      isVerified: Boolean(user?.isVerified ?? false)
    };

    const musicObj = selectedMusic ? {
      id: selectedMusic.id,
      title: selectedMusic.title || 'Selected Music',
      artist: selectedMusic.artist || 'Vyapar Bridge',
      audioUrl: selectedMusic.audioUrl || selectedMusic.musicUrl || selectedMusic.url
    } : null;

    const moderation = await moderateContentUniversally({
      title: reelCaption.trim() || 'New B2B Reel',
      content: reelCaption.trim() || 'Uploaded Story & Reel',
      hashtags: '#reel #b2b #tiles #products #story',
      mediaType: mediaType,
      mediaUrl: localMediaUrl,
      userId: authorUser.id,
      userRole: authorUser.role
    });

    const isPendingApproval = !moderation.approved;

    const finalReelPost = {
      id: reelId,
      userId: authorUser.id,
      userName: authorUser.name,
      userRole: authorUser.role,
      userAvatar: authorUser.avatarUrl,
      title: reelCaption.trim() || 'New B2B Reel',
      content: reelCaption.trim() || 'Uploaded Story & Reel',
      hashtags: '#reel #b2b #tiles #products #story',
      type: mediaType,
      mediaUrl: localMediaUrl,
      ...(isVideoFile ? { videoUrl: videoStreamUrl, video: videoStreamUrl } : {}),
      thumbnailUrl: videoThumbnailUrl || localMediaUrl,
      persistentMediaUrl: persistentMediaUrl || videoThumbnailUrl || localMediaUrl,
      category: 'Commercial Wholesale', postedFrom: 'navbar', isPermanent: false,
      visibility: 'public',
      status: isPendingApproval ? 'pending' : 'approved',
      pending_admin_approval: isPendingApproval,
      aiFlagReason: moderation.reason || null,
      likesCount: 0,
      viewsCount: 1,
      createdAt: Date.now(),
      music: musicObj,
      user: authorUser,
      isMyUpload: true
    };

    // Save reel ID in user's created reels list so the story circle stays visible even after reload
    try {
      const existingStr = localStorage.getItem('vyapar_my_reel_ids');
      const existingIds = existingStr ? JSON.parse(existingStr) : [];
      if (!existingIds.includes(reelId)) {
        existingIds.unshift(reelId);
        localStorage.setItem('vyapar_my_reel_ids', JSON.stringify(existingIds.slice(0, 50)));
      }
    } catch (e) {}

    // Complete progress and render immediately to Home Feed, Story, and Profile Page
    clearInterval(progressTimer);
    setUploadProgress(100);

    setPosts(prev => [finalReelPost, ...prev]);
    window.dispatchEvent(new CustomEvent('postCreated', { detail: finalReelPost }));
    window.dispatchEvent(new CustomEvent('storyCreated', { detail: finalReelPost }));

    playBubblePopSound();
    if (isPendingApproval) {
      toast.info(moderation.userNotice || '‚è≥ Business Verification: Aapka post Admin Review me bhej diya gaya hai. Business network security ke liye moderation team verify karegi.');
    } else {
      toast.success('üéâ Reel & Story uploaded to your Profile Page and Story Feed!');
    }

    // Background server & Firestore sync without blocking UI
    (async () => {
      try {
        let targetUrl = localMediaUrl;
        let finalThumbnailUrl = videoThumbnailUrl || localMediaUrl;

        const formData = new FormData();
        formData.append("id", reelId);
        formData.append("title", finalReelPost.title);
        formData.append("content", finalReelPost.content);
        formData.append("hashtags", finalReelPost.hashtags);
        formData.append("userId", authorUser.id);
        formData.append("userName", authorUser.name);
        formData.append("userRole", authorUser.role);
        formData.append("userAvatar", authorUser.avatarUrl);
        formData.append("type", mediaType);
        formData.append("thumbnailUrl", videoThumbnailUrl || localMediaUrl);
        formData.append("persistentMediaUrl", persistentMediaUrl || videoThumbnailUrl || localMediaUrl);
        formData.append("media", pendingReelFile);

        const res = await fetch("/api/posts", { method: "POST", body: formData });
        const data = await res.json();

        if (data && data.success && data.post && data.post.mediaUrl) {
          const serverMediaUrl = data.post.mediaUrl;
          const isPersistent = (serverMediaUrl.startsWith("data:") || serverMediaUrl.startsWith("https://") || serverMediaUrl.startsWith("http://") || serverMediaUrl.startsWith("/uploads")) && !serverMediaUrl.includes("localhost");
          if (isPersistent) {
            targetUrl = serverMediaUrl;
          }
          if (data.post.thumbnailUrl) {
            finalThumbnailUrl = data.post.thumbnailUrl;
          }
        }

        const syncedPost = {
          ...finalReelPost,
          mediaUrl: targetUrl,
          videoUrl: targetUrl,
          video: targetUrl,
          persistentMediaUrl: targetUrl,
          thumbnailUrl: finalThumbnailUrl,
          isStory: true,
          isReel: isVideoFile
        };

        setPosts(prev => {
          const updated = prev.map(p => String(p.id) === String(reelId) ? { ...p, ...syncedPost } : p);
          try {
            localStorage.setItem('VyaparBridge_cached_posts', JSON.stringify(updated.slice(0, 100)));
          } catch (e) {}
          return updated;
        });

        try {
          const existingStoryStr = localStorage.getItem('vyapar_my_stories');
          const existingStories = existingStoryStr ? JSON.parse(existingStoryStr) : [];
          const filteredStories = existingStories.filter((s: any) => String(s.id) !== String(reelId));
          localStorage.setItem('vyapar_my_stories', JSON.stringify([syncedPost, ...filteredStories].slice(0, 50)));
        } catch (e) {}

        window.dispatchEvent(new CustomEvent('postUpdated', { detail: syncedPost }));
        window.dispatchEvent(new CustomEvent('postCreated', { detail: syncedPost }));
        window.dispatchEvent(new CustomEvent('storyCreated', { detail: syncedPost }));

        await syncPostToFirestore(syncedPost);
      } catch (e) {
        console.warn("Background sync note:", e);
      }
    })();

    setTimeout(() => {
      setIsUploadingProgressVisible(false);
      setIsUploadingReel(false);
      setPendingReelFile(null);
      setReelPreviewUrl(null);
      setSelectedMusic(null);
      setReelCaption('');
    }, 1500);
  };

  const filteredPosts = posts.filter(p => {
    if (!selectedTag || selectedTag === '#All' || selectedTag === '#Latest') return true;
    if (selectedTag === '#Reels') return p.type === 'video' || p.mediaUrl?.match(/\.(mp4|webm|mov|m4v)$/i);
    const tagKeyword = selectedTag.replace('#', '').toLowerCase();
    const titleStr = p.title || '';
    const contentStr = p.content || '';
    const hashtagsStr = p.hashtags || '';
    const combined = `${titleStr} ${contentStr} ${hashtagsStr}`.toLowerCase();
    return combined.includes(tagKeyword);
  }).sort((a, b) => {
    // Lookup full user to get accurate badge statuses
    const getUser = (post) => {
      const uId = String(post.userId || post.user?.id || '');
      // If it's my own post, use my latest user state
      if (user?.id && uId === String(user.id)) return user;
      
      const liveUser = allUsers.find(u => String(u.id) === uId || (u.username && String(u.username) === uId));
      if (liveUser) return liveUser;
      
      return post.user || {}; // fallback to post's embedded user object
    };
    
    const uA = getUser(a);
    const uB = getUser(b);

    const isAGolden = uA.goldenBadge || uA.verifiedPlan === 'yearly';
    const isBGolden = uB.goldenBadge || uB.verifiedPlan === 'yearly';
    const isABlue = uA.isVerified;
    const isBBlue = uB.isVerified;

    if (isAGolden && !isBGolden) return -1;
    if (!isAGolden && isBGolden) return 1;

    if (isABlue && !isBBlue) return -1;
    if (!isABlue && isBBlue) return 1;

    const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
    const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  if (loading) return <div className="flex justify-center pt-10"><div className="w-8 h-8 border-4 border-slate-200 dark:border-zinc-800 border-t-black rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-2xl lg:max-w-3xl mx-auto w-full pb-20 md:pb-0 pt-6 px-2 sm:px-4">
      {/* Top Reels/Stories Tray */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-3.5 pt-1 mb-4 border-b border-slate-200/80 dark:border-zinc-800/80 hide-scrollbar scroll-smooth">
        
        {/* Create Story Card (Always First, Facebook style) */}
        <div 
          onClick={() => reelFileInputRef.current?.click()}
          className="w-[110px] sm:w-[130px] h-[170px] sm:h-[200px] rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer shrink-0 flex flex-col relative group select-none"
        >
          {/* Top 65% of card is the user's avatar as background */}
          <div className="h-[65%] w-full bg-slate-100 dark:bg-zinc-950 overflow-hidden relative">
            <img 
              src={user?.avatarUrl || user?.avatar || getInitialsAvatar(user?.name || 'You')} 
              alt="You" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getInitialsAvatar(user?.name || 'You');
              }}
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
          </div>
          {/* Bottom 35% has the + icon overlapping and the text */}
          <div className="h-[35%] w-full flex flex-col items-center justify-end pb-2.5 px-2 relative bg-white dark:bg-zinc-900">
            {/* Overlapping Plus Icon */}
            <div className="absolute -top-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white p-1.5 rounded-full border-[3px] border-white dark:border-zinc-900 shadow-md flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <Plus className="w-4 h-4 stroke-[3px]" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 leading-tight">Create Story</span>
          </div>
        </div>

        {/* Your Story (If you have one) */}
        {currentUserReels.length > 0 && (
          <div 
            onClick={() => {
              setActiveStoryPosts(currentUserReels);
              setActiveStoryIndex(0);
            }}
            className="w-[110px] sm:w-[130px] h-[170px] sm:h-[200px] rounded-2xl overflow-hidden bg-black shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer shrink-0 relative group select-none"
          >
            {/* Story cover background image/thumbnail */}
            <div className="absolute inset-0">
              <img 
                src={currentUserReels[0].thumbnailUrl || currentUserReels[0].mediaUrl} 
                alt="Your story cover" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=60';
                }}
              />
              {/* Soft dark overlay for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
            </div>

            {/* Profile Avatar inside the card (top-left) */}
            <div className="absolute top-2.5 left-2.5 z-10">
              <div className={`p-[1.5px] rounded-full ${user?.goldenBadge ? 'story-golden-gradient' : 'story-rainbow-gradient'}`}>
                <div className="p-[1px] bg-white dark:bg-zinc-950 rounded-full">
                  <img 
                    src={user?.avatarUrl || user?.avatar || getInitialsAvatar(user?.name || 'You')} 
                    alt="Your Avatar" 
                    className="w-7 h-7 rounded-full object-cover border border-slate-100 dark:border-zinc-800"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getInitialsAvatar(user?.name || 'You');
                    }}
                  />
                </div>
              </div>
            </div>

            {/* User Name at bottom */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
              <p className="text-[10px] sm:text-[11px] font-bold text-white truncate drop-shadow">Your Story</p>
            </div>
          </div>
        )}

        {/* Other Users' Reel/Story Cards */}
        {otherUserReelGroups.map((group) => {
          const authorAvatar = group.userAvatar || getInitialsAvatar(group.userName);
          const isGolden = Boolean(group.isGolden);
          const firstPost = group.posts[0] || {};
          const coverUrl = firstPost.thumbnailUrl || firstPost.mediaUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=60';

          return (
            <div 
              key={group.userId} 
              onClick={() => {
                setActiveStoryPosts(group.posts);
                setActiveStoryIndex(0);
              }}
              className="w-[110px] sm:w-[130px] h-[170px] sm:h-[200px] rounded-2xl overflow-hidden bg-black shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer shrink-0 relative group select-none"
            >
              {/* Story cover background image */}
              <div className="absolute inset-0">
                <img 
                  src={coverUrl} 
                  alt={group.userName} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=60';
                  }}
                />
                {/* Soft dark overlay for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
              </div>

              {/* Profile Avatar inside the card (top-left) */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <div className={`p-[1.5px] rounded-full ${isGolden ? 'story-golden-gradient' : 'story-rainbow-gradient'}`}>
                  <div className="p-[1px] bg-white dark:bg-zinc-950 rounded-full">
                    <img 
                      src={authorAvatar} 
                      alt={group.userName} 
                      className="w-7 h-7 rounded-full object-cover border border-slate-100 dark:border-zinc-800"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = getInitialsAvatar(group.userName);
                      }}
                    />
                  </div>
                </div>

                {isGolden ? (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black rounded-full p-0.5 border border-white dark:border-zinc-950 shadow" title="Golden Verified Partner">
                    <Award className="w-1.5 h-1.5 fill-black" />
                  </div>
                ) : group.isVerified ? (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border border-white dark:border-zinc-950 shadow" title="Verified Business">
                    <CheckCircle2 className="w-1.5 h-1.5 fill-white text-blue-500" />
                  </div>
                ) : null}
              </div>

              {/* User Name at bottom */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                <p className="text-[10px] sm:text-[11px] font-bold text-white truncate drop-shadow">{group.userName}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden reel file input for direct upload */}
      <input 
        type="file" 
        ref={reelFileInputRef} 
        accept="video/*,image/*" 
        className="hidden" 
        onChange={handleDirectReelUpload} 
      />

      {/* Facebook-style Live Uploading Progress Banner Bar */}
      {isUploadingProgressVisible && (
        <div className="mb-4 bg-slate-900 border border-blue-500/50 rounded-2xl p-3 shadow-2xl text-white flex flex-col gap-2 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {uploadingMediaThumbnail ? (
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-black border border-blue-500/60 shrink-0 shadow">
                  <img src={uploadingMediaThumbnail} alt="Uploading media" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-blue-400 animate-bounce" />
                </div>
              )}
              <div>
                <div className="text-xs font-black flex items-center gap-2">
                  <span>{uploadProgress === 100 ? 'üéâ Upload Complete!' : 'Uploading your feedback today your profile page and story...'}</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {uploadProgress === 100 ? 'Your feedback video & story is live on your profile page and story feed!' : 'Publishing to Profile & Story in progress...'}
                </div>
              </div>
            </div>
            {uploadProgress === 100 && (
              <span className="text-xs bg-emerald-500 text-slate-950 font-black px-2.5 py-1 rounded-lg">
                ‚úì Live
              </span>
            )}
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
            <div 
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Sponsored Brand Showcase Carousel / Playlist (Videos, Youtube Links & Banners) */}
      {(() => {
        const combinedAdsList = [...brandAdsList].filter(a => a.isActive !== false);
        if (combinedAdsList.length === 0 || isBrandAdDismissed) return null;

        const normalizedActiveIndex = ((currentAdIndex % combinedAdsList.length) + combinedAdsList.length) % combinedAdsList.length;
        const activeAd = combinedAdsList[normalizedActiveIndex] || combinedAdsList[0];

        const handleNextAd = (total: number) => {
          setAdSlideDirection(1);
          setCurrentAdIndex((prev) => (prev + 1) % total);
        };

        const handlePrevAd = (total: number) => {
          setAdSlideDirection(-1);
          setCurrentAdIndex((prev) => (prev - 1 + total) % total);
        };

        const handleSelectAdIndex = (idx: number) => {
          setAdSlideDirection(idx >= normalizedActiveIndex ? 1 : -1);
          setCurrentAdIndex(idx);
        };
        
        return (
          <div className="mb-6 bg-white dark:bg-zinc-950 border-2 border-amber-500/80 dark:border-amber-500/60 rounded-2xl overflow-hidden shadow-2xl relative text-zinc-900 dark:text-zinc-100 transition-all duration-300">
            {/* Header: Large Bold Rainbow Animated Company / Seller Name ONLY with clean Skip Ad button */}
            <div className="w-full px-4 py-3 sm:py-3.5 bg-zinc-950 border-b border-amber-500/40 backdrop-blur-md flex items-center justify-between gap-3 select-none">
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wide rainbow-bold-animated-text truncate leading-tight drop-shadow-md">
                  {activeAd.companyName || activeAd.title || 'VYAPAR BRAND SHOWCASE'}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-700 shadow-sm">
                  <button 
                    onClick={() => handlePrevAd(combinedAdsList.length)}
                    className="p-1 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer text-amber-400"
                    title="Previous Ad"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <span className="text-[10px] text-amber-300 font-black px-1 font-mono">
                    {normalizedActiveIndex + 1}/{combinedAdsList.length}
                  </span>
                  <button 
                    onClick={() => handleNextAd(combinedAdsList.length)}
                    className="p-1 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer text-amber-400"
                    title="Next Ad"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Skip Ad Button */}
                <button 
                  onClick={() => {
                    setIsBrandAdDismissed(true);
                    toast('Ad showcase skipped', { icon: 'üëÅÔ∏è' });
                  }}
                  className="flex items-center justify-center gap-1 p-1.5 sm:px-3 sm:py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black border border-rose-400/50 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                  title="Skip Advertisement (‡§µ‡§ø‡§ú‡•ç‡§û‡§æ‡§™‡§® ‡§π‡§ü‡§æ‡§è‡§Ç)"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span className="hidden sm:inline">Skip Ad</span>
                </button>
              </div>
            </div>

            {/* Media Canvas - Smooth fluid slide transition with rigid height to prevent layout shifts */}
            <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] bg-zinc-950 flex items-center justify-center overflow-hidden select-none">
              <motion.div
                key={`ad-slide-${activeAd.id || 'ad'}-${currentAdIndex}`}
                initial={{ opacity: 0, x: adSlideDirection > 0 ? '40%' : '-40%' }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full flex items-center justify-center bg-black will-change-transform"
              >
                <AdMediaDisplay 
                  ad={activeAd} 
                  autoPlay={true}
                  onMediaEnded={() => handleNextAd(combinedAdsList.length)}
                  className="w-full h-full max-h-full object-contain bg-black pointer-events-auto" 
                />
              </motion.div>

              {/* Floating Carousel Next/Previous Arrows over Media */}
              <>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handlePrevAd(combinedAdsList.length); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-amber-500 hover:text-black text-white backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                  title="Previous Slide (‡§™‡§ø‡§õ‡§≤‡§æ)"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleNextAd(combinedAdsList.length)} }
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-amber-500 hover:text-black text-white backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                  title="Next Slide (‡§Ö‡§ó‡§≤‡§æ)"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </>

              {/* Slide Counter Indicator Dots */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 bg-black/75 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                {combinedAdsList.map((_, i) => (
                  <button
                    key={i} 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSelectAdIndex(i); }}
                    className={cn(
                      "rounded-full transition-all duration-300 cursor-pointer",
                      i === normalizedActiveIndex 
                        ? "w-5 h-2 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" 
                        : "w-2 h-2 bg-white/40 hover:bg-white/90"
                    )} 
                  />
                ))}
              </div>
            </div>

            {/* Ad Details Footer - Stable rigid layout to prevent height shifts */}
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-h-[76px]">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 h-5 overflow-hidden">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 truncate">{activeAd.title || 'Official Brand Showcase'}</h4>
                </div>
                <div className="min-h-[1.25rem] overflow-hidden">
                  <p className="text-xs text-slate-700 dark:text-zinc-300 line-clamp-1 leading-relaxed">{activeAd.description || 'Verified Trade Partner Showcase on Vyapar Bridge'}</p>
                </div>
                <AdRatingComponent ad={activeAd} onRate={(adId, rating, updatedAd) => {
                  setBrandAdsList(prev => prev.map(a => a.id === adId ? updatedAd : a));
                }} />
              </div>

              {/* WhatsApp Direct Contact CTA Link - Exclusively opens WhatsApp, NEVER opens Vercel or websites */}
              {(() => {
                const getWhatsAppHref = (linkStr?: string, companyName?: string) => {
                  const company = (companyName || 'Business Partner').trim();
                  if (!linkStr || !linkStr.trim()) {
                    return `https://api.whatsapp.com/send?text=${encodeURIComponent(`Hello ${company}, I saw your Brand Showcase advertisement on Vyapar Bridge and would like to connect on WhatsApp!`)}`;
                  }
                  const clean = linkStr.trim();
                  
                  // If user input already contains whatsapp URL
                  if (clean.includes('wa.me/') || clean.includes('api.whatsapp.com') || clean.includes('whatsapp.com')) {
                    return clean.startsWith('http') ? clean : `https://${clean}`;
                  }
                  
                  // Extract numbers (10-digit Indian phone or international number)
                  const digits = clean.replace(/\D/g, '');
                  if (digits.length >= 10) {
                    const phoneWithCountry = digits.length === 10 ? `91${digits}` : digits;
                    return `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(`Hello ${company}, I saw your Brand Showcase advertisement on Vyapar Bridge and would like to connect!`)}`;
                  }

                  // Force WhatsApp text inquiry with the provided details (NEVER open website/Vercel)
                  return `https://api.whatsapp.com/send?text=${encodeURIComponent(`Hello ${company}, I am interested in your products advertised on Vyapar Bridge (${clean})!`)}`;
                };

                const whatsappHref = getWhatsAppHref(activeAd.linkUrl, activeAd.companyName);

                return (
                  <a 
                    href={whatsappHref} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl border border-emerald-500/80 shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 shrink-0 hover:scale-105 cursor-pointer select-none"
                    title="Provide Feedback (‡§´‡•Ä‡§°‡§¨‡•à‡§ï ‡§¶‡•á‡§Ç)"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                    <span>Feedback üí¨</span>
                  </a>
                );
              })()}
            </div>
          </div>
        );
      })()}

      {/* Main Feed Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post, idx) => (
          <React.Fragment key={post.id || `post-${idx}`}>
            <PostItem 
              post={post} 
              currentUser={user} 
              onPostDeleted={(id) => setPosts(prev => prev.filter(p => p.id !== id))} 
              onPostUpdated={(updatedPost) => setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))} 
              onPostClick={() => {
                setActiveStoryPosts(filteredPosts);
                setActiveStoryIndex(idx);
              }}
              onReelClick={() => {
                setActiveStoryPosts(filteredPosts);
                setActiveStoryIndex(idx);
              }}
              userLocation={userLocation}
            />
            {/* Inject Suggested Companies/Dealers every 5 items as requested */}
            {(idx + 1) % 5 === 0 && suggestedUsers.length > 0 && (
              <SuggestedUsersRow 
                users={suggestedUsers.slice(0, 6)} 
                currentUser={user} 
                onUpdateUser={onUpdateUser} 
              />
            )}
          </React.Fragment>
        ))}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12 text-black/70 dark:text-zinc-400 font-medium">
            No posts found for {selectedTag}. Try selecting #All or #Latest!
          </div>
        )}
      </div>

      {/* Fullscreen Post Feed Viewer Modal */}
      {activeStoryIndex !== null && (
        <FullScreenFeedViewerModal
          posts={activeStoryPosts || filteredPosts}
          initialIndex={activeStoryIndex}
          currentUser={user}
          onClose={() => {
            setActiveStoryIndex(null);
            setActiveStoryPosts(null);
          }}
          userLocation={userLocation}
        />
      )}

      {/* Verified Payment Modal */}
      <VerifiedPaymentModal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} user={user} onSuccess={(updatedUser) => { if (onUpdateUser) onUpdateUser(updatedUser); }} />

      {/* Reel Upload Preview Modal */}
      {isPreviewModalOpen && reelPreviewUrl && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="min-h-full flex flex-col items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-[400px] bg-zinc-950 rounded-3xl border border-zinc-800 flex flex-col shadow-2xl relative p-3.5 my-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
                <button 
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    setReelPreviewUrl(null);
                    setPendingReelFile(null);
                  }} 
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-300 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                  
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-xs uppercase tracking-widest">Reel Preview</span>
                  <span className="text-[10px] bg-blue-600/30 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    {reelAspectRatio}
                  </span>
                </div>

                <div className="w-8"></div>
              </div>

              {/* Dynamic Aspect Ratio Media Player Box */}
              <div className={`w-full rounded-2xl overflow-hidden bg-black relative flex items-center justify-center border border-zinc-800/80 shadow-inner ${
                reelAspectRatio === '9/16' ? 'aspect-[9/16] max-h-[48vh] mx-auto' :
                reelAspectRatio === '16/9' ? 'aspect-[16/9] max-h-[36vh] w-full' :
                'aspect-square max-h-[42vh] mx-auto'
              }`}>
                {pendingReelFile?.type.startsWith('video') || (pendingReelFile?.name && /\.(mp4|webm|mov|m4v|mkv)$/i.test(pendingReelFile.name)) ? (
                  <video 
                    autoPlay
                    preload="metadata" 
                    controls
                    src={reelPreviewUrl || ''} 
                    className="w-full h-full object-contain transform-gpu will-change-transform" 
                    loop 
                    muted={Boolean(selectedMusic ? reelOriginalVolume === 0 : false)} 
                    playsInline
                    onLoadedMetadata={(e) => {
                      setIsMediaReady(true);
                      const v = e.currentTarget;
                      const w = v.videoWidth || 1080;
                      const h = v.videoHeight || 1920;
                      const ratio = w / h;
                      if (ratio < 0.75) setReelAspectRatio('9/16');
                      else if (ratio > 1.25) setReelAspectRatio('16/9');
                      else setReelAspectRatio('1/1');
                      v.play().catch(() => {
                        // Fallback muted play if browser blocked unmuted autoplay
                        v.muted = true;
                        v.play().catch(() => {});
                      });
                    }}
                    onCanPlay={() => setIsMediaReady(true)}
                    ref={(el) => { 
                      if (el) {
                        el.volume = selectedMusic ? reelOriginalVolume : 1;
                        if (el.paused) { 
                          const p = el.play(); 
                          if (p !== undefined) {
                            p.catch(() => {
                              el.muted = true;
                              el.play().catch(() => {});
                            });
                          } 
                        }
                      }
                    }}
                  />
                ) : (
                  <img 
                    src={reelPreviewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain transform-gpu"
                    onLoad={(e) => {
                      setIsMediaReady(true);
                      const img = e.currentTarget;
                      const w = img.naturalWidth || 1080;
                      const h = img.naturalHeight || 1080;
                      const ratio = w / h;
                      if (ratio < 0.75) setReelAspectRatio('9/16');
                      else if (ratio > 1.25) setReelAspectRatio('16/9');
                      else setReelAspectRatio('1/1');
                    }}
                  />
              )}

              {selectedMusic && (selectedMusic.audioUrl || selectedMusic.musicUrl || selectedMusic.url) && (
                <>
                  <audio 
                    key={selectedMusic.audioUrl || selectedMusic.musicUrl || selectedMusic.url || selectedMusic.id}
                    src={selectedMusic.audioUrl || selectedMusic.musicUrl || selectedMusic.url} 
                    loop 
                    playsInline 
                    autoPlay
                    className="hidden" 
                    ref={(el) => { 
                      if (el) {
                        el.volume = reelMusicVolume;
                        if (el.paused) { const p = el.play(); if (p !== undefined) p.catch(()=>{}); } 
                      }
                    }} 
                  />
                  <div className="absolute top-2.5 left-2.5 z-20 bg-black/80 backdrop-blur-md border border-amber-500/50 text-amber-300 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate max-w-[150px]">{selectedMusic.title || 'Sound Active'}</span>
                  </div>
                </>
              )}

              {!isMediaReady && (
                <div className="absolute inset-0 bg-zinc-900/90 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Loading Preview...</span>
                </div>
              )}
            </div>

            {/* Bottom Controls: Sound buttons appear ONLY when media preview is ready */}
            {isMediaReady && (
              <div className="mt-3 flex flex-col gap-2 bg-zinc-900/90 p-2.5 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setIsMusicModalOpen(true)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{selectedMusic ? `Sound: ${selectedMusic.title}` : 'üéµ Add Official Sound'}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => document.getElementById('custom-audio-upload-feed')?.click()}
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Upload MP3</span>
                  </button>

                  <input 
                    id="custom-audio-upload-feed" 
                    type="file" 
                    accept="audio/mp3,audio/mpeg,audio/wav" 
                    className="hidden" 
                    onChange={handleCustomAudioUpload}
                  />
                </div>

                {selectedMusic && (
                  <div className="bg-black/70 rounded-xl p-2.5 border border-zinc-800 text-xs">
                    <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-300">
                      <span>Original Audio</span>
                      <input 
                        type="range" min="0" max="1" step="0.05" 
                        value={reelOriginalVolume} 
                        onChange={(e) => setReelOriginalVolume(parseFloat(e.target.value))}
                        className="w-28 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer" 
                      />
                      <span className="font-mono text-[10px] w-8 text-right">{Math.round(reelOriginalVolume * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[11px] text-emerald-400 mt-2">
                      <span>Music Track</span>
                      <input 
                        type="range" min="0" max="1" step="0.05" 
                        value={reelMusicVolume} 
                        onChange={(e) => setReelMusicVolume(parseFloat(e.target.value))}
                        className="w-28 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer" 
                      />
                      <span className="font-mono text-[10px] w-8 text-right">{Math.round(reelMusicVolume * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Caption & Action Bar */}
            <div className="mt-3 flex flex-col gap-2">
              <input 
                type="text" 
                value={reelCaption}
                onChange={(e) => setReelCaption(e.target.value)}
                placeholder="Write a caption... e.g. #tiles #products #factory"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              
              <button 
                onClick={finalizeReelUpload}
                disabled={isUploadingReel}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isUploadingReel ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Publishing...</span>
                  </div>
                ) : (
                  <>
                    <PlusSquare className="w-4 h-4" />
                    <span>Publish Reel to Feed</span>
                  </>
                )}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Music Selection Modal */}
      <MusicSelectionModal 
        isOpen={isMusicModalOpen} 
        onClose={() => setIsMusicModalOpen(false)} 
        onSelect={(music) => {
          setSelectedMusic(music);
          setIsMusicModalOpen(false);
        }} 
      />
    </div>
  );
}

function CreatePost({ user }: { user: any }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('Box');
  const [hashtags, setHashtags] = useState('');
  const [postExternalLink, setPostExternalLink] = useState('');

  // Single Video / PDF
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Multi-image selection (up to 10 images)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [seekerValue, setSeekerValue] = useState(0);
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted' | 'scheduled'>('public');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const [uploadedMediaVideoUrl, setUploadedMediaVideoUrl] = useState<string>('');
  const [uploadedMediaImageUrl, setUploadedMediaImageUrl] = useState<string>('');
  const [uploadedMediaImages, setUploadedMediaImages] = useState<string[]>([]);
  const [uploadedMediaPdfUrl, setUploadedMediaPdfUrl] = useState<string>('');
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const multiImageInputRef = React.useRef<HTMLInputElement>(null);
  const addMoreImagesRef = React.useRef<HTMLInputElement>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);
  const thumbInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!user?.id || user?.id?.startsWith('demo_')) {
      toast.error('üîê Only registered Buyers and Sellers can post content on Vyapar Bridge. Please register or login!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      navigate('/');
      return;
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedList = Array.from(e.target.files || []);
    if (selectedList.length === 0) return;

    const first = selectedList[0];
    const isVideoFile = first.type.startsWith('video') || first.name.match(/\.(mp4|webm|mov|m4v)$/i);
    const isPdfFile = first.type === 'application/pdf' || first.name.toLowerCase().endsWith('.pdf');

    if (isVideoFile || isPdfFile) {
      setImageFiles([]);
      setImagePreviews([]);
      setFile(first);
      const blobUrl = URL.createObjectURL(first);
      setFilePreview(blobUrl);

      if (isPdfFile) {
        try {
          const thumb = await extractPdfFirstPageThumbnail(first);
          if (thumb.thumbnailUrl) {
            setThumbnailPreview(thumb.thumbnailUrl);
          }
        } catch (e) {
          console.warn('PDF thumbnail auto-extract note:', e);
        }
      }
    } else {
      // It is images! Support up to 10 images
      setFile(null);
      setFilePreview(null);
      const validImgs = selectedList.filter(f => f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)).slice(0, 10);
      setImageFiles(validImgs);
      const previews = validImgs.map(f => URL.createObjectURL(f));
      setImagePreviews(previews);
      if (selectedList.length > 10) {
        toast.info('Maximum 10 images limit! First 10 images selected.');
      } else if (validImgs.length > 1) {
        toast.success(`üì∏ ${validImgs.length} images selected for Facebook collage!`);
      }
    }
    e.target.value = '';
  };

  const handleAddMoreImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedList = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|webp|gif)$/i));
    if (selectedList.length === 0) return;

    const remainingSlots = 10 - imageFiles.length;
    if (remainingSlots <= 0) {
      toast.info('Maximum 10 images limit reached.');
      return;
    }
    const toAdd = selectedList.slice(0, remainingSlots);
    const updatedFiles = [...imageFiles, ...toAdd];
    setImageFiles(updatedFiles);
    setImagePreviews(updatedFiles.map(f => URL.createObjectURL(f)));
    toast.success(`Added ${toAdd.length} image(s) (${updatedFiles.length}/10 total)`);
    e.target.value = '';
  };

  const handleRemoveImage = (idxToRemove: number) => {
    const updatedFiles = imageFiles.filter((_, idx) => idx !== idxToRemove);
    const updatedPreviews = imagePreviews.filter((_, idx) => idx !== idxToRemove);
    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setThumbnailFile(selectedFile);
      const blobUrl = URL.createObjectURL(selectedFile);
      setThumbnailPreview(blobUrl);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
          setThumbnailFile(file);
          if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
          setThumbnailPreview(URL.createObjectURL(blob));
          toast.success("Video frame set as thumbnail! ‚úì");
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const suggestHashtags = async () => {
    if (!title && !content) {
      toast.error('Please add a title or description first');
      return;
    }
    setIsSuggestingTags(true);
    try {
      const generated = await suggestHashtagsWithAI(title, content);
      if (generated) {
        setHashtags(generated);
        toast.success('‚ú® AI Hashtags suggested successfully!');
      } else {
        toast.success('Hashtags generated');
      }
    } catch (err) {
      console.warn('AI suggestion fallback:', err);
      setHashtags('#vyaparbridge #morbitiles #ceramics #sanitaryware #b2b');
      toast.success('AI Hashtags suggested! ‚úì');
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const isVideo = (file?.type.startsWith('video') || file?.name.match(/\.(mp4|webm|mov|m4v)$/i)) || Boolean(uploadedMediaVideoUrl);
  const isPdf = (file?.type === 'application/pdf' || file?.name.match(/\.pdf$/i)) || Boolean(uploadedMediaPdfUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || user?.id?.startsWith('demo_')) {
      toast.error('üîê Only registered Buyers and Sellers can post content on Vyapar Bridge. Please register or login!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    if (!content.trim() && !file && imageFiles.length === 0 && !postExternalLink.trim() && !uploadedMediaVideoUrl && !uploadedMediaPdfUrl && uploadedMediaImages.length === 0) {
      toast.error('Please add content, photos (up to 10), external link, or media catalogue');
      return;
    }

    setIsSubmitting(true);
    let resolvedPostLink = postExternalLink.trim();
    if (resolvedPostLink && (resolvedPostLink.includes('facebook.com') || resolvedPostLink.includes('fb.watch'))) {
      toast.error('‚ÑπÔ∏è Facebook video links are blocked by Facebook security. Please use YouTube or direct video URLs instead.');
      setIsSubmitting(false);
      return;
    }
    const isLinkVideo = Boolean(
      resolvedPostLink && (
        resolvedPostLink.includes('youtube.com') ||
        resolvedPostLink.includes('youtu.be') ||
        /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(resolvedPostLink)
      )
    );
    const isActualVideo = isVideo || isLinkVideo;
    const postMediaType = isActualVideo ? 'video' : (isPdf ? 'pdf' : ((imageFiles.length > 0 || file) ? 'image' : 'text'));
    const generatedId = `post_${Date.now()}`;

    const authorName = user?.name || user?.companyName || user?.username || localStorage.getItem('vyapar_user_name') || 'Vyapar Member';
    const authorAvatar = user?.avatarUrl || user?.avatar || localStorage.getItem('vyapar_user_avatar') || BRAND_LOGO_SRC;
    const authorRole = user?.role || 'factory';

    // Optimize images or video for persistent state before navigating
    let persistentMediaUrl = '';
    let persistentThumbnailUrl = '';
    let persistentImages: string[] = [];
    let videoStreamUrl = filePreview || (file ? URL.createObjectURL(file) : '');

    if (uploadedMediaVideoUrl) {
      videoStreamUrl = uploadedMediaVideoUrl;
      persistentMediaUrl = uploadedMediaVideoUrl;
      persistentThumbnailUrl = thumbnailPreview || '';
    } else if (uploadedMediaPdfUrl) {
      persistentMediaUrl = uploadedMediaPdfUrl;
      persistentThumbnailUrl = thumbnailPreview || '';
    } else if (uploadedMediaImages.length > 0) {
      persistentImages = [...uploadedMediaImages];
      persistentMediaUrl = uploadedMediaImages[0];
      persistentThumbnailUrl = persistentMediaUrl;
    }

    if (uploadedMediaVideoUrl || uploadedMediaPdfUrl || uploadedMediaImages.length > 0) {
      // Pre-uploaded via specialized upload modals, bypass local processing
    } else if (imageFiles.length > 0) {
      try {
        const compressedList = await Promise.all(
          imageFiles.map(img => optimizeImageForPersistence(img).catch(() => ''))
        );
        persistentImages = compressedList.filter(Boolean);
        if (persistentImages.length === 0) {
          persistentImages = [...imagePreviews];
        }
        persistentMediaUrl = persistentImages[0] || imagePreviews[0] || '';
        persistentThumbnailUrl = persistentMediaUrl;
      } catch (e) {
        console.warn('Image optimization note:', e);
        persistentImages = [...imagePreviews];
        persistentMediaUrl = imagePreviews[0] || '';
        persistentThumbnailUrl = persistentMediaUrl;
      }
    } else if (file && !isVideo && !isPdf) {
      try {
        persistentMediaUrl = await optimizeImageForPersistence(file);
        persistentThumbnailUrl = persistentMediaUrl;
        persistentImages = [persistentMediaUrl];
      } catch (e) {
        console.warn('Image optimization note:', e);
      }
    } else if (file && isPdf) {
      try {
        saveVideoBlob(generatedId, file).catch(() => {});
        const [pdfDataUrl, pdfThumbResult] = await Promise.all([
          fileToDataURL(file).catch(() => ''),
          extractPdfFirstPageThumbnail(file).catch(() => ({ thumbnailUrl: '', numPages: 0 }))
        ]);
        persistentMediaUrl = pdfDataUrl || filePreview || '';
        persistentThumbnailUrl = pdfThumbResult.thumbnailUrl || thumbnailPreview || generateFallbackPdfCover(title || 'Product Catalogue', authorName);
        persistentImages = [persistentThumbnailUrl];
      } catch (e) {
        persistentMediaUrl = filePreview || '';
        persistentThumbnailUrl = generateFallbackPdfCover(title || 'Product Catalogue', authorName);
        persistentImages = [persistentThumbnailUrl];
      }
    } else if (file && isVideo) {
      try {
        await saveVideoBlob(generatedId, file);
        const objUrl = URL.createObjectURL(file);
        cacheVideoUrlInMemory(generatedId, objUrl);
        try {
          localStorage.setItem('vyapar_video_' + generatedId, objUrl);
        } catch (e) {}

        persistentThumbnailUrl = await generateVideoThumbnail(file);
        
        // Direct Cloud CDN / Server upload for Persistent Multi-device Video Streaming
        try {
          const sanitizedName = (file.name || 'video.mp4').replace(/[^a-zA-Z0-9.-]/g, '_');
          const storagePath = `posts/${generatedId}_${sanitizedName}`;
          const storageUrl = await uploadFileToFirebaseStorage(file, storagePath);
          if (storageUrl) {
            videoStreamUrl = storageUrl;
            persistentMediaUrl = storageUrl;
            cacheVideoUrlInMemory(generatedId, storageUrl);
          }
        } catch (storageErr) {
          console.warn('Media upload note for post video:', storageErr);
        }

        if (!videoStreamUrl) {
          videoStreamUrl = `indexeddb:${generatedId}`;
          persistentMediaUrl = `indexeddb:${generatedId}`;
        }
      } catch (e) {
        console.warn('Video thumbnail generation note:', e);
      }
    }

    if (thumbnailFile) {
      try {
        persistentThumbnailUrl = await optimizeImageForPersistence(thumbnailFile);
      } catch (e) {}
    }

    // Run AI Safety Moderation Guardrail Check
    const moderation = await moderateContentUniversally({
      title,
      content,
      description: content,
      hashtags,
      mediaType: postMediaType,
      userId: user.id,
      userRole: authorRole
    });

    const isPendingApproval = !moderation.approved;
    const aiFlagReason = isPendingApproval ? (moderation.reason || 'Flagged for Admin Review by AI Guardrail') : null;

    const resolvedMediaUrl = isActualVideo 
      ? (videoStreamUrl || (isLinkVideo ? resolvedPostLink : '') || '') 
      : isPdf 
        ? ((persistentMediaUrl && !persistentMediaUrl.startsWith('blob:')) ? persistentMediaUrl : '')
        : (persistentMediaUrl || imagePreviews[0] || filePreview || '');
    const resolvedThumbUrl = persistentThumbnailUrl || (isActualVideo ? (isLinkVideo ? '' : persistentThumbnailUrl) : (persistentMediaUrl || imagePreviews[0] || filePreview || ''));

    if (file && isVideo) {
      cacheVideoUrlInMemory(generatedId, videoStreamUrl || filePreview);
    }

    const instantPost = {
      id: generatedId,
      userId: String(user.id),
      userName: authorName,
      userRole: authorRole,
      title: title || '',
      content: content || '',
      description: content || '',
      hashtags: hashtags || '#vyaparbridge #tiles #business',
      type: postMediaType,
      mediaUrl: resolvedMediaUrl,
      images: isActualVideo ? [] : (persistentImages.length > 0 ? persistentImages : (resolvedMediaUrl ? [resolvedMediaUrl] : [])),
      mediaUrls: isActualVideo ? [] : (persistentImages.length > 0 ? persistentImages : (resolvedMediaUrl ? [resolvedMediaUrl] : [])),
      pdfUrl: isPdf ? (resolvedMediaUrl || '') : undefined,
      videoUrl: isActualVideo ? (videoStreamUrl || resolvedMediaUrl) : undefined,
      video: isActualVideo ? (videoStreamUrl || resolvedMediaUrl) : undefined,
      thumbnailUrl: resolvedThumbUrl,
      persistentMediaUrl: isActualVideo ? (videoStreamUrl || resolvedMediaUrl) : resolvedMediaUrl,
      minRate: (minPrice || maxPrice) ? minPrice : undefined,
      maxRate: (minPrice || maxPrice) ? maxPrice : undefined,
      unit: (minPrice || maxPrice) ? priceUnit : undefined,
      category: 'Commercial Wholesale',
      visibility: visibility || 'public',
      status: isPendingApproval ? 'pending' : 'approved',
      pending_admin_approval: isPendingApproval,
      aiFlagReason: aiFlagReason,
      postedFrom: 'profile',
      isPermanent: true,
      externalLink: resolvedPostLink || '',
      likesCount: 0,
      viewsCount: 1,
      createdAt: Date.now(),
      user: {
        id: String(user.id),
        name: authorName,
        avatar: authorAvatar,
        avatarUrl: authorAvatar,
        role: authorRole,
        isVerified: Boolean(user?.isVerified)
      }
    };

    // 1. Instant sync to Firestore & Local Storage
    syncPostToFirestore(instantPost).catch(e => console.warn('Firestore sync note:', e));

    // 2. Instant local display & UI update
    window.dispatchEvent(new CustomEvent('postCreated', { detail: instantPost }));
    playBubblePopSound();
    if (isPendingApproval) {
      toast.info(moderation?.userNotice || '‚è≥ Business Verification: Aapka post Admin Review ke liye hold kiya gaya hai.');
    } else {
      toast.success(`üéâ Post ${visibility === 'scheduled' ? 'scheduled' : 'published'} successfully!`);
    }
    setIsSubmitting(false);
    navigate('/');

    // 2. Non-blocking asynchronous background processing
    (async () => {
      try {
        let bgMediaUrl = persistentMediaUrl;
        let bgThumbUrl = persistentThumbnailUrl;
        if (imageFiles.length > 0) {
          bgMediaUrl = persistentImages[0] || '';
          bgThumbUrl = bgMediaUrl;
        } else if (file) {
          try {
            if (!isVideo && !isPdf) {
              bgMediaUrl = await optimizeImageForPersistence(file);
              bgThumbUrl = bgMediaUrl;
            } else if (isVideo) {
              bgThumbUrl = await generateVideoThumbnail(file);
              bgMediaUrl = videoStreamUrl || filePreview;
            } else {
              bgMediaUrl = filePreview && !filePreview.startsWith('blob:') ? filePreview : '';
            }
          } catch (e) {
            console.warn('Media persistence conversion note:', e);
          }
        }
        if (thumbnailFile) {
          try {
            bgThumbUrl = await optimizeImageForPersistence(thumbnailFile);
          } catch (e) {}
        }

        const formData = new FormData();
        formData.append('id', generatedId);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('hashtags', hashtags);
        formData.append('userId', String(user.id));
        formData.append('userName', authorName);
        formData.append('userRole', authorRole);
        formData.append('userAvatar', authorAvatar);
        formData.append('type', postMediaType);
        formData.append('postedFrom', 'profile');
        formData.append('isPermanent', 'true');
        formData.append('visibility', visibility);
        if (minPrice || maxPrice) {
          formData.append('minRate', minPrice);
          formData.append('maxRate', maxPrice);
          formData.append('unit', priceUnit);
        }
        if (visibility === 'scheduled' && scheduledAt) {
          formData.append('scheduledAt', String(new Date(scheduledAt).getTime()));
        }
        if (uploadedMediaImages.length > 0) {
          formData.append('images', JSON.stringify(persistentImages));
          formData.append('mediaUrls', JSON.stringify(persistentImages));
        } else if (uploadedMediaVideoUrl) {
          formData.append('mediaUrl', videoStreamUrl);
          formData.append('persistentMediaUrl', videoStreamUrl);
          formData.append('videoUrl', videoStreamUrl);
        } else if (uploadedMediaPdfUrl) {
          formData.append('mediaUrl', persistentMediaUrl);
          formData.append('pdfUrl', persistentMediaUrl);
        } else if (imageFiles.length > 0) {
          imageFiles.forEach(img => formData.append('media', img));
          formData.append('images', JSON.stringify(persistentImages));
          formData.append('mediaUrls', JSON.stringify(persistentImages));
        } else if (file) {
          if (!videoStreamUrl?.includes('firebasestorage.googleapis.com')) {
            formData.append('media', file);
          } else {
            formData.append('mediaUrl', videoStreamUrl);
            formData.append('persistentMediaUrl', videoStreamUrl);
          }
        }
        if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

        if (file) {
          saveVideoBlob(generatedId, file).catch(() => {});
          if (isVideo) {
            cacheVideoUrlInMemory(generatedId, videoStreamUrl || filePreview || '');
          }
        }

        const moderation = await moderateContentUniversally({
          title,
          content,
          description: content,
          hashtags,
          mediaType: postMediaType,
          userId: user.id,
          userRole: authorRole
        });

        let isPendingApproval = false;
        let aiFlagReason: string | undefined = undefined;

        if (!moderation.approved) {
          isPendingApproval = true;
          aiFlagReason = moderation.reason || 'Flagged for Admin Review by AI Guardrail';
        }

        let savedPost: any = null;

        try {
          const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          
          if (data.pendingApproval || data.post?.status === 'pending') {
            isPendingApproval = true;
            if (data.post?.aiFlagReason) aiFlagReason = data.post.aiFlagReason;
          }

          if (response.ok && data.success && data.post) {
            savedPost = data.post;
            if (savedPost.id && file) {
              saveVideoBlob(savedPost.id, file).catch(() => {});
              if (isVideo) {
                cacheVideoUrlInMemory(savedPost.id, videoStreamUrl || filePreview || '');
              }
            }
          }
        } catch (networkErr) {
          console.warn('Backend API note, using direct Firestore sync:', networkErr);
        }

        const isPersistentServerUrl = savedPost?.mediaUrl && (
          savedPost.mediaUrl.startsWith('data:') || 
          savedPost.mediaUrl.startsWith('https://') || 
          savedPost.mediaUrl.startsWith('http://') || savedPost.mediaUrl.startsWith('/uploads')
        ) && !savedPost.mediaUrl.includes('localhost');

        const finalMedia = isLinkVideo
          ? postExternalLink
          : (isPersistentServerUrl 
              ? savedPost.mediaUrl 
              : (isVideo 
                  ? (videoStreamUrl || filePreview || '') 
                  : isPdf 
                    ? (bgMediaUrl || filePreview || '')
                    : (bgMediaUrl || filePreview || (persistentImages[0] || ''))));
        const finalThumb = savedPost?.thumbnailUrl || bgThumbUrl || (isVideo ? bgThumbUrl : finalMedia);

        const finalPostData = savedPost ? {
          ...savedPost,
          id: generatedId,
          type: postMediaType,
          userName: savedPost.userName || authorName,
          userRole: savedPost.userRole || authorRole,
          mediaUrl: finalMedia,
          images: persistentImages.length > 0 ? persistentImages : (savedPost.images || [finalMedia]),
          mediaUrls: persistentImages.length > 0 ? persistentImages : (savedPost.mediaUrls || [finalMedia]),
          pdfUrl: isPdf ? (finalMedia || '') : undefined,
          videoUrl: isVideo ? finalMedia : undefined,
          video: isVideo ? finalMedia : undefined,
          thumbnailUrl: finalThumb,
          persistentMediaUrl: finalMedia,
          status: isPendingApproval ? 'pending' : (savedPost.status || 'approved'),
          postedFrom: 'profile',
          isPermanent: true,
          pending_admin_approval: isPendingApproval,
          aiFlagReason: aiFlagReason || null
        } : {
          ...instantPost,
          type: postMediaType,
          mediaUrl: finalMedia || instantPost.mediaUrl,
          images: persistentImages.length > 0 ? persistentImages : instantPost.images,
          mediaUrls: persistentImages.length > 0 ? persistentImages : instantPost.mediaUrls,
          pdfUrl: isPdf ? (finalMedia || instantPost.pdfUrl || '') : undefined,
          videoUrl: isVideo ? (finalMedia || instantPost.mediaUrl) : undefined,
          video: isVideo ? (finalMedia || instantPost.mediaUrl) : undefined,
          thumbnailUrl: finalThumb || instantPost.thumbnailUrl,
          persistentMediaUrl: finalMedia || instantPost.persistentMediaUrl,
          status: isPendingApproval ? 'pending' : 'approved',
          pending_admin_approval: isPendingApproval,
          aiFlagReason: aiFlagReason || null,
          postedFrom: 'profile',
          isPermanent: true,
          externalLink: postExternalLink || ''
        };

        await syncPostToFirestore(finalPostData);
        window.dispatchEvent(new CustomEvent('postCreated', { detail: finalPostData }));

        // Track referral qualification: user has posted content
        if (user?.id) {
          recordUserFirstPost(user.id).catch(refErr => console.warn('Referral post track note:', refErr));
        }

        if (isPendingApproval) {
          toast.info(moderation?.userNotice || '‚è≥ Business Verification: Aapka post Admin Review ke liye bhej diya gaya hai. Business network security ke liye moderation team link aur content verify karegi.');
        }
      } catch (bgErr) {
        console.warn('Background post sync note:', bgErr);
      }
    })();
  };

  const hasMediaSelected = Boolean(
    filePreview || 
    imagePreviews.length > 0 || 
    uploadedMediaVideoUrl || 
    uploadedMediaPdfUrl || 
    uploadedMediaImages.length > 0
  );

  return (
    <div className="max-w-2xl mx-auto w-full pt-8 pb-24 px-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-black text-black dark:text-zinc-50 uppercase tracking-widest">Create New Post</h2>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-black/60 uppercase">Factory & Dealer Studio</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Media Upload Area */}
          <div className="relative group">
            {!hasMediaSelected ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Video Uploading Button */}
                <div 
                  onClick={() => setIsVideoModalOpen(true)}
                  className="aspect-video w-full border-2 border-dashed border-amber-200 dark:border-amber-900/50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-amber-500/[0.02] hover:bg-amber-500/[0.05] dark:hover:bg-amber-500/[0.03] transition-all hover:border-amber-500 p-6 text-center group/btn shadow-sm"
                >
                  <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl group-hover/btn:scale-105 transition-transform">
                    <Video className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">Upload B2B Reels / Videos</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">High-Speed Video Stream CDN</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">MP4, WebM, MOV up to 150MB</p>
                  </div>
                </div>

                {/* 2. Photo Showcase Button */}
                <div 
                  onClick={() => setIsImageModalOpen(true)}
                  className="aspect-video w-full border-2 border-dashed border-blue-200 dark:border-blue-900/50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-blue-500/[0.02] hover:bg-blue-500/[0.05] dark:hover:bg-blue-500/[0.03] transition-all hover:border-blue-500 p-6 text-center group/btn shadow-sm"
                >
                  <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl group-hover/btn:scale-105 transition-transform">
                    <ImagePlus className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">Upload Showcase Photos</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Up to 10 Images Collage</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Auto-Optimized JPEG, PNG, WEBP</p>
                  </div>
                </div>

                {/* 3. PDF Catalog Button */}
                <div 
                  onClick={() => setIsPdfModalOpen(true)}
                  className="aspect-video w-full border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05] dark:hover:bg-emerald-500/[0.03] transition-all hover:border-emerald-500 p-6 text-center group/btn shadow-sm"
                >
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover/btn:scale-105 transition-transform">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">Upload PDF Catalogues</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Full Brochure with Cover Preview</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Standard PDF up to 50MB</p>
                  </div>
                </div>

                {/* 4. External URL / Video Link Button */}
                <div 
                  onClick={() => setIsLinkModalOpen(true)}
                  className="aspect-video w-full border-2 border-dashed border-purple-200 dark:border-purple-900/50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-purple-500/[0.02] hover:bg-purple-500/[0.05] dark:hover:bg-purple-500/[0.03] transition-all hover:border-purple-500 p-6 text-center group/btn shadow-sm"
                >
                  <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl group-hover/btn:scale-105 transition-transform">
                    <ExternalLink className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">Attach Product Links</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-0.5">YouTube Stream or Portfolio Link</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Embeddable players & product web links</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-zinc-800 p-3">
                {isPdf ? (
                  <div className="w-full relative">
                    <button 
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setFilePreview(null);
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                      }}
                      className="absolute top-3 right-3 z-30 p-2 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer shadow-lg"
                      title="Remove PDF"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <PdfCardViewer post={{ title: title || file?.name || 'Catalogue', mediaUrl: filePreview || '', user: user }} variant="feed" />
                  </div>
                ) : isVideo && (uploadedMediaVideoUrl || filePreview) ? (
                  <div className="relative w-full h-full">
                    <video preload="metadata" playsInline
                      ref={videoRef}
                      src={uploadedMediaVideoUrl || filePreview || ''} 
                      className="w-full h-full object-cover max-h-[450px]" 
                      onLoadedMetadata={() => {
                        if (videoRef.current) setVideoDuration(videoRef.current.duration);
                      }}
                      onTimeUpdate={() => {
                        if (videoRef.current) setSeekerValue(videoRef.current.currentTime);
                      }}
                      muted 
                      loop 
                    />
                    
                    {/* Video Scrubbing & Thumbnail Selection */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <input 
                          type="range"
                          min="0"
                          max={videoDuration || 100}
                          step="0.1"
                          value={seekerValue}
                          onChange={(e) => {
                            const time = parseFloat(e.target.value);
                            setSeekerValue(time);
                            if (videoRef.current) videoRef.current.currentTime = time;
                          }}
                          className="flex-1 accent-blue-500 h-1.5 rounded-lg appearance-none bg-white/20 cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-white/70 tabular-nums">
                          {Math.floor(seekerValue)}s / {Math.floor(videoDuration)}s
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={captureFrame}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            Set Frame as Thumbnail
                          </button>
                          
                          <button 
                            type="button"
                            onClick={() => thumbInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md border border-white/10 active:scale-95 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Pick Cover
                          </button>
                        </div>
                        
                        {thumbnailPreview && (
                          <div className="relative group/thumb">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-blue-500 shadow-xl">
                              <img src={thumbnailPreview} alt="Thumb" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute bottom-full right-0 mb-2 w-32 aspect-video bg-black/90 rounded-xl overflow-hidden border border-white/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity pointer-events-none shadow-2xl">
                               <img src={thumbnailPreview} alt="Large Thumb" className="w-full h-full object-cover" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => { setFile(null); setFilePreview(null); setThumbnailFile(null); setThumbnailPreview(null); setUploadedMediaVideoUrl(''); }}
                      className="absolute top-4 right-4 p-2 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors z-30 cursor-pointer shadow-lg"
                      title="Remove Video"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (imagePreviews.length > 0 || uploadedMediaImages.length > 0) ? (
                  <div className="space-y-3">
                    {/* Header bar with count and actions */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 font-black text-xs">
                          üì∏ {uploadedMediaImages.length > 0 ? uploadedMediaImages.length : imagePreviews.length} / 10 Photos
                        </span>
                        <span className="text-[11px] text-white/70 font-semibold hidden sm:inline">
                          Facebook-style Collage layout
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {imagePreviews.length < 10 && (
                          <button
                            type="button"
                            onClick={() => addMoreImagesRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer shadow"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add More</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setImageFiles([]);
                            setImagePreviews([]);
                            setThumbnailFile(null);
                            setThumbnailPreview(null);
                            setUploadedMediaImages([]);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold rounded-lg border border-red-500/30 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear All</span>
                        </button>
                      </div>
                    </div>

                    {/* Multi-Image Collage Live Preview */}
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
                      <MultiImageCollage images={uploadedMediaImages.length > 0 ? uploadedMediaImages : imagePreviews} title={title || "Preview"} />
                    </div>

                    {/* Image Thumbnails Grid with Delete & Reorder Controls */}
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-white/60 mb-2 uppercase tracking-wider">Selected Image List (Tap &times; to remove)</p>
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {(uploadedMediaImages.length > 0 ? uploadedMediaImages : imagePreviews).map((preview, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-white/20 group bg-zinc-900 shadow">
                            <img src={preview} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute top-0 left-0 bg-black/70 text-white text-[9px] font-black px-1 rounded-br">
                              {idx + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-0.5 right-0.5 p-1 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-colors shadow"
                              title="Delete photo"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                        {imagePreviews.length < 10 && (
                          <button
                            type="button"
                            onClick={() => addMoreImagesRef.current?.click()}
                            className="aspect-square rounded-lg border-2 border-dashed border-blue-500/50 hover:border-blue-400 bg-blue-500/10 hover:bg-blue-500/20 flex flex-col items-center justify-center text-blue-400 transition-all cursor-pointer"
                            title="Add photo"
                          >
                            <Plus className="w-5 h-5" />
                            <span className="text-[9px] font-bold mt-0.5">Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
                
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
            {/* Hidden Inputs */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
            <input type="file" ref={multiImageInputRef} className="hidden" multiple accept="image/*,video/*" onChange={handleFileChange} />
            <input type="file" ref={addMoreImagesRef} className="hidden" multiple accept="image/*" onChange={handleAddMoreImages} />
            <input type="file" ref={pdfInputRef} className="hidden" accept=".pdf,application/pdf" onChange={handleFileChange} />
            <input type="file" ref={thumbInputRef} className="hidden" accept="image/*" onChange={handleThumbnailChange} />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-black/60 uppercase tracking-widest mb-2">Title / Model Name</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Premium Vitrified Tiles 600x1200"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black/60 uppercase tracking-widest mb-2">Description</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share more details about this product..."
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[120px]"
              />
            </div>

            {/* Dynamic Wholesale Price Range */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs">
                    ‚Çπ
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-black dark:text-zinc-100 uppercase tracking-wider">
                      B2B Wholesale Price Range (‡§ï‡•Ä‡§Æ‡§§ ‡§¶‡§æ‡§Ø‡§∞‡§æ)
                    </h4>
                    <p className="text-[10px] text-black/60 dark:text-zinc-400">
                      Set expected minimum & maximum factory/dealer rates for bulk buyers
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  B2B Marketplace
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-black/70 dark:text-zinc-300 mb-1">
                    Minimum Price (Wholesale)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-black/50 dark:text-zinc-500">
                      ‚Çπ
                    </span>
                    <input 
                      type="number" 
                      min="0"
                      step="any"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-2.5 text-xs sm:text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-black/70 dark:text-zinc-300 mb-1">
                    Maximum Price (Wholesale)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-black/50 dark:text-zinc-500">
                      ‚Çπ
                    </span>
                    <input 
                      type="number" 
                      min="0"
                      step="any"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="e.g. 240"
                      className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl pl-7 pr-3 py-2.5 text-xs sm:text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-black/70 dark:text-zinc-300 mb-1">
                    Pricing Unit (‡§á‡§ï‡§æ‡§à)
                  </label>
                  <select 
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Box">Per Box (‡§™‡•ç‡§∞‡§§‡§ø ‡§¨‡•â‡§ï‡•ç‡§∏)</option>
                    <option value="Sq.Ft">Per Sq.Ft (‡§™‡•ç‡§∞‡§§‡§ø ‡§µ‡§∞‡•ç‡§ó ‡§´‡•Å‡§ü)</option>
                    <option value="Sq.Mtr">Per Sq.Mtr (‡§™‡•ç‡§∞‡§§‡§ø ‡§µ‡§∞‡•ç‡§ó ‡§Æ‡•Ä‡§ü‡§∞)</option>
                    <option value="Piece">Per Piece (‡§™‡•ç‡§∞‡§§‡§ø ‡§®‡§ó)</option>
                    <option value="Kg">Per Kg / Weight</option>
                    <option value="Ton">Per Ton / Truckload</option>
                    <option value="Meter">Per Meter</option>
                    <option value="Set">Per Set</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-black text-black/60 uppercase tracking-widest mb-2">
                External Link / URL (YouTube, Instagram, Website, etc.)
              </label>
              <input
                type="url"
                value={postExternalLink}
                onChange={(e) => setPostExternalLink(e.target.value)}
                placeholder="https://example.com or YouTube video link..."
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div className="relative group/hashtags">
              <label className="block text-xs font-black text-black/60 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>Hashtags & Keywords</span>
                <button 
                  type="button"
                  onClick={suggestHashtags}
                  disabled={isSuggestingTags}
                  className="text-blue-500 hover:text-blue-600 flex items-center gap-1 normal-case tracking-normal disabled:opacity-50 group-hover/hashtags:scale-110 transition-transform cursor-pointer"
                >
                  <motion.div
                    animate={(hashtags.length === 0 && (title || content)) ? { scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {isSuggestingTags ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                  </motion.div>
                  <span className="font-bold underline decoration-dotted underline-offset-4">Suggest with AI</span>
                </button>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="e.g. #tiles #b2b #marble"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-12 transition-all"
                />
                {(title || content) && hashtags.length === 0 && !isSuggestingTags && (
                  <button
                    type="button"
                    onClick={suggestHashtags}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg animate-bounce"
                    title="Generate tags with AI"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
                {isSuggestingTags && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  '#Tiles', '#Sanitaryware', '#Bathware',
                  '#Textile', '#Garments', '#Fabrics',
                  '#Grocery', '#FMCG', '#Kirana',
                  '#Hardware', '#Electricals', '#Packaging', '#Logistics'
                ].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!hashtags.includes(tag)) {
                        setHashtags(prev => prev ? `${prev} ${tag}` : tag);
                      }
                    }}
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer",
                      hashtags.includes(tag)
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-black"
                        : "bg-slate-100 dark:bg-zinc-800 text-black/70 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-amber-400"
                    )}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-black/70 dark:text-zinc-500 italic">
                Tip: Add a title and description first, then click <span className="text-blue-500 font-bold cursor-pointer hover:underline" onClick={suggestHashtags}>Suggest with AI</span> or tap above tags to auto-fill industry hashtags.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-black/60 uppercase tracking-widest mb-2">Visibility</label>
                <select 
                  value={visibility}
                  onChange={(e: any) => setVisibility(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
                >
                  <option value="public">Public (Everyone)</option>
                  <option value="unlisted">Unlisted (Link Only)</option>
                  <option value="private">Private (Only Me)</option>
                  <option value="scheduled">Schedule for Later</option>
                </select>
              </div>
              {visibility === 'scheduled' && (
                <div>
                  <label className="block text-xs font-black text-black/60 uppercase tracking-widest mb-2">Schedule Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (visibility === 'scheduled' ? <Calendar className="w-5 h-5" /> : <Rocket className="w-5 h-5" />)}
            <span>{isSubmitting ? 'Publishing...' : (visibility === 'scheduled' ? 'Schedule Post' : 'Publish Product Post')}</span>
          </button>
        </form>
      </div>

      {/* 4 Modular Uploading Engine Modals */}
      <VideoUploadingModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onUploadSuccess={({ mediaUrl, thumbnailUrl, duration }) => {
          setUploadedMediaVideoUrl(mediaUrl);
          setThumbnailPreview(thumbnailUrl);
          setVideoDuration(duration);
        }}
        userId={user.id}
      />

      <ImageUploadingModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onUploadSuccess={(urls) => {
          setUploadedMediaImages(urls);
        }}
        userId={user.id}
      />

      <PdfUploadingModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onUploadSuccess={({ mediaUrl, thumbnailUrl }) => {
          setUploadedMediaPdfUrl(mediaUrl);
          setFilePreview(mediaUrl);
          setThumbnailPreview(thumbnailUrl);
        }}
        userId={user.id}
      />

      <LinkUploadingModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onUploadSuccess={({ url, title, provider }) => {
          setPostExternalLink(url);
          setTitle(title);
        }}
      />
    </div>
  );
}

function AdminPanel({ user }: { user: any }) {
  const [posts, setPosts] = useState<any[]>([]);

  const renderAdminMediaPreview = (postItem: any) => {
    const isVideo = postItem.type === 'video' || (postItem.mediaUrl && (postItem.mediaUrl.includes('indexeddb:') || postItem.mediaUrl.includes('youtube.com') || postItem.mediaUrl.includes('youtu.be') || /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(postItem.mediaUrl)));
    const isPdf = postItem.type === 'pdf' || (postItem.mediaUrl && (postItem.mediaUrl.includes('indexeddb:') && postItem.thumbnailUrl?.includes('.pdf') || /\.pdf(\?.*)?$/i.test(postItem.mediaUrl)));

    if (isPdf) {
      return (
        <div className="w-full h-full min-h-[160px] pointer-events-auto">
          <PdfCardViewer post={postItem} variant="feed" />
        </div>
      );
    }
    if (isVideo) {
      return (
        <AdMediaDisplay 
          ad={{ ...postItem, type: 'video' }} 
          className="w-full h-full pointer-events-auto" 
        />
      );
    }
    return (
      <img 
        src={postItem.mediaUrl || postItem.thumbnailUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=500&auto=format&fit=crop&q=60'} 
        alt="media" 
        className="w-full h-full object-cover" 
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=500&auto=format&fit=crop&q=60';
        }}
      />
    );
  };

  // Star Rating live synchronizer across feeds
  useEffect(() => {
    const handleRatingSync = (e: CustomEvent) => {
      const { userId: updatedId, ratingAverage: newAvg, ratingCount: newCount } = e.detail || {};
      
      // Update local posts state
      setPosts(prev => prev.map(p => {
        const pUser = p.user || {};
        if (String(p.userId) === String(updatedId) || String(pUser.id) === String(updatedId)) {
          return {
            ...p,
            user: {
              ...pUser,
              ratingAverage: newAvg,
              ratingCount: newCount
            }
          };
        }
        return p;
      }));

      // Update dealers if present in App component
      setDealers(prev => prev.map(d => {
        if (String(d.id) === String(updatedId)) {
          return { ...d, ratingAverage: newAvg, ratingCount: newCount };
        }
        return d;
      }));
    };

    window.addEventListener('ratingUpdated', handleRatingSync);
    return () => window.removeEventListener('ratingUpdated', handleRatingSync);
  }, []);
  const [reports, setReports] = useState<any[]>([]);
  const [music, setMusic] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'reports' | 'music' | 'users' | 'payments' | 'ai_pending'>('posts');
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteFromFirebase, setDeleteFromFirebase] = useState(true);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  const pendingModerationPosts = posts.filter(p => p.pending_admin_approval || p.status === 'pending' || p.status === 'pending_admin_approval');

  const toggleSelectAll = (targetList: any[]) => {
    const targetIds = targetList.map(p => String(p.id));
    const allSelected = targetIds.length > 0 && targetIds.every(id => selectedPostIds.includes(id));
    if (allSelected) {
      setSelectedPostIds(prev => prev.filter(id => !targetIds.includes(id)));
    } else {
      setSelectedPostIds(prev => Array.from(new Set([...prev, ...targetIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    const pId = String(id);
    setSelectedPostIds(prev => prev.includes(pId) ? prev.filter(x => x !== pId) : [...prev, pId]);
  };

  const handleBulkApprove = async (targetList: any[]) => {
    const idsToProcess = selectedPostIds.filter(id => targetList.some(p => String(p.id) === String(id)));
    if (idsToProcess.length === 0) return toast.error('Pehle kam se kam ek item select karein!');
    
    toast.info(`Approving ${idsToProcess.length} items...`);
    for (const id of idsToProcess) {
      const pId = String(id);
      try { await handleStatusUpdate(pId, 'approved'); } catch (e) {}
      try { await setDoc(doc(firestoreDb, 'posts', pId), { status: 'approved', pending_admin_approval: false }, { merge: true }); } catch (e) {}
    }

    setPosts(prev => prev.map(p => idsToProcess.includes(String(p.id)) ? { ...p, status: 'approved', pending_admin_approval: false } : p));
    setSelectedPostIds(prev => prev.filter(id => !idsToProcess.includes(id)));
    toast.success(`‚úÖ ${idsToProcess.length} items approved & released!`);
  };

  const handleBulkDelete = async (targetList: any[]) => {
    const idsToProcess = selectedPostIds.filter(id => targetList.some(p => String(p.id) === String(id)));
    if (idsToProcess.length === 0) return toast.error('Pehle kam se kam ek item select karein!');

    toast.info(`Deleting ${idsToProcess.length} items permanently...`);

    // Instantly reflect deletion in UI
    setPosts(prev => prev.filter(p => !idsToProcess.includes(String(p.id))));
    setSelectedPostIds(prev => prev.filter(id => !idsToProcess.includes(id)));

    // Track deleted IDs in local storage
    try {
      const delStr = localStorage.getItem('VyaparBridge_deleted_posts') || '[]';
      const delList = JSON.parse(delStr);
      if (Array.isArray(delList)) {
        idsToProcess.forEach(id => {
          if (!delList.includes(String(id))) delList.push(String(id));
        });
        localStorage.setItem('VyaparBridge_deleted_posts', JSON.stringify(delList.slice(-500)));
      }
    } catch (e) {}

    // Async delete from Firestore and Backend
    for (const id of idsToProcess) {
      const pId = String(id);
      try { await deletePostFromFirestore(pId); } catch (e) {}
      try { await fetch(`/api/posts/${pId}`, { method: 'DELETE' }); } catch (e) {}
    }

    toast.success(`üí• ${idsToProcess.length} items permanently deleted everywhere!`);
  };

  const fetchUsers = async () => {
    let fbUsers: any[] = [];
    try {
      const snap = await getDocs(collection(firestoreDb, 'users'));
      snap.forEach(d => fbUsers.push({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Firestore fetch users note:', e);
    }

    let apiUsers: any[] = [];
    try {
      const data = await safeFetch('/api/users');
      if (Array.isArray(data)) apiUsers = data;
    } catch (e) {
      console.warn('API fetch users note:', e);
    }

    const userMap = new Map<string, any>();
    apiUsers.forEach(u => userMap.set(String(u.id), u));
    fbUsers.forEach(u => userMap.set(String(u.id), { ...userMap.get(String(u.id)), ...u }));

    setUsersList(Array.from(userMap.values()));
  };

  useEffect(() => {
    let isCancelled = false;
    const fetchAdminPosts = async () => {
      let apiPosts: any[] = [];
      try {
        const data = await safeFetch('/api/posts?admin=true');
        if (Array.isArray(data)) apiPosts = data;
      } catch (e) {}

      let fbPosts: any[] = [];
      try {
        fbPosts = await fetchPostsFromFirestore();
      } catch (e) {}

      const postMap = new Map<string, any>();
      apiPosts.forEach(p => { if (p && p.id) postMap.set(String(p.id), p); });
      fbPosts.forEach(p => {
        if (p && p.id) {
          const existing = postMap.get(String(p.id)) || {};
          postMap.set(String(p.id), mergePostSafely(existing, p));
        }
      });

      if (!isCancelled) {
        setPosts(Array.from(postMap.values()));
      }
    };

    fetchAdminPosts();

    const unsubscribeAdminPosts = subscribeToPostsFromFirestore((realtimePosts) => {
      if (!isCancelled && Array.isArray(realtimePosts)) {
        setPosts(realtimePosts);
      }
    });

    safeFetch('/api/reports')
      .then(data => Array.isArray(data) && setReports(data));

    safeFetch('/api/music')
      .then(data => Array.isArray(data) && setMusic(data));

    fetchUsers();

    safeFetch('/api/admin/payments')
      .then(data => Array.isArray(data) && setPayments(data));

    return () => {
      isCancelled = true;
      unsubscribeAdminPosts();
    };
  }, []);

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    if (userToDelete.role === 'admin' || String(userToDelete.id) === '1') {
      toast.error('Cannot delete Master Admin');
      return;
    }
    const uId = String(userToDelete.id);
    const uName = userToDelete.name || uId;

    // 1. Instant optimistic state update & close modal
    setUsersList(prev => prev.filter(u => String(u.id) !== uId && String(u.username) !== uId));
    setPosts(prev => prev.filter(p => String(p.userId) !== uId && String(p.user?.id) !== uId));
    window.dispatchEvent(new CustomEvent('userDeleted', { detail: { userId: uId } }));
    window.dispatchEvent(new CustomEvent('postDeleted', { detail: { userId: uId } }));

    // Extract values before userToDelete becomes null
    const username = userToDelete.username;
    const phone = userToDelete.phone;
    const email = userToDelete.email;
    const fingerprintId = userToDelete.fingerprintId || '';

    const tid = toast.loading(`Deleting ${uName}...`);
    setUserToDelete(null);
    setIsDeletingUser(true);

    // 2. Parallel background deletion from Firestore & Backend API
    try {
      const promises: Promise<any>[] = [
        fetch(`/api/users/${uId}?firebase=${deleteFromFirebase}&fingerprintId=${encodeURIComponent(userToDelete.fingerprintId || '')}`, { method: 'DELETE' })
      ];
      if (deleteFromFirebase) {
        promises.push(deleteUserFromFirestore(uId, { username, phone, email, fingerprintId }));
      }
      await Promise.allSettled(promises);
      toast.success(`User "${uName}" deleted permanently`, { id: tid });
    } catch (err: any) {
      toast.success(`User "${uName}" deleted permanently`, { id: tid });
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: statusKey | string) => {
    const pId = String(id);
    try {
      await fetch(`/api/admin/posts/${pId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {}

    try {
      await setDoc(doc(firestoreDb, 'posts', pId), { status, pending_admin_approval: status !== 'approved' }, { merge: true });
    } catch (e) {}

    if (status === 'rejected') {
      try {
        const delStr = localStorage.getItem('VyaparBridge_deleted_posts') || '[]';
        const delList = JSON.parse(delStr);
        if (Array.isArray(delList) && !delList.includes(pId)) {
          delList.push(pId);
          localStorage.setItem('VyaparBridge_deleted_posts', JSON.stringify(delList.slice(-200)));
        }
      } catch (e) {}
      setPosts(prev => prev.filter(p => String(p.id) !== pId));
      toast.success('‚ùå Post rejected & removed permanently from all feeds.');
    } else {
      setPosts(prev => prev.map(p => String(p.id) === pId ? { ...p, status, pending_admin_approval: false } : p));
      toast.success(`‚úÖ Post status updated to ${status}`);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
    setReports(reports.filter(r => r.id !== reportId));
    toast.success('Report resolved/dismissed');
  };

  const handleDeleteReportedPost = async (postId: string, reportId: string) => {
    const pId = String(postId);
    await deletePostFromFirestore(pId);
    try {
      await fetch(`/api/posts/${pId}`, { method: 'DELETE' });
      await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
    } catch (e) {}
    setPosts(prev => prev.filter(p => String(p.id) !== pId));
    setReports(prev => prev.filter(r => String(r.id) !== String(reportId)));
    window.dispatchEvent(new CustomEvent('postDeleted', { detail: { postId: pId } }));
    toast.success('Reported post permanently deleted');
  };

  return (
    <div className="max-w-4xl mx-auto w-full pt-8 pb-20 md:pb-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-black dark:text-zinc-50 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span>Vyapar Bridge Admin & AI Safety Control Panel</span>
          </h2>
          <p className="text-xs text-black/70 dark:text-zinc-400 mt-1">
            Meta-style AI Guardrail logs and platform moderation.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-zinc-800 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('ai_pending')}
          className={cn(
            "py-3 px-5 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 relative",
            activeTab === 'ai_pending' ? "border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold" : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
          )}
        >
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>AI Pending Review ({pendingModerationPosts.length})</span>
          {pendingModerationPosts.length > 0 && (
            <span className="bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingModerationPosts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={cn(
            "py-3 px-5 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0",
            activeTab === 'posts' ? "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold" : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
          )}
        >
          <Film className="w-4 h-4" />
          <span>All Posts Queue ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={cn(
            "py-3 px-6 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2",
            activeTab === 'reports' ? "border-red-600 text-red-600 dark:text-red-400 font-extrabold" : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
          )}
        >
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <span>User Reports & AI Safety Flags ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('music')}
          className={cn(
            "py-3 px-6 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2",
            activeTab === 'music' ? "border-amber-600 text-amber-600 dark:text-amber-400 font-extrabold" : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
          )}
        >
          <Volume2 className="w-4 h-4" />
          <span>Music Library ({music.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            "py-3 px-6 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2",
            activeTab === 'users' ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold" : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Registered Members ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={cn(
            "py-3 px-6 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2",
            activeTab === 'payments' ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold" : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
          )}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payments ({payments.length})</span>
        </button>
      </div>

      {activeTab === 'ai_pending' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl">
            <h3 className="font-extrabold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              AI Guardrail Flagged Content Queue
            </h3>
            <p className="text-xs text-amber-800/80 dark:text-amber-300 mt-1">
              Reels & Posts flagged by AI Guardrail for non-B2B attire, explicit body exposure, or non-commercial content. Users see a 24-hour review notice until approved by Admin.
            </p>
          </div>

          {pendingModerationPosts.length > 0 && (
            <div className="bg-slate-100 dark:bg-zinc-800/80 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleSelectAll(pendingModerationPosts)}
                  className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-black dark:text-white flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-all shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={pendingModerationPosts.length > 0 && pendingModerationPosts.every(p => selectedPostIds.includes(String(p.id)))}
                    onChange={() => toggleSelectAll(pendingModerationPosts)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer pointer-events-none"
                  />
                  <span>Select All ({pendingModerationPosts.length})</span>
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                  {selectedPostIds.filter(id => pendingModerationPosts.some(p => String(p.id) === id)).length} Selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkApprove(pendingModerationPosts)}
                  disabled={selectedPostIds.filter(id => pendingModerationPosts.some(p => String(p.id) === id)).length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve Selected</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkDelete(pendingModerationPosts)}
                  disabled={selectedPostIds.filter(id => pendingModerationPosts.some(p => String(p.id) === id)).length === 0}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Selected</span>
                </button>
              </div>
            </div>
          )}

          {pendingModerationPosts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-black dark:text-white">All Clear! No Flagged Content Pending</p>
              <p className="text-xs text-slate-500 mt-1">AI Guardrail has no pending reels awaiting approval.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingModerationPosts.map(p => (
                <div key={p.id} className={cn("bg-white dark:bg-zinc-900 border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-all", selectedPostIds.includes(String(p.id)) ? "border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20" : "border-amber-300 dark:border-amber-800/60")}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedPostIds.includes(String(p.id))}
                          onChange={() => toggleSelectOne(p.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer shrink-0"
                        />
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs overflow-hidden">
                          {p.user?.avatarUrl ? <img src={p.user.avatarUrl} alt="" className="w-full h-full object-cover" /> : (p.userName?.charAt(0) || 'U')}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-black dark:text-white truncate">{p.userName || p.user?.name || 'User'}</span>
                          <span className="block text-[10px] text-slate-500 uppercase font-semibold">{p.userRole || 'Member'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
                        Pending Admin Review
                      </span>
                    </div>

                    <div className="my-2 aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-200 dark:border-zinc-800">
                      {renderAdminMediaPreview(p)}
                    </div>

                    <h4 className="text-xs font-bold text-black dark:text-white mt-1">{p.title || 'Untitled Reel'}</h4>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 line-clamp-2">{p.content || p.description}</p>
                    {p.aiFlagReason && (
                      <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg mt-2 border border-amber-200 dark:border-amber-900">
                        üö© AI Reason: {p.aiFlagReason}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={async () => {
                        const pId = String(p.id);
                        await handleStatusUpdate(pId, 'approved');
                        // Update pending state locally
                        setPosts(prev => prev.map(item => String(item.id) === pId ? { ...item, pending_admin_approval: false, status: 'approved' } : item));
                        toast.success('‚úÖ Approved & Published to Feed and User Profile Timeline!');
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve & Release</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const pId = String(p.id);
                        await deletePostFromFirestore(pId);
                        try { await fetch(`/api/posts/${pId}`, { method: 'DELETE' }); } catch (e) {}
                        setPosts(prev => prev.filter(item => String(item.id) !== pId));
                        toast.success('‚ùå Flagged reel deleted permanently.');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'music' && (
        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6">
            <h3 className="font-bold text-black dark:text-zinc-50 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              Upload New Audio to Library
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase ml-1">Track Title</label>
                <input 
                  id="musicTitle"
                  type="text" 
                  placeholder="e.g. Morbi Beats" 
                  className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-black dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase ml-1">Artist/Style</label>
                <input 
                  id="musicArtist"
                  type="text" 
                  placeholder="e.g. Instrumental" 
                  className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-black dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <input 
                  id="musicFile"
                  type="file" 
                  accept="audio/*,video/*"
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const title = (document.getElementById('musicTitle') as HTMLInputElement).value || 'Untitled';
                    const artist = (document.getElementById('musicArtist') as HTMLInputElement).value || 'Vyapar Bridge Audio';
                    
                    const tid = toast.loading('Uploading track...');
                    try {
                      const formData = new FormData();
                      formData.append('musicFile', file);
                      formData.append('title', title);
                      formData.append('artist', artist);
                      
                      const res = await fetch('/api/music', {
                        method: 'POST',
                        body: formData
                      });
                      const newM = await res.json();
                      setMusic([...music, newM]);
                      toast.success('Track added to library', { id: tid });
                    } catch (err) {
                      toast.error('Upload failed', { id: tid });
                    }
                  }}
                />
                <button 
                  onClick={() => document.getElementById('musicFile')?.click()}
                  className="w-full py-6 border-2 border-dashed border-amber-300 dark:border-amber-900/50 rounded-2xl text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-8 h-8" />
                  <span>Choose MP3/MP4 Audio File</span>
                  <span className="text-[10px] opacity-60">Max 10MB ‚Ä¢ Available for all Reels</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {music.map((track, i) => (
              <div key={track.id || `music-${i}`} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                  <Volume2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-black dark:text-zinc-50 truncate">{track.title}</div>
                  <div className="text-xs text-slate-600 dark:text-zinc-400">{track.artist}</div>
                </div>
                <button 
                  onClick={async () => {
                    await fetch(`/api/music/${track.id}`, { method: 'DELETE' });
                    setMusic(music.filter(m => m.id !== track.id));
                    toast.success('Track removed');
                  }}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 dark:text-zinc-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">User / Phone</th>
                    <th className="px-4 py-3 font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">Plan & Type</th>
                    <th className="px-4 py-3 font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">UTR / Amount</th>
                    <th className="px-4 py-3 font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">Status</th>
                    <th className="px-4 py-3 font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {payments.map((p, i) => (
                    <tr key={p.id || `payment-${i}`} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-black dark:text-zinc-100">{p.userName}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{p.userPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex w-fit px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                            {p.plan}
                          </span>
                          <span className={cn(
                            "inline-flex w-fit px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                            p.membershipType === 'company' ? "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          )}>
                            {p.membershipType}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-[10px] text-black dark:text-zinc-100">{p.utr}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">‚Çπ{p.amount}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                          p.status === 'approved' ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300" : (p.status === 'rejected' ? "bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300" : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300")
                        )}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.status === 'pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={async () => {
                                if (!confirm('Approve this payment and verify user?')) return;
                                const tid = toast.loading('Approving...');
                                try {
                                  const res = await fetch(`/api/admin/payments/${p.id}/approve`, { method: 'POST' });
                                  const data = await res.json();
                                  if (data.success) {
                                    setPayments(payments.map(item => item.id === p.id ? { ...item, status: 'approved' } : item));
                                    toast.success('Payment approved!', { id: tid });
                                  }
                                } catch (err) {
                                  toast.error('Failed to approve', { id: tid });
                                }
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={async () => {
                                if (!confirm('Reject this payment?')) return;
                                const tid = toast.loading('Rejecting...');
                                try {
                                  const res = await fetch(`/api/admin/payments/${p.id}/reject`, { method: 'POST' });
                                  const data = await res.json();
                                  if (data.success) {
                                    setPayments(payments.map(item => item.id === p.id ? { ...item, status: 'rejected' } : item));
                                    toast.success('Payment rejected!', { id: tid });
                                  }
                                } catch (err) {
                                  toast.error('Failed to reject', { id: tid });
                                }
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-zinc-400 italic">
                        No payment submissions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">Member</th>
                    <th className="px-4 py-3 font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">Role & Category</th>
                    <th className="px-4 py-3 font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">GSTIN / Tax ID</th>
                    <th className="px-4 py-3 font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">Location</th>
                    <th className="px-4 py-3 font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {usersList.map((u, i) => (
                    <tr key={u.id || u.username || `user-${i}`} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-[10px] shrink-0">
                            {u.avatarUrl || u.avatar ? (
                              <img src={u.avatarUrl || u.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (u.name?.charAt(0) || u.username?.charAt(0) || 'U').toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-black dark:text-zinc-100 flex items-center gap-1">
                              {u.name || u.username || 'Business Member'}
                              {shouldShowVerifiedBadge(u) && <VerifiedBadge user={u} size="sm" />}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">@{u.username || u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "inline-flex w-fit px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                            u.role === 'admin' ? "bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300" : (u.role === 'factory' ? "bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300" : "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300")
                          )}>
                            {u.role || 'Member'}
                          </span>
                          <span className="text-[10px] text-slate-700 dark:text-zinc-300 font-bold uppercase">{u.category || 'General'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-700 dark:text-zinc-300">
                        {u.gstNumber || '---'}
                      </td>
                      <td className="px-4 py-3 text-[10px] text-slate-700 dark:text-zinc-300">
                        {u.city || 'Morbi'}, {u.state || 'Gujarat'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          type="button"
                          onClick={() => {
                            if (u.role === 'admin' || String(u.id) === '1') {
                              return toast.error('Cannot delete Master Admin');
                            }
                            setUserToDelete(u);
                          }}
                          disabled={u.role === 'admin' || String(u.id) === '1'}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-0"
                          title="Delete Member Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usersList.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-zinc-400 text-xs">
                  No registered members found. Registered users and businesses will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length > 0 && (
            <div className="bg-slate-100 dark:bg-zinc-800/80 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleSelectAll(posts)}
                  className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-black dark:text-white flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-all shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={posts.length > 0 && posts.every(p => selectedPostIds.includes(String(p.id)))}
                    onChange={() => toggleSelectAll(posts)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer pointer-events-none"
                  />
                  <span>Select All ({posts.length})</span>
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                  {selectedPostIds.filter(id => posts.some(p => String(p.id) === id)).length} Selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkApprove(posts)}
                  disabled={selectedPostIds.filter(id => posts.some(p => String(p.id) === id)).length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve Selected</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkDelete(posts)}
                  disabled={selectedPostIds.filter(id => posts.some(p => String(p.id) === id)).length === 0}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Selected</span>
                </button>
              </div>
            </div>
          )}

          {posts.map((post, i) => (
            <div key={post.id || `post-${i}`} className={cn("bg-white dark:bg-zinc-900 rounded-2xl border p-4 shadow-sm flex flex-col md:flex-row gap-4 transition-all", selectedPostIds.includes(String(post.id)) ? "border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 dark:border-zinc-800")}>
              <div className="flex items-start gap-3 w-full md:w-auto">
                <input
                  type="checkbox"
                  checked={selectedPostIds.includes(String(post.id))}
                  onChange={() => toggleSelectOne(post.id)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer mt-2 shrink-0"
                />
                <div className="flex-1 md:flex-initial md:w-48 h-48 bg-slate-100 dark:bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center relative group">
                  {post.mediaUrl && post.mediaUrl.trim() !== '' ? (
                    renderAdminMediaPreview(post)
                  ) : (
                    <div className="text-slate-500 dark:text-zinc-400 text-xs font-bold">Text Post</div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-sm text-black dark:text-zinc-50">{post.user?.name || 'Member'}</div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400">{post.user?.role || 'User'}</div>
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider",
                    post.status === 'approved' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-100 text-red-800"
                  )}>
                    {post.status}
                  </span>
                </div>
                
                <p className="text-xs text-black dark:text-zinc-200 bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 mb-3">
                  {post.content || 'No text'}
                </p>

                {post.aiFeedback && (
                  <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 p-2.5 rounded-xl mb-3 flex items-center gap-1.5 border border-blue-200 dark:border-blue-800">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                    <span><strong>AI Safety Analysis:</strong> {post.aiFeedback}</span>
                  </div>
                )}
                
                <div className="mt-auto flex gap-2">
                  <button 
                    onClick={() => handleStatusUpdate(post.id, 'approved')}
                    disabled={post.status === 'approved'}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Approve Post
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(post.id, 'rejected')}
                    disabled={post.status === 'rejected'}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Reject Post
                  </button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-slate-500 dark:text-zinc-400 text-center py-12">No posts found.</p>}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.map((report, i) => (
            <div key={report.id || `report-${i}`} className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-red-200 dark:border-red-950 p-4 shadow-sm flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase border border-red-300 dark:border-red-800">
                    {report.targetType} REPORTED
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                    Target ID: {report.targetId}
                  </span>
                </div>

                <div className="text-sm font-bold text-black dark:text-zinc-100">
                  Target Name / User: <span className="text-red-600 dark:text-red-400">{report.targetName || report.targetId}</span>
                </div>

                <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-xl text-xs border border-red-100 dark:border-red-900/50 space-y-1">
                  <div className="font-bold text-red-800 dark:text-red-300">Reason: {report.reason}</div>
                  {report.details && <div className="text-black dark:text-zinc-300">Details: "{report.details}"</div>}
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">Reported by: {report.reporter?.name || report.reporterId}</div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2 shrink-0 md:w-48">
                {report.targetType === 'post' && (
                  <button 
                    onClick={() => handleDeleteReportedPost(report.targetId, report.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Post
                  </button>
                )}
                <button 
                  onClick={() => handleDismissReport(report.id)}
                  className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  Dismiss / Approve
                </button>
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="text-center py-16 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-sm text-black dark:text-zinc-200">No Pending Safety Reports!</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Meta-style AI Guardrail is active and protecting all posts, reels, comments, and messages.</p>
            </div>
          )}
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { e.stopPropagation(); setUserToDelete(null); }}>
          <div className="bg-white dark:bg-zinc-900 border-2 border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-black dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base">Confirm User Deletion?</h3>
                <p className="text-xs text-black/60 dark:text-zinc-400">Permanent Action ‚Ä¢ Cannot Be Undone</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5">
              <p className="text-black/70 dark:text-zinc-400">
                Are you sure you want to permanently delete this user profile?
              </p>
              <div className="font-extrabold text-black dark:text-zinc-100 text-sm">
                {userToDelete.name} <span className="text-black/60 dark:text-zinc-400 text-xs font-normal">(@{userToDelete.username || userToDelete.id})</span>
              </div>
              <p className="text-[11px] text-black/60 dark:text-zinc-400">
                Role: {userToDelete.role || 'Member'} ‚Ä¢ Location: {userToDelete.city || 'Morbi'}, {userToDelete.state || 'Gujarat'}
              </p>
            </div>

            <p className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-2.5 rounded-xl leading-relaxed">
              ‚ö†Ô∏è This will purge their profile, posts, reels, comments, and account data completely from server storage.
            </p>
            <label className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 cursor-pointer p-2 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
              <input type="checkbox" checked={deleteFromFirebase} onChange={(e) => setDeleteFromFirebase(e.target.checked)} className="w-4 h-4 rounded text-red-600 focus:ring-0" />
              Delete from Firebase & Storage (Irreversible)
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeletingUser}
                className="px-5 py-2.5 w-full rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeletingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Force Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Permanently Delete Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chat({ user, onOpenVerify, userLocation }: { user: any; onOpenVerify?: () => void; userLocation?: {lat: number, lng: number} | null }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate('/');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
    }
  }, [user]);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeContact, setActiveContact] = useState<any>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string>('');

  // Contacts list
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    // Real-time Firestore users subscription for instant online/offline presence tracking
    const unsub = subscribeToUsersFromFirestore((fbUsers) => {
      if (Array.isArray(fbUsers) && fbUsers.length > 0) {
        setContacts(fbUsers.filter((u: any) => String(u.id) !== String(user.id)));
      }
    });

    safeFetch('/api/users')
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
      .catch(err => console.error('Chat user fetch error:', err));

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    safeFetch(`/api/messages?userId=${user.id}`)
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
        else if (data && Array.isArray(data.items)) setMessages(data.items);
        else setMessages([]);
        
        // Mark all messages as read
        fetch('/api/messages/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
        // Dispatch event to clear message notifications
        window.dispatchEvent(new CustomEvent('messagesRead'));
      })
      .catch(() => setMessages([]));
  }, [user?.id]);

  if (!user) {
    return (
      <div className="h-[calc(100vh-60px)] flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
        <MessageCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-black mb-2">Login to Chat</h2>
        <p className="text-black/70 max-w-sm mb-6">You need to be logged in to send and receive messages.</p>
        <Link to="/" onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors">Sign In</Link>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !pendingImage) || !activeContact) return;

    setUploadingImage(true);
    try {
      // Universal Chat Guardrail Check
      const moderation = await moderateContentUniversally({
        content: newMessage,
        userId: user.id,
        userRole: user.role
      });

      if (!moderation.approved) {
        toast.error(moderation.reason || '‚õî AI Safety Guardrail: Message blocked due to abusive language or non-compliant content.');
        return;
      }

      if (pendingImage) {
        const formData = new FormData();
        formData.append('image', pendingImage);
        formData.append('senderId', user.id);
        formData.append('receiverId', activeContact.id);
        formData.append('text', newMessage.trim() || '[Image]');

        const res = await fetch('/api/messages/image', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          setMessages([...messages, data.message]);
          setPendingImage(null);
          setPendingImagePreview('');
          setNewMessage('');
          if (chatFileInputRef.current) chatFileInputRef.current.value = '';
        } else {
          toast.error(data.error || 'Failed to send image');
        }
      } else {
        const data = await safeFetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: user.id,
            receiverId: activeContact.id,
            text: newMessage
          })
        });
        if (data.blocked) {
          toast.error(data.error || '‚õî AI Safety Guardrail: Message blocked due to abusive language or inappropriate content.');
          return;
        }
        if (data.success) {
          setMessages([...messages, data.message]);
          setNewMessage('');
        }
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await fetch(`/api/messages/${msgId}`, { method: 'DELETE' });
      setMessages(messages.filter(m => m.id !== msgId));
      toast.success('Message deleted');
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const handleImageSend = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeContact) return;

    setPendingImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const activeMessages = messages.filter(
    m => (m.senderId === user.id && m.receiverId === activeContact?.id) || 
         (m.senderId === activeContact?.id && m.receiverId === user.id)
  );

  return (
    <div className="max-w-[935px] mx-auto w-full pt-4 md:pt-8 h-[calc(100vh-60px)] md:h-[calc(100vh-32px)] pb-20 md:pb-8">
      <div className="bg-white border border-slate-200 rounded-none md:rounded-2xl shadow-sm h-full flex overflow-hidden">
        {/* Chat List Sidebar */}
        <div className={`w-full md:w-[350px] border-r border-slate-200 flex flex-col ${activeContact ? 'hidden md:flex' : 'flex'}`}>
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/')} className="md:hidden p-1.5 -ml-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-200 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-lg text-slate-900">{user?.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Your Online Status" />
              <span className="text-[11px] font-bold text-emerald-600">Online</span>
            </div>
          </div>
          <div className="p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-base text-slate-900">Messages</span>
            </div>
            {contacts.filter(contact => {
              // Only show contacts that have message history with the current user
              return messages.some(m => (m.senderId === user.id && m.receiverId === contact.id) || (m.senderId === contact.id && m.receiverId === user.id));
            }).map(contact => {
              const lastMsg = messages.filter(m => (m.senderId === user.id && m.receiverId === contact.id) || (m.senderId === contact.id && m.receiverId === user.id)).sort((a, b) => b.createdAt - a.createdAt)[0];
              const isLockedForCustomer = user.role === 'customer' && !user.isVerified;
              const isContactOnline = isUserActiveOnline(contact);
              const presenceText = getUserLastActiveFormatted(contact);
              
              return (
                <div 
                  key={contact.id} 
                  onClick={() => {
                    // Distance Check for Local Customer Members
                    if (user?.role === 'customer' && user?.membershipType === 'local') {
                      if (userLocation && contact.gpsCoords) {
                        const dist = calculateDistance(userLocation.lat, userLocation.lng, contact.gpsCoords.lat, contact.gpsCoords.lng);
                        if (dist > 100) {
                          toast.error(`üìç Distance Restriction: As a Local Member, you can only chat with dealers within 100km. This business is ${Math.round(dist)}km away. Upgrade to 'Direct Company' plan for nationwide access!`);
                          return;
                        }
                      } else if (!userLocation) {
                        toast.error("üìç Please enable GPS/Location to verify distance for Local Membership.");
                        return;
                      }
                    }
                    setActiveContact(contact);
                  }}
                  className={`flex items-center gap-3 mb-2 cursor-pointer hover:bg-slate-100/70 p-2 -mx-2 rounded-xl transition-colors ${activeContact?.id === contact.id ? 'bg-slate-100' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-black/70 overflow-hidden relative shrink-0">
                    {contact.avatarUrl ? (
                      <img src={contact.avatarUrl} alt={contact.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      (contact.name || contact.userName || 'U').charAt(0)
                    )}
                    {isContactOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
                    )}
                    {isLockedForCustomer && lastMsg?.senderId !== user.id && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center backdrop-blur-[1px]">
                        <Lock className="w-4 h-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-semibold text-sm flex items-center justify-between text-slate-900">
                      <span className="truncate">{contact.name}</span>
                      {lastMsg && <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(lastMsg.createdAt).toLocaleDateString()}
                      </span>}
                    </div>
                    <div className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                      {isContactOnline ? (
                        <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Active now
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">{presenceText}</span>
                      )}
                      <span>‚Ä¢</span>
                      <span className="truncate">
                        {isLockedForCustomer && lastMsg?.senderId !== user.id ? (
                          <span className="text-blue-500 font-medium italic">üîí New Message Hidden</span>
                        ) : (
                          lastMsg?.text || 'No messages yet'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
          {!activeContact ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50">
              <div className="w-24 h-24 rounded-full border-2 border-slate-300 flex items-center justify-center mb-4 text-slate-400">
                <MessageCircle className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Your Messages</h3>
              <p className="text-slate-500 mb-6 text-sm max-w-xs">Connect directly with Factory ownersxúÏΩ€r‹Hñ ¯^_·bÂ("≤¡ E2•HQ*ﬁ§‰î(±x…ÍZ≠V %D 
@àb±h÷;6=f˚∞”;Sµ´.€ún[≥ùyÿß±5õ6[€è…ò¸Ñ=Á∏;‡∏;$ïôU€0Àª?˜súyüÌ^$)ÛÜIú¶lo‚á^ÔÒ“Ù…Oòˆ<>ùeY<a•◊å≈ìÌ(æﬂ∏jwÿ∆6Ò>ÑÁ^¥[K≠Œuµ¯0Ú“Ù•76NœªØ∫ªæ˝≈˙ˆñ≥Ói‰ﬂ≥Q¸!HÙ’_?˝bm¯Üù≈¯G>õ^vWzkl˙±ªŒíx6Òø{6ã"vYò„¥;&Yê∞so⁄]aÈ»Û„ãn:fY‚M“0„I◊É
ﬁ0?Ét–}¥∂Pjy`	6ì$æxúeÍ,.∫´l‘]]`K’[8ù,f˚^8aG√$&Âe]‚Î™◊}º‰á‘W6`≥4HzIlccÉµÜ≥4ã«A“b˜Ô≥{Ù1Løí,|ˆîµı°Au‘∏Z›eæhÙ˜0é*{^™4Í.Ø≥”8ÒÉ§{*ˇH#ÿÌÓJøoÿÿ•U⁄Ü∂ìó\Î/≠ı+] ¶Ù7ˆ£–˜É…B “ €§Ì€¿ÄçlO :◊’V°›ÌQ!â'’}[á}[7ÓõyWLKr—}≠<‘A1ü´yU~;û] ülg`Èã>Kh¶hX+∆Æ⁄û:ˇßΩ	á˝Ów¨Ù·‚•¯‘:iuz√ëólfÌ~Á⁄‘jòû@æ¥Ø&Q8	Ù~:lmCMXôtÍiªÁù¶q4À XÀqfûè2¯˜Çéà˛k {ëê—@%aÎbßØ≠7	«∏¥”Yî∆ÕÉ”Rù[ÂDYMõë„∞ÿæïè˙ ¥WñEo·™µÆ/asïSdÍ∫Ê§ôéßà¶ É4ZÒ2∫ó ﬂı0Ï¥*¿ØÙqÎ˙∏sﬁ¯v	ˆmiπ_áçK¶¡ÊıÂÜØ»?äñ°'}œM£Ñqæà◊j]∆Å.˜-@bÅàÍås8Ór¯]a]—+∏ß—,ËÆ√hFbß›e mmAäŒm„?ÖA‰≤*O√N^Ï`m~]	jVÿÿ˚ÿE¢iÜâ—µM¸c$ëÚ¡9H¬ÉmèºåÖ)√Õ
¸«K£∆ˆßïÊë|mÆ˜Mü_≈36Ú> “Ü¿¥œ<¯s]≤≥$[Œ{˘¨?l~÷P
6õ|êÑWíÂîΩ…$Œ†w∏1ˇqê¶ﬁyêˆå{Ya∫Úù¨›9ÖºÙ∞∑˚¢„‘Ç2]p»î[ÕW 2iﬁÙÍ¶|LÀƒã7˛4>õNÉdË•≤]√˜·‰º{‚0∆ß¿Xò5€Ÿ†S±&√(X1ﬁ∑BF,ßÖ±ú?⁄
&¡Yò•É¶ØgëÒ¨Ù÷l√éB„ísO3/…ü⁄ºK0≥ÄËË+Ë€ø˘G35“⁄yr2âm˙!ó,áR‡≤vå]ÑŸ‡c2;É#0K ™{ÆV/E·üÌR|r!∆Òi|ˆdÜT(eÒCÅa–œø‹%xdÄ.‰!Y`ßû ÔÕ.„I|Àr£˘?^öEs`7Œ~⁄)…Ò‰’4ò–Ä/üˆ⁄F¶V√:∆¨yûx~(®õ≈›ÑàÑB—„nÚyLø∏XZî¯"Wî˚BÁärÎ* C5‘,∏Ç‚/πu»ˆ∏Â’zã^√Yí∆Iwá¯≤,Âö‰\3bóôT  —l˚€ıOè-ç„éhÏ¢VµhïΩ^ÓO?æQOÀ*ä\∏Ï„¿gf˛Â(ÄE	ÿÅw9Üïbœ°ﬁÖw…‡î∞Ω	úBxG"êákoqU9RÂ∑å"|I&/7sµÙ9Áêæû6ê–Ôa‡E›,Ê„ 	“`2ÿÁKe8øcIù†wNù!⁄Íé#†‚?bi˝¥ÚËSHÎ6&K
Wp¿ìpÚæk∆Âef”ÿÛíì$™(rÚ©Ö„sñ&√ΩjQÛhV∂Q√≈ê„àˇü˛(!»ùÄ‡¥ı≤…‹ñœ≠5Õ$¸ÔQ{Ò ÈÅYsQH∞›Ö¿ÒØ˚o˚o◊ßﬂ&Áß^{y}q˘·⁄‚Ú £≈~ÔQÁÕ]k8ÃöÖq8h∆Jïè?.âw@®fì!2éÛ±ı5∞Ÿ®é¢Ú¥Ó≠ãû= E˛_ÁúÚ”jì$åÿXß†+vpëÄOÀŸ5ÛÃÅ8p†fGôóÕR%ÎœÅ´TGZ!≥Ê◊%°%»0Ô¸≤ïq5·Êe⁄ãÂ™Rpn ¯∞I|aõ´mª\Ë¨¡5ÁD¯sud∏c/ºT gqìÃø¥qÊwœƒ\«
c¢+∂d^•¨ΩÈ˚¿x§ãlü§¢E∂;ÜŒùêbgx…ËhŸA“ˇâ7≠ŒG¿Ø¯Ô%ùÀ´ée]pB/‚!1r÷¡¥È√0ª4–(è/ß#˜JÅ
ƒZaU§g*~rÎ
Õu††ç}ozNJéà-[¯ÕêõhÆ"\J<œ®◊À+∏%eUôyÒ‰⁄Yî‰JØvP∂≥ú˘˛å‚ââgŒÀîˆqJÂm;Ã[˚Åˆówn€^eŒ≥≈Â˝£¯˛˜â– ˚Py€>Ò÷~∞sF÷m™ÇÔ· “
}íç¥3:s$ö∆rëx_hŒøÇ≈E…Â,~˚≤ÎÕ≤‰”UVÂªV;)ñQvŸ{”ˆ8=GQˆ §`ä')Z5ˆë7€`P≤r:» {>ôÍπmﬁˇ“P5	≤Y2±…$8Ø˜¡Â∆6˙™¥vıNü gW¢ˇß¨≈°F–&¶•Ë[◊ÔåB∑mMÓÁ¿åMó`@.~Få≈y–
mBI[0Ú&~ÏQê…-hÛËhÚj<ıê“ÄDFcÍí.G6ê_ñ•6Óc™¿1 iäzMTpj∆¯ê\≤*"‰c≈ãï∏N\k∑@
tÜ—Ùâ¨¨Ø4ˆ‚¢¯‚4	º˜›P”¬/fa——OU‰è”Ô?Z;[£Ë8	∆r
Æ∏Ô%Ô—{Á∑·dà¶4’µáæ—o˙
≈[Æﬁi€«  ®	hZ Ãã¬m›‘KP{'ªSﬂâπMÄéUû≈^∏∂˚™‹∑k7Ï6uq^¬±Îºà&P£SSÜqïè:6ÉèU˘Q’u$HI∏∞—uƒB´-O—£æÈ®‘˜Z:÷@˜‚ã^<&mu¸ã¨ıÄcÚﬁË.V~Pßµp4Çmˆµ`ﬂ_˛8	+>Vs8I‘˜‘™ÕàvSGDï5dbΩª¡h(Â‡Z7\£Èók!W˚§É’ïõ¡O‚)j6õ=ø“√æ˜1áø-[Q<_SŒ~€"s±s™-‚¿≠(·›”40ÜÖ8<›˘ﬂ˜–∑Óıñ{”Í‘0ã4Æ*ﬁÆ†≠1zç ∆^^p#©äk:∑[g]˜G£ΩQÕ9(Æìdæås∂iˇπölΩEq“C†NY‡ofù^£‘«·88 ÄI>oø~≥»Æ 5Õ 8+]‡°√¨µàäL8¨ +vÌ–í∏óñiw™|[µáπXŸΩ…tñ5‡cëa ‰¨jXpòiÆ «˙∞f≈IM€@.wJÓ9ı
I{õﬂ€ºdãàïa0VDot43ö"røñB„Æ(o•Øï≠"#b0ñB‘fıÉÊOâËôƒ±4Av†,7âôDcq1Ùv´Â®û±6∫r<£Ä`Ó08Î©G©√l_z<XGêcZ-[”◊∂fÙöÀb≤JÁ9Ä[…Ü+ñrçh!ó'ˆpÏÓ‡Xm]ß§ ˙ƒIjÊ¨8ÏØ¢πïîπxzŒ0gŒ‚dlÇôxr4;áŸ∆{é`ìÖ–c<$Ò‰¿K3 3Ì@ñ Ê¶ß±ó@U?Ù®D;XdmﬂÀ<b±–o√êË’- Ü‡≈€-√2æe^ ºåïÕ(⁄ƒ>€,JïÍ∆˝	∂çÉœ.ß(‰¬ Õ¿ìg@ KGƒˆp‰aŒπÖ¥∏èÊ‚ﬁpL˚É∞Ù˘bÔ<<[‰?‡/ÛhTÀ>wà73˚dÿ‰’√X]_ñ∑z‰‡√Wì±1‰%ÃhC?O{C,fvÂ¡«SÔ4
¸ç´Ÿ4äΩÍÊ¡IË‰ÁÒL…`#zr[†ﬂ∞ﬂ¢[±m-¬,Çæ å≈	{æ˜l>$Uö‡è_ƒËbd…•M,ùÜƒd ì?ﬁˆPl(çlZ=ó˛¬qö$‡∫Ÿ÷Ö» r|øŸEú'Å„ ΩºÃkµÉ^Ê%ÁÅ†SV0ôå‚ñlcA‘≈ùò"rD≠·K‹ò^Øg3ùàüó_Åú∂±ÄJ=;t
ºåœçp3>∑¿œ¯ÿŸË™œàÍ}luÑ—(|‘]È È.Ø àÆ≥x8KÒ,#éeaÒ™ƒ›-≠U<„,n	
Ùcnﬁ≈õq|ÚS¢‚V~≥@Z˜ä–¡f‹&Ûû $œÉ…8WµZuK∏Kvú´"÷˙˘rq\«˝	ó˚kÍ™“üƒ≥‘π‚cCbào Tæ† ıK ÈÊt ûÅ¨àN|0Hv‡Ö>€Áﬁπ“Uõ¥“Mˇ 1ñ¬Ë∆∞p£Ë≤%MEÜ"óÅó@	⁄®On+|ÏYsD,…ªQñM”¡““Ö◊KüôLw=x –o/˝∑;KÁã¿»wÆü‚¶o|DQÃ ï–ÔÊzëÌ1oå∂|áŒﬂóÒå}=ˆı•7ı∂ïÑËúÁÄœƒwÚ	ˆg√,ÌΩ≥A-«÷\…g√ü¿ól,Lb‘Úòƒ0Ÿ ¯¿1]LqdØ∫≤∂Û`]SOÎhGâ,]^y∏˝≈Óõ2*)ƒéZµü4ﬁq≠_;∞√ÀsEE¿úbã¿<¬ƒ(⁄Gy™ó˚∆SÌêvº∆ÓfÿP#GXÕ∂hI+À‰ØÄ*]ˇ‰'KK¨€Ì≤}§õ	€	> HÇ.*)∆¡Ó«æaëü¸‰l6íì/úóE©d˚äÖ)˙ã/3ß˛Ò">'õÈ¶?'Ïz¿d°ê0®ÈMæî•å≥Æ‚–ˇ≤TÛ)|ƒS> ^Ï2/Dî(;∑æ”ÕY6Ë	—xÎ/"aﬁ”ﬂΩad/D/†”^îr- ˆé¯e™y ~hUÑB@îÁÁ¸ÿ;],|p·óZ„qã#<Ó#ìd≠)wå¶øΩêˇ3ô¿A¯û¬ŸÚøN¨¸Mü˛N<ƒiÎIª‘.∆;
x5# r»ã≤˚Ïh˜€úx—%,BJﬁmÅ(ºÖM≥˝YîÖ]‚°ÿ¶ÌfaJ#·eY˚+†Ç›£iHñ{∆ãƒ‡>€˝‡ m≥pX”N±6b‘Èã0ÂÎπ•º–VvÙıõ'Ì◊o¥•Â<›1Pæ∏≈o}yI¥£µ∆Ê=.£7våhB4Dªv’ﬂé«SQGy„¨â´@ú'’øú5vÇtòÑS‹EQKy„¨	†M'™…üZù,ô•Z∏:œ¬|5Úﬂ⁄≤‚XS‘ö=)tgz#ÇUV€Ø¥¶R“/;ì D\,^˘µc-RÔt±…O¸ë¯a<Í‚åpnPF(»3Q‡˛]~^T8|˘Œ
¡¢˚pd¸ñzòM√=>‹¸Küõóé¬t¥æﬁˇYxïŒ–DV fÒ[obìö`?üçÅµ ∂hÏiÌ¸∑»µ˛Ö¸ÂX‚S/B°Ω‹™à'ZW_˚(&Avø&j kΩç£›Ìì√›Ó÷Ê·ˆ´ù›Ó◊ªá{œ~“Œ z˜Ø>2ıêˆVÒª9`ÁJQ[lê˛“MB|I9°"BçÏT^ó∂â‹Ú É’ü˝TáÏQ|Å¡º≤ù£‚∑{XëØ´Z5SSôéêÑ]ÂT…Wé≥µπ«ÄpŸ·n‘%»˜¬≠9Ù“üÂìT›ñÛ∞ƒâF
æ{Æø3!=1ï≤V£~‰cRﬂ‘ì)ê6“ÚR¸p(èb4.kàüé:cçZ» 
ÙDz¯D§òs3?åë4R©J€Ú<7¿¥T>?d˚ÚWÛ#F®îc_y1›P6™‡J/K¨¬‰åØ«D&¡ùq9ó¯¸¨±É≥”∞(åÇSÄ¸ß¸—œÅˇ0ò∆I‡à´ÀY¢˘´–∞‚ √—/fArôWWﬁ9∂k∑[ÿ'Ø\º“
$5æ8¿‡∆…%˝ÌS"#˙≥HçÉ∞Öòó+©}ÜÈ≥ ‚r—47ÆΩsc°Ñ/aæZá≈ÔfÎusó≤|æÚEπ∫»|*˛,â«œ@¿<ı“`_†Û {ÇWªgg õ∂Uã%Íπ‘…UìUaEYQ@ $ÖaÂΩÎE\mlÌM}ßZ®')è„w®ƒÌ¥ÛA–WIJØ7Cƒ¸Âó*B-}# ÿú¯bgK_Ö¿–ÆÃ¥$ÂiSÁó^NÜπºÅû∞9m8º…è )≈™d…e>ıã»£ˆ˜#∆ÌΩ}KÚÃ[œO[ãÏ_ΩzŸ„¯)<ª§Ü;rîF51‘S_qa®i s#¿¿ÒI^ç◊Œ[~òN±ˆ.:,µ—yÉˇ%E¿ÙdÍ„ú[º∑ke∆Íä¡d=\¶Ó>/Ü¨∫Õ≤,F§'8õˆ¬Glã\,∆#*„ 01çºK,jÚ≈Ä’U„-£¬;æBXÔ,†ìﬁn-y”pâêƒíl∞0™#HREÄ√Õ$Ò.{∞ª¯/ΩÌ©2dß£(ÒK‚§°t°vØ¿Ç≥4_ót6i⁄^xÅ!Áœf|˘ô¯å:ØÀ{Ïªo˛Ø–y&ÙrÅØÛ&ØY áX;Ô!Hí8i/<D˜i/¡d£@ÓAu˘ùTaOŸ¿Ú¢øôh£xdqÚûñäù—êz@… ËÙΩ!–QÑo÷Å\óÄRÿ‹¯/ 3`‰ı0Îa(Aπ´Aoöê”ﬁNpÊÕ¢L¢ E∫SP¨ÏMX8â√é∏†ˇeµÑÊ©å"ÿJ¢ O≈Ñ$o("≈TÙE√íe±’P|*´H˙ÜbR†ß¢Úá©úî‡yA˘ÀPR˙*ÂÂƒ±å* ßÑ <†ía∆ø˚]πm0Õ=[ƒ?¿Ìù1O q®döCÉ!q©Ï¬KQ◊ç? £«∞$ËâﬂπL&2áDó
‚®L=’1™x√T≠á¶9ßø3@Y4§•ñÜqjh+ó≈ÑR Å]Œ‘}à‘EVûq¯!Ù…ÁåÉ„ÙAñ*√_dÔ$¶@Í¥ÙŸ:¸ı&ÒEªs˝ˆ≥´ t…ÒÆdóƒÖôÈk≈ü2Ã$D+3“PfÎkö?üB‡ﬂkYëñä∫ƒﬂÅÒ⁄ªIRêä∂¥û⁄™ÎM≈ :w≈0¢æ+∆W¡‰ˆÕî Ïo¡∂¨ØÊ+ﬂÛ›àì‡ ≥c÷	√∆.Ø<Ï/≤/V‡˝ﬁ√5√ñï˙©ﬂæRÖ[5˚ … ÖóL⁄-·á¡€Ê¡†ì8„∆C¢≥Äo-:◊ÿñeysZ¶aç4£à„iv…∞•©¿3¡GX8ê*fH!˘;7‹”'òAGSÍ|,h.«ç˙4¶X¥Mé@Í∂ÿ_±‚}©ï”_≈≥lvºJ~úB≠◊^8F3?Ä„s…ãıÜÒ∏’AlÍ,ÿ;U∏)eL–ÅÇı‡<àë— àıÂa=Õµ©IPj 9Ëd±˝´≥≥pbÁ÷Ñ#…Â5áëîâ0∂†õ@ O@∫,ÍK-≈@_å¢@ƒ…Û@£€Dâä2~Al%.ï•îÈ∞2ÈI=Pˆ[¬…ó
¸.˜Úå7úˆ·Â Á∑⁄èŸ2íãx‚À6 Ï-¬∑Ó≈"hÜ‡G7H±Ñ˙o 7X¯çã˝µîc(¬‰ƒá‚;ÍTÉY¥,•d
«¥-YêÂ¬∫¢:ŒñÌ'ïoeé©R@0_ï˜
˚T˘ñ£Q›Û∑b™®|ÆêçaŒ©‹wﬂ¸€ˇA ºjDÁs~^4»˚~Ø•≠ÁJè	∫\÷Ê‹rösF"Y⁄…·	:πÇÏ»óΩP`|&~∂ïÌïEzﬁ-Ìùd¿«çè≤´1ÂpM÷ünWì‚8ÕÁŸUM¢â÷¢é'\u¨PtW†WUâ(†ûà°(!åés ˇ∂À∏‡ßs ~jgPM¯ZÈ≥éIûõ6Ø8∂P¨]ﬁ®2êÎüîÄ`ŒùŸıãZÔ„ ≈@ ZØééµ∏∆”ÿø‰£+∫UÜ`PR¿ zøNwîñL*$HM ¸º
ä˘TÛ*)
£m“Õ:’FrOƒøí—K	ïx=ùœã»0x·0@ÆÆ®hSG®mÍ
â÷.˛√∏¡)ÁÏ Pö÷ÄB{Ç:6SıñµÀ±Vu\¡[—Z '≈ı~¢SˆŒ „ ØÖ˛ı;[r¯ﬁŸ}±{º€R‡◊ñùä^)'P0Ï$«ò¢óRÛÊÍ$§E*ñ®TDJBπﬁXKuÏ˙)À~r≈;ÏeÀπM«Ò˘yÙ˝m”RF˝Èªupr<ÔV˝(óúœñú¯ªYj[yì}¿®qÊ¸Ô1,{¡ÒNeÖ≥0Å∂⁄®vL1Í◊A2¢éeß“â7ÕwÍ<»v‚a⁄∆QêWZ˚Lv∞s∫ò˚W•
æC?ïv ‰ús^;ÈŸı |úGQæ7ù•£6W-¯Ωês⁄~œ'Nv_€~•ZLŒ≥{¬˙•˝/Xä:s(u9VVVW¯µ‰´åR8a–|/ÂŒ ˚π•1≠5Ít1úbÛ`oæì¢Ìb—’•®“ÃN~0ØUõwUr–$x5¨Ñ	ülNQ	HÔù™ar{ÕpäX¥Aıí#QÿRø=≈˙Çcúb⁄rÉñ/∞'ú‘&aÌîüî‘ä´T†§ëí⁄áÁËß?¡!)’ßelƒ!ÊÀo±»[X*§™Áç—	©<6Òˆ…[^~¯P„^—9n˚üÂ¸.ñVÒ.GNÄw=æW®Úì>Â∫@é÷Bƒ”…9»Úh.(ikF¡0’!îóù∆£Î‰rtﬁ„¢˛YésÛ>ã∆Ë?®Óä$“°^Ø8ù∑B:;Õüπ{S+o“6L[èpíCﬁSêS=Í8Z™óÍ“úS3bÂd´Ê’3ÍeqDéRŒ“ä¬”äp¢‡∞r≥dç	◊Ü,wÆS–´*Ω3`V‡AË\/	–/Ò!(iÜGÕÌPcHt'∞üœÓ+â¸)E˘s‡32TÊÎz∑óÄ≈∫S+•¬™à˘ÀÂwÛàáÜ∑7FÈR@ı@2Dt	ºÛD©C˛5⁄	5àJÓ%åcùÂÑFŒœÉ7Ωur|»(ºÇrIÛ˜PãÜ†∑ì˜\â¶éQΩÏ0.È•4{ƒèüÿ‹	^ÁK˙6úÑYHRÎb±‚|r{~XOR§	4e(°°1√w2¨)∆—7¬ããòTøOÛ˜ﬂä‰{¯=!HﬁŸª¶˙£ÂÉO18•%¸1ªË>ÿ‚lF$¢,ñP[(∂™z*9]Â ZPüFàπ›˙ˆﬂ¸ßsÃE¯xsñ≈›CélÑ_Ì1«9Åˇ#A bÉkp≤Ê?f˚=ûVMRn˙∆åQdJAye6U∞5ÓŸ–¶Ê∆u.›∏>ê˙≠p;K"Û™MtŒÌzÅ/ÀùìÛz”Æ3,\ÈúöPªV‹‚’ïæ1%≠≠gÆ{Á™˜∑tZﬁN√	7,∫jm˝[ÓÍ˘vL^ÎoﬂóïaCÔ≥á{Ò˝À\Ï
æØä!LÑY- Ä+m˙Å≥S§§ñÄ"«‰È¨…}ÔJÚ∫,Tˆ)æÙ(b£ìGlT?}i´©mtJA∂b÷∂Ú¿çé∏a.bm•ÃaÑwGÒ∫v¿µ¡≥ªíµÉjtÖ…G h:ÀŸw"L\”∆¡ô7´4;åZ›"õ≥˚!44u≠≠t‚3¶ÇWX
ô‡rΩ¬luAmWı[®©ä”nQÕ‘(©pÜﬁ	Üﬁ[0BçÖIå@WV°A(~_6‹ƒj$êE…ƒGQÄ$lC∞óRE≈TQ¡T›Ë•¥Q`	j!«g1ëF¬X–’Zº`+nl∂ÿÅ≠≤ÃÅÓ‹!>–›πáõÉS+`Ç∆≤g‹ıúG}Kú’⁄Éní◊π'e¡Õ›∆aò\¡î–@ã‰ P`äx	Ì	Ãc≤s≈SïEˇ°
Ê¬Õø*®9)>˚*à0æûòetYybÑì yqúæ %g|ñ∂£xÊÉdüª	Í:
Ú›L±&V‹‡i<ÛÃÄ œ¶2îÍâÍB$\~–d,Jµˇ≈∆◊qVæcr9J¯’Y¬Ÿ$Dı
æPO/“ã'‰÷≤!ò{—x[|Öü∞O8{°Å1‘ß›Å¯p*ü|Ó<ONì$Ñ<õπ|AU/œÃÿ	–îΩù‹«òL—ˇálª ÑaD7Ÿ•!ºAè}rl6ô®MÛ†ì!Ì¶à@ôRÙàæ‘b˙>— Ù£≈ø4P0>Ò+øN@~Ä‡Êˇ"……CΩ!Á[∏C©ß°D¡d#OMÙ´<ÅºtOõJ~à‘Èe™X<ˇÆí5ÙP1¨F∑õÃÿd£kd’T√äHu˝ÈªoˇÙ9(˘A∆euKˆŸUiˆöœu≈˚Çvz_ 0¶Coí£—¢J¡ä0í÷+ÈFSz†WÇ≠	€H…:°º˙hBºØmKËáÏ)µ√]fè:’2ı–Z˜√>w{^©ÍM™.…çqSu@s`¿€£∂»ÕÇﬁÃ«ˆ∫∫ı¬`^N–«;Hø›’¬‡◊æóçzËEÁ”Àb¡"=XÔÙP«»≠¿v‡«ºtxñÍæ+93r#∆£Ìxﬁê˚lã45lÔÂ—ÒÊÀ„ø˙I~ÀÃdæ1™√éÅALL°ôg2Ë{YµõFïπ∆fëÈΩÛ–c;¬ãùGÒ),ßÍ·:Ÿ∂Ä’ì8MÈ“[Ã»ƒ∆ò>'Õ5sÌ⁄∂∑í”z+|x5◊9üÆöhê\‚€≈ ,VK)0P◊@-J8n†ì	ıªÇ\&‹≠ñÕEî*æÏX=rø˝„?‰öS…¿I˙-•≈VDó%g‹’√(µÇ <Y‡?ŒÑ·IƒEµ§/ƒá@S3©û*¨_Ì∆kÌ^ÈÊÎ\^e›ﬂ{x$‚ºÈtŸiŒ÷ì`E
ø;e€—°5·æ™Tœ©ª¢¯ÌΩG{DodµAÅ/Ñ£ÎŸGTs’#Rd≤2+€[ÄÖo8ΩmË
9MbÚX=≠1πNûªGG≈^ôdóì§Óm‘·ﬂ»É»ªQ\÷…ùqUw‚	Et!MF≠úªı`%•çQl>∑Ë¬Êï7˜N∫°Ñ\ç®øìÂ◊íè’˘ou*iR‘o0cm¯sÃªd∫2Œºöc¢HÅeZ8<cá¶+‹o6}ad3<á•¯awpÀÛ~‹R
2T¸Lƒ]„ÈÊñ¥Oó–,}xQ§8–\m~a3Æ3[Ç∞ìÊñ"^∫,·af•‹˙%≥)æÛÇ∫úFıqAg≥⁄)¶»Ω1g!ÕêÇ°≤ÓySs´±9∏p∞-–≤≥ñRG¨¿Lv\'V§FqùUjÄV%qäx›Ù¨ £6è˛é$.πQÚ6∫;πéXô7&≥3jjZ“…BnıûH+J,SLôeeﬁOƒ±	zõªß˛¡ãBë≤vû2ìFú≤øÃ9që>˚ypôrS%
 ﬁ8è$Ã(1<üäîó?ù%œMc√ôaÑ71ùé–µö†!Ò.æ∆EƒÂAÙ$™µ÷÷˙ré¨5ˆ&xÛå¸©fF”_Ê?À√óÔπÿLB_≠±ºI-á¡‹]]r¢û“+’z”;£¸LÌ-ŒütË≤ƒ˜äS◊{π-FòÓ”.lh´ﬁK„q¿´ø'æ'?^ÄÂﬂ”µ@R¬◊æÎüï∂Hº˚≥˘íœ∆Äm“HÖ_<lî –_ÜwûœÇ±‚(ÊGYªS:ôPd¥ƒ∫ÚeíNoÕÅ◊ML)¢=)ﬂgö^¡êëIa&m„ƒ? ì¡–)•¨µÌìÆ¯[˛·˜’Ñª<9Ó6GΩÏdÇ◊UΩ-≠ŸíÃËkÖªZl’:˜ªM•¥»ó]n≤*PÜMú∫±+ï≈ë
˙Pö˚SÈÒ6∑6‹öÇtn@‘XV1Y÷ARSh∫;à™á™2dqËRˇ-¯i∏oWOÅıHI«âS„"*çlìUâxQXò4‹W≥Ïe¨§j¿æ,¢lÑﬂ„Y÷^^cü≥ı>¸oπﬂÔÁCØKß•oaƒ{;§k1‘(IJ±¡ìSwdñÍ¬cNc‘UÜ„›ﬁÊKxëksê!`ò6MÒrP÷˛ÏJôÆ¯3}úe◊r·0xœ'®>~Ád∑ê„p˙”Uíw™†ó»ècRÄmà¶FÂµƒJørf™6 ´™ùäÃ≥‚E9±¨˛˙®™ ´pPL Ôπl◊∞íÃŒó¥ d4}∞^(áæí„`~?ñXº[˜Ûv‰x∑íÿÛáPJ(úπ“UÈqìw0√,i°˘¸âÛÄ‹P«,5Ã%∏‡k¨≤rïs˛µBìËUKΩî•ô≥”]S¿±’âbásó‰”¬†v]∂ ¶7"§πœëôåû|:*Z^Ø
mD-oÉ¸Ìü˛6W…ﬂG\8K^÷mê¥§%KÆ<≠=Ω2;RSÒµ\¢àô!34I é”}å’–uˇ˜ú*‘ö≠è2«˛r¢PHÀO]‚2nL«-5√QFíSãÕIzÊÖõ»ŒûÇ∆®⁄TL†Œ9∆LÑa[√¿ÏéP∞ò‹ÌØ÷àŸ!,/¢∞ﬂwÇÏÆåOlıqü‹≥&∏ÔAØ˝ŸPG<]Ÿ€"@¿J…#¶,[	ö9ŸíØp⁄ˇN0÷
['rk ∂8@ÔÀIÄDñqˆﬁªf¨»°äÚ¥⁄G‹!mC—†Òª€)<˛Íxˇiƒv#“¶?©Ñ±ùÒ¨ê˘ùn¯;}⁄{›Súˇ3Õ/.U≤zÎ>U©û´ª}r¯B\)¸ä.êÕù∞*5p˚ËS5œœLNâl¯ül¿Ã%yûW 3éYªiﬂ‚4ª•VRbL ô$o˚›ÔÿΩ"≥ª‘«ò*O∂ÑâJ∆‚÷<<~)Ûº¸È738£µ®¥»Dn≥n‡0Û‰<t∑‹nÓíÎ^ñòÈ˝≥zã≠VÆH4K√°0⁄ÊΩ◊÷íŸ®‰™÷V0Ω^N]J-E{¨ä∏•…Ÿ¯3v´Lª(päæ(j@úY˘PAf˚≥"π†—s∫8ãÌc◊L$ö«T-BMññDuızÅ ≠ƒ©zëÄÈkq¢´◊ óèµΩcÂ
˛≤b⁄,”¬òÕó€`3Õ°ùR?éQ·ahπS¸,G6¿Ñú·EDS8À9≥ßÒ±û<Í‰ß¯
ñ@s~zóÎ	ìÁ.nôí≤j”ãèf„”	LÀTåê”QcüMß“Hõ§ãÊÓˇÈ∂4„∏Î=ÌLáSoÆ4«j?öÌÕ Ü‹®éˆ••c$∞Cîÿ5/a≠9ê“ﬁªpçC˚¶@£EÛdf‰A\øå√Ëçß´≠NqÁﬂÎˇŒÎ˛v≥˚ﬂÙªèz›7tˇﬂ€Í-·¢+Œjx*‚ﬂ	æ‡CU0≈<Ω⁄∞
‡46x“0W∞z[G1î `⁄äñ´IdY®ã‚Â∆,0iØpmﬁSQ¡ê{÷ƒ÷‚¨sëA‡ô<-≠4üÂ++Z.¡ìBDÍ´ì©«kŒ£yFª%];m‡mµdóWÕ`˙¶6kb¥9+ã‡»âu5ÅÔ@“Òö0m…;†é{∑Û9}‡÷ÑôäÓ˛ƒÙ@\ósÑ©V«ëWÕO¢N·ÖûõzS#x£IﬁHG q.–pCø¥j¬Gî`îck/ieiŸ3âjÛ≤ÇÑ€Kèºtîy§Cj˝îVA∏›˛T2™wMÀﬁOpÄ”õÊ.*í{Â.éªê«éï‚i0KÏ©‡U^_agüÊ∑0·]§%ïΩëƒösW’k#Ω6p—UöåÚ4QØ≠(>m+∞¢ˆcÛ+d¸û™Ëbo≤å„‰Ro¶Ñäº’+ïJ1}˘L»A6Ú9	1ûeDÂ^¬tãõäò∞+ºmÆù6ÜöH‹êΩS„Ày(!üçé’I¢¸TµÆq÷ïZ‡~˙∏¨ﬂ˛˝v≥#¶z…r˚¬ÄâcÀDg•ÑˇUöA|0Â•ﬂ∏î˙Ë’mDü,•ˆI5•¢b	æça<Û&õ¡4ÌüÆess¡6_ÀÚ_&ïØ-<CâëÃ-íè3FΩxI4∫Ç´ﬁO%<q/á™™TM∫bM°Ó·SmÕ{Ωû˙uQ;B2z€Ü/€’%4!V[˚±ÚV±≠πV€\#∂å_4è”ipÃ≠®Ôö±iπ√>àXÈ«]≠^rª¯ïÓ†æ3E~“∂K¨*[¶V´nõ˙µ…÷i≠ô∑/+ß’“v∞∫ È¿ç0¨ÎzT¶U©ΩÚâslÉúa+„áV˛élÿ@a…4`‚7;‰óYÍ"Æ”@aO’œ⁄•
Ê"íg4bYµa—∑eÕÙ÷0Ê%Ÿ˙DxÎ{@Oç±ê	Ÿa©2œ¬÷‚ìt´—ŸÎòùÅrπÇ‡?ÑixFaÜ≈I)<‘ærü*_£}ênÛlú}ΩŸ‡B~X÷g∫«§å8%ñ0¥ !∆&|∞U3ßöôº/ﬁYòNÅqC\©ZLunK·õyΩ ˜∑ÕÜl“∑•ƒƒ]´…Ù+Í˛ﬂˇ#£RÖf_Â'—Ká¥¸ò‚Í´x∞gô	_4ÕøUÌÔ–˘ª˛5⁄~ó™ﬂï‘_S¯Ûî˛≈ÂπƒO;'{VΩ”œ˘énãb∏=∏0ÎIB…ç¿˘ΩG‚Ïà@Øä©tƒBd÷€»o»‡/™Ê5Ó∞ YaV«Æôg‰ÒR∫≤ŒîÀ∞inJ5•zRäA/ñsO*Ûq‰t¥gt¥π|P]‰åw$uTS∏ré◊Áz§%Y˙ÏäØ≈µ5π„…ßŒÌhﬁÄπs=éÀ˙∫~v•4<ÕÛ√Õó«ª;Ï€?˝û8õ√›˝W_ÔÓ¥îúZxìº0
ˇ•àÅô10+ßÅïâ]AEÒs∂xCA	Œ∆´∞˘ÒG)¬¨ÁÁÑÕ
∆Û(à)Ê?ﬁø_—WG\ï¥Ö´≠ËÜòNä7^ﬂ`FZƒ€JÎ*“ÙŒ»ìÀZdÓ´Dö $‹ó2®∑ñ®ÏEÅΩ…§a
˚™VOM∂™ã¢€≠Ω¿d.√&∑õ®s‰óÖ¯%®á®j'Bƒ‘x¯¬C›ZXi"Â‰:ÓÌ5‹Tb‘ª7‹yyˇ.◊5Rã§ç2¥È¢âπJRqÁé?_{—S7È˚öÓ»ŒK”ä‰,?`Ü‚ÀÄ›+πRÛëb•E√Öî–¶›0ñ<QÇ∏ΩN‚‡Û≤∑hœ‡‰ùñäµíªŸƒg0|õw˜÷+›Î%Á—1ßìZÓÂaP9ôT¨Ìr¥M|˝~ÎrwÙÙ≈ıqxuw-	UΩÚ8—ÓÊ”m¨®ø{RÍUÊxS˙<Ä©Ö®üœp>0%ÇòbÛ@Iw_nnΩ J⁄^Ó˜ˇ·˚Ïªo˛˛˛Î˘;¢≠;{Gº»∑¸¯.ß±ı·≤E◊Ç1¬◊0Y]m\π6dô®ãiÿ⁄ ïëïê¬Î0•Î∑1÷.øöìEÉT~˝ÜK)_è¬{ÎÕ ú"WZ¥¿ﬂ∏+Kg_∏≠
'Ã"«à,Ïﬂ’Ü_	)∞≈óπ„™$d∞)ø##÷ìBî…/z†dÿi*∆ØøtOÅ'‰‘¸YúÏê$∏è…z®±#Îgmt¢eê≤áM8§a•IüiTæ÷µ_"r©ıïVE¶§¿∆WYó◊™7ƒÛFÕŒŒ¬è–Âí:ãb ié’Ô≥øbZ~)ˆ9{D ŒÍ≈¿–OÊÎ≠œÆ‘¶•7åà´◊oø+F*}ÚY¢JIÓTÄ#L—Mÿ@sﬁôzï"ÏI‡è.€«≈#„ï6çJx¢˘∞õsÏú%.8ˆ©Í„¨,gŒó+Ω:N^[û6Ë¡—®Uı¡ù§À[ê£Ç∫Õ∏˜Nﬁﬂçª|›å√Â-¨¥.Zƒ ´NË¶*⁄çRÇ=*¢4≥‹aÜa(2÷~⁄ìÓΩ8(Râ¥:¶Æ-)#JGØ^-BÄπE2oÑ95äÇΩmÆ√Æ=	VÔ˙"∆‡2´¨(oCw·CçC´$/•5ç_\h‡“ÑÖùíç§¿∞ÍUÜÕöÄmzb4‘ÖñÚ6åƒπı›7ˇÁ?Â—?‚dº€y˛{2ˇ,æÅU$˛hëùŒ.Qπwü4_)_Õ/¿HãK“ª£sõÈ2ÂNQWäóå®ç+Ü∞´Öò¥zÑÎ≈P°^áyπLE@≠‘Uòlz3ß-îø«º$©ƒY˘™kmUOôıgJ[˙}<B„@oä^BF≠T‹Ú29ƒ™TXø5úª‰•Y8∑n§v3ÕDRÊ¿Jåîù≤…∑J\Hﬁ€ÛUΩKéñÛØr#õVﬂ¢π™Hø môÿ·u!¶5◊œ7nV.ÈÆ»Ù˚¡ã‡¿≥”‡LÍkÂV¿ªa[\à#∂M,ByÁ‰{uãß£xR)H/’RÿïK—KµïÛ ô¬VdπKe^ZˇHV'-˚áëG⁄ëz ¿/÷«th
>RJõœ0‘xO∫ÑÉ±Æß¿K±0]r!˙ﬁí©Ö•öÚd´iëûŒÔû∞*ßÔF≈Ôû˝ÙL8˚n`~]™$(¯rˇ˙æ∂2Ppå7?‹CtctñvHüöñ≤cUgâÒÂyµx„ 0T.ONóÁ¨Úså£¬∫ˆ]Â¿∂»Aië√ b	”ì¥çqb+¥8’¿µe˜6Èìêü©IcCÅª£K#CVW{√vs4-<™ê,J§+|íÁ.oSù«~¯ê!0Iÿ’∆»<—'0*}ˆ€ÓÎï~ˇ;=∏ıÜÔóˆ…Ù‡'ÒﬁÃíÓòRL^´êvá<–ı◊Äp0Îâ¯9Ì>`Èx0ÌÆSjoq.∫ó]oñ≈OƒÙÀ√Ä/F!¢`°	˛O7ç0 Üƒ–9ÅèâQ(P‡wW>F¿≠~Ï^t¿_]jfÈ»§HﬂÚæG°èW*“∏Ò›aÃké∫Øı?åﬁ‰√R|"Øñ>g_Ò…ü/6U√¿_ˇtw}˚ãıÌ70ÒU>Ò59Å”ÍLÏÀwdA0QFcÿØJÌso⁄]È≠iµ™ı.∫èÿ˛ìãÎCõ<∫Î˝˛“É~iÂÈÀ*|YsçX¸õ√€Ç-ÄÉ˜æ€/ç∆Ñaû˙†÷`Pkl©4¯%}u>ïˆF+jk|t3¡x@?¢sê†&n¬ÃãÄ1@ Üπ{AâÈ∏≤,me–1P‹…£Ø}ëSFdìyºDÖ´mAÂ˜QêÍ≤
≤ GÂ·Uà∏ïı¡≠TﬁM+´Òzyy˙Òç2…•/˙|Iêöçs§(R≥SŸ	“˜Ï€ø˘G‰ËÅ€
ï€æNxpAet”ö≠æhÁ•_Özö ‰«⁄Â¡TÁxÛLAõ)Í0‘¢öß≥,ãÀì„¶∑	áÔ7Æ⁄ï¨ÁÍ£™ì9aO—µcÉYt,ıÎ·¥⁄	)¸·ÚúÙÑNÛ°Â¡]

Ë<ÌÖìa4Ûê√*ÍÂ*?a@b¸√∫æiÑú€∑Oü‹}öÃxŒ¢∏pÍ“+ıæ¨©¶•≤=%yÙôP˜&ò]ûoıI%Ôf˘π∂~+ªiÁÔÕUt*ë£«“•Å|≥&i'ÙÁ«T†≠8ÚŸÙ#P”Èewπ∑ñ#oƒk∆Û±åÊ„4N∫”8‰ò9Ò&iàpÄD/)[»tº`4˘6n,¿¬°·Ôπ°N˛.Oß‹GÆ¨©πÍ…√ácœÔæ˘wˇ#P†&†9j∆Ü.e„X˝÷©Æø˝Ë6:∏ÜdÂK~J≈D∂ÕJ<q˛à+ø˚Êˇæîoåg?0◊3¬ñYúµXVAãø˙B¬VÈ'¿ó™L‹◊#œbÇ∂*˜± <Ë!ÄˇØ%|‘Å6c%ÆXy\jØ9jX©V2	ï∑DõÀCò…√|Mâ'ùsèÍŸ≠ °vÌCyæ˝”ˇ\¢Õ’µ*ëgÒ≥‡çÔïÈÓSçÄÎ,R~ÏΩdJIi˚è‡+∞‰ü/9X îàõ^Óóx˜Z^T¸¿1@ÙXÁUóky‰Âuÿ=¯ü*b®lÚäëMæ¥z6ôÒ«® 'ç¬ Ú˘ùÆU‡≤±À¯Â&®∞»
7<>≈ı⁄•ÅWx€"°0¢0¢Är&tΩ/∑‘ƒÅÚ>/„eû%Aë“GM•Ñ&J‘ògp«¿¸,Ê∑Y»‘©vìàúÊi‡≤8é“^C∆Uá±wÄéfß„0€∏*Âqæ÷∑å0 ü-,ÇÑ»’Í¶6¨
¢IQ⁄ﬁ*∞™áHì ¯å?»5n\•£¯O$¶} h≥Ä?\êˆü3o#SØ?¢§ˇ,ŒR„WJ0¬{ΩìçÖ›Ríi3SBj»ç+ô—⁄<$@ŒîÏg„*@¬Æ“‰<°5d`©ÓöäJ8é·)ûƒ∫ôH~M‚àÓJK ‡+¯4Qoö ~R¸@ìEq˘Ò,ã¬I–EœbÒ™$ûõ÷ÀL3Õ§ç?
ºÑyJ\€¿iﬂS†®~uΩS‡zf¿Ï&·˘(”Êçƒ	§≤M+Øπ{lcae1	zçÏáAÍÓó§nDx1[§6ûU~Ñ˘’ÑÁÉ2q?&îÂÿæ˜)·≤Í∫V¿˘y‚˘tµ_wRgT^Ö?<èYß(±ñø+ ≠È⁄=Ö—° NuU=4
Û„˙>‡]Â	-I@µTôÎJ37luïmÕAId÷Ÿ˙ ∂ò`ÎÒÎE°4:k%”ó§'/≈˘üURêñ†RW¥@ø«Ò4ÔÏ•˜!<Á¸‹1úgMEjÍ_≈éS1Z‘£˘»>í⁄òÔKáIåW{$8‡†JA-2_wq?6xª•:ß-Ú*&q5úò¥D ¶+\†R¡¥"»ó ◊"Räê˙”2$K⁄ø∞hÖ'ß$¢∂¥i!eá∆A‚E>?ßÖŒA°±OÑ?◊ƒª±rUT÷Œ§Û¥1∂ä⁄SéÚÅE˛ W’Ÿ˚∏ë ÕRõ8xÖ),»7Ñ≈T⁄ußdËÌ•"éNîluîÎh¨˙¡2ˆáµ„≤Îö.’=B®ˇHõ¿“Ô≠ËÚ°J4^Ë¢Uoé)'‰,J´ÎŸôhµm+˚[`¥ª8àÇâˇQ¡&'OŒCúπÇ0˛ é_fn#[RR∫O◊∞Ÿl˙I˜∏ts÷ü˘NÎ≥˘qÏwC£í¿≠åﬂbG9;Pó€æ“Ê$ëDŸPp∑@qäæ´õ˛ü=8»y@‡ΩÆ3∑?^Hÿ¬—3ÍÜhA›ÙSÄ1%rå˙~Ä¡ˇÏ· ¶#¡s0[BŸŒä∏¥˘~“≠Ê1ªÓªÕgÒ„ÿ≠Y!{∑bSSRÊNºs	ÿ¶Ë‡Ü«[[’1êàÀ≤˚óµÚ`Ó)Sq™zEw_à}Ÿ(,K©¨¨—†aln±˛Ä}Ω{∏˜lo{ÛxÔ’Kv∏˚ãì›£„#÷^YÌ~ıÍ‰êmø:yyºÛÍó/ÅˇŸ<88|ııÊÖNv;ïÒCªn	À("îgm◊˛öJ[|¢‰ë}ÿÔ£{÷TQè†πBÒaçÈÔ$æ†OYxΩÀâN∆ãºa÷Tão∫â°$ÕHMıÃ·zìwd≈n‰Rdƒnˆ∆H‚A∏@£√÷ V~á&f‚Ì¬ˆùƒºà˝bÃ¨>¢iÉ}$ˇ÷ƒNí¡YÊÉ™•®x~9
&"IH ÏCËÂ‹˝q˜J≤€1ä.Y˚€ıOèuíπ_^"ﬁ,/.?|ÿA˝¸dÕ˛óÏ"D©ôG:ˇ ÀÉÑgdO1#¡e<√¬aÇÁ@'≈ÊÈ¯Â»ÀRX©øÁé€sNΩ…{yÕ—“sXdÓ¶çKç˘!bî¶CÓ.˚8Õíxr˛Ñ/6Æ2ˇMCc[ÄiôQ€¶9óÆ.g{gl6ëÅÎÃ;CZYÒÜÂtì‡≥ãI9K¬Ûst≤±nÈ‘r0åöWÒÕ•W(%9Ë˝µ≠÷º~ ∫¯k@ π¿äÊhÒ®’¨ñÈ©Ÿñ`=¬/‰ˇögIêéôÿ“Q¨ÎòŸıˆÆM©ËMÑ∆—{ød—V⁄sj6jF#Õå\Îÿä«]R;Í≥#æÂ>Øe•©“ÚC˛3†!iËR∞∂Ñ§Ö'/c& TGè fZ…¨«ƒÇ¯û(ó§ÌH€Æ@>)·1B_åˇAXãêV™b-L[Î%W]Ñ∞´ã–n
H~ÑòàP0fñÖ@%zuá∫˙°¨ô∑Éà‹TA5Ä"Ü4N›~w2‚R‹{∑èëó”^qä^ÚõÎÓ¯¨m	`*cSÅÏ¥˚ãjú™⁄€Ö˜ÂçÇÎ˝Nßy?˚x/∞µ≠üQÌGÎª£§Q©>öÛª˘°Ìr|ghÜ€∏öˆBﬂäâ≈$Î$ıY(snCò§ñ¬k›7Ûsæñü[5 3ÍcV·FÂE57:æ‰68qÊÍ!œÀ&∫(–%ˇ∂FÍRÄ*óJ‚4EXG-Ã.ª_¨ôiè|,Vj˛ÿπ,|lß	ü—Õ®æâbè/o:#ú∑Y6F∏xo.d>òñπ0Ø›l¨£’z1¨õê©ì cÖõ=rW√‹ßÍ0(£êÕ0xX}AÂ¨¢“ûÃﬂÈ⁄c1ô[Nz97ŸH_›i„Y´¯ ™–º“Ø
Af1O¿~√©#‰gÎí{ ¸)x¸¸V0˙îCJ˘7Zwµn.~X)U:f9®ÓàòEÍRO4Ëì„√Åî.*ÁÖ{ˆhÍ—¸‰‰Ñî5¶œﬂffèü∏,πŒ•ôπ …Fπ,–®ph‚Pqy∞ÁÎâ˚∂eò˛´æ7å9E^£ÿ]÷€Ã:t	˙–ãÇc‡∞DîÏÎ7»Ü ﬂJ◊œÒÚz6'3
åñØÿugæÅ7Éµ+Ö≥xK]∏ 5˜YV√k"“4k@'ä˝¯ˆÔ˛3ì˙	\Œd–t?ô÷‰•Øóñõ¿uQº!ÇÇ–9ÕÎëÚy¬Îq¡#6ôö<GM≤ëØ÷¬ìˆﬁ›°ïkPÑ'∞ªÈ¢¶7ê
ÉN„3fì)‘ßs='4‹‘Ì¡YSŒÂ bòòˇÙ{°C£,Æ\{Ûÿ^T‹Ä ©"π –¸ÓwäDS`|'∞Kß9ÛIvÄ√√€Ø¶¢Ñ∏w∞ƒ›~öm¯7ˇ	-¡{rƒ®,,teÌ√¿K1U9Ã3	÷JêJ¯;
˝^YqlƒvIÏÙ[◊w~¥·,sîﬂ0&±0Ioop°á;;˙pƒÍO…ò∆ΩŒ≈1zÉ6 ®5k∆ü™k†î,9j´µ¶•™ôÀ$m8£U“/*¸∞’âsÏﬂ»y»©[ÿ√ß˘±K
àâPí@OÄ≥öC∂]Y*yªÕ?§#˘iˆﬁ†L&LÙHäkÙÎA_≥]“ªW©g\4*ÅÇMŸ,∫UD|‘Wó ÁF‡ró¿¬∑ ∞¶@§ÄSÔL JÁ∂◊‘∑ÍÏÆ-≠⁄¢Ü0LSŸJ9ãwy¿6µø˚ÚŒ¢fÀ=⁄=>9h`£Õ}Ò>çuV∏¥3ﬂKﬁÁΩp@P'fPb‡¡‡EïóyT»¥‰‰ÆÀ¿\S¬+ØH†4o—¥¬Ïõt@\±RnÕmî}º@òm{âoı7ësƒ∂€
4CÏs¿ﬁ%˚≈!€Œ]-i”‰ÏÑn÷µE¯m8í≈ÿ6¿ieEö#púö%Ñå3ch1&‘ ` ?§,¯àYï¥9àÑL);è‚S ˆÂœ(UÁâgôŸiô•ù#*√Ôy˙ˇázÂ.∆É‚ÁäS©‚Ù àº” “N
≈F‹sÙ∞◊“H0tPIã|I´∏∑cµ÷“Ä¨√uD»·√√c(,ŒZFÑßÕ¶·ûo«ƒ’¯¥¨–,8-p.Ëù˜òóPç÷◊˚?O#˚¯åA<π˛Jb/ZıGke‘UX*U‹EÖë ´·lâØ™Ò ;åÃÖ2ßÅ´≤ª w™πN,FÉπ5sÑ>¸„¥·ˇ8¿~ì˚O∞ØhYˆˆÉ√æÈ K¬'`≥®võs∞IÁÄ˝|Ë 1Òÿ˚Á√páá¡˙¡Bf,ç}_'…Å$±tõ;;9|¡⁄ØË⁄5œíˆ∆yT‹•˛òh; ≤i:XZ^ ≥ªıÜÒxi|Ÿ˝M“õNŒm-àcˆ
Á8I"€È®±_»*Mÿ?ê c	∂:Å sÄ-=Ú`ã˚Ï8~LÿÛ"ÚV¸— ÕP'6üP}ÃVS´¿Ò∞"p‘π®‘´¬\IÏÊkâ+’,h¡!µ∏ºE≠qPç≈íB‚W6–ﬂ€M4Ï¯2Åﬁé‚ôœDrÂ:Q;∆tÒ"Ódo.¡ÜE•8Ìb@È«¿∑#R∞‰πô‡¥…csâë]Ò K·w6Ü∑æ⁄€WÖ.ïÏ±„^vï¬Êr9H˙t¢ntÏaFîw“°áæµ>≠9erÜæ∏é¬>ÑC’tOg8S™≈ëÙi¸ëß˙¿¸ƒ#(˛VxÄ…|£bwRë˙⁄.^ø\ùÚi“æãOmä‰f∞æÍF∞S%Ã¡í¢…Üo]'"üªúô“d∏Qû™”˚…ã≤çÖm~yïÄÚÃ•\5µCπÇNåø¯k]Lqá…««éˇPègo‘uä-∆ñ‹ç«©¥7UEyqﬁÊ≤°’ò
–d¶aH√§≤(õSXßí4ÆäjïiD(jRîŸd»Ø‡ojÊ%¶~¿∏ MÜ•ó1]ˆÁÙD©—k:?;>⁄å~Ê¨?–≈¶\WŒ∫1Éb+‹∆∫fíŸYπN»d¡%!„•œÌ"Q¡4ä§ÓÅ3ß%>2ÈvÑ˘ªs∆ßO{Ø˚opyb{∞¡b·ËÍM¨ÏLÃài&©PMÜIqyí†r«òvØí›”˝èÏ(z‰‚jÛ8ÒÈızÓ4ëÂÎ£j«¯áAä◊»R¯[Ravk¬≤ÕVBÆÜ÷Ó”ùü∫’¡'◊=ià˙u∫Ó)‚?ø º¯›d<¨¨∞∂ﬁ`tı&∞RÓÌoˇÙ9ˇ¨˜@f8fMØ¨–uûå[á1[zPehÂ{Y‹#Ù√Í€Z7ıù8øõ/§Ω˚q∏F·»∞jˇdÛèpÍ	$∆	†[˙K$º‰îo’¨™¯[0Q¢v.á‡"ti09)ß“JÿgQÅ3)"˝ëZl≠G3ßN¶6î®.•ì|`WÒ&Q◊-JÊê˜Ω”57⁄îOóJq0ê^∂´ïò•&t±ú‰@:ÜØU¬òrÔç€:ÿyëÍ
?e≠˘dü›…0πú‚mHw–1W»^5¬wﬂ¸Òo¨åë€®\Õ6U|±*Ùå|^‡*ou“ÿû)&t'(k® Éû*YÏÛA‹ù˙a>-dëŒß¿.ä´ßÕΩ”%x˝<∏lê˝v≠ë2Çg +≤q≤v%ˇ<Â[≠Ò ™≥4œr7á5g˛a‹ˆxX“œ(kÒÖa˘hbá—ã’ J+9òö9µ^Â©G≈}n!˜|£¥ÂÀ+Vˆ”÷ı„%º}q]ÅãvÂO√l˛∑–Ô(âVaÇ)*«e‚Aô˛ìXƒ=ˆj2Ë2V1◊‚ƒìËíõµSË Ì=¶Éπ¬G$hEÌL0€(l¿˙O—`3·w^g±–Œ‰óà›g‰Ê)ïiùπÃ·ÆP[x|Ç∏ï yW@|µ-M´…ï¬©ôqÀ~jÊV~ÚÁÃ› aQ®¬∑´R’º∞S©ﬂ‹êgÃkGkfX˛‹ dQ¯JvV2P»¸¨3Ø¯h‰TgÖ(Pˇç4[u|aìDØ¸1ß{Õ°ç'|Õ:∑¯â_®ç^)”P£$±¸q©§*«
3»æ:;´I£$»5ú>K∆YCa˚™’π∫u[w- ⁄¸./‡n*˘Ør“RnDïØÁ˘^-Œ¬f÷ﬁÍ4¸=0Ùú˚*≠2ıGÙY…»#ßÃâÿ{ïQ√ã_[5·
uÃº’8œπ|”'l‰áæ`Ò›õ>àëÙ‹.ÊJf`ª?yÆ”œìﬂIR`|,)8mê °‡ªo˛˝ˇÀ§C#^˚£ôî…jF©nŒú‘Uıµtß]∞≠√Wõ;€õG«lÛÂÀW'/∑w—ªˆ®Å'm)◊·\˛¥Îˆ¥0¥Ì$@{¡¶“{Ü"ß≈ nGfßQòéH:à”Ï∫Ñåî˘mˆ‰jhrn∑À¶ı)è4O^ı"N∫îE~nü€[›"ñ∑BXHÏƒÀ‡Ç·í2úßÖ‹ú˘aº»æÜ!¬?§ÜpJî<Èëïøs∫:?QúÕ1^lƒ>ø°|ûrŒ+10√ì8á¡ﬁ· of™uƒõ4”yº^ä:Õ9w#.w_‡Xr˝·
<É€œ_ä_gLÓê◊wÄ°wà—∏–{gpño
•8N±PkÅ$·t„ÍACÔÀ_&∏ÂÚkﬁë˙&¡yà≤ ﬁ_d$NBòzd¯Åa^≠^Ø	oÛ€ÌÊdQÎ{e)≈‹àa≠“∑ºƒ4“’}º‚Z∫òiÈ˘õYÊGúä‰4Hô~#?ª˙∆8ŸöÑj∂∏5e1*y◊ÛÖ)yiÌµ}7Q5√¥ƒ˛ﬂ Ô-ÁF1ﬁ°ŒÌB‹J8›T›J^	ã ‡_∑ÈÛu¨‚^
Â§svèÜÄ#8¢î◊N≠àªuÜnÉ?HÇ!∞>5q¡Û∫/:<ÅIÉ∆÷˚∆[˘*‹©íˇ≥∆πÊ1πmá…0
¨9a˘vÚC	˚€?˝ﬁ5˚öXBªY ÖhLöÓ≤m·yÉŒ¬ìOë±âN§wß\‹ ∂}.'ÍÔıﬁúD:∂ÎLî5CÈ¯ ˇUH»øˇG&^sé}G∫äÙÙ£ß;˘£UÇ4r˜#0*8¢-y-\ 0≤√€&Æ:".+…å¨‚êN;ïÊ2URNõ¶ÏóÀ1Zmf&iê≤PÔ∂·’ 8ΩKR€±(uF9ı†e’sHÎ5°‚•’y6<sˆªy¸so–f)›lN•&e@Nsü–ÙI¨ªn‰ÌÃ¢¶c¬V≈’–ıÌ÷®∑*X“Ï qŒ\€|øk≤Ë¿ bë«áj&|'—˛®¶ç√∑î‡VqëóÑiÏXÁÂ2ì‘lÿq‚•#·uÓI]f ÁÆu¨Îkƒ"ﬂ≠ìÔ1¬û SÃ—ÆSj± î*ñ+ãã7”û{s&∞]Ã7ßn¥∑Ü⁄—Õó;ÏË´Wø‹ﬁ<⁄eõ;Gl˚’À„√W/X{ˇ‰≈Òﬁ¡ã]ˆıﬁŒÓ´#vüÌÌo>ﬂ=jí)>ø‰¥¶ä∆tâm˙>iÎ¯›õ>;& ƒ4é$íxvÈë›&˙ èêÆ,uÁI∏â…ΩqFz«Ωq”Säw…πç4∏‰ä–»˚«ù´”¢ØUr÷7—◊RK${Æmπè…/#dcPíƒQùúÊ QodœçYÍùÛr®ó≤1bIˆcÊæm[Ä†0πî√ºÚò/àá*®'År^:≈Ñ+8GF"ﬂÛ4¬dÚò$zÇ)lÄkƒz,ï+ìp2Äå°+ WÒ8ê7PcdP<#e7˙¢`d6eÀ˝Ó4©ìr
éEÑKa∞Äˇ<Ázç’≤Å#mNû«ô·’Ê¥6^æ^∫8@ÂåÉ.TMFàW™8-˘¶€ãr&⁄7_NÃ∑ÒSƒÎY›(∑¯0ØMD¿é—ÆËéu‘~	˛$ÿÅvåÿá$Ä,t§y¿aU÷"»õ8M 8mÿ1õº≥DLhéü}^£Ë´£RìïZMkîu´©£åÒé#üv'‘nëöÀtÀë˙Ãô7ú{H∏Ô?‚:ÅFÇº<wvNimÓpØò5g{¯Ãµ€–◊bjá}µﬂov_R˚’_†§>∑…˛M'loOÊÁÎ%—÷i˚_<_:x˘|Èó¡ÈAÉÏâM“Ü}Øf˘ˇ%Ä”ƒˇ‚‡˚yüŒqe∫Rì W'8KÏWÒÏxv⁄ƒTp;°◊ù
Ù.ì_…ˆúìπùÌl;OëÁ]å2≈’’”∆&æ√öØÇª†LÌ„ã·PrüZ=ê0‘àRBJ˝ä]÷›^5’œœΩ_{	∞;€A‚ç√!^CrìLqå¡ß5S∫ΩﬂÇHYr£oÔ^|jMÙn'‡öî∏ürÅë€ˆ`∑√ÛâÙ∏˘¡¿ñ˚¡‹`Õﬁ0ÛÇÍ´≥≥pàÈT_Ã>ŒíKw3ëW˘V$e+˝ïıÜ◊€!ı;ìY Ä|L[üﬂbh¯≥4$Ω™U0è#ë∏"ØTΩÏ“,≤£»s«‘%Ê0É∏®9êWA¸—√/÷◊V¨Ä'Lf∂zœqÙP†hÃp•,SÛ\ ?BÄ∑ªP˛p†z4äì±¨Œﬁ€;LBZÏzÄ¨wìa+bâ<_È¸0©‘æ%\ÓÑÈ9f6MÇ1^ƒqyøƒ˚!G¡rÏ>ã8n{…)´≥pÇÊg?HÅÄ•<m–Ñ|ÛP_Å P¯Tx—˚3Ä„&Óe∑ÇiSj2Cv1´Œ≤÷ |C›ì;ÓM4VmEÎªo˛óˇÁø˛óøì*k]X? ôçä•d!Hë›£q§E!∆]vÑ?√˛◊í˙o`Â^yá/©mjèmcÂòny·≤0G∑Ç¨1;6KigÒ…1É\	Z GC˛TCm B ÂN X§6yf6)’·-±˘Zu§¥¿G√]CY Mëº/ÍÂÇ4€ ˜	û‹+ˇ„¿@Æ1∫Õ[Õ%bn%µè5y 7P/<yu»N^º⁄‹·v\ˆlÔ≈nΩ+D„sQìô	ürv¶9Âîfâáh¿ªÂhÚ‹lú±≠;	Z~'—äíﬁ©Ir¢&©öÙÆéÄVÌoAá¯£G?∫Ëseï}ŒüÜπâî∂û∞ïµfàx™õ I‚§˝Ó€?˛$¸ “*Ñ ˇqÃ"\=÷˛Ïän+•£t◊πÜˇzlﬂ˚éÅÈ¢(æÄ√Öxì-¥∞≤∂ø’{◊`L¡:î
siÕYOb´∆UÂ6VÉ]hµö‘‚¨6IÀT[§4ÁFi∞äõe=ƒiÔé¬ÍáÙ¬uım1,Ÿã'DÔ7X;iHs∑D“ÉßΩÑ“D58”^ÂMâñ–û“›Vçv∞>ı’u„Â¿6SL√ ®È^T2k˝≠8CßúÚ§õ1ú :‰‘)vÍèDMR´∆e6ã˜<y¢Ä<6 •Âà*xÚ¢ta%–E∆Ç¶Ì7W±/¨¬‡ºc‰œÛ]»∞(˚c:F√•7Õs/(ãàs>ŸÂn˛V∂Dﬁg^gÏ©Û—ƒåßî÷Tü5O]*8|Òr¡¿?ç¯?zf“ZWæ[9Ã7ΩÍ<¨ú.U”ÃÈ≥Tïøl¨X9ü_óJ≤Á›pUt# i¸±Niä≈–Mˆ9Â˛7“À ø/ZÆS¢mdÆ°RR)Œ4#~◊›b¥ª∂ãÎcoÃLª}sJö%
,)ÚÀí∑‘"Ò„xJé¯ı˛du!7çSïààW¡rÇM«,&±éø≠Öûu<a÷(ˆÌCË)%äOJËFQ"è›P*È†Ï%õ£¶gÁF„‚/Õ9™°‹}wö)Svä∑lv_/˜˙+oÑ;Øx˜hÕË≥ıÄﬂ÷m›w˛±âÏiÕ˝åè›Ë
º¿‘â…õyêª`È”i8)mE≠°[ö∫EÆUA‘Îıö\ˇˆÿŸCáj¶ﬁ¬Ä‰˛´iß ÑsOPÈ⁄ruÙI2–‹$… z≥âÿL.¸ô¯≤0Å.˚ﬁ¶ö‹a|évÿJÆâŒ«Å´M?H¿ÒQke´X€‚≤Ë◊›,\ãNsû3Ln&=≠≈Î)Eµ!¶JPTKÊºÉ—~.É3êâF˘jY”ù3†ÃüÊ∫}∑x îOÒOã K˚¡«õÃpùj§I!¿zî€¢6^øQt3IºÀ^ò“ø–zO)’©øºÒ⁄°ö·˝Ã&·of `ªìLÅÛ»éÇLàÕW[iéO))"∫íﬁYQçgjOË¢˘=ø„ê‡r=⁄¶{´6)O@FhõCäüEˆíñÆò3’ÌPü ˘©Ì<ùç©t^≠Œû∞æã√x™’I6`ØáCπ¡ãLY%xœ˛äµ≈¯1|˘ZgëıÕ°y¸‰ı`ﬁ˙^µ˚ç÷xÛM2_múê“bñäèxâˆ≥c‡∑óâË‰ãM9.◊z}W
t°aLí8>{5ybC¸ägq¬˚„ﬂüˆBü-–EËiÁπ:©^Â·Éÿéïé[£0¬j∂É9™Ï8_`ﬁ›≈ª∏c≠}ª∫!ôu‚ÊﬂpÇz] 9>ENâ„ÄËƒmëFÓä+>ñ◊•ƒF‹¿RX÷4œÒ&UÕ.Fû≠;aJ%Ië◊î0æåcΩñmŸäÄT±eÕSÕç›$rIi≠i§á¯S\	Çë©>˙Ç‰æÑMoJ∂w*Úî"∂¡"˙ï÷
£e„j∏ §3Î°ÄJxr”ô^ôC„˘6]Å«&ó}7Û´¯Öì™
-«ì©JéÈ∂õRSbM÷±…818–$è≤®sr»osøœà*±-Œ77¡cÕMíx≥?ùâ7mz®Îhé†“/∫≥®*º·FW)s°µ∑‰8?£®¨iÛ®u¬Sp
ñÁÿ‡WÊ¡(ú¢æµØr.Èö√ø·P…◊ò£´A§Ü“QC§OeƒnOÛ(é‚1$˜µ±mmïΩ{J7˙ üË’EO=D#Vr≤”EgÁ≠öñV∂¨@3≠Tò·≠Á.˝W”≈#åπ±@+à
2ô ®t≥p∞1È“Ëû:¶»5lo«ôI†xØ⁄∫˘¨ÕöÙÌnmGòâ^°O”ªØC2Æ˝r,⁄˛Ï  T°§ñ°Œª˘®}É ß¢l#Í’®X≥É⁄0›X¡§ÇXt÷N¬ÒÄ˛nd∞¬)ôP≈«Áòdøœ›áwûÑñ®MBV£?Wî,QŒñR–1˜)Æ‚‚NIwÿ=Jœ<ºñâGr)…áóV˙’¸]•,\Xlµ/cπ0ÎàZ+ï‰Á’óz˛4XÛ¶Lõq∂≠{_ÔíØ‚¡Ê…—ÓN.∂8óç ógÄ¡Ëﬁ9≠[/ÔÛ6¿ª ¬oôy∆
Õ∑Õ:#AäÚEV‘Âı’a÷õ&∞’"Ò&πè‡eû–Håèv,Œ≥	^F–)ûØ 9!Ωcâ@◊BßFk‹$h‘&Wâõ\êdøıô+sÊ∏»Ÿ5æZ≥ÜNkJ¬b˝Ù¥°j·é’G£0à| ÅhMÄ©†Ò∆‹Rc˝á`N´W”-;,Lç•,pE M)ÉjŒì©Úã ˜bKSóZôÂ'PV∏t8%“ª\"Ωˆ´uÕŸ1ùyC‘'ç#ó˝∂.≈*™∏˛j¥LÕ¥©∞h‚πy*Ø:ÀπË«ù”kU7ç∫Óˇm∏à<óÃÇ<áÿ+ƒ˜oˇØˇIáYí≤AÇ‚æ˙ù€LŸ8@È/EsL nûíFTº#ZJaãòÂ'LÑ©À∞aàÏ€œ∫_ouˇûO!‰¡âÑ”4
l.Õ<ºë û®≤cu≈ÍÌ˙Êç…Ø«#∑∫ÖB~)<Wí∆Íô+ãÖoë%{æn≤l∆¬´ôDÿc∞)´9F#b@ x¿–JI˙ozÕ˘ºÅf¥+O÷›À⁄∑QJsÛâΩΩ€QπºU£.´î≈ÃIêÕ0∑ÍR÷TpÁÿ¯AX˜∫kkPE˛Í≈|+™Œû´{ñ˚‘à[∑x¬dE{¯–u-Å¢Ê3<ƒkËpÜß≥ÀõÕ´1ÌÀ+4⁄˝ey◊ò™/„¨˚∏~dúè«ÆFB%íí≤tMM2÷\≥$∫©Ïæ
m∑ÇGŒGø:ÍÓÏ~Ω∑Ω{CòõKó*üõËTÂSIõ≈®Lº·πó≈IoÖ””ÿK›Í]}ı. Ücÿ’∂i›ÎÓ<7?∫€´DiáÒê«Ωõ4›TÕúóü∑Ç;Ò∏»Õ]Á‚DóBÉ _(¸∆ë›≈…¸Ãÿåm«”À˘Œ¬*’¢Œ\ÿm3ïw:Np§àZSƒàHm§8lÿâÜpÀi=+ŒÅs¢‘+ÓµÖ.¿Ì+∆9ÛÅy
'Ìµ‹∑©‰ƒÆ;ú!{ª»“π∞|Æ$'ñ^õ∞πn|õã€3[∆S∆˙x.∞"äxvï(.Ik◊ﬂ˛o˚}È⁄èÔ@íÃÖê7∆S¥±x˘m–V^£ü›Ç‡ó#
k∑ÇIwÔekë]¡.¨µ“ı√Û0É7¿) »µRÃøGÒ,—ÑìY(Ø ˆPLé©í›kË’ ◊xæ]ôkOÊ(‹DõJlum5h«ŸF]xêçb^WSYÀ«‰C|)æ⁄R|;f˜2f4òBJ˜¸ÿpå≥ˆ˛2»z™1L¿ãây)G*»+Ë.)qcø¯,L“å—e1jQÖæ+]Ôè.Ÿ¯É{æªø˜rèmÓ±ù›£ü7π1ú3}∏Ÿu∞T⁄j¶[∞∏LñåowòŸ€bπ;üœöxa$ÏWñç‰¶ª\√P“>‚*·	†ﬁπÛ†o-(y±ËJøÍBcrÈ\[úœÁ»›(◊eùû¿¢«]œ9ãï%7â´:V2oñ<u:Ó[óåîßÆî±e ˝˚±Dp H!f·gœ† hﬁ\”5ÊÊ™Ø`·zRVìWg°õÁ[Ó4+÷Ôff‰ππÄ∞ï≤áî…èÀ.iÿ@ë?WÜ°??Ÿ<‹9‹‹{qƒ^Ω|±˜ró∆§º›Ÿ;⁄‹z±ª„∏\˛∆	¥›np:¬îÛ"Œ¯£ÀC{?»<@DóQ¿~$qqƒdxâ–˜\N_DµEó¿9¡‚r~DoﬁL){<¸√sˇ‡§j;˚)Â ⁄ZŸ¬/”(Ù&√¿Fänö7‹©¬p∏o‰ìK€V§·	2xï™˘a™Ó€ïõ∫ÖX‹,6à$=ô$◊~ÚJ¿ÎÄs˝D6πj∫t:W›±∑•C[vV3D{ñ√%ÀÃ2<q:ãRkÊ.À∂∫CœLg˛ªo˛˛0›Iqƒ∑vÓÊ∂√£C;Ñæ˝„?∞¸ÀÓÑÃÌ∏-8UuÓ€∫\ÒÅ €f)€Ün“ÜWú∏≥¸>p¶äw\ó“4ªô AõTÊxÖ‹—ﬂyôIG"ìfÙøw†∆+/ƒ¸O{).ÌSpÑWØ•GC‰¨}ˆÙ)ìeå˚7ªœå‰ÀW˛≠Wé≈lÊáπkÊ.:ÉˇD√
CÆÆ|Ã<Hﬁ‡V‰Kk3≤Ÿ˜âÔ„˚7ˇh.∫-»ñ(ùˇ¥V8I— 
•ëÍ¡®ÙÈéI‹üÕQ#ŒôCı¥›ÜâvÏzµÕ÷ÓK‚ΩñNr‹ìÃ„	´¨õÕqÆÎ»;≤KÖ`‹hÃç#ûo∆π-›.åo§‰ÍÁW*ô|+Ãmâ2â&∏»_c0Â´â0‹·“	ß÷E ÂUå+´˝q˙}ü’ÖÒÇK$∑ÎΩr≈∞B~ÁëÚó≤ÒÖ≈çQªıÉÖQõ#Q√Õ.RµkF%\˙Ω	]'Ü±l/‚s3&öˇ“T{œ9µç†∑ß‹⁄Œwi*Tp_ö˙†Ò·˚(./´‰‘ÛW{ojçÎÆ5»™r*NÃ£›∏ñ◊çYIÍußXÀ!y'Åç˚ç.÷¸ƒ˙‚’;9⁄=d˚õ/7üÔÓÔæ<f˜ŸŒ&|¬k*wèvèhêâï„JdõoBûâv=9∏°Ä¸K{fÛl@ﬂÖ{≥éå·ß8ìÉ˜Óp§‰É√{¡?üQBÈE-4˚Õz	⁄(≥7˛õYê\äfè/é~ÅozYé€‹úv$€Ä9Ã"i*‘H>eºˆ~1ü!t+Lt3 o(+Í;	:RÃ˛´7ìøõØ)Ã„§6CøÁkb:¬‰æJ¸≈ú„Ä”z'˙X‰ª˘ö:O3µ¯…çÈçõ©Ó&ù	\›^8F3?H€bÁˆƒ õæ·röﬁ”+à9õæ¡L Ø„øÓrg8rfÃõ’Ü¢vÄB—}ßáAd+=√§∑®y±ÜH∏AC5ˇÑ˘“í8U,5jËL95∞í:o8ˆÕf&x_üP£ΩÒ]±U•Ïe9.¬ÉYÔâ]Ó≠π)´Hx¥}a^¿P›†&3“_‘8v}Õ∑˘>€é–Ò˘»O·4p'O◊ıò6~àæ⁄oã≈·“≠uó≈ºyÏe{¢°ﬁÉ∆hˆÉ3≥‚¶|§‰µô."Ôá#Üâ¯PéÎÏ	‡ÿ≥Z…‚$ Ö=eºbÖ Ô Á8ˆ&Å€…˚∆∑Ω÷x6Û1¨FjÔ•¥"€Ò‰,L∆à‘Œº£â;˝ê#.◊±lö2\nê¢7¡∑15·ÿØ…/HÌqÙ3â11Ç’†9∑X|√8µ 1‡ á>T7Õ.fóy˙¢Tú¡˛8Ø≥goº:/£_6£”»52ÏØ8—\πÁ<èpÉ‰6è≈:ö≤;û¶q4çÇ3∑Àb¿∑K+¨K J+sI/a¢¡ç€î®÷)Ï(˜79Àâk1J‹Èúwb ÙûËTnÕq6®]=!SFÿú^+ªòÛ?ãú´Y$¶gë=?:ÓızÛﬁ@1ç∫è0VÂ7Œs!EaÇ¥‹<AItW‘“k˝vi≥›ÿﬂ&Á√iß{{Nm+j®q@@Ù#ÚaOO•3•”ÀÊÃ®$‚(à®û˛lL°E»'◊^~’~M2€"kùÅÙ	DˇÙ/
¸v&ã«¸oœáì÷LpOå=w}MÍº^õxÙÛH$7ÏﬂÊˆ€Mm'w{˜mûeYK…£ÔìÿΩ°73/¬ã2öô‹kÛ#ƒ§¶äÓ}ıH„Í}‡+w‡±-6¨êÛ+yBØOvÓï™âx Zõ∞¥∏<)jŸù VÔno˜TΩ#;⁄-≤‘ﬁç÷iñ=SR3	Æ(eÌ+MÛî[„3vU±C⁄bò ZsfÍπ6ò÷≈õÈ∞Î{î◊XÉ‰
}[!A˜°fit7Z%∑‚Ú
ÊV\—›ŸNsZX∂S◊%OW/∏˘0Æ(‘Ü±£Xw≤SuzX[˙C˜Púp+Âr%ÀΩ˚ó°.áà÷Àÿ¡œp—1Y dãÉ≤≤¿>*ù&ØDpN{∑†Ìµ:ûﬂƒ—d+ÌsÆ¡„∞$ zúŒR`Œ“4HIÏÊb∫à±Ü!åÅ≈FΩdÈÂd»/YDAù§0¨‡ãÏõâMü	åâe¿ÈBF*˘AF¶“Õc/yè‹DñƒQ⁄se>«∂Ê8πÑö¿T£øπôßúÜyåSÙ3Á	mÒÛBé˚∏ãzMÓùµjÊ>ìˇ◊ÿ≈Œ+≤ÑT~*‹¿=Ö÷‰Êox9O†e9∞“$˝`Ù¢ÅA£!√ó⁄‡@]U"¸óπ≤ƒ ~<–Ω˚æ–Bé˙í[d°´X·j<>kª˛ü&¡ÄÑ	ˇw5πºŸ÷tS™öUùäÑ'√Í,MöVU”*T/)˚∫L≠zˆÀj◊®4
é»Ôˇ®ElöôÆiﬁÉA…õ˚Cô´·Œ≈zN√ö‡Ÿ¥§Ÿ—nzÄ''I$7ïøhö#%ø3 —ø@äJ‰6:√÷]Êçnö<§-áÒ¥î-ŸÃ⁄˝NûKüZ'd7;A.û€ÕÍGsÅqUËjûM£a⁄cW‡Ã≤í¢	$pÔiuì’%ÂÎ8¡?1ŸÁÊIZpïé‚Y‰„• 2˛íR„~v(—≤ˆöH3¡‹5√˚ Oééö§kñ.≥Y ∆zæe¸ŸUe’f¸®†3jEU•(8xî}0Y≠û\È7e`'“ÿä˜d®ø_˜ﬂ‡YR_…›Ld>Œ∞∑:rπ´,Uë&Ù˝89•Ll¥ﬁW4†‹∏é?4€6æ®§k†1gÃ9⁄é˝†”$+ùcwMÒÕÈ"£ç!ﬂı8√™¶Èáäi"P”Í~˜ÕÔˇwÂÉ\Ùf·«W˙R)ç˛›ﬂSP√—Ò†Thæ*@NH˜lC+j.-ˇºî¡e&˙ç°Ö_®r˘ZL9Ω“”ÿËë
î#—Àz∑xæ˚Êﬂ˛˜x√AR*÷KBV˙Tz˛Ëó¡åºœøÛT…˘ã53É3ã∏Í0NÃΩéwò\/-˜õ-˚]Áüªö’$√E”4ÒuŸÅïC'y%(Tœ≤5Ãy3_ñ{Œp‰tû≈…y‡Ì«æ…™?[NÚmIlÄ}Å\ÔÁÁK3hÁJ±hª≠‘µ!iÈ∏|^˝‚âD≠î=óãÌxÈà≤Ò∞.;ÄU∏Ä˘∞Õ—ã•4uã˘©d†¡ÓãÙCRÇ‘ı›ÄŒÔ^∑IŒëm>µfß∂qfÿÔñyh¿Û`ÇÅü¡æáJ,π)Aπ∏Ç2LEC∞ãÿ»˜qäP‡uÌˆC ¥’F)”JÒãyˆµ“˚Gº«[®∆HÓ√§ÒòÒΩ*N„z√!—L	£ΩºÉÚÛ‡“vôE˝us¢“t>…Q™ø=ÂŒ≥At†‚™6WÆ,á¶RúôãR4Ã+?˜I∫}Ry}RM.©ëvSôf|›òU<O'^NA^s	≤|∏}5'ç’Á<∑üN5k¸&¯Sªwï4 ¬ë%Åú˝Tÿ!C sÿ§¨H≈ª-U˛µBÿèê‹§ÌxDæ7nI ““Z_Mnˇ†tSAÃnå·ÁFºˇ   ˇˇÏΩ{s«ï/¯ø?EV∞3ç∆ãOà  A
c>` îVAs…Bw°ªÃÓÆVU5@FÑ◊wÌ	œÏåØ«Î]ØÓÂÍÆ4£–ıÿæö–Ñª·˘*
}}Ñ=Á‰£2≥2´™ARè⁄—]ïïïœìÁ˘;Öè”≠œ‡NDÇÅó2˝ï‹V”YÃ˘Œg<Âﬁ‡ß≥M;h§®u!/oJ2ËØdπC+œÑ£)∑∏m«„…Xsen«ˆF5QsM"∂ròÅ‹ÛÉπáK©<ÄΩªI<F"î ≥]©8∂≥$:¨Ú.'3€’M‹V:Ï2ÈÆ6wIr)K¥æÌ;_ﬂ
è/]¨cw7‹ª}ñ€kkÉ0…ˆí(abòxó¯ZÜ˚Âhª÷_ÆrÉßUdb˝9ÑW±v<A7Ï◊Œ˜óM©2É„¬†ã~)Ë`
k–—êÔ, Y{«I úúhIeÏ)3π˚9yôßÛñ4oh=Ê~È‹˝i¨ªò√Cî¶jhtÓ√è~çn∞∑√>'1bßBA z‰˚‡ÊA4© ÙdÑµ¿›^`;ÆÀuf‹ø%¯&e≠p,œyY~>™ÛêüÑ4ﬂkÉ.Ä"5‘%+*âÇ’Õ˝bA”v{Q∫πãù¨äıﬂçCV[Ÿv¢I ΩÍs—aò«(´/≈•iˆ›c∫∫Êq{*#—#GË@UÔ;æµ€ÆW
{üç ◊¥R∑}v+N:ví§udØ7+Puj?Û#TÀpDZù:'&;ˆbÒ‘tg%»˙Yy—:+1´Eù≥R„GC·J∂”,oCUAèãjπÖll]»âbä√6œ#‚Ωàù4Ωﬁ.é]◊ë´⁄z‡hˇi˘Ì≥ãÛs€Í¬q≠∂Ü˙ÇàÃQ◊ÅwÆ‘Á DK êèùªydó˛Œ…Z∫ﬁ¶:·“ê<Ãπí◊L∆◊°Ì<∂]8o3◊∑Â!J®T∞©–∑åFq∆÷aÎç∫Ò(txT9˙ZÁ4<ìá<-¸näéÓjÊÀ¬Ë¨pOX:_éPˆÕb4˚1Á(ßN®ΩV™¯«VpôÃÖø§£aksÔò∞G•’êGÈ(ÜŸÃ\o˛ïYìÚµÒ$VuØ\◊r rxúﬂ(®¡ÍëmÊÜÈç(;∂KVXÇÎ±b%—í∏˜ÅÊœ_-pØçYv“ò´\–7”™8p9nêÿ´pÍSRZQ‰Æ9¶Sóg”\hKb"Ê`àÉËi“‡0–àáöÓŒ©n/ôàÚ´xko&ç›À≥™3•√iXÆ†yA^g√d6≈Q¯UÂ6+ÿ≤mM¶—∏üWÕhI›∑†ıﬂÌ£»ƒô/ç”Í…LãMS2^K/õÒí6‘€˛6r~ÎlÃV;)◊‚r}VÎ¢-≥ø:v´ÉeiRñ¯Æ S.Sÿrm+7›îqXê/º·Ÿ+ÌÏÖn´NÓÖGÖµØPm´®—–¢fÆÔÖ√qú…1ƒ ¸°W,É
¢>∫ÏkØÜÒ™
]»yj4_§s)ñ¡Y√„Zƒü¨âÅ¿jΩëëU‡G⁄Ùñ,‚éîﬂaeA≈KM√JΩ™qz }˝ÊŸ÷Õ≥î3˜UÕ!”+G›i¨˙Â À≠µˇ%å∂o=.)ﬁèJ√v_ÍÚ4|˜ä=ˆ`^9 TQ	Âﬂ‡>˜äÅuúÅuµd4wòtÓ>·}Ã)i¡Æ_)ìπ µm†ø)ÕÏ|:<dâ,ucw¿\È\é≈è¢<3Ω ∆«â$‹rŸ ûQΩªÕ’XÅ¸¨°H/@d¥4úg“l[ –Kπ`‡ò¸Sf˚ÛΩï'a´3N++Á⁄ÁœÒ≥ú/‡)◊H_ ﬂÈÃøÊâÚ‡≈T(Añı,’≈ m+“ëΩø.ΩÌÍ
6ëTäÑ)‘ºÿJ9©E°áä —ıä:_‘ä8q˜8H‹ÀÁH´±$îoî ’›°m[£S√ æ≤d8¢A	¿ lÃ¥ û¿PaÏµµ”÷˜FﬂΩyåÉÑ≠}ÄRk] ∫GABv¿ßÅbu9uR4IYY7:`˘¡?˝ Z¡*?˛è?gí„Y¡◊—ù“ù∞O,Pãc’k¡ò˚˝àEiAÄ„«Ï~|Äf…ß¬ÿÿ~RÅÙ≥ÎL)ü•Ï	}Y-ÔH˛D;		v¶9ˇ^òª˙hæ◊Bÿæ”ÛO–√«πÿé"89é⁄1b]=ÈgŸ8]ôü∆Q˚®di0∑;Òp>G›Øù‰ù8≈mÌ
Gù∏>ÿŸ⁄à·@F≈ES,åŸ”'Ú«pºéûæ<‚Xëh¢ÃÃ¯eB“†x>\øÚˆ⁄x<çû«ºÊ§Üe¥,˙´
ë&,˙cär8+¥Wg$À∆ŸÂçAlY-]#W_∆é¡ñ1*a	L,˜ÁŒ¯ùÿ5¢q¯®Ê≠üªF)z¨û¨«1:4SØáø6Œ8I–µzÅ÷Ò6ˇkÙ∑<wÆèÖWMËG∑p@
õ%·4«Ixà/n≠BçÒ’JîWIóo∞÷n∑'-˙óﬂ`ß@†&&$gyg©yº5G‘åﬂïs´™˛TÔ}ÆçÜﬁwCJ–PË}¡≥P¨ﬂf_Ñ¶K-H(Àq~ûÕÕÕ±7ﬂ^€^€aÎ;[7oo2†I|àÜpæK¯"Érﬂ:òå∏O·%¯õOpÚÿ¬Øb]—w\'-Òóß∫Xeµ®>@.°«ﬂ:]aZ-+¿†“:~]´nÖÒezG›◊e’4GÍΩ‡]{¯ËuÎ7å
æu ”2ÛÛÛ°\n·(Ø…_è81¶Ø	Ø5tÀH⁄`¿hë9•qΩi›‚@ØÑCÃ;Ñ,—π	Mº |≈Ÿ¢Rºkÿ•à´’ºK2ÜkåÕ?7nOF≤¸¨àﬁz]’îﬂì√ÌÆ∆®ÖZb@—Vªˇ-î∫ˇ’”¨/c‹*∑U˘1˜óÀ1˚JKÌ’§Àà	JÂzu°®bP!G9ñ
ÁVÿã.øB¸VTª€qÔ÷-<Ÿü{xu·∞ˇHÎOX≠ÜW_¥x#D_5ÑÆ`oÆU8å∞à æjÑHãp±^ºø‘n…5Fˆ
yàî˙s÷≥%‘r’»"‡µz–/ﬁÇNîtaıíÛö
ä/’C˛u˝∂·:ç©¬ù^ÿìËq:G◊%ó «4Êé ∞§ÈBS[Q¯v«‘YUÁª2(\∆∏ €§≥t»	¬ómı‰Ñë±tÖ=ú˘ˆ¡¡¬¬¡¡LãÕ|øt:Ùı¬B∏–]†Ø¢¿#7:LŒåcµ›	áZa1%‡8≤∂5:àFÑâx¿Ã‡ü≠—˝I6„Æ”mı!™'Ë¬√Ö«èØåü=Nz˚AsÈ‚≈÷Bã˛m_ú}T‘∏4ª÷ôºΩΩsˇÕµ;lcÛﬁﬁÊéC9´çmq©Ùó¶πµr⁄I√R·ùîj≈Iäoä•á|Ät{Ã”Tù«Lx¯(∆¡∑Ò)À.∏‚°
ÜqW˛åPæÀ•§G'…¸bHì'Ñ°Ø`›˜KV˜˛ßN´*≠íE)√ñÕ(ÀD∞œÓq5%é|≈9ëkıÃ„í˚õ{nΩ”C‘ÈÂ	W‹Û.q±(*&´¿=˘¶ŒA6√¡Ü•0O¡4‰YIﬂP˜IÎ5¡∏*‚À¨ÃÀXÿI7º!^yÕ‚S:fÅÌ—‹ßÆ∏R‹≥ ™yo5ÊƒZ–ﬁLS…˙c*πÂK+DZ–ò¢] %Äìá˜#∞3ÖX[4„πı•Kîs˙%J
gx„Wny(ÔóÎL>€“¸2g¡Y8Úv«PFa¯÷ßëÎØ»qqØ˚$cÕì\∂í‡¶.#™kπjMvëıX‰7õÑA)QW<|Aà“<∞êÏvé!ãRŸÅ
ıìëZ~ç;lÇ'Iù§ˆ3öò‚»kˇÚŸÎFäá˚îÜ	€È√’˙◊Û÷_($_∂ŒWy˝ä'RÿÃYÏÄ
Xvd)÷_†l‡≈}‰‡›Î	q°:LìÏˆ´-–U¶ù∂ßØòXZÉæ.§Ö.á≈ˆ•=)æÙùìú¥‘ˆó°˚óImø≈±}ú™˚Sû˙\ÿËé\~AyMÑïâ≠ƒÓEÇ>£ú≠îr—w®k-3Ï™‰‘˙r®wZJr˜9GI7	Âù÷7tIÊ ”ﬁßZÒŸªø`Õ5©í+áê(át∑Yyt∏ÄC†UÜ é–kùÕcå¥}'<å¬£ä6˘2Ïπ‹Èé_ı±ÀU9à
sÎ§à#'9∆UìcÙ>ƒú!âW⁄ò£TaüCYòÖ£Ô««h4bœN<Öùãcî®}LÓı©8VƒÎ÷ó÷ıW¢‡zÏ|Ò^<f ¬v£$§DπÇ;ñ:?'_Î«äîÔ4bíù	˙,a5c¡Ø√+¬h◊®5ƒó‰};fXE√ˆåoi8±îÀS/VPÍHê€· ë?ª61a…Ì•∂ﬂeXãñbÔ—√îm⁄ë®©$ÛëXò¯.œx˚ˆØüûîk‘x…∆æº~¸Éˆ›`3kòo¸Oz±°ãÍ‹:”CGä[•ûCÒ\≤Á≥«üÛx‰â∂∏$ì◊¶ióTùd¨ûj⁄∑4@∂π˙v®·Ø4?˚ÒØ^ù∆nPÜ∫·†Ún˜BÁnÂq∑h¥D¨Uêmû¬∏å™√√‹V]!Á°ß≠^*âˆsÍ± Ú5Xy	ä[˘X#óŒ4wÅJÚg9N.‚¢/˙Q˙|Ó]5byøH_#ƒ“5ËJVè»â≠∆®Œ(’—ˆ ï¶9∫ñfI'î≥r{~r«G†πr∑å≤>ê®Ñ¡Ô≈÷‚ï+Û«	ÚiTÌŸ◊mÑçe™ÿ¯Ω®$x‚≈∆˚≠(ÎG#∂xëÕ1êeÔF£I¶_›ë∆-ªk«¬+wú}e´!øgã±i\±÷ã¨µsÿ-[œÀ„≠gd„Öó3gWT
<zò<˝˚ÊloµÎwÎúSÄ[„_QJÆ“]°]ÇüúÎgˇØlÎÄ"Ø /¶„¡8ãØn±Ò §Ù%ÉA|‰]Øa’£Q √¶Ä_ò”9·6€ÇâƒG‚å‰ÜÛäÂÓí;n°7åπÙøÉ±è„$NﬁÙRô‚ ãÖKEéo:˜.Ÿùá'Q}Ä[«“≤~yì’{vØç˘Ç~ÊáX÷∑˚í#∫ö^Ô‹≤Vpáÿ\Ç3¥‡ü)ﬁß®%û"¨«†ÆÄñ2m∫Ñ˜ﬁã3 ‘Ñ©Ç|º3PW«i´:Ì©PΩ‘Ÿ–E´¢vÜXØì¢«’>+k[L™{^Œ¨à›rF$N`a6$Äö>2„ıÀõ	’îèÄ *ƒaz©}Y˚‚AN≥?˚/;’$¯Âò÷ªp∂àTW[£ÉXB
—˘]M*9tâÜÊâ	¯Ïeg¶’Úø,!õ…8Ü‘KÂ¶Ãî^më3,∆Vànûå&élrﬂE‘˙Ïòã:&–q§˙#´Áò’ `L£ÚƒC§2çydÙPñ¨ı7Ç£T¬H{2€É„£8Ó∂ÿ&˙ıBô®ì∂HZ√—A•üb{ë{ÍN:∞[ÿ˝ÉÉπ,CÅh @ÍﬂÃ¸lÉ†◊É·ŒD∏'Ó„¿aÚYÉIPS¥¥ŒÖ5Ã(∞”Å§Y1Ã'ÓX˝Ëøç|ëq®^Ò~∞¬W+ÄìísáòD…–„ÑKÙ.ú„•i&+µ€nsl∏Œ\øãAõåqÄŸ'é√¨AâüŒ.o%•“¬ÍZ,Í>+…•ïg—¬“"ç<rÍ8dºjò3KO’ßn»	ﬂj™Y°’†rEÒ˛„¶‚©°f¬åÿBO•'¸ıY:πc‹oª˜˚K®uÈ9ÄÚ6©Ø·˘!B˛^Á]'∏v
"‹ã‡À6'9¥90%Rˇbi{ ,ä∆nîØ”≥¯–—ep7EHH)´Û0’IdWs·p&%Íı≥2L˘·=–ƒæÚºd”ò[5ºYãô+c≠pçπrPsÊh/IâVÓÖ.õyü_„2>”	Æ±ZÛÏ?ú F´v
ÛSïkm Yê2É>ö†SG‹òbVj8Ñúuv¸n˘≠)^¯›_º¿‘º@nlGeEÖ¥Ü∫£‡nU¯aEHÂ!Oì¨øBÛÑ≈#7M·J‚«
∑#Á—b_ƒÃ"'á®u-=é/òAF)Ω(º®4GˇP≥M_o™"≥y‘œ√(•∆PÂ[¸ª^oXªP/üˆ„£[q“ã3â…€U∏l‘rR^¸~ûmƒ√!å<1$Œ)LÛ7»¿ÒñÌ√Fm£cΩŒ∑õÂMÜ¸û|≈F˛ªÏ-dÃ_ÅﬂJJRÑ:ï‹ƒo%%Ur2*}[˛*k;ÕÊÜ8¸∂F„I∆˚Pº^Rã\U¢|D@~˘⁄ /+,•†…áèÆ7Æ›πÛxcmoÛˆ˝ù∑ﬂﬂﬁ€∫oSÏ·aº>âíÁÒFt8.Ú◊:ª7?}ˇ7üæˇÔüæˇÒß¸›ßÔø˜È˚øo±Oﬂˇø?˝‡'üæˇK˙˜ü>}ˇOpÆ~¬⁄˚?˛Ù˝?PÈÁÙÔÔ© |˘∑Oﬂˇp∂ÒH_Ub≠≥›qÿA≠´Hÿù‰N¡˙Bì[cÔxj£»/ò√«ÉêÍéI	ìùùIîÑ Q´Oø·öﬁ˙;qGo'kﬁF›ÄŸ].ÍΩôÕﬂtª òÒWÆÒÔeKà‚V∞u•lë‡5µIvÂØ≤Â<N7bÿ{º%∑Â/cù∞–åh°øŒ£û¸¡NÅ\at„ı<"U—®õa∆SrÀAÙ™p›Cu4b«ÀÌè:aWQ=˝byQv3IbæoÔËW<”+IÉz»[XΩÜT	‚Ù›Ÿ.ıDp¥a”Û›Â]U{(£§=íl@˘fgáÔtÕ1=,äD£Ú¿`“S|jvV9qxJ—˜:[ú’¸=út«ı∏àAÌ`´:‰©OoïŒß,Ñ—*ÊX94‚Õ2‘—†ûa2)B‰0¸®∑jr7aª›vëQ®Ùë®k;’ªKkC†‘N_eMkîœÂ»AΩ0ñã-0£W∑ÛËŸÖ‡»¬Rƒ›®(ª˝~°˘-Ô&è◊ïç¸ñË§c3Âáæ`‡ı[]h8oàX¶EÙwLU¿ΩnoÔ*¢√%¢õup$≠ãËeí çôëX$;éöààÉ·*ƒõÙö#ã¥;Ds⁄p5 `mænóÜ∆9J«£ûU\ß`M¢Z-z¯t÷(#ËmÛ	u7œk'P∂ù≈∑0πyaˆ¥≈Ó ïÉÎ£û~˝âYìMÜÙ¡/ô¢ú@ÈDáà˙ª|6‘jIÈÜçı\£ºi‘]QìúwıT∫F7aÂ9fò—6›#sIB”‹Ω5„sˆ\àTwhó.µ/\∏z’WÜ¶Ì B{yyÒjŸ$≠hµ∂¯Ò¢U·ôº∆w‡òÄ0?»0M¯6f˘H˚≥0ó≤§uKéÕFYØrÜ≠âÕbïH§?ŸØ5µ',ãÜa<Å!qq¶lÑ«…QØø÷ÈLÄÉ;^AEo(»$’†”7E±;ŸF8°6Ã
∫t≤6Ú˙õá∞Ωµı*\ª…+}ı‰)E˘
JÑ¢¿%9B~m√Å5lbBÛ;ÒëLh^xPA'≠*`'Ò† L¿Ñ	î%≈e6„†â“è•9D-õg/.,£ñ<†≤ù$Ïb)ò¨YÌ≈¿ ¬ç›ng)˜«`ÆÉhàTodÚfÉ€∏Y‡1U˘xçî¨ΩÏ	aIxÃô–«yï<~ÛGT’‚“ÚÖø˙6f|›≈‚q#§?ät≥õ©´¨«qìjnXÁæ5–X«)Ø√ºß∑Œ]ƒ¿Ÿ˝Á=V(70¬∫3).z˛ñ«‘ô«ã=ÃC.†≥Éz~ª· 3jJW^ä~C≤pskèÌ∆™'·¨<ÒÖï ÿ%√ﬂ )‹—g•‚1j|£∫‹ãÜÔF˝ût°&Gﬁ‚Ì^ÇŸ»sS>Kﬁp¨q…‡ÿxÛ~∆Alóº3ÁŸÓ1\Ú‚“JlˆÄ$i®ÈÍï+W.\∏|Ÿ∏M‚3éd⁄è“˛”…0H~˛Uo"ˆóÒàÄ‡°; £≠cj¨ÄqJÕ≠|o…˜#¶v/Ë¡øK@‚Ã◊vÌ_“w˝	BpÀ$Ì∆˚∏µ¬÷w÷Ó›||Á˛Ì˚èww6TÅSçƒ·np»°z¨ïÎ%ÒO>˛Ûü≥∑¬Ù€}£ßœÈ¨Ñ–.ï‘ÆÛ∆9'æ[£Nú†3UÑw 	^ªQhØ‡J?˚/Àj?iµEÁIÅﬂ$W.>"ò °bÉÉ®Àâ1¡áFCtB√±aÿEéÉ5≈πí≤4†ë.:HêpëÒeõú·66æá—˛NçèÚ«‡;«Ÿe"=W®>Öç≥ë˜/ ≥÷‡‡’ÛVKBYﬁjENÎ6≤Í_õ¥√D◊[Z12ÊyqNW¬Ã˙ƒ∑mÓh«keÚí≥x¨Õ©p≠>´]∫ÓFüïÕ$ÌìøPÜ"Q¢UTﬁË©/Ÿ@•ìrÆlRl=	ÒÁêDä! \*AvıKJ‰§"øä≤ÎPÈ∫êN$ö¢Î£H "Ç≠…üÂ±m˜`NÒÜ∂ˆÜÅY92“à¸Is°KPuâÿsÄ∑ïFÿ¯!Gò ks≈ (∂C ACÚàm™ßUC©-º4:„biﬂ,=9b^;ÂÈ≤-≤Ú°~r+x"#º5¢pè‹ï≤gK,◊wIÒH„¶•D	B‚ï ≈ÜKOHKÌãWó/—ÔÚïˆ’KKWÂ	,*âF¡ •9®¬Z“"≠O°4	xlï)ù®˛ÃÌ…˜XH≈ßÑxâ≤Paß4ˆêèÄ!ÎNP€lÏuÙ‚∏7Ô„ÙA2@@[âÉ:ÑKm~ó`Poº≥˙⁄â64®¸8mYóFΩ”'πò≥:Ù/ ∏ë≤1¥˝q)√•‚Y©¯ îcñÎ	πñÈ“]∏àÌOŸ›0ÈÄ(B◊ñv›˙â@CÉF›âÆ›•™öPäfÉ
	2–©ß{§o	áMwü„≤É˛Òíó•4ù´%OÊ;ÄˆbﬁRMïöWeºài˝jOF¿dFa¡—:œÏ÷*R:YtF“Æ?≤—b2ã˚;ƒ7Ä0é%≠ñÅRÉjkö\åxN)≤{j“JjO&iÚ¯µìõ¶ãèö≥ßVXøùî<â¯ºs˘“,p»˚\W›\j±ÀàÌ+*´êÎ$S∫b
úÚ∂x2∑jΩu÷«Ö?√X+ó§í˛åYP∑\∆J˜Ñæ"Æáåâÿ·ﬁ˚Ó$Œ¬îfEIhC®z©à™60{~û–´≥j,π8ßºJ4í˝1Ô(ÅMßìjLHSTZ^bXNèU?‰1∞¢üÍÆNEÂE]à&ıöºaI–∆=dPπ–æ™˙·¸TGÄ¢√†Æ°Ω+<¬<¶!-‡≠›˚bs1‰4ßÀ®˝K∏‡Ú EÈÂwÎ&ÃÍNà)0—“oëT∏?·ÊM¶o≥∂ˆ4)Ó{av?Ÿ†¶i¡MÆ‘å∫-Ô>b¬ŒÁVjıß—∆ç∏ã'ßÒ∏KOÁzñcæÔøÉNª8M;Í%¯t¡_◊Nx$›ÕA‘ãˆqëÛπ}Ω»•ÂDÊcÎﬁÓﬁ⁄Ω=∂≥y{kwoghÏ÷ù˚o≠0„ë=$Â©©w˛<B∞Éúö•Éc÷\¶Ï¡p(=Èïb(¥ˆJ~«°¯ﬂ˛Üiy^’=í[∞/tñË:é√ íXÖ r¿πˆ]Ú.Ç◊¬.ÔÇL›ÈÛû…™ÚÚí7”Ïèb®ˆí®◊CFπ8GÄ¡Õ3‚¡"B©≥®.;∞óÔÖG82r~çBﬂøNø	ˇI÷@√°6áŒ‚´∆åÄ¢=Ç?=kÙ`EÖ~è‚IJ®¥=rπ‚å«- ∂§éÑYﬁ|6&ﬁn˝°÷≈£9Sπ¿Ëπî=R=ÈÍHìZRfTYœ€í∑ÅÜìö&˚Dı(¶:ÔÆµ[!æ™Å˙Û¡$Îœ'b)°i@Ωvf˝5¶€˜w˜4Wü∞dSt^jÄ©9dœ®ß£rÜFy˛˚i<j‰&∆ˆ„.–ÚøﬁΩØÕj»◊«@µV≠ımÃ’-¥‚Ú≠7á»◊Ã´=(»àı€!|πÊ5vq(4Û∏Lñ±@)¬∆NÅ2qpk‹Iıˆòó~å›HÀÙ¢8úIº,∞a»cÊõúe~öE	uŸ¥49À5ÿ « „—_Ω®≈RJzÜêJÁ%Ò‹Ë6õì‹=M–ŒG“ú‹03â([Éã÷[uêCï®Dc#fL≥ˆπVâg4£Œ[%\µh˚™u8aE≤IŒ{‚’ˆ=„-ß∆/ú1»≥÷0“…#Ó©‹¯ö¬5ı¬¢÷O~,Ì2·ÎV!Î\ëje§w-êŸÂ{ewç>ûöf˛…ıÕÓ˜9≥Ä©„˜-◊wS∞9eD2ÄX(™ ÿ?üŸÅ¸Slß I~v
4úœiA¿œÁî’C#0É-
OGAî°{˚0JÅª¿¥&sùàã“2»¨ü–æ ©ı€ìŒ#9ƒX–˘,ÃÊ/EæVå≈5†◊õÕ«x∂bxÉƒ¬‹„VeAŸ˘Ω&>'u¬Í‹òùm±Âã q˜ëZ)Ω§Y Èˇ∂M˝ï±˙Ò~~ÜTÆz™Æ∆íóã]T_cç;U]bÂ¢7Ö†Øœyq[2‡C&Ωæ…vXñË<f≠`1)Fd]„ÔYÓ∏tw¬TJÈ•À>»ﬂA£ø5 kÕY+M_cØnY]X∞ñï∂†D?qMâØrïËóx
œZ3
’_s˙c”¨=ÎubaŸV<>ã∞¿Ó¶Ë:#∫¡ï±tX¢ùNbÏçÇ~ƒÜ— P¢ƒ8Ï√∂üŸçz#ˆ`L‡ú~Œ∞ƒ4A~?0”îƒ€F¡1
cc˘‡Òò≠õ≈Mb´º•úœ˚fÙÑ{ú˝.É˘o≥54¯¡òaÎ(!ºª?Eˇ‰¡°a√ô÷’	Ω≈˚ß\è1»wùáÑ‰NÑ•Y6éT∫@â	v s £∆GÀÅÄÎ®o”≥˘¿c/ÄX¯JPbÂ.å(7t¯¢'Êo∏¸„˛Á⁄á˛o|{qq·ÍÂçñL–¯ˆ¡¡úíÃ¶›ì`≠	fÂä«såÇ∏ÊÍä
§æƒ©Õ¯ÃUB°Óv˛&;4Ãôob∏?∑$¡Ωût–.8Ç‚;G˜JA≤¿·0√°)Ó–‡ò(—‘Cùö%(*—Ù Ç[ò(ŒÄEÇ?[§)Ô„_g c!·FuiïT‹Ê_EN∫ ù@ë∑€YêÄ8≈ÇîΩ±w˜ŒÊÄîù≥m^D¸¥˘I§Íº¿¨®´Mk¶›ç“1bÆ ≈ q=¥œhpZl•=ø˝E}¿\xltŸƒ6pe≈HT>í¥è£dü¨ãŸ≠Áèv1J¡	¥÷©ΩÇÕ∏ Åq¶±£pD	p4"®Ëøå:® ŸÌ ˝œx4'&—¿Gﬂ
q[¨0§$⁄8]72N\õÔ/j„‰çíó√c&èXíÄBAgE“ãl:ƒô√∑†’!ÅÉëKíÙj„C)ñÓÖ0#O…,|3Í·4Q|<≤Ê˝{77fµ≈06∫X≤\ÏŒup°Ω	l	Ω·eÕ	º^0k∆å=1.(8EÚ—Ög11,_aT7—±›Ãµt∆E¥ç~€Ì0NzQ†÷ë±l¥ ?{˜CˆÊ˝çµ;Ï÷˝êﬂ\Û∏E[aƒñò@”Ù¬Hh1îv˛ïπ„™'¯Fƒ@)Dz™TFJÊ|‚r‘Õ|‘â¥º∞º`J)˛ÛÁ?˘-¸˜ØÏÊ÷Ì≠=ä≠{7∑÷ÿΩÕΩ∑ÓÔ|«éüt≈#™õx†/≥ªk Ô‹ø≥…ˆ÷÷wŸ⁄€ªøÕö“Fó∂ÿM
§h-aÚô≠Äç◊Ç˘ù˘@¶ÀbkÉ`?ú≠≈	”‡x†„◊è %¢E‰AÚïdçûgv∆£–0VÌˇ˘ÙÉ¡•_˙¡ˇÚÈ˚“•ØË˝ôßï•∂r¬[—Osg„çµ{{ª8ôpåóëkSè.’¬EßM^[m∑›bb∆ÿEædn>—ï¯TnZÂ¥çøhÍî›,-Kea¡Èh@≠®xA^¸£®»≈b>~jfºpAÒ‘»˘â¥∂.ª∞˚çƒÈÍ·Kkó/ 'ìj‰fÏ;µ¶›¡·û®˚´∏à‚qÄ¶bË(_O#ÑKÜ¸”˜?°-˙;
$˝àáì¬F-O∞Qÿm77◊ÓlÓÏa‹€Yªâﬂæò]'b∑ˇÃ7ùË•wœy@Æ-\ˇŒ”0€æõOChò:ÈÒ^¡ﬁ+¨óπﬂÉáaﬁ*í˚ä˚˛•vzæ[s MπÒ`wÔ>–å/h/ÊﬁjﬁªQı”ªπaÅñYa¸{Q!≤}%vbûπb }»ç∞Ø` E˝2∑ﬂØ$V~ÑmW7ªî;π!U»-¬h˝dM5íÕ¬f∏ƒ∆¬‹óqﬂUyfÍ»{Àƒú"˛õôü‘!æâÂem!?i£kÏcû:X`˜ªqf5H⁄K¥D›GfœµÚJ©„≠±°e≥Ú/∆.—ñgâ2ZVï(JÏn˜µê«ıjb√^ÚÅ$˘R`È@v¶•ìíYº·Ây^≥O)´x∂•äqvëª
◊Ònî±»“5ç(ÔM#œ≥ªk˜‹Z€ÿ{∞ÉGˇˆ˝T34}<Ûl£∫óÆµY6úÀÛ˘ù◊m#™µQd∞Û'jr≥ˆ¡Ï ¯XI–∏À‹a –4S,¶pÉ´C”Ü6¸§V–Ø3¡¸◊WH[~& ƒÀ¿˛ó¡~Å/êº“õ™2GK” KìóGFë´ëA6SâÒ9√b6 ó>èwA•˜µ8í%;•ézkﬂ∏†+ºß‰E†ßlkTyòø‹•¿Õí_ãµpÓ?“b(ö∞_óG–lËÄ ∑eQA2Oj’E›’t0ò#Wß9º≠˜aø)"”‹Ê-©)¸»¸ê˙ª‚Gò}àÚ£ÉT4-ü=∑Ö‚Dﬂ≥‘8áç»ç¬:*‘@µ††+CVIÔ|3â«û|GTã±L°n2√•r÷pø)“lÎ_∏R‘Ñk7˘∞y™?`á u—¬¬|@ë@º˙h¸Rã√uSÂ6UÍútzV∏ÒãØ,ÿ¶£Ú≥Z'qRRYb99ÑnÆƒìåd¥RãK∂®=]&ØkÒòºø¯PŒàæôÎ‚Àµy~øÊ„kIÈe'õπÆæNYÖçß7s›æR^!y¥d¶JÈSµ’n·DìSWrõë9ÍVî§o‰ºﬁ‡3l:Sºãsÿ8_éIèÓÉ‚%\¯>é$´3õtdS5m&ÙmÛ’˚u›z9ù √´…T(âT˛P=ÂˇˆÉVS‚Úi?œ∏ˇ∫âóX'óJ‰ñ°é!;Ñâ>ŒKl˜∂®ÿ[#ﬂ˛’ä›·‹<ÙÅÉa˙k˛˙ÓµC®£æΩ·⁄4´uœn,~ÜÙóøn˘û‹∫˘
◊+E…¯Á∆± y\çà’˝≥^ë‘”iV$Õ◊´Zë~2˛Eq Ñé—ºOX0ò}ï|ÑèQ@ª∆ü/è ùõÇ9@‰…Ê
ä7<|ÇÇˆ0æí,±ß©Eõôf3Se¬∏ˆ⁄-FDZFë[≤>~ÉÔd«≥•i3KwæÍ	^+MÕΩÜ]F◊w2ve"ØfFâP–uâmæµ¡”PèY?û§aªÌMˇ’ﬂPòUsÆ?˜
M[=MÅæ(Œ¢1–üØ∑ˇÆ_õós=U*N˚ö;â_Yƒ•‡{1C«√Ø∞[a´∫≈ø≥y’+ﬁ2©ÓÕKø’~4ñ|YQø2pEØ˘¡ÁÓ;ıú˜ﬂ”˚Ø÷ñÆì_[qZ f	Øc=Ò.% ûqRSÿ.KfGÂ_‚ˆ¨ŒùÊœöF«†ÍÎyÅ˚$˙<œú∂dó„Ù_î'™ìÃùV“¥¶\Ó‹±PPK¶≥üÁu‘’E–1ë ≈ì;•ˆeMÂÅ—è”a»ÃÖoGIÂÇ°!]‚¸«[˜∂Ï5ä ˙g~û¬t«4∏¥ª°Ω‘JA_	‘V`Peâª\0 ˙«/ûÜBiz
Í›ly_<y¯≥-Êƒës%•‡ÔzTÄ9®Ó…ÈWãÜWSn6≠&ÒñÒvz€Üyém…’ôœüˇ_ÑM˘ù âzAÇπPIgñ d®Q'
Fîi4 [|qÄ"Ù+˘•ÚlAØÂ]Ú[Ú.·YÜﬁódÍG≥eâM{ÜlÇñÑê›ä2 Ö±˘l&Â>˙àÍ˛òr˝&˝ß◊?ß·ŒØ ZÙEΩ© †SkÏﬂä´I?°¨O?ë^<œ’ª(ï”ø”ÅÒaÓÓÛ'∫{’TËªıä7P™y¡˝ë^Ù70 û∑N=(J∂ÿ› Aò±ÛÏvÇ≥DHÈ@û±yœÈ-?ë9∞˛êØAæ4ˇéfÏ„≤E0ı;ZÓ‡{•À «ûøƒÖ±$c‚0pŒÓ∆›… Hÿ[q‹’ÁÙﬂ>}ˇˇ˚Ù˝üäf}Lõı=ºˆ¡èXqÁ¬(LYqã◊ÚÔØ•ÊˇøÀ˘êj˛5ﬂ*ÖóM›iJ”Ã[ˆ∫ØlO2Ã2m¶B˚àGå—t…˙≈í=ó+◊”ıÈ´oπÎØÑö¡øLﬂ’µçª≈„…œ#x¿ ¢†‹Ω∞”âΩ⁄\€P„-\aﬁ•Eˆ¡OeÊ∑πètØ^ï-G}ü∞ù˚ûjßÓÿ[°Ld∑ï`Z6ƒ»∫Ï'às"Ü¯zCûÃ.ÔÂOqÈÂm„MyŒgÔ∑¯N[≥Ú”o“çΩ7[*˙<rÛìµ¿ª¿ñçYÔãˇAs≈¸›ß¸Læ˛9ßMº¶ç q°"Y•1w¢∂_R~À]CEÌ N|"wÊ/Îc∫OÃ¬‹ƒﬂˇ
π	ô∂∞Â»Zx1°ºûıπÇ/6¢rÁ¯Çﬁ7˝£6mçíÄÊµ¨;q–%nF\
@√ìß)Z!Tyg1Ÿ;<˛õ‘“w°Å9°˚X-XG•wtˇ„hà‚-5“)œÉµ∏è±7éBxnQ©&ë,`C>∆Êˇ5üì}U,∫Ús…¬˝a˙VÓÑi$RMíL$™|ò‰ õ≤=à3h®ª‹õíÍ~L€˜yŒa|"÷ó⁄Ãí≈ûâr”∑{O∫¡†aΩÌQç÷ô¬ôÎS¨‚è9ÂíTÏw˘YÈb†=º%>ôÛñØàN}¿n∆¥ó[ò∞ à)|y#N«(A¸p≤~'H¬˙$ ÆëÿjY%wƒˇõº≥|h~)gıGÍp£Ûü‰f˚à˚ÁC) KØ˛”≥g˝ ù„¢A<§ç:Iz"änæ3â∆∏Í±uˇƒÂ{[Êá!?•ﬁß"ı∏º˙€¿¢¶g™ö_˝ì‰Âœ@ÉoFAo∫Ùù`üv}êı„A‹ˆQ0”úuÑ≠˝ùÓ|˚æõÛãÔI1ÈWís˛YNd%Wˆ¢≤p¢ÚÒ™Á¥◊D›úîÁ,Ì+⁄f¬ÍÃ¬¨W†ÑqÇ$Úˆ>Hﬁƒû‹Ç	¨ø≈¨⁄P^”´k¢ä√\Pˇ_Y}6ET&…Õh‘¯
y˛ÖºÊ,áN¿iM'ÕFp@„∑A9#l(L£o›Ôıˆ∂RN∂‚H¯Åcj _QQsKUg⁄OÔ˘˝Yè≠ı`ÙŒ$ƒ‹cú i=âû¯Np4í'˛OuŸÖÔπ˝Cw,I·'ä˘ˇ#gêﬂ{’Øx%Ïˇô›)y§qh¯ô∞Ü∏Nƒ˙qÜ©∂¸	œπøü≥ﬁç ëM£˝TÆÄw[nY—¶¿ú±˘CÅ Å§˙ ^˛K≈å€Õ8ì
ÜΩ§}Ñ˚…ÇhÄ„<{´bŒ¡IÚ∞À_˙	-ÅÀ›è•nËCjµÆÜyUïOØ|·‡)…käŸæ5aãÏÑcƒ™íÀãÎ»§@†à◊ò
@fJ¢ˇF-ˇupg}ïò‹ﬂ Zﬂ¯±Á]”kdp'ÌéπÎ ﬁqBÒŒÑ#dÒ+
`ìŒi%”¢Aø+OàÁJ_˙j(≈˛Ÿ÷^ãå·ìåXyÓ◊K‹îH§YüNh’‹	∆–T¿Ïar».Ø…Yb-M√·˛‡òmo§bˇXäø˚ÙMΩ∆Yóèhîp‚òÆb˛Ωî∫?Qkl˙ânÕ‰ç\#dYûÎ˝ºXw3◊kG√œH¥äb¶úPî™•h2Ω@˚oÔÓ±uê")≥˝ˆ}å˝›‹Ÿ÷Ê≤¢ ∂˚]í	˛û»¢PbJΩÜæg·?òåˇïZ}6ΩÊ[·~e°Zu<;ÎyûØ”ö†"Ø¢HÆ ˚çd›5ﬁ?EÚ¯Ñz—ã—?‘SM0ñÖ∫±<Z•
ïÙE¡˙µ¸G∏h∞˘◊¢æ’oo˘u§ùïáípåw1ãI∆ÿ±¶
	eçb1R1ípIMïv/aV˘SNfÖ∫—\:†˛ÛÛ±x5TÓ◊øFäQ:∂ùk)0‹%ßT1»ı©?ñjTX≥†q|˝I®qG˝Lù	πnÍc&U*Ô…CÌOL?˛^—˛äÂ|∫q
7)RZÖ˝®3òfµù∆H®Vè4√∆…´tv®´2”ù˛”∞æw6%dÄÁ÷ÓÉ7I÷N¬¯ÌàvHw1‚÷™ãY‹ö‚{)I”{\H¯©˙ëó˛7π4‡Œoœ 6EOi
;q,÷‰ÊõJmßΩ≥\>ÒMÌh#ï‰vˇ±f˚⁄|ÛU,»œ~˝¢EAÚ¿a≈±êœ:}å¶>û¬± ≥ò
Z™F§Çy‚H≠÷iJs-—'|‚û”ÿå“ˇ&upg≥˛æìπÏsæM⁄iæÃ§]Bﬁ)1Âk˙∞˜Ìe™‰§_üA-¯Ê∆¸¸√∂£1◊Ùpœ
h•˜ñ–fâ#Çäk˛IŒ⁄Æg=˜ÓÓ±›Ñ+tWO¢c4≤mêì2[∞•∏©$◊vˇ…8Ú¶`>ŒD™ˇ˘#∂=ËàÜàP<8m™=M€∞∫onoõ~˛êˇ√D,/ zæèô`Œjï3‹e˛di2ô4°kƒYlîéÓ∆<R·ºÏÆ@fãbπ¸~U˘a˚·ŸÒ¡O^Õ‘˝¸ø≤;aêıy∂ ªGa`#Áñ≈-}$w˚:<Oõ}!ÓA˘}Çè•ïw˚ªD≠ﬁœïvøñcÙ—ô,≤ktÄáÑ†_}°Msû≠áù}Â∞Ñÿ]v;ïÇGrJ\ÔˆäÃŸˇ¸?d4ÀFòCŒ›ÎÅ-ıßÏMXB5≤ÊÌ7˜Ê∑·üŸôÎ˛{”s.ºù“óÖÍF≈quÍ™ı~#ã÷‘Ï∏xÌ.è¬}∫≠ÓÎ” ‹£KÛÒ⁄Ö	Ü˙=7^ÕÜˇ€üaLó°[É˙ãÁn8j§Ï-†d˚äp fÆªÆNœSƒC™f3Có§FA⁄'œﬂù©_¡›q`Ω$‰lx3EC†RŒÎØd¯ˇˆOp`≈`’ZÏ÷›ç€8	P§˛¿ZâFhBÂ3ú;ìÅ0ÒÌ„y"öúDs¬tÂßﬂãcí'a»–e5Åπ&
°A≤9/9Tö@ì¶fzø’.%ÑΩ¯t¶ª›IsÛ>w¬Ç¸‹∑©~ŸW!Vº˚°¿*aÛÏ>ByQAáT‰∆º¨ép®·MR…»5ú‹ˆ3Óò˘/Bp*∆w¿‡¯j?Su/:~9@åÛvé˚¬v«a≤Nﬁû˛∆+x"wä±;9Œß E†Éy^@|ø%-˝D·œ5>ôÚá’ù)u∂Æ>≥$ÛEπ‡UÀV€^–Û YöÒ:ƒ\≠ä ·≥rÃAo6üJ>w ◊ÛºΩX?‚:SZa°lq"qEÒˇŒ%ùŸïä(§ó‚è!¥‚{1π‡º˝}NÃåØ’`•ôpÇ;∑)U◊vÄµpœDÇãè—ANYnï¨D@‡1;rTi‘¡C∞Éfç
Í‚#x\<Ä–ém„∆ı∑, ≈(”πÉZ¥IY—p˛xdô'∞Q`^k?d å¯?ﬁù‡L†d≈æ].nﬁÂ®˛˘¸˘~èΩˆÛ‡¨ ?çÿòßcfÏ∂qå˛Jò%¨ı˙Ã¸ƒ˙q/bÕø¢4\KØ%€˝#Q[bùΩg·›h∂Ì›]^˙ÌãΩ,“ﬁ4(	∆
sFıÁñ.‰…ËéyÓ®¥ìƒòê/ôÀ˙—àÄWÀ—Y/-ú	ô’Œn£NÇ√ † Kã&„&LÓ®bÙ∑ÍΩ“Sˇ<èaC%∏TˇXp†Y‹Î©&cfÈ¨dWWÇÉÍ#EXû≤…ÒcÔÇÃ/VvÿY'TˇîB?KÆõ*ÊíëÂ,ÈØ®‹ãê≈@»G·3Å‰_ŒAÚÛ¿¬≤FïÃ∫ü¯89‰J˘…–ä.?´ôWk∑ß·g¿‚AÕ’Û9Àªˆÿ=Ú5ˆE|ﬂN≥-/√ é‚^öÒJ‹MÕ_8uoóóí6S¥k€ºuèÌœÿ÷M„«=€t˝y◊CÛﬂ –}@˜Uî¯Œølø¡ü˚2‰◊~éíÆ›ªπ∂wÁmJ÷âËlwsÉ˛æµµ˜ª≥ıÊ&ªΩΩÀ÷ÏÌ¡≈zdæl∆xrÑeóÚ&√k‘¥(Ø∂¬)Aú•∞?ßŸôãg’¥‹∆€—»\˙îåàø?-ºj=Àùÿ*T©úßI[„õç˝kﬁF]G->´¶äK© `àπ(XY[µAı[	ìè0Óº≥ª«£TV¬röIË¨¨5W‹)j<˘iLä£e¶s&êŒÛ„L™◊„èÀ⁄´Ò∑˘Zº‚Hm%?v˝sRüÏ⁄ık˝∞ÛtÉ≤ñ€…pêu7«EËˆò®‡≥wqçí‹4îZó‡Å˛ìÙ¸Dsƒ˚ù¡™ßßDM‡Õ@]ï8÷ªÛ‘nI°É∞†õ≈“òÌOé—Pç⁄∏Æp£Í¿“É4≥nîÚtÈÑnôƒA§}*<
£ÊÎBMù f± Àx`1Ês»_Ú€qB8ê∫ı*§UÒÍΩqüﬂ¥MpÿëuíôÿQîıŸÌ»€ô„‚’ªVão_;àΩñ ìÍ…&z GÌ¿tƒï‘[¥KËaÂô@¢G)].÷r4w∂…ïB⁄iO~À ƒÔi?âFOÁ¥T{•ÕÅ—6õÑJ˘ã,Õí¯i8˜p˘Qï¸Ìg]ÛNW¥¬œ!Y†Ø∆’ªD≈ N;±fœSX9nƒù0Ëñ"ÇiUïêD”ﬁ°ØŸÉh00Íüqıj≈âM/ØöœXÎ™c=˜Zqîx⁄0ÏFì≤√?5í§Gx‚ßÉÛCB!Â‘Ò‹ãuÆ¢@’ÌJÕÈ‘Z—.——;–Iπ¥ ‘°p†∆∑ª
‘ìS‡h‘´Û†ÁÛÏ˜º.+R¢eßûDãı)PhŒì2é
 ‰fw|â˙.ó…Gek¡5Ü•â[.µ€ÌÁ<ÊËåÉSœÀaTÎKVñ´U<V±‚Í≠∑3≠∂3Æ5ß0›KÇn‘v.ãÁÄ+I‚aÆÕ>åÇπh‘çz1?À‚‹2≈W[^<ø•ƒ3óÕØÊπ@ó∆«|ç¢¯≠¸ï'%ù÷∂• OÒe≠^9\+2•*p&Sdr«O	·°qØô√Y{åN£œüˇ‚Ô8õv˜òY‚ö<Ω@\£%¬ﬁì∞R^+[Í≥ßılnSÈe´8Ñ⁄æi8å,ë⁄cÛ–pÏˇ¢BB≠‘_’3„◊–π:µ\e@˜¯9ªm|*›ñ<4Û¯ãÎ∑jﬁ„«Rqï·t2$æp?j= ìÍbOxYVï•≥Ãñ_∆ò|I{c7CíÙﬂ)6Úœ~wP/ÀÆÒS‘Ô «Í;⁄úeÖVπbº∞G⁄Ù+7¡8{©´úgwÇQók+^Ω∑÷Yk)op†<û“®Ò5Y◊bUãÓ÷∂kTÄ3ãÈûÜÍø$öÔ•¯g¥¨/€◊
Y≠ı&ãÜ=L3é9ıd)Mè`¢,≈]qüæR√¢j˛¬.˝"¨é9∂´sì˙∑¶gC…d◊LÏ»â÷@ﬂ"Ïﬁ®wﬂË«q™B3˛ú«_ã£ÿë≤CväGãú¿Úì≈Xñ≈c‚^t˙,Á€Ä&t®Øv…ﬁ]”-¬±®ËqÊ≥˝7ÁˇÌ∫æÆ+LéMı
ì”ÒB+ÏƒüöŸÎ#*K/±qÜ∂≈¬:r>*ï·»•p˜Îy™4<≈tÎ√~+Nzq>Dò“Ôû√/NÓÆé˝Y(lÏ‘„‚»~ØﬁΩ–Áπ˜ùÿ£(˜(@ÑÀ_Z‘ΩuCÑπÉMÕ›◊R“ÙÒÇjüﬂ»‹ˇ†ÅŸº«„N~Ã£«ıÈ˚c∂·ı+Ù)K‹<±´ΩÖïIè-b2”ï⁄‹¸Ç178øekT˘’À¶øÚ∑ë¡pWyEîÿø@>I≤Jœ;sÜ/√¸^∂î ºÖ∫JYtí∑πR•G+TuS[µ˘Ä(-Ù–ΩπUÉÔƒ∂U¨\!wVˇ≠˛ÖõìSl3G˘£óX`÷∫C ~<ñ=?‡vB≤4{EΩ˛Ö©Çrõ9o”%G;ÈT¶!gÉ0¿ˆπ$œ¬2˚‰Z/¿¯Ä1ì«€Œ…Ûq»˙t-ã˚¢ì‹8ŒBdÜ„8¡ºCﬁqıtèràÉàÙÅÄPŸõ–wñO≥ k<kÇ˜ÜÎNâ“øZ·o>°àÁ˙IêﬁM{lï=Å)√·`oª±Œ·ÛiZﬂ›≈—4oË‰,=‘§˝Ω—˜Fü?ˇ˘˚äïüÁ|¸
{M±ëÌ,âÜ–Ã˛ê5Ó˝Í Ç∆)>˙ù$CEÑ?˝|Ö—®˝ƒ'èE£n|‘é«·®˘§üe„te~>GÌ£~ê•¡x‹Óƒ√˘Í‰ËπzuÒÍï+W.\∏|˘<.Ÿ’◊N¬Q'ÓÜv∂Ú
ç≤¶ÀŸ”'-÷xºÁËi√#z$¬"◊¶/,´øÚ∑◊Õvö+ÄfÎ0®|Oèî√Ç¢Ωr∞Õ!’yy<ªbßji*˙I,˙!(≠M≤‚{ßom<ˆ[/Ú√ÿu≥<\JÚŒbà˘ yH”ÁœÒ_Ÿ·`å<
˚À´ãåV£%‰lòÉz8)GA∞∑ X≤}ò$ †V2∑¬Ïb¡3l˛¢Õ:‡[2¿k≈0'Ø™º L¢/¸ÃÃïiÍÒƒ¨ªHãl8-Éœ~çπû‹kB0â4HNÆbx°6ù¢ÓÍL0…˙sÈd¡!ùYÑöìp~◊ºìõ\1ÅÊdÁî›ù»m~ûmé“I"¡`Ü—§rS6¯ABÜ3≥0°éÎ NÜl≤øO–´Q h7w¬qVF)Uöhù+Ÿ.Ω™Y‘âô≤®`©èß$à∫ØSn„ï“ßæ¸éâkûb—cƒû≤¶ÿíe∏W J⁄	·‹√Öˆ’+èDÙ	ºR1^®Wê÷·ÀJ@≈6*>
ª,_ò˛õØÿtŒØâÅQsö¨/X“∫AÑÃsí˜’ûAGˆŸkœu∞`ë‰¶cd„‘¨;œæë∑Ï"MπÔÜ¿—˘—˛ùCVˇë„—˛ûC™
:(Î1x€jUó£Ü‘ötÉ=˘Ï◊Ô!"€± ∂ß<ÉÎ]ÿq∞{≤<y+
•Õ‚C2;1=ÖäË€Pó@åÂ|P°2$‡GäÕ[ÅÊ!D"˚4E€n…À’m´hÀ¬vÕû¯◊VQzæ6èƒäˇV‘»–ÂÉ…à#`ÌÜ4w;ËÖMN¢8Ø˚8ÑB.Ìª¯Ì0Ω¿âí¨Ÿ‡úö(âj⁄ízÃT/y&Ê·£ÎÕáèÙ‰H»\Æ-=§ºhTÉhz£ﬁıfˆ~√U’F<¡lÄQõv›n˚!çºﬁƒµ:ïÉ0ø'~5°Å+õPcSak˚.Œ–•UÜNÃyïcæ◊∞wM`ï5ª¿ºØ0„x¢#c-IÇ„vî“_*:;keÏî£≠¥U˘È¬ﬂâé*´l°Ø`S;[¬∆á(…&÷˝®´d3ËÙõ˚†ƒ÷Là#ö¥£.äì6 "Ö‰û¸ùO√c5UT≈VÊOög÷è¡ŒAÉ€˝ ≈ﬂP=˛Ç>‚ØõGcæÊOµÎ|x:$ÂM¨Ç¥úisVîèúæŒy`€@t"J¿s¡a«ÜÏVòu˙T‚ ø≠4‹∑†bU®9€Œ˙ Ï”={ÂeËú¯⁄Ñ£^÷g◊Ÿ¬¨Ω(dqŸæŸv·Ú‰:;ùÕº‘F⁄¡\C‹C⁄˘7≥∂‰&¿€–ç}\»Í˚^ÏËF3·k©∞≈uÏÅ¯Z⁄YçÏAﬁ‚Â6[G∑Qó≠moYD@ÄŒS∫ù!çv≥ÅÇÂ<ëìÜ Á#åÀ‘\õÿ<Á6±EóÛŸó’Ú¡fñr…¬êUno€lpíÇsè[•¯`tw•—¬/≥≤sbŸôÍùÉT≠zl5r¥ÒÅ9AtÑä‹ò’Ô5Ûı
ˇ¥QRE´xB‹∞+÷µV•…’v3æ◊¶∫î?óT’p±vv≥uØùL⁄
π’çS‘G¥˜£XˇIñ=Ì∑ñC\\~¢˜6:å¶l≈˝∞|I°ç-ﬁ¿5I—@}LÖàA”ë•
ŸD¯$ªTÑ∑jV(T⁄Y|Å\7ÇTç∂úU—ÏÊ‰Ü÷KÎâ∑‡RŒhœF¬zÙÜı¨ˆhÇ\Bç◊Èo3¶™˛cËµ7›#‰A3Â3∆Y0≈sj±ï<A≈iÍÄlb>ûf3h±}mOr2ˇŸèˇ∏∏xÂ
ªçˆ¡BÉé0±|L©øΩ®-ñ ã¿Çâàê‡C¸|§Ã√∂å<] ‘ÁÕP 3B+Éˆ°¯Eu”ææz˘ª%(æ8´Ø«˝≤WÏ´WÏ[ØÿØı
‹º∏ÀÈUjcœÒ>öÎ=0ñ˘ ŸÂê¯k8%ˆı{|¨â{≈÷ï *ÃôEÜœ8åT’esóÿxniÅª+Â
™Ì.0Tc£º®Ñ∆π8D3ÜC˙&ú‘ (‰.'.–T„\”ÓJ4~ÇDÒ÷™´&ù≈F•BúÜ∫˝∞¯ g(Û«î`îÎC(¥uƒ‚®Yt{Âò†!~Y”‹\O;¢çÇ}8–&∞I·A∆Cd‚±åî∆/≈π5ﬁ¢‹Dø,Ã–DT≠a* VëQf~6,˜¢g Ω%©à0»'ò;ÅÆ8Ç eò˚-Gíi∑çfñò˜ DSyx]Q¯TÜQ–öÃ-._/ìÍJ˚‹*Ø⁄“œTƒ;Á±ERì¡J’¥œ⁄ƒÛô¥5†N≈]—íŒ'hÉOO5£eÇ(Wˆ™‰ûàó,ìπN,ZÚ¸ tS±1Ä•T*%´õF&‹£ﬂù†NPqL∑à±b€& ÛÔWoåyéç%à!–Ωe⁄’JV?2@&ãˆ-áÉ≈6	9˘‘π
Í¬¨M3!«\ô{≠%(6L) TÅ˝\ïÏß•n·¡‡¬F{qA'Yrx•¸Ç÷…„t’Ñqr%◊‹˝¬¨dµIoâ6˙¬¸¸˘ﬂ˛©S?c∫NMgcØœìµ;wo›ª˘`wogksópÀ"ê§,‹2ó!î∞…†,H‰>Ì∏wÒ«ºªŸ•u~5©6¯ÄsâÒn84é∫»Ç·pqA◊ñ◊_p_ï%W™sf`D›ñúºL⁄vöúÂã§‘CKm
)Ωcn¶ølQ”g√¿èÙåﬂ±Î; ‡≤Í<≈SÛ(¬ıv©:n›∞ââ!PÚ¢_zFÂıNòNñ¸⁄â!íu…ÈÏ‘Í*6~}iù›eñd¡‰∏‹¢l8è¢•ï/ ”\ò/’úøª˛˘Ûü¸˛˚W":–ã(ê…‚Ì◊^õÔ/k‘«’!‘ˇXF≥“®IYë÷ÅµkàFôÍEá?£áZÈl˜§‡´7Êå€z	~ˇWLˆœ±_/ «<˜J˝á©ˆP°ZÓïZ∫ÏÚ≤4üÙ … GΩ∏"¸cÄ.(NÿîµÎC-–Fk£√;Ÿ®‚D°ôËr3P˚,ÇAÌsb∞;( ì˛p	ˆí¥⁄≥Z·Ùk˚Jßﬂ‚¡‡ÜÇ)˙Ò—ÿıïêÚ€õó6._⁄x§a\„ôÙBCÌÒ√Ä= û=H|+ÚüeP#—∞«“§≥Í{ˆîÉlUËO˝]ç˜1!À9“y}Z Bø˘n¥;˝ YÀö‹Mj›Ê-Âd∏Ê¬-‚æÏÛS≥∑õÂy8,◊.ñ†SÒM?ßâFNj—â±7µè8“

Z1;eqÃËj;t—YZÓ©ı†€ÅÊ¢¥xÕ∏HZhòÙSñF?¿√~àS:≈ò◊Fá)w;Öûíıúiku∫k#‰;nÛ©6wëGr-¥Ÿc:;9øh»-.˜YÚ˙∆òIF	µ’#äZÁ≥áãK¯“oŒ”˙ëkÍQsòˇz∏∑ç©»oäë)òÆ?˛˜ˇ"ç÷´!≥bñÁhK≤¯oò≤Uﬂå“åP xÈY˙k9∆î2÷95&Wxi*t)‹®˜Ω!3›"Ü¶ﬁ>}RΩÜ»C⁄™éÍÓMCd‹.Ø5wÜ?j¬ÇVÂ+≈?!L<ﬁN‚q¿QgöM/Ê*ÓtÓÙ˙pså
∑òi»s ﬂ3gê-è3P:ı§Ø‰ﬁe¯,]ΩË_©èÅû-b3_ÒPzi6…∂èFá{¶Ó‘oCa
∆˜äµäÓ≈πß∆ùë)òfÑx¶Õˆ`ó§§æ≈˚«,≈î´§CjZ°≥ÂTÑ·…”"ƒ5RÉË„Üõß-W_-è”A.-'tµË_ÖÊq∫¬¯ı‰ÅÒ∫q˜ﬁÑE≤"B_gÉQO˛`ß¬kÑùÍŒ2∞<^≤;p#lÓN¬óﬁ⁄BkèVÙÜêy»Ã≤Ωá∑{a∂ªπŸ8$ÔÒ«XŸ„®k8Ωt•V6ö´ùnÑ´=tá7|zDTÓ∑»V∂ã|ﬂN@…}hy@æ>f/˛t1ÇÉ1A˘8≥¶8ní/%ûBﬂÚ9Àˆp◊G˛
Ç[YeÕpE¯fm¬îà?ƒgm´GÃ∏†4ﬁm±ÑÍXÉÌYAèóµ√ûººÅvx∫Hﬂ`˛VÅéu√±naÏON5á1ñ •ˇí$€-˙ÏíGRìTdt.ä™añãå∞íùê”Õ¥çŒÈfN,EÖ›‹µ¡Úlû˚A∑K√âŒ –ló<‡m¥
SaŸ¿iDeI8∫zñ˙§ÎÇ◊	ß“°Ü‹ÍNÁ¶yX5wÍU u;∞Y&|∑›“.UpMãOá]¿È5¡Ow=ä+˚°‚∏ïvCÏF<∏ûHÆ†	÷Uwo/…•-}˛l“k)Çs‰Æ€uüSÆjÕ	Ωm∂∏3•øZëc%Y«¡¯Z◊sQ¡ÁÔ¶{ª5u77x≥ˆSFÏê “‡|π}≥ù≈Pm…ù8≥)Ua2Ú«‡õtó95\ö„ú…ªÂ%™ùÈ!—Ωu‘–k÷h•ÊoóøKy›iØ èù&πÔ‰>Y’Ú˘„|ë˛xÈYùÒÚˆ¶/√-Í≈j=Œy˙]r—”/¯ªf÷ÍÙ’ì˛yl_s⁄Àg‡’yÏ•ÂÓzb¯ÌÖY\Zyáæ˛y2—˚™ƒ*ñ>zÇ∂¸î»EúüﬂR´WıÇôÁµh⁄y”Â1Á™LRHW]‚û]ï∂˛ïMså™C÷Ó@Ò¿˜{ B Q4®Ëà(n¿Tl¯ÓÌã\1{0ß∂/", JΩ ¶pK‰úÖì·‡-7HË9Òé˜EæÌ¥s[HPb©1,ú˜‚±«Ø˚]ZjÓ¬.áG˘ »"ÖÅW˛Å˙†k*í¸™Ñ\≤Øk¢O‹oëR¯Ú‹±Ø˚›2óO≥mLS¯,b9W&}4öƒàëãﬂ¨ΩÏyAZ¯ú]£s[ìÌ·`ñ0π3z„t#éìnz£ç◊o‹ê7‡ó5ò£û˚1å¯…ıÙQ¿:q_†Z„ /a‡Öã∞ÆÓ˜öúù¿ÁfgóGΩYÉ+Ñá!Ä‡Ÿô†Fuw¡®6ıa¿ô¢36∂≈¥7Ê?=Øƒûﬁqù¡ªfQ¸ùñlfâgûc{gÎ˛Œ÷ﬁ€lÁ¡ùÕç~∫¸<Èêb ^≥Ω˚€˘£Õù`Ùî-œj‰ûæzï≠√üî˛ñZªõ˜Ô›¥kYö’6ÛNÿÉëM¥á®å·dJW^≠ìiŸ+^ƒ…TÌ)ﬁ	Ú2≈o˘Rìﬁ¶téwˆuú7¢™ÉºéÇ„í≥xlÌÓ∑"Jò"ÒK/›,
ìÜkÉu–˙ò≈‹K ÈºF¯ÄÄ&i¶[±…◊`§«ú{ªXöÔÎ@ﬂ“™Óu(ΩÔ®{ﬂYw±4Ø{ü◊m“ã5'¡p]≈f∏ ZW›ÙbÌ%å5Éb¨È$#—˙Kx—∫Ò¢u˝ERsB]ö„o,£IgÚä¶m¬µ|˘÷ÁÃó¥)›ä=(áV*≥®£—\Ó·ïÖ√˛#6ûª‰â≈/°óXˇ©¿êY^0Ì–ï&˛·˛‹%”…¶≥àÔ6≠gv
cK~≠øTPv£√ynØC˜üôÎ:Çsî"∂Û”∞{mæø§UUTõó©»π©nH/0uÂ{˝–@å>ÉCÕ·Ω·3‡nR‘©›RGÀê{µuÎÃm83TL§Üå‹A»|ÖfÚ$°˝ê¬˛(≥ààjœs¥µ‘4Î≥êÂn#t∞O∆»∆íˆØâ⁄MY€l B≠Ûcr∞oÃz‹Oçºù J£¬Æ5Û∏fp=FÉœ3-±«3=.›tó…ç2◊≠¡T€p≠Éß6¶F[`|KWÜ9åÁ.PÉài∏ bÚ’^æã°4}O‚#¸^Í¶ÑÊΩ∏‚.X{ÿÿX˝≈í=ëÉ ¯¸ût˙lœ\œΩ«Ú<ú|ë√VZ4⁄P‹LÃ¡È‹˘0∂5+  8]cWiQh Ü?R?O÷j‡'Ë|ÀÇNCO®czåçbëùö.
’B†9^Åï±hÈíâ!Ê»∫Ωh˘…dı&A-“r$Âﬁ|8h)ï–„	Ê3◊f∆N˙ÇÚÊ…ˆœÁÃuL≤@”Îí®5™Ë¶ØŒy“.ASÿö¡5∆ñr%}˚Çk
R|U†MA˚_;ËÜrËc…ü_6d>h1îç∏K`ÆkI ËoØÕÓ∆…~Ñ—9	≤f7√A~≠£À› N¬ŸØRLŒRIPéA¢^}xéí£OÜ§ƒÓ8ù¬¢8cÃNq≠¸y≈Ô¨›π√∂Ó›‹Zc˜Ôﬁ›‹Ÿÿdo<X_aw‹Ÿ€ö1o≥Ωµı]T^>XﬂX€€º}√,tí!ı~“ÒÁç…æf◊∞uÉya~-Siº+ÔQbÈ¢’Û¥C—òø√∏\|çv€xìÁ1]C∂z¢ˇ“´ÊDÁñQ÷≤é™ÅGUﬂΩ’Q9√@ö’>éØ\L±#¯a4OØ
˝£jÃº7 ¡J∞≤àlòûoe–”~.”—Æã2 Ñ⁄‡¶éK≥è»ì†˘∏≈¢Yèc<è÷9µòe71“ƒ˛‹•ä®-Q3ér'…¥πI2-ß[Àµ»2cT»Ç‰<aô8‰Áå™U„·i¨˙√BjËÑí‰Â+`ç˜cÙ—K÷ºZıØêì“Î¶Û†•X(.=1^Q˜‘‹n‡âã( ﬁ’åãx∏îÑCÆï»·mx-Î$Ì"kÅ?Ë,ólõ”˚]IV’âÖÒò@lí5çD√QÊLƒi”u‚!∏ ≈v4∑åL˜ÚíÈ|—d¬ÁÜ¿z\Ç?˛—Ωªπ”·‚≈∑k¢å3(rÎ¸SŸv5|∆pù©ÿñP-F∫f]z4JípA¬YD¥≈wg/äó»[õ>oIúQLH≈¥]‘`ìÀ‹ª•IMÖU¯√0h\T(Ü˝†à¡–Lq/àÅü≤`˜<ÈØ©T÷RT,-‰—Bñ˜}EM}4äA#eyÅ*í^ñ∏ºW‰§2P3¢—‹QÈÚpK‡ég“Ôî†Húi^SB®òÖ“¡6^Y9_à	ﬁg¬ÔWõ»OY‡,ÿ¬^ãL™‹6yùs¸µ ˇ⁄ﬁÆﬁƒÕÊLé¬?˝KD£}<1°us˚¢I$°zfœï€ù4®9
'v±L+
À¢õ¿¡∂?ò$’yèÕ,4¶≤
®áã-∂‘bÀ-v°≈.
û;Z
œ≠èÏµCd£$'AwΩ≈øPëÀNØ7JA.ê„∂ä][ewÉ¨ﬂ¶QmÊo≠U•á!sh|kï!µÿæ≤E©îf †TÎ•a ÆOÌ–◊áLe∫õº*◊ˇ…‚ Õ$t€ÁœˇÒÿ6–* mk4∆‹ã ;ã—©ùéÙún‹˝©oYõd}iôÊ¶ClıßÓ‰öÎí«7º÷ç—?˚œºO@≤ç‚å“¸q<IX|4íq#Áfæ"#Çﬁj”ÙR% @õˇQe‹≤˘$wÄúM†Ê±˚OZSΩÉ±aòı„Ó
klﬂﬂ›k∏¢ö˝ü~àH±)FØ46Ä@dt{k@u"&	ÁàÔßÒ®¡Nß´|?ÓØ∞øﬁΩØÕ›«ÅUkû–S8Üæ~ZD°!D Om—¥Ïs:’ÍPsrì|M≈º¿Ô6ˆq
$j©¶v:!Û‡t€@nÒpÛ…gˇÚDl∫àL°–»M§ÁûL’ÆRv•¯ôß(L"P¨7à˜É¡ñs
–ê¶.¥√≤ò™ˆz$–9ôÆ®¡√ËúïÈd*<Hmƒ÷ÙuX°9rUóœ\≠Ì1+ÂQ>S÷x:›ß”ùEß,D‚Yv ?
dyN‡≤fn¡§
Gé≠œ;ﬂûÓH®O‚O9ç3y}Å#Ìe4ªn£Kíõñ„…òÿ˙r•√R^œµKKÅ,’g	0ÿ[l∫·A0dSn⁄pßOÍ∂?ã2TÛ?Ÿ·xÍÜn¬ ó5k¨ñ,¯ÁVZ{⁄ÙQ>"aü˛}Ì§GÈÄìÑ[ÿ¿R$£¥îx–b3Ö¢%Ç_ZX@§˘˙ãòß&÷“üî5®	4(∆ï™.ÃOânGˇîg∑◊?5ˆ√iIÆ‰i^ÁqI∏ÍÚH(H™#íVJèÌ,æ=ªÕ≈ Ó˘öÆ|^
™·F0ÇÌá9HÈÑw—t∂äü#‘¶SOñÜ≥åwuôí~õ`RÖªï˙`RM%¡ÿõπFˇú8˝ú5“î™˜∫ µg.≈ –ÇYZ∞C\È/RÊ©]~Ê√p…?ü?ˇ˘œŸ^<. ˚g‚¶±86<®¸S9xJı¯p°ΩxëÃAŒ·t¬;Â]∑fDFU†Ö hÕì≤≈7wÀ•ôÁÒ√¶º`Àö’•¢UÒÂ2˘M≈ª›–S˘Áƒ;Ä%à0NËórΩy’Í´ﬁ|Ë6‚∑‰\©±ËŸ∞ÙùË;˙¿π±a^d0 ç%©1ßOüHÓs¬≠å“®ÎÊäeﬂecë≈õ“.ã†ã‡0é∫l•¬4@u™áÉe`»|?>¬;ct~—aÛPÜ
Û∫∆F+ë∞p#£ÓÌU
.g`(zÒ%k+π%•‘ßC√≥©a%t:)™lø÷πSbœ+_pÖç©Ï>ÖAÙlú∂X1Nê|k˝©+Z!Î3BÌΩ0^”-=Â™û22_Ú™©Yõ≠yÈÛéíL?
›ç~hGPX”Øπ˙ñt+õ%ãÄ}VäST:◊•/<@_•«√0„ê€ñß◊íZ„}¥˘—ö’ö∫ÍÆ›ÅŸs+g≤$…y°7Ù≈Q∞Ä©e®ﬁ¨Ü∂±‹
†⁄:Ø°„K l®Eoo/÷ÆÂ¥√µ2ëﬂ’Z´~‘7#‘4&p.wÁÑÓŸË'·ÅÚãË≈qoÄ‡©Ä∞T…nèééƒ]Ju;Ñ"Û<:{˛F0éVœÙï;ÕmSSmà 1ˆó¨ˇ˚K÷¥âß„ûûi≈´0‡ﬁ›´3<ãÆõL¬¡ÍHë·Aò$Ó‰≥/∫‹¶_”Víg≠’]`6T[	:∑7øÓ=$UJJUÛΩÑîBÇCÁÚ¶√˝”/ôà-%∞oÕ
7á$XeG^ºƒÍ«Í∞qeg ≠∫ÍTÓT„ \çxDÅ∞9uÙ·Ö2Ò≠0ÎìhÄ|≠ïpÛ
4ÊJkÂ¬Ô3]vLò„3ÖdÂ‡Ê3◊Ô≈ÏÆ„ìëYa n·u0Óÿ¨©/È©E
ÉÕIÑ’§ááÖ÷x∞Hx‹B,tôà’œÅD0∞1·0‹•8∏ÇGëË#ú‰3"Å∫g∞Úô<>ÌÕ≠mäﬂüi[33._o¥ê‹†ÿ^Õi‰ù^˛¢WIy√Wø¸›øVI˙ΩÂÊù©}6Á¶˛©◊Ëªõê´œ\÷Çé√b≥NìU È6·/“›L>O@¯|“	v°r#„Ã”`T¢ö`2ÇÉ_C©¥q)Må…á„8Õ8
›6~{ôàèep(—ó'æC¬≈›º+ÿ,¥√s"c'`]Lää	®8(˝ë\x¶OÜH⁄G˘VE‘|Ññè'74Õ≠.]xìòhTL5
à∫w@]≈=7hP_‡•O, 'Zïﬁ>Ä´
<@Ya‚îzª~∞_≥◊¢†ÈeBó,§≥Úw
å>xŒ¿“ÿ-l∆ıºΩK
`oúCmçQÿìÅPTIhr¬PH7Zl,P∑å~Xµ£´’Zƒ÷üE)°èÆ™Wˆ¨WŒö¯ù¯Ò∑Ñ‡^àM⁄Ö08n ˙±›⁄¨Îx∆PïÅuæOë´zíY˘ B¢Y·á8ÉëO·'Ÿ˝Iˆ9•'ù¶VuK≠s´öhÊ„ PuJ±Ê8«B∑1úîÎqÈ)B1lû◊i»ÒÃPÃ¡`ï¸gõN‰Ê¸˜⁄Õ·¯¬è¬˝·áÒ·ágõﬂª—˛ãŸØÕG®ü ∑R¬Ç§ˆ6Û¶ª}rœ 5◊É®*|ztÅ{›ø\ƒ¶9ylp‹∞-]W5Óªk‹ü∂∆5Ç [òc{ﬁ-JÓ{Kr;Ÿk8$Z¨ ìÊ≠¡÷äK/ZUSD≈¯Ω§ZY‘.πhˆÅFÄ‰ÌÂDÔÆe|ÿ∏Ê-˙-¬≤e7Ò–—/sÎ)ÏÎ=®’F"√7≠Áo⁄˜øiﬂ˝¶˝Í7I–)z’ÔúDú∫≤x6%© tx”H˜äê™˙¡”fUÊ≥E4¢ ;¢êü2’8hìü:…∫øl
ı˙Ü˝«°Còß:'ü√9≥R4SπÁ’»ı{6úR∞1j:òd¶®RôπÆ®5€ˆk‡◊P∆V®:áQ√Ê¢+3’ıM˜t•ì` pô–\º1«˛g˚Jaúj0ö†ædíê5!˚ìc¯^
F√AÄ}z*È)†©©,¨W¸zEå¸≤.¬Hyƒ$2¥%'yË˚‚“cﬂÉtå·IÈ;ì 	À≠gf‡{nK+Ñµü∫G©$
˙B€ÎçE˚¢g4x›8¯Õ1.õ	ñßàlÎ¶mJ¢r‹˝πh&(Ds´_œ;√dÌ†Z›d9\—‘<∞ œ„	©}ñV§≤√◊Ç.áb^©˜íKpxFS,"œS§√j¿d¨∆õˆ≈"Gmµ¢g+<r—)‘ıΩpq¶¯>±9Wg¡émÌV¡a˝§¸Èx µ°Æ∆#rÉ≥lwà 3‰âÿ˙ ë¯äQå1Ô—Œ§πgs®«ß¡· ò#]ıP}ã1(Y<∑œPTñNÅ‚«Dê·√Éhä£å˝ y™◊»~s„êR cu"C_zfVu[
ÇΩvd)¢K3)≈*∏xq¸ÏÒ2¸óÙˆÉÊBã˛◊æzqˆQÓád√Æ9ö$»ä`Î§Å±∞¨µ2Vﬁ∑OAÍÙTÚõÓOöæ@]ı&“Ãîïö-Ò≈t∆¯™™Õ0_G◊Å»Æ•ñ;_ËLf`Dõó4jõY^]4’‘‚rµôä,⁄‚9˚Çv/‰7¬Ä∞s5Ü 
p#¿¸Aå3t8´Wkã{Ãã°øÖ‹Ωrã¿º]Á≥9àûÜiÓ±Ïu)I¿xÊ1∏ºHÉ<Ëó?t
v÷·pf≥›!Jô?ß£[Å—⁄cNÖòJfJƒS¢K äD∂¥£8Ò„0k˚Y›ŸSüEeÛŸÅÊjg˝2Ôb÷/-ÈWKO˙ÂŒ˘5Ω=Ü{*àvn≥Ùåû^+\6™â«xÆ7Òﬂ2£çû]Îf8yíL≠egÀ÷^Ürì…ƒX7⁄ÿ∑-BœØ%a8ÿ2îÍYß‚◊»¢%Ù@d–5ÛÑÜ†‚êdu≥E˛Òf¥¬ÊäŒ™¸S‚˜l≈£ÿ´ÚGù“tY>¨Í÷î?_›$;Ÿ»ŸÔ‰∆˘∆z˜çıÓ[F?æ±ﬁΩ®ıÆñÖ,∑Á}£ò˛F1˝ıSL≠`˙ëÚgo3˜±≤|}≥óøŸÀ_€Ω¸%[í∏üÈÖg6|∆£6Ñûuú	S6wÖåL¬»t#˚»Åx˚JD=˘bî˙ƒG¥X‘}Ê3oL£⁄/¬tEƒ&æ´DÕÔ—Î/πÇ&-ìÄ≠Ê∑rü—ZˇoÙ◊ﬂËØø—_◊‘_õÜ0—ÙfBb'¢,7í)ù√®∆5S:‚x0kΩ`ƒ¶5M∑=V©ÕKWX÷á„sDÉr]∑}Q~r;£^]	
⁄gﬁƒÒyò(∑√¥'?/`R¨kEî”öË/è6I•9ÒñD¸G°’Ÿ„âF“ÏxPÿ @ß)F»è¯»g5+Œ›èï˝%‘ΩÑ$øêG%±–®ü	ÖöÉ]‘{oEÉ°'ÇÃ2V≥ÔÍ∫µI«›É≤-
∑kÏ…ÌÓ¡Fêt1 5˝q*,ÊßÏ0H¢`îq˛»ŸtJmËiol ]ÒÚø´ç÷wõÀa´qıTå£‘·)‰prá⁄πú0úkOëHbUÅ<jû&ÖSÁ+bΩ‡ŒßÃg≈ﬁU¢Kª†À ”;ÂÊ>\HL3WVòÊÍøªƒ Y“i&,kÜ”h]z9ñ¿≈KïÉï¶Båˇ2ˆ	YâNp,¥
:Q¥˙‚yz∏Ì…˛ J˚$#Û∫D≈¨	ô√œîRæâ‹π2§Úô+⁄Ûà±"S°¡^ªóvA@G∑¬PêXB∂¥ﬂ)'î©æ£Ïõ`@ıØ:ﬁidYÃM+<=éï+Êñãïd^‘ü™ìrgæ⁄:ªÜÉÙã≥Õ¢	ç€fÈ≈^€Ï∑2uvs§‰8jM`˝$E?‡Õ¢|\ﬁ	J¡I˛ﬂ™cá›°Zw—Æ∆M±^™C9x¢`L9dk1u-TRX‘káΩñâ*
π¡©fÃ5Ì,rDLÎ,Í0¨=\óTñêbõlÑqeíı„dktSAÌßU\C°NÑ´¢Å8©zKÚó,˘ -bS:KÊ/ˆ7çUBe2∂Ìv;1«∞©+ˆÀa€lp2˜D9Y”fî± öÛŒ9[íﬂ~UÕ—~iSö_cô(E‚¨Æ ,3¿[p¡ˆñqY·K≠ÁuÍì∂sE0ÂÃΩ26¥F‘ÏÇˆ˙ﬁR~…ù   Èêò?ØΩ±w˜›€ÑxjWªn‘ÉW><∆AÚ)‹„C8I†[è˘©@XÀ9x≤ ∆ -P5!ı^3†ëèÉ¡‡ÒYèIê*@˚2üàó›~rZ–;`{? øoôåQ≤eÑòíOlînÖÉ˜–y{éhz∑
óçIŒ√+T5w'i‘±+1/ñW!ˆ—3-=æüÆÿgîZ/π√Q8B¡ÑÃêªÂøçáÒÇÌ/îW¬ªRØC˝4™‡ûﬁJpÚˆPºPG,˝2˙/“°kOìözF¸ÆxÍç ÌgA/?ÕÂÖíÁ¢tw“ÎQnÀµN>øÂ∏Q5Òª@Y3¬¸ÊàüÂè£—vu¯Cw≈èíÉgZyÒ£§¸Ô? ÷PÃ¢¯e>±?≥ÜEƒ`KªPﬁü8âz—(º	R‡ê∑Úæq…·≥vΩπhtWπˆ¸›¸wı√∞ˇP( 
€=ñ{O](o:.¢52á‡!´u§]3ﬁﬂ∏:øx©kø±xi˛*ˇ2øÿ∏ﬁ‰7ÕQ∏´hÈeí”]ë∆
T ÒH˚«ﬂ!èAÊd∑∂vv˜T˚ib…÷èoânE	OMSì	Ø£k)kø√”ˆ¬L>N±@“˛f¶˝òx°ƒ†ƒQÇä`Sî? ¥EæU0!håñú2jÍ'˘ÇÈ§J_+1“/iY∂ÈYˆﬁ ¡Â…r&QÆ6àßÉI7LÛ"¶-YV°≥ã∆∂«ìîÉÊ e!ÊÁ√È*ÕO2”7ó¬˙Ò˜GhB⁄˜πn˛á1OãA2gÄ¸+ÚıhÉ^,†≥.üfTÿB>:úv∆i•£-≤kÉ=ÚçÛ‰◊œyÚÊÊ≠µwˆØ/≠?∆§;ª5}K=)ïT√E”˜ÇØ§S•1Q_ÁéòÁ÷óåÌí"ı‡ÜB ˚„"πéKcÂß§˘q´wmµ´»âã¸ï™:›ÖG∂jòü‚=M’õø¯◊åpÑÃjû÷Úd};ûÏMˆCx∫9úı4 K€î[6}+ ˙ÕFÑRxÿÌÓØ4heòwë≠>;ÓÓb˜cÛ\`LÁ]7¸≥Qﬁ@ø	¸á√ßá?\ÓçL
U„v_à4§6ŒÊ|J„€4{≥|ú}˜”≤bÄ ¬£ciπ†HTëîûbŸH›@£á‡~∞U∏j¥·©€µjO≠MHÕÛ"i{$ﬂΩJóÈc°õy•öÓÄ≥≥⁄π˝Í<TßÛH≠{fMqjùÈ‹2Û∞≠Æ˝SG˘"tˇ%P~]O©wMêqA†Â‚´s LÈDlº¢HgA%»1∑·k≥pø∏Il†Áº¯O$$Oü¬Ì3-yù&-–œóöK£a∑Ëú¨ÈÂK?*fÀZoø~˙s†~›Ê¡Pv.‘¨ıˇ  ˇˇÏΩ˚s…y ¯˚¸IÃx∫!çHpÜ êÿ|ÅôÒ,óÀ)tÄªªZ]›10"¥äX{7|ª⁄ıJÁ;ù#∆>S^áwœVËB^)‚¬é∏øÑ°¿˙Ó{dfÂ≥∫$g8í“∞++3+_~Ø¸π$0ØäÊ´>˘rçüKKbÂ“‚GˆÊÛa∆°«∏oﬁÙNƒÙUXd~CTO/ànûÉÜrgúw \üwÒ‡¿—ÚA\WqqæñrÔ0&˜“ÓîÔ6ƒr[˝˘ôÁÏ¡Ìl¨'ı	UügÛ˜ÛÄ'aªÅ¸ï—/´&‚[4Úô¬t™¯"£µ	ûvô± \j◊ LÃΩ‰^⁄êë%∂µ◊”ŸÃIﬂÌ%íπPŸdTüØuÊÄ|µDpp‹	çOˆW5DÆ‚vh[‹úâùà?H”! (ÇX<Ãƒ“OÍNCBπF≥˝^™¨(wº˘AÆÃßÑ»GqjÎUŸÿªSˆE>"‘]ƒ≤7‡‘Úiónûa'∞Ωoc(Â£.˝RëµmÚY÷Ó wBsÄù‹¢ﬂüH™≤3∏õˆÛ—Iì:6Œ{]ârZt.ÀÚÒ>ÄW»∫
9 —`|;Ÿ˜u;∂ù,-≠ˆ<j≈!Ú–lœ≠+m ÁÌÓ55ªWÖu∫◊›´EWü∂'ºGß{iŸŒΩoV›¨´Â÷Q√0ÎÿG∆bJ± ˇH=üõÖ˛C`êê/Ï»h[RÓÉÛí†Ö∆≥	*Ó8ÕßÊÓ—‡»É‰…`ójﬁ/{]∑\‹qd_‡ÜÓû0•ÌpéA´»’FÑ<[Óß;o3¥6Îä=ZBÌ¶?RRq:cxl≠—BúåÙò¡q¥5ÈŒˆ∞”-‘¬hÎm¸Å”i}'œÕ∆B#0/ n˛‚L=™)QáÎÎ≤oóT…ÍÒjL‡€=À í£¯	u∆ã–æJ<Ê≈*—7ÆãSRMs˝QNY„F(ïaÖQ¨¬Å7ævÖ≤»˝öBë®D](;ﬁ~HCç2¯¡Ãq+úa['yL	|n»fœ=aÎ	Ã°1)îñ%88kXﬁ◊¢D'VzÏ~l¶ ∆BMãqq`^∫ñ1÷¨*˝˛ﬁ}≥≤á]›«Lcóãt8¥v2Î•l|QﬁŸ §±˝Œ‘9‰a¯F<˛5,[ rØ¥∏ﬁz‘ñ∑ƒ5b°¬¢rÖÅBÌ0]£KÃmtà3fëßŸnµ€ÀÖ¯"Âú……ºÒM)R›‚OcÁ$ã[ƒ›rc¢È<»£≠1–∫&uÅw¨rù˚u-ƒ·À*Œ%zy?.ﬂˆ)ÙÎFd‰1÷≈«ÔH¸>â3l÷∂lTö‹ •k∆£≤®µW3_nis–)•QÓ≈¶2˘Ã']◊ígàé◊«Lˇ<ÜŒ'tﬂù/vzyì§~dùîVn[∂‰…¥Ä94çN\_ˆÚUã~öäÛëgÉX„{˘ ıN>8d©ÕçÀm†g˝‰ )GÅ ¯Ä‡Qã™≤Ó+hä'C`ıû¿åû†ìF ∑ËBM]sÚ˚3ÔÙ∞9◊Ê§õÂí∑˘=å3ÚE¶ÖíNM©ª@çcáÜ(ˆ∞ØRÛRŸ0¿¨PÛÃ¿)o"·À{\jßÊ√®{2h Üv∆Õ,ˇÁd˙Ú‰Ω”R≥wˆy…Ôí6fMËCàpÿK:)Íî˝õ•÷„oø∑¥ ÊÊÊ9√"Oeß“(;ÅìO∆"∂ÒDÉÏwyÃ ¥w»[õÛı4Û°[iÙ∫ëw^(Aﬂíè¶¿¨™¥–ﬁÿ†M—  §µzÅ∫¥Pœ^R÷XUµ„˘˚π‹lIW‡∫ßÅ—)Èßp¶Ò§†:JˆÛÓ…Z9Ÿ—†’
^Bª∆}M{T∫5l1!9æŸ†MïÚ	∞≤]èN.Ë√å†Ææ_~}4*1˜ö¢˜û:‚ ¯#¢úÅNÍ"K†ÒWˆEÍ‚ „t≥Úπ$Å„KÊ˜E÷C_kùJfö≈¥Nœ§ì©ÒJ„ia†„ÂuÎ
"≈$ﬂ·òI"‹Ö'@ç®¸Ÿß˝fªf⁄~ˇ	Ÿ∞ä£¨ïk€Wi¸Åyg»øø{ˇ^ã‘A™Båx[¢ì√ë9E◊m—X©'<É z8Ù'áò–˜Ic>@ø˛ÚáˇYêÚ’»ËuÉBRStÍ]åÅ¡ßìÅ≤¡eMU>¢uŒ“¢%ÙRÙıQ=
}}ò.4\.pä˘p‡¥9¡oî¢Sò∞√§õ¿wfÚ˜lj,7…X0â	KIì≈ê‘◊k'@Å F§:Ôî…e˛2T4†îAê∏;…≤au˚9ôK€§d^∂ÅõıAÙÈsòäÙü¢ÎôÊÍwƒ≥B∞> EßÙôI≥'ÉßTä@⁄]Y∏ÆØñ÷TVàr~À-±MAôıí	y$Ö¬n OîbT|Ç	∏q±ÔNz„l±@—I1‹	rvù»Œd_LÒ’eìœ	zb}ëv…X-5úâ¡•Y¥`ÖÛ%Ùoí≈/6ˇU{ÒJkÒÒ“·Çh<q-≈É’.º·≈“{ß,úXA8êÑ-4f`¯Xﬁ"6Êñ]≠i[ïóÉp)å|u”$48Úfúå Ïå‹ﬂ$âêÎ\kËè`O÷YÑùﬁ œ“ëd«òCPëÜ!†
«Ç(2pb∞¡{ _ojYÔÆRìÆáñ∆∏Wƒf¥m{fúÄuˇ˝Ó‰î~Uó•u=)eçµI:q\+-fL3Ø—∏bIŒfònìaÅ’°_§ÑÄ}{†zËX∞`*•Bã„∏$eŒL®9èE˜'Vk6YΩò^¬'„kàkÎ¢›Z•Î¨ïKÚ[ÂgsÂ1§¡ﬁÄ/\æ·ˇ√£S#4€√»å«ËE¥mÊAõ—ç´+B@¥æuœ‰Ûv…æπ˝€„ù=@∏Í}ÙÏodA\C‘î∞DáPFÅ2µB0È|Ä∆'7˝êÿD©ÈÏ*ÒÌ¢†≠Ÿuw◊¸πìØu`ÒBÎ4okJŸj]í°íw1ƒ>…†  9WΩ∂õœ ˛FNÎÑ
Â¸Xz„·ÊΩÌ'wÓﬂæˇd˜·ñﬂ/¶uzÂúo°¡I`OÅ©HŒK#<PîSßÓâ,~dúÁö±™\œ`Õöß˝:¸áπfÃBïóëÏ÷ƒç<GõkP˙ıº• Z∂õ<Kâ;€x=KbB°ÓÜ%èån¢»⁄gÂ«¿QwFyQ–}Ôê‚d#ã-”|ŒDô=Ò=iXdënw˝ˆºÀ∫ÖÀÄ®^¯Ê≈ÏÛ∫)∏/ÑKkn¬F'•ïä√√Xœl0 ´|0ˆÍóh¬ö[Q1∑2&d•i~ßË?ÿl/à’∂j: œ˚+>U‚È'2îΩcãjAlÛúx}i≤É-Ç;—Ü §[í-ëxwe_º;FpÔ‡u'ùqUÏﬁÌÉ'∂b» F¢lZJ7Ìîª4+ëá)hD⁄‡°∂€‡ëØn√(¬n•qL≈ÓÅ|”X(eùäöío,8%•Ç–¥7⁄ïOJ†√öÙ%˛:‘2Ã™aâ¶Ëi°0Oû∂f^?⁄\éØ!ƒniº>o•ïjdv-])…xO∫IV˜úX·v»¶ïö ‰π™≠:Ø®ç	p– ˚2<dÀÔ∑z¨XÉŒí’F*|,k˙p€=â6ÏÊ:ÂQç6ï’ÓÇµ®5˚`–s:êgä¨gΩQM¸7f6äé}ó}IKtbV‡€≥µlmókLJô¨◊aDŒ…∫9ÀU£RVPTJ3Ú~ÖJQ8`§qBHT6˜Û—xKó˙÷¿h˜õOXÔT∞›<JuŸ]+¡éöÛb˘C2O3,>dîè¥¬è‘vΩí:rrCΩ±¡Û;⁄r„ç≠77ﬂŸ!¨Êö90.*e sÜÄ:FjFz¢˛–-75è÷wä|–4+S∂
¨
<˛€⁄Áù±Es√\≥VS%J=–OÇœ_˝ü?õ;m–«'‚ˆ$uG√@ö˘±Ú>NÈmì
uK3nŒ˝Í«˘/ø¯Å¯¯¡ù˚õ€‚÷ÊŒùõ€ˇzØü°u¨2—=N
’;z„+âBkŒ˙Ä©ˇ‰„d-ê^æ¸©Z'Ω^Ú*B?SL[4èÑÙ§j!/ ﬁπﬁvôõvHÆ[P@Â)ßhÎùXÊZ¶‰Á†‡zg}Ø∫∆ÿcÉh°®Hô∏øÊBjÆ6ö;êOf!¶,ÿì
n ªRèf_Ulö€',LÁ)∫µO
R∏™‡®oÖı$?xBUXÌ:êﬁ)ÎÁ]eô†Œö,JÂdÅ¸°bÀI”R≥®ªMµ»&JêPºf-¢YAqßkˆ‚,X®H2YkÂOÔ=IÑÉcVQ—ñ,Œ’≠–ë-¨Â,WVH”áÕ!ÏÃ≥è√ÖrëÙ@1öªÎ\ﬁ [§m¿L<Éu9Ñ—c\Ä∫ôw˘˙”h©në£‘ﬂ∫˘≤õÍ;Â◊B˘Àıïv®¡UVl©‘Iö(»6¥m∆0UÖÂ-_xÃ÷˝ãµ••Û∂’Mk‘Wåç“›aûfá€ñº:Ö#ÃnÈ1ÄLÛ¿&Øh”]‰ÎëÅô∆¬∂¶M…•2ÃqÈ±øKbâøócGZ	ä0∆ÿ⁄o*‚)ÓPô.¥ß¸3VI£Ö¨´ç∞ÖîòY Mçø=ÎsØ;c‘ÛA⁄lêeùn—Z9†q°˘z¡AÓ˜_≤»Íå≤!Ayå>&dnÉ›e¢»BÒÏr∆ÅÆ¬®ﬂXbÎK¸¨ŸhVÛ•ﬂµà`m±ë/Ly-@(Ä.Kjê~ÿZnFÁGëê∆º=Rj˙$ÈÇ∞˚$ëùæc!ÓÏV/9|ò&núA¶FT‰##≥9¿¡w…•ªÅd—Å75^)+≠]ºBı◊Ωã˚ÅMKókkf, @Ç‚éÜ
	û$¡µZ∞∆`-¶l∏Æ5	˛…∂ÿ „J†9¥µCR¡P’π¸Ëú€∆;G}DEœZO·wç-„˝\§}ÓàùÏL∆kk®·ï*ß>≥©w˘ú
t•¯∂ ´UÒûqe†5ÜULûVûÚﬁ&l˙Ç7g:öñœ}˛Ç=Ãp»ÇÌ_Ûa¬lá¿WÄ¸∂Ö^£Nd‰”# \ê∆Pü≈âV1n‘ë7IPLúÃ¯ ,+≤˝¨óç±_B∂úPóÄïtÍ´ S.!2=e⁄ˆÙJòek5’•ƒö·Ö '!∫¡d/L±‚(œ`Tóñƒ›Õ{€õ{˜~∂&6â≈@√Ë,ax•uÛŒ§O üf'∏qÛ÷˝á79T0ÍFér ßõ&ﬂË∫…‹û:Ë¡…ñ@∆BÛñÛˆpÿ≥ÇCjä˜Ö2ÕîØF$h…ß≠}úq©ë∫CœCÊë˛.y¶±OÃU≥æÖUF^ÂøöALaû[º•Vp—íó>õ7ßåŸ*nLˆ˜{ÈÉ|H∆∏¶÷ï#ÿ8 ÍXïîñ˙Ñ˝…«[4~ıÉˇG‹  †BçØè9–5lz2| ëœ≈&Òê]Cû¶ Ã'©ÿ?Jø€píà√˛sîd≠≤´A:>ŒGOa›:
L®ZÍõ1»`Ç¿¡ÎÕ1´µíû1èg≥¸Î/ˇ”`„FÕR ®†’5çc∆Ã°oæcÇ¿T´Nœ◊DG+-ﬂñ$˛K€P€Ø√õ6≠ª;àiù¢«ﬁÀ2ähh.*\®◊L≈ı^Ë¯üFÃO^Iﬁ√êë∏R∑J+_⁄Ai®GE§Nï>ŒñM-≤&«˝5,~£õz∆ÆW^z∏µÊ*‡†M;ÛG¨ÌË•–ù€Í)4‘åŒúü¡∞8‚åõYNW=Ã˜Ú{ÈÛ±„’á'ﬁå-Æ±ŸÜrè]ÀÛÊúÙÿdRYla1”Q|[,Gfç#z@U´G¥!⁄ë!,÷√b`v‡d?OF]1Hûeáå=–Ãñ‡ù:aÔ°áÌ¸x ›8U~‘{ˆ<xöûp0âM ±clÿ‡¸„˙Fﬁï«-¯}+EJÑ>∫ù$ìﬁÿDÈjﬂÕ†Ç:⁄Ö;¶èá°˘•O›Ç?òi<∏ÎM˜Ûc‘√>’≈ïY∞ó^ˆR;vzU7ËRiGI7èBä˚nê!éÒ‰q∏!ÂÓ‡ïü	JMÚ~<9¢dQÛÔÿ¿CGWÇü]*q°ái≤:Á*ã∆AΩ∂é'’ºˇ¬ÜwìÒQ+Ÿ/öË@‹'üÕ√qZY-7+–≥}3»`¬çÌ£X[ßS∑[¯˜πe£‡†Ïÿj‚RªA,≤ç‘$Z´Ñ˘1ﬂ_ÿ¯e=PË†¡Î¸hÅ«cSmÔ'˚î#Õ4óıSc”’Ñ≤0=Í$ΩNsπ›Ó>;Z\Ω<|>ˇìs/†¸Ú%*üö`H•0¬tä•’∂ó Sßß„K
N”HÉ‘iFóæ%8‚€§fËÌHÿr¢]ŸﬁØÃPyç+ÈmEA}}õ9ŸFÈ¡˙©ôe¿»7á¡_Ü„ı9RÖ/}kÅº&ñæe¥6VêßbºÀÏ¢©ñætâ÷üX“Èq~0é`ÓtØù œ92O1fµS3oÃÒ‘Ø™Ù´n@ÿN˚Ë“
Â©<≤ a”?\•rôÏî≈¬K˘¯›ë%‡0©k=xp ˙Ty‚Vû”˜eÆS˝ÀÀj∫b‰ÆÌü–øvÚXXQÃb™◊oq±†¯(M∞c;ëiÌ$¶_,^¨ì|S‰b*]LNáIt´Ûù∂ç|ß–ΩìÔtz
”öÈKq,v_ﬁ¢Qo^í-Lhvîî©¡87-ßÉÍô©¸Ï¥§V^”~7êNÏ°dv¨Úny)∂¸Ùú∏„úpâèzëã›~û√?_tÎπ∏	g∫«˙N±ßs¶M;G],èØª+õ@„î¬‰:,$ÆœÛ·ù‰»Œút§]?’Ï˜ô∑˝ú‰€@Çcô‚ÿ 6éﬂ¢óªäˇ¸èzUdB¨ı”&TRy†8Ô≤ÎGÅ'kh."ëO(ƒÔ°b
ãÆq—¢*≥TDÍO¶´[ÀﬁÀ≥@Æ÷ÑWu˝42î)ﬂΩ-sÁ˘©tøßR—€(ÜäΩ¨≤É‘¨âã+Ì—M˙√g≠|Ë&Ú∆q™„¿à[À´¬ü®¿åJ¸¢Ùy6>ﬂNÈm·=˚ç^∑  Eœ˜T∂&ä úoíBeæ1e∆È=‰ñ´ Ág‡º∂Tby:∏(ÄHÉè3•+\i3›3®Am÷¿ŒcË°ﬂÂÀ∞97ô¨Œ^lßF◊º¬‘≠ÏÔ;9ÁÉ9f?ÑØ®r1N“≈’v€…ÄÍìß£ã~‚ƒûëaæºBπ9íÁ7x†|ü•„kKGß§b,˙¬J)òùÉbË˛≤31È…{Ç6å“Uà<»èÚ„Qû˜Ÿ‚Cr—ò»QÊo‰h'îæF{Ω}È£Œ5@p≤‰Çµ(v*…˝…x¥÷ÊLÃ:OUŒDìW¬◊ıV´4ù3l¨Òï∞/óa85™*Ym[âÜΩß±óx/⁄∞%Y`s¬Ã‘
û÷"-Jé*ú;W&ÿ‚¥πWV(•¬¶-]jõò√Å∆ΩI _ZåG˘”tÒ—≈«^2^‚‡6‰vs™/ü≠∫∂ƒ[2=ßOdßR›+Hclä#~20≤I(ùvÌ¥ù.„ö=ßt°ú ˜ã≈G+Ìˆ„2Óï∂ì)∫ﬂùA¯¬œä)o5ﬁ»ﬁO…ImíáLaV¡ÕE8ﬁUhH“`<9àÑcn]—Á[¥3(˝ﬁò§îSÏéîáÔCÁò@øór≤yg`ÛΩºÅ•∞c÷Z/mÒpÊÃıYB∏ï]ªlÂnñÏﬂbÜqéªÙØ‚Ä Ö≤7W¡@±é?Ä,Wß“äpbhX˛˚¨\ 3 5˛g_Ôô%ªÚfÌ’îêt…¬Ä‘ñVÙªí&©í¨J7;Ã©ÃBkjıp∞s—ƒË8´ù™:xÖ]⁄≥;◊dVº…$»≠:≥Ÿó•ó*áŒMêd1ÏæVÀS0.4ï&g4˝Z≥ççÂ÷J— V:>ˇkLì+y †”p“+“`NÙ»'¸zv°Ã›ÃJÉé¿¢8?”—h-v√»Éê˙qË¸∑Z≠¿êm∂#6‚`bh;Èz/•/.‚ëCÃŒHÛG˚lˇ˝~≤/∆…S…ãî7ﬂ…8°}Xºﬂ§ÎO1HÄ‹ãÔ$'∞ ≤!›¿„Ωk6hâ-u∑OJµß) " ^Gô¯Ø1S4Üé&N™f°≈Z:YZK·≤ÇÃiÄÄ7ˆXW}íó]ÓUøπÿ6‡M'±¥ºå$à £üÚí©	Æ®OœVZ»A‡Éc≤ vØO0£°Ó°!≠ÀV/üt)åàÑ≤hF˜P◊Å¬˘≥w<≤‘‰’ŸO[∑¨ÅZ|óx£z¿ı¢Ø'±≥¯Á∞¥!…∏ﬁ≠ªU?~√nWã_”[ı¬W‡vï‡e∏3®µx˘wvÊ/ê±9C÷çj9NsÔöw≤`‘F/œl&Ñ¥ôÚÚ8];ﬁI∆;Ä–}Üôˇ¶0I¸bV\Â´'ºî§ hÑ „πæM`†âûæ‡◊-+W	U6&∫‰…€&∆ú∑ÇØÌ‚ó∫ãÆ4å®ß>´ûéØmÚ BµF$≥}2H˙YGÄçHêe%ÖªÇ5 ¿üÜÉN?óRÑy…·Ú˛˙rD3®”Ô◊Ç‚b,)cdƒƒΩÁ¢ gÖ˘ùì≤^˚vG^]˙Ÿ—cu·“kuz‰ÏÆFèX†{ºx{‰ÖÒ;TmäÔNÄòÎQ¨ò£∞öú}ÓiœO?íÎï1◊öVM≤óŸÁëÿÊ≠˚7ÃŒÄÁÅpxB3rlÎs˝tú 4Í@:˚∫W(¯Wå:Îßvº¨F#Äé+T°úˇd±√◊ëBk6á†ÙΩﬁbáÓ8KùGpêΩ<Ü ˚ t◊OU‘◊#œvÁP˘B¶+üNÕãùA/§Å∑˘‡˘àﬁï
:çíh?F≥î–[@élEv•÷jè¢{VU«LTœ8ƒßY∏&ÿ†ÂˆáÌ™6GeõèR∫a√FWV*ç¯H¬óƒQ∏"y'Sµk¢›˙`u~j¯i˜Oıp7ƒ¨H7Ñ™∫	6ZZéµy÷¬}o:Æb¡™Xô†.‡Ä>ΩÀ≥» ¬ÂÅÀbìûx≈°,‘í,öò˘áÇ~i-”Û√ù©?L>"ìÁˇÍú∂5±[˛JkòL(GOd,¯'≥U‡πË…ΩØÕÓ0[@È%ù
˛kÌ∏ûzùç◊ïgŸ˛´zƒVÙ"Pı¿…„OÌ˚ıw-ÎÜæÔà‡ìﬁx}N≤ëat⁄·rÊ¯«ÿ˘u„dú˙ÃX9OFIo&Ãl¥3∞ÛîÜøŸÿπ‘ûπ\˚©çúP˝Z|ﬁÁC*m8 AÂ}#|n…Ù‚µ≈ﬂq#Ñqù÷◊ÚÕ2äqi[ÆP¡∆V…ôu‹tg9#BQ9{Ù,H∂Ç‘©§@ÎHfFÙ¡˙EÚ5‘Êı“É1˝¯Ô4Ù≠ŸáÅ[3[p,ı´RŒÁ‘±†
≈˘ÂÄ"∆‘D“•j‹¨ºOµuÊ°â¢˛ùvl≈&.Ioâˇ5∆xâ,GŸ‡È¢{'oÙÁÈ9Fì˙ı©kΩe2sú€8çFÙ†ºl]÷8ãÈS¢˙˛kupﬁÖÃ†lD5ıæ®‘•·ui˝{∂òB*®A°´	<]%Py/eZ1ûÁ*¶û"®≥ÌJå®ƒFsÍ^Tr3≥j•¶<¶0∫ëè1{à+V¨q¡z√B`P¥d$ÓﬂªÛöd(yï°(+04l‡b∂8‹mÍèakÏ˝ÁK	DÜ÷M¿JÙª∆Õj}5gÖˆˇÿRõkÑXEO«Œl!ûY'MQÎ:c‰fjúmÙaÎ¢l√∫‚!\©VÚyC2ﬁ•Ã5åSJ≈6Ü©≠÷j„ﬂ,hÙúﬁKØÖ∫H$…œ	‰◊ƒ{!tzˆ9Z˛˙ÀˇÙs±ŸÌä˚9Ts∫ùJ‘™tÔoúî£-˜ï)ïnúÏ`HU2û]$ækë-*G 6b•§˛lk•Ø	÷ñÌ¨Ç6
Á;i$TEºaMAHÍŒ { ûÈÓÉãÁÖ«ƒ¸À∫Îs—Õç´AÛO˘èPèK˝·≈ı+=î?èìgë∆uπf◊ÕƒÀÇ«∏•ÇW≈j0	ö˚¸†mB)õàïîÑÃO8Ûµ.B¸EÊ.	ö¸A◊}©¥îqê£êÖ)#‹¶9†±>¿¨Á˙‹2ö≤§C(hµW#;åî$j˝‘÷—Ee*§:(‰}´1ßÿæ2n⁄π®Ê#(ˇlCdK⁄˘Åq[ãå>q:…†ìíœäãNbcè‡Äò_
](ö◊ñ« JgÑ
†N‰ÉH„r"Œr.ˆ˘≥ﬂ´⁄‹(s˙!“DÜ¿∂Ö&Ω|˜êª}K¿“ê≤gÑ…ªeÀﬂFÄ4Ó’†1Ú¬[∏ö¶5n_‹ “^∑ ÄwéXn‚ÏCÔC`àì©∆7$Ö¿|`ÕOË£û¬qmaÃÅb}√ka¡∫óÏC#ìÚ`⁄à~¬6A#∫‡Q3∆ÅYŒ…Ê]P2êÊÀˇ¯Ú'ﬂ{˘‚ß/Ú_æ¯ü/_¸hﬁ”*0X:èÅÚAƒ—Ö∏,Jqu„OGÎsiÎ∞%.∑€œóW⁄Ì~_‹ÓÂEq{5»ä#t/-ƒ'ŸòSfà]
∫°nÂŸ’y#∑UÚ»¶Ú¿ñ±:ú3jÓﬂLÒŸ¯Ä≠LéAÍüÇbí¡ókƒ=≠íR X∫µ|2F≈%üy.B#VË—x–n”µ’aFI√ÔvVÏÎÖbs î¡.…zBœ_æ¯g˙ÔO_æ¯ÎY¿?ú¿·|lîÎß+! ∞¿˜&€≠®Ä:. ÔtîxåÒ4Z}∏ –o6ù√2LL}(Vqe~#·òÚ∫}ëûÙÊﬂ0≠√eøOÿ'áái ÌG{f)
Œ˛©q:"úî1©=¸≈/_˛‰ﬂ#rÒ%˝¯sˇ\Tú≠xUıÉü‡’ˇ£pÎkS8b˛´.F¨ C2_h“ÌrEt3B"bˆ.;z±˚Á∆∫∑ˇb«fb0Ä%rÇú*.rC©‰Ã?ô´Åc∫Àl¸µœhÔµπ”‘ã∂`FëØò".5∂Ø∂BpcQQã*C'æ◊Ø˛‚oÒli†‘9/T-lÅ√°ˇ√Cê†∞ïOzî<RöV3˛u?‹îˇ€Ë∏ës|VAKÅ—Úí˝ZêeÅ/M’√ôL∫k[[jFYCÁ‹äE.∫\ß@†Â›⁄rÖmlÏ>ÓbÄ!â™›vAÄzäŸ
l≈™›ÔôJ=[p1—ä≥,≈|∫®≈E»U$ÅÏ˛7wÍip˝7aÚÒfï¡·ôÊâﬂÌ å£MÔª«*àßx∑üèˆ≥),Ü:°ıyç~#ôå˙åE†»ø8[πQFU˙ı!.)Ö˘!ﬁ∫ñ¥94„tùÂ¬ÿY[Y’ÇÍäRSE’ôôös_ù-∑Vk^…≤O∞ö6ﬁ⁄ÓuVõz]‡;Dx©_}ˇóııSÓt√Xn¸V78®0õ˜#íﬁˇ˛Âã‚Âãøy˘‚ü^æ¯Ñ˛)ÃÕp?ù€gjÂ\‚Ù æ{=d`ëã–z‹'éŒ»U=øzéá£¨+?xµ\¿ôã∫¥ƒ °ZËmüKË‚.∆tE¶	ê9+qé]I∏˚≠Õ1¥)⁄Ê,/≠∂ÖË!	>°ÇÇVË8™∑8®“ªJ=0”ROÑR«xzR'ÉìX•&ñ>g1÷5® V~j5((˛˘ ≤Â’Ë¿_…Ìa¸àü„)tw´œtxËa±òÌQ¯bÔ´>ó…ÛﬂùKÁ›€r.•£ÁLÁR9áû˚\Æ\˙›π|Œ%eR ŒËOê9B~Ëﬂœz8Ÿ@ ÿπ0ù≤!!¯*=ãkÿÎûæJ`â†Ñúµoºps7ÚÁsÿ…Ù⁄ø´’p˜ª≠[cnJ?gm|w<“≠·˜LÕdi'Â÷Ùs¶∆7F∞ërŒ¯s¶∆{˘Äõ¬è™ÜÄî	fœè &ƒÓbÓ°ì@ ƒê{˘·a‡R≥Æ¯z˛(gJ´˛*¬l_o˙8w!√ 8éÄl˙Åy?U¯Ù‡\(,†ïl-éF–Ω)0·Û%’∂FØïôÖY≈0ΩÈºÁQL€l'˘‰,≤RˆÔ!oıË’H^ß
EP:·Ê≥$§M9f¡ˇÇÆ¨ø|˘ìˇ ò§_¯ÁÔ^æ¯ŸÀˇÉ^¸7êâ£b,cï§»≤œé4∏îb £<BK_I‰<+µŒbg ßŸ§i}¸?˚;˙ç˛¥)œ∂kΩÆSπ™æ
ô4Î$ ï™e;Ö⁄ç√–4¿Iú—ÙXbûiß1∏◊Âµ¢ÙaÅcﬂ™¢XÒiéÿÂÿG⁄ÍRÜª5∞@Ëƒ;E>ÑaVyÈAXX	£'õ“J‹H¶«πAÍqé 5tìì}ë∆åEÕKñ24\ùp™NÃÎëäy-5BëSVÓ^Ycµºz…Õpf·x(¿ëÇè›‘ )ÜWí¸Eüæ"ûÿ'°¶1øZÆ5≤£·Õï∆¬
(Òjæ!2{»3¢Cµ—B„bhü^˙ÛxÛ®˚%cjî1ÓÜ7k∫9G¸8«–‹Â@"˛§ß\á…·ÚÜNK”n’Äk·U†ÄhAEhN∂Â‰à.‹∞ú◊®Ç~œØu«YÅ˛2xæm√î±E^§UÓ6^Té|¿ÑFdÊË5xô°∏⁄UªJ‰CF2+#ùÇ^#x+t0Ç`n0m]Ñ9eöß[YúaHiôWnp"Œ¯Œú-
d.ïî≥ ›ìOM#ˇ—£ÅŸ/%O≤æd%PÇ˛=ﬁh>zlv†åÎ—òr¡\,põo®à^ÔH+∏∫Â∑2Ä®9:öI$ñé)pÛææŸyyÌF⁄ÎŸßGeÊP∫§CCí€MFO◊JÓãtûÜ}Á∏];ZÒy›ûÀÎ2éw˙]mÀ wÚCJ„ˆ›I6¬£y¥bÙÔ)‘n	e®‰rtóÁ6v≥√Å¿x9lá~lm3 Jóì¶EÀ
q|ÌN6x
◊ÁñÊ\vÆ^:Ω |s2>"hoÃ√q™ÂXs:ºRÂÚ)W!'r∂8-#ÁÓE“(…5ÿ'§Êg‡NWÑ`ŒQÖ¿â∞â	Ï|hcqê¬ÙÈîNÊ-¸£∑Õ∆R2Ãñ¨UøŒπh◊‚€t^±gQ¥∆GÄFiA±Ô·ﬂV˛M£◊≈	,–ô´ŸêiaëGß≠2e{2ˆ‰◊ñæS‰És¬©â4ŒÆ˜M$‰õk·
léF…I++Ë_™7Ôõ‰∏(ÉÎπÊ1ÿæhy?m6Ñ≠hÈ.PzŒn†Áä≈\¬&òL.@¡˙È¯(Ô˚‡˛Ó^0)Ä\OƒúiCµàôoúç‘^ƒpDˇ˝º{≤&~˜˛ΩVAπÖÅèí(ÛÀtÏµ=õÁeè€»EOö<c÷J†;mc>∑pjËõ™õO÷∞c›ú©∆Å(≥T…‡%àÑ1ÁÎ:QB˘‘4Z,†”@ªÃ€i%"ÎÙ“d§[©ŒÃ¨U‚ë:ßèÕl}è8r˘›t0ŸÈ]⁄4
yÁÜ5)îôkl;•0¨pﬁ1{°ë¶¬»πó≤QøŸêu«GYa!ﬁÎ»„†ç"Îb¢D…€7Ô‹‹ªŸ0˜%Dﬁq¥:od=XƒÊ õB1`"ói1WÀ√ié"n>1^BsXDY–ÿëÕEiå%J(◊î^¥‚ÅLwê˜z˘1&„0VTq;∞®2Ö1-•Ó"áì©≥MÍp2¸öÙ;Æ∑-6e†õ‘0–L“[¥áü”bB÷bÈΩSªø≥ÎFN@˛ÔùJÃpˆy8√(rMà˝çÑp°ÃúÆ),z≤†˘„πÍì!,¬`◊ÀÛ©w∆œ∑Vì◊˙P≤Z˝Ó¸¯êX.ÕfùÀ\⁄LÛ‚ßVLÜ
3N ÌpKæ≤¿·b iXbç“U≥'Ã.+∂pZx◊∫í—Ú˙…%eπ%?˝°ÕØ"ªzYÿL†a›)ıM˛ lé’ë›,©,≤ç ¨ÏíµSV¿o⁄†"Ìg5∏ﬁ1ÃÇhÔ!éºMèÏ†›ß6÷Í'C>®.∂[ZªËxÜ¢OpˆQb§)œ4∆Ô. 'p<0XˆÌ›Ωù{b2@.—Ë∆@¿pÏO£õ'ÿMÉ<áIbi„{íj¸ë∞KZ¿Ù÷∞èÜ«’8Bé^L\pä…ƒ√ å¯≤õZQ∞iï“mKyÉ'k®LkÄ‚í≠oÚÉm\á~xn˚?_üjíÊ1XnGl»ÙÈ+«_«–∞9ªlâuÜ°4¥DïXdH…i1jΩXÀﬁÈr◊ Ú©`ñú˙Ákn„‘†yÿÀPL∆.ˆ'YOfö‘¿Ì‰∏©áäèØ∞ c8tw‡tDz©}Ò“Ô1ùôf#º’`1,&ÛG'Qù*êáêô¡ƒ£≤ƒñPu4øæB†‘©m>Rã‹Å*].òÀí∏ı›|î~îè≤/06aØ>8Vô∞„ﬂi|Â"qBõ©≠ï»axë0˛2∞)v+`’y÷W√ÜÈo©’˛b—≥wÊ}pëûﬁÖÍîÜ5`…‰˜õa(96Bà·ù¥Ãñ©-/‘Q‡Ã¬Iv j5PCGﬂH_|nïª\q. ﬁä˙7√AÚÂ•Õ-/Úf⁄dEKa”!°VâÆ’"<M∂ƒ»⁄´œÈ•viM_#Ö©˛D{3˚˙∞DΩ≈⁄,»∑ËøÑÆ k∏<›wfBﬁÿ˛Êß[k pîçãYﬂÕûì÷d•∫}múÔ≈~õ)/¿Â  \v„¬"±“˝=è¿jAÒZæíÛv©Æ4Q[â£›j∞ò™&^û€`ﬁµTüìláŒAWd¡èI7Ãöc˛j67ª ı™
@©ôâ&]2±ﬁ|(µ¯oGΩ<Fj'S1µVÙ>∞ó‘^r∏x#)‡ó)1Rj£Aê!ü¬éáÇ“iG‘›2ÇŒ∫Œó»Àgl‹h%îòH”ÂP¶¡õ]bgÍW#ıGÃî#‚∂àÊãúk»Û&â:œÑT≥Æ ◊OãÇÆ[Àm«ÇÍC PeW(π°qdLs+/ÂCËÎæ…√(%C$˘ $Ëÿ–≤KΩœ˜≤ßzÊ»ñË*≥ı9|ˆ>V⁄ü’¯T'Ô„,’◊Ë^gπmÊ]1øß¨™Ù,ıæ|‚Hœn8{∆Â≥˘MY‰}Uñ◊ˇnÚLVZvËœ gÛ≥≤»˚¨,è~vŒí:Bóî¶¯·†ıYÏÎ¿l„Ê OZv¢˙ZñD/`ôÇ¶Éa;És™¬÷ ﬁ¯çY"¨ø°Ï%„Üw{˘Ë›Âˆ˛ïóó˝—ªÌ’+ó/_yŒ“Z#˙∞èÔ•¸É<WÑò{'Hï∑`ú3Ày1ÎìraÏi;Ñ%˛—·ÿ˝∞êïé-)Ω°Eª•nf_∞êLTÉ√˝⁄µ:^fLüŸ∞ﬂÈ3~ßœ¯ù>£¢pf.öµÈé52¬ëghSAÕ<G?rπ ["¯Ì˚
jﬂ˝ü.h÷Òÿ∞‹Ôm—Òèó4Œ1ÿ¨8ò°v+“{o>K∆…(Œ`ZJH·µ9£î1æ}zûògÑ1àß‚◊˘ÃılÏhs‹lSZ∑∆«çz‰®¶&éÉÖáucæﬁ‡—Ú*“ZïwÃ·√Î%I˚ﬂ1G"	Ø%·rÏbúá™D:B`2º|¯`Êê øç 3ÉmÄ˚wvÊﬂßT˙ƒc(ËLæˆ≈ºØÅITÜü	*SB'=π0)∞‰⁄uÙºÏ #ı”u–˚RÖìv#È∞k»@DπíåÉß™cˇ*Í¢ëÀ1i®ë9>≥R‹.[fÅËlLjÆ6´π"∞rjÕ®E—w˛ó1•,Í÷Ê6¬¿_„≤évüu∫r◊c_?√Ωèπ&;m“„ŒõÔÕO∑ñˆr◊8:j¡,cÓ£n˘MéZ*Ø#Vüüe»˘¯ ÙMç˜>ˆ.}∫b¨Qv®.Âà;å}ôaeøéÈF/éèdÍÀb∑…πm©‹2ß2TA<G∆OÆ√¿©iónc%è&fòŸ›»?£qı®•l?ûŒÏ∏˜MÅ`Ú<' ˜îÅïL{•çib5Øt"/«Ø⁄àI»iBJ"–ÅÉ˛"nVædj™ëa†R±Oó§¯tâ• ô…Ö{’2óÀoúõ3u/w|É'kHpˇa3‚„‚Ï,N´ËØ-#6Yóà\AΩ3á∆ÇÎàÜíåóñÉÎd6®ì∞1O›ôvIµÂªl;6z-Ωuö…Î«qpy«qŸÈÉò≥;LGtûõ»˘±s*˙3|ø;Í‡oÈœ√?wìgÈ;Ë£´Ø¡y†îºWçvkÇMµØñÌ◊§°Ò≥<Î^’}AiáÜ—›Å‡„QOµ4ÍZé6èæ»Û>Yˇ+¯aZ7óMgôQ>&ƒFU ´z€¨`íÈÍ‰ÉU˝T<_ÌqˇïÈ;e€¨ÿ%áÄòúê‘£’ætEíÕ∫PkSLS´mıTÔ£¥–”®¸0n∂M‡Ò⁄G{wÔ–Ê T4¶ëu‹ˇÇw≤4†ì´+WTñ®El∂ÕRµV°°ñÜ„≤4|<6ì¯ä`‘ÎyuWàÉ˜¨õÔÊ0ìÌ¸xÄ6‚ Aº TJf˚‚èd—^>ë6˝∆|≠2C…Ú':=ÙA˝CË∫1∆Êi—@Â/˙Ô¶-YÚ®˝∏•Í≠aæP˛ÌwÛYÕn>3∫˘Ï™¶	^[ı≈E°Äµıúñ[ıaº8ë;‡õÜ”2›pÆ≈ì¶ñoﬁ
Ï˚÷-`	õ^≠U‘ÁñQæ∑≥|œ©*+WÙ„°„†dÉYy¯˝ˆàÜ:ò)i—#E∫™–·V“7ÊêÙYúÆ+‰Éì>©QV…î…ı†íùû%hlØYu(gÉD ÕWh8Ó&lvœo◊&Ωóôm◊≈%xè◊ñEB…`e.€˝d0HG™)}™u,{5æq’Æq§˙5?c†3~Ôe}®CﬁGœa>+Ü©>¡3‘,Yı1~éΩ›ÒIw¶Òn˚`˘Éï§q’©Ò)†=¯ü1‹k`ÛV∑x•i8Ô@âé+÷4WuI¨ÿ›`â’éh\⁄l*Z'æ%(_»Éùy®ª¸a€™]tí^⁄dÚâˇ5FEFÔ˜Ú[Æ+ı≤3"Ñ¶cÇÚÕëö≠Ÿ-£c&∫9å¥¸ú__ÉMŸ´”¬˘-“9 ÅKv©Ì —”b92®%æ-ö%^U_„N3˙LuP~«Í·ƒÎ¡ÿ	l«ÁÊ∑¿‚>[(◊k¡X
{€”∫$≤!ﬁb§J‡ÁTÙN≥AvÈ;√Ù∞ €˙pUwÃÏò√å)*^¢íb‘°ma:]"¥J[Ï˚Ç‘B5DΩR@Yı≥“¢4†Ç	 Ê;H∫ÙowBheÄrY‘U¶Fò$S˛+]t§‰Ë*÷KQœ±´+≈*”õ# ◊®¥®≥ák™ÜÎ]Ì_C

Ïõ·∏…T«îﬁ·‹uˇæÿÏ‚–≈Æûxpîès€%$ﬂÑDe-(K¡¬öº;Ÿôo[-√”ÈáÂ„∏óë≥65D__ucª¯¿ry6€Mt˙√[f‚Fåz˙˚*?lç∞”ø˛Úœ˛J Á√h5ZcN¯î¯È˙–1%kYKc)‡] èÌπ÷’JR˙¿‚Ø†˙‡hÒ≤…œª$3.W›≥nR•*!∂"¨‹r8Jˆ_ÖØE˚Ë
2„IDí!K4Á ΩñzTÚF]p™â,æUÇ5?Zı>k›IßCø"âƒ2O#U≠5FñC›äo;yfGëBÈ‚ïÃÏjYËnRë4OÛÉ7îså¥ `óyQ¶PR8ƒH>ÎßƒËW®È…˙›¿<ÙÛ Û®i˙ı¡j–ﬁ:≤ßÎß˛µùÓqM|^≤óÔùñ,ŒŸ§G£‡
ÊôgÅzx0œÊÂπÑg≈bûu”√˘œ}[Pòs*k¢±‹nˇ^  ﬂ›˜∂&(≤Bí‹W'wáCm*µÉûÖ{`ıbœfÌ+m·á'«ﬂò¶*%Àe&d2èÜs˜ÀÌHò£7‹œ[2å∑m:oæyËMLq[¡∫πÙã<yCŒ¡°∆aRÌ;aÑ/–Uå?õì”Ã Ûô€@˝‡Z$'¿‘8rZyNZFÃgèœZÊ¡dÅ≤‹ãERVB)==6Ø:Q∂∆ê^¨îyÑöY∞-∫≥èÿO≈x[âU}ºJAª[Ü^aÚ’ãÅF6VÔù≤LË=¥?^leﬁ°Y≤≠z60î€z06&4Çr6≠~ÚUÁã~ôWÇøl–º(°Ô€o?Ù}ª.Ù≈N∫w∂ï”ÇüÄñòı™Ã≥°¿îA‘Dpq<JÜuR «%>v‰•œ„gS||8∑°‘ÃtXê!êå]®LIU∫Ù,◊Ñ∆~◊Üø~⁄Õ&}'|5<Ü#ìo—"˚´œËı™Îsqıµ@{˘´\ù≈oÿÚ‹»aæ˝⁄+T/—H`ñı÷ó¢äà4%Â∏“ûø'.^n◊X¯ãØuŸWjÁ¨∑4≈&Ùˇ˝Ùç@Ì©y›\y•ÏﬁBás=æ°µïzÁ[¬F>+@WÖ-?ÍËò=Z°ñJ]IÑïπ≠=|5≠v~®∑?*Ps8HãF:≥ÑÜ≤◊yôŒûµŒ˛UœŸæ‘≠ö˙™û˙‘–‰ıÄ‘•åø,X_©Ωuî∫˚:0≤†[l≠*€ŸÕÌÙ¶‘€J:GÈ|Â≤Z Õ± ΩË/Ω„•Ìí≤\“∂J)jA^j·ø¯˙ìt@Õa|€•Öêï“BÏw°4Wöî¡Û∏íŸ˘u≥Ω!¯— ÷ã√˛¬À á√*‚{rDhÿvLΩT⁄0ı¨V◊ÿNjC∂∆z‘˙Ä.O¨N:Pˇ
©£-˘Ç™áô˝íIz“Ÿà¸Swˆƒn~0>∆Ÿ∞√i/bˆó$ŸE„–¥'6áC}ãÒv;‚AÔà‚›¢S´í1∂åß)«©C{—@o´ß¿H≠∞`ˆäÌg95øëÂÅÜ÷oíˆì¨Gçn‚Ø@3™·7<N˜·ÄÒ} øçe-ø9ÏU
¯Ù„˝V˘Ë∆®Ìw5>Œ∆ptUO{˙1–QY◊Ô'Éˇ&á£§Øz⁄1
}ôı˝ﬁÜG ø≥M˛
¥ßF√w(∞ƒÉQˆ,ÈúPNú¥M=÷xœó_8 ∫È˝ïè‘S‡K∫&~Õ≥∆√∑õ›Ó(-
›ì|éÙ%ﬂF{ª©ÅÍ#ıÈÈ¶Æ`?∑e¥Ôè¯w§xc˜¿y'ó±8x%ÀûcÆÒy&ÂÌçE?S∆&#ÑI0ëå◊™¿˜‹UOÅˆT”Ô‡pXlÂ¿æ∏o´'/ûä^2VÅcØäﬁ‡P=à3zVb’~Iá^-Õ:”1¡™UTˆùny––”X,$âÍ<m…á–¢…W˛ºróS]l™ß–é©wÅ=É7Ω¸píÍ°aj†_WÙ¶˜sÀ,©ÍÔ^ê“°çö≤°Ω√øcÎ
ÄÕöJÒ ëcÿAæã£¸XΩ‹ÂTt~yµôÆ¥WmvPãÀ”º∞∫≤ß7Hè˝>Ó9ÖÌeÃ„¿8/*˙…
Z:X]l!!⁄,™^µÆ{¿pZä’ÁÄ¿˚P}bÃxﬂπ∆À™ÓWÍB·πzygF+jÑÙ0{'+ WW…¡…zäi˚∫59ÕöU∞c≤*∞aA÷Kæ&⁄a≤d…XEô)YÕ`û*&YΩ‰ê™∏"YŸdÇ™ŸÄçã#´H™•¥jÁÅíÜâ™¨†…hÑt™-S¥Æíˆ©èJJ'Ljä‹TêüÑ59©¶0ncr1"õh˛ØöÁ3j€ªÂÎå&ƒF∏7£6úî*.MÌ°Oïö^•¡i⁄ÛwÈâÛ:D* *Æ≥€äÙ/UDy5·’ëÂ]7ó‡…pÕF‹w+Æ:à·E*X)ëê≈˚P}¢˘Ú≈ﬂr¬>AI˘˛	≥ıΩ¯π ‰˜WP˙7Í·/Â¶Öá?y˘‚˚Û ˘õÆ
gzòëQ*g k‚Rl¿jt}¥j‹OEB1∞·˜%ÅÅ â£ë[/ûwî1 D˜´óÎ—!ró€^v…˘SÙ9‹=ÆﬁO˛◊ˇ˚˝Ë√Ûﬂ”ãøÖá_™&?¶‚_æ|Òœ/_¸ æÊÔ(ljÒæÕÉ»»yIŒ∞Ÿ :¥§£xâ
>Z≠VCŸBõπ¸L—æ˜èj5tˆB'Àçf˘|N¢wYh9`*òb“È "ÒS	»Õ∆Øø¸·üïª¬yÇ∫BæF˚èìbs_$…P$C@bÉ‰$-èóÂ3zöåDë<¨îdÉ&kò;C≠£ôè§ôäIj‡í⁄x≠L d«oÁÕìKÇéôüf„#Ï
6ÛT¿ñ≥ÜO-∆ö∑=Íù]5zïVÓÅnMk˘K¶ÆpwèOn0˝"®π$ vcur@O5ÆäΩêi"å§R≥:‘ﬂÎ-ûÜæxìæ=QbÍ˜Œ%oÏùòÏ©sÕù)”WNz1øº.	ƒw≤g©íàwƒt=@8>H>j¶yOVè`≤€e¡^‡pá˘è…˛	£Å}4‘KG≠ÈX«ì€g@=ø˛Úø˛G°;8Wq˚¡ÆV∞òH(8EÚAí'O]p…Òj∑'©ó‡:j;Õ1m-4sO∫ÈU∑ˆ‡0T®êS›b	Ig≤@çd°¯£œi≤®XyÔÍ∂∆˘-ÙÍh^öñ·ÍX†|phñÓÚ»øŒkû÷¬Ù^´áÊmæ÷≈*°ùt±äáia˚Ù¶i†íà‡ÇêÏá$∂(ﬁg•B>’	´8gå∑{ ìµ@˙ÿ†cÌ°CÀÙåÌ‹=Ï¶…§7æCø“n≠^π¯A¨m˜∂Æ\^πRµπkFØ¨3∫àlzcg–ÕÒ—dﬂ€´Ø}/’bBàwÂdÑÒÖ:€v*∆Y?Õ'∞<∂€mÿé⁄qîmvÄH:'–êÑƒ÷1N•ŸêZ)”µñã»ë÷◊+x˛ûÚy]h+;|.Æ∑µ_’(À‹Ly# ≥&]Eq$©†i‡D|ñÆ†xØÎÁ”3Â>Y† 5)îW~tS¯⁄è=>T¥#%í3¸g≥Pni4!óÏòÎª©ı>ﬂÙ.ÂÂôWX¢Î‘Î_„-S1¶óY v_Ÿb´ÖuÅ‘YFö¿a˜†OÕ≈8|B…©AÜ|ñÙÄ©∞}ã∆—2è…!îüµ·Ë<±M˘yÀÂcπ·™BÕU›f≠E¿:∆R;}Ú–ˆp–!·F˛,uîí©êsßI¬èTK8fÆ;˛öì∫1û≤ëÛ,™Yï‹∞OûxU¯Éj2Ò•M(Âd‘≥Y{W§k]çT"¬A{àJT´öãÖTπ‘é4•IÇπÊ=ñæp¸%Å¿M3ﬁ' ‚»Úõ@U 5Ú»ôıß7}  ›ÏrÊﬁùÏ˜âÎvè-BØÀ!m°©îm3È‘AT∂`%´ﬂ§Zçôöçn⁄œü4Ê„∞Ù	Ãß?iƒT  ˇgq R…(=Ãäq:Ç5π19AÕ	j.v”^w≈´â˝IëP?'£-≈º©.–°êcCqæî∫™µ41ë}Hçs¡säöK"qR_.¡TÂdËDú>Ã%áìj%
~≠‘πøˇæí¢]‡§hÉjIB∏ñìrNî]Y:å\ªïü`Ì(˛´ˇÂø¸‚¿ˇÀ˙Tlqˇ!t[
fÚ≤O	c˝8ÃÛ√^z7Ï–^Í¨eW◊≈ÁG„Ò∞X[ZÍC≠7 ©ßøt˝ªÎ0"’ Â•≥´`pxˆπÏfM4˝ªR≥,¨û…¥¶ÉNﬁM?~∏≥ï˜/"T©ûø-‡dc(LÍ_?ï_—√¡5÷Jì√Cm¬⁄ö0 N·r≤RªÆ‰si`#–XF˛d#u^§aã¢uÜ°äÎ“‡D¡åi:"Àÿ D>(õ58¥!P \Öµr1ÙÄ’~≠	Ô¬B◊1°DwÆÓ‹’∑ızπ4Âm∏[f°¥01
6Ì©îˆF¡ÌÇm>œ¨ù4tO∂*~»]^ê£]S€n_´ò7-äÎ„^…Œé∫.Ló<âHCh®~≠zòÚŸI2LFO«ÛHû»Æà|qÙƒ5k≤g
ü“™µF∫W¸¶{u‘¥güõåM…÷|lr5ÁN?L:-wC2ñ49Ã9,Qôóõ9D€Ã˙8 O/ÀjÜÏÿÕP=©ÚΩäÔó¬uP%›∞zw(£«A˘*◊È#¿93}îœôÊª ’¨¯˙yæÌ|9®TU‰,¨Mù-PJΩòò:P eŒ«Ê`WDBâDÀ¥¸O˚]ÃA\∆AÈ áã3L¡åbE€¥"X√Më;ƒö6B´œûD)_•:vßm·^#∆IÃÆ⁄u”%˜0+ªWy÷Çu@‘dÉÄΩuÈì∞Í≈eÒ¬™∏Ÿ
T8~åo,≥e+u`Ó”.◊ñ¢)ÇúxíÇî%>?9suÉ®ê{¥∂Ë /’€OFã„£Ãé¥É—pïMl"öÒà]‡à:®ÿéÒÌ˚b\dèQ;âÉ±ºë’8Uµ√ŒR‘~È"Ó.%¡Ω÷KˆS+Ôˆ›R„îW8<:¡Œ´»<õùLwÃÀ∏D–xÈ¸S∫ ˇ'¯w≠zl ågeû+?•F ÷Gc•QD<€óh≈¶d®@ÿÿ9 6E:2«Zh8'6Ò∑ÿO∫áxÙLí#5y®˜Òc√üFlª°€(“c6~≤lº«ˇíÂÁ∑¿˜·\MîJ◊)ÚOëYªV˝¸^´˚∆ÜP˘Ó¢¢≤ÿÒıé‰gtSäôÖÎƒ≈R¥√É{ì%Qò!4ﬂ= “^7ÊcÕ·≤ôK#ñ[Á◊_˛óˇ">!¶Z‹e+K‚nBJd_Bsâg1®:Â.öiG ƒm÷$ÆÑ6€°ﬂh0ë†ën0öS0ºx˛÷x˙3Ã6ê#úƒÖu'˛≈â*/U@Ç$≠¡ip`Æ‡ª	‚_»ù¥ó6K–p»˘©iÒœpË]ÒŒõÖ€Â·5®x“ÎMg:e/ó÷á“D‚_â¬‘ÏBÆ°¸gd5º¨‡êŸT≈«©We&≤xok¢ÇÕ•˙≥ù	Îë]+®¶(¡1w5Çfn»,Ú+6íA‚à˛;±0ÅΩÁÿ°1{˝úhÎ?aeCØüæ¸…˜Ê´r°ƒ3BΩô–Mì^:˙Ö9πi‡o˙Ñ˙'¿|˚v3n‰+üÉ]Toº‚ÿ¶u«W Ô/_¸ ˇ≠Çzä6"‰¯
˘∆ßA?Áﬁ√~˘ÓÌÑ¸2o[Éˇ∑Ù #¸ˇ%Gˇà˛˚7LﬁÆÉ Ûõˇ¶5Ωiá`î1Høz;è Ôı`˛£|8Ñ∞ïå∆Øz‰∫„¯s•``ªıù˛√"á=πPtR—`Ã+`≠N"õ—D=!£°IÜHaqO»À÷ª7!3ﬂj^Ûû¡tt≤6<„@v¬◊§
»JzöK§˚Ñ_xø†ÁÃ.∞/3	r.¯˙–√ﬂês¡ˇ¶]~NµU‡·ﬂësÇ|¯Gπµà›˛9[7·wDã[¨`å 
Ê Fz∏!–ó—˜‘≠lËî1¯RâµÎüz/‘zí¡˛§£ıπ¥uÿÁt\[¿æı°ÄºˇZ≠Vh>~º Ÿ“FëâôfP+¢*Ç±—Hå<SnBä&»E¶®∂™+‚Mﬂ‚≤˘†+î˙$o!Xg™Œa}SLçCÈπΩ@EJ≠ S/hs≤9F‡õ€–ûUøx˘ìÔ”y˚?∞gœO˛-üπó/æ’¬‚YwDøˆsQ&¿¯”√€SÁ DÎä™cs5“(Ãjú2Å·ﬂW˘*$õ -Æ6V“Î∫0⁄è˝Ãát¨6rcqQHe˘Œ†‰0¯Ãu:ãã◊ñ∏v∏´”òªÚ+©¥Á+så€£?'Fú€8g√Íıà∞∏ßõwÓ<Ÿπ∑˝ÒÓﬁ√ùõª≠~2lfhTºQ9M /û¶'ÎßPñÚL≠[?˝¸=.ÏLo\ƒ≥œi´ı ∞V1ŸóÙ*:Ä„Äí™qòKN#Å˙4I˝ë>ΩQ˛¨^#Zß»B!9Wè¨p§•∑”*,ƒVﬁ^™ìŒm∏%¿∫P™–™¡Ü§sQìYÜ“CóZï¯XF©TÑ≤2™ˇ%qNˇ˛¯ÂãøÉ˛‚ÂO˛˛˘ø√Ï”í∫ÑCŒÏgí#r@\Ùü,03ˆKn˝«§S¸?®[<Ù˝Ô/_¸ø‘¥¸Ÿø¸S"3PÂKx˛!‘d'Sˆ8˝±@wS˙êŸ/3Üu8El˙Á¯‚'/ºUw@•F|n‰ŸÔ‹ﬂ⁄‹€πOÏﬁ‹€€πw[|∫≥˜ë∏≥Û…MÚ*⁄æπwskÔ˛C—ºˇ ´mﬁ;˜ƒÕm¿ﬁøµsÁ¶À°Ã1$r∆¸Ìﬁµ4Ô∏h\¥xó√
µ/],oÇWº3€P‘êfëñ„*Ω±“◊¶òAhÇ‚ƒXˆ”‚á6m¬Ñ4lòŸºO«9ÈEÑ¿†ºåu‘ÜTÈA¥$ÊAÈ¢ÆnV†Lÿ¸Ó;NU‰ù(ô}wbdÅù0/aÏòøùƒÇ3n∞(µî$+Æj≈÷òî*=ªµ`7ü¿¶N…/KSOêÄÜÑ–¬a¨î“∑Œ2:^†.πöqﬁVq˜ƒ˜˙lS»óÉ cÁ];Ü%ÄêÂ∆I›Íe¡&éπÚ{4œCPRé≥∑‡–k%√wÇúu@¸EˇBWÙ5µdﬂõY¯ôØQnpÔÁÁÕ}péf†¯äÄÖú:ø
h—V·5A¶Ù6='‹–õ 'π&˝‡πÈ.‰ÓxîÇ¸" au]e>çHIÄíé¡,ﬂ.0)_ËÈ†$öî¸ûø7ﬂ<x™ôí‹·úç§B˙œ=•œ≤Ù8¿;_®£í÷‡∆ •¨k˘≥7(≈,Á<üW.çvÛ…-Æ\27ö>ny÷√ë◊‡ßPŒıXÑS†+h⁄á	—(…ô™vff5ì1 ∆#ôÔí2w-RÎ _1≤™Ã8¢Ì’ıÂ‹∆Ωú˝v§πÚ·≥ÂûX9oq‡S”¬xa
[2–uL0›y⁄¨N£ëÌSº|ƒT*lH©LõMÊ[≥€∆OâJÕ§Få˙Xt;I*”≥B«ø ÈﬁJ–é#rÛFQøÂy&`Ú(MËÍ,DÇ»ú˜O≤∑kî–œ€)?y_ßì“9ÔÌ∑ºnåiÒˆjî!Í¡˘‚“tT» $.î1ë¶®¬˚}QÙOº+<?9¶ﬂ~Õ© FàÀ(h-_≤Õ>54çJk§êè!ıûF=}’Î!^G¶dE®õ¿”ΩÃÈw´≈À”“ÔÆ±Íz≥Ú&øî™r>“Z›J˙YÔdMÃ5nc÷vÒI∂üËY∫ù:(ÃÓvFŸpÃAÕ
ÿ∑9qv∂qäJWÿÌ£d¥9n∂'Ó¿ã∆«a)7ÑÅß%e‘(RXPJÄ6ÔÊ"„LU∫l'zê≈!ÌQÖY⁄#Ãœ<õÏN9xì\E#€hVÿ:Ü—⁄Ø®RáÊ≥ì–x–KNíl$∂≥ò‘ì |ò¿`nÅö~*Sy"€ÈÂXÒW¯T≈∂u"›¢ª]√Éë†ÿ˙zHw‘Vπ1ñ:1¬bZ°ïoIÑ"˜«d?3’ï4’¶∫Hsâ‚ Ë,C3 ÃWKy˝Ö˛
HØ®Ì5ä^] ®È
Â≥Á!€ØÎ¢ÒÜØ#·ó¬?|ãTéï"æ’8ã0÷“∞Ë‹FÛÆ
&A>UL˜4ˇ®¨ø√&Oa°®FÇÇˆ(˝Ó$É9≈R˙Ñ49æ‡]KÅc ‹±efQúbÌ≈Ô”RÛuåñ –"T£ñ6=Í√Â=–_*nﬁ‚%ˆ9üú>ç•ï∫`ØîwÉ~Ìv1ﬁ	Ìº‹GL¢b3ÕX·^5æöûªΩª'd$ì%AIƒ^Ú\Ïlªà2†`âW∑ñ`˛ÃÕµ˚ÍJÜ S}#Àa2õ˚∞qj∆≥>“»VÖN~4n.≤Ï˚Y^„Ù`ÿıiáÁ\˝ \‚5≠≤Fië}!kaﬁ·sˇΩ&6LÛ!ºMhiÔ@›ÚPvÀ`˚vQ “¬h ∆DkGyw“sµN¬L'ˆSëπ|z≤ÁZ7AÁˆ‡uïcù‹9u´Ω∏jïæ‘R¨rúˆs©U9¢>'u©©T}õ¿zVùÍÎ€{éUø≥}Æ}ß AÒùß◊µvû#ËükÁ9Eƒl˙ÙoÚ÷{5IwƒñŸç
pÆCèGaÿíi:ﬁÿ-†IUÛP%©s¯÷B˜Ò£úï∫{˙ﬁ ¬âæ‡ƒ[àÕ@ˆÆ©T.!ªêıÎ;0œ7oFÃ≥ö0gf†˘F√]ïÖ∞v*ûZ+
Ñá‹“Ñ˛∑ãß',G°Mfä õz˚Fa≠¶W‘åÏEﬂhHìªS–‰Bi8cÕ–€iCºô®µ2èeÿ ˜o‹ÃHç5Œ Äıç9µMµaNØVâ›XeÙJ∂6eÅ≠ú¿;Bï˛T∆|±†ÓR‘∑"∆‘y,ã•AËß-KŸ·ÉvüSÔÑ-ÇŸ
TiYΩï^b˚ÚF≥¯/ÿ1äüˇÅLﬁ_(«—øMÃÔGˆ è®R˝≠Yˆ/°™‰mßoÿÔ≠ á°ù¡Û¥Ä'Úc'çëGaá“Nvêu02Â8ÈåI]°ÛOptNêGy_¶RöÏ„-‘1ZÁJ‡^s&3úbÕ™Å",Ä÷0!ü”…π‰≤QEƒ^ @≥@˜“Âê˚j›xQ3˚≈B◊¨êâ¯6S{KCB¥ ¿ªõÔ≥⁄⁄TË¯èÖKöBB:_ ZA2B/—]«∆≠IE ¸|öÑ»æÇN:Å.w’ãÌÊ;l:ón˛ »Z“€ﬂÅjTCé¨1)N√Œ˜K+zŸ¸5 Ïf‘˙3≤ûËÔÄˆ¥YØd≥A7;Ãm®Uö“Ø>oF©1Ët‘©øÉÕolF„H:  1Ö,-Ø>ø6“ªœ ßò
˜≠ÜRª∞ñaªNﬁ˘>⁄rNFË?µõé—è§6'I˝7WjõÍ˙…}•?HO¢ÇüuJ¬Áx#¥cÕX €ˇAÓƒ?ì…ÑcÓ°qÉ∂»MZ,(ñ+î@”ˆ‡Î¯£⁄=jæd˘ÄñevD	«rf˚µ”¬6^≈o%ÉN⁄£;wÁhÃ+ÿﬁ©Ò1◊|6z%Üëê¥ïŒ∏ﬁa
fµlœ˝Ÿ7!Q·ˇdÿ_Æ:€/I{OAÓO0ÀY2'…ößò#8¡B√§@yêú$f∂‡±ì(ÿçãíÚ’ â◊˘ú¡*cóÌÁ¯O&O-#"Î•ißˆÖô§:p®ÁCâÈY„˛@±∏–±∏P¯Gg_CÎÃ„º±ÆvMÃ©ùöã∫Pæ≥ÅÙÕ±&w⁄PÚÁë•/‰a+7%‡—ÆËiD:˘∫bFU+Ö5Â√—‚ïÿc¡Â*b ÷âÇXÖˆH¶‚{o]µŸΩÙ<B&2../≠àE2ôßÖ<°„H^≤	ÇÉ±å7⁄⁄µö._x—¥-¬µõ'È˝ÉÉ*O£5™TQ#Ë•*ÄeàxáÈïüœÖ_5ç –WãGÖ∏óó»Û[ë5ã¢ƒØÀπÈ‹Îc8/s˝y∞€] ¥ó˙¡$ ÌÄ©ˇ}µºÁ¿g3†≤»Yx´@wK&Ë˛&Ä∞L&~^Bh}.P~ò—3S∏Ω%¥˘ÎÑÊ(fèRÒi\SoÈ J˚®∂-¥Cf™ù±˛TUÌHá«
ì≠äπHáÛ·›´å\;“q®ß:†œ‘0>¯‹3ˇZ◊¢Ô°&*®èπí(kR‘ÙpS[°¨Ω1!úç?8¯¨åÇV¸Ç‚`RB",˙üt#¸Ç"ê…XiﬂüèπI∆9ê åÜ<?kâñ·ÄpD∫	"„wí}$nG)ê9íY¥‘¬‚~“MzÜ®ÿÚÓDP≥PQXUfg∑˘›e˙EqÉ"qd∫VGèﬁÏ@$=Lb~"ûQÂ‘S†ù™<≈≈'≤∆tSX8"á£§õa*»qæ8¢[p•>>πº‡Â,_c≤£Kjëu=YZ'0õã©CR;ü#yVMù[8¢ZTÔåßmu∫Ìfe»Ì®¬¿qMÁ:~é∏XF8Ö∞y˛h¨÷¨o≠ÒamÖé∑”±¿d%zöq*∞ô©Wç¬”|pòhÊ'·Ë®Qß€©n∑û»zjd∆ÊóÒŸÛ ∆ø@‘√©AÈå`tR¿_6ŒúA€ÇÑ*£‰ZjÎ(áI∆·)ÜË√A·≠˜&˛moIAŸù-)äÁµø‰ÍΩ€n_Y=∏¸∏\ÚGÔ.¯¡+èΩ5◊‹ª…«—Mz8ØV9¿ThÏÂR≥@*ƒ~Y§[ön5lä„ÁÜƒlêÍô\/˚¸’w`¡È˛Üs™àûªrkÎ˛«˜ˆƒÓŒˆÕõ≈ˆ√ÕOo>$ s0∞zYéA›Ùlèí„t‘<≈m…
Ñ˛¸)œ˝ÊœTx'?VW>`eÙ({4J˘ õ√·(∆ã–ﬂÇ.ﬂJzùI}À≤áÈA:%ΩÇãˆÚ√√^∫wîˆ˘Y±ÿß¨ŒU9
ô<ºKÌ”.´?c	à$€V·;gòVYœxH4NWç©/C¯·YûuØ™eX…‡‰™π^5o]"5xç"/Ìı∫n’
,^¯Ω^»@{cUΩ!
ªã‚≠µ◊´Ω◊y≠BÀè-áÙ⁄h∆A—9ı ŒŒ!ÜË[«eø'ü8w1◊xÑ2Óv⁄K«È›8æ•{4 ssä©g‰4ñ`0M®
á`ßK≠wåÇÍ¶IÈüdÈ15‹‘èf≥kç~:ò4ƒâFÅ∏ßhl4π»öæRáë'añX„‡Â>t™Ïû:MNPÆª”ˆR5Ë†˘4@Éˇ‰Ñã·Î≥ÛeÙzπ¸®7êﬁù>ÇnØâV1™|ÓÓöÿ€ºôÎ=Ú˙LNaiI<§ÄÏdÌ¯ÍÄ*/u‡d¬ø|o§ù±\>Ü⁄ø¿ázﬁﬁsÈœp˜±“„y lm5ìiÆ@miØ-Oœ~Ω™≤_+^8Ö≠0≥]WEºRa¶d√÷√'ìú„˘âæÃw_8™Tå¨∂+Ó∏W€fFl;±	z5*h.Ô¶*NYÄWÙ≤.˛X$…ÖÆ Dw2"IãÓ.ıåßÁ›~«•œH3ô⁄âè@4sí˚≥¶ﬁÆëÿ’∞è¿àÿÆb
9rh–yzBóHÀ.†Ùms‰ÛÂÊ8-{ùK∫{v3pÎãˇlMÀ Ωb_»D≥rª9∏ØméF˘ÒùÙ`\-IÎâ0'‘N‹Öq◊Í3Æ1¡4ÎÜHË%èù€®Xˇ#mÖôwTV9ÔI
e¸f'Y∫g˜b∆=îc∏YqvŒ-ÙŸÍin∂AáFA^i]Vº"W{›ÏÏ•`SÛ¿Ñêà2÷∏ÏZ.˘ö1/¬d`ï˙˚ãóÊ6ò}…p»î\§DJ∏’Õ‡ÅÆ∂iâ‚˚ãñß¯™‘5©a_ÚC=Úd«SAF£ó=•nt{œw‡Y,!∫aú.Ã‡±∆OÇ¿Íòñ◊ Õ—Œ;òÀb06˚ﬂ‚"O+Ò Íè‹Mã"9Lúè.	ïÇ7≤¶≥ã˙Ù¥‚Ù≠pFu« Z˝¢l∏$n‰9iVÙTÅÛ}•P˘ëtÄÅå2ÎC7©c*›
Ë.÷Ów'0£»b]ûÚπ>˜a~m;aöŸ;aØ|¨5ßE9Õ¥◊sæZö5>˙òS  ëÁr!PÊD2PßøŒ™I§K¶áF¶ÄÁŒ±ª§ÂáΩ\Ø13jµÉSƒu4SKj:6'æM}µhuœ*ìz4Ãπ¯Ï›¢æh£Uz…∏÷ŒSÀLSm£H
ß¶÷Ñ˘//#¶üFîtHPGµÜÎ÷¥EsqQÍ±ìôÿNb…∞q—ç-älÌ,Y%mp)∑Zsı÷îµ=1îhMSÆ˝DU”+N∑¥Àyæ∏J≥5K‡£0øÿEÁl˘)ßÈ"]öÜ7OåÅ%%jdÄõøJe
/™2Olúò˛†M›sÚßæòÒo$‘€+úÔ&`∑j‡á°DAŒR5/{<ôÓ{µÌ}u‹ÿΩ‰öq·¨µøUŒ˙ªˆ5[ˆ¬êö%mÇ_∏õ2•äTQŒMqÏµm!Ó*ÃÀT˘JÖ‘l,I∑–ÜøÖµæ :'‹oﬂ«Ì€rÌ%ﬁûeâAÃñ–öçœ›0!-ÇÌM∆[•U∫‰ºqó/v9U∏Ç[v® –[∂2Kà‰hÃb7‚±Ö¨É[qrãN“√ec+ü!Âõ‘∫è±vÀâzÃÖäÓ¯ö{kvY3®t]Ω¨Ω‡r
ßï1ík¢ﬂ©ÿ7ƒÀ`(Ÿl∞xºË¨Î∫'Ωvt©B‰&e⁄dÄÈï¶-F<ÿ/NËRÿA`“Î¢™Y›•ë %á§dé◊¨r∫7` ;d´~»‚≥~BΩZn˜‚è"4ë´q∫9%'≠¨†eBKï‘wNU®˝Å⁄ÆUFK¶x^∏ÄwSIPÙ´Ô˝_jyQÉIow ˇ%®Æ≤z|g6 3*Àè“z¥NS9ã¿ú@.*Ô(%Í
v/€∆,kM)Êq fN=cçÎ¢Ò´ø¯ØëÀz“⁄‹•·?ﬁÏQ¶—◊⁄*ÀsQ∞ÀH¡VM
vôiZàÑiepHX9ØàSü(y∞1ù&MEΩ”ÉÄ˘∏πŒÔ√–ÌZÁ=l;BwÂáã~•Ê~nÉyÆO2 •˘(å÷¶™£"±=p¯çÉòDë&£Œë`mYË¿◊L4htô=o
%ÛÁΩ:Œè[›Äv‹9∫˘∂∏âf•úÄûüxÀ¥9—ÂacﬁÎßäˇ7L—DÙ9û≈∏πÇOiáUZèî5>(5¢∫^–¶ƒCjê†àÉmÒX3Ò°√?ÚñJ÷Ï Í‘‹Üá;°§ó—†6w»à/˛3Ú≈ŸÏt`.„ÍÖQ(2çRPˆ–ÙR.Ó¿á¶\]íÉ—®÷π¶û-uΩÎ%[©Äﬁ§H≈Ú¸4;GGÂ®È}ëP£¸XFñà∆æá∑.Au–+Jc¶Ø˚°än•q8=k˙NO6&¶"du¬√rªûpÌìº7Èß+uÄµ6«;ïíU:œm0P9˙“(Ωàqà¥kòt“´Å»Ô&L\ıÒéyk¿⁄ç1¶«°Q¯ñ@Q√é∂4\9«y	ÿÎï˝¥4øGßT7Í”£äÙ24˘ ®“W=F∆ûæM'…É∏7|ä‘áRäπ^,0∏¿Qﬁœü´‹tãıJÁ≠À¥ˆÃ±+'≈ôoJÒÚüöó&p‹€∂àçÏ7ÚÃ·_ÿ º˙Ï)5oÖX ^·º—–¢Ÿ°¬¶ÌªÏzÁ.Tu Ÿ≥†tõ˜ùÀf}∆#»·¨å(Ë%í/©√»Ë6RÜbüÕ^=ò˚w«Èı'uª≠œËU˙çïõœeØH¬hx·-o«yz•/o¸ÿ…TÛì”q…J'„¨üûÔ†Ÿ•qœ∆ígiWÏQt‘ºüG≥(⁄Ö≤Z7|õîˆäÙº∫ÖﬂJ>ık;‹◊î-Õ[≈ù2º2®æ$≤»ﬂ∏úG6l˚r5≥(c«víäntıTr=Äæo&£ÅX^º#<§øÅNd|1Úß„Ë0Ôz>4’!%o> _’y´ˇ¥Òñ∫6oãMN*0¥Çe√Un5_ÒıÖ≤ÿ6Q“«)ú»‘√®2<öP
»Á≈´ å–ÌDâ†∞ƒÜœx}Daå“;r∑3◊‡ò„µ)Éı}i'˝∫∞GÃ´¥µj&RÙ©-ÈS≠ÛÈúÀ®'x0y„£+ÚzÆCdlÑ°¢>ß±ÖÆ›&√a:Í$E:∑±,ÓÊ4†Y÷Ω6‹ËÕô◊	`ßO7úÖh~`\|[gœcÃÚ√t¨≠·ñrêΩpéªè(BEˇ[}˜¯Z–ÁW◊ﬂ
vDG€/uŒ\Rjù˘Ÿ—;s·´≤$QGˆØï+ô¡[ùqâ!ÜA¸[t¥ñ£æˆwÌµM‘Ü◊ÔõÚ¢ëæWœ†‚Õ!ã†ëÄT´ì˝Ç“U„"{…ÄLTÁ∞x|1lJ¿HeNqùt‘5äaæAﬁI∑üBπÿjPZ\Y3‡+:r ùfR˘v„ùPî≈pïF{û^ê¯∫)∑ßıTéæ)L˚MÎcπKÍ•†üA7ÚZ0V%§∞◊v˙,Ì≥?*+Ï⁄w·|>Ì•ÖÊÉ¸‘
‚[OaÙ1í≈∫â\~d ¡<îƒ†^úéêÜ∆◊»¿w“dÑ±sEìºÕª.yÒ§ß∏™˛ÍøÖ|ä◊ß,—|äaIRBÜ,|E>Âî„`úÀ›IÃ®\ﬁÕÛÿÎsZéæ™~≈Ä>ê„√
»7x¸Tÿﬂ1áY{Ÿ0~*πAˇ‚p≈Øø¸_ˇ‚Óê'4ï˝Íˇﬁø¸‚±x]Ø$c»¨<ñ—Åh>òG”¢ø+Ûw√¶ÒIq2Ëàò=Èlös<hå8ÛÛÅ&D2¿x≠t4 GÕ∆çQ~å◊°›êˆ 6Ê£1˛6—c ÌﬂsÊ‡[Z;8≤Ï`DóM≈‰-Ódÿ|Ö
¶q≤ú§‘Ha^oJè+ü«˘∞∆˝ÂˇL®âÍ^Ä,hkût˝ú¢™1ÉCﬂ≈Ñ‡)FX(Z‚A/E/e.ÂÂBøRØ&Ó›¸TÏmﬁ@A7`T{ÂZØºt„—Ipäá»r?+
¸∫HéìllAgKŒËÅÆ≤˝„56ªBñ˜–¬8Ì6¬+¨÷∏òt:ò=W˘áŒ…‡È^üÂÿ2†<É¸ÊﬁI—°¨œáâ^ƒÍ¨TN∫„Î‰LûÅˇwQ.Ç‡∂z[C;á€KW5˚r$oÄƒ„£¨òé76nkQÅ‹9MR†Ωï¿‚t¨‰⁄êZ.Fp ÓÁøπBƒ´
_ã…\î~dÅπç{„ú7Ö«É˜á¥=“Tééπƒ√≠¸£ggØ≠‚Sˇ≈êZ(h^mÖm ñxñu“OÛ—SL‹é4ç/Es≤7“-´b´√È){i/àhK
†Ÿz4hé»,ò¡ƒâfΩFà2ó´Ÿ∞U,ËÍÿXàˆ%@¥Ô¢k˚bC¯t«8S‚v°Hà·º–˝‰ıRíÀ{„∆√Õ{€OÓ‹ø}ˇ…Ó√≠ä˙eqñœ≤}ò?4y«aA¨¬ˇ·«„H˝≥ ~èïKzŸF‡p^aπ_ˇbáózñÈF…òÊˆ<⁄U ï∏§Zu{˙=Ù\◊˘Ü§‘Òo”Ÿöı≈â`f$ÈRä:TE5$≥f«π∂ãa¨|ıâÄÙéƒ’ÉÛLè¡+£I‹XπQFîx≈+√®£sîå´˝Éø9åƒ7œxÿä÷Ú›Ö 7Q/ŸQUﬁ¥	1Ä" ∏ÒÒ»H‚ Èåï’‚˛‰ ^I–ß»5⁄2”µ◊4"Æy‡°çí¬wzŸp?OF›÷1»©ÈL]âø*«sfzHó¨⁄÷j©OÈ†ìw”èÓlÂ˝a>@+rVÕ∫ #ï<z}∑-iä6=úv'f,áËÅp˜oØ|14Ò=k§@O6F†¢◊ _Pl•∑P∫èŒó-∂Ú·â8N˜bT).ú:Ò)`äbs8|Õ*{∫+xê“ûhb${|ˆ¬◊ø¡+DÉ,sØﬂË{¬W=ÇMü@|‘ÏÛá%Ø„¯°e¬[x¸6QŒ2ﬁ?|IE*Ü¿⁄¢"w(M5üql˙ÑùTœ!‘óe˛|òˆs≤cÈû]Ôv•⁄˙(ÖÉü®£ÖèèPÀ¯å…∫7å¬IÁ‘ÈN~(ÓO∆B≈Eq–;A°ZR‹⁄öÙ_/Îˇ  ˇˇÏΩ€n[ñ ˆﬁ_±≈s|2≥öy·Eîƒ#äêHÒ∫–"Ug
*YäÃ2£îôëëIä≈"‡ø¯¡Óô±Áe¶ÿ5¿ ÜÅ€„'ˇJ°~`˙º÷⁄óÿ◊àHí:óÆäÍ÷aFÏ˚^{Ìu_¶ÿüÇ©˜€[òé“Cq›Ã5Çá◊^∆#¬Jb°ü¸PK¬Z÷NÙ–ÙŒÆ≠ßÆ≤∂¨miôOÓ¬ˇB‚î[ôSÊ˜
ÿTƒüÃ√¬Z– ˛\y"ŒÃ≤é=≈»$z5∞Õqr6e ı,èNc8¢hÓj⁄›â≥±”&ùΩºdá˚?ìc2ˆåüUzπè”Ö=LAÑNv›T¡qP‚wP;ád?>ç„π_±„â˚Ï+ÊFÜoŒ≥E|Sç’à[Z°	YZ¯Z3Ê∂∏«UÙ7ß¶âw≠çu®	˛´ú¯‚à«
ÒÆ—Zœ77π|<˝ê9›ã¯QaıóFì.ôß´x˛IÂ£öº…í8,)À[≈j$7JIÁtÜùi”j¨<—œˇù!πá=j øﬁ‹èËö˘w¿pC>AHe5Nr“CﬁÖ≥òUT2Zﬂtø2UJ+£K$yrOv(%ú«&>	π@òé¬ûWVﬁ
ù 
ıw“ *x_»E•xËFëg3Õì¿”à"Ô·ˆ◊—äM∆¢’ÓÈ…3p
À≥f∏q¯Ì0é⁄<Î¶l·¢ÛIúÅi	f@Ç™dYkYäê÷z˜µ3	òXÃõ
ë ¸3˘ÃÛÿ1™$>≥oÄ≠–Ï6Í©
#~1˚„k⁄∂9><ˆ ¶†‹¡≈9V%ãBc#ıá–avÙ|~ù9¡çÇ±≠,\ Œ°©z:‹ﬂµPÉ9ü›0¸«îÓ©çqÑ·à:£yöëG,À‚èãÌ¡R≤p∞p iª$"|úœ≥Œ˙6∞Ö-Y”ﬂ∞ı∏À}≤k„œ~ÜiË_Î©„H€Ê∑”/°9äÈìÑôK[ÜDM{1√ƒYÄ„à¡^eYè·?≥,.¯B∏'JÁD˙D"8y_¨£åj¿ìBPo–œ˚–ÊbË9â¯6Œ¨4ùô.‚Yy2à¶hA÷èIßr∞fû≥RrBºY∏7êëvŒâ7(Z•≠'k-∞µM·VS„uhÒZîxí∏e†µ`ÍJ;‰∂ï⁄∑ûà∞úØ_◊A]eÒ≥®eãŒÆL2kü¬=4aWäí~ õ?®ËÈ∏B¸Zπ˘ ¢¡√·I*ÓÑfÎã<qô˝H∑ˇ¢n»tÖ˜s:; ÷Oaºq6b~H°Zk|<O≥Ë,Óú¡¥‡6o6Œ	)}¿*¥*í∑·7 ‡êòC-<êÑ˝∞wM7#¯ÕÇËˇ *$YKü≈÷‰VŸçÔãm±0‚'‡Ÿ‡:Òñ˛^eÒ$J∆‚˝Ω åYoÛπnÖ3N„˘`‘¸ÿçfI[…ª__ôC∫ﬁ5Z‹˘˙ £˝√^Z◊q¯ìx>Jáòs‚˘ãÁ'œ–π∑Ô˜µÌ<<Ø∫]I]†c8ègé˙ëö(Õ—‹.∞Û$b∏–îˆÀ‡ku‹@¸m6é
A8>Ïñ:|◊˝¢ÕRÎ=Yk‚3‡1ùã(õ6jRXO“,h˘2à∑´L∂Ë‘ªÍûó∆i…HŒ¬áﬂ5X≈†?‹†ÌêﬁºÊádxã xoQùá9o,wˆS/∂√¡∆\¡ŒœÈ¯_	Ù∫m£Ÿk8|ﬁ◊Î)¿õÙÁÈ–R˚ˇ)Mõ1@_(Asè0Oü¿8‘˘0`	]õ§¡ß$@-”5ÆXR≥Æy3C∑X«»ZúV“ÍÓ„qçG5`•-Ä∫M1pªa“J7÷qúÕƒ®¢'rÆX*„J≠”M¨ªƒ†-á/ÙBA
Í—oE÷+*nΩÿ∫ai– œ¸ÍH.xn	˙◊çÕWC¸ò1æÕú2B<êœí©WÊY¯VÚw:ù`Pâ∫ijãb’¸JáˆåÕ∏/°zâ—Ÿûlï°àçü⁄—ÔÇguV9ö˜“È4Êi€Fì^Õ Ä¨›ıFÆÊø°3&lSËÎﬂ(”´X•<^9åµÜÙƒ∆n˙cßeL
`'-˙ôçåæp!ÒãtÚÒ®∫≥ÊBR‚é–≈ﬂÚÂ˝+vπ{“Ò8ÖÂL§ÓUø=sZE^®e9qk¯3…Úéê€·ı0çÆ¡ÙòΩ6K˙¿“"7Æ∏£·ên;AOc@µß¢"6íÛPjx˝˝ãvd2Zähç_˛7j3· °ä\∏|‚£h:«º§H6∏√$ÛWÏ<_å GG|^"◊va˚ó“Yâá+G,ªºR‹æ∑ÂÆª¶]k-2Û¨cºkp±è*∑±æÈZfcì÷†ÊvŸGUîác‰>¶˚¯v*w [D¥Nˇ ˇ!ÆY‹ﬁ´∆pn 5«˛Jgí·uó˜˙Q∑«WL‘—Î„Õ™~DŸrsƒ¿Ls«tr9ãP4öÕ∆¬–ª˚ª4µt}‹§ˇø>~˝
 œ<Üöπ®‡≠†Ê‰
Ø
ë‹6ã'@ò`S˘C1v“dﬂÚ<√MΩ÷ π»
hAÀD®ÖˇƒøÅ3N«ÁÑ€û“ÀÊ¢Â…˛Ï—⁄ïß‰‚<n¶.Å†ö'†¶µ®°$±È=9ë]G/Âi¢töpÒQ·}TF∏^&\´∆1ÕË˚sí‚∂ß≥m÷[
ÌÑr=Êì4ùèÜ˚≈u@cTùƒŒ2µîÂéJIÂäuA`ÅgÊß§*“Q9ô®nëÜ •ùìî¬hãR‡
u1Mt”âWQ¢)µ∂¬ÇEÉ™Ã—T¢◊)—#	4≈}Ω–Eö]t …põΩR/$π µ≠ FÛ(∆…L%]ò8A†›3Xùx £{a√Åx#äÄ7cé€∂æT‰îíπNΩ
/-ì‘¬…ˇ$”?©‘Oe‘L"èïÓJêã⁄∂7Xã<Â≈7ÖÑLõEè}í¬ë.Å£/Y±>WÉ©y¢VàÀésÕc'ô«“™LŒßê?NÔ°Ö≈ä)>’H^[8â)Gk!π0nS±É¯˜ÓÓoîòQ:
[À∞≠F®NØåZdŸöi5-çV˝A°Ÿ6m∫˙+}ÌÄ∞P?xû.NYË(œdÍß&Ä”b÷ƒzù≈ÇK#…Â“∏|G¸‡$π‰“xt,üg?ã.Ù˜<H_Ò[Ö7-ò:ãÖ„]<ú›≠üÖÛd◊ÊıQ>™!ZﬂûPäÙÄÜ#ûÌ( ¢I˛XæÜ™úld◊Oö˜'I^Èï$TtˆÂ›L„Ç-BGg√¸üË®Ö7R¥ÉjiÅjÁEÒ€`4•0K’DÉQ<D˘,Á¡xa@î©¡fÍ<ØKe˝Z#.âkï $ﬁÇê≈Êw9MEÅ$ÑH6LÉôıïYQ+ GÉa‰í∞Ωb%a⁄∫‚òÌ%—j'˘Îã©Ù™ÒØîä‡ãh^å	µÇßÈåA§Ì—X)°LÜr–„0v([)¶‡]∂:s“Ñˇ§/Ä[Àˆ¢ÇúÊ≠M.uÈÜ3!Ìh4Í¥D‰HI[í@qøXÙLΩÓﬁJöß§KÉ.™’Í™Àö$}¢¬Îª≤/µ˘≈^Y@[uõb%Å*∞æ„Îñ(¢fÔìüdQ>%∑Ω◊"9)î]68‚1‚ ∂Í.Çqæ∞‘I∫ü‰òòUCpt∂j5I+° HXÅò2*{NÅ<qÄ∆µ.w4[DôÛJòªñﬁ…Ò∑ÙñÖ,%À˜P£CçØåˆ{T≈*(»‚Ÿb."%Ex˝¡ÌÉ±{ä÷˘Îß@é ÷•∆ﬂËo<c7vm∑c4ÄÎ“”œø#S¸Æ€4v&
ä∑F_¸6F_&ïv™€ñ.5÷¬,ö∏Qì∆Ó≠gÕ™∏Åå¬‚∏»Ì‰ç≤1Á¢ºlî•”‰˜®≤7H6÷æ–ƒ ∫Ë	rÛ¥%S ﬁ1ì.AG´BfÃ9ﬁ˝1
LwHd™â'ÒåI
mãàQCƒ∆™°\Ï‚È˘ô|MãB/˘Ú w∏∂◊ÍÍZÆ∞≥mà¿¥€≠Xnd´v
∂J≈àµÊl5ó&¬±∂TQï‡ÙtïHúO≥]€Î∫¨DºV{^®≤–ãqHåWÙbc&êâòçAîr™˜›˚'Õw˛Ó≠6ƒõZmê<X’õ˚˙˙AU{!hnÇÊÜîŒÚ∞=∞‘ë)äDX4SPcÄ/}0¸ùÇ’&—•r◊jøå{.L®DrdDƒcºÛRÓZú≥±õ∞ﬁV5"#¨Óë Jk«˝Pﬁ:Ï!∆~O´“‚@Ω©«qSYm˙´’π@‹¨_º´j‡MåÆ´∏∑ˆÇzæT5∂ó•3ª„]E¿W')÷‡ïãﬂFEì\·ÑŸI‘_-íµ¬/„»êŸJﬁ`@ÍêÌ2˝ïÛ†¸oÃ≤BaÜdh°Ò§)*õç≈íÒ\õ«≈o≥øh<∂z£…Ò?g√”€«B÷ 4/‘∞\A„eàØÖãu/ –GP#∑ò9F£hî_°DÒŒ$áw´Ÿq6	TeÓl†ÁS »!àÿMÜ>ó7;ÄÅ #≠Qè{∆+c¶z>¯ËL+¨ 8ûûÕG∆Œ∆MLÎ‚ÿÛ°§#áMÿæˆœl@RK∆VŒx>U¨ïUCª%Á†®ãê ı¥≈·!·qS·†<ij´ıÙ¸.«êó≠´77≤ﬁÆj¬¡‰√¬¢#dﬂÀR%’çiW\ò,˜@sj,≠0∆Ó◊W>1≈uw(aÈcaF∫—yˇ¯~W™øëæDõÛÙî·{/|R–ŸNê”¿°hÜ3èÖW≥ˆë·]<É™ e†·¯M|
–ı&Ü*(Åüèø?y˘‚p
º„Û1•v}"˘(SΩlmÎN8‚é1ÚJ†üA¢Õ†ˆäöoÂØÍäg„¥çﬂp7®˙]Ò˚ˆ§¢∏ˆ¸ïú˙	ƒDÑòlrˆa¯S◊lõ√ÂPsJWhsf√Ó8F·„Øìaú¢P•É`ÀaÛﬂ5èÍoÒ∫/ë¥ââ’jŒ:£(Õ£3˝‚W'ô∆ãaú7_QM”2íÑñ¢wü®≤‚ ãA<ùøÃaò0_ªôYG±O~ßQ+e@>Í‚€)◊‘‘åVœ¥Â‘Çá∫Á™lª˚N√Û%zñUÿØh‰KÑsKûhÀ÷(#~Eãe,µmΩ*vÙUÙ
éÒÑ‘ëX◊\Ok3ªï@êM•ˆ(hFõ'c@®8I&^cmpºühØlàºà›†©ææˆ¢`è$î
Á@»ZÃüä≤Ï¡ˆpÄ(™˚Ü†ÓıFOŸAS¡áí(5Ë/Ä5¿úBˆìÊä¸≤ﬂª"£ãC´r8∆ü5˛¿˛‰!ËÄ‡¡fCçüúç∆Ë¬o7m~Xæauÿõñi8…≈|i[bç∞tﬁWˆØ·˙»N“OÒ‘¶Q=_ √kÊ$ôèπ®ˆH˛*·Ù∞Ü∞pSuƒÔäZ/ìÈQñäÆ‰ã™z—g´ûxQQè ºù&≈8’≥Ê≥Ù≥S˘{q=©∫ÚEEßœ?œQ2∆∞w™Æ˛≤¢>í@™˛0`ÏÄ>ì’èxŒ£ÒŒ#˛*ÿEú‰#(§0¡°ı≤R4¬π,Õ°¸DÆÈ°ˇ[iÉBªÇ"zf¥"|äù/®æ‚ïèz+WHÛ¸∞ïÙG·m§“«Êææ≤U4öi†∏xõÜö^ëû…“lM#≠ıN∫vüé⁄≠¢ç¯G4Ê˘R%J–Pœ^Tây†<î¬‹Ùó≤ä¸m÷˙u2¶gòÊ:∑QGl/ZÚÑâ ˙€ãÓ‚|A+ŒÒÇwUßÎ˘Ù ¡‹ëÂ∫_JS˚ª≥≈Ys1ÜY<oÒ Õ=O»1ö[»¯zn§ ÓâÌXÃ´Ã®¨ä¥‰Õ§p≈Hú‹Åo"WπqBä¿<;£;[ÎË R ì1µ	/§‰ÕÁ≥|ª€Âí»Œbä0°MBw6JÁi{Ì˛√µﬁ£µıı≠áÎ˜€—V¥›è‚^ÔbÃîå!Õø9MÊ;É,ù}Ûw;{ﬂ\¿?=Âç+Ê,”∆Ì‡	Á¶Ù·Ìõ™ÇIu÷'G√”bJªøß€∑œÜßÆ\≈p±wM´ÑN\»…X›ñW=J7ÉX`ËJ”à†≈=4˘Î
v∂0˛õ#hl3ÖQ
>X ˙¶∞áΩ"Ê¥€ﬂﬁ%A1Ÿ¿—éi&ˇä˛ﬂ.ÿ¥ø8<~-tÉ⁄ •Ê“c`ﬂf•W‰pÓ7¿ü2VˇµπàBZ3FÊ‰_”U÷ÈtÃ€ÔΩ¶b6/¡¶÷Ñ⁄!„~ÀÀÓ∑E∑tÀÒAÔ≥•¸UMˇnªÂ˛¡>ª≈(?öâBÆ∑pÓ∏w›($oÖiø„®a 6Â•˚Á¯è»Ía‹V`Y FîCÉ€K-T∑vÀ õµx-œF‡ˆ,
‚±.Ó2ÛΩ@tŒg/q`8∑˙s#<m˘DåﬁPçú&@eè/u°∂ç∏ç^ˇ∆tÑ·◊wyÙ‹^–!ûaæë∂Ÿù`xX≥f#÷H¯	S˛(5Ö›F´e\<.çiiÛKŸ]sPò´†8ªı|–±Æ¡uËƒãà7?ê∞Wx„6n‰L\ ˜¬¨ÄqaRòàﬁûË
ÈJ\◊DÓìòf–ïñÜ3ó%&Ä£p <ıP/ÿÅJ◊Äîÿ>œ‚ ≥ùRx+ú¢ŸŒóÛi$…úﬂ. hîÕm2å'ÈáF+8È˚ø√∞')ùD9Üæ‚D—•íÀ…i•	ü«2ÄYßå‰¥ÜßEë–|ïê;≤x~1¸5æ¢ºå°1@†DD:È≠IÅÏ◊ƒA…∫‰C¨GÆœ9g8åUJUã∆xîˇTÜDÉ“D9wπ:¢lB	ÜN…#ı.º•¨ì2Ï∞¿\ä≥‚´Üé6û˜ö∆„4ƒ˝4˝Ñ‰?7ZØ(ﬂÔ\ ÙXñÒœˇ˝ˇ˚_˛Ûﬂ„Ò¢Ü≠	-XN—–)È%úø˛eQFfƒT  çO˝óy»”
Ò¶ÄU†Ïòs ä:Ûñ∑V÷å^r+Nrú§T/=K–#ÂOZVÖ™À◊Ó›9LB-Ô2’:˝ÿ¨”˝mß9ôm˛·"ÓO˛0Iœˇ0Ÿ<o5ª€˘Uk˜În“ô«0gO√í–„ˇ5¿5µö89ú±2ë kÆES≈§5∂wTj8≤ºH˚ÇmhÎmÖ3xÊ@¬û(5‘∑ﬁâu„aùPjvïNqõ5mL5àÔ87Ü|:F5ÃÊœ–nÄõeB„±P*„x˝QêÜXÔç4n^éÀxiyﬂö#@up3¿àX:·ù"úøíõñŸ√4<∑=_ÍçF∆C¬“f^∏‡pﬁ–Âdv©yb¶ÀÜ±‰¬\ò`Äˆø¿ªﬁCØmø.NQaõ∫]ˆf1eOŸwã(fh·+.(-Ü6Çâz©‰!‚U,ÍΩù&Ápm"C—T∏ñ
µIA¢c˛E™Gƒ7ÌÛ~óöp˛Q)ƒ◊â<&€Ê©ëﬂ=í eÙØ∏;Êw‹éá[ÊÆ‰G<âá¥øÑ•πW,T'¢◊RÕ),7íÉqtfN+È6±ÀöZ/à{áı0µöƒÒ§%"ì‹M˙>6
ﬂ+π’á–3≤S)¨Í£õ8ŸàMı&9{{àÙsti@U—îéöà	L“∞◊÷uØEjX/≈≈4"q∑¡97´»‚‡]_fâîô•¸∞Feæ‚H†œ£~}’_‰…8UuÜAÇQ¿;€∆πVGãI
,1ÉcF÷^ºÈ`9∫¯Wuaòdœ∆ß0°Qgô
 ào(@OSWZí=ã¶{lAK∆w_K—ÁeZø}--`Ã5õQ:N_;Ö8¥±óNÄ)¿J∞F áÄÁ
ÈÊyí'˝d4!îú!U7Pﬂ–f`ëo{OzC$¢ãYbãF±ÕÙÒe¨˙âjûñd∑løTì)öB"€ãÂgKıáÌä u€d]!?ƒ%øÌΩnåCC˘âÖ/IØX¢¯Bæ\SÎ[»Ñ]1ıÇ<äM©v9falZéWò0ú€ˆëv!:8•Â≤rÖ+*£:l+J›d¢UÉÜ_4Ó^Î(ÙMƒ∆y„7à∂π`H2k ØâR
îZºsÒ8âµÒªT{÷¢»•ëfEœE°lqpúœ˝>æüc`ùt‡ÿÊ—íÈi™]ÜúN|EÒA	‚˛¸˜ˇ'{&.„…©Ómn—c‹íü0∞˜%FŸß‰2bg¸3äíN!p2Ã§,°’?˝„ˇÙ?vgúo≥ƒV(Ö¢»„–Ôv«√¸û.á*Ç.Ì(`bÃ÷päâ—0ÿ „È»≠T∂%ÖÏŸ¥qﬁKLÁ~(œ˘†püf”°> ÀŒ©•ÛıŒG[‹Ì⁄TX_=ˆ<#\∆(À’\Ô∞WÈ¥Mº:™êµ¥È\§˜∏Ù≠M§
êB%·PLùã&_2íqWƒ"ciÍ°)ÉÜ˝∑){ïzLRí P∏å_È^=¡´›˝N÷ñbïL{A7TØn‡Ib#b˚\+Cs4ú`Á‰ﬂÔcÚQ9H≥#IG l®˛øµ≤Æ5l’l"ï™=*ª1>.IJ˛Z}EÚ'<$¥Î†≤œ∆iø©¢ä˜ˇÈπ3ˇZHáSåê]ömÈîè◊,SqÏ9,*{º√zù˚d.∫æ)˛„™Z`úVH¿´_Ò\9,Ω	ÄÌß)∞Öˆ∂Ö∞$±ŸÑ"≠%_ﬂnDf√†∆	¬Ü/Dﬂ…Æ”Ø·©ò‘û»ΩâÛ≈òLHúòËû`ËÅ-1˙‹ËÜ+ßÏJÉ9Ã0†`Ùs!ﬁhù<êZh„ãuÅ∞Ï·}kı„%7w≤X I;íÇ*<`Æ[G!6 ˜Á ÷Ò1Lòõ&«Ê®e´.˘÷Ú"örågœI∑ãw∆iÄÀ£ø›ê\Å^s€Y√0Ÿc3V¿ZÎ\™ô8ﬂç∑∆<ßàÁÊL5∑ì"µàËb“‡Ö\HrmMÉmÉï÷Vá,‚Ù’ÇœÊÓÍÚ ªY@#ú6üÊÏìßÑàü∫ôπ,Çí õçiOÌËóï%	AcµîQ\êXe§d@‘®%(kèÀN†5?ãSUèI≈—Ò÷C~≈ÆáÔ ÍL$‘T\dÈ∂ú%VAﬁR/Pµ‹ÜtN¥±ÍcE≠f5I©ß9)à©l ªvú¥Wèø-L¥ÖY5EC÷∞À%:ûqÁƒÂ1≤—àÅX‹:\Ú"Î»éJÎ†åETP|ÑV„⁄ôèK›˙˜£°›ÁﬂÜQ‡Õ“¯ÑÑ“¢Ì†`ü*·4>Âj|™Ñ‘¯î™eâa5≠öévπcö+≤∂‹√∞ò)IRñπJ@Ü5Úo≠bN<ps€}c0ùyò-&ø•D‹F8OÂIv@‰:•‰Ê*≠ÆnﬂÇ6wúW-: l('Ì›‰9–øô¥+Ôó˚5äéa¥†kÍ[\xŒvf÷√ÇÒ˜0H≤‹ò/rÆÆîBH«ÀØ∆>ÈR√˙∆µÏmTÂåb&ÕcÕßôíõ*kÓ¿™1«◊Wn™ﬁ£;hUM¢–kM3∆2∞&¢7qkﬁ”l¨Ñ˘Ù˚≈)B©mÿ7'èIè>„•X∏DÖÆ"6 Çùå™∏%Éíçê8	U≠èM◊æ–Tp™\ÕS}ª◊Œ	_,É,·r≠\€Zøí¥"øI=U≠¢ló[◊Òj0v2ÕûzÖÈâtG±·»3õ∏Ø°Ùµó|◊3l,Áe –⁄¡bÜ±1.‚§T@g¥M∂πB}J.CÄ÷®¶¬±8 ª,w:ıI«ö≈$>%˙8|
≠d±`Úù6rüNAøâÕ oÑRøDE†kı’—K¯ÙxpxTW™ﬁ≤ïLQÉæ◊z)ü
24¸∫0äÎ	P©≈aJ©"ã !§Ã¬gIÖüí 8|¬
9Ï i}o€ÓQ›TÇ?√v=uÙ´†™πD[≠⁄`w'≠Ü·2–¢^a–4ÁVª	åªZﬁ/\_Í¿ÿ÷ù¸¥†¨avëA»Rh•E¬H€k◊ÃÌíŒ5bÊr´–<®›V˚¯4ö}ä∏®œ´ÉÏè‚ﬂq•Î ã¶¶Ò¸"Õ
3SUK„xÁq4·fΩ—"ìL+;ßprÏSÑ‘Fv9I&D‚ôE∫‘°–†…¨»4RÑIi%oCô˛”Ø[\~w˝ÂÛ ô—Zã≠-¬>[!&Õ∏äØI∂IaÌòMVP…bºRB˘sŒº§º„å8ÿ•!u\üû°à3j¶fR‹(/C6£2JË.ÒZ<RrÒ„‘ı]Ru≠-røF®!ùŸ	ä&uä’nt7ç÷5äÎP‰ú4Vµ
|pπ ´Ä#∞Ä™GS^øzH◊+„äÅŸÅA
zÕÆ ,«"`ÄOí“PÄá"œªTP•‹´õÏäh’èñÇo© mÕµR◊ﬂô∫;gZÉt“"8s‰@1ZaÆh§F&Í6gµ¢N1(¨®≈9†⁄˙0;yö¡ÓFpp5e_ÅD±Yõ5#˚ehvÊIï≥‘Ô0Ø;ò[ı›{ﬂ≈'_‡$—∏Ÿ¶√Â™ïïPm˚ÿa@w3fÑÁ•r94ï=¡{7ÄßÚ{a—ƒ‚⁄·<πº/O'qs¿]'r⁄(P¥ßhn˘ÇÈYkªÍÆ¨'— é‘„îj˚°:ÿß‹´T˝Üv«û?ﬂüb{~íy~uÇõ˚Æê∫
Q´uC;∞ÄEìú˛÷ˆŸ¥ù”  ?Tl⁄"Á–ªjeüÚ{ƒ*≈¯ù4dßÄ∂ãR˚J^Œ)©(1ÄØQˇâÁ™îΩh:¿†íCSâ¢›[?¿CX)pw¥¸	$‚”Æ∆]'˙Å?aÇCÎyè-¿Z|√	!.çèàºwxAæS1Ãk’£Ç∞ ]3ª“vJR˚µÆø—¶Fe=. çÜëˇØ∫“ß$§ˇ%LP\≈≈ˇìÛ]-Ï5˛G[⁄S…Ê.µ∏ ,}.Özâ^!Î^pœéPñØ,ÖaV≥≤d'Eb¥¨F• …∂ı|!˛—ºÚS9*∑ƒ3@€…nyZ—≤t*[¶ı$?°ˆ9◊Óo∑p-&qM£8Éb4¯iÕˇö◊–§&†‡∂+-|ﬂ&Zz†ôñÙxV‹»ï˘núFÕ¥=3S.Æó∂«i:∑ì…ˆt¿Â⁄ŒtF{JÓ.ZWŒu¡ñ-∫H-.lö∂âû,QEÃµ¢XR’òQ®f£SßQµòFª”%⁄≠jÔfÌ,›àyÍPXl¨yŒÙ}gÃxeïƒëh 6˛µ’
∆/◊ﬁ‚¥_*>+¶e∑oƒπ?–=Äs?Îaú‹ãÅEüè‡E<≤1;x7»nª3ˆtó©∂ (‡®ÍIø$;ßiˆ<Ç‹¬2tx]$äE”⁄§©ÀJVŸ¨òÄ˙ÀDj5ªp1\¸9°pá¬ö˚?≥˙oôii	◊åÜtLÈyö≤}úÑèe,–πP“lñ¢bë˚·å/EJ,"≠≈Sò4®#Oq†XhH|ô∆Ë`0Lr¥{ä2Fë?NaÕF%ƒÅÃøïÖ‚&
ghë©èˇ¿MRúÀûÿ„√ﬂ—ö6¬'™◊-b˛Ì6p6óe„^“ìÀ2kÖ«bYvä&Õ0é‚≠∞<zPWùNGõ9:È=8uˇ˘M™iπ<°S(£ñ`≈{3á∂ÒÀ/É‚(π¬…∂˘ÊW5÷∂ò∑˝ÂÂ[:Âé¯D≈ÑAú4är}πFu0≠¿O~3¯€‡ŒÚÿ¯s∂™∫iŸc|úã4÷£D9NŒÔ!◊ﬂî√:è∆Ñ´’≤≈è6æú'ì¯)Z¨Ò¯ÏQ(N˝ÆÒINËH.}Å–ãæû}ı√}ı˝}9¢S__íh°Œ⁄|Çﬂ∫óïS¬â†ä≈ë±öæß¶ C…F≠B˚zäEKF0[a÷#UCÜ§B|∂ÒO	¶æqI9:πC<ˇ•X„ vÎ©·h˝M]Lƒ“zcWõ‘≈ÿ?	Î˝•Øõ£—ó∆«ŸòKÁõh=ﬁßÂø£dÛÅõ ´zu)r.ë ‘\[Ö™z∂Ù õΩﬂâXìÌkÑ⁄u ;ŸhHh#k†°_Äﬁ⁄új©éπ∞Ä	†‰*m3Q◊∑nÖ —J9u£Fl-≥≥∑7—û˚—†h1Õ}ÙÎË«o‚håkR}:I=rÿf&+p]´ëu»ºáÒöl≥ÆõèË'ªÙ~ˆÏM®Â/!Ê≠S:Ó≤¶)Û¯œZ÷lXoø—az7`ÒÓDœ≥Ö3;¸9pÖ’rË©’˙Õ•“V¢˙Yëò^∂≠^¸åƒ›í¿˘Á/˘÷é≥hTÏòj±(ÒKó]õWœÒvèÏ	Î9Ü5Âd°r∆¨!vÊßãYî-	ûÑƒÃv•ÚNÊÆ™… &eÚáõò?È]*±Ûﬂ˚Ê5ı3MtH–2“ïQ5oßã)%Um¥Jä€We^XóÑ,oi)j¥zPuI“Â≠'CtÈÚvî°ñîEe©aöı±∆™YtïYD°ıÇWõŸ§«™C8.e›©≤≈:]£À÷*AS–˙¶pY<&√®|îÃLª ∞%\·ƒJ{d›FCˇOe4ûÈdUb·]âKˇ¿ì%j+#t≠6º´Y[œi_tçïﬁπÅ_Ù>ÌZ‰’Ì©eàoÉÓ¨“ÍJÓ·D†±Î/“˝,h◊µ»·ä¢â≤Û`c«TH4Ê)/©p˙QJ:I}$¬Õ”ÒGa€—p®hûˆÈ£%I&SÚÇêû·:¿òÃúl¡q¿kãØ@XOáÕˆb,∏∏çÙÔÄ∏Zõ∂Èø `—U<i’ê.m∆‘-öQƒÆﬁî|Y—ú÷ñ7Ñ±n¥&°°„^¬&µ<&∂T∞ äV¥0Öõx"æ˘æ0^xûò:R3ÆëΩ]w¶lS›è∂«πœˇ≠‰‡∞§±§•Fûb[J‘ı≥B∫≈BÑ—≠D∏P¬≈∑“ îºøÔ¡C¯÷áq±xMÑÎCπEıJåÎ¡πFÁîÎA∫FßÅj◊KÏíÖZÕ‘^›`∑À4◊~K4Á±ü÷ÿuè='°Ä÷µw„˝7≠y◊“]‰ûU1C%ê±ßª–º ⁄≠ÅD3À!˛¯PÑË∏CßOÁñÿÇ?∑≈¸)áIQ∆›… <©µ*C"¸)E%¸©çPƒ†náV¨FnÜ\‹ë,Åb‹‘F4¸q7™Œ¨úÛj‰4ÛwiÅò—≥Ø5´∏H^VTp¢◊™Àú°*PÅ—Hã@™í#©â&Î≤#AYç {UΩS&˝Øzô=ZjálüN˛¨Ï“æ¨Öhêî}ïöãG˛V1µ˜Ùñ,_
ÄŒﬂ#‘†Ωç‚ÄÄ«?ãsñû2ÿoª[í?ãbF¥ëì@ÜúNèß—,•¿∂•É¶2¨‹ÔØ2äAóç1∂V÷¿⁄éRJºÔêÒNﬁÙ(ûÑóá,8¥¬2ZÔr≥'¯†‰ïWúE$©|©+√	´JÈ
ˆwvv¸”¥Ä[ı%Bú∫–·[T¡“%ZÁU·-biììﬂ7jÁ•…/Ì∞ %^Û∏éîã˙î´bMëê»Ô∏}äÏDY˜DÖ úgæ„ØHvÂf1véôPî∆æ5®<ä·}◊{_ú S$}Èê∞ë·?π^ê∆t“)ŸœmcmÙH√h÷'È^ñŒö¢FF1iYîÀ‰ìÏÊXV%z6Â◊VÁ¯üßπÙ{Z%$√§uÂ1 QÎ˜¨F4ÚTeJ⁄aÅ%.VÿÔç-cèkE#◊˚\eõΩû¯ß◊ypﬂë®¶[ˆX’ù3ÚYZIC1’b„Ú—≤Bò√ì9%åŒ5|ìNπöê•Ë!åM›¸∑i&)íØÿ=¸¶GXqK’¨‚f∑˙∞PrÙ"Œä\´kùÃ≤r&®®«òpP÷∏ß≥S6¥,ï≈¥±÷∞ìîÍ<’[õ•∫+`°ñù@2‘?AÔvyœp÷ÿ
π'˛{;¨uíûùçc∫íπ(N^`ëÎ>ŒUì2n¬ F® ‹≈øœ—uªx˚≠NÊî7ŸÊ∂ÏTÃ±‰4ïû$2ÂDÏÒ“`CHÕ EÀ=±&înQ·õ¨ó{Mßo,d∞(YåÎxî^PùóÒtaàkÙp;‡ ˛]{íªc˚ê˚a9«~ê|CÍ3æÃ!Á˝AeÚhÆÑ„ﬁÂ4néâvıå5AQDﬁ/éZ)ZØ@Ív>‰bh“◊›HÜû[%Åˆ†œ ÚºÎ§ÓW÷™÷HÔn‹’~åxmAB…∏`:e#í“µìs6Gyé¶);+ß„¯3KÊÒ$obJ∞˚;∏a‘ÚÁ$ô∂GÌw˜{Á£˜+O‘∏Ïv.⁄Ÿ˛øüf∞vÌM˘Gºà€˜{=˘{ﬁûg—Ód‹ Fa∑‚aì
±höL r⁄˘,ôÆ<y‹Öd⁄öˇµú=9◊úÛ$˙‹æho~≥…Áv¥ @º‡#òÕ€k=6Î∑◊·ﬂœ0	L *Bü;ÆÔø0gø∂”á®F>u∑z™˝IøΩπ¬∫Z£uΩ>’Záù∏µ˚ò∂©hX‘Ï”6˝˛}2¿{ÿ‡˙ 2D|ïŒŸÆ„„Óh]ÎaÊt¿áı∞g7∏…‹ZyrÇôÁEj6â.AJÈ«¿ÒÀÏÂòÙ7çÛiC8ﬁtwgZØ˝≈|ûNuΩ]:›ÉÛiÁä£¥itûú°H£€hÈÃ©6⁄˛áõ-ÿèŒ∂|Û ﬁh+S,◊Ï≤Ωﬁπèª∂•†
÷ìÄ-¡”⁄§„4√¸ƒ„d∑]∏?ãf∞¶j@O¥°=˛>f◊ÿÔMÿn⁄RˆLH—‚xX¨Có/D) N}…9·Œ\˘IM+a4îπ`Ñ"ıC9Í≤%XÂûı™Mi‡∏∞	ú≈°f÷HÍÿoı”s™jÎ¨JÖ0…F‡s°F•y“øﬁërè≠ª©ê
áFÍ~vG™∆ô/ŒŒb"…≥ÌﬁzIıŸEr+|ê1/lÌû2“;‰1ï
›µ˝…ƒÖ∫hﬁX>Ya“EGÚe4u‡†SL÷ﬁ∆‘N}åi‘Ä›ËÒï1êÍ2(uìMÜ€ﬂ-ÅYÒWÆ
ƒ∞
´^u≈Oí@ Ä‹1å$I4MÁ#8†8ΩFÆdNîzÓW]âBÆÓŸ~ Õõ`•ˆZ)0·véìÚ	GHy<I*p¯Ü¬lvÁ-3∞WÌYöPßF†,¿È≈ã¯t~+º’Rb‹ Nªq.A0‰¶ø¡ˆ”yŒêb”vƒÜÆ˙Ç˚DÄdìÂìÌQ˚˛≈®Ωµ©p7^Üÿ€)¿p{îáp¡%êèëB¿0E¿ﬂ∑«gÉwŒ¥Î˘ √∞Ò¯‡zÏıö\ù^EL…x√ gHˇ±v–3-ÇâG˜{¨ä[±:∑¿ò$~«1Á%
Åü©ãzbµÒ8ôúŸìR<ÏVÚ⁄-çÁ;+<¥x™œ∆ãl≈-¨≠X‘Ív1è1
q<o˜¨ïK˚øã@ÅQ√@ dxßß≥hêÃ/Åla˘ 8 —∆∑£\'oO”ilØU˜ãOúNq“ JÂW†Ú{$9≥&(TU;˘Ù'¶“`√ìK46«bQz˜+¿†∞Ò°dYfœ
-≥>ŒÍ8ãb ß‡÷/=uÎÃ›≈±1VOO|`.öÀÈ≥Ç≥~ñèÜ,Â<Ö…ê^¨˝Ó´µˇ˜.ΩıÔ=KB∑äMSdc;‚É∏¸;AÇ•Y_p^hï ÁPO)Z sˇ‰ú„+œÊFß˙ßç’îõÉ$å„—¸ˆÍáÛ(k∂€ÛãbYÚy:À[≠˜|e"§øpáª@9‡‚ËÏ#≠`ÒS2ê≥≈8èWpç˙Éëg…Ÿà#†-º#·ò@—;RÉY%d¥Òy\øõ~
Îz√•lwt#±ÜO˝ûJª5ÒÅ˛É4ÉG+RÑ’ú:¨#RvpU”ﬂ˜üJ†â91m{é+àìåìYãrHﬂ"˛¯ãŸØ˜¯ãü»ñBæ»
3ÿ)qÔøÎ}Ë}Xª?˚¸!;ÎGÕı˚k´kè÷V7∂V{ù- ˚6«
NΩuΩáPO√4H_*åß≥TåÒ04å«°±≤ã+Yπº`¸˘:Ω[ÎÕ>øWÀ¸9◊•rëﬂı:Ò‰=[Ãfq6àÚò◊- ı°gù¸”›hΩ˜L…BÌéWﬁ.kpˇü#` ¢1Iàè2†x∆π•Ümm„[	ÁÚÅû√|Ω£µ…è÷Zwùq†#bÒ3Ωêà©g@Ü|ã•∂Û‚u±˚ﬁ›wˆ8öîD¨uÓ3íX1bT⁄:Àì°y¿ıÕ◊6sùo&óõIÒôé=#båÓ56Ä·dK??ùq‰Üƒ~4ra§;?∏∫€d\ã÷˜ñ¶e,›ŒRdº!êÒ ØuMÃE5@π<>÷M/Ë|îπüJ¡˜ngÄEö-nıù%Èíâóµ÷ÑTBƒFy1J:Ì›∑på8©°Úñ∑8	6®7∏>lbár Ó¨PÇá;B˘ªY–Ÿ˙=D-sn¨˚Óùgqç |òÔd˚7O€>GS‚öÙUnWoÒS•6ﬂ)°‚èª_ÿ5û‰g«‘ûÒ˘Ü˜Ã›5XÀì, MÒrhﬂB;w7G<AÉsK—]ogK[å@üÓ\Èá”b%¢¡ û/ë†Ï°˚+´∂6UNıZﬂä»EÇëcdÙ÷5&k,Ç&ë≥˛û†ºÜ∂∆—lÜ$5ﬂÆÇ¢Õ⁄“:LÜ€Ù◊&£[® ¯ÔC!ó™]L¬⁄†ø≥ÙBÄ%em√˜¸'⁄ø Ú§ˆÒè-¡z»ß«’¯Ï(ÃQ—Hb~∑¿-"¨}æa¿3q∞¥8Ö‡åÈÚÖî%”Om5w˝µ%Wa}π^˚ÜÛI_,¸nŸ=rªÑæ“Er~|∫!÷Oá∞´¡‘∆^å≠ Ò
GlùÊ?r¡¸ft—ﬁ.¯ØöªÅù,D°÷K‡öuSïaS¶à‹8Ó"¢&PZqM‰-ôsŒ”˘ƒC˘2X¡ïy˝ûEmÅ¥8«fÌwÇXÖ?7·Oè∏É¡ØLc£SyΩ®åÌÿX≠JbU c¨}Q∑6á\â≈ï‹cÖzÈ¬+«‡Z$Ó€˜äGd0˜BÖ_@%Éìî^´-ÁéLÁÜÂ˘;S£∞ ;Ú≈[:RkÅΩí1˛ê¸GFã˙ûI1c‡ùzÑe¸A°–ï	©'“7⁄ΩB˘ìNü£ÊC‹˛4câ xî¥˜#ªEºrÑ›b´≥áuÕ9‰∫pÌs@H$ÒÒ˘ô¥\‚‘Cô◊`°jàp¸DÓfô¡>07b∂4
¨åV ºæz@ÂâõlÕÀyâX“ÅpDΩ≈ÒÙñá4¢Í6á'PT‚z‰ï'‚.§[–œCˆ ⁄Qì¬€i‚e~w3Zû wP∆P2ãŒËi∂æﬁÑﬂ˙Ä∑Tæ%%i∞H‚›˛Õ_Ø°‹≈^|˝ıPüõ2¿≥Pπä~ÎJ≠∆Úfj=Löˇì‹Ò+F7¸¨Aü?ø¥l	6¯ZltêJﬂ‡+Ç?äY/Cπ/)SÒPÈ4À•éQÎmÂ”åîíÏ¯TëÌ¯¯Iw›Ë‹È∫[ÕÃîê™Ñ‡÷tã ¢P}Õ’ÿ@°£M‘Öü<“ÊŸΩ©(<W˛ZŸJ“´∂¢öE#Îº˘ã,ö…i˚'(⁄ﬁ“{õU–»¸ñH(∏¸úsÃßW"y§saïÈÔSÃúÃ#@c∂¥+ 7	ûﬂ∞Œ˝æ)Õ'å[-º[ªO7åGºX_óWÅ⁄D=3≈»Ùíö?A¬⁄{À«≤9É´-û>ãÜgD
Ú|êkk~Gé∆—‘¨—Ú˘ê gW¨∑&CWk¢DâÖò9DD·≥-∑Nf-)ø Ü¸cuh˛‰ÛK@¥WW‘ÏA4I∆ó0à,¡ÂiîdL,@cï5ˆ£È 9Ô„AñÃÊò.◊~eï™˛#®l≥G0¬ !∆q˙ïKé˚ä˚ÖsWá*õFzZı|î.∆C¥~ïpC@`m6¬“c£ Åù5Ùkñ'øá£üO‚√7‡˙?Db=èëæQdÌPø1gmvêfh	≈P-ê≥¯3¢x∏i—£Õ§l}°wiH•pèÏ,D≈F¯à8íÑ(ôˆÒÙ¬Ë ç‡Ñúí«f%y<FÇµ‚∆°üó¥(îœ∂™›5∞q∞&¨€ªµU∂æ 6VŸÊ*ªˇæ3âfÕ&ŒºÇï)¬.¢Ö>Yz”x≈n‚⁄£+†lå=6?o´∑‹0óÆô—∑ßP
nÛ üÉO)c©ñÖ/•e˚_Ó\·`¸ß∂xçÎwÌ
=eIt√èûemÂ7ÈÇ¢È4ù3 óAÊ˜È≈TRÖ˜VJK>nˇSµÆìQËqs¸˘,Èm≈Î.Œ2„¡~Íƒ|∞ü;âa?ª|úEÑhr§∑Á:îÊ˚ ø±dÿ@dÑ”\úoD	˚ÒEîpµO˚z::Ã2à`áÙ?"Õ·>•≤tSñ=¿æ—èæjß>B4&HËM—ªö9)©ù	¸à8›ÙÒœˇ«øƒÀpﬂ◊É–}ñﬂ˚X≥áZÖ∫]vlÌ\9—4_ŒìA.”€0≤D´’L˝2û^ÿÚ:
`·{t¥&Wî~·zÆŸ$ÛEí∂ÉMÎ‘Co’h+ÏXgº∑^’‡4cÒ§”ó)∆f¿Î\*"kdÄ˝ÔãKñﬂ‚5~GÁq›Ü)4EU√´ˆë3îÂv(¯ÊRí<Î˜Å∂˙m;]Ã…°Ç»©ØØ,LCHaÜÒi¥œπw§!òi\,mò>‚œc<ÿïõ¨œXâZ‡ﬂØØ ßc{(5⁄√R¥7´äxˆ¬¥€∂ÿ Ω^£U5	|`I∆;Wä&„ãÉ◊uMKÉãËòœÿèWR©≠áW0d>%ß‚:<^)¶˙Ë5ô4q√±JŒ¥å66ÓXÃWîw∆¢S;ÛÙ ˘õk®ÏkÙ:Ω∆5k^iN¶…rKW¬øâ±¢o√‚nâÛúc([˙ãõQùDg!∂©YaäxŸ¶œ¥Ô&—4ôXÛîS.$Tö 5Zé±ªπµ’ööRœ™5gÁﬂ=“A„›©ÈÄc[Gé≠gõov ®÷û-≤Ÿ8∂Ì6Ë_Î ëI≥$wÁGA˘xîƒ„·ﬁ(FK*]PªNhc]äf9ú¢mX¯L“‚=y˜Oˇ¯Ø˛{∫ˇÚÎ≤É◊o_Ì?ÛæƒBﬂíCÄQ0‘7⁄L%q)LÄ	7¡—˘jÛLá¬‚Mo£◊_€lÑÔ«ªábÍÀ°√ê‚Î¶ßw)ŸyÏ°iÖ>Vä•TÀıh3^èÓ„r’Äñ˜ØŸ≥∑øπå¸uˇø–˛?[$cÙ≤^ˇRõˇ˜ˇ+;~˛‚≈Õw?xÌGtñfótÎ“û∞Wh®}í22I®wd3ŒÕÚ•Ô®∞ú¶p}∫vzˇÙë◊kÒ˙£ç˛›¡5¨o˛Ä7æ˜»∂R¯[iîbŸπD+“±wv ò ÓI©®∫&ıF—å4>øèWû\π>—.,Ji˜KÁw¿i4QM@h1 Õ;"∏p(ç√vúûŒ/ ˘∞˝¯<ß3ÿΩ„(:f/”a<fOg3ûD˜Ezñ∏øàÛlëTÂ9˘◊7Fna/—÷7Hî*·œ…a÷Ø(t# K¿óŒ≤ìxàÆ¸52Å`øåfG…‘÷™ètÕ∫©UØIóüëÍø'∂]3Ø†’÷·tòDçí3"%înãœDÿeR`'ê≈Cv*Sñ®Õ˝8ˇÑ÷˛Øßc8.*∑∑Z≥´Qüo≥Çüï€=ã◊˜!Ê«Å’´gIqæå◊Ù£5Õ)æ1¿CÒ€˘¿¬º/Ÿ¿®ËMl±º¥VWFá§°ÏRúEˆ∑lé4iR&—gt®ß◊m∂f'íµM±n˝iÃ≈º4fïpPÖÜÒÏ§Ôk(rÙÏ~àÔû0l:–f©l!¸ÕéYE+¯±aÎ"H¡˙ñˆ„€©àE1*È5¯°€e«{d¯,≤»W‰ÛL∂RIS_%„Àyw›ÂKRCQ≥úäÊéï3µåå-R7VwÒîÎTñ2 º>=EÍÆÀ„#üäà…eÌá!?%Hcñë¨èÓØ=àÍ$Î)=µH÷€∆V¥Ä:I£Í·tƒÕÌ˜à¡+=pëî:¬Ë\öi*˙»g¿.ü§@’ –EXÀm?-ù!ı ÏèÇ@ydDEÄçm^Êhå±ëΩEBªeu’P?à:‰øb‚B˙{´ã∑Í •ÿ[& +Ïù !Y±häè«NWÍ4ˆF⁄0†
ˆS<º«û•Äã	≤…n¸~ÃŒeüdã´ˇ:˛Í©Rµá±∫j C˜s£S›€ zt˝¶ß˙£iß˜~ù”+le=1tí5ÅÎ◊W7ÖÄiyƒÙ$rò¶sƒ&xë{ÙDf*éÇ¯Ê£}¸"ıûsÀDè¸KÖ«∑@ŒØ≤JPŸBLûÄr0¨ÎyÏ·lBr¡eô@€˘Vµ≥z!r˚˘0ô[Ò©k»]å{jsiHØ}OùINQITË˜£˚=Ùà0c”≠I1ã˘˙QØ◊ΩØ‚“+[lC/°ÌD†;À¬r£àzÑ|ÙÕd5GÒtêåÉpYWTÛ∑Mrûı ‘˚πÜ√ähß≤∞•≤€‘Ñ0∆tå˙E·L*=†Ò6§Ò∑.®â“¨©8∞Ò∑
⁄äü∂vx+S”?>úKaIgA∏+TæeÍmzZä›-¿*Ö∏_XêôN^é„9ÍäÛ˝,	to°æñkA§È÷∑îL8‡$™«ÿ‰-‹∑ÅK5°IÈ¯Ö ï~8Up§lûä0§rùn x≤jÏ‰|KÒ]¯¯™xE≠u|¯ºn`~πﬂÀ¥Ob?8ÜŒ@üf…Ô1lÿòΩà.”≈ú=ãÅ†R"¬√ÈiÍJΩ∑?˙+s˘†/Ê!Áxé”h´ÂÇ^©`È˘YJ"xGÚ¿e§Å_NxI‡ù ÔZ
ñ–¸¿¿Î%§K ˛™$?í‹o©ﬂù ¸ÓX‚W&Ô´/Ì[^÷îÁyﬂ¯;ïÒπ.åNpÏ€	Ú,wŸ[ ıXπ|.‡cµÑŒ√öóH„jqÂú¸¨'ú+”ñpDı.¡ÚÎÔÀ»Êæ∏dÆ\.:p5er78ÅKÀ„iúv≤Œ1\F"Á=í?w]‡hˇrÑsuDsa¶¡À˘Örı‹∏◊CT85±2YNwÎÀ¶JJRÎ≤˘Ÿ
ÁÍﬂh∑ñ«-#ç+ΩyjJ‚n"·]V
ÄÆ[‡—õCÿœ\,∑¨•ﬁ›H‚–’íøïâOÜ™ÀIﬁÍB‰2R∑ø0ô€R∑∞]¸Ì•m¿‚øa\%-~c≈å–ì#ƒË¡`u‚ü¢Îëä´ı˚ˆ; ì˜µ¬Õ"Ü√ÿ12Œy2FuHˇ’=ıVjcaû]Ì∫⁄(4_pπ” OÜv¡ÿì<∫ dà¬F˛7∆g∏0,üÒç
áX‹Eõvå≥ˆDπÚÃ¥°%˜ßœ/0e|ôı€än0ÁøòHiZè“´bbfÍ®‹€Iø≈,/ºèª‡Âä-´*ñ˙é6\Ωn·2>[ÒË{ÿ7Ï©Ù∑~‹m,È•W‹Ksï◊l[}•ª‘Ä:Vvä‡‚¸ãeV∫‹¿gPL_,Ë·óZj¶ÚÚgY2d¯ﬁ=9Ä∫ZXÕú?ŒÖ®ﬂô>d≥‰a£1x}U?ÁzÚæﬁ,y∫Ú‰$EMãœó´!ΩÒÎV.#¬Üƒ]yruj(:ÛÙ (c!xGèYπ±Ì[Òä/è“|~Wªc‹»ÒPﬂBPùq<=õèn∏Ú·≥xªPIåK8f‹ã≤!	Âá;W≥"C´ål‚Àí⁄˙ßÖÙ‰5†H0±]£ænÉRò\îB‹îñ˛Ñbƒ3˜∆A∂2G™îÛŸ3Cæ)‘„ÒÍ`ƒ¨Ä©Ëõ8∑Á…$fò“ú¢„ΩLP‘ä2Êßx!gA‘ÓÀ|Õsë˜	“y4ùè/Y4»“<gœ÷ü±”8rw§!åÊ>§@ã0ı≈®ûÛxûAì	„⁄1
x$C`¶Í\¢qz∂àÛŒr∑r»?©ƒ?FÂDæﬂHœ¬î@QÊ∞∆Û·P˚¡(~Æ"€èºB´Ûp3Ó˘]fıî0HZjb‹˘-!Ãj§ ê‘j(Å»¶√ﬁ4ñ§ˇ∂Ø¶àº@¯›0m÷å7ie‘µ<–*ÌC⁄Ã/∂—⁄¯¿#B:X›qqÙá‡}»ÙE"+≈äq%º±‹ß”ıÖ^[ÜC<%·=æpXÃ∆ØÛÙËÈˆÏÕ·˛wœŸwØ_Ï?≈~˝¸Õ·¡·Û}Ü·%‘\c´ógÎ{E˛áˇôî(!8Y c∞hITñ2Ÿ€hÛK†Z7ÜÚ`‹ÔéO_¡%√y„7\3}≤A*ô(a‚6˚^ƒ„á[d/R≤ÖdAO>Á·aàx≤îI£dóœ9XÈ± kHxSj÷Ω¿À∞	§‰!Dä(Iej§ë|ıàSLA…£,g”JÚΩíöâƒÇîıBÆúO|qÖÉaQ4_1ü^!uÙ!w.B&pŸÜM∑ôÓ0úN”π™œìÓ…⁄r*+√∏õ{›{Ÿ] Œ'≥¨9Y'-ò\[_À∑ä'*¬®q+O ÖGÓ$˙<ã.„,4G‰?0F§t"ıÖQæ{o√øøˆºótw’«‰:NÑπDIY:aGã˛8x—©Îÿ{⁄d´çañEä4Öm@('CYYéæ‚Ü¯ßD∑á˚xÈº~√ˆﬁüº~˘¸Õ1‘x˝Í≈oË•º™∫GO˜ŸÀÁ/üa◊≠¸¶<´z’eHø–övºÈâoeM≥∏Á√Ÿ,ﬂK·‰Á≠–µ¥®Zw¨îqﬁGT›Qq¯´ÿW6¬ÿzÅ1—«[é0ûD…8‘√s˙∏LeqZÏ-â12~ô¥©˚®‰¨–9HyfX~éáFπÂﬂË∆áÍ˛A∞<ﬁ|y~‡çT1LrR∆Xñk%|}π¢ü:SCﬂ<}ô√îv¢ë&Ç±)B~ã–%ïÒKD®¡E≠Ao≠Ö√úTŒï˙‰÷à¯€emsa|møD©È\eˆ∑Ã˜qEÇhc›(N»9†É®?éÀåÕßA°Œ]ÏZìˇ¢DÜj¨ôäÜ„ôÉKxh1ƒÄ¯êk¬âê:´Rs?*„√ñÍ‰cg'ZfΩòAƒ¬™˝◊Z^ˇ‡™É¥÷öy≈˙U∂Q¶%¢Ú¯Œ#J¡cÀH“≥qX0«Q{4üœÚÌn˜‚‚B|Ì“IwE∫yeÉQw7ö%;kﬂ¸›"Œ.wææäßÉtø}s∏óNf@XLÁ6ë5ïIÍ-¿¬Õ‡uWRJ≈M¬(WÉ©‡¯√vV> \L?ysOèwV¶i:ãQÃ;Ma≠b∏*≥≤Ù&Ü V*(∂z∂°≈n»*ı≥$U0wÑºÒùZilKŸ‰/ÌIW<˘1!u;ïåçL8àl]æ#ÿaZ•Pï®@ ŒDH∑t3iè†§+»†“Ê;^¢Ÿ—$˘…|‘l‡k∏ëÁ‰∂ã#hﬂΩ¢H‡/ˆA†/´‰°ÕLSKéóøÍı6lıﬂ€™Ø‚|PÏ:
'
ÖHô¥§U{=⁄=ÿ•»ıªq⁄/ÉÈí∫Å-œb¯9àõ›ˇñ∂sw˚∑›ﬂvª´à∫¬7A…q÷≤ŸâSËµü¶üB7?Œ/í˘úß‘v¢éÔ,ã&ı&Å≥Åõ∏ÅÎÀn‡k≠OµíÑÄ”Î;¢Zué©ﬁe…Q’ä·qµœd¯‡πb„ÃàH˙k=}ÀFHià—TRAèe…Ä“πÇÑ)¡Â–ULo∫ØEu∂UÎ∞dWãR∑€‘¸”%±ï∑Ÿ”>ñÍ-‚’ëÀç˜To§ŒÆùñÏ´^Óv;;CÍÍ∂[{(áSΩπ™ËèªΩUîôˇ√“k b§úÍ˙D›Ä÷6^wÃíÈS˚Q8úÚj!rOóT˘≥;.AÈ›Ç¡d≤'Ë˜_CΩX}"ºÚ1π!Ø$ªü^L«i4d»ÒF”KåëŒã∞Ê—˛A´éîÎKp>ÀÜ‰⁄¨gáj¬Y9®[Kv∑⁄á™˚¢Y‚j™ÁC.‘Œ™QE˘âßV¯˝‹Ñ(ΩÎW%x™!!=R˚PO4\™Kß›QzdB
ì1zﬂ›J–Ÿ¨îsr˘fu ºz‚ÕJ·\–`íj3g®jÁW6dπ¿πXÒJüCTÄ6$ö¨…gËÙ2¨|èZ‹Ñ˚"Åp©•á’,m°]$år^P÷XΩå±TŒ√ö◊ÅÅJ˘k‘JÄ«:÷w´2˝≈°≈óëÌµlAG2&gi)“Í›R|Æv·ØH±Ï˘+R¸˘#EÀødXÌ‹RßõTuªb∫GY<¡‰ 4XB≥–≈TÖï9ObÙâÚôc˘ML»ﬁÿÎaÇ¨Êiªüë]ófZç
7e¯ç≈D¯E@£’A‡[∞Ñ5ïΩä|)´ãÇÜ_åò√(≈CL7º`äÕo	%î8Z“ƒe£–}Œk∫Ô]¥a\£∂68re¨P°W*Ø&ü€—bû÷¿´a7˜¨ëˇ£rû-∆y\‚Ü—ÄÀc¯⁄3› }
4Ww3|Caµ0—€èÁÄrâ˛Èˇó≤‡¶Aπél∫]Å±è‰ﬁ÷0Z±Q%ò1çeº}%√ÆÉí—îN% 'çyä•+ë–Ø2T<ÀàM0·U&,´åò§UFd¡*π!	N›ÔDTrcïÏªAøºÀPÆº≈Z!\ÀÜu$e„(ƒH≈y‚"≠DÒRïS*kÂ≥Øπ:Ü£õJk38ú7Í€çB˚„¨;UºFl‡∑3\ºÉé!ê2tÅ#ˆväë n&ÿW≈Á’zÉB„ïSœza¸4çE–XÒJ˚`Vœ£l ÷⁄/a;GÏ ãcˆ.∆ΩdÑì[a∫X‡«vd+4á·Â8ÿ”8≤hú∑òı¬NKOi»Î•9Oµv»øa∆5\ÁLWå≠™√”]„7º∫“◊ËÜ/X|·ú)|ø.ﬂ’’[≥xÌ#;7{ö¨Ìç∑—c∂Á¨cÓ!èü–G(@ÎúVªí”CﬂƒYqfx¨Á˜á˘ﬂí)\$ˆ-Ó°2÷ê X≥]É√Ùÿ¶çÎ4á»JÚCŸxãF≥m™úû?Ìπs>˛.9ùóQ"}ò‘¿%E|·ùm⁄‘ª|ı5e	⁄ºDK·‡§Z<È"ó∑UÂËòc* .%ç˚.û≥5&p÷õÁœ5úuØ$tY≠ã¢∏%1◊zE(+?iU*%∞@Î€ôÜ‚x˘–ÑüÏpm
ˇª2$FôƒÃª2às3€¯Ω$üuFQéë‚akW7@…RÔπñ=AŒyV–∑]~/¬:¥ÍñüV-2/:#8aGrAó3d@_}Ç˚à˝0äÊ˘”Ÿ¨ŒÉâLb>PÄƒLxïWﬁËvÈ‹°"Ú{Œg›5txâ°J)¡*+Dé]]^·ghvE6«—F‡¥≥á”shﬂ∑Õè˜FÒyñNﬂ$g£yËLÍ(ó:§]˛LÎEºÊ1-#ä
ΩD““•}åŒ∆E@÷$Ê˝\LeêÇl˝˜0Ï1=g«Ò¿ÚÒFƒ¡0[⁄BQ◊™/ŸPõy:5\HJC-÷Ω¡RzkùBom==oÀ ‡wö®ˆ$Ø°;ró†h(·ht°5˘	®€'¬¶,>ÈñNt´∑á:¿¢_q√5P}õÅÉ¸L¿’T´âóöÏÔ•¿é‡ÇQX¯ƒOå¡’>ü“;<Ωˇ2ÒÁ˙Æ;èÁb pRsb/N¢~≥°V ?ö‚ÇŸã8¶nïÚ¯U∂∂°ÖeZd5Ìπ·F¿YJ˜8"T¯⁄§ÏœÍÁV H,ü∞ûWEeœa+cÃê±’ÍL¢Y≥π(»ﬂŒÚú—y°—[tä_h+~‚ﬂYúß„s
ÜÙî^6ﬁ}π/J<≤ÑOÒÂŒ’BU¢|p«”I≥¥™ùzÄÒ®Ê9TpÙè]q°πúñ«’c°º;‘µ·ØVi˛\¡”ÁÉvÓ$m^œ6€f∞o˝xΩSƒè|í¶ÛQ£$Y√upYÇûä∆5†K√âÍ®83¸	JÇ\ÓÔçµMûM|mã'áˇòOÌ)Äo[‰ÕW∞2öVbÉá»Î˜◊é˙‹i·(´sÍûØbçÀÏ~äÛRÆD~úLŒXûvä◊ÄpÊÚ2◊Ê‚Òÿàbç˙ø
5yò2Ÿ^ï˛ënz≥”-ËqKg.6+L∆n¢Ï
≥ãkä],{i_4?$≤òÛ:¡CŒ—ÇÓvÚŸ8ô7¨—z◊{Ovk8Âr€¥∞*Œsa92ÀZAÈ· ∂q |sgóí∂*Å5!µ¡•˚#& Yü-XUb›¶@Ü¶Ÿ'î¯ÊpÔ©õúç‚,Óx’KÑæ–˜ê(Â(~b™˛NhzEˇc“Ûe1ÙÍD.ÁÙº∂Mﬂ∞cﬁ.$∆pI‡€¿qƒ–øpÉ9∆√z∆íè“ã,Ma≈ ®]J∏
kãlã[Jhhg˝ˆ„˜w?¬S[–r’Ùì$ú‰ö\‚2∆C±ò@xäás_ÒÜ∞*e_¬ñ0[f∂ÇÒ7Á§|¸0π¸êÛN¸T∫†÷r∏Ω(ø‘…„féòÏù'¡Yë™≈ÆT¶¥˜ﬂ:©fÆ[∂:Cy D]Ç1ã…c™µ¶ï œ^"OkïaIRq:ºu∆)÷j^æåf–*L‡Ø«<{ÍJ/üx∆gç¨§√Ûh0jŒ¸[C9ÉfîjeFÃBŸx¯xFQ˛Pq„yñ¶„8ö6gDŒë†∂gù˘h1ÈO£d¨ﬁú'√85yˆëwê‰8À◊Ÿõ8Fb⁄ªúâkT≥!zQo3(Ëº§uoEìÚ5„áIçÊ—˜`/~v‡è√8o6æ¢NZº	ﬂwﬁ_´%äê…+ÿ6T˚ø—ÜÈ~=÷∆;‡©÷xÅ∑3¥Q«â…KãÒ©~StßÔüü¸ŸâßC·z”ôÃ6ÂÙ|ü/‚˛ƒ˘^Løª†ÓÛ.ÆÄª≥c
p`Ê√ã{Ãqmõ"æ1ÅcÀüöJïû»(ø f>"«9ÿ˛”6íóDq¨üfz¬‚7UßÁÙy”ù™¿%v3U,∞Sû¯ﬁÒΩ´,¡ò{x√Ÿ√q)Ék&>ùøƒQÔ√ﬂùiz·‚π ?≤F(˚√ïû2≠4á7>"ÚÈ—ø=apªã'úTÃ´V?ê¬ãkëÀÜ√π{8 ∞ØcgÈë»™ÏW4£å#ÎF…x “≈˙ÁV—∆÷Ñ¯fB€	‹¯ØöPó¨à±s˝ÕŸ¡˜Pk4ç∞‡Åèën’°∏à¿åÅ‚•}íLb?ƒ9ÉÊç—∏EªeCÁEñÀÁ{Îıπ¡îüÄŒœ–xœàtby Ê£¯í/ÅKÄ8_2b˘DËd¯»÷7GBñKù≈÷Ådm}r°„…Î=Å. ∑zÚ\"ƒ¬¸Ûc<d!t Ω7õ	˚ØÿVöC]ç”¸ﬂ≤Õ˚˙ÔÜzWRﬁ‡Gq6âPÆƒ/£∫v’K:(>Â◊…å¥èxª—âÚ*uwÎıXÎ5|iË7hL6E˘Úé;ò]\R=ogm_¡∫Ñˆ®≈∫¨πÅÚY± ﬁá$ŒêË÷á–¥’ÖÓZº©p;( _‡÷≠?$Ÿ ã@c4ü£C¯ã◊Wåî~ä˜ÅÜIOO·˙Ñ®X ˙ÔØú9‡¸i∞w.(ù	âdRW8
„ÂA—;wlÁfR7•X@å®î≤ñÈ) ,4∑&™\6$H$)bu(ò˙“Aï®,>r√Ág˙®¢~ûé$w“≈uÌ,ùsìê2Ì|ñ~ﬁYÈ˝≤µ	ˇWÓ.ã`4Ö≠ª≠m¨WÑÂπ¨.ìÌ\qx/˜r–u∫˛∂ Uº-Ñ©hEBqiªº⁄òÅ}g˝7JJó˙¸"÷Ã2≤¡Â±-–ñ*«gô•c“äêﬂπ¬ı*øçÁvÆÏ7uÍøH¶Ò ö¡ÈEÅ€˜˜q]…gGÎÓ>Yç‰5¥5+Ò„-‘å]Y\~•ÎÍJK0&=ŸèR@¯óË‰ﬁÆæãqçÑ9§
ü{∆µíG±∫∫Qïuk)9*<ÚK—…‡óí|b≈K>’®òTæ˚€Nÿ¸? /ˇáIz˛áÙÏÏìÕÛV7i’§!‘€Ÿsïõ_Ωu¨hd˜jwV&Ò<FÛ®™¬nªaU£„Ë2?$ã˝[Ó‚œ‡\®Ì¯eüâ2qÒ´"y⁄˝t>O'2§⁄˜"ÖõÓ,ví-Õ«ªáàØı(¢Î&ˆ.,ÒLº≠+Ö4úçä!N¯=™™E ‹if1≠Î«ßÛõ-ﬂù)AÉQ'sÚ‡4†¶2Qá…YÆc“≤!ÄÓ)U OÆı(4)‰†~ïB>&tlÜaÂ…˚Ô2ûw¸∫Isx®ê–èÅﬂP“PO˛7`ü(ì,ŸIñ†ú#gÕ#2Å≈;c£¬√ﬂ«Úi›µ£ì&–∞"⁄‰ÊÏé‚/‡àe€ !Ys°,uD‹nKpè8yÕhÀ5“∫{˝¨0€5Ì?(‹πÆπ≠ôú⁄ı:,◊Æz≠}ë</∑ç)À_’ãz—p›…_ÂËI)ñN~#€KÆßÂªE	˝¸vkﬁLÊ7óå¥)?;pQ·«~π‡“Ôı˙TÉÀA2ˆ=cF∂ï“ÆN7cXÏ*R\7F»n	êR50˝7l?…yN¶Ωt1Hk>[\¬äwU¬"”∂úÃı î€õBèº€ﬁ4àﬁDh+w@5A§êîπŸ”*”fynÁ]∂‚ßÃÙùvéY- LÛÊ”s)∑=™sø ≠Ê¶‘Ì$û?”¶_÷±Õæv–'Sû#∆¶%lË);U˙Ω”Í|<JgpNœËî‹,xõKD*∑üóóÚ¯âÛ‡ßÒÆP-F∏Ω;ÈYΩNﬁNWF".◊µF˜˛Rn” >‡ãeå¨nR(«$-à°Z‰,)qˆ∫ŸK∏Œ‡pMc∂7éí	k«„Ò]b*ŸªË¸ü7∂∫wcl•Ï˚—áX∏ÃÂÛÍ“0ó¢=ﬁ∆röÖSr-¨%S◊˛à(KÕ‚6¯ E=É(úÛEyT.ápÏ„∞Ù†ÕwYs®ïŒ†Ô›è\ÂtnÂ‡.ÈÆ}≤«UJ›ËÔlãV„Ω¯ÖË»‰\œáÙ, l9’åæbﬂÎö≈”Y˜o≤∏'€P µºU§∂√≥=¯WO˚"∆éu£ñU™ÎK,µAûWõË4&⁄E!%§Œs˙É8à.πˆSaâu3±Z@≈Ç≤ì@bèü∑Ö„"9°tßIÿ(övÇ∑z∂Ôöì©{” Î¶'t§Ä€™öÎ,B˜e€2\`¿“;™{≠∞Ωhªeúã0˜j{®“AßûwO›ç·K0©øl¯‚ì¯ãáØ ªÎ.2ı√’ç·IYRˇ≤!JN#SöÙﬁãÃ–é¸xwpUå®\q“j ÷ç]$8¨IsW›?æËïÀÅo"–µ@5:èán¶ï*>‚g∞¯ÿ@KÚ)¡
∞Õ“\CÖÍó¥Ù“ÑYı™dÒYlÕ1îC≠«≤ƒ¸≥4˝4Å∂| L÷&‘0j
ÀéHr ﬁ|Œ˛¸Ôˇ¯_˛Ûﬂ◊%á≠ú7ÅTÃ®ˇsÇU9•rh˝≤7>?˙ÂçO∏÷ª»©(¡‡Sæòı¥Z‹Ÿw®Z€n √xO)™B:’ˆRÁß˘›xpû([Wä}´ êØO1“”I˙	”≈aVä.7’+ª/¸Ê¢>©ıH÷8-/òô-≤ŸÿQ˜KF}É‹.∑4yãöÛˇïJûj9bnYÊßéÂ7¥X)’êÒCÜ∑<‚Ütˇ ?D~®,ƒ∫NdÿÒ"#πú«(uΩV\ü2[/¶˘{8ë>?–zë—¬A… %6æ ô∫X4mÆK@"≤†CèØ7Ò6>æÃa¯æ·.Õ'˘™.7`Q·›–-/íœ~±∑¿±Kh ¥£˝œ†jÜ†·`˙∞∏ﬁxl€ÒôwLîdi:_≤$œ16ƒyçYJ√À«…,Á1hIÃÀÜrúœ6GOÛhéõ<ß61Î£0w#’÷ég„∆õXGÀu;Z"üÍzèT5√é,ù∆â/q("¢ÁÿÜRZU≈p0-¸⁄á<—ÌWfzºpîûıâh“^úc"Y¥ÁÌßxú⁄Ïı´øaØﬂ∞Ω∑«'Ø_>slﬂ@ïZHÓüXyMÖ\÷Lóë£«ä ¶5Â¨nΩpF.ü`DÎu¿cˇ)ìßhy‡¢;éZ¿Øœ˚ı#õ˙BªÔ≈Í8I¡Kë_ÜÚjºhØ#bÖ`∆“°[ÑÈÍèÖ≥ƒ$k?ÑÁØ˜<yèû#◊≈b8jCË7€®§ΩiÓ’_≥6é7J—k˝◊™KkÁüjõ|#Ω
dπŸm‰U'IΩﬁ_qZÕ´≈L¶ÂÏ Ú∆˝@°( I_∞–[>J≥9#ìi_p3wü°±Õj™∞mC√$jΩ•
≈óñ‰Ñ]H -#àR(◊<Ω%¸ú[ùY4<∆ƒéÕıU÷Ë˘sÂñ–8÷⁄Ãú‘Ön«çÉ§Ì€Vhj%˜WY“≈ÄzØvo¶˜·	xÊèõÒWå_ÅÒµ¸?å)yCåOımåœ-¡¯áOAî_íEÚ«G˘4‘/ÅÛπ˝L4ƒ91tÅG»ì3
È#˝¸%`~B/>_ˇıp_˛‰ó¿lx˙◊+‡&WÄn˙Û∏ä©mëØnq»&ÏÎ@5]Œxr˜jóÇn¨[† ›zˆGøéˆæƒ≈†2„-0Lã	¨xé‹A ñÏ_¿ù ÿÊØº@≈KØ¿Ày·23ÚG!€ªÙ3™v(‚©NµE∂H ë'%dyï⁄≈L·œ‘^.Û˙ëc”◊˛€
îY_”†ö„±±úœÕï°@ÙV ı®¬üˇÃY6§ï8◊∑–vÈˆ:” ‘	\ ÷™vÏ`¿˙∑i˝∞¿¡(Ωeé‘ÓÎÕWﬁÖÀ¯JïV1sJ¡{£({:oˆZ<po„ëÜóI?∆ŸËãÔﬁ,Kd∏lÏ÷‡“.È7(#SXàƒÒ–óƒìª\“üíTêæ+ûæ‹"†+œ=#£πŒFÈ<ÕWuë#)˚*#ße$dƒ»@Ó¬eÓeü‚iØ`¿ÕÙŸgﬁÔS¶ª^è˜˜•
Õ˚†*cá'3Sçù∂∑N
¬p⁄úÄıãªﬁ=8/j˛ Á ≥HÄ7{„4~xõGˆD–˜˙P¬A?ªËÌ ÔﬁDLG:=^Ù'	‡·Q4é„#Ófé÷D;◊≠©…Ø±¿1G˝ÿHﬁ«ƒIûƒD1 ˙U‰Ñ 4ˇÙ«ˇ˚Oˇ·ø˚”ˇ”ü˛√ˇ¯ß?˛?˙„øÒg1~‹•ëFùLgãP<~àpx°3òE<ÇI≈ŸŒ sÇµ·8b®≈›π¬Ç4ï–U gtÑÅ&vÆbqFèdïf‹·…2x “:!œ.TRﬂ ëå
Ù•BiáUœ6µ¸=¸Qæù.Êîï¢IÒW»gê…õ˙°º∆Ω3.£œ~–ºÁÉ,·!, úˇØ?˝Òˇ£ˇ”ü˛¯ø›ñ±k∏è¢@wYzëÔ\mÑ`≈ÄÂ2"ÈãÆ¬-óbÜFï´ÏÔ—té*˜°HWúbÍxêw:ù`/’ñ|QÈØ†ø<Ë{>¸¥êˇ¸Û3ÀåŸL‘◊eoﬂº`M†
O˝xU•r[Âñ:gY4Ye?»4—Ò|–˘2ò~ëçó@Ùe√	3€Ã“˘ÔÄ'∫îÒSΩc"W	iπ≥¢◊¸ÎÅ˘“w≈MRkî‰ôøõX¬ü~ØÇ‹≥¯Oê-9Meº™8˛(>$ /ßVï˜J&)êtEå◊nîppm1®4 Áù8À“¨Ÿ8«h™á,“»6<∂⁄≈«NìH˜íX÷¯ÑR%OY<bøégg1¿…ÙL–Ê∏7°‰r⁄î	5äá˚•ﬂa—EîÃYŒ˚íÄÄ°˝ü6’≤Æ2}MÀgN!œ°ç™•g7…Ny≠Ú∆ÂéÂ“∞6˛áˇ»û|&ÃKá˜™v®l˝ç4 •≠ÿsh|≈ìÙ≥ì≈~5I≥>∞™»Î5ÄëMí¸ïG”pÂPgU„¥&¨O µr¢◊ ØS
Q^9ë»ùF„ºÊ¬kÈQ# gò‰QwÄãıvÆV√¯m6M?%}∞}>Ë√Üt>!úê)ÿ9ôÌÿe ÑQ[~ Å˛ˇ   ˇˇ =#ÔxúÏΩ€rIñ ˆ^_·ï›b&∫ëâL‹H¢ “@ê¨¶Ü∑»ÓÉhUÅÃ √»å¨àH(4ÃFkz—ÀÓ√Óæ»∆lek-ôÙ"ÈqÁE˙í∂˙Å›O–9«/·◊àH’S5]YV`¶áªá˚Ò„«èü+cÏ:)éggqQ&≥≥∑yvö§ÒªË¨`èŸÓÀ,öƒ˘:ßQQºé¶Ò^Á¢ø¡Œ·ˇhñL£2ÓÛd÷akèÿ€=öG˘«4.¨˙É-lÀ¯≤ÏG”ì8ÔoáÿÍÊ¯ÏÛhˆHåå]$Â9€±ªF•ÅFªk'ã≤Ãœw◊&…ß¿£d6_îÅ^À´9Láﬁ	‘òß—8>œR ’^ÁŸ¨åsvÁ%±ŒÏWeÇ`˘’4ÀOˆ´ÄWF˘’Eî«+°^?EÈ"ﬁªûgE˘;—[ZŸÏ‡<öùAÌòÌ=bE\æ’Z¡‡egq9†.WBΩãv∫HSvr÷/R\‰≠!õ¿“Ó@¡˜…l‹0Æ=≤ì,á9ãD’ı°¨ÀK©˛}(Ã≥≈lO˙ó)õ_:ÃØ˙Î'.VLwËk1ÂE' ‘èº'˙M˝å†ü”lº(v≤Eô&≥∏?Àf±( °CÌ«	Ló0Õ;„52,Ò<π^˚{≤˛ÑΩÕìqÃﬁÏyßìÇ˝fÕ”]ËIÍú&≠Å†©6√⁄»gıh›Ñhı`c»`?å„> r∞’	 ∑5å”4ædIOã˛8&d˝áÏ˝”´˛I\^ƒÒ,–èÿízW¥0«£—¸ÚÄ}&m1ü«˘8*b}√ﬂóx°ïmBYôC\¨ã'ÔéÓ,ö˜G¡Ÿy«u—ﬂä≥©`-ëŸ )çCº#ç£	éaS°c5ùŒ£˛Õ?◊FàÒ q•±Å"Ω?ˇÈ?˛˘˚«?ˇÈˇ˙Ûü˛ƒ˛¸ßˇ˝œ˙ˇ¸ßˇ˚œ˙‡ÀJêí’“9ˇ:<.Ï∑u‹mCˇ¬0·%<Îµ[)É7Û2…fQzã9’—f}œÚd¬Oú•EÑÑ£˙πAËﬁºøTJ£ì8’ﬂwíf KÅÈ√
ƒ@Ó5Bµvh”* õû Ãk`∆ÿ´d&•ß(Ñ(`Õ,pÂ1PÂ‰S\;°¢ì"Ke„¥Dp≤2É]∏∂Œ˙∞_gú“_QÅπa,®l9PAj‹fC5 ¸√èÊŸë3tåÚœ4ôÌuÁÄ¸e<á©œÆÍ´ß=ùÓ£≠Üûµ£ñõV;Ã¯‡«†À∂mt˛ÒÎÁ@cÕ3˝·ñzz0Èo≥yNòtf$yΩ ^|Ê±^qê5˜ûÓ¸SCmö˛‘àGt˘ÒÍgC<÷7ó —ÂÌâáh˚Ò¯Öx¢@ÑΩáÀËg–å"N„q›V”ò0ﬂWáu~¸UMóA‡ø˙^˛t0∑ñ$fƒüãÂË<….;èﬁ¬Ñ·ÀÓ∂DÛ£ÔœKﬁ}Ω]Ø \ıﬂo—…€$«º˙zã.˛Êå∑ˇõ≥[4~óÕxk¯“‹.⁄-∑†¡GaâEò‡¥x°0Ñhy|
˚ôã
ü√ˇ/∞∑√¯4¥£Ò8ûó{ùdù≈køY˝W˝˛Ã'ß´—|û&„∑øCÔ‘∂Úy2ôƒ≥PEã|\cúÕäí·ÿSDè«√_[&ß¨áıVjzgíp!ÄxÌpáFÂ∑y¸)â/zÔ_∆ytËÕ…? “¿oﬁOMG°∏Ò?XÛ‚cD¨µ±∞«¨Ws™˘xF]–ï}äÛ”4ªËÛïC"Ã	‚4∫Ïü˜∑á±èJâü≠©3 -¶W˝ıö£OÕÓÒ qùÌÌÌ±ÆÖÜ]ˆ«?≤™ﬁÊˆx0ç ÒyoÌ@º˝ıZ≤Rhƒtﬁﬂ"‚iúGÈDÆ ¢á[√µM¸É¬çZÃ•ËäˇÆ=˜a`8©wP››hc	)ê 6g&Fù:¶à:ıJ•ñ8
À|1Éà	+.†eÁ—µπ7ÕåXJIî;µ¶ˆËÌ”ÁÏ)ú¥SÄ€/Àh|OÿˇÙÔ[‹4ÍX>∆VÿÎô¯6(Ä‘î≈íÚº◊%Rÿ]AlÎôìe˜Ó1@µﬁtæ˘«ã¯d˙«iˆÈè”M¯ˇ„ß¿æA•jCMVVV∞U˚ÕK†! ßY4ŸÎL„2öDe‘aE>ﬁ≥)¡íÕ2œ“Ô2W≈ã2.l
˜Ωâtµ≥“gD¬ èÅ‘¢¨ˆf7=å,J·åø:w3ò˝◊5’åîü£ºZ›e,†<˜Æ{+ı~ÙCes©=Tº«Jc´¿Y¡?æ{>^Ô◊Yûúù√u_wºòú#Ñwπ◊ˆ?…ÙMaÙxëYﬁüg	ë∞€1πÁ—‘.qΩ“∞v◊°j≥÷’lNÙÁ/èeÓm ê√ÿ∆X≥◊ˆf•¥Ñ£°´&¨P¿:≥Uπ∫SÖOº–Í:Cçµ2(cJ«S3ÀãÄNi›B∏•.Ä∑ƒŒ» ˚4UbÓB]âÍÙ˜s$«å∑Xcoœ≥2ª5œ#˜}Áè@øcˆ%≤=pª,38ªxp‘“›FLlèãwéçø‡cpöy¡i%Áã|û:Hy«)‡‰Ôëq®eçö∞2∏®uT◊´kØΩ;ÑXrœÒl"`?ß£ãµ4a>
\3B˙ˆ⁄ç“fã¥f‡tQìù~Sú«≥ﬁiîu∑Õ%xàe˘á Ô†€A\vµÿ7Üà”⁄∂#ˇ∂}¿
¨˝÷Ü±·ËA4«~ïvÉπQ4('”$hV4IäË$ç'{◊IÒvqí&≈9Zh¡r¥ 2@‰,è&	–ó~ôısvögS~¬‡µäíŸ$9ÀËbU„æ*´ÍY±Z'XŒ0‘#Ø8è&ŸE:iK%v≤y4N ´~H’Z?vµ∑°›⁄”€k«â•cWΩt0‘ú€°÷_ÉÍ«yÑdÕœÀq1≈mÜÂGΩ∫≠ ÂªkßY>µÀ≠˛ù∂∆s¥»¬yÏà\œc∏Çö¶X^‚Ø*àqõø^ ÉDù¢$P∞7'ÖÓ’Éd≤2òFÛ]ªWY2π$
m/‘.vê€ôı«¯ä_\°+î¯Ä?vüi¸€ûŒÃπ5≥æ˛iú∆%è:tå y/Á€õÅÁÃX¸…ò¸Qâ˙áMü∏FQ ?˝≤HËˆ(˙OÓ∂_œŸ¬ßjúñÓ˝1
 ≈πHKdÈ≤á´ewa!˙äUA√Ü4ûùïÁ$+˙xe«⁄Ô™?⁄6åÃ¥%ûH@ßÒ$YL=åƒÎåêœC†©0OVû'Ö‰ìŸ‚˚U\⁄î≈≥◊åYœçü™‚uD{ù–l;9p{E«ú≥=[iÜ∏mÃ•¡vkùM'éÌ7Ë¬≥`…ùIúW›…µ:$«’Jq6¢0)àë%—€@YÏRwÚ◊ ∏ät1âã^ÁW‘0Sê ¸I$`ïEyÓß8?¿÷H‹«˜∑>õöbébÆ„ák£Ìï1ÔC”¿-≠{dıJûµÊ∑æ£ g&Nˇbj·û”•|> ÇÇ?Ç]yæòûÃ¢$}ü”R!ÓßHtŒÀr^Ï¨≠ë÷©,f≈`s>g”µ9^ßaÉéF£ÌıÌ—˝Õ˚õ˝≠ìıQ¸‡˛√x4⁄x- lO®®ºwöî{„<õﬂªÿÉi‹˚˛v<«∏ ípJçÆ„´Á”	8ÇIùw¢Ø86Y‰§£¿+_í>Á‘äqµ—»√yNsß œ“£Û,/Q‹pOùDÄRö‘8 ÌV4~íeiÕz´Íhº(’∫e6˛xTFÂ¢‡⁄ñlQ~ìù~CÂ›ïêÏ¡¶ñƒë€±ÔQgQg‚ö«$Î_{(8Xn ‡Vc[±®&nc'hØ|ï&Ä»)ÁtcÒ[,+ñpæÄ€XËÆH⁄Ö˛óˇıø˛óWkÀù!ƒ˙Ñkx-ô0ólöÃQÛ¢ˆQtâøoª0R‹∏2¸4|`o»ãF˚µ©lò7›
Ä˛áÛœ◊∆‹a™˙‹·ûÌØç7}˘õ◊∏˘xt£∑…o±Œ∑ÔÁe∆Ï∆5bœ˙π2¥…éå>iı‡	ø%ôG»=≤OId¸∆ZbA:èBl{”k5πÚ&gí/Y:2o¢∏¬ïuøÿ≈UµJe¶çr¥˘—÷›ƒÔï‘yhª4Ùw⁄“hM@º-˘ìÆ^”ä ›◊ËË°è∞PÉæ¶Ù&»‘Rüøã£‹“;+±†¢Êöì©4˘«©„+Ç!_b˝HzÂ£Ô∞ãn91`IPı|˚πyã}∑Å∫Î@ò«÷Ï$∏¬⁄‚™ª8ãÓ-∏Í.q’]d™Î/XüqΩjoF·,±goè÷ëÆ¨£MƒÜ˛Œı°gëwÁè‡&G®¿M/qªks≥aùÿ√æ≥˘/m]‡¨Ú$.∫∑π∂]˜|Çgn.5Ω:Çû„…ÔüÌ1oeD¸ #r‡ù`≥4Ü{ÅΩ38ãI\“Î~∫ä‡0˙fzıçúÄGê«Â"ü1ÙP˝Ôèﬁº@ã"Ó(2;v¨∂nÄm-«Á¨á÷Z≤)T≥L•nVz÷õ¯P«—líL‡¿Æ&|<zIÒÊb&Æd0,8íïUÜ5’ñõ˚ÉÔ58€´WÏ66ã/|€-HóÀŸ’#gl÷®p7xçœ˘vµ¡éÊj_ŒÒı_rYáÇ)>ÿ£Ø#ë,‚‹∏WÕù´◊|@D¡¸Â¨Ô.8’79âΩÂHKUHRá∫¥©O5zùıÍ®Ô¬˜úøÌk¯@í2#yÀÖﬁá⁄0›ßG⁄x—ÄŸ-™¿5jÒÑ∏3Í§®≠∆ßzØzùæ:|~ÚÁ ûMÑï—`:ﬂî”Û=F˚"Áy5˝µΩæXÎzsà]
i`Ê
C¡óπ≤=]Ë∑‚3†TµÅü4jØ≤πÛr{˚ˆñ µ’ﬁœÛËjÄ Ô©óë9o—√È]‡ÏÃåÉ ùÄ†0Ó≠©Â	&Æ´˛Õ·]ùj4øØæ{∫w+ÛN‡jœ7´Öıﬂ∫¥1ƒ”RÆSñ≥ﬂ'õ"7[∞øèÀ›µÛMÔÁ>´√f`r3√"ƒÿ…q‹c‹@ÓºÃBÓF∏÷]eãúÀca¿‚–b	¸éÊs‡uŸyú£M?<<œ.Úvy	M
ÄÂQs≤óÙ=uü™»ax°á·≥–ﬂ∫50≥QHk9ÿ2€Ma∆$d∂∂6?◊÷ˆ!·)Ìª<€HÑ∫√∏VPQë∆pìÜ{≤_æ¬M¸æfŸÖ}4Ún[z«@µ
kcU<X≤Sfµ‡§óèå)˚˘#◊UÒY±∆g’ı+ÃÅ⁄«ç‡BAﬂ ÄDâõÔñ’ÿohºü1Œìt√vÔú‚»`Ø	pŒ2ÑLàKI 	_˜†=âû∞ü:√ÛPo4ù&€b'ÇÁBÑrãúÈªd˚±Ã8Ôê·ÚæÎÜœ´M)ºÂæR_ô‰∂ﬁ∆˘4ö¡9¿â⁄ZŸ2_êÙè?E’S<yé	-ªÿ¡›™ÜŸûu±}◊7¡T"≈;åßQ2Cè≥=w`èŸ˙&pÕØ¢ÚEdΩ·`¥äE}÷´v:¸“ ∏¬÷XoÌ8^˚uëáÒXÉÇ5†GﬁGÏS¯eª8úﬂ0ÌÖ_˘ÏçÇÁ?~¸
!˛!µêÄÓ!t±&‡ãWG§Ã:ëÄÀRz¢œ’ô1KîWXÔXu,´ë%>8ç;J≠…G@”$?§qr˚ÙÍ‰ı@≤›`5ªıT›⁄~D—p´ﬁL¯Yûg9`V‹¬Ω:fı;»ófë·ÔÄû;¬È°ﬁ}
?±¥}«ù≥`1	ì›◊¿◊Yç÷∫◊€Âà•ı\\%uîóPs®öë„÷±≤ñ¨‘;	Gçv∏*_πúw¨…Íê≈ı©©L."uùUÓ$∑\ñªÿ„
nˇ*˜wù]WàûÆ˝ÜΩÀÊÏ	◊˚C]·g	eÌùy™”+zLµ”%Îg9zàÚ_KhÑ„ÆèäáäÅü∫kìk!Ì"1Hp
gyœ‰aVnŒ	∆®pÏ*>†[„¿‘K/dPM#§x8[ñ}-`}‘®◊Ur¡˙Ê∞FQ…5+5£<‡ÎÙG˙x¡œÂøåj”?∏JTËe⁄;,≠Ôîàüû±ä˙xMNºÑ™~W–ÇÛŸÜÈl£;v*<M)Ñ≈Á„®Aé'§9e/fßŸm"§xmP´ä^ΩR+›mDx√“ö)‘yd<‚ *§≈tIAó:ﬂxH5„–}e96≠sl“≈èr|j@J éC‡s˜Úd˝§v∑â{‡≥un;>®ﬁ’>ÀÎ÷–∂µÀe›ö»—¥’ôB6+Áß'Ë&qÈ/ÌîÿÎ’uÌ≤è∆ll~“±Y÷/∆yñ¶'ÓÔ<ô}ÏKIËÒˆ÷˜¡UÅrÀÓ6vädÛ˚úÎçªpqÎ÷ö'^èg>éœıM≈†mÅH8¶áÅ∏v“Ó„⁄M∏ÃÁ—º≥ÍyWQXÄA˚Ÿ∂«¨£B«hÇl√Ò°Ìo6rœ}∆ë#tØÚæv«˚Ztà	ò\ûYØ1Eﬁ^7&Á≈Œ≤π€o@ç€¬Ÿo~GÄ€b©ŒJx‰[·üNÜÕqGnõæ6b¡‰£ü™xl(ÛÀû?2q˚ﬂ=H$ÊSáEïüó∆ˇÒµîè~nX‰qùÆ–à˛ÿx4üú˛+¬"öMÈQR\4“û˛‹0…¸¶B¶∑Oü∑C%sY|∆Î€∫Ìãr…j}ÿ12¶î~åB·›¿ˆu°º∞{>WÏJÇ\7$çÖHC‰r‹ﬁv‚–ñ-]üñ˝H¬ÌÎàûuÖM∑Ïìob_èÙ)hkÊõ˝ç≤”‰õ–¬[∫‚^G4Ôñ?î„©ÿrqo∑¥w≥∞wø¨w∞®¡Yﬂ¥sÓ;uI«Œ∆£%‡ãyD¡aQ+W/å◊“}â/
õ–Ì‹:π>4Ü‘“÷ıyU| ük)7∞5◊Ö€g4Ç†t4,"∏U•mÚÎKÇ1ÈLYª~‚‹“¯_å≥ù≤±^°bZµ’3íÇ7®î∏5x`é:ƒ]®Ó’·˜¢∂(ôùÌu“Ë˚öH…À(!ayï∆ÉIÇŒ~®ÈÔbLUØiˇïÄ±#jö0F¿æïdÆ€¶+‘vç»6h©Êøc5˙4EıÕ‹⁄ñ(1∞ﬂNN¢|Ú˚$æ¿ Öïk;˚ÂI4+˘ÅÁ^Hùg”îu÷^∏˘±1‹7f#\ﬁ≥ùﬂúéû@i˜ËEõväEj‰{wÿÓì,˚8öÌK¯TIÊ˝âõB‚ˆ6 ˝Vîe¬dn|FlÊ<‡7hJÀß'∏ß1p3N…e]G¬Ä¿[[ü/6Q@⁄2µMÏ;HPmÈs∆‚ÒLÃ≈C&˜´¿DR3¢q.1·Buê‰„‘Õ;È4’rDaEB–v†•ø≥nÀÍ∫ºÏá◊ÓŸ%t;ã“ó…Ã∑i˙HRŸATFiv∂KÑ'‹∏vqÄ'Cwñ•›ÇÖ¶lƒ¿ë t£†Ô¥"	é?Ôt¢]xÈ Ω…˘Úô«Nu}@Át»4fò2∏`Èh⁄·a¬«∞_d@©‡DÏÃJﬂVÆ!(n[wFG¡_nõ? msŸò2pºıq≠9yY_&@t≠ƒi”ÃŒcrÄ:z¯„X»
#G ˝∆÷Î-å&PœÈ?k˝‹»√>Òﬁämÿˆ9aÜùfç√‹b dB9JRëN)‹Ÿ¶Ó\Ú¿WÆbÓGÛè˚CRúßIQ≤èÁQî&Ï<JæÙåÿÁÛvt1F	CßQblÎf?ˇPÁ≥òÕ£Ç˚Úıc3#≥èQ'Ä“QÙ1aãŸ9ñúú'ˇü$9∞◊åS¬+h9˚në‰WÿÑvÆãã≤!)}ÿ˙˘]t“ÎRÿ$üòﬁ∏ıh6ÊV!d…}SÊÌÜÃçaË	aÏ	EÅ„7h~v9áf1mvè·Ìﬁ´v≠Qv|^D(ÒÕ∂ÄàÚÒ9¸na·`¨‰ƒØ–v©6çççõuŒÿ¬∆Å‹÷¥PÅ&1y¶Ò4iÌù∂œßSfœ¶ÛÚ ˆHÛlPº¥sÔﬂ´l¡‹∏X6KØÿIÃ>%Erí∆¬ôå¸≈Ló–¢¨˝ÜΩDFÍ$ªdØ≤IîíõŸQ≥∫›rïYeÿÑô~„òûaúP\,‰"ﬁeOπ¥d@óbÈH\∆”‰∞Qﬁﬁæñv}¯°EÓeÀl`˛Çég_ø0,õﬁ‘Ÿ’(Q'Öõó)ªp•}unbã‚#„x’∆GâE0é6ƒüGg$/Ëô#Ûx|‚M¶—ÓGÍiô>´Ê⁄ø{æ—ÄŸÈY(‰¶Ô‰˜([µò&ï
.#’|·©awlÑtØmó⁄JB‹ÄØÊ%À!π¶QÑ5≠6ª÷åøÛ›K…Z—Ò°µ¶–Aé∫à-÷¬ît˝Û˛Ò∆–{õ¨Ó1˛˝-R%•{é`˚Ω?e¬Ò˝≠OÁ`qÍJ[ î¢Õ XÅJs‡Ä§’‘7ù–ÀjuΩÒö7Ù›Ï™=√GíÇó·≥≠É2#&„Êyó eË˘·t&ÌÉ⁄˙¯""ˇ‘ /Å˙Q∑5ÿînDóÇéM.Ë∞∏ ¥‹≥EÑn›ß$‹£°∞∑Ùå†ÍΩ&◊DØ]'ÄóüMRX˚≥≥îØ·Û§Ï≠|u7êØrfˇ¥‡˛*∫L¶…˜±/02ﬂØ9ÛlÄÁ/]A±h˜I4õ¡ i{¿¶+]tq ≤≈œ)(-Wºûw∑≤¡ù…ƒ»”ÿó¥†Â“+{--a "∂cnˇ¥ñ˝ BJ‹pîÉÌ[Œç=Ìä´⁄p∏
ßÂr;Òñ£Ï.XR∏óﬁé◊hy≈ﬂ&ˆI∏Ná˛˚Ñíù˛¥.’êoq£òN~πP¸®
…∑ΩM∆Â"wq~ÈKÖª‹M∑äÌˆ©ı=B”â–EBˇMfÖ«¸1TÔÕIuP‰VÏùÀÙÁrØh-µº„ÁWåxI¶‚g√Rxπ±VÏÑ?Vàô¯l∆¡C9~·ºú√≥	∞ÓrgpÓ¡`Ç"bl(ûf⁄Î°Ä”ﬂ`-u≈5WÊg¨úQ€∑r'âÜŸ% Ÿ°«≈C,N∞ÇÁŒüÕﬁ”s|lT5/ﬂòAâœØπ¢ËÜø¢5R¨ˆ˚8f@ÄYBÅj7¨˘ëZ%¿äΩçÆ(Í=ˆ∑á¿¬Oñ[RŸçË•fY≠a6.¨=≠€,Ìb<éã‚_fu˝„≠ohï˛~ˇÌ˛!{r¯‚È◊œÿ˛|ûgü ¿¬—›^®]YÅ?∑£Z
≥öµæµp∏À¡c^Ë∆xDzëΩ*Êçˆ¬€ v	 ·tœ≥ºd¯Z*¸!{Ä¡übÀ
7kÅ·i °°⁄5'·»ﬂQj0J«zÚbb3bz!^á˚!ôµ»Jƒ£∏v\∑gËåPÿ2G;∂?A…B™)*— êMVc%√ã#d,ìJXZbS iW“Ï®∏öçYoL√ö<Ö„≈≠ˆˆÊ1¡ƒfe{¿ãmIVôî‘Ó0≥+vÛïAN\"alg?y∞´¯'ßW*≥®(ß]Ω._™Ñﬂ©¯¯(ú§ËˇK3h≤â9∫à‡∏>ç1—∑k—<YCÑ)÷~mf	Âa»∫£ÓÕ∑´é¿{óÁŸdáuﬂæ◊µ=ŒŒcÃîVÏ da∞ô†èx››1≠ˇCëÕ∫Ï∆n~íMÆvxlgqˆ|Ô∫fQVåÃ0∞U hÃ“„∆¥Œ“x£π9U0Z™Ô7˛ÌÉûbú„%õ4Ù¬÷πíû®ª,iÄµ„3Ú¶Ù!{P4.∑NT|œΩ_√ﬂb“.û;à©•®«∂uÈø\òwmhwÈ°˝@f¿F)Åd/ *Ω~õ‘h.I	dU¢Ùñç¨R„ k°kÔ©P≤òÒ˙Ó`˘â‹ÆÜ˙K‰ˆ_"∑ˇπ˝gπ]ÏˆÜHÌz{3A∏Ô1âÌ] V»’;:>∏_≈6ò«ÜJÆyW«Fe‹›DÛ’wD≥◊ñ@îﬁ≤ó≈û∆%–7[ïı<¬êG„è˙\∏ﬁ∂∑á‡±ß∑a`?r>g·vÄ{sz
»ˆ.˚Ë˜u<É Ï-˜ÇG’®ñ™ºÁUu}“ﬂ}Œ”¬ Ñ ÉÙŒ∏„jm*\6ZV09¯∏‹fSËpç=Y\°ô:D›c–Ìò‹ä≤≈é?:≤%6ïB‚ªJ≥<¡◊¢µ@Å√7ÎAƒº §J°≤ö˛—ò[_‹ciîL]0≤æ®ÑØZ30B≠~$Ä‡ ‘+`0Ò{y<Ú7s8gæ#5Xpø¥ûj†WxÚÍ¬§;ŒÌ#÷ê6ê»¬i≤  ¨åRs;j–ˆÕ∏È~W˜–òƒ∑Ø´«jQñ‘ÙØó“Ùo€Ó`\”ØÚí$3v
Ã˛´ºx—√´‡ÒøçAÄäjcÜ≠Ÿ≤e¬ (’œFe¢¨,4ìe~6Pﬂ¬Tá«Üh™izY¶üoq–lm†)]OLHåBêêq[Y!o8nÇ–y§-‚≤¶uÎÔZ˙j•›≥fÊö¥0òE‹•	 -Ÿù≠HHÉj¡¢óˆG®„‹0õ§‘î£¡X©∂~≥É¬Wsaî4Î4Kô„ú$Z+†ôiJ¢Ì*Bg
I%ÏÙh¬ÜáT«„:‰bèç;‰zTØE™Á≤2Î]s—Ω*ëaÖVZ°¿OcQ0-ÃOxQ(kM€E¡å Ê¢@…œkQä≈ŸYåI\~öãRØ≈¢… wI—q\éW"@.ú\2!Ê¶)◊µ
àN•¨å¸;˜Z2k˜c4ÇvõÕ¬Ph®‡˙*FcÒ¬#ÇE÷á◊ê∆?B”‰∆7¥}Lç§πØ3b≥E˛”_O<´ê¨ò∆äaπæ`\¥ºä!|ò]¯ç∫)F◊¬PöÍü<k/s±w·ΩÂ’0 ﬁNLu"\oçﬂ˛6≥ËSÃºY~Û’Û≈≥qEvñêmyã!£˙ø˘>ßãÅ¢ÃÊ(ôƒ∞Â‡ÇÛ◊S≠‚Öÿ8—ıÖ‹D‡(.K@˝‚i¡ﬁ© ˜Â9¡îUß/nP))∫¶t_π˝S9WH¯^Ûv(≠‚ß,ô|Âæ”Ûº >\–¥*7|r‚qú\hLJ¬ı˚P˘Qâ… *=±h(» ‰U4ßÜœ´ﬂz√›√xƒ]È)N∏º˝—£ﬁıç÷‚’ãŸ|Q∆ßº5|Ÿ˝›ªW/©ÙY£yœ#.t¢\X™êÜxrd¿î˜ t)3h'i8∏ò7)Ëﬂûπ++öÍáöHu÷T›1ÛBWXwWP:Ì¡?ŸK§©Q°2∏…÷HÀÏˆh(!Âè1æÃñÈµ(l◊-éyÊÈz!À[ˆ$ÅàÈéxHçÌB?ÑAC¢CDÇc¡_˛Bˇ—n$™_kB†(AâàΩ÷nh1Qr@SÄâ
∞;˛jQR·°æŸΩè˙–⁄®a©~±§∂µÇÊxﬁk`”ﬂ À}:·?§Ü˛¨≠±#4RJ≥≥dº√æñÆ–¸ºåÄﬂ:ß»`´¯e∆û w∆J‡ÆƒÔ˛Ê<Ä|≥@ö\9À^/Ç≠Ω‚¢	Ï3Ò¢=ŒË+e˜°„lIöÔ•—å3WqîßW›Ø¨^û®^NÏ^N⁄˜≤O”¬ë{¿§Jâ®ﬁ$ÍúxÍhkWMuWjÄja˙#}•ø4™ªµG˛7–PDˇ¯Ω¶wY’Æi˜,äá:Ç‹¨≤cÎ–#º¯¿)-|}vz
ÃÉALÖF˙j6Êîu¸å<†V≈ÚwŸ`_¿≤√öP›Ë≥7	∫ˇ@0Tà˛*J9æXp›Ü‡ŸrÿÍ’MˆóO˜û‡±iÅ´“ÆbÀÄ<UïÀ2Û4ÓÒ7àZ7"ëdµp˛¿÷O≤ãA4ô<˚Cx	º0™bî®ÅÉâ3ìÓ™÷ÉË@f£$,ΩÂpäo’!b•©>Ë wÉÂÌ∏3,npnö#”<xï!„(V≈MÊΩd…4úçÛ<∆JO„”hëñ2—•Ä"Ç¥ò¨£zá¿≠†¬´–¡⁄€≤Û £z&9ë
ß∏∞ﬂ‡uÑ≥U[Ô∆NbÀ≠ π≠Z˜-Ï<xä'«Cád'ã"ô≈EÛ”î¡4À5cúÉË‘!áÃë	≠»:˘µ'Ç)ñtu¶g˜H‰P»-ñÑ8âHÂ°†.¿áÁõyôLáì1{ˇÇ»‹
#»/<õ1â.ë§<¡_ÄŒ≤◊;˙ÎoV¥∑Ì ¶AaÍœ∏ûÏû§˙cºì”cmäì8-#≤RÔzÃFpuó«áA¢ﬂY¢ïTY©ääÉË{¯Xﬁ˜1N¢¡i
£Q˜UU.ﬁ’–x~ÀÁ#˙j/m„,çóÖWWïåCA`QΩ ’‹Õbﬂ¨≠y„pıÓ=≥÷ﬂoŒÿÍKW/Ói∞çn≤’qgå{«;OmEµÉÁ±n(ÉVhp_ÌK∂
¬émUQ«ÜAÊÛ◊óWé^2Ÿa¸Ï'
dMO‘æîÊ+ÉUW_ìÍπ¶”∫Ó”&W¶QbùíÕHSk~¶æ'5ÔÛ$è—à(ˆ5ê©°d¶¥„€4æ—…%2Ôx§Èt±zœˆ∏}c1ê§⁄@’‚#Ã%Ñmîê˚k'∞Ω‰$”s&'ßu@iG¢ÒGÙã‹˚¬ôIÿÄ\ıfç—∞Øl∆ﬂÈF„∑6äKËºòpc<ï‡>0{m?£E¯Eîœz›'‚p%ÜŒﬂ‡ç*sÒõäåU¥Í”¥ﬁˇˆá˙˜ö¢·◊◊Ú¿Ω˘VçÃ8¯©yÔ€˜3…£m æ,ÅQ®~¯ü˛˘ø˛ó◊≠f¯Ö‰-u∂LéÂB%g∆ù-â5s≈=ŒuÉLØˆÄ!„Kèƒ"Ü„Êx¯A„ò∞–¥^≈b,’!ÎKç°4möú∑ldÊk°AT<éá∑1≈hzî1ã,ü¢;Å0„}.~JnL>¿!z›±Ñ" MNe˙.·=Ádzﬁ1Ao÷Tó≠ˆG}9.∑∑¡gƒ_‡2E/XE‚Êä√lj.'ƒÏ15HÂ>#™†^¸ <QΩ/ÑÖã∏ wà;èÃºz˘j–Å∆≠≠¯Ô.ˆW]QÆ·DFìøVΩÏF^À#§ñü¶∂ÙïX”Á–!Ã»π@≥jΩ≠£…OFÑ•d¢#‚	Ìæn Öf@sµ£¬DW›#®⁄’ÚrG≈ªQëLåp"¸ƒe∫cÖ\Ùè7∂(!2ŒØ(¯<öêãTå îi{Åá<]—ÒØûm‹ﬂ>¯†Ãb∏•∆˜˝ç°£jÛ*◊–‚ËmûL#ÿB˚c…WK—;ZÊ°È◊0°&–í$öÖÕè¶'˝0Ω-√ˆFYqlπâ®»‡»o‘≥ˆ h;!C|÷ôKB±nïÁ”nÂ€;¬(ô##Hâ!`mdkÑõ;!ND&QX‘!f"^:…ØÄÑ{¨a85¨‚∆rKq)Ïpºêú[¶∏_&ÖÍ¸Ò`|Â˚eo∏¬o≥]∑èÅ∂ÉÍiÒw·1¡	ƒUUfï}T»XL•^&ü9Ö)§¡6v\iJTãõr˜Ë<â”…¡y<˛Ë	Ú†!‡ñnTói¢XéG£`Í5o»Y†ŒÛËsÚ}\ä„é?€Ü)Î§©cõ≥,øZ¸5
Ä)R∑,Y¶n≠@—ÚÏá¸œÇî‹QÎ≈líDû g~tÚ@∏EÊsø≠ä2Ê)AÌ—∏;\∂ò2óÕÈÊr+:+vÜãŒ:Ys#57“2≥ƒ πÃt≈’˝"Ã√≠‡È∞Ì9Ó€ù•{œıªCDI≤“Vîá¶:2ÔëÄåL#›ΩÍ3üiCû¥
m9ˇ>&Ò›ÊSÿ<M3O3∫EŒ˘ËÖ>∆k,‰¯#Ãæ<¨«”<èvªPUÅ9
Â¨Å‰è}i9l√Toú¢:.dÀ¥^ ÃX¸ûD≈y<y‹,d˚Õ:≥∑Ï£g7¡{†M$J
WÄW 'ÔWüÓ]ÎVN¯á[u˙à‡r1/˜:∏:Å@—UuÔ⁄{µµ^gêj z\X¢ﬂ	ƒd”@∏∑D')zh&≠ÂÛ[ïW+ÿbπÔ[ÅË‹ê6ìgØ\ 7]î&Ê&˘ﬁ
kªZ‡çƒäd[¸˜t‚ê\	Âù*–{mP$O/µ8òÎ%˙gÊæË• Ø†ò'3ô#KàM⁄P{ÈØÂ¡/∞î‹ÆP/(‰•¶‚-™êıﬁ>}n9ı[@zﬁ“"∑»¥ƒ_≠KK˘LÓŒâ8√Ò&&‰“£ΩŒ7Ä≥èﬁÇyúÓuft
k¨“⁄Ãªuÿü[®—OöÕ∂åÄ6lµz÷"€ìßÂB©W8‘ÓZt«ô ¯ÒO√ëæº◊àì¶›Ì◊9¿›ª/•At8Ù yrìœ)ﬁI}¸Ûè…†t)M:π˛^eáapÃ,	a lØ≥Û!ù®obxp#p‘G`Âò€.Ä‰C@rJƒcR¿ÿ4ırúp˚˚îg3.¡iD˜›5úe #›µñ¶€¶D‰:`YR¿	£éo[$˝]¨≤$;CÿÏ±Ö¥1—MLY¯ç˛TÍπø-}îÕı}ù‹|Îã!°©‹ïmùcZgÎ’Õ◊,¥4∞øß`å[ÅwCØ<ÃR˛Jb·1"Å˘N8õ&1∫9ùHSﬁô7÷ˆ&ÇÄÓ°ú9Kπnéó!lÂΩÕìB◊¿&E•ç'=Õåí, µ öΩÎ±YÌÉî«Àè!+’pëà€ÖS√õÂ»gßM1‰ºZÒJBæh±K&∑ß{_l∫{”4KÊ—'b#1+˜ò/£π2/H⁄ç7;∞Mì≠j ìîÁ˙€5QoÌ◊◊ÒlúM‚˜á/îÕPJo-€Õ∑†%r`b/&§`ç˛s>¢ˇ®…Cì‡€À•ÓPïx≥Vx—»=˘E√⁄LjD+qßÿg∞P— £
r£…]Ã˝¨§§=’jüÄπgÂ_fQ¡Hgà¡…ÑŒpe ÉÁVÜ°Ò∫!¸ÃŒ¸˘}=)}G√@“j/ˇNú\+‰71;ÑﬁlêäŸ®œT•ÀvıY6∞±¡l§¢¯«ZìmıZ0BNtÿ$&já„áÉ-3/¶?õ°∆‹Ë¸è‰sJd@=dNÕ ~´yÑ±^7ûêÙZp;^z˝¿ÖMÔöf<Ñã0ºÑ:âöãl¯sﬂ%™Å›Ôösˆb8—rÏ°w£*ä=ÂkŸÊnÊf‘ΩLÌÉ”8"\A√ßi]£ƒvÏA˛—8í¿∫£[ÂôO®çi"Ω«–FH∂SÂ( lwT,Ÿ∂≈À’gáµ		ŒÂO4öÓŒ◊´gÒΩ⁄ùµ~R˝‡9\ËóW±—>õ°™ÍÀ®k&'˜»>H-≠	îÊ•q!ıdˆ3ÓWñf…%J€·˙ã∆$çÍßYf©Eˇøˇì≠◊∑Õ®øª'πy2a†≤{˜ÄΩÀ£Iå·Z09v>éŸk`U≥¸£ñπ˛ïÃ*∑<Âî∑?üì¨ûÓ§g9%?@®hÇée–5ãyˆœUÜ©√Ÿ^6f9Ãï[HiˆA¢"9V`]Â+—©;Ì:Ç…OëÔ‡~ò¬‹tXı-∫^—k¸ˆ∑’s˛:Î°z™w˚àç*9>)=†£¥?æ¬ú∫ÿ6uv—qÏƒ‘®åyˇjÚ˛˝·ˆûÒ\˝Ïÿ√5Zqr0‰mƒèéÊe‘Æ≤n)´+s≤◊ÆÔîW™YYQ√ôÁhxÚ¡HÕS¸Ï^g\◊@òü¨
Îp¸N/ÁÜkpVÆ^ñΩwÁ¿zä∫ã$˜(-∏ï•·I—Ö/cU]õo¶Œò
;‹lU"ø˙ç+ß~åπ›ÊêÈó«‹Ú(∆<°ªàqÁ¥—ÃR„≈¬5A˘éÍµQm+\HÌ‚zOR~ÔÁS~ ø€¿:˛®w\ÎéÑ€2)^·L…À®rÇ„oÅ˚#ZéI˜–ﬁÈ…{Õ˚÷∏xx‹DEÌ;(¶ÙYLæ[ƒF\Œ ÓM4UÓE∫Cnu’!´tÓË XA˘ã?∆W8ó≈‡¨(π©:q¿’O·…y·.ô8eˆÓ)I&[¥‰82·õë~™©S‘F(uÇ5V50R#‘@n.‡…$æ›FÉjUıûÖ˜YñÛ’÷L“´˜©‡ç“Eë ø N|pWãzOüÁ¥hå©∆q—xcçÛ¢"—:h€:1™}—÷ë—ˇ∂ç˙õùÒcz4ö¯√4ö“„ÿbõTäÛó¨e˜”î6Îs@§ lv»9K8ƒ√§≤Ü)∑∫yÑ±.t∫£»àtætMÂ5äµòãìbú''19fãÔÔ2œ{<!@·–1Qé£_√£ì}TÆ°˙i:wÍ§÷Òk∆;_vjNÄä>ëˆLí ÈÙGt>HË-«7ùÛ3@à}^r{s˚¯ æ√sMﬁÅóJy`åﬁ©ÑÁ”ìUFñøEwUw≠ÁÒeª≥¨Ñù≈ç«ãÓäº’]`6Ì^œlh÷›€Csm:Ï®ÇÈe,n6;öEÛ‚<+{ﬂ≠≤^!~«……p ƒ RàäÉI6ñ+bm≠b!^„Ä∆ù1…∞ı4˙îÂâ^g4æ0ˆ.ÙÚ‚î%e∑`0kr¡E∑àüMÿE∑ˆO1}hÙÛ‘XùíÎs‡@≤´”rLE±∆>˘#-‹s4ô`îØVEXßã6Æ¡D3πó‘xfÙ/ˇˆsÓAˆ€íE»ﬂc*uA‰ °Îf3ˇÌ?˝áˇ‡$3( ´7W ÔÁápu[ ”“≈˚†”òëÕâ-v˜ä·_ç¿'t˛’ÈÈ©ß!›(å6XèáCßÅïE!Í—q≠≤∑ßF;`Î˜∏øãs<”%aàâXÌq4cÃ	∏è≈™<÷¬RÏø>xˆÚÂ≥ß<tu∏"E≤‰Qrfg,ô¿Â™(acLªS[‚uñOaúæ=UÄ·JE2Ú Fb0£>VYr6À¥‹Ç&y£»êÓ$6l*\¶£b·§^Mßñd;§i¨$†´b…ójz˙2„¨.0≤¿‡ÕØ”c~?	∑r§7Ïè'⁄Ÿíä~x7≤◊ûv#êZ"^„µ¯’´cˇC:gq&;Ô ë˝döØÑ*hï1±Äp–{õq)_%MÏÕEë/
´óûπi	0≤-†-Ï_ —P≥l3∑ÅÕ©öÕŒ®Æ!r“òú™æ7úÒ¢~ùG„¯të‚>„1©QÎØMù„?Mäø¬ì2ô∆Ÿ¢¨õ$üÿ˙˙ h ∫XÚ˚√¡ÉçÌ°Ò°l≠®0|˘˛±h7U<ôWÂwÿ–µt˜…p'»ò9‡^`<°#,dΩwyrvÜ|Lc&K5—d
Hˆ≈kïe<ùóp≈Ñy,#Rˇ- ∏X—o¥ÿq<y≥(≈UV˝6Ó∞ı(ìï™–[Q£<ÑAˆqfåágoÅ±àÅ\1ícùƒQâﬁ™hÒ∞ñùûíÂÉ”qÒ’NtñG”µÁ∞Ç'Yˆq•˜›H ¬´u◊ºòBy)«°Ü°ÿ”ùçŸ!Á4∂Nui±t¢\ã)`.¢bÀ®"bÖ˘€±EÃ•ÈyBÄ›õ¸à$ˆò‘lèzøzv£U∂⁄*CÿB<…∏Á}ìÚˆﬂp¶CÜ∏–{ıEŒPÃ’x‰0tÎl‹rÆKh»
√ø√6ÇΩ((‹jXhÆÌy√Üå	ÂS\Ù{<B—9ò;ú^lb@pΩNËÕ	Ûú⁄x<£Z6ƒ…rk4N"”BÆπÍ≈kIÒuöùD©ëÓQÙÂy“Æ3+7û—ùı¨]ánä?£O˜qS∑áÑQjè—)˜vƒ[ÚXüc≤hñãûÒ§@!3ËŒùã®«hé*≈g∆C1%π‹CﬂÏFéKÒRˇ>WaYËœÎªN„iv÷É;ƒø˝Ÿ°1éI\ÚLî*éñè»8 n*ílnA
ß.©¨N∫spC!åñ
Î±ãewQãﬁ¥≠≥¸È®]~ù#FàÑz]r†6Óµk\Rﬂ/Ë¬¸òõÌuŸoe  =–ëcˆ#\Œbê}$q|±êˇÏuE&ü>≥›˝b‚Ñ%XAInÂbÕvà’vﬂ /Ω∂IçÙï∆Qà3ùWƒùõ¥8óhfÎ#zˆsVÈ$æ¸Rø!ªóM•¨•ÊŒ©»µ¢˛]\I∑A5∆20À–æÆZ◊x]	lYÜÊP“¸
cÏ∏eFBk± F√äâêÌ≤›ˆu$¥ÅÌã&‘FÂÉ5’më«˛ÍÎrØä≥•ﬂo´†ƒ+©Æ\R Öøπ&—3Ç %1v‹!ó©i†jÓ@åØj+&ŸƒÍ6]ıúW€Q◊˜“8Ù€∞÷5ÇS„ÆP]QZ^Ç‹´ﬁô#Âm5f8m˜e6ç0Í÷ﬂ.2†RG—,)˘›„hsñêâÅÏ;™_é„Û†—≈òÀ!≈ÄDEÍKÖq√CùúÖ)› Â√ŒöHF™(Â§∏%t¥À`5˜¨;‚ÓÇi\ﬁÛ®L˛ÏÖÿ%óE˘üõ‹;Ø˝ï˝ÜÁ¿∆˘<O»°6M"ˆÕiUﬂ”€{isﬁ‹Q2ÈÆh6™πè¬üÑrkJΩà›ÎâU√jOË26ªèIo[rÒ¸{ç÷Wt©'Ÿ<õ.`¸Øﬂº„≤◊4>ã∆Wl1ìö5X( `°:≈·äë`ÍP˙¶yîRœ]Ìë´Q*Ÿﬁ¬‚49KJ”Ê¸Å»E˛xPàr"ﬁ’6‘{B2nwà
29•∆{rµè¥fZ˚<F:MœÏ3≥Írß ~høçk›¨Å≠ÿ]IHìZ”ÈÕx∫\á®›ÒÄ˙1≥˙&ÌÈC;=¿p+løë?YW3´ØB∫%Fl≈ì·Öè<0ˆHÿ#JoT!ì£Dè¥≠˘¬	⁄¸2}gØ2oüçp®õ.PÅßŸ∏7Åˇkd⁄DÖ∆ö†^+¿ÅÚáÉ¯é=‘“;,xÙ*I6Èm™Õ˘ÙD°pïöî˜°°w†˘4ŒœDíná—¨ˆì˜ÖÁôæ›Ù·π¨¨µõ⁄Uñ;Eõ˜c&'lÏd≈‹Õ≥‹=÷˛¡è‹.NçHyﬁ:",íÜ¸6˝u—Ä‰©fÅ?M£3Ïåi¿˙´3
‚b÷-z≠%„§LØ¯AQ≠à	àQí‘¢jÆ3Áàõ∏°_Ÿ•◊Fø~q¸ïÃkQ¿8°ÍÌπ'¿ò"7ﬂö…k8E@õ„Bƒ¨Ùg ÷j¿âQ˝r»ˇ»mèU<_oﬁ¸+Ñ∫…ÔkO´_uË≥Â6˜∫>&_mgø∑m ˜º1È«:∞Zè¯q–®B$ºd
W¥ÛÓö¡ÒXt.ò˙–£ò´®à	◊î°6{#±iôΩøwOËF®[uÓÑ^SîKÁòÅ®⁄Ïxı†\:õæ∆ﬁ¬&°K^…^<Ö{9]¡±É¢˘§òb˜˙Åœœÿ.ªà
~-U+ÿlÆâáÆ«4mîıV(/§¯a	π<0•◊As4YêkbX6Àb@Ïﬁ=eQC{πcQ†U„æóû^tÄí≠£¡ÈPoŒÇh›8<M≈¶,rá&é®ÔVY3"¢äã∞‘vﬂBä¢¬‚~~≥∆:¬öù'ÛB£»aÒ†.$°ö
–€é35bª√>≤‚•Z]Z∞Üd¡ΩÅ„WB◊¶k,ÄV;®"óZY4¢ aì¶@Ä¥ûk≈/B°2*àÅ4hRB˘û,oÚºN®¡HiuÖ$˜“döî{[≠—√§XvkhZ¸˘WÕ´“
®∞WÕ–Ç˚òjÀx¥øÀ¶(çN‚táuÒ›Ö s¯µ¶¬¯ ⁄‹2Ω™œk-
^`∑£¿KEQ5|∆"h-EàßÈÛ$ùVÌ0È}°µ È∑›F`ålÑn68jØ¥ÜcUf7~Õ_å—|GΩ3;öÎo%NS·éë‰„TÉ™(÷«ÁVÈ4'ô_’Ïµa-Yµ5≠(ÌNﬁ¶ã‚Ëªy 0¡ÄÏ1/‡m?ûTõÇn{ÓÕB‚–`æ(Œ{
%(d†6ŸlÁ“ÇOæOààD÷C]´r*h™F£¨I_˘*Ç≠ì€]X•MùºÃŒ2åÎ¶ı†µi.ìŸ[]Ë≈M›DÈxë¢ïï÷âYÿ‘0Ö£≠6Îª8¡∫‹Ms≤SOÃ≤fèoÆ˘’`N˘˙e™Å5¨7ûügP!ì|ò][ksU+C˜ä•∑—Ê6Ù÷®ÕµgIK*LFl´Qw≈{ÒÄ«o~<òcª?rE›êƒ∆2NM÷$8¡oÒæë©Qæô:ì•˛€@û*>π@”˚Ò™`ö÷bπ°6˜∑ƒxonµÿ’F	Ø∏o3µZvœ~^zÌiãSb'hVo∏ÕŒYÆs∂‹ıFY«…cP&\ï“åáÂŒfÔgh6FZ1#èhç—›[{då||x~,JÀ¬"`ÀdÑó˜0mµå[ñÆUk®V≠õ4(—Zµ„:3¨nE∫»†¿°£á∂Áµ›t
Ur˚´πÿ[AN´"AÍ…f¢=&ˆ©*µÆ·¸&‘Ö)—ÒâXD∞üJFÎtÙ[Ä3q±¯õ¯Íiv!â w«Ö≤ì, '∂› π»QYA∏≥dÿò;Xﬁœ5˘sÿﬁP
A∆
˘,-∏zbÅjøy≈ËTîÂ˚i⁄Î
>Ó>∞û}åŸ”µ∫Êü.S¶'£˛ÇÎFÑπë˘Ie‹u\<‘Gc>0;ë]à4£≥I|ââ6ƒ¿	º9Ì›≠XaÌznbÍ˘Ûù{⁄[Ö™œFÏ1≤≥Íou?@ŸÊXı¸·ÒÄ Ë$9Û”X˘ g8˛‰‰ÓåÊ±wú÷˚ﬁ1™é=c¥–ﬂÃª`«íHf}ïJ°&/Bm+p–Ñ28Ù&<‹DÕ
†'¬GNÚPA©‹Gklc(‚ò≥itŸø∞‚b]ä»X*˙ƒÓ‚Æ≤Ò—&w^≈õÿ}ó—®íJ7âΩfí‡±Æ¥xJhDí°#’ﬁı5&úÿa˜∑ÙËNDÑE¥j®¢â7&~Á€a[√°.É˜:fŸNY€éSñÓê•¸∞Ã*¬ıä<Æ\Á,\É£‰˚ªﬂp∫«ßàÒjœ∑G≠9)î ã¸≈ÿËÅ;æÏÚàb∞@ù!£Z¯ßøÚ≥ì®7\•ˇõ+NSú<ˆUÅ“'ﬁ`}kkU˛?åVÙTötN≈´{ˇ≈¡yóÃÚx<ó¯D<¬∏Dt°!ﬁå$t_/0ò	qó˘zNî7¬"•ÁÍ∞.ÁûÄ·⁄ıàZ…%9K¬a⁄≤Ô˚«Î[√Ln*åËè´;…Ôs ä–ïç¢Ow0
∑ùßDÚ ÔÃ	˝+—±?⁄2„Xq£=∑;;≥ªÓ‘XJ;ì'·•© —†‰è%çâZ$òÏ\ÙGkÎÇ`Pq=|!@Cè7."·ìœ
£«%ﬂübõº	`„XŒ˚«|:ˇ†C˛˚,õ¬ø˙Y›åuTv~	KÀÉlãÁ-“⁄‘Ùì ›»Ä[Æ›¬Ω1QKª∑‘“éã√Œ·ˇˆ1n˝AÀ¨@∑n6¿ôm§ˆ EÚÍ<2ÿ}ˆ6ÀK /)ã)ú·+∑‡“ÿº….BQŒñﬂéû}t—ø`Ωè≥æË?¿Œ·»5!≠8†jg∏A”©TmﬁV-ñ˘Ã[ÌÆ¶‚ÀEç˛È?:‚“Âül!∫MeE®Oï™_û'3wª‡ÚΩEl6#|Åµı∆mëu·jRñ{+Ñ∆≠j•˜˚oˇÈﬂ˛œLN´ò™èßÀ˘Ú[ßÈÕçìì¿	ÙºDPn<ê_e'xô„¡~XOπ,r^â€ r8Fü bL(ë˜ªlŒ^∆ß%£∞IL‰læ'rm°®zE;ΩwπèÑ¡ıNv‰âfy˝‘7x\P–øÛ˛»óΩ√°√z&≥Ôë’∞∫üí"Å+úÜacÁ•Ë¬>aM:'Æf,·u"‡eƒ[t£œ>0“}aºD¡^¨–;
Ÿ\◊üÿÊëYG(¨›/£é4◊Eº‚ÔÒ'‹ß€t!¬ﬂôá{«&¢R+ﬁÎÆuWnñã÷Ó…#ÄAì´Âqíç∏°pmñË⁄õ‹ØrC7†,≈’}r∏ˇ˙È7/ﬂ|˝Êõ£√',.ÕÂu^ÔøzVó∆‰¢ø8ªÕèå˚¸»∏oÖ"÷#‘*¢ ±OÂfÎè{´òß;P§MÖf‘óXÅÇw"volc$ƒQ~ü2äìE•d™èÔ9À >%›Û≥I`	m∏~ôÂ„Û>ñ˚f;‹≤ÅÍÛt¢ÇÚ´qñÕ™Ù^ˆ·W»{*˝y4M“´÷ÈæÇ_˙Ω°Mo˜ËjÜjœÓ~éÅWû‡¸–ãF“/–“´≥j‹ë˘∂pÔë”±ÅÙáÚõmq_Øj≈ß|‡Â ¸9
Ü[òEIF®$¿MKˇo,ïï*Õ?a
ä<ÿò.Ñ"l%‡ß…"G”≤˜Êı”ÉïFXÖÆG>~∞=∞b“
¥Ù√ft+ÿ¿ÅgÚ$!œ¬¨üì[® 2Îüí®üÂËŒ·ïi¿£e”Ío 2≠ë*S-7xéŒqöÃ˘F¢·È¡ÂÈ \E≈5@ÿo”ËÍ4Jp}(-ÓÜÉdˆ}åZêÓ◊qñü%Ó	⁄&ˆõ+˛√?˝Ï˜oˆ_≤ÁoŸK˙eç|êq¥r^eü‰^E„ëÍπhU¥¯{ +Í∂Zõñƒº“Í}ZH}ÌfÙ$∑¥ªèNä,] Ê‰8π˛êº∑Ûµ££·ä
¬W~Û8Qò§'3Ô¯¸dvÅ$ÿ™ÌMq∏≠˚ƒ#’e›woÂì˜ÂN¢®Ã°0ÿ(ß/ FÊÀË÷ÿï/n12:œQºÎyF¡	˜Æù úæ8◊UÍ1¡å¯‚tˆTRlÍ⁄0vŒ8>«à}˘^G¿g¡çå>F∞Ï~·8ÉAC“£ä¬Ëõõx?
ümDìü∆ìdQwë«;m∂(—Íé7m∞;⁄q"√;èe˙w‘æG,∑—kHSyCÛØ∆IıÁ0RÒçöÉÀAıÿ¥R⁄â-S@˝ùg7¯^]∑ùGUàxò¶œØ{§‡;åãEZÏ)P¯	™Ë|—‚]§óaJ1˙Éî*Ök*ù`ÒãXŸoO•öâ^∫≈Âá@ñl˘.""EP(˘¬µ‹g<iPoQó˚¢ä]Ç›†Ã^f2ä´+8–˚ôÒÙ?Z®Y¿◊e:¿∏¥º+m–≤˝êì1v£Âß]∂L\À;ë)l€v tkÑ*⁄¬wdyéÛr ¢“)ÇWÍe˛7›¨H!*áÅD”¯Ò≤›Rup%”˛]ÕtC±‚ùGØ3ò)óu∆·:KÜÎ¡‹"·å‘¯YqÔuÔ yÔ}ÔÅÔ ÖˇrHLhåŸÀhΩC∏¡Q8¯êâ¸WNÄÈP∆¸ÿrMUVX7µÙ‰µ≠îúJOQÂôü+ë’?¡‘C¯iï jÆid“≥`˛kS¿Õ†jIÙËj Ù·Á2‰ßU™,W]°èÕ÷ 6ä˙ÏÑ•‘»§Ã>"jKdF©…ﬂÉX˚àÚMÒÑ´·}"ÄÑ¢Gûn´jw#2gqa~ªÙSÅÙù’ßé¢À„„¡¯< ˜Àﬁê»C˜}∑æ„:‹≠9bDèIKc‚™PcZ~Xﬂ<2âıóép+u;l≠zkãêÿç'©U mji3Z˝º™r2vE«ˆ√?˛g™&œ£≥IyíÁ,5øÊ
5I;)∑ÍÜîvq8l˙“ü÷ÓÑ⁄!¨¨x,ìYÀ©ÎÀ"‰ŸâKÈñù„çÙµ⁄eÛÆÃ∏ÌïsWR}Îph"«ÓπAYCïËÅÔ‹c#dÕäaØPcÀ≥Í~ùq]b#Ÿ-˙6u‰à•ÔS«jX(g√“{NVV*39©V´“YuSËÙ0÷ñØtß!…— M}^\BÜó’k≥ÙÆ‡E^e8]†ø≠a•'ìvÎıSˆmNﬂ∆Ùò≥{∂ÊÚ€RÊ
{`∞k¢ÙÛv•X4ô§ıìs M|ç›>ˆ*#À<˚˜è◊Îú$ÀˆÜ¥Ú¶Ò¢aı˜4.>ñŸú	”o›2Ä≤ài¶ü’Xª(lY+UˆEˇ¯˛:û•ÈŸ|_ﬂ‹$Ÿ˘quæê(µ1™|°bgÒ'u$I≤\ò¨„Àeé¡mˆ=›A•‚}ù¶Y÷W∆+Ü¿¥Z´2:!Î‚ΩÎaÖyŸLòÕÔ]˚åÈeEM‚W≠\r<f~	◊µÚØ§T◊àà+ÓçëSã`”›»”Q}c&`zå˛òˆq◊ê≤c€‡Rçoíâf¯&LØÏ1}‚ä‚“m2˚ﬁA∑x¿ÌáLÖË…©¬’„Ùπdoè)Ä`ñHG+LÚ\¬r¢^Â»G;xJPO3ûÁ†Vô€JH-èkNal2ZÙj…DU∫Ú6g≠HïºˇµM›;‹Íx"<5ØÃΩ{Ää.¢™‹õ
¥B}Óô`zNÛ›<ªêì¥[)7Ì0–q]˚$†z≠ m{PAlÅ™ù†À”L6:èÙÌÏ7m´ï$ <⁄4,MµªººÎ)ıìñ%}:QŸ6á,ô	ì,cÅÂÛëeÊ"Î÷QËÍ¥·  Hà"'ì≥Ï"èÊB=`⁄C=∫ÖÙÃóE]bÛπ¸Àä±œ(É´jÒRdbÛÑ\Àﬁº≠∑»ø~ä+)Â2ª•≤7
Ùl	‡mH∂Á∫ÌâS!6œ–ıö+(LäR5‡ïµÎï‰äV˚ü†M—‚øZÚ˘Uﬁß_l¯y9üÖ¢˙pÒ!ºËI{OÔtx)ı·¢FJº¨”Ji IPdúÕûaLﬁ Æ2,Í≈·K«]π•˜‚ã)úg“q ≥àáÊ∫á$Ó~ŸëØüõ€+ÊNNLqÛñøúéÓÚÄ›Í`‘3x√9•]~Biª1Ww‡Ê”ZL`ÜBi8«ËRß⁄_‡–’ç0´≥˜G9¡Í]=Ç◊É›
‡^â≈Úg
üP ∏ÿOºBg˛-AÑÔm<M*ﬁ˜∏“ã◊¶jf>Ç—Ü\»I¸’PrıÎÊ5Ö“Ñ†‚©)Ê¸´ﬂ±·Æ©ﬂxäu∂l∂õX;g◊›zãuΩ√ÖD?§E∑›M]áØ≤¶mÙóì™ˇ’o¿[HÌR[QÆ¯/ª∞Õ.î–j{éπ[PÌ∫íú11!ÏÕ/*x¢]´4…ªGãŸù≤î —˜€Åõew˚Üd6IŒ2…≥Z!∫óÓ™t—/πÛn6â)i4”/Ø‘˜ó=Ïú§ËΩÏ∂¥ß§5îßØ¢d∆x^9∂ü«ëÆ>ı˚˛¬ß©¶&≈ROä€ÿuuñ[·Ë>≤)éƒÛ6—∂FÕjƒ8Z&¶êÇ‘ K/h¯˙ƒP$˚†aiêk˝¡∑ó˘ÒphŒZQ(_ÊÅ_0‹r=ﬂpxmü˝òt¡±3˝VdøŸ¢êÒu±à«£ı!Qõ‰S˘¶≥}Ó‘%¬»%≤ùFÍ‹‘õøÖ∫+H¶gIﬂè‚ˆÕ¸ûﬂû◊£0∂É˝zÂßnôq0å–n˛êq√àÏŒÒﬂ·∑ÙÏñ0s)ü”b≈3W´ƒ’L˙º,˝¨wµè3†Ω…≥Œ&KﬁÙuΩ—Ωy7—õ◊q:◊]∆–€∏€Ûœ_»À?ûÊ˛ı„l≈CqÊËVØüÁR.(óì˛?q˛πÖ∑∏òoZ ó››æŸs|QM¿‡ÁÊ^ãøü„.∞’Û≤fÒöEıÍ‹3–oˆ.ŒPué≈≥	∆œÚk–K·B÷k©êb◊Ôu÷:,Ê≥ΩÎ›Á±€#[Ä˜´"ÀJÛ∞™‰ÜÍæ pﬁF˛B´7≤êÒfûKA?7‚•Jç≠E>ΩπH∫@ÌıY|÷()É˛J—p∑ÔP…Ù˜®¨Œªö«ÃÛ7£ÊEw;nÀŒ∑zõa†¥¸¯ïÖÍ—ﬁLB∑G];˚OóÛê‚v¡À$:Û_ﬁäı∏ÔiÄ«Ä)îºÖº≤ÍäRx]]§˜¸Åé<‘ãÃì^≤∏€ùXÀ‘n›÷vx.ô_÷Ôg∂~<mäAÑ®cÂ/∑ÉπèÑ÷¸∂Nñ[@ËÛ®ïP»UÉ"-EË¥πˆ'ãA˚8≥[*◊ª•tºo£Yúz`f:ôÿ«ÛÓ C*…ç~ûk‚õw/^>c¿}ºπˇXëßá˚xv®Àpﬁ¡Ê™ôa+åO
ÍﬁµùëE€x ä∏Œ<AƒÆ‘¬ıjC|{¯Ê9éÚËŸªw/^}ƒÓ±˝ÉÉ7Ô_øÛåVPs˘ÜÎÓ¿õ⁄”TÕ¥%“∫Ú“Ì9vılíîb‰∆ß¡Õ˘yÙÅ∑Êπè£îKL<Ωò¬UÀ∫Ñ1 g—¶l∆É;íp”P.hkéø˜Ñ$Ÿ~/œ~t¿	Ô∂Ú"Ÿoû––‚	¨€tÎk˛ÆÍA_O≠™N—çÒÂ‰Ÿ—UÅë{Ï9∞êpk^¿JxÕCUkË/õ∆Q>·R|ÿÔ¿µ˘›ehá˚|<œG<¡ ßZ*€4œ>W=©#s„œ“Û˜Ÿ"g2?jçë√fØiôÙè xŒﬁÃ(ÖFΩ\cøÒñl}Ú@“Õ4„£ô«'C}ñæ¸?nË O^!#ùåa\ËÉ}©Ó][y™ÙaÍ|Õè∏8úä0Cl√$QëÇZg	L™ƒÂâj8ÇÇîÕ:åB∏}{≤ªf)P(˚¿”¯Súfs¯&hëÄGèx ¿€Ù àYÀõ©V¢QH1kÄçM˙êàê≈˚ç⁄Î¢0«¡ñÍq-Ç‡I'ç-]|–N…d0NÃVx`û±u(†˜Ü!óÔf„∞¶¡ËU≠?`¢g#Õœó]cw≤ZvËTª·4·}kÚ ÛLøçÆ(ïÃΩ–1'kääÿ`™>ÿiçˆ?R¯GTÉ∏Ë¬Yïë£˜Kf∆´ÁÄ‰˜[6Ä1ÊäQ*0∆Û§}ç	ƒ»’Yß*cò™\+Or¥ˆ™/≥öQΩπ€¬G´pxÔ9(46á≈ˆÂ]dè˝˘?∞v¸AcOπO?™}¥=√øËáèè˛$+Àl ^sEÆ•∂ñgm⁄ú;%üP€ /YF∫´B/6x'ó-5r°œ#“!
√4æ∆“÷¨bU4 L≈kXˇlów”Ï_· 3ôŒj¿âìª^ôA.*B´”M“6j‘£GT≤^âÉ™‰Gè™±4<¥L¬wıÖ2í<óÏ˝<Õ¢	ú#\¯7≤E3ÇÈ⁄>âËNÓãèY%∆⁄aù_uAü£≈7D>òˇÎÀë~[`Œ˘&?ıôTÂGˇZße‚÷˜ßeCÿ¥Ö5Êª8ÔI∞"q™™’ÖæËèF∏ˇGéóüÆ(,Ö¶P· Í¸*;—L⁄ïm+≥∫™˙Vejóiˆg∫eW#0îÈî¸&{∆TcÇö≠À/z‹OÀÊ∆´>7∑;F5òã∫.‘≈ÜË¬ä ÕwÉèN(éX«C˘˚G•"9¯ÚTB•ø{!7∂Ó©J)ãÃà%vÄôÉ(ôegiá÷
πÓÿ•’54®qNΩçkÍg9¶÷π•÷8•~éKj≥CÍùπ£∂vF˝]Q˝é®>7T∑◊µ—Ô¬>÷⁄√sÊ0BªÃg”€.ïaDT–äz‰51Å¯2;3 cõ”™˘òæ†:;Àò¥ısÆR◊âcËI2XóY·√áZf¡áÀœô7kS¢eòwa3FqùæïØN®≥¶(Ào4i›˜õmV3 (ﬁk#-√/Y7»¿µFh9ô]üLÃP„IÛwé†1ﬁUÿiµ)	°π|q(K£5HÖæ˚DF^&j ﬁÉgÆÚºè∑Òﬂs¸∑ŒïˆÓÒõ·7[∞œø·yD7Ü´£áWG√´√¡∆ y o /ÍÓ[ìa®!©ô˙ƒıÊã/‚Àyñó®>BÓüù.fî‚≈·=~[‡ßÈ1◊W≠r§«Ø¯y|T¢-©~~ó˘ï:Wƒij‰«„ÇÜó®%ÎÆpFYqòﬂ0J´mwBKKñÕìΩ√ûùûhÉc‡È‡q»˙ıGÂãñ_ƒ°6†•∆LÙòÛæ««•D∆T
s*´Ã™.Ú//ıVûR}ÈßHH¥7êƒ”˛öÄ∂*WÚ√äñlºRT˙r÷cyØâX˛%~—≤µõÈöÖàyå'à˝Q~•î˛§%ﬂåÀr õ¯%ßiAÆôD0m,7⁄Óﬁ}íg¿∫ëeA^G`‹—œ˜Ò?oéhuMÚ∆…µ)§a
æ¨k◊!IÁî˙=ÎùÏÓöÑ¸ÒÓZ ˆ¥œˇ   ˇˇ 	"˜