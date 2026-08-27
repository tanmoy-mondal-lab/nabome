/**
 * Customer Account Store
 *
 * This file implements the Zustand store for customer account state management.
 * It provides reactive state for profile, preferences, addresses, notifications,
 * sessions, and dashboard data.
 *
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md (state management patterns)
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { Id } from '@nabome/types';

import type {
  CustomerProfile,
  CustomerPreferences,
  CustomerAddress,
  CustomerSession,
  CustomerNotification,
  CustomerDashboard,
  Theme,
} from './types';

// ──────────────────────────────────────────────────────────────────────────────
// Store State Interface
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Customer Account Store State
 */
interface CustomerAccountState {
  // Profile
  profile: CustomerProfile | null;
  profileLoading: boolean;
  profileError: string | null;

  // Preferences
  preferences: CustomerPreferences | null;
  preferencesLoading: boolean;
  preferencesError: string | null;

  // Addresses
  addresses: CustomerAddress[];
  addressesLoading: boolean;
  addressesError: string | null;
  defaultShippingAddressId: Id | null;
  defaultBillingAddressId: Id | null;

  // Sessions
  sessions: CustomerSession[];
  sessionsLoading: boolean;
  sessionsError: string | null;

  // Notifications
  notifications: CustomerNotification[];
  notificationsLoading: boolean;
  notificationsError: string | null;
  unreadCount: number;

  // Dashboard
  dashboard: CustomerDashboard | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // Actions
  setProfile: (profile: CustomerProfile | null) => void;
  setProfileLoading: (loading: boolean) => void;
  setProfileError: (error: string | null) => void;
  updateProfile: (updates: Partial<CustomerProfile>) => void;

  setPreferences: (preferences: CustomerPreferences | null) => void;
  setPreferencesLoading: (loading: boolean) => void;
  setPreferencesError: (error: string | null) => void;
  updatePreferences: (updates: Partial<CustomerPreferences>) => void;
  setTheme: (theme: Theme) => void;

  setAddresses: (addresses: CustomerAddress[]) => void;
  setAddressesLoading: (loading: boolean) => void;
  setAddressesError: (error: string | null) => void;
  addAddress: (address: CustomerAddress) => void;
  updateAddress: (addressId: Id, updates: Partial<CustomerAddress>) => void;
  removeAddress: (addressId: Id) => void;
  setDefaultShippingAddress: (addressId: Id | null) => void;
  setDefaultBillingAddress: (addressId: Id | null) => void;

  setSessions: (sessions: CustomerSession[]) => void;
  setSessionsLoading: (loading: boolean) => void;
  setSessionsError: (error: string | null) => void;
  removeSession: (sessionId: Id) => void;

  setNotifications: (notifications: CustomerNotification[]) => void;
  setNotificationsLoading: (loading: boolean) => void;
  setNotificationsError: (error: string | null) => void;
  addNotification: (notification: CustomerNotification) => void;
  markAsRead: (notificationId: Id) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: Id) => void;

  setDashboard: (dashboard: CustomerDashboard | null) => void;
  setDashboardLoading: (loading: boolean) => void;
  setDashboardError: (error: string | null) => void;

  reset: () => void;
}

// ──────────────────────────────────────────────────────────────────────────────
// Default Preferences
// ──────────────────────────────────────────────────────────────────────────────

const defaultPreferences: CustomerPreferences = {
  theme: 'auto',
  locale: 'en-IN',
  communication: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    categories: {
      orderUpdates: true,
      shipmentUpdates: true,
      paymentUpdates: true,
      promotional: false,
      system: true,
    },
  },
  privacy: {
    profileVisibility: 'private',
    showActivityStatus: false,
    allowAnalytics: true,
    allowPersonalization: true,
  },
  marketing: {
    emailConsent: false,
    smsConsent: false,
    pushConsent: false,
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Store Implementation
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Create the customer account store
 */
export const useCustomerAccountStore = create<CustomerAccountState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        profile: null,
        profileLoading: false,
        profileError: null,

        preferences: null,
        preferencesLoading: false,
        preferencesError: null,

        addresses: [],
        addressesLoading: false,
        addressesError: null,
        defaultShippingAddressId: null,
        defaultBillingAddressId: null,

        sessions: [],
        sessionsLoading: false,
        sessionsError: null,

        notifications: [],
        notificationsLoading: false,
        notificationsError: null,
        unreadCount: 0,

        dashboard: null,
        dashboardLoading: false,
        dashboardError: null,

        // Profile actions
        setProfile: (profile) => set({ profile }),
        setProfileLoading: (loading) => set({ profileLoading: loading }),
        setProfileError: (error) => set({ profileError: error }),
        updateProfile: (updates) =>
          set((state) => ({
            profile: state.profile ? { ...state.profile, ...updates } : null,
          })),

        // Preferences actions
        setPreferences: (preferences) => set({ preferences }),
        setPreferencesLoading: (loading) =>
          set({ preferencesLoading: loading }),
        setPreferencesError: (error) => set({ preferencesError: error }),
        updatePreferences: (updates) =>
          set((state) => ({
            preferences: state.preferences
              ? { ...state.preferences, ...updates }
              : { ...defaultPreferences, ...updates },
          })),
        setTheme: (theme) =>
          set((state) => ({
            preferences: state.preferences
              ? { ...state.preferences, theme }
              : { ...defaultPreferences, theme },
          })),

        // Address actions
        setAddresses: (addresses) => set({ addresses }),
        setAddressesLoading: (loading) => set({ addressesLoading: loading }),
        setAddressesError: (error) => set({ addressesError: error }),
        addAddress: (address) =>
          set((state) => ({
            addresses: [...state.addresses, address],
          })),
        updateAddress: (addressId, updates) =>
          set((state) => ({
            addresses: state.addresses.map((addr) =>
              addr.id === addressId ? { ...addr, ...updates } : addr,
            ),
          })),
        removeAddress: (addressId) =>
          set((state) => ({
            addresses: state.addresses.filter((addr) => addr.id !== addressId),
            defaultShippingAddressId:
              state.defaultShippingAddressId === addressId
                ? null
                : state.defaultShippingAddressId,
            defaultBillingAddressId:
              state.defaultBillingAddressId === addressId
                ? null
                : state.defaultBillingAddressId,
          })),
        setDefaultShippingAddress: (addressId) =>
          set({ defaultShippingAddressId: addressId }),
        setDefaultBillingAddress: (addressId) =>
          set({ defaultBillingAddressId: addressId }),

        // Session actions
        setSessions: (sessions) => set({ sessions }),
        setSessionsLoading: (loading) => set({ sessionsLoading: loading }),
        setSessionsError: (error) => set({ sessionsError: error }),
        removeSession: (sessionId) =>
          set((state) => ({
            sessions: state.sessions.filter(
              (session) => session.id !== sessionId,
            ),
          })),

        // Notification actions
        setNotifications: (notifications) =>
          set({
            notifications,
            unreadCount: notifications.filter((n) => !n.readAt).length,
          }),
        setNotificationsLoading: (loading) =>
          set({ notificationsLoading: loading }),
        setNotificationsError: (error) => set({ notificationsError: error }),
        addNotification: (notification) =>
          set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          })),
        markAsRead: (notificationId) =>
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === notificationId
                ? { ...n, readAt: new Date().toISOString() }
                : n,
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          })),
        markAllAsRead: () =>
          set((state) => ({
            notifications: state.notifications.map((n) => ({
              ...n,
              readAt: n.readAt || new Date().toISOString(),
            })),
            unreadCount: 0,
          })),
        removeNotification: (notificationId) =>
          set((state) => ({
            notifications: state.notifications.filter(
              (n) => n.id !== notificationId,
            ),
            unreadCount: state.notifications.find(
              (n) => n.id === notificationId,
            )?.readAt
              ? state.unreadCount
              : Math.max(0, state.unreadCount - 1),
          })),

        // Dashboard actions
        setDashboard: (dashboard) => set({ dashboard }),
        setDashboardLoading: (loading) => set({ dashboardLoading: loading }),
        setDashboardError: (error) => set({ dashboardError: error }),

        // Reset
        reset: () =>
          set({
            profile: null,
            profileLoading: false,
            profileError: null,
            preferences: null,
            preferencesLoading: false,
            preferencesError: null,
            addresses: [],
            addressesLoading: false,
            addressesError: null,
            defaultShippingAddressId: null,
            defaultBillingAddressId: null,
            sessions: [],
            sessionsLoading: false,
            sessionsError: null,
            notifications: [],
            notificationsLoading: false,
            notificationsError: null,
            unreadCount: 0,
            dashboard: null,
            dashboardLoading: false,
            dashboardError: null,
          }),
      }),
      {
        name: 'nabome-customer-account',
        partialize: (state) => ({
          preferences: state.preferences,
          defaultShippingAddressId: state.defaultShippingAddressId,
          defaultBillingAddressId: state.defaultBillingAddressId,
        }),
      },
    ),
    { name: 'CustomerAccountStore' },
  ),
);

// ──────────────────────────────────────────────────────────────────────────────
// Selectors
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Select default shipping address
 */
export const selectDefaultShippingAddress = (state: CustomerAccountState) =>
  state.addresses.find((addr) => addr.id === state.defaultShippingAddressId) ||
  null;

/**
 * Select default billing address
 */
export const selectDefaultBillingAddress = (state: CustomerAccountState) =>
  state.addresses.find((addr) => addr.id === state.defaultBillingAddressId) ||
  null;

/**
 * Select unread notifications
 */
export const selectUnreadNotifications = (state: CustomerAccountState) =>
  state.notifications.filter((n) => !n.readAt);

/**
 * Select active sessions (non-expired)
 */
export const selectActiveSessions = (state: CustomerAccountState) =>
  state.sessions.filter((session) => new Date(session.expiresAt) > new Date());
