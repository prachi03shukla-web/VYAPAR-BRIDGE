import React, { useState } from 'react';
import { 
  Gift, 
  Share2, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  X, 
  Users, 
  ShieldCheck,
  ChevronRight,
  Send,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getUserReferralCode, getUserReferralLink, getReferralStats, ReferredUserRecord } from '../utils/referralManager';

interface ReferralRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const ReferralRewardsModal: React.FC<ReferralRewardsModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [copied, setCopied] = useState(false);
  const stats = getReferralStats(user);
  const referralLink = getUserReferralLink(user);
  const referralCode = getUserReferralCode(user);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((stats.qualifiedCount / stats.targetCount) * 100));
  const remainingCount = Math.max(0, stats.targetCount - stats.qualifiedCount);
  const isCompleted = stats.qualifiedCount >= stats.targetCount;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('📋 Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const userName = user?.name || user?.username || 'Trader';
    const message = `Namaste! 🇮🇳\n\nMain aapko Vyapar Bridge All-India Digital Business & Trade Network par invite kar raha hoon. Yahan par nationwide verified manufacturers, wholesalers, dealers aur buyers se direct business deals karein aur apna vyapar badhayein.\n\nMere referral link se join karein:\n👉 ${referralLink}\n\nJoin karein aur apni pehli post share karein!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Vyapar Bridge Referral Invite',
          text: `Join Vyapar Bridge all-India business trade network with my referral link:`,
          url: referralLink,
        });
      } catch (err) {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white text-slate-900 border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Luxury Tiranga & Blue Badge Glow */}
        <div className="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-5 sm:p-6 text-white overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl"></div>

          <div className="flex items-center justify-between relative z-10 mb-3">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-100 border border-white/20">
              <Gift className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
              <span>Vyapar Bridge Referral Program</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative z-10 space-y-1">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <span>Invite 10 Members, Get 1 Month FREE Blue Badge!</span>
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
            </h2>
            <p className="text-xs text-blue-100/80 leading-relaxed max-w-md">
              Apne WhatsApp group ya vyapari doston ko invite karein. Jab 10 members join karke apni 1st post dalenge, system aapko <strong>1 Month Free Blue Verified Checkmark 🏆</strong> dega!
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          
          {/* Realtime Progress Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Your Live Goal Progress</span>
                <div className="text-lg font-black text-slate-900 flex items-center gap-2 mt-0.5">
                  <span className="text-blue-600 font-mono text-2xl">{stats.qualifiedCount}</span>
                  <span className="text-slate-400 font-light">/</span>
                  <span className="text-slate-600 font-mono text-2xl">10</span>
                  <span className="text-xs font-bold text-slate-600 ml-1">Qualified Members</span>
                </div>
              </div>

              <div className="text-right">
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Goal Achieved!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-700" /> {remainingCount} more needed
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5 relative">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Progress Micro-explainer */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Total Joined: <strong>{stats.totalReferred}</strong></span>
              <span>Joined + Posted: <strong className="text-blue-700">{stats.qualifiedCount} of 10</strong></span>
            </div>

            {isCompleted && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-900 font-semibold">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Congratulations! Your 1-Month Free Blue Badge is activated on your account.</span>
              </div>
            )}
          </div>

          {/* Referral Link & Share Box */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Your Personal Referral Link
            </label>

            <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-2xl p-2 pl-3.5 shadow-inner">
              <div className="flex-1 font-mono text-xs text-slate-700 truncate select-all">
                {referralLink}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 active:scale-95"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Share2 className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Share via More Apps</span>
              </button>
            </div>
          </div>

          {/* Rule Breakdown Box */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>How This Referral System Works:</span>
            </h4>
            <div className="space-y-2 text-xs text-blue-950/80">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <p>Share your invite link with business owners, factory partners, traders, dealers, or buyers on WhatsApp.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <p>Members click your link and register their account on Vyapar Bridge (Status: <strong>✅ Joined</strong>).</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <p>When each member creates their first product post/catalogue (Status: <strong>✅ Post Created</strong>), it counts as a <strong>Qualified Referral</strong>.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">🏆</span>
                <p className="font-bold text-emerald-900">Once 10 members complete this, system instantly unlocks your 1-Month FREE Blue Verified Checkmark!</p>
              </div>
            </div>
          </div>

          {/* Live List of Referred Members */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Your Invited Members ({stats.referrals.length})</span>
              <span className="text-[11px] text-slate-500 font-normal">Real-time Firebase Sync</span>
            </h4>

            {stats.referrals.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-500 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-xs font-bold text-slate-700">No Friends Invited Yet</p>
                <p className="text-[11px] text-slate-500">Tap "Share on WhatsApp" above to invite your first 10 members and claim your free Blue Badge!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {stats.referrals.map((ref: ReferredUserRecord, idx: number) => (
                  <div 
                    key={ref.userId || idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 border border-blue-200 overflow-hidden">
                        {ref.userAvatar ? (
                          <img src={ref.userAvatar} alt={ref.userName} className="w-full h-full object-cover" />
                        ) : (
                          ref.userName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span>{ref.userName}</span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {ref.userRole || 'Member'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Joined {new Date(ref.joinedAt).toLocaleDateString()} • {ref.userCity || 'India'}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {ref.hasPosted ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Qualified (Posted)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" /> Joined (Pending Post)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
