/**
 * Analytics Hooks
 * Hooks for interacting with analytics API
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../../../lib/api/admin-api';

export function useCommerceAnalytics(query?: {
  startDate?: string;
  endDate?: string;
  period?: string;
}) {
  return useQuery({
    queryKey: ['analytics-commerce', query],
    queryFn: async () => {
      const response = await analyticsApi.getCommerceAnalytics(query);
      return response.data;
    },
  });
}

export function useOperationalAnalytics(query?: {
  startDate?: string;
  endDate?: string;
  period?: string;
}) {
  return useQuery({
    queryKey: ['analytics-operational', query],
    queryFn: async () => {
      const response = await analyticsApi.getOperationalAnalytics(query);
      return response.data;
    },
  });
}

export function useSecurityAnalytics(query?: {
  startDate?: string;
  endDate?: string;
  period?: string;
}) {
  return useQuery({
    queryKey: ['analytics-security', query],
    queryFn: async () => {
      const response = await analyticsApi.getSecurityAnalytics(query);
      return response.data;
    },
  });
}

export function usePerformanceAnalytics(query?: {
  startDate?: string;
  endDate?: string;
  period?: string;
}) {
  return useQuery({
    queryKey: ['analytics-performance', query],
    queryFn: async () => {
      const response = await analyticsApi.getPerformanceAnalytics(query);
      return response.data;
    },
  });
}

export function useCustomerAnalytics(query?: {
  startDate?: string;
  endDate?: string;
  segment?: string;
}) {
  return useQuery({
    queryKey: ['analytics-customer', query],
    queryFn: async () => {
      const response = await analyticsApi.getCustomerAnalytics(query);
      return response.data;
    },
  });
}

export function useShopAnalytics(query?: {
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['analytics-shop', query],
    queryFn: async () => {
      const response = await analyticsApi.getShopAnalytics(query);
      return response.data;
    },
  });
}
