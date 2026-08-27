/**
 * Shop Dashboard Page
 *
 * Main dashboard overview for shop owners
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md §2
 */

import { useEffect } from 'react';

import { IndianRupee, ShoppingCart, Clock, AlertTriangle } from 'lucide-react';

import { setDocumentMeta } from '@/lib/seo';

import { KPICard } from '../../shared/components/KPICard';
import { QuickActions } from '../../shared/components/QuickActions';
import { ActivityFeed } from '../../shared/components/ActivityFeed';
import { InventoryAlertsCard } from '../../shared/components/InventoryAlertsCard';
import { RevenueTrendChart } from '../../shared/components/RevenueTrendChart';
import { OrdersByStatusChart } from '../../shared/components/OrdersByStatusChart';
import {
  useRevenueSummary,
  useOrdersSummary,
  useInventoryAlerts,
  useRecentActivity,
  usePendingOrders,
} from '../hooks';

export default function DashboardPage() {
  useEffect(() => {
    setDocumentMeta({ title: 'Dashboard — নবME Shop' });
  }, []);

  const { data: revenue, isLoading: revenueLoading } = useRevenueSummary();
  const { data: orders, isLoading: ordersLoading } = useOrdersSummary();
  const { data: alerts, isLoading: alertsLoading } = useInventoryAlerts();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();
  const { data: pendingOrders, isLoading: pendingLoading } = usePendingOrders();

  // Quick actions configuration
  const quickActions = [
    {
      id: 'create-product',
      label: 'Create Product',
      icon: IndianRupee,
      permission: 'shop:product:create',
      shortcut: '⌘⇧P',
      action: () => (window.location.href = '/shop/products/create'),
    },
    {
      id: 'view-orders',
      label: 'View Orders',
      icon: ShoppingCart,
      permission: 'shop:order:read',
      shortcut: '⌘⇧O',
      action: () => (window.location.href = '/shop/orders'),
    },
    {
      id: 'view-finance',
      label: 'View Finance',
      icon: IndianRupee,
      permission: 'shop:finance:read',
      shortcut: '⌘⇧F',
      action: () => (window.location.href = '/shop/finance'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--text-primary)">
            Dashboard
          </h1>
          <p className="text-sm text-(--text-secondary)">
            Welcome back! Here's your business overview.
          </p>
        </div>
        <QuickActions actions={quickActions} variant="desktop" />
      </div>

      {/* KPI Cards - Today's Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Today's Revenue"
          value={`₹${revenue?.today.toLocaleString() || '0'}`}
          trend={{
            value: revenue?.trend.daily || 0,
            direction: (revenue?.trend.daily || 0) >= 0 ? 'up' : 'down',
          }}
          comparison="vs. yesterday"
          icon={IndianRupee}
          loading={revenueLoading}
          onClick={() => (window.location.href = '/shop/finance')}
        />
        <KPICard
          title="Today's Orders"
          value={orders?.today || 0}
          trend={{
            value: orders?.trend.daily || 0,
            direction: (orders?.trend.daily || 0) >= 0 ? 'up' : 'down',
          }}
          comparison="vs. yesterday"
          icon={ShoppingCart}
          loading={ordersLoading}
          onClick={() => (window.location.href = '/shop/orders')}
        />
        <KPICard
          title="Pending Orders"
          value={orders?.pending || 0}
          icon={Clock}
          loading={ordersLoading}
          onClick={() => (window.location.href = '/shop/orders')}
        />
        <KPICard
          title="Low Stock Alerts"
          value={alerts?.filter((a) => a.severity === 'critical').length || 0}
          icon={AlertTriangle}
          loading={alertsLoading}
          onClick={() => (window.location.href = '/shop/inventory')}
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Trend Chart */}
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold text-(--text-primary) mb-4">
            Revenue Trend
          </h3>
          <RevenueTrendChart
            data={{
              data: revenue?.chartData || [],
              period: '7d',
            }}
            loading={revenueLoading}
            height={256}
          />
        </div>

        {/* Orders by Status Chart */}
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold text-(--text-primary) mb-4">
            Orders by Status
          </h3>
          <OrdersByStatusChart
            data={{
              pending: orders?.byStatus?.pending || 0,
              processing: orders?.byStatus?.processing || 0,
              shipped: orders?.byStatus?.shipped || 0,
              delivered: orders?.byStatus?.delivered || 0,
              cancelled: orders?.byStatus?.cancelled || 0,
            }}
            loading={ordersLoading}
            size={256}
          />
        </div>
      </div>

      {/* Pending Orders and Inventory Alerts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pending Orders */}
        <div className="rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-(--text-primary)">
              Pending Orders
            </h3>
            <button
              onClick={() => (window.location.href = '/shop/orders')}
              className="text-sm text-(--color-brand-600) hover:text-(--color-brand-700)"
            >
              View all
            </button>
          </div>
          {pendingLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-(--color-neutral-100) rounded animate-pulse"
                />
              ))}
            </div>
          ) : pendingOrders && pendingOrders.length > 0 ? (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-(--color-neutral-50) cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/shop/orders/${order.id}`)
                  }
                >
                  <div>
                    <p className="text-sm font-medium text-(--text-primary)">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-(--text-secondary)">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-(--text-primary)">
                      ₹{order.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-(--text-secondary)">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-(--text-secondary)">
                No pending orders
              </p>
            </div>
          )}
        </div>

        {/* Inventory Alerts */}
        <InventoryAlertsCard
          alerts={alerts || []}
          loading={alertsLoading}
          maxVisible={5}
        />
      </div>

      {/* Recent Activity */}
      <div>
        <ActivityFeed
          activities={activity || []}
          loading={activityLoading}
          maxItems={10}
        />
      </div>

      {/* Mobile Quick Actions */}
      <QuickActions actions={quickActions} variant="mobile" />
    </div>
  );
}
