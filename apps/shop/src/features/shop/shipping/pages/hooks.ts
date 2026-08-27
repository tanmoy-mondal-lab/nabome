/**
 * Shop Shipping Hooks
 *
 * Custom hooks for shipping data fetching and state management
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useQuery } from '@tanstack/react-query';

// API base URL - should be configured via environment
const API_BASE = '/api/v1';

// Shipments hook
export function useShipments(options?: { search?: string }) {
  return useQuery({
    queryKey: ['shipments', options?.search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.search) params.append('search', options.search);

      const response = await fetch(
        `${API_BASE}/shipments?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch shipments');
      }
      return response.json();
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  });
}

// Tracking timeline hook
export function useTrackingTimeline(shipmentId: string) {
  return useQuery({
    queryKey: ['tracking', shipmentId],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/shipments/${shipmentId}/tracking`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch tracking timeline');
      }
      return response.json();
    },
    enabled: !!shipmentId,
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
  });
}

// Carrier rates hook
export function useCarrierRates() {
  return useQuery({
    queryKey: ['carriers'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/carriers`);
      if (!response.ok) {
        throw new Error('Failed to fetch carriers');
      }
      return response.json();
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 150000,
  });
}

// Fulfillment queue hook
export function useFulfillmentQueue() {
  return useQuery({
    queryKey: ['fulfillment-queue'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/fulfillment/queue`);
      if (!response.ok) {
        throw new Error('Failed to fetch fulfillment queue');
      }
      return response.json();
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
  });
}
