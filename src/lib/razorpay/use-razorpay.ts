import { useState, useEffect, useCallback } from "react";
import { loadRazorpayScript } from "./load-script";
import type { RazorpaySuccessResponse, RazorpayErrorDetails } from "./types";
import { usablePublicConfig } from "../config";

const razorpayKey = usablePublicConfig(import.meta.env.VITE_RAZORPAY_KEY_ID);

interface OpenRazorpayParams {
  razorpayOrderId: string;
  amount: number;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

interface OpenRazorpayResult {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

interface RazorpayHookResult {
  loaded: boolean;
  loadError: string | null;
  openRazorpay: (params: OpenRazorpayParams) => Promise<OpenRazorpayResult>;
}

export function useRazorpay(): RazorpayHookResult {
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!razorpayKey) {
      setLoadError("Payment gateway is not configured");
      return;
    }

    let cancelled = false;
    loadRazorpayScript()
      .then(() => {
        if (!cancelled) setLoaded(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openRazorpay = useCallback(
    async (params: OpenRazorpayParams): Promise<OpenRazorpayResult> => {
      if (!razorpayKey) {
        throw new Error("Payment gateway is not configured");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const Razorpay = window.Razorpay;

      return new Promise((resolve, reject) => {
        let settled = false;

        const rzp = new Razorpay({
          key: razorpayKey,
          amount: Math.round(params.amount * 100),
          currency: "INR",
          name: "নবME",
          description: "Fashion Order",
          order_id: params.razorpayOrderId,
          prefill: params.prefill,
          theme: { color: "#B8860B" },
          handler: (response: RazorpaySuccessResponse) => {
            settled = true;
            resolve({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: () => {
              if (!settled) {
                settled = true;
                reject(new Error("Payment cancelled"));
              }
            },
          },
        });

        rzp.on("payment.failed", (response: { error: RazorpayErrorDetails }) => {
          if (settled) return;
          settled = true;
          const err = new Error(response.error.description || "Payment failed");
          (err as any).code = response.error.code;
          (err as any).source = response.error.source;
          (err as any).step = response.error.step;
          (err as any).reason = response.error.reason;
          reject(err);
        });

        rzp.open();
      });
    },
    []
  );

  return { loaded, loadError, openRazorpay };
}
