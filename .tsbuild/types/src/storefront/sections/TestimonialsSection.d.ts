interface SectionData {
    sectionType: string;
    title: string | null;
    subtitle: string | null;
    content: Record<string, unknown> | null;
}
interface TestimonialsSectionProps {
    section: SectionData;
}
export default function TestimonialsSection({ section }: TestimonialsSectionProps): import("react").JSX.Element | null;
export {};
