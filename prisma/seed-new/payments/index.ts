/**
 * Payments seed module
 * Seeds payment records
 * Note: Payment data is stored in the Order model (razorpayOrderId, razorpayPaymentId)
 * This module adds mock payment IDs to orders with paid payment status
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';
import { PaymentStatus } from '@prisma/client';

// Helper function to generate mock Razorpay order ID
function generateRazorpayOrderId(): string {
  return `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Helper function to generate mock Razorpay payment ID
function generateRazorpayPaymentId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export const paymentsModule: SeedModule = {
  name: 'payments',
  dependsOn: ['orders'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      context.logger.info('Seeding payment records...');
      
      // Get orders that are paid but don't have payment IDs
      const orders = await context.prisma.order.findMany({
        where: {
          paymentStatus: PaymentStatus.paid,
          OR: [
            { razorpayOrderId: null },
            { razorpayOrderId: '' },
          ],
        },
      });
      
      if (orders.length === 0) {
        context.logger.info('No orders found that need payment IDs');
        return { success: true, count, duration: Date.now() - startTime };
      }
      
      context.logger.info(`Found ${orders.length} orders needing payment IDs`);
      
      // Add mock payment IDs to paid orders
      for (const order of orders) {
        await context.prisma.order.update({
          where: { id: order.id },
          data: {
            razorpayOrderId: generateRazorpayOrderId(),
            razorpayPaymentId: generateRazorpayPaymentId(),
          },
        });
        count++;
      }
      
      context.logger.success(`Seeded ${count} payment records`);
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding payments:', error);
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(paymentsModule);
