/**
 * Payments Governance Hook
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 */

import { useQuery } from '@tanstack/react-query';

import { paymentsGovernanceApi } from '@/lib/api/admin-api';
import { useAdminStore } from '@/stores/admin-store';

export function usePaymentProviders() {
  const { setPaymentProviders, setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['payment-providers'],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await paymentsGovernanceApi.getProviderHealth();
        if (response.success && response.data) {
          setPaymentProviders(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch payment providers',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch payment providers',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
}

export function useTransactionSearch(query?: {
  search?: string;
  status?: string;
  provider?: string;
  page?: number;
  limit?: number;
}) {
  const { setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['transactions-search', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await paymentsGovernanceApi.searchTransactions(query);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to search transactions',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to search transactions',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}

export function useSettlements(query?: { page?: number; limit?: number }) {
  const { setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['settlements', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await paymentsGovernanceApi.getSettlements(query);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch settlements',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch settlements',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}

export function useRefunds(query?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const { setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['refunds', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await paymentsGovernanceApi.getRefunds(query);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch refunds');
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to fetch refunds',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}

export function useFinancialExceptions(query?: {
  page?: number;
  limit?: number;
}) {
  const { setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['financial-exceptions', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response =
          await paymentsGovernanceApi.getFinancialExceptions(query);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch financial exceptions',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch financial exceptions',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}
