import { useState, type ImgHTMLAttributes } from "react";
import { img } from "../lib/seo";

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallback?: string;
  useTransform?: boolean;
  transformWidth?: number;
}

const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f5f5f5' width='400' height='400'/%3E%3Ctext x='200' y='200' text-anchor='middle' dominant-baseline='central' fill='%23ccc' font-size='14' font-family='sans-serif'%3EImage%3C/text%3E%3C/svg%3E";

export function SafeImage({
  src, alt, fallback = FALLBACK, useTransform = true,
  transformWidth, className = "", ...props
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

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

  const finalSrc = useTransform ? img(src, transformWidth ? { width: transformWidth } : {}) : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      {...props}
    />
  );
}
