import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../../lib/api/client";
import { useAuthStore } from "../../stores/auth-store";
import { hapticSuccess } from "../../lib/utils/haptic";

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
let syncTimer: ReturnType<typeof setTimeout> | null = null;

function getUserId(): string {
  try {
    const raw = localStorage.getItem("nabome-auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.user?.id ?? "guest";
    }
  } catch {}
  return "guest";
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
  return auth.isAuthenticated && !!auth.accessToken;
}

function toServerItems(items: CartItem[]): Array<{ variantId: string; quantity: number }> {
  return items.map((item) => ({
    variantId: item.variantId,
    quantity: item.quantity,
  }));
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

async function hydrateServerCart(): Promise<void> {
  if (!hasAuthenticatedSession()) return;
  try {
    const cart = await api.get<{
      items: CartItem[];
      couponCode: string | null;
      discount: number;
      discountType: "percentage" | "fixed" | null;
    }>("/cart");
    applyServerCartState(cart);
  } catch {
    // Keep the current cart if the network is unavailable.
  }
}

async function syncServerCart(): Promise<void> {
  if (!hasAuthenticatedSession()) return;

  const { items } = useCartStore.getState();
  try {
    await api.post("/cart/sync", {
      items: toServerItems(items),
    });
  } catch {
    // Keep the local cart; retry on the next mutation.
  }
}

function queueServerSync(): void {
  if (!hasAuthenticatedSession()) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void syncServerCart();
  }, 250);
}

async function mergeGuestCartOnServer(items?: CartItem[]): Promise<void> {
  if (!hasAuthenticatedSession()) return;

  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = null;
  }

  const payload = toServerItems(items ?? useCartStore.getState().items);
  if (payload.length > 0) {
    try {
      await api.post("/cart/merge", { items: payload });
    } catch {
      // Fall back to the current local cart if merge fails.
      return;
    }
  }

  await hydrateServerCart();
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
  hydrateFromServer: () => Promise<void>;
  mergeGuestCart: (items?: CartItem[]) => Promise<void>;
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
        queueServerSync();
        // Clear the "just added" indicator after 2s
        setTimeout(() => { try { get().clearJustAdded(); } catch {} }, 2000);
        hapticSuccess();
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
        queueServerSync();
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
        queueServerSync();
      },

      clearCart: () => {
        set({ items: [], couponCode: null, discount: 0, discountType: null, justAdded: null });
        queueServerSync();
      },

      applyCoupon: (code, discount, type) => set({ couponCode: code, discount, discountType: type }),

      removeCoupon: () => set({ couponCode: null, discount: 0, discountType: null }),

      clearJustAdded: () => set({ justAdded: null }),

      switchUser: () => {
        if (hasAuthenticatedSession()) {
          void hydrateServerCart();
          return;
        }
        setGuestCartState();
      },

      hydrateFromServer: async () => {
        await hydrateServerCart();
      },

      mergeGuestCart: async (items?: CartItem[]) => {
        await mergeGuestCartOnServer(items);
      },

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
    { name: CART_STORAGE_KEY, storage: userCartStorage }
  )
);
