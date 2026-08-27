/**
 * Product Governance Hook
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { productGovernanceApi } from '@/lib/api/admin-api';
import { useAdminStore } from '@/stores/admin-store';

export function useProductSearch(query?: {
  search?: string;
  status?: string;
  shopId?: string;
  page?: number;
  limit?: number;
}) {
  const { setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['products-search', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await productGovernanceApi.searchProducts(query);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to search products');
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to search products',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}

export function useModerationQueue(query?: { page?: number; limit?: number }) {
  const { setModerationQueue, setError, setLoading } = useAdminStore();
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['moderation-queue', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await productGovernanceApi.getModerationQueue(query);
        if (response.success && response.data) {
          setModerationQueue(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch moderation queue',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch moderation queue',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });

  const approveProduct = useMutation({
    mutationFn: async (productId: string) => {
      const response = await productGovernanceApi.approveProduct(productId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to approve product');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
    },
  });

  const rejectProduct = useMutation({
    mutationFn: async ({
      productId,
      reason,
    }: {
      productId: string;
      reason: string;
    }) => {
      const response = await productGovernanceApi.rejectProduct(
        productId,
        reason,
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to reject product');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
    },
  });

  const bulkModerate = useMutation({
    mutationFn: async (params: {
      productIds: string[];
      action: 'approve' | 'reject';
      reason?: string;
    }) => {
      const response = await productGovernanceApi.bulkModerate(
        params.productIds,
        params.action,
        params.reason,
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || 'Failed to bulk moderate products',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
    },
  });

  return {
    ...result,
    approveProduct,
    rejectProduct,
    bulkModerate,
  };
}

export function useFlaggedProducts(query?: { page?: number; limit?: number }) {
  const { setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['flagged-products', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await productGovernanceApi.getFlaggedProducts(query);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch flagged products',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch flagged products',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}
