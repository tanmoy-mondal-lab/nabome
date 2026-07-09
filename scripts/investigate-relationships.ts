/**
 * Investigate database relationships to understand foreign key issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigate() {
  console.log('🔍 Investigating database relationships...\n');

  // Check a sample product
  const sampleProduct = await prisma.product.findFirst();
  console.log('Sample Product:', sampleProduct?.id, sampleProduct?.name);
  console.log('Category ID:', sampleProduct?.categoryId);
  console.log('Brand ID:', sampleProduct?.brandId);

  if (sampleProduct?.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: sampleProduct.categoryId }
    });
    console.log('Category exists:', !!category);
  }

  if (sampleProduct?.brandId) {
    const brand = await prisma.brand.findUnique({
      where: { id: sampleProduct.brandId }
    });
    console.log('Brand exists:', !!brand);
  }

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

  console.log('Products with relationships:');
  for (const product of products) {
    console.log(`Product: ${product.name}`);
    console.log(`  Category: ${product.category?.name || 'NULL'} (ID: ${product.categoryId})`);
    console.log(`  Brand: ${product.brand?.name || 'NULL'} (ID: ${product.brandId})`);
    console.log(`  Variants: ${product.variants.length}`);
    console.log(`  Images: ${product.images.length}`);
    console.log();
  }

  // Check all categories
  const categories = await prisma.category.findMany();
  console.log(`Total categories: ${categories.length}`);
  console.log('Category IDs:', categories.map(c => c.id));

  // Check all brands
  const brands = await prisma.brand.findMany();
  console.log(`Total brands: ${brands.length}`);
  console.log('Brand IDs:', brands.map(b => b.id));

  // Check product images
  const images = await prisma.productImage.findMany({
    include: {
      product: true
    },
    take: 5
  });

  console.log('\nSample product images:');
  for (const image of images) {
    console.log(`Image ID: ${image.id}, Product ID: ${image.productId}`);
    console.log(`  Product exists: ${!!image.product}`);
    console.log();
  }

  // Check product variants
  const variants = await prisma.productVariant.findMany({
    include: {
      product: true
    },
    take: 5
  });

  console.log('Sample product variants:');
  for (const variant of variants) {
    console.log(`Variant ID: ${variant.id}, Product ID: ${variant.productId}`);
    console.log(`  Product exists: ${!!variant.product}`);
    console.log();
  }
}

investigate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
