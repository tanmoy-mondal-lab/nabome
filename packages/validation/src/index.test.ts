import { describe, expect, it } from 'vitest';

import {
  addToCartSchema,
  createOrderSchema,
  loginSchema,
  passwordSchema,
  registerSchema,
} from './index.ts';

describe('validation schemas', () => {
  it('rejects weak passwords', () => {
    expect(passwordSchema.safeParse('short').success).toBe(false);
    expect(passwordSchema.safeParse('longenough1').success).toBe(true);
  });

  it('rejects login without turnstile token', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'x' });
    expect(result.success).toBe(false);
  });

  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({
      email: 'A@B.COM',
      password: 'correct-horse',
      turnstileToken: 'tok',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('a@b.com');
    }
  });

  it('requires a shipping address for checkout', () => {
    expect(createOrderSchema.safeParse({}).success).toBe(false);
    const ok = createOrderSchema.safeParse({
      shippingAddress: {
        label: 'Home',
        recipientName: 'Nabome',
        phone: '+919876543210',
        addressLine1: '1 Park Street',
        city: 'Kolkata',
        state: 'West Bengal',
        postalCode: '700016',
      },
    });
    expect(ok.success).toBe(true);
  });

  it('bounds cart quantities', () => {
    expect(
      addToCartSchema.safeParse({ variantId: '0'.repeat(36), quantity: 0 })
        .success,
    ).toBe(false);
    expect(
      addToCartSchema.safeParse({ variantId: '0'.repeat(36), quantity: 100 })
        .success,
    ).toBe(false);
  });
});
