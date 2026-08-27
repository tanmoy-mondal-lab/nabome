/**
 * Order Governance Hook
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { orderGovernanceApi } from '@/lib/api/admin-api';
import { useAdminStore } from '@/stores/admin-store';

export function useOrderSearch(query?: {
  search?: string;
  status?: string;
  shopId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}) {
  const { setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['orders-search', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await orderGovernanceApi.searchOrders(query);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to search orders');
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to search orders',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}

export function useExceptionQueue(query?: { page?: number; limit?: number }) {
  const { setExceptionQueue, setError, setLoading } = useAdminStore();
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['exception-queue', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await orderGovernanceApi.getExceptionQueue(query);
        if (response.success && response.data) {
          setExceptionQueue(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch exception queue',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch exception queue',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });

  const addOperationalNote = useMutation({
    mutationFn: async ({
      orderId,
      note,
      isInternal,
    }: {
      orderId: string;
      note: string;
      isInternal?: boolean;
    }) => {
      const response = await orderGovernanceApi.addOperationalNote(
        orderId,
        note,
        isInternal,
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || 'Failed to add operational note',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exception-queue'] });
    },
  });

  const manualIntervention = useMutation({
    mutationFn: async ({
      orderId,
      action,
      reason,
    }: {
      orderId: string;
      action: string;
      reason: string;
    }) => {
      const response = await orderGovernanceApi.manualIntervention(
        orderId,
        action,
        reason,
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || 'Failed to perform manual intervention',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exception-queue'] });
    },
  });

  return {
    ...result,
    addOperationalNote,
    manualIntervention,
  };
}

export function useOrderGovernance(orderId: string) {
  const { setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['order-governance', orderId],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await orderGovernanceApi.getOrderGovernance(orderId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch order governance',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch order governance',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!orderId,
  });
}
