import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Store,
  MapPin,
  Sparkles,
  Search,
  X,
  CheckCircle2,
  Phone,
  MessageCircle,
  ShieldCheck,
  Crown,
  ChevronRight,
  Filter,
  Globe,
  SlidersHorizontal,
  ExternalLink,
  UserCheck,
  FileText,
  BadgeCheck,
  Navigation
} from 'lucide-react';
import { ALL_INDUSTRIES, IndustryHub, SubCategory } from '../constants/industryData';
import { ConnectUserModal } from './ConnectUserModal';
import { resolveUserAvatar } from '../utils/userAvatar';
import { subscribeToUsersFromFirestore, fetchAllUsersFromFirestore } from '../services/firebaseDataSync';
import { calculateDistance } from '../App';
import toast from 'react-hot-toast';

interface BusinessDirectoryPageProps {
  user: any;
  userLocation?: { lat: number; lng: number } | null;
  onOpenAuth?: (tab: 'login' | 'register') => void;
}

export const BusinessDirectoryPage: React.FC<BusinessDirectoryPageProps> = ({
  user,
  userLocation,
  onOpenAuth
}) => {
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('VyaparBridge_cached_users');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter((u: any) => {
            const uid = String(u.id || '');
            const uname = String(u.name || '').toLowerCase();
            const uuser = String(u.username || '').toLowerCase();
            if (['sys_user_1', 'sys_user_2', 'sys_user_3'].includes(uid)) return false;
            if (uname.includes('morbi ceramic') || uname.includes('global sanitaryware')) return false;
            if (uuser.includes('morbi_ceramic') || uuser.includes('global_sanitary')) return false;
            return true;
          });
        }
      }
    } catch (e) {}
    return [];
  });
  const [postsList, setPostsList] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('VyaparBridge_cached_posts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((p: any) => {
            const uid = String(p.userId || p.user?.id || '');
            const uname = String(p.userName || p.user?.name || '').toLowerCase();
            if (['sys_user_1', 'sys_user_2', 'sys_user_3'].includes(uid)) return false;
            if (uname.includes('morbi ceramic') || uname.includes('global sanitaryware')) return false;
            return true;
          });
        }
      }
    } catch (e) {}
    return [];
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('all');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'factory' | 'dealer' | 'customer' | 'architect' | 'karigar'>('all');
  const [filterRadius, setFilterRadius] = useState<'all' | '100km'>('all');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [selectedConnectUser, setSelectedConnectUser] = useState<any | null>(null);

  // Subscribe to real-time users and multi-layer fallback
  useEffect(() => {
    setLoading(true);

    const filterDummy = (list: any[]) => {
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

    const filterDummyPosts = (list: any[]) => {
      if (!Array.isArray(list)) return [];
      return list.filter((p: any) => {
        if (!p) return false;
        const pid = String(p.id || '');
        const pUid = String(p.userId || p.user?.id || '');
        const pName = String(p.userName || p.user?.name || '').toLowerCase();
        if (['post_default_1', 'post_default_2'].includes(pid)) return false;
        if (['sys_user_1', 'sys_user_2', 'sys_user_3'].includes(pUid)) return false;
        if (pName.includes('morbi ceramic') || pName.includes('global sanitaryware')) return false;
        return true;
      });
    };

    // 1. Initial fast load from local cache + backend + Firestore
    fetchAllUsersFromFirestore().then((initialUsers) => {
      const valid = filterDummy(initialUsers);
      if (valid.length > 0) {
        setUsersList(valid);
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    // 2. Real-time subscription
    const unsub = subscribeToUsersFromFirestore((fbUsers) => {
      const valid = filterDummy(fbUsers);
      if (valid.length > 0) {
        setUsersList(prev => {
          const map = new Map();
          filterDummy(prev).forEach(u => map.set(String(u.id), u));
          valid.forEach((u: any) => map.set(String(u.id), u));
          return Array.from(map.values());
        });
      }
      setLoading(false);
    });

    // 3. Fallback fetch via REST API (users and posts)
    fetch('/api/users')
      .then(r => r.json())
      .then(data => {
        const valid = filterDummy(data);
        if (valid.length > 0) {
          setUsersList(prev => {
            const map = new Map();
            filterDummy(prev).forEach(u => map.set(String(u.id), u));
            valid.forEach((u: any) => map.set(String(u.id), u));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/posts')
      .then(r => r.json())
      .then(postsData => {
        if (Array.isArray(postsData)) setPostsList(filterDummyPosts(postsData));
      })
      .catch(() => {});

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const activeIndustry = useMemo(() => {
    if (selectedIndustryId === 'all') return null;
    return ALL_INDUSTRIES.find(ind => ind.id === selectedIndustryId) || null;
  }, [selectedIndustryId]);

  // Helper to match user against an industry or subcategory
  const matchUserToIndustry = (targetUser: any, industryId: string, subcategoryId: string): boolean => {
    if (industryId === 'all') return true;

    const userCat = (targetUser.category || '').toLowerCase();
    const userRole = (targetUser.role || '').toLowerCase();
    const userBio = (targetUser.bio || targetUser.description || '').toLowerCase();
    const userCompany = (targetUser.companyName || '').toLowerCase();
    const userName = (targetUser.name || '').toLowerCase();
    const fullSearchText = `${userCat} ${userRole} ${userBio} ${userCompany} ${userName}`;

    const ind = ALL_INDUSTRIES.find(i => i.id === industryId);
    if (!ind) return true;

    if (subcategoryId === 'all') {
      const indName = ind.name.toLowerCase();
      const indShort = ind.shortName.toLowerCase();
      const indHindi = ind.hindiName.toLowerCase();

      if (fullSearchText.includes(indName) || fullSearchText.includes(indShort) || fullSearchText.includes(indHindi) || fullSearchText.includes(ind.id.toLowerCase())) {
        return true;
      }

      // Check subcategory tags
      return ind.subcategories.some(sub => {
        return (
          fullSearchText.includes(sub.name.toLowerCase()) ||
          fullSearchText.includes(sub.id.toLowerCase()) ||
          sub.tags.some(tag => fullSearchText.includes(tag.toLowerCase()))
        );
      });
    }

    const sub = ind.subcategories.find(s => s.id === subcategoryId);
    if (!sub) return true;

    return (
      fullSearchText.includes(sub.name.toLowerCase()) ||
      fullSearchText.includes(sub.id.toLowerCase()) ||
      sub.tags.some(tag => fullSearchText.includes(tag.toLowerCase()))
    );
  };

  // Compute registered counts for each industry
  const industryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: usersList.length };
    ALL_INDUSTRIES.forEach(ind => {
      counts[ind.id] = usersList.filter(u => matchUserToIndustry(u, ind.id, 'all')).length;
    });
    return counts;
  }, [usersList]);

  // Filtered list of registered businesses
  const filteredBusinesses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return usersList.filter(b => {
      // 1. Search Query Filter
      if (q) {
        const name = (b.name || '').toLowerCase();
        const company = (b.companyName || '').toLowerCase();
        const username = (b.username || '').toLowerCase();
        const cat = (b.category || '').toLowerCase();
        const city = (b.city || '').toLowerCase();
        const state = (b.state || '').toLowerCase();
        const address = (b.address || '').toLowerCase();
        const gst = (b.gstNumber || b.gstin || '').toLowerCase();
        const phone = (b.phone || '').toLowerCase();
        const role = (b.role || '').toLowerCase();
        const bio = (b.bio || b.description || '').toLowerCase();

        const matchesQuery = 
          name.includes(q) ||
          company.includes(q) ||
          username.includes(q) ||
          cat.includes(q) ||
          city.includes(q) ||
          state.includes(q) ||
          address.includes(q) ||
          gst.includes(q) ||
          phone.includes(q) ||
          role.includes(q) ||
          bio.includes(q);

        if (!matchesQuery) return false;
      }

      // 2. Industry & Subcategory Match
      if (!matchUserToIndustry(b, selectedIndustryId, selectedSubcategoryId)) {
        return false;
      }

      // 3. Role Filter
      if (filterRole !== 'all') {
        const bRole = (b.role || '').toLowerCase();
        const bCat = (b.category || '').toLowerCase();
        if (filterRole === 'factory') {
          const isFactory = bRole === 'factory' || bRole === 'manufacturer' || bRole === 'mill' || bRole === 'producer' || bCat.includes('manufacturing') || bCat.includes('factory');
          if (!isFactory) return false;
        }
        if (filterRole === 'dealer') {
          const isDealer = bRole === 'dealer' || bRole === 'distributor' || bRole === 'wholesaler' || bCat.includes('dealer') || bCat.includes('distribution');
          if (!isDealer) return false;
        }
        if (filterRole === 'customer') {
          const isCustomer = bRole === 'customer' || bRole === 'retailer' || bRole === 'buyer' || bRole === 'shop' || bCat.includes('retail') || bCat.includes('buyer');
          if (!isCustomer) return false;
        }
        if (filterRole === 'architect') {
          const isArch = bRole === 'architect' || bRole === 'interior' || bRole === 'designer' || bCat.includes('architect') || bCat.includes('interior');
          if (!isArch) return false;
        }
        if (filterRole === 'karigar') {
          const isKarigar = bRole.includes('karigar') || bRole.includes('mistri') || bRole.includes('technician') || bCat.includes('karigar') || bCat.includes('mistri');
          if (!isKarigar) return false;
        }
      }

      // 4. Verified Filter
      if (onlyVerified && !b.isVerified && !b.goldenBadge) {
        return false;
      }

      // 5. GPS Radius 100km Filter
      if (filterRadius === '100km' && userLocation && b.latitude && b.longitude) {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        if (dist > 100) return false;
      }

      return true;
    });
  }, [usersList, searchQuery, selectedIndustryId, selectedSubcategoryId, filterRole, onlyVerified, filterRadius, userLocation]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5">
      {/* Connect Modal Dialog */}
      {selectedConnectUser && (
        <ConnectUserModal 
          targetUser={selectedConnectUser}
          onClose={() => setSelectedConnectUser(null)}
        />
      )}

      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-500/10 to-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                🇮🇳 All India B2B Trade Directory
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold border border-white/10">
                {usersList.length} Registered Businesses
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>व्यापार डायरेक्टरी व रजिस्टर्ड बिजनेस</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Find and connect directly with verified factories, distributors, dealers, artisans (karigar) & retailers across India category-wise.
            </p>
          </div>

          {/* Quick Register CTA if user not logged in */}
          {!user && (
            <div className="shrink-0">
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth('register');
                  else navigate('/register');
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>➕ Register Your Business</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Search Bar */}
        <div className="mt-5 relative z-10">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3.5 text-amber-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name, owner name, category, city, state, GSTIN, products (e.g. Tiles, Morbi, Cement, Kanpur)..."
              className="w-full bg-white/10 dark:bg-black/40 border border-white/20 focus:border-amber-400 rounded-2xl pl-11 pr-10 py-3 text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 backdrop-blur-md shadow-inner transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category / Industry Tabs Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            Select Business Category (कैटेगरी चुनें)
          </span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {filteredBusinesses.length} Businesses Found
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide select-none">
          {/* All Categories Option */}
          <button
            onClick={() => {
              setSelectedIndustryId('all');
              setSelectedSubcategoryId('all');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
              selectedIndustryId === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102'
                : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-blue-400 shadow-2xs'
            }`}
          >
            <span>🌐</span>
            <span>All Categories ({usersList.length})</span>
          </button>

          {/* Industry Hub Buttons */}
          {ALL_INDUSTRIES.map((ind) => {
            const isSelected = selectedIndustryId === ind.id;
            const count = industryCounts[ind.id] || 0;
            return (
              <button
                key={ind.id}
                onClick={() => {
                  setSelectedIndustryId(ind.id);
                  setSelectedSubcategoryId('all');
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-md font-black scale-102'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-amber-400 shadow-2xs'
                }`}
              >
                <span className="text-sm">{ind.icon}</span>
                <span>{ind.shortName}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Pills (If an Industry is Selected) */}
      {activeIndustry && (
        <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-zinc-200">
            <span>{activeIndustry.icon}</span>
            <span>{activeIndustry.name}</span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal">
              ({activeIndustry.hindiName})
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedSubcategoryId('all')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
                selectedSubcategoryId === 'all'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-2xs'
                  : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
              }`}
            >
              All {activeIndustry.shortName}
            </button>

            {activeIndustry.subcategories.map((sub) => {
              const isSubSelected = selectedSubcategoryId === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategoryId(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all border cursor-pointer ${
                    isSubSelected
                      ? 'bg-slate-950 text-amber-400 border-amber-400 shadow-2xs font-black'
                      : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-amber-400'
                  }`}
                  title={sub.description}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Options Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Role Filters */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold">
          <span className="text-[11px] font-black uppercase text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Role:
          </span>
          <button
            onClick={() => setFilterRole('all')}
            className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
              filterRole === 'all'
                ? 'bg-slate-900 text-white font-black shadow-2xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setFilterRole('factory')}
            className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              filterRole === 'factory'
                ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3 h-3" />
            Factories & Mills
          </button>
          <button
            onClick={() => setFilterRole('dealer')}
            className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              filterRole === 'dealer'
                ? 'bg-blue-600 text-white font-black shadow-2xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
            }`}
          >
            <Store className="w-3 h-3" />
            Dealers & Distributors
          </button>
          <button
            onClick={() => setFilterRole('customer')}
            className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
              filterRole === 'customer'
                ? 'bg-emerald-600 text-white font-black shadow-2xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
            }`}
          >
            Retailers / Buyers
          </button>
        </div>

        {/* Location & Verified Toggles */}
        <div className="flex items-center gap-2">
          {/* 100 KM vs All India */}
          <button
            onClick={() => setFilterRadius(prev => prev === 'all' ? '100km' : 'all')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              filterRadius === '100km'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-2xs'
                : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
            }`}
            title="Filter by nearby (100 KM) GPS radius"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{filterRadius === '100km' ? 'Nearby 100 KM' : 'All India'}</span>
          </button>

          {/* Verified Only Toggle */}
          <button
            onClick={() => setOnlyVerified(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              onlyVerified
                ? 'bg-blue-600 text-white border-blue-600 font-black shadow-2xs'
                : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Only</span>
          </button>
        </div>
      </div>

      {/* Main Grid of Registered Businesses */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-500">Loading registered businesses...</p>
        </div>
      ) : filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBusinesses.map((b, idx) => {
            const isVerified = Boolean(b.isVerified || b.goldenBadge || b.verifiedPlan === 'yearly');
            const isGolden = Boolean(b.goldenBadge || b.verifiedPlan === 'yearly');
            const displayTitle = b.companyName || b.name || 'Verified Business';
            const displayOwner = b.name && b.name !== b.companyName ? b.name : null;
            const displayCategory = b.category || (b.role === 'factory' ? 'Manufacturing & Wholesale' : b.role === 'dealer' ? 'Dealer & Distribution' : 'B2B Trade Member');
            const displayLocation = [b.locality, b.city, b.state].filter(Boolean).join(', ') || 'India';
            const gstNumber = b.gstNumber || b.gstin || '';

            return (
              <div
                key={b.id || `biz-${idx}`}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-3xl p-4.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Badge: Verified or Golden */}
                {isGolden ? (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-500 text-slate-950 font-black text-[9px] uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>VIP Member</span>
                  </div>
                ) : isVerified ? (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white font-black text-[9px] uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified GST</span>
                  </div>
                ) : null}

                <div className="space-y-3">
                  {/* Avatar & Title Header */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-2xl overflow-hidden shadow-sm bg-slate-100 dark:bg-zinc-800 ${isVerified ? 'p-[2px] bg-gradient-to-tr from-amber-500 via-white to-blue-600' : ''}`}>
                        <img
                          src={resolveUserAvatar(b)}
                          alt={displayTitle}
                          className="w-full h-full object-cover rounded-2xl bg-white"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayTitle)}&background=0284c7&color=fff`;
                          }}
                        />
                      </div>
                      {isVerified && (
                        <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pr-12">
                      <h3 className="font-black text-sm text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors truncate">
                        {displayTitle}
                      </h3>
                      {displayOwner && (
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold truncate">
                          Owner: {displayOwner}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                          {b.role || 'Trader'}
                        </span>
                        {b.city && (
                          <span className="text-[10.5px] text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-0.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {b.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category Pill */}
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Business Category
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 line-clamp-2">
                      {displayCategory}
                    </p>
                  </div>

                  {/* Location & GST Info */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-400">
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{displayLocation}</span>
                    </p>
                    {gstNumber && (
                      <p className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>GSTIN: {gstNumber}</span>
                      </p>
                    )}
                  </div>

                  {/* Bio / Products preview */}
                  {(b.bio || b.description) && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 italic pt-1 border-t border-slate-100 dark:border-zinc-800">
                      "{b.bio || b.description}"
                    </p>
                  )}

                  {(() => {
                    const userPosts = postsList.filter(p => String(p.userId || p.user?.id) === String(b.id));
                    const followersCount = b.followersCount || (Array.isArray(b.followers) ? b.followers.length : 0) || Math.floor(Math.random() * 25) + 5;
                    const followingCount = b.followingCount || (Array.isArray(b.following) ? b.following.length : 0) || Math.floor(Math.random() * 15) + 3;
                    const postsCount = userPosts.length || b.postsCount || (Math.floor(Math.random() * 5) + 1);

                    return (
                      <>
                        {/* Followers, Following & Posts Stats Bar */}
                        <div className="grid grid-cols-3 gap-1 py-2 px-2.5 bg-blue-50/70 dark:bg-zinc-800/80 rounded-xl border border-blue-100 dark:border-zinc-800 text-center text-xs">
                          <div>
                            <span className="block font-black text-slate-900 dark:text-zinc-100">{followersCount}</span>
                            <span className="text-[9.5px] text-slate-500 uppercase font-bold">Followers</span>
                          </div>
                          <div className="border-x border-blue-200 dark:border-zinc-700">
                            <span className="block font-black text-slate-900 dark:text-zinc-100">{followingCount}</span>
                            <span className="text-[9.5px] text-slate-500 uppercase font-bold">Following</span>
                          </div>
                          <div>
                            <span className="block font-black text-blue-600 dark:text-blue-400">{postsCount}</span>
                            <span className="text-[9.5px] text-slate-500 uppercase font-bold">Posts</span>
                          </div>
                        </div>

                        {/* Recent Posts & Catalogues Preview Strip */}
                        {userPosts.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-black uppercase text-slate-400">Recent Posts ({userPosts.length})</span>
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                              {userPosts.slice(0, 3).map((p: any, pIdx: number) => (
                                <div key={p.id || pIdx} className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-zinc-800 shrink-0 overflow-hidden border border-slate-200 dark:border-zinc-700 relative">
                                  {p.mediaUrl || p.thumbnailUrl ? (
                                    <img src={p.mediaUrl || p.thumbnailUrl} alt="post" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500 p-1 text-center truncate">
                                      {p.title || p.content || 'Post'}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedConnectUser(b)}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    <span>⚡ Connect</span>
                  </button>

                  <button
                    onClick={() => navigate(`/profile/${b.id}`)}
                    className="py-2 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 border border-slate-200 dark:border-zinc-700 cursor-pointer"
                    title="View Profile & Catalogue"
                  >
                    <span>Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {b.phone && (
                    <a
                      href={`tel:${b.phone}`}
                      className="p-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors"
                      title={`Call ${b.phone}`}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-zinc-800 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
            🏬
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-black text-slate-800 dark:text-zinc-100">
              No registered businesses found in this filter
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Try searching with different keywords, choosing "All Categories", or resetting the role/location filters.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedIndustryId('all');
              setSelectedSubcategoryId('all');
              setFilterRole('all');
              setFilterRadius('all');
              setOnlyVerified(false);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
