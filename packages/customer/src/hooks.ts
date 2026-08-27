/**
 * Customer Account React Hooks
 *
 * This file provides React hooks for customer account operations.
 * These hooks integrate with the store and provide data fetching,
 * mutations, and event publishing capabilities.
 *
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 * Source: MASTER_ARCHITECTURE_BLUEPRINT.md (React patterns)
 */

import { useCallback } from 'react';

import type { Id } from '@nabome/types';

import {
  publishProfileUpdated,
  publishPreferenceUpdated,
  publishNotificationRead,
  publishSessionRevoked,
} from './events';
import { useCustomerAccountStore } from './store';
import type {
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  CreateAddressRequest,
  UpdateAddressRequest,
  SetDefaultAddressRequest,
  RevokeSessionRequest,
  MarkNotificationsReadRequest,
  UpdateNotificationPreferencesRequest,
} from './types';

// ──────────────────────────────────────────────────────────────────────────────
// Profile Hooks
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Hook for customer profile operations
 */
export function useCustomerProfile() {
  const {
    profile,
    profileLoading,
    profileError,
    setProfile,
    setProfileLoading,
    setProfileError,
    updateProfile,
  } = useCustomerAccountStore();

  /**
   * Fetch customer profile
   */
  const fetchProfile = useCallback(
    async (userId: Id) => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        // TODO: Implement API call to fetch profile
        // const response = await fetch(`/api/v1/customers/${userId}/profile`);
        // const data = await response.json();
        // setProfile(data);
        setProfileLoading(false);
      } catch (error) {
        setProfileError(
          error instanceof Error ? error.message : 'Failed to fetch profile',
        );
        setProfileLoading(false);
      }
    },
    [setProfileLoading, setProfileError, setProfile],
  );

  /**
   * Update customer profile
   */
  const updateCustomerProfile = useCallback(
    async (userId: Id, updates: UpdateProfileRequest) => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        // TODO: Implement API call to update profile
        // const response = await fetch(`/api/v1/customers/${userId}/profile`, {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(updates),
        // });
        // const data = await response.json();

        // Update local state
        updateProfile(updates);

        // Publish event
        await publishProfileUpdated(userId, {
          firstName: { from: profile?.firstName, to: updates.firstName },
          lastName: { from: profile?.lastName, to: updates.lastName },
          phone: { from: profile?.phone, to: updates.phone },
          avatarUrl: { from: profile?.avatarUrl, to: updates.avatarUrl },
        });

        setProfileLoading(false);
      } catch (error) {
        setProfileError(
          error instanceof Error ? error.message : 'Failed to update profile',
        );
        setProfileLoading(false);
        throw error;
      }
    },
    [profile, updateProfile, setProfileLoading, setProfileError],
  );

  return {
    profile,
    profileLoading,
    profileError,
    fetchProfile,
    updateProfile: updateCustomerProfile,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Preferences Hooks
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Hook for customer preferences operations
 */
export function useCustomerPreferences() {
  const {
    preferences,
    preferencesLoading,
    preferencesError,
    setPreferences,
    setPreferencesLoading,
    setPreferencesError,
    updatePreferences,
    setTheme,
  } = useCustomerAccountStore();

  /**
   * Fetch customer preferences
   */
  const fetchPreferences = useCallback(
    async (userId: Id) => {
      setPreferencesLoading(true);
      setPreferencesError(null);
      try {
        // TODO: Implement API call to fetch preferences
        // const response = await fetch(`/api/v1/customers/${userId}/preferences`);
        // const data = await response.json();
        // setPreferences(data);
        setPreferencesLoading(false);
      } catch (error) {
        setPreferencesError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch preferences',
        );
        setPreferencesLoading(false);
      }
    },
    [setPreferencesLoading, setPreferencesError, setPreferences],
  );

  /**
   * Update customer preferences
   */
  const updateCustomerPreferences = useCallback(
    async (userId: Id, updates: UpdatePreferencesRequest) => {
      setPreferencesLoading(true);
      setPreferencesError(null);
      try {
        // TODO: Implement API call to update preferences
        // const response = await fetch(`/api/v1/customers/${userId}/preferences`, {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(updates),
        // });
        // const data = await response.json();

        // Update local state
        updatePreferences(
          updates as Partial<import('./types').CustomerPreferences>,
        );

        // Publish event
        await publishPreferenceUpdated(
          userId,
          'preferences',
          updates as unknown as Record<string, { from: unknown; to: unknown }>,
        );

        setPreferencesLoading(false);
      } catch (error) {
        setPreferencesError(
          error instanceof Error
            ? error.message
            : 'Failed to update preferences',
        );
        setPreferencesLoading(false);
        throw error;
      }
    },
    [updatePreferences, setPreferencesLoading, setPreferencesError],
  );

  /**
   * Update theme
   */
  const updateTheme = useCallback(
    async (theme: 'light' | 'dark' | 'auto') => {
      setTheme(theme);
      // Theme is persisted via store persist middleware
      // Event publishing happens on full preference update
    },
    [setTheme],
  );

  return {
    preferences,
    preferencesLoading,
    preferencesError,
    fetchPreferences,
    updatePreferences: updateCustomerPreferences,
    updateTheme,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Address Hooks
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Hook for address book operations
 */
export function useAddressBook() {
  const {
    addresses,
    addressesLoading,
    addressesError,
    defaultShippingAddressId,
    defaultBillingAddressId,
    setAddresses,
    setAddressesLoading,
    setAddressesError,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultShippingAddress,
    setDefaultBillingAddress,
  } = useCustomerAccountStore();

  /**
   * Fetch addresses
   */
  const fetchAddresses = useCallback(
    async (userId: Id) => {
      setAddressesLoading(true);
      setAddressesError(null);
      try {
        // TODO: Implement API call to fetch addresses
        // const response = await fetch(`/api/v1/customers/${userId}/addresses`);
        // const data = await response.json();
        // setAddresses(data);
        setAddressesLoading(false);
      } catch (error) {
        setAddressesError(
          error instanceof Error ? error.message : 'Failed to fetch addresses',
        );
        setAddressesLoading(false);
      }
    },
    [setAddressesLoading, setAddressesError, setAddresses],
  );

  /**
   * Create address
   */
  const createAddress = useCallback(
    async (userId: Id, address: CreateAddressRequest) => {
      setAddressesLoading(true);
      setAddressesError(null);
      try {
        // TODO: Implement API call to create address
        // const response = await fetch(`/api/v1/customers/${userId}/addresses`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(address),
        // });
        // const data = await response.json();

        // const newAddress = { ...data, id: generateId() };
        // addAddress(newAddress);

        // Publish event
        // await publishAddressAdded(userId, newAddress.id, address.type);

        setAddressesLoading(false);
        // return newAddress;
      } catch (error) {
        setAddressesError(
          error instanceof Error ? error.message : 'Failed to create address',
        );
        setAddressesLoading(false);
        throw error;
      }
    },
    [addAddress, setAddressesLoading, setAddressesError],
  );

  /**
   * Update address
   */
  const updateCustomerAddress = useCallback(
    async (addressId: Id, updates: UpdateAddressRequest) => {
      setAddressesLoading(true);
      setAddressesError(null);
      try {
        // TODO: Implement API call to update address
        // const response = await fetch(`/api/v1/customers/addresses/${addressId}`, {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(updates),
        // });
        // const data = await response.json();

        updateAddress(addressId, updates);
        setAddressesLoading(false);
      } catch (error) {
        setAddressesError(
          error instanceof Error ? error.message : 'Failed to update address',
        );
        setAddressesLoading(false);
        throw error;
      }
    },
    [updateAddress, setAddressesLoading, setAddressesError],
  );

  /**
   * Delete address
   */
  const deleteAddress = useCallback(
    async (addressId: Id) => {
      setAddressesLoading(true);
      setAddressesError(null);
      try {
        // TODO: Implement API call to delete address
        // await fetch(`/api/v1/customers/addresses/${addressId}`, {
        //   method: 'DELETE',
        // });

        removeAddress(addressId);
        setAddressesLoading(false);
      } catch (error) {
        setAddressesError(
          error instanceof Error ? error.message : 'Failed to delete address',
        );
        setAddressesLoading(false);
        throw error;
      }
    },
    [removeAddress, setAddressesLoading, setAddressesError],
  );

  /**
   * Set default address
   */
  const setDefault = useCallback(
    async (request: SetDefaultAddressRequest) => {
      setAddressesLoading(true);
      setAddressesError(null);
      try {
        // TODO: Implement API call to set default address
        // await fetch(`/api/v1/customers/addresses/${request.addressId}/default`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ type: request.type }),
        // });

        if (request.type === 'shipping') {
          setDefaultShippingAddress(request.addressId);
        } else {
          setDefaultBillingAddress(request.addressId);
        }

        setAddressesLoading(false);
      } catch (error) {
        setAddressesError(
          error instanceof Error
            ? error.message
            : 'Failed to set default address',
        );
        setAddressesLoading(false);
        throw error;
      }
    },
    [
      setDefaultShippingAddress,
      setDefaultBillingAddress,
      setAddressesLoading,
      setAddressesError,
    ],
  );

  return {
    addresses,
    addressesLoading,
    addressesError,
    defaultShippingAddressId,
    defaultBillingAddressId,
    fetchAddresses,
    createAddress,
    updateAddress: updateCustomerAddress,
    deleteAddress,
    setDefault,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Session Hooks
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Hook for session management
 */
export function useSessions() {
  const {
    sessions,
    sessionsLoading,
    sessionsError,
    setSessions,
    setSessionsLoading,
    setSessionsError,
    removeSession,
  } = useCustomerAccountStore();

  /**
   * Fetch sessions
   */
  const fetchSessions = useCallback(
    async (userId: Id) => {
      setSessionsLoading(true);
      setSessionsError(null);
      try {
        // TODO: Implement API call to fetch sessions
        // const response = await fetch(`/api/v1/customers/${userId}/sessions`);
        // const data = await response.json();
        // setSessions(data);
        setSessionsLoading(false);
      } catch (error) {
        setSessionsError(
          error instanceof Error ? error.message : 'Failed to fetch sessions',
        );
        setSessionsLoading(false);
      }
    },
    [setSessionsLoading, setSessionsError, setSessions],
  );

  /**
   * Revoke session
   */
  const revokeSession = useCallback(
    async (userId: Id, request: RevokeSessionRequest) => {
      setSessionsLoading(true);
      setSessionsError(null);
      try {
        // TODO: Implement API call to revoke session
        // await fetch(`/api/v1/customers/sessions/${request.sessionId}/revoke`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ revokeAll: request.revokeAll }),
        // });

        if (request.revokeAll) {
          setSessions([]);
        } else {
          removeSession(request.sessionId);
        }

        // Publish event
        await publishSessionRevoked(
          userId,
          request.sessionId,
          'User requested revocation',
        );

        setSessionsLoading(false);
      } catch (error) {
        setSessionsError(
          error instanceof Error ? error.message : 'Failed to revoke session',
        );
        setSessionsLoading(false);
        throw error;
      }
    },
    [removeSession, setSessionsLoading, setSessionsError],
  );

  return {
    sessions,
    sessionsLoading,
    sessionsError,
    fetchSessions,
    revokeSession,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Notification Hooks
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Hook for notification management
 */
export function useNotifications() {
  const {
    notifications,
    notificationsLoading,
    notificationsError,
    unreadCount,
    setNotifications,
    setNotificationsLoading,
    setNotificationsError,
    markAsRead,
    markAllAsRead,
  } = useCustomerAccountStore();

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(
    async (userId: Id) => {
      setNotificationsLoading(true);
      setNotificationsError(null);
      try {
        // TODO: Implement API call to fetch notifications
        // const response = await fetch(`/api/v1/customers/${userId}/notifications`);
        // const data = await response.json();
        // setNotifications(data);
        setNotificationsLoading(false);
      } catch (error) {
        setNotificationsError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch notifications',
        );
        setNotificationsLoading(false);
      }
    },
    [setNotificationsLoading, setNotificationsError, setNotifications],
  );

  /**
   * Mark notifications as read
   */
  const markNotificationsRead = useCallback(
    async (userId: Id, request: MarkNotificationsReadRequest) => {
      setNotificationsLoading(true);
      setNotificationsError(null);
      try {
        // TODO: Implement API call to mark as read
        // await fetch(`/api/v1/customers/${userId}/notifications/read`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(request),
        // });

        if (request.markAll) {
          markAllAsRead();
          const allIds = notifications.map((n: { id: string }) => n.id);
          await publishNotificationRead(userId, allIds);
        } else if (request.notificationIds) {
          for (const id of request.notificationIds) {
            markAsRead(id);
          }
          await publishNotificationRead(userId, request.notificationIds);
        }

        setNotificationsLoading(false);
      } catch (error) {
        setNotificationsError(
          error instanceof Error
            ? error.message
            : 'Failed to mark notifications as read',
        );
        setNotificationsLoading(false);
        throw error;
      }
    },
    [
      notifications,
      markAllAsRead,
      markAsRead,
      setNotificationsLoading,
      setNotificationsError,
    ],
  );

  /**
   * Update notification preferences
   */
  const updateNotificationPreferences = useCallback(
    async (userId: Id, request: UpdateNotificationPreferencesRequest) => {
      setNotificationsLoading(true);
      setNotificationsError(null);
      try {
        // TODO: Implement API call to update notification preferences
        // await fetch(`/api/v1/customers/${userId}/notifications/preferences`, {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(request),
        // });

        setNotificationsLoading(false);
      } catch (error) {
        setNotificationsError(
          error instanceof Error
            ? error.message
            : 'Failed to update notification preferences',
        );
        setNotificationsLoading(false);
        throw error;
      }
    },
    [setNotificationsLoading, setNotificationsError],
  );

  return {
    notifications,
    notificationsLoading,
    notificationsError,
    unreadCount,
    fetchNotifications,
    markNotificationsRead,
    updateNotificationPreferences,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Dashboard Hooks
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Hook for customer dashboard
 */
export function useCustomerDashboard() {
  const {
    dashboard,
    dashboardLoading,
    dashboardError,
    setDashboard,
    setDashboardLoading,
    setDashboardError,
  } = useCustomerAccountStore();

  /**
   * Fetch dashboard data
   */
  const fetchDashboard = useCallback(
    async (userId: Id) => {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        // TODO: Implement API call to fetch dashboard
        // const response = await fetch(`/api/v1/customers/${userId}/dashboard`);
        // const data = await response.json();
        // setDashboard(data);
        setDashboardLoading(false);
      } catch (error) {
        setDashboardError(
          error instanceof Error ? error.message : 'Failed to fetch dashboard',
        );
        setDashboardLoading(false);
      }
    },
    [setDashboardLoading, setDashboardError, setDashboard],
  );

  return {
    dashboard,
    dashboardLoading,
    dashboardError,
    fetchDashboard,
  };
}
