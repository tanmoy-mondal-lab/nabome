import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils/cn";
import { img } from "../../lib/seo";

const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".avi"];
function isVideo(url: string) { return VIDEO_EXTS.some((ext) => url.toLowerCase().includes(ext)) || url.includes("video"); }

interface ImageItem { url: string; altText?: string; type?: "image" | "video"; }

interface ImageGalleryProps {
  images: ImageItem[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const activeImage = images[activeIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !zoomed) return;
    const rect = containerRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const goNext = () => setActiveIndex((i) => Math.min(images.length - 1, i + 1));
  const goPrev = () => setActiveIndex((i) => Math.max(0, i - 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isVideo(activeImage.url)) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) goPrev();
      else goNext();
    }
  };

  if (!images.length) {
    return <div className={cn("aspect-[3/4] bg-neutral-100 flex items-center justify-center text-neutral-400 text-body-sm", className)}>No image</div>;
  }

  return (
    <div className={cn("grid grid-cols-[80px_1fr] max-md:grid-cols-1 gap-4", className)}>
      <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[600px] order-last md:order-first">
        {images.map((image, i) => (
          <button
            key={i}
            onClick={() => { setActiveIndex(i); setZoomed(false); }}
            className={cn(
              "w-16 md:w-20 h-16 md:h-20 shrink-0 bg-neutral-50 overflow-hidden border-2 transition-all duration-300 ease-luxe-out",
              i === activeIndex ? "border-brand-500" : "border-transparent hover:border-neutral-300"
            )}
          >
            <img src={img(image.url, { width: 80 })} alt={image.altText ?? ""} loading="lazy" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative aspect-[3/4] bg-neutral-50 overflow-hidden group"
        onMouseEnter={() => !isVideo(activeImage.url) && setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={isVideo(activeImage.url) ? undefined : handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          {isVideo(activeImage.url) ? (
            <video key={activeIndex} src={activeImage.url} controls autoPlay muted loop className="w-full h-full object-cover" />
          ) : (
            <motion.img
              key={activeIndex}
              src={img(activeImage.url, { width: 800 })}
              alt={activeImage.altText ?? ""}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full object-cover"
              style={zoomed ? { transform: "scale(2)", transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
            />
          )}
        </AnimatePresence>

        <button onClick={goPrev} disabled={activeIndex === 0} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-0 hover:bg-white hover:shadow-subtle max-md:opacity-100 max-md:disabled:opacity-30 max-md:w-8 max-md:h-8">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={goNext} disabled={activeIndex === images.length - 1} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-0 hover:bg-white hover:shadow-subtle max-md:opacity-100 max-md:disabled:opacity-30 max-md:w-8 max-md:h-8">
          <ChevronRight className="w-4 h-4" />
        </button>

        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-caption tracking-fashion text-neutral-600 shadow-subtle">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 md:hidden flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "bg-white w-4" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
