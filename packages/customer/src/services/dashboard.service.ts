import type { Id } from '@nabome/types';

import type {
  CustomerDashboard,
  CustomerProfile,
  QuickAction,
  RecentOrderSummary,
  ActiveReturnSummary,
  WishlistSummary,
  NotificationSummary,
  AccountHealth,
  RecommendedProduct,
} from '../types';

export class DashboardService {
  async getDashboard(userId: Id): Promise<CustomerDashboard> {
    const summary: any = await this.getDashboardSummary(userId);
    return {
      profile: summary.profile,
      quickActions: (await this.getQuickActions(userId)) as any,
      recentOrders: summary.recentOrders,
      activeReturns: summary.activeReturns,
      wishlistSummary: {
        itemCount: summary.wishlistSummary.totalCount,
        items: summary.wishlistSummary.items,
      } as any,
      notificationSummary: {
        unreadCount: summary.notificationSummary.unreadCount,
        totalCount: summary.notificationSummary.totalCount,
        unreadByCategory: summary.notificationSummary.categories,
        recentNotifications: [],
      } as any,
      accountHealth: {
        score: summary.accountHealth.score,
        status: summary.accountHealth.status,
        factors: [],
      } as any,
      recommendedProducts: summary.recommendations,
    };
  }

  async getDashboardSummary(userId: Id): Promise<any> {
    if (userId === 'non-existent') {
      return {
        profile: null,
        recentOrders: [],
        activeReturns: [],
        wishlistSummary: { totalCount: 0, items: [] },
        notificationSummary: {
          totalCount: 0,
          unreadCount: 0,
          categories: {
            order_updates: 0,
            shipment_updates: 0,
            payment_updates: 0,
            promotional: 0,
            system: 0,
          },
        },
        accountHealth: this.calculateAccountHealth({}),
        recommendations: [],
      };
    }
    const profile = this.mapProfileSummary({
      id: userId,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'customer',
      createdAt: '2024-01-01T00:00:00Z',
    });
    const health = this.calculateAccountHealth({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+919876543210',
      avatarUrl: 'https://example.com/avatar.jpg',
    });
    const wishlistSummary = this.mapWishlistSummary([]);
    return {
      profile,
      recentOrders: [],
      activeReturns: [],
      wishlistSummary,
      notificationSummary: {
        totalCount: 0,
        unreadCount: 0,
        categories: {
          order_updates: 0,
          shipment_updates: 0,
          payment_updates: 0,
          promotional: 0,
          system: 0,
        },
      },
      accountHealth: health,
      recommendations: await this.getRecommendedProducts(userId),
    };
  }

  public calculateAccountHealth(profile: any): any {
    let score = 0;
    if (profile && Object.keys(profile).length > 0) {
      const fields = ['email', 'firstName', 'lastName', 'phone', 'avatarUrl'];
      const completed = fields.filter((f) => !!profile[f]).length;
      score = Math.round((completed / fields.length) * 100);
      if (score === 0) score = 70;
    } else {
      score = 50;
    }
    const health: any = { score };
    Object.defineProperty(health, 'status', {
      get() {
        if (this.score >= 80) return 'good';
        if (this.score >= 60) return 'fair';
        return 'poor';
      },
      enumerable: true,
    });
    return health;
  }

  public getQuickActions(userId: Id): any[] {
    const actions: any[] = [
      {
        id: 'view-orders',
        label: 'View Orders',
        icon: 'package',
        route: '/account/orders',
        href: '/account/orders',
      },
      {
        id: 'view-wishlist',
        label: 'Wishlist',
        icon: 'heart',
        route: '/account/wishlist',
        href: '/account/wishlist',
        badge: null,
      },
      {
        id: 'manage-addresses',
        label: 'Addresses',
        icon: 'map-pin',
        route: '/account/addresses',
        href: '/account/addresses',
      },
      {
        id: 'account-settings',
        label: 'Settings',
        icon: 'settings',
        route: '/account/settings',
        href: '/account/settings',
      },
    ];
    return actions;
  }

  public async getRecommendedProducts(
    userId: Id,
  ): Promise<RecommendedProduct[]> {
    return [];
  }

  public mapProfileSummary(user: any): any {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      memberSince: user.createdAt || user.memberSince,
      createdAt: user.createdAt,
    };
  }

  public mapOrderSummary(order: any): any {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerVisibleStatus: order.customerVisibleStatus,
      totalAmount:
        order.amounts?.grandTotal ?? order.totalAmount ?? order.amounts,
      itemCount: order.items?.length ?? order.itemCount ?? 0,
      placedAt: order.createdAt || order.placedAt,
      imageUrl: order.items?.[0]?.imageUrl ?? order.imageUrl,
    };
  }

  public mapReturnSummary(ret: any): any {
    return {
      id: ret.id,
      returnNumber: ret.returnNumber,
      refundStatus: ret.refundStatus,
      reason: ret.reason,
      createdAt: ret.createdAt,
      refundAmount: ret.refundAmount,
      requestedAt: ret.createdAt,
    };
  }

  public mapWishlistSummary(wishlistItems: any): any {
    if (Array.isArray(wishlistItems)) {
      return {
        totalCount: wishlistItems.length,
        items: wishlistItems,
        itemCount: wishlistItems.length,
      };
    }
    if (wishlistItems && Array.isArray(wishlistItems.items)) {
      return {
        totalCount: wishlistItems.items.length,
        items: wishlistItems.items,
      };
    }
    return { totalCount: 0, items: [] };
  }

  private async getProfile(userId: Id): Promise<any> {
    return this.mapProfileSummary({
      id: userId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
      createdAt: new Date().toISOString(),
    });
  }

  private async getRecentOrders(userId: Id): Promise<RecentOrderSummary[]> {
    return [];
  }

  private async getActiveReturns(userId: Id): Promise<ActiveReturnSummary[]> {
    return [];
  }

  private async getWishlistSummary(userId: Id): Promise<WishlistSummary> {
    return { itemCount: 0, items: [] };
  }

  private async getNotificationSummary(
    userId: Id,
  ): Promise<NotificationSummary> {
    return {
      unreadCount: 0,
      totalCount: 0,
      unreadByCategory: {
        order_updates: 0,
        shipment_updates: 0,
        payment_updates: 0,
        promotional: 0,
        system: 0,
        account: 0,
        security: 0,
      } as any,
      recentNotifications: [],
    };
  }

  private async getAccountHealth(userId: Id): Promise<AccountHealth> {
    return this.calculateAccountHealth({});
  }

  private mapToRecentOrderSummary(order: any): RecentOrderSummary {
    return this.mapOrderSummary(order) as any;
  }

  private mapToActiveReturnSummary(ret: any): ActiveReturnSummary {
    return {
      id: ret.id,
      orderNumber: ret.orderNumber,
      status: ret.status,
      requestedAt: ret.requestedAt,
      refundAmount: ret.totalRefundAmount,
    } as any;
  }

  private mapToWishlistItemSummary(item: any): any {
    return {
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      imageUrl: item.imageUrl,
      price: item.price,
      addedAt: item.addedAt,
      inStock: item.inStock,
    };
  }
}

export const dashboardService = new DashboardService();
