import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { guestWishlistStorage } from '../features/wishlist/guest-storage';
import type {
  Wishlist,
  WishlistItem,
  GuestWishlistItem,
} from '../features/wishlist/types';

interface WishlistState {
  // Authenticated user wishlist
  wishlist: Wishlist | null;
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;

  // Guest wishlist
  isGuest: boolean;
  guestItems: GuestWishlistItem[];

  // Actions
  setWishlist: (wishlist: Wishlist | null) => void;
  setItems: (items: WishlistItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsGuest: (isGuest: boolean) => void;

  // Guest actions
  addGuestItem: (productId: string, variantId: string | null) => void;
  removeGuestItem: (productId: string, variantId: string | null) => void;
  clearGuestItems: () => void;
  loadGuestItems: () => void;

  // Utility
  isInWishlist: (productId: string, variantId: string | null) => boolean;
  isInGuestWishlist: (productId: string, variantId: string | null) => boolean;
  getItemCount: () => number;
  clearAll: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      // Initial state
      wishlist: null,
      items: [],
      isLoading: false,
      error: null,
      isGuest: true,
      guestItems: [],

      // Setters
      setWishlist: (wishlist) => set({ wishlist }),
      setItems: (items) => set({ items }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setIsGuest: (isGuest) => set({ isGuest }),

      // Guest actions
      addGuestItem: (productId, variantId) => {
        const { guestItems } = get();
        const existing = guestItems.find(
          (item) =>
            item.productId === productId && item.variantId === variantId,
        );

        if (!existing) {
          const newItem: GuestWishlistItem = {
            productId,
            variantId,
            addedAt: new Date().toISOString(),
          };
          set({ guestItems: [...guestItems, newItem] });
          guestWishlistStorage.addItem(productId, variantId);
        }
      },

      removeGuestItem: (productId, variantId) => {
        const { guestItems } = get();
        const filtered = guestItems.filter(
          (item) =>
            !(item.productId === productId && item.variantId === variantId),
        );
        set({ guestItems: filtered });
        guestWishlistStorage.removeItem(productId, variantId);
      },

      clearGuestItems: () => {
        set({ guestItems: [] });
        guestWishlistStorage.clear();
      },

      loadGuestItems: () => {
        const stored = guestWishlistStorage.get();
        if (stored) {
          set({ guestItems: stored.items });
        }
      },

      // Utility
      isInWishlist: (productId, variantId) => {
        const { items, isGuest, guestItems } = get();

        if (isGuest) {
          return guestItems.some(
            (item) =>
              item.productId === productId && item.variantId === variantId,
          );
        }

        return items.some(
          (item) =>
            item.productId === productId && item.variantId === variantId,
        );
      },

      isInGuestWishlist: (productId, variantId) => {
        const { guestItems } = get();
        return guestItems.some(
          (item) =>
            item.productId === productId && item.variantId === variantId,
        );
      },

      getItemCount: () => {
        const { items, isGuest, guestItems } = get();
        return isGuest ? guestItems.length : items.length;
      },

      clearAll: () => {
        set({
          wishlist: null,
          items: [],
          isLoading: false,
          error: null,
          guestItems: [],
        });
        guestWishlistStorage.clear();
      },
    }),
    {
      name: 'nabome-wishlist',
      partialize: (state) => ({
        isGuest: state.isGuest,
        guestItems: state.guestItems,
      }),
    },
  ),
);
