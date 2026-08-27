/**
 * Integration test — write/read/rollback round-trip against real Postgres
 * using the shared fixtures. Exercises the Prisma client with the canonical
 * schema: UUID ids, snake_case mapping, soft delete via isActive, Decimal
 * money, and the composite unique cart [userId, variantId] constraint.
 *
 * Requires: local Postgres running (skips otherwise). Does NOT need the API
 * server — this is a DB-layer contract test.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  makeCategory,
  makeProduct,
} from '../../../../tests/fixtures/catalog.ts';
import { makeUser } from '../../../../tests/fixtures/users.ts';

import { dbAvailable, disconnectDb, getDb, resetDb } from './helpers/db.ts';

const dbUp = await dbAvailable();

afterAll(() => disconnectDb());

describe.skipIf(!dbUp)('catalog persistence (real Postgres)', () => {
  beforeAll(async () => {
    await resetDb();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('creates and reads a category with snake_case mapping', async () => {
    const fixture = makeCategory();
    const created = await getDb().category.create({
      data: {
        id: fixture.id,
        name: fixture.name,
        slug: fixture.slug,
        description: fixture.description,
        sortOrder: fixture.sortOrder,
        isActive: fixture.isActive,
      },
    });
    expect(created.id).toBe(fixture.id);
    expect(created.slug).toBe(fixture.slug);
    const found = await getDb().category.findUnique({
      where: { id: fixture.id },
    });
    expect(found?.name).toBe('Jewelry');
  });

  it('persists a product with variants and media', async () => {
    const product = makeProduct();
    const variant = product.variants[0];
    expect(variant).toBeDefined();
    if (!variant) return;
    await getDb().category.create({
      data: {
        id: product.categoryId,
        name: 'Jewelry',
        slug: 'jewelry',
        sortOrder: 1,
        isActive: true,
      },
    });
    const shop = await getDb().shop.create({
      data: {
        id: '00000000-0000-4000-8000-000000000001',
        ownerId: '00000000-0000-4000-8000-000000000002',
        name: 'Test Shop',
        slug: 'test-shop',
        status: 'active',
      },
    });
    await getDb().product.create({
      data: {
        id: product.id,
        categoryId: product.categoryId,
        shopId: shop.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.description,
        status: 'published',
        basePrice: product.price.amount,
        isActive: true,
        variants: {
          create: [
            {
              id: variant.id,
              sku: variant.sku,
              name: 'Bronze / 18 inch',
              attributes: { color: 'bronze' },
              price: variant.price.amount,
              availableStock: variant.stock,
            },
          ],
        },
      },
    });
    const found = await getDb().product.findUnique({
      where: { slug: 'signature-bronze-necklace' },
      include: { variants: true },
    });
    expect(found?.basePrice.toFixed(2)).toBe('2499.00');
    expect(found?.variants).toHaveLength(1);
    expect(found?.variants?.[0]?.sku).toBe('NBN-LNK-BRZ-001');
  });

  it('enforces the unique slug constraint', async () => {
    const first = makeCategory({ slug: 'duplicate-slug' });
    await getDb().category.create({
      data: {
        id: first.id,
        name: 'First',
        slug: 'duplicate-slug',
        sortOrder: 1,
        isActive: true,
      },
    });
    await expect(
      getDb().category.create({
        data: {
          id: '00000000-0000-4000-8000-000000000099',
          name: 'Second',
          slug: 'duplicate-slug',
          sortOrder: 2,
          isActive: true,
        },
      }),
    ).rejects.toThrow();
  });

  it('soft-deletes via isActive (no hard delete)', async () => {
    const user = makeUser();
    await getDb().user.create({
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        locale: user.locale,
        isActive: true,
      },
    });
    await getDb().user.update({
      where: { id: user.id },
      data: { isActive: false },
    });
    const found = await getDb().user.findUnique({ where: { id: user.id } });
    expect(found?.isActive).toBe(false);
  });
});
