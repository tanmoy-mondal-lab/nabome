import type { Id } from '@nabome/types';

import {
  generateEventId,
  customerEventPublisher,
  type CustomerEventPublisher,
} from '../events';
import type {
  CustomerPreferences,
  UpdatePreferencesRequest,
  Theme,
} from '../types';

export class PreferenceService {
  private publisher: CustomerEventPublisher;
  private store: Map<Id, CustomerPreferences> = new Map();

  constructor(eventPublisher?: CustomerEventPublisher) {
    this.publisher = eventPublisher ?? customerEventPublisher;
  }

  async getPreferences(userId: Id): Promise<CustomerPreferences> {
    if (this.store.has(userId)) return this.store.get(userId)!;
    return this.getDefaultPreferences();
  }

  async updatePreferences(
    userId: Id,
    updates: any,
  ): Promise<CustomerPreferences> {
    this.validatePreferenceUpdates(updates);
    const currentPreferences = await this.getPreferences(userId);
    const changes = this.trackPreferenceChanges(currentPreferences, updates);
    const merged = this.deepMergePreferences(currentPreferences, updates);
    this.store.set(userId, merged);
    const event: any = {
      id: generateEventId(),
      type: 'preference_updated',
      eventType: 'preference_updated',
      userId,
      data: { userId, updates, changes, preferenceType: 'preferences' },
      timestamp: new Date().toISOString(),
    };
    await this.publisher.publish(event);
    return merged;
  }

  async updateTheme(userId: Id, theme: Theme): Promise<CustomerPreferences> {
    if (!this.isValidTheme(theme)) throw new Error('Invalid theme value');
    const currentPreferences = await this.getPreferences(userId);
    const changes = { theme: { from: currentPreferences.theme, to: theme } };
    const updated = { ...currentPreferences, theme };
    this.store.set(userId, updated);
    const event: any = {
      id: generateEventId(),
      type: 'preference_updated',
      eventType: 'preference_updated',
      userId,
      data: { userId, updates: { theme }, changes, preferenceType: 'theme' },
      timestamp: new Date().toISOString(),
    };
    await this.publisher.publish(event);
    return updated;
  }

  async updateLocale(
    userId: Id,
    locale: 'en-IN' | 'bn-IN' | 'hi-IN',
  ): Promise<CustomerPreferences> {
    if (!this.isValidLocale(locale)) throw new Error('Invalid locale value');
    const currentPreferences = await this.getPreferences(userId);
    const changes = { locale: { from: currentPreferences.locale, to: locale } };
    const updated = { ...currentPreferences, locale };
    this.store.set(userId, updated);
    const event: any = {
      id: generateEventId(),
      type: 'preference_updated',
      eventType: 'preference_updated',
      userId,
      data: { userId, updates: { locale }, changes, preferenceType: 'locale' },
      timestamp: new Date().toISOString(),
    };
    await this.publisher.publish(event);
    return updated;
  }

  public isValidTheme(theme: string): boolean {
    return ['light', 'dark', 'auto'].includes(theme);
  }

  public isValidLocale(locale: string): boolean {
    return ['en-IN', 'bn-IN', 'hi-IN'].includes(locale);
  }

  public deepMergePreferences(
    current: CustomerPreferences,
    updates: any,
  ): CustomerPreferences {
    const merged: any = { ...current, ...updates };
    if (updates.communication) {
      merged.communication = {
        ...(current as any).communication,
        ...updates.communication,
      };
      if (updates.communication.categories) {
        merged.communication.categories = {
          ...(current as any).communication?.categories,
          ...updates.communication.categories,
        };
      }
    }
    if (updates.privacy) {
      merged.privacy = { ...(current as any).privacy, ...updates.privacy };
    }
    if (updates.marketing) {
      merged.marketing = {
        ...(current as any).marketing,
        ...updates.marketing,
      };
    }
    return merged;
  }

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
      } as any,
      marketing: {
        emailConsent: false,
        smsConsent: false,
        pushConsent: false,
      },
    };
  }

  private validatePreferenceUpdates(updates: any): void {
    if (updates.theme !== undefined) {
      if (!this.isValidTheme(updates.theme))
        throw new Error('Invalid theme value');
    }
    if (updates.locale !== undefined) {
      if (!this.isValidLocale(updates.locale))
        throw new Error('Invalid locale value');
    }
    if (updates.communication !== undefined)
      this.validateCommunicationPreferences(updates.communication);
    if (updates.privacy !== undefined)
      this.validatePrivacyPreferences(updates.privacy);
    if (updates.marketing !== undefined)
      this.validateMarketingPreferences(updates.marketing);
  }

  private validateCommunicationPreferences(comm: any): void {
    if (
      comm.emailEnabled !== undefined &&
      typeof comm.emailEnabled !== 'boolean'
    )
      throw new Error('emailEnabled must be a boolean');
    if (comm.smsEnabled !== undefined && typeof comm.smsEnabled !== 'boolean')
      throw new Error('smsEnabled must be a boolean');
    if (comm.pushEnabled !== undefined && typeof comm.pushEnabled !== 'boolean')
      throw new Error('pushEnabled must be a boolean');
    if (
      comm.inAppEnabled !== undefined &&
      typeof comm.inAppEnabled !== 'boolean'
    )
      throw new Error('inAppEnabled must be a boolean');
    if (comm.categories !== undefined)
      this.validateNotificationCategories(comm.categories);
  }

  private validateNotificationCategories(categories: any): void {
    const validCategories = [
      'orderUpdates',
      'shipmentUpdates',
      'paymentUpdates',
      'promotional',
      'system',
    ];
    for (const key of Object.keys(categories)) {
      if (!validCategories.includes(key))
        throw new Error(`Invalid notification category: ${key}`);
      if (typeof categories[key] !== 'boolean')
        throw new Error(`${key} must be a boolean`);
    }
  }

  private validatePrivacyPreferences(privacy: any): void {
    if (privacy.profileVisibility !== undefined) {
      if (
        !['public', 'private', true, false].includes(privacy.profileVisibility)
      ) {
        if (!['public', 'private'].includes(privacy.profileVisibility))
          throw new Error('Invalid profileVisibility value');
      }
    }
    if (
      privacy.showActivityStatus !== undefined &&
      typeof privacy.showActivityStatus !== 'boolean'
    )
      throw new Error('showActivityStatus must be a boolean');
    if (
      privacy.allowAnalytics !== undefined &&
      typeof privacy.allowAnalytics !== 'boolean'
    )
      throw new Error('allowAnalytics must be a boolean');
    if (
      privacy.allowPersonalization !== undefined &&
      typeof privacy.allowPersonalization !== 'boolean'
    )
      throw new Error('allowPersonalization must be a boolean');
  }

  private validateMarketingPreferences(marketing: any): void {
    if (
      marketing.emailConsent !== undefined &&
      typeof marketing.emailConsent !== 'boolean'
    )
      throw new Error('emailConsent must be a boolean');
    if (
      marketing.smsConsent !== undefined &&
      typeof marketing.smsConsent !== 'boolean'
    )
      throw new Error('smsConsent must be a boolean');
    if (
      marketing.pushConsent !== undefined &&
      typeof marketing.pushConsent !== 'boolean'
    )
      throw new Error('pushConsent must be a boolean');
  }

  private trackPreferenceChanges(
    current: CustomerPreferences,
    updates: any,
  ): Record<string, { from: unknown; to: unknown }> {
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    if (updates.theme !== undefined && updates.theme !== (current as any).theme)
      changes.theme = { from: (current as any).theme, to: updates.theme };
    if (
      updates.locale !== undefined &&
      updates.locale !== (current as any).locale
    )
      changes.locale = { from: (current as any).locale, to: updates.locale };
    if (updates.communication !== undefined) {
      for (const key of Object.keys(updates.communication)) {
        const currentValue = (current.communication as any)[key];
        const newValue = (updates.communication as any)[key];
        if (newValue !== currentValue)
          changes[`communication.${key}`] = {
            from: currentValue,
            to: newValue,
          };
      }
    }
    if (updates.privacy !== undefined) {
      for (const key of Object.keys(updates.privacy)) {
        const currentValue = (current.privacy as any)[key];
        const newValue = (updates.privacy as any)[key];
        if (newValue !== currentValue)
          changes[`privacy.${key}`] = { from: currentValue, to: newValue };
      }
    }
    if (updates.marketing !== undefined) {
      for (const key of Object.keys(updates.marketing)) {
        const currentValue = (current.marketing as any)[key];
        const newValue = (updates.marketing as any)[key];
        if (newValue !== currentValue)
          changes[`marketing.${key}`] = { from: currentValue, to: newValue };
      }
    }
    return changes;
  }

  private mapToCustomerPreferences(preference: any): CustomerPreferences {
    return this.getDefaultPreferences();
  }

  private validatePreferenceUpdatesOld(
    updates: UpdatePreferencesRequest,
  ): void {
    this.validatePreferenceUpdates(updates);
  }
}

export const preferenceService = new PreferenceService();
