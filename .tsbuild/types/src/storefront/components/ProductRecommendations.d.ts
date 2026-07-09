interface ProductRecommendationsProps {
    title?: string;
    type: "featured" | "newArrivals" | "similar";
    currentSlug?: string;
    categoryId?: string;
    productId?: string;
}
export declare function ProductRecommendations({ title, type, currentSlug }: ProductRecommendationsProps): import("react").JSX.Element | null;
export {};
