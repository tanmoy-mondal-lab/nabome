/**
 * Media Management Module - Constants
 *
 * This file contains all configuration constants for the media management system.
 * Centralized configuration prevents magic strings and makes the system easier to maintain.
 */
import type { FileTypeConfig } from "./media.types";
/**
 * Root folder for all Cloudinary uploads
 * All media assets must be stored under this hierarchy
 */
export declare const ROOT_FOLDER = "nabome";
/**
 * Maximum file size for uploads (20MB)
 */
export declare const MAX_UPLOAD_SIZE: number;
/**
 * Maximum file size for images (10MB)
 */
export declare const MAX_IMAGE_SIZE: number;
/**
 * Maximum file size for videos (100MB)
 */
export declare const MAX_VIDEO_SIZE: number;
/**
 * Maximum file size for documents (5MB)
 */
export declare const MAX_DOCUMENT_SIZE: number;
/**
 * Maximum number of files per upload batch
 */
export declare const MAX_UPLOAD_COUNT = 10;
/**
 * Maximum number of images per entity
 */
export declare const MAX_IMAGES_PER_ENTITY = 20;
/**
 * Maximum number of videos per entity
 */
export declare const MAX_VIDEOS_PER_ENTITY = 5;
/**
 * Maximum number of documents per entity
 */
export declare const MAX_DOCUMENTS_PER_ENTITY = 10;
/**
 * Allowed file types with their validation configurations
 */
export declare const ALLOWED_FILE_TYPES: Record<string, FileTypeConfig>;
/**
 * Allowed MIME types for uploads
 */
export declare const ALLOWED_MIME_TYPES: string[];
/**
 * Allowed image MIME types
 */
export declare const ALLOWED_IMAGE_TYPES: string[];
/**
 * Allowed video MIME types
 */
export declare const ALLOWED_VIDEO_TYPES: string[];
/**
 * Allowed document MIME types
 */
export declare const ALLOWED_DOCUMENT_TYPES: string[];
/**
 * Cloudinary API timeout in milliseconds
 */
export declare const CLOUDINARY_UPLOAD_TIMEOUT = 30000;
/**
 * Cloudinary destroy timeout in milliseconds
 */
export declare const CLOUDINARY_DESTROY_TIMEOUT = 10000;
/**
 * Default image quality for automatic optimization
 */
export declare const DEFAULT_IMAGE_QUALITY = "auto";
/**
 * Default image format for automatic format selection
 */
export declare const DEFAULT_IMAGE_FORMAT = "auto";
/**
 * Asset ID prefix
 */
export declare const ASSET_ID_PREFIX = "asset_";
/**
 * Maximum filename length
 */
export declare const MAX_FILENAME_LENGTH = 100;
/**
 * Sanitized filename replacement character
 */
export declare const SANITIZATION_REPLACEMENT = "_";
/**
 * Characters to remove from filenames
 */
export declare const FORBIDDEN_FILENAME_CHARS: RegExp;
/**
 * Characters to replace in filenames
 */
export declare const UNSAFE_FILENAME_CHARS: RegExp;
/**
 * Double-dot sequence to prevent path traversal
 */
export declare const PATH_TRAVERSAL_PATTERN: RegExp;
