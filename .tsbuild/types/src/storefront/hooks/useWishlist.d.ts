import type { Product, ProductVariant, ProductImage } from "../../types/product";
interface WishlistItem {
    id: string;
    variantId: string;
    variant?: ProductVariant & {
        product?: Product;
        images?: ProductImage[];
    };
}
export declare function useWishlist(): {
    items: WishlistItem[];
    loading: boolean;
    error: string | null;
    add: (variantId: string) => Promise<void>;
    remove: (variantId: string) => Promise<void>;
    isInWishlist: (variantId: string) => boolean;
    refresh: (signal?: AbortSignal) => Promise<void>;
};
export {};
