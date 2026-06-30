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

    const { accessToken, refreshToken, expiresAt, user, setUser, setLoading, clearAuth, setTokens } =
      useAuthStore.getState();

    if (!accessToken) {
      useCartStore.getState().switchUser();
      setLoading(false);
      return;
    }

    if (expiresAt && Date.now() / 1000 > expiresAt) {
      if (refreshToken) {
        authApi
          .refresh(refreshToken)
          .then((res) => {
            setTokens(res.session.accessToken, res.session.refreshToken, res.session.expiresAt);
            return authApi.me();
          })
          .then((res) => {
            setUser(res.user);
            useCartStore.getState().switchUser();
          })
          .catch(() => {
            clearAuth();
            useCartStore.getState().switchUser();
          })
          .finally(() => setLoading(false));
      } else {
        clearAuth();
        useCartStore.getState().switchUser();
        setLoading(false);
      }
      return;
    }

    if (!user) {
      authApi
        .me()
        .then((res) => {
          setUser(res.user);
          useCartStore.getState().switchUser();
        })
        .catch(() => {
          clearAuth();
          useCartStore.getState().switchUser();
        })
        .finally(() => setLoading(false));
    } else {
      useCartStore.getState().switchUser();
      setLoading(false);
    }
  }, [hydrated]);

  return null;
}
