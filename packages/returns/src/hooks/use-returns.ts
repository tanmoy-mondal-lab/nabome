/**
 * Returns Hooks for React Integration
 *
 * Custom React hooks for interacting with the returns system.
 * All hooks are mobile-first optimized and follow React best practices.
 */

import { useState, useEffect, useCallback } from 'react';

// Types (will be imported from @nabome/returns in production)
export interface ReturnRequest {
  id: string;
  orderNumber: string;
  orderId: string;
  profileId: string;
  shopId: string;
  status: string;
  returnType: string;
  reason: string;
  reasonDetail?: string;
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  totalRefundAmount: number;
  refundMethod: string;
  refundStatus: string;
  customerNotes?: string;
  evidenceUrls: string[];
  items: ReturnItem[];
  statusHistory?: any[];
}

export interface ReturnItem {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  variantSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  reason: string;
  condition: string;
  inspectionResult?: string;
}

export interface ReturnEligibility {
  orderId: string;
  profileId: string;
  status: 'eligible' | 'partially_eligible' | 'ineligible';
  ineligibilityReasons: string[];
  eligibleItems: any[];
  ineligibleItems: any[];
  returnWindowEndsAt?: Date;
  requiresApproval: boolean;
  estimatedRefundAmount: number;
}

export interface CreateReturnInput {
  orderId: string;
  returnType: string;
  reason: string;
  reasonDetail?: string;
  items: Array<{
    orderItemId: string;
    variantId: string;
    productId: string;
    productName: string;
    variantSku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    reason: string;
    condition: string;
  }>;
  refundMethod: string;
  customerNotes?: string;
  evidenceUrls?: string[];
}

// API fetch wrapper (in production, this would use the actual API client)
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api/v1${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  return response.json();
}

/**
 * useReturns - Fetch returns for a profile
 */
export function useReturns(profileId?: string) {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReturns = useCallback(async () => {
    if (!profileId) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = profileId ? `/returns/profile/${profileId}` : '/returns';
      const response = await fetchAPI<{ data: ReturnRequest[] }>(endpoint);
      setReturns(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return { returns, loading, error, refetch: fetchReturns };
}

/**
 * useReturn - Fetch a single return by ID
 */
export function useReturn(returnId: string) {
  const [returnData, setReturnData] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!returnId) return;

    const fetchReturn = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchAPI<{ data: ReturnRequest }>(
          `/returns/${returnId}`,
        );
        setReturnData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch return');
      } finally {
        setLoading(false);
      }
    };

    fetchReturn();
  }, [returnId]);

  return { return: returnData, loading, error };
}

/**
 * useReturnEligibility - Check return eligibility for an order
 */
export function useReturnEligibility() {
  const [eligibility, setEligibility] = useState<ReturnEligibility | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = useCallback(
    async (orderId: string, orderItems: any[]) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchAPI<{ data: ReturnEligibility }>(
          '/returns/check-eligibility',
          {
            method: 'POST',
            body: JSON.stringify({ orderId, orderItems }),
          },
        );
        setEligibility(response.data);
        return response.data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to check eligibility',
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { eligibility, loading, error, checkEligibility };
}

/**
 * useCreateReturn - Create a new return request
 */
export function useCreateReturn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReturn = useCallback(async (input: CreateReturnInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAPI<{ data: ReturnRequest }>('/returns', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create return');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createReturn, loading, error };
}

/**
 * useReturnStatus - Get return status with timeline
 */
export function useReturnStatus(returnId: string) {
  const [status, setStatus] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!returnId) return;

    const fetchStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchAPI<{ data: ReturnRequest }>(
          `/returns/${returnId}`,
        );
        setStatus(response.data.status);
        setTimeline(response.data.statusHistory || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [returnId]);

  return { status, timeline, loading, error };
}

/**
 * useShopReturns - Fetch returns for a shop (shop owner dashboard)
 */
export function useShopReturns(
  shopId: string,
  filters?: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
  },
) {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShopReturns = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateFrom)
        params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters?.dateTo)
        params.append('dateTo', filters.dateTo.toISOString());

      const endpoint = `/returns/shop/${shopId}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetchAPI<{ data: ReturnRequest[] }>(endpoint);
      setReturns(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch shop returns',
      );
    } finally {
      setLoading(false);
    }
  }, [shopId, filters]);

  useEffect(() => {
    fetchShopReturns();
  }, [fetchShopReturns]);

  return { returns, loading, error, refetch: fetchShopReturns };
}

/**
 * useReturnStatistics - Get return statistics
 */
export function useReturnStatistics(
  shopId?: string,
  startDate?: Date,
  endDate?: Date,
) {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (shopId) params.append('shopId', shopId);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const endpoint = `/returns/statistics${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetchAPI<{ data: any }>(endpoint);
      setStatistics(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch statistics',
      );
    } finally {
      setLoading(false);
    }
  }, [shopId, startDate, endDate]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, refetch: fetchStatistics };
}

/**
 * useReturnActions - Actions for return management (approve, reject, add notes)
 */
export function useReturnActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveReturn = useCallback(
    async (returnId: string, reason?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchAPI<{ data: ReturnRequest }>(
          `/returns/${returnId}/approve`,
          {
            method: 'POST',
            body: JSON.stringify({ reason }),
          },
        );
        return response.data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to approve return',
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const rejectReturn = useCallback(async (returnId: string, reason: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAPI<{ data: ReturnRequest }>(
        `/returns/${returnId}/reject`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
        },
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject return');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addNotes = useCallback(async (returnId: string, notes: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAPI<{ data: ReturnRequest }>(
        `/returns/${returnId}/notes`,
        {
          method: 'POST',
          body: JSON.stringify({ notes }),
        },
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add notes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { approveReturn, rejectReturn, addNotes, loading, error };
}

/**
 * useRefunds - Fetch refunds for a return
 */
export function useRefunds(returnRequestId: string) {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!returnRequestId) return;

    const fetchRefunds = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchAPI<{ data: any[] }>(
          `/refunds/return/${returnRequestId}`,
        );
        setRefunds(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch refunds',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, [returnRequestId]);

  return { refunds, loading, error };
}

/**
 * useDisputes - Fetch disputes for a return
 */
export function useDisputes(returnRequestId: string) {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!returnRequestId) return;

    const fetchDisputes = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchAPI<{ data: any[] }>(
          `/disputes/return/${returnRequestId}`,
        );
        setDisputes(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch disputes',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, [returnRequestId]);

  return { disputes, loading, error };
}

/**
 * useCreateDispute - Create a new dispute
 */
export function useCreateDispute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDispute = useCallback(
    async (input: {
      returnRequestId: string;
      orderId: string;
      reason: string;
      reasonDetail?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchAPI<{ data: any }>('/disputes', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        return response.data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create dispute',
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { createDispute, loading, error };
}
