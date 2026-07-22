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
import type { EntityType, CloudinaryConfig, CloudinaryResourceType, UploadResult, ReplaceResult } from "./media.types";
import { type MediaUserContext } from "./security.service";
/**
 * Lifecycle event types for logging
 */
export type LifecycleEventType = "upload" | "replace" | "delete" | "delete_entity" | "slug_change" | "cleanup" | "verification" | "rollback" | "migration";
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
    missingInCloudinary: Array<{
        assetId: string;
        publicId: string;
    }>;
    missingInDatabase: Array<{
        publicId: string;
        folder: string;
    }>;
    incorrectPublicIds: Array<{
        assetId: string;
        dbPublicId: string;
        cloudPublicId: string;
    }>;
    incorrectFolders: Array<{
        assetId: string;
        dbFolder: string;
        cloudFolder: string;
    }>;
    duplicateAssets: Array<{
        publicId: string;
        count: number;
    }>;
    duplicateRecords: Array<{
        assetId: string;
        count: number;
    }>;
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
    errors: Array<{
        operation: string;
        error: string;
    }>;
}
/**
 * Slug migration result
 */
export interface SlugMigrationResult {
    migratedAssets: number;
    failedMigrations: number;
    oldFolderDeleted: boolean;
    errors: Array<{
        assetId: string;
        error: string;
    }>;
}
/**
 * Gets recent lifecycle events (deprecated - use logging service instead)
 * @deprecated Use the logging service for persistent logging
 */
export declare function getLifecycleEvents(): LifecycleEventLog[];
/**
 * Clears the lifecycle event log (deprecated - no-op)
 * @deprecated Logging is now persistent, no need to clear
 */
export declare function clearLifecycleLog(): void;
/**
 * CREATE Workflow
 * Creates a new media asset with proper folder hierarchy and verification
 */
export declare function createMediaAsset(file: File, entityType: EntityType, entityId: string, slug: string, config: CloudinaryConfig, options?: {
    altText?: string;
    displayName?: string;
    sortOrder?: number;
    isPrimary?: boolean;
    userContext?: MediaUserContext;
}): Promise<UploadResult>;
/**
 * REPLACE MEDIA Workflow
 * Replaces an existing media asset with safe upload-then-delete pattern
 */
export declare function replaceMediaAsset(file: File, entityType: EntityType, entityId: string, slug: string, oldAssetId: string, oldPublicId: string, oldResourceType: CloudinaryResourceType, config: CloudinaryConfig, options?: {
    altText?: string;
    displayName?: string;
    userContext?: MediaUserContext;
}): Promise<ReplaceResult>;
/**
 * DELETE MEDIA Workflow
 * Deletes a media asset with complete cleanup
 */
export declare function deleteMediaAsset(assetId: string, publicId: string, resourceType: CloudinaryResourceType, config: CloudinaryConfig, entityType?: EntityType, entityId?: string, slug?: string, userContext?: MediaUserContext): Promise<void>;
/**
 * DELETE ENTITY Workflow
 * Deletes all media assets for an entity with complete cleanup
 */
export declare function deleteEntityMediaAssets(entityType: EntityType, entityId: string, slug: string, config: CloudinaryConfig): Promise<number>;
/**
 * SLUG CHANGE Workflow
 * Migrates media assets when an entity slug changes
 */
export declare function migrateEntitySlug(entityType: EntityType, entityId: string, oldSlug: string, newSlug: string, assetMappings: Array<{
    assetId: string;
    oldPublicId: string;
    oldResourceType: CloudinaryResourceType;
    originalFilename: string;
}>, config: CloudinaryConfig): Promise<SlugMigrationResult>;
/**
 * Automatic Cleanup
 * Cleans up orphaned assets and folders
 */
export declare function cleanupOrphanedMedia(entityType: EntityType, slug: string, validPublicIds: string[], config: CloudinaryConfig): Promise<number>;
/**
 * Consistency Verification
 * Verifies that database and Cloudinary are synchronized
 */
export declare function verifyMediaConsistency(entityType: EntityType, slug: string, dbAssets: Array<{
    assetId: string;
    publicId: string;
    folder: string;
}>, config: CloudinaryConfig): Promise<VerificationResult>;
/**
 * Rollback helper for failed operations
 */
export declare function rollbackOperation(operations: Array<{
    type: "delete_asset" | "delete_folder";
    publicId?: string;
    folder?: string;
    resourceType?: CloudinaryResourceType;
}>, config: CloudinaryConfig): Promise<void>;
