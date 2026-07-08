// ─────────────────────────────────────────────────────────────
// CACHE PURGE UTILITY
// ─────────────────────────────────────────────────────────────
// Manages cache invalidation and purging
// ─────────────────────────────────────────────────────────────

export interface CachePurgeOptions {
  pattern?: string;
  tags?: string[];
  invalidateAll?: boolean;
}

export class CachePurgeManager {
  private cacheStore: Map<string, { value: any; tags: string[]; expiresAt: number }> = new Map();

  async purge(options: CachePurgeOptions = {}): Promise<{
    purged: number;
    errors: string[];
  }> {
    const purged: number[] = [];
    const errors: string[] = [];

    try {
      if (options.invalidateAll) {
        const count = this.cacheStore.size;
        this.cacheStore.clear();
        purged.push(count);
      } else if (options.tags) {
        for (const [key, value] of this.cacheStore.entries()) {
          if (options.tags.some((tag) => value.tags.includes(tag))) {
            this.cacheStore.delete(key);
            purged.push(1);
          }
        }
      } else if (options.pattern) {
        const regex = new RegExp(options.pattern);
        for (const [key] of this.cacheStore.entries()) {
          if (regex.test(key)) {
            this.cacheStore.delete(key);
            purged.push(1);
          }
        }
      }

      // In production, this would also purge CDN cache
      await this.purgeCDNCache(options);

      return {
        purged: purged.reduce((a, b) => a + b, 0),
        errors,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Unknown error");
      return {
        purged: purged.reduce((a, b) => a + b, 0),
        errors,
      };
    }
  }

  async purgeByPattern(pattern: string): Promise<number> {
    const result = await this.purge({ pattern });
    return result.purged;
  }

  async purgeByTags(tags: string[]): Promise<number> {
    const result = await this.purge({ tags });
    return result.purged;
  }

  async purgeByKey(key: string): Promise<boolean> {
    return this.cacheStore.delete(key);
  }

  async purgeAll(): Promise<number> {
    const result = await this.purge({ invalidateAll: true });
    return result.purged;
  }

  private async purgeCDNCache(options: CachePurgeOptions): Promise<void> {
    // In production, this would call Cloudflare API to purge CDN cache
    // For now, we'll just log
    console.log("CDN cache purge requested:", options);
  }

  getCacheStats(): {
    size: number;
    keys: string[];
    totalTags: string[];
  } {
    const keys = Array.from(this.cacheStore.keys());
    const allTags = Array.from(this.cacheStore.values()).flatMap((v) => v.tags);
    const uniqueTags = Array.from(new Set(allTags));

    return {
      size: this.cacheStore.size,
      keys,
      totalTags: uniqueTags,
    };
  }

  setCache(key: string, value: any, tags: string[] = [], ttl?: number): void {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : Number.MAX_SAFE_INTEGER;
    this.cacheStore.set(key, { value, tags, expiresAt });
  }

  getCache(key: string): any | null {
    const entry = this.cacheStore.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cacheStore.delete(key);
      return null;
    }
    
    return entry.value;
  }

  clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, value] of this.cacheStore.entries()) {
      if (now > value.expiresAt) {
        this.cacheStore.delete(key);
        cleared++;
      }
    }

    return cleared;
  }
}

export const cachePurgeManager = new CachePurgeManager();
