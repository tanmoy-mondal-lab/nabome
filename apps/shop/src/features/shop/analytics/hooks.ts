/**
 * Shop Analytics Hooks
 *
 * Custom hooks for analytics data fetching
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useQuery } from '@tanstack/react-query';

const API_BASE = '/api/v1/shop/analytics';

// Sales analytics hook
export function useSalesAnalytics(period: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['sales-analytics', period],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/sales?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales analytics');
      }
      return response.json();
    },
  });
}

// Product analytics hook
export function useProductAnalytics() {
  return useQuery({
    queryKey: ['product-analytics'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch product analytics');
      }
      return response.json();
    },
  });
}

// Inventory analytics hook
export function useInventoryAnalytics() {
  return useQuery({
    queryKey: ['inventory-analytics'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/inventory`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory analytics');
      }
      return response.json();
    },
  });
}

// Payment analytics hook
export function usePaymentAnalytics() {
  return useQuery({
    queryKey: ['payment-analytics'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/payments`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment analytics');
      }
      return response.json();
    },
  });
}

// Shipping analytics hook
export function useShippingAnalytics() {
  return useQuery({
    queryKey: ['shipping-analytics'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/shipping`);
      if (!response.ok) {
        throw new Error('Failed to fetch shipping analytics');
      }
      return response.json();
    },
  });
}

// Returns analytics hook
export function useReturnsAnalytics() {
  return useQuery({
    queryKey: ['returns-analytics'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/returns`);
      if (!response.ok) {
        throw new Error('Failed to fetch returns analytics');
      }
      return response.json();
    },
  });
}

// Customer analytics hook
export function useCustomerAnalytics() {
  return useQuery({
    queryKey: ['customer-analytics'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/customers`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer analytics');
      }
      return response.json();
    },
  });
}
