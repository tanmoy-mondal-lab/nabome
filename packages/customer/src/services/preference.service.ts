/**
 * Preference Service
 *
 * Business logic for customer preference management.
 * Handles theme, language, communication, privacy, and marketing preferences.
 *
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 */

import type { Id } from '@nabome/types';

import { publishPreferenceUpdated } from '../events';
import type {
  CustomerPreferences,
  UpdatePreferencesRequest,
  Theme,
} from '../types';

// ──────────────────────────────────────────────────────────────────────────────
// Preference Service
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Preference Service
 * Handles all preference-related business logic.
 */
export class PreferenceService {
  /**
   * Get customer preferences by user ID
   */
  async getPreferences(userId: Id): Promise<CustomerPreferences> {
    // TODO: Implement database query
    // const preferences = await prisma.customerPreference.findUnique({
    //   where: { userId },
    // });
    // if (!preferences) {
    //   return this.getDefaultPreferences();
    // }
    // return this.mapToCustomerPreferences(preferences);
    return this.getDefaultPreferences();
  }

  /**
   * Update customer preferences
   */
  async updatePreferences(
    userId: Id,
    updates: UpdatePreferencesRequest,
  ): Promise<CustomerPreferences> {
    // Validate updates
    this.validatePreferenceUpdates(updates);

    // Get current preferences for change tracking
    const currentPreferences = await this.getPreferences(userId);
    const changes = this.trackPreferenceChanges(currentPreferences, updates);

    // TODO: Implement database update
    // const updated = await prisma.customerPreference.upsert({
    //   where: { userId },
    //   create: { userId, ...updates },
    //   update: updates,
    // });

    // Publish event
    await publishPreferenceUpdated(userId, 'preferences', changes);

    // Return merged preferences with proper deep merge
    return {
      ...currentPreferences,
      ...updates,
      communication: updates.communication
        ? { ...currentPreferences.communication, ...updates.communication }
        : currentPreferences.communication,
      privacy: updates.privacy
        ? { ...currentPreferences.privacy, ...updates.privacy }
        : currentPreferences.privacy,
      marketing: updates.marketing
        ? { ...currentPreferences.marketing, ...updates.marketing }
        : currentPreferences.marketing,
    };
  }

  /**
   * Update theme
   */
  async updateTheme(userId: Id, theme: Theme): Promise<CustomerPreferences> {
    const currentPreferences = await this.getPreferences(userId);
    const changes = {
      theme: { from: currentPreferences.theme, to: theme },
    };

    // TODO: Implement database update
    // await prisma.customerPreference.upsert({
    //   where: { userId },
    //   create: { userId, theme },
    //   update: { theme },
    // });

    await publishPreferenceUpdated(userId, 'theme', changes);

    return { ...currentPreferences, theme };
  }

  /**
   * Update locale/language
   */
  async updateLocale(
    userId: Id,
    locale: 'en-IN' | 'bn-IN' | 'hi-IN',
  ): Promise<CustomerPreferences> {
    const currentPreferences = await this.getPreferences(userId);
    const changes = {
      locale: { from: currentPreferences.locale, to: locale },
    };

    // TODO: Implement database update
    // await prisma.customerPreference.upsert({
    //   where: { userId },
    //   create: { userId, locale },
    //   update: { locale },
    // });

    await publishPreferenceUpdated(userId, 'locale', changes);

    return { ...currentPreferences, locale };
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): CustomerPreferences {
    return {
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
  }

  /**
   * Validate preference updates
   */
  private validatePreferenceUpdates(updates: UpdatePreferencesRequest): void {
    if (updates.theme !== undefined) {
      if (!['light', 'dark', 'auto'].includes(updates.theme)) {
        throw new Error('Invalid theme value');
      }
    }

    if (updates.locale !== undefined) {
      if (!['en-IN', 'bn-IN', 'hi-IN'].includes(updates.locale)) {
        throw new Error('Invalid locale value');
      }
    }

    if (updates.communication !== undefined) {
      this.validateCommunicationPreferences(updates.communication);
    }

    if (updates.privacy !== undefined) {
      this.validatePrivacyPreferences(updates.privacy);
    }

    if (updates.marketing !== undefined) {
      this.validateMarketingPreferences(updates.marketing);
    }
  }

  /**
   * Validate communication preferences
   */
  private validateCommunicationPreferences(comm: any): void {
    if (
      comm.emailEnabled !== undefined &&
      typeof comm.emailEnabled !== 'boolean'
    ) {
      throw new Error('emailEnabled must be a boolean');
    }

    if (comm.smsEnabled !== undefined && typeof comm.smsEnabled !== 'boolean') {
      throw new Error('smsEnabled must be a boolean');
    }

    if (
      comm.pushEnabled !== undefined &&
      typeof comm.pushEnabled !== 'boolean'
    ) {
      throw new Error('pushEnabled must be a boolean');
    }

    if (
      comm.inAppEnabled !== undefined &&
      typeof comm.inAppEnabled !== 'boolean'
    ) {
      throw new Error('inAppEnabled must be a boolean');
    }

    if (comm.categories !== undefined) {
      this.validateNotificationCategories(comm.categories);
    }
  }

  /**
   * Validate notification categories
   */
  private validateNotificationCategories(categories: any): void {
    const validCategories = [
      'orderUpdates',
      'shipmentUpdates',
      'paymentUpdates',
      'promotional',
      'system',
    ];

    for (const key of Object.keys(categories)) {
      if (!validCategories.includes(key)) {
        throw new Error(`Invalid notification category: ${key}`);
      }
      if (typeof categories[key] !== 'boolean') {
        throw new Error(`${key} must be a boolean`);
      }
    }
  }

  /**
   * Validate privacy preferences
   */
  private validatePrivacyPreferences(privacy: any): void {
    if (privacy.profileVisibility !== undefined) {
      if (!['public', 'private'].includes(privacy.profileVisibility)) {
        throw new Error('Invalid profileVisibility value');
      }
    }

    if (
      privacy.showActivityStatus !== undefined &&
      typeof privacy.showActivityStatus !== 'boolean'
    ) {
      throw new Error('showActivityStatus must be a boolean');
    }

    if (
      privacy.allowAnalytics !== undefined &&
      typeof privacy.allowAnalytics !== 'boolean'
    ) {
      throw new Error('allowAnalytics must be a boolean');
    }

    if (
      privacy.allowPersonalization !== undefined &&
      typeof privacy.allowPersonalization !== 'boolean'
    ) {
      throw new Error('allowPersonalization must be a boolean');
    }
  }

  /**
   * Validate marketing preferences
   */
  private validateMarketingPreferences(marketing: any): void {
    if (
      marketing.emailConsent !== undefined &&
      typeof marketing.emailConsent !== 'boolean'
    ) {
      throw new Error('emailConsent must be a boolean');
    }

    if (
      marketing.smsConsent !== undefined &&
      typeof marketing.smsConsent !== 'boolean'
    ) {
      throw new Error('smsConsent must be a boolean');
    }

    if (
      marketing.pushConsent !== undefined &&
      typeof marketing.pushConsent !== 'boolean'
    ) {
      throw new Error('pushConsent must be a boolean');
    }
  }

  /**
   * Track preference changes for event publishing
   */
  private trackPreferenceChanges(
    current: CustomerPreferences,
    updates: UpdatePreferencesRequest,
  ): Record<string, { from: unknown; to: unknown }> {
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    if (updates.theme !== undefined && updates.theme !== current.theme) {
      changes.theme = { from: current.theme, to: updates.theme };
    }

    if (updates.locale !== undefined && updates.locale !== current.locale) {
      changes.locale = { from: current.locale, to: updates.locale };
    }

    if (updates.communication !== undefined) {
      for (const key of Object.keys(updates.communication)) {
        const currentValue = (current.communication as any)[key];
        const newValue = (updates.communication as any)[key];
        if (newValue !== currentValue) {
          changes[`communication.${key}`] = {
            from: currentValue,
            to: newValue,
          };
        }
      }
    }

    if (updates.privacy !== undefined) {
      for (const key of Object.keys(updates.privacy)) {
        const currentValue = (current.privacy as any)[key];
        const newValue = (updates.privacy as any)[key];
        if (newValue !== currentValue) {
          changes[`privacy.${key}`] = {
            from: currentValue,
            to: newValue,
          };
        }
      }
    }

    if (updates.marketing !== undefined) {
      for (const key of Object.keys(updates.marketing)) {
        const currentValue = (current.marketing as any)[key];
        const newValue = (updates.marketing as any)[key];
        if (newValue !== currentValue) {
          changes[`marketing.${key}`] = {
            from: currentValue,
            to: newValue,
          };
        }
      }
    }

    return changes;
  }

  /**
   * Map database preference to customer preferences
   */
  private mapToCustomerPreferences(preference: any): CustomerPreferences {
    // TODO: Implement mapping from database model
    return this.getDefaultPreferences();
  }
}

// Singleton instance
export const preferenceService = new PreferenceService();
