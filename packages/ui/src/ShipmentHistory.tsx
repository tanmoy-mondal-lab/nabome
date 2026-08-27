import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

import { Card } from './Card';
import { ShipmentCard } from './ShipmentCard';

/**
 * ShipmentHistory — displays customer's shipment history (SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md).
 * Mobile-first responsive design with accessible navigation.
 */

export interface ShipmentHistoryProps extends HTMLAttributes<HTMLDivElement> {
  shipments: Array<{
    shipmentId: string;
    orderId: string;
    trackingNumber?: string;
    status: string;
    carrier?: string;
    estimatedDelivery?: Date;
    items?: number;
  }>;
  onShipmentClick?: (shipmentId: string) => void;
}

export const ShipmentHistory = forwardRef<HTMLDivElement, ShipmentHistoryProps>(
  ({ className, shipments, onShipmentClick, ...props }, ref) => {
    if (shipments.length === 0) {
      return (
        <Card
          ref={ref}
          className={cn('text-center py-8', className)}
          {...props}
        >
          <p className="text-sm text-(--text-muted)">No shipment history</p>
        </Card>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-4', className)}
        role="list"
        aria-label="Shipment history"
        {...props}
      >
        {shipments.map((shipment) => (
          <ShipmentCard
            key={shipment.shipmentId}
            shipmentId={shipment.shipmentId}
            orderId={shipment.orderId}
            trackingNumber={shipment.trackingNumber}
            status={shipment.status}
            carrier={shipment.carrier}
            estimatedDelivery={shipment.estimatedDelivery}
            items={shipment.items}
            onClick={() => onShipmentClick?.(shipment.shipmentId)}
            className="cursor-pointer"
            role="listitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onShipmentClick?.(shipment.shipmentId);
              }
            }}
          />
        ))}
      </div>
    );
  },
);
ShipmentHistory.displayName = 'ShipmentHistory';
