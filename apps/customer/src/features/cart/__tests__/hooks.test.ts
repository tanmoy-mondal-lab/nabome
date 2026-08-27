import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useCartStore } from '../../../stores/cart-store';
import { useCart, useCartCount, useCartDrawer } from '../hooks';

vi.mock('../../../stores/cart-store', () => ({
  useCartStore: vi.fn(),
}));

const mockedUseCartStore = vi.mocked(useCartStore);

describe('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return cart state and actions', () => {
    const mockStore: any = {
      cart: null,
      totals: null,
      isLoading: false,
      error: null,
      isOpen: false,
      fetchCart: vi.fn(),
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
      mergeCart: vi.fn(),
      validateCart: vi.fn(),
      setIsOpen: vi.fn(),
      getTotalItems: vi.fn(() => 0),
      getTotalPrice: vi.fn(() => 0),
    };
    mockedUseCartStore.mockReturnValue(mockStore);
    const { result } = renderHook(() => useCart());
    expect(result.current.cart).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('useCartCount', () => {
  it('should return cart item count', () => {
    const mockStore: any = {
      getTotalItems: vi.fn(() => 5),
      fetchCart: vi.fn(),
    };
    mockedUseCartStore.mockReturnValue(mockStore);
    const { result } = renderHook(() => useCartCount());
    expect(result.current).toBe(5);
  });
});

describe('useCartDrawer', () => {
  it('should return drawer state and actions', () => {
    const mockStore: any = { isOpen: false, setIsOpen: vi.fn() };
    mockedUseCartStore.mockReturnValue(mockStore);
    const { result } = renderHook(() => useCartDrawer());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.open).toBeDefined();
  });

  it('should toggle drawer state', () => {
    const mockStore: any = { isOpen: false, setIsOpen: vi.fn() };
    mockedUseCartStore.mockReturnValue(mockStore);
    (mockedUseCartStore as any).getState = vi.fn(() => ({ isOpen: false }));
    const { result } = renderHook(() => useCartDrawer());
    act(() => {
      result.current.toggle();
    });
    expect(mockStore.setIsOpen).toHaveBeenCalledWith(true);
  });
});
