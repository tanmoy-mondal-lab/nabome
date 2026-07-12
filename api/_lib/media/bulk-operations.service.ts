/**
 * Media Bulk Operations Service
 * 
 * Provides safe bulk operations for media management.
 * Ensures that bulk operations don't fail entirely because of individual asset failures.
 * Provides detailed summaries of what succeeded and what failed.
 */

import type { PrismaClient } from '@prisma/client';
import type { CloudinaryConfig } from './types';
import { logBulkMediaOperation, extractRequestContext } from './audit-log.service';
import { invalidatePublicIdCache } from './usage-cache.service';

export interface BulkDeleteResult {
  total: number;
  deleted: number;
  skipped: number;
  failed: number;
  details: Array<{
    assetId: string;
    status: 'deleted' | 'skipped' | 'failed';
    reason?: string;
  }>;
}

export interface BulkDeleteOptions {
  assetIds: string[];
  performedBy: string;
  reason?: string;
  req?: Request;
  force?: boolean;
}

/**
 * Bulk delete with safety - continues even if individual assets fail
 */
export async function bulkDeleteWithSafety(
  prisma: PrismaClient,
  _config: CloudinaryConfig,
  options: BulkDeleteOptions
): Promise<BulkDeleteResult> {
  const { assetIds, performedBy, reason, req, force = false } = options;
  const { ipAddress, userAgent } = req ? extractRequestContext(req) : {};

  const result: BulkDeleteResult = {
    total: assetIds.length,
    deleted: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  for (const assetId of assetIds) {
    try {
      // Check if asset exists
      const asset = await prisma.media_assets.findUnique({
        where: { id: assetId },
        select: {
          id: true,
          assetId: true,
          deletedAt: true,
          publicId: true,
          resourceType: true,
        },
      });

      if (!asset) {
        result.details.push({
          assetId,
          status: 'failed',
          reason: 'Asset not found',
        });
        result.failed++;
        continue;
      }

      // Check if already in trash
      if (asset.deletedAt) {
        result.details.push({
          assetId,
          status: 'skipped',
          reason: 'Already in trash',
        });
        result.skipped++;
        continue;
      }

      // Check usage before soft delete
      const usageData = await checkAssetUsage(prisma, asset.publicId);
      if (usageData.used && !force) {
        result.details.push({
          assetId,
          status: 'skipped',
          reason: `Asset is in use (${usageData.total} references)`,
        });
        result.skipped++;
        continue;
      }

      // Soft delete the asset
      await prisma.media_assets.update({
        where: { id: assetId },
        data: {
          deletedAt: new Date(),
          deletedBy: performedBy,
          deletedReason: reason || 'Bulk delete',
        },
      });

      // Invalidate cache
      await invalidatePublicIdCache(prisma, [asset.publicId || '']);

      result.details.push({
        assetId,
        status: 'deleted',
      });
      result.deleted++;
    } catch (error) {
      result.details.push({
        assetId,
        status: 'failed',
        reason: error instanceof Error ? error.message : String(error),
      });
      result.failed++;
    }
  }

  // Log the bulk operation
  await logBulkMediaOperation(prisma, {
    assetId: 'bulk',
    action: 'bulk_delete',
    performedBy,
    itemCount: assetIds.length,
    metadata: {
      reason,
      itemCount: assetIds.length,
      deletedCount: result.deleted,
      skippedCount: result.skipped,
      force,
    },
    ipAddress,
    userAgent,
  });

  return result;
}

/**
 * Bulk restore with safety
 */
export async function bulkRestoreWithSafety(
  prisma: PrismaClient,
  options: {
    assetIds: string[];
    performedBy: string;
    req?: Request;
  }
): Promise<BulkDeleteResult> {
  const { assetIds, performedBy, req } = options;
  const { ipAddress, userAgent } = req ? extractRequestContext(req) : {};

  const result: BulkDeleteResult = {
    total: assetIds.length,
    deleted: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  for (const assetId of assetIds) {
    try {
      const asset = await prisma.media_assets.findUnique({
        where: { id: assetId },
        select: {
          id: true,
          assetId: true,
          deletedAt: true,
          publicId: true,
        },
      });

      if (!asset) {
        result.details.push({
          assetId,
          status: 'failed',
          reason: 'Asset not found',
        });
        result.failed++;
        continue;
      }

      // Check if not in trash
      if (!asset.deletedAt) {
        result.details.push({
          assetId,
          status: 'skipped',
          reason: 'Not in trash',
        });
        result.skipped++;
        continue;
      }

      // Restore the asset
      await prisma.media_assets.update({
        where: { id: assetId },
        data: {
          deletedAt: null,
          deletedBy: null,
          deletedReason: null,
        },
      });

      // Invalidate cache
      await invalidatePublicIdCache(prisma, [asset.publicId || '']);

      result.details.push({
        assetId,
        status: 'deleted', // Using 'deleted' to mean 'processed'
      });
      result.deleted++;
    } catch (error) {
      result.details.push({
        assetId,
        status: 'failed',
        reason: error instanceof Error ? error.message : String(error),
      });
      result.failed++;
    }
  }

  // Log the bulk operation
  await logBulkMediaOperation(prisma, {
    assetId: 'bulk',
    action: 'bulk_restore',
    performedBy,
    itemCount: assetIds.length,
    metadata: {
      itemCount: assetIds.length,
      deletedCount: result.deleted,
      skippedCount: result.skipped,
    },
    ipAddress,
    userAgent,
  });

  return result;
}

/**
 * Bulk permanent delete with safety
 */
export async function bulkPermanentDeleteWithSafety(
  prisma: PrismaClient,
  config: CloudinaryConfig,
  options: {
    assetIds: string[];
    performedBy: string;
    reason?: string;
    req?: Request;
  }
): Promise<BulkDeleteResult> {
  const { assetIds, performedBy, reason, req } = options;
  const { ipAddress, userAgent } = req ? extractRequestContext(req) : {};

  const result: BulkDeleteResult = {
    total: assetIds.length,
    deleted: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  for (const assetId of assetIds) {
    try {
      const asset = await prisma.media_assets.findUnique({
        where: { id: assetId },
        select: {
          id: true,
          assetId: true,
          deletedAt: true,
          publicId: true,
          resourceType: true,
        },
      });

      if (!asset) {
        result.details.push({
          assetId,
          status: 'failed',
          reason: 'Asset not found',
        });
        result.failed++;
        continue;
      }

      // Check if not in trash
      if (!asset.deletedAt) {
        result.details.push({
          assetId,
          status: 'skipped',
          reason: 'Not in trash - must soft delete first',
        });
        result.skipped++;
        continue;
      }

      // Delete from Cloudinary
      const { deleteAsset } = await import('./cloudinary');
      const cloudinaryDeleted = await deleteAsset(
        asset.publicId || '',
        asset.resourceType as any,
        config
      );

      if (!cloudinaryDeleted) {
        result.details.push({
          assetId,
          status: 'failed',
          reason: 'Cloudinary deletion failed',
        });
        result.failed++;
        continue;
      }

      // Delete from database
      await prisma.media_assets.delete({
        where: { id: assetId },
      });

      result.details.push({
        assetId,
        status: 'deleted',
      });
      result.deleted++;
    } catch (error) {
      result.details.push({
        assetId,
        status: 'failed',
        reason: error instanceof Error ? error.message : String(error),
      });
      result.failed++;
    }
  }

  // Log the bulk operation
  await logBulkMediaOperation(prisma, {
    assetId: 'bulk',
    action: 'bulk_delete',
    performedBy,
    itemCount: assetIds.length,
    metadata: {
      reason,
      itemCount: assetIds.length,
      deletedCount: result.deleted,
      skippedCount: result.skipped,
    },
    ipAddress,
    userAgent,
  });

  return result;
}

/**
 * Checks asset usage (helper function)
 */
async function checkAssetUsage(
  prisma: PrismaClient,
  publicId: string | null
): Promise<{ used: boolean; total: number }> {
  if (!publicId) return { used: false, total: 0 };

  // Check all entity types that reference media
  const [categories, subcategories, collections, brands, sizeGuides, products, productImages, lookbooks] = await Promise.all([
    prisma.categories.findMany({
      where: { imagePublicId: publicId },
      select: { id: true },
    }),
    prisma.subcategories.findMany({
      where: { imagePublicId: publicId },
      select: { id: true },
    }),
    prisma.collections.findMany({
      where: { heroImagePublicId: publicId },
      select: { id: true },
    }),
    prisma.brands.findMany({
      where: { logoPublicId: publicId },
      select: { id: true },
    }),
    prisma.size_guides.findMany({
      where: { imagePublicId: publicId },
      select: { id: true },
    }),
    prisma.products.findMany({
      where: { sizeChartPublicId: publicId },
      select: { id: true },
    }),
    prisma.product_images.findMany({
      where: { publicId },
      select: { id: true },
    }),
    prisma.lookbooks.findMany({
      where: { coverImagePublicId: publicId },
      select: { id: true },
    }),
  ]);

  const total = categories.length + subcategories.length + collections.length + 
                brands.length + sizeGuides.length + products.length + 
                productImages.length + lookbooks.length;

  return { used: total > 0, total };
}
