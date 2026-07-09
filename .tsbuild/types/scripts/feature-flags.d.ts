export type FeatureFlag = "loyalty_program" | "referral_program" | "gift_cards" | "subscriptions" | "multi_currency" | "multi_language" | "dark_mode" | "abandoned_cart_recovery" | "stock_notifications" | "social_sharing" | "order_tracking" | "saved_payment_methods" | "reviews_enhanced" | "new_checkout" | "express_checkout";
export interface FeatureFlagConfig {
    key: FeatureFlag;
    label: string;
    description: string;
    defaultValue: boolean;
    requiresRestart?: boolean;
}
export declare const FEATURE_FLAGS: Record<FeatureFlag, FeatureFlagConfig>;
export declare function getDefaultFlags(): Record<FeatureFlag, boolean>;
export declare function getFeatureFlags(env?: {
    FEATURE_FLAGS_KV?: {
        get: (key: string) => Promise<string | null>;
    };
}): Promise<Record<FeatureFlag, boolean>>;
export declare function setFeatureFlag(key: FeatureFlag, value: boolean, env?: {
    FEATURE_FLAGS_KV?: {
        put: (key: string, value: string) => Promise<void>;
    };
}): Promise<void>;
export declare function setAllFeatureFlags(flags: Record<FeatureFlag, boolean>, env?: {
    FEATURE_FLAGS_KV?: {
        put: (key: string, value: string) => Promise<void>;
    };
}): Promise<void>;
