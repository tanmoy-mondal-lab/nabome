/**
 * COD API handlers — basic COD flow (user scope decision: included now).
 *
 * Endpoints beyond the canonical PAY/FIN surface; courier-webhook style access
 * (signature-verified in production; basic here). Collect confirmation is
 * idempotent and amount-checked; lifecycle advances in forward steps only.
 */
import { z } from 'zod';

import { toPaise } from '@nabome/payment';

import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson } from '../../_lib/http/response.ts';
import {
  confirmCodCollection,
  advanceCodStatus,
} from '../../_lib/payment/cod.ts';
import { register } from '../register.ts';

const collectSchema = z.object({
  orderId: z.string().uuid(),
  collectedAmount: z.number().positive(),
});

async function collect(
  request: Request,
  context: RequestContext,
): Promise<Response> {
  const body = collectSchema.safeParse(await request.json().catch(() => null));
  if (!body.success)
    throw ApiError.validation('Invalid COD collection payload');
  const result = await confirmCodCollection(
    context.env,
    body.data.orderId,
    toPaise(body.data.collectedAmount.toString()),
  );
  return okJson(result, context.requestId);
}

const advanceSchema = z.object({
  orderId: z.string().uuid(),
  to: z.enum(['in_transit', 'delivered']),
});

async function advance(
  request: Request,
  context: RequestContext,
): Promise<Response> {
  const body = advanceSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) throw ApiError.validation('Invalid COD status payload');
  const result = await advanceCodStatus(body.data.orderId, body.data.to);
  return okJson(result, context.requestId);
}

register('POST', 'cod/collect', collect);
register('POST', 'cod/advance', advance);
