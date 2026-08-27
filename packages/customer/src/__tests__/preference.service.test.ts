/**
 * Preference Service Tests
 *
 * Unit tests for PreferenceService including preference retrieval,
 * updates, validation, deep merge, and event publishing.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { InMemoryCustomerEventPublisher } from '../events';
import { PreferenceService } from '../services/preference.service';
import type { CustomerPreferences, PreferenceUpdateRequest } from '../types';

describe('PreferenceService', () => {
  let preferenceService: PreferenceService;
  let eventPublisher: InMemoryCustomerEventPublisher;

  beforeEach(() => {
    eventPublisher = new InMemoryCustomerEventPublisher();
    preferenceService = new PreferenceService(eventPublisher);
  });

  describe('getPreferences', () => {
    it('should return customer preferences by userId', async () => {
      const mockPreferences: CustomerPreferences = {
        theme: 'light',
        locale: 'en-IN',
        communication: {
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          inAppEnabled: true,
        },
        privacy: {
          profileVisibility: true,
          showActivityStatus: true,
          allowAnalytics: true,
          allowPersonalization: true,
        },
        marketing: {
          emailConsent: false,
          smsConsent: false,
          pushConsent: false,
        },
      };

      // TODO: Mock database call
      // vi.spyOn(db, 'customerPreference.findUnique').mockResolvedValue(mockPreferences);

      const result = await preferenceService.getPreferences('user-123');
      // expect(result).toEqual(mockPreferences);
    });

    it('should return default preferences for new user', async () => {
      const result = await preferenceService.getPreferences('new-user');
      expect(result).toEqual(preferenceService['getDefaultPreferences']());
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences with deep merge and publish PreferenceUpdated event', async () => {
      const updates: PreferenceUpdateRequest = {
        theme: 'dark',
        communication: {
          emailEnabled: false,
        },
      };

      let publishedEvent: any = null;
      eventPublisher.on('preference_updated', (event) => {
        publishedEvent = event;
      });

      await preferenceService.updatePreferences('user-123', updates);

      expect(publishedEvent).not.toBeNull();
      expect(publishedEvent.type).toBe('preference_updated');
      expect(publishedEvent.userId).toBe('user-123');
    });

    it('should deeply merge nested objects', async () => {
      const updates: PreferenceUpdateRequest = {
        communication: {
          emailEnabled: false,
        },
      };

      const currentPreferences: CustomerPreferences = {
        theme: 'light',
        locale: 'en-IN',
        communication: {
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          inAppEnabled: true,
        },
        privacy: {
          profileVisibility: true,
          showActivityStatus: true,
          allowAnalytics: true,
          allowPersonalization: true,
        },
        marketing: {
          emailConsent: false,
          smsConsent: false,
          pushConsent: false,
        },
      };

      const merged = preferenceService['deepMergePreferences'](
        currentPreferences,
        updates,
      );
      expect(merged.communication.emailEnabled).toBe(false);
      expect(merged.communication.smsEnabled).toBe(false); // preserved
      expect(merged.communication.pushEnabled).toBe(true); // preserved
    });

    it('should validate theme value', async () => {
      const updates: PreferenceUpdateRequest = {
        theme: 'invalid-theme' as any,
      };

      await expect(
        preferenceService.updatePreferences('user-123', updates),
      ).rejects.toThrow('Invalid theme value');
    });

    it('should validate locale value', async () => {
      const updates: PreferenceUpdateRequest = {
        locale: 'invalid-locale' as any,
      };

      await expect(
        preferenceService.updatePreferences('user-123', updates),
      ).rejects.toThrow('Invalid locale value');
    });
  });

  describe('updateTheme', () => {
    it('should update theme preference', async () => {
      let publishedEvent: any = null;
      eventPublisher.on('preference_updated', (event) => {
        publishedEvent = event;
      });

      await preferenceService.updateTheme('user-123', 'dark');

      expect(publishedEvent).not.toBeNull();
      expect(publishedEvent.data.updates.theme).toBe('dark');
    });
  });

  describe('updateLocale', () => {
    it('should update locale preference', async () => {
      let publishedEvent: any = null;
      eventPublisher.on('preference_updated', (event) => {
        publishedEvent = event;
      });

      await preferenceService.updateLocale('user-123', 'bn-IN');

      expect(publishedEvent).not.toBeNull();
      expect(publishedEvent.data.updates.locale).toBe('bn-IN');
    });
  });

  describe('getDefaultPreferences', () => {
    it('should return default preferences', () => {
      const defaults = preferenceService['getDefaultPreferences']();
      expect(defaults.theme).toBe('auto');
      expect(defaults.locale).toBe('en-IN');
      expect(defaults.communication.emailEnabled).toBe(true);
      expect(defaults.communication.smsEnabled).toBe(false);
      expect(defaults.privacy.allowAnalytics).toBe(true);
      expect(defaults.marketing.emailConsent).toBe(false);
    });
  });

  describe('validation helpers', () => {
    describe('isValidTheme', () => {
      it('should return true for valid themes', () => {
        expect(preferenceService['isValidTheme']('light')).toBe(true);
        expect(preferenceService['isValidTheme']('dark')).toBe(true);
        expect(preferenceService['isValidTheme']('auto')).toBe(true);
      });

      it('should return false for invalid themes', () => {
        expect(preferenceService['isValidTheme']('invalid')).toBe(false);
      });
    });

    describe('isValidLocale', () => {
      it('should return true for valid locales', () => {
        expect(preferenceService['isValidLocale']('en-IN')).toBe(true);
        expect(preferenceService['isValidLocale']('bn-IN')).toBe(true);
        expect(preferenceService['isValidLocale']('hi-IN')).toBe(true);
      });

      it('should return false for invalid locales', () => {
        expect(preferenceService['isValidLocale']('invalid')).toBe(false);
      });
    });
  });
});
