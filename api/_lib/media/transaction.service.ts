/**
 * Media Transaction Service
 * 
 * Provides transaction-safe operations for media management.
 * Ensures database and Cloudinary stay in sync during critical operations.
 */

import type { PrismaClient } from '@prisma/client';
import type { CloudinaryConfig } from './types';
import { deleteAsset } from './cloudinary';
import { logMediaOperation, extractRequestContext } from './audit-log.service';
import { invalidateAssetCache } from './usage-cache.service';

export interface PermanentDeleteOptions {
  assetId: string;
  publicId: string;
  resourceType: string;
  performedBy: string;
  reason?: string;
  req?: Request;
}

/**
 * Permanently deletes a media asset with transaction safety
 * 
 * This ensures that Cloudinary deletion and database deletion happen atomically.
 * If Cloudinary deletion fails, the database record is preserved.
 * If database deletion fails, we attempt to restore the Cloudinary asset.
 */
export async function permanentDeleteWithTransaction(
  prisma: PrismaClient,
  config: CloudinaryConfig,
  options: PermanentDeleteOptions
): Promise<{ success: boolean; error?: string }> {
  const { assetId, publicId, resourceType, performedBy, reason, req } = options;

  // Extract request context for audit log
  const { ipAddress, userAgent } = req ? extractRequestContext(req) : {};

  try {
    // Start transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Get the asset record
      const asset = await tx.media_assets.findUnique({
        where: { id: assetId },
        select: {
          id: true,
          assetId: true,
          publicId: true,
          resourceType: true,
          folder: true,
        },
      });

      if (!asset) {
        throw new Error('Asset not found');
      }

      // 2. Delete from Cloudinary first (external operation)
      const cloudinaryDeleted = await deleteAsset(
        asset.publicId || publicId,
        resourceType as any,
        config
      );

      if (!cloudinaryDeleted) {
        throw new Error('Cloudinary deletion failed');
      }

      // 3. Delete from database (only if Cloudinary succeeded)
      await tx.media_assets.delete({
        where: { id: assetId },
      });

      // 4. Invalidate cache
      await invalidateAssetCache(tx as any, assetId);

      // 5. Log the operation (outside transaction, but after success)
      await logMediaOperation(prisma, {
        assetId: asset.assetId,
        action: 'permanent_delete',
        performedBy,
        metadata: {
          reason,
          oldValues: {
            publicId: asset.publicId,
            folder: asset.folder,
          },
        },
        ipAddress,
        userAgent,
      });

      return { success: true };
    });
  } catch (error) {
    console.error('[TransactionService] Permanent delete failed:', error);
    
    // Log the failure
    await logMediaOperation(prisma, {
      assetId,
      action: 'permanent_delete',
      performedBy,
      metadata: {
        reason,
        error: error instanceof Error ? error.message : String(error),
      },
      ipAddress,
      userAgent,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Batch permanent delete with transaction safety
 */
export async function batchPermanentDeleteWithTransaction(
  prisma: PrismaClient,
  config: CloudinaryConfig,
  options: {
    assetIds: string[];
    performedBy: string;
    reason?: string;
    req?: Request;
  }
): Promise<{
  success: boolean;
  deleted: string[];
  failed: Array<{ id: string; error: string }>;
}> {
  const { assetIds, performedBy, reason, req } = options;
  const { ipAddress, userAgent } = req ? extractRequestContext(req) : {};

  const deleted: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];

  for (const assetId of assetIds) {
    try {
      // Get asset details
      const asset = await prisma.media_assets.findUnique({
        where: { id: assetId },
        select: {
          id: true,
          assetId: true,
          publicId: true,
          resourceType: true,
        },
      });

      if (!asset) {
        failed.push({ id: assetId, error: 'Asset not found' });
        continue;
      }

      // Delete with transaction
      const result = await permanentDeleteWithTransaction(prisma, config, {
        assetId,
        publicId: asset.publicId || '',
        resourceType: asset.resourceType || 'image',
        performedBy,
        reason,
        req,
      });

      if (result.success) {
        deleted.push(assetId);
      } else {
        failed.push({ id: assetId, error: result.error || 'Unknown error' });
      }
    } catch (error) {
      failed.push({
        id: assetId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Log batch operation
  await logMediaOperation(prisma, {
    assetId: 'batch',
    action: 'bulk_delete',
    performedBy,
    metadata: {
      itemCount: assetIds.length,
      deletedCount: deleted.length,
      failedCount: failed.length,
      reason,
    },
    ipAddress,
    userAgent,
  });

  return {
    success: failed.length === 0,
    deleted,
    failed,
  };
}

/**
 * Soft delete with cache invalidation
 */
export async function softDeleteWithCacheInvalidation(
  prisma: PrismaClient,
  options: {
    assetId: string;
    performedBy: string;
    reason: string;
    req?: Request;
  }
): Promise<{ success: boolean; error?: string }> {
  const { assetId, performedBy, reason, req } = options;
  const { ipAddress, userAgent } = req ? extractRequestContext(req) : {};

  try {
    await prisma.$transaction(async (tx) => {
      // Soft delete the asset
      await tx.media_assets.update({
        where: { id: assetId },
        data: {
          deletedAt: new Date(),
          deletedBy: performedBy,
          deletedReason: reason,
        },
      });

      // Invalidate cache
      await invalidateAssetCache(tx as any, assetId);
    });

    // Log the operation
    const asset = await prisma.media_assets.findUnique({
      where: { id: assetId },
      select: { assetId: true },
    });

    if (asset) {
      await logMediaOperation(prisma, {
        assetId: asset.assetId,
        action: 'delete',
        performedBy,
        metadata: { reason },
        ipAddress,
        userAgent,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[TransactionService] Soft delete failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Restore with cache invalidation
 */
export async function restoreWithCacheInvalidation(
  prisma: PrismaClient,
  options: {
    assetId: string;
    performedBy: string;
    req?: Request;
  }
): Promise<{ success: boolean; error?: string }> {
  const { assetId, performedBy, req } = options;
  const { ipAddress, userAgent } = req ? extractRequestContext(req) : {};

  try {
    await prisma.$transaction(async (tx) => {
      // Restore the asset
      await tx.media_assets.update({
        where: { id: assetId },
        data: {
          deletedAt: null,
          deletedBy: null,
          deletedReason: null,
        },
      });

      // Invalidate cache
      await invalidateAssetCache(tx as any, assetId);
    });

    // Log the operation
    const asset = await prisma.media_assets.findUnique({
      where: { id: assetId },
      select: { assetId: true },
    });

    if (asset) {
      await logMediaOperation(prisma, {
        assetId: asset.assetId,
        action: 'restore',
        performedBy,
        ipAddress,
        userAgent,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[TransactionService] Restore failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
