/**
 * Programmatic access to design tokens for JavaScript consumers
 * (media-query hooks, animation libraries, charts, inline styles).
 * The canonical styling source of truth is the CSS custom properties in
 * styles/tokens.css — this module only mirrors the values that runtime
 * JavaScript needs. Keep both in sync when adding tokens.
 */

export const breakpoints = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
  wide: 1280,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const durations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
  slowest: 1200,
} as const;

export type Duration = keyof typeof durations;

export const easings = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  'luxe-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'luxe-in': 'cubic-bezier(0.55, 0, 0.75, 0.25)',
  'luxe-in-out': 'cubic-bezier(0.45, 0, 0.55, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  linear: 'linear',
} as const;

export type Easing = keyof typeof easings;

export const zIndex = {
  base: 0,
  dropdown: 50,
  sticky: 100,
  modal: 200,
  toast: 300,
  tooltip: 400,
} as const;

export type ZIndex = keyof typeof zIndex;

export const containers = {
  narrow: 640,
  default: 1280,
  wide: 1440,
  full: '100%',
} as const;

export type Container = keyof typeof containers;

// Re-export theme engine
export * from './theme-engine';
