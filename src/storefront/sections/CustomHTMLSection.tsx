interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface CustomHTMLSectionProps {
  section: SectionData;
}

export default function CustomHTMLSection({ section }: CustomHTMLSectionProps) {
  const content = section.content ?? {};
  const html = (content.html as string | undefined) ?? "";

  if (!html) return null;

  return (
    <div
      className="container-wide"
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }}
    />
  );
}
import { sanitizeHTML } from "../../lib/sanitize-html";
