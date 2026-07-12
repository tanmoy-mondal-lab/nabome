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
      firstName: CUSTOMER_CREDENTIALS.firstName,
      lastName: CUSTOMER_CREDENTIALS.lastName,
      phone: CUSTOMER_CREDENTIALS.phone,
      role: 'customer',
      isActive: true,
      emailVerified: true,
      marketingOptIn: true,
      preferences: {
        language: 'en',
        currency: 'INR',
        notifications: {
          email: true,
          sms: false,
          inApp: true,
        },
      },
      notificationPreferences: {
        order_updates: true,
        promotions: true,
        newsletter: true,
      },
      updatedAt: new Date(),
    },
    'Customer'
  );

  // Initialize customer cart
  const cartId = '00000000-0000-0000-0000-000000000004';
  const cart = await prisma.carts.upsert({
    where: { id: cartId },
    create: {
      id: cartId,
      profileId: customer.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      updatedAt: new Date(),
    },
    update: {},
  });

  // Initialize loyalty points (skip if model doesn't exist)
  let loyaltyPoints = null;
  try {
    const loyaltyPointsId = '00000000-0000-0000-0000-000000000005';
    loyaltyPoints = await prisma.loyalty_points.upsert({
      where: { id: loyaltyPointsId },
      create: {
        id: loyaltyPointsId,
        profileId: customer.id,
        points: 0,
        tier: 'bronze',
        lifetimePoints: 0,
        updatedAt: new Date(),
      },
      update: {},
    });
  } catch (err) {
    console.log('⚠️  Loyalty points model not found, skipping');
  }

  console.log(`📧 Customer email: ${CUSTOMER_CREDENTIALS.email}`);

  return { customer, cart, loyaltyPoints };
}
