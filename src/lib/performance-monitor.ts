/**
 * Performance Monitoring Utility
 * Tracks Core Web Vitals and custom performance metrics
 */

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  loadTime: number; // Page load time
  domContentLoaded: number; // DOM Content Loaded time
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  init() {
    if (typeof window === 'undefined' || !window.performance) return;

    // Measure TTFB
    this.measureTTFB();

    // Measure page load metrics
    this.measurePageLoad();

    // Observe Core Web Vitals
    this.observeFCP();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
  }

  private measureTTFB() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
    }
  }

  private measurePageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
    }
  }

  private observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime;
          this.logMetric('FCP', this.metrics.fcp);
        }
      });
      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn('FCP observation not supported');
    }
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1] as PerformanceEntry;
        if (lcpEntry) {
          this.metrics.lcp = lcpEntry.startTime;
          this.logMetric('LCP', this.metrics.lcp);
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn('LCP observation not supported');
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fidEntry = entries[0] as PerformanceEntry;
        if (fidEntry) {
          this.metrics.fid = (fidEntry as any).processingStart - fidEntry.startTime;
          this.logMetric('FID', this.metrics.fid);
        }
      });
      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn('FID observation not supported');
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cls = clsValue;
        this.logMetric('CLS', this.metrics.cls);
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      console.warn('CLS observation not supported');
    }
  }

  private logMetric(name: string, value: number) {
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
    }
    // Send to analytics in production
    if (import.meta.env.PROD && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        name,
        value: Math.round(value),
        event_category: 'Performance'
      });
    }
  }

  getMetrics(): PerformanceMetrics {
    return {
      fcp: this.metrics.fcp || 0,
      lcp: this.metrics.lcp || 0,
      fid: this.metrics.fid || 0,
      cls: this.metrics.cls || 0,
      ttfb: this.metrics.ttfb || 0,
      loadTime: this.metrics.loadTime || 0,
      domContentLoaded: this.metrics.domContentLoaded || 0,
    };
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();
