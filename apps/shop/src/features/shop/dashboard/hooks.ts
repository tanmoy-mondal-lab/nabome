/**
 * Shop Dashboard Hooks
 *
 * Custom hooks for dashboard data fetching and state management
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api/client';

import type {
  DashboardData,
  RevenueSummary,
  OrdersSummary,
  EarningsSummary,
  InventoryAlert,
  ActivityEvent,
  PendingOrder,
} from '../shared/types';

// Dashboard data hook
export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      return api.get<DashboardData>('/api/v1/shop/dashboard');
    },
    refetchInterval: 30000, // 30 seconds auto-refresh
    staleTime: 15000, // 15 seconds considered fresh
  });
}

// Revenue summary hook
export function useRevenueSummary(
  period: 'today' | '7d' | '30d' | '90d' = 'today',
) {
  return useQuery({
    queryKey: ['revenue', period],
    queryFn: async (): Promise<RevenueSummary> => {
      return api.get<RevenueSummary>(
        `/api/v1/shop/analytics/revenue?period=${period}`,
      );
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  });
}

// Orders summary hook
export function useOrdersSummary() {
  return useQuery({
    queryKey: ['orders-summary'],
    queryFn: async (): Promise<OrdersSummary> => {
      return api.get<OrdersSummary>('/api/v1/shop/orders/summary');
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

// Earnings summary hook
export function useEarningsSummary() {
  return useQuery({
    queryKey: ['earnings'],
    queryFn: async (): Promise<EarningsSummary> => {
      return api.get<EarningsSummary>('/api/v1/shop/finance/earnings');
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  });
}

// Inventory alerts hook
export function useInventoryAlerts() {
  return useQuery({
    queryKey: ['inventory-alerts'],
    queryFn: async (): Promise<InventoryAlert[]> => {
      return api.get<InventoryAlert[]>('/api/v1/shop/inventory/alerts');
    },
    refetchInterval: 300000, // 5 minutes
    staleTime: 150000,
  });
}

// Recent activity hook
export function useRecentActivity() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: async (): Promise<ActivityEvent[]> => {
      return api.get<ActivityEvent[]>('/api/v1/shop/activity');
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

// Pending orders hook
export function usePendingOrders() {
  return useQuery({
    queryKey: ['pending-orders'],
    queryFn: async (): Promise<PendingOrder[]> => {
      return api.get<PendingOrder[]>(
        '/api/v1/shop/orders?status=pending&limit=5',
      );
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

// Performance metrics hook
export function usePerformanceMetrics() {
  return useQuery({
    queryKey: ['performance'],
    queryFn: async () => {
      return api.get('/api/v1/shop/analytics/performance');
    },
    refetchInterval: 120000,
    staleTime: 60000,
  });
}
