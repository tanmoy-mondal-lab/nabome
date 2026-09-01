import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { getPrisma } from '../../_lib/prisma.ts';
import { register } from '../register.ts';

export async function handleListShops(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    if (!userId)
      return errorJson(
        ApiError.unauthorized('Auth required'),
        context.requestId,
      );
    const prisma: any = getPrisma();
    const owned = await prisma.shop.findMany({
      where: { ownerId: userId, isActive: true },
    });
    const memberships = await prisma.shopMember.findMany({
      where: { userId, status: 'active' },
      include: { shop: true },
    });
    const shops: any[] = [];
    const seen = new Set<string>();
    for (const s of owned) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        shops.push({ ...s, role: 'owner', membershipStatus: 'active' });
      }
    }
    for (const m of memberships) {
      if (!seen.has(m.shopId) && m.shop?.isActive) {
        seen.add(m.shopId);
        shops.push({ ...m.shop, role: m.role, membershipStatus: m.status });
      }
    }
    return okJson({ shops }, context.requestId);
  } catch (e) {
    return errorJson(
      e instanceof Error
        ? ApiError.internal(e.message)
        : ApiError.internal('Failed'),
      context.requestId,
    );
  }
}
register('GET', 'shops', handleListShops);
