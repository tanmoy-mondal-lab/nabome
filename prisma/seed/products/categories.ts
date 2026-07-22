/**
 * Categories Seed
 * Seeds product categories
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { PRODUCT_SLUGS } from '../utils/constants';
import type { categories } from '@prisma/client';

export async function seedCategories() {
  // eslint-disable-next-line no-console
  console.log('📂 Seeding categories...');

  // Use a fixed UUID for category to ensure idempotency
  const categoryId = '00000000-0000-0000-0000-000000000007';

  const category = await upsertByField<categories>(
    prisma.categories,
    { id: categoryId },
    {
      id: categoryId,
      name: 'Premium Kurtas',
      slug: PRODUCT_SLUGS.category,
      description: 'Handcrafted premium kurtas featuring traditional embroidery and contemporary designs',
      image_url: null,
      image_public_id: null,
      parent_id: null,
      sort_order: 1,
      is_active: true,
      meta_title: 'Premium Kurtas | NABOME',
      meta_desc: 'Discover our collection of handcrafted premium kurtas with traditional embroidery',
      updated_at: new Date(),
    },
    'Category'
  );

  return category;
}
