/**
 * Database Verification Script
 * Checks foreign keys, references, relationships, orphan records, duplicates, and media relationships
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VerificationResult {
  category: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

const results: VerificationResult[] = [];

async function verifyDatabase() {
  console.log('🔍 Starting Database Verification...\n');

  // 1. Check all tables exist and have data
  await checkTableCounts();

  // 2. Check foreign key relationships
  await checkForeignKeys();

  // 3. Check for orphan records
  await checkOrphanRecords();

  // 4. Check for duplicate records
  await checkDuplicateRecords();

  // 5. Check media relationships
  await checkMediaRelationships();

  // 6. Check data integrity
  await checkDataIntegrity();

  // Print summary
  printSummary();
}

async function checkTableCounts() {
  console.log('📊 Checking table counts...');
  
  const tables = [
    'profile',
    'category',
    'subcategory',
    'collection',
    'brand',
    'product',
    'productVariant',
    'productImage',
    'order',
    'orderItem',
    'mediaAsset',
    'coupon',
    'review',
    'address',
    'cart',
    'wishlistItem',
  ];

  for (const table of tables) {
    try {
      // @ts-expect-error dynamic table access
      const count = await prisma[table].count();
      console.log(`  ✓ ${table}: ${count} records`);
      results.push({
        category: 'Table Counts',
        status: 'PASS',
        message: `${table} has ${count} records`,
        details: { table, count }
      });
    } catch (error) {
      console.log(`  ✗ ${table}: Error - ${error}`);
      results.push({
        category: 'Table Counts',
        status: 'FAIL',
        message: `${table} check failed`,
        details: { table, error: String(error) }
      });
    }
  }
  console.log();
}

async function checkForeignKeys() {
  console.log('🔗 Checking foreign key relationships...');

  // Check products with invalid category references
  const productsWithCategory = await prisma.product.findMany({
    where: { categoryId: { not: null } },
    include: { category: true }
  });

  const invalidCategoryProducts = productsWithCategory.filter(p => !p.category);

  if (invalidCategoryProducts.length > 0) {
    results.push({
      category: 'Foreign Keys',
      status: 'FAIL',
      message: `${invalidCategoryProducts.length} products have invalid category references`,
      details: { count: invalidCategoryProducts.length }
    });
  } else {
    results.push({
      category: 'Foreign Keys',
      status: 'PASS',
      message: 'All product category references are valid'
    });
  }

  // Check products with invalid brand references
  const productsWithBrand = await prisma.product.findMany({
    where: { brandId: { not: null } },
    include: { brand: true }
  });

  const invalidBrandProducts = productsWithBrand.filter(p => !p.brand);

  if (invalidBrandProducts.length > 0) {
    results.push({
      category: 'Foreign Keys',
      status: 'FAIL',
      message: `${invalidBrandProducts.length} products have invalid brand references`,
      details: { count: invalidBrandProducts.length }
    });
  } else {
    results.push({
      category: 'Foreign Keys',
      status: 'PASS',
      message: 'All product brand references are valid'
    });
  }

  // Check order items with invalid product references
  const orderItems = await prisma.orderItem.findMany({
    include: { product: true }
  });

  const invalidOrderItems = orderItems.filter(oi => !oi.product);

  if (invalidOrderItems.length > 0) {
    results.push({
      category: 'Foreign Keys',
      status: 'FAIL',
      message: `${invalidOrderItems.length} order items have invalid product references`,
      details: { count: invalidOrderItems.length }
    });
  } else {
    results.push({
      category: 'Foreign Keys',
      status: 'PASS',
      message: 'All order item product references are valid'
    });
  }

  console.log('  ✓ Foreign key checks completed\n');
}

async function checkOrphanRecords() {
  console.log('👻 Checking for orphan records...');

  // Check product images without valid products
  const productImages = await prisma.productImage.findMany({
    include: { product: true }
  });

  const orphanImages = productImages.filter(img => !img.product);

  if (orphanImages.length > 0) {
    results.push({
      category: 'Orphan Records',
      status: 'FAIL',
      message: `${orphanImages.length} product images are orphaned`,
      details: { count: orphanImages.length }
    });
  } else {
    results.push({
      category: 'Orphan Records',
      status: 'PASS',
      message: 'No orphan product images found'
    });
  }

  // Check product variants without valid products
  const productVariants = await prisma.productVariant.findMany({
    include: { product: true }
  });

  const orphanVariants = productVariants.filter(variant => !variant.product);

  if (orphanVariants.length > 0) {
    results.push({
      category: 'Orphan Records',
      status: 'FAIL',
      message: `${orphanVariants.length} product variants are orphaned`,
      details: { count: orphanVariants.length }
    });
  } else {
    results.push({
      category: 'Orphan Records',
      status: 'PASS',
      message: 'No orphan product variants found'
    });
  }

  // Check addresses without valid profiles
  const addresses = await prisma.address.findMany({
    include: { profile: true }
  });

  const orphanAddresses = addresses.filter(addr => !addr.profile);

  if (orphanAddresses.length > 0) {
    results.push({
      category: 'Orphan Records',
      status: 'FAIL',
      message: `${orphanAddresses.length} addresses are orphaned`,
      details: { count: orphanAddresses.length }
    });
  } else {
    results.push({
      category: 'Orphan Records',
      status: 'PASS',
      message: 'No orphan addresses found'
    });
  }

  console.log('  ✓ Orphan record checks completed\n');
}

async function checkDuplicateRecords() {
  console.log('🔍 Checking for duplicate records...');

  // Check duplicate emails in profiles
  const duplicateEmails = await prisma.$queryRaw`
    SELECT email, COUNT(*) as count 
    FROM profiles 
    GROUP BY email 
    HAVING COUNT(*) > 1
  `;

  if (Array.isArray(duplicateEmails) && duplicateEmails.length > 0) {
    results.push({
      category: 'Duplicate Records',
      status: 'FAIL',
      message: `${duplicateEmails.length} duplicate emails found in profiles`,
      details: { duplicates: duplicateEmails }
    });
  } else {
    results.push({
      category: 'Duplicate Records',
      status: 'PASS',
      message: 'No duplicate emails found'
    });
  }

  // Check duplicate slugs in products
  const duplicateSlugs = await prisma.$queryRaw`
    SELECT slug, COUNT(*) as count 
    FROM products 
    GROUP BY slug 
    HAVING COUNT(*) > 1
  `;

  if (Array.isArray(duplicateSlugs) && duplicateSlugs.length > 0) {
    results.push({
      category: 'Duplicate Records',
      status: 'FAIL',
      message: `${duplicateSlugs.length} duplicate slugs found in products`,
      details: { duplicates: duplicateSlugs }
    });
  } else {
    results.push({
      category: 'Duplicate Records',
      status: 'PASS',
      message: 'No duplicate product slugs found'
    });
  }

  // Check duplicate SKUs in variants
  const duplicateSkus = await prisma.$queryRaw`
    SELECT sku, COUNT(*) as count 
    FROM product_variants 
    GROUP BY sku 
    HAVING COUNT(*) > 1
  `;

  if (Array.isArray(duplicateSkus) && duplicateSkus.length > 0) {
    results.push({
      category: 'Duplicate Records',
      status: 'FAIL',
      message: `${duplicateSkus.length} duplicate SKUs found in variants`,
      details: { duplicates: duplicateSkus }
    });
  } else {
    results.push({
      category: 'Duplicate Records',
      status: 'PASS',
      message: 'No duplicate variant SKUs found'
    });
  }

  console.log('  ✓ Duplicate record checks completed\n');
}

async function checkMediaRelationships() {
  console.log('🖼️  Checking media relationships...');

  // Check media assets with invalid entity references
  const mediaAssets = await prisma.mediaAsset.findMany();
  let invalidMediaCount = 0;

  for (const asset of mediaAssets) {
    let isValid = true;
    
    // Check if the referenced entity exists based on entityType
    const entityType = asset.entityType as string;
    switch (entityType) {
      case 'product':
        const product = await prisma.product.findUnique({
          where: { id: asset.entityId }
        });
        if (!product) isValid = false;
        break;
      case 'category':
        const category = await prisma.category.findUnique({
          where: { id: asset.entityId }
        });
        if (!category) isValid = false;
        break;
      case 'brand':
        const brand = await prisma.brand.findUnique({
          where: { id: asset.entityId }
        });
        if (!brand) isValid = false;
        break;
      case 'collection':
        const collection = await prisma.collection.findUnique({
          where: { id: asset.entityId }
        });
        if (!collection) isValid = false;
        break;
      default:
        // For unknown entity types, mark as warning
        isValid = true;
    }

    if (!isValid) {
      invalidMediaCount++;
    }
  }

  if (invalidMediaCount > 0) {
    results.push({
      category: 'Media Relationships',
      status: 'FAIL',
      message: `${invalidMediaCount} media assets have invalid entity references`,
      details: { count: invalidMediaCount }
    });
  } else {
    results.push({
      category: 'Media Relationships',
      status: 'PASS',
      message: 'All media assets have valid entity references'
    });
  }

  // Check for media assets without required fields
  const allMediaAssets = await prisma.mediaAsset.findMany();
  const incompleteMedia = allMediaAssets.filter(asset =>
    !asset.publicId || !asset.folder || !asset.url || !asset.secureUrl
  );

  if (incompleteMedia.length > 0) {
    results.push({
      category: 'Media Relationships',
      status: 'WARNING',
      message: `${incompleteMedia.length} media assets have incomplete data`,
      details: { count: incompleteMedia.length }
    });
  } else {
    results.push({
      category: 'Media Relationships',
      status: 'PASS',
      message: 'All media assets have complete data'
    });
  }

  console.log('  ✓ Media relationship checks completed\n');
}

async function checkDataIntegrity() {
  console.log('🔐 Checking data integrity...');

  // Check orders with invalid profile references
  const orders = await prisma.order.findMany({
    where: { profileId: { not: null } },
    include: { profile: true }
  });

  const ordersWithoutProfile = orders.filter(order => !order.profile);

  if (ordersWithoutProfile.length > 0) {
    results.push({
      category: 'Data Integrity',
      status: 'FAIL',
      message: `${ordersWithoutProfile.length} orders have invalid profile references`,
      details: { count: ordersWithoutProfile.length }
    });
  } else {
    results.push({
      category: 'Data Integrity',
      status: 'PASS',
      message: 'All order profile references are valid'
    });
  }

  // Check cart items without valid cart
  const cartItems = await prisma.cartItem.findMany({
    include: { cart: true }
  });

  const cartItemsWithoutCart = cartItems.filter(item => !item.cart);

  if (cartItemsWithoutCart.length > 0) {
    results.push({
      category: 'Data Integrity',
      status: 'FAIL',
      message: `${cartItemsWithoutCart.length} cart items have invalid cart references`,
      details: { count: cartItemsWithoutCart.length }
    });
  } else {
    results.push({
      category: 'Data Integrity',
      status: 'PASS',
      message: 'All cart item references are valid'
    });
  }

  // Check wishlist items without valid profile
  const wishlistItems = await prisma.wishlistItem.findMany({
    include: { profile: true }
  });

  const wishlistItemsWithoutProfile = wishlistItems.filter(item => !item.profile);

  if (wishlistItemsWithoutProfile.length > 0) {
    results.push({
      category: 'Data Integrity',
      status: 'FAIL',
      message: `${wishlistItemsWithoutProfile.length} wishlist items have invalid profile references`,
      details: { count: wishlistItemsWithoutProfile.length }
    });
  } else {
    results.push({
      category: 'Data Integrity',
      status: 'PASS',
      message: 'All wishlist item references are valid'
    });
  }

  console.log('  ✓ Data integrity checks completed\n');
}

function printSummary() {
  console.log('📋 Verification Summary\n');
  console.log('=' .repeat(60));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;

  console.log(`Total Checks: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log('=' .repeat(60));

  // Group by category
  const byCategory = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, VerificationResult[]>);

  console.log('\nDetailed Results:\n');

  for (const [category, categoryResults] of Object.entries(byCategory)) {
    console.log(`${category}:`);
    for (const result of categoryResults) {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`  ${icon} ${result.message}`);
      if (result.details) {
        console.log(`     Details: ${JSON.stringify(result.details)}`);
      }
    }
    console.log();
  }

  // Overall status
  const overallStatus = failed === 0 ? 'PASS' : 'FAIL';
  console.log('=' .repeat(60));
  console.log(`Overall Status: ${overallStatus}`);
  console.log('=' .repeat(60));
}

verifyDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
