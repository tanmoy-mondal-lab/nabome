/**
 * Shop CMS Hooks
 *
 * Custom hooks for CMS data fetching and state management
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useQuery } from '@tanstack/react-query';

// API base URL - should be configured via environment
const API_BASE = '/api/v1';

// Homepage sections hook
export function useHomepageSections() {
  return useQuery({
    queryKey: ['homepage-sections'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/cms/homepage/sections`);
      if (!response.ok) {
        throw new Error('Failed to fetch homepage sections');
      }
      return response.json();
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  });
}

// Featured products hook
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/cms/products/featured`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured products');
      }
      return response.json();
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  });
}

// Promotional banners hook
export function usePromotionalBanners() {
  return useQuery({
    queryKey: ['promotional-banners'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/cms/banners`);
      if (!response.ok) {
        throw new Error('Failed to fetch promotional banners');
      }
      return response.json();
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  });
}
