interface SectionData {
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface NewsletterSectionProps {
    section: SectionData;
}
export default function NewsletterSection({ section }: NewsletterSectionProps): import("react").JSX.Element;
export {};
