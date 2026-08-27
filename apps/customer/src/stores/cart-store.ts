import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Cart, CartTotals } from '../features/cart/types';
import type { CartItem } from '../features/cart/types';
import { api } from '../lib/api/client';

export type { CartItem };

interface CartState {
  cart: Cart | null;
  totals: CartTotals | null;
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;

  // Actions
  fetchCart: (userId?: string, guestId?: string) => Promise<void>;
  addItem: (
    variantId: string,
    quantity: number,
    userId?: string,
    guestId?: string,
  ) => Promise<void>;
  updateItem: (
    itemId: string,
    quantity?: number,
    variantId?: string,
    userId?: string,
    guestId?: string,
  ) => Promise<void>;
  removeItem: (
    itemId: string,
    userId?: string,
    guestId?: string,
  ) => Promise<void>;
  clearCart: (userId?: string, guestId?: string) => Promise<void>;
  mergeCart: (guestId: string, userId: string) => Promise<void>;
  validateCart: (userId?: string, guestId?: string) => Promise<void>;

  // UI Actions
  setIsOpen: (isOpen: boolean) => void;

  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      totals: null,
      isLoading: false,
      error: null,
      isOpen: false,

      fetchCart: async (userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          const data = await api.get<{ cart: Cart; totals: CartTotals }>(
            '/cart',
            { headers },
          );
          set({ cart: data.cart, totals: data.totals, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to fetch cart',
            isLoading: false,
          });
        }
      },

      addItem: async (variantId, quantity, userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          await api.post('/cart/items', { variantId, quantity }, { headers });
          // Refresh cart after adding
          await get().fetchCart(userId, guestId);
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to add item',
            isLoading: false,
          });
        }
      },

      updateItem: async (itemId, quantity, variantId, userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          await api.patch(
            `/cart/items/${itemId}`,
            { quantity, variantId },
            { headers },
          );
          // Refresh cart after updating
          await get().fetchCart(userId, guestId);
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to update item',
            isLoading: false,
          });
        }
      },

      removeItem: async (itemId, userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          await api.del(`/cart/items/${itemId}`, { headers });
          // Refresh cart after removing
          await get().fetchCart(userId, guestId);
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to remove item',
            isLoading: false,
          });
        }
      },

      clearCart: async (userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          await api.del('/cart', { headers });
          set({ cart: null, totals: null, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to clear cart',
            isLoading: false,
          });
        }
      },

      mergeCart: async (guestId, userId) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.post<{ cart: Cart; totals: CartTotals }>(
            '/cart/merge',
            { guestId, userId },
          );
          set({ cart: data.cart, totals: data.totals, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to merge cart',
            isLoading: false,
          });
        }
      },

      validateCart: async (userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          const data = await api.post('/cart/validate', {}, { headers });
          set({ isLoading: false });
          return data as any;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to validate cart',
            isLoading: false,
          });
          throw error;
        }
      },

      setIsOpen: (isOpen) => set({ isOpen }),

      getTotalItems: () => {
        const cart = get().cart;
        if (!cart) return 0;
        return cart.itemCount;
      },

      getTotalPrice: () => {
        const totals = get().totals;
        if (!totals) return 0;
        return totals.itemsSubtotal;
      },
    }),
    {
      name: 'nabome-cart',
      partialize: (state) => ({
        isOpen: state.isOpen,
      }),
    },
  ),
);
