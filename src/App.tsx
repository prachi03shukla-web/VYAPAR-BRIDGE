import { UniversalYouTubePlayer, extractYouTubeId, isYouTubeUrl } from './components/UniversalYouTubePlayer';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Home, Shield, Moon, Sun, PlusSquare, MessageCircle, MessageSquare, Menu, LogOut, LogIn, Check, X, XCircle, Search, Compass, Film, Heart, Calculator, Bookmark, Info, MoreHorizontal, MoreVertical, Music, Image, ImageIcon, ImagePlus, Eye, EyeOff, Camera, Upload, Trash2, Plus, ShieldCheck, BadgeCheck, Sparkles, QrCode, CheckCircle, CheckCircle2, Award, Smile, Volume2, VolumeX, Play, Pause, ChevronUp, ChevronDown, ArrowLeft, ChevronLeft, ChevronRight, UserPlus, UserCheck, Share2, Phone, Mail, Globe, Building2, Store, MapPin, Locate, Navigation, Tag, Filter, ShieldAlert, User, UserX, Lock, Key, Clock, FileText, FileCheck, Maximize2, Crop, Loader2, Send, BarChart2, Users, Map as MapIcon, Hash, Pencil, Rocket, ExternalLink, Star, Scale, Video, TrendingUp, ClipboardList, Bell, CreditCard, Calendar, Copy, RefreshCw, AlertTriangle, Gift, Fingerprint, Megaphone, Download, Settings, ShoppingCart, Scan, Terminal, Wrench, RotateCcw, Database } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

if (typeof (toast as any).info !== 'function') {
  (toast as any).info = (msg: string | React.ReactNode, opts?: any) => toast(msg, { icon: 'ℹ️', ...opts });
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
import { WelcomeSplash } from './components/WelcomeSplash';
import { TermsPage } from './components/TermsPage';
import { PlatformRatingWidget } from './components/PlatformRatingWidget';
import { isAppLockedOut, recordFailedAdminAttempt, recordSuccessfulAdminLogin, setStealthLockout, clearLockout } from './utils/lockoutManager';
import { AdRatingComponent } from './components/AdRatingComponent';
import { ALL_INDUSTRIES, ALL_CATEGORY_OPTIONS, matchIndustryOrSubcategory } from './constants/industryData';
import { IndustryCommerceHub } from './components/IndustryCommerceHub';
import { PdfCardViewer } from './components/PdfCardViewer';
import { MultiImageCollage } from './components/MultiImageCollage';
import { AdminPanel } from './components/AdminPanel';
import { extractPdfFirstPageThumbnail, generateFallbackPdfCover } from './utils/pdfThumbnail';
import { createPdfCatalogUrl } from './services/mediaUrlService';
import { BRAND_LOGO_SRC, BRAND_NAME } from './constants/brandLogo';
import { auth, db as firestoreDb } from './firebase';
import { collection, doc, setDoc, getDocs, getDoc, query, where, deleteDoc, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { DEFAULT_B2B_POSTS } from './data/defaultPosts';
import { fetchPostsFromFirestore, syncPostToFirestore, subscribeToPostsFromFirestore, subscribeToUsersFromFirestore, subscribeToPaymentsFromFirestore, submitPaymentUTRToFirestore, getAdminSettingsFromFirestore, saveAdminSettingsToFirestore, subscribeToAdminSettingsFromFirestore, saveBrandAdsToFirestore, subscribeToBrandAdsFromFirestore, likePostInFirestore, savePostInFirestore, recordEnquiryInFirestore, addCommentToFirestore, fetchCommentsFromFirestore, subscribeToCommentsFromFirestore, deleteCommentFromFirestore, uploadFileToFirebaseStorage, followUserInFirestore, recordViewInFirestore, recordShareInFirestore, authenticateUserInFirestore, adminResetUserPassword, userChangeOwnPassword, blockUserInFirestore, markPostNotInterestedInFirestore, getUsersBlockedAndNotInterestedFromFirestore, clearDefaultDataFromFirestore, deleteUserFromFirestore, deletePostFromFirestore, syncUserToFirestore, fetchAllUsersFromFirestore, sanitizeForFirestore, updateUserVerificationInFirestore, subscribeToPlatformStatsFromFirestore, startPresenceHeartbeat, updateUserPresence, isUserActiveOnline, getUserLastActiveFormatted } from './services/firebaseDataSync';
import { ConnectUserModal } from './components/ConnectUserModal';
import { suggestHashtagsWithAI } from './services/aiService';
import { optimizeImageForPersistence, fileToDataURL, generateVideoThumbnail, uploadAudioToServer, getYouTubeThumbnail, isYouTubeUrl } from './utils/imageOptimizer';
import { saveVideoBlob, getVideoBlobUrl, cacheVideoUrlInMemory, getCachedVideoUrlInMemory } from './utils/videoStorage';
import { decodeUpiIdFromImageFile, extractUpiIdFromPayload } from './utils/qrUpiDecoder';
import { playBubblePopSound, playLikeSound, playSaveSound, playShareSound, playEnquirySound, playMessageSound, getSoundSettingsSync, updateSoundSettings } from './utils/audioEffects';
import { CommentMediaLightbox } from './components/CommentMediaLightbox';
import { GifPickerModal } from './components/GifPickerModal';
import { VideoUploadingModal } from './components/VideoUploadingModal';
import { ImageUploadingModal } from './components/ImageUploadingModal';
import { AuthPage } from './components/AuthPage';
import { PdfUploadingModal } from './components/PdfUploadingModal';
import { LinkUploadingModal } from './components/LinkUploadingModal';
import { handleClipboardMediaPaste } from './utils/clipboardHelper';
import { isPostLikedByUser, isPostSavedByUser, setPostLikedInLocalStorage, setPostSavedInLocalStorage, getUserEngagementCounts, incrementUserEngagement, getNewEngagementCounts, recordTokenGeneration, resetEngagementBaselinesForTest } from './utils/likeSaveHelpers';
import { ReferralRewardsModal } from './components/ReferralRewardsModal';
import { BoostBusinessModal } from './components/BoostBusinessModal';
import { AdminUserDetailModal } from './components/AdminUserDetailModal';
import { CustomerCartCouponsModal } from './components/CustomerCartCouponsModal';
import { SellerDiscountScannerModal } from './components/SellerDiscountScannerModal';
import { NavigationSidebar } from './components/NavigationSidebar';
import { captureReferralCodeFromUrl, recordNewUserReferral, checkAndUpdateReferralOnPost, getOrCreateFingerprint, getReferralStats, getUserReferralLink } from './utils/referralManager';
import { resolveUserAvatar, getInitialsAvatar, updateCachedUsers, resolveAuthorInfo } from './utils/userAvatar';
import { addToCart, isItemInCart, getCartItems } from './utils/cartManager';
import { safeSaveUser, safeSetLocalStorage, safeGetLocalStorage, safeRemoveLocalStorage, cleanupStorageQuota } from './utils/safeStorage';


export function renderSafeCommentText(content: string, isAuthorOrAdmin = false): { text: string; masked: boolean } {
  if (!content) return { text: '', masked: false };
  // Detect phone numbers (10-digit Indian, +91, space-separated digits) or emails
  const phoneOrContactRegex = /(\+?91[\s\-]?)?[6-9]\d{9}|\b\d{5}[\s\-]?\d{5}\b|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  if (!isAuthorOrAdmin && phoneOrContactRegex.test(content)) {
    const maskedText = content.replace(phoneOrContactRegex, '🔒 [Contact Masked - Use "Inquire / Trade Connect" to Connect Directly]');
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
              Reload & Refresh App 🔄
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
          setIsInView(prev => (prev === inView ? prev : inView));
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
      { threshold: 0.35 }
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
              ✨ Official Showcase ✨
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
              {ad?.companyName || 'Vyapar Bridge Trade Partner'}
            </h3>
            <p className="text-xs text-amber-200/80 line-clamp-2 mt-1 max-w-xs sm:max-w-sm">
              {ad?.title || ad?.description || 'India’s Leading Verified B2B Ceramic & Building Material Network'}
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
            ✨ Official Showcase ✨
          </div>
          <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
            {ad?.companyName || 'Vyapar Bridge Trade Partner'}
          </h3>
          <p className="text-xs text-amber-200/80 line-clamp-2 mt-1 max-w-xs sm:max-w-sm">
            {ad?.title || ad?.description || 'India’s Leading Verified B2B Ceramic & Building Material Network'}
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
        toast.success('🛡️ Report submitted! Meta-style AI Safety team will review it.');
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
              <option value="Nudity or Explicit Sexual Content">🔞 Nudity / Explicit Sexual Content</option>
              <option value="Abusive Language or Harassment">🤬 Abusive Language / Harassment</option>
              <option value="Fake Account / Scam / Spam">⚠️ Fake Account / Scam / Spam</option>
              <option value="Non-Tile Unrelated Content">🚫 Non-Tile Unrelated Content</option>
              <option value="Other Safety Violation">❓ Other Safety Violation</option>
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
              <label className="block text-xs font-bold mb-1.5 text-black dark:text-zinc-200">Asset/Item Estimated Value (₹):</label>
              <input 
                type="number"
                value={assetValue}
                onChange={e => setAssetValue(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-black dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-black dark:text-zinc-200">Platform Engagement Discount (₹):</label>
              <div className="relative">
                <input 
                  type="text"
                  readOnly
                  value={`₹${totalMilestoneDiscount}`}
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
                    toast.success('🔄 Restored absolute total clicks for testing!');
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
                  {engagement.likes >= 1000 ? "+₹10" : "Pending"}
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
                  {engagement.comments >= 1000 ? "+₹10" : "Pending"}
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
                  {engagement.saves >= 1000 ? "+₹10" : "Pending"}
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
                  {engagement.visits >= 1000 ? "+₹10" : "Pending"}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-black/50 dark:text-zinc-500 italic">
              * Note: Discounts are non-editable and locked. They scale dynamically based on your profile's real action counters (Max: ₹40 discount).
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
                <strong className="text-black dark:text-zinc-200">₹{numericAsset.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-black/60 dark:text-zinc-400 block text-[10px]">CALCULATED DISCOUNT:</span>
                <strong className="text-emerald-600 font-black text-sm">₹{calculatedDiscount} OFF</strong>
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
                toast.success('🖨️ Offer Token PDF printed / downloaded successfully!');
                toast.success('🎉 Token generated! Future discount calculation has been reset to base on new engagements only.');
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

  // Logical check for Golden Badge (₹1,188 yearly plan or golden badge flag) vs Blue/Red
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
        title="👑 ₹1,188 Golden Verified Seller (Top Priority #1 Ranking)"
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
        title="🔴 ₹99 Verified Buyer (Direct Connect & Discount Deals)"
      >
        <svg className={cn(sizeMap[size], "fill-current")} viewBox="0 0 24 24">
          <path d="M12 2l2.4 2.4 3.4-.5.5 3.4 3.2 1.3-1.3 3.2 1.3 3.2-3.2 1.3-.5 3.4-3.4-.5L12 22l-2.4-2.4-3.4.5-.5-3.4-3.2-1.3 1.3-3.2-1.3-3.2 3.2-1.3.5-3.4 3.4.5L12 2z" />
          <path d="M10 15.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4z" fill="#ffffff" />
        </svg>
      </span>
    );
  }

  // Default Blue Badge for ₹99 Verified Sellers
  return (
    <span 
      className={cn("inline-flex items-center text-[#0095f6] dark:text-[#3897f0] shrink-0", className)} 
      title="🔷 ₹99 Verified Seller (Active B2B Member)"
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

  const price = selectedPlan === 'monthly' ? '₹99' : '₹1,188';

  const handleCopyLink = () => {
    const textToCopy = paymentSettings.paymentLink || `upi://pay?pa=${paymentSettings.upiId}&pn=${encodeURIComponent(paymentSettings.accountName)}&cu=INR`;
    navigator.clipboard.writeText(textToCopy);
    toast.success('📋 Payment Link copied to clipboard!');
  };

  const handleCopyUpi = () => {
    const cleanUpi = (paymentSettings.upiId || 'ashish660@ibl').trim().replace(/\s+/g, '');
    navigator.clipboard.writeText(cleanUpi);
    toast.success(`📋 UPI ID copied: ${cleanUpi}`);
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

    toast.success(`📋 UPI ID Copied: ${cleanUpi}\nOpening Payment App (${price})...`, { duration: 4000 });

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
      toast.success(`⏳ Payment UTR Submitted! Admin 24-Hour Verification is now active.`);
      
      // Open WhatsApp to send UTR directly to Admin with pre-filled message
      const adminWhatsApp = paymentSettings.whatsappNumber || '919825012345';
      const cleanPhone = adminWhatsApp.replace(/\D/g, '');
      const msgText = encodeURIComponent(
        `🙏 Namaste Vyapar Bridge Admin,\n\nMaine Payment complete kar di hai:\n- User/Business: ${user?.name || user?.companyName || 'Member'}\n- Plan: ${selectedPlan === 'yearly' ? 'Yearly Plan (₹1,188)' : 'Monthly Plan (₹99)'}\n- 12-Digit UTR: ${cleanUtr}\n\nKripya verification approve karein aur Blue Badge activate karein. Dhanyawad!`
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
                <span>⏳ Verification Pending (24-Hour Timer Active)</span>
              </div>
              <p>
                Your payment for <strong>{user.pendingPayment.plan === 'yearly' ? 'Yearly Plan (₹1,188)' : 'Monthly Plan (₹99)'}</strong> is under review by Vyapar Bridge Admin.
              </p>
              <p className="text-[11px] font-bold text-black/80 dark:text-slate-300">
                ✓ Verified Badge will be activated as soon as Admin approves.
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                * Note: If not verified by Admin within 24 hours, money auto-refund triggers back to your UPI account. Please make sure you sent the screenshot on WhatsApp.
              </p>
            </div>
          )}

          {user?.pendingPayment && user?.pendingPayment?.status === 'refund_initiated' && (
            <div className="bg-rose-500/10 border-2 border-rose-500/40 p-4 rounded-xl text-xs space-y-1.5 text-rose-800 dark:text-rose-300">
              <div className="font-extrabold text-sm flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span>↩ Refund Initiated / Unverified</span>
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
                      Active ✓
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
                      🔴 RED VERIFIED BUYER BADGE
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
                      <span className="text-amber-500 text-base leading-none">👑</span>
                      <div className="text-[11px] leading-tight">
                        <strong className="text-amber-700 dark:text-amber-400">₹1,188 Pro Yearly (🌟 Golden Badge):</strong>
                        <div className="text-black/80 dark:text-zinc-300 mt-0.5 font-medium">
                          #1 Highest Priority in Search & Nearby GPS, Full Buyer Contact & WhatsApp Unlock on all Cart leads.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <span className="text-blue-500 text-base leading-none">🔷</span>
                      <div className="text-[11px] leading-tight">
                        <strong className="text-blue-700 dark:text-blue-400">₹99 Monthly (🔷 Blue Badge):</strong>
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
                  {isCustomer ? 'खरीदार वेरिफिकेशन प्लान (Buyer Verification Plan):' : 'Select Seller Verification Plan (₹):'}
                </label>
                
                {isCustomer ? (
                  <div className="p-4 rounded-xl border-2 border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 shadow-md flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🔴</span>
                        <span className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                          Verified Buyer Member
                        </span>
                      </div>
                      <div className="text-2xl font-black text-black dark:text-white mt-1">₹99 <span className="text-xs font-normal text-black/60">/ Month</span></div>
                      <div className="text-[11px] text-black/70 dark:text-zinc-400 mt-0.5">
                        ✓ Direct Contact with all verified sellers • Red Badge on profile
                      </div>
                    </div>
                    <div className="bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-sm">
                      SELECTED ✓
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
                          <span>🔷</span> Blue Badge
                        </div>
                        <div className="text-2xl font-black text-black dark:text-white mt-1">₹99</div>
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
                        👑 TOP PRIORITY
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400">
                          <span>🌟</span> Golden Badge
                        </div>
                        <div className="text-2xl font-black text-black dark:text-white mt-1">₹1,188</div>
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
                    'Payment Done - Get Verified ✓'
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

interface ReelCardProps {
  reel: any; 
  currentUser: any; 
  onClose?: () => void;
  userLocation?: {lat: number, lng: number} | null;
}

function ReelCard(props: ReelCardProps) {
  if (!props.reel) {
    return (
      <div className="relative w-full max-w-[420px] h-[85vh] bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-zinc-400 font-medium text-sm">Reel content unavailable</p>
      </div>
    );
  }
  return <InternalReelCard {...props} />;
}

function InternalReelCard({ 
  reel, 
  currentUser, 
  onClose,
  userLocation
}: ReelCardProps) {

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
      toast.error('🔐 Please Login or Register to Follow creators!');
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
      toast.error('🔐 Please Login or Register to Like reels!');
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
      toast.error('🔐 Please Login or Register to Save reels!');
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
                toast.success('🎁 Offer Token Generator opened with this post snapshot & QR code!');
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
                      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: `📍 Distance Restriction: As a Local Member, you can only inquire with dealers within 100km. This business is ${Math.round(dist)}km away.` } }));
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
                            toast.error('🔐 Please Login or Register to Rate users!');
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
                              toast.success(`⭐ Rated ${star} Stars!`);
                              
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
              <span>⚠️</span>
              <span className="tracking-tight uppercase">Item Shortage / शॉर्टेज</span>
            </div>
          )}

          {Boolean(reel?.minRate || reel?.maxRate) && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/35 via-yellow-500/25 to-amber-500/35 border border-amber-400/50 text-amber-300 text-xs font-black shadow-lg backdrop-blur-md w-fit">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Rate:</span>
              <span className="tracking-tight text-white font-extrabold text-xs sm:text-sm">
                {reel.minRate && reel.maxRate 
                  ? `₹${reel.minRate} - ₹${reel.maxRate}` 
                  : reel.minRate 
                    ? `₹${reel.minRate}+` 
                    : `Upto ₹${reel.maxRate}`}
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
                            🔒 Phone numbers in public comments are protected.
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
                          <span>🔍 Preview</span>
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
                <span>Rate Reel ({reelRating.toFixed(1)}★)</span>
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
                  <span>Edit Reel & Rates / Shortage (शॉर्टेज)</span>
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
              आपकी रेटिंग सीधे हमारे AI रैंकिंग एल्गोरिदम को बढ़ावा देती है। स्टार रेटिंग देने से यह रील सभी यूज़र्स के फ़ीड में ऊपर दिखेगी।
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
      toast.success(isShortcut ? '⚠️ Post updated: Marked as Item Shortage (शॉर्टेज)' : '✅ Post & pricing details updated successfully!');
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
          {/* Stock Status / Item Shortage Toggle (स्टॉक स्थिति) */}
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <span>📦 Stock Availability (स्टॉक स्थिति / शॉर्टेज)</span>
              </label>
              <span className={cn(
                "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                isShortcut 
                  ? "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40 animate-pulse" 
                  : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
              )}>
                {isShortcut ? "Item Shortage / शॉर्टेज" : "In Stock / उपलब्ध"}
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
                <span>🟢 In Stock (उपलब्ध है)</span>
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
                <span>⚠️ Item Shortage (शॉर्टेज)</span>
              </button>
            </div>
            <p className="text-[10px] text-black/60 dark:text-zinc-400">
              अगर फैक्ट्री में यह माल खत्म हो गया है या शॉर्टेज है, तो इसे <strong>Item Shortage</strong> मार्क करें। ग्राहकों को तुरंत अलर्ट दिखेगा।
            </p>
          </div>

          {/* Dynamic Price Range Fields */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-black/80 dark:text-zinc-300 flex items-center gap-1.5">
                <span className="text-amber-500 font-black">₹</span>
                <span>Wholesale Price Range (कीमत दायरा)</span>
              </label>
              <span className="text-[10px] font-bold text-black/50 dark:text-zinc-500">Optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-black/70 dark:text-zinc-400 mb-1">
                  Min Rate (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-black/40 dark:text-zinc-500">₹</span>
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
                  Max Rate (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-black/40 dark:text-zinc-500">₹</span>
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
                  Unit (इकाई)
                </label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-2 text-xs font-bold text-black dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Box">Per Box (प्रति बॉक्स)</option>
                  <option value="Sq.Ft">Per Sq.Ft (प्रति वर्ग फुट)</option>
                  <option value="Sq.Mtr">Per Sq.Mtr (प्रति वर्ग मीटर)</option>
                  <option value="Piece">Per Piece (प्रति पीस)</option>
                  <option value="Ton">Per Ton (प्रति टन)</option>
                  <option value="Kg">Per Kg (प्रति किग्रा)</option>
                  <option value="Bag">Per Bag (प्रति बैग)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black/80 dark:text-zinc-300 mb-1">Title (शीर्षक)</label>
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

interface FeedVideoPlayerProps {
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
}

function FeedVideoPlayer(props: FeedVideoPlayerProps) {
  if (isYouTubeUrl(props.src)) {
    return (
      <UniversalYouTubePlayer 
        url={props.src} 
        isReel={props.isReel} 
        aspectRatio={props.aspectRatio || (props.isReel ? '9:16' : undefined)} 
        className={props.className} 
        autoPlay={props.autoPlay}
        muted={props.isMutedProp ?? isGlobalVideoMuted()}
      />
    );
  }
  return <InternalFeedVideoPlayer {...props} />;
}

function InternalFeedVideoPlayer({
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
}: FeedVideoPlayerProps) {
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
          if (isIntersectingRef.current === inView) return;
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
      { threshold: 0.35 }
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

const PostItem = React.memo(function PostItem({ 
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

  const isPdfPost = Boolean(
    post.type === 'pdf' || 
    post.isPdf || 
    Boolean(post.pdfUrl) || 
    Boolean(post.mediaUrl && (String(post.mediaUrl).match(/\.pdf(\?.*)?$/i) || String(post.mediaUrl).startsWith('data:application/pdf'))) ||
    Boolean(post.persistentMediaUrl && (String(post.persistentMediaUrl).match(/\.pdf(\?.*)?$/i) || String(post.persistentMediaUrl).startsWith('data:application/pdf')))
  );

  const isVideoPost = !isPdfPost && (
    post.type === 'video' || 
    post.type === 'reel' ||
    isVideoLink ||
    Boolean(post.videoUrl && !String(post.videoUrl).startsWith('data:image') && !String(post.videoUrl).match(/\.(jpg|jpeg|png|webp|gif|pdf)(\?.*)?$/i)) ||
    Boolean(post.video && !String(post.video).startsWith('data:image') && !String(post.video).match(/\.(jpg|jpeg|png|webp|gif|pdf)(\?.*)?$/i)) ||
    Boolean(post.mediaUrl && (
      String(post.mediaUrl).startsWith('data:video') || 
      String(post.mediaUrl).match(/\.(mp4|webm|mov|m4v|mkv|3gp)(\?.*)?$/i) || 
      (!String(post.mediaUrl).match(/\.pdf(\?.*)?$/i) && String(post.mediaUrl).includes('firebasestorage.googleapis.com') && !String(post.mediaUrl).match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i))
    )) ||
    Boolean(post.persistentMediaUrl && (
      String(post.persistentMediaUrl).startsWith('data:video') || 
      String(post.persistentMediaUrl).match(/\.(mp4|webm|mov|m4v|mkv|3gp)(\?.*)?$/i) || 
      (!String(post.persistentMediaUrl).match(/\.pdf(\?.*)?$/i) && String(post.persistentMediaUrl).includes('firebasestorage.googleapis.com') && !String(post.persistentMediaUrl).match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i))
    ))
  );

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
      toast.error('🔐 Please Login or Register to Rate posts!');
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

    toast.success(`⭐ Rated this post ${star} Stars!`);

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
      toast.success('🎉 Your requirements have been sent to the company successfully! They will contact you shortly.');
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
      toast.error('🔐 Please Login or Register to Like posts!');
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
      toast.error('🔐 Please Login or Register to Save posts!');
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
      toast.error('🔐 Please Login or Register to Follow users!');
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
        toast.success('🔔 Notifications turned ON for this post!');
      } else {
        list = list.filter(id => id !== String(post.id));
        toast.success('🔕 Notifications turned OFF for this post.');
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
        toast.success('🔗 Post link copied to clipboard!');
      }).catch(() => {
        toast.success('🔗 Post link: ' + postUrl);
      });
    } else {
      toast.success('🔗 Post link: ' + postUrl);
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

    toast.success(`🚫 ${authorName || 'User'} has been blocked. All their posts are now permanently hidden.`);
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
    // 1. Consumers/Buyers must have ₹99 Verified Plan or active membership
    const isVerifiedUser = Boolean(currentUser?.isVerified || currentUser?.verifiedPlan || currentUser?.membershipType || (currentUser?.planExpiry && currentUser.planExpiry > Date.now()) || isUser1188GoldenPlan(currentUser));
    const isConsumer = currentUser?.role === 'customer' || currentUser?.role === 'buyer';
    
    if (isConsumer && !isVerifiedUser) {
      toast.error("🔒 Vyapar posts par comment karne ke liye ₹99 Verified Buyer Plan (Red Badge) lena zaroori hai.");
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
    <div className={`smooth-feed-item bg-[#E6C76C] dark:bg-black border-b border-neutral-100 dark:border-neutral-900 md:border md:border-neutral-200 dark:md:border-neutral-800 md:rounded-xl pb-4 mb-5 w-full mx-auto shadow-sm ${isVerticalContent ? "md:max-w-[460px]" : ""}`}>
      {/* Post Header */}
      <div className="flex items-center justify-between p-2.5 sm:p-3 relative gap-2 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
           <div 
             onClick={() => navigate(`/profile/${authorInfo.id}`)}
             className={cn(
             "w-9 h-9 sm:w-10 sm:h-10 rounded-full cursor-pointer shrink-0 transition-transform hover:scale-105 overflow-hidden flex items-center justify-center bg-slate-200 dark:bg-zinc-800",
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
           <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <div className="flex items-center gap-1 min-w-0 max-w-[130px] xs:max-w-[160px] sm:max-w-[220px]">
                  <span 
                    onClick={() => navigate(`/profile/${authorInfo.id}`)}
                    className={cn(
                      "font-black italic tracking-wider text-xs sm:text-sm text-black dark:text-zinc-50 leading-none cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate",
                      (post.user?.isVerified || authorInfo.isVerified || (currentUser?.id === post.userId && currentUser?.isVerified)) && "text-blue-600 dark:text-blue-400 font-bold"
                    )}
                    style={{ fontFamily: "'Playfair Display', 'Dancing Script', serif", fontWeight: 900 }}
                  >
                    {authorName}
                  </span>
                  {(shouldShowVerifiedBadge(post.user || authorInfo) || (currentUser?.id === post.userId && shouldShowVerifiedBadge(currentUser))) && (
                    <VerifiedBadge user={post.user || authorInfo} size="sm" />
                  )}
                </div>

                {/* Interactive Star Post Rating Badge (Individual Post Rating) */}
                <div className="rainbow-star-badge flex items-center gap-0.5 px-1.5 py-0.5 rounded-xl select-none shrink-0 backdrop-blur-md transition-all duration-300 transform hover:scale-105">
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
                  <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">
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
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 truncate max-w-[160px] xs:max-w-[200px] sm:max-w-[280px]">
                      <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">[👑 ADMIN • {userCat || 'Founder & Platform Logic'}]</span>
                    </span>
                  );
                }
                
                if (pUser.role === 'customer') {
                  return (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate max-w-[160px] xs:max-w-[200px] sm:max-w-[280px]">
                      <ShoppingCart className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">[🛒 BUYER{userCat ? ` • ${userCat}` : ''}]</span>
                    </span>
                  );
                }
                
                return (
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 truncate max-w-[160px] xs:max-w-[200px] sm:max-w-[280px]">
                    <Building2 className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">[🏢 {userCat || (pUser.role === 'dealer' ? 'Dealer & Retailer' : 'Merchant & Business')}]</span>
                  </span>
                );
              })()}
              <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-black/50 dark:text-zinc-400">
                <Clock className="w-3 h-3 text-black/40 dark:text-zinc-500 shrink-0" />
                <span>{formatPostTimeAgo(post.createdAt)}</span>
                {!isSelfPost && (
                  <div className="flex items-center">
                    <span className="text-slate-300 dark:text-zinc-700 mx-1 text-[10px]">•</span>
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
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(!showOptions);
              }} 
              className="text-black dark:text-zinc-100 hover:text-black/70 dark:hover:text-zinc-300 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
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
                  className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-24px)] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl z-50 border border-slate-200 dark:border-zinc-800 overflow-hidden text-sm animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100 dark:divide-zinc-800/60"
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
                <span>🏭 {post.user?.name || post.userName || 'Verified Factory'}</span>
              </div>
            </div>
          )}
          {showHeartOverlay && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className="animate-bounce flex flex-col items-center">
                <Heart className="w-28 h-28 text-red-500 fill-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.95)]" />
                <span className="text-white text-[11px] font-black tracking-widest mt-1 bg-black/80 px-3 py-1 rounded-full border border-red-500/50 shadow-xl uppercase">
                  ❤️ Liked!
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
                ? `₹${post.minRate} - ₹${post.maxRate}` 
                : post.minRate 
                  ? `₹${post.minRate}+` 
                  : `Upto ₹${post.maxRate}`}
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
                // 1. Buyer needs ₹99 Verified Buyer Plan (Red Badge)
                if (currentUser?.role === 'customer' || currentUser?.role === 'buyer') {
                  const isVerifiedBuyer = currentUser?.isVerified || currentUser?.verifiedPlan === '99' || currentUser?.membershipType;
                  if (!isVerifiedBuyer) {
                    toast.error("🔒 Seller se direct inquiry/contact karne ke liye ₹99 Verified Buyer Plan (Red Badge) lena zaroori hai.");
                    window.dispatchEvent(new CustomEvent('openVerifyModal', { detail: { role: 'customer' } }));
                    return;
                  }
                }
                // 2. Seller needs ₹1188 Golden Plan to contact
                if (currentUser && currentUser.role !== 'customer' && currentUser.role !== 'buyer') {
                  if (!isUser1188GoldenPlan(currentUser)) {
                    toast.error("🔒 Direct B2B Inquiry/Contact ke liye Seller ka ₹1,188/Year Golden Plan se verified hona zaroori hai.");
                    window.dispatchEvent(new CustomEvent('openVerifyModal', { detail: { role: currentUser.role } }));
                    return;
                  }
                }
                // Strict B2B Rule: Only verified sellers can be contacted via direct inquiry
                if (currentUser?.role === 'dealer' || currentUser?.role === 'wholesaler' || currentUser?.role === 'retailer') {
                  if (post?.user?.role === 'factory' && !post?.user?.isVerified) {
                    toast.error("🔒 Direct B2B Inquiry/Contact ke liye Seller ka ₹1,188/Year Golden Plan se verified hona zaroori hai.");
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
                      toast.error(`📍 Distance Restriction: As a Local Member, you can only inquire with dealers within 100km. This business is ${Math.round(dist)}km away. Upgrade to 'Direct Company' plan for nationwide access!`);
                      return;
                    }
                  } else if (!userLocation) {
                    toast.error("📍 Please enable GPS/Location to verify distance for Local Membership.");
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
                  toast.success(`🛒 "${post.title || 'Product Batch'}" aapke Profile Cart me save ho gaya! (${res.cartCount} items)`);
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
                  {isInCart ? "In Cart ✓" : "Add to Cart"}
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
                {isSaved ? "Wishlist ✓" : "Wishlist"}
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
                  toast.success('🎁 Offer Token Generator opened with this post snapshot & QR code!');
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
              <span>🔗 Shared Link: {post.externalLink.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</span>
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
                                  🔒 Phone numbers in public comments are protected. Use "Inquire / Trade Connect" to chat directly.
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
                                <span>🔍 Preview</span>
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
});

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
                <div className="text-[10px] text-black/70">{track.artist} • {track.duration}</div>
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
      toast.success(`✓ Following ${userName}`);
    } else {
      toast(`Unfollowed ${userName}`, { icon: 'ℹ️' });
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
  // ⚡ Instant Cache Loading: Synchronously load cached posts & DEFAULT_B2B_POSTS (0ms wait)
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
        safeSetLocalStorage('VyaparBridge_cached_posts', allCombined.slice(0, 50));
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
      toast.error('🔐 Only registered Buyers and Sellers can upload reels or stories. Please register or login!');
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      if (e.target) e.target.value = '';
      return;
    }
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Instant preview generation (0.001s zero delay)
    const isVideoFile = selectedFile.type.startsWith('video') || /\.(mp4|webm|mov|m4v|mkv)$/i.test(selectedFile.name);
    setIsMediaReady(true); // For both images and videos, media controls are ready immediately!
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
    
    const tid = toast.loading('Attaching sound...');
    try {
      // 1. Instant zero-latency local preview using object URL
      const instantPreviewUrl = URL.createObjectURL(file);
      const title = file.name.replace(/\.[^/.]+$/, "") || 'Custom Sound';
      const artist = user?.name || 'User Upload';

      const customMusicObj = {
        id: `music_${Date.now()}`,
        title,
        artist,
        audioUrl: instantPreviewUrl,
        musicUrl: instantPreviewUrl,
        url: instantPreviewUrl,
        pendingFile: file
      };

      setSelectedMusic(customMusicObj);
      toast.success('🎵 Sound selected & previewing!', { id: tid });

      // 2. High-speed background upload to server storage for persistent URL
      uploadAudioToServer(file, title, artist).then((serverUrl) => {
        if (serverUrl) {
          setSelectedMusic((prev: any) => prev && prev.id === customMusicObj.id ? {
            ...prev,
            audioUrl: serverUrl,
            musicUrl: serverUrl,
            url: serverUrl,
            serverUrl
          } : prev);
        }
      }).catch(() => {});
    } catch (err) {
      toast.error('Upload failed', { id: tid });
    }
    if (e.target) e.target.value = '';
  };

  const finalizeReelUpload = async () => {
    if (!pendingReelFile) return;

    if (!user?.id || user?.id?.startsWith('demo_') || user?.id?.startsWith('user_guest_')) {
      toast.error('🔐 Only registered Buyers and Sellers can upload reels or stories. Please register or login!');
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

    // Convert file to resilient persistent Data URL & Thumbnail (compressed to lightweight KB)
    let persistentMediaUrl = firebaseStorageUrl || '';
    let videoThumbnailUrl = '';
    let videoStreamUrl = firebaseStorageUrl || reelPreviewUrl || (pendingReelFile ? URL.createObjectURL(pendingReelFile) : '');
    try {
      if (!isVideoFile) {
        // High efficiency image compression (<85KB) so story saves to Firestore instantly and permanently
        persistentMediaUrl = firebaseStorageUrl || (await optimizeImageForPersistence(pendingReelFile, 1080, 1920, 0.72));
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

    // Ensure music URL is stored on server instead of bloating Firestore document
    let resolvedAudioUrl = selectedMusic?.audioUrl || selectedMusic?.musicUrl || selectedMusic?.url || '';
    if (selectedMusic?.pendingFile && (!resolvedAudioUrl || resolvedAudioUrl.startsWith('blob:') || resolvedAudioUrl.startsWith('data:audio'))) {
      try {
        const uploadedAudio = await uploadAudioToServer(selectedMusic.pendingFile, selectedMusic.title, selectedMusic.artist);
        if (uploadedAudio) resolvedAudioUrl = uploadedAudio;
      } catch (e) {}
    }

    const musicObj = selectedMusic ? {
      id: selectedMusic.id,
      title: selectedMusic.title || 'Selected Music',
      artist: selectedMusic.artist || 'Vyapar Bridge',
      audioUrl: resolvedAudioUrl || (selectedMusic.serverUrl || '')
    } : null;

    const isPendingApproval = false;

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
      aiFlagReason: null,
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
      toast.info(moderation.userNotice || '⏳ Business Verification: Aapka post Admin Review me bhej diya gaya hai. Business network security ke liye moderation team verify karegi.');
    } else {
      toast.success('🎉 Reel & Story uploaded to your Profile Page and Story Feed!');
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
            safeSetLocalStorage('VyaparBridge_cached_posts', updated.slice(0, 50));
          } catch (e) {}
          return updated;
        });

        try {
          const existingStoryStr = localStorage.getItem('vyapar_my_stories');
          const existingStories = existingStoryStr ? JSON.parse(existingStoryStr) : [];
          const filteredStories = existingStories.filter((s: any) => String(s.id) !== String(reelId));
          safeSetLocalStorage('vyapar_my_stories', [syncedPost, ...filteredStories].slice(0, 30));
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

      {/* Hidden reel file input for direct upload (photos and videos from local storage) */}
      <input 
        type="file" 
        ref={reelFileInputRef} 
        accept="image/*,video/*" 
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
                  <span>{uploadProgress === 100 ? '🎉 Upload Complete!' : 'Uploading your feedback today your profile page and story...'}</span>
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
                ✓ Live
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
                    toast('Ad showcase skipped', { icon: '👁️' });
                  }}
                  className="flex items-center justify-center gap-1 p-1.5 sm:px-3 sm:py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black border border-rose-400/50 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                  title="Skip Advertisement (विज्ञापन हटाएं)"
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
                  title="Previous Slide (पिछला)"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleNextAd(combinedAdsList.length)} }
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-amber-500 hover:text-black text-white backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                  title="Next Slide (अगला)"
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
                    title="Provide Feedback (फीडबैक दें)"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                    <span>Feedback 💬</span>
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

            {/* Bottom Controls: Sound & Music upload buttons for Story / Reel */}
            <div className="mt-3 flex flex-col gap-2 bg-zinc-900/90 p-2.5 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setIsMusicModalOpen(true)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{selectedMusic ? `🎵 ${selectedMusic.title}` : '🎵 Pick Official Sound'}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => document.getElementById('custom-audio-upload-feed')?.click()}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-emerald-400 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer"
                  title="Upload audio file from your device"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Device Audio</span>
                </button>

                {selectedMusic && (
                  <button
                    type="button"
                    onClick={() => setSelectedMusic(null)}
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-xl border border-red-500/30 transition-all cursor-pointer"
                    title="Remove Music Track"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <input 
                  id="custom-audio-upload-feed" 
                  type="file" 
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.opus" 
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

function CreatePost({ user, onPostSuccess }: { user: any; onPostSuccess?: () => void }) {
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
  const [selectedMusic, setSelectedMusic] = useState<any>(null);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const multiImageInputRef = React.useRef<HTMLInputElement>(null);
  const addMoreImagesRef = React.useRef<HTMLInputElement>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);
  const thumbInputRef = React.useRef<HTMLInputElement>(null);
  const audioInputRef = React.useRef<HTMLInputElement>(null);
  const audioPreviewRef = React.useRef<HTMLAudioElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const handlePostAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const audioFile = e.target.files?.[0];
    if (!audioFile) return;

    const tid = toast.loading('Attaching device audio track...');
    try {
      // 1. Instant zero-delay preview using object URL
      const instantAudioUrl = URL.createObjectURL(audioFile);
      const title = audioFile.name.replace(/\.[^/.]+$/, "") || 'Local Sound Track';
      const artist = user?.name || 'Device Audio';
      const musicObj = {
        id: `post_music_${Date.now()}`,
        title,
        artist,
        audioUrl: instantAudioUrl,
        musicUrl: instantAudioUrl,
        url: instantAudioUrl,
        pendingFile: audioFile
      };
      setSelectedMusic(musicObj);
      toast.success(`🎵 Audio attached: ${musicObj.title}`, { id: tid });

      // 2. High-speed background upload to server storage for persistent URL
      uploadAudioToServer(audioFile, title, artist).then((serverUrl) => {
        if (serverUrl) {
          setSelectedMusic((prev: any) => prev && prev.id === musicObj.id ? {
            ...prev,
            audioUrl: serverUrl,
            musicUrl: serverUrl,
            url: serverUrl,
            serverUrl
          } : prev);
        }
      }).catch(() => {});
    } catch (err) {
      toast.error('Failed to attach audio file', { id: tid });
    }
    if (e.target) e.target.value = '';
  };

  const toggleAudioPreview = () => {
    if (!audioPreviewRef.current) return;
    if (isAudioPlaying) {
      audioPreviewRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioPreviewRef.current.play().then(() => setIsAudioPlaying(true)).catch(() => setIsAudioPlaying(false));
    }
  };

  useEffect(() => {
    if (!user?.id || user?.id?.startsWith('demo_')) {
      toast.error('🔐 Only registered Buyers and Sellers can post content on Vyapar Bridge. Please register or login!');
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

    if (isVideoFile) {
      toast('ℹ️ Local video file upload is disabled. Please paste your video link (YouTube, Vimeo, MP4 stream link) to attach video posts.', { icon: '🎥' });
      setIsVideoModalOpen(true);
      e.target.value = '';
      return;
    }

    if (isPdfFile) {
      setImageFiles([]);
      setImagePreviews([]);
      setFile(first);
      const blobUrl = URL.createObjectURL(first);
      setFilePreview(blobUrl);

      try {
        const thumb = await extractPdfFirstPageThumbnail(first);
        if (thumb.thumbnailUrl) {
          setThumbnailPreview(thumb.thumbnailUrl);
        }
      } catch (e) {
        console.warn('PDF thumbnail auto-extract note:', e);
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
        toast.success(`📸 ${validImgs.length} images selected for Facebook collage!`);
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
          toast.success("Video frame set as thumbnail! ✓");
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
        toast.success('✨ AI Hashtags suggested successfully!');
      } else {
        toast.success('Hashtags generated');
      }
    } catch (err) {
      console.warn('AI suggestion fallback:', err);
      setHashtags('#vyaparbridge #morbitiles #ceramics #sanitaryware #b2b');
      toast.success('AI Hashtags suggested! ✓');
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const isVideo = Boolean(uploadedMediaVideoUrl) || Boolean(postExternalLink && (postExternalLink.includes('youtube.com') || postExternalLink.includes('youtu.be') || postExternalLink.includes('vimeo.com') || /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(postExternalLink)));
  const isPdf = (file?.type === 'application/pdf' || file?.name.match(/\.pdf$/i)) || Boolean(uploadedMediaPdfUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || user?.id?.startsWith('demo_')) {
      toast.error('🔐 Only registered Buyers and Sellers can post content on Vyapar Bridge. Please register or login!');
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
      toast.error('ℹ️ Facebook video links are blocked by Facebook security. Please use YouTube or direct video URLs instead.');
      setIsSubmitting(false);
      return;
    }
    const isLinkVideo = Boolean(
      resolvedPostLink && (
        resolvedPostLink.includes('youtube.com') ||
        resolvedPostLink.includes('youtu.be') ||
        resolvedPostLink.includes('vimeo.com') ||
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

    const isPendingApproval = false;
    const aiFlagReason = null;

    let finalPostThumb = persistentThumbnailUrl || (isActualVideo ? (isLinkVideo ? '' : persistentThumbnailUrl) : (persistentMediaUrl || imagePreviews[0] || filePreview || ''));
    let finalPostMedia = isActualVideo 
      ? (videoStreamUrl || (isLinkVideo ? resolvedPostLink : '') || '') 
      : isPdf 
        ? ((persistentMediaUrl && !persistentMediaUrl.startsWith('blob:')) ? persistentMediaUrl : '')
        : (persistentMediaUrl || imagePreviews[0] || filePreview || '');
    let finalIsVideo = isActualVideo;

    // Direct YouTube URL parsing & lightweight CDN thumbnail (<25KB)
    if (resolvedPostLink && isYouTubeUrl(resolvedPostLink)) {
      finalIsVideo = true;
      finalPostMedia = resolvedPostLink;
      finalPostThumb = getYouTubeThumbnail(resolvedPostLink);
    }

    if (file && isVideo) {
      cacheVideoUrlInMemory(generatedId, videoStreamUrl || filePreview);
    }

    // Ensure device audio is stored as a lightweight URL instead of 10MB base64
    let finalMusicAudio = selectedMusic ? (selectedMusic.audioUrl || selectedMusic.musicUrl || selectedMusic.url || '') : '';
    if (selectedMusic?.pendingFile && (!finalMusicAudio || finalMusicAudio.startsWith('blob:') || finalMusicAudio.startsWith('data:audio'))) {
      try {
        const uploadedAudio = await uploadAudioToServer(selectedMusic.pendingFile, selectedMusic.title, selectedMusic.artist);
        if (uploadedAudio) finalMusicAudio = uploadedAudio;
      } catch (e) {}
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
      type: finalIsVideo ? 'video' : postMediaType,
      mediaUrl: finalPostMedia,
      images: finalIsVideo ? [] : (persistentImages.length > 0 ? persistentImages : (finalPostMedia ? [finalPostMedia] : [])),
      mediaUrls: finalIsVideo ? [] : (persistentImages.length > 0 ? persistentImages : (finalPostMedia ? [finalPostMedia] : [])),
      pdfUrl: isPdf ? (finalPostMedia || '') : undefined,
      videoUrl: finalIsVideo ? (videoStreamUrl || finalPostMedia) : undefined,
      video: finalIsVideo ? (videoStreamUrl || finalPostMedia) : undefined,
      thumbnailUrl: finalPostThumb,
      persistentMediaUrl: finalIsVideo ? (videoStreamUrl || finalPostMedia) : finalPostMedia,
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
      music: selectedMusic ? {
        id: selectedMusic.id,
        title: selectedMusic.title || 'Attached Sound',
        artist: selectedMusic.artist || authorName,
        audioUrl: finalMusicAudio || (selectedMusic.serverUrl || '')
      } : undefined,
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
      toast.info(moderation?.userNotice || '⏳ Business Verification: Aapka post Admin Review ke liye hold kiya gaya hai.');
    } else {
      toast.success(`🎉 Post ${visibility === 'scheduled' ? 'scheduled' : 'published'} successfully!`);
    }
    setIsSubmitting(false);
    if (onPostSuccess) onPostSuccess();
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

        let isPendingApproval = false;
        let aiFlagReason: string | undefined = undefined;

        let savedPost: any = null;

        try {
          const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData,
          });
          const ct = response.headers.get('content-type');
          if (response.ok && ct && ct.includes('application/json')) {
            const data = await response.json();
            
            if (data.pendingApproval || data.post?.status === 'pending') {
              isPendingApproval = true;
              if (data.post?.aiFlagReason) aiFlagReason = data.post.aiFlagReason;
            }

            if (data.success && data.post) {
              savedPost = data.post;
              if (savedPost.id && file) {
                saveVideoBlob(savedPost.id, file).catch(() => {});
                if (isVideo) {
                  cacheVideoUrlInMemory(savedPost.id, videoStreamUrl || filePreview || '');
                }
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
          aiFlagReason: aiFlagReason || null,
          music: selectedMusic ? {
            id: selectedMusic.id,
            title: selectedMusic.title || 'Attached Sound',
            artist: selectedMusic.artist || authorName,
            audioUrl: selectedMusic.audioUrl || selectedMusic.musicUrl || selectedMusic.url
          } : (savedPost.music || undefined)
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
          externalLink: postExternalLink || '',
          music: selectedMusic ? {
            id: selectedMusic.id,
            title: selectedMusic.title || 'Attached Sound',
            artist: selectedMusic.artist || authorName,
            audioUrl: selectedMusic.audioUrl || selectedMusic.musicUrl || selectedMusic.url
          } : (instantPost.music || undefined)
        };

        await syncPostToFirestore(finalPostData);
        window.dispatchEvent(new CustomEvent('postCreated', { detail: finalPostData }));

        // Track referral qualification: user has posted content
        if (user?.id) {
          recordUserFirstPost(user.id).catch(refErr => console.warn('Referral post track note:', refErr));
        }

        if (isPendingApproval) {
          toast.info(moderation?.userNotice || '⏳ Business Verification: Aapka post Admin Review ke liye bhej diya gaya hai. Business network security ke liye moderation team link aur content verify karegi.');
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
    uploadedMediaImages.length > 0 ||
    (postExternalLink && isVideo)
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
                {/* 1. Video Link Attachment Button */}
                <div 
                  onClick={() => setIsVideoModalOpen(true)}
                  className="aspect-video w-full border-2 border-dashed border-amber-200 dark:border-amber-900/50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-amber-500/[0.02] hover:bg-amber-500/[0.05] dark:hover:bg-amber-500/[0.03] transition-all hover:border-amber-500 p-6 text-center group/btn shadow-sm"
                >
                  <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl group-hover/btn:scale-105 transition-transform">
                    <Video className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">Attach Video Link</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">YouTube, Vimeo, or Web Video Stream</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Instant In-App High Speed Playback</p>
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
                        setUploadedMediaPdfUrl('');
                      }}
                      className="absolute top-3 right-3 z-30 p-2 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer shadow-lg"
                      title="Remove PDF"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <PdfCardViewer post={{ title: title || file?.name || 'Catalogue', mediaUrl: uploadedMediaPdfUrl || filePreview || '', thumbnailUrl: thumbnailPreview || '', user: user }} variant="feed" />
                  </div>
                ) : isVideo && (uploadedMediaVideoUrl || postExternalLink) ? (
                  <div className="relative w-full h-full">
                    {(() => {
                      const currentVid = uploadedMediaVideoUrl || postExternalLink;
                      const ytMatch = currentVid.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/i);
                      const vimeoMatch = currentVid.match(/vimeo\.com\/(\d+)/i);

                      if (ytMatch && ytMatch[1]) {
                        return (
                          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                            <iframe
                              src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        );
                      }
                      if (vimeoMatch && vimeoMatch[1]) {
                        return (
                          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                            <iframe
                              src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
                              className="w-full h-full border-0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        );
                      }
                      return (
                        <video preload="metadata" playsInline
                          ref={videoRef}
                          src={currentVid} 
                          className="w-full h-full object-cover max-h-[450px] rounded-xl" 
                          controls
                          muted 
                        />
                      );
                    })()}

                    <button 
                      type="button"
                      onClick={() => { 
                        setFile(null); 
                        setFilePreview(null); 
                        setThumbnailFile(null); 
                        setThumbnailPreview(null); 
                        setUploadedMediaVideoUrl(''); 
                        setPostExternalLink('');
                      }}
                      className="absolute top-3 right-3 p-2 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors z-30 cursor-pointer shadow-lg"
                      title="Remove Video"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (imagePreviews.length > 0 || uploadedMediaImages.length > 0) ? (
                  <div className="space-y-3">
                    {/* Header bar with count and actions */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 font-black text-xs">
                          📸 {uploadedMediaImages.length > 0 ? uploadedMediaImages.length : imagePreviews.length} / 10 Photos
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
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <input type="file" ref={multiImageInputRef} className="hidden" multiple accept="image/*" onChange={handleFileChange} />
            <input type="file" ref={addMoreImagesRef} className="hidden" multiple accept="image/*" onChange={handleAddMoreImages} />
            <input type="file" ref={pdfInputRef} className="hidden" accept=".pdf,application/pdf" onChange={handleFileChange} />
            <input type="file" ref={thumbInputRef} className="hidden" accept="image/*" onChange={handleThumbnailChange} />
            <input type="file" ref={audioInputRef} className="hidden" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.opus" onChange={handlePostAudioUpload} />
          </div>

          {/* Background Music & Audio Track Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 dark:border-emerald-500/30">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-zinc-100 uppercase tracking-wider">
                    🎵 Background Music & Audio (संगीत जोड़ें)
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Plays sound with your photos on feed with audio controls
                  </p>
                </div>
              </div>
              {selectedMusic && (
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Sound Attached ✓
                </span>
              )}
            </div>

            {selectedMusic ? (
              <div className="bg-white/90 dark:bg-zinc-800/90 rounded-xl p-3 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={toggleAudioPreview}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      isAudioPlaying ? 'bg-emerald-600 text-white shadow-md animate-pulse' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-200'
                    }`}
                    title={isAudioPlaying ? "Pause Audio" : "Preview Audio"}
                  >
                    {isAudioPlaying ? <VolumeX className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-zinc-100 truncate">
                      🎵 {selectedMusic.title}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                      {selectedMusic.artist || 'Local Device Audio'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsMusicModalOpen(true)}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (audioPreviewRef.current) audioPreviewRef.current.pause();
                      setIsAudioPlaying(false);
                      setSelectedMusic(null);
                    }}
                    className="p-1.5 bg-red-100 dark:bg-red-950/50 hover:bg-red-200 text-red-600 rounded-lg text-xs transition-all cursor-pointer"
                    title="Remove Audio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <audio 
                  ref={audioPreviewRef} 
                  src={selectedMusic.audioUrl || selectedMusic.musicUrl || selectedMusic.url} 
                  onEnded={() => setIsAudioPlaying(false)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className="py-2.5 px-3 bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Upload Audio from Device</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMusicModalOpen(true)}
                  className="py-2.5 px-3 bg-white dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
                >
                  <Music className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Choose Official Sound</span>
                </button>
              </div>
            )}
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
                    ₹
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-black dark:text-zinc-100 uppercase tracking-wider">
                      B2B Wholesale Price Range (कीमत दायरा)
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
                      ₹
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
                      ₹
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
                    Pricing Unit (इकाई)
                  </label>
                  <select 
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Box">Per Box (प्रति बॉक्स)</option>
                    <option value="Sq.Ft">Per Sq.Ft (प्रति वर्ग फुट)</option>
                    <option value="Sq.Mtr">Per Sq.Mtr (प्रति वर्ग मीटर)</option>
                    <option value="Piece">Per Piece (प्रति नग)</option>
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
          setPostExternalLink(mediaUrl);
          if (thumbnailUrl) setThumbnailPreview(thumbnailUrl);
          if (duration) setVideoDuration(duration);
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

      <MusicSelectionModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSelect={(music) => {
          setSelectedMusic(music);
          setIsMusicModalOpen(false);
          toast.success(`🎵 Selected sound: ${music.title}`);
        }}
      />
    </div>
  );
}

// AdminPanel is modularized in /src/components/AdminPanel.tsx

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
          toast.error(data.error || '⛔ AI Safety Guardrail: Message blocked due to abusive language or inappropriate content.');
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
                          toast.error(`📍 Distance Restriction: As a Local Member, you can only chat with dealers within 100km. This business is ${Math.round(dist)}km away. Upgrade to 'Direct Company' plan for nationwide access!`);
                          return;
                        }
                      } else if (!userLocation) {
                        toast.error("📍 Please enable GPS/Location to verify distance for Local Membership.");
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
                      <span>•</span>
                      <span className="truncate">
                        {isLockedForCustomer && lastMsg?.senderId !== user.id ? (
                          <span className="text-blue-500 font-medium italic">🔒 New Message Hidden</span>
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
              <p className="text-slate-500 mb-6 text-sm max-w-xs">Connect directly with Factory owners to negotiate trade orders!</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
              {/* Chat Header */}
              <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                  <button onClick={() => setActiveContact(null)} className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 font-bold text-black/60 flex items-center justify-center">
                    {activeContact.avatarUrl ? (
                      <img src={activeContact.avatarUrl} alt={activeContact.name} className="w-full h-full object-cover" />
                    ) : (
                      (activeContact.name || activeContact.userName || 'U').charAt(0)
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span className="truncate">{activeContact.name}</span>
                      {activeContact.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium truncate">
                      {activeContact.companyName || 'Verified Partner'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeContact.phone && (
                    <a href={`tel:${activeContact.phone}`} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors" title="Call">
                      <Phone className="w-5 h-5" />
                    </a>
                  )}
                  <button onClick={() => navigate(`/profile/${activeContact.id}`)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors font-semibold text-xs border border-slate-200" title="View Profile">
                    View Profile
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col pb-24">
                {activeMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-60">
                    <MessageSquare className="w-12 h-12 text-slate-400 mb-2" />
                    <h4 className="font-bold text-sm text-slate-700">No message history yet</h4>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">Send a message to start negotiating trade orders!</p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isOwn = msg.senderId === user.id;
                    return (
                      <div key={msg.id} className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[75%] rounded-2xl p-3.5 shadow-xs relative group/msg", 
                          isOwn 
                            ? "bg-blue-600 text-white rounded-tr-none" 
                            : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                        )}>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="Uploaded media" className="rounded-lg mb-2 max-h-60 object-cover w-full cursor-pointer" referrerPolicy="no-referrer" />
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                          <div className="flex items-center justify-between gap-4 mt-1.5">
                            <span className={cn("text-[9px] font-semibold tracking-wide", isOwn ? "text-blue-200" : "text-slate-400")}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOwn && (
                              <button onClick={() => handleDeleteMessage(msg.id)} className="opacity-0 group-hover/msg:opacity-100 p-1 text-blue-200 hover:text-red-300 rounded transition-opacity" title="Delete Message">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Box */}
              <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-200 p-3.5 z-20 shadow-lg">
                <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                  {pendingImagePreview && (
                    <div className="relative inline-block w-20 h-20 rounded-lg overflow-hidden border border-slate-300 shadow-sm shrink-0">
                      <img src={pendingImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setPendingImage(null); setPendingImagePreview(''); }} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      ref={chatFileInputRef} 
                      onChange={handleImageSend} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button 
                      type="button" 
                      onClick={() => chatFileInputRef.current?.click()}
                      className="p-2.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                      title="Attach Image"
                    >
                      <Image className="w-5 h-5" />
                    </button>

                    <input 
                      type="text" 
                      value={newMessage} 
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 bg-slate-100 border-0 focus:ring-2 focus:ring-blue-500 text-sm py-2.5 px-4 rounded-full text-slate-800 font-medium placeholder-slate-400"
                    />

                    <button 
                      type="submit" 
                      disabled={uploadingImage || (!newMessage.trim() && !pendingImage)}
                      className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none shrink-0"
                    >
                      {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ user, onUpdateUser }: { user: any; onUpdateUser?: (u: any) => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [profilePosts, setProfilePosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'catalog' | 'info' | 'reviews'>('posts');

  // Engagement & Settings Modals
  const [isEngagementModalOpen, setIsEngagementModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [catalogUrl, setCatalogUrl] = useState('');
  const [catalogThumbnailUrl, setCatalogThumbnailUrl] = useState('');
  const [category, setCategory] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'seller' | 'buyer' | 'manufacturer' | 'dealer'>('seller');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // File Upload Refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const profilePdfInputRef = useRef<HTMLInputElement>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isUploadingCatalog, setIsUploadingCatalog] = useState(false);

  // Reviews States
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const isOwnProfile = user && String(user.id) === String(id);

  const populateUserData = (data: any) => {
    setProfileUser(data);
    setCompanyName(data.companyName || data.name || 'Shubharambh Reality');
    setName(data.name || '');
    setPhone(data.phone || '8081351809');
    setEmail(data.email || '');
    setWebsite(data.website || '');
    setDescription(data.description || 'Builders & Civil Contractors, Residential Apartments, Plotting & Commercial Projects.');
    setCatalogUrl(data.catalogueUrl || data.catalogUrl || '');
    setCatalogThumbnailUrl(data.catalogueThumbnailUrl || data.catalogThumbnailUrl || '');
    setCategory(data.category || 'Builders & Civil Contractors (बिल्डर, ठेकेदार व कंस्ट्रक्शन), Residential Apartment');
    setLocality(data.locality || data.city || 'Ramadevi');
    setCity(data.city || 'Kanpur');
    setState(data.state || 'Uttar Pradesh');
    setPincode(data.pincode || '208010');
    setAddress(data.address || 'Ramadevi, Kanpur, Kanpur Nagar, Uttar Pradesh, 208010, India');
    setRole(data.role || 'seller');
    setAvatarUrl(data.avatarUrl || '');
    setCoverUrl(data.coverUrl || '');
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    safeFetch(`/api/users/${id}`)
      .then(data => {
        if (data && data.id) {
          populateUserData(data);
        } else {
          safeFetch('/api/users').then(users => {
            const found = Array.isArray(users) ? users.find((u: any) => String(u.id) === String(id)) : null;
            if (found) {
              populateUserData(found);
            } else if (user && String(user.id) === String(id)) {
              populateUserData(user);
            }
          });
        }
      })
      .catch(() => {
        if (user && String(user.id) === String(id)) {
          populateUserData(user);
        }
      })
      .finally(() => setLoading(false));

    const filterAndSetPosts = (allPosts: any[]) => {
      if (!Array.isArray(allPosts)) return;
      const targetIdStr = String(id).trim().toLowerCase();
      const currentLoggedInId = user?.id ? String(user.id).trim().toLowerCase() : null;
      const currentUsername = user?.username ? String(user.username).trim().toLowerCase() : null;
      const currentName = user?.name ? String(user.name).trim().toLowerCase() : null;
      const currentCompName = user?.companyName ? String(user.companyName).trim().toLowerCase() : null;

      const pUserId = profileUser?.id ? String(profileUser.id).trim().toLowerCase() : null;
      const pUsername = profileUser?.username ? String(profileUser.username).trim().toLowerCase() : null;
      const pName = profileUser?.name ? String(profileUser.name).trim().toLowerCase() : null;
      const pComp = profileUser?.companyName ? String(profileUser.companyName).trim().toLowerCase() : null;

      const filtered = allPosts.filter(p => {
        if (!p) return false;
        const postOwnerId = String(p.userId || p.user?.id || '').trim().toLowerCase();
        if (postOwnerId === targetIdStr) return true;

        if (pUserId && postOwnerId === pUserId) return true;

        const postAuthorName = String(p.userName || p.user?.name || '').trim().toLowerCase();
        const postAuthorUser = String(p.user?.username || '').trim().toLowerCase();
        const postCompName = String(p.user?.companyName || '').trim().toLowerCase();

        // Check against target profile user
        if (pUsername && (postAuthorUser === pUsername || postAuthorName === pUsername)) return true;
        if (pName && postAuthorName === pName) return true;
        if (pComp && postCompName === pComp) return true;

        // Check if viewing own profile
        if (currentLoggedInId && targetIdStr === currentLoggedInId) {
          if (postOwnerId === currentLoggedInId) return true;
          if (currentUsername && (postAuthorUser === currentUsername || postAuthorName === currentUsername)) return true;
          if (currentName && postAuthorName === currentName) return true;
          if (currentCompName && postCompName === currentCompName) return true;
        }

        return false;
      });

      // Deduplicate by ID
      const postMap = new Map<string, any>();
      filtered.forEach(p => {
        if (p && p.id) {
          const existing = postMap.get(String(p.id)) || {};
          postMap.set(String(p.id), { ...existing, ...p });
        }
      });

      const sorted = Array.from(postMap.values()).sort((a, b) => {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setProfilePosts(sorted);
    };

    const loadProfilePosts = async () => {
      const allPool: any[] = [];
      
      // Local cached pool
      try {
        const cached = localStorage.getItem('VyaparBridge_cached_posts');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) allPool.push(...parsed);
        }
      } catch {}

      // Fetch from both API and Firestore in parallel
      const [backendResult, firestoreResult] = await Promise.allSettled([
        safeFetch(`/api/posts?userId=${id}`),
        fetchPostsFromFirestore()
      ]);

      if (backendResult.status === 'fulfilled' && Array.isArray(backendResult.value)) {
        allPool.push(...backendResult.value);
      }
      if (firestoreResult.status === 'fulfilled' && Array.isArray(firestoreResult.value)) {
        allPool.push(...firestoreResult.value);
      }

      filterAndSetPosts(allPool);
    };

    loadProfilePosts();

    // Subscribe to real-time Firestore updates
    const unsubscribePosts = subscribeToPostsFromFirestore((realtimePosts) => {
      if (Array.isArray(realtimePosts)) {
        filterAndSetPosts(realtimePosts);
      }
    });

    // Listen to local postCreated events
    const handleNewPost = (e: any) => {
      const newPost = e?.detail;
      if (newPost) {
        setProfilePosts(prev => {
          const exists = prev.some(p => String(p.id) === String(newPost.id));
          if (!exists) {
            return [newPost, ...prev];
          }
          return prev;
        });
      }
    };
    window.addEventListener('postCreated', handleNewPost);

    const cachedReviews = localStorage.getItem(`vyapar_reviews_${id}`);
    if (cachedReviews) {
      setReviews(JSON.parse(cachedReviews));
    } else {
      setReviews([
        { id: '1', name: 'Ramesh Patel', rating: 5, comment: 'Best quality vitrified tiles & construction directly from verified partners! Highly recommended.', createdAt: Date.now() - 3600000 * 24 * 3 },
        { id: '2', name: 'Kanpur Buildcon', rating: 5, comment: 'Very reliable commercial property & trusted trade partner in Ramadevi, Kanpur.', createdAt: Date.now() - 3600000 * 24 * 7 }
      ]);
    }

    return () => {
      unsubscribePosts();
      window.removeEventListener('postCreated', handleNewPost);
    };
  }, [id, user, profileUser?.id]);

  // Generate first-page thumbnail if catalogUrl exists but thumbnail is missing
  useEffect(() => {
    if (catalogUrl && !catalogThumbnailUrl) {
      extractPdfFirstPageThumbnail(catalogUrl)
        .then((res) => {
          if (res && res.thumbnailUrl) {
            setCatalogThumbnailUrl(res.thumbnailUrl);
          }
        })
        .catch(() => {});
    }
  }, [catalogUrl, catalogThumbnailUrl]);

  // Cover photo change handler
  const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profileUser) return;
    try {
      toast.loading('Optimizing cover image...', { id: 'cover-upload' });
      const optimizedData = await optimizeImageForPersistence(file);
      const newCoverUrl = optimizedData || URL.createObjectURL(file);
      
      const updated = {
        ...profileUser,
        coverUrl: newCoverUrl
      };
      setCoverUrl(newCoverUrl);
      setProfileUser(updated);
      await syncUserToFirestore(updated);
      if (isOwnProfile && onUpdateUser) {
        onUpdateUser(updated);
      }
      toast.success('Cover photo updated successfully!', { id: 'cover-upload' });
    } catch (err) {
      console.warn('Cover photo error:', err);
      toast.error('Failed to update cover photo.', { id: 'cover-upload' });
    }
  };

  // Remove cover photo
  const handleRemoveCoverPhoto = async () => {
    if (!profileUser) return;
    const defaultCover = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';
    const updated = {
      ...profileUser,
      coverUrl: defaultCover
    };
    setCoverUrl(defaultCover);
    setProfileUser(updated);
    await syncUserToFirestore(updated);
    if (isOwnProfile && onUpdateUser) {
      onUpdateUser(updated);
    }
    toast.success('Cover photo reset to default.');
  };

  // Avatar photo change handler
  const handleAvatarPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profileUser) return;
    try {
      toast.loading('Updating profile logo...', { id: 'avatar-upload' });
      const optimizedData = await optimizeImageForPersistence(file);
      const newAvatarUrl = optimizedData || URL.createObjectURL(file);
      
      const updated = {
        ...profileUser,
        avatarUrl: newAvatarUrl
      };
      setAvatarUrl(newAvatarUrl);
      setProfileUser(updated);
      await syncUserToFirestore(updated);
      if (isOwnProfile && onUpdateUser) {
        onUpdateUser(updated);
      }
      toast.success('Profile logo updated successfully!', { id: 'avatar-upload' });
    } catch (err) {
      console.warn('Avatar photo error:', err);
      toast.error('Failed to update profile logo.', { id: 'avatar-upload' });
    }
  };

  // PDF Catalog Gallery File Upload Handler
  const handleCatalogFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profileUser) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('❌ Please select a valid PDF Catalogue file.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('❌ PDF size cannot exceed 50MB.');
      return;
    }

    try {
      setIsUploadingCatalog(true);
      toast.loading('📁 Uploading PDF Catalogue from gallery...', { id: 'catalog-upload' });

      // Immediate extraction of front page thumbnail from local File
      let extractedThumbnail = '';
      try {
        const thumbResult = await extractPdfFirstPageThumbnail(file);
        if (thumbResult && thumbResult.thumbnailUrl) {
          extractedThumbnail = thumbResult.thumbnailUrl;
          setCatalogThumbnailUrl(extractedThumbnail);
        }
      } catch (thumbErr) {
        console.warn('PDF front page extraction note:', thumbErr);
      }

      let newCatalogUrl = '';
      try {
        const uploadResult = await createPdfCatalogUrl(file, profileUser.id || 'user');
        newCatalogUrl = uploadResult.mediaUrl;
        if (!extractedThumbnail && uploadResult.thumbnailUrl) {
          extractedThumbnail = uploadResult.thumbnailUrl;
          setCatalogThumbnailUrl(extractedThumbnail);
        }
      } catch (uploadErr) {
        console.warn('Direct cloud upload notice, converting file for instant local persistence:', uploadErr);
        const reader = new FileReader();
        newCatalogUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      if (newCatalogUrl) {
        if (!extractedThumbnail) {
          extractedThumbnail = generateFallbackPdfCover(file.name.replace(/\.pdf$/i, ''), displayCompanyName);
          setCatalogThumbnailUrl(extractedThumbnail);
        }

        const updated = {
          ...profileUser,
          catalogueUrl: newCatalogUrl,
          catalogUrl: newCatalogUrl,
          catalogueThumbnailUrl: extractedThumbnail,
          catalogThumbnailUrl: extractedThumbnail
        };
        setCatalogUrl(newCatalogUrl);
        setCatalogThumbnailUrl(extractedThumbnail);
        setProfileUser(updated);
        await syncUserToFirestore(updated);
        if (isOwnProfile && onUpdateUser) {
          onUpdateUser(updated);
        }
        toast.success('🎉 PDF Catalogue added successfully from gallery!', { id: 'catalog-upload' });
      }
    } catch (err) {
      console.error('Catalog upload error:', err);
      toast.error('Failed to upload PDF catalogue.', { id: 'catalog-upload' });
    } finally {
      setIsUploadingCatalog(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveCatalog = async () => {
    if (!profileUser) return;
    const updated = {
      ...profileUser,
      catalogueUrl: '',
      catalogUrl: ''
    };
    setCatalogUrl('');
    setProfileUser(updated);
    await syncUserToFirestore(updated);
    if (isOwnProfile && onUpdateUser) {
      onUpdateUser(updated);
    }
    toast.success('🗑️ PDF Catalogue removed.');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUser) return;

    const fullAddr = address || `${locality || city || 'Ramadevi'}, ${city || 'Kanpur'}, ${state || 'Uttar Pradesh'}, ${pincode || '208010'}, India`;

    const updatedUser = {
      ...profileUser,
      companyName,
      name,
      phone,
      email,
      website,
      description,
      catalogueUrl: catalogUrl,
      category,
      locality: locality || city || 'Ramadevi',
      city: city || 'Kanpur',
      state: state || 'Uttar Pradesh',
      pincode: pincode || '208010',
      address: fullAddr,
      role,
      avatarUrl: avatarUrl || profileUser.avatarUrl,
      coverUrl: coverUrl || profileUser.coverUrl,
      goldenBadge: true,
      isVerified: true,
    };

    try {
      const success = await syncUserToFirestore(updatedUser);
      if (success) {
        setProfileUser(updatedUser);
        if (isOwnProfile && onUpdateUser) {
          onUpdateUser(updatedUser);
        }
        toast.success('✅ Trade Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error('Failed to sync profile to Cloud.');
      }
    } catch {
      toast.error('Profile update connection failed.');
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newReview = {
      id: `rev_${Date.now()}`,
      name: user?.name || user?.companyName || 'Anonymous Business Buyer',
      rating,
      comment: comment.trim(),
      createdAt: Date.now(),
    };

    const nextReviews = [newReview, ...reviews];
    setReviews(nextReviews);
    safeSetLocalStorage(`vyapar_reviews_${id}`, nextReviews.slice(0, 30));
    setComment('');
    toast.success('Feedback posted successfully!');
  };

  const handleDeleteReview = (revId: string) => {
    const nextReviews = reviews.filter(r => r.id !== revId);
    setReviews(nextReviews);
    safeSetLocalStorage(`vyapar_reviews_${id}`, nextReviews.slice(0, 30));
    toast.success('Review removed');
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 bg-[#FCF5DF]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
        <span className="text-amber-900 font-bold mt-3 text-sm tracking-wide">Loading Trade Profile...</span>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 bg-[#FCF5DF] text-center">
        <AlertTriangle className="w-16 h-16 text-amber-600 mb-4" />
        <h2 className="text-xl font-bold text-amber-950 mb-2">Profile Not Found</h2>
        <p className="text-amber-900/70 max-w-sm mb-6">This trade business account does not exist or has been deactivated.</p>
        <button onClick={() => navigate('/')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-full transition-colors shadow-md">Go Home</button>
      </div>
    );
  }

  const reviewAvg = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : '5.0';

  const displayCover = profileUser.coverUrl || coverUrl || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';
  const displayCompanyName = profileUser.companyName || profileUser.name || 'Shubharambh Reality';
  const displayCategory = profileUser.category || 'Builders & Civil Contractors (बिल्डर, ठेकेदार व कंस्ट्रक्शन), Residential Apartment';
  const displayLocality = profileUser.locality || profileUser.city || 'Ramadevi';
  const displayState = profileUser.state || 'Uttar Pradesh';
  const displayFullAddress = profileUser.address || `${displayLocality}, Kanpur, Kanpur Nagar, ${displayState}, ${profileUser.pincode || '208010'}, India`;
  const displayPhone = profileUser.phone || '8081351809';

  return (
    <div className="min-h-screen bg-[#FCF5DF] pb-24 text-slate-800">
      {/* Hidden file inputs for cover and avatar */}
      <input
        type="file"
        ref={coverInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleCoverPhotoChange}
      />
      <input
        type="file"
        ref={avatarInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleAvatarPhotoChange}
      />

      <div className="max-w-2xl mx-auto px-4 py-3 space-y-4">
        {/* Top Motto Banner */}
        <div className="text-center py-1">
          <span className="text-xs font-bold text-amber-800 tracking-wider flex items-center justify-center gap-1.5 opacity-90">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            VOCAL FOR LOCAL
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </span>
        </div>

        {/* 1. Cover Photo & Avatar Card */}
        <div className="relative">
          {/* Cover Container */}
          <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-lg border border-amber-900/10 relative bg-zinc-900 group">
            <img
              src={displayCover}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {/* Top Right Actions */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md shadow-lg transition-all active:scale-95 cursor-pointer"
                title="Change Cover Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemoveCoverPhoto}
                className="p-2.5 bg-red-600/90 hover:bg-red-700 text-white rounded-full backdrop-blur-md shadow-lg transition-all active:scale-95 cursor-pointer"
                title="Remove Cover Photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Overlapping Avatar Logo */}
          <div className="-mt-14 ml-4 sm:ml-6 relative z-20 inline-block">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center p-1">
                {profileUser.avatarUrl || avatarUrl ? (
                  <img
                    src={profileUser.avatarUrl || avatarUrl}
                    alt={displayCompanyName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 to-red-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-inner uppercase">
                    {displayCompanyName.charAt(0)}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full border-2 border-white shadow-md cursor-pointer transition-all active:scale-95"
                title="Change Profile Photo"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Business Title, Verification Badge & Seller Tag */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-amber-900 italic font-serif tracking-tight truncate max-w-[280px] sm:max-w-md">
              {displayCompanyName}
            </h1>
            {/* Golden verified check icon */}
            <div className="p-1 bg-amber-500 text-white rounded-full shadow-xs shrink-0" title="Verified Trade Business">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            {/* Seller / Role Badge */}
            <span className="px-2.5 py-0.5 bg-red-600 text-white text-[11px] font-black rounded-md uppercase tracking-wider flex items-center gap-1 shadow-xs shrink-0">
              <span>🏢</span>
              <span>[{profileUser.role === 'buyer' ? 'BUYER' : profileUser.role === 'manufacturer' ? 'FACTORY' : 'SELLER'}]</span>
            </span>
          </div>

          {/* Categories Pill */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white border border-slate-200/90 rounded-full text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-2 max-w-full overflow-hidden truncate">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{displayCategory}</span>
            </div>
          </div>

          {/* Location City */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{displayLocality}</span>
          </div>
        </div>

        {/* 3. Action Buttons Row: Edit Profile, Engagement, Settings */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex-1 py-2.5 px-4 bg-[#EBF5FF] hover:bg-[#DDF0FF] text-[#0066CC] border border-[#B8DBFF] rounded-2xl font-extrabold text-sm shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEngagementModalOpen(true)}
            className="flex-1 py-2.5 px-4 bg-[#FFF4E5] hover:bg-[#FFE8CC] text-[#B85D00] border border-[#FFDDB3] rounded-2xl font-extrabold text-sm shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>Engagement</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer shrink-0"
            title="Profile Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {isOwnProfile && (
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem('user');
                  localStorage.removeItem('VyaparBridge_user');
                  localStorage.removeItem('Vyapar Bridge_user');
                  localStorage.removeItem('vyapar_user_id');
                  localStorage.removeItem('vyapar_user_fingerprint');
                  sessionStorage.clear();
                  if (onUpdateUser) onUpdateUser(null);
                  toast.success('🎉 Logged out successfully');
                  navigate('/');
                } catch (e) {
                  console.error(e);
                  if (onUpdateUser) onUpdateUser(null);
                  navigate('/');
                }
              }}
              className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer shrink-0"
              title="Log Out (लॉग आउट करें)"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 4. VYAPAR BRIDGE GOLDEN VERIFIED Banner */}
        <div className="w-full bg-gradient-to-r from-[#92400E] via-[#B45309] to-[#78350F] text-[#FEF3C7] rounded-2xl p-3.5 shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider border border-amber-500/30">
          <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
          <span>VYAPAR BRIDGE GOLDEN VERIFIED</span>
          <span className="text-base">👑</span>
        </div>

        {/* 5. Location & Google Maps Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl shrink-0 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {displayLocality}, {displayState}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                {displayFullAddress}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayFullAddress)}`;
              window.open(mapsUrl, '_blank', 'noopener,noreferrer');
            }}
            className="w-full py-2.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Open Google Maps</span>
          </button>
        </div>

        {/* 6. Contact Details */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black text-slate-400">Phone Contact</div>
              <a href={`tel:${displayPhone}`} className="text-sm font-bold text-slate-800 hover:text-blue-600">
                {displayPhone}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/91${displayPhone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 7. Tabs Bar */}
        <div className="flex border-b border-amber-900/10 bg-white rounded-2xl shadow-xs overflow-hidden p-1 gap-1">
          {(['posts', 'catalog', 'reviews', 'info'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center",
                activeTab === tab 
                  ? "bg-amber-600 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-amber-50/50"
              )}
            >
              {tab === 'posts' ? 'Posts' : tab === 'catalog' ? 'Catalogue' : tab === 'reviews' ? 'Reviews' : 'Info'}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-4">
          {activeTab === 'posts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profilePosts.length === 0 ? (
                <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
                  <PlusSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">No active trade posts</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">This merchant hasn't published any product listings yet.</p>
                </div>
              ) : (
                profilePosts.map(post => (
                  <PostItem 
                    key={post.id} 
                    post={post} 
                    currentUser={user} 
                    onPostDeleted={(id) => setProfilePosts(prev => prev.filter(p => p.id !== id))}
                    onPostUpdated={(updatedPost) => setProfilePosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'catalog' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Digital Product Catalog
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">B2B Trade Pricing, Technical Specifications & Product Designs</p>
                </div>

                {isOwnProfile && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input 
                      type="file" 
                      ref={profilePdfInputRef} 
                      className="hidden" 
                      accept=".pdf,application/pdf" 
                      onChange={handleCatalogFileChange} 
                    />

                    <button 
                      type="button"
                      disabled={isUploadingCatalog}
                      onClick={() => profilePdfInputRef.current?.click()}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 uppercase shadow-sm cursor-pointer"
                    >
                      {isUploadingCatalog ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>{catalogUrl ? 'Change PDF (Gallery)' : 'Add PDF from Gallery'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPdfModalOpen(true)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Guided PDF Upload Wizard"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline">Upload Wizard</span>
                    </button>

                    {catalogUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveCatalog}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-200 cursor-pointer"
                        title="Remove Catalogue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {catalogUrl ? (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">
                            {displayCompanyName} Official Catalogue
                          </h4>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                            Active
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          Tap below to open full-screen interactive reader or download PDF.
                        </p>
                      </div>
                    </div>

                    <a 
                      href={catalogUrl} 
                      download={`${displayCompanyName.replace(/[^a-zA-Z0-9]/g, '_')}_Catalogue.pdf`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition-colors flex items-center justify-center gap-1.5 uppercase shrink-0 shadow-sm"
                    >
                      <Download className="w-4 h-4 text-amber-400" /> Download PDF
                    </a>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <PdfCardViewer 
                      post={{ 
                        mediaUrl: catalogUrl, 
                        pdfUrl: catalogUrl,
                        thumbnailUrl: catalogThumbnailUrl || profileUser?.catalogueThumbnailUrl || profileUser?.catalogThumbnailUrl || '',
                        title: `${displayCompanyName} Trade Catalogue`, 
                        companyName: displayCompanyName, 
                        user: profileUser 
                      }} 
                      variant="feed" 
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 px-4 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mx-auto mb-3.5 shadow-sm">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-black text-slate-800 uppercase tracking-wider">No Catalog Uploaded Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    Upload your digital catalogue PDF directly from your gallery/device files so buyers can browse your complete product lines, rates, and specifications.
                  </p>
                  {isOwnProfile ? (
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                      <button 
                        type="button"
                        disabled={isUploadingCatalog}
                        onClick={() => profilePdfInputRef.current?.click()} 
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-black rounded-full transition-all uppercase cursor-pointer shadow-md flex items-center gap-2"
                      >
                        {isUploadingCatalog ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>Add PDF from Gallery / Files</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsPdfModalOpen(true)} 
                        className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold rounded-full transition-colors uppercase cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Guided Upload</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsEditing(true)} 
                        className="px-4 py-2.5 bg-transparent hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-full transition-colors cursor-pointer"
                      >
                        🔗 Enter PDF Link
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-3 italic">Connect directly with this merchant to request their catalogue.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wide mb-4">Merchant Trade Reviews</h3>
                {!isOwnProfile && (
                  <form onSubmit={handleAddReview} className="space-y-4 border-b border-slate-100 pb-6 mb-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Your Rating</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" onClick={() => setRating(s)} className="p-1 cursor-pointer">
                            <Star className={cn("w-6 h-6", s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Trade Feedback</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your buying experience, delivery speed, packaging quality..."
                        rows={3}
                        className="w-full bg-slate-50 border-0 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm p-3.5 placeholder-slate-400 font-medium text-slate-800"
                      />
                    </div>
                    <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-full transition-colors uppercase shadow-md cursor-pointer">Submit Feedback</button>
                  </form>
                )}

                <div className="divide-y divide-slate-100 space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-xs">
                            {rev.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{rev.name}</h4>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={cn("w-3 h-3", s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                              ))}
                            </div>
                          </div>
                        </div>
                        {(user?.role === 'admin' || user?.isAdmin) && (
                          <button onClick={() => handleDeleteReview(rev.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-50 transition-colors cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">{rev.comment}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-bold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-slate-800">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide mb-2">Company Information</h3>
              {description && <p className="text-xs font-semibold leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">{description}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold divide-y md:divide-y-0 divide-slate-100">
                <div className="space-y-3 pt-3 md:pt-0">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-black">Trade Name</div>
                      <div className="text-slate-800 uppercase mt-0.5">{displayCompanyName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-black">Contact Mobile</div>
                      <div className="text-slate-800 mt-0.5">{displayPhone}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 md:pt-0">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-black">Email Address</div>
                      <div className="text-slate-800 mt-0.5">{profileUser.email || 'support@vyaparbridge.com'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-black">Trade Website</div>
                      <div className="text-slate-800 mt-0.5">
                        {profileUser.website ? (
                          <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profileUser.website}</a>
                        ) : (
                          'www.vyaparbridge.com'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Engagement Analytics Modal */}
      {isEngagementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEngagementModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-4">
              <h2 className="text-lg font-black uppercase text-slate-900 tracking-wide flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <span>Profile & Posts Engagement</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">Real-time visitor reach, interactions, likes, and save analytics</p>
            </div>
            <UserAnalyticsCard userId={profileUser.id} />
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black uppercase text-slate-900 tracking-wide mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-700" />
              <span>Account Settings</span>
            </h2>
            <div className="space-y-3 text-xs font-semibold text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Golden Verified Membership</div>
                  <div className="text-[11px] text-amber-600 font-bold">Active • Lifetime Gold Partner</div>
                </div>
                <BadgeCheck className="w-6 h-6 text-amber-500 fill-amber-500" />
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Notifications & Alerts</div>
                  <div className="text-[11px] text-slate-400">Direct buyer enquiries & comments</div>
                </div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md font-bold text-[10px]">ENABLED</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsModalOpen(false);
                  setIsEditing(true);
                }}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Edit Profile Information
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black uppercase text-slate-900 tracking-wide mb-4">Edit Trade Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">Company Trade Name</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm p-2.5 font-bold uppercase" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">Category & Subcategories</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Builders & Civil Contractors (बिल्डर, ठेकेदार व कंस्ट्रक्शन), Residential Apartment..." className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm p-2.5 font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1">Locality / Area</label>
                  <input type="text" value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="e.g. Ramadevi" className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm p-2.5 font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1">City / District</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Kanpur" className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm p-2.5 font-semibold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1">State</label>
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Uttar Pradesh" className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm p-2.5 font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1">Pincode</label>
                  <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="e.g. 208010" className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm p-2.5 font-semibold" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">Full Detailed Address (for Google Maps)</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} placeholder="e.g. Ramadevi, Kanpur, Kanpur Nagar, Uttar Pradesh, 208010, India" className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm p-2.5 font-semibold text-slate-700" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">Authorized Contact Person</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm p-2.5 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">Business Mobile</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm p-2.5 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">Business Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm p-2.5 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">Trade Website</label>
                <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm p-2.5 font-semibold" />
              </div>
              <div className="bg-amber-50/40 p-3.5 rounded-2xl border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase text-amber-900">
                    📄 Trade Catalogue PDF (Gallery / Files)
                  </label>
                  {catalogUrl && (
                    <button
                      type="button"
                      onClick={() => setCatalogUrl('')}
                      className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Remove PDF
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploadingCatalog}
                    onClick={() => profilePdfInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    {isUploadingCatalog ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>{catalogUrl ? 'Change PDF from Gallery' : '📁 Add PDF from Gallery / Files'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPdfModalOpen(true)}
                    className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-amber-200 rounded-xl transition-colors cursor-pointer"
                    title="Guided Upload Wizard"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </button>
                </div>

                {catalogUrl ? (
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200 text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                      📄 PDF Linked ({catalogUrl.substring(0, 30)}...)
                    </span>
                    <a
                      href={catalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 hover:text-amber-800 font-black text-[11px] uppercase flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">Select any standard PDF catalogue from your gallery/device.</p>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Or direct PDF Link (Optional)</label>
                  <input 
                    type="text" 
                    value={catalogUrl} 
                    onChange={(e) => setCatalogUrl(e.target.value)} 
                    placeholder="https://.../catalogue.pdf" 
                    className="w-full bg-white border-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl text-xs p-2 font-medium" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1">Company Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-slate-50 border-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl text-sm p-2.5 font-semibold text-slate-700" />
              </div>
              <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition-colors uppercase tracking-wider shadow-md cursor-pointer">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* PDF Upload Modal */}
      {isPdfModalOpen && profileUser && (
        <PdfUploadingModal
          isOpen={isPdfModalOpen}
          userId={profileUser.id || 'user'}
          onClose={() => setIsPdfModalOpen(false)}
          onUploadSuccess={async ({ mediaUrl }) => {
            if (mediaUrl) {
              const updated = {
                ...profileUser,
                catalogueUrl: mediaUrl,
                catalogUrl: mediaUrl
              };
              setCatalogUrl(mediaUrl);
              setProfileUser(updated);
              await syncUserToFirestore(updated);
              if (isOwnProfile && onUpdateUser) {
                onUpdateUser(updated);
              }
              toast.success('🎉 PDF Catalogue updated successfully from gallery!');
            }
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = safeGetLocalStorage('VyaparBridge_user') || safeGetLocalStorage('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showTileCalcDrawer, setShowTileCalcDrawer] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    // Proactively clean bloated caches on boot
    cleanupStorageQuota();
  }, []);

  useEffect(() => {
    const handleBoostModal = () => setShowBoostModal(true);
    const handleVerifyModal = () => setShowBoostModal(true);
    const handleScannerModal = () => setShowScannerModal(true);
    const handleCartModal = () => setShowCartModal(true);
    const handleCalcModal = () => setShowTileCalcDrawer(true);
    const handleOpenSidebar = () => setIsSidebarOpen(true);

    window.addEventListener('open_boost_business_modal', handleBoostModal);
    window.addEventListener('openVerifyModal', handleVerifyModal);
    window.addEventListener('open_offer_token_modal', handleScannerModal);
    window.addEventListener('openCartModal', handleCartModal);
    window.addEventListener('openTileCalculator', handleCalcModal);
    window.addEventListener('openNavigationSidebar', handleOpenSidebar);

    return () => {
      window.removeEventListener('open_boost_business_modal', handleBoostModal);
      window.removeEventListener('openVerifyModal', handleVerifyModal);
      window.removeEventListener('open_offer_token_modal', handleScannerModal);
      window.removeEventListener('openCartModal', handleCartModal);
      window.removeEventListener('openTileCalculator', handleCalcModal);
      window.removeEventListener('openNavigationSidebar', handleOpenSidebar);
    };
  }, []);

  useEffect(() => {
    const handleOpenCreate = () => {
      if (!user) {
        setAuthModalTab('login');
        setShowAuthModal(true);
      } else {
        setShowCreatePostModal(true);
      }
    };
    window.addEventListener('openCreatePost', handleOpenCreate);
    return () => window.removeEventListener('openCreatePost', handleOpenCreate);
  }, [user]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    const handleOpenAuth = (e: any) => {
      setAuthModalTab(e.detail?.tab || 'login');
      setShowAuthModal(true);
    };
    window.addEventListener('openAuthModal', handleOpenAuth);
    return () => window.removeEventListener('openAuthModal', handleOpenAuth);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const stopHeartbeat = startPresenceHeartbeat(user.id);

    const unsubUser = onSnapshot(doc(firestoreDb, "users", user.id), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const synchronizedUser = { ...user, ...data };
        setUser(synchronizedUser);
        safeSaveUser(synchronizedUser);
      }
    });

    return () => {
      if (typeof stopHeartbeat === 'function') stopHeartbeat();
      if (typeof unsubUser === 'function') unsubUser();
    };
  }, [user?.id]);

  const handleUpdateUser = (updated: any) => {
    setUser(updated);
    safeSaveUser(updated);
  };

  const handleLogOut = () => {
    try {
      setUser(null);
      safeSaveUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('VyaparBridge_user');
      localStorage.removeItem('Vyapar Bridge_user');
      localStorage.removeItem('vyapar_user_id');
      localStorage.removeItem('vyapar_user_fingerprint');
      sessionStorage.clear();
      setIsSidebarOpen(false);
      toast.success('🎉 Logged out successfully from Vyapar Bridge.');
    } catch (e) {
      console.error('Logout error:', e);
      handleUpdateUser(null);
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
        <Toaster position="top-center" reverseOrder={false} />

        <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shrink-0 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 focus:outline-none select-none">
                <div className="w-9 h-9 rounded-xl overflow-hidden p-1 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md flex items-center justify-center">
                  <img src={BRAND_LOGO_SRC} alt="Vyapar Bridge" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="font-black text-slate-900 text-sm tracking-tight leading-none uppercase select-none block">{BRAND_NAME}</span>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none block select-none mt-0.5">Trade Network</span>
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Link to="/" className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5">
                <Home className="w-4 h-4" /> Home
              </Link>
              <Link to="/chat" className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> Chat
              </Link>
              <button 
                onClick={() => {
                  if (!user) {
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  } else {
                    setShowCreatePostModal(true);
                  }
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-lg transition-all flex items-center gap-1.5 uppercase shadow-sm cursor-pointer hover:shadow-md"
                title="Upload Photos, PDF Catalogues & Create Post"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Post</span>
              </button>
              {user && (
                <Link to={`/profile/${user.id}`} className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Profile
                </Link>
              )}
              {(user?.role === 'admin' || user?.isAdmin) && (
                <Link to="/admin" className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Admin Panel
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <Link to={`/profile/${user.id}`} className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300 shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-slate-700 uppercase">{(user.name || 'U').charAt(0)}</span>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-extrabold text-xs text-slate-900 uppercase max-w-[120px] truncate">{user.name || user.companyName}</span>
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest leading-none mt-0.5">{user.role || 'Member'}</span>
                  </div>
                </Link>
              ) : (
                <button onClick={() => { setAuthModalTab('login'); setShowAuthModal(true); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-full transition-colors flex items-center gap-1.5 uppercase shadow-md cursor-pointer">
                  <LogIn className="w-4 h-4" /> Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Feed user={user} onUpdateUser={handleUpdateUser} userLocation={userLocation} />} />
            <Route path="/chat" element={<Chat user={user} userLocation={userLocation} />} />
            <Route path="/create-post" element={<div className="max-w-2xl mx-auto py-6 px-3 sm:px-4"><CreatePost user={user} onPostSuccess={() => {}} /></div>} />
            <Route path="/profile/:id" element={<ProfilePage user={user} onUpdateUser={handleUpdateUser} />} />
            <Route path="/admin" element={<AdminPanel user={user} onUpdateUser={handleUpdateUser} />} />
            <Route path="/login" element={<AuthPage tab="login" user={user} onUpdateUser={handleUpdateUser} />} />
            <Route path="/register" element={<AuthPage tab="register" user={user} onUpdateUser={handleUpdateUser} />} />
            <Route path="/terms" element={<TermsPage />} />
          </Routes>
        </main>

        <AIChatbotWidget currentUser={user} userLocation={userLocation} />

        <NavigationSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={user}
          onUpdateUser={handleUpdateUser}
          onOpenCreatePost={() => {
            if (!user) {
              setAuthModalTab('login');
              setShowAuthModal(true);
            } else {
              setShowCreatePostModal(true);
            }
          }}
          onOpenCart={() => setShowCartModal(true)}
          onOpenScanner={() => setShowScannerModal(true)}
          onOpenBoost={() => setShowBoostModal(true)}
          onOpenReferral={() => setShowReferralModal(true)}
          onOpenCalculator={() => setShowTileCalcDrawer(true)}
          onOpenRating={() => setShowRatingModal(true)}
          onOpenTerms={() => setShowTermsModal(true)}
          onOpenAuth={(tab) => {
            setAuthModalTab(tab);
            setShowAuthModal(true);
          }}
          onLogOut={handleLogOut}
        />

        <TileCalculatorDrawer isOpen={showTileCalcDrawer} onClose={() => setShowTileCalcDrawer(false)} />
        <CustomerCartCouponsModal isOpen={showCartModal} onClose={() => setShowCartModal(false)} currentUser={user} />
        <SellerDiscountScannerModal isOpen={showScannerModal} onClose={() => setShowScannerModal(false)} currentUser={user} />
        <BoostBusinessModal isOpen={showBoostModal} onClose={() => setShowBoostModal(false)} user={user} onUpdateUser={handleUpdateUser} />
        <ReferralRewardsModal isOpen={showReferralModal} onClose={() => setShowReferralModal(false)} user={user} />

        {showRatingModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full relative overflow-hidden p-6">
              <button 
                onClick={() => setShowRatingModal(false)} 
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 z-10 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <PlatformRatingWidget currentUser={user} />
            </div>
          </div>
        )}

        {showTermsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative p-6">
              <button 
                onClick={() => setShowTermsModal(false)} 
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 z-10 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <TermsPage isModal onClose={() => setShowTermsModal(false)} />
            </div>
          </div>
        )}

        <footer className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200/80 h-16 flex items-center justify-around z-40 shadow-xl px-2">
          <Link to="/" className="flex flex-col items-center justify-center p-2 text-slate-500 hover:text-blue-600 transition-colors focus:outline-none shrink-0" title="Home">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-wider mt-1">Home</span>
          </Link>
          
          <Link to="/chat" className="flex flex-col items-center justify-center p-2 text-slate-500 hover:text-blue-600 transition-colors focus:outline-none shrink-0" title="Chat">
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-wider mt-1">Chat</span>
          </Link>

          {/* Elevated Centered Plus (+) Upload Button */}
          <button 
            id="footer-upload-plus-btn"
            onClick={() => {
              if (!user) {
                setAuthModalTab('login');
                setShowAuthModal(true);
                toast.info('Please sign in to upload photos, PDFs & create posts!');
              } else {
                setShowCreatePostModal(true);
              }
            }}
            className="flex flex-col items-center justify-center -mt-6 p-1 group focus:outline-none cursor-pointer select-none shrink-0"
            title="Upload Photos, PDF & Create Post (फोटो व पीडीएफ अपलोड करें)"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 group-active:scale-95 transition-transform border-[3px] border-white">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider mt-0.5">Post</span>
          </button>

          {user ? (
            <Link to={`/profile/${user.id}`} className="flex flex-col items-center justify-center p-2 text-slate-500 hover:text-blue-600 transition-colors focus:outline-none shrink-0" title="Profile">
              <User className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider mt-1">Profile</span>
            </Link>
          ) : (
            <button onClick={() => { setAuthModalTab('login'); setShowAuthModal(true); }} className="flex flex-col items-center justify-center p-2 text-slate-500 hover:text-blue-600 transition-colors focus:outline-none shrink-0 cursor-pointer" title="Sign In">
              <LogIn className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider mt-1">Sign In</span>
            </button>
          )}

          {/* Mobile Sidebar Menu Drawer Toggle (Replaces Admin from footer) */}
          <button 
            id="footer-menu-btn"
            type="button"
            onClick={() => setIsSidebarOpen(true)} 
            className="flex flex-col items-center justify-center p-2 text-slate-500 hover:text-blue-600 transition-colors focus:outline-none shrink-0 cursor-pointer" 
            title="Menu & Controls"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-wider mt-1">Menu</span>
          </button>
        </footer>

        {/* Create Post Modal Dialog */}
        {showCreatePostModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto relative p-4 sm:p-6 my-auto">
              <button 
                onClick={() => setShowCreatePostModal(false)} 
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600 z-10 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <CreatePost 
                user={user} 
                onPostSuccess={() => setShowCreatePostModal(false)} 
              />
            </div>
          </div>
        )}

        {showAuthModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full relative overflow-hidden">
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500 z-10">
                <X className="w-5 h-5" />
              </button>
              <div className="p-2">
                <AuthPage tab={authModalTab} user={user} isModal onCloseModal={() => setShowAuthModal(false)} onUpdateUser={(u) => { handleUpdateUser(u); setShowAuthModal(false); }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}
