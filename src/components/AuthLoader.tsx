import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/auth-store";
import { authApi } from "../lib/api/auth";
import { useCartStore } from "../storefront/stores/cart-store";

export function AuthLoader() {
  const hydrated = useAuthStore.persist?.hasHydrated?.() ?? false;
  const ran = useRef(false);

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
            await useCartStore.getState().mergeGuestCart();
            useCartStore.getState().switchUser();
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
          await useCartStore.getState().mergeGuestCart();
          useCartStore.getState().switchUser();
        } catch {
          clearAuth();
          useCartStore.getState().switchUser();
        }
        setLoading(false);
      } else {
        useCartStore.getState().switchUser();
        setLoading(false);
      }
    };

    doInit();
  }, [hydrated]);

  return null;
}
