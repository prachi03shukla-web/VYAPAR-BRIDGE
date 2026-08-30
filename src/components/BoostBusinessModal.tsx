import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Megaphone, 
  Sparkles, 
  Crown, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  CreditCard, 
  QrCode, 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  Rocket, 
  AlertCircle,
  Clock,
  Gift
} from 'lucide-react';
import toast from 'react-hot-toast';
import { validateGSTIN } from '../utils/gstinValidator';
import { syncUserToFirestore, submitPaymentUTRToFirestore } from '../services/firebaseDataSync';
import { ALL_INDUSTRIES } from '../constants/industryData';

interface BoostBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  targetPost?: any;
  onUpdateUser?: (updatedUser: any) => void;
}

export function BoostBusinessModal({
  isOpen,
  onClose,
  user,
  targetPost,
  onUpdateUser
}: BoostBusinessModalProps) {
  // Step state: 1: GSTIN, 2: Business details, 3: Contact confirmation, 4: Plans & Payment
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [slideDirection, setSlideDirection] = useState<number>(1);

  // Form Fields (Pre-populated from user profile if existing)
  const [gstNumber, setGstNumber] = useState<string>('');
  const [hasNoGst, setHasNoGst] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [businessRole, setBusinessRole] = useState<string>('dealer');
  const [industryCategory, setIndustryCategory] = useState<string>('tiles_sanitary');
  const [showroomAddress, setShowroomAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Payment plan selection
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState<boolean>(false);
  const [showPaymentStepDirectly, setShowPaymentStepDirectly] = useState<boolean>(false);

  // Active VIP Plan Calculation
  const isUserVerified = Boolean(user?.isVerified);
  const isReferralVerification = user?.verificationType === 'referral' || user?.verifiedBadgeType === 'blue_referral';
  const isExpired = user?.verifiedUntil && new Date(user.verifiedUntil).getTime() < Date.now();
  const hasActiveBoostMembership = isUserVerified && !isExpired;

  // Initialize or prefill state when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setGstNumber(user.gstNumber || user.gstin || '');
      setHasNoGst(!user.gstNumber && !user.gstin);
      setCompanyName(user.companyName || user.firmName || user.name || '');
      setBusinessRole(user.role || 'dealer');
      setIndustryCategory(user.category || 'tiles_sanitary');
      setShowroomAddress(user.address || '');
      setCity(user.city || '');
      setState(user.state || '');
      setPhone(user.phone || user.mobile || '');
      setEmail(user.email || '');
      setCurrentStep(1);
      setShowPaymentStepDirectly(false);
      setUtrNumber('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Form step navigation
  const nextStep = (stepNumber: number) => {
    setSlideDirection(1);
    setCurrentStep(stepNumber);
  };

  const prevStep = (stepNumber: number) => {
    setSlideDirection(-1);
    setCurrentStep(stepNumber);
  };

  // Step 1: GSTIN Validation & Save
  const handleStep1Save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasNoGst) {
      const cleanGst = gstNumber.trim().toUpperCase();
      if (!cleanGst) {
        toast.error('Kripya valid 15-digit GSTIN dalein ya "No GSTIN" check karein.');
        return;
      }
      const validation = validateGSTIN(cleanGst);
      if (!validation.isValid) {
        toast.error(validation.message || 'Invalid GSTIN Format. 15-digit GST Number hona chahiye.');
        return;
      }
    }
    toast.success('GSTIN details saved!');
    nextStep(2);
  };

  // Step 2: Showroom & Merchant details save
  const handleStep2Save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error('Kripya apni Company / Firm ya Showroom ka naam dalein.');
      return;
    }
    if (!city.trim()) {
      toast.error('Kripya apna City / Shahar dalein.');
      return;
    }
    toast.success('Business details saved!');
    nextStep(3);
  };

  // Step 3: Contact confirmation & sync
  const handleStep3Confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Kripya 10-digit valid mobile number dalein.');
      return;
    }
    if (!agreeTerms) {
      toast.error('Kripya terms confirm karein.');
      return;
    }

    // Save and sync user profile
    const updatedUser = {
      ...(user || {}),
      gstNumber: hasNoGst ? '' : gstNumber.trim().toUpperCase(),
      companyName: companyName.trim(),
      role: businessRole,
      category: industryCategory,
      address: showroomAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      phone: cleanPhone,
      email: email.trim(),
      businessProfileCompleted: true,
      lastUpdated: new Date().toISOString()
    };

    // 1. Local storage update
    try {
      localStorage.setItem('vyapar_user', JSON.stringify(updatedUser));
      if (updatedUser.phone) localStorage.setItem('vyapar_user_phone', updatedUser.phone);
      if (updatedUser.gstNumber) localStorage.setItem('vyapar_user_gst', updatedUser.gstNumber);
      if (updatedUser.companyName) localStorage.setItem('vyapar_user_company', updatedUser.companyName);
    } catch (e) {}

    // 2. Firestore Sync
    try {
      await syncUserToFirestore(updatedUser);
    } catch (e) {
      console.warn('Firestore sync note:', e);
    }

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    toast.success('🎉 Business profile verified! Proceeding to Boost Plans...');
    nextStep(4);
  };

  // Step 4: Submit Payment UTR
  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      toast.error('Kripya valid 12-digit UPI UTR / Reference Number dalein.');
      return;
    }

    setIsSubmittingUtr(true);
    try {
      const planAmount = selectedPlan === 'yearly' ? 1188 : 99;
      await submitPaymentUTRToFirestore({
        userId: user?.id || 'guest',
        userName: user?.name || companyName || 'Business Partner',
        phone: user?.phone || phone,
        plan: selectedPlan,
        amount: planAmount,
        utr: cleanUtr,
        status: 'pending_verification',
        createdAt: new Date().toISOString()
      });

      toast.success('✅ Payment UTR submitted for instant approval! Our team will activate your VIP Boost within 15 mins.', {
        duration: 6000
      });
      onClose();
    } catch (err) {
      toast.error('Submission failed. Please check connection and retry.');
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  const handleOpenUpiApp = (appType?: 'gpay' | 'phonepe' | 'paytm' | 'generic') => {
    const upiId = 'ashish660@ibl';
    const name = encodeURIComponent('Ashish Kumar Verma - Vyapar Bridge');
    const amount = selectedPlan === 'yearly' ? '1188' : '99';

    try {
      navigator.clipboard.writeText(upiId);
    } catch (e) {}

    toast.success(`📋 UPI ID Copied: ${upiId}\nOpening payment app (₹${amount})...`);

    let upiUrl = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;
    if (appType === 'phonepe') {
      upiUrl = `phonepe://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;
    } else if (appType === 'paytm') {
      upiUrl = `paytmmp://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;
    } else if (appType === 'gpay') {
      upiUrl = `intent://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR#Intent;scheme=upi;package=com.google.android.apps.nfp.p2p;end;`;
    }

    setTimeout(() => {
      window.location.href = upiUrl;
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl border-2 border-amber-400/60 dark:border-amber-500/40 shadow-2xl overflow-hidden flex flex-col my-auto relative text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner with Golden Gradient */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 p-4 sm:p-5 text-slate-950 relative flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-lg transform -rotate-3 shrink-0">
              <Megaphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-950 text-amber-300 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  🔥 10X B2B Reach
                </span>
                {hasActiveBoostMembership && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight mt-0.5">
                Boost Your Business & Reels
              </h2>
              <p className="text-xs font-bold text-slate-900/80">
                All-India Top Recommendations & Verified Leads
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          {/* CASE 1: USER ALREADY HAS ACTIVE VIP MEMBERSHIP OR 1-MONTH FREE REFERRAL BADGE */}
          {hasActiveBoostMembership && !showPaymentStepDirectly ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-amber-600/15 border-2 border-amber-400/60 dark:border-amber-500/40 text-center space-y-3 shadow-inner">
                <div className="inline-flex p-3 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 shadow-md">
                  <Crown className="w-8 h-8 animate-bounce" />
                </div>
                
                <div>
                  <h3 className="text-lg font-black text-amber-950 dark:text-amber-300">
                    👑 VIP Business Booster Active!
                  </h3>
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">
                    Namaste <strong>{user?.name || user?.companyName || 'Vyapar Partner'}</strong>! Aapka profile aur sabhi posts already <strong>High Priority Recommendation</strong> aur Boosted Visual Directory me active hain.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-left">
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-amber-300/60 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block">Membership Type</span>
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                      {isReferralVerification ? <Gift className="w-3.5 h-3.5" /> : <Crown className="w-3.5 h-3.5" />}
                      {isReferralVerification ? '1-Mo Free Blue Badge (Referral)' : 'VIP Premium Partner'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-amber-300/60 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block">Boost Status</span>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active & Ranked #1
                    </span>
                  </div>
                </div>

                {user?.verifiedUntil && (
                  <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 flex items-center justify-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Valid Until: <strong>{new Date(user.verifiedUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                  </div>
                )}
              </div>

              {/* Active Perks List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Active Booster Advantages:
                </h4>
                <div className="space-y-1.5 text-xs font-medium">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>10X Impressions:</strong> Posts shown at the top of Explore & Home Feeds</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                    <span><strong>Verified Blue Checkmark:</strong> Building 100% trust with buyers & factories</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                    <TrendingUp className="w-4 h-4 text-amber-500 shrink-0" />
                    <span><strong>Direct WhatsApp Leads:</strong> Buyers can send instant inquiries without friction</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => {
                    const shareText = `🚀 Check out ${user?.companyName || user?.name || 'our verified store'} on Vyapar Bridge B2B Network! Boosted verified business profile: https://vyaparbridge.com/profile/${user?.id || ''}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Share Profile on WhatsApp</span>
                </button>

                <button
                  onClick={() => setShowPaymentStepDirectly(true)}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span>Renew / Extend Plan</span>
                </button>
              </div>
            </div>
          ) : (
            /* CASE 2: MULTI-STEP SLIDING BOOST ONBOARDING WIZARD */
            <div>
              {/* Stepper Progress Indicator */}
              <div className="flex items-center justify-between mb-5 relative px-2">
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-zinc-800 z-0" />
                <div 
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-amber-500 transition-all duration-500 z-0"
                  style={{ width: `${((currentStep - 1) / 3) * 85}%` }}
                />

                {[
                  { step: 1, label: 'GSTIN' },
                  { step: 2, label: 'Firm & Showroom' },
                  { step: 3, label: 'Contact' },
                  { step: 4, label: 'Boost Plan' }
                ].map((s) => (
                  <div key={s.step} className="flex flex-col items-center relative z-10">
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        currentStep === s.step
                          ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-400/30 scale-110 shadow-md'
                          : currentStep > s.step
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {currentStep > s.step ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.step}
                    </div>
                    <span className="text-[10px] font-bold mt-1 text-zinc-500 dark:text-zinc-400 hidden sm:block">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Animated Slides */}
              <AnimatePresence mode="wait" custom={slideDirection}>
                {/* STEP 1: GSTIN DETAILS */}
                {currentStep === 1 && (
                  <motion.form
                    key="step-1"
                    custom={slideDirection}
                    initial={{ opacity: 0, x: slideDirection > 0 ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: slideDirection > 0 ? -30 : 30 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleStep1Save}
                    className="space-y-4"
                  >
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/40 space-y-1">
                      <h3 className="text-sm font-extrabold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        Step 1: GSTIN Verification (जीएसटी सत्यापन)
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Vyapar Bridge is a verified B2B trade network. Please enter your GSTIN for instant business verification.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        GSTIN Number (15 Digits)
                      </label>
                      <input 
                        type="text"
                        disabled={hasNoGst}
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        maxLength={15}
                        placeholder="e.g. 24AAAAA0000A1Z5"
                        className="w-full bg-slate-50 dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-amber-500 disabled:opacity-50"
                      />
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
                        <span>Format: 2 State + 10 PAN + 1 Entity + 1 Z + 1 Check</span>
                        <span className="font-mono">{gstNumber.length}/15</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                      <input 
                        type="checkbox"
                        id="no-gst-checkbox"
                        checked={hasNoGst}
                        onChange={(e) => {
                          setHasNoGst(e.target.checked);
                          if (e.target.checked) setGstNumber('');
                        }}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <label htmlFor="no-gst-checkbox" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        I am a Local Retailer / Don't have GSTIN (Continue with Trade ID)
                      </label>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        <span>Save & Continue to Business Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* STEP 2: BUSINESS & SHOWROOM DETAILS */}
                {currentStep === 2 && (
                  <motion.form
                    key="step-2"
                    custom={slideDirection}
                    initial={{ opacity: 0, x: slideDirection > 0 ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: slideDirection > 0 ? -30 : 30 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleStep2Save}
                    className="space-y-3.5"
                  >
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/40">
                      <h3 className="text-sm font-extrabold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-amber-500" />
                        Step 2: Firm & Showroom Details (फर्म व शोरूम विवरण)
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                        Yeh details aapke boosted post ke header aur business profile par show hongi.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Company / Firm / Showroom Name *
                      </label>
                      <input 
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Royal Ceramics & Bath Showroom"
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Business Type *
                        </label>
                        <select
                          value={businessRole}
                          onChange={(e) => setBusinessRole(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="dealer">Authorized Dealer</option>
                          <option value="factory">Manufacturer / Factory</option>
                          <option value="wholesaler">Wholesaler / Distributor</option>
                          <option value="retailer">Retailer / Showroom Owner</option>
                          <option value="merchant">Merchant / Trader</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Trade Sector *
                        </label>
                        <select
                          value={industryCategory}
                          onChange={(e) => setIndustryCategory(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          {ALL_INDUSTRIES.map(ind => (
                            <option key={ind.id} value={ind.id}>{ind.icon} {ind.shortName}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          City / Market *
                        </label>
                        <input 
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Morbi, Surat, Delhi"
                          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          State
                        </label>
                        <input 
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="e.g. Gujarat, UP, Maharashtra"
                          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Showroom / Factory Address
                      </label>
                      <input 
                        type="text"
                        value={showroomAddress}
                        onChange={(e) => setShowroomAddress(e.target.value)}
                        placeholder="Shop No., Commercial Complex, Highway Road"
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => prevStep(1)}
                        className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>

                      <button
                        type="submit"
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <span>Save & Proceed to Contact</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* STEP 3: CONTACT & EMAIL CONFIRMATION */}
                {currentStep === 3 && (
                  <motion.form
                    key="step-3"
                    custom={slideDirection}
                    initial={{ opacity: 0, x: slideDirection > 0 ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: slideDirection > 0 ? -30 : 30 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleStep3Confirm}
                    className="space-y-4"
                  >
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/40">
                      <h3 className="text-sm font-extrabold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-amber-500" />
                        Step 3: Contact Confirmation (मोबाइल व ईमेल पुष्टि)
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                        All-India buyers & dealers will contact you directly on these verified details.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Primary WhatsApp & Call Mobile Number *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-2.5 text-xs font-bold text-zinc-500">
                          🇮🇳 +91
                        </div>
                        <input 
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit mobile number"
                          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-16 pr-3.5 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Business Email Address
                      </label>
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contact@yourbusiness.com"
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Summary Review Card */}
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1 text-xs">
                      <div className="text-[11px] font-extrabold uppercase text-amber-600 dark:text-amber-400">
                        Verification Summary
                      </div>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>Firm Name:</span>
                        <strong className="text-zinc-900 dark:text-zinc-100">{companyName || 'Not Set'}</strong>
                      </div>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>GSTIN:</span>
                        <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{hasNoGst ? 'Aadhaar / UDYAM' : (gstNumber || 'N/A')}</strong>
                      </div>
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>Location:</span>
                        <strong className="text-zinc-900 dark:text-zinc-100">{city} {state ? `, ${state}` : ''}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id="terms-check"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <label htmlFor="terms-check" className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                        I confirm that the above business details are accurate for priority boost recommendations.
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => prevStep(2)}
                        className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>

                      <button
                        type="submit"
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        <span>Confirm & View Boost Plans</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* STEP 4: BOOST PLANS & PAYMENT GATEWAY */}
                {currentStep === 4 && (
                  <motion.div
                    key="step-4"
                    custom={slideDirection}
                    initial={{ opacity: 0, x: slideDirection > 0 ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: slideDirection > 0 ? -30 : 30 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="text-center space-y-1">
                      <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                        ⚡ Select Verification Plan
                      </span>
                      <h3 className="text-base font-black">
                        Choose Your Business Boost Package
                      </h3>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div 
                        onClick={() => setSelectedPlan('monthly')}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                          selectedPlan === 'monthly'
                            ? 'bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                            : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 opacity-80'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold">1 Month Boost</span>
                          {selectedPlan === 'monthly' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                        </div>
                        <div className="text-xl font-black mt-1 text-amber-600 dark:text-amber-400">
                          ₹99 <span className="text-[10px] font-normal text-zinc-500">/mo</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1">
                          Verified Blue Badge + 30 Days Top Placement
                        </div>
                      </div>

                      <div 
                        onClick={() => setSelectedPlan('yearly')}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                          selectedPlan === 'yearly'
                            ? 'bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                            : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 opacity-80'
                        }`}
                      >
                        <span className="absolute -top-2 right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow">
                          ⭐ BEST VALUE
                        </span>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold">1 Year Boost</span>
                          {selectedPlan === 'yearly' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                        </div>
                        <div className="text-xl font-black mt-1 text-amber-600 dark:text-amber-400">
                          ₹1,188 <span className="text-[10px] font-normal text-zinc-500">/yr</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1">
                          365 Days Unlimited Boost + Priority Inquiries
                        </div>
                      </div>
                    </div>

                    {/* Direct UPI Payment App Buttons */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Pay ₹{selectedPlan === 'yearly' ? '1,188' : '99'} via Instant UPI App:
                        </span>
                        <button 
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('ashish660@ibl');
                            toast.success('📋 UPI ID Copied: ashish660@ibl');
                          }}
                          className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy UPI ID</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenUpiApp('phonepe')}
                          className="py-2 px-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                        >
                          <span>PhonePe</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenUpiApp('gpay')}
                          className="py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                        >
                          <span>GPay</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenUpiApp('paytm')}
                          className="py-2 px-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                        >
                          <span>Paytm</span>
                        </button>
                      </div>
                    </div>

                    {/* UTR Submission Form */}
                    <form onSubmit={handleSubmitUtr} className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          After Payment, Enter 12-Digit UPI UTR / Reference ID *
                        </label>
                        <input 
                          type="text"
                          required
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="e.g. 408229182938"
                          className="w-full bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => prevStep(3)}
                          className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmittingUtr}
                          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmittingUtr ? (
                            <span>Submitting Verification...</span>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Submit UTR for Instant VIP Boost</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
