/**
 * Shop Owner Order React Hooks
 *
 * Custom React hooks for shop owner order operations.
 */

import { useCallback } from 'react';
import { useShopOrderStore } from '../../../stores/shop-order-store';

/**
 * Hook for shop owner order operations
 */
export function useShopOrder() {
  const {
    orders,
    processingQueue,
    packingQueue,
    fulfillmentQueue,
    isLoading,
    error,
    fetchOrders,
    fetchOrder,
    transitionOrder,
    addNote,
    bulkTransition,
  } = useShopOrderStore();

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
    processingQueue,
    packingQueue,
    fulfillmentQueue,
    isLoading,
    error,
    fetchOrders: handleFetchOrders,
    fetchOrder: handleFetchOrder,
    transitionOrder: handleTransitionOrder,
    addNote: handleAddNote,
    bulkTransition: handleBulkTransition,
  };
}
