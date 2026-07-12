/**
 * Media Transaction Service
 *
 * Provides transaction-safe operations for media management.
 * Ensures database and Cloudinary stay in sync during critical operations.
 */
import type { PrismaClient } from '@prisma/client';
import type { CloudinaryConfig } from './types';
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
export declare function permanentDeleteWithTransaction(prisma: PrismaClient, config: CloudinaryConfig, options: PermanentDeleteOptions): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Batch permanent delete with transaction safety
 */
export declare function batchPermanentDeleteWithTransaction(prisma: PrismaClient, config: CloudinaryConfig, options: {
    assetIds: string[];
    performedBy: string;
    reason?: string;
    req?: Request;
}): Promise<{
    success: boolean;
    deleted: string[];
    failed: Array<{
        id: string;
        error: string;
    }>;
}>;
/**
 * Soft delete with cache invalidation
 */
export declare function softDeleteWithCacheInvalidation(prisma: PrismaClient, options: {
    assetId: string;
    performedBy: string;
    reason: string;
    req?: Request;
}): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Restore with cache invalidation
 */
export declare function restoreWithCacheInvalidation(prisma: PrismaClient, options: {
    assetId: string;
    performedBy: string;
    req?: Request;
}): Promise<{
    success: boolean;
    error?: string;
}>;
