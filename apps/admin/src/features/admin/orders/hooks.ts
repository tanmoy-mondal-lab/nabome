/**
 * Admin Order React Hooks
 *
 * Custom React hooks for admin order operations.
 */

import { useCallback } from 'react';
import { useAdminOrderStore } from '../../../stores/admin-order-store';

/**
 * Hook for admin order operations
 */
export function useAdminOrder() {
  const {
    orders,
    dashboardStats,
    isLoading,
    error,
    fetchOrders,
    fetchOrder,
    transitionOrder,
    cancelOrder,
    processRefund,
    addNote,
    bulkTransition,
    fetchDashboardStats,
  } = useAdminOrderStore();

  const handleFetchOrders = useCallback(
    async (options?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }) => {
      await fetchOrders(options);
    },
    [fetchOrders],
  );

  const handleFetchOrder = useCallback(
    async (orderId: string) => {
      await fetchOrder(orderId);
    },
    [fetchOrder],
  );

  const handleTransitionOrder = useCallback(
    async (orderId: string, to: string, reason?: string) => {
      await transitionOrder(orderId, to, reason);
    },
    [transitionOrder],
  );

  const handleCancelOrder = useCallback(
    async (orderId: string, reason: string) => {
      await cancelOrder(orderId, reason);
    },
    [cancelOrder],
  );

  const handleProcessRefund = useCallback(
    async (orderId: string, amount: string, reason: string) => {
      await processRefund(orderId, amount, reason);
    },
    [processRefund],
  );

  const handleAddNote = useCallback(
    async (orderId: string, note: string) => {
      await addNote(orderId, note);
    },
    [addNote],
  );

  const handleBulkTransition = useCallback(
    async (orderIds: string[], to: string, reason?: string) => {
      await bulkTransition(orderIds, to, reason);
    },
    [bulkTransition],
  );

  return {
    orders,
    dashboardStats,
    isLoading,
    error,
    fetchOrders: handleFetchOrders,
    fetchOrder: handleFetchOrder,
    transitionOrder: handleTransitionOrder,
    cancelOrder: handleCancelOrder,
    processRefund: handleProcessRefund,
    addNote: handleAddNote,
    bulkTransition: handleBulkTransition,
    fetchDashboardStats,
  };
}
