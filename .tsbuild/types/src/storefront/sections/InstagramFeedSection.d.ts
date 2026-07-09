interface SectionData {
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface InstagramFeedSectionProps {
    section: SectionData;
}
export default function InstagramFeedSection({ section }: InstagramFeedSectionProps): import("react").JSX.Element | null;
export {};
