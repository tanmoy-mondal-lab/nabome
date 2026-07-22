/**
 * Products Seed
 * Seeds premium product
 */

import { prisma } from '../utils/helpers';
import { upsertByField } from '../utils/upsert';
import { PRODUCT_SLUGS } from '../utils/constants';
import type { products } from '@prisma/client';

export async function seedProducts(
  categoryId: string,
  subcategoryId: string,
  collectionId: string,
  brandId: string,
  sizeGuideId: string
) {
  // eslint-disable-next-line no-console
  console.log('👕 Seeding products...');

  // Use a fixed UUID for product to ensure idempotency
  const productId = '00000000-0000-0000-0000-000000000014';

  const product = await upsertByField<products>(
    prisma.products,
    { id: productId },
    {
      id: productId,
      name: 'Royal Embroidered Kurta',
      slug: PRODUCT_SLUGS.product,
      description: 'Exquisite hand-embroidered kurta crafted from premium cotton fabric. Features intricate traditional embroidery patterns with contemporary styling. Perfect for festive occasions and celebrations.',
      short_description: 'Premium hand-embroidered cotton kurta with traditional patterns',
      category_id: categoryId,
      subcategory_id: subcategoryId,
      collection_id: collectionId,
      brand_id: brandId,
      base_price: 2499,
      compare_at_price: 3499,
      cost_price: 1200,
      sale_price: null,
      discount_percent: 29,
      currency: 'INR',
      material: 'Pure Cotton',
      care_instructions: 'Dry Clean Only',
      size_chart_url: null,
      size_chart_public_id: null,
      size_guide_id: sizeGuideId,
      is_active: true,
      is_featured: true,
      is_new: true,
      gender: 'unisex',
      sort_order: 1,
      published_at: new Date(),
      scheduled_publish_at: null,
      scheduled_archive_at: null,
      meta_title: 'Royal Embroidered Kurta | NABOME',
      meta_desc: 'Premium hand-embroidered cotton kurta with traditional patterns. Perfect for festive occasions.',
      updated_at: new Date(),
    },
    'Product'
  );

  return product;
}
