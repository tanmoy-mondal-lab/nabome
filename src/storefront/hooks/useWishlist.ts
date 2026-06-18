import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api/client";
import { useAuthStore } from "../../stores/auth-store";

export function useWishlist() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, accessToken } = useAuthStore();

  const fetch = useCallback(async () => {
    if (!isAuthenticated) { setItems([]); return; }
    setLoading(true);
    try {
      const res = await api.get<{ items: Record<string, unknown>[] }>("/api/wishlist", { params: { action: "list" } });
      setItems(res.items ?? []);
    } catch { setItems([]); }
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (variantId: string) => {
    await api.post("/api/wishlist", { variantId });
    await fetch();
  };

  const remove = async (variantId: string) => {
    await api.delete("/api/wishlist", { params: { variantId } });
    setItems((prev) => prev.filter((i) => (i.variantId as string) !== variantId));
  };

  const isInWishlist = (variantId: string) => items.some((i) => (i.variantId as string) === variantId);

  return { items, loading, add, remove, isInWishlist, refresh: fetch };
}
