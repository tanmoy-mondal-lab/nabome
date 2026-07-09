/**
 * Media Management Module - Folder Service
 * 
 * This service is responsible for generating folder paths for media assets.
 * All folder paths must be generated through this service - no hardcoding elsewhere.
 */

import type { EntityType } from "./media.types";
import { ROOT_FOLDER } from "./media.constants";
import { FolderError } from "./media.errors";
import { slugify } from "../utils/format";

/**
 * Gets the root folder for all media uploads
 * 
 * @returns The root folder path
 */
export function getRootFolder(): string {
  return ROOT_FOLDER;
}

/**
 * Gets the folder path for a specific entity type and slug
 * 
 * @param entityType The type of entity
 * @param slug The entity slug
 * @returns The folder path for the entity
 */
export function getEntityFolder(entityType: EntityType, slug: string): string {
  const safeSlug = slugify(slug) || slug;
  return `${ROOT_FOLDER}/${entityType}/${safeSlug}`;
}

/**
 * Gets the folder path for a specific asset within an entity
 * 
 * @param entityFolder The entity folder path
 * @param assetId The asset ID
 * @returns The folder path for the asset
 */
export function getAssetFolder(entityFolder: string, assetId: string): string {
  return `${entityFolder}/${assetId}`;
}

/**
 * Gets the full file path for an asset
 * 
 * @param entityType The type of entity
 * @param slug The entity slug
 * @param assetId The asset ID
 * @param filename The filename
 * @returns The full file path
 */
export function getAssetFilePath(
  entityType: EntityType,
  slug: string,
  assetId: string,
  filename: string
): string {
  return `${getEntityFolder(entityType, slug)}/${assetId}/${filename}`;
}

/**
 * Gets the folder path for settings
 * 
 * @param type The settings type (e.g., "logo", "favicon", "banner")
 * @returns The folder path for settings
 */
export function getSettingsFolder(type: string): string {
  const safeType = slugify(type) || type;
  return `${ROOT_FOLDER}/settings/${safeType}`;
}

/**
 * Gets the folder path for products
 * 
 * @param slug The product slug
 * @returns The folder path for the product
 */
export function getProductFolder(slug: string): string {
  return getEntityFolder("products", slug);
}

/**
 * Gets the folder path for brands
 * 
 * @param slug The brand slug
 * @returns The folder path for the brand
 */
export function getBrandFolder(slug: string): string {
  return getEntityFolder("brands", slug);
}

/**
 * Gets the folder path for categories
 * 
 * @param slug The category slug
 * @returns The folder path for the category
 */
export function getCategoryFolder(slug: string): string {
  return getEntityFolder("categories", slug);
}

/**
 * Gets the folder path for collections
 * 
 * @param slug The collection slug
 * @returns The folder path for the collection
 */
export function getCollectionFolder(slug: string): string {
  return getEntityFolder("collections", slug);
}

/**
 * Gets the folder path for the homepage
 * 
 * @param section The homepage section (e.g., "hero", "featured")
 * @returns The folder path for the homepage section
 */
export function getHomepageFolder(section: string): string {
  const safeSection = slugify(section) || section;
  return `${ROOT_FOLDER}/homepage/${safeSection}`;
}

/**
 * Gets the folder path for CMS content
 * 
 * @param slug The CMS content slug
 * @returns The folder path for the CMS content
 */
export function getCmsFolder(slug: string): string {
  return getEntityFolder("cms", slug);
}

/**
 * Gets the folder path for blogs
 * 
 * @param slug The blog slug
 * @returns The folder path for the blog
 */
export function getBlogFolder(slug: string): string {
  return getEntityFolder("blogs", slug);
}

/**
 * Gets the folder path for lookbooks
 * 
 * @param slug The lookbook slug
 * @returns The folder path for the lookbook
 */
export function getLookbookFolder(slug: string): string {
  return getEntityFolder("lookbooks", slug);
}

/**
 * Gets the folder path for sellers
 * 
 * @param slug The seller slug
 * @returns The folder path for the seller
 */
export function getSellerFolder(slug: string): string {
  return getEntityFolder("sellers", slug);
}

/**
 * Gets the folder path for users
 * 
 * @param id The user ID
 * @returns The folder path for the user
 */
export function getUserFolder(id: string): string {
  const safeId = slugify(id) || id;
  return `${ROOT_FOLDER}/users/${safeId}`;
}

/**
 * Gets the folder path for labels
 * 
 * @param slug The label slug
 * @returns The folder path for the label
 */
export function getLabelFolder(slug: string): string {
  return getEntityFolder("labels", slug);
}

/**
 * Gets a temporary folder path for intermediate operations
 * 
 * @param assetId Optional asset ID to include in the path
 * @returns The temporary folder path
 */
export function getTempFolder(assetId?: string): string {
  if (assetId) {
    return `${ROOT_FOLDER}/temp/${assetId}`;
  }
  const id = crypto.randomUUID().slice(0, 8);
  return `${ROOT_FOLDER}/temp/${id}`;
}

/**
 * Parses a folder path to extract its components
 * 
 * @param folderPath The folder path to parse
 * @returns The parsed components or null if invalid
 */
export function parseEntityFolder(folderPath: string): {
  root: string;
  entityType: EntityType | null;
  slug: string | null;
  assetId: string | null;
} | null {
  const parts = folderPath.split("/");
  
  if (parts[0] !== ROOT_FOLDER || parts.length < 2) {
    return null;
  }

  const root = parts[0];
  const entityType = parts[1] as EntityType;
  const slug = parts.length >= 3 ? parts[2] : null;
  const assetId = parts.length >= 4 ? parts[3] : null;

  return { root, entityType, slug, assetId };
}

/**
 * Extracts the entity folder from a full asset folder path
 * 
 * @param folderPath The full folder path
 * @returns The entity folder path or null if invalid
 */
export function extractEntityFolder(folderPath: string): string | null {
  const parts = folderPath.split("/");
  
  if (parts[0] !== ROOT_FOLDER || parts.length < 3) {
    return null;
  }
  
  return parts.slice(0, 3).join("/");
}

/**
 * Checks if a folder path is an asset folder (contains an asset ID)
 * 
 * @param folderPath The folder path to check
 * @returns True if it's an asset folder, false otherwise
 */
export function isAssetFolder(folderPath: string): boolean {
  const parsed = parseEntityFolder(folderPath);
  return parsed !== null && parsed.assetId !== null;
}

/**
 * Validates that a folder path is within the root folder hierarchy
 * This prevents path traversal attacks
 * 
 * @param folderPath The folder path to validate
 * @returns True if valid, false otherwise
 */
export function isValidFolder(folderPath: string): boolean {
  // Check that it starts with the root folder
  if (!folderPath.startsWith(ROOT_FOLDER)) {
    return false;
  }
  
  // Check for path traversal attempts
  if (folderPath.includes("..")) {
    return false;
  }
  
  // Check for empty segments
  if (folderPath.includes("//")) {
    return false;
  }
  
  return true;
}

/**
 * Normalizes a folder path to ensure it meets all requirements
 * 
 * @param folderPath The folder path to normalize
 * @returns The normalized folder path
 * @throws FolderError if the path cannot be normalized
 */
export function normalizeFolder(folderPath: string): string {
  if (!folderPath) {
    throw new FolderError("Folder path cannot be empty");
  }
  
  // Remove leading/trailing slashes
  const normalized = folderPath.trim().replace(/^\/+|\/+$/g, "");
  
  // Validate the normalized path
  if (!isValidFolder(normalized)) {
    throw new FolderError(`Invalid folder path: ${folderPath}`);
  }
  
  return normalized;
}

/**
 * Gets the folder path for a generic entity type
 * This is a helper for entity types that don't have specific methods
 * 
 * @param entityType The entity type
 * @param slug The entity slug
 * @returns The folder path
 */
export function getGenericEntityFolder(entityType: string, slug: string): string {
  const safeType = slugify(entityType) || entityType;
  const safeSlug = slugify(slug) || slug;
  return `${ROOT_FOLDER}/${safeType}/${safeSlug}`;
}
