import { describe, expect, it } from 'vitest';

import {
  ERROR_CODES,
  ERROR_HTTP_STATUS,
  type ApiErrorResponse,
  type ApiSuccessResponse,
  type ErrorCode,
} from './index.ts';

describe('api contracts', () => {
  it('keeps the canonical error registry', () => {
    expect(ERROR_CODES).toContain('RATE_LIMITED');
    expect(ERROR_CODES).toContain('INSUFFICIENT_STOCK');
    expect(ERROR_HTTP_STATUS.RATE_LIMITED).toBe(429);
    expect(ERROR_HTTP_STATUS.INSUFFICIENT_STOCK).toBe(409);
  });

  it('maps every error code to an HTTP status', () => {
    for (const code of ERROR_CODES) {
      expect(ERROR_HTTP_STATUS[code]).toBeTypeOf('number');
    }
  });

  it('types the success envelope', () => {
    const ok: ApiSuccessResponse<{ id: string }> = {
      success: true,
      data: { id: 'x' },
      error: null,
      meta: { requestId: 'req_1', version: 'v1' },
    };
    expect(ok.success).toBe(true);
  });

  it('types the error envelope', () => {
    const err: ApiErrorResponse = {
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR' as ErrorCode,
        message: 'invalid',
        field: 'email',
      },
      meta: { requestId: 'req_1', version: 'v1' },
    };
    expect(err.error.field).toBe('email');
  });
});
