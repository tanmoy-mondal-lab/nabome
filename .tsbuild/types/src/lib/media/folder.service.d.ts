/**
 * Media Management Module - Folder Service
 *
 * This service is responsible for generating folder paths for media assets.
 * All folder paths must be generated through this service - no hardcoding elsewhere.
 */
import type { EntityType } from "./media.types";
/**
 * Gets the root folder for all media uploads
 *
 * @returns The root folder path
 */
export declare function getRootFolder(): string;
/**
 * Gets the folder path for a specific entity type and slug
 *
 * @param entityType The type of entity
 * @param slug The entity slug
 * @returns The folder path for the entity
 */
export declare function getEntityFolder(entityType: EntityType, slug: string): string;
/**
 * Gets the folder path for a specific asset within an entity
 *
 * @param entityFolder The entity folder path
 * @param assetId The asset ID
 * @returns The folder path for the asset
 */
export declare function getAssetFolder(entityFolder: string, assetId: string): string;
/**
 * Gets the full file path for an asset
 *
 * @param entityType The type of entity
 * @param slug The entity slug
 * @param assetId The asset ID
 * @param filename The filename
 * @returns The full file path
 */
export declare function getAssetFilePath(entityType: EntityType, slug: string, assetId: string, filename: string): string;
/**
 * Gets the folder path for settings
 *
 * @param type The settings type (e.g., "logo", "favicon", "banner")
 * @returns The folder path for settings
 */
export declare function getSettingsFolder(type: string): string;
/**
 * Gets the folder path for products
 *
 * @param slug The product slug
 * @returns The folder path for the product
 */
export declare function getProductFolder(slug: string): string;
/**
 * Gets the folder path for brands
 *
 * @param slug The brand slug
 * @returns The folder path for the brand
 */
export declare function getBrandFolder(slug: string): string;
/**
 * Gets the folder path for categories
 *
 * @param slug The category slug
 * @returns The folder path for the category
 */
export declare function getCategoryFolder(slug: string): string;
/**
 * Gets the folder path for collections
 *
 * @param slug The collection slug
 * @returns The folder path for the collection
 */
export declare function getCollectionFolder(slug: string): string;
/**
 * Gets the folder path for the homepage
 *
 * @param section The homepage section (e.g., "hero", "featured")
 * @returns The folder path for the homepage section
 */
export declare function getHomepageFolder(section: string): string;
/**
 * Gets the folder path for CMS content
 *
 * @param slug The CMS content slug
 * @returns The folder path for the CMS content
 */
export declare function getCmsFolder(slug: string): string;
/**
 * Gets the folder path for blogs
 *
 * @param slug The blog slug
 * @returns The folder path for the blog
 */
export declare function getBlogFolder(slug: string): string;
/**
 * Gets the folder path for lookbooks
 *
 * @param slug The lookbook slug
 * @returns The folder path for the lookbook
 */
export declare function getLookbookFolder(slug: string): string;
/**
 * Gets the folder path for sellers
 *
 * @param slug The seller slug
 * @returns The folder path for the seller
 */
export declare function getSellerFolder(slug: string): string;
/**
 * Gets the folder path for users
 *
 * @param id The user ID
 * @returns The folder path for the user
 */
export declare function getUserFolder(id: string): string;
/**
 * Gets the folder path for labels
 *
 * @param slug The label slug
 * @returns The folder path for the label
 */
export declare function getLabelFolder(slug: string): string;
/**
 * Gets a temporary folder path for intermediate operations
 *
 * @param assetId Optional asset ID to include in the path
 * @returns The temporary folder path
 */
export declare function getTempFolder(assetId?: string): string;
/**
 * Parses a folder path to extract its components
 *
 * @param folderPath The folder path to parse
 * @returns The parsed components or null if invalid
 */
export declare function parseEntityFolder(folderPath: string): {
    root: string;
    entityType: EntityType | null;
    slug: string | null;
    assetId: string | null;
} | null;
/**
 * Extracts the entity folder from a full asset folder path
 *
 * @param folderPath The full folder path
 * @returns The entity folder path or null if invalid
 */
export declare function extractEntityFolder(folderPath: string): string | null;
/**
 * Checks if a folder path is an asset folder (contains an asset ID)
 *
 * @param folderPath The folder path to check
 * @returns True if it's an asset folder, false otherwise
 */
export declare function isAssetFolder(folderPath: string): boolean;
/**
 * Validates that a folder path is within the root folder hierarchy
 * This prevents path traversal attacks
 *
 * @param folderPath The folder path to validate
 * @returns True if valid, false otherwise
 */
export declare function isValidFolder(folderPath: string): boolean;
/**
 * Normalizes a folder path to ensure it meets all requirements
 *
 * @param folderPath The folder path to normalize
 * @returns The normalized folder path
 * @throws FolderError if the path cannot be normalized
 */
export declare function normalizeFolder(folderPath: string): string;
/**
 * Gets the folder path for a generic entity type
 * This is a helper for entity types that don't have specific methods
 *
 * @param entityType The entity type
 * @param slug The entity slug
 * @returns The folder path
 */
export declare function getGenericEntityFolder(entityType: string, slug: string): string;
