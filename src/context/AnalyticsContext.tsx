import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { analytics } from "../lib/analytics";

type AnalyticsContextType = {
  trackProductView: (id: string | number, name: string, category?: string, price?: number) => void;
  trackCategoryView: (name: string) => void;
  trackAddToCart: (id: string | number, name: string, price: number, quantity?: number) => void;
  trackRemoveFromCart: (id: string | number, name: string, price: number) => void;
  trackAddToWishlist: (id: string | number, name: string) => void;
  trackBeginCheckout: (value: number, items: { id: string | number; name: string; price: number; quantity: number }[]) => void;
  trackPurchase: (orderId: string, revenue: number, items: { id: string | number; name: string; price: number; quantity: number }[]) => void;
  trackRegister: (method: "customer" | "vendor") => void;
  trackLogin: (method: "email" | "phone") => void;
  trackSearch: (term: string, resultsCount: number) => void;
  trackShare: (contentType: string, contentId: string | number) => void;
  trackEvent: (name: string, params?: Record<string, string | number | boolean | undefined>) => void;
};

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    analytics.pageView(location.pathname + location.search, document.title);
  }, [location]);

  const value: AnalyticsContextType = {
    trackProductView: (id, name, category, price) => analytics.viewProduct(id, name, category, price),
    trackCategoryView: (name) => analytics.viewCategory(name),
    trackAddToCart: (id, name, price, quantity = 1) => analytics.addToCart(id, name, price, quantity),
    trackRemoveFromCart: (id, name, price) => analytics.removeFromCart(id, name, price),
    trackAddToWishlist: (id, name) => analytics.addToWishlist(id, name),
    trackBeginCheckout: (value, items) => analytics.beginCheckout(value, items),
    trackPurchase: (orderId, revenue, items) => analytics.purchase(orderId, revenue, items),
    trackRegister: (method) => analytics.register(method),
    trackLogin: (method) => analytics.login(method),
    trackSearch: (term, resultsCount) => analytics.search(term, resultsCount),
    trackShare: (contentType, contentId) => analytics.share(contentType, contentId),
    trackEvent: (name, params) => analytics.event(name, params),
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextType {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }
  return ctx;
}
