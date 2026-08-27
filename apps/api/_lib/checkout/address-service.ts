/**
 * Address Service
 *
 * Business logic layer for address operations.
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §4
 *
 * This service handles:
 * - Address CRUD operations
 * - Address validation
 * - Default address management
 * - Address type management
 */

import { CheckoutRepository } from './repository';
import type { Address, AddressInput, AddressUpdateInput } from './types';

export class AddressService {
  /**
   * Create address
   */
  static async createAddress(
    userId: string,
    input: AddressInput,
  ): Promise<Address> {
    // Validate address input
    this.validateAddressInput(input);

    // Map address type
    const addressType = this.mapAddressType(input.addressType || 'both');

    const address = await CheckoutRepository.createAddress(userId, {
      name: input.name,
      phone: input.phone,
      line1: input.line1,
      line2: input.line2 || null,
      city: input.city,
      state: input.state,
      postalCode: input.pincode,
      country: input.country || 'IN',
      type: addressType,
      isDefault: input.isDefault || false,
    });

    return address;
  }

  /**
   * Update address
   */
  static async updateAddress(
    userId: string,
    input: AddressUpdateInput,
  ): Promise<Address> {
    const existing = await CheckoutRepository.findAddressById(input.id);

    if (!existing) {
      throw new Error('Address not found');
    }

    if (existing.userId !== userId) {
      throw new Error('Unauthorized to update this address');
    }

    const updateData: any = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.line1 !== undefined) updateData.line1 = input.line1;
    if (input.line2 !== undefined) updateData.line2 = input.line2;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.state !== undefined) updateData.state = input.state;
    if (input.pincode !== undefined) updateData.postalCode = input.pincode;
    if (input.country !== undefined) updateData.country = input.country;
    if (input.addressType !== undefined)
      updateData.type = this.mapAddressType(input.addressType);
    if (input.isDefault !== undefined) updateData.isDefault = input.isDefault;

    return await CheckoutRepository.updateAddress(input.id, updateData);
  }

  /**
   * Delete address
   */
  static async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await CheckoutRepository.findAddressById(addressId);

    if (!address) {
      throw new Error('Address not found');
    }

    if (address.userId !== userId) {
      throw new Error('Unauthorized to delete this address');
    }

    await CheckoutRepository.deleteAddress(addressId);
  }

  /**
   * Get addresses for user
   */
  static async getAddresses(userId: string): Promise<Address[]> {
    return await CheckoutRepository.findAddressesByUserId(userId);
  }

  /**
   * Get default address for user
   */
  static async getDefaultAddress(userId: string): Promise<Address | null> {
    return await CheckoutRepository.findDefaultAddressByUserId(userId);
  }

  /**
   * Set address as default
   */
  static async setDefaultAddress(
    userId: string,
    addressId: string,
  ): Promise<Address> {
    const address = await CheckoutRepository.findAddressById(addressId);

    if (!address) {
      throw new Error('Address not found');
    }

    if (address.userId !== userId) {
      throw new Error('Unauthorized to update this address');
    }

    return await CheckoutRepository.setAddressAsDefault(addressId, userId);
  }

  /**
   * Validate address input
   */
  private static validateAddressInput(input: AddressInput): void {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Name is required');
    }

    if (!input.phone || !/^[6-9]\d{9}$/.test(input.phone)) {
      throw new Error('Invalid phone number');
    }

    if (!input.line1 || input.line1.trim().length === 0) {
      throw new Error('Address line 1 is required');
    }

    if (!input.city || input.city.trim().length === 0) {
      throw new Error('City is required');
    }

    if (!input.state || input.state.trim().length === 0) {
      throw new Error('State is required');
    }

    if (!input.pincode || !/^\d{6}$/.test(input.pincode)) {
      throw new Error('Invalid pincode');
    }
  }

  /**
   * Map address type from domain to database
   */
  private static mapAddressType(
    type: 'shipping' | 'billing' | 'both',
  ): 'home' | 'work' | 'other' {
    switch (type) {
      case 'shipping':
        return 'home';
      case 'billing':
        return 'work';
      case 'both':
        return 'other';
      default:
        return 'other';
    }
  }
}
