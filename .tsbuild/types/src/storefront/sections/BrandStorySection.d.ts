interface SectionData {
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface BrandStorySectionProps {
    section: SectionData;
}
export default function BrandStorySection({ section }: BrandStorySectionProps): import("react").JSX.Element;
export {};
