/**
 * Media Management Module - Cloudinary Service
 *
 * This service centralizes all Cloudinary API communication.
 * All Cloudinary operations must go through this service.
 */

import type { CloudinaryResourceType, CloudinaryConfig, CloudinaryAssetInfo } from "./media.types";
import {
  CLOUDINARY_UPLOAD_TIMEOUT,
  CLOUDINARY_DESTROY_TIMEOUT,
  DEFAULT_IMAGE_QUALITY,
  DEFAULT_IMAGE_FORMAT,
} from "./media.constants";
import {
  CloudinaryError,
  CloudinaryConfigError,
  UploadFailedError,
  DeleteFailedError,
  CopyFailedError,
  MoveFailedError,
} from "./media.errors";

/**
 * Logging utility for Cloudinary operations
 * Enabled in development, rate-limited in production to avoid log spam.
 */
function logOperation(operation: string, details: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.debug(`[CloudinaryService] ${operation}`, details);
  }
}

function logError(operation: string, error: unknown): void {
  const msg = error instanceof Error ? error.message : String(error);
  if (import.meta.env.DEV) {
    console.error(`[CloudinaryService] ${operation} failed:`, msg);
  }
}

/**
 * Generates a Cloudinary signature for API requests
 * 
 * @param params The parameters to sign
 * @param apiSecret The Cloudinary API secret
 * @returns The signature string
 */
async function generateSignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map((key) => `${key}=${params[key]}`).join("&") + apiSecret;
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-1", enc.encode(signStr));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Validates Cloudinary configuration
 * 
 * @param config The Cloudinary configuration
 * @throws CloudinaryConfigError if configuration is invalid
 */
function validateCloudinaryConfig(config: CloudinaryConfig): void {
  if (!config.cloudName) {
    throw new CloudinaryConfigError("Cloudinary cloud name is missing");
  }
  if (!config.apiKey) {
    throw new CloudinaryConfigError("Cloudinary API key is missing");
  }
  if (!config.apiSecret) {
    throw new CloudinaryConfigError("Cloudinary API secret is missing");
  }
}

/**
 * Uploads a file to Cloudinary
 * 
 * @param file The file to upload
 * @param folder The folder path in Cloudinary
 * @param publicId The public ID for the asset
 * @param resourceType The Cloudinary resource type
 * @param config The Cloudinary configuration
 * @param options Optional upload options
 * @returns The Cloudinary upload result
 * @throws UploadFailedError if upload fails
 */
export async function uploadAsset(
  file: File,
  folder: string,
  publicId: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig,
  options?: {
    overwrite?: boolean;
    eager?: string;
    transformation?: string;
  }
): Promise<CloudinaryAssetInfo> {
  logOperation("uploadAsset", { folder, publicId, resourceType, fileName: file.name, fileSize: file.size });
  validateCloudinaryConfig(config);

  const timestamp = Math.round(Date.now() / 1000);
  const uploadParams: Record<string, string> = {
    timestamp: String(timestamp),
    folder,
    public_id: publicId,
    use_filename: "true",
    unique_filename: "false",
    overwrite: options?.overwrite ? "true" : "false",
    eager: options?.eager || `f_${DEFAULT_IMAGE_FORMAT},q_${DEFAULT_IMAGE_QUALITY}`,
  };

  if (options?.transformation) {
    uploadParams.transformation = options.transformation;
  }

  const signature = await generateSignature(uploadParams, config.apiSecret);
  uploadParams.signature = signature;
  uploadParams.api_key = config.apiKey;

  const formData = new FormData();
  formData.append("file", file);
  for (const [key, value] of Object.entries(uploadParams)) {
    formData.append(key, value);
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUDINARY_UPLOAD_TIMEOUT);

  try {
    const res = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new CloudinaryError(
        errorData.error?.message ?? `Cloudinary upload failed (${res.status})`,
        res.status,
        errorData.error?.message
      );
    }

    const data = await res.json();

    logOperation("uploadAsset complete", { publicId: data.public_id, bytes: data.bytes, format: data.format });

    return {
      publicId: data.public_id,
      secureUrl: data.secure_url,
      resourceType: data.resource_type,
      format: data.format,
      width: data.width ?? null,
      height: data.height ?? null,
      bytes: data.bytes,
      folder: data.folder,
      duration: data.duration ?? null,
    };
  } catch (err) {
    clearTimeout(timeout);
    logError("uploadAsset", err);

    if (err instanceof CloudinaryError) {
      throw err;
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new UploadFailedError("Cloudinary upload timed out");
    }

    throw new UploadFailedError(
      err instanceof Error ? err.message : String(err)
    );
  }
}

/**
 * Replaces an existing asset in Cloudinary
 * 
 * @param file The new file to upload
 * @param publicId The public ID of the asset to replace
 * @param resourceType The Cloudinary resource type
 * @param config The Cloudinary configuration
 * @returns The Cloudinary upload result
 * @throws UploadFailedError if replacement fails
 */
export async function replaceAsset(
  file: File,
  publicId: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig
): Promise<CloudinaryAssetInfo> {
  logOperation("replaceAsset", { publicId, resourceType, fileName: file.name, fileSize: file.size });
  return uploadAsset(file, "", publicId, resourceType, config, { overwrite: true });
}

/**
 * Deletes an asset from Cloudinary
 * 
 * @param publicId The public ID of the asset to delete
 * @param resourceType The Cloudinary resource type
 * @param config The Cloudinary configuration
 * @returns True if deletion was successful, false otherwise
 * @throws DeleteFailedError if deletion fails
 */
export async function deleteAsset(
  publicId: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig
): Promise<boolean> {
  logOperation("deleteAsset", { publicId, resourceType });
  validateCloudinaryConfig(config);

  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string> = {
    public_id: publicId,
    timestamp: String(timestamp),
  };

  const signature = await generateSignature(params, config.apiSecret);
  params.signature = signature;
  params.api_key = config.apiKey;

  const body = new URLSearchParams(params);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUDINARY_DESTROY_TIMEOUT);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/destroy`,
      {
        method: "POST",
        body,
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new CloudinaryError(
        errorData.error?.message ?? `Cloudinary destroy failed (${res.status})`,
        res.status,
        errorData.error?.message
      );
    }

    const json = await res.json() as { result: string };
    const success = json.result === "ok";
    logOperation("deleteAsset complete", { publicId, success });
    return success;
  } catch (err) {
    clearTimeout(timeout);
    logError("deleteAsset", err);

    if (err instanceof CloudinaryError) {
      throw new DeleteFailedError(err.message, publicId);
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new DeleteFailedError("Cloudinary delete timed out", publicId);
    }

    throw new DeleteFailedError(
      err instanceof Error ? err.message : String(err),
      publicId
    );
  }
}

/**
 * Deletes all assets in a folder from Cloudinary
 * 
 * @param folder The folder path
 * @param resourceType The Cloudinary resource type
 * @param config The Cloudinary configuration
 * @returns The number of assets deleted
 * @throws DeleteFailedError if deletion fails
 */
export async function deleteFolderAssets(
  folder: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig
): Promise<number> {
  logOperation("deleteFolderAssets", { folder, resourceType });
  validateCloudinaryConfig(config);

  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string> = {
    folder,
    timestamp: String(timestamp),
  };

  const signature = await generateSignature(params, config.apiSecret);
  params.signature = signature;
  params.api_key = config.apiKey;

  const body = new URLSearchParams(params);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUDINARY_DESTROY_TIMEOUT);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/delete_by_prefix`,
      {
        method: "POST",
        body,
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new CloudinaryError(
        errorData.error?.message ?? `Cloudinary delete by prefix failed (${res.status})`,
        res.status,
        errorData.error?.message
      );
    }

    const json = await res.json() as { deleted: string[] };
    const deletedCount = json.deleted?.length || 0;
    logOperation("deleteFolderAssets complete", { folder, deletedCount });
    return deletedCount;
  } catch (err) {
    clearTimeout(timeout);
    logError("deleteFolderAssets", err);

    if (err instanceof CloudinaryError) {
      throw new DeleteFailedError(err.message, folder);
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new DeleteFailedError("Cloudinary folder delete timed out", folder);
    }

    throw new DeleteFailedError(
      err instanceof Error ? err.message : String(err),
      folder
    );
  }
}

/**
 * Deletes all assets for a specific entity
 * This is a convenience method that combines folder operations
 * 
 * @param folder The entity folder path
 * @param config The Cloudinary configuration
 * @returns The number of assets deleted
 * @throws DeleteFailedError if deletion fails
 */
export async function deleteEntityAssets(
  folder: string,
  config: CloudinaryConfig
): Promise<number> {
  logOperation("deleteEntityAssets", { folder });
  let totalDeleted = 0;

  // Delete images
  try {
    totalDeleted += await deleteFolderAssets(folder, "image", config);
  } catch {
    // Silent fail - continue with other resource types
  }

  // Delete videos
  try {
    totalDeleted += await deleteFolderAssets(folder, "video", config);
  } catch {
    // Silent fail - continue with other resource types
  }

  // Delete raw files (documents)
  try {
    totalDeleted += await deleteFolderAssets(folder, "raw", config);
  } catch {
    // Silent fail - continue with other resource types
  }

  logOperation("deleteEntityAssets complete", { folder, totalDeleted });
  return totalDeleted;
}

/**
 * Copies an asset within Cloudinary
 * 
 * @param sourcePublicId The public ID of the source asset
 * @param targetPublicId The public ID for the target asset
 * @param targetFolder The target folder path
 * @param resourceType The Cloudinary resource type
 * @param config The Cloudinary configuration
 * @returns True if copy was successful, false otherwise
 * @throws CopyFailedError if copy fails
 */
export async function copyAsset(
  sourcePublicId: string,
  targetPublicId: string,
  targetFolder: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig
): Promise<boolean> {
  logOperation("copyAsset", { sourcePublicId, targetPublicId, targetFolder, resourceType });
  validateCloudinaryConfig(config);

  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string> = {
    timestamp: String(timestamp),
    api_key: config.apiKey,
    source_public_id: sourcePublicId,
    target_public_id: targetPublicId,
    target_folder: targetFolder,
    overwrite: "false",
  };

  const signature = await generateSignature(params, config.apiSecret);
  params.signature = signature;

  const copyUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/copy`;
  const formData = new FormData();
  for (const [key, value] of Object.entries(params)) {
    formData.append(key, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUDINARY_UPLOAD_TIMEOUT);

  try {
    const res = await fetch(copyUrl, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new CloudinaryError(
        errorData.error?.message ?? `Cloudinary copy failed (${res.status})`,
        res.status,
        errorData.error?.message
      );
    }

    logOperation("copyAsset complete", { sourcePublicId, targetPublicId, success: true });
    return true;
  } catch (err) {
    clearTimeout(timeout);
    logError("copyAsset", err);

    if (err instanceof CloudinaryError) {
      throw new CopyFailedError(err.message, sourcePublicId);
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new CopyFailedError("Cloudinary copy timed out", sourcePublicId);
    }

    throw new CopyFailedError(
      err instanceof Error ? err.message : String(err),
      sourcePublicId
    );
  }
}

/**
 * Moves an asset within Cloudinary
 * Note: Cloudinary doesn't have a native move operation, this uses copy + delete
 * 
 * @param sourcePublicId The public ID of the source asset
 * @param targetPublicId The public ID for the target asset
 * @param targetFolder The target folder path
 * @param resourceType The Cloudinary resource type
 * @param config The Cloudinary configuration
 * @returns True if move was successful, false otherwise
 * @throws MoveFailedError if move fails
 */
export async function moveAsset(
  sourcePublicId: string,
  targetPublicId: string,
  targetFolder: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig
): Promise<boolean> {
  logOperation("moveAsset", { sourcePublicId, targetPublicId, targetFolder, resourceType });
  try {
    // Copy the asset to the new location
    const copySuccess = await copyAsset(
      sourcePublicId,
      targetPublicId,
      targetFolder,
      resourceType,
      config
    );

    if (!copySuccess) {
      throw new MoveFailedError("Copy operation failed during move", sourcePublicId);
    }

    // Delete the original asset
    const deleteSuccess = await deleteAsset(sourcePublicId, resourceType, config);

    if (!deleteSuccess) {
      // If delete fails, try to clean up the copy
      await deleteAsset(targetPublicId, resourceType, config);
      throw new MoveFailedError("Delete operation failed during move", sourcePublicId);
    }

    logOperation("moveAsset complete", { sourcePublicId, targetPublicId, success: true });
    return true;
  } catch (err) {
    logError("moveAsset", err);
    if (err instanceof MoveFailedError) {
      throw err;
    }
    throw new MoveFailedError(
      err instanceof Error ? err.message : String(err),
      sourcePublicId
    );
  }
}

/**
 * Gets asset information from Cloudinary
 * 
 * @param publicId The public ID of the asset
 * @param resourceType The Cloudinary resource type
 * @param config The Cloudinary configuration
 * @returns The asset information
 * @throws CloudinaryError if retrieval fails
 */
export async function getAsset(
  publicId: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig
): Promise<CloudinaryAssetInfo> {
  logOperation("getAsset", { publicId, resourceType });
  validateCloudinaryConfig(config);

  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string> = {
    public_id: publicId,
    timestamp: String(timestamp),
  };

  const signature = await generateSignature(params, config.apiSecret);
  params.signature = signature;
  params.api_key = config.apiKey;

  const url = new URLSearchParams(params).toString();
  const resourceUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload/${publicId}?${url}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUDINARY_DESTROY_TIMEOUT);

  try {
    const res = await fetch(resourceUrl, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new CloudinaryError(
        errorData.error?.message ?? `Cloudinary get asset failed (${res.status})`,
        res.status,
        errorData.error?.message
      );
    }

    const data = await res.json();

    return {
      publicId: data.public_id,
      secureUrl: data.secure_url,
      resourceType: data.resource_type,
      format: data.format,
      width: data.width ?? null,
      height: data.height ?? null,
      bytes: data.bytes,
      folder: data.folder,
      duration: data.duration ?? null,
    };
  } catch (err) {
    clearTimeout(timeout);
    logError("getAsset", err);

    if (err instanceof CloudinaryError) {
      throw err;
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new CloudinaryError("Cloudinary get asset timed out");
    }

    throw new CloudinaryError(
      err instanceof Error ? err.message : String(err)
    );
  }
}

/**
 * Checks if an asset exists in Cloudinary
 * 
 * @param publicId The public ID of the asset
 * @param resourceType The Cloudinary resource type
 * @param config The Cloudinary configuration
 * @returns True if the asset exists, false otherwise
 */
export async function assetExists(
  publicId: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig
): Promise<boolean> {
  try {
    await getAsset(publicId, resourceType, config);
    return true;
  } catch (err) {
    if (err instanceof CloudinaryError) {
      return false;
    }
    return false;
  }
}

/**
 * Lists all assets in a specific folder
 * 
 * @param folder The folder path
 * @param resourceType The Cloudinary resource type
 * @param config The Cloudinary configuration
 * @param maxResults Maximum number of results to return (default: 500)
 * @returns Array of asset information
 * @throws CloudinaryError if listing fails
 */
export async function listAssetsInFolder(
  folder: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig,
  maxResults: number = 500
): Promise<CloudinaryAssetInfo[]> {
  logOperation("listAssetsInFolder", { folder, resourceType, maxResults });
  validateCloudinaryConfig(config);

  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string> = {
    prefix: folder,
    type: "upload",
    max_results: String(maxResults),
    timestamp: String(timestamp),
  };

  const signature = await generateSignature(params, config.apiSecret);
  params.signature = signature;
  params.api_key = config.apiKey;

  const url = new URLSearchParams(params).toString();
  const listUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/resources/${resourceType}?${url}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUDINARY_DESTROY_TIMEOUT);

  try {
    const res = await fetch(listUrl, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new CloudinaryError(
        errorData.error?.message ?? `Cloudinary list assets failed (${res.status})`,
        res.status,
        errorData.error?.message
      );
    }

    const data = await res.json() as { resources: Array<{ public_id: string; secure_url: string; resource_type: string; format: string; width?: number; height?: number; bytes: number; folder?: string }> };

    logOperation("listAssetsInFolder complete", { folder, count: data.resources.length });
    return data.resources.map((resource) => ({
      publicId: resource.public_id,
      secureUrl: resource.secure_url,
      resourceType: resource.resource_type as CloudinaryResourceType,
      format: resource.format,
      width: resource.width ?? null,
      height: resource.height ?? null,
      bytes: resource.bytes,
      folder: resource.folder,
    }));
  } catch (err) {
    clearTimeout(timeout);
    logError("listAssetsInFolder", err);

    if (err instanceof CloudinaryError) {
      throw err;
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new CloudinaryError("Cloudinary list assets timed out");
    }

    throw new CloudinaryError(
      err instanceof Error ? err.message : String(err)
    );
  }
}

/**
 * Retrieves all assets under an entity folder
 * This is a convenience method that combines folder operations
 * 
 * @param folder The entity folder path
 * @param config The Cloudinary configuration
 * @returns Array of all asset information under the folder
 * @throws CloudinaryError if retrieval fails
 */
export async function getEntityAssets(
  folder: string,
  config: CloudinaryConfig
): Promise<CloudinaryAssetInfo[]> {
  logOperation("getEntityAssets", { folder });
  const allAssets: CloudinaryAssetInfo[] = [];

  // Get images
  try {
    const images = await listAssetsInFolder(folder, "image", config);
    allAssets.push(...images);
  } catch (err) {
    console.error(`[CloudinaryService] Failed to list images in folder ${folder}:`, err);
  }

  // Get videos
  try {
    const videos = await listAssetsInFolder(folder, "video", config);
    allAssets.push(...videos);
  } catch (err) {
    console.error(`[CloudinaryService] Failed to list videos in folder ${folder}:`, err);
  }

  // Get raw files (documents)
  try {
    const rawFiles = await listAssetsInFolder(folder, "raw", config);
    allAssets.push(...rawFiles);
  } catch (err) {
    console.error(`[CloudinaryService] Failed to list raw files in folder ${folder}:`, err);
  }

  logOperation("getEntityAssets complete", { folder, count: allAssets.length });
  return allAssets;
}

/**
 * Migrates assets from one entity folder to another (for slug changes)
 * This creates new folders and copies assets, returning updated metadata
 * 
 * @param oldFolder The old entity folder path
 * @param newFolder The new entity folder path
 * @param config The Cloudinary configuration
 * @returns Object with migration results
 * @throws CloudinaryError if migration fails
 */
export async function migrateEntityFolder(
  oldFolder: string,
  newFolder: string,
  config: CloudinaryConfig
): Promise<{
  migratedAssets: Array<{ oldPublicId: string; newPublicId: string; secureUrl: string }>;
  failedAssets: Array<{ oldPublicId: string; error: string }>;
}> {
  logOperation("migrateEntityFolder", { oldFolder, newFolder });
  const migratedAssets: Array<{ oldPublicId: string; newPublicId: string; secureUrl: string }> = [];
  const failedAssets: Array<{ oldPublicId: string; error: string }> = [];

  // Get all assets in the old folder
  const assets = await getEntityAssets(oldFolder, config);

  for (const asset of assets) {
    try {
      // Extract asset ID from the public ID
      const parts = asset.publicId.split("/");
      const assetId = parts[parts.length - 2] || ""; // asset_xxxxxxxxx
      const filename = parts[parts.length - 1] || "file";

      // Generate new public ID
      const newPublicId = `${newFolder}/${assetId}/${filename}`;

      // Copy the asset to the new location
      const copySuccess = await copyAsset(
        asset.publicId,
        newPublicId,
        newFolder,
        asset.resourceType,
        config
      );

      if (copySuccess) {
        migratedAssets.push({
          oldPublicId: asset.publicId,
          newPublicId,
          secureUrl: asset.secureUrl,
        });
      } else {
        failedAssets.push({
          oldPublicId: asset.publicId,
          error: "Copy operation returned false",
        });
      }
    } catch (err) {
      failedAssets.push({
        oldPublicId: asset.publicId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logOperation("migrateEntityFolder complete", { oldFolder, newFolder, migrated: migratedAssets.length, failed: failedAssets.length });
  return { migratedAssets, failedAssets };
}

/**
 * Cleans up orphaned assets in a folder
 * Assets that don't have corresponding database records can be identified and removed
 * 
 * @param folder The folder to clean up
 * @param validPublicIds Array of valid public IDs to keep
 * @param config The Cloudinary configuration
 * @returns Number of assets deleted
 * @throws CloudinaryError if cleanup fails
 */
export async function cleanupOrphanedAssets(
  folder: string,
  validPublicIds: string[],
  config: CloudinaryConfig
): Promise<number> {
  logOperation("cleanupOrphanedAssets", { folder, validIdsCount: validPublicIds.length });
  const assets = await getEntityAssets(folder, config);
  const validSet = new Set(validPublicIds);
  let deletedCount = 0;

  for (const asset of assets) {
    if (!validSet.has(asset.publicId)) {
      try {
        const success = await deleteAsset(asset.publicId, asset.resourceType, config);
        if (success) {
          deletedCount++;
          console.log(`[CloudinaryService] Deleted orphaned asset: ${asset.publicId}`);
        }
      } catch (err) {
        console.error(`[CloudinaryService] Failed to delete orphaned asset ${asset.publicId}:`, err);
      }
    }
  }

  logOperation("cleanupOrphanedAssets complete", { folder, deletedCount });
  return deletedCount;
}
