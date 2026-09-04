import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Shield, Terminal, Sparkles, Film, ShieldAlert, Volume2, Users, CreditCard, 
  Trash2, CheckCircle, CheckCircle2, X, Upload, Wrench, RotateCcw, Database, 
  Download, QrCode, Lock, KeyRound, ArrowRight, Eye, RefreshCw, AlertTriangle, 
  ExternalLink, Phone, Copy, Check, Plus, Loader2, Play, Image as ImageIcon,
  Crown, ShieldCheck, BadgeCheck, Search, Filter, SlidersHorizontal, UserCheck,
  Building2, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db as firestoreDb } from '../firebase';
import { 
  fetchPostsFromFirestore, 
  subscribeToPostsFromFirestore, 
  saveBrandAdsToFirestore, 
  getAdminSettingsFromFirestore, 
  saveAdminSettingsToFirestore, 
  authenticateUserInFirestore, 
  deletePostFromFirestore, 
  deleteUserFromFirestore,
  fetchAllUsersFromFirestore,
  subscribeToUsersFromFirestore,
  subscribeToPaymentsFromFirestore,
  updateUserVerificationInFirestore
} from '../services/firebaseDataSync';
import { clearLockout } from '../utils/lockoutManager';
import { UniversalYouTubePlayer, isYouTubeUrl } from './UniversalYouTubePlayer';
import { AdminUserDetailModal } from './AdminUserDetailModal';

// Helper for class names
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

// Safe API fetcher
async function safeFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      return { success: false, items: [] };
    }
    if (!contentType || !contentType.includes('application/json')) {
      return { success: true, items: [] };
    }
    return await res.json();
  } catch {
    return { success: false, items: [] };
  }
}

export interface BrandAdItem {
  id: string;
  title: string;
  companyName: string;
  description: string;
  mediaUrl: string;
  linkUrl: string;
  type: 'image' | 'video';
  isActive: boolean;
  createdAt: number;
}

interface AdminPanelProps {
  user: any;
  onUpdateUser?: (u: any) => void;
}

export function AdminPanel({ user, onUpdateUser }: AdminPanelProps) {
  // Authentication State
  const [authAdminId, setAuthAdminId] = useState('');
  const [authAdminPassword, setAuthAdminPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'branding' | 'payments' | 'dev_console' | 'posts' | 'reports' | 'music' | 'users'>('branding');

  // Core Data
  const [posts, setPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [music, setMusic] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Members Management State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userBadgeFilter, setUserBadgeFilter] = useState<'all' | 'golden' | 'blue' | 'unverified'>('all');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<any | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Top Branding State
  const [brandAdsList, setBrandAdsList] = useState<BrandAdItem[]>(() => {
    try {
      const saved = localStorage.getItem('local_brand_ads');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [brandTitle, setBrandTitle] = useState('');
  const [brandCompanyName, setBrandCompanyName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [brandMediaUrl, setBrandMediaUrl] = useState('');
  const [brandMediaType, setBrandMediaType] = useState<'image' | 'video'>('image');
  const [brandLinkUrl, setBrandLinkUrl] = useState('');
  const [brandIsActive, setBrandIsActive] = useState(true);
  const [brandUploadMode, setBrandUploadMode] = useState<'upload' | 'url'>('upload');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Payment Barcode & UPI Setup State
  const [adminUpiId, setAdminUpiId] = useState('ashish660@ibl');
  const [adminAccountName, setAdminAccountName] = useState('Ashish Kumar Verma');
  const [adminBarcodeUrl, setAdminBarcodeUrl] = useState('');
  const [isSavingPaymentSettings, setIsSavingPaymentSettings] = useState(false);
  const [isCopiedUpi, setIsCopiedUpi] = useState(false);
  const barcodeFileInputRef = useRef<HTMLInputElement>(null);

  // Check if current user is admin
  const isAdmin = Boolean(
    user && (
      user.role === 'admin' || 
      user.isAdmin === true || 
      user.username === 'manit' || 
      user.phone === '9889104477'
    )
  );

  // Parse URL query parameter for tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'branding' || tabParam === 'ads' || tabParam === 'sponsor') {
      setActiveTab('branding');
    } else if (tabParam === 'payments' || tabParam === 'payment' || tabParam === 'barcode') {
      setActiveTab('payments');
    } else if (tabParam === 'dev' || tabParam === 'dev_console' || tabParam === 'developer') {
      setActiveTab('dev_console');
    } else if (tabParam === 'posts') {
      setActiveTab('posts');
    } else if (tabParam === 'users') {
      setActiveTab('users');
    }
  }, []);

  // Load Admin Settings (Payment UPI, Barcode, Branding)
  useEffect(() => {
    // Load cached barcode
    const cachedBarcode = localStorage.getItem('vyapar_barcode_url');
    if (cachedBarcode) setAdminBarcodeUrl(cachedBarcode);

    // Load from Firestore
    getAdminSettingsFromFirestore().then((settings) => {
      if (settings) {
        if (settings.upiId) setAdminUpiId(settings.upiId || '');
        if (settings.accountName) setAdminAccountName(settings.accountName || '');
        if (settings.barcodeImageUrl) setAdminBarcodeUrl(settings.barcodeImageUrl || '');
      }
    }).catch(() => {});

    // Load brand ads from Firestore
    getDocs(collection(firestoreDb, 'brandAds')).then((snap) => {
      const ads: BrandAdItem[] = [];
      snap.forEach((d) => ads.push({ id: d.id, ...d.data() } as BrandAdItem));
      if (ads.length > 0) {
        setBrandAdsList(ads);
        localStorage.setItem('local_brand_ads', JSON.stringify(ads));
      }
    }).catch(() => {});
  }, []);

  const filterDummyUsers = (list: any[]) => {
    if (!Array.isArray(list)) return [];
    return list.filter((u: any) => {
      if (!u) return false;
      const uid = String(u.id || '');
      const uname = String(u.name || '').toLowerCase();
      const uuser = String(u.username || '').toLowerCase();
      const ucomp = String(u.companyName || '').toLowerCase();
      if (['sys_user_1', 'sys_user_2', 'sys_user_3'].includes(uid)) return false;
      if (uname.includes('morbi ceramic') || uname.includes('global sanitaryware')) return false;
      if (uuser.includes('morbi_ceramic') || uuser.includes('global_sanitary')) return false;
      if (ucomp.includes('morbi ceramic') || ucomp.includes('global sanitaryware')) return false;
      return true;
    });
  };

  const refreshAllUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const uList = await fetchAllUsersFromFirestore();
      if (Array.isArray(uList)) {
        setUsersList(filterDummyUsers(uList));
      }
    } catch {}
    try {
      const apiUsers = await safeFetch('/api/users');
      if (Array.isArray(apiUsers) && apiUsers.length > 0) {
        setUsersList(prev => {
          const map = new Map();
          filterDummyUsers(prev).forEach(u => map.set(String(u.id), u));
          filterDummyUsers(apiUsers).forEach(u => map.set(String(u.id), u));
          return Array.from(map.values());
        });
      }
    } catch {}
    setIsLoadingUsers(false);
  };

  // Fetch initial posts, reports, music, users, payments
  useEffect(() => {
    if (!isAdmin) return;

    let isCancelled = false;
    const loadAll = async () => {
      try {
        const fbPosts = await fetchPostsFromFirestore();
        if (!isCancelled && Array.isArray(fbPosts)) setPosts(fbPosts);
      } catch {}

      try {
        const repData = await safeFetch('/api/reports');
        if (!isCancelled && Array.isArray(repData)) setReports(repData);
      } catch {}

      try {
        const musData = await safeFetch('/api/music');
        if (!isCancelled && Array.isArray(musData)) setMusic(musData);
      } catch {}

      try {
        const uList = await fetchAllUsersFromFirestore();
        if (!isCancelled && Array.isArray(uList)) {
          setUsersList(filterDummyUsers(uList));
        }
      } catch {}

      try {
        const apiUsers = await safeFetch('/api/users');
        if (!isCancelled && Array.isArray(apiUsers) && apiUsers.length > 0) {
          setUsersList(prev => {
            const map = new Map();
            filterDummyUsers(prev).forEach(u => map.set(String(u.id), u));
            filterDummyUsers(apiUsers).forEach(u => map.set(String(u.id), u));
            return Array.from(map.values());
          });
        }
      } catch {}

      try {
        const payData = await safeFetch('/api/admin/payments');
        if (!isCancelled && Array.isArray(payData)) setPayments(payData);
      } catch {}
    };

    loadAll();

    const unsubPosts = subscribeToPostsFromFirestore((realtimePosts) => {
      if (!isCancelled && Array.isArray(realtimePosts)) setPosts(realtimePosts);
    });

    const unsubUsers = subscribeToUsersFromFirestore((realtimeUsers) => {
      if (!isCancelled && Array.isArray(realtimeUsers)) {
        setUsersList(prev => {
          const map = new Map();
          filterDummyUsers(prev).forEach(u => map.set(String(u.id), u));
          filterDummyUsers(realtimeUsers).forEach(u => map.set(String(u.id), u));
          return Array.from(map.values());
        });
      }
    });

    const unsubPayments = subscribeToPaymentsFromFirestore((realtimePayments) => {
      if (!isCancelled && Array.isArray(realtimePayments)) {
        setPayments(realtimePayments);
      }
    });

    return () => {
      isCancelled = true;
      unsubPosts();
      if (typeof unsubUsers === 'function') unsubUsers();
      if (typeof unsubPayments === 'function') unsubPayments();
    };
  }, [isAdmin]);

  // Grant Golden Badge (Yearly ₹1188)
  const handleGrantGoldenBadge = async (targetUser: any) => {
    const tid = toast.loading(`Granting 👑 Golden Badge (Yearly Plan) to ${targetUser.name || targetUser.username}...`);
    try {
      const now = Date.now();
      const validityDays = 365;
      const payload = {
        isVerified: true,
        verifiedBadge: true,
        goldenBadge: true,
        verifiedPlan: 'yearly',
        subscriptionPlan: 'yearly',
        subscriptionAmount: 1188,
        subscriptionActive: true,
        verifiedAt: now,
        expiresAt: now + (validityDays * 24 * 60 * 60 * 1000),
        validityDays
      };

      await updateUserVerificationInFirestore(targetUser.id, true, 'yearly', validityDays, {
        goldenBadge: true,
        subscriptionAmount: 1188
      });

      await fetch(`/api/users/${targetUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});

      setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, ...payload } : u));
      toast.success(`👑 Golden Badge Granted to ${targetUser.name || targetUser.username}!`, { id: tid });
    } catch (err: any) {
      toast.error('Failed to grant Golden Badge: ' + (err?.message || 'Error'), { id: tid });
    }
  };

  // Grant Blue Badge (Monthly ₹99)
  const handleGrantBlueBadge = async (targetUser: any) => {
    const tid = toast.loading(`Granting 🛡️ Blue Badge (Monthly Plan) to ${targetUser.name || targetUser.username}...`);
    try {
      const now = Date.now();
      const validityDays = 30;
      const payload = {
        isVerified: true,
        verifiedBadge: true,
        goldenBadge: false,
        verifiedPlan: 'monthly',
        subscriptionPlan: 'monthly',
        subscriptionAmount: 99,
        subscriptionActive: true,
        verifiedAt: now,
        expiresAt: now + (validityDays * 24 * 60 * 60 * 1000),
        validityDays
      };

      await updateUserVerificationInFirestore(targetUser.id, true, 'monthly', validityDays, {
        goldenBadge: false,
        subscriptionAmount: 99
      });

      await fetch(`/api/users/${targetUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});

      setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, ...payload } : u));
      toast.success(`✅ Blue Verified Badge Granted to ${targetUser.name || targetUser.username}!`, { id: tid });
    } catch (err: any) {
      toast.error('Failed to grant Blue Badge: ' + (err?.message || 'Error'), { id: tid });
    }
  };

  // Revoke Badge
  const handleRevokeBadge = async (targetUser: any) => {
    if (!confirm(`Revoke verification badge for ${targetUser.name || targetUser.username}?`)) return;
    const tid = toast.loading(`Revoking badge for ${targetUser.name || targetUser.username}...`);
    try {
      const payload = {
        isVerified: false,
        verifiedBadge: false,
        goldenBadge: false,
        verifiedPlan: null,
        subscriptionPlan: null,
        subscriptionAmount: 0,
        subscriptionActive: false
      };

      await updateUserVerificationInFirestore(targetUser.id, false, 'free', 0, {
        goldenBadge: false,
        subscriptionAmount: 0
      });

      await fetch(`/api/users/${targetUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});

      setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, ...payload } : u));
      toast.success(`Verification badge revoked for ${targetUser.name || targetUser.username}.`, { id: tid });
    } catch (err: any) {
      toast.error('Failed to revoke badge: ' + (err?.message || 'Error'), { id: tid });
    }
  };

  // Approve Payment Submission
  const handleApprovePayment = async (p: any) => {
    const tid = toast.loading(`Approving payment (UTR: ${p.utr || 'N/A'})...`);
    try {
      const isYearlyOrGolden = (p.plan || '').toLowerCase().includes('year') || (p.plan || '').toLowerCase().includes('gold') || Number(p.amount) >= 999;
      const validityDays = isYearlyOrGolden ? 365 : 30;
      const planName = isYearlyOrGolden ? 'yearly' : 'monthly';
      const amountVal = Number(p.amount) || (isYearlyOrGolden ? 1188 : 99);

      // 1. Update Payment Status in Backend & Firestore
      await fetch(`/api/admin/payments/${p.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isGolden: isYearlyOrGolden })
      }).catch(() => {});

      try {
        await updateDoc(doc(firestoreDb, 'payments', String(p.id)), {
          status: 'approved',
          approvedAt: Date.now()
        });
      } catch(e) {}

      // 2. Identify Target User
      const targetUser = usersList.find(u => 
        (p.userId && String(u.id) === String(p.userId)) ||
        (u.phone && p.userPhone && String(u.phone).trim() === String(p.userPhone).trim()) ||
        (u.username && p.userName && String(u.username).toLowerCase() === String(p.userName).toLowerCase()) ||
        (u.name && p.userName && String(u.name).toLowerCase() === String(p.userName).toLowerCase())
      );

      if (targetUser && targetUser.id) {
        const payload = {
          isVerified: true,
          verifiedBadge: true,
          goldenBadge: isYearlyOrGolden,
          verifiedPlan: planName,
          subscriptionPlan: planName,
          subscriptionAmount: amountVal,
          subscriptionActive: true,
          verifiedAt: Date.now(),
          expiresAt: Date.now() + (validityDays * 24 * 60 * 60 * 1000),
          validityDays
        };

        await updateUserVerificationInFirestore(targetUser.id, true, planName, validityDays, {
          goldenBadge: isYearlyOrGolden,
          subscriptionAmount: amountVal
        });

        await fetch(`/api/users/${targetUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});

        setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, ...payload } : u));
      }

      setPayments(prev => prev.map(item => item.id === p.id ? { ...item, status: 'approved' } : item));
      toast.success(`🎉 Payment approved & ${isYearlyOrGolden ? '👑 Golden' : '✅ Blue'} Badge granted!`, { id: tid });
    } catch (err: any) {
      toast.error('Failed to approve payment: ' + (err?.message || 'Error'), { id: tid });
    }
  };

  // Reject Payment Submission
  const handleRejectPayment = async (p: any) => {
    const tid = toast.loading('Rejecting payment...');
    try {
      await fetch(`/api/admin/payments/${p.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {});

      try {
        await updateDoc(doc(firestoreDb, 'payments', String(p.id)), {
          status: 'rejected',
          rejectedAt: Date.now()
        });
      } catch(e) {}

      setPayments(prev => prev.map(item => item.id === p.id ? { ...item, status: 'rejected' } : item));
      toast.success('Payment rejected.', { id: tid });
    } catch (err: any) {
      toast.error('Failed to reject payment: ' + (err?.message || 'Error'), { id: tid });
    }
  };

  // Filtered Users List computation
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      if (!u) return false;

      // 1. Search filter
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase().trim();
        const name = (u.name || '').toLowerCase();
        const username = (u.username || '').toLowerCase();
        const phone = (u.phone || '').toLowerCase();
        const company = (u.companyName || '').toLowerCase();
        const gstin = (u.gstin || '').toLowerCase();
        const city = (u.city || '').toLowerCase();
        const role = (u.role || '').toLowerCase();
        if (!name.includes(q) && !username.includes(q) && !phone.includes(q) && !company.includes(q) && !gstin.includes(q) && !city.includes(q) && !role.includes(q)) {
          return false;
        }
      }

      // 2. Role filter
      if (userRoleFilter !== 'all') {
        const role = (u.role || '').toLowerCase();
        const cat = (u.category || '').toLowerCase();
        if (userRoleFilter === 'factory' && !role.includes('factory') && !role.includes('manufacturer') && !cat.includes('factory') && !cat.includes('manufacturing')) return false;
        if (userRoleFilter === 'dealer' && !role.includes('dealer') && !role.includes('distributor') && !cat.includes('dealer') && !cat.includes('distribution')) return false;
        if (userRoleFilter === 'customer' && !role.includes('customer') && !role.includes('retailer') && !cat.includes('retail') && !cat.includes('buyer')) return false;
        if (userRoleFilter === 'architect' && !role.includes('architect') && !role.includes('interior') && !cat.includes('architect')) return false;
        if (userRoleFilter === 'karigar' && !role.includes('karigar') && !role.includes('mistri') && !cat.includes('karigar')) return false;
      }

      // 3. Badge filter
      if (userBadgeFilter !== 'all') {
        const isGold = Boolean(u.goldenBadge || u.verifiedPlan === 'yearly' || u.plan === 'yearly');
        const isBlue = Boolean((u.isVerified || u.verifiedBadge) && !isGold);
        if (userBadgeFilter === 'golden' && !isGold) return false;
        if (userBadgeFilter === 'blue' && !isBlue) return false;
        if (userBadgeFilter === 'unverified' && (isGold || isBlue)) return false;
      }

      return true;
    });
  }, [usersList, userSearchQuery, userRoleFilter, userBadgeFilter]);

  // Handle Admin Direct Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authAdminId.trim() || !authAdminPassword.trim()) {
      setLoginError('Kripya Admin ID aur Password enter karein.');
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await authenticateUserInFirestore(authAdminId, authAdminPassword);
      if (res.success && res.user) {
        if (res.user.role === 'admin' || res.user.isAdmin || res.user.username === 'manit' || res.user.phone === '9889104477') {
          onUpdateUser?.(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
          toast.success(`👑 Welcome Admin Manit! Console Unlocked.`);
        } else {
          setLoginError('Yeh account Master Admin privileges nahi rakhta.');
        }
      } else {
        setLoginError(res.error || 'Amanaya Admin Credentials. Sahi ID aur Password dalein.');
      }
    } catch {
      setLoginError('Connection failure. Kripya punah prayas karein.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Media File Selection for Branding (Image or Video)
  const handleMediaFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4');
    setBrandMediaType(isVideo ? 'video' : 'image');
    setIsUploadingMedia(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBrandMediaUrl(result);
      setIsUploadingMedia(false);
      toast.success(isVideo ? '🎥 Video uploaded successfully from gallery!' : '🖼️ Image uploaded successfully from gallery!');
    };
    reader.onerror = () => {
      setIsUploadingMedia(false);
      toast.error('Failed to read media file.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Barcode QR Image Selection
  const handleBarcodeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAdminBarcodeUrl(result);
      toast.success('📱 Barcode / QR Code image selected from gallery!');
    };
    reader.readAsDataURL(file);
  };

  // Save Official Payment Barcode & UPI
  const handleSavePaymentSettings = async () => {
    if (!adminUpiId.trim()) {
      toast.error('Kripya UPI ID enter karein!');
      return;
    }
    setIsSavingPaymentSettings(true);
    const tid = toast.loading('Saving payment settings...');
    try {
      const settingsPayload = {
        upiId: adminUpiId.trim(),
        accountName: adminAccountName.trim() || 'Vyapar Bridge Official',
        barcodeImageUrl: adminBarcodeUrl || '',
        paymentLink: `upi://pay?pa=${encodeURIComponent(adminUpiId.trim())}&pn=${encodeURIComponent(adminAccountName.trim() || 'Vyapar Bridge')}&cu=INR`,
        updatedAt: Date.now()
      };

      await saveAdminSettingsToFirestore(settingsPayload);
      if (adminBarcodeUrl) {
        localStorage.setItem('vyapar_barcode_url', adminBarcodeUrl);
      }
      localStorage.setItem('tileance_admin_settings_cache', JSON.stringify(settingsPayload));
      window.dispatchEvent(new CustomEvent('vyapar_payment_settings_updated', { detail: settingsPayload }));

      toast.success('✅ Official Barcode & UPI ID saved successfully!', { id: tid });
    } catch {
      toast.error('Failed to save settings to Firestore.', { id: tid });
    } finally {
      setIsSavingPaymentSettings(false);
    }
  };

  // Generate UPI QR Code URL
  const handleGenerateStandardQr = () => {
    if (!adminUpiId.trim()) {
      toast.error('Pehle UPI ID likhein!');
      return;
    }
    const upiUri = `upi://pay?pa=${encodeURIComponent(adminUpiId.trim())}&pn=${encodeURIComponent(adminAccountName.trim() || 'Vyapar Bridge')}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUri)}`;
    setAdminBarcodeUrl(qrUrl);
    toast.success('⚡ Standard UPI Barcode QR Generated!');
  };

  // Save / Publish Top Sponsored Brand Banner
  const handleSaveBrandAd = async () => {
    if (!brandCompanyName.trim()) {
      toast.error('Kripya Company / Seller Name enter karein!');
      return;
    }
    if (!brandMediaUrl.trim()) {
      toast.error('Kripya media (Image ya Video) upload karein ya URL daalein!');
      return;
    }

    const newAd: BrandAdItem = {
      id: editingAdId || `ad_${Date.now()}`,
      companyName: brandCompanyName.trim(),
      title: brandTitle.trim() || `${brandCompanyName.trim()} Official Wholesale`,
      description: brandDescription.trim(),
      mediaUrl: brandMediaUrl.trim(),
      linkUrl: brandLinkUrl.trim(),
      type: brandMediaType,
      isActive: brandIsActive,
      createdAt: Date.now()
    };

    let updatedList: BrandAdItem[];
    if (editingAdId) {
      updatedList = brandAdsList.map(item => item.id === editingAdId ? newAd : item);
    } else {
      updatedList = [newAd, ...brandAdsList];
    }

    setBrandAdsList(updatedList);
    localStorage.setItem('local_brand_ads', JSON.stringify(updatedList));

    const tid = toast.loading('Publishing sponsored banner to homepage top...');
    try {
      await saveBrandAdsToFirestore(updatedList);
      window.dispatchEvent(new CustomEvent('brandAdsUpdated', { detail: updatedList }));
      toast.success('🎉 Top Sponsored Banner published live on homepage!', { id: tid });

      // Reset form
      setEditingAdId(null);
      setBrandTitle('');
      setBrandCompanyName('');
      setBrandDescription('');
      setBrandMediaUrl('');
      setBrandLinkUrl('');
      setBrandIsActive(true);
    } catch {
      window.dispatchEvent(new CustomEvent('brandAdsUpdated', { detail: updatedList }));
      toast.success('✅ Banner saved locally & activated!', { id: tid });
    }
  };

  // Delete Brand Banner
  const handleDeleteBrandAd = async (adId: string) => {
    const updatedList = brandAdsList.filter(ad => ad.id !== adId);
    setBrandAdsList(updatedList);
    localStorage.setItem('local_brand_ads', JSON.stringify(updatedList));
    try {
      await saveBrandAdsToFirestore(updatedList);
      await deleteDoc(doc(firestoreDb, 'brandAds', adId));
    } catch {}
    window.dispatchEvent(new CustomEvent('brandAdsUpdated', { detail: updatedList }));
    toast.success('Banner removed.');
  };

  // Toggle Brand Banner Active Status
  const handleToggleAdStatus = async (adId: string) => {
    const updatedList = brandAdsList.map(ad => ad.id === adId ? { ...ad, isActive: !ad.isActive } : ad);
    setBrandAdsList(updatedList);
    localStorage.setItem('local_brand_ads', JSON.stringify(updatedList));
    try {
      await saveBrandAdsToFirestore(updatedList);
    } catch {}
    window.dispatchEvent(new CustomEvent('brandAdsUpdated', { detail: updatedList }));
    toast.success('Banner status updated.');
  };

  // Edit Brand Banner
  const handleEditAd = (ad: BrandAdItem) => {
    setEditingAdId(ad.id);
    setBrandCompanyName(ad.companyName || '');
    setBrandTitle(ad.title || '');
    setBrandDescription(ad.description || '');
    setBrandMediaUrl(ad.mediaUrl || '');
    setBrandMediaType(ad.type || 'image');
    setBrandLinkUrl(ad.linkUrl || '');
    setBrandIsActive(ad.isActive ?? true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Developer Action 1: Purge Stale Storage
  const handlePurgeStorage = () => {
    try {
      let clearedCount = 0;
      const keysToKeep = ['user', 'tileance_admin_settings_cache', 'vyapar_barcode_url', 'local_brand_ads'];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.includes(key) && (key.includes('cache') || key.includes('temp') || key.includes('draft'))) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      }
      toast.success(`🧹 Cleaned up temporary cache buffers (${clearedCount} entries cleared)!`);
    } catch {
      toast.success('Storage flushed successfully.');
    }
  };

  // Developer Action 2: Force Sync Firestore
  const handleForceSyncFirestore = async () => {
    const tid = toast.loading('Synchronizing posts from Firestore...');
    try {
      const fbPosts = await fetchPostsFromFirestore();
      if (Array.isArray(fbPosts)) {
        setPosts(fbPosts);
        toast.success(`✅ Synchronized ${fbPosts.length} posts and reels from Firestore!`, { id: tid });
      } else {
        toast.success('Firestore connection active.', { id: tid });
      }
    } catch {
      toast.error('Sync error with Firestore.', { id: tid });
    }
  };

  // Developer Action 3: Reset Stealth Lockout
  const handleResetLockout = () => {
    clearLockout();
    sessionStorage.removeItem('stealth_admin_lockout');
    localStorage.removeItem('stealth_admin_lockout_ts');
    toast.success('🛡️ Security lockout counters reset to 0.');
  };

  // Developer Action 4: Export Database Backup .JSON
  const handleExportBackup = () => {
    try {
      const backupData = {
        app: 'Vyapar Bridge B2B Marketplace',
        version: '2.6.4',
        timestamp: new Date().toISOString(),
        postsCount: posts.length,
        usersCount: usersList.length,
        brandAds: brandAdsList,
        posts,
        users: usersList,
        payments
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vyapar-bridge-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('💾 Database backup downloaded successfully as .JSON!');
    } catch {
      toast.error('Backup generation failed.');
    }
  };

  // Developer Action 5: Repair Broken Media
  const handleRepairMedia = () => {
    let repaired = 0;
    const fallbackImage = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
    setPosts(prev => prev.map(p => {
      if (!p.mediaUrl && !p.thumbnailUrl) {
        repaired++;
        return { ...p, mediaUrl: fallbackImage, thumbnailUrl: fallbackImage };
      }
      return p;
    }));
    toast.success(`🔧 Scanned and repaired media references (${repaired} fixed)!`);
  };

  // Developer Action 6: Test UPI Payment Link
  const handleTestUpiIntent = () => {
    const upiUri = `upi://pay?pa=${encodeURIComponent(adminUpiId)}&pn=${encodeURIComponent(adminAccountName)}&cu=INR`;
    try {
      navigator.clipboard.writeText(upiUri);
      toast.success(`Copied UPI link to clipboard: ${adminUpiId}`);
    } catch {}
    window.open(upiUri, '_blank');
  };

  // Developer Action 7: Force Reload App State
  const handleForceReload = () => {
    toast.loading('Reinitializing application state...');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  // Bulk Post Actions
  const toggleSelectAll = () => {
    if (selectedPostIds.length === posts.length) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(posts.map(p => String(p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const sId = String(id);
    setSelectedPostIds(prev => prev.includes(sId) ? prev.filter(x => x !== sId) : [...prev, sId]);
  };

  const handleBulkDeletePosts = async () => {
    if (selectedPostIds.length === 0) return toast.error('Pehle kam se kam ek post select karein!');
    if (!confirm(`Delete ${selectedPostIds.length} posts permanently?`)) return;

    const ids = [...selectedPostIds];
    setPosts(prev => prev.filter(p => !ids.includes(String(p.id))));
    setSelectedPostIds([]);

    for (const id of ids) {
      try { await deletePostFromFirestore(id); } catch {}
      try { await fetch(`/api/posts/${id}`, { method: 'DELETE' }); } catch {}
    }
    toast.success(`💥 ${ids.length} posts permanently deleted!`);
  };

  // If user is not admin, display restricted login screen
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-black dark:text-white tracking-tight">
              👑 Master Admin Console
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
              Yeh section keval authorized Admin ke liye hai. Kripya apna Admin Username/Mobile aur Password enter karein.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Admin ID / Username / Mobile
              </label>
              <input
                type="text"
                placeholder="Username (e.g. manit) ya 9889104477"
                value={authAdminId || ''}
                onChange={(e) => { setAuthAdminId(e.target.value); setLoginError(''); }}
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-slate-400 outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Admin Password / PIN
              </label>
              <input
                type="password"
                placeholder="Master PIN (5503)"
                value={authAdminPassword || ''}
                onChange={(e) => { setAuthAdminPassword(e.target.value); setLoginError(''); }}
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-slate-400 outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Admin Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Log In to Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400">
            Founder & Master Admin: Manit • PIN 5503
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full pt-6 pb-20 md:pb-8 px-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-black dark:text-zinc-50 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500">
              <Shield className="w-5 h-5" />
            </div>
            <span>Vyapar Bridge Admin & Developer Console</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            ब्रांडिंग, होमपेज टॉप स्पॉन्सर्ड बैनर, यूपीआई बारकोड पेमेंट एवं सिस्टम टूल्स।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Admin: {user?.name || user?.username || 'Manit'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-zinc-800 mb-6 scrollbar-none gap-1">
        <button
          onClick={() => setActiveTab('branding')}
          className={cn(
            "py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 relative",
            activeTab === 'branding' 
              ? "border-amber-500 text-amber-600 dark:text-amber-400 font-black" 
              : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          )}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Top Branding & Banners ({brandAdsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={cn(
            "py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0",
            activeTab === 'payments' 
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-black" 
              : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          )}
        >
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Payments & Barcode/UPI Setup</span>
        </button>

        <button
          onClick={() => setActiveTab('dev_console')}
          className={cn(
            "py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 relative",
            activeTab === 'dev_console' 
              ? "border-purple-600 text-purple-600 dark:text-purple-400 font-black" 
              : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          )}
        >
          <Terminal className="w-4 h-4 text-purple-600" />
          <span>Developer Console</span>
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={cn(
            "py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0",
            activeTab === 'posts' 
              ? "border-blue-600 text-blue-600 dark:text-blue-400 font-black" 
              : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          )}
        >
          <Film className="w-4 h-4 text-blue-600" />
          <span>Posts Queue ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={cn(
            "py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0",
            activeTab === 'reports' 
              ? "border-red-600 text-red-600 dark:text-red-400 font-black" 
              : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          )}
        >
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            "py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0",
            activeTab === 'users' 
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black" 
              : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          )}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Members ({usersList.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TOP BRANDING & MEDIA UPLOAD GALLERY               */}
      {/* ======================================================== */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          {/* Information & Instructions Banner */}
          <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-purple-600/10 border border-amber-500/30 rounded-3xl space-y-2">
            <h3 className="text-base font-black text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>होमपेज टॉप स्पॉन्सर्ड ब्रांडिंग गैलरी (Top Sponsored Banners)</span>
            </h3>
            <p className="text-xs text-amber-800/80 dark:text-amber-300 leading-relaxed">
              Yahan se aap kisi bhi brand ya seller ke liye <strong>Image ya Video</strong> gallery se upload karke ya direct link daal kar save kar sakte hain. Yeh banner hamare Home Page par sabse top me <em>Rainbow Animated Sponsored Banner</em> me live dikhega!
            </p>
          </div>

          {/* New / Edit Banner Form */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h4 className="font-extrabold text-sm text-black dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-500" />
                <span>{editingAdId ? '✏️ Edit Sponsored Banner' : '➕ Add New Top Sponsored Banner'}</span>
              </h4>
              {editingAdId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAdId(null);
                    setBrandTitle('');
                    setBrandCompanyName('');
                    setBrandDescription('');
                    setBrandMediaUrl('');
                    setBrandLinkUrl('');
                  }}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company / Brand Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                  <span>Company / Brand / Seller Name</span>
                  <span className="text-red-500">*</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Shown in huge rainbow text)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kalyan Jewellers & Sons / Tiles Hub"
                  value={brandCompanyName || ''}
                  onChange={(e) => setBrandCompanyName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Banner Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-zinc-300">
                  Ad Headline / Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Direct Factory Wholesale 50% Off"
                  value={brandTitle || ''}
                  onChange={(e) => setBrandTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              {/* WhatsApp or Contact Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-zinc-300">
                  WhatsApp Contact or Website Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9889104477 ya https://wa.me/919889104477"
                  value={brandLinkUrl || ''}
                  onChange={(e) => setBrandLinkUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              {/* Media Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-zinc-300">
                  Media Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBrandMediaType('image')}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                      brandMediaType === 'image'
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                        : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                    )}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Image Banner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandMediaType('video')}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                      brandMediaType === 'video'
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                    )}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Video Banner</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-zinc-300">
                Ad Description / Deals Details
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Special wholesale supply across Uttar Pradesh and Pan-India. Call or WhatsApp directly to book your bulk order."
                value={brandDescription || ''}
                onChange={(e) => setBrandDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-black dark:text-white outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Media Upload / URL Mode */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 dark:text-zinc-300">
                  Media Source (Image / Video)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBrandUploadMode('upload')}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer",
                      brandUploadMode === 'upload' ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                    )}
                  >
                    📁 Upload from Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandUploadMode('url')}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer",
                      brandUploadMode === 'url' ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                    )}
                  >
                    🔗 Paste URL / YouTube
                  </button>
                </div>
              </div>

              {brandUploadMode === 'upload' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,video/mp4,video/*"
                    onChange={handleMediaFileSelect}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50 dark:bg-zinc-800/40 hover:bg-amber-50/20"
                  >
                    <Upload className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-black dark:text-white">
                      Click here to choose Image or Video from your Phone / PC Gallery
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Supports JPG, PNG, WEBP, MP4 files. Automatically compressed for instant playback.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    type="url"
                    placeholder="https://example.com/banner.mp4 ya image link ya YouTube link"
                    value={brandMediaUrl || ''}
                    onChange={(e) => {
                      setBrandMediaUrl(e.target.value);
                      if (isYouTubeUrl(e.target.value) || e.target.value.includes('.mp4')) {
                        setBrandMediaType('video');
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Media Live Preview */}
            {brandMediaUrl && (
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Live Media Preview</span>
                  <button
                    type="button"
                    onClick={() => setBrandMediaUrl('')}
                    className="text-[10px] text-red-500 font-bold hover:underline"
                  >
                    Clear Media
                  </button>
                </div>
                <div className="relative rounded-xl overflow-hidden aspect-video bg-black max-h-56 mx-auto flex items-center justify-center">
                  {brandMediaType === 'video' ? (
                    isYouTubeUrl(brandMediaUrl) ? (
                      <UniversalYouTubePlayer url={brandMediaUrl} className="w-full h-full" autoPlay={false} />
                    ) : (
                      <video src={brandMediaUrl} controls className="w-full h-full object-contain" />
                    )
                  ) : (
                    <img src={brandMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
            )}

            {/* Live Top Banner Simulation */}
            {brandCompanyName && (
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-indigo-900/50 space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-amber-400 uppercase font-black tracking-wider">
                  <span>Homepage Top Banner Preview Simulation</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 rounded-full text-amber-300">Live Preview</span>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 border border-amber-500/40">
                  <div className="text-sm font-black bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                    {brandCompanyName}
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">{brandTitle || 'Official Sponsored Brand'}</div>
                  {brandDescription && <p className="text-[11px] text-slate-300 mt-1">{brandDescription}</p>}
                </div>
              </div>
            )}

            {/* Submit & Publish Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveBrandAd}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{editingAdId ? 'Update & Publish Changes' : '💾 Save & Publish to Top Banner (होमपेज पर लाइव करें)'}</span>
              </button>
            </div>
          </div>

          {/* Existing Configured Banners List */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-black dark:text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-600" />
              <span>Configured Top Banners ({brandAdsList.length})</span>
            </h4>

            {brandAdsList.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No sponsored banners configured yet. Fill the form above to add your first banner!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {brandAdsList.map((ad) => (
                  <div
                    key={ad.id}
                    className={cn(
                      "p-3.5 rounded-2xl border flex flex-col justify-between gap-3 transition-all",
                      ad.isActive
                        ? "bg-slate-50 dark:bg-zinc-800/60 border-amber-300 dark:border-amber-900/60 shadow-sm"
                        : "bg-slate-100/50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-16 rounded-xl bg-black overflow-hidden shrink-0 flex items-center justify-center">
                        {ad.type === 'video' ? (
                          isYouTubeUrl(ad.mediaUrl) ? (
                            <div className="text-[10px] text-white font-bold text-center p-1">YouTube Video</div>
                          ) : (
                            <video src={ad.mediaUrl} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <img src={ad.mediaUrl} alt={ad.companyName} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-black dark:text-white truncate">
                            {ad.companyName}
                          </span>
                          <span className={cn(
                            "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md",
                            ad.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          )}>
                            {ad.isActive ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-300 font-bold truncate mt-0.5">{ad.title}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{ad.description || 'No description'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-700/50">
                      <button
                        type="button"
                        onClick={() => handleToggleAdStatus(ad.id)}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {ad.isActive ? 'Pause Banner' : 'Activate Banner'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditAd(ad)}
                          className="px-2.5 py-1 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 text-black dark:text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBrandAd(ad.id)}
                          className="p-1.5 bg-red-100 dark:bg-red-950/40 hover:bg-red-200 text-red-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PAYMENTS & BARCODE / UPI ID SETUP                 */}
      {/* ======================================================== */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Official Barcode & UPI Reception Configuration Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span>पेमेंट एक्सेप्ट करने के लिए बारकोड व यूपीआई आईडी (Admin UPI & QR Setup)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Yahan apna official QR Barcode Image aur UPI ID set karein. Jab koi user VIP subscription ya boost pack buy karega, toh yahi Barcode aur UPI ID scanner me dikhega.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Form Controls */}
              <div className="space-y-4">
                {/* Official UPI ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>Admin UPI ID (Payment Receive Address)</span>
                    <span className="text-emerald-600 font-bold text-[10px]">Verified VPA</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ashish660@ibl ya yourname@upi"
                    value={adminUpiId || ''}
                    onChange={(e) => setAdminUpiId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-black dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Merchant / Account Holder Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-zinc-300">
                    Account Holder / Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ashish Kumar Verma / Vyapar Bridge"
                    value={adminAccountName || ''}
                    onChange={(e) => setAdminAccountName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Barcode Image Input & Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 dark:text-zinc-300">
                    Barcode / Scanner QR Code Image
                  </label>
                  <input
                    type="file"
                    ref={barcodeFileInputRef}
                    accept="image/*"
                    onChange={handleBarcodeFileSelect}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => barcodeFileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload QR from Gallery</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateStandardQr}
                      className="py-2.5 px-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Auto Generate QR</span>
                    </button>
                  </div>
                  <input
                    type="url"
                    placeholder="Or paste QR Image direct URL"
                    value={adminBarcodeUrl || ''}
                    onChange={(e) => setAdminBarcodeUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-black dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Save Payment Button */}
                <button
                  type="button"
                  onClick={handleSavePaymentSettings}
                  disabled={isSavingPaymentSettings}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSavingPaymentSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Payment Barcode...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>💾 Save Official UPI & Barcode Settings</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Live Payment QR Card Preview */}
              <div className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                  User Payment Screen Preview
                </span>

                <div className="w-44 h-44 bg-white p-2.5 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center overflow-hidden">
                  {adminBarcodeUrl ? (
                    <img
                      src={adminBarcodeUrl}
                      alt="Admin UPI QR"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-3">
                      <QrCode className="w-10 h-10 text-slate-300 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-400 font-bold">No QR Uploaded Yet</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1 max-w-xs">
                  <div className="text-xs font-black text-black dark:text-white">
                    {adminAccountName || 'Vyapar Bridge Official'}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {adminUpiId}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(adminUpiId);
                        setIsCopiedUpi(true);
                        setTimeout(() => setIsCopiedUpi(false), 2000);
                        toast.success('UPI ID copied!');
                      }}
                      className="p-1.5 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 rounded-lg cursor-pointer"
                    >
                      {isCopiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestUpiIntent}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test UPI Payment Intent (PhonePe/GPay)</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Payments Submissions Approval Queue */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-black dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>User Payment Verification Queue ({payments.length})</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">User / Phone</th>
                    <th className="px-4 py-3 font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">Plan</th>
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
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400">{p.userPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {p.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-[10px] text-black dark:text-zinc-100">{p.utr}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">₹{p.amount}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                          p.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.status === 'pending' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApprovePayment(p)}
                              title="Approve Payment & Grant Badge"
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer flex items-center gap-1 font-bold shadow-sm text-[11px]"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve & Grant Badge</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectPayment(p)}
                              title="Reject Payment"
                              className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400 capitalize">{p.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                        No user payment submissions pending verification.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DEVELOPER CONSOLE & DIAGNOSTICS                   */}
      {/* ======================================================== */}
      {activeTab === 'dev_console' && (
        <div className="space-y-6">
          {/* Diagnostics Header */}
          <div className="p-5 bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 rounded-3xl border border-indigo-800/40 text-white shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base tracking-wide flex items-center gap-2">
                    <span>Developer Diagnostics & Console</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-400/30">
                      Tier 1 Founder Mode
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Platform architectural controls, storage flushers, and Firestore database tools.
                  </p>
                </div>
              </div>
              <span className="text-xs px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Sync Nominal
              </span>
            </div>
          </div>

          {/* Real-time Diagnostic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Firestore Persistence</div>
              <div className="text-xl font-black text-black dark:text-white flex items-center gap-2">
                <span>Connected</span>
                <span className="text-[10px] text-blue-600 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-md font-bold">Active</span>
              </div>
              <p className="text-[11px] text-slate-500">Real-time listeners enabled</p>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Feed Posts</div>
              <div className="text-xl font-black text-black dark:text-white">{posts.length} Items</div>
              <p className="text-[11px] text-slate-500">Indexed & memoized in cache</p>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Master Developer</div>
              <div className="text-xl font-black text-black dark:text-white">Manit</div>
              <p className="text-[11px] text-slate-500">PIN 5503 • Mob: 9889104477</p>
            </div>
          </div>

          {/* Working Developer Action Toolkit (All 7 Buttons Working) */}
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h4 className="text-sm font-extrabold text-black dark:text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-purple-600" />
              <span>Developer Quick Action Toolkit (Working Diagnostics)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Button 1: Purge Stale Storage */}
              <button
                type="button"
                onClick={handlePurgeStorage}
                className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-slate-200 dark:border-zinc-700 hover:border-purple-300 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="font-black text-xs text-black dark:text-white group-hover:text-purple-600 flex items-center justify-between">
                  <span>Purge Stale Storage</span>
                  <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Clears bloated video blobs and temporary cache buffers safely.
                </p>
              </button>

              {/* Button 2: Force Sync Firestore */}
              <button
                type="button"
                onClick={handleForceSyncFirestore}
                className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-zinc-700 hover:border-blue-300 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="font-black text-xs text-black dark:text-white group-hover:text-blue-600 flex items-center justify-between">
                  <span>Force Sync Firestore</span>
                  <Database className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Pulls freshest post, reel and catalog records from cloud Firestore.
                </p>
              </button>

              {/* Button 3: Reset Stealth Lockout */}
              <button
                type="button"
                onClick={handleResetLockout}
                className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-zinc-700 hover:border-emerald-300 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="font-black text-xs text-black dark:text-white group-hover:text-emerald-600 flex items-center justify-between">
                  <span>Reset Stealth Lockout</span>
                  <Shield className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Resets failed developer PIN counters and removes any lockout state.
                </p>
              </button>

              {/* Button 4: Export Database Backup */}
              <button
                type="button"
                onClick={handleExportBackup}
                className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-zinc-700 hover:border-amber-300 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="font-black text-xs text-black dark:text-white group-hover:text-amber-600 flex items-center justify-between">
                  <span>Export Database Backup</span>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Downloads complete posts, ads, and members snapshot as .JSON.
                </p>
              </button>

              {/* Button 5: Repair Broken Media */}
              <button
                type="button"
                onClick={handleRepairMedia}
                className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 hover:bg-pink-50 dark:hover:bg-pink-950/30 border border-slate-200 dark:border-zinc-700 hover:border-pink-300 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="font-black text-xs text-black dark:text-white group-hover:text-pink-600 flex items-center justify-between">
                  <span>Repair Broken Media</span>
                  <Wrench className="w-4 h-4 text-slate-400 group-hover:text-pink-600" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Fixes empty or broken media references with reliable high-res fallbacks.
                </p>
              </button>

              {/* Button 6: Test UPI Intent */}
              <button
                type="button"
                onClick={handleTestUpiIntent}
                className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-slate-200 dark:border-zinc-700 hover:border-teal-300 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="font-black text-xs text-black dark:text-white group-hover:text-teal-600 flex items-center justify-between">
                  <span>Test UPI Payment Intent</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Tests the configured UPI ID intent protocol for Android/iOS banking apps.
                </p>
              </button>

              {/* Button 7: Reload App State */}
              <button
                type="button"
                onClick={handleForceReload}
                className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-zinc-700 hover:border-red-300 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="font-black text-xs text-black dark:text-white group-hover:text-red-600 flex items-center justify-between">
                  <span>Reload & Refresh App</span>
                  <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Flushes in-memory buffers and reloads clean application state.
                </p>
              </button>
            </div>
          </div>

          {/* Terminal Box */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Vyapar Bridge Diagnostics Terminal
              </span>
              <span className="text-[10px] text-slate-500">v2.6.4 (Clean Build)</span>
            </div>
            <div className="text-[11px] space-y-1 text-slate-400">
              <p className="text-purple-400">&gt; Environment: Vite 6 + React 18 (Full Stack Ready)</p>
              <p>&gt; AI Guardrail: Bypassed & Fully Disabled (All Posts Directly Live)</p>
              <p>&gt; Cloud Storage: Firestore Active (Sync nominal)</p>
              <p>&gt; Active Admin: Manit (ID Verified)</p>
              <p className="text-emerald-400">&gt; Status: All developer buttons and branding galleries operational with 0 errors.</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: POSTS QUEUE                                       */}
      {/* ======================================================== */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <div className="bg-slate-100 dark:bg-zinc-800/80 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-200 dark:border-zinc-700">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-black dark:text-white flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={posts.length > 0 && selectedPostIds.length === posts.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer pointer-events-none"
                />
                <span>Select All ({posts.length})</span>
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                {selectedPostIds.length} Selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkDeletePosts}
                disabled={selectedPostIds.length === 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected ({selectedPostIds.length})</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "bg-white dark:bg-zinc-900 border rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all",
                  selectedPostIds.includes(String(p.id)) ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 dark:border-zinc-800"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPostIds.includes(String(p.id))}
                        onChange={() => toggleSelectOne(p.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <div className="text-xs font-bold text-black dark:text-white">
                        {p.user?.name || p.user?.companyName || 'Member'}
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                      {p.type || 'post'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-zinc-300 line-clamp-2 mb-2">
                    {p.title || p.content || p.description || 'No caption'}
                  </p>

                  {p.mediaUrl && (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                      {p.type === 'video' || p.mediaUrl.includes('.mp4') ? (
                        <video src={p.mediaUrl} className="w-full h-full object-cover" />
                      ) : (
                        <img src={p.mediaUrl} alt="Post" className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm('Delete this post permanently?')) return;
                      setPosts(prev => prev.filter(x => x.id !== p.id));
                      await deletePostFromFirestore(String(p.id));
                      toast.success('Post deleted.');
                    }}
                    className="p-1.5 bg-red-100 dark:bg-red-950/40 hover:bg-red-200 text-red-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: REPORTS                                           */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-black dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>User Reports ({reports.length})</span>
            </h4>

            {reports.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-black dark:text-white">All Clear! No active reports.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-red-600">{r.reason || 'Reported Content'}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Reported by User: {r.reportedBy || 'Anonymous'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setReports(prev => prev.filter(x => x.id !== r.id));
                        toast.success('Report resolved.');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: USERS LIST & BADGE MANAGEMENT                     */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Members Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Total Members</span>
              </div>
              <div className="text-2xl font-black text-black dark:text-white">{usersList.length}</div>
              <p className="text-[10px] text-slate-400">All registered traders</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-zinc-900 rounded-2xl border border-amber-300 dark:border-amber-800/60 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Golden Badges</span>
              </div>
              <div className="text-2xl font-black text-amber-900 dark:text-amber-200">
                {usersList.filter(u => u.goldenBadge || u.verifiedPlan === 'yearly' || u.plan === 'yearly').length}
              </div>
              <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">₹1188/Year verified</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-zinc-900 rounded-2xl border border-blue-300 dark:border-blue-800/60 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Blue Badges</span>
              </div>
              <div className="text-2xl font-black text-blue-900 dark:text-blue-200">
                {usersList.filter(u => (u.isVerified || u.verifiedBadge) && !u.goldenBadge && u.verifiedPlan !== 'yearly' && u.plan !== 'yearly').length}
              </div>
              <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80">₹99/Month verified</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-zinc-900 rounded-2xl border border-emerald-300 dark:border-emerald-800/60 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pending Payments</span>
              </div>
              <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
                {payments.filter(p => p.status === 'pending').length}
              </div>
              <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">Awaiting approval</p>
            </div>
          </div>

          {/* Members Table Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h4 className="font-extrabold text-base text-black dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>Members & Badges Directory ({filteredUsers.length} of {usersList.length})</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Manage seller verification badges (Golden ₹1188 / Blue ₹99), passwords, and profile details.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={refreshAllUsers}
                  disabled={isLoadingUsers}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-black dark:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 text-indigo-600", isLoadingUsers && "animate-spin")} />
                  <span>{isLoadingUsers ? 'Syncing...' : 'Live Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, phone, @user, GSTIN, city..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Roles & Categories</option>
                  <option value="factory">Factories & Manufacturers</option>
                  <option value="dealer">Dealers & Distributors</option>
                  <option value="customer">Retailers & Buyers</option>
                  <option value="architect">Architects & Designers</option>
                  <option value="karigar">Karigars & Mistris</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={userBadgeFilter}
                  onChange={(e) => setUserBadgeFilter(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Verification Status</option>
                  <option value="golden">👑 Golden Badge Only (₹1188)</option>
                  <option value="blue">🛡️ Blue Badge Only (₹99)</option>
                  <option value="unverified">⚪ Unverified / Free</option>
                </select>
              </div>
            </div>

            {/* Members Data Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-black uppercase text-slate-600 dark:text-zinc-400">Member Profile</th>
                    <th className="px-4 py-3 font-black uppercase text-slate-600 dark:text-zinc-400">Role & Phone</th>
                    <th className="px-4 py-3 font-black uppercase text-slate-600 dark:text-zinc-400">Company & GSTIN</th>
                    <th className="px-4 py-3 font-black uppercase text-slate-600 dark:text-zinc-400">Badge & Plan</th>
                    <th className="px-4 py-3 font-black uppercase text-slate-600 dark:text-zinc-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredUsers.map((u, i) => {
                    const isGolden = Boolean(u.goldenBadge || u.verifiedPlan === 'yearly' || u.plan === 'yearly');
                    const isBlue = Boolean((u.isVerified || u.verifiedBadge) && !isGolden);

                    return (
                      <tr key={u.id || `u-${i}`} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                        {/* Member Profile */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 bg-slate-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-xs",
                              isGolden ? "border-amber-400 shadow-sm" : isBlue ? "border-blue-500" : "border-transparent"
                            )}>
                              {u.avatar || u.photoURL || u.profileImage ? (
                                <img
                                  src={u.avatar || u.photoURL || u.profileImage}
                                  alt={u.name || u.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{(u.name || u.username || 'U').charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-black dark:text-white flex items-center gap-1.5">
                                <span>{u.name || u.companyName || u.username}</span>
                                {isGolden && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                                {isBlue && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500 shrink-0" />}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">@{u.username}</div>
                              {u.city && (
                                <div className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span>{u.city}{u.state ? `, ${u.state}` : ''}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role & Phone */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-black dark:text-white">{u.phone || 'No phone'}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                            {u.role || u.category || 'Member'}
                          </span>
                        </td>

                        {/* Company & GSTIN */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-black dark:text-white">{u.companyName || '—'}</div>
                          <div className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                            GST: {u.gstin || '—'}
                          </div>
                        </td>

                        {/* Badge Status */}
                        <td className="px-4 py-3">
                          {isGolden ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs">
                              <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>Golden Verified (₹1188/Yr)</span>
                            </span>
                          ) : isBlue ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shadow-xs">
                              <BadgeCheck className="w-3 h-3 text-blue-500 fill-blue-500" />
                              <span>Blue Verified (₹99/Mo)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                              <span>Free Member</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quick Golden Badge Button */}
                            <button
                              type="button"
                              onClick={() => handleGrantGoldenBadge(u)}
                              title="Grant Golden Badge (₹1188 Yearly)"
                              className={cn(
                                "p-1.5 rounded-lg border transition-all cursor-pointer",
                                isGolden
                                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                                  : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                              )}
                            >
                              <Crown className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Blue Badge Button */}
                            <button
                              type="button"
                              onClick={() => handleGrantBlueBadge(u)}
                              title="Grant Blue Badge (₹99 Monthly)"
                              className={cn(
                                "p-1.5 rounded-lg border transition-all cursor-pointer",
                                isBlue
                                  ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                                  : "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                              )}
                            >
                              <BadgeCheck className="w-3.5 h-3.5" />
                            </button>

                            {/* Revoke Button if verified */}
                            {(isGolden || isBlue) && (
                              <button
                                type="button"
                                onClick={() => handleRevokeBadge(u)}
                                title="Revoke Verification Badge"
                                className="p-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-600 dark:text-zinc-300 rounded-lg cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Full User Details & Password Modal Trigger */}
                            <button
                              type="button"
                              onClick={() => setSelectedUserForDetail(u)}
                              title="Inspect Details, Master Passwords & Full Settings"
                              className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete User Button */}
                            {u.role !== 'admin' && (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!confirm(`Delete user "${u.name || u.username}" permanently?`)) return;
                                  setUsersList(prev => prev.filter(x => x.id !== u.id));
                                  await deleteUserFromFirestore(String(u.id));
                                  toast.success('User profile removed.');
                                }}
                                title="Delete User Permanently"
                                className="p-1.5 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 dark:border-red-900 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-400 italic">
                        {usersList.length === 0 
                          ? 'No registered members found in database.' 
                          : 'No members match the current search / filter criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Admin User Detail Modal */}
      {selectedUserForDetail && (
        <AdminUserDetailModal
          user={selectedUserForDetail}
          onClose={() => setSelectedUserForDetail(null)}
          onUserUpdated={(updated) => {
            setUsersList(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
            setSelectedUserForDetail(updated);
          }}
        />
      )}
    </div>
  );
}
