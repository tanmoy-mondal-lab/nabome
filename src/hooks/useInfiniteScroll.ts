// ─────────────────────────────────────────────────────────────
// INFINITE SCROLL HOOK
// ─────────────────────────────────────────────────────────────
// Provides infinite scroll functionality for paginated content
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions<T> {
  fetchMore: (page: number) => Promise<T[]>;
  initialPage?: number;
  pageSize?: number;
  threshold?: number;
}

export function useInfiniteScroll<T>({
  fetchMore,
  initialPage = 1,
  pageSize = 20,
  threshold = 100,
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const newItems = await fetchMore(page);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...newItems]);
        setPage((prev) => prev + 1);
        
        if (newItems.length < pageSize) {
          setHasMore(false);
        }
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMore, page, pageSize, isLoading, hasMore]);

  useEffect(() => {
    // Load initial data
    void loadMore();
     
  }, []);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          void loadMore();
        }
      },
      { threshold: 0.1, rootMargin: `${threshold}px` }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, threshold]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
  }, [initialPage]);

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMoreRef,
    reset,
    loadMore,
  };
}
