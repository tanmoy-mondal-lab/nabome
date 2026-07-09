interface SectionData {
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface HeroSliderSectionProps {
    section: SectionData;
}
export default function HeroSliderSection({ section }: HeroSliderSectionProps): import("react").JSX.Element;
export {};
