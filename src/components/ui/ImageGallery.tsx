// ─────────────────────────────────────────────────────────────
// IMAGE GALLERY COMPONENT
// ─────────────────────────────────────────────────────────────
// Product image gallery with zoom and thumbnail navigation
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { cn } from "../../lib/utils/cn";

interface Image {
  id: string;
  url: string;
  alt: string;
}

interface ImageGalleryProps {
  images: Image[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <div className={cn("aspect-square bg-gray-200 rounded-lg", className)}>
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No images available
        </div>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image */}
      <div
        className="relative aspect-square overflow-hidden rounded-lg cursor-zoom-in"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <img
          src={selectedImage.url}
          alt={selectedImage.alt}
          className={cn(
            "w-full h-full object-cover transition-transform duration-300",
            isZoomed && "scale-150"
          )}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                selectedIndex === index
                  ? "border-blue-600"
                  : "border-transparent hover:border-gray-300"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
