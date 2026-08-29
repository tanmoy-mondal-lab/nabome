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
  createdAt: string;
  updatedAt: string;
  notes?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface DashboardStats {
  todayOrders: number;
  todayRevenue: { amount: string; currency: string };
  pendingOrders: number;
  processingOrders: number;
  readyToShip: number;
  shippedToday: number;
  deliveredToday: number;
  cancellationRate7d: number;
  refundRate7d: number;
}

interface AdminOrderState {
  orders: Order[];
  dashboardStats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOrders: (options?: any) => Promise<void>;
  fetchOrder: (orderId: string) => Promise<void>;
  transitionOrder: (
    orderId: string,
    to: string,
    reason?: string,
  ) => Promise<void>;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  processRefund: (
    orderId: string,
    amount: string,
    reason: string,
  ) => Promise<void>;
  addNote: (orderId: string, note: string) => Promise<void>;
  bulkTransition: (
    orderIds: string[],
    to: string,
    reason?: string,
  ) => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
}

const API_BASE =
  (import.meta.env.VITE_PUBLIC_API_URL as string | undefined) ?? '';

export const useAdminOrderStore = create<AdminOrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      dashboardStats: null,
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

          const response = await fetch(
            `${API_BASE}/api/v1/admin/orders${params.toString() ? `?${params.toString()}` : ''}`,
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

      fetchOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${API_BASE}/api/v1/admin/orders/${orderId}`,
            {
              credentials: 'include', // Use httpOnly cookies for authentication
            },
          );

          if (!response.ok) {
            throw new Error('Failed to fetch order');
          }

          const data = await response.json();
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
          const response = await fetch(
            `${API_BASE}/api/v1/admin/orders/${orderId}/transition`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...csrfHeader(),
              },
              credentials: 'include', // Use httpOnly cookies for authentication
              body: JSON.stringify({ to, reason }),
            },
          );

          if (!response.ok) {
            throw new Error('Failed to transition order');
          }

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

      cancelOrder: async (orderId, reason) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${API_BASE}/api/v1/admin/orders/${orderId}/cancel`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...csrfHeader(),
              },
              credentials: 'include', // Use httpOnly cookies for authentication
              body: JSON.stringify({ reason }),
            },
          );

          if (!response.ok) {
            throw new Error('Failed to cancel order');
          }

          // Refresh orders after cancellation
          await get().fetchOrders();
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to cancel order',
            isLoading: false,
          });
        }
      },

      processRefund: async (orderId, amount, reason) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${API_BASE}/api/v1/admin/orders/${orderId}/refund`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...csrfHeader(),
              },
              credentials: 'include', // Use httpOnly cookies for authentication
              body: JSON.stringify({ amount, reason }),
            },
          );

          if (!response.ok) {
            throw new Error('Failed to process refund');
          }

          // Refresh orders after refund
          await get().fetchOrders();
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to process refund',
            isLoading: false,
          });
        }
      },

      addNote: async (orderId, note) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${API_BASE}/api/v1/admin/orders/${orderId}/note`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...csrfHeader(),
              },
              credentials: 'include', // Use httpOnly cookies for authentication
              body: JSON.stringify({ note }),
            },
          );

          if (!response.ok) {
            throw new Error('Failed to add note');
          }

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
          const response = await fetch(
            `${API_BASE}/api/v1/admin/orders/bulk-transition`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...csrfHeader(),
              },
              credentials: 'include', // Use httpOnly cookies for authentication
              body: JSON.stringify({ orderIds, to, reason }),
            },
          );

          if (!response.ok) {
            throw new Error('Failed to bulk transition orders');
          }

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

      fetchDashboardStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${API_BASE}/api/v1/admin/orders/stats`,
            {
              credentials: 'include', // Use httpOnly cookies for authentication
            },
          );

          if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
          }

          const data = await response.json();
          set({ dashboardStats: data.dashboardStats, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch dashboard stats',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'nabome-admin-order',
      partialize: (state) => ({
        orders: state.orders,
      }),
    },
  ),
);
