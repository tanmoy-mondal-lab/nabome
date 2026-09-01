/**
 * Customer Account Center Types
 *
 * This file contains all TypeScript interfaces and types for the Customer Account Center.
 * These types align with CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md, MASTER_ARCHITECTURE_BLUEPRINT.md,
 * and the canonical types from @nabome/types.
 *
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 */

import type {
  Id,
  User,
  Address,
  Timestamps,
  Money,
  Notification,
  Role,
} from '@nabome/types';

// ──────────────────────────────────────────────────────────────────────────────
// Customer Profile Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Extended Customer Profile
 * Combines canonical User with customer-specific fields.
 */
export interface CustomerProfile extends Omit<User, 'role'> {
  /** Customer role is always 'customer' */
  role: 'customer';
  /** Date of birth (optional, for age verification) */
  dateOfBirth?: string | null;
  /** Customer preferences */
  preferences: CustomerPreferences;
  /** Account health score (0-100) */
  accountHealth?: number;
  /** Account tier (for loyalty readiness) */
  accountTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
  /** Total lifetime spend */
  lifetimeSpend?: Money;
  /** Total orders placed */
  totalOrders?: number;
  /** Account created date */
  memberSince: string;
}

/**
 * Customer Preferences
 * User preferences for theme, language, communication, privacy, and marketing.
 */
export interface CustomerPreferences {
  /** Theme preference */
  theme: Theme;
  /** Language/locale preference */
  locale: 'en-IN' | 'bn-IN' | 'hi-IN';
  /** Communication preferences */
  communication: CommunicationPreferences;
  /** Privacy preferences */
  privacy: PrivacyPreferences;
  /** Marketing preferences */
  marketing: MarketingPreferences;
}

/**
 * Theme Options
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Communication Preferences
 */
export interface CommunicationPreferences {
  /** Email notifications enabled */
  emailEnabled: boolean;
  /** SMS notifications enabled */
  smsEnabled: boolean;
  /** Push notifications enabled */
  pushEnabled: boolean;
  /** In-app notifications enabled */
  inAppEnabled: boolean;
  /** Notification categories */
  categories: NotificationCategoryPreferences;
}

/**
 * Notification Category Preferences
 */
export interface NotificationCategoryPreferences {
  /** Order updates notifications */
  orderUpdates: boolean;
  /** Shipment updates notifications */
  shipmentUpdates: boolean;
  /** Payment updates notifications */
  paymentUpdates: boolean;
  /** Promotional notifications */
  promotional: boolean;
  /** System notifications */
  system: boolean;
}

/**
 * Privacy Preferences
 */
export interface PrivacyPreferences {
  /** Profile visibility */
  profileVisibility: 'public' | 'private';
  /** Show activity status */
  showActivityStatus: boolean;
  /** Allow data collection for analytics */
  allowAnalytics: boolean;
  /** Allow personalized recommendations */
  allowPersonalization: boolean;
}

/**
 * Marketing Preferences
 */
export interface MarketingPreferences {
  /** Email marketing consent */
  emailConsent: boolean;
  /** SMS marketing consent */
  smsConsent: boolean;
  /** Push marketing consent */
  pushConsent: boolean;
  /** Marketing preferences updated at */
  consentUpdatedAt?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Address Book Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Extended Address with customer-specific fields
 */
export interface CustomerAddress extends Address {
  /** Address type for usage context */
  usageType?: 'shipping' | 'billing' | 'both';
  /** Whether this is the default shipping address */
  isDefaultShipping: boolean;
  /** Whether this is the default billing address */
  isDefaultBilling: boolean;
  /** Address validation status */
  validationStatus?: 'valid' | 'invalid' | 'pending';
  /** Last validated at */
  validatedAt?: string | null;
  /** Geolocation coordinates (for delivery optimization) */
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
}

/**
 * Address Validation Result
 */
export interface AddressValidationResult {
  /** Whether address is valid */
  isValid: boolean;
  /** Validation errors (if any) */
  errors?: string[];
  /** Normalized address (suggested) */
  normalizedAddress?: Partial<CustomerAddress>;
  /** Validation provider */
  provider?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Account Security Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Session Information
 */
export interface CustomerSession {
  id: Id;
  userId: Id;
  userAgent?: string | null;
  ipAddress?: string | null;
  deviceInfo?: DeviceInfo;
  location?: LocationInfo;
  expiresAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
  createdAt: string;
}

/**
 * Device Information
 */
export interface DeviceInfo {
  /** Device type */
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  /** Operating system */
  os?: string;
  /** Browser */
  browser?: string;
  /** Device name (if available) */
  deviceName?: string;
}

/**
 * Location Information
 */
export interface LocationInfo {
  /** Country code */
  country?: string;
  /** City */
  city?: string;
  /** Region/State */
  region?: string;
}

/**
 * Login History Entry
 */
export interface LoginHistoryEntry {
  id: Id;
  userId: Id;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceInfo?: DeviceInfo;
  location?: LocationInfo;
  success: boolean;
  failureReason?: string | null;
  createdAt: string;
}

/**
 * Security Alert
 */
export interface SecurityAlert {
  id: Id;
  userId: Id;
  type: SecurityAlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  isResolved: boolean;
  resolvedAt?: string | null;
  createdAt: string;
}

/**
 * Security Alert Types
 */
export type SecurityAlertType =
  | 'new_device_login'
  | 'unusual_location'
  | 'multiple_failed_attempts'
  | 'password_changed'
  | 'email_changed'
  | 'phone_changed'
  | 'session_revoked'
  | 'suspicious_activity';

// ──────────────────────────────────────────────────────────────────────────────
// Notification Center Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Extended Notification with customer-specific fields
 */
export interface CustomerNotification extends Notification {
  /** Notification category */
  category: NotificationCategory;
  /** Priority level */
  priority: 'low' | 'normal' | 'high' | 'urgent';
  /** Action URL (if applicable) */
  actionUrl?: string | null;
  /** Action label (if applicable) */
  actionLabel?: string | null;
  /** Related entity ID (order, shipment, etc.) */
  relatedEntityId?: string | null;
  /** Related entity type */
  relatedEntityType?:
    'order' | 'shipment' | 'payment' | 'return' | 'product' | null;
  /** Expiry date for time-sensitive notifications */
  expiresAt?: string | null;
}

/**
 * Notification Categories
 */
export type NotificationCategory =
  | 'order_updates'
  | 'shipment_updates'
  | 'payment_updates'
  | 'promotional'
  | 'system'
  | 'account'
  | 'security';

/**
 * Notification Preferences
 */
export interface NotificationPreferences {
  /** Email notification preferences */
  email: NotificationChannelPreferences;
  /** SMS notification preferences */
  sms: NotificationChannelPreferences;
  /** Push notification preferences */
  push: NotificationChannelPreferences;
  /** In-app notification preferences */
  inApp: NotificationChannelPreferences;
}

/**
 * Notification Channel Preferences
 */
export interface NotificationChannelPreferences {
  /** Channel enabled */
  enabled: boolean;
  /** Category preferences */
  categories: NotificationCategoryPreferences;
}

/**
 * Notification Summary
 */
export interface NotificationSummary {
  /** Total unread count */
  unreadCount: number;
  /** Total count */
  totalCount: number;
  /** Unread by category */
  unreadByCategory: Record<NotificationCategory, number>;
  /** Recent notifications */
  recentNotifications: CustomerNotification[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Dashboard Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Customer Dashboard Data
 */
export interface CustomerDashboard {
  /** Customer profile */
  profile: CustomerProfile;
  /** Quick actions available */
  quickActions: QuickAction[];
  /** Recent orders (last 5) */
  recentOrders: RecentOrderSummary[];
  /** Active returns */
  activeReturns: ActiveReturnSummary[];
  /** Wishlist summary */
  wishlistSummary: WishlistSummary;
  /** Notification summary */
  notificationSummary: NotificationSummary;
  /** Account health */
  accountHealth: AccountHealth;
  /** Recommended products */
  recommendedProducts?: RecommendedProduct[];
}

/**
 * Quick Action
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number | null;
}

/**
 * Recent Order Summary
 */
export interface RecentOrderSummary {
  id: Id;
  orderNumber: string;
  status: string;
  customerVisibleStatus: string;
  totalAmount: Money;
  itemCount: number;
  placedAt: string;
  imageUrl?: string | null;
}

/**
 * Active Return Summary
 */
export interface ActiveReturnSummary {
  id: Id;
  orderNumber: string;
  status: string;
  requestedAt: string;
  refundAmount?: Money;
}

/**
 * Wishlist Summary
 */
export interface WishlistSummary {
  itemCount: number;
  items: WishlistItemSummary[];
}

/**
 * Wishlist Item Summary
 */
export interface WishlistItemSummary {
  id: Id;
  productId: Id;
  productName: string;
  imageUrl?: string | null;
  price: Money;
  addedAt: string;
  inStock: boolean;
}

/**
 * Account Health
 */
export interface AccountHealth {
  /** Overall health score (0-100) */
  score: number;
  /** Health status */
  status: 'excellent' | 'good' | 'fair' | 'poor';
  /** Health factors */
  factors: HealthFactor[];
}

/**
 * Health Factor
 */
export interface HealthFactor {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: number;
  description: string;
}

/**
 * Recommended Product
 */
export interface RecommendedProduct {
  id: Id;
  productId: Id;
  productName: string;
  imageUrl?: string | null;
  price: Money;
  compareAtPrice?: Money | null;
  discountPercentage?: number;
  reason: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Event Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Customer Event Base
 */
export interface CustomerEvent {
  id: Id;
  eventType: CustomerEventType;
  userId: Id;
  data: Record<string, unknown>;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Customer Event Types
 */
export type CustomerEventType =
  | 'profile.updated'
  | 'profile.avatar_updated'
  | 'address.added'
  | 'address.updated'
  | 'address.deleted'
  | 'address.default_changed'
  | 'preference.updated'
  | 'preference.theme_changed'
  | 'preference.language_changed'
  | 'preference.communication_changed'
  | 'preference.privacy_changed'
  | 'preference.marketing_changed'
  | 'notification.read'
  | 'notification.preferences_updated'
  | 'session.created'
  | 'session.revoked'
  | 'security.alert_triggered'
  | 'security.password_changed'
  | 'security.email_changed'
  | 'security.phone_changed';

/**
 * Profile Updated Event
 */
export interface ProfileUpdatedEvent extends CustomerEvent {
  eventType: 'profile.updated';
  data: {
    userId: Id;
    changes: Record<string, { from: unknown; to: unknown }>;
  };
}

/**
 * Address Added Event
 */
export interface AddressAddedEvent extends CustomerEvent {
  eventType: 'address.added';
  data: {
    userId: Id;
    addressId: Id;
    addressType: string;
  };
}

/**
 * Preference Updated Event
 */
export interface PreferenceUpdatedEvent extends CustomerEvent {
  eventType: 'preference.updated';
  data: {
    userId: Id;
    preferenceType: string;
    changes: Record<string, { from: unknown; to: unknown }>;
  };
}

/**
 * Notification Read Event
 */
export interface NotificationReadEvent extends CustomerEvent {
  eventType: 'notification.read';
  data: {
    userId: Id;
    notificationIds: Id[];
    readAt: string;
  };
}

/**
 * Session Revoked Event
 */
export interface SessionRevokedEvent extends CustomerEvent {
  eventType: 'session.revoked';
  data: {
    userId: Id;
    sessionId: Id;
    revokedAt: string;
    reason?: string;
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// API Request/Response Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Update Profile Request
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
}

/**
 * Update Preferences Request
 */
export interface UpdatePreferencesRequest {
  theme?: Theme;
  locale?: 'en-IN' | 'bn-IN' | 'hi-IN';
  communication?: Partial<CommunicationPreferences>;
  privacy?: Partial<PrivacyPreferences>;
  marketing?: Partial<MarketingPreferences>;
}

/**
 * Create Address Request
 */
export interface CreateAddressRequest {
  type: 'home' | 'work' | 'other';
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone: string;
  isDefault?: boolean;
}

/**
 * Update Address Request
 */
export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  addressId: Id;
}

/**
 * Set Default Address Request
 */
export interface SetDefaultAddressRequest {
  addressId: Id;
  type: 'shipping' | 'billing';
}

/**
 * Change Password Request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Change Email Request
 */
export interface ChangeEmailRequest {
  newEmail: string;
  password: string;
}

/**
 * Change Phone Request
 */
export interface ChangePhoneRequest {
  newPhone: string;
  password: string;
}

/**
 * Revoke Session Request
 */
export interface RevokeSessionRequest {
  sessionId: Id;
  revokeAll?: boolean;
}

/**
 * Mark Notifications Read Request
 */
export interface MarkNotificationsReadRequest {
  notificationIds?: Id[];
  markAll?: boolean;
}

/**
 * Update Notification Preferences Request
 */
export interface UpdateNotificationPreferencesRequest {
  channel: 'email' | 'sms' | 'push' | 'in_app';
  enabled?: boolean;
  categories?: Partial<NotificationCategoryPreferences>;
}

export type ProfileUpdateRequest = UpdateProfileRequest & { email?: string };
export type PreferenceUpdateRequest = UpdatePreferencesRequest;
export interface DashboardSummary {
  profile: any;
  recentOrders: any[];
  activeReturns: any[];
  wishlistSummary: { totalCount: number; items: any[] };
  notificationSummary: {
    totalCount: number;
    unreadCount: number;
    categories: Record<string, number>;
  };
  accountHealth: { score: number; status: string };
  recommendations: any[];
}
