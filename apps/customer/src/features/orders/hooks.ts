/**
 * Order React Hooks
 *
 * Custom React hooks for order operations.
 * These hooks provide a convenient interface for components to interact with orders.
 */

import { useCallback } from 'react';

import { useOrderStore } from '../../stores/order-store';

/**
 * Hook for order operations
 */
export function useOrder() {
  const {
    order,
    orders,
    timeline,
    isLoading,
    error,
    fetchOrder,
    fetchOrders,
    fetchTimeline,
    cancelOrder,
    requestReturn,
  } = useOrderStore();

  const handleFetchOrder = useCallback(
    async (orderId: string) => {
      await fetchOrder(orderId);
    },
    [fetchOrder],
  );

  const handleFetchOrders = useCallback(
    async (options?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }) => {
      // Authentication handled via httpOnly cookies
      await fetchOrders(undefined, options);
    },
    [fetchOrders],
  );

  const handleFetchTimeline = useCallback(
    async (orderId: string) => {
      await fetchTimeline(orderId);
    },
    [fetchTimeline],
  );

  const handleCancelOrder = useCallback(
    async (orderId: string, reason: string) => {
      await cancelOrder(orderId, reason);
    },
    [cancelOrder],
  );

  const handleRequestReturn = useCallback(
    async (
      orderId: string,
      items: Array<{ orderItemId: string; quantity: number }>,
      reason: string,
    ) => {
      await requestReturn(orderId, items, reason);
    },
    [requestReturn],
  );

  return {
    order,
    orders,
    timeline,
    isLoading,
    error,
    fetchOrder: handleFetchOrder,
    fetchOrders: handleFetchOrders,
    fetchTimeline: handleFetchTimeline,
    cancelOrder: handleCancelOrder,
    requestReturn: handleRequestReturn,
  };
}

/**
 * Hook for single order
 */
export function useOrderById(orderId: string) {
  const { order, isLoading, error, fetchOrder } = useOrderStore();

  useCallback(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId, fetchOrder]);

  return { order, isLoading, error };
}

/**
 * Hook for order timeline
 */
export function useOrderTimeline(orderId: string) {
  const { timeline, isLoading, error, fetchTimeline } = useOrderStore();

  useCallback(() => {
    if (orderId) {
      fetchTimeline(orderId);
    }
  }, [orderId, fetchTimeline]);

  return { timeline, isLoading, error };
}

/**
 * Hook for order actions (cancel, return, etc.)
 */
export function useOrderActions() {
  const { cancelOrder, requestReturn } = useOrderStore();

  const handleCancelOrder = useCallback(
    async (orderId: string, reason: string) => {
      await cancelOrder(orderId, reason);
    },
    [cancelOrder],
  );

  const handleRequestReturn = useCallback(
    async (
      orderId: string,
      items: Array<{ orderItemId: string; quantity: number }>,
      reason: string,
    ) => {
      await requestReturn(orderId, items, reason);
    },
    [requestReturn],
  );

  return {
    cancelOrder: handleCancelOrder,
    requestReturn: handleRequestReturn,
  };
}
