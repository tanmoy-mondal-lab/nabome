/**
 * Related products seeding
 * Generates related product relationships
 */

import type { PrismaClient } from '@prisma/client';
import { getRandomItem, getRandomItems, getRandomInRange } from './data';

const RELATED_PRODUCT_TYPES = ['related', 'similar', 'frequently_bought_together', 'recommended'];

/**
 * Generate related product relationships
 */
export async function seedRelatedProducts(
  prisma: PrismaClient,
  count: number = 100
): Promise<number> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, categoryId: true, subcategoryId: true },
  });

  if (products.length < 2) {
    console.log('Not enough products to create relationships');
    return 0;
  }

  let relationshipCount = 0;

  for (let i = 0; i < count; i++) {
    const sourceProduct = getRandomItem(products);
    const type = getRandomItem(RELATED_PRODUCT_TYPES);

    // Find related products (same category or subcategory)
    const relatedProducts = products.filter(
      p => 
        p.id !== sourceProduct.id && 
        (p.categoryId === sourceProduct.categoryId || 
         p.subcategoryId === sourceProduct.subcategoryId)
    );

    if (relatedProducts.length === 0) continue;

    // Select 1-4 related products
    const numRelated = getRandomInRange(1, Math.min(4, relatedProducts.length));
    const selectedProducts = getRandomItems(relatedProducts, numRelated);

    for (const targetProduct of selectedProducts) {
      try {
        // Check if relationship already exists
        const existing = await prisma.relatedProduct.findUnique({
          where: {
            sourceId_targetId_type: {
              sourceId: sourceProduct.id,
              targetId: targetProduct.id,
              type,
            },
          },
        });

        if (existing) continue;

        await prisma.relatedProduct.create({
          data: {
            sourceId: sourceProduct.id,
            targetId: targetProduct.id,
            type,
            sortOrder: getRandomInRange(0, 10),
          },
        });

        relationshipCount++;
      } catch (error) {
        // Ignore duplicate errors
        continue;
      }
    }
  }

  return relationshipCount;
}
