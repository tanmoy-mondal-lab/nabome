import type { EntityType, CloudinaryConfig, CloudinaryResourceType } from "./types";
import { generateAssetId } from "./asset-id";
import { getEntityFolder, getAssetFolder } from "./folder";
import { uploadToCloudinary, deleteAsset } from "./cloudinary";

export interface CreateMediaResult {
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

export async function createMediaAsset(
  file: File,
  entityType: EntityType,
  _entityId: string,
  slug: string,
  config: CloudinaryConfig,
  _metadata?: { altText?: string; displayName?: string; sortOrder?: number; isPrimary?: boolean }
): Promise<CreateMediaResult> {
  const assetId = generateAssetId();
  const entityFolder = getEntityFolder(entityType, slug);
  const assetFolder = getAssetFolder(entityFolder, assetId);
  const originalFilename = file.name;
  const publicId = `${assetFolder}/${originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const resourceType: CloudinaryResourceType = file.type.startsWith("video/") ? "video" : "image";

  const uploadResult = await uploadToCloudinary(file, publicId, assetFolder, resourceType, config);

  return {
    assetId,
    url: uploadResult.url,
    publicId: uploadResult.publicId,
    folder: assetFolder,
    secureUrl: uploadResult.secureUrl,
    resourceType: uploadResult.resourceType,
    mimeType: file.type,
    width: uploadResult.width,
    height: uploadResult.height,
    bytes: uploadResult.bytes,
    format: uploadResult.format,
    originalFilename,
  };
}

export interface ReplaceMediaResult {
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

export async function replaceMediaAsset(
  file: File,
  entityType: EntityType,
  entityId: string,
  slug: string,
  _oldAssetId: string,
  oldPublicId: string,
  oldResourceType: CloudinaryResourceType,
  config: CloudinaryConfig,
  metadata?: { altText?: string; displayName?: string }
): Promise<ReplaceMediaResult> {
  await deleteAsset(oldPublicId, oldResourceType, config);
  return createMediaAsset(file, entityType, entityId, slug, config, metadata);
}

export async function deleteMediaAsset(
  _assetId: string,
  publicId: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig,
  _entityType?: EntityType,
  _entityId?: string,
  _folder?: string
): Promise<void> {
  await deleteAsset(publicId, resourceType, config);
}

export interface DeleteEntityResult {
  deletedCount: number;
  migratedAssets: number;
  failedMigrations: number;
}

export async function deleteEntityMediaAssets(
  entityType: EntityType,
  _entityId: string,
  slug: string,
  config: CloudinaryConfig
): Promise<DeleteEntityResult> {
  const entityFolder = getEntityFolder(entityType, slug);
  try {
    await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/folders/${entityFolder}`,
      { method: "DELETE" }
    );
  } catch {
    // Folder deletion is best-effort
  }
  return { deletedCount: 1, migratedAssets: 0, failedMigrations: 0 };
}

export interface MigrateSlugResult {
  migratedAssets: number;
  failedMigrations: number;
}

export async function migrateEntitySlug(
  entityType: EntityType,
  _entityId: string,
  _oldSlug: string,
  newSlug: string,
  assetMappings: Array<{ assetId: string; oldPublicId: string; oldResourceType: CloudinaryResourceType; originalFilename: string }>,
  config: CloudinaryConfig
): Promise<MigrateSlugResult> {
  let migrated = 0;
  let failed = 0;

  for (const mapping of assetMappings) {
    try {
      const newFolder = getEntityFolder(entityType, newSlug);
      const newAssetId = generateAssetId();
      const newAssetFolder = getAssetFolder(newFolder, newAssetId);
      const newPublicId = `${newAssetFolder}/${mapping.originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const params: Record<string, string> = {
        from_public_id: mapping.oldPublicId,
        to_public_id: newPublicId,
        overwrite: "true",
      };

      const timestamp = Math.round(Date.now() / 1000);
      params.timestamp = String(timestamp);

      const sortedKeys = Object.keys(params).sort();
      const signStr = sortedKeys.map((key) => `${key}=${params[key]}`).join("&") + config.apiSecret;
      const enc = new TextEncoder();
      const hashBuf = await crypto.subtle.digest("SHA-1", enc.encode(signStr));
      const signature = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");

      const body = new URLSearchParams({ ...params, api_key: config.apiKey, signature });

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/${mapping.oldResourceType}/rename`,
        { method: "POST", body }
      );

      if (res.ok) {
        migrated++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { migratedAssets: migrated, failedMigrations: failed };
}
