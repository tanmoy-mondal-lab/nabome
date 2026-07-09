export interface CartItem {
    id: string;
    productId: string;
    variantId: string;
    name: string;
    slug: string;
    sku: string;
    size: string;
    color: string;
    colorHex: string;
    image: string;
    price: number;
    compareAtPrice: number | null;
    quantity: number;
    maxQuantity: number;
}
interface CartState {
    items: CartItem[];
    couponCode: string | null;
    discount: number;
    discountType: "percentage" | "fixed" | null;
    justAdded: string | null;
    addItem: (item: Omit<CartItem, "id">) => void;
    removeItem: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    applyCoupon: (code: string, discount: number, type: "percentage" | "fixed") => void;
    removeCoupon: () => void;
    clearJustAdded: () => void;
    switchUser: () => void;
    applyServerCart: (payload: {
        items: CartItem[];
        couponCode?: string | null;
        discount?: number;
        discountType?: "percentage" | "fixed" | null;
    }) => void;
    itemCount: () => number;
    subtotal: () => number;
    discountAmount: () => number;
    total: () => number;
}
export declare const useCartStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<CartState>, "setState" | "persist"> & {
    setState(partial: CartState | Partial<CartState> | ((state: CartState) => CartState | Partial<CartState>), replace?: false | undefined): unknown;
    setState(state: CartState | ((state: CartState) => CartState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<CartState, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: CartState) => void) => () => void;
        onFinishHydration: (fn: (state: CartState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<CartState, unknown, unknown>>;
    };
}>;
export {};
