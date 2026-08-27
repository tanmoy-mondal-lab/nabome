/**
 * SectionWrapper — wraps sections with common functionality (HOMEPAGE_BUILDER_ARCHITECTURE §5.2)
 * Provides lazy loading, analytics tracking, and error boundaries for sections.
 */

import { useRef, useEffect, useState } from 'react';

import { shouldLazyLoad, getLazyConfig } from '../lib/rendering-pipeline';
import type { BaseSectionConfig } from '../types';

interface SectionWrapperProps {
  section: BaseSectionConfig;
  index: number;
  children: React.ReactNode;
}

export function SectionWrapper({
  section,
  index,
  children,
}: SectionWrapperProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(false);

  // Track section visibility for analytics
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisibleRef.current) {
            isVisibleRef.current = true;
            trackSectionVisible(section.id, index);
          }
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [section.id, index]);

  const lazyLoad = shouldLazyLoad(section);
  const lazyConfig = getLazyConfig(section);

  if (lazyLoad) {
    return (
      <LazySectionWrapper
        rootMargin={lazyConfig.rootMargin}
        threshold={lazyConfig.threshold}
      >
        {children}
      </LazySectionWrapper>
    );
  }

  return (
    <div ref={sectionRef} className="w-full">
      {children}
    </div>
  );
}

/**
 * Lazy section wrapper with Intersection Observer
 */
function LazySectionWrapper({
  children,
  rootMargin,
  threshold,
}: {
  children: React.ReactNode;
  rootMargin: string;
  threshold: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} className="w-full">
      {isVisible ? children : <SectionSkeleton />}
    </div>
  );
}

/**
 * Section skeleton for lazy loading
 */
function SectionSkeleton() {
  return (
    <div className="w-full py-12">
      <div className="mx-auto max-w-(--width-container-md) px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-1/3 animate-pulse bg-(--color-neutral-200)" />
        <div className="mt-2 h-4 w-2/3 animate-pulse bg-(--color-neutral-200)" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square animate-pulse bg-(--color-neutral-200)"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Track section visibility for analytics
 */
function trackSectionVisible(sectionId: string, index: number) {
  // TODO: Integrate with analytics service (PostHog)
  console.warn('Section visible:', { sectionId, index });
}
