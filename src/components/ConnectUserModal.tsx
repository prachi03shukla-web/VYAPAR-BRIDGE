import React from 'react';
import { MessageCircle, Phone, UserCheck, ExternalLink, Building2, Store, MapPin, CheckCircle, ShieldCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConnectUserModalProps {
  targetUser: any;
  onClose: () => void;
  currentUser?: any;
}

export function ConnectUserModal({ targetUser, onClose, currentUser }: ConnectUserModalProps) {
  const navigate = useNavigate();
  if (!targetUser) return null;

  const rawPhone = targetUser.phone || targetUser.mobile || targetUser.phoneNumber || '';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}` : (rawPhone || 'Not provided');

  const companyOrName = targetUser.companyName || targetUser.name || 'Verified Member';
  const personName = targetUser.name || 'Business Partner';
  const roleLabel = targetUser.role === 'factory' ? '🏭 Factory / Manufacturer' : (targetUser.role === 'dealer' ? '🏬 Dealer / Distributor' : '🛒 Buyer / Customer');

  const handleStartInAppChat = () => {
    onClose();
    const targetId = encodeURIComponent(targetUser.id || targetUser.name);
    navigate(`/chat?user=${targetId}`);
  };

  const handleWhatsApp = () => {
    const textMsg = encodeURIComponent(`Hello ${companyOrName}, I found your business profile on Vyapar Bridge B2B Commerce Network and would like to connect with you regarding deals and supplies!`);
    let url = '';
    if (cleanPhone.length >= 10) {
      const phoneNum = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      url = `https://wa.me/${phoneNum}?text=${textMsg}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${textMsg}`;
    }
    window.open(url, '_blank');
  };

  const handleCall = () => {
    if (cleanPhone) {
      window.location.href = `tel:${cleanPhone}`;
    } else {
      alert(`Phone contact not directly visible. You can send a direct in-app message or WhatsApp request to ${companyOrName}.`);
    }
  };

  const handleViewProfile = () => {
    onClose();
    navigate(`/profile/${encodeURIComponent(targetUser.id || targetUser.name)}`);
  };

  return (
    <div 
      className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden relative flex flex-col my-auto max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-slate-950 relative overflow-hidden flex items-center justify-between shrink-0">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
          <div className="flex items-center gap-2 relative z-10">
            <ShieldCheck className="w-5 h-5 text-slate-950" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-950">
              Connect With Business Partner
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 font-black flex items-center justify-center transition-colors cursor-pointer relative z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card Details */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex items-start gap-3.5 bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
            <div className={`w-14 h-14 rounded-2xl overflow-hidden shrink-0 border ${targetUser.isVerified ? 'tiranga-border-circle p-[2px]' : 'border-slate-300 dark:border-zinc-700 bg-slate-200 dark:bg-zinc-800'}`}>
              <div className="w-full h-full bg-[#E6C76C] dark:bg-black rounded-xl overflow-hidden flex items-center justify-center font-black text-black dark:text-zinc-200 text-xl">
                {targetUser.avatarUrl || targetUser.avatar ? (
                  <img src={targetUser.avatarUrl || targetUser.avatar} alt={companyOrName} className="w-full h-full object-cover" />
                ) : (
                  personName?.charAt(0) || 'B'
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-black text-base text-black dark:text-zinc-50 leading-tight">
                  {companyOrName}
                </h4>
                {targetUser.isVerified && <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500 shrink-0" />}
              </div>

              {targetUser.companyName && personName !== companyOrName && (
                <p className="text-xs text-black/70 dark:text-zinc-400 font-semibold mt-0.5">
                  Contact: {personName}
                </p>
              )}

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/30">
                  {roleLabel}
                </span>

                {(targetUser.city || targetUser.state) && (
                  <span className="text-xs text-black/60 dark:text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-500" />
                    <span>{targetUser.city ? `${targetUser.city}, ${targetUser.state || ''}` : targetUser.state}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Business Badges & Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-black/70 dark:text-zinc-400 uppercase tracking-wider block">Category / Products</span>
              <span className="font-bold text-black dark:text-zinc-200 truncate block mt-0.5">
                {targetUser.category || targetUser.businessType || 'General Commerce'}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-black/70 dark:text-zinc-400 uppercase tracking-wider block">GSTIN / Verified Status</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 truncate block mt-0.5">
                {targetUser.gstNumber ? `GST: ${targetUser.gstNumber}` : (targetUser.isVerified ? '✓ Verified Member' : 'B2B Member')}
              </span>
            </div>
          </div>

          {/* Direct Connection Action Buttons */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-extrabold text-black/70 dark:text-zinc-400 uppercase tracking-wider text-center">
              Choose Connection Method
            </p>

            <button
              onClick={handleStartInAppChat}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Direct In-App Message</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Connect on WhatsApp Chat</span>
            </button>

            <button
              onClick={handleCall}
              className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-black dark:text-zinc-100 font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-300 dark:border-zinc-700"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Direct Phone Call ({formattedPhone})</span>
            </button>

            <button
              onClick={handleViewProfile}
              className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 text-black/70 dark:text-zinc-400 font-bold text-xs py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Full Verified Business Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
