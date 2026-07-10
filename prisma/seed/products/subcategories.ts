/**
 * Subcategories Seed
 * Seeds product subcategories
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { PRODUCT_SLUGS } from '../utils/constants';
import type { subcategories } from '@prisma/client';

export async function seedSubcategories(categoryId: string) {
  console.log('📁 Seeding subcategories...');

  // Use a fixed UUID for subcategory to ensure idempotency
  const subcategoryId = '00000000-0000-0000-0000-000000000008';

  const subcategory = await upsertByField<subcategories>(
    prisma.subcategories,
    { id: subcategoryId },
    {
      id: subcategoryId,
      name: 'Embroidered Kurtas',
      slug: PRODUCT_SLUGS.subcategory,
      description: 'Kurtas featuring intricate hand embroidery work',
      image_url: null,
      image_public_id: null,
      category_id: categoryId,
      sort_order: 1,
      is_active: true,
      updated_at: new Date(),
    },
    'Subcategory'
  );

  return subcategory;
}
