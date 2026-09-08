import { describe, expect, it, beforeEach, vi } from 'vitest';

import type { Env } from '../env.ts';
import { validateFile } from '../storage/index.ts';

import { uploadProductMedia } from './service.ts';

vi.mock('../prisma.ts', () => ({
  getPrisma: vi.fn(),
}));
vi.mock('../storage/index.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../storage/index.ts')>();
  return {
    ...actual,
    uploadToStorage: vi.fn(),
    deleteFromStorage: vi.fn(),
  };
});

import { getPrisma } from '../prisma.ts';
import { deleteFromStorage, uploadToStorage } from '../storage/index.ts';

const env = { ENVIRONMENT: 'production' } as unknown as Env;

function testFile(): File {
  return new File([new Uint8Array([1, 2, 3])], 'a.jpg', {
    type: 'image/jpeg',
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('validateFile empty-file regression', () => {
  it('rejects zero-byte files', () => {
    const empty = new File([], 'a.jpg', { type: 'image/jpeg' });
    const result = validateFile(empty);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/empty/i);
  });
});

describe('uploadProductMedia storage/db consistency', () => {
  function mockPrisma(createImpl: () => Promise<unknown>) {
    vi.mocked(getPrisma).mockReturnValue({
      product: {
        findUnique: vi.fn().mockResolvedValue({ shopId: 'shop-1' }),
      },
      productMedia: { create: vi.fn().mockImplementation(createImpl) },
    } as any);
  }

  it('compensates: deletes uploaded object when db create fails', async () => {
    mockPrisma(() => Promise.reject(new Error('db down')));
    vi.mocked(uploadToStorage).mockResolvedValue({
      key: 'shops/shop-1/products/p1/uuid.jpg',
      url: 'https://cdn.local/shops/shop-1/products/p1/uuid.jpg',
      size: 3,
      contentType: 'image/jpeg',
    });
    await expect(
      uploadProductMedia({
        productId: 'p1',
        file: testFile(),
        shopId: 'shop-1',
        env,
      }),
    ).rejects.toThrow('db down');
    expect(deleteFromStorage).toHaveBeenCalledTimes(1);
    const uploadedKey = vi.mocked(uploadToStorage).mock.calls[0]?.[1];
    expect(uploadedKey?.startsWith('shops/shop-1/products/p1/')).toBe(true);
    expect(vi.mocked(deleteFromStorage).mock.calls[0]?.[1]).toBe(uploadedKey);
  });

  it('no cleanup delete on the happy path', async () => {
    mockPrisma(() =>
      Promise.resolve({
        id: 'm1',
        url: 'https://cdn.local/k',
        type: 'image/jpeg',
        altText: null,
        sortOrder: 0,
      }),
    );
    vi.mocked(uploadToStorage).mockResolvedValue({
      key: 'shops/shop-1/products/p1/uuid.jpg',
      url: 'https://cdn.local/k',
      size: 3,
      contentType: 'image/jpeg',
    });
    const result = await uploadProductMedia({
      productId: 'p1',
      file: testFile(),
      shopId: 'shop-1',
      env,
    });
    expect(result.id).toBe('m1');
    expect(deleteFromStorage).not.toHaveBeenCalled();
  });

  it('still throws original db error when cleanup also fails', async () => {
    mockPrisma(() => Promise.reject(new Error('db down')));
    vi.mocked(uploadToStorage).mockResolvedValue({
      key: 'k',
      url: 'u',
      size: 3,
      contentType: 'image/jpeg',
    });
    vi.mocked(deleteFromStorage).mockRejectedValue(new Error('s3 down'));
    await expect(
      uploadProductMedia({
        productId: 'p1',
        file: testFile(),
        shopId: 'shop-1',
        env,
      }),
    ).rejects.toThrow('db down');
  });
});
