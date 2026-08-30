import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Scan,
  Camera,
  CheckCircle2,
  Receipt,
  Tag,
  Gift,
  Building2,
  User,
  ShoppingBag,
  Sparkles,
  Search,
  Upload,
  AlertCircle,
  History,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsQR from 'jsqr';
import { playBubblePopSound } from '../utils/audioEffects';

interface SellerDiscountScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onDiscountSaved?: (discountRecord: any, totalCount: number) => void;
}

export const SellerDiscountScannerModal: React.FC<SellerDiscountScannerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onDiscountSaved
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'history'>('scan');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Form states
  const [couponCode, setCouponCode] = useState<string>('');
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [buyerId, setBuyerId] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1 Box');
  const [discountAmount, setDiscountAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Stats & History
  const [totalDiscountsCount, setTotalDiscountsCount] = useState<number>(0);
  const [totalDiscountAmount, setTotalDiscountAmount] = useState<number>(0);
  const [recentDiscounts, setRecentDiscounts] = useState<any[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch current seller's discount records & stats
  const loadSellerDiscounts = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await fetch(`/api/seller/${currentUser.id}/discounts`);
      const data = await res.json();
      if (data.success) {
        setTotalDiscountsCount(data.totalDiscountsCount || 0);
        setTotalDiscountAmount(data.totalDiscountAmount || 0);
        setRecentDiscounts(data.discounts || []);
      }
    } catch (e) {
      console.warn('Failed to load seller discounts:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSellerDiscounts();
      // Generate a default suggested invoice number
      const randInv = Math.floor(1000 + Math.random() * 9000);
      setInvoiceNo(`INV-${new Date().getFullYear()}-${randInv}`);
    } else {
      stopCamera();
    }
  }, [isOpen, currentUser]);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestAnimationFrame(tickScan);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera permission denied or camera not found. Please enter the coupon code manually or upload a QR image.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsCameraActive(false);
  };

  const parseScannedData = (rawText: string) => {
    try {
      const parsed = JSON.parse(rawText);
      if (parsed && typeof parsed === 'object') {
        if (parsed.couponCode) setCouponCode(parsed.couponCode);
        if (parsed.buyerName) setBuyerName(parsed.buyerName);
        if (parsed.buyerPhone) setBuyerPhone(parsed.buyerPhone);
        if (parsed.buyerId) setBuyerId(parsed.buyerId);
        if (parsed.itemTitle) setItemDescription(parsed.itemTitle);
        toast.success(`🎉 QR Code Scanned! Customer: ${parsed.buyerName || 'Buyer'}`);
        stopCamera();
        setActiveTab('manual');
        return;
      }
    } catch (e) {
      // If raw plain text coupon code
      setCouponCode(rawText.trim());
      toast.success(`🎉 Scanned Code: ${rawText.trim()}`);
      stopCamera();
      setActiveTab('manual');
    }
  };

  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          parseScannedData(code.data);
          return;
        }
      }
    }
    if (isCameraActive) {
      animFrameRef.current = requestAnimationFrame(tickScan);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            parseScannedData(code.data);
          } else {
            toast.error('No QR code detected in this image. Please try another image or enter manually.');
          }
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNo.trim()) {
      return toast.error('Please enter the Invoice Number');
    }
    if (!discountAmount || Number(discountAmount) <= 0) {
      return toast.error('Please enter the total discount amount given');
    }

    setLoading(true);
    const tid = toast.loading('Saving discount to Vyapar Bridge...');

    try {
      const payload = {
        sellerId: currentUser?.id,
        sellerName: currentUser?.name || currentUser?.username || 'Seller',
        buyerId: buyerId || 'buyer_customer',
        buyerName: buyerName || 'Customer [🛒 BUYER]',
        buyerPhone: buyerPhone || '',
        couponCode: couponCode || `VB-AUTO-${Date.now().toString(36).toUpperCase()}`,
        invoiceNo: invoiceNo.trim(),
        itemDescription: itemDescription || 'Tiles / Sanitaryware',
        quantity: quantity || '1',
        discountAmount: Number(discountAmount),
        notes
      };

      const res = await fetch('/api/seller/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        try { playBubblePopSound(); } catch (err) {}
        const newCount = data.totalDiscountsCount || totalDiscountsCount + 1;
        setTotalDiscountsCount(newCount);
        setTotalDiscountAmount(data.totalDiscountAmount || totalDiscountAmount + Number(discountAmount));
        
        if (data.discount) {
          setRecentDiscounts(prev => [data.discount, ...prev]);
        }

        if (onDiscountSaved) {
          onDiscountSaved(data.discount, newCount);
        }

        toast.success(`🎉 Saved to Vyapar Bridge! Total Discounts: ${newCount} / 1000`, { id: tid });

        // Reset form for next customer
        setCouponCode('');
        setBuyerName('');
        setBuyerPhone('');
        setDiscountAmount('');
        setItemDescription('');
        setNotes('');
        const nextInv = Math.floor(1000 + Math.random() * 9000);
        setInvoiceNo(`INV-${new Date().getFullYear()}-${nextInv}`);

        // Switch to history or keep ready
        setActiveTab('history');
      } else {
        toast.error(data.error || 'Failed to save discount record', { id: tid });
      }
    } catch (e: any) {
      toast.error('Network error saving discount', { id: tid });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((totalDiscountsCount / 1000) * 100));

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] text-slate-900 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-400/30">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  Seller Discount Scanner & Milestone
                </h3>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                  [🏢 SELLER CONSOLE]
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Scan customer coupon QR or record invoice discounts to reach your 1-Year Free Subscription
              </p>
            </div>
          </div>

          <button 
            onClick={() => { stopCamera(); onClose(); }} 
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Milestone Progress Banner (1000 Discounts -> ₹1188 1-Year Subscription) */}
        <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border-b border-amber-500/30 p-4 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span className="text-xs font-black uppercase text-amber-900 dark:text-amber-300 tracking-wide block">
                  1-Year Free Pro Subscription Milestone (₹1188 Plan)
                </span>
                <span className="text-[11px] text-slate-600 dark:text-zinc-400">
                  Target: Complete 1000 customer discounts to unlock instant activation by Admin
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-black text-sm text-amber-600 dark:text-amber-400">
                {totalDiscountsCount} / 1000
              </span>
              <span className="text-[10px] block font-bold text-slate-500">
                {progressPercent}% Achieved
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden border border-amber-500/20">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(4, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-slate-200 dark:border-zinc-800 bg-slate-100/60 dark:bg-zinc-900/60 px-4 pt-2 gap-2">
          <button
            onClick={() => { setActiveTab('scan'); startCamera(); }}
            className={`px-4 py-2 rounded-t-xl font-bold text-xs transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'scan'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-800'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera Scanner</span>
          </button>

          <button
            onClick={() => { stopCamera(); setActiveTab('manual'); }}
            className={`px-4 py-2 rounded-t-xl font-bold text-xs transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'manual'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-800'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Invoice & Discount Form</span>
          </button>

          <button
            onClick={() => { stopCamera(); setActiveTab('history'); }}
            className={`px-4 py-2 rounded-t-xl font-bold text-xs transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-800'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History ({recentDiscounts.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 scrollbar-thin">
          
          {/* TAB 1: CAMERA SCANNER */}
          {activeTab === 'scan' && (
            <div className="space-y-4 text-center">
              <div className="relative w-full max-w-sm mx-auto aspect-square bg-slate-950 rounded-3xl overflow-hidden border-4 border-blue-500/40 shadow-xl flex items-center justify-center">
                {isCameraActive ? (
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover"
                    autoPlay 
                    muted 
                    playsInline 
                  />
                ) : (
                  <div className="p-6 text-center space-y-3">
                    <Camera className="w-12 h-12 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400">
                      {cameraError || 'Camera is currently paused.'}
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md cursor-pointer hover:bg-blue-700"
                    >
                      Start Camera Scanner
                    </button>
                  </div>
                )}

                {/* Laser scan animation overlay */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-blue-400/60 m-8 rounded-2xl flex items-center justify-center">
                    <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-bounce" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span>Upload QR Image / Screenshot</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => { stopCamera(); setActiveTab('manual'); }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Enter Manually</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                Point your camera at the customer's <strong>Vyapar Bridge Discount Coupon QR code</strong> to automatically fill in details.
              </p>
            </div>
          )}

          {/* TAB 2: INVOICE & DISCOUNT FORM */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSubmitDiscount} className="space-y-4">
              <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex items-center gap-2 text-xs text-blue-900 dark:text-blue-200">
                <Receipt className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Fill in the sale details and discount provided to link this transaction to your 1000-discount milestone.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Coupon Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Coupon Code (कूपन कोड - Optional)
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="e.g. VB-DSC-8891-XK9"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Invoice Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                    <span>Invoice Number (इनवॉइस नंबर) <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-slate-400">Required</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNo}
                    onChange={e => setInvoiceNo(e.target.value)}
                    placeholder="e.g. INV-2026-9041"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Buyer / Customer Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Buyer Name & Tag (ग्राहक का नाम)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={buyerName}
                      onChange={e => setBuyerName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar [🛒 BUYER]"
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                      [🛒 BUYER]
                    </span>
                  </div>
                </div>

                {/* Buyer Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Buyer Mobile (ग्राहक फोन नंबर)
                  </label>
                  <input
                    type="text"
                    value={buyerPhone}
                    onChange={e => setBuyerPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Item Sold Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Item Sold (बेचा गया सामान)
                  </label>
                  <input
                    type="text"
                    value={itemDescription}
                    onChange={e => setItemDescription(e.target.value)}
                    placeholder="e.g. 600x1200mm Vitrified Tiles (GVT/PGVT)"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Quantity Sold */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Quantity Sold (मात्रा / बॉक्स / एरिया)
                  </label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="e.g. 50 Boxes / 1200 Sq.Ft"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Total Discount Given (₹) */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center justify-between">
                  <span>Total Discount Given (कुल दिया गया डिस्काउंट - ₹) <span className="text-red-500">*</span></span>
                  <span className="text-[10px] font-bold text-amber-700">₹ INR</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-amber-600">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountAmount}
                    onChange={e => setDiscountAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-white dark:bg-zinc-900 border border-amber-400 rounded-xl pl-8 pr-3 py-2.5 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[10px] text-slate-600 dark:text-zinc-400">
                  This discount amount will be saved to your seller profile and reflected in the Admin Console.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving to Vyapar Bridge...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save to Your Discount on Vyapar Bridge</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: DISCOUNT REDEMPTIONS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Recent Saved Invoices & Discounts
                </span>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                  Total Saved: ₹{totalDiscountAmount.toLocaleString()}
                </span>
              </div>

              {recentDiscounts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  No discount records submitted yet. Use the Scanner or Form above to record discounts.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-zinc-950/40">
                  {recentDiscounts.map((d, i) => (
                    <div key={d.id || i} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 dark:text-zinc-100">
                            #{d.invoiceNo || 'INV'}
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60">
                            {d.buyerName || 'Customer'} [🛒 BUYER]
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          {d.itemDescription || 'Material'} • Qty: {d.quantity || '1'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          -₹{d.discountAmount || 0}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
