/**
 * Checkout Summary Component
 *
 * Displays order summary with items, totals, discounts, and shipping.
 * Mobile-first, accessible, following official Component Library patterns.
 */

interface CheckoutSummaryProps {
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    imageUrl?: string | null;
  }>;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency?: string;
  couponCode?: string | null;
}

export function CheckoutSummary({
  items,
  subtotal,
  discountTotal,
  shippingTotal,
  taxTotal,
  grandTotal,
  currency = '₹',
  couponCode,
}: CheckoutSummaryProps) {
  const formatPrice = (price: number) => `${currency}${price.toFixed(2)}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>

      {/* Items List */}
      <div
        className="space-y-4 mb-6 max-h-64 overflow-y-auto"
        role="list"
        aria-label="Order items"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
            role="listitem"
          >
            {/* Product Image */}
            {item.imageUrl && (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {item.productName}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {item.variantName}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(item.lineTotal)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-3" aria-label="Order totals">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900 font-medium">
            {formatPrice(subtotal)}
          </span>
        </div>

        {discountTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Discount {couponCode && `(${couponCode})`}
            </span>
            <span className="text-green-600 font-medium">
              -{formatPrice(discountTotal)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900 font-medium">
            {shippingTotal === 0 ? 'Free' : formatPrice(shippingTotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900 font-medium">
            {formatPrice(taxTotal)}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between text-base font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-brand-600 text-lg">
              {formatPrice(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Secure checkout powered by Razorpay</span>
        </div>
      </div>
    </div>
  );
}
