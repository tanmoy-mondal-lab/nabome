/**
 * Lookbooks seed module
 * Seeds lookbook collections
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const lookbooksModule: SeedModule = {
  name: 'lookbooks',
  dependsOn: ['products'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      // Get featured products for lookbooks
      const featuredProducts = await context.prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        take: 12,
        select: { id: true, name: true, slug: true, images: { take: 1 } },
      });

      context.logger.info(`Found ${featuredProducts.length} products for lookbooks`);

      const lookbooks = [
        {
          name: 'Summer 2024 Collection',
          slug: 'summer-2024',
          description: 'Embrace the warmth of summer with our handcrafted collection featuring lightweight fabrics and vibrant colors.',
          coverImageUrl: featuredProducts[0]?.images[0]?.url || 'https://res.cloudinary.com/demo/image/upload/v1/placeholder/summer.jpg',
          season: 'Summer',
          year: 2024,
          layout: 'grid',
          tags: ['summer', 'lightweight', 'vibrant', 'handcrafted'],
          metaTitle: 'Summer 2024 Collection - নবME',
          metaDesc: 'Explore our summer 2024 collection featuring handcrafted fashion.',
          isActive: true,
          sortOrder: 0,
          publishedAt: new Date(),
        },
        {
          name: 'Festival Special 2024',
          slug: 'festival-special-2024',
          description: 'Celebrate traditions with our exclusive festival collection featuring intricate embroidery and traditional motifs.',
          coverImageUrl: featuredProducts[1]?.images[0]?.url || 'https://res.cloudinary.com/demo/image/upload/v1/placeholder/festival.jpg',
          season: 'Festival',
          year: 2024,
          layout: 'masonry',
          tags: ['festival', 'traditional', 'embroidery', 'celebration'],
          metaTitle: 'Festival Special 2024 - নবME',
          metaDesc: 'Celebrate with our exclusive festival collection.',
          isActive: true,
          sortOrder: 1,
          publishedAt: new Date(),
        },
        {
          name: 'Artisan Showcase',
          slug: 'artisan-showcase',
          description: 'A tribute to the skilled artisans whose hands bring our designs to life with centuries of tradition.',
          coverImageUrl: featuredProducts[2]?.images[0]?.url || 'https://res.cloudinary.com/demo/image/upload/v1/placeholder/artisan.jpg',
          season: 'All Season',
          year: 2024,
          layout: 'grid',
          tags: ['artisan', 'handcrafted', 'traditional', 'craftsmanship'],
          metaTitle: 'Artisan Showcase - নবME',
          metaDesc: 'Discover the artistry behind our handcrafted fashion.',
          isActive: true,
          sortOrder: 2,
          publishedAt: new Date(),
        },
      ];

      for (const lookbook of lookbooks) {
        const existing = await context.prisma.lookbook.findUnique({
          where: { slug: lookbook.slug },
        });

        let lookbookId: string;

        if (existing) {
          const updated = await context.prisma.lookbook.update({
            where: { id: existing.id },
            data: {
              name: lookbook.name,
              description: lookbook.description,
              coverImageUrl: lookbook.coverImageUrl,
              season: lookbook.season,
              year: lookbook.year,
              layout: lookbook.layout,
              tags: lookbook.tags,
              metaTitle: lookbook.metaTitle,
              metaDesc: lookbook.metaDesc,
              isActive: lookbook.isActive,
              sortOrder: lookbook.sortOrder,
              publishedAt: lookbook.publishedAt,
            },
          });
          lookbookId = updated.id;
        } else {
          const created = await context.prisma.lookbook.create({
            data: lookbook,
          });
          lookbookId = created.id;
        }
        count++;

        // Add lookbook items with product references
        const productSubset = featuredProducts.slice(0, 4);
        for (let i = 0; i < productSubset.length; i++) {
          const product = productSubset[i];
          const existingItem = await context.prisma.lookbookItem.findFirst({
            where: {
              lookbookId,
              productId: product.id,
            },
          });

          if (!existingItem) {
            await context.prisma.lookbookItem.create({
              data: {
                lookbookId,
                imageUrl: product.images[0]?.url || 'https://res.cloudinary.com/demo/image/upload/v1/placeholder/product.jpg',
                productId: product.id,
                caption: `${product.name} - Part of our ${lookbook.name}`,
                sortOrder: i,
              },
            });
            count++;
          }
        }
      }

      context.logger.success(`Seeded ${count} lookbooks and items`);
      
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

registry.register(lookbooksModule);
