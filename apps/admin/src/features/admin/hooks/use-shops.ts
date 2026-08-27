/**
 * Shop Management Hook
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { shopManagementApi } from '@/lib/api/admin-api';
import { useAdminStore } from '@/stores/admin-store';
import type { Shop } from '@/types/admin';

export function useShops(query?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const { setShops, setError, setLoading } = useAdminStore();
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['shops', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await shopManagementApi.listShops(query);
        if (response.success && response.data) {
          setShops(response.data);
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch shops');
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to fetch shops',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });

  const approveShop = useMutation({
    mutationFn: async (shopId: string) => {
      const response = await shopManagementApi.approveShop(shopId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to approve shop');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });

  const suspendShop = useMutation({
    mutationFn: async ({
      shopId,
      reason,
    }: {
      shopId: string;
      reason: string;
    }) => {
      const response = await shopManagementApi.suspendShop(shopId, reason);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to suspend shop');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });

  const activateShop = useMutation({
    mutationFn: async (shopId: string) => {
      const response = await shopManagementApi.activateShop(shopId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to activate shop');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });

  const verifyShop = useMutation({
    mutationFn: async (shopId: string) => {
      const response = await shopManagementApi.verifyShop(shopId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to verify shop');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });

  return {
    ...result,
    approveShop,
    suspendShop,
    activateShop,
    verifyShop,
  };
}

export function useShop(shopId: string) {
  const { setSelectedShop, setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['shop', shopId],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await shopManagementApi.getShop(shopId);
        if (response.success && response.data) {
          setSelectedShop(response.data);
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch shop');
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to fetch shop',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!shopId,
  });
}

export function useShopPerformance(shopId: string, period: string) {
  return useQuery({
    queryKey: ['shop-performance', shopId, period],
    queryFn: async () => {
      const response = await shopManagementApi.getShopPerformance(
        shopId,
        period,
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || 'Failed to fetch shop performance',
      );
    },
    enabled: !!shopId && !!period,
  });
}

export function useShopAuditHistory(shopId: string) {
  return useQuery({
    queryKey: ['shop-audit-history', shopId],
    queryFn: async () => {
      const response = await shopManagementApi.getShopAuditHistory(shopId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || 'Failed to fetch shop audit history',
      );
    },
    enabled: !!shopId,
  });
}
