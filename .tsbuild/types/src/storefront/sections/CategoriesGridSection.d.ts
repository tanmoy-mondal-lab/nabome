interface SectionData {
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface CategoriesGridSectionProps {
    section: SectionData;
}
export default function CategoriesGridSection({ section }: CategoriesGridSectionProps): import("react").JSX.Element | null;
export {};
