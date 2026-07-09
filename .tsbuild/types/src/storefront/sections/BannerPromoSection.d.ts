interface SectionData {
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface BannerPromoSectionProps {
    section: SectionData;
}
export default function BannerPromoSection({ section }: BannerPromoSectionProps): import("react").JSX.Element;
export {};
