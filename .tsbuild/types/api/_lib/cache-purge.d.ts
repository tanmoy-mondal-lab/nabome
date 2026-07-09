export interface CachePurgeOptions {
    pattern?: string;
    tags?: string[];
    invalidateAll?: boolean;
}
export declare class CachePurgeManager {
    private cacheStore;
    purge(options?: CachePurgeOptions): Promise<{
        purged: number;
        errors: string[];
    }>;
    purgeByPattern(pattern: string): Promise<number>;
    purgeByTags(tags: string[]): Promise<number>;
    purgeByKey(key: string): Promise<boolean>;
    purgeAll(): Promise<number>;
    private purgeCDNCache;
    getCacheStats(): {
        size: number;
        keys: string[];
        totalTags: string[];
    };
    setCache(key: string, value: any, tags?: string[], ttl?: number): void;
    getCache(key: string): any | null;
    clearExpired(): number;
}
export declare const cachePurgeManager: CachePurgeManager;
