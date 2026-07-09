/**
 * Media Management Module - Error Classes
 *
 * This file contains all custom error classes for the media management system.
 * Centralized error handling provides consistent error reporting and debugging.
 */
/**
 * Base error class for all media-related errors
 */
export declare class MediaError extends Error {
    code: string;
    details?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, details?: Record<string, unknown> | undefined);
}
/**
 * Error thrown when a file is invalid or fails validation
 */
export declare class InvalidFileError extends MediaError {
    constructor(message: string, details?: Record<string, unknown>);
}
/**
 * Error thrown when file size exceeds limits
 */
export declare class FileSizeError extends MediaError {
    actualSize: number;
    maxSize: number;
    constructor(message: string, actualSize: number, maxSize: number);
}
/**
 * Error thrown when file type is not supported
 */
export declare class UnsupportedTypeError extends MediaError {
    mimeType: string;
    constructor(message: string, mimeType: string);
}
/**
 * Error thrown when file content doesn't match declared type
 */
export declare class FileContentMismatchError extends MediaError {
    declaredType: string;
    constructor(message: string, declaredType: string);
}
/**
 * Error thrown when upload to Cloudinary fails
 */
export declare class UploadFailedError extends MediaError {
    constructor(message: string, details?: Record<string, unknown>);
}
/**
 * Error thrown when deletion from Cloudinary fails
 */
export declare class DeleteFailedError extends MediaError {
    publicId?: string | undefined;
    constructor(message: string, publicId?: string | undefined);
}
/**
 * Error thrown when Cloudinary API returns an error
 */
export declare class CloudinaryError extends MediaError {
    statusCode?: number | undefined;
    cloudinaryError?: string | undefined;
    constructor(message: string, statusCode?: number | undefined, cloudinaryError?: string | undefined);
}
/**
 * Error thrown when Cloudinary credentials are missing or invalid
 */
export declare class CloudinaryConfigError extends MediaError {
    constructor(message: string);
}
/**
 * Error thrown when validation fails
 */
export declare class ValidationError extends MediaError {
    constructor(message: string, details?: Record<string, unknown>);
}
/**
 * Error thrown when asset is not found
 */
export declare class AssetNotFoundError extends MediaError {
    assetId?: string | undefined;
    constructor(message: string, assetId?: string | undefined);
}
/**
 * Error thrown when folder operations fail
 */
export declare class FolderError extends MediaError {
    folder?: string | undefined;
    constructor(message: string, folder?: string | undefined);
}
/**
 * Error thrown when asset ID generation fails
 */
export declare class AssetIdGenerationError extends MediaError {
    constructor(message: string);
}
/**
 * Error thrown when maximum upload count is exceeded
 */
export declare class UploadLimitError extends MediaError {
    actualCount: number;
    maxCount: number;
    constructor(message: string, actualCount: number, maxCount: number);
}
/**
 * Error thrown when maximum media count per entity is exceeded
 */
export declare class EntityMediaLimitError extends MediaError {
    entityType: string;
    entityId: string;
    actualCount: number;
    maxCount: number;
    constructor(message: string, entityType: string, entityId: string, actualCount: number, maxCount: number);
}
/**
 * Error thrown when image dimensions don't meet requirements
 */
export declare class ImageDimensionsError extends MediaError {
    width: number;
    height: number;
    requirements?: Record<string, number> | undefined;
    constructor(message: string, width: number, height: number, requirements?: Record<string, number> | undefined);
}
/**
 * Error thrown when a replace operation fails
 */
export declare class ReplaceFailedError extends MediaError {
    oldAssetId?: string | undefined;
    constructor(message: string, oldAssetId?: string | undefined);
}
/**
 * Error thrown when a copy operation fails
 */
export declare class CopyFailedError extends MediaError {
    sourcePublicId?: string | undefined;
    constructor(message: string, sourcePublicId?: string | undefined);
}
/**
 * Error thrown when a move operation fails
 */
export declare class MoveFailedError extends MediaError {
    sourcePublicId?: string | undefined;
    constructor(message: string, sourcePublicId?: string | undefined);
}
/**
 * Helper function to check if an error is a media error
 */
export declare function isMediaError(error: unknown): error is MediaError;
/**
 * Helper function to get user-friendly error message
 */
export declare function getUserErrorMessage(error: unknown): string;
/**
 * Error thrown when lifecycle operations fail
 */
export declare class LifecycleError extends MediaError {
    assetId?: string | undefined;
    constructor(message: string, assetId?: string | undefined);
}
/**
 * Error thrown when verification operations fail
 */
export declare class VerificationError extends MediaError {
    publicId?: string | undefined;
    constructor(message: string, publicId?: string | undefined);
}
/**
 * Error thrown when rollback operations fail
 */
export declare class RollbackError extends MediaError {
    errors: Array<{
        operation: string;
        error: string;
    }>;
    constructor(message: string, errors: Array<{
        operation: string;
        error: string;
    }>);
}
/**
 * Error thrown when synchronization between database and Cloudinary fails
 */
export declare class SynchronizationError extends MediaError {
    folder?: string | undefined;
    constructor(message: string, folder?: string | undefined);
}
/**
 * Helper function to get error code for logging/monitoring
 */
export declare function getErrorCode(error: unknown): string;
