import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { ProductImage } from "../types/product";

type Props = {
  images: ProductImage[];
  productName: string;
};

export default function ProductGallery({ images, productName }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);

  const selected = images[selectedIndex] || images[0];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, goNext, goPrev]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showZoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 10000,
    background: "rgba(0,0,0,0.95)", display: "flex",
    alignItems: "center", justifyContent: "center",
  };

  const lightboxBtn: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.1)", border: "none",
    color: "#fff", fontSize: "1.5rem", padding: "16px 20px",
    cursor: "pointer", zIndex: 1, borderRadius: "50%",
    width: 56, height: 56, display: "grid", placeItems: "center",
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          onMouseMove={handleMouseMove}
          onClick={() => openLightbox(selectedIndex)}
          style={{
            position: "relative", width: "100%", aspectRatio: "4/5",
            borderRadius: "var(--radius-xl)", overflow: "hidden",
            background: "var(--surface-strong)", cursor: "zoom-in",
          }}
        >
          <img
            src={selected.url}
            alt={selected.alt || productName}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transform: showZoom ? `scale(2)` : "scale(1)",
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              transition: "transform 0.1s ease-out",
            }}
          />
          <div style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(0,0,0,0.5)", color: "#fff",
            width: 36, height: 36, borderRadius: "50%",
            display: "grid", placeItems: "center",
            backdropFilter: "blur(4px)", pointerEvents: "none",
          }}>
            <ZoomIn size={16} />
          </div>
          <AnimatePresence>
            {images.length > 1 && !showZoom && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
                  display: "flex", gap: 6,
                }}
              >
                {images.map((_, i) => (
                  <div key={i} style={{
                    width: i === selectedIndex ? 24 : 8, height: 8, borderRadius: 4,
                    background: i === selectedIndex ? "var(--gold)" : "rgba(255,255,255,0.4)",
                    transition: "all 0.2s",
                  }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {images.length > 1 && (
          <div style={{ display: "flex", gap: 8, overflow: "auto", paddingBottom: 4 }}>
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => { setSelectedIndex(i); }}
                style={{
                  width: 72, height: 90, flexShrink: 0,
                  borderRadius: "var(--radius)", overflow: "hidden",
                  border: selectedIndex === i ? "2px solid var(--gold)" : "2px solid transparent",
                  cursor: "pointer", padding: 0, background: "var(--surface-strong)",
                  transition: "border-color 0.2s",
                }}
              >
                <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={overlay} onClick={() => setLightboxOpen(false)}
          >
            {images.length > 1 && (
              <>
                <button style={{ ...lightboxBtn, left: 24 }} onClick={(e) => { e.stopPropagation(); goPrev(); }}>
                  <ChevronLeft size={24} />
                </button>
                <button style={{ ...lightboxBtn, right: 24 }} onClick={(e) => { e.stopPropagation(); goNext(); }}>
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "85vw", maxHeight: "85vh", display: "grid", placeItems: "center" }}>
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                src={images[lightboxIndex]?.url || selected.url}
                alt={`${productName} — Image ${lightboxIndex + 1}`}
                style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: 8 }}
              />
            </div>
            <button onClick={() => setLightboxOpen(false)}
              style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", display: "grid", placeItems: "center", zIndex: 1 }}>
              <X size={20} />
            </button>
            <p style={{ position: "absolute", bottom: 24, color: "rgba(255,255,255,0.5)", fontSize: ".85rem" }}>
              {lightboxIndex + 1} / {images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
