// ─────────────────────────────────────────────────────────────
// NABOME — API Caching Layer
// Supports Cloudflare KV for production and in-memory for development
// ─────────────────────────────────────────────────────────────

import type { Env } from "./env.js";

interface CacheEntry {
  value: string;
  expiresAt: number;
  tags?: string[];
}

interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 300)
  tags?: string[]; // Cache tags for invalidation
  skipCache?: boolean; // Force bypass cache
}

// In-memory cache for development
const memoryCache = new Map<string, CacheEntry>();

let lastMemoryCleanupAt = 0;

function cleanupExpiredMemoryEntries(now = Date.now()): void {
  if (now - lastMemoryCleanupAt < 60_000) return;
  lastMemoryCleanupAt = now;
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt < now) {
      memoryCache.delete(key);
    }
  }
}

export class CacheService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  private isCloudflare(): boolean {
    return this.env?.CACHE !== undefined;
  }

  private getCacheKey(prefix: string, key: string): string {
    return `${prefix}:${key}`;
  }

  async get(prefix: string, key: string): Promise<string | null> {
    const cacheKey = this.getCacheKey(prefix, key);

    if (this.isCloudflare() && this.env?.CACHE) {
      try {
        const value = await this.env.CACHE.get(cacheKey);
        return value;
      } catch (error) {
        console.error("Cache get error:", error);
        return null;
      }
    } else {
      cleanupExpiredMemoryEntries();
      const entry = memoryCache.get(cacheKey);
      if (!entry) return null;
      if (entry.expiresAt < Date.now()) {
        memoryCache.delete(cacheKey);
        return null;
      }
      return entry.value;
    }
  }

  async set(
    prefix: string,
    key: string,
    value: string,
    options: CacheOptions = {}
  ): Promise<void> {
    const cacheKey = this.getCacheKey(prefix, key);
    const ttl = options.ttl ?? 300; // Default 5 minutes
    const expiresAt = Date.now() + ttl * 1000;

    if (this.isCloudflare() && this.env?.CACHE) {
      try {
        await this.env.CACHE.put(cacheKey, value, {
          expirationTtl: ttl,
          metadata: { tags: options.tags ?? [] },
        });
      } catch (error) {
        console.error("Cache set error:", error);
      }
    } else {
      cleanupExpiredMemoryEntries();
      memoryCache.set(cacheKey, {
        value,
        expiresAt,
        tags: options.tags,
      });
    }
  }

  async delete(prefix: string, key: string): Promise<void> {
    const cacheKey = this.getCacheKey(prefix, key);

    if (this.isCloudflare() && this.env?.CACHE) {
      try {
        await this.env.CACHE.delete(cacheKey);
      } catch (error) {
        console.error("Cache delete error:", error);
      }
    } else {
      memoryCache.delete(cacheKey);
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    if (this.isCloudflare() && this.env?.CACHE) {
      try {
        const listed = await this.env.CACHE.list();
        for (const key of listed.keys) {
          const metadata = await this.env.CACHE.getMetadata(key.name);
          if (metadata?.tags?.includes(tag)) {
            await this.env.CACHE.delete(key.name);
          }
        }
      } catch (error) {
        console.error("Cache invalidation error:", error);
      }
    } else {
      for (const [key, entry] of memoryCache.entries()) {
        if (entry.tags?.includes(tag)) {
          memoryCache.delete(key);
        }
      }
    }
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    if (this.isCloudflare() && this.env?.CACHE) {
      try {
        const listed = await this.env.CACHE.list({ prefix: `${prefix}:` });
        for (const key of listed.keys) {
          await this.env.CACHE.delete(key.name);
        }
      } catch (error) {
        console.error("Cache invalidation error:", error);
      }
    } else {
      const prefixKey = `${prefix}:`;
      for (const key of memoryCache.keys()) {
        if (key.startsWith(prefixKey)) {
          memoryCache.delete(key);
        }
      }
    }
  }

  async clear(): Promise<void> {
    if (this.isCloudflare() && this.env?.CACHE) {
      try {
        const listed = await this.env.CACHE.list();
        for (const key of listed.keys) {
          await this.env.CACHE.delete(key.name);
        }
      } catch (error) {
        console.error("Cache clear error:", error);
      }
    } else {
      memoryCache.clear();
    }
  }
}

// Cache middleware for API responses
export function withCache(
  cacheService: CacheService,
  prefix: string,
  key: string,
  options: CacheOptions = {}
) {
  return async (
    fetchFn: () => Promise<Response>
  ): Promise<Response> => {
    if (options.skipCache) {
      return fetchFn();
    }

    // Try to get from cache
    const cached = await cacheService.get(prefix, key);
    if (cached) {
      return new Response(cached, {
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
          "Cache-Control": `public, max-age=${options.ttl ?? 300}`,
        },
      });
    }

    // Fetch and cache
    const response = await fetchFn();
    
    if (response.ok && response.headers.get("Content-Type")?.includes("json")) {
      const cloned = response.clone();
      const body = await cloned.text();
      await cacheService.set(prefix, key, body, options);
    }

    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-Cache", "MISS");
    return newResponse;
  };
}

// Cache key generators
export const CacheKeys = {
  product: (id: string) => `product:${id}`,
  products: (params: string) => `products:${params}`,
  category: (id: string) => `category:${id}`,
  categories: () => "categories",
  collection: (id: string) => `collection:${id}`,
  collections: () => "collections",
  brand: (id: string) => `brand:${id}`,
  brands: () => "brands",
  cmsPage: (slug: string) => `cms:page:${slug}`,
  navigation: () => "navigation",
  settings: () => "settings",
};

// Cache tags for invalidation
export const CacheTags = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  COLLECTIONS: "collections",
  BRANDS: "brands",
  CMS: "cms",
  NAVIGATION: "navigation",
  SETTINGS: "settings",
};
