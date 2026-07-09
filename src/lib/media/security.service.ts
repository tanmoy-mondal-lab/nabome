/**
 * Media Management Module - Security Service
 *
 * This service handles all security-related operations for media management.
 * It ensures that only authorized users can perform media operations and that
 * all inputs are properly sanitized to prevent attacks.
 */

import type { EntityType } from "./media.types";
import { normalizeFolder } from "./folder.service";
import { isValidAssetId } from "./asset-id.service";
import { sanitizeFilename } from "./media.utils";

/**
 * Authorization levels for media operations
 */
export enum MediaAuthorizationLevel {
  /** Read-only access */
  READ = "read",
  /** Can upload new media */
  UPLOAD = "upload",
  /** Can replace existing media */
  REPLACE = "replace",
  /** Can delete media */
  DELETE = "delete",
  /** Full administrative access */
  ADMIN = "admin",
}

/**
 * User context for authorization checks
 */
export interface MediaUserContext {
  /** User ID */
  userId: string;
  /** User role */
  role: string;
  /** User permissions */
  permissions: string[];
  /** Entity ownership (if applicable) */
  ownedEntityIds?: string[];
}

/**
 * Authorization result
 */
export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
  requiredLevel?: MediaAuthorizationLevel;
}

/**
 * Sanitization result
 */
export interface SanitizationResult {
  sanitized: boolean;
  original: string;
  sanitizedValue: string;
  warnings: string[];
}

/**
 * Security check result
 */
export interface SecurityCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Checks if a user is authorized to perform a media operation
 */
export function authorizeMediaOperation(
  operation: MediaAuthorizationLevel,
  userContext: MediaUserContext,
  _entityType?: EntityType,
  entityId?: string
): AuthorizationResult {
  // Admin users have full access
  if (userContext.role === "admin" || userContext.permissions.includes("media:admin")) {
    return { authorized: true };
  }

  // Check specific permissions based on operation
  const requiredPermission = `media:${operation}`;
  if (userContext.permissions.includes(requiredPermission)) {
    return { authorized: true };
  }

  // For entity-specific operations, check ownership
  if (entityId && userContext.ownedEntityIds?.includes(entityId)) {
    // Owners can perform most operations on their entities
    if (operation === MediaAuthorizationLevel.READ || 
        operation === MediaAuthorizationLevel.UPLOAD ||
        operation === MediaAuthorizationLevel.REPLACE) {
      return { authorized: true };
    }
  }

  return {
    authorized: false,
    reason: `User lacks required permission: ${requiredPermission}`,
    requiredLevel: operation,
  };
}

/**
 * Sanitizes a folder path to prevent path traversal attacks
 */
export function sanitizeFolderPath(folderPath: string): SanitizationResult {
  const warnings: string[] = [];
  const original = folderPath;

  try {
    // Normalize the folder path
    const normalized = normalizeFolder(folderPath);
    
    // Additional security checks
    if (normalized.includes("..")) {
      warnings.push("Path traversal attempt detected");
    }
    
    if (normalized.includes("//")) {
      warnings.push("Double slash detected");
    }
    
    if (/[\x00-\x1F\x7F]/.test(normalized)) {
      warnings.push("Control characters detected");
    }

    return {
      sanitized: true,
      original,
      sanitizedValue: normalized,
      warnings,
    };
  } catch (error) {
    return {
      sanitized: false,
      original,
      sanitizedValue: "",
      warnings: [`Sanitization failed: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

/**
 * Sanitizes an asset ID to prevent injection attacks
 */
export function sanitizeAssetId(assetId: string): SanitizationResult {
  const warnings: string[] = [];
  const original = assetId;

  // Check if it's a valid asset ID
  if (!isValidAssetId(assetId)) {
    return {
      sanitized: false,
      original,
      sanitizedValue: "",
      warnings: ["Invalid asset ID format"],
    };
  }

  // Additional checks
  if (assetId.includes("..")) {
    warnings.push("Path traversal attempt detected");
  }

  if (/[\x00-\x1F\x7F]/.test(assetId)) {
    warnings.push("Control characters detected");
  }

  return {
    sanitized: true,
    original,
    sanitizedValue: assetId,
    warnings,
  };
}

/**
 * Sanitizes a filename to prevent file system attacks
 */
export function sanitizeFilenameSecure(filename: string): SanitizationResult {
  const warnings: string[] = [];
  const original = filename;

  const sanitized = sanitizeFilename(filename);

  // Additional security checks
  if (sanitized !== original) {
    warnings.push("Filename was modified for security");
  }

  if (original.includes("..")) {
    warnings.push("Path traversal attempt detected");
  }

  if (original.includes("/") || original.includes("\\")) {
    warnings.push("Path separator detected");
  }

  if (/[\x00-\x1F\x7F]/.test(original)) {
    warnings.push("Control characters detected");
  }

  return {
    sanitized: true,
    original,
    sanitizedValue: sanitized,
    warnings,
  };
}

/**
 * Performs comprehensive security checks on media operation parameters
 */
export function performSecurityChecks(params: {
  entityType?: EntityType;
  entityId?: string;
  slug?: string;
  assetId?: string;
  folderPath?: string;
  filename?: string;
}): SecurityCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check entity type
  if (params.entityType) {
    const validEntityTypes: EntityType[] = [
      "settings", "homepage", "products", "categories", "collections",
      "brands", "labels", "lookbooks", "blogs", "cms", "sellers", "users"
    ];
    if (!validEntityTypes.includes(params.entityType)) {
      errors.push(`Invalid entity type: ${params.entityType}`);
    }
  }

  // Check entity ID format
  if (params.entityId) {
    try {
      // Should be a valid UUID
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(params.entityId)) {
        warnings.push("Entity ID does not match UUID format");
      }
    } catch {
      errors.push("Invalid entity ID format");
    }
  }

  // Check slug
  if (params.slug) {
    if (params.slug.length === 0 || params.slug.length > 200) {
      errors.push("Slug must be between 1 and 200 characters");
    }
    if (/[\x00-\x1F\x7F]/.test(params.slug)) {
      errors.push("Slug contains control characters");
    }
  }

  // Check asset ID
  if (params.assetId) {
    const assetIdCheck = sanitizeAssetId(params.assetId);
    if (!assetIdCheck.sanitized) {
      errors.push(...assetIdCheck.warnings);
    }
    warnings.push(...assetIdCheck.warnings);
  }

  // Check folder path
  if (params.folderPath) {
    const folderCheck = sanitizeFolderPath(params.folderPath);
    if (!folderCheck.sanitized) {
      errors.push(...folderCheck.warnings);
    }
    warnings.push(...folderCheck.warnings);
  }

  // Check filename
  if (params.filename) {
    const filenameCheck = sanitizeFilenameSecure(params.filename);
    if (!filenameCheck.sanitized) {
      errors.push(...filenameCheck.warnings);
    }
    warnings.push(...filenameCheck.warnings);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates that a Cloudinary public ID is safe to use
 */
export function validateCloudinaryPublicId(publicId: string): SecurityCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!publicId || publicId.length === 0) {
    errors.push("Public ID cannot be empty");
  }

  if (publicId.length > 500) {
    errors.push("Public ID exceeds maximum length of 500 characters");
  }

  // Check for path traversal
  if (publicId.includes("..")) {
    errors.push("Public ID contains path traversal sequence");
  }

  // Check for control characters
  if (/[\x00-\x1F\x7F]/.test(publicId)) {
    errors.push("Public ID contains control characters");
  }

  // Check for suspicious patterns
  if (/https?:\/\//i.test(publicId)) {
    errors.push("Public ID contains URL pattern");
  }

  if (/javascript:/i.test(publicId)) {
    errors.push("Public ID contains JavaScript pattern");
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Creates a safe public ID for Cloudinary
 */
export function createSafePublicId(
  assetId: string,
  filename: string
): SecurityCheckResult {
  const assetIdCheck = sanitizeAssetId(assetId);
  const filenameCheck = sanitizeFilenameSecure(filename);

  const allErrors = [...assetIdCheck.warnings, ...filenameCheck.warnings];
  const allWarnings = [...assetIdCheck.warnings, ...filenameCheck.warnings];

  if (!assetIdCheck.sanitized || !filenameCheck.sanitized) {
    return {
      passed: false,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  const safePublicId = `${assetIdCheck.sanitizedValue}/${filenameCheck.sanitizedValue}`;
  const publicIdCheck = validateCloudinaryPublicId(safePublicId);

  return {
    passed: publicIdCheck.passed,
    errors: [...allErrors, ...publicIdCheck.errors],
    warnings: [...allWarnings, ...publicIdCheck.warnings],
  };
}

/**
 * Rate limiting check for media operations
 */
export class MediaRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Checks if a user has exceeded the rate limit
   */
  checkLimit(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    // Remove requests outside the time window
    const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);

    // Check if limit exceeded
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(userId, validRequests);

    return true;
  }

  /**
   * Gets the remaining requests for a user
   */
  getRemainingRequests(userId: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * Resets the rate limit for a user
   */
  resetLimit(userId: string): void {
    this.requests.delete(userId);
  }

  /**
   * Cleans up old request records
   */
  cleanup(): void {
    const now = Date.now();
    for (const [userId, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
      if (validRequests.length === 0) {
        this.requests.delete(userId);
      } else {
        this.requests.set(userId, validRequests);
      }
    }
  }
}

/**
 * Global rate limiter instance
 */
export const mediaRateLimiter = new MediaRateLimiter(60000, 100); // 100 requests per minute

/**
 * Cleanup interval for rate limiter (run every 5 minutes)
 */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    mediaRateLimiter.cleanup();
  }, 5 * 60 * 1000);
}
