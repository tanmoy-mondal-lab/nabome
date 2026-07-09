/**
 * Media Management Module - Cloudinary Service
 *
 * This service centralizes all Cloudinary API communication.
 * All Cloudinary operations must go through this service.
 */
import type { CloudinaryResourceType, CloudinaryConfig, CloudinaryAssetInfo } from "./media.types";
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
export declare function uploadAsset(file: File, folder: string, publicId: string, resourceType: CloudinaryResourceType, config: CloudinaryConfig, options?: {
    overwrite?: boolean;
    eager?: string;
    transformation?: string;
}): Promise<CloudinaryAssetInfo>;
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
export declare function replaceAsset(file: File, publicId: string, resourceType: CloudinaryResourceType, config: CloudinaryConfig): Promise<CloudinaryAssetInfo>;
/**
 * Deletes an asset from Cloudinary
 *
 * @param publicId The public ID of the asset to delete
 * @param resourceType The Cloudinary resource type
 * @param config The Cloudinary configuration
 * @returns True if deletion was successful, false otherwise
 * @throws DeleteFailedError if deletion fails
 */
export declare function deleteAsset(publicId: string, resourceType: CloudinaryResourceType, config: CloudinaryConfig): Promise<boolean>;
/**
 * Deletes all assets in a folder from Cloudinary
 *
 * @param folder The folder path
 * @param resourceType The Cloudinary resource type
 * @param config The Cloudinary configuration
 * @returns The number of assets deleted
 * @throws DeleteFailedError if deletion fails
 */
export declare function deleteFolderAssets(folder: string, resourceType: CloudinaryResourceType, config: CloudinaryConfig): Promise<number>;
/**
 * Deletes all assets for a specific entity
 * This is a convenience method that combines folder operations
 *
 * @param folder The entity folder path
 * @param config The Cloudinary configuration
 * @returns The number of assets deleted
 * @throws DeleteFailedError if deletion fails
 */
export declare function deleteEntityAssets(folder: string, config: CloudinaryConfig): Promise<number>;
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
export declare function copyAsset(sourcePublicId: string, targetPublicId: string, targetFolder: string, resourceType: CloudinaryResourceType, config: CloudinaryConfig): Promise<boolean>;
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
export declare function moveAsset(sourcePublicId: string, targetPublicId: string, targetFolder: string, resourceType: CloudinaryResourceType, config: CloudinaryConfig): Promise<boolean>;
/**
 * Gets asset information from Cloudinary
 *
 * @param publicId The public ID of the asset
 * @param resourceType The Cloudinary resource type
 * @param config The Cloudinary configuration
 * @returns The asset information
 * @throws CloudinaryError if retrieval fails
 */
export declare function getAsset(publicId: string, resourceType: CloudinaryResourceType, config: CloudinaryConfig): Promise<CloudinaryAssetInfo>;
/**
 * Checks if an asset exists in Cloudinary
 *
 * @param publicId The public ID of the asset
 * @param resourceType The Cloudinary resource type
 * @param config The Cloudinary configuration
 * @returns True if the asset exists, false otherwise
 */
export declare function assetExists(publicId: string, resourceType: CloudinaryResourceType, config: CloudinaryConfig): Promise<boolean>;
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
export declare function listAssetsInFolder(folder: string, resourceType: CloudinaryResourceType, config: CloudinaryConfig, maxResults?: number): Promise<CloudinaryAssetInfo[]>;
/**
 * Retrieves all assets under an entity folder
 * This is a convenience method that combines folder operations
 *
 * @param folder The entity folder path
 * @param config The Cloudinary configuration
 * @returns Array of all asset information under the folder
 * @throws CloudinaryError if retrieval fails
 */
export declare function getEntityAssets(folder: string, config: CloudinaryConfig): Promise<CloudinaryAssetInfo[]>;
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
export declare function migrateEntityFolder(oldFolder: string, newFolder: string, config: CloudinaryConfig): Promise<{
    migratedAssets: Array<{
        oldPublicId: string;
        newPublicId: string;
        secureUrl: string;
    }>;
    failedAssets: Array<{
        oldPublicId: string;
        error: string;
    }>;
}>;
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
export declare function cleanupOrphanedAssets(folder: string, validPublicIds: string[], config: CloudinaryConfig): Promise<number>;
