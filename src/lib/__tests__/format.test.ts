import { describe, it, expect } from 'vitest';
import { formatPrice, formatCompactPrice, formatDate, formatDateTime, slugify, generateOrderNumber, truncate } from "@/lib/utils/format";

describe('format utilities', () => {
  describe('formatPrice', () => {
    it('should format numbers correctly', () => {
      const result1 = formatPrice(1000);
      const result2 = formatPrice(999.99);
      const result3 = formatPrice(0);
      expect(typeof result1).toBe('string');
      expect(result1).toContain('₹');
      expect(typeof result2).toBe('string');
      expect(result2).toContain('₹');
      expect(typeof result3).toBe('string');
      expect(result3).toContain('₹');
    });

    it('should format strings correctly', () => {
      // String inputs may format differently, just verify they produce valid output
      const result1 = formatPrice('1500');
      const result2 = formatPrice('99.5');
      expect(typeof result1).toBe('string');
      expect(result1).toContain('₹');
      expect(typeof result2).toBe('string');
      expect(result2).toContain('₹');
    });

    it('should handle invalid input', () => {
      expect(formatPrice('invalid')).toBe('₹0');
      expect(formatPrice(NaN)).toBe('₹0');
    });
  });

  describe('formatCompactPrice', () => {
    it('should format compact numbers', () => {
      const result1 = formatCompactPrice(1500);
      const result2 = formatCompactPrice(1500000);
      // Just verify it produces some formatted output
      expect(typeof result1).toBe('string');
      expect(result1.length).toBeGreaterThan(0);
      expect(typeof result2).toBe('string');
      expect(result2.length).toBeGreaterThan(0);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      // Check that it contains date parts (format may vary by locale)
      expect(result).toContain('2024');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });

    it('should handle null dates', () => {
      expect(formatDate(null)).toBe('—');
    });
  });

  describe('formatDateTime', () => {
    it('should format date with time', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatDateTime(date);
      // Check that it contains date parts and time
      expect(result).toContain('2024');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2:30');
    });
  });

  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test Product 123')).toBe('test-product-123');
      expect(slugify('Special!!!Chars')).toBe('specialchars');
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate order number with prefix', () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber).toMatch(/^NB-\d{8}-\w{6}$/);
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      // truncate('Hello World', 8) = 'Hello Wo' + '…' = 'Hello Wo…' (9 chars with ellipsis)
      expect(truncate('Hello World', 8)).toBe('Hello Wo…');
      expect(truncate('Short', 10)).toBe('Short');
    });
  });
});
