import { useEffect, useRef } from "react";
import { useAuthStore } from "../../stores/auth-store";
import { api } from "../../lib/api/client";
import type { CartItem } from "../stores/cart-store";

const MAX_SYNC_FAILURES = 3;
const SYNC_DELAY_MS = 250;

interface UseCartSyncOptions {
  onSyncFailure?: (failures: number) => void;
  onServerCartLoaded?: (cart: {
    items: CartItem[];
    couponCode: string | null;
    discount: number;
    discountType: "percentage" | "fixed" | null;
  }) => void;
}

export function useCartSync(
  items: CartItem[],
  options: UseCartSyncOptions = {}
) {
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncFailureCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const hasAuthenticatedSession = () => {
    const auth = useAuthStore.getState();
    // Security: Session check via isAuthenticated flag (cookies handle tokens)
    return auth.isAuthenticated;
  };

  const toServerItems = (cartItems: CartItem[]): Array<{ variantId: string; quantity: number }> => {
    return cartItems.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));
  };

  const syncServerCart = async () => {
    if (!hasAuthenticatedSession() || !isMountedRef.current) return;

    try {
      await api.post("/cart/sync", {
        items: toServerItems(items),
      });
      syncFailureCountRef.current = 0;
    } catch {
      syncFailureCountRef.current++;
      if (syncFailureCountRef.current >= MAX_SYNC_FAILURES && options.onSyncFailure) {
        options.onSyncFailure(syncFailureCountRef.current);
      }
    }
  };

  const queueServerSync = () => {
    if (!hasAuthenticatedSession()) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncTimerRef.current = null;
      void syncServerCart();
    }, SYNC_DELAY_MS);
  };

  const hydrateServerCart = async () => {
    if (!hasAuthenticatedSession() || !isMountedRef.current) return;

    try {
      const cart = await api.get<{
        items: CartItem[];
        couponCode: string | null;
        discount: number;
        discountType: "percentage" | "fixed" | null;
      }>("/cart");
      if (isMountedRef.current && options.onServerCartLoaded) {
        options.onServerCartLoaded(cart);
      }
    } catch {
      // Keep the current cart if the network is unavailable
    }
  };

  const mergeGuestCartOnServer = async (guestItems?: CartItem[]) => {
    if (!hasAuthenticatedSession() || !isMountedRef.current) return;

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    const payload = toServerItems(guestItems ?? items);
    if (payload.length > 0) {
      try {
        await api.post("/cart/merge", { items: payload });
      } catch {
        // Fall back to the current local cart if merge fails
        return;
      }
    }

    // Clean up old guest cart data from localStorage after successful merge
    try {
      const guestKey = "nabome-cart-guest";
      if (localStorage.getItem(guestKey)) {
        localStorage.removeItem(guestKey);
      }
    } catch {
      // Silently continue if localStorage is unavailable
    }

    await hydrateServerCart();
  };

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  return {
    queueServerSync,
    hydrateServerCart,
    mergeGuestCartOnServer,
    syncFailureCount: syncFailureCountRef.current,
  };
}
