import { describe, it, expect } from 'vitest';

import {
  calculateStockStatus,
  calculatePriceChange,
  getAvailabilityBadge,
  getPriceDropBadge,
  shouldNotifyAvailability,
  updateItemAvailability,
  getAvailabilitySummary,
} from '../availability';
import type { WishlistItem } from '../types';

describe('Availability Tracking', () => {
  describe('calculateStockStatus', () => {
    it('should mark item as in stock when availableStock > 0', () => {
      const result = calculateStockStatus(10, 'available');
      expect(result.inStock).toBe(true);
      expect(result.outOfStock).toBe(false);
    });

    it('should mark item as out of stock when availableStock is 0', () => {
      const result = calculateStockStatus(0, 'out_of_stock');
      expect(result.inStock).toBe(false);
      expect(result.outOfStock).toBe(true);
    });

    it('should mark item as low stock when availableStock <= 5', () => {
      const result = calculateStockStatus(5, 'available');
      expect(result.lowStock).toBe(true);
      expect(result.inStock).toBe(true);
    });

    it('should mark item as back in stock when previous stock was 0', () => {
      const result = calculateStockStatus(10, 'available', 0);
      expect(result.backInStock).toBe(true);
    });

    it('should not mark as back in stock when previous stock was > 0', () => {
      const result = calculateStockStatus(10, 'available', 5);
      expect(result.backInStock).toBe(false);
    });
  });

  describe('calculatePriceChange', () => {
    it('should calculate drop percentage correctly', () => {
      const result = calculatePriceChange(800, 1000);
      expect(result.hasDropped).toBe(true);
      expect(result.dropPercentage).toBe(20);
    });

    it('should return null drop percentage when price increased', () => {
      const result = calculatePriceChange(1200, 1000);
      expect(result.hasDropped).toBe(false);
      expect(result.dropPercentage).toBe(0);
    });

    it('should return null previous price when not provided', () => {
      const result = calculatePriceChange(1000, null);
      expect(result.previousPrice).toBeNull();
      expect(result.hasDropped).toBe(false);
    });

    it('should handle zero previous price', () => {
      const result = calculatePriceChange(1000, 0);
      expect(result.dropPercentage).toBeNull();
    });
  });

  describe('getAvailabilityBadge', () => {
    it('should return out of stock badge when out of stock', () => {
      const stockStatus = {
        inStock: false,
        lowStock: false,
        outOfStock: true,
        backInStock: false,
        availableStock: 0,
        inventoryStatus: 'out_of_stock',
      };
      const badge = getAvailabilityBadge(stockStatus);
      expect(badge.label).toBe('Out of Stock');
      expect(badge.variant).toBe('error');
      expect(badge.show).toBe(true);
    });

    it('should return low stock badge when low stock', () => {
      const stockStatus = {
        inStock: true,
        lowStock: true,
        outOfStock: false,
        backInStock: false,
        availableStock: 3,
        inventoryStatus: 'available',
      };
      const badge = getAvailabilityBadge(stockStatus);
      expect(badge.label).toBe('Low Stock (3 left)');
      expect(badge.variant).toBe('warning');
      expect(badge.show).toBe(true);
    });

    it('should return back in stock badge when back in stock', () => {
      const stockStatus = {
        inStock: true,
        lowStock: false,
        outOfStock: false,
        backInStock: true,
        availableStock: 10,
        inventoryStatus: 'available',
      };
      const badge = getAvailabilityBadge(stockStatus);
      expect(badge.label).toBe('Back in Stock!');
      expect(badge.variant).toBe('success');
      expect(badge.show).toBe(true);
    });

    it('should not show badge for normal in stock', () => {
      const stockStatus = {
        inStock: true,
        lowStock: false,
        outOfStock: false,
        backInStock: false,
        availableStock: 10,
        inventoryStatus: 'available',
      };
      const badge = getAvailabilityBadge(stockStatus);
      expect(badge.show).toBe(false);
    });
  });

  describe('getPriceDropBadge', () => {
    it('should return badge for significant price drop', () => {
      const priceChange = {
        previousPrice: 1000,
        currentPrice: 800,
        dropPercentage: 20,
        hasDropped: true,
      };
      const badge = getPriceDropBadge(priceChange);
      expect(badge).not.toBeNull();
      expect(badge?.label).toBe('20% OFF');
      expect(badge?.show).toBe(true);
    });

    it('should not show badge for small price drop (< 5%)', () => {
      const priceChange = {
        previousPrice: 1000,
        currentPrice: 960,
        dropPercentage: 4,
        hasDropped: true,
      };
      const badge = getPriceDropBadge(priceChange);
      expect(badge?.show).toBe(false);
    });

    it('should return null when price has not dropped', () => {
      const priceChange = {
        previousPrice: 1000,
        currentPrice: 1200,
        dropPercentage: 0,
        hasDropped: false,
      };
      const badge = getPriceDropBadge(priceChange);
      expect(badge).toBeNull();
    });
  });

  describe('shouldNotifyAvailability', () => {
    it('should notify on back in stock', () => {
      const availabilityInfo = {
        stockStatus: {
          inStock: true,
          lowStock: false,
          outOfStock: false,
          backInStock: true,
          availableStock: 10,
          inventoryStatus: 'available',
        },
        priceChange: {
          previousPrice: null,
          currentPrice: 1000,
          dropPercentage: null,
          hasDropped: false,
        },
        lastChecked: new Date(),
      };
      const result = shouldNotifyAvailability(availabilityInfo);
      expect(result.notify).toBe(true);
      expect(result.reason).toBe('back_in_stock');
    });

    it('should notify on significant price drop (>= 10%)', () => {
      const availabilityInfo = {
        stockStatus: {
          inStock: true,
          lowStock: false,
          outOfStock: false,
          backInStock: false,
          availableStock: 10,
          inventoryStatus: 'available',
        },
        priceChange: {
          previousPrice: 1000,
          currentPrice: 800,
          dropPercentage: 20,
          hasDropped: true,
        },
        lastChecked: new Date(),
      };
      const result = shouldNotifyAvailability(availabilityInfo);
      expect(result.notify).toBe(true);
      expect(result.reason).toBe('price_drop');
    });

    it('should not notify on small price drop (< 10%)', () => {
      const availabilityInfo = {
        stockStatus: {
          inStock: true,
          lowStock: false,
          outOfStock: false,
          backInStock: false,
          availableStock: 10,
          inventoryStatus: 'available',
        },
        priceChange: {
          previousPrice: 1000,
          currentPrice: 950,
          dropPercentage: 5,
          hasDropped: true,
        },
        lastChecked: new Date(),
      };
      const result = shouldNotifyAvailability(availabilityInfo);
      expect(result.notify).toBe(false);
    });

    it('should not notify on low stock by default', () => {
      const availabilityInfo = {
        stockStatus: {
          inStock: true,
          lowStock: true,
          outOfStock: false,
          backInStock: false,
          availableStock: 3,
          inventoryStatus: 'available',
        },
        priceChange: {
          previousPrice: null,
          currentPrice: 1000,
          dropPercentage: null,
          hasDropped: false,
        },
        lastChecked: new Date(),
      };
      const result = shouldNotifyAvailability(availabilityInfo);
      expect(result.notify).toBe(false);
    });
  });

  describe('updateItemAvailability', () => {
    it('should update item with stock status', () => {
      const item: WishlistItem = {
        id: 'item-1',
        productId: 'product-1',
        variantId: null,
        addedAt: '2024-01-01T00:00:00Z',
        priceSnapshot: 1000,
        product: {
          id: 'product-1',
          name: 'Test Product',
          slug: 'test-product',
          basePrice: 1000,
          compareAtPrice: null,
          isActive: true,
          status: 'published',
        },
      };

      const availabilityInfo = {
        stockStatus: {
          inStock: true,
          lowStock: false,
          outOfStock: false,
          backInStock: false,
          availableStock: 10,
          inventoryStatus: 'available',
        },
        priceChange: {
          previousPrice: null,
          currentPrice: 1000,
          dropPercentage: null,
          hasDropped: false,
        },
        lastChecked: new Date(),
      };

      const updated = updateItemAvailability(item, availabilityInfo);
      expect(updated.stockStatus).toEqual(availabilityInfo.stockStatus);
    });

    it('should add price drop when price has dropped', () => {
      const item: WishlistItem = {
        id: 'item-1',
        productId: 'product-1',
        variantId: null,
        addedAt: '2024-01-01T00:00:00Z',
        priceSnapshot: 1000,
        product: {
          id: 'product-1',
          name: 'Test Product',
          slug: 'test-product',
          basePrice: 1000,
          compareAtPrice: null,
          isActive: true,
          status: 'published',
        },
      };

      const availabilityInfo = {
        stockStatus: {
          inStock: true,
          lowStock: false,
          outOfStock: false,
          backInStock: false,
          availableStock: 10,
          inventoryStatus: 'available',
        },
        priceChange: {
          previousPrice: 1000,
          currentPrice: 800,
          dropPercentage: 20,
          hasDropped: true,
        },
        lastChecked: new Date(),
      };

      const updated = updateItemAvailability(item, availabilityInfo);
      expect(updated.priceDrop).toBeDefined();
      expect(updated.priceDrop?.dropPercentage).toBe(20);
    });
  });

  describe('getAvailabilitySummary', () => {
    it('should calculate summary correctly', () => {
      const items: WishlistItem[] = [
        {
          id: 'item-1',
          productId: 'product-1',
          variantId: null,
          addedAt: '2024-01-01T00:00:00Z',
          priceSnapshot: 1000,
          product: {
            id: 'product-1',
            name: 'Test Product',
            slug: 'test-product',
            basePrice: 1000,
            compareAtPrice: null,
            isActive: true,
            status: 'published',
          },
          stockStatus: {
            inStock: true,
            lowStock: false,
            outOfStock: false,
            backInStock: false,
            availableStock: 10,
            inventoryStatus: 'available',
          },
        },
        {
          id: 'item-2',
          productId: 'product-2',
          variantId: null,
          addedAt: '2024-01-01T00:00:00Z',
          priceSnapshot: 1000,
          product: {
            id: 'product-2',
            name: 'Test Product 2',
            slug: 'test-product-2',
            basePrice: 1000,
            compareAtPrice: null,
            isActive: true,
            status: 'published',
          },
          stockStatus: {
            inStock: false,
            lowStock: false,
            outOfStock: true,
            backInStock: false,
            availableStock: 0,
            inventoryStatus: 'out_of_stock',
          },
          priceDrop: {
            previousPrice: 1000,
            currentPrice: 800,
            dropPercentage: 20,
          },
        },
      ];

      const summary = getAvailabilitySummary(items);
      expect(summary.total).toBe(2);
      expect(summary.inStock).toBe(1);
      expect(summary.outOfStock).toBe(1);
      expect(summary.priceDrops).toBe(1);
    });

    it('should handle items without stock status', () => {
      const items: WishlistItem[] = [
        {
          id: 'item-1',
          productId: 'product-1',
          variantId: null,
          addedAt: '2024-01-01T00:00:00Z',
          priceSnapshot: 1000,
          product: {
            id: 'product-1',
            name: 'Test Product',
            slug: 'test-product',
            basePrice: 1000,
            compareAtPrice: null,
            isActive: true,
            status: 'published',
          },
        },
      ];

      const summary = getAvailabilitySummary(items);
      expect(summary.total).toBe(1);
      expect(summary.inStock).toBe(0);
      expect(summary.outOfStock).toBe(0);
    });
  });
});
