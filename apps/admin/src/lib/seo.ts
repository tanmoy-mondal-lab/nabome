/** Document-level SEO helpers — each page sets title/description. */
export interface SeoMeta {
  title: string;
  description?: string;
}

export function setDocumentMeta({ title, description }: SeoMeta): void {
  document.title = title;
  if (description) {
    setMetaContent('description', description);
  }
}

function setMetaContent(name: string, content: string): void {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}
