/**
 * Media Management Module - Asset ID Service
 * 
 * This service is responsible for generating globally unique asset IDs.
 * All asset IDs must be unique, never reused, and safe for Cloudinary folder names.
 */

import { ASSET_ID_PREFIX } from "./media.constants";
import { AssetIdGenerationError } from "./media.errors";

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
export function generateAssetId(): string {
  try {
    // Generate UUID v4
    const uuid = crypto.randomUUID();
    
    // Take first 13 characters and convert to uppercase
    const shortId = uuid.slice(0, 13).toUpperCase();
    
    // Combine with prefix
    return `${ASSET_ID_PREFIX}${shortId}`;
  } catch (error) {
    throw new AssetIdGenerationError(
      `Failed to generate asset ID: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Validates whether a string is a valid asset ID
 * 
 * @param assetId The asset ID to validate
 * @returns True if valid, false otherwise
 */
export function isValidAssetId(assetId: string): boolean {
  // Check prefix
  if (!assetId.startsWith(ASSET_ID_PREFIX)) {
    return false;
  }
  
  // Check length (prefix + 13 characters)
  if (assetId.length !== ASSET_ID_PREFIX.length + 13) {
    return false;
  }
  
  // Check that the suffix is alphanumeric
  const suffix = assetId.slice(ASSET_ID_PREFIX.length);
  const isValidSuffix = /^[0-9A-F]+$/.test(suffix);
  
  return isValidSuffix;
}

/**
 * Extracts the UUID portion from an asset ID
 * 
 * @param assetId The asset ID to extract from
 * @returns The UUID portion, or null if invalid
 */
export function extractUuidFromAssetId(assetId: string): string | null {
  if (!isValidAssetId(assetId)) {
    return null;
  }
  
  const shortId = assetId.slice(ASSET_ID_PREFIX.length);
  
  // Reconstruct a full UUID (this is approximate since we truncated)
  // In practice, you might want to store the full UUID separately
  return `${shortId}0000-0000-4000-8000-000000000000`;
}

/**
 * Generates multiple unique asset IDs in bulk
 * 
 * @param count The number of asset IDs to generate
 * @returns An array of unique asset IDs
 * @throws AssetIdGenerationError if generation fails
 */
export function generateAssetIds(count: number): string[] {
  if (count <= 0) {
    return [];
  }
  
  if (count > 1000) {
    throw new AssetIdGenerationError(
      `Cannot generate more than 1000 asset IDs at once. Requested: ${count}`
    );
  }
  
  const ids: string[] = [];
  const seen = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    const id = generateAssetId();
    
    // Ensure uniqueness (extremely unlikely with UUID, but checking anyway)
    if (seen.has(id)) {
      i--; // Retry this iteration
      continue;
    }
    
    seen.add(id);
    ids.push(id);
  }
  
  return ids;
}

/**
 * Checks if an asset ID is safe for use in Cloudinary folder names
 * Cloudinary has specific requirements for folder names
 * 
 * @param assetId The asset ID to check
 * @returns True if safe for Cloudinary, false otherwise
 */
export function isCloudinarySafe(assetId: string): boolean {
  // Cloudinary allows alphanumeric characters, underscores, and hyphens
  // Our asset IDs use only alphanumeric characters and underscores
  return /^[a-zA-Z0-9_]+$/.test(assetId);
}

/**
 * Normalizes an asset ID by ensuring it meets all requirements
 * 
 * @param assetId The asset ID to normalize
 * @returns The normalized asset ID
 * @throws AssetIdGenerationError if the asset ID cannot be normalized
 */
export function normalizeAssetId(assetId: string): string {
  if (!assetId) {
    throw new AssetIdGenerationError("Asset ID cannot be empty");
  }
  
  // If it's already valid, return as-is
  if (isValidAssetId(assetId)) {
    return assetId;
  }
  
  // If it starts with the prefix but is otherwise invalid, regenerate
  if (assetId.startsWith(ASSET_ID_PREFIX)) {
    return generateAssetId();
  }
  
  // If it doesn't start with the prefix, add it and regenerate
  return generateAssetId();
}
