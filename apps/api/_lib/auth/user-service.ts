/**
 * User management services — profile and settings management.
 * Handles user profile updates, avatar management, preferences, and account settings.
 * Business logic remains in backend services (not frontend).
 */

import type { Address } from '@prisma/client';

import { ApiError } from '../http/errors.ts';

// ── Prisma Client ─────────────────────────────────────────────────────────────

let prisma: any = null;

function getPrisma() {
  if (!prisma) {
    // @ts-ignore - Prisma client will be generated
    prisma = new (require('@prisma/client').PrismaClient)();
  }
  return prisma;
}

// ── Profile Management ─────────────────────────────────────────────────────

export interface UpdateProfileInput {
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  locale?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  locale: string;
  avatarUrl?: string | null;
  role: string;
  status: string;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get user profile by ID.
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const user = await getPrisma().user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    locale: user.locale,
    avatarUrl: user.avatarUrl,
    role: user.role,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/**
 * Update user profile.
 */
export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UserProfile> {
  const { userId, firstName, lastName, phone, locale } = input;

  const user = await getPrisma().user.update({
    where: { id: userId },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(locale !== undefined && { locale }),
    },
  });

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    locale: user.locale,
    avatarUrl: user.avatarUrl,
    role: user.role,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/**
 * Update user avatar URL.
 */
export async function updateAvatar(
  userId: string,
  avatarUrl: string,
): Promise<UserProfile> {
  const user = await getPrisma().user.update({
    where: { id: userId },
    data: { avatarUrl },
  });

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    locale: user.locale,
    avatarUrl: user.avatarUrl,
    role: user.role,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/**
 * Remove user avatar.
 */
export async function removeAvatar(userId: string): Promise<UserProfile> {
  const user = await getPrisma().user.update({
    where: { id: userId },
    data: { avatarUrl: null },
  });

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    locale: user.locale,
    avatarUrl: user.avatarUrl,
    role: user.role,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

// ── Address Management ───────────────────────────────────────────────────────

export interface CreateAddressInput {
  userId: string;
  type: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  addressId: string;
  userId: string;
  type?: string;
  label?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  id: string;
  userId: string;
  type: string;
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all addresses for a user.
 */
export async function getUserAddresses(
  userId: string,
): Promise<AddressResponse[]> {
  const addresses = await getPrisma().address.findMany({
    where: { userId, isActive: true },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return addresses.map((addr: Address) => ({
    id: addr.id,
    userId: addr.userId,
    type: addr.type,
    label: addr.label,
    line1: addr.line1,
    line2: addr.line2,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    country: addr.country,
    phone: addr.phone,
    isDefault: addr.isDefault,
    isActive: addr.isActive,
    createdAt: addr.createdAt.toISOString(),
    updatedAt: addr.updatedAt.toISOString(),
  }));
}

/**
 * Get a specific address.
 */
export async function getAddress(
  addressId: string,
  userId: string,
): Promise<AddressResponse> {
  const address = await getPrisma().address.findFirst({
    where: { id: addressId, userId, isActive: true },
  });

  if (!address) {
    throw ApiError.notFound('Address not found');
  }

  return {
    id: address.id,
    userId: address.userId,
    type: address.type,
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
    isDefault: address.isDefault,
    isActive: address.isActive,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

/**
 * Create a new address.
 */
export async function createAddress(
  input: CreateAddressInput,
): Promise<AddressResponse> {
  const { userId, isDefault = false, ...addressData } = input;

  // If setting as default, unset other defaults
  if (isDefault) {
    await getPrisma().address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await getPrisma().address.create({
    data: {
      userId,
      isDefault,
      ...addressData,
    },
  });

  return {
    id: address.id,
    userId: address.userId,
    type: address.type,
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
    isDefault: address.isDefault,
    isActive: address.isActive,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

/**
 * Update an existing address.
 */
export async function updateAddress(
  input: UpdateAddressInput,
): Promise<AddressResponse> {
  const { addressId, userId, isDefault, ...addressData } = input;

  // Verify ownership
  const existing = await getPrisma().address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existing) {
    throw ApiError.notFound('Address not found');
  }

  // If setting as default, unset other defaults
  if (isDefault === true) {
    await getPrisma().address.updateMany({
      where: { userId, isDefault: true, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  const address = await getPrisma().address.update({
    where: { id: addressId },
    data: {
      ...(isDefault !== undefined && { isDefault }),
      ...addressData,
    },
  });

  return {
    id: address.id,
    userId: address.userId,
    type: address.type,
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
    isDefault: address.isDefault,
    isActive: address.isActive,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

/**
 * Delete an address (soft delete).
 */
export async function deleteAddress(
  addressId: string,
  userId: string,
): Promise<void> {
  const existing = await getPrisma().address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existing) {
    throw ApiError.notFound('Address not found');
  }

  await getPrisma().address.update({
    where: { id: addressId },
    data: { isActive: false },
  });
}

/**
 * Set address as default.
 */
export async function setDefaultAddress(
  addressId: string,
  userId: string,
): Promise<AddressResponse> {
  const existing = await getPrisma().address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existing) {
    throw ApiError.notFound('Address not found');
  }

  // Unset other defaults
  await getPrisma().address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  // Set new default
  const address = await getPrisma().address.update({
    where: { id: addressId },
    data: { isDefault: true },
  });

  return {
    id: address.id,
    userId: address.userId,
    type: address.type,
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
    isDefault: address.isDefault,
    isActive: address.isActive,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

// ── Account Settings ───────────────────────────────────────────────────────

export interface AccountSettings {
  userId: string;
  email: string;
  phone?: string | null;
  locale: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean; // Placeholder for future MFA
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

/**
 * Get account settings.
 */
export async function getAccountSettings(
  userId: string,
): Promise<AccountSettings> {
  const user = await getPrisma().user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return {
    userId: user.id,
    email: user.email,
    phone: user.phone,
    locale: user.locale,
    emailVerified: !!user.emailVerifiedAt,
    twoFactorEnabled: false, // TODO: Implement MFA
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
    },
  };
}

/**
 * Update account settings.
 */
export async function updateAccountSettings(
  userId: string,
  settings: Partial<
    Omit<AccountSettings, 'userId' | 'email' | 'emailVerified'>
  >,
): Promise<AccountSettings> {
  const { locale, notificationPreferences } = settings;

  const user = await getPrisma().user.update({
    where: { id: userId },
    data: {
      ...(locale !== undefined && { locale }),
    },
  });

  // TODO: Store notification preferences in a separate table

  return {
    userId: user.id,
    email: user.email,
    phone: user.phone,
    locale: user.locale,
    emailVerified: !!user.emailVerifiedAt,
    twoFactorEnabled: false,
    notificationPreferences: notificationPreferences || {
      email: true,
      sms: false,
      push: true,
    },
  };
}

// ── Account Deletion ───────────────────────────────────────────────────────

/**
 * Request account deletion (soft delete with retention period).
 */
export async function requestAccountDeletion(userId: string): Promise<void> {
  const user = await getPrisma().user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // TODO: Implement account deletion workflow with:
  // 1. Send confirmation email
  // 2. Set deletion scheduled date (30 days)
  // 3. Cancel active orders
  // 4. Revoke all sessions
  // 5. Anonymize data after retention period

  throw ApiError.validation('Account deletion not yet implemented');
}

/**
 * Cancel pending account deletion.
 */
export async function cancelAccountDeletion(_userId: string): Promise<void> {
  // TODO: Implement cancellation of scheduled deletion
  throw ApiError.validation('Account deletion not yet implemented');
}
