/**
 * Returns Governance Hook
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { returnsGovernanceApi } from '@/lib/api/admin-api';
import { useAdminStore } from '@/stores/admin-store';

export function useReturnsQueue(query?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const { setReturnsQueue, setError, setLoading } = useAdminStore();
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['returns-queue', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await returnsGovernanceApi.getReturnsQueue(query);
        if (response.success && response.data) {
          setReturnsQueue(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch returns queue',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch returns queue',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });

  const overridePolicy = useMutation({
    mutationFn: async ({
      returnId,
      overrideReason,
    }: {
      returnId: string;
      overrideReason: string;
    }) => {
      const response = await returnsGovernanceApi.overridePolicy(
        returnId,
        overrideReason,
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to override policy');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns-queue'] });
    },
  });

  const resolveDispute = useMutation({
    mutationFn: async ({
      returnId,
      resolution,
    }: {
      returnId: string;
      resolution: string;
    }) => {
      const response = await returnsGovernanceApi.resolveDispute(
        returnId,
        resolution,
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to resolve dispute');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns-queue'] });
    },
  });

  const fraudReview = useMutation({
    mutationFn: async ({
      returnId,
      decision,
      notes,
    }: {
      returnId: string;
      decision: 'approve' | 'reject' | 'investigate';
      notes?: string;
    }) => {
      const response = await returnsGovernanceApi.fraudReview(
        returnId,
        decision,
        notes,
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || 'Failed to perform fraud review',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns-queue'] });
    },
  });

  return {
    ...result,
    overridePolicy,
    resolveDispute,
    fraudReview,
  };
}

export function useReturnGovernance(returnId: string) {
  const { setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['return-governance', returnId],
    queryFn: async () => {
      setLoading(true);
      try {
        const response =
          await returnsGovernanceApi.getReturnGovernance(returnId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch return governance',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch return governance',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!returnId,
  });
}
