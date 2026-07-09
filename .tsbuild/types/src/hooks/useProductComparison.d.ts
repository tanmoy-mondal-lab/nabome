export declare function useProductComparison(): {
    comparison: string[];
    addToComparison: (productId: string) => void;
    removeFromComparison: (productId: string) => void;
    isInComparison: (productId: string) => boolean;
    canAddToComparison: () => boolean;
    clearComparison: () => void;
    isLoaded: boolean;
    maxItems: number;
};
