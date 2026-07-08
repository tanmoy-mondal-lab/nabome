// ─────────────────────────────────────────────────────────────
// NABOME Feature Flags System
// Lightweight feature flags stored in Cloudflare KV
// ─────────────────────────────────────────────────────────────

export type FeatureFlag =
  | "loyalty_program"
  | "referral_program"
  | "gift_cards"
  | "subscriptions"
  | "multi_currency"
  | "multi_language"
  | "dark_mode"
  | "abandoned_cart_recovery"
  | "stock_notifications"
  | "social_sharing"
  | "order_tracking"
  | "saved_payment_methods"
  | "reviews_enhanced"
  | "new_checkout"
  | "express_checkout";

export interface FeatureFlagConfig {
  key: FeatureFlag;
  label: string;
  description: string;
  defaultValue: boolean;
  requiresRestart?: boolean;
}

export const FEATURE_FLAGS: Record<FeatureFlag, FeatureFlagConfig> = {
  loyalty_program: {
    key: "loyalty_program",
    label: "Loyalty Program",
    description: "Enable customer loyalty points and rewards",
    defaultValue: false,
  },
  referral_program: {
    key: "referral_program",
    label: "Referral Program",
    description: "Enable customer referral codes and rewards",
    defaultValue: false,
  },
  gift_cards: {
    key: "gift_cards",
    label: "Gift Cards",
    description: "Enable gift card purchasing and redemption",
    defaultValue: false,
  },
  subscriptions: {
    key: "subscriptions",
    label: "Subscriptions",
    description: "Enable subscription plans and recurring billing",
    defaultValue: false,
  },
  multi_currency: {
    key: "multi_currency",
    label: "Multi-Currency",
    description: "Enable multiple currency support",
    defaultValue: false,
  },
  multi_language: {
    key: "multi_language",
    label: "Multi-Language",
    description: "Enable internationalization and language switching",
    defaultValue: false,
  },
  dark_mode: {
    key: "dark_mode",
    label: "Dark Mode",
    description: "Enable dark mode theme toggle",
    defaultValue: false,
  },
  abandoned_cart_recovery: {
    key: "abandoned_cart_recovery",
    label: "Abandoned Cart Recovery",
    description: "Enable automated abandoned cart email recovery",
    defaultValue: false,
  },
  stock_notifications: {
    key: "stock_notifications",
    label: "Stock Notifications",
    description: "Enable notify when back in stock feature",
    defaultValue: false,
  },
  social_sharing: {
    key: "social_sharing",
    label: "Social Sharing",
    description: "Enable social share buttons on product pages",
    defaultValue: false,
  },
  order_tracking: {
    key: "order_tracking",
    label: "Order Tracking",
    description: "Enable real-time order tracking",
    defaultValue: false,
  },
  saved_payment_methods: {
    key: "saved_payment_methods",
    label: "Saved Payment Methods",
    description: "Enable saved payment methods for faster checkout",
    defaultValue: false,
  },
  reviews_enhanced: {
    key: "reviews_enhanced",
    label: "Enhanced Reviews",
    description: "Enable enhanced review features (images, voting)",
    defaultValue: false,
  },
  new_checkout: {
    key: "new_checkout",
    label: "New Checkout",
    description: "Enable the redesigned checkout flow",
    defaultValue: false,
  },
  express_checkout: {
    key: "express_checkout",
    label: "Express Checkout",
    description: "Enable express checkout with saved payment methods",
    defaultValue: false,
  },
};

export function getDefaultFlags(): Record<FeatureFlag, boolean> {
  const flags = {} as Record<FeatureFlag, boolean>;
  for (const [key, config] of Object.entries(FEATURE_FLAGS)) {
    flags[key as FeatureFlag] = config.defaultValue;
  }
  return flags;
}

export async function getFeatureFlags(
  env?: { FEATURE_FLAGS_KV?: { get: (key: string) => Promise<string | null> } }
): Promise<Record<FeatureFlag, boolean>> {
  const defaults = getDefaultFlags();
  if (!env?.FEATURE_FLAGS_KV) return defaults;
  try {
    const stored = await env.FEATURE_FLAGS_KV.get("feature_flags");
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Record<FeatureFlag, boolean>>;
      return { ...defaults, ...parsed };
    }
  } catch {
    // Fall back to defaults on error
  }
  return defaults;
}

export async function setFeatureFlag(
  key: FeatureFlag,
  value: boolean,
  env?: { FEATURE_FLAGS_KV?: { put: (key: string, value: string) => Promise<void> } }
): Promise<void> {
  if (!env?.FEATURE_FLAGS_KV) return;
  const current = await getFeatureFlags(env as any);
  current[key] = value;
  await env.FEATURE_FLAGS_KV.put("feature_flags", JSON.stringify(current));
}

export async function setAllFeatureFlags(
  flags: Record<FeatureFlag, boolean>,
  env?: { FEATURE_FLAGS_KV?: { put: (key: string, value: string) => Promise<void> } }
): Promise<void> {
  if (!env?.FEATURE_FLAGS_KV) return;
  await env.FEATURE_FLAGS_KV.put("feature_flags", JSON.stringify(flags));
}
