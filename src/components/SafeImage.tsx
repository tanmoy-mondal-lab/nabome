import { useState, useEffect, useCallback, type ImgHTMLAttributes } from "react";
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
  premium?: boolean;
}

const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'%3E%3Crect fill='%23f5f5f5' width='300' height='400'/%3E%3Ctext x='150' y='200' text-anchor='middle' dominant-baseline='central' fill='%23ccc' font-size='14' font-family='sans-serif'%3EImage%3C/text%3E%3C/svg%3E";

const PREMIUM_FALLBACK_GRADIENT =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%231a1a1a'/%3E%3Cstop offset='50%25' stop-color='%232d2d2d'/%3E%3Cstop offset='100%25' stop-color='%231a1a1a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='300' height='400'/%3E%3Ctext x='150' y='185' text-anchor='middle' dominant-baseline='central' fill='%23555' font-size='11' font-family='sans-serif' letter-spacing='3'%3ENABOME%3C/text%3E%3Ctext x='150' y='215' text-anchor='middle' dominant-baseline='central' fill='%23444' font-size='9' font-family='sans-serif' letter-spacing='1.5'%3EPREMIUM%3C/text%3E%3Crect x='120' y='235' width='60' height='0.5' fill='%23444'/%3E%3C/svg%3E";

const MAX_RETRIES = 1;

export function SafeImage({
  src,
  alt,
  fallback = FALLBACK,
  useTransform = true,
  transformWidth,
  responsive = false,
  priority = false,
  showSkeleton = true,
  premium = false,
  className = "",
  ...props
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
    setRetryCount(0);
  }, [src]);

  const handleError = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount((c) => c + 1);
      setLoaded(false);
    } else {
      setFailed(true);
    }
  }, [retryCount]);

  const effectiveFallback = premium ? PREMIUM_FALLBACK_GRADIENT : fallback;

  if (!src || failed) {
    return (
      <img
        src={effectiveFallback}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  const loadingAttr = priority ? "eager" : "lazy";
  const fetchPriorityAttr = priority ? "high" : undefined;

  const retrySuffix = retryCount > 0 ? `&_retry=${retryCount}` : "";

  if (responsive && src.includes("res.cloudinary.com")) {
    const result = imgSet(src);
    if ("srcSet" in result) {
      return (
        <>
          {showSkeleton && !loaded && (
            <div className={`absolute inset-0 bg-neutral-100 animate-pulse ${className}`} />
          )}
          <img
            src={result.src + retrySuffix}
            srcSet={result.srcSet}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={alt}
            loading={loadingAttr}
            fetchPriority={fetchPriorityAttr}
            onError={handleError}
            onLoad={() => setLoaded(true)}
            className={className}
            style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease-in-out" }}
            {...props}
          />
        </>
      );
    }
  }

  const finalSrc = useTransform ? img(src, transformWidth ? { width: transformWidth } : {}) : src;

  return (
    <>
      {showSkeleton && !loaded && (
        <div className={`absolute inset-0 bg-neutral-100 animate-pulse ${className}`} />
      )}
      <img
        src={finalSrc + retrySuffix}
        alt={alt}
        loading={loadingAttr}
        fetchPriority={fetchPriorityAttr}
        onError={handleError}
        onLoad={() => setLoaded(true)}
        className={className}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease-in-out" }}
        {...props}
      />
    </>
  );
}
