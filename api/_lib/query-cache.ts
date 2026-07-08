// ─────────────────────────────────────────────────────────────
// NABOME — Database Query Caching Layer
// Caches Prisma query results to reduce database load
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "./prisma";
import { CacheService, CacheKeys, CacheTags } from "./cache";

interface QueryCacheOptions {
  ttl?: number; // Time to live in seconds (default: 60 for queries)
  tags?: string[]; // Cache tags for invalidation
  skipCache?: boolean; // Force bypass cache
}

export class QueryCache {
  private cache: CacheService;

  constructor(cache: CacheService) {
    this.cache = cache;
  }

  private serialize(data: unknown): string {
    return JSON.stringify(data);
  }

  private deserialize<T>(text: string): T {
    return JSON.parse(text) as T;
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.cache.get("query", key);
    if (!cached) return null;
    try {
      return this.deserialize<T>(cached);
    } catch {
      return null;
    }
  }

  async set<T>(key: string, data: T, options: QueryCacheOptions = {}): Promise<void> {
    const ttl = options.ttl ?? 60; // Default 1 minute for queries
    await this.cache.set("query", key, this.serialize(data), {
      ttl,
      tags: options.tags,
    });
  }

  async invalidate(key: string): Promise<void> {
    await this.cache.delete("query", key);
  }

  async invalidateByTag(tag: string): Promise<void> {
    await this.cache.invalidateByTag(tag);
  }

  // Cached query methods for common patterns
  async cachedFindMany<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: QueryCacheOptions = {}
  ): Promise<T> {
    if (options.skipCache) {
      return queryFn();
    }

    const cached = await this.get<T>(key);
    if (cached) {
      return cached;
    }

    const result = await queryFn();
    await this.set(key, result, options);
    return result;
  }

  async cachedFindFirst<T>(
    key: string,
    queryFn: () => Promise<T | null>,
    options: QueryCacheOptions = {}
  ): Promise<T | null> {
    if (options.skipCache) {
      return queryFn();
    }

    const cached = await this.get<T>(key);
    if (cached) {
      return cached;
    }

    const result = await queryFn();
    if (result) {
      await this.set(key, result, options);
    }
    return result;
  }

  async cachedFindUnique<T>(
    key: string,
    queryFn: () => Promise<T | null>,
    options: QueryCacheOptions = {}
  ): Promise<T | null> {
    if (options.skipCache) {
      return queryFn();
    }

    const cached = await this.get<T>(key);
    if (cached) {
      return cached;
    }

    const result = await queryFn();
    if (result) {
      await this.set(key, result, options);
    }
    return result;
  }

  async cachedCount(
    key: string,
    queryFn: () => Promise<number>,
    options: QueryCacheOptions = {}
  ): Promise<number> {
    if (options.skipCache) {
      return queryFn();
    }

    const cached = await this.get<number>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await queryFn();
    await this.set(key, result, options);
    return result;
  }
}

// Helper function to create cache key from query parameters
export function buildCacheKey(
  entity: string,
  params: Record<string, unknown>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join("&");
  return `${entity}:${sortedParams}`;
}

// Pre-configured cache helpers for common entities
export function createProductCache(queryCache: QueryCache) {
  return {
    async getProducts(params: Record<string, unknown> = {}) {
      const key = buildCacheKey("products", params);
      return queryCache.cachedFindMany(key, async () => {
        const prisma = getPrisma({} as any);
        return prisma.product.findMany({
          where: params.where as never,
          include: {
            variants: true,
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { name: true, slug: true } },
            brand: { select: { name: true, slug: true } },
          },
          orderBy: params.orderBy as never,
          take: params.take as number | undefined,
          skip: params.skip as number | undefined,
        });
      }, { ttl: 120, tags: [CacheTags.PRODUCTS] });
    },

    async getProduct(id: string) {
      const key = CacheKeys.product(id);
      return queryCache.cachedFindUnique(key, async () => {
        const prisma = getPrisma({} as any);
        return prisma.product.findUnique({
          where: { id },
          include: {
            variants: true,
            images: { orderBy: { sortOrder: "asc" } },
            category: true,
            subcategory: true,
            collection: true,
            brand: true,
            sizeGuide: true,
            attributes: true,
            productTags: { include: { tag: true } },
            productLabels: { include: { label: true } },
          },
        });
      }, { ttl: 300, tags: [CacheTags.PRODUCTS] });
    },

    async invalidateProduct(id: string) {
      await queryCache.invalidate(CacheKeys.product(id));
      await queryCache.invalidateByTag(CacheTags.PRODUCTS);
    },
  };
}

export function createCategoryCache(queryCache: QueryCache) {
  return {
    async getCategories() {
      const key = CacheKeys.categories();
      return queryCache.cachedFindMany(key, async () => {
        const prisma = getPrisma({} as any);
        return prisma.category.findMany({
          where: { isActive: true },
          include: {
            subcategories: { where: { isActive: true } },
          },
          orderBy: { sortOrder: "asc" },
        });
      }, { ttl: 300, tags: [CacheTags.CATEGORIES] });
    },

    async getCategory(id: string) {
      const key = CacheKeys.category(id);
      return queryCache.cachedFindUnique(key, async () => {
        const prisma = getPrisma({} as any);
        return prisma.category.findUnique({
          where: { id },
          include: {
            subcategories: { where: { isActive: true } },
            products: {
              where: { isActive: true },
              include: {
                variants: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
              take: 20,
            },
          },
        });
      }, { ttl: 300, tags: [CacheTags.CATEGORIES] });
    },

    async invalidateCategory(id: string) {
      await queryCache.invalidate(CacheKeys.category(id));
      await queryCache.invalidateByTag(CacheTags.CATEGORIES);
    },
  };
}

export function createCollectionCache(queryCache: QueryCache) {
  return {
    async getCollections() {
      const key = CacheKeys.collections();
      return queryCache.cachedFindMany(key, async () => {
        const prisma = getPrisma({} as any);
        return prisma.collection.findMany({
          where: { isActive: true },
          include: {
            products: {
              where: { isActive: true },
              include: {
                variants: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
              take: 10,
            },
          },
          orderBy: { sortOrder: "asc" },
        });
      }, { ttl: 300, tags: [CacheTags.COLLECTIONS] });
    },

    async getCollection(id: string) {
      const key = CacheKeys.collection(id);
      return queryCache.cachedFindUnique(key, async () => {
        const prisma = getPrisma({} as any);
        return prisma.collection.findUnique({
          where: { id },
          include: {
            products: {
              where: { isActive: true },
              include: {
                variants: true,
                images: { orderBy: { sortOrder: "asc" } },
              },
            },
          },
        });
      }, { ttl: 300, tags: [CacheTags.COLLECTIONS] });
    },

    async invalidateCollection(id: string) {
      await queryCache.invalidate(CacheKeys.collection(id));
      await queryCache.invalidateByTag(CacheTags.COLLECTIONS);
    },
  };
}

export function createBrandCache(queryCache: QueryCache) {
  return {
    async getBrands() {
      const key = CacheKeys.brands();
      return queryCache.cachedFindMany(key, async () => {
        const prisma = getPrisma({} as any);
        return prisma.brand.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        });
      }, { ttl: 300, tags: [CacheTags.BRANDS] });
    },

    async getBrand(id: string) {
      const key = CacheKeys.brand(id);
      return queryCache.cachedFindUnique(key, async () => {
        const prisma = getPrisma({} as any);
        return prisma.brand.findUnique({
          where: { id },
          include: {
            products: {
              where: { isActive: true },
              include: {
                variants: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
              take: 20,
            },
          },
        });
      }, { ttl: 300, tags: [CacheTags.BRANDS] });
    },

    async invalidateBrand(id: string) {
      await queryCache.invalidate(CacheKeys.brand(id));
      await queryCache.invalidateByTag(CacheTags.BRANDS);
    },
  };
}

// Note: CMS cache helper should be added when CMS model is added to schema
// export function createCMSCache(queryCache: QueryCache) {
//   return {
//     async getPage(slug: string) {
//       const key = CacheKeys.cmsPage(slug);
//       return queryCache.cachedFindFirst(key, async () => {
//         const prisma = getPrisma({} as any);
//         return prisma.cmsPage.findUnique({
//           where: { slug },
//         });
//       }, { ttl: 600, tags: [CacheTags.CMS] });
//     },
//
//     async invalidatePage(slug: string) {
//       await queryCache.invalidate(CacheKeys.cmsPage(slug));
//       await queryCache.invalidateByTag(CacheTags.CMS);
//     },
//   };
// }
