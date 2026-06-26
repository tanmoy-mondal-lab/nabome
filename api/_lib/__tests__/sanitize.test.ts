import { describe, it, expect } from 'vitest';
import { toNull, sanitizeUuids } from '../sanitize';

describe('toNull', () => {
  it('should convert empty string to null', () => {
    expect(toNull('')).toBeNull();
  });

  it('should convert undefined to null', () => {
    expect(toNull(undefined)).toBeNull();
  });

  it('should convert null to null', () => {
    expect(toNull(null)).toBeNull();
  });

  it('should preserve non-empty strings', () => {
    expect(toNull('hello')).toBe('hello');
  });

  it('should preserve UUID strings', () => {
    expect(toNull('550e8400-e29b-41d4-a716-446655440000')).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('should preserve numbers as strings', () => {
    expect(toNull('123')).toBe('123');
  });
});

describe('sanitizeUuids', () => {
  it('should convert empty string keys to null', () => {
    const obj = { name: 'test', categoryId: '', subcategoryId: '' };
    const result = sanitizeUuids(obj, ['categoryId', 'subcategoryId']);
    expect(result.categoryId).toBeNull();
    expect(result.subcategoryId).toBeNull();
  });

  it('should preserve non-empty keys', () => {
    const obj = { name: 'test', categoryId: '550e8400-e29b-41d4-a716-446655440000' };
    const result = sanitizeUuids(obj, ['categoryId']);
    expect(result.categoryId).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('should not modify keys not in the list', () => {
    const obj = { name: '', categoryId: '' };
    const result = sanitizeUuids(obj, ['categoryId']);
    expect(result.name).toBe('');
    expect(result.categoryId).toBeNull();
  });

  it('should handle missing keys gracefully', () => {
    const obj = { name: 'test' };
    const result = sanitizeUuids(obj, ['categoryId']);
    expect(result).toEqual({ name: 'test' });
  });

  it('should handle empty keys array', () => {
    const obj = { name: 'test', id: '' };
    const result = sanitizeUuids(obj, []);
    expect(result).toEqual({ name: 'test', id: '' });
  });

  it('should handle multiple keys', () => {
    const obj = {
      name: 'test',
      categoryId: '',
      subcategoryId: '',
      collectionId: '',
      brandId: 'brand-1',
    };
    const result = sanitizeUuids(obj, ['categoryId', 'subcategoryId', 'collectionId']);
    expect(result.categoryId).toBeNull();
    expect(result.subcategoryId).toBeNull();
    expect(result.collectionId).toBeNull();
    expect(result.brandId).toBe('brand-1');
  });

  it('should not mutate original object', () => {
    const obj = { name: 'test', categoryId: '' };
    const result = sanitizeUuids(obj, ['categoryId']);
    expect(obj.categoryId).toBe('');
    expect(result.categoryId).toBeNull();
  });
});
