/**
 * Shop Settings Hooks
 *
 * Custom hooks for shop settings management
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api/client';

// Shop settings hook
export function useShopSettings() {
  return useQuery({
    queryKey: ['shop-settings'],
    queryFn: async () => {
      return api.get('/api/v1/shop/settings');
    },
  });
}

// Update shop settings mutation
export function useUpdateShopSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return api.patch('/api/v1/shop/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-settings'] });
    },
  });
}

// Shipping settings hook
export function useShippingSettings() {
  return useQuery({
    queryKey: ['shipping-settings'],
    queryFn: async () => {
      return api.get('/api/v1/shop/settings/shipping');
    },
  });
}

// Tax settings hook
export function useTaxSettings() {
  return useQuery({
    queryKey: ['tax-settings'],
    queryFn: async () => {
      return api.get('/api/v1/shop/settings/tax');
    },
  });
}

// Notification settings hook
export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      return api.get('/api/v1/shop/settings/notifications');
    },
  });
}

// Staff members hook
export function useStaffMembers() {
  return useQuery({
    queryKey: ['staff-members'],
    queryFn: async () => {
      return api.get('/api/v1/shop/settings/staff');
    },
  });
}
