import { z } from 'zod';

import { CartRepository } from '../../_lib/cart/repository.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { getPrisma } from '../../_lib/prisma.ts';
import { WishlistRepository } from '../../_lib/wishlist/repository.ts';
import { register } from '../register.ts';

const prismaProxy = new Proxy({} as any, {
  get(_t: unknown, p: string | symbol) {
    return (getPrisma() as any)[p];
  },
});

const bulkRemoveSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1).max(100),
});
const bulkMoveSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1).max(100),
});

export async function handleWishlistBulkRemove(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    if (!userId)
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    const body = await request.json();
    const { itemIds } = bulkRemoveSchema.parse(body);
    const repo = new WishlistRepository(prismaProxy);
    const wishlist = await repo.getDefaultWishlist(userId);
    if (!wishlist)
      return errorJson(
        ApiError.notFound('Wishlist not found'),
        context.requestId,
      );
    const items = await prismaProxy.wishlistItem.findMany({
      where: { id: { in: itemIds }, wishlistId: wishlist.id, isActive: true },
    });
    if (items.length !== itemIds.length)
      return errorJson(
        ApiError.validation('Some items not found or not yours'),
        context.requestId,
      );
    await repo.bulkRemoveItems(itemIds);
    await repo.updateItemCount(wishlist.id);
    return okJson(
      { success: true, removed: itemIds.length },
      context.requestId,
    );
  } catch (e: any) {
    if (e?.name === 'ZodError')
      return errorJson(ApiError.validation(e.message), context.requestId);
    return errorJson(
      ApiError.internal(e.message || 'Failed to remove items'),
      context.requestId,
    );
  }
}

export async function handleWishlistBulkMoveToCart(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    if (!userId)
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    const body = await request.json();
    const { itemIds } = bulkMoveSchema.parse(body);
    const repo = new WishlistRepository(prismaProxy);
    const wishlist = await repo.getDefaultWishlist(userId);
    if (!wishlist)
      return errorJson(
        ApiError.notFound('Wishlist not found'),
        context.requestId,
      );
    const items: any[] = await prismaProxy.wishlistItem.findMany({
      where: { id: { in: itemIds }, wishlistId: wishlist.id, isActive: true },
      include: { variant: { select: { id: true } } },
    });
    if (items.length !== itemIds.length)
      return errorJson(
        ApiError.validation('Some items not found'),
        context.requestId,
      );
    let moved = 0;
    for (const it of items) {
      const variantId = it.variantId || it.variant?.id;
      if (!variantId) continue;
      try {
        await CartRepository.addItem(userId, null, variantId, 1);
        moved++;
      } catch {}
    }
    await repo.bulkRemoveItems(itemIds);
    await repo.updateItemCount(wishlist.id);
    return okJson({ success: true, moved }, context.requestId);
  } catch (e: any) {
    if (e?.name === 'ZodError')
      return errorJson(ApiError.validation(e.message), context.requestId);
    return errorJson(
      ApiError.internal(e.message || 'Failed to move items'),
      context.requestId,
    );
  }
}

register('POST', 'wishlist/bulk-remove', handleWishlistBulkRemove);
register('POST', 'wishlist/bulk-move-to-cart', handleWishlistBulkMoveToCart);
