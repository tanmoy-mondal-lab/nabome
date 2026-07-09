/**
 * Media Management Module - Security Service
 *
 * This service handles all security-related operations for media management.
 * It ensures that only authorized users can perform media operations and that
 * all inputs are properly sanitized to prevent attacks.
 */
import type { EntityType } from "./media.types";
/**
 * Authorization levels for media operations
 */
export declare enum MediaAuthorizationLevel {
    /** Read-only access */
    READ = "read",
    /** Can upload new media */
    UPLOAD = "upload",
    /** Can replace existing media */
    REPLACE = "replace",
    /** Can delete media */
    DELETE = "delete",
    /** Full administrative access */
    ADMIN = "admin"
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
export declare function authorizeMediaOperation(operation: MediaAuthorizationLevel, userContext: MediaUserContext, _entityType?: EntityType, entityId?: string): AuthorizationResult;
/**
 * Sanitizes a folder path to prevent path traversal attacks
 */
export declare function sanitizeFolderPath(folderPath: string): SanitizationResult;
/**
 * Sanitizes an asset ID to prevent injection attacks
 */
export declare function sanitizeAssetId(assetId: string): SanitizationResult;
/**
 * Sanitizes a filename to prevent file system attacks
 */
export declare function sanitizeFilenameSecure(filename: string): SanitizationResult;
/**
 * Performs comprehensive security checks on media operation parameters
 */
export declare function performSecurityChecks(params: {
    entityType?: EntityType;
    entityId?: string;
    slug?: string;
    assetId?: string;
    folderPath?: string;
    filename?: string;
}): SecurityCheckResult;
/**
 * Validates that a Cloudinary public ID is safe to use
 */
export declare function validateCloudinaryPublicId(publicId: string): SecurityCheckResult;
/**
 * Creates a safe public ID for Cloudinary
 */
export declare function createSafePublicId(assetId: string, filename: string): SecurityCheckResult;
/**
 * Rate limiting check for media operations
 */
export declare class MediaRateLimiter {
    private requests;
    private readonly windowMs;
    private readonly maxRequests;
    constructor(windowMs?: number, maxRequests?: number);
    /**
     * Checks if a user has exceeded the rate limit
     */
    checkLimit(userId: string): boolean;
    /**
     * Gets the remaining requests for a user
     */
    getRemainingRequests(userId: string): number;
    /**
     * Resets the rate limit for a user
     */
    resetLimit(userId: string): void;
    /**
     * Cleans up old request records
     */
    cleanup(): void;
}
/**
 * Global rate limiter instance
 */
export declare const mediaRateLimiter: MediaRateLimiter;
