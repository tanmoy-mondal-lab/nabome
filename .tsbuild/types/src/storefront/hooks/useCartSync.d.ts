import type { CartItem } from "../stores/cart-store";
interface UseCartSyncOptions {
    onSyncFailure?: (failures: number) => void;
    onServerCartLoaded?: (cart: {
        items: CartItem[];
        couponCode: string | null;
        discount: number;
        discountType: "percentage" | "fixed" | null;
    }) => void;
}
export declare function useCartSync(items: CartItem[], options?: UseCartSyncOptions): {
    queueServerSync: () => void;
    hydrateServerCart: () => Promise<void>;
    mergeGuestCartOnServer: (guestItems?: CartItem[]) => Promise<void>;
    syncFailureCount: number;
};
export {};
