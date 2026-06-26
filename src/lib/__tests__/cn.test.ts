import { describe, it, expect } from 'vitest';
import { cn } from "@/lib/utils/cn";

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'active', false && 'hidden');
    expect(result).toContain('base');
    expect(result).toContain('active');
    expect(result).not.toContain('hidden');
  });

  it('should handle undefined and null', () => {
    const result = cn('base', undefined, null);
    expect(result).toBe('base');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle single class', () => {
    const result = cn('text-lg');
    expect(result).toBe('text-lg');
  });

  it('should merge conflicting Tailwind classes', () => {
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8');
  });

  it('should handle array inputs', () => {
    const result = cn(['text-red-500', 'font-bold'], 'text-blue-500');
    expect(result).toContain('text-blue-500');
    expect(result).toContain('font-bold');
  });

  it('should handle object inputs', () => {
    const result = cn({ 'text-red-500': true, 'text-blue-500': false });
    expect(result).toBe('text-red-500');
  });
});
