import { getPrisma } from "./prisma";
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

export class ApiKeyRotationError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = "ApiKeyRotationError";
  }
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
export class ApiKeyRotationManager {
  private prisma: ReturnType<typeof getPrisma>;
  private options: Required<ApiKeyRotationOptions>;

  constructor(env?: Env, options: ApiKeyRotationOptions = {}) {
    this.prisma = getPrisma(env);
    this.options = {
      deprecationPeriodDays: options.deprecationPeriodDays || 30,
      autoRotate: options.autoRotate || false,
      notifyAdmins: options.notifyAdmins !== false,
    };
  }

  /**
   * Generate a new API key
   */
  private generateApiKey(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const randomPart2 = Math.random().toString(36).substring(2, 15);
    return `nab_${timestamp}${randomPart}${randomPart2}`;
  }

  /**
   * Create a new API key
   */
  async createApiKey(name: string, expiresAt?: Date): Promise<ApiKeyInfo> {
    const key = this.generateApiKey();
    const hashedKey = await this.hashKey(key);

    try {
      const apiKey = await this.prisma.apiKey.create({
        data: {
          name,
          key: hashedKey,
          version: 1,
          expiresAt: expiresAt || null,
        },
      });

      return {
        ...apiKey,
        key, // Return unhashed key only on creation
      };
    } catch (error) {
      throw new ApiKeyRotationError("Failed to create API key", error as Error);
    }
  }

  /**
   * Rotate an API key (create new version, deprecate old)
   */
  async rotateApiKey(
    keyId: string,
    expiresAt?: Date
  ): Promise<{ newKey: ApiKeyInfo; oldKey: ApiKeyInfo }> {
    try {
      // Get current key
      const oldKey = await this.prisma.apiKey.findUnique({
        where: { id: keyId },
      });

      if (!oldKey) {
        throw new ApiKeyRotationError("API key not found");
      }

      // Deprecate old key
      await this.prisma.apiKey.update({
        where: { id: keyId },
        data: {
          isDeprecated: true,
          deprecatedAt: new Date(),
        },
      });

      // Create new key version
      const newKeyData = await this.createApiKey(
        `${oldKey.name} (v${oldKey.version + 1})`,
        expiresAt
      );

      // Update version number
      const newKey = await this.prisma.apiKey.update({
        where: { id: newKeyData.id },
        data: { version: oldKey.version + 1 },
      });

      // Log rotation
      await this.prisma.userActionLog.create({
        data: {
          action: "API_KEY_ROTATED",
          entity: "ApiKey",
          entityId: keyId,
          metadata: {
            oldVersion: oldKey.version,
            newVersion: newKey.version,
            deprecationPeriod: this.options.deprecationPeriodDays,
          },
        },
      });

      return {
        newKey: { ...newKey, key: newKeyData.key },
        oldKey: { ...oldKey, key: "***REDACTED***" },
      };
    } catch (error) {
      throw new ApiKeyRotationError("Failed to rotate API key", error as Error);
    }
  }

  /**
   * Validate an API key
   */
  async validateApiKey(key: string): Promise<ApiKeyInfo | null> {
    const hashedKey = await this.hashKey(key);

    try {
      const apiKey = await this.prisma.apiKey.findFirst({
        where: {
          key: hashedKey,
          isDeprecated: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      });

      if (!apiKey) {
        return null;
      }

      // Update last used timestamp
      await this.prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      });

      return { ...apiKey, key: "***REDACTED***" };
    } catch (error) {
      throw new ApiKeyRotationError("Failed to validate API key", error as Error);
    }
  }

  /**
   * Revoke an API key immediately
   */
  async revokeApiKey(keyId: string): Promise<void> {
    try {
      await this.prisma.apiKey.update({
        where: { id: keyId },
        data: {
          isDeprecated: true,
          deprecatedAt: new Date(),
        },
      });

      // Log revocation
      await this.prisma.userActionLog.create({
        data: {
          action: "API_KEY_REVOKED",
          entity: "ApiKey",
          entityId: keyId,
        },
      });
    } catch (error) {
      throw new ApiKeyRotationError("Failed to revoke API key", error as Error);
    }
  }

  /**
   * Clean up deprecated keys past deprecation period
   */
  async cleanupDeprecatedKeys(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.options.deprecationPeriodDays);

    try {
      const result = await this.prisma.apiKey.deleteMany({
        where: {
          isDeprecated: true,
          deprecatedAt: {
            lt: cutoffDate,
          },
        },
      });

      return result.count;
    } catch (error) {
      throw new ApiKeyRotationError("Failed to cleanup deprecated keys", error as Error);
    }
  }

  /**
   * Get all API keys for admin view
   */
  async getAllApiKeys(): Promise<ApiKeyInfo[]> {
    try {
      const keys = await this.prisma.apiKey.findMany({
        orderBy: { createdAt: "desc" },
      });

      return keys.map((key) => ({
        ...key,
        key: "***REDACTED***",
      }));
    } catch (error) {
      throw new ApiKeyRotationError("Failed to get API keys", error as Error);
    }
  }

  /**
   * Check for keys nearing expiration
   */
  async getExpiringKeys(daysThreshold: number = 7): Promise<ApiKeyInfo[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    try {
      const keys = await this.prisma.apiKey.findMany({
        where: {
          isDeprecated: false,
          expiresAt: {
            lte: thresholdDate,
            gt: new Date(),
          },
        },
      });

      return keys.map((key) => ({
        ...key,
        key: "***REDACTED***",
      }));
    } catch (error) {
      throw new ApiKeyRotationError("Failed to get expiring keys", error as Error);
    }
  }

  /**
   * Auto-rotate expired keys if enabled
   */
  async autoRotateExpiredKeys(): Promise<number> {
    if (!this.options.autoRotate) {
      return 0;
    }

    try {
      const expiredKeys = await this.prisma.apiKey.findMany({
        where: {
          isDeprecated: false,
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      let rotatedCount = 0;
      for (const key of expiredKeys) {
        await this.rotateApiKey(key.id);
        rotatedCount++;
      }

      return rotatedCount;
    } catch (error) {
      throw new ApiKeyRotationError("Failed to auto-rotate expired keys", error as Error);
    }
  }

  /**
   * Hash an API key for storage
   * Uses Web Crypto API for Cloudflare Workers compatibility
   */
  private async hashKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * Middleware to validate API key in requests
 */
export async function requireApiKey(
  req: Request,
  env?: Env
): Promise<ApiKeyInfo | null> {
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!apiKey) {
    return null;
  }

  const manager = new ApiKeyRotationManager(env);
  return await manager.validateApiKey(apiKey);
}
