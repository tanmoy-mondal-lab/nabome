/**
 * Investigate database relationships to understand foreign key issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigate() {
  // eslint-disable-next-line no-console
  console.log('🔍 Investigating database relationships...\n');

  // Check a sample product
  const sampleProduct = await prisma.product.findFirst();
  // eslint-disable-next-line no-console
  console.log('Sample Product:', sampleProduct?.id, sampleProduct?.name);
  // eslint-disable-next-line no-console
  console.log('Category ID:', sampleProduct?.categoryId);
  // eslint-disable-next-line no-console
  console.log('Brand ID:', sampleProduct?.brandId);

  if (sampleProduct?.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: sampleProduct.categoryId }
    });
    // eslint-disable-next-line no-console
    console.log('Category exists:', !!category);
  }

  if (sampleProduct?.brandId) {
    const brand = await prisma.brand.findUnique({
      where: { id: sampleProduct.brandId }
    });
    // eslint-disable-next-line no-console
    console.log('Brand exists:', !!brand);
  }

  // eslint-disable-next-line no-console
  console.log('\n---\n');

  // Check all products with their relationships
  const products = await prisma.product.findMany({
    include: {
      category: true,
      brand: true,
      variants: true,
      images: true
    },
    take: 5
  });

  // eslint-disable-next-line no-console
  console.log('Products with relationships:');
  for (const product of products) {
    // eslint-disable-next-line no-console
    console.log(`Product: ${product.name}`);
    // eslint-disable-next-line no-console
    console.log(`  Category: ${product.category?.name || 'NULL'} (ID: ${product.categoryId})`);
    // eslint-disable-next-line no-console
    console.log(`  Brand: ${product.brand?.name || 'NULL'} (ID: ${product.brandId})`);
    // eslint-disable-next-line no-console
    console.log(`  Variants: ${product.variants.length}`);
    // eslint-disable-next-line no-console
    console.log(`  Images: ${product.images.length}`);
    // eslint-disable-next-line no-console
    console.log();
  }

  // Check all categories
  const categories = await prisma.category.findMany();
  // eslint-disable-next-line no-console
  console.log(`Total categories: ${categories.length}`);
  // eslint-disable-next-line no-console
  console.log('Category IDs:', categories.map(c => c.id));

  // Check all brands
  const brands = await prisma.brand.findMany();
  // eslint-disable-next-line no-console
  console.log(`Total brands: ${brands.length}`);
  // eslint-disable-next-line no-console
  console.log('Brand IDs:', brands.map(b => b.id));

  // Check product images
  const images = await prisma.productImage.findMany({
    include: {
      product: true
    },
    take: 5
  });

  // eslint-disable-next-line no-console
  console.log('\nSample product images:');
  for (const image of images) {
    // eslint-disable-next-line no-console
    console.log(`Image ID: ${image.id}, Product ID: ${image.productId}`);
    // eslint-disable-next-line no-console
    console.log(`  Product exists: ${!!image.product}`);
    // eslint-disable-next-line no-console
    console.log();
  }

  // Check product variants
  const variants = await prisma.productVariant.findMany({
    include: {
      product: true
    },
    take: 5
  });

  // eslint-disable-next-line no-console
  console.log('Sample product variants:');
  for (const variant of variants) {
    // eslint-disable-next-line no-console
    console.log(`Variant ID: ${variant.id}, Product ID: ${variant.productId}`);
    // eslint-disable-next-line no-console
    console.log(`  Product exists: ${!!variant.product}`);
    // eslint-disable-next-line no-console
    console.log();
  }
}

investigate()
  // eslint-disable-next-line no-console
  .catch(console.error)
  .finally(() => prisma.$disconnect());
