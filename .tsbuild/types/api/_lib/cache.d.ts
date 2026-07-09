import type { Env } from "./env.js";
interface CacheOptions {
    ttl?: number;
    tags?: string[];
    skipCache?: boolean;
}
export declare class CacheService {
    private env;
    constructor(env: Env);
    private isCloudflare;
    private getCacheKey;
    get(prefix: string, key: string): Promise<string | null>;
    set(prefix: string, key: string, value: string, options?: CacheOptions): Promise<void>;
    delete(prefix: string, key: string): Promise<void>;
    invalidateByTag(tag: string): Promise<void>;
    invalidateByPrefix(prefix: string): Promise<void>;
    clear(): Promise<void>;
}
export declare function withCache(cacheService: CacheService, prefix: string, key: string, options?: CacheOptions): (fetchFn: () => Promise<Response>) => Promise<Response>;
export declare const CacheKeys: {
    product: (id: string) => string;
    products: (params: string) => string;
    category: (id: string) => string;
    categories: () => string;
    collection: (id: string) => string;
    collections: () => string;
    brand: (id: string) => string;
    brands: () => string;
    cmsPage: (slug: string) => string;
    navigation: () => string;
    settings: () => string;
};
export declare const CacheTags: {
    PRODUCTS: string;
    CATEGORIES: string;
    COLLECTIONS: string;
    BRANDS: string;
    CMS: string;
    NAVIGATION: string;
    SETTINGS: string;
};
export {};
