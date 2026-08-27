/**
 * Shop Reports Page
 *
 * Reports generation and export page for shop owners
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useEffect, useState } from 'react';

import { FileText, Download } from 'lucide-react';

import { setDocumentMeta } from '@/lib/seo';
import { Card, Button, Input } from '@nabome/ui';

import {
  useSalesReport,
  useInventoryReport,
  useReturnsReport,
  usePaymentReport,
  useShippingReport,
  useTaxReport,
  useExportReport,
} from '../hooks';

export default function ReportsPage() {
  useEffect(() => {
    setDocumentMeta({ title: 'Reports — নবME Shop' });
  }, []);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: salesReport } = useSalesReport({ startDate, endDate });
  const { data: inventoryReport } = useInventoryReport();
  const { data: returnsReport } = useReturnsReport({ startDate, endDate });
  const { data: paymentReport } = usePaymentReport({ startDate, endDate });
  const { data: shippingReport } = useShippingReport({ startDate, endDate });
  const { data: taxReport } = useTaxReport({ startDate, endDate });
  const exportReport = useExportReport();

  const handleExport = async (reportType: string, format: 'csv' | 'pdf') => {
    const blob = await exportReport.mutateAsync({
      reportType,
      format,
      params: { startDate, endDate },
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report.${format}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-(--text-primary)">
          Reports
        </h1>
        <p className="text-sm text-(--text-secondary)">
          Generate and export business reports
        </p>
      </div>

      {/* Date Range Filter */}
      <Card padding="lg">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-(--text-secondary) mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-(--text-secondary) mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button variant="primary">Generate Reports</Button>
        </div>
      </Card>

      {/* Report Types */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          padding="lg"
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <FileText className="h-8 w-8 text-(--color-brand-600)" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('sales', 'csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <h3 className="font-semibold text-(--text-primary) mb-2">
            Sales Report
          </h3>
          <p className="text-sm text-(--text-secondary) mb-4">
            Revenue, orders, and sales performance metrics
          </p>
          {salesReport && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-(--text-secondary)">Total Revenue</span>
                <span className="font-medium text-(--text-primary)">
                  ₹{salesReport.totalRevenue?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-(--text-secondary)">Total Orders</span>
                <span className="font-medium text-(--text-primary)">
                  {salesReport.totalOrders || 0}
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card
          padding="lg"
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <FileText className="h-8 w-8 text-(--color-brand-600)" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('inventory', 'csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <h3 className="font-semibold text-(--text-primary) mb-2">
            Inventory Report
          </h3>
          <p className="text-sm text-(--text-secondary) mb-4">
            Stock levels, low stock alerts, and inventory valuation
          </p>
          {inventoryReport && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-(--text-secondary)">Total Products</span>
                <span className="font-medium text-(--text-primary)">
                  {inventoryReport.totalProducts || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-(--text-secondary)">Low Stock</span>
                <span className="font-medium text-(--color-warning-600)">
                  {inventoryReport.lowStock || 0}
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card
          padding="lg"
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <FileText className="h-8 w-8 text-(--color-brand-600)" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('returns', 'csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <h3 className="font-semibold text-(--text-primary) mb-2">
            Returns Report
          </h3>
          <p className="text-sm text-(--text-secondary) mb-4">
            Return requests, refunds, and return analytics
          </p>
          {returnsReport && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-(--text-secondary)">Total Returns</span>
                <span className="font-medium text-(--text-primary)">
                  {returnsReport.totalReturns || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-(--text-secondary)">Refund Amount</span>
                <span className="font-medium text-(--text-primary)">
                  ₹{returnsReport.refundAmount?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card
          padding="lg"
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <FileText className="h-8 w-8 text-(--color-brand-600)" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('payments', 'csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <h3 className="font-semibold text-(--text-primary) mb-2">
            Payment Report
          </h3>
          <p className="text-sm text-(--text-secondary) mb-4">
            Transactions, settlements, and payment analytics
          </p>
          {paymentReport && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-(--text-secondary)">Total Collected</span>
                <span className="font-medium text-(--text-primary)">
                  ₹{paymentReport.totalCollected?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-(--text-secondary)">Pending</span>
                <span className="font-medium text-(--color-warning-600)">
                  ₹{paymentReport.pending?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card
          padding="lg"
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <FileText className="h-8 w-8 text-(--color-brand-600)" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('shipping', 'csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <h3 className="font-semibold text-(--text-primary) mb-2">
            Shipping Report
          </h3>
          <p className="text-sm text-(--text-secondary) mb-4">
            Shipments, delivery times, and carrier performance
          </p>
          {shippingReport && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-(--text-secondary)">Total Shipments</span>
                <span className="font-medium text-(--text-primary)">
                  {shippingReport.totalShipments || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-(--text-secondary)">
                  Avg Delivery Time
                </span>
                <span className="font-medium text-(--text-primary)">
                  {shippingReport.avgDeliveryTime || '0'} days
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card
          padding="lg"
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <FileText className="h-8 w-8 text-(--color-brand-600)" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('tax', 'csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <h3 className="font-semibold text-(--text-primary) mb-2">
            Tax Report
          </h3>
          <p className="text-sm text-(--text-secondary) mb-4">
            GST collected, tax liability, and tax compliance
          </p>
          {taxReport && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-(--text-secondary)">GST Collected</span>
                <span className="font-medium text-(--text-primary)">
                  ₹{taxReport.gstCollected?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-(--text-secondary)">Tax Liability</span>
                <span className="font-medium text-(--color-warning-600)">
                  ₹{taxReport.taxLiability?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
