import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Globe, Play, CheckCircle2, AlertTriangle, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { resolveExternalPostLink } from '../services/mediaUrlService';

interface LinkUploadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (payload: { url: string; title: string; provider: string }) => void;
}

export function LinkUploadingModal({ isOpen, onClose, onUploadSuccess }: LinkUploadingModalProps) {
  const [inputUrl, setInputUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [detectedProvider, setDetectedProvider] = useState<'youtube' | 'vimeo' | 'website' | null>(null);

  const resetState = () => {
    setInputUrl('');
    setCustomTitle('');
    setIsValidating(false);
    setDetectedProvider(null);
  };

  const validateUrlStructure = (url: string) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      return parsed.href;
    } catch (e) {
      return null;
    }
  };

  const handleVerifyLink = async () => {
    const formatted = validateUrlStructure(inputUrl);
    if (!formatted) {
      toast.error('❌ Please enter a valid URL (e.g., https://example.com or youtube.com/...)');
      return;
    }

    setIsValidating(true);
    
    try {
      const result = await resolveExternalPostLink(formatted);
      setDetectedProvider(result.provider as any);
      if (result.title) {
        setCustomTitle(result.title);
      }
      toast.success(`🔗 Verified Link successfully! Connected as ${result.provider === 'website' ? 'External Web Link' : result.provider.toUpperCase() + ' Video Stream'}.`);
    } catch (err) {
      setDetectedProvider('website');
      toast.error('⚠️ Could not resolve metadata, fallback to standard link.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = () => {
    const formatted = validateUrlStructure(inputUrl);
    if (!formatted) {
      toast.error('❌ Invalid URL structure.');
      return;
    }

    const providerStr = detectedProvider || 'website';
    const finalTitle = customTitle.trim() || (providerStr === 'website' ? 'External Business Portfolio' : 'Product Showcase Video');

    onUploadSuccess({
      url: formatted,
      title: finalTitle,
      provider: providerStr
    });

    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="link-upload-modal" className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            resetState();
            onClose();
          }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Attach External Link</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Direct buyers to catalogs or videos</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetState();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Paste Destination URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      if (detectedProvider) setDetectedProvider(null);
                    }}
                    placeholder="e.g., youtube.com/watch?v=... or showroom-catalog.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyLink}
                  disabled={!inputUrl || isValidating}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white dark:hover:text-white text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl transition disabled:opacity-50"
                >
                  {isValidating ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>

            {/* If Verified, show customized display details */}
            {detectedProvider && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Detected tag */}
                <div className="flex items-center gap-3 p-3 bg-green-500/10 dark:bg-green-500/20 border border-green-500/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-green-700 dark:text-green-400 block">
                      Link Verified successfully!
                    </span>
                    <p className="text-slate-500 dark:text-zinc-400 text-[10px]">
                      Type: {detectedProvider === 'website' ? 'External Web Portfolio' : `${detectedProvider.toUpperCase()} Embeddable Player`}
                    </p>
                  </div>
                </div>

                {/* Optional Custom display label */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Link Display Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g., Watch our Factory Tour Video or View Price Catalog"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>

                {/* Preview Card */}
                <div className="p-3 bg-slate-50 dark:bg-zinc-950/40 rounded-xl border border-slate-150 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    {detectedProvider === 'website' ? (
                      <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <Play className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div className="truncate">
                      <span className="font-bold text-slate-700 dark:text-zinc-200 block truncate">
                        {customTitle.trim() || (detectedProvider === 'website' ? 'External Business Portfolio' : 'B2B Video Showcase')}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {inputUrl}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  Confirm and Attach
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
