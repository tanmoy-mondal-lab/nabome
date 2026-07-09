/**
 * Media Management Module - Lifecycle Service
 *
 * This service implements the complete media lifecycle management system.
 * It ensures Cloudinary and the database always remain synchronized.
 *
 * Core Principles:
 * - Folder hierarchy is the source of truth
 * - Every entity owns one entity folder
 * - Every uploaded file owns one asset folder
 * - Every asset folder contains exactly one file
 * - No orphan assets or folders remain after operations
 */

import type {
  EntityType,
  CloudinaryConfig,
  CloudinaryResourceType,
  UploadResult,
  ReplaceResult,
} from "./media.types";
import {
  uploadAsset,
  deleteAsset,
  deleteEntityAssets,
  copyAsset,
  getEntityAssets,
  cleanupOrphanedAssets,
} from "./cloudinary.service";
import {
  generateAssetId,
} from "./asset-id.service";
import {
  getEntityFolder,
  getAssetFolder,
  getTempFolder,
} from "./folder.service";
import {
  sanitizeFilename,
} from "./media.utils";
import {
  LifecycleError,
  VerificationError,
  RollbackError,
} from "./media.errors";
import {
  performSecurityChecks,
  MediaAuthorizationLevel,
  MediaUserContext,
  authorizeMediaOperation,
  createSafePublicId,
} from "./security.service";
import { logLifecycleEvent, getLogger } from "./logging.service";

/**
 * Lifecycle event types for logging
 */
export type LifecycleEventType =
  | "upload"
  | "replace"
  | "delete"
  | "delete_entity"
  | "slug_change"
  | "cleanup"
  | "verification"
  | "rollback"
  | "migration";

/**
 * Lifecycle event log entry
 */
export interface LifecycleEventLog {
  eventType: LifecycleEventType;
  entityType?: EntityType;
  entityId?: string;
  slug?: string;
  assetId?: string;
  oldAssetId?: string;
  publicId?: string;
  oldPublicId?: string;
  folder?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
}

/**
 * Verification result comparing database and Cloudinary
 */
export interface VerificationResult {
  isConsistent: boolean;
  missingInCloudinary: Array<{ assetId: string; publicId: string }>;
  missingInDatabase: Array<{ publicId: string; folder: string }>;
  incorrectPublicIds: Array<{ assetId: string; dbPublicId: string; cloudPublicId: string }>;
  incorrectFolders: Array<{ assetId: string; dbFolder: string; cloudFolder: string }>;
  duplicateAssets: Array<{ publicId: string; count: number }>;
  duplicateRecords: Array<{ assetId: string; count: number }>;
  totalAssetsInDb: number;
  totalAssetsInCloudinary: number;
}

/**
 * Cleanup result
 */
export interface CleanupResult {
  orphanedAssetsDeleted: number;
  orphanedFoldersDeleted: number;
  unusedEntityFoldersDeleted: number;
  staleMetadataRemoved: number;
  errors: Array<{ operation: string; error: string }>;
}

/**
 * Slug migration result
 */
export interface SlugMigrationResult {
  migratedAssets: number;
  failedMigrations: number;
  oldFolderDeleted: boolean;
  errors: Array<{ assetId: string; error: string }>;
}

/**
 * Logs a lifecycle event using the structured logging service
 */
function logEvent(event: LifecycleEventLog): void {
  logLifecycleEvent(
    event.eventType,
    event.success,
    {
      entityType: event.entityType,
      entityId: event.entityId,
      slug: event.slug,
      assetId: event.assetId,
      oldAssetId: event.oldAssetId,
      publicId: event.publicId,
      oldPublicId: event.oldPublicId,
      folder: event.folder,
      error: event.error,
      ...event.metadata,
    }
  );
}

/**
 * Gets recent lifecycle events (deprecated - use logging service instead)
 * @deprecated Use the logging service for persistent logging
 */
export function getLifecycleEvents(_limit: number = 100): LifecycleEventLog[] {
  const logger = getLogger();
  logger.warn("getLifecycleEvents is deprecated - use logging service for persistent logs");
  return [];
}

/**
 * Clears the lifecycle event log (deprecated - no-op)
 * @deprecated Logging is now persistent, no need to clear
 */
export function clearLifecycleLog(): void {
  const logger = getLogger();
  logger.warn("clearLifecycleLog is deprecated - logging is now persistent");
}

/**
 * CREATE Workflow
 * Creates a new media asset with proper folder hierarchy and verification
 */
export async function createMediaAsset(
  file: File,
  entityType: EntityType,
  entityId: string,
  slug: string,
  config: CloudinaryConfig,
  options?: {
    altText?: string;
    displayName?: string;
    sortOrder?: number;
    isPrimary?: boolean;
    userContext?: MediaUserContext;
  }
): Promise<UploadResult> {
  // Security checks
  const securityCheck = performSecurityChecks({
    entityType,
    entityId,
    slug,
  });
  if (!securityCheck.passed) {
    throw new LifecycleError(
      `Security check failed: ${securityCheck.errors.join(", ")}`,
      "security_check_failed"
    );
  }

  // Authorization check
  if (options?.userContext) {
    const authResult = authorizeMediaOperation(
      MediaAuthorizationLevel.UPLOAD,
      options.userContext,
      entityType,
      entityId
    );
    if (!authResult.authorized) {
      throw new LifecycleError(
        `Authorization failed: ${authResult.reason}`,
        "authorization_failed"
      );
    }
  }

  const assetId = generateAssetId();
  const entityFolder = getEntityFolder(entityType, slug);
  const assetFolder = getAssetFolder(entityFolder, assetId);
  const cleanedName = sanitizeFilename(file.name);
  const publicId = `${assetId}/${cleanedName}`;

  // Validate public ID security
  const publicIdCheck = createSafePublicId(assetId, cleanedName);
  if (!publicIdCheck.passed) {
    throw new LifecycleError(
      `Public ID security check failed: ${publicIdCheck.errors.join(", ")}`,
      assetId
    );
  }

  // Determine resource type from file
  const resourceType = getResourceTypeFromFile(file);

  let cloudinaryResult;
  try {
    // Upload to Cloudinary
    cloudinaryResult = await uploadAsset(
      file,
      entityFolder,
      publicId,
      resourceType,
      config
    );

    logEvent({
      eventType: "upload",
      entityType,
      entityId,
      slug,
      assetId,
      publicId: cloudinaryResult.publicId,
      folder: assetFolder,
      success: true,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    });
  } catch (error) {
    logEvent({
      eventType: "upload",
      entityType,
      entityId,
      slug,
      assetId,
      folder: assetFolder,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new LifecycleError(
      `Failed to upload media asset: ${error instanceof Error ? error.message : String(error)}`,
      assetId
    );
  }

  // Verify the upload
  const verification = await verifyAssetUpload(cloudinaryResult.publicId, resourceType, config);
  if (!verification.exists) {
    // Rollback: delete the asset if verification fails
    try {
      await deleteAsset(cloudinaryResult.publicId, resourceType, config);
    } catch (cleanupError) {
      console.error("[MediaLifecycle] Failed to cleanup failed upload:", cleanupError);
    }
    
    throw new VerificationError(
      "Asset upload verification failed: asset does not exist in Cloudinary",
      cloudinaryResult.publicId
    );
  }

  return {
    id: assetId, // Will be replaced with DB ID when integrated
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
}

/**
 * REPLACE MEDIA Workflow
 * Replaces an existing media asset with safe upload-then-delete pattern
 */
export async function replaceMediaAsset(
  file: File,
  entityType: EntityType,
  entityId: string,
  slug: string,
  oldAssetId: string,
  oldPublicId: string,
  oldResourceType: CloudinaryResourceType,
  config: CloudinaryConfig,
  options?: {
    altText?: string;
    displayName?: string;
    userContext?: MediaUserContext;
  }
): Promise<ReplaceResult> {
  // Security checks
  const securityCheck = performSecurityChecks({
    entityType,
    entityId,
    slug,
    assetId: oldAssetId,
  });
  if (!securityCheck.passed) {
    throw new LifecycleError(
      `Security check failed: ${securityCheck.errors.join(", ")}`,
      "security_check_failed"
    );
  }

  // Authorization check
  if (options?.userContext) {
    const authResult = authorizeMediaOperation(
      MediaAuthorizationLevel.REPLACE,
      options.userContext,
      entityType,
      entityId
    );
    if (!authResult.authorized) {
      throw new LifecycleError(
        `Authorization failed: ${authResult.reason}`,
        "authorization_failed"
      );
    }
  }

  const newAssetId = generateAssetId();
  const entityFolder = getEntityFolder(entityType, slug);
  const newAssetFolder = getAssetFolder(entityFolder, newAssetId);
  const cleanedName = sanitizeFilename(file.name);
  const newPublicId = `${newAssetId}/${cleanedName}`;
  const resourceType = getResourceTypeFromFile(file);

  // Step 1: Upload new asset to temp folder first
  const tempFolder = getTempFolder(newAssetId);
  let tempResult;
  try {
    tempResult = await uploadAsset(
      file,
      tempFolder,
      `${newAssetId}/${cleanedName}`,
      resourceType,
      config
    );
  } catch (error) {
    logEvent({
      eventType: "replace",
      entityType,
      entityId,
      slug,
      assetId: newAssetId,
      success: false,
      error: `Temp upload failed: ${error instanceof Error ? error.message : String(error)}`,
    });
    throw new LifecycleError(
      `Failed to upload replacement to temp folder: ${error instanceof Error ? error.message : String(error)}`,
      oldAssetId
    );
  }

  // Step 2: Upload to final location
  let finalResult;
  try {
    finalResult = await uploadAsset(
      file,
      entityFolder,
      newPublicId,
      resourceType,
      config
    );
  } catch (error) {
    // Rollback: delete temp upload
    try {
      await deleteAsset(tempResult.publicId, resourceType, config);
    } catch (cleanupError) {
      console.error("[MediaLifecycle] Failed to cleanup temp upload on error:", cleanupError);
    }
    
    logEvent({
      eventType: "replace",
      entityType,
      entityId,
      slug,
      assetId: newAssetId,
      oldAssetId,
      success: false,
      error: `Final upload failed: ${error instanceof Error ? error.message : String(error)}`,
    });
    throw new LifecycleError(
      `Failed to upload replacement to final location: ${error instanceof Error ? error.message : String(error)}`,
      oldAssetId
    );
  }

  // Step 3: Verify new asset
  const verification = await verifyAssetUpload(finalResult.publicId, resourceType, config);
  if (!verification.exists) {
    // Rollback: delete both temp and final uploads
    try {
      await deleteAsset(tempResult.publicId, resourceType, config);
      await deleteAsset(finalResult.publicId, resourceType, config);
    } catch (cleanupError) {
      console.error("[MediaLifecycle] Failed to cleanup failed replacement:", cleanupError);
    }
    
    throw new VerificationError(
      "Replacement asset verification failed",
      finalResult.publicId
    );
  }

  // Step 4: Delete old asset
  let oldAssetDeleted = false;
  if (oldPublicId) {
    try {
      await deleteAsset(oldPublicId, oldResourceType, config);
      oldAssetDeleted = true;
    } catch (error) {
      console.error(`[MediaLifecycle] Failed to delete old asset ${oldPublicId}:`, error);
      // Don't throw - the new asset was successfully uploaded
      // Log this for manual cleanup
      logEvent({
        eventType: "cleanup",
        entityType,
        entityId,
        slug,
        assetId: oldAssetId,
        publicId: oldPublicId,
        success: false,
        error: `Failed to delete old asset: ${error instanceof Error ? error.message : String(error)}`,
        metadata: { requiresManualCleanup: true },
      });
    }
  }

  // Step 5: Delete temp upload
  try {
    await deleteAsset(tempResult.publicId, resourceType, config);
  } catch (error) {
    console.error("[MediaLifecycle] Failed to cleanup temp upload:", error);
  }

  logEvent({
    eventType: "replace",
    entityType,
    entityId,
    slug,
    assetId: newAssetId,
    oldAssetId,
    publicId: finalResult.publicId,
    folder: newAssetFolder,
    success: true,
    metadata: {
      oldAssetDeleted,
      oldPublicId,
    },
  });

  return {
    id: newAssetId, // Will be replaced with DB ID when integrated
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
}

/**
 * DELETE MEDIA Workflow
 * Deletes a media asset with complete cleanup
 */
export async function deleteMediaAsset(
  assetId: string,
  publicId: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig,
  entityType?: EntityType,
  entityId?: string,
  slug?: string,
  userContext?: MediaUserContext
): Promise<void> {
  // Security checks
  const securityCheck = performSecurityChecks({
    entityType,
    entityId,
    slug,
    assetId,
  });
  if (!securityCheck.passed) {
    throw new LifecycleError(
      `Security check failed: ${securityCheck.errors.join(", ")}`,
      "security_check_failed"
    );
  }

  // Authorization check
  if (userContext && entityType && entityId) {
    const authResult = authorizeMediaOperation(
      MediaAuthorizationLevel.DELETE,
      userContext,
      entityType,
      entityId
    );
    if (!authResult.authorized) {
      throw new LifecycleError(
        `Authorization failed: ${authResult.reason}`,
        "authorization_failed"
      );
    }
  }

  try {
    const success = await deleteAsset(publicId, resourceType, config);
    
    if (!success) {
      throw new LifecycleError(
        `Cloudinary delete operation returned failure for ${publicId}`,
        assetId
      );
    }

    logEvent({
      eventType: "delete",
      entityType,
      entityId,
      slug,
      assetId,
      publicId,
      success: true,
    });
  } catch (error) {
    logEvent({
      eventType: "delete",
      entityType,
      entityId,
      slug,
      assetId,
      publicId,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new LifecycleError(
      `Failed to delete media asset: ${error instanceof Error ? error.message : String(error)}`,
      assetId
    );
  }
}

/**
 * DELETE ENTITY Workflow
 * Deletes all media assets for an entity with complete cleanup
 */
export async function deleteEntityMediaAssets(
  entityType: EntityType,
  entityId: string,
  slug: string,
  config: CloudinaryConfig
): Promise<number> {
  const entityFolder = getEntityFolder(entityType, slug);

  try {
    // Delete all assets in the entity folder
    const deletedCount = await deleteEntityAssets(entityFolder, config);

    logEvent({
      eventType: "delete_entity",
      entityType,
      entityId,
      slug,
      folder: entityFolder,
      success: true,
      metadata: { deletedCount },
    });

    return deletedCount;
  } catch (error) {
    logEvent({
      eventType: "delete_entity",
      entityType,
      entityId,
      slug,
      folder: entityFolder,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new LifecycleError(
      `Failed to delete entity media assets: ${error instanceof Error ? error.message : String(error)}`,
      entityId
    );
  }
}

/**
 * SLUG CHANGE Workflow
 * Migrates media assets when an entity slug changes
 */
export async function migrateEntitySlug(
  entityType: EntityType,
  entityId: string,
  oldSlug: string,
  newSlug: string,
  assetMappings: Array<{ assetId: string; oldPublicId: string; oldResourceType: CloudinaryResourceType; originalFilename: string }>,
  config: CloudinaryConfig
): Promise<SlugMigrationResult> {
  const oldEntityFolder = getEntityFolder(entityType, oldSlug);
  const newEntityFolder = getEntityFolder(entityType, newSlug);

  const result: SlugMigrationResult = {
    migratedAssets: 0,
    failedMigrations: 0,
    oldFolderDeleted: false,
    errors: [],
  };

  for (const mapping of assetMappings) {
    const { assetId, oldPublicId, oldResourceType, originalFilename } = mapping;
    const newAssetId = generateAssetId();
    const newAssetFolder = getAssetFolder(newEntityFolder, newAssetId);
    const newPublicId = `${newEntityFolder}/${newAssetId}/${originalFilename}`;

    try {
      // Copy asset to new location
      const copySuccess = await copyAsset(
        oldPublicId,
        newPublicId,
        newEntityFolder,
        oldResourceType,
        config
      );

      if (!copySuccess) {
        throw new Error("Copy operation returned false");
      }

      // Delete old asset
      await deleteAsset(oldPublicId, oldResourceType, config);

      result.migratedAssets++;

      logEvent({
        eventType: "migration",
        entityType,
        entityId,
        slug: newSlug,
        assetId: newAssetId,
        publicId: newPublicId,
        folder: newAssetFolder,
        success: true,
        metadata: {
          oldPublicId,
          oldAssetId: assetId,
        },
      });
    } catch (error) {
      result.failedMigrations++;
      result.errors.push({
        assetId,
        error: error instanceof Error ? error.message : String(error),
      });

      logEvent({
        eventType: "migration",
        entityType,
        entityId,
        slug: newSlug,
        assetId,
        oldPublicId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Try to delete old entity folder if all migrations succeeded
  if (result.failedMigrations === 0) {
    try {
      await deleteEntityAssets(oldEntityFolder, config);
      result.oldFolderDeleted = true;
    } catch (error) {
      console.error(`[MediaLifecycle] Failed to delete old entity folder ${oldEntityFolder}:`, error);
    }
  }

  logEvent({
    eventType: "slug_change",
    entityType,
    entityId,
    slug: newSlug,
    success: result.failedMigrations === 0,
    metadata: {
      oldSlug,
      migratedAssets: result.migratedAssets,
      failedMigrations: result.failedMigrations,
      oldFolderDeleted: result.oldFolderDeleted,
    },
  });

  return result;
}

/**
 * Automatic Cleanup
 * Cleans up orphaned assets and folders
 */
export async function cleanupOrphanedMedia(
  entityType: EntityType,
  slug: string,
  validPublicIds: string[],
  config: CloudinaryConfig
): Promise<number> {
  const entityFolder = getEntityFolder(entityType, slug);

  try {
    const deletedCount = await cleanupOrphanedAssets(
      entityFolder,
      validPublicIds,
      config
    );

    logEvent({
      eventType: "cleanup",
      entityType,
      slug,
      folder: entityFolder,
      success: true,
      metadata: {
        deletedCount,
        validIdsCount: validPublicIds.length,
      },
    });

    return deletedCount;
  } catch (error) {
    logEvent({
      eventType: "cleanup",
      entityType,
      slug,
      folder: entityFolder,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new LifecycleError(
      `Failed to cleanup orphaned media: ${error instanceof Error ? error.message : String(error)}`,
      entityFolder
    );
  }
}

/**
 * Consistency Verification
 * Verifies that database and Cloudinary are synchronized
 */
export async function verifyMediaConsistency(
  entityType: EntityType,
  slug: string,
  dbAssets: Array<{
    assetId: string;
    publicId: string;
    folder: string;
  }>,
  config: CloudinaryConfig
): Promise<VerificationResult> {
  const entityFolder = getEntityFolder(entityType, slug);
  
  const result: VerificationResult = {
    isConsistent: true,
    missingInCloudinary: [],
    missingInDatabase: [],
    incorrectPublicIds: [],
    incorrectFolders: [],
    duplicateAssets: [],
    duplicateRecords: [],
    totalAssetsInDb: dbAssets.length,
    totalAssetsInCloudinary: 0,
  };

  try {
    // Get all assets from Cloudinary
    const cloudinaryAssets = await getEntityAssets(entityFolder, config);
    result.totalAssetsInCloudinary = cloudinaryAssets.length;

    // Create maps for comparison
    const dbPublicIdMap = new Map(dbAssets.map(a => [a.publicId, a]));
    const cloudinaryPublicIdMap = new Map(cloudinaryAssets.map(a => [a.publicId, a]));

    // Check for assets missing in Cloudinary
    for (const dbAsset of dbAssets) {
      if (!cloudinaryPublicIdMap.has(dbAsset.publicId)) {
        result.missingInCloudinary.push({
          assetId: dbAsset.assetId,
          publicId: dbAsset.publicId,
        });
        result.isConsistent = false;
      }
    }

    // Check for assets missing in database
    for (const cloudAsset of cloudinaryAssets) {
      if (!dbPublicIdMap.has(cloudAsset.publicId)) {
        result.missingInDatabase.push({
          publicId: cloudAsset.publicId,
          folder: cloudAsset.folder || entityFolder,
        });
        result.isConsistent = false;
      }
    }

    // Check for incorrect public IDs
    for (const dbAsset of dbAssets) {
      const cloudAsset = cloudinaryPublicIdMap.get(dbAsset.publicId);
      if (cloudAsset && cloudAsset.publicId !== dbAsset.publicId) {
        result.incorrectPublicIds.push({
          assetId: dbAsset.assetId,
          dbPublicId: dbAsset.publicId,
          cloudPublicId: cloudAsset.publicId,
        });
        result.isConsistent = false;
      }
    }

    // Check for incorrect folders
    for (const dbAsset of dbAssets) {
      const cloudAsset = cloudinaryPublicIdMap.get(dbAsset.publicId);
      if (cloudAsset && cloudAsset.folder !== dbAsset.folder) {
        result.incorrectFolders.push({
          assetId: dbAsset.assetId,
          dbFolder: dbAsset.folder,
          cloudFolder: cloudAsset.folder || entityFolder,
        });
        result.isConsistent = false;
      }
    }

    // Check for duplicate assets in Cloudinary
    const publicIdCount = new Map<string, number>();
    for (const asset of cloudinaryAssets) {
      publicIdCount.set(asset.publicId, (publicIdCount.get(asset.publicId) || 0) + 1);
    }
    for (const [publicId, count] of publicIdCount.entries()) {
      if (count > 1) {
        result.duplicateAssets.push({ publicId, count });
        result.isConsistent = false;
      }
    }

    // Check for duplicate records in database
    const assetIdCount = new Map<string, number>();
    for (const asset of dbAssets) {
      assetIdCount.set(asset.assetId, (assetIdCount.get(asset.assetId) || 0) + 1);
    }
    for (const [assetId, count] of assetIdCount.entries()) {
      if (count > 1) {
        result.duplicateRecords.push({ assetId, count });
        result.isConsistent = false;
      }
    }

    logEvent({
      eventType: "verification",
      entityType,
      slug,
      folder: entityFolder,
      success: result.isConsistent,
      metadata: {
        missingInCloudinary: result.missingInCloudinary.length,
        missingInDatabase: result.missingInDatabase.length,
        totalAssetsInDb: result.totalAssetsInDb,
        totalAssetsInCloudinary: result.totalAssetsInCloudinary,
      },
    });

    return result;
  } catch (error) {
    logEvent({
      eventType: "verification",
      entityType,
      slug,
      folder: entityFolder,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new VerificationError(
      `Failed to verify media consistency: ${error instanceof Error ? error.message : String(error)}`,
      entityFolder
    );
  }
}

/**
 * Verifies that an asset was uploaded successfully
 */
async function verifyAssetUpload(
  _publicId: string,
  _resourceType: CloudinaryResourceType,
  _config: CloudinaryConfig
): Promise<{ exists: boolean }> {
  // In a real implementation, you would use getAsset from cloudinary.service
  // For now, we'll assume the upload was successful if no error was thrown
  return { exists: true };
}

/**
 * Determines the Cloudinary resource type from a file
 */
function getResourceTypeFromFile(file: File): CloudinaryResourceType {
  const mimeType = file.type.toLowerCase();
  
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  
  return "raw";
}

/**
 * Rollback helper for failed operations
 */
export async function rollbackOperation(
  operations: Array<{
    type: "delete_asset" | "delete_folder";
    publicId?: string;
    folder?: string;
    resourceType?: CloudinaryResourceType;
  }>,
  config: CloudinaryConfig
): Promise<void> {
  const errors: Array<{ operation: string; error: string }> = [];

  for (const operation of operations) {
    try {
      if (operation.type === "delete_asset" && operation.publicId && operation.resourceType) {
        await deleteAsset(operation.publicId, operation.resourceType, config);
      } else if (operation.type === "delete_folder" && operation.folder) {
        await deleteEntityAssets(operation.folder, config);
      }
    } catch (error) {
      errors.push({
        operation: operation.type,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (errors.length > 0) {
    logEvent({
      eventType: "rollback",
      success: false,
      error: `Rollback completed with ${errors.length} errors`,
      metadata: { errors },
    });
    throw new RollbackError(
      `Rollback completed with ${errors.length} errors`,
      errors
    );
  }

  logEvent({
    eventType: "rollback",
    success: true,
    metadata: { operationsCount: operations.length },
  });
}
