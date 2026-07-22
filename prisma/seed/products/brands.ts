/**
 * Brands Seed
 * Seeds product brands
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { PRODUCT_SLUGS } from '../utils/constants';
import type { brands } from '@prisma/client';

export async function seedBrands() {
  // eslint-disable-next-line no-console
  console.log('🏷️  Seeding brands...');

  // Use a fixed UUID for brand to ensure idempotency
  const brandId = '00000000-0000-0000-0000-000000000009';

  const brand = await upsertByField<brands>(
    prisma.brands,
    { id: brandId },
    {
      id: brandId,
      name: 'NABOME Studio',
      slug: PRODUCT_SLUGS.brand,
      description: 'Our in-house brand featuring premium handcrafted ethnic wear',
      logo_url: null,
      logo_public_id: null,
      website_url: 'https://www.nabome.online',
      sort_order: 1,
      is_active: true,
      updated_at: new Date(),
    },
    'Brand'
  );

  return brand;
}
