/**
 * Shop Finance Hooks
 *
 * Custom hooks for finance data fetching and state management
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../lib/api/client';

// Earnings summary hook
export function useEarningsSummary() {
  return useQuery({
    queryKey: ['earnings'],
    queryFn: async () => {
      return api.get('/api/v1/shop/finance/earnings');
    },
    refetchInterval: 120000, // 2 minutes
    staleTime: 60000,
  });
}

// Settlements hook
export function useSettlements(options?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { status, page = 1, limit = 20 } = options || {};
  return useQuery({
    queryKey: ['settlements', status, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      return api.get(`/api/v1/shop/finance/settlements?${params.toString()}`);
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  });
}

// Transactions hook
export function useTransactions(options?: { page?: number; limit?: number }) {
  const { page = 1, limit = 20 } = options || {};
  return useQuery({
    queryKey: ['transactions', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      return api.get(`/api/v1/shop/finance/records?${params.toString()}`);
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000,
  });
}

// Refund queue hook
export function useRefundQueue() {
  return useQuery({
    queryKey: ['refund-queue'],
    queryFn: async () => {
      return api.get('/api/v1/shop/refunds/queue');
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000,
  });
}
