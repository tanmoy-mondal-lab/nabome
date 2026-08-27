/**
 * Payment Feature Hooks
 *
 * React hooks for customer payment management.
 */

import { useState, useEffect } from 'react';

import type {
  Payment,
  PaymentMethod,
  TransactionDetail,
  PaymentSelectionRequest,
  PaymentRetryRequest,
  PaymentHistoryFilters,
} from './types';

/**
 * Fetch payment methods
 */
export function usePaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMethods() {
      try {
        const response = await fetch('/api/payments/methods');
        if (!response.ok) throw new Error('Failed to fetch payment methods');
        const data = await response.json();
        setMethods(data.methods);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchMethods();
  }, []);

  return { methods, loading, error };
}

/**
 * Create payment
 */
export function useCreatePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (request: PaymentSelectionRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error('Failed to create payment');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createPayment, loading, error };
}

/**
 * Fetch payment details
 */
export function usePayment(paymentId: string) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayment() {
      try {
        const response = await fetch(`/api/payments/${paymentId}`);
        if (!response.ok) throw new Error('Failed to fetch payment');
        const data = await response.json();
        setPayment(data.payment);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchPayment();
  }, [paymentId]);

  return { payment, loading, error };
}

/**
 * Retry payment
 */
export function useRetryPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retryPayment = async (request: PaymentRetryRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/payments/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error('Failed to retry payment');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { retryPayment, loading, error };
}

/**
 * Fetch payment history
 */
export function usePaymentHistory(filters?: PaymentHistoryFilters) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.provider) params.append('provider', filters.provider);
        if (filters?.method) params.append('method', filters.method);
        if (filters?.startDate)
          params.append('startDate', filters.startDate.toISOString());
        if (filters?.endDate)
          params.append('endDate', filters.endDate.toISOString());

        const response = await fetch(`/api/payments?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch payment history');
        const data = await response.json();
        setPayments(data.payments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [filters]);

  return { payments, loading, error };
}

/**
 * Fetch transaction detail
 */
export function useTransactionDetail(paymentId: string) {
  const [detail, setDetail] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const response = await fetch(`/api/payments/${paymentId}/detail`);
        if (!response.ok) throw new Error('Failed to fetch transaction detail');
        const data = await response.json();
        setDetail(data.detail);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [paymentId]);

  return { detail, loading, error };
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
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Get payment status color
 */
export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    COMPLETED: 'green',
    FAILED: 'red',
    PENDING: 'yellow',
    CANCELLED: 'gray',
    REFUNDED: 'blue',
  };
  return colors[status] || 'gray';
}

/**
 * Get payment status label
 */
export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    CREATED: 'Created',
    INITIATED: 'Initiated',
    AUTHORIZED: 'Authorized',
    CAPTURED: 'Captured',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
    REFUNDED: 'Refunded',
    PARTIALLY_REFUNDED: 'Partially Refunded',
  };
  return labels[status] || status;
}
