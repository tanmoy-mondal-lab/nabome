/**
 * Inventory Alerts Card Component
 *
 * Displays low stock and out of stock alerts
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md §2.2.5
 */

import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { Card, Badge } from '@nabome/ui';
import { cn } from '@nabome/utils';
import { AlertTriangle, Package, ArrowRight } from 'lucide-react';

import type { InventoryAlert } from '../types';

export interface InventoryAlertsCardProps extends HTMLAttributes<HTMLDivElement> {
  alerts: InventoryAlert[];
  loading?: boolean;
  maxVisible?: number;
}

export const InventoryAlertsCard = forwardRef<
  HTMLDivElement,
  InventoryAlertsCardProps
>(({ alerts, loading = false, maxVisible = 5, className, ...props }, ref) => {
  const displayAlerts = alerts.slice(0, maxVisible);
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const lowCount = alerts.filter((a) => a.severity === 'low').length;

  if (loading) {
    return (
      <Card ref={ref} padding="lg" className={cn(className)} {...props}>
        <div className="space-y-3">
          <div className="h-5 bg-(--color-neutral-200) rounded w-1/3 animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-8 w-8 rounded bg-(--color-neutral-200)" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-(--color-neutral-200) rounded w-1/2" />
                <div className="h-3 bg-(--color-neutral-200) rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (displayAlerts.length === 0) {
    return (
      <Card ref={ref} padding="lg" className={cn(className)} {...props}>
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-(--color-success-600) mx-auto mb-3" />
          <p className="text-sm font-medium text-(--text-primary)">
            All stock levels healthy
          </p>
          <p className="text-xs text-(--text-secondary) mt-1">
            No inventory alerts
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card ref={ref} padding="lg" className={cn(className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-(--text-primary)">
          Inventory Alerts
        </h3>
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <Badge variant="error">{criticalCount} Critical</Badge>
          )}
          {lowCount > 0 && (
            <Badge variant="warning">{lowCount} Low Stock</Badge>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {displayAlerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-(--color-neutral-50) transition-colors cursor-pointer group"
          >
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
                alert.severity === 'critical'
                  ? 'bg-(--color-error-50)'
                  : 'bg-(--color-warning-50)',
              )}
            >
              <AlertTriangle
                className={cn(
                  'h-4 w-4',
                  alert.severity === 'critical'
                    ? 'text-(--color-error-600)'
                    : 'text-(--color-warning-600)',
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-(--text-primary) truncate">
                {alert.productName}
              </p>
              <p className="text-xs text-(--text-secondary) mt-0.5">
                {alert.variantName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-(--text-primary)">
                  {alert.currentStock} left
                </span>
                <span className="text-xs text-(--text-secondary)">•</span>
                <span className="text-xs text-(--text-secondary)">
                  Threshold: {alert.threshold}
                </span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-(--text-secondary) opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        ))}
      </div>

      {alerts.length > maxVisible && (
        <button className="w-full mt-4 text-sm text-(--color-brand-600) hover:text-(--color-brand-700) font-medium text-center">
          View all {alerts.length} alerts
        </button>
      )}
    </Card>
  );
});

InventoryAlertsCard.displayName = 'InventoryAlertsCard';
