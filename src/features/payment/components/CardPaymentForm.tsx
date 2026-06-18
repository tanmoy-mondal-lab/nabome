import { useState } from "react";
import { Lock } from "lucide-react";
import { cn } from "../../../lib/utils/cn";

interface CardPaymentFormProps {
  onSubmit?: (data: CardFormData) => void;
  className?: string;
}

export interface CardFormData {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

export function CardPaymentForm({ onSubmit, className }: CardPaymentFormProps) {
  const [formData, setFormData] = useState<CardFormData>({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const handleChange = (field: keyof CardFormData, value: string) => {
    let processedValue = value;
    
    if (field === "number") {
      processedValue = value.replace(/\D/g, "").slice(0, 16);
    } else if (field === "expiry") {
      processedValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (field === "cvv") {
      processedValue = value.replace(/\D/g, "").slice(0, 3);
    }
    
    setFormData({ ...formData, [field]: processedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/(\d{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    if (value.length >= 2) {
      return value.slice(0, 2) + "/" + value.slice(2);
    }
    return value;
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <Lock className="w-3.5 h-3.5" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      <div>
        <label className="block text-xs text-neutral-500 mb-1">Card Number</label>
        <input
          type="text"
          value={formatCardNumber(formData.number)}
          onChange={(e) => handleChange("number", e.target.value)}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          className="w-full px-3 py-2.5 text-sm border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Expiry (MM/YY)</label>
          <input
            type="text"
            value={formatExpiry(formData.expiry)}
            onChange={(e) => handleChange("expiry", e.target.value)}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full px-3 py-2.5 text-sm border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">CVV</label>
          <input
            type="password"
            value={formData.cvv}
            onChange={(e) => handleChange("cvv", e.target.value)}
            placeholder="***"
            maxLength={3}
            className="w-full px-3 py-2.5 text-sm border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-neutral-500 mb-1">Name on Card</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="John Doe"
          className="w-full px-3 py-2.5 text-sm border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
          required
        />
      </div>
    </form>
  );
}
