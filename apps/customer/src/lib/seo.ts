/**
 * Document-level SEO helpers (FRONTEND_PERFORMANCE_SEO_..._SPECIFICATION).
 * Each page sets title/description/canonical; the SPA shell stays pure CSR
 * with edge-generated meta handled by functions/_middleware on the domain.
 */

export interface SeoMeta {
  title: string;
  description?: string;
  canonicalPath?: string;
}

export function setDocumentMeta({
  title,
  description,
  canonicalPath,
}: SeoMeta): void {
  document.title = title;
  if (description) {
    setMetaContent('description', description);
  }
  if (canonicalPath) {
    const canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (canonical) {
      canonical.href = canonicalPath;
    }
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
