import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { Heading } from './Heading';

/**
 * FulfillmentQueue — displays fulfillment queue for shop owners (SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md).
 * Mobile-first responsive design with accessible actions.
 */

export interface FulfillmentItem {
  id: string;
  orderId: string;
  shipmentId?: string;
  status: string;
  priority: number;
  assignedTo?: string;
  createdAt: Date;
}

export interface FulfillmentQueueProps extends HTMLAttributes<HTMLDivElement> {
  items: FulfillmentItem[];
  onAssign?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const FulfillmentQueue = forwardRef<
  HTMLDivElement,
  FulfillmentQueueProps
>(
  (
    { className, items, onAssign, onStart, onComplete, onCancel, ...props },
    ref,
  ) => {
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'completed':
          return 'success';
        case 'in_progress':
          return 'info';
        case 'failed':
          return 'error';
        case 'cancelled':
          return 'neutral';
        default:
          return 'warning';
      }
    };

    const getPriorityColor = (priority: number) => {
      if (priority >= 3) return 'error';
      if (priority >= 2) return 'warning';
      return 'neutral';
    };

    if (items.length === 0) {
      return (
        <Card
          ref={ref}
          className={cn('text-center py-8', className)}
          {...props}
        >
          <p className="text-sm text-(--text-muted)">
            No items in fulfillment queue
          </p>
        </Card>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-4', className)}
        role="list"
        aria-label="Fulfillment queue"
        {...props}
      >
        {items.map((item) => (
          <Card key={item.id} className="flex flex-col gap-3" role="listitem">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Heading level="h4" className="text-sm">
                    Order #{item.orderId}
                  </Heading>
                  <Badge variant={getPriorityColor(item.priority)}>
                    Priority {item.priority}
                  </Badge>
                </div>
                {item.shipmentId && (
                  <p className="text-xs text-(--text-muted)">
                    Shipment #{item.shipmentId}
                  </p>
                )}
              </div>
              <Badge variant={getStatusColor(item.status)}>
                {item.status
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-(--text-muted)">
                Created {formatDate(item.createdAt)}
              </p>
              {item.assignedTo && (
                <p className="text-xs text-(--text-muted)">
                  Assigned to {item.assignedTo}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {item.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => onAssign?.(item.id)}>
                    Assign
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStart?.(item.id)}
                  >
                    Start
                  </Button>
                </>
              )}
              {item.status === 'in_progress' && (
                <>
                  <Button size="sm" onClick={() => onComplete?.(item.id)}>
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCancel?.(item.id)}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  },
);
FulfillmentQueue.displayName = 'FulfillmentQueue';
