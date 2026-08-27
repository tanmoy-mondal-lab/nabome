/**
 * Shop Owner Inventory Page
 *
 * Main inventory management page for shop owners.
 * Displays inventory summary, low stock alerts, and provides access to inventory operations.
 */

import { useState } from 'react';
import {
  useInventorySummary,
  useLowStockAlerts,
  useInventoryItems,
} from '../hooks';
import { InventorySummaryCard } from '../components/InventorySummaryCard';
import { LowStockAlertsCard } from '../components/LowStockAlertsCard';
import { InventoryTable } from '../components/InventoryTable';
import { StockMovementTable } from '../components/StockMovementTable';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Warehouse,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function InventoryPage() {
  const { data: summary, isLoading: summaryLoading } = useInventorySummary();
  const { data: alerts, isLoading: alertsLoading } = useLowStockAlerts();
  const [activeTab, setActiveTab] = useState('overview');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: inventoryData, isLoading: inventoryLoading } =
    useInventoryItems(page, limit);
  const items = inventoryData?.items || [];
  const total = inventoryData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your product inventory, stock levels, and warehouse
            operations
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-md flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Warehouses
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2">
            <Package className="h-4 w-4" />
            Add Stock
          </button>
        </div>
      </div>

      <div className="border-b">
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 border-b-2 ${activeTab === 'overview' ? 'border-primary' : 'border-transparent'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${activeTab === 'products' ? 'border-primary' : 'border-transparent'}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${activeTab === 'movements' ? 'border-primary' : 'border-transparent'}`}
            onClick={() => setActiveTab('movements')}
          >
            Movements
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${activeTab === 'warehouses' ? 'border-primary' : 'border-transparent'}`}
            onClick={() => setActiveTab('warehouses')}
          >
            Warehouses
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InventorySummaryCard
              title="Total Products"
              value={summary?.totalVariants || 0}
              icon={<Package className="h-4 w-4" />}
              loading={summaryLoading}
            />
            <InventorySummaryCard
              title="Low Stock Items"
              value={summary?.lowStockCount || 0}
              icon={<AlertTriangle className="h-4 w-4" />}
              loading={summaryLoading}
              variant="warning"
            />
            <InventorySummaryCard
              title="Out of Stock"
              value={summary?.outOfStockCount || 0}
              icon={<AlertTriangle className="h-4 w-4" />}
              loading={summaryLoading}
              variant="danger"
            />
            <InventorySummaryCard
              title="Total Stock"
              value={summary?.totalStock || 0}
              icon={<TrendingUp className="h-4 w-4" />}
              loading={summaryLoading}
            />
          </div>

          {/* Low Stock Alerts */}
          <LowStockAlertsCard alerts={alerts} loading={alertsLoading} />
        </div>
      )}

      {activeTab === 'products' && (
        <>
          <InventoryTable items={items} loading={inventoryLoading} />
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to{' '}
                {Math.min(page * limit, total)} of {total} items
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {activeTab === 'movements' && <StockMovementTable />}
      {activeTab === 'warehouses' && (
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">
            Warehouse management coming soon
          </p>
        </div>
      )}
    </div>
  );
}
