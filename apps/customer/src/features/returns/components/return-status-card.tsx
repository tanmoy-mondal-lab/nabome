/**
 * Return Status Card - Mobile-First Customer UI
 *
 * Displays the current status of a return request with timeline.
 * Mobile-first design with accessible status indicators.
 */

'use client';

import {
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Truck,
  FileText,
  CreditCard,
} from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

interface ReturnStatusCardProps {
  returnRequest: {
    id: string;
    orderNumber: string;
    status: string;
    requestedAt: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    refundStatus?: string;
    refundCompletedAt?: Date;
    totalRefundAmount: number;
    items: Array<{
      productName: string;
      quantity: number;
      totalPrice: number;
    }>;
  };
  onViewDetails?: () => void;
}

const statusConfig: Record<
  string,
  { icon: any; label: string; color: string }
> = {
  return_requested: {
    icon: Clock,
    label: 'Return Requested',
    color: 'bg-yellow-100 text-yellow-800',
  },
  return_approved: {
    icon: CheckCircle,
    label: 'Return Approved',
    color: 'bg-green-100 text-green-800',
  },
  return_rejected: {
    icon: XCircle,
    label: 'Return Rejected',
    color: 'bg-red-100 text-red-800',
  },
  pickup_scheduled: {
    icon: Truck,
    label: 'Pickup Scheduled',
    color: 'bg-blue-100 text-blue-800',
  },
  pickup_completed: {
    icon: Package,
    label: 'Pickup Completed',
    color: 'bg-blue-100 text-blue-800',
  },
  in_inspection: {
    icon: FileText,
    label: 'In Inspection',
    color: 'bg-purple-100 text-purple-800',
  },
  inspection_passed: {
    icon: CheckCircle,
    label: 'Inspection Passed',
    color: 'bg-green-100 text-green-800',
  },
  inspection_failed: {
    icon: XCircle,
    label: 'Inspection Failed',
    color: 'bg-red-100 text-red-800',
  },
  refund_pending: {
    icon: Clock,
    label: 'Refund Pending',
    color: 'bg-yellow-100 text-yellow-800',
  },
  refund_approved: {
    icon: CheckCircle,
    label: 'Refund Approved',
    color: 'bg-green-100 text-green-800',
  },
  refund_completed: {
    icon: CreditCard,
    label: 'Refund Completed',
    color: 'bg-green-100 text-green-800',
  },
  return_closed: {
    icon: CheckCircle,
    label: 'Return Closed',
    color: 'bg-gray-100 text-gray-800',
  },
};

export function ReturnStatusCard({
  returnRequest,
  onViewDetails,
}: ReturnStatusCardProps) {
  const config =
    statusConfig[returnRequest.status] ?? statusConfig['return_requested']!;
  const StatusIcon = config.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Return Request</CardTitle>
            <p className="text-sm text-muted-foreground">
              Order: {returnRequest.orderNumber}
            </p>
          </div>
          <Badge className={config.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Items Being Returned</p>
          <div className="space-y-2">
            {returnRequest.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm py-1 border-b last:border-0"
              >
                <span>
                  {item.productName} (x{item.quantity})
                </span>
                <span>₹{item.totalPrice}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted p-3 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Refund Amount</span>
            <span className="text-sm font-bold">
              ₹{returnRequest.totalRefundAmount.toFixed(2)}
            </span>
          </div>
          {returnRequest.refundStatus && (
            <div className="flex justify-between mt-2">
              <span className="text-sm text-muted-foreground">
                Refund Status
              </span>
              <span className="text-sm">
                {returnRequest.refundStatus.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Requested</span>
            <span>
              {new Date(returnRequest.requestedAt).toLocaleDateString()}
            </span>
          </div>
          {returnRequest.approvedAt && (
            <div className="flex justify-between">
              <span>Approved</span>
              <span>
                {new Date(returnRequest.approvedAt).toLocaleDateString()}
              </span>
            </div>
          )}
          {returnRequest.refundCompletedAt && (
            <div className="flex justify-between">
              <span>Refunded</span>
              <span>
                {new Date(returnRequest.refundCompletedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {onViewDetails && (
          <Button variant="outline" className="w-full" onClick={onViewDetails}>
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
