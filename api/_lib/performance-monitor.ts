// ─────────────────────────────────────────────────────────────
// PERFORMANCE MONITORING UTILITY
// ─────────────────────────────────────────────────────────────
// Track TTFB, LCP, CLS, FID, INP, API latency, database latency, cache hit ratio
// ─────────────────────────────────────────────────────────────

import { logger } from "./logger";

export interface PerformanceMetrics {
  ttfb?: number; // Time to First Byte (ms)
  lcp?: number; // Largest Contentful Paint (ms)
  cls?: number; // Cumulative Layout Shift
  fid?: number; // First Input Delay (ms)
  inp?: number; // Interaction to Next Paint (ms)
  apiLatency?: number; // Average API response time (ms)
  databaseLatency?: number; // Average database query time (ms)
  cacheHitRatio?: number; // Cache hit percentage (0-100)
  coldStarts?: number; // Number of cold starts
  errorRate?: number; // Error percentage (0-100)
  requestCount?: number; // Total requests
  timestamp: string;
}

export interface MetricBucket {
  count: number;
  sum: number;
  min: number;
  max: number;
}

export class PerformanceMonitor {
  private metrics: Map<string, MetricBucket> = new Map();
  private coldStartCount: number = 0;
  private requestCount: number = 0;
  private errorCount: number = 0;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private startTime: number = Date.now();

  constructor() {
    this.initializeBuckets();
  }

  private initializeBuckets(): void {
    const buckets = [
      'ttfb',
      'lcp',
      'cls',
      'fid',
      'inp',
      'apiLatency',
      'databaseLatency',
    ];

    for (const bucket of buckets) {
      this.metrics.set(bucket, { count: 0, sum: 0, min: Infinity, max: 0 });
    }
  }

  private getBucket(name: string): MetricBucket {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, { count: 0, sum: 0, min: Infinity, max: 0 });
    }
    return this.metrics.get(name)!;
  }

  recordMetric(name: string, value: number): void {
    const bucket = this.getBucket(name);
    bucket.count++;
    bucket.sum += value;
    bucket.min = Math.min(bucket.min, value);
    bucket.max = Math.max(bucket.max, value);
  }

  recordTTFB(ttfb: number): void {
    this.recordMetric('ttfb', ttfb);
    logger.debug('TTFB recorded', { ttfb });
  }

  recordLCP(lcp: number): void {
    this.recordMetric('lcp', lcp);
    logger.debug('LCP recorded', { lcp });
  }

  recordCLS(cls: number): void {
    this.recordMetric('cls', cls);
    logger.debug('CLS recorded', { cls });
  }

  recordFID(fid: number): void {
    this.recordMetric('fid', fid);
    logger.debug('FID recorded', { fid });
  }

  recordINP(inp: number): void {
    this.recordMetric('inp', inp);
    logger.debug('INP recorded', { inp });
  }

  recordAPILatency(latency: number): void {
    this.recordMetric('apiLatency', latency);
    logger.debug('API latency recorded', { latency });
  }

  recordDatabaseLatency(latency: number): void {
    this.recordMetric('databaseLatency', latency);
    logger.debug('Database latency recorded', { latency });
  }

  recordCacheHit(): void {
    this.cacheHits++;
  }

  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  recordColdStart(): void {
    this.coldStartCount++;
    logger.warn('Cold start detected');
  }

  recordRequest(): void {
    this.requestCount++;
  }

  recordError(): void {
    this.errorCount++;
  }

  getAverage(name: string): number {
    const bucket = this.metrics.get(name);
    if (!bucket || bucket.count === 0) return 0;
    return bucket.sum / bucket.count;
  }

  getCacheHitRatio(): number {
    const total = this.cacheHits + this.cacheMisses;
    if (total === 0) return 0;
    return (this.cacheHits / total) * 100;
  }

  getErrorRate(): number {
    if (this.requestCount === 0) return 0;
    return (this.errorCount / this.requestCount) * 100;
  }

  getMetrics(): PerformanceMetrics {
    return {
      ttfb: this.getAverage('ttfb'),
      lcp: this.getAverage('lcp'),
      cls: this.getAverage('cls'),
      fid: this.getAverage('fid'),
      inp: this.getAverage('inp'),
      apiLatency: this.getAverage('apiLatency'),
      databaseLatency: this.getAverage('databaseLatency'),
      cacheHitRatio: this.getCacheHitRatio(),
      coldStarts: this.coldStartCount,
      errorRate: this.getErrorRate(),
      requestCount: this.requestCount,
      timestamp: new Date().toISOString(),
    };
  }

  getBucketStats(name: string): MetricBucket | null {
    return this.metrics.get(name) || null;
  }

  reset(): void {
    this.initializeBuckets();
    this.coldStartCount = 0;
    this.requestCount = 0;
    this.errorCount = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.startTime = Date.now();
    logger.info('Performance metrics reset');
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  getPerformanceScore(): number {
    // Calculate overall performance score (0-100)
    const metrics = this.getMetrics();
    
    let score = 100;
    
    // TTFB: target < 2000ms
    if (metrics.ttfb && metrics.ttfb > 2000) {
      score -= Math.min(20, (metrics.ttfb - 2000) / 100);
    }
    
    // LCP: target < 2500ms
    if (metrics.lcp && metrics.lcp > 2500) {
      score -= Math.min(20, (metrics.lcp - 2500) / 100);
    }
    
    // CLS: target < 0.1
    if (metrics.cls && metrics.cls > 0.1) {
      score -= Math.min(15, (metrics.cls - 0.1) * 150);
    }
    
    // FID: target < 100ms
    if (metrics.fid && metrics.fid > 100) {
      score -= Math.min(15, (metrics.fid - 100) / 10);
    }
    
    // INP: target < 200ms
    if (metrics.inp && metrics.inp > 200) {
      score -= Math.min(15, (metrics.inp - 200) / 20);
    }
    
    // Error rate: target < 1%
    if (metrics.errorRate && metrics.errorRate > 1) {
      score -= Math.min(15, metrics.errorRate * 10);
    }
    
    return Math.max(0, Math.round(score));
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Web Vitals tracking for frontend
export function trackWebVitals(): void {
  if (typeof window === 'undefined') return;

  // TTFB
  if (performance.getEntriesByType) {
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart;
      performanceMonitor.recordTTFB(ttfb);
    }
  }

  // LCP
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          performanceMonitor.recordLCP(lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      logger.warn('Failed to observe LCP', { error: e });
    }
  }

  // CLS
  if ('PerformanceObserver' in window) {
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            performanceMonitor.recordCLS(entry.value);
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      logger.warn('Failed to observe CLS', { error: e });
    }
  }

  // FID
  if ('PerformanceObserver' in window) {
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          performanceMonitor.recordFID(entry.processingStart - entry.startTime);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      logger.warn('Failed to observe FID', { error: e });
    }
  }

  // INP
  if ('PerformanceObserver' in window) {
    try {
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          performanceMonitor.recordINP(entry.duration);
        }
      });
      inpObserver.observe({ entryTypes: ['event'] });
    } catch (e) {
      logger.warn('Failed to observe INP', { error: e });
    }
  }
}
