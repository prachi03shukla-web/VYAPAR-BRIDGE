import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  Trash2,
  Tag,
  QrCode,
  Share2,
  Copy,
  Building2,
  ExternalLink,
  Info,
  CheckCircle2,
  Sparkles,
  Plus,
  Minus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { getCartItems, removeFromCart, clearCart, addToCart, CartItem } from '../utils/cartManager';

interface CustomerCartCouponsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onNavigateToPost?: (postId: string) => void;
}

export const CustomerCartCouponsModal: React.FC<CustomerCartCouponsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigateToPost
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getCartItems());
  const [selectedItemForCoupon, setSelectedItemForCoupon] = useState<CartItem | null>(null);
  const [activeTab, setActiveTab] = useState<'cart' | 'coupon'>('cart');
  const [generatedCouponCode, setGeneratedCouponCode] = useState<string>('');

  useEffect(() => {
    const handleCartSync = () => {
      const items = getCartItems();
      setCartItems(items);
      if (items.length > 0 && !selectedItemForCoupon) {
        setSelectedItemForCoupon(items[0]);
      }
    };

    window.addEventListener('cart_updated', handleCartSync);
    return () => window.removeEventListener('cart_updated', handleCartSync);
  }, [selectedItemForCoupon]);

  useEffect(() => {
    if (isOpen) {
      const items = getCartItems();
      setCartItems(items);
      if (items.length > 0) {
        setSelectedItemForCoupon(items[0]);
      }
      // Generate unique persistent coupon code for this buyer session
      const buyerSuffix = (currentUser?.id || 'BUYER').toString().slice(-4).toUpperCase();
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      setGeneratedCouponCode(`VB-DSC-${buyerSuffix}-${randomStr}`);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleUpdateQty = (item: CartItem, delta: number) => {
    const currentQty = item.quantity || 1;
    const nextQty = Math.max(1, currentQty + delta);
    addToCart({ id: item.postId, ...item }, { quantity: nextQty });
  };

  const handleRemove = (postId: string) => {
    const updated = removeFromCart(postId);
    setCartItems(updated);
    if (selectedItemForCoupon?.postId === postId) {
      setSelectedItemForCoupon(updated[0] || null);
    }
    toast.success('Item removed from Cart');
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      setCartItems([]);
      setSelectedItemForCoupon(null);
      toast.success('Cart cleared');
    }
  };

  const couponPayload = JSON.stringify({
    type: 'VYAPAR_BRIDGE_B2B_COUPON',
    couponCode: generatedCouponCode,
    buyerId: currentUser?.id || 'guest_buyer',
    buyerName: currentUser?.name || currentUser?.username || 'Valued Buyer',
    buyerPhone: currentUser?.phone || '',
    buyerRole: 'BUYER',
    itemTitle: selectedItemForCoupon?.title || 'B2B Catalog Items',
    sellerId: selectedItemForCoupon?.authorId || '',
    sellerName: selectedItemForCoupon?.authorName || '',
    generatedAt: Date.now()
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCouponCode);
    toast.success(`📋 Coupon Code copied: ${generatedCouponCode}`);
  };

  const handleShareCouponWhatsApp = () => {
    const buyerName = currentUser?.name || currentUser?.username || 'Customer';
    const sellerName = selectedItemForCoupon?.authorName || 'Seller';
    const itemTitle = selectedItemForCoupon?.title || 'Selected Products';

    const message = `Namaste ${sellerName},\n\nMain Vyapar Bridge se aapka product "${itemTitle}" lene ke liye interested hoon.\n\n🎟️ My B2B Discount Coupon Code: *${generatedCouponCode}*\n👤 Buyer: *${buyerName}* [🛒 BUYER]\n\nKripya billing ke time is coupon ko scan karke discount apply karein.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-slate-900 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20 shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  My Cart & B2B Discount Coupons
                </h3>
                <span className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-black text-[11px] px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/60">
                  {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Show your coupon QR code to sellers to claim your exclusive Vyapar Bridge discount
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center border-b border-slate-200 dark:border-zinc-800 bg-slate-100/50 dark:bg-zinc-900/50 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('cart')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'cart'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-800'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart Items ({cartItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupon')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'coupon'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-800'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-500" />
            <span>QR Discount Coupon (दुकानदार को दिखाएं)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 scrollbar-thin">
          {activeTab === 'cart' && (
            <div className="space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 mx-auto flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-base text-slate-800 dark:text-zinc-200">Your Cart is currently empty</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Browse posts, tiles, sanitaryware catalogues on the Home feed and click <strong>"🛒 Cart / Inquire"</strong> to add items here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      Selected Products & Catalogues
                    </span>
                    <button
                      onClick={handleClearAll}
                      className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-zinc-950/40">
                    {cartItems.map((item) => (
                      <div key={item.id || item.postId} className="p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-zinc-800 shrink-0 border border-slate-200 dark:border-zinc-700 relative">
                          {item.mediaUrl ? (
                            <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                              {item.mediaType === 'pdf' ? 'PDF' : 'Item'}
                            </div>
                          )}
                          {item.mediaType === 'pdf' && (
                            <span className="absolute bottom-0.5 right-0.5 bg-red-600 text-white text-[9px] font-black px-1 rounded">
                              PDF
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h4>
                          
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60">
                              <Building2 className="w-2.5 h-2.5" />
                              {item.authorName || 'Seller Partner'} [🏢 SELLER]
                            </span>

                            {(item.minRate || item.maxRate) && (
                              <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                                ₹{item.minRate && item.maxRate ? `${item.minRate} - ${item.maxRate}` : (item.minRate ? `${item.minRate}+` : `Upto ${item.maxRate}`)} /{item.unit || 'Box'}
                              </span>
                            )}
                          </div>

                          {/* Quantity selector */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold">Qty:</span>
                            <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item, -1)}
                                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-black">{item.quantity || 1}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item, 1)}
                                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedItemForCoupon(item);
                              setActiveTab('coupon');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Get Coupon</span>
                          </button>

                          <button
                            onClick={() => handleRemove(item.postId)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon action trigger */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h5 className="font-black text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span>Ready to claim your B2B discount?</span>
                      </h5>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                        Generate your official QR code coupon to show at the seller's counter.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('coupon')}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View & Show QR Coupon</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'coupon' && (
            <div className="space-y-5">
              {/* Stylized B2B Discount Coupon Card */}
              <div className="bg-gradient-to-br from-slate-900 via-zinc-900 to-blue-950 text-white rounded-3xl p-5 sm:p-6 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col items-center text-center relative z-10 space-y-4">
                  {/* Badge & Title */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Vyapar Bridge Verified B2B Trade Coupon</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                      B2B DISCOUNT COUPON
                    </h3>
                    <p className="text-xs text-zinc-300">
                      Show this QR Code at the Seller's Billing Desk to claim your discount
                    </p>
                  </div>

                  {/* QR Code Container */}
                  <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-amber-400 flex flex-col items-center justify-center">
                    <QRCodeSVG
                      value={couponPayload}
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                    <span className="text-[10px] font-black text-slate-800 mt-2 font-mono tracking-wider">
                      SCAN BY SELLER ON VYAPAR BRIDGE
                    </span>
                  </div>

                  {/* Coupon Code Pill */}
                  <div className="w-full max-w-sm bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between gap-2">
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-amber-400">Coupon Code:</span>
                      <div className="font-mono font-black text-base text-white tracking-widest">
                        {generatedCouponCode}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>

                  {/* Buyer & Seller Info Summary */}
                  <div className="grid grid-cols-2 gap-2 w-full max-w-md text-left text-xs bg-white/5 rounded-xl p-3 border border-white/10">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold block">Buyer / Customer:</span>
                      <span className="font-bold text-emerald-400 truncate block">
                        {currentUser?.name || currentUser?.username || 'Customer'} [🛒 BUYER]
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold block">Target Item / Seller:</span>
                      <span className="font-bold text-amber-300 truncate block">
                        {selectedItemForCoupon ? `${selectedItemForCoupon.authorName || 'Seller'}` : 'All Participating Sellers'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleShareCouponWhatsApp}
                  className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Coupon on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition-all border border-slate-200 dark:border-zinc-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Coupon Code</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p>
                  <strong>How it works:</strong> When you purchase goods at the seller's shop or warehouse, the seller will click <strong>"Scanner"</strong> on their Vyapar Bridge profile to scan this QR code, enter your invoice number, and record your discount.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
