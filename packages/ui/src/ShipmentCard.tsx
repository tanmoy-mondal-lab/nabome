import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

import { Badge } from './Badge';
import { Card } from './Card';

/**
 * ShipmentCard — displays shipment information (SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md).
 * Mobile-first responsive design with accessible status indicators.
 */

export const shipmentCardVariants = cva('', {
  variants: {
    variant: {
      default: '',
      compact: 'p-3',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ShipmentCardProps
  extends
    HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shipmentCardVariants> {
  shipmentId: string;
  orderId: string;
  trackingNumber?: string;
  status: string;
  carrier?: string;
  estimatedDelivery?: Date;
  items?: number;
}

export const ShipmentCard = forwardRef<HTMLDivElement, ShipmentCardProps>(
  (
    {
      className,
      variant,
      shipmentId,
      orderId,
      trackingNumber,
      status,
      carrier,
      estimatedDelivery,
      items = 0,
      ...props
    },
    ref,
  ) => {
    const formatDate = (date?: Date) => {
      if (!date) return 'Not available';
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'delivered':
          return 'success';
        case 'in_transit':
        case 'out_for_delivery':
          return 'info';
        case 'delivery_failed':
        case 'cancelled':
          return 'error';
        default:
          return 'neutral';
      }
    };

    return (
      <Card
        ref={ref}
        padding={variant === 'compact' ? 'sm' : 'md'}
        className={cn(shipmentCardVariants({ variant }), className)}
        {...props}
      >
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-(--text)">
                Shipment #{shipmentId}
              </p>
              <p className="text-xs text-(--text-muted)">Order #{orderId}</p>
            </div>
            <Badge variant={getStatusColor(status)}>
              {status
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>
          </div>

          {/* Tracking info */}
          {trackingNumber && (
            <div className="flex flex-col gap-1">
              <p className="text-xs text-(--text-muted)">Tracking Number</p>
              <p className="text-sm font-mono text-(--text)">
                {trackingNumber}
              </p>
            </div>
          )}

          {/* Carrier */}
          {carrier && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-(--text-muted)">Carrier</p>
              <p className="text-sm text-(--text)">{carrier}</p>
            </div>
          )}

          {/* Estimated delivery */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-(--text-muted)">Estimated Delivery</p>
            <p className="text-sm text-(--text)">
              {formatDate(estimatedDelivery)}
            </p>
          </div>

          {/* Items count */}
          {items > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-(--text-muted)">Items</p>
              <p className="text-sm text-(--text)">{items}</p>
            </div>
          )}
        </div>
      </Card>
    );
  },
);
ShipmentCard.displayName = 'ShipmentCard';
