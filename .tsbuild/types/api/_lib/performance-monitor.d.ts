export interface PerformanceMetrics {
    ttfb?: number;
    lcp?: number;
    cls?: number;
    fid?: number;
    inp?: number;
    apiLatency?: number;
    databaseLatency?: number;
    cacheHitRatio?: number;
    coldStarts?: number;
    errorRate?: number;
    requestCount?: number;
    timestamp: string;
}
export interface MetricBucket {
    count: number;
    sum: number;
    min: number;
    max: number;
}
export declare class PerformanceMonitor {
    private metrics;
    private coldStartCount;
    private requestCount;
    private errorCount;
    private cacheHits;
    private cacheMisses;
    private startTime;
    constructor();
    private initializeBuckets;
    private getBucket;
    recordMetric(name: string, value: number): void;
    recordTTFB(ttfb: number): void;
    recordLCP(lcp: number): void;
    recordCLS(cls: number): void;
    recordFID(fid: number): void;
    recordINP(inp: number): void;
    recordAPILatency(latency: number): void;
    recordDatabaseLatency(latency: number): void;
    recordCacheHit(): void;
    recordCacheMiss(): void;
    recordColdStart(): void;
    recordRequest(): void;
    recordError(): void;
    getAverage(name: string): number;
    getCacheHitRatio(): number;
    getErrorRate(): number;
    getMetrics(): PerformanceMetrics;
    getBucketStats(name: string): MetricBucket | null;
    reset(): void;
    getUptime(): number;
    getPerformanceScore(): number;
}
export declare const performanceMonitor: PerformanceMonitor;
export declare function trackWebVitals(): void;
