/**
 * Media Management Module - Asset ID Service
 *
 * This service is responsible for generating globally unique asset IDs.
 * All asset IDs must be unique, never reused, and safe for Cloudinary folder names.
 */
/**
 * Generates a globally unique asset ID using UUID v4
 * Format: asset_01KXXXXXXXXXXXX
 *
 * The ID consists of:
 * - A fixed prefix "asset_"
 * - A timestamp component for ordering
 * - A random component for uniqueness
 *
 * @returns A globally unique asset ID
 * @throws AssetIdGenerationError if ID generation fails
 */
export declare function generateAssetId(): string;
/**
 * Validates whether a string is a valid asset ID
 *
 * @param assetId The asset ID to validate
 * @returns True if valid, false otherwise
 */
export declare function isValidAssetId(assetId: string): boolean;
/**
 * Extracts the UUID portion from an asset ID
 *
 * @param assetId The asset ID to extract from
 * @returns The UUID portion, or null if invalid
 */
export declare function extractUuidFromAssetId(assetId: string): string | null;
/**
 * Generates multiple unique asset IDs in bulk
 *
 * @param count The number of asset IDs to generate
 * @returns An array of unique asset IDs
 * @throws AssetIdGenerationError if generation fails
 */
export declare function generateAssetIds(count: number): string[];
/**
 * Checks if an asset ID is safe for use in Cloudinary folder names
 * Cloudinary has specific requirements for folder names
 *
 * @param assetId The asset ID to check
 * @returns True if safe for Cloudinary, false otherwise
 */
export declare function isCloudinarySafe(assetId: string): boolean;
/**
 * Normalizes an asset ID by ensuring it meets all requirements
 *
 * @param assetId The asset ID to normalize
 * @returns The normalized asset ID
 * @throws AssetIdGenerationError if the asset ID cannot be normalized
 */
export declare function normalizeAssetId(assetId: string): string;
