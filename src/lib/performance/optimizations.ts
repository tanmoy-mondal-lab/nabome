/**
 * Performance Optimization Utilities
 * Provides utilities for optimizing media loading, CMS queries, Cloudinary operations, and caching.
 */

// Cloudinary transformation presets for optimization
export const CLOUDINARY_TRANSFORMS = {
  // Responsive image breakpoints
  breakpoints: [320, 480, 640, 768, 1024, 1280, 1536, 1920],
  
  // Quality presets
  quality: {
    low: 60,
    medium: 75,
    high: 85,
    ultra: 95,
  },
  
  // Format presets (WebP for modern browsers)
  format: 'auto',
  
  // Common transformations
  thumbnail: { width: 200, height: 200, crop: 'fill', quality: 75, format: 'auto' },
  small: { width: 400, height: 400, crop: 'fill', quality: 75, format: 'auto' },
  medium: { width: 800, height: 800, crop: 'fill', quality: 80, format: 'auto' },
  large: { width: 1200, height: 1200, crop: 'fill', quality: 85, format: 'auto' },
  hero: { width: 1920, height: 1080, crop: 'fill', quality: 85, format: 'auto' },
  original: { quality: 90, format: 'auto' },
};

/**
 * Generates Cloudinary URL with optimizations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    crop?: string;
    fetchFormat?: string;
  } = {}
): string {
  const {
    width,
    height,
    quality = CLOUDINARY_TRANSFORMS.quality.medium,
    crop = 'fill',
    fetchFormat = 'auto',
  } = options;

  const transformations = [
    `q_${quality}`,
    `f_${fetchFormat}`,
  ];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);

  const transformString = transformations.join(',');
  
  return `https://res.cloudinary.com/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
}

/**
 * Generates responsive image srcset
 */
export function generateSrcSet(
  publicId: string,
  baseWidth: number,
  baseHeight?: number
): string {
  return CLOUDINARY_TRANSFORMS.breakpoints
    .map((breakpoint) => {
      const width = Math.min(breakpoint, baseWidth);
      const height = baseHeight ? Math.round((baseHeight * width) / baseWidth) : undefined;
      const url = getOptimizedImageUrl(publicId, { width, height });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Lazy loading intersection observer
 */
export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private elements: Set<Element> = new Set();

  constructor(options: IntersectionObserverInit = {}) {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target;
              this.loadElement(element);
              this.observer?.unobserve(element);
              this.elements.delete(element);
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.01,
          ...options,
        }
      );
    }
  }

  observe(element: Element): void {
    if (this.observer) {
      this.observer.observe(element);
      this.elements.add(element);
    } else {
      // Fallback: load immediately if IntersectionObserver not available
      this.loadElement(element);
    }
  }

  private loadElement(element: Element): void {
    if (element instanceof HTMLImageElement) {
      const src = element.dataset.src;
      if (src) {
        element.src = src;
        element.removeAttribute('data-src');
      }
      const srcset = element.dataset.srcset;
      if (srcset) {
        element.srcset = srcset;
        element.removeAttribute('data-srcset');
      }
    }
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.elements.clear();
  }
}

/**
 * Simple in-memory cache with TTL
 */
export class Cache<T> {
  private cache: Map<string, { value: T; expiresAt: number }> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl ?? this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Query optimization utilities
 */
export const QueryOptimizer = {
  /**
   * Debounce function to limit rapid calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function to limit call frequency
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Batch multiple operations
   */
  async batch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }
    
    return results;
  },
};

/**
 * Image preloader
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  const promises = urls.map((url) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Resolve even on error to not block
      img.src = url;
    });
  });

  return Promise.all(promises);
}

/**
 * Critical CSS extraction helper
 */
export function extractCriticalCSS(css: string, selectors: string[]): string {
  const rules = css.match(/[^{}]+\{[^{}]*\}/g) || [];
  const criticalRules = rules.filter((rule) => {
    const selector = rule.split('{')[0].trim();
    return selectors.some((criticalSelector) => 
      selector.includes(criticalSelector) || criticalSelector.includes(selector)
    );
  });
  
  return criticalRules.join('\n');
}

/**
 * Resource hints generator
 */
export function generateResourceHints(resources: {
  preconnect?: string[];
  dnsPrefetch?: string[];
  preload?: Array<{ href: string; as: string; type?: string }>;
  prefetch?: Array<{ href: string; as?: string }>;
}): string {
  const hints: string[] = [];

  if (resources.preconnect) {
    resources.preconnect.forEach((href) => {
      hints.push(`<link rel="preconnect" href="${href}" />`);
    });
  }

  if (resources.dnsPrefetch) {
    resources.dnsPrefetch.forEach((href) => {
      hints.push(`<link rel="dns-prefetch" href="${href}" />`);
    });
  }

  if (resources.preload) {
    resources.preload.forEach(({ href, as, type }) => {
      const typeAttr = type ? ` type="${type}"` : '';
      hints.push(`<link rel="preload" href="${href}" as="${as}"${typeAttr} />`);
    });
  }

  if (resources.prefetch) {
    resources.prefetch.forEach(({ href, as }) => {
      const asAttr = as ? ` as="${as}"` : '';
      hints.push(`<link rel="prefetch" href="${href}"${asAttr} />`);
    });
  }

  return hints.join('\n');
}

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitor = {
  /**
   * Measure performance of a function
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name,
        value: Math.round(duration),
        event_category: 'Performance',
      });
    }
    
    return { result, duration };
  },

  /**
   * Log Core Web Vitals
   */
  logCoreWebVitals(metric: {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
  }): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_category: 'Web Vitals',
        event_label: metric.rating,
        non_interaction: true,
      });
    }
  },
};
