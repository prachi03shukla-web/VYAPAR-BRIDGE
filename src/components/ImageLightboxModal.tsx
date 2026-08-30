import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  title?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
  title
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
      setScale(1);
    }
  }, [isOpen, initialIndex, images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleNext = () => {
    setScale(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setScale(1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `vyapar-image-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div 
        className="w-full px-4 py-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20">
            {currentIndex + 1} / {images.length}
          </span>
          {title && (
            <span className="text-xs font-semibold text-zinc-300 truncate max-w-[200px] sm:max-w-md">
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            onClick={() => setScale((s) => Math.min(s + 0.25, 3))}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(s - 0.25, 1))}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Download Image"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Display */}
      <div 
        className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage}
          alt={`Photo ${currentIndex + 1}`}
          style={{ transform: `scale(${scale})` }}
          className="max-h-[82vh] max-w-[94vw] object-contain rounded-lg shadow-2xl transition-transform duration-200"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer z-40"
              title="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer z-40"
              title="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Bar at Bottom */}
      {images.length > 1 && (
        <div 
          className="w-full px-4 py-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent flex items-center justify-center gap-2 overflow-x-auto hide-scrollbar z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setScale(1);
                setCurrentIndex(idx);
              }}
              className={`relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                currentIndex === idx 
                  ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400' 
                  : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
