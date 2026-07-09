interface SectionData {
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface NewArrivalsSectionProps {
    section: SectionData;
}
export default function NewArrivalsSection({ section }: NewArrivalsSectionProps): import("react").JSX.Element | null;
export {};
