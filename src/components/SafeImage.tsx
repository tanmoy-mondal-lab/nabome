import { useState, type ImgHTMLAttributes } from "react";
import { img, imgSet } from "../lib/seo";

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallback?: string;
  useTransform?: boolean;
  transformWidth?: number;
  responsive?: boolean;
  priority?: boolean;
  showSkeleton?: boolean;
}

const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'%3E%3Crect fill='%23f5f5f5' width='300' height='400'/%3E%3Ctext x='150' y='200' text-anchor='middle' dominant-baseline='central' fill='%23ccc' font-size='14' font-family='sans-serif'%3EImage%3C/text%3E%3C/svg%3E";

export function SafeImage({
  src, alt, fallback = FALLBACK, useTransform = true,
  transformWidth, responsive = false, priority = false, showSkeleton = true, className = "", ...props
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Reset error state when src changes (e.g., variant color switch)
  if (src !== currentSrc) {
    setCurrentSrc(src);
    if (failed) setFailed(false);
    if (loaded) setLoaded(false);
  }

  if (!src || failed) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  const loadingAttr = priority ? "eager" : "lazy";
  const fetchPriorityAttr = priority ? "high" : undefined;

  if (responsive && src.includes("res.cloudinary.com")) {
    const result = imgSet(src);
    if ("srcSet" in result) {
      return (
        <>
          {showSkeleton && !loaded && (
            <div className={`absolute inset-0 bg-neutral-100 animate-pulse ${className}`} />
          )}
          <img
            src={result.src}
            srcSet={result.srcSet}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={alt}
            loading={loadingAttr}
            fetchPriority={fetchPriorityAttr}
            onError={() => setFailed(true)}
            onLoad={() => setLoaded(true)}
            className={className}
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
            {...props}
          />
        </>
      );
    }
  }

  const finalSrc = useTransform && !src?.includes('.jpg.jpg') ? img(src, transformWidth ? { width: transformWidth } : {}) : src;

  return (
    <>
      {showSkeleton && !loaded && (
        <div className={`absolute inset-0 bg-neutral-100 animate-pulse ${className}`} />
      )}
      <img
        src={finalSrc}
        alt={alt}
        loading={loadingAttr}
        fetchPriority={fetchPriorityAttr}
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        className={className}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
        {...props}
      />
    </>
  );
}
