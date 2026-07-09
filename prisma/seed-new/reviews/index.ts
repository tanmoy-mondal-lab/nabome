/**
 * Reviews seed module
 * Seeds product reviews
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';
import { OrderStatus } from '@prisma/client';

// Helper function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get random integer in range
function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Rating distribution (natural curve - not everyone gives 5 stars)
const RATING_DISTRIBUTION = {
  5: 0.45,  // 45% give 5 stars
  4: 0.30,  // 30% give 4 stars
  3: 0.15,  // 15% give 3 stars
  2: 0.07,  // 7% give 2 stars
  1: 0.03,  // 3% give 1 star
};

// Review titles by rating
const REVIEW_TITLES: Record<number, string[]> = {
  5: [
    'Excellent quality!',
    'Perfect fit',
    'Amazing product',
    'Love it!',
    'Highly recommended',
    'Best purchase ever',
    'Superb quality',
    'Exceeded expectations',
  ],
  4: [
    'Very good',
    'Nice product',
    'Good quality',
    'Satisfied',
    'Worth buying',
    'Great value',
  ],
  3: [
    'Decent product',
    'Average quality',
    'Okay for the price',
    'Fair',
    'Mixed feelings',
  ],
  2: [
    'Not great',
    'Could be better',
    'Disappointed',
    'Below expectations',
  ],
  1: [
    'Poor quality',
    'Very disappointed',
    'Not recommended',
    'Waste of money',
    'Terrible',
  ],
};

// Review bodies by rating
const REVIEW_BODIES: Record<number, string[]> = {
  5: [
    'Absolutely love this product! The quality is amazing and it fits perfectly. Will definitely buy again.',
    'Great quality for the price. Fast delivery and the product looks exactly like the pictures.',
    'This exceeded my expectations. The material is soft and comfortable. Highly recommend!',
    'Perfect! Exactly what I was looking for. The color is beautiful and the fit is great.',
    'Amazing product! Will definitely recommend to friends and family.',
  ],
  4: [
    'Very good product overall. Minor issues with stitching but otherwise great.',
    'Nice quality and good fit. Delivery was a bit slow but product is worth it.',
    'Good quality material. Slightly different from pictures but still happy with purchase.',
    'Satisfied with the purchase. Good value for money.',
  ],
  3: [
    'Decent product for the price. Quality is average but acceptable.',
    'It\'s okay. Not great but not terrible either. Fits as expected.',
    'Average quality. Nothing special but does the job.',
    'Fair product. Some minor issues but overall acceptable.',
  ],
  2: [
    'Not great quality. Material feels cheap and sizing is off.',
    'Disappointed with the quality. Expected better for the price.',
    'Below expectations. The product looks different from the pictures.',
    'Could be better. Multiple issues with the product.',
  ],
  1: [
    'Poor quality product. Material is terrible and fell apart after first wash.',
    'Very disappointed. Waste of money. Would not recommend.',
    'Terrible quality. Nothing like the pictures. Returning this.',
    'Worst purchase ever. Complete waste of money.',
  ],
};

export const reviewsModule: SeedModule = {
  name: 'reviews',
  dependsOn: ['customers', 'products', 'orders'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      context.logger.info('Seeding product reviews...');
      
      // Get delivered orders with customer profiles
      const orders = await context.prisma.order.findMany({
        where: {
          status: OrderStatus.delivered,
          profileId: { not: null },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });
      
      if (orders.length === 0) {
        context.logger.warn('No delivered orders found for reviews');
        return { success: true, count, duration: Date.now() - startTime };
      }
      
      context.logger.info(`Found ${orders.length} delivered orders`);
      
      // Create reviews for a subset of delivered orders (about 40% review rate)
      const ordersWithReviews = getRandomItems(orders, Math.floor(orders.length * 0.40));
      
      for (const order of ordersWithReviews) {
        // Select a random item from the order to review
        if (order.items.length === 0) continue;
        
        const orderItem = getRandomItems(order.items, 1)[0];
        
        // Check if review already exists for this product/order/customer combination
        const existingReview = await context.prisma.review.findUnique({
          where: {
            productId_profileId_orderId: {
              productId: orderItem.productId,
              profileId: order.profileId!,
              orderId: order.id,
            },
          },
        });
        
        if (existingReview) continue;
        
        // Determine rating based on distribution
        const ratingRoll = Math.random();
        let rating: number;
        
        if (ratingRoll < RATING_DISTRIBUTION[5]) {
          rating = 5;
        } else if (ratingRoll < RATING_DISTRIBUTION[5] + RATING_DISTRIBUTION[4]) {
          rating = 4;
        } else if (ratingRoll < RATING_DISTRIBUTION[5] + RATING_DISTRIBUTION[4] + RATING_DISTRIBUTION[3]) {
          rating = 3;
        } else if (ratingRoll < RATING_DISTRIBUTION[5] + RATING_DISTRIBUTION[4] + RATING_DISTRIBUTION[3] + RATING_DISTRIBUTION[2]) {
          rating = 2;
        } else {
          rating = 1;
        }
        
        // Get random title and body for this rating
        const titles = REVIEW_TITLES[rating];
        const bodies = REVIEW_BODIES[rating];
        const title = getRandomItems(titles, 1)[0];
        const body = getRandomItems(bodies, 1)[0];
        
        // Determine if review should be approved (90% approval rate)
        const isApproved = Math.random() < 0.90;
        
        // Create review
        await context.prisma.review.create({
          data: {
            productId: orderItem.productId,
            profileId: order.profileId!,
            orderId: order.id,
            rating,
            title,
            body,
            images: [], // No images for seed data
            isApproved,
            createdAt: new Date(order.deliveredAt!.getTime() + getRandomInRange(1, 30) * 24 * 60 * 60 * 1000),
          },
        });
        
        count++;
      }
      
      context.logger.success(`Seeded ${count} reviews`);
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding reviews:', error);
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(reviewsModule);
