/**
 * Notifications seed module
 * Seeds notification templates and actual notification instances
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';
import { NotificationEvent, NotificationChannel, OrderStatus } from '@prisma/client';

// Helper function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get random integer in range
function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const notificationsModule: SeedModule = {
  name: 'notifications',
  dependsOn: ['orders', 'customers'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let templateCount = 0;
    let notificationCount = 0;

    try {
      // Seed notification templates
      context.logger.info('Seeding notification templates...');
      
      const templates = [
        {
          event: 'order_placed' as const,
          subject: 'Order Placed Successfully',
          emailBody: 'Thank you for your order! Your order #{orderNumber} has been placed successfully.',
          smsBody: 'Your order #{orderNumber} has been placed successfully.',
          inAppBody: 'Order placed successfully',
        },
        {
          event: 'payment_success' as const,
          subject: 'Payment Successful',
          emailBody: 'Payment for order #{orderNumber} has been received successfully.',
          smsBody: 'Payment successful for order #{orderNumber}.',
          inAppBody: 'Payment successful',
        },
        {
          event: 'order_shipped' as const,
          subject: 'Order Shipped',
          emailBody: 'Your order #{orderNumber} has been shipped. Tracking number: #{trackingNumber}',
          smsBody: 'Order #{orderNumber} shipped. Track: #{trackingNumber}',
          inAppBody: 'Order shipped',
        },
        {
          event: 'order_delivered' as const,
          subject: 'Order Delivered',
          emailBody: 'Your order #{orderNumber} has been delivered successfully.',
          smsBody: 'Order #{orderNumber} delivered successfully.',
          inAppBody: 'Order delivered',
        },
        {
          event: 'welcome' as const,
          subject: 'Welcome to নবME',
          emailBody: 'Welcome to নবME! Thank you for joining us.',
          smsBody: 'Welcome to নবME!',
          inAppBody: 'Welcome to নবME',
        },
        {
          event: 'password_reset' as const,
          subject: 'Password Reset Request',
          emailBody: 'Click here to reset your password: #{resetLink}',
          smsBody: 'Reset password: #{resetLink}',
          inAppBody: 'Password reset requested',
        },
        {
          event: 'email_verification' as const,
          subject: 'Verify Your Email',
          emailBody: 'Please verify your email address: #{verificationLink}',
          smsBody: 'Verify email: #{verificationLink}',
          inAppBody: 'Email verification required',
        },
      ];

      for (const template of templates) {
        await context.prisma.notificationTemplate.upsert({
          where: { event: template.event },
          update: {
            subject: template.subject,
            emailBody: template.emailBody,
            smsBody: template.smsBody,
            inAppBody: template.inAppBody,
            isActive: true,
          },
          create: {
            ...template,
            isActive: true,
          },
        });
        templateCount++;
      }

      context.logger.success(`Seeded ${templateCount} notification templates`);
      
      // Seed actual notification instances based on orders
      context.logger.info('Seeding notification instances...');
      
      // Get orders to generate notifications for
      const orders = await context.prisma.order.findMany({
        where: {
          profileId: { not: null },
        },
        take: 100, // Limit to 100 orders for notifications
      });
      
      if (orders.length === 0) {
        context.logger.warn('No orders found for notifications');
        return { success: true, count: templateCount, duration: Date.now() - startTime };
      }
      
      context.logger.info(`Found ${orders.length} orders for notifications`);
      
      for (const order of orders) {
        // Create order placed notification
        await context.prisma.notification.create({
          data: {
            profileId: order.profileId,
            orderId: order.id,
            type: NotificationEvent.order_placed,
            channel: NotificationChannel.in_app,
            title: 'Order Placed Successfully',
            body: `Your order ${order.orderNumber} has been placed successfully.`,
            data: {
              orderNumber: order.orderNumber,
            },
            isRead: Math.random() < 0.7, // 70% read rate
            sentAt: order.createdAt,
            createdAt: order.createdAt,
          },
        });
        notificationCount++;
        
        // Create payment success notification for paid orders
        if (order.paymentStatus === 'paid') {
          await context.prisma.notification.create({
            data: {
              profileId: order.profileId,
              orderId: order.id,
              type: NotificationEvent.payment_success,
              channel: NotificationChannel.in_app,
              title: 'Payment Successful',
              body: `Payment for order ${order.orderNumber} has been received successfully.`,
              data: {
                orderNumber: order.orderNumber,
              },
              isRead: Math.random() < 0.6, // 60% read rate
              sentAt: new Date(order.createdAt.getTime() + 5 * 60 * 1000), // 5 minutes after order
              createdAt: new Date(order.createdAt.getTime() + 5 * 60 * 1000),
            },
          });
          notificationCount++;
        }
        
        // Create shipped notification for shipped orders
        if (order.status === OrderStatus.shipped || order.status === OrderStatus.delivered) {
          if (order.shippedAt) {
            await context.prisma.notification.create({
              data: {
                profileId: order.profileId,
                orderId: order.id,
                type: NotificationEvent.order_shipped,
                channel: NotificationChannel.in_app,
                title: 'Order Shipped',
                body: `Your order ${order.orderNumber} has been shipped. Tracking number: ${order.trackingNumber || 'N/A'}`,
                data: {
                  orderNumber: order.orderNumber,
                  trackingNumber: order.trackingNumber,
                },
                isRead: Math.random() < 0.5, // 50% read rate
                sentAt: order.shippedAt,
                createdAt: order.shippedAt,
              },
            });
            notificationCount++;
          }
        }
        
        // Create delivered notification for delivered orders
        if (order.status === OrderStatus.delivered) {
          if (order.deliveredAt) {
            await context.prisma.notification.create({
              data: {
                profileId: order.profileId,
                orderId: order.id,
                type: NotificationEvent.order_delivered,
                channel: NotificationChannel.in_app,
                title: 'Order Delivered',
                body: `Your order ${order.orderNumber} has been delivered successfully.`,
                data: {
                  orderNumber: order.orderNumber,
                },
                isRead: Math.random() < 0.4, // 40% read rate
                sentAt: order.deliveredAt,
                createdAt: order.deliveredAt,
              },
            });
            notificationCount++;
          }
        }
      }
      
      // Create welcome notifications for new customers
      const customers = await context.prisma.profile.findMany({
        where: { role: 'customer' },
        take: 10, // Limit to 10 customers
      });
      
      for (const customer of customers) {
        await context.prisma.notification.create({
          data: {
            profileId: customer.id,
            type: NotificationEvent.welcome,
            channel: NotificationChannel.in_app,
            title: 'Welcome to নবME',
            body: 'Welcome to নবME! Thank you for joining us.',
            isRead: Math.random() < 0.8, // 80% read rate
            sentAt: customer.createdAt,
            createdAt: customer.createdAt,
          },
        });
        notificationCount++;
      }
      
      context.logger.success(`Seeded ${notificationCount} notification instances`);
      
      return {
        success: true,
        count: templateCount + notificationCount,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding notifications:', error);
      return {
        success: false,
        count: templateCount + notificationCount,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(notificationsModule);
