/**
 * Returns seed module
 * Seeds return requests
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';
import { ReturnReason, ReturnStatus, OrderStatus } from '@prisma/client';

// Helper function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get random integer in range
function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Return status distribution
const RETURN_STATUS_DISTRIBUTION = {
  pending: 0.40,
  approved: 0.30,
  rejected: 0.15,
  completed: 0.15,
};

// Return reason options
const RETURN_REASONS = [
  ReturnReason.wrong_item,
  ReturnReason.damaged_product,
  ReturnReason.size_issue,
  ReturnReason.quality_issue,
  ReturnReason.not_as_described,
  ReturnReason.changed_mind,
  ReturnReason.other,
];

// Return reason details
const RETURN_REASON_DETAILS: Record<ReturnReason, string[]> = {
  [ReturnReason.wrong_item]: [
    'Received different color than ordered',
    'Received wrong size',
    'Item not matching description',
  ],
  [ReturnReason.damaged_product]: [
    'Product arrived with tears',
    'Stains on fabric',
    'Broken zipper',
    'Damaged packaging',
  ],
  [ReturnReason.size_issue]: [
    'Too small',
    'Too large',
    'Does not fit as expected',
  ],
  [ReturnReason.quality_issue]: [
    'Poor material quality',
    'Stitching coming apart',
    'Color fading after first wash',
  ],
  [ReturnReason.not_as_described]: [
    'Different from website images',
    'Missing features mentioned in description',
  ],
  [ReturnReason.changed_mind]: [
    'Changed mind after purchase',
    'Found better price elsewhere',
    'Gift recipient did not like',
  ],
  [ReturnReason.other]: [
    'Personal reason',
    'No longer needed',
  ],
};

export const returnsModule: SeedModule = {
  name: 'returns',
  dependsOn: ['orders', 'customers'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      context.logger.info('Seeding return requests...');
      
      // Get delivered orders (only delivered orders can be returned)
      const orders = await context.prisma.order.findMany({
        where: {
          status: OrderStatus.delivered,
          profileId: { not: null },
        },
        include: {
          items: {
            take: 3,
          },
        },
      });
      
      if (orders.length === 0) {
        context.logger.warn('No delivered orders found for returns');
        return { success: true, count, duration: Date.now() - startTime };
      }
      
      context.logger.info(`Found ${orders.length} delivered orders`);
      
      // Create return requests for a subset of delivered orders (about 15%)
      const ordersWithReturns = getRandomItems(orders, Math.floor(orders.length * 0.15));
      
      for (const order of ordersWithReturns) {
        // Determine return status
        const statusRoll = Math.random();
        let returnStatus: ReturnStatus;
        
        if (statusRoll < RETURN_STATUS_DISTRIBUTION.pending) {
          returnStatus = ReturnStatus.pending;
        } else if (statusRoll < RETURN_STATUS_DISTRIBUTION.pending + RETURN_STATUS_DISTRIBUTION.approved) {
          returnStatus = ReturnStatus.approved;
        } else if (statusRoll < RETURN_STATUS_DISTRIBUTION.pending + RETURN_STATUS_DISTRIBUTION.approved + RETURN_STATUS_DISTRIBUTION.rejected) {
          returnStatus = ReturnStatus.rejected;
        } else {
          returnStatus = ReturnStatus.completed;
        }
        
        // Select a random item from the order to return
        if (order.items.length === 0) continue;
        
        const orderItem = getRandomItems(order.items, 1)[0];
        const returnReason = getRandomItems(RETURN_REASONS, 1)[0];
        const reasonDetails = getRandomItems(RETURN_REASON_DETAILS[returnReason], 1)[0];
        
        // Generate dates based on status
        const createdAt = new Date(order.deliveredAt!.getTime() + getRandomInRange(1, 14) * 24 * 60 * 60 * 1000);
        let reviewedAt = null;
        let itemReceivedAt = null;
        
        if (returnStatus === ReturnStatus.approved || returnStatus === ReturnStatus.rejected || returnStatus === ReturnStatus.completed) {
          reviewedAt = new Date(createdAt.getTime() + getRandomInRange(1, 3) * 24 * 60 * 60 * 1000);
        }
        if (returnStatus === ReturnStatus.completed) {
          itemReceivedAt = new Date(reviewedAt!.getTime() + getRandomInRange(3, 7) * 24 * 60 * 60 * 1000);
        }
        
        // Create return request
        await context.prisma.returnRequest.create({
          data: {
            orderId: order.id,
            orderItemId: orderItem.id,
            profileId: order.profileId!,
            reason: returnReason,
            reasonDetail: reasonDetails,
            status: returnStatus,
            evidenceImages: [], // No evidence images for seed data
            adminNote: returnStatus === ReturnStatus.rejected ? 'Does not meet return policy criteria' : null,
            reviewedAt,
            itemReceivedAt,
            createdAt,
          },
        });
        
        count++;
      }
      
      context.logger.success(`Seeded ${count} return requests`);
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding returns:', error);
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(returnsModule);
