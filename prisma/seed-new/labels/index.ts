/**
 * Labels seed module
 * Seeds product labels (New Arrival, Best Seller, etc.)
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const labelsModule: SeedModule = {
  name: 'labels',
  dependsOn: ['settings'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      const labels = [
        { name: 'New', slug: 'new', color: '#22c55e' },
        { name: 'Sale', slug: 'sale', color: '#ef4444' },
        { name: 'Hot', slug: 'hot', color: '#f97316' },
        { name: 'Featured', slug: 'featured', color: '#3b82f6' },
        { name: 'Limited', slug: 'limited', color: '#8b5cf6' },
        { name: 'Exclusive', slug: 'exclusive', color: '#ec4899' },
        { name: 'Premium', slug: 'premium', color: '#eab308' },
        { name: 'Trending', slug: 'trending', color: '#06b6d4' },
        { name: 'Best Seller', slug: 'best-seller', color: '#10b981' },
        { name: 'Clearance', slug: 'clearance', color: '#6366f1' },
      ];

      for (const label of labels) {
        await context.prisma.productLabel.upsert({
          where: { slug: label.slug },
          update: {
            name: label.name,
            color: label.color,
          },
          create: label,
        });
        count++;
      }

      context.logger.success(`Seeded ${count} product labels`);
      
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

registry.register(labelsModule);
