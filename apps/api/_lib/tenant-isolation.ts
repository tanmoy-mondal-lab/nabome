import { ApiError } from './http/errors.ts';
import { getPrisma } from './prisma.ts';

function prisma() {
  return getPrisma() as any;
}

export async function userOwnsShop(
  userId: string,
  shopId: string,
): Promise<boolean> {
  const shop = await prisma().shop.findFirst({
    where: { id: shopId, ownerId: userId, isActive: true },
  });
  return !!shop;
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const user = await prisma().user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === 'admin';
}

export async function getUserShopIds(userId: string): Promise<string[]> {
  const shops = await prisma().shop.findMany({
    where: { ownerId: userId, isActive: true },
    select: { id: true },
  });
  return shops.map((shop: { id: string }) => shop.id);
}

export function getShopFilter(
  _userId: string,
  shopId?: string,
): Record<string, unknown> {
  if (shopId) return { shopId };
  throw new ApiError({ code: 'FORBIDDEN', message: 'Shop context required' });
}

export async function userOwnsProduct(
  userId: string,
  productId: string,
): Promise<boolean> {
  const product = await prisma().product.findFirst({
    where: {
      id: productId,
      shop: { ownerId: userId, isActive: true },
      isActive: true,
    },
  });
  return !!product;
}

export async function userOwnsOrder(
  userId: string,
  orderId: string,
): Promise<boolean> {
  const order = await prisma().order.findFirst({
    where: { id: orderId, shop: { ownerId: userId, isActive: true } },
  });
  return !!order;
}

export async function userOwnsVariant(
  userId: string,
  variantId: string,
): Promise<boolean> {
  const variant = await prisma().productVariant.findFirst({
    where: {
      id: variantId,
      product: { shop: { ownerId: userId, isActive: true }, isActive: true },
    },
  });
  return !!variant;
}

export async function requireShopAccess(
  userId: string,
  shopId: string,
  resourceType: string = 'resource',
): Promise<void> {
  const isAdmin = await isAdminUser(userId);
  if (isAdmin) return;
  const ownsShop = await userOwnsShop(userId, shopId);
  if (!ownsShop)
    throw ApiError.forbidden(
      `Access denied: You do not have access to this ${resourceType}`,
    );
}

export async function requireProductAccess(
  userId: string,
  productId: string,
): Promise<void> {
  const isAdmin = await isAdminUser(userId);
  if (isAdmin) return;
  const ownsProduct = await userOwnsProduct(userId, productId);
  if (!ownsProduct)
    throw ApiError.forbidden(
      'Access denied: You do not have access to this product',
    );
}

export async function requireOrderAccess(
  userId: string,
  orderId: string,
): Promise<void> {
  const isAdmin = await isAdminUser(userId);
  if (isAdmin) return;
  const ownsOrder = await userOwnsOrder(userId, orderId);
  if (!ownsOrder)
    throw ApiError.forbidden(
      'Access denied: You do not have access to this order',
    );
}

export async function getTenantWhereClause(
  userId: string,
  baseWhere: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  const isAdmin = await isAdminUser(userId);
  if (isAdmin) return baseWhere;
  const shopIds = await getUserShopIds(userId);
  if (shopIds.length === 0)
    return { ...baseWhere, shopId: '00000000-0000-0000-0000-000000000000' };
  return { ...baseWhere, shopId: { in: shopIds } };
}
