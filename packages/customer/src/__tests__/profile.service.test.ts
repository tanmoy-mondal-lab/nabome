/**
 * Profile Service Tests
 *
 * Unit tests for ProfileService including profile retrieval, updates,
 * avatar management, validation, and event publishing.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { InMemoryCustomerEventPublisher } from '../events';
import { ProfileService } from '../services/profile.service';
import type { CustomerProfile, ProfileUpdateRequest } from '../types';

describe('ProfileService', () => {
  let profileService: ProfileService;
  let eventPublisher: InMemoryCustomerEventPublisher;

  beforeEach(() => {
    eventPublisher = new InMemoryCustomerEventPublisher();
    profileService = new ProfileService(eventPublisher);
  });

  describe('getProfile', () => {
    it('should return customer profile by userId', async () => {
      const mockProfile: CustomerProfile = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        preferences: {
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
        },
        memberSince: '2024-01-01T00:00:00Z',
      };

      // TODO: Mock database call
      // vi.spyOn(db, 'user.findUnique').mockResolvedValue(mockProfile);

      const result = await profileService.getProfile('user-123');
      // expect(result).toEqual(mockProfile);
    });

    it('should return null for non-existent user', async () => {
      const result = await profileService.getProfile('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile and publish ProfileUpdated event', async () => {
      const updates: ProfileUpdateRequest = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      let publishedEvent: any = null;
      eventPublisher.on('profile_updated', (event) => {
        publishedEvent = event;
      });

      await profileService.updateProfile('user-123', updates);

      expect(publishedEvent).not.toBeNull();
      expect(publishedEvent.type).toBe('profile_updated');
      expect(publishedEvent.userId).toBe('user-123');
    });

    it('should validate email format', async () => {
      const updates: ProfileUpdateRequest = {
        email: 'invalid-email',
      };

      await expect(
        profileService.updateProfile('user-123', updates),
      ).rejects.toThrow('Invalid email format');
    });

    it('should validate phone format', async () => {
      const updates: ProfileUpdateRequest = {
        phone: 'invalid-phone',
      };

      await expect(
        profileService.updateProfile('user-123', updates),
      ).rejects.toThrow('Invalid phone format');
    });

    it('should validate date of birth format', async () => {
      const updates: ProfileUpdateRequest = {
        dateOfBirth: 'invalid-date',
      };

      await expect(
        profileService.updateProfile('user-123', updates),
      ).rejects.toThrow('Invalid date of birth format');
    });
  });

  describe('updateAvatar', () => {
    it('should update avatar URL and publish AvatarUpdated event', async () => {
      const avatarUrl = 'https://example.com/avatar.jpg';

      let publishedEvent: any = null;
      eventPublisher.on('avatar_updated', (event) => {
        publishedEvent = event;
      });

      await profileService.updateAvatar('user-123', avatarUrl);

      expect(publishedEvent).not.toBeNull();
      expect(publishedEvent.type).toBe('avatar_updated');
      expect(publishedEvent.userId).toBe('user-123');
      expect(publishedEvent.data.avatarUrl).toBe(avatarUrl);
    });

    it('should validate avatar URL format', async () => {
      const invalidUrl = 'not-a-valid-url';

      await expect(
        profileService.updateAvatar('user-123', invalidUrl),
      ).rejects.toThrow('Invalid avatar URL');
    });
  });

  describe('validation helpers', () => {
    describe('isValidPhone', () => {
      it('should return true for valid Indian phone numbers', () => {
        expect(profileService['isValidPhone']('+919876543210')).toBe(true);
        expect(profileService['isValidPhone']('9876543210')).toBe(true);
      });

      it('should return false for invalid phone numbers', () => {
        expect(profileService['isValidPhone']('123')).toBe(false);
        expect(profileService['isValidPhone']('invalid')).toBe(false);
      });
    });

    describe('isValidAvatarUrl', () => {
      it('should return true for valid URLs', () => {
        expect(
          profileService['isValidAvatarUrl']('https://example.com/avatar.jpg'),
        ).toBe(true);
        expect(
          profileService['isValidAvatarUrl']('http://example.com/avatar.png'),
        ).toBe(true);
      });

      it('should return false for invalid URLs', () => {
        expect(profileService['isValidAvatarUrl']('not-a-url')).toBe(false);
        expect(profileService['isValidAvatarUrl']('')).toBe(false);
      });
    });

    describe('isValidDateOfBirth', () => {
      it('should return true for valid dates', () => {
        expect(profileService['isValidDateOfBirth']('1990-01-01')).toBe(true);
        expect(profileService['isValidDateOfBirth']('2000-12-31')).toBe(true);
      });

      it('should return false for invalid dates', () => {
        expect(profileService['isValidDateOfBirth']('invalid')).toBe(false);
        expect(profileService['isValidDateOfBirth']('future-date')).toBe(false);
      });
    });
  });
});
