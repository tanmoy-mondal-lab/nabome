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
  slug: string,
  config: CloudinaryConfig,
): Promise<CreateMediaResult> {
  const assetId = generateAssetId();
  const entityFolder = getEntityFolder(entityType, slug);
  const assetFolder = getAssetFolder(entityFolder, assetId);
  const originalFilename = file.name;
  const publicId = `${assetFolder}/${originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const resourceType: CloudinaryResourceType = file.type.startsWith("video/") ? "video" : file.type === "application/pdf" ? "raw" : "image";

  const uploadResult = await uploadToCloudinary(file, publicId, resourceType, config);

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
  _entityId: string,
  slug: string,
  _oldAssetId: string,
  _oldPublicId: string,
  _oldResourceType: CloudinaryResourceType,
  config: CloudinaryConfig,
): Promise<ReplaceMediaResult> {
  // Upload new asset FIRST — never delete the old one before the new one is confirmed.
  // The caller (replaceMedia in media-service.ts) is responsible for deleting the old
  // Cloudinary asset ONLY after the new DB record is successfully committed.
  return createMediaAsset(file, entityType, slug, config);
}

export async function deleteMediaAsset(
  publicId: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig,
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
  let deletedCount = 0;

  // Delete individual assets within the folder rather than the folder itself
  // Cloudinary's folder deletion API is unreliable for non-empty folders
  try {
    // List all resources in the folder
    const listRes = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/resources/image?prefix=${encodeURIComponent(`${entityFolder}/`)}&max_results=500`,
      {
        headers: {
          "Authorization": `Basic ${btoa(`${config.apiKey}:${config.apiSecret}`)}`,
        },
      }
    );

    if (listRes.ok) {
      const listData = await listRes.json();
      const resources = listData.resources || [];

      // Delete resources by public_id
      for (const resource of resources) {
        const deleteResult = await deleteAsset(resource.public_id, "image", config);
        if (deleteResult) deletedCount++;
      }
    }

    // Attempt folder deletion as best-effort cleanup
    try {
      const folderParams: Record<string, string> = {
        folder: entityFolder,
        timestamp: String(Math.round(Date.now() / 1000)),
      };
      const folderSortedKeys = Object.keys(folderParams).sort();
      const folderSignStr = folderSortedKeys.map((key) => `${key}=${folderParams[key]}`).join("&") + config.apiSecret;
      const folderEnc = new TextEncoder();
      const folderHashBuf = await crypto.subtle.digest("SHA-1", folderEnc.encode(folderSignStr));
      const folderSignature = Array.from(new Uint8Array(folderHashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");

      const folderBody = new URLSearchParams({
        ...folderParams,
        api_key: config.apiKey,
        signature: folderSignature,
      });

      await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/folders/${entityFolder}`,
        { method: "DELETE", body: folderBody }
      );
    } catch {
      // Folder deletion is best-effort
    }
  } catch {
    // Asset deletion is best-effort
  }

  return { deletedCount, migratedAssets: 0, failedMigrations: 0 };
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
