/** Small pure helpers shared across apps (no framework imports). */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function invariant(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(`Invariant violation: ${message}`);
  }
}

export function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function noop(): void {
  /* intentionally empty */
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function groupBy<T, K extends string>(
  items: readonly T[],
  keyOf: (item: T) => K,
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyOf(item);
    (result[key] ??= []).push(item);
  }
  return result;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
