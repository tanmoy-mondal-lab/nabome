/**
 * Feature flag readiness registry. Flags are evaluated at runtime via
 * Cloudflare Flagship (future). Every flag MUST have an offline default so
 * the product works without a provider. Flags never gate security controls.
 */
export interface FeatureFlag {
  key: string;
  default: boolean;
  description: string;
}

export const FEATURE_FLAGS = {
  searchAutocomplete: {
    key: 'search_autocomplete',
    default: true,
    description: 'Search-as-you-type autocomplete on the customer website',
  },
  quickCheckout: {
    key: 'quick_checkout',
    default: false,
    description: 'One-tap checkout for returning customers',
  },
  wishlistEnabled: {
    key: 'wishlist_enabled',
    default: true,
    description: 'Wishlist feature availability',
  },
  adminBulkEdit: {
    key: 'admin_bulk_edit',
    default: false,
    description: 'Bulk product editing in the admin dashboard',
  },
  shopAnalyticsExport: {
    key: 'shop_analytics_export',
    default: false,
    description: 'Analytics export for shop owners',
  },
} as const satisfies Record<string, FeatureFlag>;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/** Offline default value for a flag. */
export function flagDefault(key: FeatureFlagKey): boolean {
  return FEATURE_FLAGS[key].default;
}
