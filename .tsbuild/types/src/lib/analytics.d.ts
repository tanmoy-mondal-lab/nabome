declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}
type GtagItem = Record<string, string | number | boolean>;
type EventParams = Record<string, string | number | boolean | undefined | GtagItem | GtagItem[]>;
export declare function trackEvent(action: string, params?: EventParams): void;
export declare function trackPageView(path: string, title?: string): void;
export declare function trackProductView(productId: string, productName: string, price: number): void;
export declare function trackAddToCart(variantId: string, name: string, price: number, quantity: number): void;
export declare function trackRemoveFromCart(variantId: string, name: string, price: number, quantity: number): void;
export declare function trackBeginCheckout(items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
}>, value: number): void;
export declare function trackPurchase(orderId: string, value: number, items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
}>): void;
export declare function trackAddToWishlist(variantId: string, name: string, price: number): void;
export declare function trackSearch(term: string, resultsCount: number): void;
export declare function trackSignUp(method?: "email" | "google" | "apple"): void;
export declare function trackLogin(method?: "email" | "google" | "apple"): void;
export declare function trackNewsletterSignup(email: string): void;
export declare function trackContactSubmission(formName: string): void;
export {};
