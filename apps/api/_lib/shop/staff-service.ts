import { ApiError } from '../http/errors.ts';
import { getPrisma } from '../prisma.ts';

const prisma = new Proxy({} as any, {
  get(_t: unknown, p: string | symbol) {
    return (getPrisma() as any)[p];
  },
}) as any;

export async function hasShopAccess(
  userId: string,
  shopId: string | undefined,
): Promise<boolean> {
  if (!shopId) return false;
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { ownerId: true },
  });
  if (shop?.ownerId === userId) return true;
  const member = await prisma.shopMember.findFirst({
    where: { shopId, userId, status: 'active' },
  });
  return !!member;
}

export async function requireShopAccess(
  userId: string,
  shopId: string | undefined,
): Promise<void> {
  if (!(await hasShopAccess(userId, shopId)))
    throw ApiError.forbidden('Shop access denied');
}

export async function listStaff(shopId: string) {
  return prisma.shopMember.findMany({
    where: { shopId, status: { not: 'removed' } },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
    },
  });
}

export async function inviteStaff(
  shopId: string,
  email: string,
  role: 'manager' | 'staff',
  invitedBy: string,
) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw ApiError.validation('email required');
  if (!['manager', 'staff'].includes(role))
    throw ApiError.validation('invalid role');
  const existingMember = await prisma.shopMember.findFirst({
    where: { shopId, user: { email: normalized } },
  });
  if (existingMember) throw ApiError.validation('Already a member');
  const token = crypto.randomUUID() + crypto.randomUUID();
  const hash = await crypto.subtle
    .digest('SHA-256', new TextEncoder().encode(token))
    .then((b) =>
      Array.from(new Uint8Array(b))
        .map((x) => x.toString(16).padStart(2, '0'))
        .join(''),
    )
    .catch(() => token.slice(0, 64));
  const tokenHash = hash.slice(0, 64);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invite = await prisma.shopInvite.create({
    data: {
      shopId,
      email: normalized,
      role,
      tokenHash,
      status: 'pending',
      expiresAt,
      invitedBy,
    },
  });
  return { inviteId: invite.id, token, expiresAt };
}

export async function acceptInvite(token: string, userId: string) {
  const hash = await crypto.subtle
    .digest('SHA-256', new TextEncoder().encode(token))
    .then((b) =>
      Array.from(new Uint8Array(b))
        .map((x) => x.toString(16).padStart(2, '0'))
        .join(''),
    )
    .catch(() => token.slice(0, 64));
  const tokenHash = hash.slice(0, 64);
  const invite = await prisma.shopInvite.findUnique({ where: { tokenHash } });
  if (!invite) throw ApiError.notFound('Invalid invite');
  if (invite.status !== 'pending')
    throw ApiError.validation('Invite already used');
  if (invite.expiresAt < new Date()) {
    await prisma.shopInvite.update({
      where: { id: invite.id },
      data: { status: 'expired' },
    });
    throw ApiError.validation('Invite expired');
  }
  const existing = await prisma.shopMember.findFirst({
    where: { shopId: invite.shopId, userId },
  });
  if (existing) throw ApiError.validation('Already a member');
  const member = await prisma.shopMember.create({
    data: {
      shopId: invite.shopId,
      userId,
      role: invite.role,
      status: 'active',
      invitedBy: invite.invitedBy,
    },
  });
  await prisma.shopInvite.update({
    where: { id: invite.id },
    data: { status: 'accepted' },
  });
  return member;
}

export async function updateMemberRole(
  shopId: string,
  memberId: string,
  role: 'manager' | 'staff',
  actorId: string,
) {
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (shop?.ownerId === memberId)
    throw ApiError.forbidden('Cannot modify owner');
  if (shop?.ownerId !== actorId)
    throw ApiError.forbidden('Only owner can change roles');
  if (role === 'manager' || role === 'staff') {
    return prisma.shopMember.update({
      where: { id: memberId },
      data: { role },
    });
  }
  throw ApiError.validation('invalid role');
}

export async function removeMember(
  shopId: string,
  memberId: string,
  actorId: string,
) {
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  const member = await prisma.shopMember.findUnique({
    where: { id: memberId },
  });
  if (!member) throw ApiError.notFound('Member not found');
  if (member.userId === shop?.ownerId)
    throw ApiError.forbidden('Cannot remove owner');
  if (shop?.ownerId !== actorId)
    throw ApiError.forbidden('Only owner can remove');
  return prisma.shopMember.update({
    where: { id: memberId },
    data: { status: 'removed' },
  });
}
