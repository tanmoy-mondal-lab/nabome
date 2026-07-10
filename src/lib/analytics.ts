import { gaId } from "./config";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(action: string, params?: EventParams): void {
  if (import.meta.env.DEV || !gaId) return;
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", action, params);
    }
  } catch {
    // Analytics errors are non-critical
  }
}

export function trackPageView(path: string, title?: string): void {
  trackEvent("page_view", {
    page_path: path,
    page_title: title,
    page_location: typeof window !== "undefined" ? window.location.href : path,
  });
}

export function trackProductView(productId: string, productName: string, price: number): void {
  trackEvent("view_item", {
    currency: "INR",
    value: price,
    items: [{ item_id: productId, item_name: productName, price }] as any,
  });
}

export function trackAddToCart(variantId: string, name: string, price: number, quantity: number): void {
  trackEvent("add_to_cart", {
    currency: "INR",
    value: price * quantity,
    items: [{ item_id: variantId, item_name: name, price, quantity }] as any,
  });
}

export function trackRemoveFromCart(variantId: string, name: string, price: number, quantity: number): void {
  trackEvent("remove_from_cart", {
    currency: "INR",
    value: price * quantity,
    items: [{ item_id: variantId, item_name: name, price, quantity }] as any,
  });
}

export function trackBeginCheckout(items: Array<{ id: string; name: string; price: number; quantity: number }>, value: number): void {
  trackEvent("begin_checkout", {
    currency: "INR",
    value,
    items: items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })) as any,
  });
}

export function trackPurchase(orderId: string, value: number, items: Array<{ id: string; name: string; price: number; quantity: number }>): void {
  trackEvent("purchase", {
    transaction_id: orderId,
    currency: "INR",
    value,
    items: items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })) as any,
  });
}

export function trackAddToWishlist(variantId: string, name: string, price: number): void {
  trackEvent("add_to_wishlist", {
    currency: "INR",
    value: price,
    items: [{ item_id: variantId, item_name: name, price }] as any,
  });
}

export function trackSearch(term: string, resultsCount: number): void {
  trackEvent("search", {
    search_term: term,
    results_count: resultsCount,
  });
}

export function trackSignUp(method: "email" | "google" | "apple" = "email"): void {
  trackEvent("sign_up", { method });
}

export function trackLogin(method: "email" | "google" | "apple" = "email"): void {
  trackEvent("login", { method });
}

export function trackNewsletterSignup(email: string): void {
  trackEvent("newsletter_signup", { email });
}

export function trackContactSubmission(formName: string): void {
  trackEvent("contact_submission", { form_name: formName });
}
