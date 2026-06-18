import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { customerApi } from "../../../lib/api/customer";
import { addressesApi, type Address } from "../../../lib/api/addresses";
import { useAuthStore } from "../../../stores/auth-store";
import { useCart } from "../../cart/hooks/useCart";
import { useRazorpay } from "../../../lib/razorpay/use-razorpay";

interface ShippingFormState {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const EMPTY_SHIPPING: ShippingFormState = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

export function useCheckout() {
  const { items, subtotal, discountAmount, total, couponCode, clearCart, applyCoupon, removeCoupon } = useCart();
  const { isAuthenticated, user } = useAuthStore();

  const { openRazorpay } = useRazorpay();

  const [step, setStep] = useState<"shipping" | "payment" | "confirm" | "success">("shipping");
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(true);
  const [shipping, setShipping] = useState<ShippingFormState>({ ...EMPTY_SHIPPING });
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof ShippingFormState, string>>>({});
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billing, setBilling] = useState<ShippingFormState>({ ...EMPTY_SHIPPING });
  const [billingErrors, setBillingErrors] = useState<Partial<Record<keyof ShippingFormState, string>>>({});
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderNotes, setOrderNotes] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [apiError, setApiError] = useState("");

  // Load saved addresses for authenticated users
  const { data: addressesData, isLoading: loadingAddresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressesApi.list(),
    enabled: isAuthenticated,
  });

  // Handle addresses data loading
  useEffect(() => {
    if (addressesData) {
      const addrs = addressesData.addresses as Address[];
      setSavedAddresses(addrs);
      if (addrs.length > 0) {
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        setSelectedAddressId(def.id);
        setShowNewAddressForm(false);
        setShipping({
          fullName: def.fullName,
          phone: def.phone,
          line1: def.line1,
          line2: def.line2 || "",
          city: def.city,
          state: def.state,
          pincode: def.pincode,
          country: def.country,
        });
      } else {
        setShowNewAddressForm(true);
      }
    }
  }, [addressesData]);

  // Apply coupon mutation
  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch("/api/coupons?action=validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        applyCoupon(code, data.discount, data.discountType);
        setCouponInput("");
        setCouponError("");
      } else {
        setCouponError(data.error || "Invalid coupon code");
      }
    },
  });

  // Create checkout mutation
  const createCheckoutMutation = useMutation({
    mutationFn: async (checkoutData: {
      shippingAddressId: string;
      billingAddressId?: string;
      email: string;
      couponCode?: string;
      giftMessage?: string;
      notes?: string;
      paymentMethod: string;
    }) => {
      return customerApi.createCheckout(checkoutData);
    },
    onSuccess: async (result) => {
      const order = result.order as any;
      const razorpayOrderId = result.razorpayOrderId;

      if (paymentMethod === "cod") {
        setOrderId(order.id || order.orderId);
        clearCart();
        setStep("success");
      } else {
        try {
          const razorpayResult = await openRazorpay({
            razorpayOrderId: razorpayOrderId!,
            amount: grandTotal,
            prefill: {
              name: shipping.fullName,
              contact: shipping.phone,
            },
          });
          await customerApi.verifyPayment({
            razorpayPaymentId: razorpayResult.razorpayPaymentId,
            razorpayOrderId: razorpayResult.razorpayOrderId,
            razorpaySignature: razorpayResult.razorpaySignature,
            orderId: order.id || order.orderId,
          });
          setOrderId(order.id || order.orderId);
          clearCart();
          setStep("success");
        } catch (payErr: any) {
          if (payErr?.code) {
            await customerApi.reportPaymentFailed({
              orderId: order.id || order.orderId,
              errorDescription: payErr.description || payErr.message,
            });
            setApiError(`Payment failed: ${payErr.description || "Please try again."}`);
          } else if (payErr?.message === "Payment cancelled") {
            setApiError("Payment was cancelled. You can try again.");
          } else {
            setApiError(payErr?.message || "Payment failed. Please try again.");
          }
        }
      }
    },
    onError: (err: any) => {
      setApiError(err?.message || "Something went wrong. Please try again.");
    },
  });

  const shippingCost = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = total + shippingCost + tax;
  const email = (user?.email as string) || "";

  const validateAddress = (
    form: ShippingFormState,
    setErrors: (e: Partial<Record<keyof ShippingFormState, string>>) => void
  ): boolean => {
    const errs: Partial<Record<keyof ShippingFormState, string>> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) errs.phone = "Enter a valid 10-digit number";
    if (!form.line1.trim()) errs.line1 = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state) errs.state = "Select a state";
    if (!form.pincode.trim()) errs.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode.trim())) errs.pincode = "Enter a valid 6-digit pincode";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinueToPayment = () => {
    if (!isAuthenticated || showNewAddressForm) {
      if (!validateAddress(shipping, setShippingErrors)) return;
    }
    if (!billingSameAsShipping) {
      if (!validateAddress(billing, setBillingErrors)) return;
    }
    setStep("payment");
  };

  const handleContinueToReview = () => {
    setStep("confirm");
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    applyCouponMutation.mutate(couponInput.trim());
  };

  const handlePlaceOrder = async () => {
    setApiError("");
    let shippingAddressId = selectedAddressId;
    
    if (!shippingAddressId || showNewAddressForm || !isAuthenticated) {
      const created = await addressesApi.create({
        fullName: shipping.fullName,
        phone: shipping.phone,
        line1: shipping.line1,
        line2: shipping.line2 || undefined,
        city: shipping.city,
        state: shipping.state,
        pincode: shipping.pincode,
        country: shipping.country,
      });
      shippingAddressId = (created as any).id;
    }

    let billingAddressId: string | undefined;
    if (!billingSameAsShipping) {
      const created = await addressesApi.create({
        fullName: billing.fullName,
        phone: billing.phone,
        line1: billing.line1,
        line2: billing.line2 || undefined,
        city: billing.city,
        state: billing.state,
        pincode: billing.pincode,
        country: billing.country,
      });
      billingAddressId = (created as any).id;
    }

    createCheckoutMutation.mutate({
      shippingAddressId,
      billingAddressId,
      email: email || (shipping.phone ? `${shipping.phone}@guest.nabome.com` : "guest@nabome.com"),
      couponCode: couponCode || undefined,
      giftMessage: giftMessage || undefined,
      notes: orderNotes || undefined,
      paymentMethod,
    });
  };

  return {
    // State
    step,
    savedAddresses,
    selectedAddressId,
    showNewAddressForm,
    shipping,
    shippingErrors,
    billingSameAsShipping,
    billing,
    billingErrors,
    paymentMethod,
    orderNotes,
    giftMessage,
    couponInput,
    couponError,
    orderId,
    apiError,
    loadingAddresses,
    
    // Cart data
    items,
    subtotal,
    discountAmount,
    total,
    couponCode,
    shippingCost,
    tax,
    grandTotal,
    
    // Setters
    setStep,
    setSelectedAddressId,
    setShowNewAddressForm,
    setShipping,
    setShippingErrors,
    setBillingSameAsShipping,
    setBilling,
    setBillingErrors,
    setPaymentMethod,
    setOrderNotes,
    setGiftMessage,
    setCouponInput,
    setCouponError,
    setOrderId,
    setApiError,
    
    // Actions
    handleContinueToPayment,
    handleContinueToReview,
    handleApplyCoupon,
    handlePlaceOrder,
    removeCoupon,
    validateAddress,
    
    // Mutations
    applyCouponMutation,
    createCheckoutMutation,
    
    // Constants
    EMPTY_SHIPPING,
  };
}
