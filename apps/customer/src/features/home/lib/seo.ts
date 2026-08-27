/**
 * Homepage SEO — dynamic metadata and structured data (HOMEPAGE_BUILDER_ARCHITECTURE §7)
 * Handles dynamic metadata, OpenGraph, Twitter Cards, and structured data for the homepage.
 */

import type { HomepageConfig } from '../types';

/**
 * Update document metadata based on homepage configuration
 */
export function updateHomepageMetadata(config: HomepageConfig): void {
  if (typeof document === 'undefined') {
    return;
  }

  const { seo } = config;

  // Default values
  const title =
    seo?.title ?? config.title ?? 'নবME — Handcrafted jewelry & décor';
  const description =
    seo?.description ??
    'Discover handcrafted jewelry and home décor at নবME. Premium quality, unique designs, and sustainable materials.';
  const keywords = seo?.keywords ?? [
    'handcrafted jewelry',
    'home décor',
    'sustainable',
    'premium quality',
    'unique designs',
  ];

  // Update title
  document.title = title;

  // Update meta description
  setMetaTag('description', description);

  // Update keywords
  setMetaTag('keywords', keywords.join(', '));

  // Update Open Graph tags
  setMetaTag('og:title', title);
  setMetaTag('og:description', description);
  setMetaTag('og:type', 'website');
  setMetaTag('og:url', window.location.href);

  if (seo?.ogImage) {
    setMetaTag('og:image', seo.ogImage);
  }

  // Update Twitter Card tags
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', description);

  if (seo?.ogImage) {
    setMetaTag('twitter:image', seo.ogImage);
  }

  // Update canonical URL
  if (seo?.canonicalUrl) {
    setLinkTag('canonical', seo.canonicalUrl);
  } else {
    setLinkTag('canonical', window.location.href);
  }

  // Update robots meta tag
  if (seo?.noIndex) {
    setMetaTag('robots', 'noindex, nofollow');
  } else {
    setMetaTag('robots', 'index, follow');
  }

  // Add structured data
  addStructuredData(config);
}

/**
 * Set or update a meta tag
 */
function setMetaTag(name: string, content: string): void {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }

  meta.content = content;
}

/**
 * Set or update a link tag
 */
function setLinkTag(rel: string, href: string): void {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }

  link.href = href;
}

/**
 * Add structured data (JSON-LD) for the homepage
 */
function addStructuredData(config: HomepageConfig): void {
  // Remove existing structured data
  const existingScript = document.querySelector(
    'script[type="application/ld+json"][data-nabome="homepage"]',
  );
  if (existingScript) {
    existingScript.remove();
  }

  // Create organization structured data
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'নবME',
    url: window.location.origin,
    description: 'Handcrafted jewelry and home décor',
    logo: `${window.location.origin}/logo.svg`,
  };

  // Create website structured data
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.title,
    url: window.location.origin,
    description: config.seo?.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${window.location.origin}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // Create breadcrumb structured data (ready for future implementation)
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: window.location.origin,
      },
    ],
  };

  // Combine all structured data
  const structuredData = [organizationData, websiteData, breadcrumbData];

  // Add to document
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-nabome', 'homepage');
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

/**
 * Clear homepage metadata
 */
export function clearHomepageMetadata(): void {
  if (typeof document === 'undefined') {
    return;
  }

  // Remove structured data
  const existingScript = document.querySelector(
    'script[type="application/ld+json"][data-nabome="homepage"]',
  );
  if (existingScript) {
    existingScript.remove();
  }
}
