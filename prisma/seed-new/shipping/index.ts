/**
 * Shipping seed module
 * Seeds shipping information for orders
 * Note: Shipping data is stored in the Order model (carrier, trackingNumber, trackingUrl)
 * This module adds shipping information to shipped/delivered orders
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';
import { OrderStatus } from '@prisma/client';

// Helper function to generate mock tracking number
function generateTrackingNumber(carrier: string): string {
  const prefixes: Record<string, string> = {
    'Delhivery': 'DLV',
    'BlueDart': 'BDT',
    'FedEx': 'FEX',
    'DTDC': 'DTD',
    'Ecom Express': 'ECO',
    'Shiprocket': 'SRK',
  };
  const prefix = prefixes[carrier] || 'TRK';
  const random = Math.random().toString(36).substring(2, 12).toUpperCase();
  return `${prefix}${Date.now().toString().slice(-6)}${random}`;
}

// Carriers available in India
const CARRIERS = ['Delhivery', 'BlueDart', 'FedEx', 'DTDC', 'Ecom Express', 'Shiprocket'];

export const shippingModule: SeedModule = {
  name: 'shipping',
  dependsOn: ['orders'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      context.logger.info('Seeding shipping information...');
      
      // Get orders that are shipped or delivered but don't have tracking info
      const orders = await context.prisma.order.findMany({
        where: {
          status: {
            in: [OrderStatus.shipped, OrderStatus.delivered],
          },
          OR: [
            { trackingNumber: null },
            { trackingNumber: '' },
          ],
        },
      });
      
      if (orders.length === 0) {
        context.logger.info('No orders found that need shipping information');
        return { success: true, count, duration: Date.now() - startTime };
      }
      
      context.logger.info(`Found ${orders.length} orders needing shipping information`);
      
      // Add shipping information to shipped/delivered orders
      for (const order of orders) {
        const carrier = CARRIERS[Math.floor(Math.random() * CARRIERS.length)];
        const trackingNumber = generateTrackingNumber(carrier);
        const trackingUrl = `https://track.${carrier.toLowerCase().replace(/\s/g, '')}.com/${trackingNumber}`;
        
        await context.prisma.order.update({
          where: { id: order.id },
          data: {
            carrier,
            trackingNumber,
            trackingUrl,
          },
        });
        count++;
      }
      
      context.logger.success(`Seeded ${count} shipping records`);
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding shipping:', error);
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(shippingModule);
