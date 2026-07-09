/**
 * Media Cleanup Utility for Automatic Media Asset Deletion
 *
 * This utility provides functions to automatically clean up media assets
 * when entities are deleted. It handles both database and Cloudinary cleanup.
 *
 * This is a safer alternative to Prisma middleware, as it can be called
 * explicitly before delete operations and provides better type safety.
 */
import type { PrismaClient } from "@prisma/client";
/**
 * Cleanup options
 */
export interface MediaCleanupOptions {
    skipCloudinaryCleanup?: boolean;
    logCleanup?: boolean;
}
/**
 * Cleanup result
 */
export interface MediaCleanupResult {
    dbAssetsDeleted: number;
    cloudinaryAssetsDeleted: number;
    errors: string[];
}
/**
 * Clean up media assets for a single entity
 *
 * This function should be called before deleting an entity to ensure
 * all associated media assets are cleaned up properly.
 *
 * @param prisma - Prisma client instance
 * @param modelName - Prisma model name (e.g., "Product", "Category")
 * @param entityId - ID of the entity being deleted
 * @param options - Cleanup options
 * @returns Cleanup result with counts and errors
 */
export declare function cleanupMediaForEntity(prisma: PrismaClient, modelName: string, entityId: string, options?: MediaCleanupOptions): Promise<MediaCleanupResult>;
/**
 * Clean up media assets for multiple entities
 *
 * This function should be called before deleting multiple entities
 * (e.g., in a deleteMany operation).
 *
 * @param prisma - Prisma client instance
 * @param modelName - Prisma model name (e.g., "Product", "Category")
 * @param entityIds - Array of entity IDs being deleted
 * @param options - Cleanup options
 * @returns Array of cleanup results
 */
export declare function cleanupMediaForEntities(prisma: PrismaClient, modelName: string, entityIds: string[], options?: MediaCleanupOptions): Promise<MediaCleanupResult[]>;
/**
 * Clean up media assets for entities matching a where clause
 *
 * This function should be called before a deleteMany operation.
 * It finds all entities matching the where clause and cleans up their media.
 *
 * @param prisma - Prisma client instance
 * @param modelName - Prisma model name (e.g., "Product", "Category")
 * @param where - Prisma where clause
 * @param options - Cleanup options
 * @returns Aggregate cleanup result
 */
export declare function cleanupMediaForWhereClause(prisma: PrismaClient, modelName: string, where: any, options?: MediaCleanupOptions): Promise<MediaCleanupResult>;
/**
 * Helper function to delete an entity with automatic media cleanup
 *
 * This is a convenience function that combines media cleanup with entity deletion.
 *
 * @param prisma - Prisma client instance
 * @param modelName - Prisma model name (e.g., "Product", "Category")
 * @param entityId - ID of the entity to delete
 * @param options - Cleanup options
 * @returns The deleted entity
 */
export declare function deleteEntityWithMediaCleanup(prisma: PrismaClient, modelName: string, entityId: string, options?: MediaCleanupOptions): Promise<any>;
