import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from '@/storefront/stores/cart-store';

// Mock haptic to avoid navigator.vibrate errors
vi.mock('@/lib/utils/haptic', () => ({
  hapticSuccess: vi.fn(),
}));

const mockItem = {
  productId: 'prod-1',
  variantId: 'var-1',
  name: 'Test Product',
  slug: 'test-product',
  sku: 'SKU-001',
  size: 'M',
  color: 'Blue',
  colorHex: '#3B82F6',
  image: 'https://example.com/image.jpg',
  price: 999,
  compareAtPrice: 1499,
  quantity: 1,
  maxQuantity: 10,
};

const mockItem2 = {
  ...mockItem,
  variantId: 'var-2',
  name: 'Test Product 2',
  slug: 'test-product-2',
  sku: 'SKU-002',
  price: 1999,
};

describe('cart-store', () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [],
      couponCode: null,
      discount: 0,
      discountType: null,
      justAdded: null,
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', () => {
      useCartStore.getState().addItem(mockItem);
      const items = useCartStore.getState().items;
      expect(items.length).toBe(1);
      expect(items[0].variantId).toBe('var-1');
      expect(items[0].quantity).toBe(1);
    });

    it('should set justAdded indicator', () => {
      useCartStore.getState().addItem(mockItem);
      expect(useCartStore.getState().justAdded).toBe('var-1');
    });

    it('should increment quantity for existing item', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem);
      const items = useCartStore.getState().items;
      expect(items.length).toBe(1);
      expect(items[0].quantity).toBe(2);
    });

    it('should cap quantity at maxQuantity', () => {
      useCartStore.setState({ items: [{ ...mockItem, quantity: 9, id: '1', maxQuantity: 10 }] });
      useCartStore.getState().addItem({ ...mockItem, quantity: 5 });
      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(10);
    });

    it('should add different items separately', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      const items = useCartStore.getState().items;
      expect(items.length).toBe(2);
    });

    it('should generate unique id for each item', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      const items = useCartStore.getState().items;
      expect(items[0].id).not.toBe(items[1].id);
    });
  });

  describe('removeItem', () => {
    it('should remove item by variantId', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      useCartStore.getState().removeItem('var-1');
      const items = useCartStore.getState().items;
      expect(items.length).toBe(1);
      expect(items[0].variantId).toBe('var-2');
    });

    it('should handle removing non-existent item', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().removeItem('non-existent');
      expect(useCartStore.getState().items.length).toBe(1);
    });

    it('should handle removing from empty cart', () => {
      useCartStore.getState().removeItem('var-1');
      expect(useCartStore.getState().items.length).toBe(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity('var-1', 5);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('should remove item when quantity < 1', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity('var-1', 0);
      expect(useCartStore.getState().items.length).toBe(0);
    });

    it('should cap quantity at maxQuantity', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity('var-1', 100);
      expect(useCartStore.getState().items[0].quantity).toBe(10);
    });

    it('should handle quantity of exactly 1', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity('var-1', 1);
      expect(useCartStore.getState().items[0].quantity).toBe(1);
    });
  });

  describe('clearCart', () => {
    it('should clear all items', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      useCartStore.getState().clearCart();
      expect(useCartStore.getState().items.length).toBe(0);
    });

    it('should clear coupon', () => {
      useCartStore.getState().applyCoupon('TEST10', 10, 'percentage');
      useCartStore.getState().clearCart();
      expect(useCartStore.getState().couponCode).toBeNull();
      expect(useCartStore.getState().discount).toBe(0);
    });
  });

  describe('applyCoupon / removeCoupon', () => {
    it('should apply percentage coupon', () => {
      useCartStore.getState().applyCoupon('TEST10', 10, 'percentage');
      expect(useCartStore.getState().couponCode).toBe('TEST10');
      expect(useCartStore.getState().discount).toBe(10);
      expect(useCartStore.getState().discountType).toBe('percentage');
    });

    it('should apply fixed coupon', () => {
      useCartStore.getState().applyCoupon('FLAT100', 100, 'fixed');
      expect(useCartStore.getState().couponCode).toBe('FLAT100');
      expect(useCartStore.getState().discountType).toBe('fixed');
    });

    it('should remove coupon', () => {
      useCartStore.getState().applyCoupon('TEST10', 10, 'percentage');
      useCartStore.getState().removeCoupon();
      expect(useCartStore.getState().couponCode).toBeNull();
      expect(useCartStore.getState().discount).toBe(0);
      expect(useCartStore.getState().discountType).toBeNull();
    });
  });

  describe('clearJustAdded', () => {
    it('should clear justAdded indicator', () => {
      useCartStore.getState().addItem(mockItem);
      expect(useCartStore.getState().justAdded).toBe('var-1');
      useCartStore.getState().clearJustAdded();
      expect(useCartStore.getState().justAdded).toBeNull();
    });
  });

  describe('computed: itemCount', () => {
    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().itemCount()).toBe(0);
    });

    it('should sum quantities', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      expect(useCartStore.getState().itemCount()).toBe(3);
    });
  });

  describe('computed: subtotal', () => {
    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().subtotal()).toBe(0);
    });

    it('should calculate single item subtotal', () => {
      useCartStore.getState().addItem(mockItem);
      expect(useCartStore.getState().subtotal()).toBe(999);
    });

    it('should calculate multi-item subtotal', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      expect(useCartStore.getState().subtotal()).toBe(2998);
    });

    it('should calculate subtotal with quantity > 1', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity('var-1', 3);
      expect(useCartStore.getState().subtotal()).toBe(2997);
    });
  });

  describe('computed: discountAmount', () => {
    it('should return 0 with no coupon', () => {
      useCartStore.getState().addItem(mockItem);
      expect(useCartStore.getState().discountAmount()).toBe(0);
    });

    it('should calculate percentage discount', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().applyCoupon('TEST10', 10, 'percentage');
      expect(useCartStore.getState().discountAmount()).toBe(99.9);
    });

    it('should calculate fixed discount', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().applyCoupon('FLAT100', 100, 'fixed');
      expect(useCartStore.getState().discountAmount()).toBe(100);
    });
  });

  describe('computed: total', () => {
    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().total()).toBe(0);
    });

    it('should return subtotal without discount', () => {
      useCartStore.getState().addItem(mockItem);
      expect(useCartStore.getState().total()).toBe(999);
    });

    it('should subtract percentage discount', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().applyCoupon('TEST10', 10, 'percentage');
      expect(useCartStore.getState().total()).toBe(899.1);
    });

    it('should subtract fixed discount', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().applyCoupon('FLAT100', 100, 'fixed');
      expect(useCartStore.getState().total()).toBe(899);
    });

    it('should not go below 0', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().applyCoupon('MEGA', 99999, 'fixed');
      expect(useCartStore.getState().total()).toBe(0);
    });
  });
});
