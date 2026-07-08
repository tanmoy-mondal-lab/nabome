// ─────────────────────────────────────────────────────────────
// PRODUCT COMPARISON HOOK
// ─────────────────────────────────────────────────────────────
// Manages product comparison functionality
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const COMPARISON_KEY = "nabome-comparison";
const MAX_COMPARISON_ITEMS = 4;

export function useProductComparison() {
  const [comparison, setComparison] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COMPARISON_KEY);
    if (stored) {
      try {
        setComparison(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse comparison:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(COMPARISON_KEY, JSON.stringify(comparison));
    }
  }, [comparison, isLoaded]);

  const addToComparison = (productId: string) => {
    setComparison((prev) => {
      if (prev.includes(productId)) return prev;
      if (prev.length >= MAX_COMPARISON_ITEMS) {
        // Remove the oldest item
        return [...prev.slice(1), productId];
      }
      return [...prev, productId];
    });
  };

  const removeFromComparison = (productId: string) => {
    setComparison((prev) => prev.filter((id) => id !== productId));
  };

  const isInComparison = (productId: string) => {
    return comparison.includes(productId);
  };

  const canAddToComparison = () => {
    return comparison.length < MAX_COMPARISON_ITEMS;
  };

  const clearComparison = () => {
    setComparison([]);
  };

  return {
    comparison,
    addToComparison,
    removeFromComparison,
    isInComparison,
    canAddToComparison,
    clearComparison,
    isLoaded,
    maxItems: MAX_COMPARISON_ITEMS,
  };
}
