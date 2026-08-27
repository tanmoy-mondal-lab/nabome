import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api/client';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerVisibleStatus: string;
  items: any[];
  amounts: any;
  shippingAddress?: any;
  billingAddress?: any;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface ShopOrderState {
  orders: Order[];
  processingQueue: Order[];
  packingQueue: Order[];
  fulfillmentQueue: Order[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOrders: (options?: any) => Promise<void>;
  fetchOrder: (orderId: string) => Promise<Order | undefined>;
  transitionOrder: (
    orderId: string,
    to: string,
    reason?: string,
  ) => Promise<void>;
  addNote: (orderId: string, note: string) => Promise<void>;
  bulkTransition: (
    orderIds: string[],
    to: string,
    reason?: string,
  ) => Promise<void>;
}

export const useShopOrderStore = create<ShopOrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      processingQueue: [],
      packingQueue: [],
      fulfillmentQueue: [],
      isLoading: false,
      error: null,

      fetchOrders: async (options) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (options?.status) params.append('status', options.status);
          if (options?.startDate) params.append('startDate', options.startDate);
          if (options?.endDate) params.append('endDate', options.endDate);
          if (options?.search) params.append('search', options.search);
          if (options?.limit) params.append('limit', options.limit.toString());
          if (options?.offset)
            params.append('offset', options.offset.toString());

          const data = await api.get<{ orders: Order[] }>(
            `/api/v1/shop/orders${params.toString() ? `?${params.toString()}` : ''}`,
          );
          set({
            orders: data.orders,
            processingQueue: data.orders.filter(
              (o: Order) =>
                o.status === 'confirmed' || o.status === 'processing',
            ),
            packingQueue: data.orders.filter(
              (o: Order) => o.status === 'processing',
            ),
            fulfillmentQueue: data.orders.filter(
              (o: Order) =>
                o.status === 'packed' || o.status === 'ready_for_shipment',
            ),
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to fetch orders',
            isLoading: false,
          });
        }
      },

      fetchOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.get<{ order: Order }>(
            `/api/v1/shop/orders/${orderId}`,
          );
          set({ isLoading: false });
          return data.order;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to fetch order',
            isLoading: false,
          });
        }
      },

      transitionOrder: async (orderId, to, reason) => {
        set({ isLoading: true, error: null });
        try {
          await api.post(`/api/v1/shop/orders/${orderId}/transition`, {
            to,
            reason,
          });
          // Refresh orders after transition
          await get().fetchOrders();
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to transition order',
            isLoading: false,
          });
        }
      },

      addNote: async (orderId, note) => {
        set({ isLoading: true, error: null });
        try {
          await api.post(`/api/v1/shop/orders/${orderId}/note`, { note });
          // Refresh order after adding note
          await get().fetchOrder(orderId);
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to add note',
            isLoading: false,
          });
        }
      },

      bulkTransition: async (orderIds, to, reason) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/api/v1/shop/orders/bulk-transition', {
            orderIds,
            to,
            reason,
          });
          // Refresh orders after bulk transition
          await get().fetchOrders();
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to bulk transition orders',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'nabome-shop-order',
      partialize: (state) => ({
        orders: state.orders,
      }),
    },
  ),
);
