/**
 * Admin Payments Feature Hooks
 *
 * React hooks for admin payment management.
 */

import { useState, useEffect } from 'react';
import type {
  Provider,
  GlobalPaymentMetrics,
  FinancialException,
  TransactionSearchFilters,
} from './types';

/**
 * Fetch global payment metrics
 */
export function useGlobalPaymentMetrics() {
  const [metrics, setMetrics] = useState<GlobalPaymentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/admin/payments/metrics');
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        setMetrics(data.metrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  return { metrics, loading, error };
}

/**
 * Fetch providers
 */
export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const response = await fetch('/api/admin/payments/providers');
        if (!response.ok) throw new Error('Failed to fetch providers');
        const data = await response.json();
        setProviders(data.providers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchProviders();
  }, []);

  return { providers, loading, error };
}

/**
 * Toggle provider status
 */
export function useToggleProvider() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleProvider = async (providerId: string, enabled: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/payments/providers/${providerId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled }),
        },
      );
      if (!response.ok) throw new Error('Failed to toggle provider');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { toggleProvider, loading, error };
}

/**
 * Fetch financial exceptions
 */
export function useFinancialExceptions() {
  const [exceptions, setExceptions] = useState<FinancialException[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExceptions() {
      try {
        const response = await fetch('/api/admin/payments/exceptions');
        if (!response.ok) throw new Error('Failed to fetch exceptions');
        const data = await response.json();
        setExceptions(data.exceptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchExceptions();
  }, []);

  return { exceptions, loading, error };
}

/**
 * Search transactions
 */
export function useTransactionSearch(filters?: TransactionSearchFilters) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function searchTransactions() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters?.paymentId) params.append('paymentId', filters.paymentId);
        if (filters?.orderId) params.append('orderId', filters.orderId);
        if (filters?.shopId) params.append('shopId', filters.shopId);
        if (filters?.provider) params.append('provider', filters.provider);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate)
          params.append('startDate', filters.startDate.toISOString());
        if (filters?.endDate)
          params.append('endDate', filters.endDate.toISOString());
        if (filters?.minAmount)
          params.append('minAmount', filters.minAmount.toString());
        if (filters?.maxAmount)
          params.append('maxAmount', filters.maxAmount.toString());

        const response = await fetch(
          `/api/admin/payments/search?${params.toString()}`,
        );
        if (!response.ok) throw new Error('Failed to search transactions');
        const data = await response.json();
        setTransactions(data.transactions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    searchTransactions();
  }, [filters]);

  return { transactions, loading, error };
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR',
): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format date
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}
