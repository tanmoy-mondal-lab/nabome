/**
 * Wishlist seed module
 * Seeds customer wishlists
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

// Helper function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get random integer in range
function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const wishlistModule: SeedModule = {
  name: 'wishlist',
  dependsOn: ['customers', 'products'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      context.logger.info('Seeding customer wishlists...');
      
      // Get all customer profiles
      const customers = await context.prisma.profile.findMany({
        where: { role: 'customer' },
      });
      
      // Get all active product variants
      const variants = await context.prisma.productVariant.findMany({
        where: { isActive: true },
        include: {
          product: {
            select: {
              isActive: true,
            },
          },
        },
      });
      
      // Filter to only include variants from active products
      const activeVariants = variants.filter(v => v.product.isActive);
      
      if (customers.length === 0 || activeVariants.length === 0) {
        context.logger.warn('No customers or active variants found');
        return { success: true, count, duration: Date.now() - startTime };
      }
      
      context.logger.info(`Found ${customers.length} customers and ${activeVariants.length} active variants`);
      
      // Distribute wishlist items across customers
      // Some customers have empty wishlists, some have many items
      for (const customer of customers) {
        // Determine wishlist size based on customer activity pattern
        // 10% empty, 30% small (1-3), 40% medium (4-8), 20% large (9-15)
        const activityRoll = Math.random();
        let wishlistSize: number;
        
        if (activityRoll < 0.10) {
          wishlistSize = 0; // Empty wishlist
        } else if (activityRoll < 0.40) {
          wishlistSize = getRandomInRange(1, 3); // Small wishlist
        } else if (activityRoll < 0.80) {
          wishlistSize = getRandomInRange(4, 8); // Medium wishlist
        } else {
          wishlistSize = getRandomInRange(9, 15); // Large wishlist
        }
        
        if (wishlistSize === 0) {
          continue; // Skip customers with empty wishlists
        }
        
        // Get random variants for this customer's wishlist
        const customerVariants = getRandomItems(activeVariants, wishlistSize);
        
        for (const variant of customerVariants) {
          // Check if this variant is already in the customer's wishlist
          const existing = await context.prisma.wishlistItem.findUnique({
            where: {
              profileId_variantId: {
                profileId: customer.id,
                variantId: variant.id,
              },
            },
          });
          
          if (!existing) {
            await context.prisma.wishlistItem.create({
              data: {
                profileId: customer.id,
                variantId: variant.id,
              },
            });
            count++;
          }
        }
      }
      
      context.logger.success(`Seeded ${count} wishlist items`);
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding wishlists:', error);
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(wishlistModule);
