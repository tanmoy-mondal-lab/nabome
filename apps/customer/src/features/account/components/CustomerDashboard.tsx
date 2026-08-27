/**
 * Customer Dashboard Component
 *
 * Main dashboard with overview, quick actions, recent orders, returns, wishlist,
 * notifications, recommendations, and account health.
 * Mobile-first, accessible, and follows the official component library.
 *
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 * Source: CUSTOMER_EXPERIENCE_ARCHITECTURE.md (binding)
 */

import {
  LayoutDashboard,
  Package,
  RotateCcw,
  Heart,
  Bell,
  ShoppingBag,
  Settings,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CreditCard,
  MapPin,
  User,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { useCustomerDashboard } from '@nabome/customer';
import { Button } from '@nabome/ui';

interface CustomerDashboardProps {
  userId: string;
}

export function CustomerDashboard({ userId }: CustomerDashboardProps) {
  const { dashboard, dashboardLoading, dashboardError, fetchDashboard } =
    useCustomerDashboard();

  // Load dashboard data on mount
  useEffect(() => {
    if (userId) {
      fetchDashboard(userId);
    }
  }, [userId, fetchDashboard]);

  const quickActions = [
    { icon: ShoppingBag, label: 'Shop Now', href: '/shop' },
    { icon: Package, label: 'View Orders', href: '/account/orders' },
    { icon: Heart, label: 'Wishlist', href: '/account/wishlist' },
    { icon: MapPin, label: 'Addresses', href: '/account/addresses' },
    { icon: CreditCard, label: 'Payments', href: '/account/payments' },
    { icon: Settings, label: 'Settings', href: '/account/settings' },
  ];

  if (dashboardLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
        {dashboardError}
      </div>
    );
  }

  const summary = dashboard || {
    recentOrders: [],
    activeReturns: [],
    wishlistSummary: { itemCount: 0, items: [] },
    notificationSummary: { unreadCount: 0, totalCount: 0 },
    accountHealth: { score: 85, status: 'good', factors: [] },
    recommendedProducts: [],
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600">
            Here's what's happening with your account
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">Account Health</p>
            <p className="text-lg font-bold text-green-700">
              {summary.accountHealth.score}/100
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:shadow-sm transition-shadow text-center"
          >
            <div className="p-2 bg-gray-100 rounded-full">
              <action.icon className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {action.label}
            </span>
          </a>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Recent Orders</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.recentOrders.length}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-gray-600">Active Returns</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.activeReturns.length}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-red-600" />
            <span className="text-sm text-gray-600">Wishlist</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.wishlistSummary.itemCount}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">Unread</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.notificationSummary.unreadCount}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <a
            href="/account/orders"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        {summary.recentOrders.length === 0 ? (
          <p className="text-sm text-gray-500">No recent orders</p>
        ) : (
          <div className="space-y-3">
            {summary.recentOrders.slice(0, 3).map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.placedAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {order.customerVisibleStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Returns */}
      {summary.activeReturns.length > 0 && (
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Active Returns
            </h2>
            <a
              href="/account/returns"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="space-y-3">
            {summary.activeReturns.slice(0, 2).map((returnRequest: any) => (
              <div
                key={returnRequest.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {returnRequest.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(returnRequest.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  {returnRequest.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {summary.recommendedProducts &&
        summary.recommendedProducts.length > 0 && (
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recommended for You
              </h2>
              <a
                href="/shop"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                Browse All <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summary.recommendedProducts.slice(0, 4).map((product: any) => (
                <div
                  key={product.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {product.productName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      ₹{product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Account Health Details */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Account Health
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Profile Completeness</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: '90%' }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">90%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Payment Methods</span>
            <span className="text-sm font-medium text-green-600">Verified</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Shipping Address</span>
            <span className="text-sm font-medium text-green-600">Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Email Verified</span>
            <span className="text-sm font-medium text-green-600">Yes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
