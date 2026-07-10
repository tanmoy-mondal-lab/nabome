/**
 * Size Guides Seed
 * Seeds size guide charts
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { PRODUCT_SLUGS } from '../utils/constants';
import type { size_guides } from '@prisma/client';

export async function seedSizeGuides(categoryId: string) {
  console.log('📏 Seeding size guides...');

  // Use a fixed UUID for size guide to ensure idempotency
  const sizeGuideId = '00000000-0000-0000-0000-000000000013';

  const sizeGuide = await upsertByField<size_guides>(
    prisma.size_guides,
    { id: sizeGuideId },
    {
      id: sizeGuideId,
      name: 'Clothing Size Guide',
      slug: PRODUCT_SLUGS.sizeGuide,
      description: 'Standard size chart for our clothing collection',
      category_id: categoryId,
      type: 'clothing',
      unit: 'inches',
      image_url: null,
      image_public_id: null,
      measurements: {
        XS: { chest: 36, length: 38, shoulder: 14 },
        S: { chest: 38, length: 40, shoulder: 15 },
        M: { chest: 40, length: 42, shoulder: 16 },
        L: { chest: 42, length: 44, shoulder: 17 },
        XL: { chest: 44, length: 46, shoulder: 18 },
        XXL: { chest: 46, length: 48, shoulder: 19 },
      },
      is_active: true,
      updated_at: new Date(),
    },
    'SizeGuide'
  );

  return sizeGuide;
}
