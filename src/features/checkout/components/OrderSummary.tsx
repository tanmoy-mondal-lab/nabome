import { useState } from "react";
import { Gift, Percent, FileText } from "lucide-react";
import { formatPrice } from "../../../lib/utils/format";
import { cn } from "../../../lib/utils/cn";

interface OrderSummaryProps {
  items: Array<{
    id: string;
    name: string;
    variantLabel?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    imageUrl?: string;
  }>;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  tax: number;
  total: number;
  couponCode?: string;
  onRemoveCoupon?: () => void;
  showCouponInput?: boolean;
  onApplyCoupon?: (code: string) => void;
  couponError?: string;
  isApplyingCoupon?: boolean;
  giftMessage?: string;
  onGiftMessageChange?: (message: string) => void;
  orderNotes?: string;
  onOrderNotesChange?: (notes: string) => void;
  className?: string;
}

export function OrderSummary({
  items,
  subtotal,
  discountAmount,
  shippingCost,
  tax,
  total,
  couponCode,
  onRemoveCoupon,
  showCouponInput = false,
  onApplyCoupon,
  couponError,
  isApplyingCoupon,
  giftMessage,
  onGiftMessageChange,
  orderNotes,
  onOrderNotesChange,
  className,
}: OrderSummaryProps) {
  const [couponInput, setCouponInput] = useState("");

  const handleApplyCoupon = () => {
    if (couponInput.trim() && onApplyCoupon) {
      onApplyCoupon(couponInput.trim());
    }
  };

  return (
    <div className={cn("bg-white border p-6 space-y-6", className)}>
      <h3 className="text-sm font-medium text-neutral-900">Order Summary</h3>

      {/* Items */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-16 object-cover bg-neutral-100 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
              {item.variantLabel && (
                <p className="text-xs text-neutral-400">{item.variantLabel}</p>
              )}
              <p className="text-xs text-neutral-400">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-medium text-neutral-900">{formatPrice(item.totalPrice)}</p>
          </div>
        ))}
      </div>

      {/* Coupon */}
      {showCouponInput && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isApplyingCoupon || !couponInput.trim()}
              className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              {isApplyingCoupon ? "Applying..." : "Apply"}
            </button>
          </div>
          {couponError && <p className="text-xs text-red-500">{couponError}</p>}
          {couponCode && (
            <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 text-green-700 text-xs">
              <div className="flex items-center gap-2">
                <Percent className="w-3 h-3" />
                <span>Coupon applied: {couponCode}</span>
              </div>
              {onRemoveCoupon && (
                <button onClick={onRemoveCoupon} className="text-green-700 hover:underline">
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Gift Message */}
      {onGiftMessageChange && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-neutral-500">
            <Gift className="w-3.5 h-3.5" />
            <span>Gift Message (optional)</span>
          </label>
          <textarea
            value={giftMessage || ""}
            onChange={(e) => onGiftMessageChange(e.target.value)}
            rows={2}
            placeholder="Add a personal message..."
            className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
          />
        </div>
      )}

      {/* Order Notes */}
      {onOrderNotesChange && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-neutral-500">
            <FileText className="w-3.5 h-3.5" />
            <span>Order Notes (optional)</span>
          </label>
          <textarea
            value={orderNotes || ""}
            onChange={(e) => onOrderNotesChange(e.target.value)}
            rows={2}
            placeholder="Any special instructions..."
            className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
          />
        </div>
      )}

      {/* Totals */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Subtotal</span>
          <span className="text-neutral-900">{formatPrice(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Discount</span>
            <span className="text-green-600">-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Shipping</span>
          <span className="text-neutral-900">{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Tax</span>
          <span className="text-neutral-900">{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between text-base font-medium pt-2 border-t">
          <span className="text-neutral-900">Total</span>
          <span className="text-neutral-900">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
