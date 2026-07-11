import { useCallback, useEffect, useRef } from "react";
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

  // Keep the latest items in a ref so the memoized callbacks below always read
  // current data without needing `items` in their dependency arrays. This
  // prevents the callbacks from being recreated every render (which previously
  // retriggered the cart-sync/hydrate effects in an infinite loop).
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const optionsRef = useRef(options);
  optionsRef.current = options;

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

  const syncServerCart = useCallback(async () => {
    if (!hasAuthenticatedSession() || !isMountedRef.current) return;

    try {
      await api.post("/cart/sync", {
        items: toServerItems(itemsRef.current),
      });
      syncFailureCountRef.current = 0;
    } catch {
      syncFailureCountRef.current++;
      if (syncFailureCountRef.current >= MAX_SYNC_FAILURES && optionsRef.current.onSyncFailure) {
        optionsRef.current.onSyncFailure(syncFailureCountRef.current);
      }
    }
  }, []);

  const queueServerSync = useCallback(() => {
    if (!hasAuthenticatedSession()) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncTimerRef.current = null;
      void syncServerCart();
    }, SYNC_DELAY_MS);
  }, [syncServerCart]);

  const hydrateServerCart = useCallback(async () => {
    if (!hasAuthenticatedSession() || !isMountedRef.current) return;

    try {
      const cart = await api.get<{
        items: CartItem[];
        couponCode: string | null;
        discount: number;
        discountType: "percentage" | "fixed" | null;
      }>("/cart");
      if (isMountedRef.current && optionsRef.current.onServerCartLoaded) {
        optionsRef.current.onServerCartLoaded(cart);
      }
    } catch {
      // Keep the current cart if the network is unavailable
    }
  }, []);

  const mergeGuestCartOnServer = useCallback(async (guestItems?: CartItem[]) => {
    if (!hasAuthenticatedSession() || !isMountedRef.current) return;

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    const payload = toServerItems(guestItems ?? itemsRef.current);
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
  }, [hydrateServerCart]);

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
