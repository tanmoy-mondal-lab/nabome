import { useEffect } from "react";
import { useCartStore } from "../stores/cart-store";
import { useAuthStore } from "../../stores/auth-store";
import { useCartSync } from "./useCartSync";
import { useCartEffects } from "./useCartEffects";
import type { CartItem } from "../stores/cart-store";

export function useCart() {
  const store = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { queueServerSync, hydrateServerCart, mergeGuestCartOnServer } = useCartSync(store.items, {
    onServerCartLoaded: (cart) => store.applyServerCart(cart),
  });
  const { triggerHapticSuccess } = useCartEffects(store.justAdded, {
    clearJustAdded: store.clearJustAdded,
  });

  // Sync cart to server on mutations for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      queueServerSync();
    }
  }, [store.items, isAuthenticated, queueServerSync]);

  // Hydrate server cart on mount for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      void hydrateServerCart();
    }
  }, [isAuthenticated, hydrateServerCart]);

  const addItem = (item: Omit<CartItem, "id">) => {
    store.addItem(item);
    triggerHapticSuccess();
  };

  return {
    items: store.items,
    itemCount: store.itemCount(),
    subtotal: store.subtotal(),
    discountAmount: store.discountAmount(),
    total: store.total(),
    couponCode: store.couponCode,
    addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    applyCoupon: store.applyCoupon,
    removeCoupon: store.removeCoupon,
    mergeGuestCart: mergeGuestCartOnServer,
  };
}
