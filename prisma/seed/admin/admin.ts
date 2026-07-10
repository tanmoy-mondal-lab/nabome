/**
 * Admin Seed
 * Seeds production administrator account
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { ADMIN_CREDENTIALS } from '../utils/constants';

export async function seedAdmin() {
  console.log('👤 Seeding admin account...');

  // Note: Password should be hashed in production
  // For seed purposes, we use a placeholder that should be changed on first login
  const defaultPassword = 'Admin@123'; // CHANGE ON FIRST LOGIN

  // Use a fixed UUID for admin to ensure idempotency
  const adminId = '00000000-0000-0000-0000-000000000002';

  const admin = await upsertByField(
    prisma.profiles,
    { email: ADMIN_CREDENTIALS.email },
    {
      id: adminId,
      email: ADMIN_CREDENTIALS.email,
      first_name: ADMIN_CREDENTIALS.firstName,
      last_name: ADMIN_CREDENTIALS.lastName,
      phone: ADMIN_CREDENTIALS.phone,
      role: 'admin',
      is_active: true,
      email_verified: true,
      marketing_opt_in: false,
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
        promotions: false,
        newsletter: false,
      },
      updated_at: new Date(),
    },
    'Admin'
  );

  // Log warning about default password
  console.log('⚠️  WARNING: Default admin password is "Admin@123" - CHANGE ON FIRST LOGIN');
  console.log(`📧 Admin email: ${ADMIN_CREDENTIALS.email}`);

  return admin;
}
