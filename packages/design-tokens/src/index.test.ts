import { describe, expect, it } from 'vitest';

import {
  breakpoints,
  containers,
  durations,
  easings,
  zIndex,
} from './index.ts';

describe('design tokens (programmatic)', () => {
  it('exposes mobile-first breakpoints', () => {
    expect(breakpoints.tablet).toBe(640);
    expect(breakpoints.desktop).toBeGreaterThan(breakpoints.tablet);
    expect(breakpoints.wide).toBeGreaterThan(breakpoints.desktop);
  });

  it('keeps the luxe-out easing as the default motion curve', () => {
    expect(easings['luxe-out']).toBe('cubic-bezier(0.22, 1, 0.36, 1)');
  });

  it('orders z-index layers without collisions', () => {
    const values = Object.values(zIndex);
    expect(new Set(values).size).toBe(values.length);
  });

  it('keeps durations below 1.5s', () => {
    expect(Object.values(durations).every((d) => d <= 1200)).toBe(true);
  });

  it('exposes container widths', () => {
    expect(containers.default).toBe(1280);
  });
});
