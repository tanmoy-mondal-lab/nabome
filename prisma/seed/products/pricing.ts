/**
 * Pricing Seed
 * Seeds product pricing and label/tag associations
 */

import { prisma } from '../utils/helpers';

export async function seedPricing(productId: string, labelId: string, tagId: string) {
  // eslint-disable-next-line no-console
  console.log('💰 Seeding pricing and associations...');

  // Associate product with label
  await prisma.product_labels_products.upsert({
    where: {
      product_id_label_id: {
        product_id: productId,
        label_id: labelId,
      },
    },
    create: {
      product_id: productId,
      label_id: labelId,
    },
    update: {},
  });

  // Associate product with tag
  await prisma.product_tags_products.upsert({
    where: {
      product_id_tag_id: {
        product_id: productId,
        tag_id: tagId,
      },
    },
    create: {
      product_id: productId,
      tag_id: tagId,
    },
    update: {},
  });

  // eslint-disable-next-line no-console
  console.log('Associated product with label and tag');

  return { productId, labelId, tagId };
}
