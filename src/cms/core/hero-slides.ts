export interface HeroSlide {
  id: string;
  videoUrl: string;
  posterUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  soundEnabled: boolean;
}

export interface HeroSlideInput {
  id?: string | null;
  videoUrl?: string | null;
  posterUrl?: string | null;
  image?: string | null;
  posterImage?: string | null;
  title?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  soundEnabled?: boolean | null;
  cta?: {
    text?: string | null;
    link?: string | null;
  } | null;
}

export interface HeroSlideFallbacks {
  title?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function titleCase(value: string): string {
  return value
    .replace(/[-_+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function deriveTitleFromUrl(url: string): string {
  if (!url) return "";

  try {
    const parsed = new URL(url, "http://localhost");
    const parts = parsed.pathname.split("/").filter(Boolean);
    const segment = parts.at(-1) || "";
    if (!segment) return "";
    return titleCase(segment.replace(/\.[^.]+$/, ""));
  } catch {
    const cleaned = url.split("?")[0].split("#")[0].split("/").filter(Boolean).at(-1) || "";
    return titleCase(cleaned.replace(/\.[^.]+$/, ""));
  }
}

export function normalizeHeroSlide(raw: unknown, index: number, fallbacks: HeroSlideFallbacks = {}): HeroSlide | null {
  const slide = (raw && typeof raw === "object" ? raw : {}) as HeroSlideInput;
  const cta = slide.cta ?? undefined;

  const videoUrl = toText(slide.videoUrl);
  const posterUrl = toText(slide.posterUrl) || toText(slide.image) || toText(slide.posterImage);
  const derivedTitle = deriveTitleFromUrl(toText(slide.ctaUrl) || toText(cta?.link));
  const title = toText(slide.title) || derivedTitle || toText(fallbacks.title) || `Slide ${index + 1}`;
  const subtitle = toText(slide.subtitle) || toText(fallbacks.subtitle) || "";
  const ctaText = toText(slide.ctaText) || toText(cta?.text) || toText(fallbacks.ctaText) || "Explore";
  const ctaUrl = toText(slide.ctaUrl) || toText(cta?.link) || toText(fallbacks.ctaUrl) || "/products";
  const soundEnabled = slide.soundEnabled !== false;

  if (!videoUrl && !posterUrl && !title && !subtitle && !ctaText && !ctaUrl) {
    return null;
  }

  return {
    id: toText(slide.id) || `hero-slide-${index}`,
    videoUrl,
    posterUrl,
    title,
    subtitle,
    ctaText,
    ctaUrl,
    soundEnabled,
  };
}

export function normalizeHeroSlides(rawSlides: unknown, fallbacks: HeroSlideFallbacks = {}): HeroSlide[] {
  if (!Array.isArray(rawSlides)) return [];
  return rawSlides
    .map((slide, index) => normalizeHeroSlide(slide, index, fallbacks))
    .filter((slide): slide is HeroSlide => slide !== null);
}
