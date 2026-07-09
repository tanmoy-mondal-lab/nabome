/**
 * Media Management Module - Main Media Service
 * 
 * This is the main service that coordinates all media operations.
 * It serves as the single public API for the media management system.
 * All media operations should go through this service.
 * 
 * This service does NOT integrate with database or controllers yet.
 * It only provides the core media management infrastructure.
 */

import type {
  UploadOptions,
  ReplaceOptions,
  UploadResult,
  ReplaceResult,
  DeleteResult,
  DeleteEntityResult,
  CloudinaryConfig,
  MediaType,
} from "./media.types";
import { generateAssetId } from "./asset-id.service";
import {
  getEntityFolder,
  getAssetFolder,
  getTempFolder,
} from "./folder.service";
import {
  validateFile,
  validateFileContent,
  getFileTypeConfig,
  throwIfInvalid,
} from "./validation.service";
import {
  uploadAsset,
  replaceAsset as cloudinaryReplace,
  deleteAsset,
  deleteEntityAssets,
  copyAsset,
  moveAsset,
  getAsset,
  assetExists,
} from "./cloudinary.service";
import { sanitizeFilename, getFileExtension } from "./media.utils";
import {
  UploadFailedError,
  DeleteFailedError,
  ReplaceFailedError,
  AssetNotFoundError,
  InvalidFileError,
  CopyFailedError,
} from "./media.errors";

/**
 * Uploads a media file to Cloudinary
 * This is the main entry point for media uploads
 * 
 * @param options Upload options including file, entity info, and metadata
 * @param config Cloudinary configuration
 * @returns Upload result with asset information
 * @throws InvalidFileError, UploadFailedError, etc.
 */
export async function uploadMedia(
  options: UploadOptions,
  config: CloudinaryConfig
): Promise<UploadResult> {
  const { entityType, entityId, slug, file, altText, displayName, sortOrder, isPrimary } = options;

  // Validate the file
  const fileValidation = validateFile(file);
  throwIfInvalid(fileValidation);

  // Validate file content (prevent type spoofing)
  const contentValidation = await validateFileContent(file, file.type);
  throwIfInvalid(contentValidation);

  // Get file type configuration
  const fileConfig = getFileTypeConfig(file.type);
  if (!fileConfig) {
    throw new InvalidFileError(`No configuration found for file type: ${file.type}`);
  }

  // Generate unique asset ID
  const assetId = generateAssetId();

  // Generate folder paths
  const entityFolder = getEntityFolder(entityType, slug);
  const assetFolder = getAssetFolder(entityFolder, assetId);

  // Sanitize filename
  const cleanedName = sanitizeFilename(file.name);
  const publicId = `${assetId}/${cleanedName}`;

  // Upload to Cloudinary
  let cloudinaryResult;
  try {
    cloudinaryResult = await uploadAsset(
      file,
      entityFolder,
      publicId,
      fileConfig.resourceType,
      config
    );
  } catch (err) {
    if (err instanceof UploadFailedError) {
      throw err;
    }
    throw new UploadFailedError(
      err instanceof Error ? err.message : String(err)
    );
  }

  // Prepare standardized result
  const result: UploadResult = {
    id: assetId, // This will be replaced with DB ID when integrated
    assetId,
    url: cloudinaryResult.secureUrl,
    publicId: cloudinaryResult.publicId,
    folder: assetFolder,
    secureUrl: cloudinaryResult.secureUrl,
    resourceType: cloudinaryResult.resourceType,
    mimeType: file.type,
    width: cloudinaryResult.width,
    height: cloudinaryResult.height,
    bytes: cloudinaryResult.bytes,
    format: cloudinaryResult.format,
    originalFilename: cleanedName,
    duration: cloudinaryResult.duration,
  };

  return result;
}

/**
 * Replaces an existing media asset with a new file
 *
 * @param options Replace options including new file and old asset ID
 * @param config Cloudinary configuration
 * @returns Replace result with new asset information
 * @throws InvalidFileError, ReplaceFailedError, AssetNotFoundError, etc.
 */
export async function replaceMedia(
  options: ReplaceOptions,
  config: CloudinaryConfig
): Promise<ReplaceResult> {
  const { entityType, entityId, slug, file, oldAssetId, oldPublicId, altText, displayName } = options;

  // Validate the file
  const fileValidation = validateFile(file);
  throwIfInvalid(fileValidation);

  // Validate file content
  const contentValidation = await validateFileContent(file, file.type);
  throwIfInvalid(contentValidation);

  // Get file type configuration
  const fileConfig = getFileTypeConfig(file.type);
  if (!fileConfig) {
    throw new InvalidFileError(`No configuration found for file type: ${file.type}`);
  }

  // Note: In a real implementation, we would check if oldAssetId exists in the database
  // For now, we assume the caller has validated this

  // Generate new asset ID
  const newAssetId = generateAssetId();

  // Generate folder paths
  const entityFolder = getEntityFolder(entityType, slug);
  const newAssetFolder = getAssetFolder(entityFolder, newAssetId);

  // Sanitize filename
  const cleanedName = sanitizeFilename(file.name);
  const newPublicId = `${newAssetId}/${cleanedName}`;

  // Upload new asset to temp folder first
  const tempFolder = getTempFolder(newAssetId);
  let tempResult;
  try {
    tempResult = await uploadAsset(
      file,
      tempFolder,
      `${newAssetId}/${cleanedName}`,
      fileConfig.resourceType,
      config
    );
  } catch (err) {
    throw new ReplaceFailedError(
      err instanceof Error ? err.message : String(err),
      oldAssetId
    );
  }

  // Upload to final location
  let finalResult;
  try {
    finalResult = await uploadAsset(
      file,
      entityFolder,
      newPublicId,
      fileConfig.resourceType,
      config
    );
  } catch (err) {
    // Clean up temp upload
    try {
      await deleteAsset(tempResult.publicId, fileConfig.resourceType, config);
    } catch (cleanupErr) {
      console.error("[MediaService] Failed to cleanup temp upload:", cleanupErr);
    }
    throw new ReplaceFailedError(
      err instanceof Error ? err.message : String(err),
      oldAssetId
    );
  }

  // Clean up temp upload
  try {
    await deleteAsset(tempResult.publicId, fileConfig.resourceType, config);
  } catch (cleanupErr) {
    console.error("[MediaService] Failed to cleanup temp upload:", cleanupErr);
  }

  // Delete old asset if oldPublicId is provided
  if (oldPublicId) {
    try {
      await deleteAsset(oldPublicId, fileConfig.resourceType, config);
      console.log("[MediaService] Deleted old asset:", oldPublicId);
    } catch (cleanupErr) {
      console.error("[MediaService] Failed to delete old asset:", oldPublicId, cleanupErr);
      // Don't throw - the new asset was successfully uploaded
    }
  }

  // Prepare standardized result
  const result: ReplaceResult = {
    id: newAssetId, // This will be replaced with DB ID when integrated
    assetId: newAssetId,
    url: finalResult.secureUrl,
    publicId: finalResult.publicId,
    folder: newAssetFolder,
    secureUrl: finalResult.secureUrl,
    resourceType: finalResult.resourceType,
    mimeType: file.type,
    width: finalResult.width,
    height: finalResult.height,
    bytes: finalResult.bytes,
    format: finalResult.format,
    originalFilename: cleanedName,
    duration: finalResult.duration,
  };

  return result;
}

/**
 * Deletes a media asset from Cloudinary
 * 
 * @param assetId The asset ID to delete
 * @param publicId The Cloudinary public ID
 * @param resourceType The Cloudinary resource type
 * @param config Cloudinary configuration
 * @returns Delete result
 * @throws DeleteFailedError
 */
export async function deleteMedia(
  assetId: string,
  publicId: string,
  resourceType: string,
  config: CloudinaryConfig
): Promise<DeleteResult> {
  try {
    const success = await deleteAsset(publicId, resourceType as any, config);

    if (!success) {
      return {
        success: false,
        assetId,
        error: "Cloudinary delete operation returned failure",
      };
    }

    return {
      success: true,
      assetId,
    };
  } catch (err) {
    throw new DeleteFailedError(
      err instanceof Error ? err.message : String(err),
      publicId
    );
  }
}

/**
 * Deletes all media assets for a specific entity
 * 
 * @param entityType The entity type
 * @param slug The entity slug
 * @param config Cloudinary configuration
 * @returns Delete entity result with counts
 * @throws DeleteFailedError
 */
export async function deleteEntityMedia(
  entityType: string,
  slug: string,
  config: CloudinaryConfig
): Promise<DeleteEntityResult> {
  const entityFolder = getEntityFolder(entityType as any, slug);

  try {
    const deletedCount = await deleteEntityAssets(entityFolder, config);

    return {
      deletedCount,
      deletedAssetIds: [], // Will be populated from DB when integrated
      failedAssetIds: [],
    };
  } catch (err) {
    throw new DeleteFailedError(
      err instanceof Error ? err.message : String(err),
      entityFolder
    );
  }
}

/**
 * Copies a media asset to a new location
 * 
 * @param sourcePublicId The source public ID
 * @param targetEntityType The target entity type
 * @param targetSlug The target entity slug
 * @param config Cloudinary configuration
 * @returns The new public ID
 * @throws CopyFailedError
 */
export async function copyMedia(
  sourcePublicId: string,
  targetEntityType: string,
  targetSlug: string,
  config: CloudinaryConfig
): Promise<string> {
  const newAssetId = generateAssetId();
  const targetFolder = getEntityFolder(targetEntityType as any, targetSlug);
  const targetPublicId = `${targetFolder}/${newAssetId}`;

  // Extract resource type from source public ID
  const resourceType = "image"; // Default, should be determined from source

  try {
    const success = await copyAsset(
      sourcePublicId,
      targetPublicId,
      targetFolder,
      resourceType as any,
      config
    );

    if (!success) {
      throw new CopyFailedError("Copy operation failed", sourcePublicId);
    }

    return targetPublicId;
  } catch (err) {
    if (err instanceof CopyFailedError) {
      throw err;
    }
    throw new CopyFailedError(
      err instanceof Error ? err.message : String(err),
      sourcePublicId
    );
  }
}

/**
 * Moves a media asset to a new location
 * 
 * @param sourcePublicId The source public ID
 * @param targetEntityType The target entity type
 * @param targetSlug The target entity slug
 * @param config Cloudinary configuration
 * @returns The new public ID
 * @throws MoveFailedError
 */
export async function moveMedia(
  sourcePublicId: string,
  targetEntityType: string,
  targetSlug: string,
  config: CloudinaryConfig
): Promise<string> {
  const newAssetId = generateAssetId();
  const targetFolder = getEntityFolder(targetEntityType as any, targetSlug);
  const targetPublicId = `${targetFolder}/${newAssetId}`;

  // Extract resource type from source public ID
  const resourceType = "image"; // Default, should be determined from source

  try {
    const success = await moveAsset(
      sourcePublicId,
      targetPublicId,
      targetFolder,
      resourceType as any,
      config
    );

    if (!success) {
      throw new Error("Move operation failed");
    }

    return targetPublicId;
  } catch (err) {
    if (err instanceof Error && err.name === "MoveFailedError") {
      throw err;
    }
    throw new Error(
      err instanceof Error ? err.message : String(err)
    );
  }
}

/**
 * Gets information about a media asset
 * 
 * @param publicId The Cloudinary public ID
 * @param resourceType The Cloudinary resource type
 * @param config Cloudinary configuration
 * @returns Asset information
 * @throws CloudinaryError, AssetNotFoundError
 */
export async function getMediaInfo(
  publicId: string,
  resourceType: string,
  config: CloudinaryConfig
) {
  try {
    return await getAsset(publicId, resourceType as any, config);
  } catch (err) {
    throw new AssetNotFoundError(
      err instanceof Error ? err.message : String(err),
      publicId
    );
  }
}

/**
 * Checks if a media asset exists
 * 
 * @param publicId The Cloudinary public ID
 * @param resourceType The Cloudinary resource type
 * @param config Cloudinary configuration
 * @returns True if the asset exists, false otherwise
 */
export async function mediaExists(
  publicId: string,
  resourceType: string,
  config: CloudinaryConfig
): Promise<boolean> {
  return await assetExists(publicId, resourceType as any, config);
}

/**
 * Prepares metadata for a media upload
 * This is useful for pre-upload validation or UI display
 * 
 * @param file The file to prepare metadata for
 * @param entityType The entity type
 * @param entityId The entity ID
 * @param slug The entity slug
 * @returns Metadata object
 */
export async function prepareUploadMetadata(
  file: File,
  entityType: string,
  entityId: string,
  slug: string
) {
  // Validate the file
  const fileValidation = validateFile(file);
  if (!fileValidation.valid) {
    return {
      valid: false,
      error: fileValidation.error,
    };
  }

  // Get file type configuration
  const fileConfig = getFileTypeConfig(file.type);
  if (!fileConfig) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}`,
    };
  }

  // Generate preview asset ID (not actually used)
  const previewAssetId = generateAssetId();

  // Generate folder paths
  const entityFolder = getEntityFolder(entityType as any, slug);
  const assetFolder = getAssetFolder(entityFolder, previewAssetId);

  // Sanitize filename
  const cleanedName = sanitizeFilename(file.name);

  return {
    valid: true,
    metadata: {
      entityType,
      entityId,
      slug,
      fileName: file.name,
      sanitizedFileName: cleanedName,
      fileSize: file.size,
      mimeType: file.type,
      mediaType: fileConfig.type,
      resourceType: fileConfig.resourceType,
      extension: getFileExtension(file.name),
      previewAssetId,
      entityFolder,
      assetFolder,
      estimatedPublicId: `${previewAssetId}/${cleanedName}`,
    },
  };
}

/**
 * Batch uploads multiple files
 * 
 * @param files Array of files to upload
 * @param entityType The entity type
 * @param entityId The entity ID
 * @param slug The entity slug
 * @param config Cloudinary configuration
 * @returns Array of upload results
 */
export async function batchUploadMedia(
  files: File[],
  entityType: string,
  entityId: string,
  slug: string,
  config: CloudinaryConfig
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const result = await uploadMedia(
        {
          entityType: entityType as any,
          entityId,
          slug,
          file,
        },
        config
      );
      results.push(result);
    } catch (err) {
      console.error(`[MediaService] Failed to upload file ${i + 1}:`, err);
      // Continue with other files even if one fails
      // Could optionally throw here to fail fast
    }
  }

  return results;
}
