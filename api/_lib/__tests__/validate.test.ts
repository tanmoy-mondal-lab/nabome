import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  validateBody,
  emailSchema,
  passwordSchema,
  nameSchema,
  addressSchema,
  authRegisterSchema,
  authLoginSchema,
  reviewSchema,
  contactSchema,
  checkoutSchema,
} from '../validate';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeInvalidJsonRequest(): Request {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not-json{{{',
  });
}

describe('validateBody', () => {
  it('should return data on valid body', async () => {
    const schema = z.object({ name: z.string() });
    const req = makeRequest({ name: 'test' });
    const result = await validateBody(req, schema);
    expect('data' in result).toBe(true);
    if ('data' in result) {
      expect(result.data.name).toBe('test');
    }
  });

  it('should return response on invalid body', async () => {
    const schema = z.object({ name: z.string() });
    const req = makeRequest({ name: 123 });
    const result = await validateBody(req, schema);
    expect('response' in result).toBe(true);
    if ('response' in result) {
      expect(result.response.status).toBe(400);
    }
  });

  it('should return response on invalid JSON', async () => {
    const schema = z.object({ name: z.string() });
    const req = makeInvalidJsonRequest();
    const result = await validateBody(req, schema);
    expect('response' in result).toBe(true);
    if ('response' in result) {
      expect(result.response.status).toBe(400);
    }
  });

  it('should include validation error details', async () => {
    const schema = z.object({ email: z.string().email() });
    const req = makeRequest({ email: 'bad' });
    const result = await validateBody(req, schema);
    expect('response' in result).toBe(true);
  });

  it('should handle empty body', async () => {
    const schema = z.object({ name: z.string() });
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await validateBody(req, schema);
    expect('response' in result).toBe(true);
  });
});

describe('emailSchema', () => {
  it('should accept valid email', () => {
    expect(emailSchema.safeParse('test@example.com').success).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(emailSchema.safeParse('bad').success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('should accept valid password', () => {
    expect(passwordSchema.safeParse('password123').success).toBe(true);
  });

  it('should reject short password', () => {
    expect(passwordSchema.safeParse('1234567').success).toBe(false);
  });

  it('should reject long password', () => {
    expect(passwordSchema.safeParse('x'.repeat(129)).success).toBe(false);
  });
});

describe('nameSchema', () => {
  it('should accept valid name', () => {
    expect(nameSchema.safeParse('John').success).toBe(true);
  });

  it('should reject empty name', () => {
    expect(nameSchema.safeParse('').success).toBe(false);
  });

  it('should reject long name', () => {
    expect(nameSchema.safeParse('x'.repeat(101)).success).toBe(false);
  });
});

describe('addressSchema', () => {
  const validAddress = {
    line1: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    phone: '9876543210',
  };

  it('should accept valid address', () => {
    expect(addressSchema.safeParse(validAddress).success).toBe(true);
  });

  it('should accept address with optional fields', () => {
    expect(addressSchema.safeParse({
      ...validAddress,
      line2: 'Apt 4B',
      district: 'Mumbai City',
      country: 'India',
    }).success).toBe(true);
  });

  it('should reject missing line1', () => {
    const { line1, ...rest } = validAddress;
    expect(addressSchema.safeParse(rest).success).toBe(false);
  });

  it('should reject missing city', () => {
    const { city, ...rest } = validAddress;
    expect(addressSchema.safeParse(rest).success).toBe(false);
  });
});

describe('authRegisterSchema', () => {
  it('should accept valid registration', () => {
    const result = authRegisterSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = authRegisterSchema.safeParse({
      email: 'bad',
      password: 'password123',
      firstName: 'John',
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional fields', () => {
    const result = authRegisterSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '9876543210',
    });
    expect(result.success).toBe(true);
  });
});

describe('authLoginSchema', () => {
  it('should accept valid login', () => {
    const result = authLoginSchema.safeParse({
      email: 'test@example.com',
      password: 'any',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing password', () => {
    const result = authLoginSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(false);
  });
});

describe('reviewSchema', () => {
  it('should accept valid review', () => {
    const result = reviewSchema.safeParse({
      productId: 'product-1',
      rating: 4,
      body: 'Great product, love it!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject rating < 1', () => {
    const result = reviewSchema.safeParse({
      productId: 'product-1',
      rating: 0,
      body: 'Test review body',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short body', () => {
    const result = reviewSchema.safeParse({
      productId: 'product-1',
      rating: 4,
      body: 'Short',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing productId', () => {
    const result = reviewSchema.safeParse({
      rating: 4,
      body: 'Test review body',
    });
    expect(result.success).toBe(false);
  });
});

describe('contactSchema', () => {
  it('should accept valid contact', () => {
    const result = contactSchema.safeParse({
      name: 'John',
      email: 'test@example.com',
      subject: 'Help',
      message: 'I need help with my order',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing subject', () => {
    const result = contactSchema.safeParse({
      name: 'John',
      email: 'test@example.com',
      message: 'I need help with my order',
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional fields', () => {
    const result = contactSchema.safeParse({
      name: 'John',
      email: 'test@example.com',
      phone: '9876543210',
      subject: 'Help',
      message: 'I need help with my order',
      orderId: 'order-123',
    });
    expect(result.success).toBe(true);
  });
});

describe('checkoutSchema', () => {
  it('should accept valid checkout', () => {
    const result = checkoutSchema.safeParse({
      shippingAddress: {
        line1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '9876543210',
      },
      paymentMethod: 'razorpay',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid payment method', () => {
    const result = checkoutSchema.safeParse({
      shippingAddress: {
        line1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '9876543210',
      },
      paymentMethod: 'bitcoin',
    });
    expect(result.success).toBe(false);
  });

  it('should accept cod payment', () => {
    const result = checkoutSchema.safeParse({
      shippingAddress: {
        line1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '9876543210',
      },
      paymentMethod: 'cod',
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional fields', () => {
    const result = checkoutSchema.safeParse({
      shippingAddress: {
        line1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '9876543210',
      },
      billingAddress: {
        line1: '456 Office Rd',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        phone: '9876543210',
      },
      couponCode: 'SAVE10',
      paymentMethod: 'razorpay',
      notes: 'Please deliver in the morning',
    });
    expect(result.success).toBe(true);
  });
});
