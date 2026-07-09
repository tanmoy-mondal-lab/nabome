import type { CartItem } from "../stores/cart-store";
export declare function useCart(): {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    discountAmount: number;
    total: number;
    couponCode: string | null;
    addItem: (item: Omit<CartItem, "id">) => void;
    removeItem: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    applyCoupon: (code: string, discount: number, type: "percentage" | "fixed") => void;
    removeCoupon: () => void;
    mergeGuestCart: (guestItems?: CartItem[]) => Promise<void>;
};
