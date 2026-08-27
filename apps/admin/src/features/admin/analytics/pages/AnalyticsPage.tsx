/**
 * Analytics Page
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 * Features: Commerce, Operational, Security, Performance, Customer, Shop Analytics
 */

import { useState } from 'react';

import { Grid } from '@nabome/ui';
import { Stack } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Button } from '@nabome/ui';
import {
  TrendingUp,
  Activity,
  Shield,
  Zap,
  Users,
  Store,
  Calendar,
  Download,
  Loader2,
} from 'lucide-react';

import {
  useCommerceAnalytics,
  useOperationalAnalytics,
  useSecurityAnalytics,
  usePerformanceAnalytics,
  useCustomerAnalytics,
  useShopAnalytics,
} from '../hooks/useAnalytics';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<
    | 'commerce'
    | 'operational'
    | 'security'
    | 'performance'
    | 'customer'
    | 'shop'
  >('commerce');

  const { data: commerceData, isLoading: commerceLoading } =
    useCommerceAnalytics({ period: 'last-7-days' });
  const { data: operationalData, isLoading: operationalLoading } =
    useOperationalAnalytics({ period: 'last-7-days' });
  const { data: securityData, isLoading: securityLoading } =
    useSecurityAnalytics({ period: 'last-7-days' });
  const { data: performanceData, isLoading: performanceLoading } =
    usePerformanceAnalytics({ period: 'last-7-days' });
  const { data: customerData, isLoading: customerLoading } =
    useCustomerAnalytics({ segment: 'all' });
  const { data: shopData, isLoading: shopLoading } = useShopAnalytics({
    status: 'active',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Analytics</Heading>
          <Text size="sm" className="text-gray-600">
            Platform analytics and performance metrics
          </Text>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 7 Days
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('commerce')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'commerce'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Commerce
          </button>
          <button
            onClick={() => setActiveTab('operational')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'operational'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Operational
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'performance'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'customer'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'shop'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Shop
          </button>
        </div>
      </div>

      {/* Commerce Tab */}
      {activeTab === 'commerce' && (
        <div className="space-y-6">
          {commerceLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : commerceData ? (
            <Grid cols={1} colsMd={4} gap="md">
              <Card padding="lg" elevated>
                <Stack gap="sm">
                  <TrendingUp className="h-5 w-5 text-brand-500" />
                  <Text size="sm" className="text-gray-600">
                    Total Revenue
                  </Text>
                  <Text size="lg" weight="medium">
                    {commerceData.totalRevenue || '—'}
                  </Text>
                  <Text
                    size="xs"
                    className={
                      commerceData.revenueGrowth >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {commerceData.revenueGrowth >= 0 ? '+' : ''}
                    {commerceData.revenueGrowth}% vs last period
                  </Text>
                </Stack>
              </Card>
              <Card padding="lg" elevated>
                <Stack gap="sm">
                  <Activity className="h-5 w-5 text-brand-500" />
                  <Text size="sm" className="text-gray-600">
                    Orders
                  </Text>
                  <Text size="lg" weight="medium">
                    {commerceData.orders || '—'}
                  </Text>
                  <Text
                    size="xs"
                    className={
                      commerceData.ordersGrowth >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {commerceData.ordersGrowth >= 0 ? '+' : ''}
                    {commerceData.ordersGrowth}% vs last period
                  </Text>
                </Stack>
              </Card>
              <Card padding="lg" elevated>
                <Stack gap="sm">
                  <Users className="h-5 w-5 text-brand-500" />
                  <Text size="sm" className="text-gray-600">
                    Active Customers
                  </Text>
                  <Text size="lg" weight="medium">
                    {commerceData.activeCustomers || '—'}
                  </Text>
                  <Text
                    size="xs"
                    className={
                      commerceData.customersGrowth >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {commerceData.customersGrowth >= 0 ? '+' : ''}
                    {commerceData.customersGrowth}% vs last period
                  </Text>
                </Stack>
              </Card>
              <Card padding="lg" elevated>
                <Stack gap="sm">
                  <Store className="h-5 w-5 text-brand-500" />
                  <Text size="sm" className="text-gray-600">
                    Active Shops
                  </Text>
                  <Text size="lg" weight="medium">
                    {commerceData.activeShops || '—'}
                  </Text>
                  <Text
                    size="xs"
                    className={
                      commerceData.shopsGrowth >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {commerceData.shopsGrowth >= 0 ? '+' : ''}
                    {commerceData.shopsGrowth}% vs last period
                  </Text>
                </Stack>
              </Card>
            </Grid>
          ) : (
            <Card padding="lg" elevated>
              <Text size="sm" className="text-gray-500">
                No commerce analytics data available
              </Text>
            </Card>
          )}
        </div>
      )}

      {/* Operational Tab */}
      {activeTab === 'operational' && (
        <Card padding="lg" elevated>
          {operationalLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : operationalData ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="h-5 w-5 text-brand-500" />
                <Heading level="h3">Operational Analytics</Heading>
              </div>
              <Text size="sm" className="text-gray-500">
                Operational metrics: {JSON.stringify(operationalData)}
              </Text>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="h-5 w-5 text-brand-500" />
              <Heading level="h3">Operational Analytics</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card padding="lg" elevated>
          {securityLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : securityData ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-5 w-5 text-brand-500" />
                <Heading level="h3">Security Analytics</Heading>
              </div>
              <Text size="sm" className="text-gray-500">
                Security metrics: {JSON.stringify(securityData)}
              </Text>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-5 w-5 text-brand-500" />
              <Heading level="h3">Security Analytics</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <Card padding="lg" elevated>
          {performanceLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : performanceData ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="h-5 w-5 text-brand-500" />
                <Heading level="h3">Performance Analytics</Heading>
              </div>
              <Text size="sm" className="text-gray-500">
                Performance metrics: {JSON.stringify(performanceData)}
              </Text>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="h-5 w-5 text-brand-500" />
              <Heading level="h3">Performance Analytics</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Customer Tab */}
      {activeTab === 'customer' && (
        <Card padding="lg" elevated>
          {customerLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : customerData ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-5 w-5 text-brand-500" />
                <Heading level="h3">Customer Analytics</Heading>
              </div>
              <Text size="sm" className="text-gray-500">
                Customer metrics: {JSON.stringify(customerData)}
              </Text>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-5 w-5 text-brand-500" />
              <Heading level="h3">Customer Analytics</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Shop Tab */}
      {activeTab === 'shop' && (
        <Card padding="lg" elevated>
          {shopLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : shopData ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Store className="h-5 w-5 text-brand-500" />
                <Heading level="h3">Shop Analytics</Heading>
              </div>
              <Text size="sm" className="text-gray-500">
                Shop metrics: {JSON.stringify(shopData)}
              </Text>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <Store className="h-5 w-5 text-brand-500" />
              <Heading level="h3">Shop Analytics</Heading>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
