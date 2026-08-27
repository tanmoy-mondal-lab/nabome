/**
 * Shared test fixtures — typed factory helpers for the domain models in
 * @nabome/types. Pure functions (no side effects, no fakes), so they can be
 * used from unit, integration, and e2e tests alike.
 *
 * Conventions: deterministic UUID ids, timestamps fixed to
 * "2026-01-01T00:00:00.000Z", money in INR major units.
 */
import type { User } from '@nabome/types';

export const USER_IDS = {
  customer: '00000000-0000-4000-8000-000000000001',
  admin: '00000000-0000-4000-8000-000000000002',
  shopOwner: '00000000-0000-4000-8000-000000000003',
} as const;

const TS = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: USER_IDS.customer,
    email: 'customer@example.com',
    firstName: 'Ayesha',
    lastName: 'Rahman',
    role: 'customer',
    status: 'active',
    emailVerifiedAt: TS.createdAt,
    phone: '+8801711111111',
    locale: 'en-IN',
    avatarUrl: null,
    isActive: true,
    ...TS,
    ...overrides,
  };
}

export function makeAdmin(overrides: Partial<User> = {}): User {
  return makeUser({
    id: USER_IDS.admin,
    email: 'admin@nabome.online',
    firstName: 'Platform',
    lastName: 'Admin',
    role: 'admin',
    ...overrides,
  });
}

export function makeShopOwner(overrides: Partial<User> = {}): User {
  return makeUser({
    id: USER_IDS.shopOwner,
    email: 'shop@nabome.online',
    firstName: 'Shop',
    lastName: 'Owner',
    role: 'shop_owner',
    ...overrides,
  });
}
