import { createSettlement } from '../../_lib/finance/service.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { getPrisma } from '../../_lib/prisma.ts';
import { register } from '../register.ts';

export async function handleInternalSettlementRun(request: Request, context: RequestContext): Promise<Response> {
  const secret = (context.env as any).SETTLEMENT_CRON_SECRET as string | undefined;
  const header = request.headers.get('x-settlement-secret');
  if (!secret || header !== secret) {
    return errorJson(ApiError.forbidden('Forbidden'), context.requestId);
  }
  const prisma = getPrisma() as any;
  let body: any = {};
  try { body = await request.json() } catch {}
  const actorId = body.actorId ?? 'system-cron';
  const shops = await prisma.shop.findMany({ where: { isActive: true }, select: { id: true } });
  let processed = 0, created = 0, errors = 0;
  const details: any[] = [];
  for (const shop of shops as any[]) {
    processed++;
    try {
      const res = await createSettlement(context.env as any, { shopId: shop.id, actorId });
      created++;
      details.push({ shopId: shop.id, settlementId: res.settlementId, status: res.status });
    } catch (e: any) {
      if (e?.code === 'SETTLEMENT_MINIMUM_NOT_MET' || e?.code === 'DUPLICATE_SETTLEMENT') {
        details.push({ shopId: shop.id, skipped: e.code });
      } else {
        errors++;
        details.push({ shopId: shop.id, error: e?.message ?? String(e), code: e?.code });
      }
    }
  }
  return okJson({ processed, created, errors, details }, context.requestId);
}

register('POST', 'internal/settlement/run', handleInternalSettlementRun);
