/**
 * Media Management Module - Type Definitions
 * 
 * This file contains all TypeScript types and interfaces for the media management system.
 * These types are used across all media services to ensure type safety and consistency.
 */

/**
 * Cloudinary resource types supported by the media system
 */
export type CloudinaryResourceType = "image" | "video" | "raw";

/**
 * Media type categories for internal classification
 */
export type MediaType = "image" | "video" | "document";

/**
 * Entity types that can have associated media assets
 */
export type EntityType =
  | "settings"
  | "homepage"
  | "products"
  | "categories"
  | "collections"
  | "brands"
  | "labels"
  | "lookbooks"
  | "blogs"
  | "cms"
  | "sellers"
  | "users"
  | "temp";

/**
 * Upload options for media upload operations
 */
export interface UploadOptions {
  /** The type of entity the media belongs to */
  entityType: EntityType;
  /** The ID of the entity the media belongs to */
  entityId: string;
  /** The slug of the entity for folder organization */
  slug: string;
  /** The file to upload */
  file: File;
  /** Alternative text for accessibility (optional) */
  altText?: string;
  /** Display name for the media (optional) */
  displayName?: string;
  /** Sort order for multiple media items (optional) */
  sortOrder?: number;
  /** Whether this is the primary media item (optional) */
  isPrimary?: boolean;
}

/**
 * Replace options for media replacement operations
 */
export interface ReplaceOptions {
  /** The type of entity the media belongs to */
  entityType: EntityType;
  /** The ID of the entity the media belongs to */
  entityId: string;
  /** The slug of the entity for folder organization */
  slug: string;
  /** The new file to upload */
  file: File;
  /** The asset ID of the media to replace */
  oldAssetId: string;
  /** The Cloudinary public ID of the media to replace (optional) */
  oldPublicId?: string;
  /** Alternative text for accessibility (optional) */
  altText?: string;
  /** Display name for the media (optional) */
  displayName?: string;
}

/**
 * Result returned after a successful media upload
 */
export interface UploadResult {
  /** Database ID of the media asset */
  id: string;
  /** Globally unique asset ID */
  assetId: string;
  /** Public URL of the media */
  url: string;
  /** Cloudinary public ID */
  publicId: string;
  /** Folder path in Cloudinary */
  folder: string;
  /** Secure URL (HTTPS) of the media */
  secureUrl: string;
  /** Cloudinary resource type */
  resourceType: CloudinaryResourceType;
  /** MIME type of the file */
  mimeType: string;
  /** Width in pixels (null for non-image media) */
  width: number | null;
  /** Height in pixels (null for non-image media) */
  height: number | null;
  /** File size in bytes */
  bytes: number;
  /** File format/extension */
  format: string;
  /** Original filename */
  originalFilename: string;
  /** Duration in seconds (for videos) */
  duration?: number | null;
}

/**
 * Result returned after a successful media replacement
 */
export interface ReplaceResult {
  /** Database ID of the new media asset */
  id: string;
  /** Globally unique asset ID of the new asset */
  assetId: string;
  /** Public URL of the new media */
  url: string;
  /** Cloudinary public ID of the new asset */
  publicId: string;
  /** Folder path of the new asset */
  folder: string;
  /** Secure URL (HTTPS) of the new media */
  secureUrl: string;
  /** Cloudinary resource type */
  resourceType: CloudinaryResourceType;
  /** MIME type of the new file */
  mimeType: string;
  /** Width in pixels (null for non-image media) */
  width: number | null;
  /** Height in pixels (null for non-image media) */
  height: number | null;
  /** File size in bytes */
  bytes: number;
  /** File format/extension */
  format: string;
  /** Original filename */
  originalFilename: string;
  /** Duration in seconds (for videos) */
  duration?: number | null;
}

/**
 * Result returned after a successful media deletion
 */
export interface DeleteResult {
  /** Whether the deletion was successful */
  success: boolean;
  /** The asset ID that was deleted */
  assetId: string;
  /** Error message if deletion failed */
  error?: string;
}

/**
 * Result returned after deleting multiple entity assets
 */
export interface DeleteEntityResult {
  /** Number of assets deleted */
  deletedCount: number;
  /** List of asset IDs that were successfully deleted */
  deletedAssetIds: string[];
  /** List of asset IDs that failed to delete */
  failedAssetIds: string[];
}

/**
 * Folder information structure
 */
export interface FolderInfo {
  /** The folder path */
  path: string;
  /** The entity type */
  entityType: EntityType;
  /** The entity slug */
  slug: string;
  /** Whether this is a root folder */
  isRoot: boolean;
}

/**
 * Media metadata structure
 */
export interface MediaMetadata {
  /** Asset ID */
  assetId: string;
  /** Entity type */
  entityType: EntityType;
  /** Entity ID */
  entityId: string;
  /** Folder path */
  folder: string;
  /** Resource type */
  resourceType: CloudinaryResourceType;
  /** Media type */
  mediaType: MediaType;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  fileSize: number;
  /** Width in pixels (if applicable) */
  width?: number;
  /** Height in pixels (if applicable) */
  height?: number;
  /** File format */
  format: string;
  /** Original filename */
  originalFilename: string;
  /** Display name */
  displayName: string;
  /** Alternative text */
  altText?: string;
  /** Sort order */
  sortOrder: number;
  /** Whether this is the primary media */
  isPrimary: boolean;
  /** Creation timestamp */
  createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Asset information from Cloudinary
 */
export interface CloudinaryAssetInfo {
  /** Cloudinary public ID */
  publicId: string;
  /** Secure URL */
  secureUrl: string;
  /** Resource type */
  resourceType: CloudinaryResourceType;
  /** Format */
  format: string;
  /** Width in pixels */
  width: number | null;
  /** Height in pixels */
  height: number | null;
  /** File size in bytes */
  bytes: number;
  /** Asset folder */
  folder?: string;
  /** Duration in seconds (for videos) */
  duration?: number | null;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Additional validation details */
  details?: Record<string, unknown>;
}

/**
 * File type configuration for validation
 */
export interface FileTypeConfig {
  /** Media type category */
  type: MediaType;
  /** Cloudinary resource type */
  resourceType: CloudinaryResourceType;
  /** Validation function for file signature */
  validate: (bytes: Uint8Array) => boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allowed dimensions (for images) */
  dimensions?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
}

/**
 * Cloudinary configuration
 */
export interface CloudinaryConfig {
  /** Cloudinary cloud name */
  cloudName: string;
  /** Cloudinary API key */
  apiKey: string;
  /** Cloudinary API secret */
  apiSecret: string;
}

/**
 * Environment configuration for media operations
 */
export interface MediaEnvConfig {
  /** Cloudinary configuration */
  cloudinary: CloudinaryConfig;
  /** Root folder for all uploads */
  rootFolder: string;
  /** Whether to use secure URLs only */
  secureOnly: boolean;
}
