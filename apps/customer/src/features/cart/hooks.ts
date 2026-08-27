/**
 * Cart React Hooks
 *
 * Custom React hooks for cart operations.
 * These hooks provide a convenient interface for components to interact with the cart.
 */

import { useCallback } from 'react';

import { getOrCreateGuestId, clearGuestId } from '../../lib/guest-id';
import { useAuthStore } from '../../stores/auth-store';
import { useCartStore } from '../../stores/cart-store';

/**
 * Hook for cart operations
 */
export function useCart() {
  const {
    cart,
    totals,
    isLoading,
    error,
    isOpen,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    mergeCart,
    validateCart,
    setIsOpen,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const handleAddItem = useCallback(
    async (variantId: string, quantity: number = 1) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      const guestId = userId ? undefined : getOrCreateGuestId();
      await addItem(variantId, quantity, userId, guestId);
    },
    [addItem],
  );

  const handleUpdateItem = useCallback(
    async (itemId: string, quantity?: number, variantId?: string) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      const guestId = userId ? undefined : getOrCreateGuestId();
      await updateItem(itemId, quantity, variantId, userId, guestId);
    },
    [updateItem],
  );

  const handleRemoveItem = useCallback(
    async (itemId: string) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      const guestId = userId ? undefined : getOrCreateGuestId();
      await removeItem(itemId, userId, guestId);
    },
    [removeItem],
  );

  const handleClearCart = useCallback(async () => {
    const user = useAuthStore.getState().user;
    const userId = user?.id;
    const guestId = userId ? undefined : getOrCreateGuestId();
    await clearCart(userId, guestId);
  }, [clearCart]);

  const handleMergeCart = useCallback(async () => {
    const user = useAuthStore.getState().user;
    const userId = user?.id;
    const guestId = getOrCreateGuestId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    await mergeCart(guestId, userId);
    // Clear guest ID after successful merge
    clearGuestId();
  }, [mergeCart]);

  const handleValidateCart = useCallback(async () => {
    const user = useAuthStore.getState().user;
    const userId = user?.id;
    const guestId = userId ? undefined : getOrCreateGuestId();
    return validateCart(userId, guestId);
  }, [validateCart]);

  const handleFetchCart = useCallback(async () => {
    const user = useAuthStore.getState().user;
    const userId = user?.id;
    const guestId = userId ? undefined : getOrCreateGuestId();
    await fetchCart(userId, guestId);
  }, [fetchCart]);

  return {
    cart,
    totals,
    isLoading,
    error,
    isOpen,
    addItem: handleAddItem,
    updateItem: handleUpdateItem,
    removeItem: handleRemoveItem,
    clearCart: handleClearCart,
    mergeCart: handleMergeCart,
    validateCart: handleValidateCart,
    fetchCart: handleFetchCart,
    setIsOpen,
    getTotalItems,
    getTotalPrice,
  };
}

/**
 * Hook for cart item count badge
 */
export function useCartCount() {
  const { getTotalItems, fetchCart } = useCartStore();
  const count = getTotalItems();

  // Fetch cart on mount to get initial count
  useCallback(() => {
    const user = useAuthStore.getState().user;
    const userId = user?.id;
    const guestId = userId ? undefined : getOrCreateGuestId();
    fetchCart(userId, guestId);
  }, [fetchCart]);

  return count;
}

/**
 * Hook for cart totals
 */
export function useCartTotals() {
  const { totals, isLoading, error, fetchCart } = useCartStore();

  useCallback(() => {
    const user = useAuthStore.getState().user;
    const userId = user?.id;
    const guestId = userId ? undefined : getOrCreateGuestId();
    fetchCart(userId, guestId);
  }, [fetchCart]);

  return { totals, isLoading, error };
}

/**
 * Hook for cart drawer/sheet state
 */
export function useCartDrawer() {
  const { isOpen, setIsOpen } = useCartStore();

  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggle = useCallback(() => {
    const { isOpen: currentIsOpen } = useCartStore.getState();
    setIsOpen(!currentIsOpen);
  }, [setIsOpen]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
