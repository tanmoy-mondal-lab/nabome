import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth-store";
import { authApi } from "../lib/api/auth";
import { useCartStore } from "../storefront/stores/cart-store";
import { useCartSync } from "../storefront/hooks/useCartSync";

function invalidateCustomerCaches(queryClient: ReturnType<typeof useQueryClient>): void {
  void queryClient.invalidateQueries({ queryKey: ["customer", "notifications"] });
  void queryClient.invalidateQueries({ queryKey: ["loyalty", "points"] });
  void queryClient.invalidateQueries({ queryKey: ["customer", "wishlist"] });
  void queryClient.invalidateQueries({ queryKey: ["customer", "dashboard"] });
  void queryClient.invalidateQueries({ queryKey: ["customer", "orders"] });
}

export function AuthLoader() {
  const queryClient = useQueryClient();
  const hydrated = useAuthStore.persist?.hasHydrated?.() ?? false;
  const ran = useRef(false);
  const { items } = useCartStore();
  const { mergeGuestCartOnServer, hydrateServerCart } = useCartSync(items);

  useEffect(() => {
    if (!hydrated) return;
    if (ran.current) return;
    ran.current = true;

    const doInit = async () => {
      const { accessToken, refreshToken, expiresAt, user, setUser, setLoading, clearAuth, setTokens } =
        useAuthStore.getState();

      if (!accessToken) {
        useCartStore.getState().switchUser();
        setLoading(false);
        return;
      }

      if (expiresAt && Date.now() / 1000 > expiresAt) {
        if (refreshToken) {
          try {
            const res = await authApi.refresh(refreshToken);
            setTokens(res.session.accessToken, res.session.refreshToken, res.session.expiresAt);
            const meRes = await authApi.me();
            setUser(meRes.user);
            await mergeGuestCartOnServer();
            invalidateCustomerCaches(queryClient);
          } catch {
            clearAuth();
            useCartStore.getState().switchUser();
          }
        } else {
          clearAuth();
          useCartStore.getState().switchUser();
        }
        setLoading(false);
        return;
      }

      if (!user) {
        try {
          const res = await authApi.me();
          setUser(res.user);
          await mergeGuestCartOnServer();
          invalidateCustomerCaches(queryClient);
        } catch {
          clearAuth();
          useCartStore.getState().switchUser();
        }
        setLoading(false);
      } else {
        useCartStore.getState().switchUser();
        await hydrateServerCart();
        invalidateCustomerCaches(queryClient);
        setLoading(false);
      }
    };

    void doInit();
  }, [hydrated, queryClient, mergeGuestCartOnServer, hydrateServerCart]);

  return null;
}
