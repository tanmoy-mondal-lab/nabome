import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api/client";
import { useAuthStore } from "../../stores/auth-store";
import type { Product, ProductVariant, ProductImage } from "../../types/product";

interface WishlistItem {
  id: string;
  variantId: string;
  variant?: ProductVariant & {
    product?: Product;
    images?: ProductImage[];
  };
}

interface WishlistResponse {
  items: WishlistItem[];
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const fetch = useCallback(async (signal?: AbortSignal) => {
    if (!isAuthenticated) { setItems([]); setError(null); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<WishlistResponse>("/wishlist", { signal });
      setItems(res.items ?? []);
    } catch {
      if (signal?.aborted) return;
      setItems([]);
      setError("Failed to load wishlist.");
    }
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => { void fetch(); }, [fetch]);

  const add = async (variantId: string) => {
    if (!isAuthenticated) return;
    const alreadyExists = items.some((i) => i.variantId === variantId);
    if (alreadyExists) return;

    const placeholder: WishlistItem = { id: `optimistic-${variantId}`, variantId, _optimistic: true } as WishlistItem & { _optimistic: boolean };
    setItems((prev) => [placeholder, ...prev]);

    try {
      await api.post("/wishlist", { variantId });
      await fetch();
    } catch {
      setItems((prev) => prev.filter((i) => i.variantId !== variantId));
    }
  };

  const remove = async (variantId: string) => {
    if (!isAuthenticated) return;
    const previous = items;
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));

    try {
      await api.delete(`/wishlist/${variantId}`);
    } catch {
      setItems(previous);
    }
  };

  const isInWishlist = (variantId: string) => items.some((i) => i.variantId === variantId);

  return { items, loading, error, add, remove, isInWishlist, refresh: fetch };
}
