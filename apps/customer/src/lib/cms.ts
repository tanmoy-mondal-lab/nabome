/**
 * CMS Integration utilities following CMS_ENGINE_ARCHITECTURE.md
 *
 * Features:
 * - Dynamic page content fetching
 * - Homepage content management
 * - Legal pages support
 * - Static pages support
 * - SEO metadata from CMS
 */

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  publishedAt: string;
  updatedAt: string;
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
}

import { appConfig } from './config';

const CMS_API_BASE = `${appConfig.PUBLIC_API_URL}/api/v1/cms`;

export interface CmsHomepage {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage?: string;
  };
  featuredProducts?: string[];
  featuredCategories?: string[];
  sections?: Array<{
    type: 'products' | 'categories' | 'banner' | 'text';
    title?: string;
    content?: unknown;
  }>;
}

/**
 * Fetches a CMS page by slug
 */
export async function fetchCmsPage(slug: string): Promise<CmsPage | null> {
  try {
    // This would integrate with the actual CMS API
    // For now, it's a placeholder that can be connected to the backend
    const response = await fetch(`${CMS_API_BASE}/pages/${slug}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch CMS page:', error);
    return null;
  }
}

/**
 * Fetches homepage content from CMS
 */
export async function fetchHomepageContent(): Promise<CmsHomepage | null> {
  try {
    const response = await fetch(`${CMS_API_BASE}/homepage`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch homepage content:', error);
    return null;
  }
}

/**
 * Generates page metadata from CMS data
 */
export function generatePageMetadataFromCms(page: CmsPage): {
  title: string;
  description: string;
  ogImage?: string;
} {
  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.excerpt || '',
    ogImage: page.seo?.ogImage,
  };
}

/**
 * Checks if a page is managed by CMS
 */
export function isCmsManagedPage(path: string): boolean {
  const cmsRoutes = [
    '/about',
    '/contact',
    '/legal/terms',
    '/legal/privacy',
    '/legal/cookies',
    '/legal/refunds',
    '/help/contact',
    '/help/shipping',
    '/help/returns',
    '/help/faq',
  ];
  return cmsRoutes.some((route) => path.startsWith(route));
}
