interface SectionData {
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface CollectionGridSectionProps {
    section: SectionData;
}
export default function CollectionGridSection({ section }: CollectionGridSectionProps): import("react").JSX.Element | null;
export {};
