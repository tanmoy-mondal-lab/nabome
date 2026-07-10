/**
 * Inventory Seed
 * Seeds inventory records and movements
 */

import { prisma } from '../utils/helpers';

export async function seedInventory(variantIds: string[]) {
  console.log('📦 Seeding inventory...');

  // Create inventory movements for initial stock
  for (const variantId of variantIds) {
    const variant = await prisma.product_variants.findUnique({
      where: { id: variantId },
    });

    if (variant) {
      await prisma.inventory_movements.create({
        data: {
          id: crypto.randomUUID(),
          variant_id: variantId,
          quantity_change: variant.stock,
          stock_after: variant.stock,
          reason: 'initial_stock',
          reference_id: null,
          note: 'Initial inventory from seed',
        },
      });
    }
  }

  console.log(`Created inventory movements for ${variantIds.length} variants`);

  return variantIds;
}
