interface SectionData {
    id?: string;
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface SectionRendererProps {
    section: SectionData;
}
export default function SectionRenderer({ section }: SectionRendererProps): import("react").JSX.Element | null;
export {};
