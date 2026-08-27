/**
 * Admin Inventory Page
 *
 * Platform-wide inventory management for administrators.
 * Displays global inventory metrics, warehouse management, and system-wide alerts.
 */

import { useState } from 'react';
import { useInventorySummary, useWarehouses } from '../hooks';
import { InventorySummaryCard } from '../components/InventorySummaryCard';
import { WarehouseTable } from '../components/WarehouseTable';
import { SystemAlertsCard } from '../components/SystemAlertsCard';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Warehouse,
  Settings,
} from 'lucide-react';

export function InventoryPage() {
  const { data: summary, isLoading: summaryLoading } = useInventorySummary();
  const { data: warehouses, isLoading: warehousesLoading } = useWarehouses();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Platform Inventory
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage platform-wide inventory across all shops
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-md flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Manage Warehouses
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
            className={`px-4 py-2 border-b-2 ${activeTab === 'warehouses' ? 'border-primary' : 'border-transparent'}`}
            onClick={() => setActiveTab('warehouses')}
          >
            Warehouses
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${activeTab === 'alerts' ? 'border-primary' : 'border-transparent'}`}
            onClick={() => setActiveTab('alerts')}
          >
            System Alerts
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${activeTab === 'movements' ? 'border-primary' : 'border-transparent'}`}
            onClick={() => setActiveTab('movements')}
          >
            Movements
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Platform Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InventorySummaryCard
              title="Total Variants"
              value={summary?.totalVariants || 0}
              icon={<Package className="h-4 w-4" />}
              loading={summaryLoading}
            />
            <InventorySummaryCard
              title="Total Warehouses"
              value={warehouses?.length || 0}
              icon={<Warehouse className="h-4 w-4" />}
              loading={warehousesLoading}
            />
            <InventorySummaryCard
              title="Low Stock Items"
              value={summary?.lowStockCount || 0}
              icon={<AlertTriangle className="h-4 w-4" />}
              loading={summaryLoading}
              variant="warning"
            />
            <InventorySummaryCard
              title="Total Stock Value"
              value={summary?.totalStock || 0}
              icon={<TrendingUp className="h-4 w-4" />}
              loading={summaryLoading}
            />
          </div>

          {/* System Alerts */}
          <SystemAlertsCard />
        </div>
      )}

      {activeTab === 'warehouses' && (
        <WarehouseTable warehouses={warehouses} loading={warehousesLoading} />
      )}
      {activeTab === 'alerts' && <SystemAlertsCard />}
      {activeTab === 'movements' && (
        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">
            Platform-wide movement history coming soon
          </p>
        </div>
      )}
    </div>
  );
}
