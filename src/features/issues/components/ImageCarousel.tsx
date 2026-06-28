import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-bg-surface rounded-xl border border-border flex items-center justify-center overflow-hidden">
        <div className="w-full h-full bg-bg-elevated flex items-center justify-center text-text-tertiary">
          No photo available
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="w-full aspect-[4/3] bg-bg-surface rounded-xl border border-border overflow-hidden relative group">
      <img
        src={images[currentIndex]}
        alt={`Issue photo ${currentIndex + 1} of ${images.length}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />

      {images.length > 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 backdrop-blur-sm transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 backdrop-blur-sm transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-white w-4'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
