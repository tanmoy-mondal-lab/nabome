import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, CreditCard, Smartphone, Building2, Wallet,
  Package, CheckCircle, RotateCcw,
  Plus, ArrowLeft, Gift, FileText,
  Percent, Loader2, Lock, ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { formatPrice } from "../../lib/utils/format";
import { cn } from "../../lib/utils/cn";
import { useAuthStore } from "../../stores/auth-store";
import { customerApi } from "../../lib/api/customer";
import { addressesApi, type Address } from "../../lib/api/addresses";
import { useRazorpay } from "../../lib/razorpay/use-razorpay";
import { useSettings } from "../hooks/useSettings";
import { api } from "../../lib/api/client";
import { Helmet } from "react-helmet-async";
import { canonical } from "../../lib/seo";
import { AddressForm, EMPTY_SHIPPING, validateAddress, type ShippingFormState } from "../components/checkout/AddressForm";
import { OrderSummary } from "../components/checkout/OrderSummary";

const PAYMENT_METHODS = [
  { value: "card", label: "Credit / Debit Card", description: "Visa, Mastercard, RuPay", icon: CreditCard },
  { value: "upi", label: "UPI", description: "Google Pay, PhonePe, BHIM, Paytm", icon: Smartphone },
  { value: "netbanking", label: "Net Banking", description: "All major banks supported", icon: Building2 },
  { value: "wallet", label: "Wallet", description: "Paytm Wallet, Mobikwik, Freecharge", icon: Wallet },
  { value: "cod", label: "Cash on Delivery", description: "Pay when your order arrives", icon: Package },
] as const;

const NET_BANKING_BANKS = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
  "Kotak Mahindra Bank", "Yes Bank", "Bank of Baroda", "Punjab National Bank",
  "Canara Bank", "Union Bank of India", "IDBI Bank", "Federal Bank",
];

interface CardFormState {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, discountAmount, total, couponCode, clearCart, applyCoupon, removeCoupon } = useCart();
  const { isAuthenticated, user } = useAuthStore();

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
  const [cardForm, setCardForm] = useState<CardFormState>({ number: "", expiry: "", cvv: "", name: "" });
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  const [orderNotes, setOrderNotes] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [apiError, setApiError] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [guestEmail, setGuestEmail] = useState("");
  const [guestEmailError, setGuestEmailError] = useState("");

  const { data: settingsData } = useSettings();

  const rawPreferences = settingsData?.preferences ?? {};

  const siteSettings = {
    taxRate: Number(settingsData?.taxRate ?? rawPreferences.taxRate ?? 5),
    freeShippingThreshold: Number(settingsData?.freeShippingThreshold ?? rawPreferences.freeShippingThreshold ?? 500),
    shippingCost: Number(rawPreferences.shippingCost ?? 99),
  };

  const { loaded: razorpayLoaded, openRazorpay } = useRazorpay();

  // Set dynamic page title based on checkout step
  useEffect(() => {
    const stepTitles = {
      shipping: "Shipping Information",
      payment: "Payment Method",
      confirm: "Review Order",
      success: "Order Complete"
    };
    document.title = `${stepTitles[step]} — Checkout — নবME`;
  }, [step]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingAddresses(true);
      addressesApi
        .list()
        .then((data) => {
          const addrs = data.addresses as Address[];
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
              district: def.district || "",
              state: def.state,
              pincode: def.pincode,
              country: def.country,
            });
          } else {
            setShowNewAddressForm(true);
          }
        })
        .catch(() => setShowNewAddressForm(true))
        .finally(() => setLoadingAddresses(false));
    }
  }, [isAuthenticated]);

  const shippingCost = subtotal >= siteSettings.freeShippingThreshold ? 0 : siteSettings.shippingCost;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(discountedSubtotal * siteSettings.taxRate) / 100;
  const grandTotal = discountedSubtotal + shippingCost + tax;
  const email = isAuthenticated ? (user?.email || "") : guestEmail;

  function handleContinueToPayment() {
    if (!isAuthenticated) {
      if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
        setGuestEmailError("Valid email is required");
        return;
      }
      setGuestEmailError("");
    }
    if (!isAuthenticated || showNewAddressForm) {
      if (!validateAddress(shipping, setShippingErrors)) return;
    }
    if (!billingSameAsShipping) {
      if (!validateAddress(billing, setBillingErrors)) return;
    }
    setStep("payment");
  }

  function handleContinueToReview() {
    // Validate payment method selection before proceeding
    if (paymentMethod === "card" || paymentMethod === "upi" || paymentMethod === "netbanking") {
      if (paymentMethod === "card") {
        if (cardForm.number.replace(/\D/g, "").length < 13) {
          setApiError("Please enter a valid card number");
          return;
        }
        if (cardForm.expiry.length < 4) {
          setApiError("Please enter a valid expiry date (MMYY)");
          return;
        }
        if (cardForm.cvv.length < 3) {
          setApiError("Please enter a valid CVV");
          return;
        }
        if (!cardForm.name.trim()) {
          setApiError("Please enter the name on card");
          return;
        }
      }
      if (paymentMethod === "upi") {
        const upiPattern = /^[\w.-]+@[\w]+$/;
        if (!upiId.trim() || !upiPattern.test(upiId.trim())) {
          setApiError("Please enter a valid UPI ID (e.g., username@upi)");
          return;
        }
      }
      if (paymentMethod === "netbanking" && !selectedBank) {
        setApiError("Please select your bank");
        return;
      }
    }
    setApiError("");
    setStep("confirm");
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponError("");
    setCouponApplying(true);
    try {
      const data = await api.post<{
        valid: boolean;
        discount?: number;
        discountType?: "percentage" | "fixed";
        message?: string;
        coupon?: { discountAmount?: number; discountType?: "percentage" | "fixed" };
      }>("/coupons/validate", { code: couponInput.trim(), subtotal });
      if (data.valid) {
        const discount = data.discount ?? data.coupon?.discountAmount ?? 0;
        const discountType = data.discountType ?? data.coupon?.discountType ?? "fixed";
        applyCoupon(couponInput.trim(), discount, discountType);
        setCouponInput("");
      } else {
        setCouponError(data.message || "Invalid coupon code");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    }
    setCouponApplying(false);
  }

  async function handlePlaceOrder() {
    setProcessing(true);
    setApiError("");
    try {
      let orderData: { order: unknown; razorpayOrderId: string | null };

      if (isAuthenticated) {
        let shippingAddressId = selectedAddressId;
        if (!shippingAddressId || showNewAddressForm) {
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
          shippingAddressId = created.id;
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
          billingAddressId = created.id;
        }

        orderData = await customerApi.createCheckout({
          shippingAddressId,
          billingAddressId,
          email: email || `${shipping.phone}@guest.nabome.com`,
          couponCode: couponCode || undefined,
          giftMessage: giftMessage || undefined,
          notes: orderNotes || undefined,
          paymentMethod,
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        });
      } else {
        orderData = await customerApi.guestCheckout({
          email: guestEmail.trim(),
          shippingAddress: {
            fullName: shipping.fullName,
            phone: shipping.phone,
            line1: shipping.line1,
            line2: shipping.line2 || undefined,
            city: shipping.city,
            state: shipping.state,
            pincode: shipping.pincode,
            country: shipping.country,
          },
          sameAsShipping: billingSameAsShipping,
          ...(!billingSameAsShipping && {
            billingAddress: {
              fullName: billing.fullName,
              phone: billing.phone,
              line1: billing.line1,
              line2: billing.line2 || undefined,
              city: billing.city,
              state: billing.state,
              pincode: billing.pincode,
              country: billing.country,
            },
          }),
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          couponCode: couponCode || undefined,
          giftMessage: giftMessage || undefined,
          notes: orderNotes || undefined,
          paymentMethod,
        });
      }

      const order = orderData.order as { id?: string; orderId?: string; orderNumber?: string };
      const razorpayOrderId = orderData.razorpayOrderId;

      if (paymentMethod === "cod") {
        setOrderId((order.id ?? order.orderId) as string);
        clearCart();
        setStep("success");
      } else {
        try {
          const result = await openRazorpay({
            razorpayOrderId: razorpayOrderId!,
            amount: grandTotal,
            prefill: {
              name: shipping.fullName,
              email: email || guestEmail,
              contact: shipping.phone,
            },
          });
          await customerApi.verifyPayment({
            razorpayPaymentId: result.razorpayPaymentId,
            razorpayOrderId: result.razorpayOrderId,
            razorpaySignature: result.razorpaySignature,
            orderId: (order.id ?? order.orderId) as string,
          });
          setOrderId((order.id ?? order.orderId) as string);
          clearCart();
          setStep("success");
        } catch (payErr: any) {
          if (payErr?.code) {
            await customerApi.reportPaymentFailed({
              orderId: (order.id ?? order.orderId) as string,
              razorpayOrderId: razorpayOrderId!,
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
    } catch (err: any) {
      setApiError(err?.message || "Something went wrong. Please try again.");
    }
    setProcessing(false);
  }


  if (!items.length && step !== "success") {
    return (
      <div className="container-page section-padding text-center">
        <Helmet>
          <title>Checkout — নবME</title>
          <meta name="description" content="Complete your purchase on নবME." />
          <meta name="robots" content="noindex, nofollow" />
          <link rel="canonical" href={canonical("/checkout")} />
          <meta property="og:title" content="Checkout — নবME" />
          <meta property="og:description" content="Complete your purchase on নবME." />
        </Helmet>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 mx-auto mb-6 bg-luxe-ivory rounded-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="font-display text-display-1 text-neutral-900 mb-3 text-balance">Your cart is empty</h1>
          <p className="editorial-caption text-neutral-500 mb-8">Add some items to your cart before checking out.</p>
          <Link
            to="/products"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="container-page section-padding text-center">
        <Helmet>
          <title>Checkout — নবME</title>
          <meta name="description" content="Complete your purchase on নবME." />
          <meta name="robots" content="noindex, nofollow" />
          <link rel="canonical" href={canonical("/checkout")} />
          <meta property="og:title" content="Checkout — নবME" />
          <meta property="og:description" content="Complete your purchase on নবME." />
        </Helmet>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="w-24 h-24 mx-auto bg-luxe-ivory rounded-full flex items-center justify-center mb-8"
          >
            <CheckCircle className="w-12 h-12 text-accent-gold" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-display-1 text-neutral-900 mb-4"
          >
            Order Confirmed!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-neutral-500 mb-3"
          >
            Thank you for your purchase. Your order has been placed successfully.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-neutral-400 mb-10"
          >
            Order ID: <span className="font-mono text-accent-gold font-medium">{orderId}</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-neutral-500 mb-10"
          >
            A confirmation email has been sent to your registered email address.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-4"
          >
            <Link
              to="/products"
              className="btn-primary px-10 py-4 text-sm uppercase tracking-widest"
            >
              Continue Shopping
            </Link>
            {orderId && (
              <Link
                to={`/account/orders/${orderId}`}
                className="btn-outline px-10 py-4 text-sm uppercase tracking-widest"
              >
                View Order
              </Link>
            )}
          </motion.div>
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-8 pt-6 border-t"
            >
              <p className="text-sm text-neutral-600 mb-3">Create an account to track your order and enjoy faster checkout next time.</p>
              <Link
                to="/auth/register"
                className="btn-primary px-8 py-3 text-sm uppercase tracking-widest"
              >
                Create Account
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-page section-padding">
      <Helmet>
        <title>Checkout — নবME</title>
        <meta name="description" content="Complete your purchase on নবME." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={canonical("/checkout")} />
        <meta property="og:title" content="Checkout — নবME" />
        <meta property="og:description" content="Complete your purchase on নবME." />
      </Helmet>
      <Breadcrumbs items={[{ label: "Checkout" }]} className="mb-6" />

      <div className="grid lg:grid-cols-5 gap-8 md:gap-8 lg:gap-12">
        {/* ── Left Column ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* ─── STEP 1: SHIPPING ─── */}
          <div className="premium-card p-6 shadow-subtle">
            <div className="flex items-center gap-3 mb-6">
              <span
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300",
                  step === "shipping"
                    ? "bg-accent-gold text-white"
                    : "bg-luxe-ivory text-brand-700"
                )}
              >
                {step === "shipping" ? "1" : <CheckCircle className="w-4 h-4" />}
              </span>
              <div className="flex-1 flex items-center justify-between">
                <h2 className="text-sm font-display text-neutral-900 uppercase tracking-fashion">Shipping Information</h2>
                  {step !== "shipping" && (
                  <button onClick={() => setStep("shipping")} className="text-xs text-brand-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 rounded" aria-label="Edit shipping address">
                    Edit
                  </button>
                )}

              </div>
            </div>

            {step === "shipping" ? (
              <div className="space-y-5">
                {loadingAddresses && (
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading saved addresses...
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="space-y-3">
                    <label className="text-xs text-neutral-500 mb-1 block font-body">Email Address *</label>
                    <input
                      value={guestEmail}
                      onChange={(e) => { setGuestEmail(e.target.value); setGuestEmailError(""); }}
                      className={cn(
                        "input-field w-full px-3 py-2.5 text-sm",
                        guestEmailError ? "border-red-400" : "border-neutral-200"
                      )}
                      placeholder="your@email.com"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                    />
                    {guestEmailError && <p className="text-xs text-red-500">{guestEmailError}</p>}
                  </div>
                )}

                {isAuthenticated && !loadingAddresses && savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-body text-neutral-500 uppercase tracking-fashion">Saved Addresses</p>
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={cn(
                          "flex items-start gap-3 p-3 border cursor-pointer transition-all duration-300",
                          selectedAddressId === addr.id && !showNewAddressForm
                            ? "border-neutral-900 bg-luxe-ivory shadow-subtle"
                            : "hover:border-neutral-300"
                        )}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddressId === addr.id && !showNewAddressForm}
                          onChange={() => {
                            setSelectedAddressId(addr.id);
                            setShowNewAddressForm(false);
                            setShipping({
                              fullName: addr.fullName,
                              phone: addr.phone,
                              line1: addr.line1,
                              line2: addr.line2 || "",
                              city: addr.city,
                              district: addr.district || "",
                              state: addr.state,
                              pincode: addr.pincode,
                              country: addr.country,
                            });
                          }}
                          className="mt-0.5 accent-accent-gold shrink-0"
                        />
                        <div className="text-sm text-neutral-600">
                          <p className="font-medium text-neutral-900">{addr.fullName}</p>
                          <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                          <p>{addr.city}, {addr.state} — {addr.pincode}</p>
                          <p className="text-xs text-neutral-400">{addr.phone}</p>
                        </div>
                      </label>
                    ))}
                    <button
                      onClick={() => { setShowNewAddressForm(true); setSelectedAddressId(""); }}
                      className={cn(
                        "flex items-center gap-2 w-full p-3 border border-dashed text-sm transition-all duration-300",
                        showNewAddressForm ? "border-neutral-900 bg-luxe-ivory" : "text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 hover:bg-neutral-50"
                      )}
                      aria-label="Add new shipping address"
                    >
                      <Plus className="w-4 h-4" /> Add New Address
                    </button>
                  </div>
                )}

                {(showNewAddressForm || !isAuthenticated) && (
                  <div className="space-y-4">
                    {isAuthenticated && savedAddresses.length > 0 && (
                      <p className="text-xs font-body text-neutral-500 uppercase tracking-fashion">New Address</p>
                    )}
                    <AddressForm form={shipping} setForm={setShipping} errors={shippingErrors} setErrors={setShippingErrors} prefix="shipping" />
                  </div>
                )}

                {Object.keys(shippingErrors).length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>Please fix the errors highlighted above before continuing.</p>
                  </div>
                )}

                {/* Same as Billing Toggle + Billing Form */}
                <div className="border-t pt-5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                      className="accent-accent-gold w-4 h-4"
                    />
                    <span className="text-sm text-neutral-700">Billing address same as shipping</span>
                  </label>
                </div>

                {!billingSameAsShipping && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      <h3 className="text-xs font-body text-neutral-500 uppercase tracking-fashion">Billing Address</h3>
                    </div>
                    <AddressForm form={billing} setForm={setBilling} errors={billingErrors} setErrors={setBillingErrors} prefix="billing" />
                    {Object.keys(billingErrors).length > 0 && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-sm text-red-700">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>Please fix the billing address errors above.</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleContinueToPayment}
                    className="btn-primary px-8 py-2.5 text-xs uppercase tracking-widest"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-600 space-y-1">
                <p className="font-medium text-neutral-900">{shipping.fullName}</p>
                <p>{shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ""}</p>
                <p>{shipping.city}, {shipping.state} — {shipping.pincode}</p>
                <p className="text-xs text-neutral-400">{shipping.phone}</p>
                {!billingSameAsShipping && (
                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs font-medium text-neutral-500">Billing:</p>
                    <p>{billing.fullName}, {billing.line1}, {billing.city}, {billing.state}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── STEP 2: PAYMENT ─── */}
          <div className="premium-card p-6 shadow-subtle">
            <div className="flex items-center gap-3 mb-6">
              <span
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300",
                  step === "payment"
                    ? "bg-accent-gold text-white"
                    : step === "shipping"
                      ? "bg-neutral-200 text-neutral-500"
                      : "bg-luxe-ivory text-accent-gold"
                )}
              >
                {step === "payment" ? "2" : step === "shipping" ? "2" : <CheckCircle className="w-4 h-4" />}
              </span>
              <div className="flex-1 flex items-center justify-between">
                <h2 className="text-sm font-display text-neutral-900 uppercase tracking-fashion">Payment Method</h2>
                {step !== "shipping" && step !== "payment" && (
                  <button onClick={() => setStep("payment")} className="text-xs text-brand-500 hover:underline" aria-label="Edit payment method">
                    Edit
                  </button>
                )}
              </div>
            </div>

            {step === "payment" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((pm) => {
                    const Icon = pm.icon;
                    return (
                      <label
                        key={pm.value}
                        className={cn(
                          "flex items-center gap-3 p-4 border cursor-pointer transition-all duration-300",
                          paymentMethod === pm.value
                            ? "border-neutral-900 bg-luxe-ivory shadow-subtle"
                            : "hover:border-neutral-300"
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={pm.value}
                          checked={paymentMethod === pm.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="accent-accent-gold shrink-0"
                        />
                        <Icon className="w-5 h-5 text-neutral-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{pm.label}</p>
                          <p className="text-xs text-neutral-400">{pm.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {paymentMethod === "card" && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-luxe-ivory border">
                    <div className="col-span-2">
                      <label className="text-xs text-neutral-500 mb-1 block">Card Number</label>
                      <input
                        value={cardForm.number}
                        onChange={(e) => setCardForm({ ...cardForm, number: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                        className="input-field w-full px-3 py-2.5 text-sm"
                        placeholder="1234 5678 9012 3456"
                        maxLength={16}
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500 mb-1 block">Expiry</label>
                      <input
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                        className="input-field w-full px-3 py-2.5 text-sm"
                        placeholder="MMYY"
                        maxLength={4}
                        inputMode="numeric"
                        autoComplete="cc-exp"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500 mb-1 block">CVV</label>
                      <input
                        type="password"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                        className="input-field w-full px-3 py-2.5 text-sm"
                        placeholder="***"
                        maxLength={3}
                        inputMode="numeric"
                        autoComplete="cc-csc"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-neutral-500 mb-1 block">Name on Card</label>
                      <input
                        value={cardForm.name}
                        onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                        className="input-field w-full px-3 py-2.5 text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                    <div className="p-4 bg-luxe-ivory border">
                    <label className="text-xs text-neutral-500 mb-1 block">UPI ID</label>
                    <div className="flex gap-2">
                      <input
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="input-field flex-1 px-3 py-2.5 text-sm"
                        placeholder="username@upi"
                        inputMode="text"
                      />
                      <span className="inline-flex items-center px-3 text-xs text-neutral-500 bg-luxe-ivory">Pay</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">You will receive a payment request on your UPI app.</p>
                  </div>
                )}

                {paymentMethod === "netbanking" && (
                  <div className="p-4 bg-luxe-ivory border">
                    <label className="text-xs text-neutral-500 mb-1 block">Select your bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="select-field w-full px-3 py-2.5 text-sm"
                    >
                      <option value="">Choose a bank</option>
                      {NET_BANKING_BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setStep("shipping")}
                    className="btn-outline flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-widest"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                  <button
                    onClick={handleContinueToReview}
                    className="btn-primary px-8 py-2.5 text-xs uppercase tracking-widest"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─── STEP 3: REVIEW & PLACE ORDER ─── */}
          <div className="premium-card p-6 shadow-subtle">
            <div className="flex items-center gap-3 mb-6">
              <span
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300",
                  step === "confirm" ? "bg-accent-gold text-white" : "bg-neutral-200 text-neutral-500"
                )}
              >
                3
              </span>
              <h2 className="text-sm font-display text-neutral-900 uppercase tracking-fashion">Review & Place Order</h2>
            </div>

            {step === "confirm" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-body text-neutral-500 uppercase tracking-fashion mb-2">Shipping To</h3>
                  <div className="text-sm text-neutral-600 bg-luxe-ivory p-3 border shadow-subtle">
                    <p className="font-medium text-neutral-900">{shipping.fullName}</p>
                    <p>{shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ""}</p>
                    <p>{shipping.city}{shipping.district ? `, ${shipping.district}` : ""}, {shipping.state} — {shipping.pincode}</p>
                    <p className="text-xs text-neutral-400 mt-1">{shipping.phone}</p>
                  </div>
                </div>

                {!billingSameAsShipping && (
                  <div>
                    <h3 className="text-xs font-body text-neutral-500 uppercase tracking-fashion mb-2">Billing To</h3>
                    <div className="text-sm text-neutral-600 bg-luxe-ivory p-3 border shadow-subtle">
                      <p className="font-medium text-neutral-900">{billing.fullName}</p>
                      <p>{billing.line1}{billing.line2 ? `, ${billing.line2}` : ""}</p>
                      <p>{billing.city}{billing.district ? `, ${billing.district}` : ""}, {billing.state} — {billing.pincode}</p>
                      <p className="text-xs text-neutral-400 mt-1">{billing.phone}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-body text-neutral-500 uppercase tracking-fashion mb-2">Payment Method</h3>
                  <div className="text-sm text-neutral-600 bg-luxe-ivory p-3 border flex items-center gap-3 shadow-subtle">
                    {(() => {
                      const pm = PAYMENT_METHODS.find((p) => p.value === paymentMethod);
                      if (!pm) return null;
                      const Icon = pm.icon;
                      return (
                        <>
                          <Icon className="w-5 h-5 text-neutral-500 shrink-0" />
                          <div>
                            <p className="font-medium text-neutral-900">{pm.label}</p>
                            <p className="text-xs text-neutral-400">{pm.description}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 mb-1 block flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Order Notes (optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="textarea-field w-full px-3 py-2.5 text-sm resize-none"
                    rows={2}
                    placeholder="Special instructions for your order..."
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-500 mb-1 block flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5" /> Gift Message (optional)
                  </label>
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="textarea-field w-full px-3 py-2.5 text-sm resize-none"
                    rows={2}
                    placeholder="Add a personal message..."
                  />
                </div>

                <div>
                  <h3 className="text-xs font-body text-neutral-500 uppercase tracking-fashion mb-2">Coupon</h3>
                  {!couponCode ? (
                    <div className="space-y-2">
                      <div className="flex border border-neutral-200">
                        <input
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                          className="input-field flex-1 px-3 py-2.5 text-sm"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponApplying}
                          className="btn-ghost px-4 py-2.5 text-xs uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {couponApplying ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                          Apply
                        </button>
                      </div>
                      {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 px-3 py-2.5 text-sm">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium">{couponCode}</span>
                        <span className="text-green-600 ml-1">applied</span>
                      </div>
                      <button onClick={removeCoupon} className="text-xs text-green-600 underline hover:text-green-700">
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {apiError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{apiError}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setStep("payment")}
                    className="btn-outline flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-widest"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={processing || (paymentMethod !== "cod" && !razorpayLoaded)}
                    className="btn-primary px-10 py-3 text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {paymentMethod !== "cod" && !razorpayLoaded ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Loading payment...</>
                    ) : processing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      <>Place Order — {formatPrice(grandTotal)}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Order Summary ── */}
        <div className="lg:col-span-2">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            shippingCost={shippingCost}
            tax={tax}
            taxRate={siteSettings.taxRate}
            discountAmount={discountAmount}
            couponCode={couponCode}
            grandTotal={grandTotal}
          />
          {subtotal < siteSettings.freeShippingThreshold && (
            <p className="text-xs text-amber-600 text-center mt-3 trust-badge">
              Add {formatPrice(siteSettings.freeShippingThreshold - subtotal)} more for free shipping!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
