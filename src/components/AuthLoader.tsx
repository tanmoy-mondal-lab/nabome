import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth-store";
import { authApi } from "../lib/api/auth";
import { ApiError } from "../lib/api/client";
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
  const ran = useRef(false);
  const { items } = useCartStore();
  const { mergeGuestCartOnServer, hydrateServerCart } = useCartSync(items);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const doInit = async () => {
      const { setUser, setLoading, clearAuth } = useAuthStore.getState();

      // Security: Session restoration via API call (cookies handle tokens)
      try {
        const res = await authApi.me();
        setUser(res.user);
        await mergeGuestCartOnServer();
        invalidateCustomerCaches(queryClient);
      } catch (err) {
        // Only treat a genuine auth failure as "not logged in". Transient
        // errors (network blip, 5xx) must not clear an otherwise valid session
        // on a flaky page load.
        if (err instanceof ApiError && err.status === 401) {
          clearAuth();
          useCartStore.getState().switchUser();
        }
      }
      setLoading(false);
    };

    void doInit();
  }, [queryClient, mergeGuestCartOnServer, hydrateServerCart]);

  return null;
}
