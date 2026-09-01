import { z } from 'zod';

import { logAuditEvent, AuditEventType } from '../../_lib/audit/audit-log.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { checkRateLimit } from '../../_lib/index.ts';
import { getPrisma } from '../../_lib/prisma.ts';
import * as Staff from '../../_lib/shop/staff-service.ts';
import { register } from '../register.ts';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['manager', 'staff']).default('staff'),
});
const roleSchema = z.object({ role: z.enum(['manager', 'staff']) });

export async function handleListStaff(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    if (!userId)
      return errorJson(
        ApiError.unauthorized('Auth required'),
        context.requestId,
      );
    const shopId =
      params.shopId || new URL(request.url).searchParams.get('shopId') || '';
    if (!shopId)
      return errorJson(
        ApiError.validation('shopId required'),
        context.requestId,
      );
    if (!(await Staff.hasShopAccess(userId, shopId)))
      return errorJson(
        ApiError.forbidden('Shop access denied'),
        context.requestId,
      );
    const members = await Staff.listStaff(shopId);
    return okJson({ members }, context.requestId);
  } catch (e) {
    return errorJson(
      e instanceof Error
        ? ApiError.internal(e.message)
        : ApiError.internal('Failed'),
      context.requestId,
    );
  }
}
export async function handleInviteStaff(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    if (!userId)
      return errorJson(
        ApiError.unauthorized('Auth required'),
        context.requestId,
      );
    const shopId = params.shopId || '';
    if (!shopId)
      return errorJson(
        ApiError.validation('shopId required'),
        context.requestId,
      );
    const limit = await checkRateLimit(
      (context.env as any).KV,
      'public',
      userId,
    );
    if (!limit.allowed)
      return errorJson(ApiError.forbidden('Rate limited'), context.requestId);
    const prisma: any = getPrisma();
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop || shop.ownerId !== userId)
      return errorJson(
        ApiError.forbidden('Only owner can invite'),
        context.requestId,
      );
    const body = (await request.json()) as any;
    const { email, role } = inviteSchema.parse(body);
    const result = await Staff.inviteStaff(shopId, email, role, userId);
    await logAuditEvent({
      eventType: AuditEventType.RESOURCE_ACCESS_GRANTED,
      userId,
      metadata: { action: 'staff.invited', shopId, email, role },
      severity: 'info',
      category: 'authorization',
    });
    return okJson(
      { inviteId: result.inviteId, email, role, expiresAt: result.expiresAt },
      context.requestId,
    );
  } catch (e) {
    if (e instanceof ApiError) return errorJson(e, context.requestId);
    return errorJson(
      e instanceof Error
        ? ApiError.validation(e.message)
        : ApiError.validation('Invalid'),
      context.requestId,
    );
  }
}
export async function handleAcceptInvite(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    if (!userId)
      return errorJson(
        ApiError.unauthorized('Auth required'),
        context.requestId,
      );
    const limit = await checkRateLimit(
      (context.env as any).KV,
      'public',
      userId,
    );
    if (!limit.allowed)
      return errorJson(ApiError.forbidden('Rate limited'), context.requestId);
    const token = params.token || ((await request.json()) as any).token;
    if (!token)
      return errorJson(
        ApiError.validation('token required'),
        context.requestId,
      );
    const prisma: any = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const member = await Staff.acceptInvite(token, userId);
    const invite = await prisma.shopInvite.findFirst({
      where: { shopId: member.shopId, email: user?.email?.toLowerCase() },
    });
    if (
      user?.email &&
      invite &&
      invite.email.toLowerCase() !== user.email.toLowerCase()
    ) {
      await prisma.shopMember
        .delete({ where: { id: member.id } })
        .catch(() => {});
      return errorJson(
        ApiError.forbidden('Invite email mismatch'),
        context.requestId,
      );
    }
    await logAuditEvent({
      eventType: AuditEventType.RESOURCE_ACCESS_GRANTED,
      userId,
      metadata: { action: 'staff.accepted', shopId: member.shopId },
      severity: 'info',
      category: 'authorization',
    });
    return okJson({ member }, context.requestId);
  } catch (e) {
    if (e instanceof ApiError) return errorJson(e, context.requestId);
    return errorJson(
      ApiError.validation(e instanceof Error ? e.message : 'Failed'),
      context.requestId,
    );
  }
}
export async function handleUpdateStaffRole(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    if (!userId)
      return errorJson(
        ApiError.unauthorized('Auth required'),
        context.requestId,
      );
    const { shopId, memberId } = params;
    if (!shopId || !memberId)
      return errorJson(
        ApiError.validation('shopId/memberId required'),
        context.requestId,
      );
    const body = (await request.json()) as any;
    const { role } = roleSchema.parse(body);
    const updated = await Staff.updateMemberRole(
      shopId,
      memberId,
      role,
      userId,
    );
    await logAuditEvent({
      eventType: AuditEventType.RESOURCE_ACCESS_GRANTED,
      userId,
      metadata: { action: 'staff.role_changed', shopId, memberId, role },
      severity: 'info',
      category: 'authorization',
    });
    return okJson({ member: updated }, context.requestId);
  } catch (e) {
    if (e instanceof ApiError) return errorJson(e, context.requestId);
    return errorJson(
      ApiError.validation(e instanceof Error ? e.message : 'Failed'),
      context.requestId,
    );
  }
}
export async function handleRemoveStaff(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    if (!userId)
      return errorJson(
        ApiError.unauthorized('Auth required'),
        context.requestId,
      );
    const { shopId, memberId } = params;
    if (!shopId || !memberId)
      return errorJson(
        ApiError.validation('shopId/memberId required'),
        context.requestId,
      );
    const removed = await Staff.removeMember(shopId, memberId, userId);
    await logAuditEvent({
      eventType: AuditEventType.RESOURCE_ACCESS_GRANTED,
      userId,
      metadata: { action: 'staff.removed', shopId, memberId },
      severity: 'info',
      category: 'authorization',
    });
    return okJson({ member: removed }, context.requestId);
  } catch (e) {
    if (e instanceof ApiError) return errorJson(e, context.requestId);
    return errorJson(
      ApiError.validation(e instanceof Error ? e.message : 'Failed'),
      context.requestId,
    );
  }
}
register('GET', 'shops/:shopId/staff', handleListStaff);
register('POST', 'shops/:shopId/staff/invitations', handleInviteStaff);
register('POST', 'shop-invitations/:token/accept', handleAcceptInvite);
register('PUT', 'shops/:shopId/staff/:memberId', handleUpdateStaffRole);
register('DELETE', 'shops/:shopId/staff/:memberId', handleRemoveStaff);
