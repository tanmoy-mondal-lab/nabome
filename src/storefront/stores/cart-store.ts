import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "../../stores/auth-store";

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

// ── Per-user cart storage ──
// Reads the current user ID from the auth store's localStorage
// so each user (and guest) gets their own isolated cart.

const CART_STORAGE_KEY = "nabome-cart";

function getUserId(): string {
  const auth = useAuthStore.getState();
  return auth.user?.id ?? "guest";
}

const userCartStorage = {
  getItem: (name: string) => {
    const raw = localStorage.getItem(`${name}-${getUserId()}`);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  setItem: (name: string, value: { state: unknown; version?: number }) => {
    localStorage.setItem(`${name}-${getUserId()}`, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(`${name}-${getUserId()}`);
  },
};

function hasAuthenticatedSession(): boolean {
  const auth = useAuthStore.getState();
  // Security: Session check via isAuthenticated flag (cookies handle tokens)
  return auth.isAuthenticated;
}

function setGuestCartState(): void {
  const data = userCartStorage.getItem(CART_STORAGE_KEY);
  if (data?.state) {
    useCartStore.setState({
      items: data.state.items ?? [],
      couponCode: data.state.couponCode ?? null,
      discount: data.state.discount ?? 0,
      discountType: data.state.discountType ?? null,
      justAdded: null,
    });
    return;
  }

  useCartStore.setState({
    items: [],
    couponCode: null,
    discount: 0,
    discountType: null,
    justAdded: null,
  });
}

function applyServerCartState(payload: {
  items: CartItem[];
  couponCode?: string | null;
  discount?: number;
  discountType?: "percentage" | "fixed" | null;
}): void {
  const current = useCartStore.getState();
  useCartStore.setState({
    items: payload.items,
    couponCode: payload.couponCode ?? current.couponCode,
    discount: payload.discount ?? current.discount,
    discountType: payload.discountType ?? current.discountType,
    justAdded: null,
  });
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
  discountType: "percentage" | "fixed" | null;
  justAdded: string | null;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number, type: "percentage" | "fixed") => void;
  removeCoupon: () => void;
  clearJustAdded: () => void;
  switchUser: () => void;
  applyServerCart: (payload: {
    items: CartItem[];
    couponCode?: string | null;
    discount?: number;
    discountType?: "percentage" | "fixed" | null;
  }) => void;
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
      justAdded: null,

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
            justAdded: item.variantId,
          });
        } else {
          set({
            items: [...items, { ...item, id: crypto.randomUUID() }],
            justAdded: item.variantId,
          });
        }
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity < 1) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: Math.min(quantity, i.maxQuantity) } : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [], couponCode: null, discount: 0, discountType: null, justAdded: null });
      },

      applyCoupon: (code, discount, type) => set({ couponCode: code, discount, discountType: type }),

      removeCoupon: () => set({ couponCode: null, discount: 0, discountType: null }),

      clearJustAdded: () => set({ justAdded: null }),

      switchUser: () => {
        if (hasAuthenticatedSession()) {
          // Server cart should be hydrated by the useCartSync hook
          return;
        }
        setGuestCartState();
      },

      applyServerCart: (payload) => {
        applyServerCartState(payload);
      },

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      discountAmount: () => {
        const sub = get().subtotal();
        if (!get().discountType) return 0;
        const raw = get().discountType === "percentage" ? sub * (get().discount / 100) : get().discount;
        return Math.round(raw * 100) / 100;
      },

      total: () => {
        const sub = get().subtotal();
        const raw = sub - get().discountAmount();
        return Math.max(0, Math.round(raw * 100) / 100);
      },
    }),
    { name: CART_STORAGE_KEY, storage: userCartStorage }
  )
);
