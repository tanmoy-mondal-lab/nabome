import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/auth-store";
import { authApi } from "../lib/api/auth";

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
          .then((res) => setUser(res.user))
          .catch(() => clearAuth())
          .finally(() => setLoading(false));
      } else {
        clearAuth();
        setLoading(false);
      }
      return;
    }

    if (!user) {
      authApi
        .me()
        .then((res) => setUser(res.user))
        .catch(() => clearAuth())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [hydrated]);

  return null;
}
