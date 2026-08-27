import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function csrfHeader(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  const m = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return m ? { 'x-csrf-token': decodeURIComponent(m[1] ?? '') } : {};
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerVisibleStatus: string;
  items: any[];
  amounts: any;
  shippingAddress?: any;
  billingAddress?: any;
  shop?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TimelineEvent {
  id: string;
  type: string;
  description: string;
  occurredAt: string;
  priority: string;
  customerVisible: boolean;
}

interface Timeline {
  orderId: string;
  events: TimelineEvent[];
  totalEvents: number;
}

interface OrderState {
  order: Order | null;
  orders: Order[];
  timeline: Timeline | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOrder: (orderId: string) => Promise<void>;
  fetchOrders: (userId?: string, options?: any) => Promise<void>;
  fetchTimeline: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  requestReturn: (
    orderId: string,
    items: any[],
    reason: string,
  ) => Promise<void>;
}

const API_BASE =
  (import.meta.env.VITE_PUBLIC_API_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:8788';

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      order: null,
      orders: [],
      timeline: null,
      isLoading: false,
      error: null,

      fetchOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/v1/orders/${orderId}`, {
            credentials: 'include', // Use httpOnly cookies for authentication
          });

          if (!response.ok) {
            throw new Error('Failed to fetch order');
          }

          const data = await response.json();
          set({ order: data.order, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to fetch order',
            isLoading: false,
          });
        }
      },

      fetchOrders: async (userId, options) => {
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

          const response = await fetch(
            `${API_BASE}/api/v1/orders${params.toString() ? `?${params.toString()}` : ''}`,
            {
              credentials: 'include', // Use httpOnly cookies for authentication
            },
          );

          if (!response.ok) {
            throw new Error('Failed to fetch orders');
          }

          const data = await response.json();
          set({ orders: data.orders, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to fetch orders',
            isLoading: false,
          });
        }
      },

      fetchTimeline: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${API_BASE}/api/v1/orders/${orderId}/timeline`,
            {
              credentials: 'include', // Use httpOnly cookies for authentication
            },
          );

          if (!response.ok) {
            throw new Error('Failed to fetch order timeline');
          }

          const data = await response.json();
          set({ timeline: data.timeline, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch timeline',
            isLoading: false,
          });
        }
      },

      cancelOrder: async (orderId, reason) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${API_BASE}/api/v1/orders/${orderId}/cancel`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...csrfHeader(),
              },
              credentials: 'include',
              body: JSON.stringify({ reason }),
            },
          );

          if (!response.ok) {
            throw new Error('Failed to cancel order');
          }

          // Refresh order after cancellation
          await get().fetchOrder(orderId);
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to cancel order',
            isLoading: false,
          });
        }
      },

      requestReturn: async (orderId, items, reason) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${API_BASE}/api/v1/orders/${orderId}/return`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...csrfHeader(),
              },
              credentials: 'include',
              body: JSON.stringify({ items, reason }),
            },
          );

          if (!response.ok) {
            throw new Error('Failed to request return');
          }

          const data = await response.json();
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to request return',
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: 'nabome-order',
      partialize: (state) => ({
        orders: state.orders,
      }),
    },
  ),
);
