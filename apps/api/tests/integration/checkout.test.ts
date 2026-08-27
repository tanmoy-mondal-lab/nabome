/**
 * Integration test — checkout endpoints against a live worker bundle.
 *
 * Requires: local Postgres (infra/docker-compose.yml or brew) and the API dev
 * server running (`pnpm dev:api`). When either is unavailable the suite skips
 * cleanly instead of failing.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { dbAvailable, disconnectDb } from './helpers/db.ts';

async function apiAvailable(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:8788/api/v1/health');
    return res.status === 200;
  } catch {
    return false;
  }
}

const dbUp = await dbAvailable();
const apiUp = await apiAvailable();

afterAll(() => disconnectDb());

describe.skipIf(!dbUp || !apiUp)('checkout endpoints', () => {
  let checkoutSessionId: string;
  let userId: string;
  let guestId: string;

  it('starts a new checkout session', async () => {
    const res = await fetch('http://localhost:8788/api/v1/checkout/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cartId: 'test-cart-1',
        userId: 'test-user-1',
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { session: { id: string; cartId: string; status: string } };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(body.data.session.status).toBe('started');
    expect(body.data.session.cartId).toBe('test-cart-1');
    checkoutSessionId = body.data.session.id;
    userId = 'test-user-1';
  });

  it('resumes an existing checkout session', async () => {
    const res = await fetch('http://localhost:8788/api/v1/checkout/resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkoutSessionId,
        userId,
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { session: { id: string; status: string } };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(body.data.session.id).toBe(checkoutSessionId);
  });

  it('validates checkout session', async () => {
    const res = await fetch('http://localhost:8788/api/v1/checkout/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkoutSessionId,
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { canProceed: boolean; errors: string[]; warnings: string[] };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(typeof body.data.canProceed).toBe('boolean');
  });

  it('updates checkout session', async () => {
    const res = await fetch(
      `http://localhost:8788/api/v1/checkout/${checkoutSessionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddressId: 'test-address-1',
        }),
      },
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { session: { id: string; shippingAddressId: string } };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(body.data.session.shippingAddressId).toBe('test-address-1');
  });

  it('locks checkout session', async () => {
    const res = await fetch(
      `http://localhost:8788/api/v1/checkout/${checkoutSessionId}/lock`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkoutSessionId,
        }),
      },
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { session: { id: string; status: string } };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(body.data.session.status).toBe('locked');
  });

  it('gets checkout session by ID', async () => {
    const res = await fetch(
      `http://localhost:8788/api/v1/checkout/${checkoutSessionId}`,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { session: { id: string; cartId: string; status: string } };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(body.data.session.id).toBe(checkoutSessionId);
  });

  it('gets checkout summary', async () => {
    const res = await fetch(
      `http://localhost:8788/api/v1/checkout/${checkoutSessionId}/summary`,
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { summary: { items: any[]; totals: any } };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.summary.items)).toBe(true);
  });

  it('handles guest checkout', async () => {
    guestId = 'test-guest-' + Math.random().toString(36).substring(7);

    const res = await fetch('http://localhost:8788/api/v1/checkout/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-id': guestId,
      },
      body: JSON.stringify({
        cartId: 'test-cart-2',
        guestId,
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { session: { id: string; cartId: string; status: string } };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(body.data.session.status).toBe('started');
  });

  it('returns 404 for non-existent checkout', async () => {
    const res = await fetch(
      'http://localhost:8788/api/v1/checkout/non-existent-id',
    );

    expect(res.status).toBe(404);
    const body = (await res.json()) as {
      success: boolean;
      error: { code: string };
    };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for invalid checkout session ID', async () => {
    const res = await fetch(
      'http://localhost:8788/api/v1/checkout/invalid-uuid-format',
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      success: boolean;
      error: { code: string };
    };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe.skipIf(!dbUp || !apiUp)('address endpoints', () => {
  let userId: string;
  let addressId: string;

  beforeAll(() => {
    userId = 'test-user-' + Math.random().toString(36).substring(7);
  });

  it('creates a new address', async () => {
    const res = await fetch('http://localhost:8788/api/v1/checkout/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
        'x-user-id': userId,
      },
      body: JSON.stringify({
        name: 'John Doe',
        phone: '9876543210',
        line1: '123 Main St',
        line2: 'Apt 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'IN',
        addressType: 'both',
        isDefault: false,
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { address: { id: string; name: string; userId: string } };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(body.data.address.name).toBe('John Doe');
    addressId = body.data.address.id;
  });

  it('gets all addresses for user', async () => {
    const res = await fetch('http://localhost:8788/api/v1/checkout/addresses', {
      headers: {
        Authorization: 'Bearer test-token',
        'x-user-id': userId,
      },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { addresses: any[]; defaultAddress: any };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.addresses)).toBe(true);
  });

  it('updates an existing address', async () => {
    const res = await fetch(
      `http://localhost:8788/api/v1/checkout/addresses/${addressId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          name: 'Jane Doe',
          phone: '9876543210',
          line1: '456 Oak Ave',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'IN',
        }),
      },
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { address: { id: string; name: string } };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(body.data.address.name).toBe('Jane Doe');
  });

  it('sets address as default', async () => {
    const res = await fetch(
      `http://localhost:8788/api/v1/checkout/addresses/${addressId}/default`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
          'x-user-id': userId,
        },
      },
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { address: { id: string; isDefault: boolean } };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(body.data.address.isDefault).toBe(true);
  });

  it('deletes an address', async () => {
    const res = await fetch(
      `http://localhost:8788/api/v1/checkout/addresses/${addressId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer test-token',
          'x-user-id': userId,
        },
      },
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { message: string };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
  });
});

describe.skipIf(!dbUp || !apiUp)('coupon endpoints', () => {
  let checkoutSessionId: string;
  let userId: string;

  beforeAll(async () => {
    userId = 'test-user-' + Math.random().toString(36).substring(7);

    // Create a checkout session first
    const res = await fetch('http://localhost:8788/api/v1/checkout/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cartId: 'test-cart-coupon',
        userId,
      }),
    });

    const body = (await res.json()) as {
      success: boolean;
      data: { session: { id: string } };
    };
    checkoutSessionId = body.data.session.id;
  });

  it('applies a coupon to checkout', async () => {
    const res = await fetch(
      'http://localhost:8788/api/v1/checkout/coupons/apply',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'SAVE20',
          checkoutSessionId,
        }),
      },
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { coupon: { code: string; discountAmount: number } };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(body.data.coupon.code).toBe('SAVE20');
  });

  it('removes applied coupon', async () => {
    const res = await fetch(
      'http://localhost:8788/api/v1/checkout/coupons/remove',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkoutSessionId,
        }),
      },
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { message: string };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
  });

  it('returns error for invalid coupon code', async () => {
    const res = await fetch(
      'http://localhost:8788/api/v1/checkout/coupons/apply',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 'INVALID',
          checkoutSessionId,
        }),
      },
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      success: boolean;
      error: { code: string };
    };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe.skipIf(!dbUp || !apiUp)('tax endpoints', () => {
  it('calculates tax for order', async () => {
    const res = await fetch(
      'http://localhost:8788/api/v1/checkout/tax/calculate?subtotal=1000&region=IN',
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { taxAmount: number; taxRate: number; taxBreakdown: any[] };
      error: { code: string } | null;
    };
    expect(body.success).toBe(true);
    expect(typeof body.data.taxAmount).toBe('number');
    expect(typeof body.data.taxRate).toBe('number');
  });

  it('returns error for invalid subtotal', async () => {
    const res = await fetch(
      'http://localhost:8788/api/v1/checkout/tax/calculate?subtotal=-100&region=IN',
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      success: boolean;
      error: { code: string };
    };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
