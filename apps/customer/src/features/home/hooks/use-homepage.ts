/**
 * useHomepage — fetches and manages homepage configuration (HOMEPAGE_BUILDER_ARCHITECTURE §4.4)
 * Implements caching, background refresh, and error recovery.
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { appConfig } from '@/lib/config';

import { processHomepageConfig } from '../lib/rendering-pipeline';
import { updateHomepageMetadata } from '../lib/seo';
import type { HomepageConfig } from '../types';

/**
 * Homepage API endpoint
 */
const HOMEPAGE_API_URL = `${appConfig.PUBLIC_API_URL}/api/v1/homepage`;

/**
 * Fetch homepage configuration from CMS
 */
async function fetchHomepageConfig(): Promise<HomepageConfig> {
  const response = await fetch(HOMEPAGE_API_URL, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch homepage: ${response.statusText}`);
  }

  return response.json();
}

/**
 * React Query hook for homepage configuration
 * Implements caching, stale-while-revalidate, and background refresh
 */
export function useHomepage() {
  return useQuery({
    queryKey: ['homepage'],
    queryFn: fetchHomepageConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for processed homepage configuration
 * Applies visibility and scheduling rules
 */
export function useProcessedHomepage() {
  const { data, isLoading, error, refetch } = useHomepage();

  // Update SEO metadata when config is loaded
  useEffect(() => {
    if (data) {
      updateHomepageMetadata(data);
    }
  }, [data]);

  const processedConfig = data
    ? processHomepageConfig(data, {
        device: getCurrentDevice(),
        timestamp: new Date(),
      })
    : null;

  return {
    config: processedConfig,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Get current device type based on viewport
 */
function getCurrentDevice(): 'mobile' | 'tablet' | 'desktop' | 'wide' {
  if (typeof window === 'undefined') {
    return 'mobile';
  }

  const width = window.innerWidth;

  if (width < 640) {
    return 'mobile';
  }
  if (width < 1024) {
    return 'tablet';
  }
  if (width < 1280) {
    return 'desktop';
  }
  return 'wide';
}
