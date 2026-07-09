interface Slide {
    id: string;
    videoUrl: string;
    posterUrl: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaUrl: string;
    soundEnabled: boolean;
}
interface HeroCarouselProps {
    slides: Slide[];
    interval?: number;
}
export declare function HeroCarousel({ slides, interval }: HeroCarouselProps): import("react").JSX.Element | null;
export {};
