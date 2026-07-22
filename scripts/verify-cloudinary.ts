/**
 * Cloudinary Verification Script
 * Checks media assets for valid public IDs, folder paths, secure URLs, and relationships
 */

import { PrismaClient } from '@prisma/client';
import { listAssetsInFolder, getEntityAssets } from '../src/lib/media/cloudinary.service';
import { type CloudinaryConfig } from '../src/lib/media/media.types';

const prisma = new PrismaClient();

interface VerificationResult {
  category: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: unknown;
}

const results: VerificationResult[] = [];

function getCloudinaryConfig(): CloudinaryConfig {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  };
}

async function verifyCloudinary() {
  // eslint-disable-next-line no-console
  console.log('☁️  Starting Cloudinary Verification...\n');

  // 1. Check Cloudinary configuration
  await checkCloudinaryConfig();

  // 2. Check product images for valid URLs
  await checkProductImages();

  // 3. Check for orphan Cloudinary assets
  await checkOrphanCloudinaryAssets();

  // 4. Check folder structure
  await checkFolderStructure();

  // Print summary
  printSummary();
}

async function checkCloudinaryConfig() {
  // eslint-disable-next-line no-console
  console.log('🔧 Checking Cloudinary configuration...');

  const config = getCloudinaryConfig();

  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    results.push({
      category: 'Cloudinary Config',
      status: 'FAIL',
      message: 'Cloudinary credentials not configured'
    });
    // eslint-disable-next-line no-console
    console.log('  ✗ Cloudinary credentials missing\n');
    return;
  }

  try {
    // Test connection by listing a few resources
    await listAssetsInFolder('nabome', 'image', config, 1);
    
    results.push({
      category: 'Cloudinary Config',
      status: 'PASS',
      message: 'Cloudinary connection successful'
    });
    // eslint-disable-next-line no-console
    console.log('  ✓ Cloudinary connection successful\n');
  } catch (error) {
    results.push({
      category: 'Cloudinary Config',
      status: 'FAIL',
      message: `Cloudinary connection failed: ${error instanceof Error ? error.message : String(error)}`
    });
    // eslint-disable-next-line no-console
    console.log(`  ✗ Cloudinary connection failed: ${error}\n`);
  }
}

async function checkProductImages() {
  // eslint-disable-next-line no-console
  console.log('🖼️  Checking product images...');

  const productImages = await prisma.productImage.findMany();
  // eslint-disable-next-line no-console
  console.log(`  Total product images: ${productImages.length}`);

  let invalidUrlCount = 0;
  let missingPublicIdCount = 0;

  for (const image of productImages) {
    // Check if URL is valid
    if (!image.url || !image.url.startsWith('https://')) {
      invalidUrlCount++;
    }

    // Check if publicId exists
    if (!image.publicId) {
      missingPublicIdCount++;
    }
  }

  if (invalidUrlCount > 0) {
    results.push({
      category: 'Product Images',
      status: 'FAIL',
      message: `${invalidUrlCount} product images have invalid URLs`,
      details: { count: invalidUrlCount }
    });
  } else {
    results.push({
      category: 'Product Images',
      status: 'PASS',
      message: 'All product images have valid URLs'
    });
  }

  if (missingPublicIdCount > 0) {
    results.push({
      category: 'Product Images',
      status: 'WARNING',
      message: `${missingPublicIdCount} product images are missing public IDs`,
      details: { count: missingPublicIdCount }
    });
  } else {
    results.push({
      category: 'Product Images',
      status: 'PASS',
      message: 'All product images have public IDs'
    });
  }

  // eslint-disable-next-line no-console
  console.log(`  ✓ Product image checks completed\n`);
}

async function checkOrphanCloudinaryAssets() {
  // eslint-disable-next-line no-console
  console.log('👻 Checking for orphan Cloudinary assets...');

  const config = getCloudinaryConfig();

  try {
    // Get all Cloudinary assets in the nabome folder using the existing service
    const cloudinaryAssets = await getEntityAssets('nabome', config);
    // eslint-disable-next-line no-console
    console.log(`  Total Cloudinary assets in nabome folder: ${cloudinaryAssets.length}`);

    // Get all product image public IDs
    const productImages = await prisma.productImage.findMany({
      where: { publicId: { not: null } }
    });
    const dbPublicIds = new Set(productImages.map(img => img.publicId));

    // Find orphan assets (in Cloudinary but not in DB)
    const orphanAssets = cloudinaryAssets.filter((asset: Record<string, unknown>) => 
      !dbPublicIds.has(asset.publicId as string)
    );

    if (orphanAssets.length > 0) {
      results.push({
        category: 'Orphan Cloudinary Assets',
        status: 'WARNING',
        message: `${orphanAssets.length} orphan Cloudinary assets found`,
        details: { 
          count: orphanAssets.length,
          assets: orphanAssets.map((a: Record<string, string>) => a.publicId).slice(0, 10) // Show first 10
        }
      });
      // eslint-disable-next-line no-console
      console.log(`  ⚠️  Found ${orphanAssets.length} orphan assets`);
    } else {
      results.push({
        category: 'Orphan Cloudinary Assets',
        status: 'PASS',
        message: 'No orphan Cloudinary assets found'
      });
      // eslint-disable-next-line no-console
      console.log('  ✓ No orphan assets found');
    }

    // Find missing assets (in DB but not in Cloudinary)
    const missingAssets = productImages.filter(img => 
      img.publicId && !cloudinaryAssets.some((ca: Record<string, string>) => ca.publicId === img.publicId)
    );

    if (missingAssets.length > 0) {
      results.push({
        category: 'Missing Cloudinary Assets',
        status: 'FAIL',
        message: `${missingAssets.length} database images reference missing Cloudinary assets`,
        details: { count: missingAssets.length }
      });
      // eslint-disable-next-line no-console
      console.log(`  ✗ Found ${missingAssets.length} missing Cloudinary assets`);
    } else {
      results.push({
        category: 'Missing Cloudinary Assets',
        status: 'PASS',
        message: 'All database images exist in Cloudinary'
      });
      // eslint-disable-next-line no-console
      console.log('  ✓ All database images exist in Cloudinary');
    }

    // eslint-disable-next-line no-console
    console.log('  ✓ Orphan asset checks completed\n');
  } catch (error) {
    results.push({
      category: 'Orphan Cloudinary Assets',
      status: 'WARNING',
      message: `Could not check orphan assets: ${error instanceof Error ? error.message : String(error)}`
    });
    // eslint-disable-next-line no-console
    console.log(`  ⚠️  Could not check orphan assets: ${error}\n`);
  }
}

async function checkFolderStructure() {
  // eslint-disable-next-line no-console
  console.log('📁 Checking folder structure...');

  const productImages = await prisma.productImage.findMany({
    where: { publicId: { not: null } }
  });

  let invalidFolderCount = 0;
  const folderViolations: string[] = [];

  for (const image of productImages) {
    if (!image.publicId) continue;

    // Expected format: nabome/module/entity/asset_xxxxx/file
    const parts = image.publicId.split('/');
    
    if (parts.length < 4) {
      invalidFolderCount++;
      folderViolations.push(image.publicId);
      continue;
    }

    if (parts[0] !== 'nabome') {
      invalidFolderCount++;
      folderViolations.push(image.publicId);
      continue;
    }
  }

  if (invalidFolderCount > 0) {
    results.push({
      category: 'Folder Structure',
      status: 'FAIL',
      message: `${invalidFolderCount} assets violate folder structure`,
      details: { 
        count: invalidFolderCount,
        violations: folderViolations.slice(0, 10)
      }
    });
    // eslint-disable-next-line no-console
    console.log(`  ✗ Found ${invalidFolderCount} folder structure violations`);
  } else {
    results.push({
      category: 'Folder Structure',
      status: 'PASS',
      message: 'All assets follow correct folder structure'
    });
    // eslint-disable-next-line no-console
    console.log('  ✓ All assets follow correct folder structure');
  }

    // eslint-disable-next-line no-console
    console.log('  ✓ Folder structure checks completed\n');
}

function printSummary() {
  // eslint-disable-next-line no-console
  console.log('📋 Cloudinary Verification Summary\n');
  // eslint-disable-next-line no-console
  console.log('=' .repeat(60));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;

  // eslint-disable-next-line no-console
  console.log(`Total Checks: ${results.length}`);
  // eslint-disable-next-line no-console
  console.log(`✅ Passed: ${passed}`);
  // eslint-disable-next-line no-console
  console.log(`❌ Failed: ${failed}`);
  // eslint-disable-next-line no-console
  console.log(`⚠️  Warnings: ${warnings}`);
  // eslint-disable-next-line no-console
  console.log('=' .repeat(60));

  // Group by category
  const byCategory = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, VerificationResult[]>);

  // eslint-disable-next-line no-console
  console.log('\nDetailed Results:\n');

  for (const [category, categoryResults] of Object.entries(byCategory)) {
    // eslint-disable-next-line no-console
    console.log(`${category}:`);
    for (const result of categoryResults) {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      // eslint-disable-next-line no-console
      console.log(`  ${icon} ${result.message}`);
      if (result.details) {
        // eslint-disable-next-line no-console
        console.log(`     Details: ${JSON.stringify(result.details)}`);
      }
    }
    // eslint-disable-next-line no-console
    console.log();
  }

  // Overall status
  const overallStatus = failed === 0 ? 'PASS' : 'FAIL';
  // eslint-disable-next-line no-console
  console.log('=' .repeat(60));
  // eslint-disable-next-line no-console
  console.log(`Overall Status: ${overallStatus}`);
  // eslint-disable-next-line no-console
  console.log('=' .repeat(60));
}

verifyCloudinary()
  // eslint-disable-next-line no-console
  .catch(console.error)
  .finally(() => prisma.$disconnect());
