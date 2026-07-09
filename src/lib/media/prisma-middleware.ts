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
import type { EntityType } from "./media.types";
import { getCloudinaryConfigFromEnv } from "./cloudinary.config";
import { deleteEntityAssets } from "./cloudinary.service";
import { getEntityFolder } from "./folder.service";

/**
 * Entity type mapping for media cleanup
 * Maps Prisma model names to EntityType enum values
 */
const ENTITY_TYPE_MAPPING: Record<string, EntityType> = {
  Product: "products",
  Category: "categories",
  Collection: "collections",
  Brand: "brands",
  Label: "labels",
  Lookbook: "lookbooks",
  Blog: "blogs",
  CmsPage: "cms",
  Seller: "sellers",
  Profile: "users",
};

/**
 * Slug field mapping for each entity type
 * Maps Prisma model names to their slug field names
 */
const SLUG_FIELD_MAPPING: Record<string, string> = {
  Product: "slug",
  Category: "slug",
  Collection: "slug",
  Brand: "slug",
  Label: "slug",
  Lookbook: "slug",
  Blog: "slug",
  CmsPage: "slug",
  Seller: "slug",
  Profile: "id", // Users use ID instead of slug
};

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
export async function cleanupMediaForEntity(
  prisma: PrismaClient,
  modelName: string,
  entityId: string,
  options: MediaCleanupOptions = {}
): Promise<MediaCleanupResult> {
  const {
    skipCloudinaryCleanup = false,
    logCleanup = true,
  } = options;

  const result: MediaCleanupResult = {
    dbAssetsDeleted: 0,
    cloudinaryAssetsDeleted: 0,
    errors: [],
  };

  // Check if this model has media assets
  const entityType = ENTITY_TYPE_MAPPING[modelName];
  if (!entityType) {
    if (logCleanup) {
      console.log(`[MediaCleanup] No media mapping for model ${modelName}, skipping cleanup`);
    }
    return result;
  }

  const slugField = SLUG_FIELD_MAPPING[modelName];

  try {
    // Get the entity to retrieve its slug
    const entity: any = await (prisma as any)[modelName].findUnique({
      where: { id: entityId },
      select: { [slugField]: true, id: true },
    });

    if (!entity) {
      if (logCleanup) {
        console.log(`[MediaCleanup] Entity ${modelName} ${entityId} not found, skipping cleanup`);
      }
      return result;
    }

    const slug = entity[slugField];

    if (logCleanup) {
      console.log(`[MediaCleanup] Cleaning up media for ${modelName} ${entityId} (slug: ${slug})`);
    }

    // Delete media assets from database
    const deletedDbAssets = await prisma.mediaAsset.deleteMany({
      where: {
        entityType,
        entityId,
      },
    });

    result.dbAssetsDeleted = deletedDbAssets.count;

    if (logCleanup) {
      console.log(`[MediaCleanup] Deleted ${deletedDbAssets.count} media assets from database`);
    }

    // Delete from Cloudinary if not skipped
    if (!skipCloudinaryCleanup && slug) {
      try {
        const entityFolder = getEntityFolder(entityType, slug);
        const config = getCloudinaryConfigFromEnv();
        
        const deletedCloudinaryAssets = await deleteEntityAssets(entityFolder, config);
        result.cloudinaryAssetsDeleted = deletedCloudinaryAssets;
        
        if (logCleanup) {
          console.log(`[MediaCleanup] Deleted ${deletedCloudinaryAssets} media assets from Cloudinary`);
        }
      } catch (cloudinaryError) {
        const errorMsg = `Failed to delete from Cloudinary: ${cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError)}`;
        result.errors.push(errorMsg);
        console.error(`[MediaCleanup] ${errorMsg}`);
      }
    }

    return result;
  } catch (error) {
    const errorMsg = `Error during media cleanup: ${error instanceof Error ? error.message : String(error)}`;
    result.errors.push(errorMsg);
    console.error(`[MediaCleanup] ${errorMsg}`);
    return result;
  }
}

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
export async function cleanupMediaForEntities(
  prisma: PrismaClient,
  modelName: string,
  entityIds: string[],
  options: MediaCleanupOptions = {}
): Promise<MediaCleanupResult[]> {
  const results: MediaCleanupResult[] = [];

  for (const entityId of entityIds) {
    const result = await cleanupMediaForEntity(prisma, modelName, entityId, options);
    results.push(result);
  }

  return results;
}

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
export async function cleanupMediaForWhereClause(
  prisma: PrismaClient,
  modelName: string,
  where: any,
  options: MediaCleanupOptions = {}
): Promise<MediaCleanupResult> {
  const {
    logCleanup = true,
  } = options;

  const aggregateResult: MediaCleanupResult = {
    dbAssetsDeleted: 0,
    cloudinaryAssetsDeleted: 0,
    errors: [],
  };

  // Check if this model has media assets
  const entityType = ENTITY_TYPE_MAPPING[modelName];
  if (!entityType) {
    if (logCleanup) {
      console.log(`[MediaCleanup] No media mapping for model ${modelName}, skipping cleanup`);
    }
    return aggregateResult;
  }

  const slugField = SLUG_FIELD_MAPPING[modelName];

  try {
    // Get all entities matching the where clause
    const entities: any[] = await (prisma as any)[modelName].findMany({
      where,
      select: { [slugField]: true, id: true },
    });

    if (logCleanup) {
      console.log(`[MediaCleanup] Cleaning up media for ${entities.length} ${modelName} entities`);
    }

    // Clean up media for each entity
    for (const entity of entities) {
      const slug = entity[slugField];
      const entityId = entity.id;

      // Delete media assets from database
      const deletedDbAssets = await prisma.mediaAsset.deleteMany({
        where: {
          entityType,
          entityId,
        },
      });

      aggregateResult.dbAssetsDeleted += deletedDbAssets.count;

      // Delete from Cloudinary if not skipped
      if (!options.skipCloudinaryCleanup && slug) {
        try {
          const entityFolder = getEntityFolder(entityType, slug);
          const config = getCloudinaryConfigFromEnv();
          
          const deletedCloudinaryAssets = await deleteEntityAssets(entityFolder, config);
          aggregateResult.cloudinaryAssetsDeleted += deletedCloudinaryAssets;
        } catch (cloudinaryError) {
          const errorMsg = `Failed to delete from Cloudinary for ${entityId}: ${cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError)}`;
          aggregateResult.errors.push(errorMsg);
          console.error(`[MediaCleanup] ${errorMsg}`);
        }
      }
    }

    if (logCleanup) {
      console.log(`[MediaCleanup] Completed cleanup: ${aggregateResult.dbAssetsDeleted} DB assets, ${aggregateResult.cloudinaryAssetsDeleted} Cloudinary assets, ${aggregateResult.errors.length} errors`);
    }

    return aggregateResult;
  } catch (error) {
    const errorMsg = `Error during media cleanup: ${error instanceof Error ? error.message : String(error)}`;
    aggregateResult.errors.push(errorMsg);
    console.error(`[MediaCleanup] ${errorMsg}`);
    return aggregateResult;
  }
}

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
export async function deleteEntityWithMediaCleanup(
  prisma: PrismaClient,
  modelName: string,
  entityId: string,
  options: MediaCleanupOptions = {}
): Promise<any> {
  // Clean up media first
  const cleanupResult = await cleanupMediaForEntity(prisma, modelName, entityId, options);

  // Then delete the entity
  const deletedEntity = await (prisma as any)[modelName].delete({
    where: { id: entityId },
  });

  return {
    entity: deletedEntity,
    cleanup: cleanupResult,
  };
}
