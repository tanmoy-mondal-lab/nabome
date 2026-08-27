/**
 * Returns Governance Hooks
 * Hooks for interacting with returns governance API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { returnsGovernanceApi } from '../../../../lib/api/admin-api';

export function useReturnsQueue(query?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['returns-queue', query],
    queryFn: async () => {
      const response = await returnsGovernanceApi.getReturnsQueue(query);
      return response.data;
    },
  });
}

export function useDisputes(query?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['returns-disputes', query],
    queryFn: async () => {
      const response = await returnsGovernanceApi.getDisputes(query);
      return response.data;
    },
  });
}

export function useFraudReview(query?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['returns-fraud-review', query],
    queryFn: async () => {
      const response = await returnsGovernanceApi.getFraudReview(query);
      return response.data;
    },
  });
}

export function useOverridePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ returnId, reason }: { returnId: string; reason: string }) =>
      returnsGovernanceApi.overridePolicy(returnId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns-queue'] });
      queryClient.invalidateQueries({ queryKey: ['returns-disputes'] });
    },
  });
}
