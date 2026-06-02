import { useEffect, useState } from "react";

type CloudinaryTransform = {
  width?: number;
  height?: number;
  quality?: number | "auto";
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: "fill" | "fit" | "scale" | "thumb";
  lazy?: boolean;
};

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;

export function getOptimizedCloudinaryUrl(
  url: string,
  transforms: CloudinaryTransform = {}
): string {
  if (!CLOUD_NAME || !url.includes("cloudinary")) return url;

  const { width, height, quality = "auto", format = "auto", crop = "fill" } = transforms;
  const parts = ["f_auto", "q_auto"];

  if (quality !== "auto") parts.push(`q_${quality}`);
  if (format !== "auto") parts.push(`f_${format}`);
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (crop) parts.push(`c_${crop}`);

  const transformation = parts.join(",");
  return url.replace("/upload/", `/upload/${transformation}/`);
}

export function getPlaceholderImage(url: string): string {
  if (!CLOUD_NAME || !url.includes("cloudinary")) return url;
  return getOptimizedCloudinaryUrl(url, { width: 20, quality: 10 });
}

export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const [ref] = useState<React.RefObject<HTMLDivElement | null>>(
    () => ({ current: null })
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: "200px", threshold: 0, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options]);

  return [ref, isVisible];
}

export function getImageSizePreset(
  type: "product" | "thumbnail" | "banner" | "avatar" | "gallery"
): CloudinaryTransform {
  switch (type) {
    case "product":
      return { width: 800, height: 1000, crop: "fill", quality: "auto" };
    case "thumbnail":
      return { width: 300, height: 300, crop: "fill", quality: "auto" };
    case "banner":
      return { width: 1440, height: 600, crop: "fill", quality: "auto" };
    case "avatar":
      return { width: 150, height: 150, crop: "thumb", quality: "auto" };
    case "gallery":
      return { width: 600, height: 750, crop: "fill", quality: "auto" };
  }
}

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
