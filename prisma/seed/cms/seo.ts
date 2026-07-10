/**
 * SEO Seed
 * Seeds default SEO configuration
 * Note: SEO is configured via site settings
 * This seed documents the SEO configuration
 */

import { prisma } from '../utils/helpers';

export async function seedSEO() {
  console.log('🔍 Seeding SEO configuration...');

  // SEO is configured via site_settings
  // This documents the default SEO configuration
  const seoConfig = {
    defaultTitle: 'NABOME - Premium Fashion E-commerce',
    defaultDescription: 'Where heritage craftsmanship meets contemporary elegance',
    defaultKeywords: 'fashion, ethnic wear, kurtas, sarees, premium clothing',
    ogImage: '/og-image.jpg',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    sitemap: true,
  };

  console.log('SEO configuration:', seoConfig);

  return seoConfig;
}
