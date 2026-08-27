import type { PrismaClient } from '@prisma/client';

import { WishlistSortOrder } from './types';
import type {
  Wishlist,
  WishlistItem,
  WishlistWithItems,
  MergeResult,
  GuestWishlistItem,
} from './types';

export class WishlistRepository {
  constructor(private prisma: PrismaClient) {}

  async getDefaultWishlist(userId: string): Promise<Wishlist | null> {
    return this.prisma.wishlist.findFirst({
      where: {
        userId,
        isDefault: true,
        isActive: true,
      },
    });
  }

  async createDefaultWishlist(userId: string): Promise<Wishlist> {
    return this.prisma.wishlist.create({
      data: {
        userId,
        name: 'Default',
        isDefault: true,
        isShared: false,
      },
    });
  }

  async getOrCreateDefaultWishlist(userId: string): Promise<Wishlist> {
    const existing = await this.getDefaultWishlist(userId);
    if (existing) return existing;
    return this.createDefaultWishlist(userId);
  }

  async getWishlistById(
    wishlistId: string,
    includeInactive: boolean = false,
  ): Promise<WishlistWithItems | null> {
    return this.prisma.wishlist.findUnique({
      where: { id: wishlistId },
      include: {
        items: {
          where: includeInactive ? undefined : { isActive: true },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                compareAtPrice: true,
                isActive: true,
                status: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                compareAtPrice: true,
                availableStock: true,
                inventoryStatus: true,
                attributes: true,
              },
            },
          },
        },
      },
    }) as Promise<WishlistWithItems | null>;
  }

  async getUserWishlists(userId: string): Promise<Wishlist[]> {
    return this.prisma.wishlist.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        isDefault: 'desc',
      },
    });
  }

  async createWishlist(
    userId: string,
    data: { name?: string; description?: string; isShared?: boolean },
  ): Promise<Wishlist> {
    return this.prisma.wishlist.create({
      data: {
        userId,
        name: data.name || 'My Wishlist',
        description: data.description,
        isShared: data.isShared || false,
        isDefault: false,
      },
    });
  }

  async updateWishlist(
    wishlistId: string,
    userId: string,
    data: { name?: string; description?: string; isShared?: boolean },
  ): Promise<Wishlist> {
    return this.prisma.wishlist.update({
      where: {
        id: wishlistId,
        userId,
      },
      data,
    });
  }

  async deleteWishlist(wishlistId: string, userId: string): Promise<Wishlist> {
    return this.prisma.wishlist.update({
      where: {
        id: wishlistId,
        userId,
      },
      data: {
        isActive: false,
      },
    });
  }

  async addItem(
    wishlistId: string,
    productId: string,
    variantId: string | null,
    priceSnapshot: number | null,
  ): Promise<WishlistItem> {
    return this.prisma.wishlistItem.create({
      data: {
        wishlistId,
        productId,
        variantId,
        priceSnapshot,
      },
    }) as unknown as WishlistItem;
  }

  async removeItem(itemId: string): Promise<WishlistItem> {
    return this.prisma.wishlistItem.update({
      where: { id: itemId },
      data: { isActive: false },
    }) as unknown as WishlistItem;
  }

  async permanentlyDeleteItem(itemId: string): Promise<WishlistItem> {
    return this.prisma.wishlistItem.delete({
      where: { id: itemId },
    }) as unknown as WishlistItem;
  }

  async getItemByProductAndVariant(
    wishlistId: string,
    productId: string,
    variantId: string | null,
  ): Promise<WishlistItem | null> {
    return this.prisma.wishlistItem.findFirst({
      where: {
        wishlistId,
        productId,
        variantId,
        isActive: true,
      },
    }) as unknown as WishlistItem | null;
  }

  async updateItemCount(wishlistId: string): Promise<void> {
    const count = await this.prisma.wishlistItem.count({
      where: {
        wishlistId,
        isActive: true,
      },
    });

    await this.prisma.wishlist.update({
      where: { id: wishlistId },
      data: { itemCount: count },
    });
  }

  async getWishlistItems(
    wishlistId: string,
    includeInactive: boolean = false,
    sort: WishlistSortOrder = WishlistSortOrder.ADDED_DESC,
  ): Promise<WishlistItem[]> {
    const orderBy = this.getSortOrder(sort);

    return this.prisma.wishlistItem.findMany({
      where: {
        wishlistId,
        isActive: includeInactive ? undefined : true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            compareAtPrice: true,
            isActive: true,
            status: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            availableStock: true,
            inventoryStatus: true,
            attributes: true,
          },
        },
      },
      orderBy,
    }) as unknown as WishlistItem[];
  }

  async bulkRemoveItems(itemIds: string[]): Promise<void> {
    await this.prisma.wishlistItem.updateMany({
      where: {
        id: { in: itemIds },
      },
      data: { isActive: false },
    });
  }

  async getSharedWishlistByToken(
    shareToken: string,
  ): Promise<WishlistWithItems | null> {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: {
        shareToken,
        isShared: true,
        isActive: true,
      },
      include: {
        items: {
          where: { isActive: true },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                compareAtPrice: true,
                isActive: true,
                status: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                compareAtPrice: true,
                availableStock: true,
                inventoryStatus: true,
                attributes: true,
              },
            },
          },
        },
      },
    });

    if (!wishlist) return null;

    if (wishlist.shareExpiresAt && wishlist.shareExpiresAt < new Date()) {
      return null;
    }

    return wishlist as unknown as WishlistWithItems;
  }

  async generateShareToken(wishlistId: string): Promise<string> {
    const token = this.generateRandomToken();
    await this.prisma.wishlist.update({
      where: { id: wishlistId },
      data: {
        shareToken: token,
        isShared: true,
      },
    });
    return token;
  }

  async disableShare(wishlistId: string): Promise<void> {
    await this.prisma.wishlist.update({
      where: { id: wishlistId },
      data: {
        isShared: false,
        shareToken: null,
        shareExpiresAt: null,
      },
    });
  }

  async mergeGuestWishlist(
    userId: string,
    guestItems: GuestWishlistItem[],
  ): Promise<MergeResult> {
    const wishlist = await this.getOrCreateDefaultWishlist(userId);
    const conflicts: Array<{
      productId: string;
      variantId: string | null;
      reason: string;
    }> = [];
    let mergedItems = 0;
    let skippedItems = 0;

    for (const guestItem of guestItems) {
      const existing = await this.getItemByProductAndVariant(
        wishlist.id,
        guestItem.productId,
        guestItem.variantId,
      );

      if (existing) {
        conflicts.push({
          productId: guestItem.productId,
          variantId: guestItem.variantId,
          reason: 'Item already exists in wishlist',
        });
        skippedItems++;
        continue;
      }

      const product = await this.prisma.product.findUnique({
        where: { id: guestItem.productId },
        select: { isActive: true, status: true },
      });

      if (!product || !product.isActive || product.status !== 'published') {
        conflicts.push({
          productId: guestItem.productId,
          variantId: guestItem.variantId,
          reason: 'Product is not available',
        });
        skippedItems++;
        continue;
      }

      let priceSnapshot: number | null = null;
      if (guestItem.variantId) {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: guestItem.variantId },
          select: { price: true, isActive: true },
        });

        if (!variant || !variant.isActive) {
          conflicts.push({
            productId: guestItem.productId,
            variantId: guestItem.variantId,
            reason: 'Variant is not available',
          });
          skippedItems++;
          continue;
        }

        priceSnapshot = Number(variant.price);
      } else {
        priceSnapshot = Number((product as any).basePrice);
      }

      await this.addItem(
        wishlist.id,
        guestItem.productId,
        guestItem.variantId,
        priceSnapshot,
      );
      mergedItems++;
    }

    await this.updateItemCount(wishlist.id);

    const finalWishlist = await this.getWishlistById(wishlist.id, false);

    return {
      mergedItems,
      skippedItems,
      conflicts,
      finalWishlist: finalWishlist!,
    };
  }

  async getUserWishlistStats(userId: string): Promise<{
    totalWishlists: number;
    totalItems: number;
    activeItems: number;
    sharedWishlists: number;
  }> {
    const wishlists = await this.prisma.wishlist.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        itemCount: true,
        isShared: true,
      },
    });

    const totalWishlists = wishlists.length;
    const totalItems = wishlists.reduce((sum, w) => sum + w.itemCount, 0);
    const sharedWishlists = wishlists.filter((w) => w.isShared).length;

    const activeItems = await this.prisma.wishlistItem.count({
      where: {
        wishlist: {
          userId,
          isActive: true,
        },
        isActive: true,
      },
    });

    return {
      totalWishlists,
      totalItems,
      activeItems,
      sharedWishlists,
    };
  }

  private getSortOrder(sort: WishlistSortOrder) {
    switch (sort) {
      case WishlistSortOrder.ADDED_DESC:
        return { addedAt: 'desc' as const };
      case WishlistSortOrder.ADDED_ASC:
        return { addedAt: 'asc' as const };
      case WishlistSortOrder.PRICE_ASC:
        return { priceSnapshot: 'asc' as const };
      case WishlistSortOrder.PRICE_DESC:
        return { priceSnapshot: 'desc' as const };
      case WishlistSortOrder.NAME_ASC:
        return { product: { name: 'asc' as const } };
      case WishlistSortOrder.NAME_DESC:
        return { product: { name: 'desc' as const } };
      default:
        return { addedAt: 'desc' as const };
    }
  }

  private generateRandomToken(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}
