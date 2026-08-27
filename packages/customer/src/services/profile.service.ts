/**
 * Profile Service
 *
 * Business logic for customer profile management.
 * All profile-related operations including validation, updates, and event publishing.
 *
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 * Source: IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (binding)
 */

import type { Id } from '@nabome/types';

import { publishProfileUpdated } from '../events';
import type { CustomerProfile, UpdateProfileRequest } from '../types';

// ──────────────────────────────────────────────────────────────────────────────
// Profile Service
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Profile Service
 * Handles all profile-related business logic.
 */
export class ProfileService {
  /**
   * Get customer profile by ID
   */
  async getProfile(userId: Id): Promise<CustomerProfile> {
    // TODO: Implement database query
    // const profile = await prisma.user.findUnique({
    //   where: { id: userId },
    //   include: { addresses: true },
    // });
    // if (!profile) {
    //   throw new Error('Profile not found');
    // }
    // return this.mapToCustomerProfile(profile);
    throw new Error('Not implemented - requires database integration');
  }

  /**
   * Update customer profile
   */
  async updateProfile(
    userId: Id,
    updates: UpdateProfileRequest,
  ): Promise<CustomerProfile> {
    // Validate updates
    this.validateProfileUpdates(updates);

    // Get current profile for change tracking
    const currentProfile = await this.getProfile(userId);
    const changes = this.trackChanges(currentProfile, updates);

    // TODO: Implement database update
    // const updated = await prisma.user.update({
    //   where: { id: userId },
    //   data: updates,
    // });

    // Publish event
    await publishProfileUpdated(userId, changes);

    // TODO: Return updated profile
    return currentProfile;
  }

  /**
   * Update avatar
   */
  async updateAvatar(userId: Id, avatarUrl: string): Promise<CustomerProfile> {
    // Validate avatar URL
    if (!this.isValidAvatarUrl(avatarUrl)) {
      throw new Error('Invalid avatar URL');
    }

    const currentProfile = await this.getProfile(userId);
    const changes = {
      avatarUrl: { from: currentProfile.avatarUrl, to: avatarUrl },
    };

    // TODO: Implement database update
    // const updated = await prisma.user.update({
    //   where: { id: userId },
    //   data: { avatarUrl },
    // });

    // Publish avatar updated event
    await publishProfileUpdated(userId, changes);

    return currentProfile;
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(userId: Id): Promise<CustomerProfile> {
    const currentProfile = await this.getProfile(userId);
    const changes = {
      avatarUrl: { from: currentProfile.avatarUrl, to: null },
    };

    // TODO: Implement database update
    // const updated = await prisma.user.update({
    //   where: { id: userId },
    //   data: { avatarUrl: null },
    // });

    await publishProfileUpdated(userId, changes);

    return currentProfile;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Validate profile updates
   */
  private validateProfileUpdates(updates: UpdateProfileRequest): void {
    if (updates.firstName !== undefined) {
      if (updates.firstName.length < 1 || updates.firstName.length > 80) {
        throw new Error('First name must be between 1 and 80 characters');
      }
    }

    if (updates.lastName !== undefined) {
      if (updates.lastName.length < 1 || updates.lastName.length > 80) {
        throw new Error('Last name must be between 1 and 80 characters');
      }
    }

    if (updates.phone !== undefined) {
      if (!this.isValidPhone(updates.phone)) {
        throw new Error('Invalid phone number');
      }
    }

    if (updates.avatarUrl !== undefined) {
      if (!this.isValidAvatarUrl(updates.avatarUrl)) {
        throw new Error('Invalid avatar URL');
      }
    }

    if (updates.dateOfBirth !== undefined) {
      if (!this.isValidDateOfBirth(updates.dateOfBirth)) {
        throw new Error('Invalid date of birth');
      }
    }
  }

  /**
   * Track changes for event publishing
   */
  private trackChanges(
    current: CustomerProfile,
    updates: UpdateProfileRequest,
  ): Record<string, { from: unknown; to: unknown }> {
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    if (
      updates.firstName !== undefined &&
      updates.firstName !== current.firstName
    ) {
      changes.firstName = { from: current.firstName, to: updates.firstName };
    }

    if (
      updates.lastName !== undefined &&
      updates.lastName !== current.lastName
    ) {
      changes.lastName = { from: current.lastName, to: updates.lastName };
    }

    if (updates.phone !== undefined && updates.phone !== current.phone) {
      changes.phone = { from: current.phone, to: updates.phone };
    }

    if (
      updates.avatarUrl !== undefined &&
      updates.avatarUrl !== current.avatarUrl
    ) {
      changes.avatarUrl = { from: current.avatarUrl, to: updates.avatarUrl };
    }

    if (
      updates.dateOfBirth !== undefined &&
      updates.dateOfBirth !== current.dateOfBirth
    ) {
      changes.dateOfBirth = {
        from: current.dateOfBirth,
        to: updates.dateOfBirth,
      };
    }

    return changes;
  }

  /**
   * Validate phone number
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate avatar URL
   */
  private isValidAvatarUrl(url: string): boolean {
    // Simple URL validation - check if it starts with http:// or https://
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * Validate date of birth
   */
  private isValidDateOfBirth(dateOfBirth: string): boolean {
    const date = new Date(dateOfBirth);
    const now = new Date();
    const minAge = 13;
    const maxAge = 120;

    if (isNaN(date.getTime())) {
      return false;
    }

    const age = now.getFullYear() - date.getFullYear();
    if (age < minAge || age > maxAge) {
      return false;
    }

    return true;
  }

  /**
   * Map database user to customer profile
   */
  private mapToCustomerProfile(user: any): CustomerProfile {
    // TODO: Implement mapping from database model
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: 'customer',
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      locale: user.locale,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferences: {
        theme: 'auto',
        locale: user.locale || 'en-IN',
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
      },
      memberSince: user.createdAt,
    };
  }
}

// Singleton instance
export const profileService = new ProfileService();
