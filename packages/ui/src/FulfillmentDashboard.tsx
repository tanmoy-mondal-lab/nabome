import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

import { Card } from './Card';
import { FulfillmentQueue, type FulfillmentItem } from './FulfillmentQueue';
import { Heading } from './Heading';
import { Paragraph } from './Paragraph';

/**
 * FulfillmentDashboard — main dashboard for shop owners (SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md).
 * Mobile-first responsive design with statistics and queue management.
 */

export interface FulfillmentStatistics {
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  cancelled: number;
}

export interface FulfillmentDashboardProps extends HTMLAttributes<HTMLDivElement> {
  statistics: FulfillmentStatistics;
  queueItems: FulfillmentItem[];
  onAssign?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRefresh?: () => void;
}

export const FulfillmentDashboard = forwardRef<
  HTMLDivElement,
  FulfillmentDashboardProps
>(
  (
    {
      className,
      statistics,
      queueItems,
      onAssign,
      onStart,
      onComplete,
      onCancel,
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
            <Heading level="h2">Fulfillment Dashboard</Heading>
            <Paragraph className="text-sm text-(--text-muted)">
              Manage your fulfillment queue and packing operations
            </Paragraph>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-(--border) bg-(--bg) hover:bg-(--bg-hover)"
            >
              Refresh
            </button>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard
            label="Pending"
            value={statistics.pending}
            color="warning"
          />
          <StatCard
            label="In Progress"
            value={statistics.inProgress}
            color="info"
          />
          <StatCard
            label="Completed"
            value={statistics.completed}
            color="success"
          />
          <StatCard label="Failed" value={statistics.failed} color="error" />
          <StatCard
            label="Cancelled"
            value={statistics.cancelled}
            color="neutral"
          />
        </div>

        {/* Fulfillment Queue */}
        <div>
          <Heading level="h3" className="mb-4">
            Fulfillment Queue
          </Heading>
          <FulfillmentQueue
            items={queueItems}
            onAssign={onAssign}
            onStart={onStart}
            onComplete={onComplete}
            onCancel={onCancel}
          />
        </div>
      </div>
    );
  },
);
FulfillmentDashboard.displayName = 'FulfillmentDashboard';

interface StatCardProps {
  label: string;
  value: number;
  color: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

function StatCard({ label, value, color }: StatCardProps) {
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
