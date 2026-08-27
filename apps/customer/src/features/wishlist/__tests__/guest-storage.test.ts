import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { guestWishlistStorage } from '../guest-storage';
import type { GuestWishlistItem } from '../types';

describe('guestWishlistStorage', () => {
  const TEST_KEY = 'nabome_guest_wishlist';

  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('get', () => {
    it('should return null when localStorage is empty', () => {
      const result = guestWishlistStorage.get();
      expect(result).toBeNull();
    });

    it('should return stored wishlist when present', () => {
      const items: GuestWishlistItem[] = [
        {
          productId: 'product-1',
          variantId: null,
          addedAt: '2024-01-01T00:00:00Z',
        },
      ];

      guestWishlistStorage.set(items);
      const result = guestWishlistStorage.get();

      expect(result).not.toBeNull();
      expect(result?.items).toEqual(items);
    });

    it('should return null for expired wishlist', () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const data = {
        items: [],
        expiresAt: expiredDate.toISOString(),
      };

      localStorage.setItem(TEST_KEY, JSON.stringify(data));
      const result = guestWishlistStorage.get();

      expect(result).toBeNull();
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem(TEST_KEY, 'invalid-json');
      const result = guestWishlistStorage.get();

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store items in localStorage', () => {
      const items: GuestWishlistItem[] = [
        {
          productId: 'product-1',
          variantId: null,
          addedAt: '2024-01-01T00:00:00Z',
        },
      ];

      guestWishlistStorage.set(items);
      const stored = localStorage.getItem(TEST_KEY);

      expect(stored).not.toBeNull();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.items).toEqual(items);
      }
    });

    it('should set expiry date to 30 days from now', () => {
      const items: GuestWishlistItem[] = [];
      guestWishlistStorage.set(items);

      const stored = localStorage.getItem(TEST_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const expiresAt = new Date(parsed.expiresAt);
        const now = new Date();

        const diffDays =
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffDays).toBeCloseTo(30, 0);
      }
    });
  });

  describe('addItem', () => {
    it('should add item to wishlist', () => {
      guestWishlistStorage.addItem('product-1', null);
      const result = guestWishlistStorage.get();

      expect(result?.items).toHaveLength(1);
      if (result?.items && result.items[0]) {
        expect(result.items[0].productId).toBe('product-1');
      }
    });

    it('should not add duplicate items', () => {
      guestWishlistStorage.addItem('product-1', null);
      guestWishlistStorage.addItem('product-1', null);

      const result = guestWishlistStorage.get();
      expect(result?.items).toHaveLength(1);
    });

    it('should add items with different variants', () => {
      guestWishlistStorage.addItem('product-1', 'variant-1');
      guestWishlistStorage.addItem('product-1', 'variant-2');

      const result = guestWishlistStorage.get();
      expect(result?.items).toHaveLength(2);
    });

    it('should preserve existing items when adding new ones', () => {
      guestWishlistStorage.addItem('product-1', null);
      guestWishlistStorage.addItem('product-2', null);

      const result = guestWishlistStorage.get();
      expect(result?.items).toHaveLength(2);
      if (result?.items && result.items[0] && result.items[1]) {
        expect(result.items[0].productId).toBe('product-1');
        expect(result.items[1].productId).toBe('product-2');
      }
    });
  });

  describe('removeItem', () => {
    it('should remove item from wishlist', () => {
      guestWishlistStorage.addItem('product-1', null);
      guestWishlistStorage.removeItem('product-1', null);

      const result = guestWishlistStorage.get();
      expect(result?.items).toHaveLength(0);
    });

    it('should only remove matching variant', () => {
      guestWishlistStorage.addItem('product-1', 'variant-1');
      guestWishlistStorage.addItem('product-1', 'variant-2');
      guestWishlistStorage.removeItem('product-1', 'variant-1');

      const result = guestWishlistStorage.get();
      expect(result?.items).toHaveLength(1);
      if (result?.items && result.items[0]) {
        expect(result.items[0].variantId).toBe('variant-2');
      }
    });

    it('should handle removing non-existent item gracefully', () => {
      guestWishlistStorage.removeItem('product-1', null);

      const result = guestWishlistStorage.get();
      expect(result === null || result.items.length === 0).toBe(true);
    });
  });

  describe('hasItem', () => {
    it('should return true for existing item', () => {
      guestWishlistStorage.addItem('product-1', null);
      const result = guestWishlistStorage.hasItem('product-1', null);

      expect(result).toBe(true);
    });

    it('should return false for non-existent item', () => {
      const result = guestWishlistStorage.hasItem('product-1', null);
      expect(result).toBe(false);
    });

    it('should check variant specificity', () => {
      guestWishlistStorage.addItem('product-1', 'variant-1');

      expect(guestWishlistStorage.hasItem('product-1', 'variant-1')).toBe(true);
      expect(guestWishlistStorage.hasItem('product-1', 'variant-2')).toBe(
        false,
      );
      expect(guestWishlistStorage.hasItem('product-1', null)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      guestWishlistStorage.addItem('product-1', null);
      guestWishlistStorage.addItem('product-2', null);
      guestWishlistStorage.clear();

      const result = guestWishlistStorage.get();
      expect(result).toBeNull();
    });

    it('should remove localStorage key', () => {
      guestWishlistStorage.addItem('product-1', null);
      guestWishlistStorage.clear();

      const stored = localStorage.getItem(TEST_KEY);
      expect(stored).toBeNull();
    });
  });

  describe('getItemCount', () => {
    it('should return 0 for empty wishlist', () => {
      const count = guestWishlistStorage.getItemCount();
      expect(count).toBe(0);
    });

    it('should return correct count', () => {
      guestWishlistStorage.addItem('product-1', null);
      guestWishlistStorage.addItem('product-2', null);

      const count = guestWishlistStorage.getItemCount();
      expect(count).toBe(2);
    });
  });

  describe('getAllItems', () => {
    it('should return empty array for empty wishlist', () => {
      const items = guestWishlistStorage.getAllItems();
      expect(items).toEqual([]);
    });

    it('should return all items', () => {
      guestWishlistStorage.addItem('product-1', null);
      guestWishlistStorage.addItem('product-2', null);

      const items = guestWishlistStorage.getAllItems();
      expect(items).toHaveLength(2);
    });
  });
});
