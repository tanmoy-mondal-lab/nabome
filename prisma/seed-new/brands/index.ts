/**
 * Brands seed module
 * Seeds product brands
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const brandsModule: SeedModule = {
  name: 'brands',
  dependsOn: ['settings'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      const brands = [
        {
          name: 'FabIndia',
          slug: 'fabindia',
          description: 'Celebrating Indian craftsmanship with contemporary design. FabIndia brings you handwoven textiles and artisanal products.',
          websiteUrl: 'https://www.fabindia.com',
          sortOrder: 1,
        },
        {
          name: 'W for Woman',
          slug: 'w-for-woman',
          description: 'Contemporary ethnic wear for the modern Indian woman. Elegant designs with traditional roots.',
          websiteUrl: 'https://www.wforwoman.com',
          sortOrder: 2,
        },
        {
          name: 'Global Desi',
          slug: 'global-desi',
          description: 'Indo-western fusion fashion that celebrates global trends with Indian aesthetics.',
          websiteUrl: 'https://www.globaldesi.in',
          sortOrder: 3,
        },
        {
          name: 'Biba',
          slug: 'biba',
          description: 'Timeless ethnic fashion for women. Beautiful designs inspired by Indian heritage.',
          websiteUrl: 'https://www.biba.in',
          sortOrder: 4,
        },
        {
          name: 'AND',
          slug: 'and',
          description: 'Modern fashion for the confident woman. Contemporary designs with international appeal.',
          websiteUrl: 'https://www.andindia.com',
          sortOrder: 5,
        },
        {
          name: 'Aurelia',
          slug: 'aurelia',
          description: 'Elegant ethnic wear for special occasions. Intricate designs with premium fabrics.',
          websiteUrl: 'https://www.aurelia.com',
          sortOrder: 6,
        },
        {
          name: 'Fusion',
          slug: 'fusion',
          description: 'Indo-western fusion wear that blends traditional and contemporary styles.',
          websiteUrl: 'https://www.fusion.com',
          sortOrder: 7,
        },
        {
          name: 'Sangria',
          slug: 'sangria',
          description: 'Bohemian chic fashion with free-spirited designs. Perfect for the modern wanderer.',
          websiteUrl: 'https://www.sangria.com',
          sortOrder: 8,
        },
        {
          name: 'House of Pataudi',
          slug: 'house-of-pataudi',
          description: 'Royal inspired fashion with modern interpretations. Regal elegance for everyday wear.',
          websiteUrl: 'https://www.houseofpataudi.com',
          sortOrder: 9,
        },
        {
          name: 'Ethnicity',
          slug: 'ethnicity',
          description: 'Authentic ethnic wear with contemporary styling. Traditional crafts meet modern design.',
          websiteUrl: 'https://www.ethnicity.com',
          sortOrder: 10,
        },
      ];

      for (const brand of brands) {
        await context.prisma.brand.upsert({
          where: { slug: brand.slug },
          update: {
            name: brand.name,
            description: brand.description,
            websiteUrl: brand.websiteUrl,
            sortOrder: brand.sortOrder,
            isActive: true,
          },
          create: {
            ...brand,
            isActive: true,
          },
        });
        count++;
      }

      context.logger.success(`Seeded ${count} brands`);
      
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

registry.register(brandsModule);
