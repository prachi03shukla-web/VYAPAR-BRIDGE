import React, { useState } from 'react';
import { ImageLightboxModal } from './ImageLightboxModal';

interface MultiImageCollageProps {
  images: string[];
  title?: string;
  onDoubleClick?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
}

export const MultiImageCollage: React.FC<MultiImageCollageProps> = ({
  images,
  title,
  onDoubleClick,
  onTouchStart,
  onTouchEnd
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  // Single Image Layout
  if (images.length === 1) {
    return (
      <>
        <div 
          className="relative w-full bg-black min-h-[300px] max-h-[80vh] flex items-center justify-center overflow-hidden cursor-pointer select-none"
          onClick={() => setSelectedPhotoIndex(0)}
          onDoubleClick={onDoubleClick}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <img 
            src={images[0]} 
            alt={title || "Post image"} 
            className="w-full h-full max-h-[80vh] object-contain bg-zinc-950 transition-transform duration-300 hover:scale-[1.008]" 
            loading="lazy"
          />
        </div>

        <ImageLightboxModal
          isOpen={selectedPhotoIndex !== null}
          images={images}
          initialIndex={selectedPhotoIndex || 0}
          onClose={() => setSelectedPhotoIndex(null)}
          title={title}
        />
      </>
    );
  }

  // 2 Images Layout: 50 / 50 Split
  if (images.length === 2) {
    return (
      <>
        <div 
          className="grid grid-cols-2 gap-1 w-full bg-black min-h-[280px] max-h-[500px] overflow-hidden cursor-pointer"
          onDoubleClick={onDoubleClick}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className="relative w-full h-[280px] sm:h-[360px] overflow-hidden bg-zinc-900 group"
              onClick={() => setSelectedPhotoIndex(idx)}
            >
              <img 
                src={img} 
                alt={`Photo ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <ImageLightboxModal
          isOpen={selectedPhotoIndex !== null}
          images={images}
          initialIndex={selectedPhotoIndex || 0}
          onClose={() => setSelectedPhotoIndex(null)}
          title={title}
        />
      </>
    );
  }

  // 3 Images Layout: 1 Large Top + 2 Split Bottom (Facebook standard)
  if (images.length === 3) {
    return (
      <>
        <div 
          className="flex flex-col gap-1 w-full bg-black overflow-hidden cursor-pointer"
          onDoubleClick={onDoubleClick}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Top Large Photo */}
          <div 
            className="relative w-full h-[220px] sm:h-[300px] overflow-hidden bg-zinc-900 group"
            onClick={() => setSelectedPhotoIndex(0)}
          >
            <img 
              src={images[0]} 
              alt="Photo 1" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              loading="lazy"
            />
          </div>

          {/* Bottom 2 Photos */}
          <div className="grid grid-cols-2 gap-1 w-full">
            {images.slice(1, 3).map((img, idx) => (
              <div 
                key={idx + 1} 
                className="relative w-full h-[140px] sm:h-[180px] overflow-hidden bg-zinc-900 group"
                onClick={() => setSelectedPhotoIndex(idx + 1)}
              >
                <img 
                  src={img} 
                  alt={`Photo ${idx + 2}`} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        <ImageLightboxModal
          isOpen={selectedPhotoIndex !== null}
          images={images}
          initialIndex={selectedPhotoIndex || 0}
          onClose={() => setSelectedPhotoIndex(null)}
          title={title}
        />
      </>
    );
  }

  // 4 Images Layout: 2x2 Grid (Equal 4 squares)
  if (images.length === 4) {
    return (
      <>
        <div 
          className="grid grid-cols-2 gap-1 w-full bg-black overflow-hidden cursor-pointer"
          onDoubleClick={onDoubleClick}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className="relative w-full h-[150px] sm:h-[200px] overflow-hidden bg-zinc-900 group"
              onClick={() => setSelectedPhotoIndex(idx)}
            >
              <img 
                src={img} 
                alt={`Photo ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <ImageLightboxModal
          isOpen={selectedPhotoIndex !== null}
          images={images}
          initialIndex={selectedPhotoIndex || 0}
          onClose={() => setSelectedPhotoIndex(null)}
          title={title}
        />
      </>
    );
  }

  // 5+ Images Layout (Facebook Style: 2 Top + 3 Bottom with "+N" Overlay)
  const remainingCount = images.length - 5;

  return (
    <>
      <div 
        className="flex flex-col gap-1 w-full bg-black overflow-hidden cursor-pointer"
        onDoubleClick={onDoubleClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Top 2 Photos (50/50) */}
        <div className="grid grid-cols-2 gap-1 w-full">
          {images.slice(0, 2).map((img, idx) => (
            <div 
              key={idx} 
              className="relative w-full h-[180px] sm:h-[240px] overflow-hidden bg-zinc-900 group"
              onClick={() => setSelectedPhotoIndex(idx)}
            >
              <img 
                src={img} 
                alt={`Photo ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Bottom 3 Photos (with +N on last) */}
        <div className="grid grid-cols-3 gap-1 w-full">
          {images.slice(2, 5).map((img, idx) => {
            const realIndex = idx + 2;
            const isLastVisible = idx === 2 && remainingCount > 0;

            return (
              <div 
                key={realIndex} 
                className="relative w-full h-[120px] sm:h-[160px] overflow-hidden bg-zinc-900 group"
                onClick={() => setSelectedPhotoIndex(realIndex)}
              >
                <img 
                  src={img} 
                  alt={`Photo ${realIndex + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  loading="lazy"
                />

                {isLastVisible && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center text-white transition-colors group-hover:bg-black/60">
                    <span className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md">
                      +{remainingCount + 1}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ImageLightboxModal
        isOpen={selectedPhotoIndex !== null}
        images={images}
        initialIndex={selectedPhotoIndex || 0}
        onClose={() => setSelectedPhotoIndex(null)}
        title={title}
      />
    </>
  );
};
