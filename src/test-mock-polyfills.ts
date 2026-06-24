// Test environment polyfills
if (typeof window !== "undefined") {
  // Mock fetch for tests
  global.fetch = require("node-fetch");
  
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
      },
      writable: true,
      configurable: true,
    });
  }
}
