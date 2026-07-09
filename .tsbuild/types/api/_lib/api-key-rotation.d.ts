import type { Env } from "./env";
export interface ApiKeyInfo {
    id: string;
    name: string;
    key: string;
    version: number;
    expiresAt: Date | null;
    isDeprecated: boolean;
    deprecatedAt: Date | null;
    createdAt: Date;
}
export interface ApiKeyRotationOptions {
    deprecationPeriodDays?: number;
    autoRotate?: boolean;
    notifyAdmins?: boolean;
}
export declare class ApiKeyRotationError extends Error {
    readonly cause?: Error | undefined;
    constructor(message: string, cause?: Error | undefined);
}
/**
 * API Key Rotation Manager
 *
 * Manages API key lifecycle including:
 * - Key versioning
 * - Key rotation
 * - Key deprecation
 * - Automatic key expiration
 */
export declare class ApiKeyRotationManager {
    private prisma;
    private options;
    constructor(env?: Env, options?: ApiKeyRotationOptions);
    /**
     * Generate a new API key
     */
    private generateApiKey;
    /**
     * Create a new API key
     */
    createApiKey(name: string, expiresAt?: Date): Promise<ApiKeyInfo>;
    /**
     * Rotate an API key (create new version, deprecate old)
     */
    rotateApiKey(keyId: string, expiresAt?: Date): Promise<{
        newKey: ApiKeyInfo;
        oldKey: ApiKeyInfo;
    }>;
    /**
     * Validate an API key
     */
    validateApiKey(key: string): Promise<ApiKeyInfo | null>;
    /**
     * Revoke an API key immediately
     */
    revokeApiKey(keyId: string): Promise<void>;
    /**
     * Clean up deprecated keys past deprecation period
     */
    cleanupDeprecatedKeys(): Promise<number>;
    /**
     * Get all API keys for admin view
     */
    getAllApiKeys(): Promise<ApiKeyInfo[]>;
    /**
     * Check for keys nearing expiration
     */
    getExpiringKeys(daysThreshold?: number): Promise<ApiKeyInfo[]>;
    /**
     * Auto-rotate expired keys if enabled
     */
    autoRotateExpiredKeys(): Promise<number>;
    /**
     * Hash an API key for storage
     * Uses Web Crypto API for Cloudflare Workers compatibility
     */
    private hashKey;
}
/**
 * Middleware to validate API key in requests
 */
export declare function requireApiKey(req: Request, env?: Env): Promise<ApiKeyInfo | null>;
