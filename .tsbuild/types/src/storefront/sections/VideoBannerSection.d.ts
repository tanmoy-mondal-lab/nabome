interface SectionData {
    id?: string;
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface VideoBannerSectionProps {
    section: SectionData;
}
export default function VideoBannerSection({ section }: VideoBannerSectionProps): import("react").JSX.Element;
export {};
