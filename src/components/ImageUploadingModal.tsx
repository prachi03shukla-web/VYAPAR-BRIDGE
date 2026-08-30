import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Upload, Trash2, Loader2, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { createImagePostUrls } from '../services/mediaUrlService';

interface ImageUploadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (urls: string[]) => void;
  userId: string;
}

export function ImageUploadingModal({ isOpen, onClose, onUploadSuccess, userId }: ImageUploadingModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  // Status states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'idle' | 'optimizing' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFiles([]);
    previews.forEach(p => URL.revokeObjectURL(p));
    setPreviews([]);
    setIsUploading(false);
    setUploadStep('idle');
    setUploadProgress(0);
    setErrorMessage('');
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter valid image files only
    const imageFiles = files.filter(f => f.type.startsWith('image/') || f.name.match(/\.(jpe?g|png|webp|gif)$/i));
    if (imageFiles.length !== files.length) {
      toast.error('⚠️ Some files were skipped. Only standard image files are supported.');
    }

    if (imageFiles.length === 0) return;

    // Check total count limit (Max 10 images)
    const newFilesList = [...selectedFiles, ...imageFiles].slice(0, 10);
    if (selectedFiles.length + imageFiles.length > 10) {
      toast.warning('🔒 Up to 10 product images can be uploaded per post. Excess files were truncated.');
    }

    setSelectedFiles(newFilesList);

    // Create blobs for local preview
    const newPreviews = imageFiles.map(f => URL.createObjectURL(f));
    setPreviews([...previews, ...newPreviews].slice(0, 10));
  };

  const removeImage = (idx: number) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(idx, 1);
    setSelectedFiles(updatedFiles);

    const updatedPreviews = [...previews];
    URL.revokeObjectURL(updatedPreviews[idx]);
    updatedPreviews.splice(idx, 1);
    setPreviews(updatedPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStep('uploading');
    setUploadProgress(10);

    try {
      const uploadedUrls = await createImagePostUrls(selectedFiles, userId, (progressPercent) => {
        setUploadProgress(progressPercent);
      });

      setUploadStep('success');
      setUploadProgress(100);
      toast.success(`🎉 Successfully uploaded ${uploadedUrls.length} image(s)!`);

      setTimeout(() => {
        onUploadSuccess(uploadedUrls);
        resetState();
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error('Image uploads failed:', err);
      setUploadStep('error');
      setErrorMessage(err.message || 'Firebase Storage quota exceeded or permission error.');
      toast.error('❌ Failed to upload images. Please check your storage permission.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="image-upload-modal" className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
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
          className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Upload Showcase Photos</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Share catalog models & product finishes</p>
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
            {selectedFiles.length === 0 ? (
              /* Drop Area */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50 dark:bg-zinc-900/50 hover:bg-amber-50/10"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFilesSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-zinc-200 mb-1 text-sm">Select Product Images</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mb-4">
                  Drag & drop images, or browse files. Supports up to 10 images (JPEG, PNG, WEBP, GIF)
                </p>
                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-amber-500/20 transition-all">
                  Browse Images
                </button>
              </div>
            ) : (
              /* Previews & Upload controls */
              <div className="space-y-4">
                {/* Images grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[280px] overflow-y-auto p-1">
                  {previews.map((preview, index) => (
                    <div
                      key={preview}
                      className="aspect-square relative rounded-xl overflow-hidden group border border-slate-200 dark:border-zinc-800 shadow"
                    >
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      {!isUploading && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="absolute bottom-1 left-1.5 px-1.5 py-0.5 bg-black/50 text-[9px] text-white font-bold rounded">
                        #{index + 1}
                      </div>
                    </div>
                  ))}

                  {/* Add more grid block */}
                  {selectedFiles.length < 10 && !isUploading && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border border-dashed border-slate-300 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-amber-500 transition bg-slate-50 dark:bg-zinc-950/20"
                    >
                      <Plus className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold">Add More</span>
                    </button>
                  )}
                </div>

                <div className="text-xs flex justify-between text-slate-500 dark:text-zinc-400 font-medium bg-slate-50 dark:bg-zinc-900/40 p-2 rounded-lg">
                  <span>Total Selected: {selectedFiles.length} of 10</span>
                  <span>Images will be auto-optimized before upload</span>
                </div>

                {/* Progress bar state */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-zinc-400">
                        {uploadStep === 'optimizing'
                          ? 'Optimizing and compressing images...'
                          : `Uploading product images (${uploadProgress}%)`}
                      </span>
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

                {uploadStep === 'success' && (
                  <div className="flex flex-col items-center justify-center p-4 text-center bg-green-500/10 dark:bg-green-500/20 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl gap-2">
                    <CheckCircle2 className="w-8 h-8 animate-bounce" />
                    <span className="text-sm font-bold">Showcase Upload Verified!</span>
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

                {/* Action buttons */}
                {!isUploading && uploadStep !== 'success' && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetState}
                      className="flex-1 py-2.5 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                    >
                      Clear Selection
                    </button>
                    <button
                      type="button"
                      onClick={handleUpload}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload to Showcase
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
