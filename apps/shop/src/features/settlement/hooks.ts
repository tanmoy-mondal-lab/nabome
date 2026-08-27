/**
 *  Settlement Feature Hooks
 *
 * React hooks for shop owner settlement management.
 */

import { useState, useEffect } from 'react';
import type {
  Settlement,
  SettlementSummary,
  PayoutSummary,
  RefundQueueItem,
  SettlementFilters,
} from './types';

/**
 * Fetch settlements
 */
export function useSettlements(filters?: SettlementFilters) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettlements() {
      try {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate)
          params.append('startDate', filters.startDate.toISOString());
        if (filters?.endDate)
          params.append('endDate', filters.endDate.toISOString());

        const response = await fetch(`/api/settlements?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch settlements');
        const data = await response.json();
        setSettlements(data.settlements);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchSettlements();
  }, [filters]);

  return { settlements, loading, error };
}

/**
 * Fetch settlement summary
 */
export function useSettlementSummary() {
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch('/api/settlements/summary');
        if (!response.ok) throw new Error('Failed to fetch settlement summary');
        const data = await response.json();
        setSummary(data.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  return { summary, loading, error };
}

/**
 * Fetch payout summary
 */
export function usePayoutSummary() {
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch('/api/settlements/payouts/summary');
        if (!response.ok) throw new Error('Failed to fetch payout summary');
        const data = await response.json();
        setSummary(data.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  return { summary, loading, error };
}

/**
 * Fetch refund queue
 */
export function useRefundQueue() {
  const [queue, setQueue] = useState<RefundQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQueue() {
      try {
        const response = await fetch('/api/refunds/queue');
        if (!response.ok) throw new Error('Failed to fetch refund queue');
        const data = await response.json();
        setQueue(data.queue);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchQueue();
  }, []);

  return { queue, loading, error };
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
 * Format date
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Get settlement status color
 */
export function getSettlementStatusColor(status: string): string {
  const colors: Record<string, string> = {
    CREATED: 'gray',
    ELIGIBLE: 'blue',
    PROCESSING: 'yellow',
    COMPLETED: 'green',
    PAID: 'green',
    FAILED: 'red',
  };
  return colors[status] || 'gray';
}

/**
 * Get settlement status label
 */
export function getSettlementStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    CREATED: 'Created',
    ELIGIBLE: 'Eligible',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    PAID: 'Paid',
    FAILED: 'Failed',
  };
  return labels[status] || status;
}
