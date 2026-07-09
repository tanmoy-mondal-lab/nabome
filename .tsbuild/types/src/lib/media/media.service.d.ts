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
import type { UploadOptions, ReplaceOptions, UploadResult, ReplaceResult, DeleteResult, DeleteEntityResult, CloudinaryConfig } from "./media.types";
/**
 * Uploads a media file to Cloudinary
 * This is the main entry point for media uploads
 *
 * @param options Upload options including file, entity info, and metadata
 * @param config Cloudinary configuration
 * @returns Upload result with asset information
 * @throws InvalidFileError, UploadFailedError, etc.
 */
export declare function uploadMedia(options: UploadOptions, config: CloudinaryConfig): Promise<UploadResult>;
/**
 * Replaces an existing media asset with a new file
 *
 * @param options Replace options including new file and old asset ID
 * @param config Cloudinary configuration
 * @returns Replace result with new asset information
 * @throws InvalidFileError, ReplaceFailedError, AssetNotFoundError, etc.
 */
export declare function replaceMedia(options: ReplaceOptions, config: CloudinaryConfig): Promise<ReplaceResult>;
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
export declare function deleteMedia(assetId: string, publicId: string, resourceType: string, config: CloudinaryConfig): Promise<DeleteResult>;
/**
 * Deletes all media assets for a specific entity
 *
 * @param entityType The entity type
 * @param slug The entity slug
 * @param config Cloudinary configuration
 * @returns Delete entity result with counts
 * @throws DeleteFailedError
 */
export declare function deleteEntityMedia(entityType: string, slug: string, config: CloudinaryConfig): Promise<DeleteEntityResult>;
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
export declare function copyMedia(sourcePublicId: string, targetEntityType: string, targetSlug: string, config: CloudinaryConfig): Promise<string>;
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
export declare function moveMedia(sourcePublicId: string, targetEntityType: string, targetSlug: string, config: CloudinaryConfig): Promise<string>;
/**
 * Gets information about a media asset
 *
 * @param publicId The Cloudinary public ID
 * @param resourceType The Cloudinary resource type
 * @param config Cloudinary configuration
 * @returns Asset information
 * @throws CloudinaryError, AssetNotFoundError
 */
export declare function getMediaInfo(publicId: string, resourceType: string, config: CloudinaryConfig): Promise<import("./media.types").CloudinaryAssetInfo>;
/**
 * Checks if a media asset exists
 *
 * @param publicId The Cloudinary public ID
 * @param resourceType The Cloudinary resource type
 * @param config Cloudinary configuration
 * @returns True if the asset exists, false otherwise
 */
export declare function mediaExists(publicId: string, resourceType: string, config: CloudinaryConfig): Promise<boolean>;
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
export declare function prepareUploadMetadata(file: File, entityType: string, entityId: string, slug: string): Promise<{
    valid: boolean;
    error: string | undefined;
    metadata?: undefined;
} | {
    valid: boolean;
    metadata: {
        entityType: string;
        entityId: string;
        slug: string;
        fileName: string;
        sanitizedFileName: string;
        fileSize: number;
        mimeType: string;
        mediaType: import("./media.types").MediaType;
        resourceType: import("./media.types").CloudinaryResourceType;
        extension: string;
        previewAssetId: string;
        entityFolder: string;
        assetFolder: string;
        estimatedPublicId: string;
    };
    error?: undefined;
}>;
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
export declare function batchUploadMedia(files: File[], entityType: string, entityId: string, slug: string, config: CloudinaryConfig): Promise<UploadResult[]>;
