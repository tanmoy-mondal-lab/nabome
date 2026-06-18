import { useState } from "react";
import { Truck, Calculator } from "lucide-react";
import { cn } from "../../../lib/utils/cn";

interface ShippingRate {
  id: string;
  name: string;
  method: string;
  baseRate: number;
  estimatedDays?: string;
}

interface ShippingCalculatorProps {
  subtotal: number;
  onRateSelect?: (rate: ShippingRate) => void;
  className?: string;
}

export function ShippingCalculator({ subtotal, onRateSelect, className }: ShippingCalculatorProps) {
  const [selectedRate, setSelectedRate] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");

  // Mock shipping rates - in production, this would come from API
  const mockRates: ShippingRate[] = [
    {
      id: "standard",
      name: "Standard Delivery",
      method: "standard",
      baseRate: subtotal >= 999 ? 0 : 99,
      estimatedDays: "5-7 business days",
    },
    {
      id: "express",
      name: "Express Delivery",
      method: "express",
      baseRate: 199,
      estimatedDays: "2-3 business days",
    },
    {
      id: "same-day",
      name: "Same Day Delivery",
      method: "same_day",
      baseRate: 399,
      estimatedDays: "Today",
    },
  ];

  const handleRateSelect = (rate: ShippingRate) => {
    setSelectedRate(rate.id);
    onRateSelect?.(rate);
  };

  return (
    <div className={cn("border p-4 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-neutral-500" />
        <h3 className="text-sm font-medium text-neutral-900">Shipping Calculator</h3>
      </div>

      <div>
        <label className="block text-xs text-neutral-500 mb-1">Enter Pincode</label>
        <input
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter 6-digit pincode"
          maxLength={6}
          className="w-full px-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        />
      </div>

      {pincode.length === 6 && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs text-neutral-500">Available shipping methods:</p>
          {mockRates.map((rate) => (
            <label
              key={rate.id}
              className={cn(
                "flex items-center justify-between p-3 border cursor-pointer transition-colors",
                selectedRate === rate.id
                  ? "border-neutral-900 bg-neutral-50"
                  : "hover:bg-neutral-50"
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping-rate"
                  checked={selectedRate === rate.id}
                  onChange={() => handleRateSelect(rate)}
                  className="accent-neutral-900"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{rate.name}</p>
                  <p className="text-xs text-neutral-400">{rate.estimatedDays}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-neutral-400" />
                <span className="text-sm font-medium">
                  {rate.baseRate === 0 ? "FREE" : `₹${rate.baseRate}`}
                </span>
              </div>
            </label>
          ))}
        </div>
      )}

      {subtotal >= 999 && (
        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 text-green-700 text-xs">
          <Truck className="w-4 h-4" />
          <span>Free shipping on orders above ₹999</span>
        </div>
      )}
    </div>
  );
}
