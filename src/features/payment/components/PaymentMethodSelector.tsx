import { CreditCard, Smartphone, Building2, Wallet, Package } from "lucide-react";
import { cn } from "../../../lib/utils/cn";

const PAYMENT_METHODS = [
  { value: "card", label: "Credit / Debit Card", description: "Visa, Mastercard, RuPay", icon: CreditCard },
  { value: "upi", label: "UPI", description: "Google Pay, PhonePe, BHIM, Paytm", icon: Smartphone },
  { value: "netbanking", label: "Net Banking", description: "All major banks supported", icon: Building2 },
  { value: "wallet", label: "Wallet", description: "Paytm Wallet, Mobikwik, Freecharge", icon: Wallet },
  { value: "cod", label: "Cash on Delivery", description: "Pay when your order arrives", icon: Package },
] as const;

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  disabledMethods?: string[];
  className?: string;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  disabledMethods = [],
  className,
}: PaymentMethodSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {PAYMENT_METHODS.map((method) => {
        const Icon = method.icon;
        const isDisabled = disabledMethods.includes(method.value);

        return (
          <label
            key={method.value}
            className={cn(
              "flex items-center gap-3 p-4 border cursor-pointer transition-colors",
              selectedMethod === method.value && !isDisabled
                ? "border-neutral-900 bg-neutral-50"
                : "hover:bg-neutral-50",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              type="radio"
              name="payment"
              value={method.value}
              checked={selectedMethod === method.value}
              onChange={(e) => !isDisabled && onMethodChange(e.target.value)}
              disabled={isDisabled}
              className="accent-neutral-900 shrink-0"
            />
            <Icon className="w-5 h-5 text-neutral-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-neutral-900">{method.label}</p>
              <p className="text-xs text-neutral-400">{method.description}</p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
