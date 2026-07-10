/**
 * Performance Optimization Utilities
 * Provides utilities for optimizing media loading, CMS queries, Cloudinary operations, and caching.
 */
export declare const CLOUDINARY_TRANSFORMS: {
    breakpoints: number[];
    quality: {
        low: number;
        medium: number;
        high: number;
        ultra: number;
    };
    format: string;
    thumbnail: {
        width: number;
        height: number;
        crop: string;
        quality: number;
        format: string;
    };
    small: {
        width: number;
        height: number;
        crop: string;
        quality: number;
        format: string;
    };
    medium: {
        width: number;
        height: number;
        crop: string;
        quality: number;
        format: string;
    };
    large: {
        width: number;
        height: number;
        crop: string;
        quality: number;
        format: string;
    };
    hero: {
        width: number;
        height: number;
        crop: string;
        quality: number;
        format: string;
    };
    original: {
        quality: number;
        format: string;
    };
};
/**
 * Generates Cloudinary URL with optimizations
 */
export declare function getOptimizedImageUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    crop?: string;
    fetchFormat?: string;
}): string;
/**
 * Generates responsive image srcset
 */
export declare function generateSrcSet(publicId: string, baseWidth: number, baseHeight?: number): string;
/**
 * Lazy loading intersection observer
 */
export declare class LazyLoader {
    private observer;
    private elements;
    constructor(options?: IntersectionObserverInit);
    observe(element: Element): void;
    private loadElement;
    disconnect(): void;
}
/**
 * Simple in-memory cache with TTL
 */
export declare class Cache<T> {
    private cache;
    private defaultTTL;
    constructor(defaultTTL?: number);
    set(key: string, value: T, ttl?: number): void;
    get(key: string): T | null;
    has(key: string): boolean;
    delete(key: string): void;
    clear(): void;
    cleanup(): void;
}
/**
 * Query optimization utilities
 */
export declare const QueryOptimizer: {
    /**
     * Debounce function to limit rapid calls
     */
    debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
    /**
     * Throttle function to limit call frequency
     */
    throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
    /**
     * Batch multiple operations
     */
    batch<T, R>(items: T[], processor: (item: T) => Promise<R>, batchSize?: number): Promise<R[]>;
};
/**
 * Image preloader
 */
export declare function preloadImages(urls: string[]): Promise<void[]>;
/**
 * Critical CSS extraction helper
 */
export declare function extractCriticalCSS(css: string, selectors: string[]): string;
/**
 * Resource hints generator
 */
export declare function generateResourceHints(resources: {
    preconnect?: string[];
    dnsPrefetch?: string[];
    preload?: Array<{
        href: string;
        as: string;
        type?: string;
    }>;
    prefetch?: Array<{
        href: string;
        as?: string;
    }>;
}): string;
/**
 * Performance monitoring utilities
 */
export declare const PerformanceMonitor: {
    /**
     * Measure performance of a function
     */
    measure<T>(name: string, fn: () => Promise<T>): Promise<{
        result: T;
        duration: number;
    }>;
    /**
     * Log Core Web Vitals
     */
    logCoreWebVitals(metric: {
        name: string;
        value: number;
        rating: "good" | "needs-improvement" | "poor";
    }): void;
};
