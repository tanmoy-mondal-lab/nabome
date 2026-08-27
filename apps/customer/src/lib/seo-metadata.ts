/**
 * SEO Metadata utilities following FRONTEND_PERFORMANCE_SEO_PRODUCTION_READINESS_SPECIFICATION.md
 *
 * Features:
 * - Dynamic metadata generation
 * - OpenGraph support
 * - Twitter Card support
 * - Canonical URL generation
 * - Structured data (JSON-LD) readiness
 */

export interface SeoMetadata {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
}

/**
 * Updates document metadata for SEO
 */
export function updateSeoMetadata(metadata: SeoMetadata): void {
  const {
    title,
    description,
    canonical,
    ogImage,
    ogType = 'website',
    noIndex,
    structuredData,
  } = metadata;

  // Update title
  document.title = title;

  // Update meta description
  updateMetaTag('description', description);

  // Update canonical URL
  if (canonical) {
    updateCanonicalLink(canonical);
  }

  // Update OpenGraph tags
  updateMetaTag('og:title', title);
  updateMetaTag('og:description', description);
  updateMetaTag('og:type', ogType);
  if (ogImage) {
    updateMetaTag('og:image', ogImage);
  }

  // Update Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
  if (ogImage) {
    updateMetaTag('twitter:image', ogImage);
  }

  // Handle no-index
  if (noIndex) {
    updateMetaTag('robots', 'noindex, nofollow');
  }

  // Update structured data
  if (structuredData) {
    updateStructuredData(structuredData);
  }
}

function updateMetaTag(name: string, content: string): void {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function updateCanonicalLink(href: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

function updateStructuredData(data: Record<string, unknown>): void {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Generates canonical URL from current path
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}${path}`;
}

/**
 * Generates breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generates product structured data
 */
export function generateProductStructuredData(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock';
  sku: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
    },
    sku: product.sku,
  };
}
