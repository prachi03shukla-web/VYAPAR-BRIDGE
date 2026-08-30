import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Upload, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPdfCatalogUrl } from '../services/mediaUrlService';
import { extractPdfFirstPageThumbnail, generateFallbackPdfCover } from '../utils/pdfThumbnail';

interface PdfUploadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (payload: { mediaUrl: string; thumbnailUrl: string }) => void;
  userId: string;
}

export function PdfUploadingModal({ isOpen, onClose, onUploadSuccess, userId }: PdfUploadingModalProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  // Status states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState<'idle' | 'generating_thumb' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setPdfFile(null);
    setThumbnailPreview('');
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStep('idle');
    setErrorMessage('');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      toast.error('❌ Please select a valid PDF Catalog file.');
      return;
    }

    // Limit PDF size to 50MB
    if (selected.size > 50 * 1024 * 1024) {
      toast.error('❌ PDF is too large. Maximum supported size is 50MB.');
      return;
    }

    setPdfFile(selected);
    setUploadStep('generating_thumb');

    try {
      // Auto-extract thumbnail cover page from PDF
      const pdfThumbResult = await extractPdfFirstPageThumbnail(selected);
      if (pdfThumbResult.thumbnailUrl) {
        setThumbnailPreview(pdfThumbResult.thumbnailUrl);
      } else {
        // Generate fallback cover
        const cover = generateFallbackPdfCover(selected.name.replace('.pdf', ''), 'B2B Catalog');
        setThumbnailPreview(cover);
      }
    } catch (err) {
      console.warn('PDF thumbnail extractor notice:', err);
      const cover = generateFallbackPdfCover(selected.name.replace('.pdf', ''), 'B2B Catalog');
      setThumbnailPreview(cover);
    } finally {
      setUploadStep('idle');
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) return;

    setIsUploading(true);
    setUploadStep('uploading');
    setUploadProgress(10);

    try {
      const result = await createPdfCatalogUrl(pdfFile, userId, (progressPercent) => {
        setUploadProgress(progressPercent);
      });

      setUploadStep('success');
      toast.success('🎉 Catalog PDF uploaded successfully!');

      setTimeout(() => {
        onUploadSuccess({
          mediaUrl: result.mediaUrl,
          thumbnailUrl: result.thumbnailUrl || thumbnailPreview || generateFallbackPdfCover(pdfFile.name.replace('.pdf', ''), 'Vyapar Bridge Catalog')
        });
        resetState();
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error('PDF upload error:', err);
      setUploadStep('error');
      setErrorMessage(err.message || 'Firebase Storage write failed.');
      toast.error('❌ PDF upload failed. Please verify your connection.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="pdf-upload-modal" className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isUploading) {
              resetState();
              onClose();
            }
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
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Upload PDF Catalog</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Share product pricing sheets & brochures</p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={() => {
                  resetState();
                  onClose();
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6">
            {!pdfFile ? (
              /* Drop Area */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50 dark:bg-zinc-900/50 hover:bg-amber-50/10"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="application/pdf"
                  className="hidden"
                />
                <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-zinc-200 mb-1 text-sm">Select B2B Catalog PDF</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mb-4">
                  Drag & drop your PDF, or browse files. Supports Catalog brochures up to 50MB.
                </p>
                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-amber-500/20 transition-all">
                  Browse Catalog
                </button>
              </div>
            ) : (
              /* PDF Selected info */
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-2xl border border-slate-150 dark:border-zinc-800">
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Catalog Cover"
                      className="w-16 h-20 object-cover rounded-xl border border-slate-250 dark:border-zinc-700 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block mb-0.5">
                      PDF Document Selected
                    </span>
                    <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs truncate">
                      {pdfFile.name}
                    </h4>
                    <p className="text-slate-400 dark:text-zinc-500 text-[10px]">
                      Size: {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {/* Progress bar or State info */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-zinc-400">Uploading PDF Catalog to CDN...</span>
                      <span className="text-amber-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadStep === 'generating_thumb' && (
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Auto-extracting PDF first page thumbnail...</span>
                  </div>
                )}

                {uploadStep === 'success' && (
                  <div className="flex flex-col items-center justify-center p-4 text-center bg-green-500/10 dark:bg-green-500/20 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl gap-2">
                    <CheckCircle2 className="w-8 h-8 animate-bounce" />
                    <span className="text-sm font-bold">Catalog Link Verified & Connected!</span>
                  </div>
                )}

                {uploadStep === 'error' && (
                  <div className="flex flex-col p-4 bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl gap-2 text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Upload Issue</span>
                    </div>
                    <p>{errorMessage}</p>
                  </div>
                )}

                {/* Controls */}
                {!isUploading && uploadStep !== 'success' && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetState}
                      className="flex-1 py-2.5 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                    >
                      Choose Different PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleUpload}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Catalog
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
