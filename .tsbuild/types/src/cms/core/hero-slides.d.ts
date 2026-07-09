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
export declare function normalizeHeroSlide(raw: unknown, index: number, fallbacks?: HeroSlideFallbacks): HeroSlide | null;
export declare function normalizeHeroSlides(rawSlides: unknown, fallbacks?: HeroSlideFallbacks): HeroSlide[];
