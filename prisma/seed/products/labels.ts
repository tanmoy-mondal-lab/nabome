/**
 * Product Labels Seed
 * Seeds product labels
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { PRODUCT_SLUGS } from '../utils/constants';
import type { product_labels } from '@prisma/client';

export async function seedLabels() {
  console.log('🏷️  Seeding product labels...');

  // Use a fixed UUID for label to ensure idempotency
  const labelId = '00000000-0000-0000-0000-000000000011';

  const label = await upsertByField<product_labels>(
    prisma.product_labels,
    { id: labelId },
    {
      id: labelId,
      name: 'New Arrival',
      slug: PRODUCT_SLUGS.label,
      color: '#FF6B6B',
    },
    'ProductLabel'
  );

  return label;
}
