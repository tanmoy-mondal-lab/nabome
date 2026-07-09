import type { CartItem } from "../../stores/cart-store";
interface OrderSummaryProps {
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    tax: number;
    taxRate: number;
    discountAmount: number;
    couponCode: string | null;
    grandTotal: number;
}
export declare function OrderSummary({ items, subtotal, shippingCost, tax, taxRate, discountAmount, couponCode, grandTotal, }: OrderSummaryProps): import("react").JSX.Element;
export {};
