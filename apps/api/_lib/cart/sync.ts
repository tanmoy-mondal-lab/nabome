/**
 * Cart Synchronization Service
 *
 * Handles real-time synchronization of cart data across multiple devices:
 * - Conflict resolution (last-write-wins, quantity merging)
 * - Optimistic locking with versioning
 * - Sync status tracking
 * - Reconciliation strategies
 *
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §7
 */

import { CartRepository } from './repository';
import type { CartSyncResult, CartConflict } from './types';

export class CartSyncService {
  /**
   * Sync local cart changes with server
   */
  static async syncCart(
    userId: string,
    localItems: Array<{
      variantId: string;
      quantity: number;
      lastModified: Date;
    }>,
  ): Promise<CartSyncResult> {
    const serverItems = await CartRepository.findByUserId(userId);
    const conflicts: CartConflict[] = [];
    let itemsAdded = 0;
    let itemsUpdated = 0;
    let itemsRemoved = 0;

    // Build map of server items by variant ID
    const serverItemMap = new Map(
      serverItems.map((item: any) => [item.variantId, item]),
    );

    // Process local items
    for (const localItem of localItems) {
      const serverItem = serverItemMap.get(localItem.variantId) as any;

      if (!serverItem) {
        // Item exists locally but not on server - add to server
        await CartRepository.addItem(
          userId,
          null,
          localItem.variantId,
          localItem.quantity,
        );
        itemsAdded++;
      } else {
        // Item exists on both sides - check for conflict
        const localModified = new Date(localItem.lastModified);
        const serverModified = new Date((serverItem as any).updatedAt);

        if (localModified > serverModified) {
          // Local is newer - use local quantity
          if ((serverItem as any).quantity !== localItem.quantity) {
            await CartRepository.updateItemQuantity(
              (serverItem as any).id,
              localItem.quantity,
            );
            itemsUpdated++;
          }
        } else if (serverModified > localModified) {
          // Server is newer - use server quantity (no action needed)
          conflicts.push({
            variantId: localItem.variantId,
            localQuantity: localItem.quantity,
            serverQuantity: (serverItem as any).quantity,
            resolvedQuantity: (serverItem as any).quantity,
            resolution: 'server',
          });
        } else {
          // Same timestamp - merge quantities (sum, capped at 10)
          const mergedQuantity = Math.min(
            localItem.quantity + (serverItem as any).quantity,
            10,
          );
          if (mergedQuantity !== (serverItem as any).quantity) {
            await CartRepository.updateItemQuantity(
              (serverItem as any).id,
              mergedQuantity,
            );
            itemsUpdated++;
          }
          conflicts.push({
            variantId: localItem.variantId,
            localQuantity: localItem.quantity,
            serverQuantity: (serverItem as any).quantity,
            resolvedQuantity: mergedQuantity,
            resolution: 'sum',
          });
        }
      }
    }

    // Check for items on server that don't exist locally (removed locally)
    for (const serverItem of serverItems) {
      const localItem = localItems.find(
        (item: any) => item.variantId === serverItem.variantId,
      );
      if (!localItem) {
        await CartRepository.removeItem((serverItem as any).id);
        itemsRemoved++;
      }
    }

    return {
      merged: itemsAdded > 0 || itemsUpdated > 0 || itemsRemoved > 0,
      itemsAdded,
      itemsUpdated,
      itemsRemoved,
      conflicts,
    };
  }

  /**
   * Get cart sync status
   */
  static async getSyncStatus(userId: string): Promise<{
    lastSyncAt: Date | null;
    itemCount: number;
    hasPendingChanges: boolean;
  }> {
    const items = await CartRepository.findByUserId(userId);

    if (items.length === 0) {
      return {
        lastSyncAt: null,
        itemCount: 0,
        hasPendingChanges: false,
      };
    }

    const lastSyncAt = items.reduce(
      (latest: any, item: any) => {
        if (!latest) return item.updatedAt;
        return item.updatedAt > latest ? item.updatedAt : latest;
      },
      null as Date | null,
    );

    return {
      lastSyncAt,
      itemCount: items.length,
      hasPendingChanges: false, // TODO: Implement pending change tracking
    };
  }

  /**
   * Resolve conflict manually
   */
  static async resolveConflict(
    userId: string,
    variantId: string,
    resolvedQuantity: number,
  ): Promise<void> {
    const items = await CartRepository.findByUserId(userId);
    const item = items.find((i: any) => i.variantId === variantId);

    if (!item) {
      throw new Error('Item not found');
    }

    await CartRepository.updateItemQuantity(item.id, resolvedQuantity);
  }
}
