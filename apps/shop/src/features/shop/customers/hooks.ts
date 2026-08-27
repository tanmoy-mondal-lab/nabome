/**
 * Shop Customer Management Hooks
 *
 * Custom hooks for customer management operations
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api/client';

// Customer list hook
export function useShopCustomers(
  query: {
    search?: string;
    segment?: string;
    limit?: number;
    offset?: number;
  } = {},
) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, String(value));
    }
  });

  return useQuery({
    queryKey: ['shop-customers', query],
    queryFn: async () => {
      return api.get(`/api/v1/shop/customers?${params.toString()}`);
    },
  });
}

// Single customer hook
export function useShopCustomer(customerId: string) {
  return useQuery({
    queryKey: ['shop-customer', customerId],
    queryFn: async () => {
      return api.get(`/api/v1/shop/customers/${customerId}`);
    },
    enabled: !!customerId,
  });
}

// Customer purchase history hook
export function useCustomerPurchaseHistory(customerId: string) {
  return useQuery({
    queryKey: ['customer-history', customerId],
    queryFn: async () => {
      return api.get(`/api/v1/shop/customers/${customerId}/orders`);
    },
    enabled: !!customerId,
  });
}

// Add customer note mutation
export function useAddCustomerNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      note,
    }: {
      customerId: string;
      note: string;
    }) => {
      return api.post(`/api/v1/shop/customers/${customerId}/notes`, { note });
    },
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({
        queryKey: ['shop-customer', customerId],
      });
    },
  });
}

// Customer segments hook
export function useCustomerSegments() {
  return useQuery({
    queryKey: ['customer-segments'],
    queryFn: async () => {
      return api.get('/api/v1/shop/customers/segments');
    },
  });
}
