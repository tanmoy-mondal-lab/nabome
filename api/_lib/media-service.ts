import type { Env } from "./env";
import type { EntityType } from "../../src/lib/media/media.types";
import { generateAssetId } from "../../src/lib/media/asset-id.service";
import { getAssetFolder, getEntityFolder, extractEntityFolder } from "../../src/lib/media/folder.service";
import { cleanSecret } from "./secrets";
import { getPrisma } from "./prisma";
import { uploadAsset, deleteAsset } from "../../src/lib/media/cloudinary.service";
import type { CloudinaryConfig } from "../../src/lib/media/media.types";
import {
  createMediaAsset,
  replaceMediaAsset,
  deleteMediaAsset as lifecycleDeleteMediaAsset,
  deleteEntityMediaAssets as lifecycleDeleteEntityMediaAssets,
  migrateEntitySlug as lifecycleMigrateEntitySlug,
  cleanupOrphanedMedia,
  verifyMediaConsistency,
} from "../../src/lib/media/lifecycle.service";
import { validateFile, validateFileContent, throwIfInvalid, getFileTypeConfig } from "../../src/lib/media/validation.service";

// Re-export validation functions for use by upload handler
export { validateFile, validateFileContent };
import { sanitizeFilename } from "../../src/lib/media/media.utils";

function envToCloudinaryConfig(env: Env): CloudinaryConfig {
  return {
    cloudName: cleanSecret(env.CLOUDINARY_CLOUD_NAME),
    apiKey: cleanSecret(env.CLOUDINARY_API_KEY),
    apiSecret: cleanSecret(env.CLOUDINARY_API_SECRET),
  };
}

export type CloudinaryResourceType = "image" | "video" | "raw";

export interface UploadOptions {
  entityType: EntityType;
  entityId: string;
  slug: string;
  file: File;
  altText?: string;
  displayName?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface MediaResult {
  id: string;
  assetId: string;
  url: string;
  publicId: string;
  folder: string;
  secureUrl: string;
  resourceType: CloudinaryResourceType;
  mimeType: string;
  width: number | null;
  height: number | null;
  bytes: number;
  format: string;
  originalFilename: string;
}

export interface ReplaceOptions {
  entityType: EntityType;
  entityId: string;
  slug: string;
  file: File;
  oldAssetId: string;
  altText?: string;
  displayName?: string;
}

async function generateSignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map((key) => `${key}=${params[key]}`).join("&") + apiSecret;
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-1", enc.encode(signStr));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function uploadToCloudinary(
  file: File,
  folder: string,
  publicId: string,
  resourceType: CloudinaryResourceType,
  env: Env
): Promise<{
  public_id: string;
  secure_url: string;
  format: string;
  width: number | null;
  height: number | null;
  bytes: number;
}> {
  const config = envToCloudinaryConfig(env);
  const result = await uploadAsset(
    file,
    folder,
    publicId,
    resourceType,
    config
  );
  
  return {
    public_id: result.publicId,
    secure_url: result.secureUrl,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
  };
}

export async function uploadMedia(options: UploadOptions, env: Env): Promise<MediaResult> {
  const { entityType, entityId, slug, file, altText, displayName, sortOrder, isPrimary } = options;

  // Use centralized validation service
  throwIfInvalid(await validateFile(file));
  throwIfInvalid(await validateFileContent(file, file.type));

  const fileConfig = getFileTypeConfig(file.type);
  if (!fileConfig) {
    throw new Error("Unsupported file type");
  }

  const config = envToCloudinaryConfig(env);
  const prisma = getPrisma(env);

  // Use the lifecycle service for upload with verification
  const lifecycleResult = await createMediaAsset(
    file,
    entityType as any,
    entityId,
    slug,
    config,
    { altText, displayName, sortOrder, isPrimary }
  );

  try {
    const asset = await prisma.mediaAsset.create({
      data: {
        assetId: lifecycleResult.assetId,
        entityType: entityType as any,
        entityId,
        url: lifecycleResult.url,
        secureUrl: lifecycleResult.secureUrl,
        publicId: lifecycleResult.publicId,
        folder: lifecycleResult.folder,
        resourceType: lifecycleResult.resourceType,
        mimeType: lifecycleResult.mimeType,
        width: lifecycleResult.width,
        height: lifecycleResult.height,
        fileSize: lifecycleResult.bytes,
        originalFilename: lifecycleResult.originalFilename,
        displayName: displayName ?? altText ?? lifecycleResult.originalFilename,
        altText: altText ?? null,
        mediaType: fileConfig.type as "image" | "video" | "document",
        sortOrder: sortOrder ?? 0,
        isPrimary: isPrimary ?? false,
      },
    });

    return {
      id: asset.id,
      assetId: lifecycleResult.assetId,
      url: lifecycleResult.url,
      publicId: lifecycleResult.publicId,
      folder: lifecycleResult.folder,
      secureUrl: lifecycleResult.secureUrl,
      resourceType: lifecycleResult.resourceType,
      mimeType: lifecycleResult.mimeType,
      width: lifecycleResult.width,
      height: lifecycleResult.height,
      bytes: lifecycleResult.bytes,
      format: lifecycleResult.format,
      originalFilename: lifecycleResult.originalFilename,
    };
  } catch (dbError) {
    // Rollback: delete the asset from Cloudinary if DB insert fails
    try {
      await deleteAsset(lifecycleResult.publicId, lifecycleResult.resourceType, config);
    } catch (cleanupError) {
      console.error(`[MediaService] DB insert failed AND Cloudinary cleanup failed for ${lifecycleResult.publicId}. Asset may be orphaned.`, cleanupError);
    }
    throw dbError;
  }
}

export async function replaceMedia(options: ReplaceOptions, env: Env): Promise<MediaResult> {
  const { entityType, entityId, slug, file, oldAssetId, altText, displayName } = options;

  // Use centralized validation service
  throwIfInvalid(await validateFile(file));
  throwIfInvalid(await validateFileContent(file, file.type));

  const fileConfig = getFileTypeConfig(file.type);
  if (!fileConfig) {
    throw new Error("Unsupported file type");
  }

  const config = envToCloudinaryConfig(env);
  const prisma = getPrisma(env);

  const oldAsset = await prisma.mediaAsset.findUnique({ where: { id: oldAssetId } });
  if (!oldAsset) throw new Error("Old asset not found");

  const oldPublicId = oldAsset.publicId ?? "";
  const oldResourceType = (oldAsset.resourceType ?? "image") as CloudinaryResourceType;

  // Use the lifecycle service for safe replacement
  const lifecycleResult = await replaceMediaAsset(
    file,
    entityType as any,
    entityId,
    slug,
    oldAssetId,
    oldPublicId,
    oldResourceType,
    config,
    { altText, displayName }
  );

  try {
    const newAsset = await prisma.mediaAsset.create({
      data: {
        assetId: lifecycleResult.assetId,
        entityType: entityType as any,
        entityId,
        url: lifecycleResult.url,
        secureUrl: lifecycleResult.secureUrl,
        publicId: lifecycleResult.publicId,
        folder: lifecycleResult.folder,
        resourceType: lifecycleResult.resourceType,
        mimeType: lifecycleResult.mimeType,
        width: lifecycleResult.width,
        height: lifecycleResult.height,
        fileSize: lifecycleResult.bytes,
        originalFilename: lifecycleResult.originalFilename,
        displayName: displayName ?? altText ?? lifecycleResult.originalFilename,
        altText: altText ?? null,
        mediaType: fileConfig.type as "image" | "video" | "document",
        sortOrder: oldAsset.sortOrder,
        isPrimary: oldAsset.isPrimary,
      },
    });

    await prisma.mediaAsset.delete({ where: { id: oldAssetId } });

    return {
      id: newAsset.id,
      assetId: lifecycleResult.assetId,
      url: newAsset.url,
      publicId: newAsset.publicId ?? "",
      folder: lifecycleResult.folder,
      secureUrl: newAsset.secureUrl ?? newAsset.url,
      resourceType: lifecycleResult.resourceType,
      mimeType: lifecycleResult.mimeType,
      width: newAsset.width,
      height: newAsset.height,
      bytes: newAsset.fileSize ?? 0,
      format: lifecycleResult.format,
      originalFilename: lifecycleResult.originalFilename,
    };
  } catch (dbError) {
    // Rollback: delete the new asset from Cloudinary if DB operation fails
    try {
      await deleteAsset(lifecycleResult.publicId, lifecycleResult.resourceType, config);
    } catch (cleanupError) {
      console.error(`[MediaService] DB operation failed AND Cloudinary cleanup failed for ${lifecycleResult.publicId}. Asset may be orphaned.`, cleanupError);
    }
    throw dbError;
  }
}

export async function deleteMedia(assetId: string, env: Env): Promise<void> {
  const prisma = getPrisma(env);
  const asset = await prisma.mediaAsset.findUnique({ where: { id: assetId } });
  if (!asset) return;

  const config = envToCloudinaryConfig(env);

  if (asset.publicId) {
    const resourceType = (asset.resourceType ?? "image") as CloudinaryResourceType;
    // Use the lifecycle service for safe deletion
    await lifecycleDeleteMediaAsset(
      assetId,
      asset.publicId,
      resourceType,
      config,
      asset.entityType as any,
      asset.entityId,
      asset.folder || undefined
    );
  }

  await prisma.mediaAsset.delete({ where: { id: assetId } });
}

export async function deleteEntityMedia(entityType: EntityType, entityId: string, slug: string, env: Env): Promise<number> {
  const prisma = getPrisma(env);
  const assets = await prisma.mediaAsset.findMany({
    where: { entityType: entityType as any, entityId },
    select: { id: true, publicId: true, resourceType: true },
  });

  if (assets.length === 0) return 0;

  const config = envToCloudinaryConfig(env);

  // Use the lifecycle service for safe entity deletion
  const deletedCount = await lifecycleDeleteEntityMediaAssets(
    entityType as any,
    entityId,
    slug,
    config
  );

  await prisma.mediaAsset.deleteMany({ where: { entityType: entityType as any, entityId } });

  return deletedCount;
}

export async function migrateEntitySlug(
  entityType: EntityType,
  oldSlug: string,
  newSlug: string,
  entityId: string,
  env: Env
): Promise<void> {
  const prisma = getPrisma(env);
  const assets = await prisma.mediaAsset.findMany({
    where: { entityType, entityId },
  });

  if (assets.length === 0) return;

  const config = envToCloudinaryConfig(env);

  // Prepare asset mappings for lifecycle service
  const assetMappings = assets.map(asset => ({
    assetId: asset.assetId,
    oldPublicId: asset.publicId || "",
    oldResourceType: (asset.resourceType ?? "image") as CloudinaryResourceType,
    originalFilename: asset.originalFilename || "file",
  }));

  // Use the lifecycle service for safe slug migration
  const result = await lifecycleMigrateEntitySlug(
    entityType as any,
    entityId,
    oldSlug,
    newSlug,
    assetMappings,
    config
  );

  // Update database records for successfully migrated assets
  let migrationIndex = 0;
  for (const asset of assets) {
    if (migrationIndex >= result.migratedAssets) break;

    const newAssetId = generateAssetId();
    const newEntityFolder = getEntityFolder(entityType, newSlug);
    const newAssetFolder = getAssetFolder(newEntityFolder, newAssetId);
    const newPublicId = `${newEntityFolder}/${newAssetId}/${asset.originalFilename || "file"}`;

    try {
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: {
          folder: newAssetFolder,
          publicId: newPublicId,
          url: asset.url?.replace(
            encodeURIComponent(asset.publicId || ""),
            encodeURIComponent(newPublicId)
          ) ?? asset.url,
          secureUrl: asset.secureUrl?.replace(
            encodeURIComponent(asset.publicId || ""),
            encodeURIComponent(newPublicId)
          ) ?? asset.secureUrl,
        },
      });
      migrationIndex++;
    } catch (error) {
      console.error(`[MediaService] Failed to update database record for asset ${asset.id}:`, error);
    }
  }

  if (result.failedMigrations > 0) {
    console.error(`[MediaService] Failed to migrate ${result.failedMigrations}/${assets.length} assets`);
  }
}
