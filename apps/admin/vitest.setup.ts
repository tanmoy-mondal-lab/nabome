import '@testing-library/jest-dom/vitest';

/**
 * In-memory Storage polyfill for environments where the jsdom window lacks
 * localStorage (vitest 4 jsdom env quirk on some Node versions). Used by
 * zustand `persist` stores.
 */
class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

if (
  typeof window !== 'undefined' &&
  typeof window.localStorage === 'undefined'
) {
  Object.defineProperty(window, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
  });
}
