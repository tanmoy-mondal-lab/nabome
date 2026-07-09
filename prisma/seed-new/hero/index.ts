/**
 * Hero seed module
 * Seeds hero slider sections with media references
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const heroModule: SeedModule = {
  name: 'hero',
  dependsOn: ['products', 'collections'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      // Get featured products and collections for hero slides
      const featuredProducts = await context.prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        take: 5,
        select: { id: true, name: true, slug: true, basePrice: true, images: { take: 1 } },
      });

      const collections = await context.prisma.collection.findMany({
        where: { isActive: true, isFeatured: true },
        take: 3,
        select: { id: true, name: true, slug: true, heroImageUrl: true },
      });

      context.logger.info(`Found ${featuredProducts.length} featured products, ${collections.length} collections for hero slides`);

      // Create hero slides
      const heroSlides = [
        {
          sectionType: 'hero_slider' as const,
          title: 'Summer Collection 2024',
          subtitle: 'New Arrivals',
          content: {
            slides: [
              {
                title: 'Discover Traditional Elegance',
                subtitle: 'Summer Collection 2024',
                description: 'Explore our newest collection blending traditional Indian craftsmanship with contemporary design.',
                cta: 'Shop Now',
                ctaLink: '/collections/summer-2024',
                imageUrl: collections[0]?.heroImageUrl || null,
                mobileImageUrl: collections[0]?.heroImageUrl || null,
                displayOrder: 0,
                isActive: true,
              },
              {
                title: 'Handcrafted Excellence',
                subtitle: 'Artisan Collection',
                description: 'Each piece tells a story of skilled artisans and timeless traditions.',
                cta: 'Explore',
                ctaLink: '/collections/artisan',
                imageUrl: collections[1]?.heroImageUrl || null,
                mobileImageUrl: collections[1]?.heroImageUrl || null,
                displayOrder: 1,
                isActive: true,
              },
              {
                title: 'Festival Special',
                subtitle: 'Limited Edition',
                description: 'Celebrate with our exclusive festival collection.',
                cta: 'View Collection',
                ctaLink: '/collections/festival',
                imageUrl: collections[2]?.heroImageUrl || null,
                mobileImageUrl: collections[2]?.heroImageUrl || null,
                displayOrder: 2,
                isActive: true,
              },
            ],
          },
          sortOrder: 0,
          isActive: true,
        },
      ];

      for (const slide of heroSlides) {
        const existing = await context.prisma.homepageSection.findFirst({
          where: {
            sectionType: slide.sectionType,
            sortOrder: slide.sortOrder,
          },
        });

        if (existing) {
          await context.prisma.homepageSection.update({
            where: { id: existing.id },
            data: {
              title: slide.title,
              subtitle: slide.subtitle,
              content: slide.content,
              isActive: slide.isActive,
            },
          });
        } else {
          await context.prisma.homepageSection.create({
            data: slide,
          });
        }
        count++;
      }

      context.logger.success(`Seeded ${count} hero slider sections`);
      
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

registry.register(heroModule);
