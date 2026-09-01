import { CartRepository } from './repository';
import type { CartSyncResult, CartConflict } from './types';

export class CartSyncService {
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
    const serverItemMap = new Map(
      serverItems.map((item: any) => [item.variantId, item]),
    );
    for (const localItem of localItems) {
      const serverItem = serverItemMap.get(localItem.variantId) as any;
      if (!serverItem) {
        await CartRepository.addItem(
          userId,
          null,
          localItem.variantId,
          localItem.quantity,
        );
        itemsAdded++;
      } else {
        const localModified = new Date(localItem.lastModified);
        const serverModified = new Date((serverItem as any).updatedAt);
        if (localModified > serverModified) {
          if ((serverItem as any).quantity !== localItem.quantity) {
            await CartRepository.updateItemQuantity(
              (serverItem as any).id,
              localItem.quantity,
            );
            itemsUpdated++;
          }
        } else if (serverModified > localModified) {
          conflicts.push({
            variantId: localItem.variantId,
            localQuantity: localItem.quantity,
            serverQuantity: (serverItem as any).quantity,
            resolvedQuantity: (serverItem as any).quantity,
            resolution: 'server',
          });
        } else {
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

  static async getSyncStatus(
    userId: string,
    lastSyncedAt?: Date | null,
  ): Promise<{
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
    let hasPendingChanges = false;
    if (lastSyncedAt) {
      hasPendingChanges = items.some(
        (it: any) => new Date(it.updatedAt) > lastSyncedAt,
      );
    } else {
      const versionPending = items.some(
        (it: any) => typeof it.version === 'number' && it.version > 0,
      );
      if (versionPending) hasPendingChanges = true;
      else {
        const recentThreshold = Date.now() - 60_000;
        hasPendingChanges = items.some(
          (it: any) => new Date(it.updatedAt).getTime() > recentThreshold,
        );
        if (hasPendingChanges && lastSyncAt) {
          const timeSinceSync = Date.now() - new Date(lastSyncAt).getTime();
          hasPendingChanges = timeSinceSync < 5000;
        } else {
          hasPendingChanges = false;
        }
      }
    }
    if (lastSyncedAt && lastSyncAt) {
      hasPendingChanges = items.some(
        (it: any) => new Date(it.updatedAt) > lastSyncedAt!,
      );
    }
    return {
      lastSyncAt,
      itemCount: items.length,
      hasPendingChanges,
    };
  }

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
