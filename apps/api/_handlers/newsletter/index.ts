import { z } from 'zod';

import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { register } from '../register.ts';

const subscribeSchema = z.object({ email: z.string().email() });

const subscribers = new Set<string>();
const rateMap = new Map<string, number>();

export async function handleNewsletterSubscribe(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const ip =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      'unknown';
    const now = Date.now();
    const last = rateMap.get(ip) ?? 0;
    if (now - last < 60000) {
      return errorJson(
        ApiError.rateLimited('Too many requests, please wait a minute'),
        context.requestId,
      );
    }
    const body = await request.json();
    const { email } = subscribeSchema.parse(body);
    const normalized = email.toLowerCase().trim();
    subscribers.add(normalized);
    rateMap.set(ip, now);
    return okJson({ success: true, email: normalized }, context.requestId);
  } catch (error: any) {
    if (error?.name === 'ZodError')
      return errorJson(ApiError.validation(error.message), context.requestId);
    return errorJson(
      ApiError.validation(error.message || 'Invalid request'),
      context.requestId,
    );
  }
}

register('POST', 'newsletter/subscribe', handleNewsletterSubscribe);
