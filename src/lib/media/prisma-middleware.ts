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
import type { EntityType } from "./media.types";
import { getCloudinaryConfigFromEnv } from "./cloudinary.config";
import { deleteEntityAssets } from "./cloudinary.service";
import { getEntityFolder } from "./folder.service";

type PrismaModelDelegate = {
  findUnique: (args: { where: { id: string }; select: Record<string, boolean> }) => Promise<Record<string, unknown> | null>;
  findMany: (args: { where: Record<string, unknown>; select: Record<string, boolean> }) => Promise<Record<string, unknown>[]>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
};

function getModelDelegate(prisma: PrismaClient, modelName: string): PrismaModelDelegate | null {
  const model = (prisma as unknown as Record<string, unknown>)[modelName];
  if (!model || typeof model !== "object") return null;
  return model as PrismaModelDelegate;
}

function lookupSlug(entity: Record<string, unknown>, slugField: string): string {
  const value = entity[slugField];
  return typeof value === "string" ? value : "";
}

/**
 * Entity type mapping for media cleanup
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
  Profile: "id",
};

export interface MediaCleanupOptions {
  skipCloudinaryCleanup?: boolean;
  logCleanup?: boolean;
}

export interface MediaCleanupResult {
  dbAssetsDeleted: number;
  cloudinaryAssetsDeleted: number;
  errors: string[];
}

export async function cleanupMediaForEntity(
  prisma: PrismaClient,
  modelName: string,
  entityId: string,
  options: MediaCleanupOptions = {}
): Promise<MediaCleanupResult> {
  const { skipCloudinaryCleanup = false } = options;
  const result: MediaCleanupResult = { dbAssetsDeleted: 0, cloudinaryAssetsDeleted: 0, errors: [] };

  const entityType = ENTITY_TYPE_MAPPING[modelName];
  if (!entityType) return result;

  const slugField = SLUG_FIELD_MAPPING[modelName];
  if (!slugField) return result;

  try {
    const prismaModel = getModelDelegate(prisma, modelName);
    if (!prismaModel) throw new Error(`Model ${modelName} not found on PrismaClient`);

    const entity = await prismaModel.findUnique({
      where: { id: entityId },
      select: { [slugField]: true, id: true },
    });

    if (!entity) return result;

    const slug = lookupSlug(entity, slugField);

    const deletedDbAssets = await prisma.media_assets.deleteMany({
      where: { entityType, entityId },
    });
    result.dbAssetsDeleted = deletedDbAssets.count;

    if (!skipCloudinaryCleanup && slug) {
      try {
        const entityFolder = getEntityFolder(entityType, slug);
        const config = getCloudinaryConfigFromEnv();
        result.cloudinaryAssetsDeleted = await deleteEntityAssets(entityFolder, config);
      } catch (cloudinaryError) {
        result.errors.push(`Failed to delete from Cloudinary: ${cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError)}`);
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Error during media cleanup: ${error instanceof Error ? error.message : String(error)}`);
    return result;
  }
}

export async function cleanupMediaForEntities(
  prisma: PrismaClient,
  modelName: string,
  entityIds: string[],
  options: MediaCleanupOptions = {}
): Promise<MediaCleanupResult[]> {
  return Promise.all(entityIds.map(id => cleanupMediaForEntity(prisma, modelName, id, options)));
}

export async function cleanupMediaForWhereClause(
  prisma: PrismaClient,
  modelName: string,
  where: Record<string, unknown>,
  options: MediaCleanupOptions = {}
): Promise<MediaCleanupResult> {
  const result: MediaCleanupResult = { dbAssetsDeleted: 0, cloudinaryAssetsDeleted: 0, errors: [] };

  const entityType = ENTITY_TYPE_MAPPING[modelName];
  if (!entityType) return result;

  const slugField = SLUG_FIELD_MAPPING[modelName];
  if (!slugField) return result;

  try {
    const prismaModel = getModelDelegate(prisma, modelName);
    if (!prismaModel) throw new Error(`Model ${modelName} not found on PrismaClient`);

    const entities = await prismaModel.findMany({
      where,
      select: { [slugField]: true, id: true },
    });

    for (const entity of entities) {
      const slug = lookupSlug(entity, slugField);
      const entityId = entity.id as string;

      const deletedDbAssets = await prisma.media_assets.deleteMany({
        where: { entityType, entityId },
      });
      result.dbAssetsDeleted += deletedDbAssets.count;

      if (!options.skipCloudinaryCleanup && slug) {
        try {
          const entityFolder = getEntityFolder(entityType, slug);
          const config = getCloudinaryConfigFromEnv();
          result.cloudinaryAssetsDeleted += await deleteEntityAssets(entityFolder, config);
        } catch (cloudinaryError) {
          result.errors.push(`Failed to delete from Cloudinary for ${entityId}: ${cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError)}`);
        }
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Error during media cleanup: ${error instanceof Error ? error.message : String(error)}`);
    return result;
  }
}

export async function deleteEntityWithMediaCleanup(
  prisma: PrismaClient,
  modelName: string,
  entityId: string,
  options: MediaCleanupOptions = {}
): Promise<{ entity: unknown; cleanup: MediaCleanupResult }> {
  const cleanupResult = await cleanupMediaForEntity(prisma, modelName, entityId, options);

  const prismaModel = getModelDelegate(prisma, modelName);
  if (!prismaModel) throw new Error(`Model ${modelName} not found on PrismaClient`);

  const deletedEntity = await prismaModel.delete({ where: { id: entityId } });

  return { entity: deletedEntity, cleanup: cleanupResult };
}
