// ─────────────────────────────────────────────────────────────
// RECENTLY VIEWED HOOK
// ─────────────────────────────────────────────────────────────
// Tracks recently viewed products
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

interface RecentlyViewedItem {
  productId: string;
  timestamp: number;
}

const RECENTLY_VIEWED_KEY = "nabome-recently-viewed";
const MAX_RECENT_ITEMS = 20;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recently viewed:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed, isLoaded]);

  const addToRecentlyViewed = (productId: string) => {
    setRecentlyViewed((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      const newItems = prev.filter((item) => item.productId !== productId);
      
      newItems.unshift({
        productId,
        timestamp: Date.now(),
      });

      return newItems.slice(0, MAX_RECENT_ITEMS);
    });
  };

  const getRecentlyViewedIds = () => {
    return recentlyViewed.map((item) => item.productId);
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    getRecentlyViewedIds,
    clearRecentlyViewed,
    isLoaded,
  };
}
