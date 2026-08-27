/**
 * Platform Overview Dashboard
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md, ADMIN_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useEffect } from 'react';

import { Grid } from '@nabome/ui';
import { Stack } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Badge } from '@nabome/ui';
import { Button } from '@nabome/ui';
import {
  DollarSign,
  ShoppingCart,
  Store,
  Users,
  Package,
  CreditCard,
  RotateCcw,
  Activity,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

import { KPICard } from '../components/KPICard';
import { ActivityFeed } from '../components/ActivityFeed';
import { PendingTasks } from '../components/PendingTasks';
import { QuickActions } from '../components/QuickActions';
import {
  usePlatformKPIs,
  usePlatformActivity,
  usePendingTasks,
} from '../../hooks/use-platform-kpis';
import { setDocumentMeta } from '../../../../lib/seo';

export default function DashboardPage() {
  const { data: kpisData, isLoading: kpisLoading } = usePlatformKPIs('7d');
  const { data: activities, isLoading: activitiesLoading } =
    usePlatformActivity();
  const { data: tasks, isLoading: tasksLoading } = usePendingTasks();

  useEffect(() => {
    setDocumentMeta({ title: 'Dashboard — নবME Admin' });
  }, []);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(parseFloat(amount));
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Platform Overview</Heading>
          <Text size="sm" className="text-gray-600">
            Real-time platform metrics and governance status
          </Text>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <Grid cols={1} colsSm={2} colsMd={4} gap="md">
        <KPICard
          title="Total Revenue"
          value={
            kpisData?.revenue.total
              ? formatCurrency(kpisData.revenue.total.amount)
              : '₹0'
          }
          icon={DollarSign}
          trend={
            kpisData?.revenue.growth
              ? { value: kpisData.revenue.growth, label: 'vs last period' }
              : undefined
          }
          isLoading={kpisLoading}
        />
        <KPICard
          title="Total Orders"
          value={
            kpisData?.orders.total ? formatNumber(kpisData.orders.total) : '0'
          }
          icon={ShoppingCart}
          trend={
            kpisData?.orders.growth
              ? { value: kpisData.orders.growth, label: 'vs last period' }
              : undefined
          }
          isLoading={kpisLoading}
        />
        <KPICard
          title="Active Shops"
          value={
            kpisData?.shops.active ? formatNumber(kpisData.shops.active) : '0'
          }
          icon={Store}
          isLoading={kpisLoading}
        />
        <KPICard
          title="Total Customers"
          value={
            kpisData?.customers.total
              ? formatNumber(kpisData.customers.total)
              : '0'
          }
          icon={Users}
          trend={
            kpisData?.customers.new
              ? { value: kpisData.customers.new, label: 'new this period' }
              : undefined
          }
          isLoading={kpisLoading}
        />
        <KPICard
          title="Published Products"
          value={
            kpisData?.products.published
              ? formatNumber(kpisData.products.published)
              : '0'
          }
          icon={Package}
          isLoading={kpisLoading}
        />
        <KPICard
          title="Payment Success Rate"
          value={
            kpisData?.payments.successRate
              ? `${kpisData.payments.successRate}%`
              : '0%'
          }
          icon={CreditCard}
          isLoading={kpisLoading}
        />
        <KPICard
          title="Return Rate"
          value={kpisData?.returns.rate ? `${kpisData.returns.rate}%` : '0%'}
          icon={RotateCcw}
          isLoading={kpisLoading}
        />
        <KPICard
          title="System Uptime"
          value={kpisData?.system.uptime ? `${kpisData.system.uptime}%` : '0%'}
          icon={Activity}
          isLoading={kpisLoading}
        />
      </Grid>

      {/* Pending Moderation & Alerts */}
      <Grid cols={1} colsMd={2} gap="md">
        <Card padding="lg" elevated>
          <Stack gap="lg">
            <div className="flex items-center justify-between">
              <Heading level="h3">Pending Moderation</Heading>
              <Badge variant="warning">
                {kpisData?.products.pendingModeration || 0}
              </Badge>
            </div>
            <Text size="sm" className="text-gray-600">
              Products awaiting approval
            </Text>
            <Button
              variant="primary"
              size="sm"
              className="w-fit"
              onClick={() =>
                (window.location.href = '/admin/products?status=pending')
              }
            >
              Review Queue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Stack>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="lg">
            <div className="flex items-center justify-between">
              <Heading level="h3">System Health</Heading>
              <Badge
                variant={
                  kpisData?.system.uptime && kpisData.system.uptime > 99
                    ? 'success'
                    : 'warning'
                }
              >
                {kpisData?.system.uptime && kpisData.system.uptime > 99
                  ? 'Healthy'
                  : 'Degraded'}
              </Badge>
            </div>
            <Stack gap="sm">
              <div className="flex items-center justify-between text-sm">
                <Text className="text-gray-600">API Response Time</Text>
                <Text weight="medium">
                  {kpisData?.system.avgResponseTime || 0}ms
                </Text>
              </div>
              <div className="flex items-center justify-between text-sm">
                <Text className="text-gray-600">Error Rate</Text>
                <Text weight="medium">{kpisData?.system.errorRate || 0}%</Text>
              </div>
            </Stack>
          </Stack>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <QuickActions
        actions={[
          {
            id: 'approve-shops',
            label: 'Approve Shops',
            icon: Store,
            permission: 'governance:shop:approve',
            shortcut: '⌘⇧S',
            url: '/admin/shops?status=pending',
          },
          {
            id: 'moderate-products',
            label: 'Moderate Products',
            icon: Package,
            permission: 'governance:product:moderate',
            shortcut: '⌘⇧P',
            url: '/admin/products?status=flagged',
          },
          {
            id: 'review-exceptions',
            label: 'Review Exceptions',
            icon: ShoppingCart,
            permission: 'governance:order:intervene',
            shortcut: '⌘⇧O',
            url: '/admin/orders?status=exception',
          },
          {
            id: 'manage-users',
            label: 'Manage Users',
            icon: Users,
            permission: 'governance:customer:manage',
            shortcut: '⌘⇧C',
            url: '/admin/customers',
          },
        ]}
      />

      {/* Recent Activity */}
      <ActivityFeed
        activities={activities || []}
        loading={activitiesLoading}
        maxItems={10}
      />

      {/* Pending Tasks */}
      <PendingTasks tasks={tasks || []} loading={tasksLoading} />
    </div>
  );
}
