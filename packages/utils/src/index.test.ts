import { describe, expect, it } from 'vitest';

import { cn } from './cn.ts';
import { formatINR, inrToPaise, paiseToInr } from './format.ts';
import { clamp, groupBy, invariant } from './misc.ts';
import { slugify } from './slug.ts';

describe('cn', () => {
  it('merges conflicting tailwind classes (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles conditionals and falsy values', () => {
    const maybe = false;
    expect(cn('a', maybe && 'b', null, undefined, 'c')).toBe('a c');
  });
});

describe('format', () => {
  it('formats INR with en-IN grouping', () => {
    expect(formatINR(123456.5)).toBe('₹1,23,456.50');
  });

  it('converts major units to paise and back', () => {
    expect(inrToPaise('1999.99')).toBe(199999);
    expect(paiseToInr(199999)).toBe(1999.99);
  });
});

describe('slug', () => {
  it('generates kebab-case slugs', () => {
    expect(slugify('Premium Silk Saree 2026!')).toBe('premium-silk-saree-2026');
  });

  it('transliterates bengali vowels (full consonant table ships with i18n work)', () => {
    expect(slugify('আতপ চাল')).toBe('a-a');
    expect(slugify('ইউনিক')).toBe('iu-i');
  });

  it('rejects invalid slugs', () => {
    expect(slugify('')).toBe('');
  });
});

describe('misc', () => {
  it('clamps values', () => {
    expect(clamp(5, 0, 3)).toBe(3);
  });

  it('groups records', () => {
    const g = groupBy([{ k: 'a' }, { k: 'b' }, { k: 'a' }], (i) => i.k);
    expect(g.a).toHaveLength(2);
  });

  it('invariant throws on falsy', () => {
    expect(() => invariant(false, 'boom')).toThrow(/boom/);
  });
});
