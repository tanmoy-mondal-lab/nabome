interface SectionData {
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface CustomHTMLSectionProps {
    section: SectionData;
}
export default function CustomHTMLSection({ section }: CustomHTMLSectionProps): import("react").JSX.Element | null;
export {};
