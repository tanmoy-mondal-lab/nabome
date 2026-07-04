import { SafeImage } from "../../../components/SafeImage";
import { formatPrice } from "../../../lib/utils/format";
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

export function OrderSummary({
  items, subtotal, shippingCost, tax, taxRate, discountAmount, couponCode, grandTotal,
}: OrderSummaryProps) {
  return (
    <div className="premium-card p-6 sticky top-24 space-y-5 shadow-card">
      <h3 className="text-sm uppercase tracking-fashion font-display text-neutral-900">Order Summary</h3>

      <div className="space-y-3 max-h-72 overflow-y-auto">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3">
            <SafeImage
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              className="w-14 h-18 object-cover bg-luxe-ivory shrink-0 rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-900 truncate">{item.name}</p>
              <p className="text-xs text-neutral-400">
                {item.size && `Size: ${item.size}`}{item.color && item.size ? ", " : ""}{item.color && `Color: ${item.color}`}
              </p>
              <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
              <p className="text-xs font-medium text-neutral-900 mt-0.5">{formatPrice(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2.5 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Shipping</span>
          {shippingCost === 0 ? (
            <span className="text-green-600 font-medium">Free</span>
          ) : (
            <span>{formatPrice(shippingCost)}</span>
          )}
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Tax ({taxRate}%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount {couponCode && <span className="text-xs">({couponCode})</span>}</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="border-t pt-2.5 flex justify-between font-medium text-neutral-900 text-base">
          <span>Total</span>
          <span>{formatPrice(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
