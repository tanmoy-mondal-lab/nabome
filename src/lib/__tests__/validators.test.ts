import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,
  addressSchema,
  productSchema,
  productVariantSchema,
  categorySchema,
  subcategorySchema,
  collectionSchema,
  couponSchema,
  staticPageSchema,
  homepageSectionSchema,
  navigationMenuSchema,
  checkoutSchema,
  reviewSchema,
  contactSchema,
  newsletterSchema,
  lookbookSchema,
  lookbookItemSchema,
  siteSettingsSchema,
} from "@/lib/validators";

describe('loginSchema', () => {
  it('should accept valid login', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('should reject short password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '1234567' });
    expect(result.success).toBe(false);
  });

  it('should reject missing email', () => {
    const result = loginSchema.safeParse({ password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('should reject missing password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('should accept valid registration', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Password1',
      firstName: 'John',
    });
    expect(result.success).toBe(true);
  });

  it('should accept registration with optional fields', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Password1',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+919876543210',
    });
    expect(result.success).toBe(true);
  });

  it('should reject password without uppercase', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password1',
      firstName: 'John',
    });
    expect(result.success).toBe(false);
  });

  it('should reject password without lowercase', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'PASSWORD1',
      firstName: 'John',
    });
    expect(result.success).toBe(false);
  });

  it('should reject password without number', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Password',
      firstName: 'John',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short password', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Pass1',
      firstName: 'John',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing firstName', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Password1',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid phone format', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'Password1',
      firstName: 'John',
      phone: 'abc',
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid phone formats', () => {
    const phones = ['+919876543210', '9876543210', '+91 9876543210', '987-654-3210'];
    for (const phone of phones) {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1',
        firstName: 'John',
        phone,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('forgotPasswordSchema', () => {
  it('should accept valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'bad' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('should accept valid password', () => {
    const result = resetPasswordSchema.safeParse({ password: 'NewPass1' });
    expect(result.success).toBe(true);
  });

  it('should reject weak password', () => {
    const result = resetPasswordSchema.safeParse({ password: 'weak' });
    expect(result.success).toBe(false);
  });
});

describe('profileUpdateSchema', () => {
  it('should accept valid profile', () => {
    const result = profileUpdateSchema.safeParse({ firstName: 'John' });
    expect(result.success).toBe(true);
  });

  it('should accept all optional fields', () => {
    const result = profileUpdateSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      phone: '+919876543210',
      avatarUrl: 'https://example.com/avatar.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty firstName', () => {
    const result = profileUpdateSchema.safeParse({ firstName: '' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid avatarUrl', () => {
    const result = profileUpdateSchema.safeParse({
      firstName: 'John',
      avatarUrl: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('addressSchema', () => {
  const validAddress = {
    fullName: 'John Doe',
    phone: '+919876543210',
    line1: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  };

  it('should accept valid address', () => {
    const result = addressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it('should reject invalid pincode (too short)', () => {
    const result = addressSchema.safeParse({ ...validAddress, pincode: '12345' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid pincode (too long)', () => {
    const result = addressSchema.safeParse({ ...validAddress, pincode: '1234567' });
    expect(result.success).toBe(false);
  });

  it('should reject pincode with letters', () => {
    const result = addressSchema.safeParse({ ...validAddress, pincode: 'abc123' });
    expect(result.success).toBe(false);
  });

  it('should reject missing fullName', () => {
    const result = addressSchema.safeParse({ ...validAddress, fullName: '' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid phone', () => {
    const result = addressSchema.safeParse({ ...validAddress, phone: '123' });
    expect(result.success).toBe(false);
  });

  it('should accept optional fields', () => {
    const result = addressSchema.safeParse({
      ...validAddress,
      label: 'Office',
      line2: 'Apt 4B',
      district: 'Mumbai City',
      isDefault: true,
    });
    expect(result.success).toBe(true);
  });
});

describe('productSchema', () => {
  it('should accept valid product', () => {
    const result = productSchema.safeParse({
      name: 'Test Product',
      basePrice: 999,
      gender: 'men',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = productSchema.safeParse({
      name: '',
      basePrice: 999,
      gender: 'men',
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative price', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      basePrice: -100,
      gender: 'men',
    });
    expect(result.success).toBe(false);
  });

  it('should reject zero price', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      basePrice: 0,
      gender: 'men',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid gender', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      basePrice: 999,
      gender: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('should accept all genders', () => {
    for (const gender of ['men', 'women', 'unisex']) {
      const result = productSchema.safeParse({
        name: 'Test',
        basePrice: 999,
        gender,
      });
      expect(result.success).toBe(true);
    }
  });

  it('should accept optional fields', () => {
    const result = productSchema.safeParse({
      name: 'Test',
      basePrice: 999,
      gender: 'women',
      description: 'A test product',
      compareAtPrice: 1499,
      costPrice: 500,
      material: 'Cotton',
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      isFeatured: true,
      isNew: true,
    });
    expect(result.success).toBe(true);
  });
});

describe('productVariantSchema', () => {
  it('should accept valid variant', () => {
    const result = productVariantSchema.safeParse({
      sku: 'SKU-001',
      size: 'M',
      color: 'Blue',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty SKU', () => {
    const result = productVariantSchema.safeParse({
      sku: '',
      size: 'M',
      color: 'Blue',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid hex color', () => {
    const result = productVariantSchema.safeParse({
      sku: 'SKU-001',
      size: 'M',
      color: 'Blue',
      colorHex: 'not-hex',
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid hex color', () => {
    const result = productVariantSchema.safeParse({
      sku: 'SKU-001',
      size: 'M',
      color: 'Blue',
      colorHex: '#3B82F6',
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative stock', () => {
    const result = productVariantSchema.safeParse({
      sku: 'SKU-001',
      size: 'M',
      color: 'Blue',
      stock: -5,
    });
    expect(result.success).toBe(false);
  });

  it('should accept zero stock', () => {
    const result = productVariantSchema.safeParse({
      sku: 'SKU-001',
      size: 'M',
      color: 'Blue',
      stock: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe('categorySchema', () => {
  it('should accept valid category', () => {
    const result = categorySchema.safeParse({ name: 'Electronics' });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = categorySchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('should accept optional fields', () => {
    const result = categorySchema.safeParse({
      name: 'Electronics',
      description: 'All electronics',
      sortOrder: 1,
      isActive: false,
    });
    expect(result.success).toBe(true);
  });
});

describe('subcategorySchema', () => {
  it('should accept valid subcategory', () => {
    const result = subcategorySchema.safeParse({
      name: 'Phones',
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing categoryId', () => {
    const result = subcategorySchema.safeParse({ name: 'Phones' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid categoryId UUID', () => {
    const result = subcategorySchema.safeParse({
      name: 'Phones',
      categoryId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});

describe('collectionSchema', () => {
  it('should accept valid collection', () => {
    const result = collectionSchema.safeParse({ name: 'Summer 2024' });
    expect(result.success).toBe(true);
  });

  it('should accept date range', () => {
    const result = collectionSchema.safeParse({
      name: 'Summer 2024',
      startDate: '2024-06-01T00:00:00.000Z',
      endDate: '2024-08-31T23:59:59.999Z',
    });
    expect(result.success).toBe(true);
  });
});

describe('couponSchema', () => {
  it('should accept valid percentage coupon', () => {
    const result = couponSchema.safeParse({
      code: 'SAVE10',
      discountType: 'percentage',
      discountValue: 10,
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid fixed coupon', () => {
    const result = couponSchema.safeParse({
      code: 'FLAT100',
      discountType: 'fixed',
      discountValue: 100,
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative discount', () => {
    const result = couponSchema.safeParse({
      code: 'BAD',
      discountType: 'percentage',
      discountValue: -10,
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid discount type', () => {
    const result = couponSchema.safeParse({
      code: 'BAD',
      discountType: 'invalid',
      discountValue: 10,
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
    });
    expect(result.success).toBe(false);
  });

  it('should uppercase code automatically', () => {
    const result = couponSchema.safeParse({
      code: 'lowercase',
      discountType: 'percentage',
      discountValue: 10,
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe('LOWERCASE');
    }
  });
});

describe('staticPageSchema', () => {
  it('should accept valid page', () => {
    const result = staticPageSchema.safeParse({ title: 'About Us' });
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const result = staticPageSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });
});

describe('homepageSectionSchema', () => {
  it('should accept valid section', () => {
    const result = homepageSectionSchema.safeParse({
      sectionType: 'hero_slider',
    });
    expect(result.success).toBe(true);
  });

  it('should accept all valid section types', () => {
    const types = [
      'hero_slider', 'featured_collections', 'new_arrivals',
      'categories_grid', 'brand_story', 'newsletter',
      'testimonials', 'instagram_feed', 'banner_promo',
      'product_grid', 'custom_html',
    ];
    for (const sectionType of types) {
      const result = homepageSectionSchema.safeParse({ sectionType });
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid section type', () => {
    const result = homepageSectionSchema.safeParse({
      sectionType: 'invalid_type',
    });
    expect(result.success).toBe(false);
  });
});

describe('navigationMenuSchema', () => {
  it('should accept valid menu', () => {
    const result = navigationMenuSchema.safeParse({
      name: 'Main Nav',
      location: 'header',
      items: [],
    });
    expect(result.success).toBe(true);
  });

  it('should accept all locations', () => {
    for (const location of ['header', 'footer', 'mobile', 'sidebar']) {
      const result = navigationMenuSchema.safeParse({
        name: 'Nav',
        location,
        items: [],
      });
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid location', () => {
    const result = navigationMenuSchema.safeParse({
      name: 'Nav',
      location: 'invalid',
      items: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('checkoutSchema', () => {
  it('should accept valid checkout', () => {
    const result = checkoutSchema.safeParse({
      shippingAddressId: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const result = checkoutSchema.safeParse({
      shippingAddressId: 'not-a-uuid',
      email: 'test@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = checkoutSchema.safeParse({
      shippingAddressId: '550e8400-e29b-41d4-a716-446655440000',
      email: 'not-email',
    });
    expect(result.success).toBe(false);
  });
});

describe('reviewSchema', () => {
  it('should accept valid review', () => {
    const result = reviewSchema.safeParse({
      productId: '550e8400-e29b-41d4-a716-446655440000',
      rating: 5,
    });
    expect(result.success).toBe(true);
  });

  it('should reject rating below 1', () => {
    const result = reviewSchema.safeParse({
      productId: '550e8400-e29b-41d4-a716-446655440000',
      rating: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should reject rating above 5', () => {
    const result = reviewSchema.safeParse({
      productId: '550e8400-e29b-41d4-a716-446655440000',
      rating: 6,
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-integer rating', () => {
    const result = reviewSchema.safeParse({
      productId: '550e8400-e29b-41d4-a716-446655440000',
      rating: 3.5,
    });
    expect(result.success).toBe(false);
  });

  it('should accept all valid ratings', () => {
    for (let rating = 1; rating <= 5; rating++) {
      const result = reviewSchema.safeParse({
        productId: '550e8400-e29b-41d4-a716-446655440000',
        rating,
      });
      expect(result.success).toBe(true);
    }
  });

  it('should reject more than 5 images', () => {
    const result = reviewSchema.safeParse({
      productId: '550e8400-e29b-41d4-a716-446655440000',
      rating: 4,
      images: [
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
        'https://example.com/3.jpg',
        'https://example.com/4.jpg',
        'https://example.com/5.jpg',
        'https://example.com/6.jpg',
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe('contactSchema', () => {
  it('should accept valid contact', () => {
    const result = contactSchema.safeParse({
      name: 'John',
      email: 'test@example.com',
      message: 'This is a test message for contact form',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = contactSchema.safeParse({
      name: '',
      email: 'test@example.com',
      message: 'Test message',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty message', () => {
    const result = contactSchema.safeParse({
      name: 'John',
      email: 'test@example.com',
      message: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('newsletterSchema', () => {
  it('should accept valid email', () => {
    const result = newsletterSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = newsletterSchema.safeParse({ email: 'bad' });
    expect(result.success).toBe(false);
  });
});

describe('lookbookSchema', () => {
  it('should accept valid lookbook', () => {
    const result = lookbookSchema.safeParse({
      name: 'Summer Collection',
      coverImageUrl: 'https://example.com/cover.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing coverImageUrl', () => {
    const result = lookbookSchema.safeParse({ name: 'Summer' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid coverImageUrl', () => {
    const result = lookbookSchema.safeParse({
      name: 'Summer',
      coverImageUrl: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('lookbookItemSchema', () => {
  it('should accept valid item', () => {
    const result = lookbookItemSchema.safeParse({
      imageUrl: 'https://example.com/item.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('should accept hotspot coordinates', () => {
    const result = lookbookItemSchema.safeParse({
      imageUrl: 'https://example.com/item.jpg',
      hotspotX: 0.5,
      hotspotY: 0.3,
    });
    expect(result.success).toBe(true);
  });

  it('should reject hotspotX > 1', () => {
    const result = lookbookItemSchema.safeParse({
      imageUrl: 'https://example.com/item.jpg',
      hotspotX: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it('should reject hotspotY < 0', () => {
    const result = lookbookItemSchema.safeParse({
      imageUrl: 'https://example.com/item.jpg',
      hotspotY: -0.1,
    });
    expect(result.success).toBe(false);
  });
});

describe('siteSettingsSchema', () => {
  it('should accept valid settings', () => {
    const result = siteSettingsSchema.safeParse({ siteName: 'My Store' });
    expect(result.success).toBe(true);
  });

  it('should reject empty siteName', () => {
    const result = siteSettingsSchema.safeParse({ siteName: '' });
    expect(result.success).toBe(false);
  });

  it('should accept all optional fields', () => {
    const result = siteSettingsSchema.safeParse({
      siteName: 'My Store',
      tagline: 'Premium Fashion',
      currency: 'INR',
      taxRate: 5,
      freeShippingThreshold: 999,
      contactEmail: 'info@store.com',
    });
    expect(result.success).toBe(true);
  });

  it('should reject taxRate > 100', () => {
    const result = siteSettingsSchema.safeParse({
      siteName: 'Store',
      taxRate: 150,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative taxRate', () => {
    const result = siteSettingsSchema.safeParse({
      siteName: 'Store',
      taxRate: -5,
    });
    expect(result.success).toBe(false);
  });
});
