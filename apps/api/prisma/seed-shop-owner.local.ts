import { PrismaClient } from '@prisma/client';

import { hashPassword } from '../_lib/auth/password.ts';

const DATABASE_URL = process.env.DATABASE_URL ?? '';
const ENVIRONMENT = process.env.ENVIRONMENT;

if (
  !DATABASE_URL ||
  (!DATABASE_URL.includes('localhost') && !DATABASE_URL.includes('127.0.0.1'))
) {
  console.error(
    '✗ SAFETY GUARD: DATABASE_URL must contain localhost or 127.0.0.1 — refusing to run against non-local database',
  );
  process.exit(1);
}

if (
  DATABASE_URL.includes('neon.tech') ||
  DATABASE_URL.includes('hyperdrive') ||
  DATABASE_URL.includes('pooler')
) {
  console.error(
    '✗ SAFETY GUARD: DATABASE_URL appears to target Neon/Hyperdrive — refusing to run',
  );
  process.exit(1);
}

if (ENVIRONMENT !== undefined && ENVIRONMENT !== 'local') {
  console.error(
    '✗ SAFETY GUARD: ENVIRONMENT must be "local" — refusing to run',
  );
  process.exit(1);
}

if (
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'staging'
) {
  console.error(
    '✗ SAFETY GUARD: NODE_ENV indicates production/staging — refusing to run',
  );
  process.exit(1);
}

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Starting local shop-owner fixture...');

  const testUserEmail = 'shop-owner.local@nabome.test';
  const testPassword = 'LocalShopOwner123!';

  const passwordHash = await hashPassword(testPassword);

  const user = await prisma.user.upsert({
    where: { email: testUserEmail },
    update: {
      role: 'shop_owner',
      status: 'active',
      emailVerifiedAt: new Date(),
      locale: 'en-IN',
      isActive: true,
      passwordHash,
      firstName: 'Test',
      lastName: 'ShopOwner',
    },
    create: {
      email: testUserEmail,
      firstName: 'Test',
      lastName: 'ShopOwner',
      passwordHash,
      role: 'shop_owner',
      status: 'active',
      emailVerifiedAt: new Date(),
      locale: 'en-IN',
      isActive: true,
    },
  });
  console.log('✓ User:', user.id);

  const jewelry = await prisma.category.upsert({
    where: { slug: 'jewelry' },
    update: {},
    create: {
      name: 'Jewelry',
      slug: 'jewelry',
      description: 'Handcrafted jewelry',
    },
  });
  console.log('✓ Category:', jewelry.id);

  const brand = await prisma.brand.upsert({
    where: { slug: 'nabome-house' },
    update: {},
    create: { name: 'Nabome House', slug: 'nabome-house' },
  });
  console.log('✓ Brand:', brand.id);

  const shop = await prisma.shop.upsert({
    where: { slug: 'test-shop-owner-local' },
    update: {
      ownerId: user.id,
      status: 'active',
      isActive: true,
    },
    create: {
      ownerId: user.id,
      name: 'Test Shop Owner Local',
      slug: 'test-shop-owner-local',
      status: 'active',
      isActive: true,
    },
  });
  console.log('✓ Shop:', shop.id);

  const product = await prisma.product.upsert({
    where: { slug: 'test-media-product-local' },
    update: {
      status: 'published',
      isActive: true,
      categoryId: jewelry.id,
      shopId: shop.id,
      brandId: brand.id,
    },
    create: {
      categoryId: jewelry.id,
      shopId: shop.id,
      brandId: brand.id,
      name: 'Test Media Product Local',
      slug: 'test-media-product-local',
      shortDescription: 'Local fixture product for media upload testing',
      description: 'Deterministic product owned by local shop_owner fixture',
      status: 'published',
      isActive: true,
      basePrice: 2499,
    },
  });
  console.log('✓ Product:', product.id);

  const variant = await prisma.productVariant.upsert({
    where: { sku: 'NBN-TEST-MEDIA-001' },
    update: {
      productId: product.id,
      name: 'Test Variant / Default',
      price: 2499,
      availableStock: 25,
      inventoryStatus: 'in_stock',
      isActive: true,
    },
    create: {
      productId: product.id,
      sku: 'NBN-TEST-MEDIA-001',
      name: 'Test Variant / Default',
      price: 2499,
      availableStock: 25,
      inventoryStatus: 'in_stock',
      isActive: true,
    },
  });
  console.log('✓ Variant:', variant.id);

  console.log('✓ Local shop-owner fixture complete.');
}

main()
  .catch((error) => {
    console.error('✗ Seed failed');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
