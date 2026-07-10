/**
 * Product Attributes Seed
 * Seeds product attributes
 */

import { prisma } from '../utils/helpers';

export async function seedAttributes(productId: string) {
  console.log('🔖 Seeding product attributes...');

  const attributes = [
    {
      name: 'Fabric',
      value: 'Pure Cotton',
    },
    {
      name: 'Care',
      value: 'Dry Clean Only',
    },
    {
      name: 'Pattern',
      value: 'Embroidered',
    },
    {
      name: 'Occasion',
      value: 'Festive',
    },
  ];

  for (const attr of attributes) {
    // Check if attribute already exists
    const existing = await prisma.product_attributes.findFirst({
      where: {
        product_id: productId,
        name: attr.name,
      },
    });

    if (!existing) {
      await prisma.product_attributes.create({
        data: {
          id: crypto.randomUUID(),
          product_id: productId,
          name: attr.name,
          value: attr.value,
        },
      });
    }
  }

  return attributes;
}
