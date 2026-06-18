import { useState } from "react";
import { Smartphone } from "lucide-react";
import { cn } from "../../../lib/utils/cn";

interface UPIPaymentFormProps {
  onSubmit?: (upiId: string) => void;
  className?: string;
}

export function UPIPaymentForm({ onSubmit, className }: UPIPaymentFormProps) {
  const [upiId, setUpiId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (upiId.trim()) {
      onSubmit?.(upiId.trim());
    }
  };

  const validateUPIId = (value: string) => {
    // Basic UPI ID validation (username@upi or username@bank)
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return upiRegex.test(value);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <Smartphone className="w-3.5 h-3.5" />
        <span>You will receive a payment request on your UPI app</span>
      </div>

      <div>
        <label className="block text-xs text-neutral-500 mb-1">UPI ID</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="username@upi"
            className="flex-1 px-3 py-2.5 text-sm border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
            required
          />
          <button
            type="submit"
            disabled={!validateUPIId(upiId)}
            className="px-4 py-2.5 text-sm bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            Pay
          </button>
        </div>
        {!validateUPIId(upiId) && upiId.length > 0 && (
          <p className="text-xs text-red-500 mt-1">Enter a valid UPI ID (e.g., username@upi)</p>
        )}
      </div>

      <div className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200">
        <Smartphone className="w-4 h-4 text-neutral-400" />
        <p className="text-xs text-neutral-500">
          Supported apps: Google Pay, PhonePe, BHIM, Paytm
        </p>
      </div>
    </form>
  );
}
