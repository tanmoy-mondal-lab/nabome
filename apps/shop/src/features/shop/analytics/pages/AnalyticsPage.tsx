/**
 * Shop Analytics Page
 *
 * Analytics dashboard for shop owners
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useEffect, useState } from 'react';

import {
  TrendingUp,
  Package,
  Truck,
  CreditCard,
  RotateCcw,
  Users,
} from 'lucide-react';

import { setDocumentMeta } from '@/lib/seo';
import { Card, Button } from '@nabome/ui';

import {
  useSalesAnalytics,
  useProductAnalytics,
  useInventoryAnalytics,
  usePaymentAnalytics,
  useShippingAnalytics,
  useReturnsAnalytics,
  useCustomerAnalytics,
} from '../hooks';

export default function AnalyticsPage() {
  useEffect(() => {
    setDocumentMeta({ title: 'Analytics — নবME Shop' });
  }, []);

  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: salesAnalytics } = useSalesAnalytics(period);
  const { data: productAnalytics } = useProductAnalytics();
  const { data: inventoryAnalytics } = useInventoryAnalytics();
  const { data: paymentAnalytics } = usePaymentAnalytics();
  const { data: shippingAnalytics } = useShippingAnalytics();
  const { data: returnsAnalytics } = useReturnsAnalytics();
  const { data: customerAnalytics } = useCustomerAnalytics();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--text-primary)">
            Analytics
          </h1>
          <p className="text-sm text-(--text-secondary)">
            Business intelligence and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === '7d' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={period === '30d' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={period === '90d' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'sales'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <TrendingUp className="h-4 w-4 inline mr-2" />
          Sales
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Package className="h-4 w-4 inline mr-2" />
          Products
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Package className="h-4 w-4 inline mr-2" />
          Inventory
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <CreditCard className="h-4 w-4 inline mr-2" />
          Payments
        </button>
        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'shipping'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Truck className="h-4 w-4 inline mr-2" />
          Shipping
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'returns'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <RotateCcw className="h-4 w-4 inline mr-2" />
          Returns
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'customers'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Customers
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'sales' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
              Revenue Trend
            </h3>
            <div className="h-64 flex items-center justify-center bg-(--color-neutral-50) rounded-lg">
              <p className="text-sm text-(--text-secondary)">
                Revenue chart coming soon
              </p>
            </div>
          </Card>
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
              Sales by Category
            </h3>
            <div className="h-64 flex items-center justify-center bg-(--color-neutral-50) rounded-lg">
              <p className="text-sm text-(--text-secondary)">
                Category chart coming soon
              </p>
            </div>
          </Card>
          <Card padding="lg" className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
              Sales Summary
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-(--text-secondary)">Total Revenue</p>
                <p className="text-2xl font-bold text-(--text-primary)">
                  ₹{salesAnalytics?.totalRevenue?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-(--text-secondary)">Total Orders</p>
                <p className="text-2xl font-bold text-(--text-primary)">
                  {salesAnalytics?.totalOrders || 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-(--text-secondary)">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold text-(--text-primary)">
                  ₹{salesAnalytics?.avgOrderValue?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-(--text-secondary)">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold text-(--text-primary)">
                  {salesAnalytics?.conversionRate || '0'}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'products' && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
            Top Performing Products
          </h3>
          <div className="space-y-3">
            {productAnalytics?.topProducts?.map((product: any) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium text-(--text-primary)">
                    {product.name}
                  </p>
                  <p className="text-sm text-(--text-secondary)">
                    {product.sku}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-(--text-primary)">
                    ₹{product.revenue?.toLocaleString()}
                  </p>
                  <p className="text-sm text-(--text-secondary)">
                    {product.sold} sold
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-(--text-secondary)">
                No product data available
              </p>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'inventory' && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
            Inventory Analytics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">Total Products</p>
              <p className="text-2xl font-bold text-(--text-primary)">
                {inventoryAnalytics?.totalProducts || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">Low Stock Items</p>
              <p className="text-2xl font-bold text-(--color-warning-600)">
                {inventoryAnalytics?.lowStock || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">Out of Stock</p>
              <p className="text-2xl font-bold text-(--color-error-600)">
                {inventoryAnalytics?.outOfStock || 0}
              </p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
            Payment Analytics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">Total Collected</p>
              <p className="text-2xl font-bold text-(--text-primary)">
                ₹{paymentAnalytics?.totalCollected?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">
                Pending Settlement
              </p>
              <p className="text-2xl font-bold text-(--color-warning-600)">
                ₹{paymentAnalytics?.pending?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">
                Refunds Processed
              </p>
              <p className="text-2xl font-bold text-(--text-primary)">
                ₹{paymentAnalytics?.refunds?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'shipping' && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
            Shipping Analytics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">Total Shipments</p>
              <p className="text-2xl font-bold text-(--text-primary)">
                {shippingAnalytics?.totalShipments || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">In Transit</p>
              <p className="text-2xl font-bold text-(--color-brand-600)">
                {shippingAnalytics?.inTransit || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">Delivered</p>
              <p className="text-2xl font-bold text-(--color-success-600)">
                {shippingAnalytics?.delivered || 0}
              </p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'returns' && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
            Returns Analytics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">Total Returns</p>
              <p className="text-2xl font-bold text-(--text-primary)">
                {returnsAnalytics?.totalReturns || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">
                Pending Inspection
              </p>
              <p className="text-2xl font-bold text-(--color-warning-600)">
                {returnsAnalytics?.pending || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">Refund Rate</p>
              <p className="text-2xl font-bold text-(--text-primary)">
                {returnsAnalytics?.refundRate || '0'}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'customers' && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
            Customer Analytics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">Total Customers</p>
              <p className="text-2xl font-bold text-(--text-primary)">
                {customerAnalytics?.totalCustomers || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">New This Period</p>
              <p className="text-2xl font-bold text-(--color-success-600)">
                {customerAnalytics?.newCustomers || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-(--text-secondary)">
                Repeat Customers
              </p>
              <p className="text-2xl font-bold text-(--text-primary)">
                {customerAnalytics?.repeatCustomers || 0}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
