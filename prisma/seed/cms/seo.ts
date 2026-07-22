/**
 * SEO Seed
 * Seeds default SEO configuration
 * Note: SEO is configured via site settings
 * This seed documents the SEO configuration
 */

export async function seedSEO() {
  // eslint-disable-next-line no-console
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

  // eslint-disable-next-line no-console
  console.log('SEO configuration:', seoConfig);

  return seoConfig;
}
