/**
 * Media Usage Cache Service
 *
 * Provides caching for media usage detection to improve performance.
 * Instead of scanning all tables on every request, maintains a lightweight cache
 * that is invalidated when entities are updated.
 */
import type { PrismaClient } from '@prisma/client';
export interface UsageReference {
    type: string;
    id: string;
    name: string;
}
export interface UsageCacheData {
    used: boolean;
    total: number;
    references: UsageReference[];
    cachedAt: string;
}
/**
 * Gets cached usage data for an asset if available and valid
 */
export declare function getCachedUsage(prisma: PrismaClient, assetId: string): Promise<UsageCacheData | null>;
/**
 * Sets cached usage data for an asset
 */
export declare function setCachedUsage(prisma: PrismaClient, assetId: string, usageData: UsageCacheData): Promise<void>;
/**
 * Invalidates cache for a specific asset
 */
export declare function invalidateAssetCache(prisma: PrismaClient, assetId: string): Promise<void>;
/**
 * Invalidates cache for all assets referenced by an entity
 * Call this when an entity is updated or deleted
 */
export declare function invalidateEntityCache(prisma: PrismaClient, entityType: string, entityId: string): Promise<void>;
/**
 * Invalidates cache for assets with specific public IDs
 * Call this when media references are changed in entities
 */
export declare function invalidatePublicIdCache(prisma: PrismaClient, publicIds: string[]): Promise<void>;
/**
 * Gets usage data with automatic cache fallback
 */
export declare function getUsageWithCache(prisma: PrismaClient, assetId: string, computeUsageFn: () => Promise<UsageCacheData>): Promise<UsageCacheData>;
/**
 * Clears all invalid cache entries (maintenance function)
 */
export declare function clearInvalidCacheEntries(prisma: PrismaClient): Promise<number>;
/**
 * Gets cache statistics for monitoring
 */
export declare function getCacheStatistics(prisma: PrismaClient): Promise<{
    totalAssets: number;
    validCache: number;
    invalidCache: number;
    staleCache: number;
}>;
