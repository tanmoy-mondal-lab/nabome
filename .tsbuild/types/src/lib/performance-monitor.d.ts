/**
 * Performance Monitoring Utility
 * Tracks Core Web Vitals and custom performance metrics
 */
export interface PerformanceMetrics {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
    loadTime: number;
    domContentLoaded: number;
}
declare class PerformanceMonitor {
    private metrics;
    private observers;
    init(): void;
    private measureTTFB;
    private measurePageLoad;
    private observeFCP;
    private observeLCP;
    private observeFID;
    private observeCLS;
    private logMetric;
    getMetrics(): PerformanceMetrics;
    destroy(): void;
}
export declare const performanceMonitor: PerformanceMonitor;
export {};
