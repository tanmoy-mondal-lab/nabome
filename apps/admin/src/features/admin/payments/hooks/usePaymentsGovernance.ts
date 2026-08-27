/**
 * Payments Governance Hooks
 * Hooks for interacting with payments governance API
 */

import { useQuery } from '@tanstack/react-query';
import { paymentsGovernanceApi } from '../../../../lib/api/admin-api';

export function useSearchTransactions(query?: {
  search?: string;
  status?: string;
  provider?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['payments-transactions', query],
    queryFn: async () => {
      const response = await paymentsGovernanceApi.searchTransactions(query);
      return response.data;
    },
  });
}

export function useSettlements(query?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['payments-settlements', query],
    queryFn: async () => {
      const response = await paymentsGovernanceApi.getSettlements(query);
      return response.data;
    },
  });
}

export function useRefunds(query?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['payments-refunds', query],
    queryFn: async () => {
      const response = await paymentsGovernanceApi.getRefunds(query);
      return response.data;
    },
  });
}

export function useFinancialExceptions(query?: {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['payments-exceptions', query],
    queryFn: async () => {
      const response =
        await paymentsGovernanceApi.getFinancialExceptions(query);
      return response.data;
    },
  });
}

export function usePaymentProviderHealth() {
  return useQuery({
    queryKey: ['payment-provider-health'],
    queryFn: async () => {
      const response = await paymentsGovernanceApi.getProviderHealth();
      return response.data;
    },
  });
}
