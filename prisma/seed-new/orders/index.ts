/**
 * Orders seed module
 * Seeds customer orders
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';
import { OrderStatus, PaymentStatus } from '@prisma/client';

// Helper function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get random integer in range
function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to generate order number
function generateOrderNumber(orderIndex: number): string {
  const prefix = 'NAB';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${orderIndex.toString().padStart(4, '0')}${random}`;
}

// Helper function to get random date in range
function getRandomDate(daysAgoStart: number, daysAgoEnd: number): Date {
  const now = new Date();
  const start = new Date(now.getTime() - daysAgoStart * 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() - daysAgoEnd * 24 * 60 * 60 * 1000);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Order status distribution
const ORDER_STATUS_DISTRIBUTION = {
  pending: 0.15,
  confirmed: 0.20,
  processing: 0.15,
  shipped: 0.20,
  delivered: 0.25,
  cancelled: 0.04,
  refunded: 0.01,
};

// Payment status distribution
const PAYMENT_STATUS_DISTRIBUTION = {
  pending: 0.10,
  paid: 0.85,
  failed: 0.04,
  refunded: 0.01,
};

export const ordersModule: SeedModule = {
  name: 'orders',
  dependsOn: ['customers', 'products', 'inventory', 'addresses', 'coupons'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let orderCount = 0;
    let orderItemCount = 0;

    try {
      context.logger.info('Seeding customer orders...');
      
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
              name: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      });
      
      // Filter to only include variants from active products
      const activeVariants = variants.filter(v => v.product.isActive);
      
      // Get all addresses
      const addresses = await context.prisma.address.findMany();
      
      // Get all active coupons
      const coupons = await context.prisma.coupon.findMany({
        where: { isActive: true },
      });
      
      if (customers.length === 0 || activeVariants.length === 0) {
        context.logger.warn('No customers or active variants found');
        return { success: true, count: 0, duration: Date.now() - startTime };
      }
      
      context.logger.info(`Found ${customers.length} customers, ${activeVariants.length} variants, ${addresses.length} addresses, ${coupons.length} coupons`);
      
      // Target: 200 orders (within 100-300 range)
      const TARGET_ORDERS = 200;
      const ordersPerCustomer = Math.floor(TARGET_ORDERS / customers.length);
      
      // Distribute orders across customers
      for (const customer of customers) {
        // Determine number of orders for this customer
        const customerOrderCount = getRandomInRange(0, ordersPerCustomer * 2);
        
        for (let i = 0; i < customerOrderCount; i++) {
          // Determine order status
          const statusRoll = Math.random();
          let orderStatus: OrderStatus;
          
          if (statusRoll < ORDER_STATUS_DISTRIBUTION.pending) {
            orderStatus = OrderStatus.pending;
          } else if (statusRoll < ORDER_STATUS_DISTRIBUTION.pending + ORDER_STATUS_DISTRIBUTION.confirmed) {
            orderStatus = OrderStatus.confirmed;
          } else if (statusRoll < ORDER_STATUS_DISTRIBUTION.pending + ORDER_STATUS_DISTRIBUTION.confirmed + ORDER_STATUS_DISTRIBUTION.processing) {
            orderStatus = OrderStatus.processing;
          } else if (statusRoll < ORDER_STATUS_DISTRIBUTION.pending + ORDER_STATUS_DISTRIBUTION.confirmed + ORDER_STATUS_DISTRIBUTION.processing + ORDER_STATUS_DISTRIBUTION.shipped) {
            orderStatus = OrderStatus.shipped;
          } else if (statusRoll < ORDER_STATUS_DISTRIBUTION.pending + ORDER_STATUS_DISTRIBUTION.confirmed + ORDER_STATUS_DISTRIBUTION.processing + ORDER_STATUS_DISTRIBUTION.shipped + ORDER_STATUS_DISTRIBUTION.delivered) {
            orderStatus = OrderStatus.delivered;
          } else if (statusRoll < ORDER_STATUS_DISTRIBUTION.pending + ORDER_STATUS_DISTRIBUTION.confirmed + ORDER_STATUS_DISTRIBUTION.processing + ORDER_STATUS_DISTRIBUTION.shipped + ORDER_STATUS_DISTRIBUTION.delivered + ORDER_STATUS_DISTRIBUTION.cancelled) {
            orderStatus = OrderStatus.cancelled;
          } else {
            orderStatus = OrderStatus.refunded;
          }
          
          // Determine payment status
          const paymentRoll = Math.random();
          let paymentStatus: PaymentStatus;
          
          if (paymentRoll < PAYMENT_STATUS_DISTRIBUTION.pending) {
            paymentStatus = PaymentStatus.pending;
          } else if (paymentRoll < PAYMENT_STATUS_DISTRIBUTION.pending + PAYMENT_STATUS_DISTRIBUTION.paid) {
            paymentStatus = PaymentStatus.paid;
          } else if (paymentRoll < PAYMENT_STATUS_DISTRIBUTION.pending + PAYMENT_STATUS_DISTRIBUTION.paid + PAYMENT_STATUS_DISTRIBUTION.failed) {
            paymentStatus = PaymentStatus.failed;
          } else {
            paymentStatus = PaymentStatus.refunded;
          }
          
          // Get customer's addresses
          const customerAddresses = addresses.filter(a => a.profileId === customer.id);
          const shippingAddress = customerAddresses.length > 0 ? getRandomItems(customerAddresses, 1)[0] : null;
          const billingAddress = customerAddresses.length > 0 ? getRandomItems(customerAddresses, 1)[0] : null;
          
          // Determine if coupon should be applied (20% chance)
          let couponCode = null;
          let discountAmount = 0;
          if (coupons.length > 0 && Math.random() < 0.20) {
            const coupon = getRandomItems(coupons, 1)[0];
            couponCode = coupon.code;
          }
          
          // Generate order items
          const itemCount = getRandomInRange(1, 5);
          const orderVariants = getRandomItems(activeVariants, itemCount);
          
          let subtotal = 0;
          const orderItemsData = [];
          
          for (const variant of orderVariants) {
            const quantity = getRandomInRange(1, 3);
            const unitPrice = Number(variant.product.basePrice);
            const totalPrice = unitPrice * quantity;
            subtotal += totalPrice;
            
            const primaryImage = variant.product.images[0];
            
            orderItemsData.push({
              productId: variant.productId,
              variantId: variant.id,
              productName: variant.product.name,
              variantLabel: `${variant.size} - ${variant.color}`,
              sku: variant.sku,
              quantity,
              unitPrice,
              totalPrice,
              imageUrl: primaryImage?.url || null,
            });
          }
          
          // Calculate shipping (flat rate based on order value)
          const shippingCost = subtotal > 2000 ? 0 : 99;
          
          // Calculate tax (18% GST)
          const tax = subtotal * 0.18;
          
          // Calculate discount (simplified)
          if (couponCode) {
            discountAmount = subtotal * 0.10; // 10% discount
          }
          
          // Calculate total
          const total = subtotal + shippingCost + tax - discountAmount;
          
          // Generate order dates based on status
          const createdAt = getRandomDate(90, 1);
          let shippedAt = null;
          let deliveredAt = null;
          let cancelledAt = null;
          let refundedAt = null;
          
          if (orderStatus === OrderStatus.shipped || orderStatus === OrderStatus.delivered) {
            shippedAt = new Date(createdAt.getTime() + getRandomInRange(1, 3) * 24 * 60 * 60 * 1000);
          }
          if (orderStatus === OrderStatus.delivered) {
            deliveredAt = new Date(shippedAt!.getTime() + getRandomInRange(2, 5) * 24 * 60 * 60 * 1000);
          }
          if (orderStatus === OrderStatus.cancelled) {
            cancelledAt = new Date(createdAt.getTime() + getRandomInRange(1, 2) * 24 * 60 * 60 * 1000);
          }
          if (orderStatus === OrderStatus.refunded) {
            refundedAt = new Date(createdAt.getTime() + getRandomInRange(5, 10) * 24 * 60 * 60 * 1000);
          }
          
          // Create order
          const order = await context.prisma.order.create({
            data: {
              orderNumber: generateOrderNumber(orderCount),
              profileId: customer.id,
              email: customer.email,
              status: orderStatus,
              subtotal,
              shippingCost,
              tax,
              discount: discountAmount,
              couponCode,
              total,
              currency: 'INR',
              paymentMethod: 'razorpay',
              paymentStatus,
              shippingAddressId: shippingAddress?.id,
              billingAddressId: billingAddress?.id,
              shippedAt,
              deliveredAt,
              cancelledAt,
              refundedAt,
              createdAt,
            },
          });
          
          orderCount++;
          
          // Create order items
          for (const itemData of orderItemsData) {
            await context.prisma.orderItem.create({
              data: {
                orderId: order.id,
                ...itemData,
              },
            });
            orderItemCount++;
          }
          
          // Create order status history
          await context.prisma.orderStatusHistory.create({
            data: {
              orderId: order.id,
              status: orderStatus,
              note: `Order ${orderStatus}`,
              createdAt,
            },
          });
          
          // Create coupon redemption if coupon was used
          if (couponCode) {
            const coupon = coupons.find(c => c.code === couponCode);
            if (coupon) {
              await context.prisma.couponRedemption.create({
                data: {
                  couponId: coupon.id,
                  orderId: order.id,
                  profileId: customer.id,
                },
              });
            }
          }
        }
      }
      
      context.logger.success(`Seeded ${orderCount} orders with ${orderItemCount} items`);
      
      return {
        success: true,
        count: orderCount,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding orders:', error);
      return {
        success: false,
        count: orderCount,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(ordersModule);
