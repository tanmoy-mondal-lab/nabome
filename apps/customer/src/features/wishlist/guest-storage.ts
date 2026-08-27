import type { GuestWishlist, GuestWishlistItem } from './types';

const GUEST_WISHLIST_KEY = 'nabome_guest_wishlist';
const GUEST_WISHLIST_EXPIRY_DAYS = 30;

export const guestWishlistStorage = {
  get(): GuestWishlist | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
      if (!stored) return null;

      const data: GuestWishlist = JSON.parse(stored);

      if (new Date(data.expiresAt) < new Date()) {
        this.clear();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading guest wishlist from localStorage:', error);
      return null;
    }
  },

  set(items: GuestWishlistItem[]): void {
    if (typeof window === 'undefined') return;

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + GUEST_WISHLIST_EXPIRY_DAYS);

      const data: GuestWishlist = {
        items,
        expiresAt: expiresAt.toISOString(),
      };

      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving guest wishlist to localStorage:', error);
    }
  },

  addItem(productId: string, variantId: string | null): void {
    const current = this.get();
    const items = current?.items || [];

    const existingIndex = items.findIndex(
      (item) => item.productId === productId && item.variantId === variantId,
    );

    if (existingIndex >= 0) {
      return;
    }

    items.push({
      productId,
      variantId,
      addedAt: new Date().toISOString(),
    });

    this.set(items);
  },

  removeItem(productId: string, variantId: string | null): void {
    const current = this.get();
    if (!current) return;

    const items = current.items.filter(
      (item) => !(item.productId === productId && item.variantId === variantId),
    );

    this.set(items);
  },

  hasItem(productId: string, variantId: string | null): boolean {
    const current = this.get();
    if (!current) return false;

    return current.items.some(
      (item) => item.productId === productId && item.variantId === variantId,
    );
  },

  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(GUEST_WISHLIST_KEY);
    } catch (error) {
      console.error('Error clearing guest wishlist from localStorage:', error);
    }
  },

  getItemCount(): number {
    const current = this.get();
    return current?.items.length || 0;
  },

  getAllItems(): GuestWishlistItem[] {
    const current = this.get();
    return current?.items || [];
  },
};
