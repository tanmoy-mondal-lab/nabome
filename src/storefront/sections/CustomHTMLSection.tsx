interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface CustomHTMLSectionProps {
  section: SectionData;
}

function sanitizeHTML(dirty: string): string {
  const allowed = /^(?!javascript:|data:|on\w+\s*=)(?!.*<\s*\/?\s*(script|iframe|object|embed|form|input|textarea|button)\b)/i;
  return dirty
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "");
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
