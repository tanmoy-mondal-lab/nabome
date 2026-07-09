export declare function useCart(): {
    items: import("../stores/cart-store").CartItem[];
    itemCount: number;
    subtotal: number;
    discountAmount: number;
    total: number;
    couponCode: string | null;
    addItem: (item: Omit<import("../stores/cart-store").CartItem, "id">) => void;
    removeItem: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    applyCoupon: (code: string, discount: number, type: "percentage" | "fixed") => void;
    removeCoupon: () => void;
};
