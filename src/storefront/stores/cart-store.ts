import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  image: string;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
  discountType: "percentage" | "fixed" | null;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number, type: "percentage" | "fixed") => void;
  removeCoupon: () => void;
  itemCount: () => number;
  subtotal: () => number;
  discountAmount: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discount: 0,
      discountType: null,

      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.variantId === item.variantId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.maxQuantity) }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, id: crypto.randomUUID() }] });
        }
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: Math.min(quantity, i.maxQuantity) } : i
          ),
        });
      },

      clearCart: () => set({ items: [], couponCode: null, discount: 0, discountType: null }),

      applyCoupon: (code, discount, type) => set({ couponCode: code, discount, discountType: type }),

      removeCoupon: () => set({ couponCode: null, discount: 0, discountType: null }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      discountAmount: () => {
        const sub = get().subtotal();
        if (!get().discountType) return 0;
        return get().discountType === "percentage" ? sub * (get().discount / 100) : get().discount;
      },

      total: () => {
        const sub = get().subtotal();
        return Math.max(0, sub - get().discountAmount());
      },
    }),
    { name: "nabome-cart" }
  )
);
