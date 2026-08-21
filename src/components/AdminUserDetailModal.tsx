import React, { useState } from 'react';
import {
  X,
  User,
  Fingerprint,
  Key,
  ShieldCheck,
  Gift,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  Share2,
  Trash2,
  Sparkles,
  ExternalLink,
  Users,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getOrCreateFingerprint, getReferralStats, ReferredUserRecord } from '../utils/referralManager';
import { adminResetUserPassword, updateUserVerificationInFirestore } from '../services/firebaseDataSync';

interface AdminUserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserUpdated?: (updatedUser: any) => void;
  onDeleteUser?: (user: any) => void;
}

export const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
  onDeleteUser
}) => {
  const [currentUserData, setCurrentUserData] = useState<any>(user);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'referrals' | 'security' | 'verification'>('profile');

  // Keep local state in sync when user prop changes
  React.useEffect(() => {
    if (user) {
      const fp = getOrCreateFingerprint(user);
      setCurrentUserData({ ...user, fingerprintId: fp });
    }
  }, [user]);

  if (!isOpen || !currentUserData) return null;

  const fingerprintId = getOrCreateFingerprint(currentUserData);
  const referralStats = getReferralStats(currentUserData);

  const handleGeneratePassword = async () => {
    setIsGeneratingPassword(true);
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const newMasterPass = `VB${randomSuffix}`;
    const tid = toast.loading(`Generating Master Password for ${currentUserData.name || currentUserData.username}...`);

    try {
      const res = await adminResetUserPassword(currentUserData.id, newMasterPass);
      if (res.success) {
        const updated = { ...currentUserData, password: newMasterPass };
        setCurrentUserData(updated);
        setGeneratedPassword(newMasterPass);
        if (onUserUpdated) onUserUpdated(updated);
        toast.success(`🔑 Master Password generated: ${newMasterPass}`, { id: tid });
      } else {
        toast.error(res.error || 'Failed to update master password', { id: tid });
      }
    } catch (err: any) {
      toast.error('Password error: ' + (err?.message || 'Failed'), { id: tid });
    } finally {
      setIsGeneratingPassword(false);
    }
  };

  const handleToggleVerification = async (plan: string = 'yearly', validityDays: number = 365) => {
    const nextStatus = !currentUserData.isVerified;
    const tid = toast.loading(nextStatus ? `Granting Verified Badge (${plan})...` : 'Revoking Verified Badge...');
    
    try {
      await updateUserVerificationInFirestore(currentUserData.id, nextStatus, plan, validityDays);
      const updated = {
        ...currentUserData,
        isVerified: nextStatus,
        verifiedBadge: nextStatus,
        verifiedPlan: nextStatus ? plan : null,
        verifiedAt: nextStatus ? Date.now() : null,
        expiresAt: nextStatus ? Date.now() + (validityDays * 24 * 60 * 60 * 1000) : null,
        validityDays: nextStatus ? validityDays : null
      };
      setCurrentUserData(updated);
      if (onUserUpdated) onUserUpdated(updated);
      toast.success(nextStatus ? '✅ Verified Badge Granted!' : 'Removed verification badge', { id: tid });
    } catch (e) {
      toast.error('Failed to update verification', { id: tid });
    }
  };

  const handleShareWhatsAppPassword = () => {
    if (!generatedPassword) return;
    const uName = currentUserData.name || currentUserData.username || 'Partner';
    const uLogin = currentUserData.username || currentUserData.phone || currentUserData.email;
    const message = `Namaste ${uName},\n\nVyapar Bridge Admin dwara aapka account login password reset kar diya gaya hai:\n\n🔑 Username: ${uLogin}\n🔐 Master Password: ${generatedPassword}\n\nAap abhi is Master Password se Vyapar Bridge par login kar sakte hain.`;
    const phoneParam = currentUserData.phone ? `phone=${currentUserData.phone.replace(/[^0-9]/g, '')}&` : '';
    window.open(`https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[280] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white text-slate-900 border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400 shrink-0 font-black text-lg overflow-hidden">
              {currentUserData.avatarUrl || currentUserData.avatar ? (
                <img src={currentUserData.avatarUrl || currentUserData.avatar} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                (currentUserData.name?.charAt(0) || currentUserData.username?.charAt(0) || 'U').toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  {currentUserData.name || currentUserData.username || 'Vyapar Member'}
                </h3>
                {currentUserData.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-blue-400" /> Verified Member
                  </span>
                )}
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {currentUserData.role || 'dealer'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                @{currentUserData.username || 'user'} • UID: <span className="font-mono text-slate-300">{currentUserData.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'profile' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Profile & Business</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('referrals')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'referrals' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-amber-500" />
            <span>Referrals & Rewards ({referralStats.qualifiedCount}/10)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'security' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5 text-indigo-600" />
            <span>Fingerprint & Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'verification' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Blue Badge Plan</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          
          {/* TAB 1: PROFILE & BUSINESS */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business / Firm Name</span>
                  <div className="font-bold text-xs text-slate-900">{currentUserData.name || 'Not provided'}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category / Trade</span>
                  <div className="font-bold text-xs text-slate-900">{currentUserData.category || 'Ceramic Trader'}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Phone</span>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{currentUserData.phone || 'No phone registered'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GSTIN Number</span>
                  <div className="font-mono font-bold text-xs text-slate-900">
                    {currentUserData.gstNumber || 'Unregistered / Customer'}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Location / Address</span>
                  <div className="font-medium text-xs text-slate-800 flex items-start gap-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>
                      {[currentUserData.address, currentUserData.city, currentUserData.state].filter(Boolean).join(', ') || 'Morbi, Gujarat, India'}
                    </span>
                  </div>
                  {currentUserData.googleMapsUrl && (
                    <a 
                      href={currentUserData.googleMapsUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline pt-1"
                    >
                      <ExternalLink className="w-3 h-3" /> View On Google Maps
                    </a>
                  )}
                </div>
              </div>

              {/* Registration & Online Meta */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Joined Platform: <strong>{currentUserData.createdAt ? new Date(currentUserData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${currentUserData.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span className="font-bold text-slate-800">
                    {currentUserData.isOnline ? 'Active Online' : 'Last Seen Offline'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REFERRALS & 1-MONTH FREE BLUE BADGE TRACKING */}
          {activeTab === 'referrals' && (
            <div className="space-y-4">
              {/* Progress Box */}
              <div className="bg-gradient-to-br from-amber-500/10 via-blue-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-amber-600" />
                      <span>Referral Qualification Status</span>
                    </span>
                    <div className="text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                      <span className="text-blue-600 font-mono text-2xl">{referralStats.qualifiedCount}</span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-600 font-mono text-2xl">10</span>
                      <span className="text-xs font-bold text-slate-600">Active (Joined + Posted)</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {referralStats.qualifiedCount >= 10 ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Free Blue Badge Unlocked!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-amber-700" /> {10 - referralStats.qualifiedCount} more needed
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-blue-600 to-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((referralStats.qualifiedCount / 10) * 100))}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Total Users Invited: <strong>{referralStats.totalReferred}</strong></span>
                  <span>Free 1-Month Reward: <strong>{currentUserData.verifiedPlan === 'referral_1month_free' ? '✅ ACTIVE' : (referralStats.qualifiedCount >= 10 ? 'Granted' : 'In Progress')}</strong></span>
                </div>
              </div>

              {/* Referred By Details */}
              {currentUserData.referredBy && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Invited To App By:</span>
                  <span className="font-bold text-slate-900">{currentUserData.referredByName || currentUserData.referredBy}</span>
                </div>
              )}

              {/* Table of Members Invited */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>All Members Invited by this User ({referralStats.referrals.length})</span>
                </h4>

                {referralStats.referrals.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-500 space-y-1">
                    <Users className="w-6 h-6 mx-auto text-slate-400" />
                    <p className="text-xs font-bold text-slate-700">No Referrals Registered Yet</p>
                    <p className="text-[11px] text-slate-500">When people register using this user's link, their live post verification status will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {referralStats.referrals.map((r: ReferredUserRecord, i: number) => (
                      <div key={r.userId || i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 border border-blue-200">
                            {r.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{r.userName}</div>
                            <div className="text-[10px] text-slate-500">
                              Joined {new Date(r.joinedAt).toLocaleDateString()} • {r.userRole || 'Member'}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {r.hasPosted ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Qualified (Posted)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" /> Joined (No Post Yet)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM FINGERPRINT & SECURITY & MASTER PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              {/* System Device Fingerprint Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300">Unique System Device Fingerprint ID</h4>
                      <p className="text-[10px] text-slate-400">Hardware & security deterministic key for admin identification</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-black text-amber-400 tracking-wider select-all">
                    {fingerprintId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(fingerprintId);
                      toast.success('📋 Fingerprint ID copied to clipboard!');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                  <div>Account UID: <span className="font-mono text-slate-200">{currentUserData.id}</span></div>
                  <div>Role Clearance: <span className="font-mono text-slate-200 uppercase">{currentUserData.role || 'Member'}</span></div>
                </div>
              </div>

              {/* Master Password Generation Hub */}
              <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center font-bold">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Account Master Password Desk</h4>
                      <p className="text-[11px] text-amber-800">Generate or reset login key for user account recovery</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    disabled={isGeneratingPassword}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {isGeneratingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                    <span>{isGeneratingPassword ? 'Generating...' : '⚡ Generate New Master Pass'}</span>
                  </button>
                </div>

                {generatedPassword && (
                  <div className="bg-white border-2 border-amber-400 rounded-xl p-3.5 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">Newly Assigned Master Password:</span>
                      <span className="font-mono font-black text-base text-slate-900 tracking-widest bg-amber-100 px-2 py-0.5 rounded">
                        {generatedPassword}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedPassword);
                          toast.success('📋 Password copied!');
                        }}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Key
                      </button>

                      <button
                        type="button"
                        onClick={handleShareWhatsAppPassword}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: VERIFICATION & BLUE BADGE */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Blue Verification Status</h4>
                      <p className="text-xs text-slate-500">Official B2B checkmark badge configuration</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                    currentUserData.isVerified 
                      ? 'bg-blue-100 text-blue-800 border-blue-300' 
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}>
                    {currentUserData.isVerified ? '✓ ACTIVE VERIFIED' : 'UNVERIFIED'}
                  </span>
                </div>

                {currentUserData.isVerified && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Plan Type:</span>
                      <strong className="text-slate-900 uppercase font-mono">{currentUserData.verifiedPlan || 'Custom'}</strong>
                    </div>
                    {currentUserData.expiresAt && (
                      <div className="flex justify-between text-slate-600">
                        <span>Expires On:</span>
                        <strong className="text-slate-900">{new Date(currentUserData.expiresAt).toLocaleDateString()}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons for Verification Plans */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Plan Assignment</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleVerification('referral_1month_free', 30)}
                    className="p-3 bg-white hover:bg-amber-50 border border-amber-300 rounded-xl text-left font-bold text-xs text-amber-900 flex items-center justify-between transition-all cursor-pointer shadow-xs"
                  >
                    <div>
                      <div>🎁 1-Month Free (Referral)</div>
                      <div className="text-[10px] text-amber-700 font-normal">30-Day Referral Bonus Checkmark</div>
                    </div>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleVerification('monthly', 30)}
                    className="p-3 bg-white hover:bg-blue-50 border border-blue-300 rounded-xl text-left font-bold text-xs text-blue-900 flex items-center justify-between transition-all cursor-pointer shadow-xs"
                  >
                    <div>
                      <div>💎 1-Month Plan (₹99)</div>
                      <div className="text-[10px] text-blue-700 font-normal">30-Day Standard Verification</div>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleVerification('yearly', 365)}
                    className="p-3 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-xl text-left font-bold text-xs text-emerald-900 flex items-center justify-between transition-all cursor-pointer shadow-xs"
                  >
                    <div>
                      <div>👑 1-Year VIP Plan (₹1,188)</div>
                      <div className="text-[10px] text-emerald-700 font-normal">365-Day Annual VIP Badge</div>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleVerification('lifetime', 3650)}
                    className="p-3 bg-white hover:bg-indigo-50 border border-indigo-300 rounded-xl text-left font-bold text-xs text-indigo-900 flex items-center justify-between transition-all cursor-pointer shadow-xs"
                  >
                    <div>
                      <div>🌟 Lifetime VIP Partner</div>
                      <div className="text-[10px] text-indigo-700 font-normal">Permanent Verified Checkmark</div>
                    </div>
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </button>
                </div>

                {currentUserData.isVerified && (
                  <button
                    type="button"
                    onClick={() => handleToggleVerification('none', 0)}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-300 transition-colors mt-2 cursor-pointer"
                  >
                    ✕ Remove Blue Verification Checkmark
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer with Delete & Close actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          {onDeleteUser && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDeleteUser(currentUserData);
              }}
              className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-xl border border-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Delete User</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
