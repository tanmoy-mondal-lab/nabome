/**
 * Canonical URL Component
 * Source: SEO_ARCHITECTURE.md (binding)
 *
 * Adds canonical URL meta tag to prevent duplicate content issues.
 * Used on product, category, and collection pages.
 */

interface CanonicalURLProps {
  url: string;
}

export function CanonicalURL({ url }: CanonicalURLProps) {
  return <link rel="canonical" href={url} />;
}
