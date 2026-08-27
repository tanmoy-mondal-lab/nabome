/**
 * Request body parsing + zod validation (REST_API_SPECIFICATION §6.3).
 * Handlers register a zod schema per route in _handlers/register.ts.
 */
import type { ZodType } from 'zod';

import { ApiError } from './http/errors.ts';

export async function parseJsonBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get('content-type') ?? '';
  if (request.body === null) {
    return undefined;
  }
  if (!contentType.includes('application/json')) {
    throw ApiError.validation(
      'Content-Type must be application/json',
      undefined,
      { supported: ['application/json'] },
    );
  }
  const text = await request.text();
  if (text.length === 0) {
    return undefined;
  }
  if (text.length > 1_000_000) {
    throw ApiError.validation('Request body too large', undefined, {
      maxBytes: 1_000_000,
    });
  }
  try {
    return JSON.parse(text);
  } catch {
    throw ApiError.validation('Invalid JSON body');
  }
}

export function validate<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    throw ApiError.validation(
      firstIssue?.message ?? 'Validation failed',
      firstIssue?.path.join('.'),
      {
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    );
  }
  return result.data;
}
