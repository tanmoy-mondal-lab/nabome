/**
 * SEO seed module
 * Seeds SEO metadata in site settings
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const seoModule: SeedModule = {
  name: 'seo',
  dependsOn: ['settings'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      // Update site settings with comprehensive SEO configuration
      const siteSettings = await context.prisma.siteSetting.findFirst();

      if (siteSettings) {
        await context.prisma.siteSetting.update({
          where: { id: siteSettings.id },
          data: {
            seo: {
              metaTitleTemplate: '%s | নবME - Premium Fashion Marketplace',
              metaDescriptionTemplate: 'Shop %s at নবME. Discover handcrafted fashion celebrating traditional Indian craftsmanship with contemporary design.',
              robots: 'index,follow',
              ogTitle: 'নবME - Premium Fashion Marketplace',
              ogDescription: 'Discover handcrafted fashion celebrating traditional Indian craftsmanship with contemporary design.',
              ogImage: 'https://res.cloudinary.com/demo/image/upload/v1/nabome/og-default.jpg',
              twitterCard: 'summary_large_image',
              twitterTitle: 'নবME - Premium Fashion Marketplace',
              twitterDescription: 'Discover handcrafted fashion celebrating traditional Indian craftsmanship.',
              canonicalUrl: 'https://nabome.com',
              structuredData: {
                organization: {
                  name: 'নবME',
                  url: 'https://nabome.com',
                  logo: 'https://res.cloudinary.com/demo/image/upload/v1/nabome/logo.png',
                  description: 'Premium fashion marketplace celebrating traditional Indian craftsmanship.',
                  address: {
                    streetAddress: '123 Fashion Street',
                    addressLocality: 'Bangalore',
                    addressRegion: 'Karnataka',
                    postalCode: '560001',
                    addressCountry: 'IN',
                  },
                  contactPoint: {
                    telephone: '+91 98765 43210',
                    contactType: 'customer service',
                  },
                },
              },
              sitemap: {
                enabled: true,
                priority: {
                  homepage: 1.0,
                  products: 0.8,
                  categories: 0.7,
                  collections: 0.7,
                  pages: 0.5,
                },
                changefreq: {
                  homepage: 'daily',
                  products: 'weekly',
                  categories: 'monthly',
                  collections: 'monthly',
                  pages: 'monthly',
                },
              },
            },
          },
        });
        count++;
      }

      context.logger.success(`Seeded ${count} SEO configurations`);
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(seoModule);
