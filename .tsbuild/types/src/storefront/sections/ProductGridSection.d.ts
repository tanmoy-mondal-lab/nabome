interface SectionData {
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface ProductGridSectionProps {
    section: SectionData;
}
export default function ProductGridSection({ section }: ProductGridSectionProps): import("react").JSX.Element | null;
export {};
