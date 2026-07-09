/**
 * Collections seed module
 * Seeds product collections
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const collectionsModule: SeedModule = {
  name: 'collections',
  dependsOn: ['settings'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      const collections = [
        {
          name: 'New Arrivals',
          slug: 'new-arrivals',
          description: 'Fresh styles just arrived. Be the first to explore our latest additions.',
          isFeatured: true,
          sortOrder: 1,
        },
        {
          name: 'Summer Collection',
          slug: 'summer-collection',
          description: 'Beat the heat in style. Lightweight fabrics and breezy designs for summer.',
          isFeatured: true,
          sortOrder: 2,
        },
        {
          name: 'Winter Collection',
          slug: 'winter-collection',
          description: 'Stay warm and stylish. Cozy fabrics and elegant designs for winter.',
          isFeatured: false,
          sortOrder: 3,
        },
        {
          name: 'Festival Collection',
          slug: 'festival-collection',
          description: 'Celebrate in style. Traditional and contemporary designs for every festival.',
          isFeatured: true,
          sortOrder: 4,
        },
        {
          name: 'Wedding Collection',
          slug: 'wedding-collection',
          description: 'Make your special day memorable. Elegant ethnic wear for weddings.',
          isFeatured: true,
          sortOrder: 5,
        },
        {
          name: 'Casual Essentials',
          slug: 'casual-essentials',
          description: 'Everyday comfort meets style. Perfect for your daily wardrobe.',
          isFeatured: false,
          sortOrder: 6,
        },
        {
          name: 'Office Wear',
          slug: 'office-wear',
          description: 'Professional yet stylish. Perfect for the modern workplace.',
          isFeatured: false,
          sortOrder: 7,
        },
        {
          name: 'Clearance',
          slug: 'clearance',
          description: 'Amazing deals on selected items. Limited time offers.',
          isFeatured: false,
          sortOrder: 8,
        },
      ];

      for (const collection of collections) {
        await context.prisma.collection.upsert({
          where: { slug: collection.slug },
          update: {
            name: collection.name,
            description: collection.description,
            isFeatured: collection.isFeatured,
            sortOrder: collection.sortOrder,
            isActive: true,
          },
          create: {
            ...collection,
            isActive: true,
          },
        });
        count++;
      }

      context.logger.success(`Seeded ${count} collections`);
      
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

registry.register(collectionsModule);
