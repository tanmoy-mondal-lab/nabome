/**
 * Customer Seed
 * Seeds a verified customer account
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { CUSTOMER_CREDENTIALS } from '../utils/constants';
import type { profiles } from '@prisma/client';

export async function seedCustomer() {
  console.log('👤 Seeding customer account...');

  // Use a fixed UUID for customer to ensure idempotency
  const customerId = '00000000-0000-0000-0000-000000000003';

  const customer = await upsertByField<profiles>(
    prisma.profiles,
    { email: CUSTOMER_CREDENTIALS.email },
    {
      id: customerId,
      email: CUSTOMER_CREDENTIALS.email,
      first_name: CUSTOMER_CREDENTIALS.firstName,
      last_name: CUSTOMER_CREDENTIALS.lastName,
      phone: CUSTOMER_CREDENTIALS.phone,
      role: 'customer',
      is_active: true,
      email_verified: true,
      marketing_opt_in: true,
      preferences: {
        language: 'en',
        currency: 'INR',
        notifications: {
          email: true,
          sms: false,
          inApp: true,
        },
      },
      notification_preferences: {
        order_updates: true,
        promotions: true,
        newsletter: true,
      },
      updated_at: new Date(),
    },
    'Customer'
  );

  // Initialize customer cart
  const cartId = '00000000-0000-0000-0000-000000000004';
  const cart = await prisma.carts.upsert({
    where: { id: cartId },
    create: {
      id: cartId,
      profile_id: customer.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      updated_at: new Date(),
    },
    update: {},
  });

  // Initialize loyalty points
  const loyaltyPointsId = '00000000-0000-0000-0000-000000000005';
  const loyaltyPoints = await prisma.loyalty_points.upsert({
    where: { id: loyaltyPointsId },
    create: {
      id: loyaltyPointsId,
      profile_id: customer.id,
      points: 0,
      tier: 'bronze',
      lifetime_points: 0,
      updated_at: new Date(),
    },
    update: {},
  });

  console.log(`📧 Customer email: ${CUSTOMER_CREDENTIALS.email}`);

  return { customer, cart, loyaltyPoints };
}
