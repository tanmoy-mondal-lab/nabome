/**
 * Product Variants Seed
 * Seeds product variants (size/color combinations)
 */

import { prisma } from '../utils/helpers';
import type { product_variants } from '@prisma/client';

export async function seedVariants(productId: string) {
  console.log('🎨 Seeding product variants...');

  const variants = [
    {
      sku: 'NAB-KURTA-ROYAL-S-BLACK',
      size: 'S',
      color: 'Black',
      color_hex: '#000000',
      price_adjustment: 0,
      stock: 10,
      reserved_stock: 0,
      weight: 0.5,
    },
    {
      sku: 'NAB-KURTA-ROYAL-M-BLACK',
      size: 'M',
      color: 'Black',
      color_hex: '#000000',
      price_adjustment: 0,
      stock: 15,
      reserved_stock: 0,
      weight: 0.5,
    },
    {
      sku: 'NAB-KURTA-ROYAL-L-BLACK',
      size: 'L',
      color: 'Black',
      color_hex: '#000000',
      price_adjustment: 0,
      stock: 12,
      reserved_stock: 0,
      weight: 0.5,
    },
    {
      sku: 'NAB-KURTA-ROYAL-S-MAROON',
      size: 'S',
      color: 'Maroon',
      color_hex: '#800000',
      price_adjustment: 0,
      stock: 8,
      reserved_stock: 0,
      weight: 0.5,
    },
    {
      sku: 'NAB-KURTA-ROYAL-M-MAROON',
      size: 'M',
      color: 'Maroon',
      color_hex: '#800000',
      price_adjustment: 0,
      stock: 10,
      reserved_stock: 0,
      weight: 0.5,
    },
  ];

  const createdVariants: product_variants[] = [];

  for (const variant of variants) {
    const created = await prisma.product_variants.upsert({
      where: { sku: variant.sku },
      create: {
        id: crypto.randomUUID(),
        ...variant,
        product_id: productId,
        is_active: true,
        updated_at: new Date(),
      },
      update: {},
    });
    createdVariants.push(created);
  }

  return createdVariants;
}
