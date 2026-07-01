import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api/client";
import { useAuthStore } from "../../stores/auth-store";

export function useWishlist() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const fetch = useCallback(async () => {
    if (!isAuthenticated) { setItems([]); setError(null); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ items: Record<string, unknown>[] }>("/api/wishlist");
      setItems(res.items ?? []);
    } catch {
      setItems([]);
      setError("Failed to load wishlist.");
    }
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (variantId: string) => {
    if (!isAuthenticated) return;
    // Optimistic: add immediately if not already present
    const alreadyExists = items.some((i) => (i.variantId as string) === variantId);
    if (alreadyExists) return;

    // Optimistically add a placeholder
    const placeholder = { variantId, _optimistic: true };
    setItems((prev) => [placeholder, ...prev]);

    try {
      await api.post("/api/wishlist", { variantId });
      // Re-fetch to get full data with product info
      await fetch();
    } catch {
      // Rollback on error
      setItems((prev) => prev.filter((i) => (i.variantId as string) !== variantId));
    }
  };

  const remove = async (variantId: string) => {
    if (!isAuthenticated) return;
    // Optimistic: remove immediately
    const previous = items;
    setItems((prev) => prev.filter((i) => (i.variantId as string) !== variantId));

    try {
      await api.delete(`/api/wishlist/${variantId}`);
    } catch {
      // Rollback on error
      setItems(previous);
    }
  };

  const isInWishlist = (variantId: string) => items.some((i) => (i.variantId as string) === variantId);

  return { items, loading, error, add, remove, isInWishlist, refresh: fetch };
}
