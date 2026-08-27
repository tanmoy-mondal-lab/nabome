/**
 * Performance utilities following FRONTEND_PERFORMANCE_SEO_PRODUCTION_READINESS_SPECIFICATION.md
 *
 * Features:
 * - Lazy loading helpers
 * - Image optimization hints
 * - Resource preloading
 * - Performance monitoring
 */

/**
 * Lazy loads an image with intersection observer
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  options?: IntersectionObserverInit,
): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          img.loading = 'lazy';
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: '50px', ...options },
  );

  observer.observe(img);
}

/**
 * Preloads a resource
 */
export function preloadResource(
  href: string,
  as: 'script' | 'style' | 'font' | 'image',
): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Preconnects to a domain
 */
export function preconnectToDomain(domain: string): void {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;
  document.head.appendChild(link);
}

/**
 * Measures performance metrics
 */
export function measurePerformance(name: string, fn: () => void): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`${name}-start`);
    fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  } else {
    fn();
  }
}

/**
 * Reports Core Web Vitals
 */
export function reportCoreWebVitals(): void {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      new PerformanceObserver(() => {
        // LCP tracking can be added here
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // FID (First Input Delay)
    if ('PerformanceObserver' in window) {
      new PerformanceObserver(() => {
        // FID tracking can be added here
      }).observe({ entryTypes: ['first-input'] });
    }

    // CLS (Cumulative Layout Shift)
    if ('PerformanceObserver' in window) {
      new PerformanceObserver(() => {
        // CLS tracking can be added here
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }
}
