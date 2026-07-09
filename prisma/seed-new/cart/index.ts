/**
 * Cart seed module
 * Seeds customer shopping carts
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

export const cartModule: SeedModule = {
  name: 'cart',
  dependsOn: ['customers', 'products'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let cartCount = 0;
    let itemCount = 0;

    try {
      context.logger.info('Seeding customer shopping carts...');
      
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
              basePrice: true,
            },
          },
        },
      });
      
      // Filter to only include variants from active products
      const activeVariants = variants.filter(v => v.product.isActive);
      
      if (customers.length === 0 || activeVariants.length === 0) {
        context.logger.warn('No customers or active variants found');
        return { success: true, count: 0, duration: Date.now() - startTime };
      }
      
      context.logger.info(`Found ${customers.length} customers and ${activeVariants.length} active variants`);
      
      // Distribute carts across customers
      // Some customers have empty carts, some have items, some have abandoned carts
      for (const customer of customers) {
        // Determine cart state based on customer activity pattern
        // 15% empty, 25% one-item, 35% multi-item, 25% abandoned (saved for later)
        const activityRoll = Math.random();
        let cartState: string;
        
        if (activityRoll < 0.15) {
          cartState = 'empty'; // Empty cart
        } else if (activityRoll < 0.40) {
          cartState = 'one-item'; // One item cart
        } else if (activityRoll < 0.75) {
          cartState = 'multi-item'; // Multi-item cart
        } else {
          cartState = 'abandoned'; // Abandoned cart with saved items
        }
        
        if (cartState === 'empty') {
          // Create empty cart
          const existingCart = await context.prisma.cart.findUnique({
            where: { profileId: customer.id },
          });
          
          if (!existingCart) {
            await context.prisma.cart.create({
              data: {
                profileId: customer.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
              },
            });
            cartCount++;
          }
          continue;
        }
        
        // Create or get cart
        let cart = await context.prisma.cart.findUnique({
          where: { profileId: customer.id },
        });
        
        if (!cart) {
          cart = await context.prisma.cart.create({
            data: {
              profileId: customer.id,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
          });
          cartCount++;
        }
        
        // Determine number of items
        let itemCount: number;
        if (cartState === 'one-item') {
          itemCount = 1;
        } else if (cartState === 'multi-item') {
          itemCount = getRandomInRange(2, 6);
        } else {
          itemCount = getRandomInRange(3, 8);
        }
        
        // Get random variants for this cart
        const cartVariants = getRandomItems(activeVariants, itemCount);
        
        for (const variant of cartVariants) {
          // Check if this variant is already in the cart
          const existingItem = await context.prisma.cartItem.findUnique({
            where: {
              cartId_variantId: {
                cartId: cart.id,
                variantId: variant.id,
              },
            },
          });
          
          if (!existingItem) {
            const quantity = getRandomInRange(1, 3);
            const savedForLater = cartState === 'abandoned' ? Math.random() < 0.5 : false;
            
            await context.prisma.cartItem.create({
              data: {
                cartId: cart.id,
                variantId: variant.id,
                quantity,
                savedForLater,
              },
            });
            itemCount++;
          }
        }
      }
      
      context.logger.success(`Seeded ${cartCount} carts with ${itemCount} items`);
      
      return {
        success: true,
        count: itemCount,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding carts:', error);
      return {
        success: false,
        count: itemCount,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(cartModule);
