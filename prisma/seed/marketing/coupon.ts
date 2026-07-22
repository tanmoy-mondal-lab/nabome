/**
 * Coupon Seed
 * Seeds discount coupon
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { MARKETING_SLUGS } from '../utils/constants';
import type { coupons } from '@prisma/client';

export async function seedCoupon() {
  // eslint-disable-next-line no-console
  console.log('🎟️  Seeding coupons...');

  // Use a fixed UUID for coupon to ensure idempotency
  const couponId = '00000000-0000-0000-0000-000000000019';

  const coupon = await upsertByField<coupons>(
    prisma.coupons,
    { id: couponId },
    {
      id: couponId,
      code: MARKETING_SLUGS.coupon,
      description: 'Welcome discount for new customers',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_value: 999,
      max_discount: 500,
      usage_limit: 1000,
      used_count: 0,
      per_user_limit: 1,
      applicable_gender: null,
      is_active: true,
      start_date: new Date(),
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      updated_at: new Date(),
    },
    'Coupon'
  );

  // eslint-disable-next-line no-console
  console.log(`🎟️  Coupon code: ${MARKETING_SLUGS.coupon} (10% off, min ₹999)`);

  return coupon;
}
