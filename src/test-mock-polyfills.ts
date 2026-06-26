// Test environment polyfills
if (typeof window !== "undefined") {
  // Mock fetch for tests
  global.fetch = require("node-fetch");

  // Mock localStorage for Zustand persist middleware
  if (typeof global.localStorage === "undefined") {
    const store = new Map<string, string>();
    global.localStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value); },
      removeItem: (key: string) => { store.delete(key); },
      clear: () => { store.clear(); },
      get length() { return store.size; },
      key: (index: number) => [...store.keys()][index] ?? null,
    } as Storage;
  }

  // Mock crypto for tests - using Object.defineProperty to avoid read-only issues
  if (typeof global.crypto === 'undefined' || !global.crypto.getRandomValues) {
    Object.defineProperty(global, 'crypto', {
      value: {
        getRandomValues: (array: Uint8Array) => {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
          return array;
        },
        subtle: {
          digest: async () => new ArrayBuffer(0),
          importKey: async () => ({}),
          sign: async () => new ArrayBuffer(0),
          verify: async () => true,
        },
        randomUUID: () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      },
      writable: true,
      configurable: true,
    });
  }
}
