import { describe, it, expect } from 'vitest';
import { formatPrice, formatCompactPrice, formatDate, formatDateTime, slugify, generateOrderNumber, truncate } from "@/lib/utils/format";

describe('format utilities', () => {
  describe('formatPrice', () => {
    it('should format whole numbers', () => {
      expect(formatPrice(1000)).toContain('₹');
      expect(formatPrice(0)).toContain('₹');
    });

    it('should format decimal numbers', () => {
      expect(formatPrice(999.99)).toContain('₹');
    });

    it('should format string inputs', () => {
      expect(formatPrice('1500')).toContain('₹');
      expect(formatPrice('99.5')).toContain('₹');
    });

    it('should handle invalid input', () => {
      expect(formatPrice('invalid')).toBe('₹0');
      expect(formatPrice(NaN)).toBe('₹0');
    });

    it('should handle negative numbers', () => {
      const result = formatPrice(-500);
      expect(result).toContain('₹');
    });

    it('should handle very large numbers', () => {
      const result = formatPrice(10000000);
      expect(result).toContain('₹');
      expect(result).toContain('1');
    });

    it('should handle zero', () => {
      expect(formatPrice(0)).toBe('₹0');
    });

    it('should handle object with toString', () => {
      const obj = { toString: () => '1234' };
      expect(formatPrice(obj as any)).toContain('₹');
    });
  });

  describe('formatCompactPrice', () => {
    it('should format compact numbers', () => {
      expect(typeof formatCompactPrice(1500)).toBe('string');
      expect(typeof formatCompactPrice(1500000)).toBe('string');
    });

    it('should handle string input', () => {
      expect(typeof formatCompactPrice('2500')).toBe('string');
    });

    it('should handle invalid input', () => {
      expect(formatCompactPrice('invalid')).toBe('₹0');
    });

    it('should handle zero', () => {
      expect(formatCompactPrice(0)).toContain('₹');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toContain('2024');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });

    it('should handle string dates', () => {
      const result = formatDate('2024-03-20');
      expect(result).toContain('2024');
      expect(result).toContain('Mar');
    });

    it('should handle null dates', () => {
      expect(formatDate(null)).toBe('—');
    });

    it('should handle undefined dates', () => {
      expect(formatDate(undefined as any)).toBe('—');
    });
  });

  describe('formatDateTime', () => {
    it('should format date with time', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatDateTime(date);
      expect(result).toContain('2024');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });

    it('should handle null dates', () => {
      expect(formatDateTime(null)).toBe('—');
    });

    it('should handle string dates', () => {
      const result = formatDateTime('2024-06-15T10:00:00');
      expect(result).toContain('2024');
      expect(result).toContain('Jun');
    });
  });

  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test Product 123')).toBe('test-product-123');
    });

    it('should remove special characters', () => {
      expect(slugify('Special!!!Chars')).toBe('specialchars');
      expect(slugify('price: $100')).toBe('price-100');
    });

    it('should handle consecutive spaces', () => {
      expect(slugify('Hello   World')).toBe('hello-world');
    });

    it('should handle leading/trailing hyphens', () => {
      expect(slugify('-Hello-')).toBe('hello');
      expect(slugify('--Hello--')).toBe('hello');
    });

    it('should handle underscores', () => {
      expect(slugify('hello_world')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
    });

    it('should handle already lowercase', () => {
      expect(slugify('already-lower')).toBe('already-lower');
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate order number with correct format', () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber).toMatch(/^NB-\d{8}-\w{6}$/);
    });

    it('should generate unique order numbers', () => {
      const numbers = new Set<string>();
      for (let i = 0; i < 100; i++) {
        numbers.add(generateOrderNumber());
      }
      expect(numbers.size).toBe(100);
    });

    it('should start with NB prefix', () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber.startsWith('NB-')).toBe(true);
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello Wo…');
    });

    it('should not truncate short strings', () => {
      expect(truncate('Short', 10)).toBe('Short');
    });

    it('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('');
    });

    it('should handle length 0', () => {
      expect(truncate('Hello', 0)).toBe('…');
    });
  });
});
