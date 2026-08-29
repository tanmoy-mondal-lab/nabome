import { describe, expect, it, beforeEach } from 'vitest';

import type { Env } from '../env.ts';

import {
  _resetMockForTests,
  deleteFromStorage,
  extractProductIdFromKey,
  extractShopIdFromKey,
  generateStorageKey,
  generateVariantStorageKey,
  getStorageProvider,
  uploadToStorage,
  validateFile,
  validateShopOwnership,
} from './index.ts';

function makeFile(name: string, type: string, size: number): File {
  const buf = new Uint8Array(size);
  return new File([buf], name, { type });
}

const mockEnv = { ENVIRONMENT: 'local' } as unknown as Env;
const s3Env = {
  ENVIRONMENT: 'production',
  STORAGE_ENDPOINT: 'https://s3.us-east-005.backblazeb2.com',
  STORAGE_REGION: 'us-east-005',
  STORAGE_BUCKET: 'nabome-media',
  STORAGE_ACCESS_KEY_ID: 'testkey',
  STORAGE_SECRET_ACCESS_KEY: 'testsecret',
  STORAGE_PUBLIC_URL: 'https://f000.backblazeb2.com/file/nabome-media',
} as unknown as Env;

describe('validateFile', () => {
  it('accepts valid file', () =>
    expect(validateFile(makeFile('a.jpg', 'image/jpeg', 1024)).valid).toBe(
      true,
    ));
  it('rejects oversized', () =>
    expect(
      validateFile(makeFile('a.jpg', 'image/jpeg', 20 * 1024 * 1024)).valid,
    ).toBe(false));
  it('rejects invalid MIME', () =>
    expect(
      validateFile(makeFile('a.jpg', 'application/x-exe', 1024)).valid,
    ).toBe(false));
  it('rejects invalid extension', () =>
    expect(validateFile(makeFile('a.exe', 'image/jpeg', 1024)).valid).toBe(
      false,
    ));
  it('rejects missing extension', () =>
    expect(validateFile(makeFile('noext', 'image/jpeg', 1024)).valid).toBe(
      false,
    ));
});

describe('generateStorageKey', () => {
  it('generates tenant-scoped key', () => {
    const k = generateStorageKey(
      'shop1',
      'prod1',
      makeFile('x.png', 'image/png', 10),
    );
    expect(k.startsWith('shops/shop1/products/prod1/')).toBe(true);
    expect(k.endsWith('.png')).toBe(true);
  });
  it('sanitizes extension and ignores path', () => {
    const k = generateStorageKey(
      'shop1',
      'prod1',
      makeFile('../../etc/passwd.jpg', 'image/jpeg', 10),
    );
    expect(k.includes('..')).toBe(false);
    expect(k.endsWith('.jpg')).toBe(true);
  });
});

describe('validateShopOwnership', () => {
  it('allows own shop', () =>
    expect(validateShopOwnership('shops/s1/products/p1/a.jpg', 's1')).toBe(
      true,
    ));
  it('rejects other shop', () =>
    expect(validateShopOwnership('shops/s1/products/p1/a.jpg', 's2')).toBe(
      false,
    ));
  it('rejects traversal', () =>
    expect(validateShopOwnership('shops/s1/../shops/s2/a.jpg', 's2')).toBe(
      false,
    ));
});

describe('extractors', () => {
  it('extracts shop', () =>
    expect(extractShopIdFromKey('shops/abc/products/def/ghi.jpg')).toBe('abc'));
  it('extracts product', () =>
    expect(extractProductIdFromKey('shops/abc/products/def/ghi.jpg')).toBe(
      'def',
    ));
  it('returns null for bad key', () =>
    expect(extractShopIdFromKey('bad/key')).toBe(null));
});

describe('storage provider', () => {
  beforeEach(() => _resetMockForTests());
  it('uses mock in local when no config', async () => {
    const provider = getStorageProvider(mockEnv);
    expect(provider.getPublicUrl('shops/s1/products/p1/a.jpg')).toContain(
      'mock-storage',
    );
  });
  it('upload and exists via mock', async () => {
    const key = generateStorageKey(
      'shop1',
      'prod1',
      makeFile('a.jpg', 'image/jpeg', 10),
    );
    await uploadToStorage(
      mockEnv,
      key,
      makeFile('a.jpg', 'image/jpeg', 10),
      'image/jpeg',
    );
    const provider = getStorageProvider(mockEnv);
    expect(await provider.exists(key)).toBe(true);
    expect(validateShopOwnership(key, 'shop1')).toBe(true);
    expect(validateShopOwnership(key, 'shop2')).toBe(false);
  });
  it('delete removes', async () => {
    const key = generateStorageKey(
      'shop1',
      'prod1',
      makeFile('a.jpg', 'image/jpeg', 10),
    );
    await uploadToStorage(
      mockEnv,
      key,
      makeFile('a.jpg', 'image/jpeg', 10),
      'image/jpeg',
    );
    await deleteFromStorage(mockEnv, key);
    const provider = getStorageProvider(mockEnv);
    expect(await provider.exists(key)).toBe(false);
  });
  it('fails clearly when production config missing', async () => {
    const badEnv = { ENVIRONMENT: 'production' } as unknown as Env;
    const key = 'shops/s1/products/p1/a.jpg';
    await expect(
      uploadToStorage(
        badEnv,
        key,
        makeFile('a.jpg', 'image/jpeg', 10),
        'image/jpeg',
      ),
    ).rejects.toThrow();
  });
  it('s3 provider getPublicUrl uses STORAGE_PUBLIC_URL', async () => {
    const { getStoragePublicUrl, getStorageConfig } = await import('./s3.ts');
    const cfg = getStorageConfig(s3Env);
    expect(getStoragePublicUrl(cfg, 'shops/s1/products/p1/a.jpg')).toBe(
      'https://f000.backblazeb2.com/file/nabome-media/shops/s1/products/p1/a.jpg',
    );
  });
});
