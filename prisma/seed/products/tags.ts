/**
 * Product Tags Seed
 * Seeds product tags
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { PRODUCT_SLUGS } from '../utils/constants';
import type { product_tags } from '@prisma/client';

export async function seedTags() {
  // eslint-disable-next-line no-console
  console.log('🏷️  Seeding product tags...');

  // Use a fixed UUID for tag to ensure idempotency
  const tagId = '00000000-0000-0000-0000-000000000012';

  const tag = await upsertByField<product_tags>(
    prisma.product_tags,
    { id: tagId },
    {
      id: tagId,
      name: 'Handcrafted',
      slug: PRODUCT_SLUGS.tag,
    },
    'ProductTag'
  );

  return tag;
}
