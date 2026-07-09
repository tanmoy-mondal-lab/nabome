interface UseInfiniteScrollOptions<T> {
    fetchMore: (page: number) => Promise<T[]>;
    initialPage?: number;
    pageSize?: number;
    threshold?: number;
}
export declare function useInfiniteScroll<T>({ fetchMore, initialPage, pageSize, threshold, }: UseInfiniteScrollOptions<T>): {
    items: T[];
    isLoading: boolean;
    hasMore: boolean;
    error: Error | null;
    loadMoreRef: import("react").RefObject<HTMLDivElement | null>;
    reset: () => void;
    loadMore: () => Promise<void>;
};
export {};
