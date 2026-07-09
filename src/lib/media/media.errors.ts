/**
 * Media Management Module - Error Classes
 * 
 * This file contains all custom error classes for the media management system.
 * Centralized error handling provides consistent error reporting and debugging.
 */

/**
 * Base error class for all media-related errors
 */
export class MediaError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "MediaError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a file is invalid or fails validation
 */
export class InvalidFileError extends MediaError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "INVALID_FILE", details);
    this.name = "InvalidFileError";
  }
}

/**
 * Error thrown when file size exceeds limits
 */
export class FileSizeError extends MediaError {
  constructor(
    message: string,
    public actualSize: number,
    public maxSize: number
  ) {
    super(message, "FILE_SIZE_EXCEEDED", { actualSize, maxSize });
    this.name = "FileSizeError";
  }
}

/**
 * Error thrown when file type is not supported
 */
export class UnsupportedTypeError extends MediaError {
  constructor(message: string, public mimeType: string) {
    super(message, "UNSUPPORTED_TYPE", { mimeType });
    this.name = "UnsupportedTypeError";
  }
}

/**
 * Error thrown when file content doesn't match declared type
 */
export class FileContentMismatchError extends MediaError {
  constructor(message: string, public declaredType: string) {
    super(message, "FILE_CONTENT_MISMATCH", { declaredType });
    this.name = "FileContentMismatchError";
  }
}

/**
 * Error thrown when upload to Cloudinary fails
 */
export class UploadFailedError extends MediaError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "UPLOAD_FAILED", details);
    this.name = "UploadFailedError";
  }
}

/**
 * Error thrown when deletion from Cloudinary fails
 */
export class DeleteFailedError extends MediaError {
  constructor(message: string, public publicId?: string) {
    super(message, "DELETE_FAILED", { publicId });
    this.name = "DeleteFailedError";
  }
}

/**
 * Error thrown when Cloudinary API returns an error
 */
export class CloudinaryError extends MediaError {
  constructor(
    message: string,
    public statusCode?: number,
    public cloudinaryError?: string
  ) {
    super(message, "CLOUDINARY_ERROR", { statusCode, cloudinaryError });
    this.name = "CloudinaryError";
  }
}

/**
 * Error thrown when Cloudinary credentials are missing or invalid
 */
export class CloudinaryConfigError extends MediaError {
  constructor(message: string) {
    super(message, "CLOUDINARY_CONFIG_ERROR");
    this.name = "CloudinaryConfigError";
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends MediaError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

/**
 * Error thrown when asset is not found
 */
export class AssetNotFoundError extends MediaError {
  constructor(message: string, public assetId?: string) {
    super(message, "ASSET_NOT_FOUND", { assetId });
    this.name = "AssetNotFoundError";
  }
}

/**
 * Error thrown when folder operations fail
 */
export class FolderError extends MediaError {
  constructor(message: string, public folder?: string) {
    super(message, "FOLDER_ERROR", { folder });
    this.name = "FolderError";
  }
}

/**
 * Error thrown when asset ID generation fails
 */
export class AssetIdGenerationError extends MediaError {
  constructor(message: string) {
    super(message, "ASSET_ID_GENERATION_ERROR");
    this.name = "AssetIdGenerationError";
  }
}

/**
 * Error thrown when maximum upload count is exceeded
 */
export class UploadLimitError extends MediaError {
  constructor(
    message: string,
    public actualCount: number,
    public maxCount: number
  ) {
    super(message, "UPLOAD_LIMIT_EXCEEDED", { actualCount, maxCount });
    this.name = "UploadLimitError";
  }
}

/**
 * Error thrown when maximum media count per entity is exceeded
 */
export class EntityMediaLimitError extends MediaError {
  constructor(
    message: string,
    public entityType: string,
    public entityId: string,
    public actualCount: number,
    public maxCount: number
  ) {
    super(message, "ENTITY_MEDIA_LIMIT_EXCEEDED", {
      entityType,
      entityId,
      actualCount,
      maxCount,
    });
    this.name = "EntityMediaLimitError";
  }
}

/**
 * Error thrown when image dimensions don't meet requirements
 */
export class ImageDimensionsError extends MediaError {
  constructor(
    message: string,
    public width: number,
    public height: number,
    public requirements?: Record<string, number>
  ) {
    super(message, "IMAGE_DIMENSIONS_ERROR", { width, height, requirements });
    this.name = "ImageDimensionsError";
  }
}

/**
 * Error thrown when a replace operation fails
 */
export class ReplaceFailedError extends MediaError {
  constructor(message: string, public oldAssetId?: string) {
    super(message, "REPLACE_FAILED", { oldAssetId });
    this.name = "ReplaceFailedError";
  }
}

/**
 * Error thrown when a copy operation fails
 */
export class CopyFailedError extends MediaError {
  constructor(message: string, public sourcePublicId?: string) {
    super(message, "COPY_FAILED", { sourcePublicId });
    this.name = "CopyFailedError";
  }
}

/**
 * Error thrown when a move operation fails
 */
export class MoveFailedError extends MediaError {
  constructor(message: string, public sourcePublicId?: string) {
    super(message, "MOVE_FAILED", { sourcePublicId });
    this.name = "MoveFailedError";
  }
}

/**
 * Helper function to check if an error is a media error
 */
export function isMediaError(error: unknown): error is MediaError {
  return error instanceof MediaError;
}

/**
 * Helper function to get user-friendly error message
 */
export function getUserErrorMessage(error: unknown): string {
  if (isMediaError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
}

/**
 * Error thrown when lifecycle operations fail
 */
export class LifecycleError extends MediaError {
  constructor(message: string, public assetId?: string) {
    super(message, "LIFECYCLE_ERROR", { assetId });
    this.name = "LifecycleError";
  }
}

/**
 * Error thrown when verification operations fail
 */
export class VerificationError extends MediaError {
  constructor(message: string, public publicId?: string) {
    super(message, "VERIFICATION_ERROR", { publicId });
    this.name = "VerificationError";
  }
}

/**
 * Error thrown when rollback operations fail
 */
export class RollbackError extends MediaError {
  constructor(message: string, public errors: Array<{ operation: string; error: string }>) {
    super(message, "ROLLBACK_ERROR", { errors });
    this.name = "RollbackError";
  }
}

/**
 * Error thrown when synchronization between database and Cloudinary fails
 */
export class SynchronizationError extends MediaError {
  constructor(message: string, public folder?: string) {
    super(message, "SYNCHRONIZATION_ERROR", { folder });
    this.name = "SynchronizationError";
  }
}

/**
 * Helper function to get error code for logging/monitoring
 */
export function getErrorCode(error: unknown): string {
  if (isMediaError(error)) {
    return error.code;
  }
  return "UNKNOWN_ERROR";
}
