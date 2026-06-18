import { useCartStore } from "../../../storefront/stores/cart-store";

export function useCart() {
  const store = useCartStore();
  return {
    items: store.items,
    itemCount: store.itemCount(),
    subtotal: store.subtotal(),
    discountAmount: store.discountAmount(),
    total: store.total(),
    couponCode: store.couponCode,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    applyCoupon: store.applyCoupon,
    removeCoupon: store.removeCoupon,
  };
}
