/**
 * Seed — development-only baseline data (run: `pnpm db:seed`).
 * Creates: admin user, categories, one brand, one collection, sample
 * products with variants. Never run against production.
 *
 * This script is idempotent - it can be run multiple times safely.
 * Uses upsert operations to avoid duplicate data.
 */
/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Starting seed...');

  // Create admin user (idempotent)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nabome.online' },
    update: {},
    create: {
      email: 'admin@nabome.online',
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'admin',
      status: 'active',
      emailVerifiedAt: new Date(),
      locale: 'en-IN',
    },
  });
  console.log('✓ Admin user:', admin.id);

  // Create categories (idempotent)
  const categories = ['Jewelry', 'Décor', 'Craft & Art'];
  const categoryMap: Record<string, string> = {};
  for (const name of categories) {
    const category = await prisma.category.upsert({
      where: { slug: name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `${name} collection`,
      },
    });
    categoryMap[name] = category.id;
    console.log('✓ Category:', category.name, category.id);
  }

  // Create brand (idempotent)
  const brand = await prisma.brand.upsert({
    where: { slug: 'nabome-house' },
    update: {},
    create: { name: 'Nabome House', slug: 'nabome-house' },
  });
  console.log('✓ Brand:', brand.name, brand.id);

  // Create shop (idempotent)
  const shop = await prisma.shop.upsert({
    where: { slug: 'nabome-house-shop' },
    update: {},
    create: {
      ownerId: admin.id,
      name: 'Nabome House Shop',
      slug: 'nabome-house-shop',
      status: 'active',
    },
  });
  console.log('✓ Shop:', shop.name, shop.id);

  // Create collection (idempotent)
  const collection = await prisma.collection.upsert({
    where: { slug: 'new-arrivals' },
    update: {},
    create: { name: 'New Arrivals', slug: 'new-arrivals' },
  });
  console.log('✓ Collection:', collection.name, collection.id);

  // Create sample product (idempotent)
  const jewelry = await prisma.category.findUnique({
    where: { slug: 'jewelry' },
  });

  if (jewelry) {
    const product = await prisma.product.upsert({
      where: { slug: 'signature-bronze-necklace' },
      update: {},
      create: {
        categoryId: jewelry.id,
        brandId: brand.id,
        shopId: shop.id,
        name: 'Signature Bronze Necklace',
        slug: 'signature-bronze-necklace',
        shortDescription: 'Hand-finished bronze pendant necklace',
        status: 'published',
        basePrice: 2499,
        compareAtPrice: 2999,
        weightGrams: 40,
        collections: {
          create: { collectionId: collection.id },
        },
        variants: {
          create: [
            {
              sku: 'NBN-LNK-BRZ-001',
              name: 'Bronze / 18 inch',
              attributes: { color: 'bronze', length: '18in' },
              price: 2499,
              availableStock: 25,
              inventoryStatus: 'in_stock',
            },
          ],
        },
        media: {
          create: [
            {
              url: '/media/placeholder-necklace.svg',
              altText: 'Signature Bronze Necklace',
              sortOrder: 1,
            },
          ],
        },
      },
    });
    console.log('✓ Product:', product.name, product.id);
  }

  console.log('✓ Seed complete.');
}

main()
  .catch((error) => {
    console.error('✗ Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
