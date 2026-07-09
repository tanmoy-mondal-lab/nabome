interface RecentlyViewedItem {
    productId: string;
    timestamp: number;
}
export declare function useRecentlyViewed(): {
    recentlyViewed: RecentlyViewedItem[];
    addToRecentlyViewed: (productId: string) => void;
    getRecentlyViewedIds: () => string[];
    clearRecentlyViewed: () => void;
    isLoaded: boolean;
};
export {};
