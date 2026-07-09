interface SectionData {
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface TrustBarSectionProps {
    section: SectionData;
}
export default function TrustBarSection({ section }: TrustBarSectionProps): import("react").JSX.Element;
export {};
