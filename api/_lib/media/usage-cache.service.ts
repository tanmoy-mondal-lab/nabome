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
export async function getCachedUsage(
  prisma: PrismaClient,
  assetId: string
): Promise<UsageCacheData | null> {
  try {
    const asset = await prisma.media_assets.findUnique({
      where: { id: assetId },
      select: {
        usageCache: true,
        usageCacheValid: true,
        usageCacheAt: true,
      },
    });

    if (!asset || !asset.usageCacheValid || !asset.usageCache) {
      return null;
    }

    // Cache is valid for 5 minutes
    const cacheAge = Date.now() - (asset.usageCacheAt ? new Date(asset.usageCacheAt).getTime() : 0);
    if (cacheAge > 5 * 60 * 1000) {
      return null;
    }

    return asset.usageCache as unknown as UsageCacheData;
  } catch (error) {
    console.error('[UsageCache] Failed to get cached usage:', error);
    return null;
  }
}

/**
 * Sets cached usage data for an asset
 */
export async function setCachedUsage(
  prisma: PrismaClient,
  assetId: string,
  usageData: UsageCacheData
): Promise<void> {
  try {
    await prisma.media_assets.update({
      where: { id: assetId },
      data: {
        usageCache: usageData as any,
        usageCacheValid: true,
        usageCacheAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[UsageCache] Failed to set cached usage:', error);
  }
}

/**
 * Invalidates cache for a specific asset
 */
export async function invalidateAssetCache(
  prisma: PrismaClient,
  assetId: string
): Promise<void> {
  try {
    await prisma.media_assets.update({
      where: { id: assetId },
      data: {
        usageCacheValid: false,
      },
    });
  } catch (error) {
    console.error('[UsageCache] Failed to invalidate asset cache:', error);
  }
}

/**
 * Invalidates cache for all assets referenced by an entity
 * Call this when an entity is updated or deleted
 */
export async function invalidateEntityCache(
  prisma: PrismaClient,
  entityType: string,
  entityId: string
): Promise<void> {
  try {
    // Find all assets that might reference this entity
    const assets = await prisma.media_assets.findMany({
      where: {
        entityType: entityType as any,
        entityId,
      },
      select: { id: true },
    });

    // Invalidate all of them
    if (assets.length > 0) {
      await prisma.media_assets.updateMany({
        where: {
          id: { in: assets.map(a => a.id) },
        },
        data: {
          usageCacheValid: false,
        },
      });
    }
  } catch (error) {
    console.error('[UsageCache] Failed to invalidate entity cache:', error);
  }
}

/**
 * Invalidates cache for assets with specific public IDs
 * Call this when media references are changed in entities
 */
export async function invalidatePublicIdCache(
  prisma: PrismaClient,
  publicIds: string[]
): Promise<void> {
  try {
    await prisma.media_assets.updateMany({
      where: {
        publicId: { in: publicIds },
      },
      data: {
        usageCacheValid: false,
      },
    });
  } catch (error) {
    console.error('[UsageCache] Failed to invalidate public ID cache:', error);
  }
}

/**
 * Gets usage data with automatic cache fallback
 */
export async function getUsageWithCache(
  prisma: PrismaClient,
  assetId: string,
  computeUsageFn: () => Promise<UsageCacheData>
): Promise<UsageCacheData> {
  // Try to get from cache first
  const cached = await getCachedUsage(prisma, assetId);
  if (cached) {
    return cached;
  }

  // Compute usage
  const usageData = await computeUsageFn();

  // Cache the result
  await setCachedUsage(prisma, assetId, usageData);

  return usageData;
}

/**
 * Clears all invalid cache entries (maintenance function)
 */
export async function clearInvalidCacheEntries(
  prisma: PrismaClient
): Promise<number> {
  try {
    const result = await prisma.media_assets.updateMany({
      where: {
        usageCacheValid: true,
        OR: [
          { usageCacheAt: null },
          {
            usageCacheAt: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Older than 24 hours
            },
          },
        ],
      },
      data: {
        usageCacheValid: false,
      },
    });

    return result.count;
  } catch (error) {
    console.error('[UsageCache] Failed to clear invalid cache entries:', error);
    return 0;
  }
}

/**
 * Gets cache statistics for monitoring
 */
export async function getCacheStatistics(
  prisma: PrismaClient
): Promise<{
  totalAssets: number;
  validCache: number;
  invalidCache: number;
  staleCache: number;
}> {
  try {
    const [total, valid, invalid, stale] = await Promise.all([
      prisma.media_assets.count(),
      prisma.media_assets.count({ where: { usageCacheValid: true } }),
      prisma.media_assets.count({ where: { usageCacheValid: false } }),
      prisma.media_assets.count({
        where: {
          usageCacheValid: true,
          usageCacheAt: {
            lt: new Date(Date.now() - 5 * 60 * 1000), // Older than 5 minutes
          },
        },
      }),
    ]);

    return {
      totalAssets: total,
      validCache: valid,
      invalidCache: invalid,
      staleCache: stale,
    };
  } catch (error) {
    console.error('[UsageCache] Failed to get cache statistics:', error);
    return {
      totalAssets: 0,
      validCache: 0,
      invalidCache: 0,
      staleCache: 0,
    };
  }
}
