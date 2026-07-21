/**
 * Media Cleanup Utility for Automatic Media Asset Deletion
 *
 * This utility provides functions to automatically clean up media assets
 * when entities are deleted. It handles both database and Cloudinary cleanup.
 *
 * SERVER-ONLY: This module uses PrismaClient and must not be imported from
 * browser/client code.
 */
import type { PrismaClient } from "@prisma/client";
export interface MediaCleanupOptions {
    skipCloudinaryCleanup?: boolean;
    logCleanup?: boolean;
}
export interface MediaCleanupResult {
    dbAssetsDeleted: number;
    cloudinaryAssetsDeleted: number;
    errors: string[];
}
export declare function cleanupMediaForEntity(prisma: PrismaClient, modelName: string, entityId: string, options?: MediaCleanupOptions): Promise<MediaCleanupResult>;
export declare function cleanupMediaForEntities(prisma: PrismaClient, modelName: string, entityIds: string[], options?: MediaCleanupOptions): Promise<MediaCleanupResult[]>;
export declare function cleanupMediaForWhereClause(prisma: PrismaClient, modelName: string, where: Record<string, unknown>, options?: MediaCleanupOptions): Promise<MediaCleanupResult>;
export declare function deleteEntityWithMediaCleanup(prisma: PrismaClient, modelName: string, entityId: string, options?: MediaCleanupOptions): Promise<{
    entity: unknown;
    cleanup: MediaCleanupResult;
}>;
