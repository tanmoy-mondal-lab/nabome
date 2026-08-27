import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

import { Button } from './Button';
import { Card } from './Card';
import { Heading } from './Heading';
import { Input } from './Input';
import { Paragraph } from './Paragraph';

/**
 * AdminShippingDashboard — global shipping dashboard for admins (SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md).
 * Mobile-first responsive design with carrier management and analytics.
 */

export interface Carrier {
  code: string;
  name: string;
  displayName: string;
  status: string;
}

export interface ShippingAnalytics {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  failedDeliveries: number;
  averageTransitTime: number;
  onTimeDeliveryRate: number;
}

export interface AdminShippingDashboardProps extends HTMLAttributes<HTMLDivElement> {
  analytics: ShippingAnalytics;
  carriers: Carrier[];
  onSearchShipments?: (query: string) => void;
  onManageCarrier?: (code: string) => void;
  onRefresh?: () => void;
}

export const AdminShippingDashboard = forwardRef<
  HTMLDivElement,
  AdminShippingDashboardProps
>(
  (
    {
      className,
      analytics,
      carriers,
      onSearchShipments,
      onManageCarrier,
      onRefresh,
      ...props
    },
    ref,
  ) => {
    return (
      <div ref={ref} className={cn('space-y-6', className)} {...props}>
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <Heading level="h2">Shipping Dashboard</Heading>
            <Paragraph className="text-sm text-(--text-muted)">
              Global shipping operations and carrier management
            </Paragraph>
          </div>
          {onRefresh && <Button onClick={onRefresh}>Refresh Data</Button>}
        </div>

        {/* Search */}
        <Card padding="sm">
          <div className="flex gap-2">
            <Input
              placeholder="Search shipments by ID, order ID, or tracking number..."
              className="flex-1"
              onChange={(e) => onSearchShipments?.(e.target.value)}
            />
            <Button>Search</Button>
          </div>
        </Card>

        {/* Analytics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <AnalyticsCard
            label="Total Shipments"
            value={analytics.totalShipments}
          />
          <AnalyticsCard
            label="In Transit"
            value={analytics.inTransit}
            color="info"
          />
          <AnalyticsCard
            label="Delivered"
            value={analytics.delivered}
            color="success"
          />
          <AnalyticsCard
            label="Failed"
            value={analytics.failedDeliveries}
            color="error"
          />
          <AnalyticsCard
            label="Avg Transit Time"
            value={`${analytics.averageTransitTime}d`}
            color="neutral"
          />
          <AnalyticsCard
            label="On-Time Rate"
            value={`${analytics.onTimeDeliveryRate}%`}
            color="success"
          />
        </div>

        {/* Carrier Management */}
        <div>
          <Heading level="h3" className="mb-4">
            Carrier Management
          </Heading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {carriers.map((carrier) => (
              <Card key={carrier.code} padding="md">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Heading level="h4" className="text-sm">
                      {carrier.displayName}
                    </Heading>
                    <span className="text-xs text-(--text-muted)">
                      {carrier.code}
                    </span>
                  </div>
                  <Paragraph className="text-xs text-(--text-muted)">
                    {carrier.name}
                  </Paragraph>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-(--text-muted)">Status</span>
                    <span className="text-xs font-medium">
                      {carrier.status}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => onManageCarrier?.(carrier.code)}
                  >
                    Manage
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  },
);
AdminShippingDashboard.displayName = 'AdminShippingDashboard';

interface AnalyticsCardProps {
  label: string;
  value: string | number;
  color?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

function AnalyticsCard({
  label,
  value,
  color = 'neutral',
}: AnalyticsCardProps) {
  const colorClasses = {
    success: 'text-(--success)',
    warning: 'text-(--warning)',
    error: 'text-(--error)',
    info: 'text-(--info)',
    neutral: 'text-(--text)',
  };

  return (
    <Card padding="sm">
      <div className="text-center">
        <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
        <p className="text-xs text-(--text-muted)">{label}</p>
      </div>
    </Card>
  );
}
