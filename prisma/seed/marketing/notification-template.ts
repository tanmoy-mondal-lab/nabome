/**
 * Notification Template Seed
 * Seeds notification templates
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import type { notification_templates } from '@prisma/client';

export async function seedNotificationTemplates() {
  // eslint-disable-next-line no-console
  console.log('🔔 Seeding notification templates...');

  // Use fixed UUIDs for notification templates to ensure idempotency
  const orderPlacedId = '00000000-0000-0000-0000-000000000020';
  const paymentSuccessId = '00000000-0000-0000-0000-000000000021';
  const orderShippedId = '00000000-0000-0000-0000-000000000022';

  const orderPlaced = await upsertByField<notification_templates>(
    prisma.notification_templates,
    { id: orderPlacedId },
    {
      id: orderPlacedId,
      event: 'order_placed',
      subject: 'Order Confirmation - Your order #{{orderNumber}} has been placed',
      email_body: 'Dear {{customerName}},\n\nThank you for your order! Your order #{{orderNumber}} has been successfully placed.\n\nOrder Details:\n{{orderDetails}}\n\nWe will notify you when your order is shipped.\n\nThank you for shopping with NABOME!',
      sms_body: 'Your order #{{orderNumber}} has been placed successfully. Thank you for shopping with NABOME!',
      in_app_body: 'Order #{{orderNumber}} placed successfully',
      is_active: true,
      updated_at: new Date(),
    },
    'NotificationTemplate-OrderPlaced'
  );

  const paymentSuccess = await upsertByField<notification_templates>(
    prisma.notification_templates,
    { id: paymentSuccessId },
    {
      id: paymentSuccessId,
      event: 'payment_success',
      subject: 'Payment Successful - Order #{{orderNumber}}',
      email_body: 'Dear {{customerName}},\n\nPayment for your order #{{orderNumber}} has been successfully processed.\n\nAmount: ₹{{amount}}\n\nThank you for shopping with NABOME!',
      sms_body: 'Payment successful for order #{{orderNumber}}. Amount: ₹{{amount}}',
      in_app_body: 'Payment successful',
      is_active: true,
      updated_at: new Date(),
    },
    'NotificationTemplate-PaymentSuccess'
  );

  const orderShipped = await upsertByField<notification_templates>(
    prisma.notification_templates,
    { id: orderShippedId },
    {
      id: orderShippedId,
      event: 'order_shipped',
      subject: 'Order Shipped - Your order #{{orderNumber}} is on the way',
      email_body: 'Dear {{customerName}},\n\nGreat news! Your order #{{orderNumber}} has been shipped.\n\nTracking Number: {{trackingNumber}}\nCarrier: {{carrier}}\n\nExpected Delivery: {{expectedDelivery}}\n\nTrack your order here: {{trackingUrl}}',
      sms_body: 'Your order #{{orderNumber}} has been shipped. Tracking: {{trackingNumber}}',
      in_app_body: 'Order shipped',
      is_active: true,
      updated_at: new Date(),
    },
    'NotificationTemplate-OrderShipped'
  );

  return { orderPlaced, paymentSuccess, orderShipped };
}
