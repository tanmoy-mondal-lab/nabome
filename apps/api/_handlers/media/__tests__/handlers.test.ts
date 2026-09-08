import { describe, expect, it, beforeEach, vi } from 'vitest';

import type { RequestContext } from '../../../_lib/http/context.ts';
import { ApiError } from '../../../_lib/http/errors.ts';

vi.mock('../../../_lib/auth/auth-middleware.ts', () => ({
  requireAuth: vi.fn(),
}));
vi.mock('../../../_lib/media/service.ts', () => ({
  mediaService: {
    uploadProductMedia: vi.fn(),
    deleteProductMedia: vi.fn(),
    updateProductMedia: vi.fn(),
    getProductMedia: vi.fn(),
  },
}));
vi.mock('../../../_lib/prisma.ts', () => ({
  getPrisma: vi.fn(),
}));
vi.mock('../../../_lib/ratelimit.ts', () => ({
  checkRateLimit: vi.fn(),
}));

import { requireAuth } from '../../../_lib/auth/auth-middleware.ts';
import { mediaService } from '../../../_lib/media/service.ts';
import { getPrisma } from '../../../_lib/prisma.ts';
import { checkRateLimit } from '../../../_lib/ratelimit.ts';
import {
  handleMediaDelete,
  handleMediaGetByProduct,
  handleMediaUpdate,
  handleMediaUpload,
} from '../index.ts';

function ctx(): RequestContext {
  return {
    env: { KV: {}, ENVIRONMENT: 'production' },
    requestId: 'req-storage-forensic',
  } as unknown as RequestContext;
}

function uploadRequest(fields: Record<string, string | File>): Request {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return new Request('http://localhost/api/v1/media/upload', {
    method: 'POST',
    body: form,
  });
}

function testFile(): File {
  return new File([new Uint8Array([1, 2, 3])], 'a.jpg', {
    type: 'image/jpeg',
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAuth).mockResolvedValue({
    userId: 'user-1',
    role: 'shop_owner',
  } as any);
  vi.mocked(checkRateLimit).mockResolvedValue({
    allowed: true,
    resetSeconds: 0,
  } as any);
  vi.mocked(getPrisma).mockReturnValue({
    shop: { findFirst: vi.fn().mockResolvedValue({ id: 'shop-1' }) },
  } as any);
});

describe('handleMediaUpload preserves provider error status', () => {
  it('product not found stays 404 NOT_FOUND (not 400)', async () => {
    vi.mocked(mediaService.uploadProductMedia).mockRejectedValue(
      ApiError.notFound('Product not found'),
    );
    const res = await handleMediaUpload(
      uploadRequest({ file: testFile(), productId: 'missing' }),
      ctx(),
      {},
    );
    const body = (await res.json()) as any;
    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('cross-shop upload stays 403 FORBIDDEN (not 400)', async () => {
    vi.mocked(mediaService.uploadProductMedia).mockRejectedValue(
      ApiError.forbidden('Product does not belong to this shop'),
    );
    const res = await handleMediaUpload(
      uploadRequest({ file: testFile(), productId: 'other-shop-product' }),
      ctx(),
      {},
    );
    const body = (await res.json()) as any;
    expect(res.status).toBe(403);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('storage outage stays 500 INTERNAL_ERROR (not 400)', async () => {
    vi.mocked(mediaService.uploadProductMedia).mockRejectedValue(
      ApiError.internal('S3 upload failed: 500 InternalError'),
    );
    const res = await handleMediaUpload(
      uploadRequest({ file: testFile(), productId: 'p1' }),
      ctx(),
      {},
    );
    const body = (await res.json()) as any;
    expect(res.status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });

  it('non-integer sortOrder is 400 without reaching storage', async () => {
    const res = await handleMediaUpload(
      uploadRequest({ file: testFile(), productId: 'p1', sortOrder: 'abc' }),
      ctx(),
      {},
    );
    const body = (await res.json()) as any;
    expect(res.status).toBe(422);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(mediaService.uploadProductMedia).not.toHaveBeenCalled();
  });
});

describe('handleMediaDelete/Update preserve ApiError status', () => {
  it('cross-shop delete stays 403 (was 500 via message sniffing)', async () => {
    vi.mocked(mediaService.deleteProductMedia).mockRejectedValue(
      ApiError.forbidden('Media does not belong to this shop'),
    );
    const res = await handleMediaDelete(
      new Request('http://localhost/api/v1/media/m1', { method: 'DELETE' }),
      ctx(),
      { id: 'm1' },
    );
    const body = (await res.json()) as any;
    expect(res.status).toBe(403);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('missing media on update stays 404', async () => {
    vi.mocked(mediaService.updateProductMedia).mockRejectedValue(
      ApiError.notFound('Media not found'),
    );
    const res = await handleMediaUpdate(
      new Request('http://localhost/api/v1/media/m1', {
        method: 'PATCH',
        body: JSON.stringify({ altText: 'x' }),
      }),
      ctx(),
      { id: 'm1' },
    );
    const body = (await res.json()) as any;
    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('read path preserves ApiError', async () => {
    vi.mocked(mediaService.getProductMedia).mockRejectedValue(
      ApiError.notFound('Product not found'),
    );
    const res = await handleMediaGetByProduct(
      new Request('http://localhost/api/v1/media/product/p1'),
      ctx(),
      { productId: 'p1' },
    );
    const body = (await res.json()) as any;
    expect(res.status).toBe(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
