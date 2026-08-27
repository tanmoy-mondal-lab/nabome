/**
 * Return Timeline - Mobile-First Customer UI
 *
 * Displays the complete timeline of a return request.
 * Mobile-first design with accessible timeline visualization.
 */

'use client';

import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  FileText,
  CreditCard,
} from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

interface ReturnTimelineProps {
  returnRequest: {
    status: string;
    requestedAt: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    refundCompletedAt?: Date;
  };
}

const timelineSteps = [
  { key: 'return_requested', label: 'Return Requested', icon: Clock },
  { key: 'return_approved', label: 'Return Approved', icon: CheckCircle },
  { key: 'return_rejected', label: 'Return Rejected', icon: XCircle },
  { key: 'pickup_scheduled', label: 'Pickup Scheduled', icon: Truck },
  { key: 'pickup_completed', label: 'Pickup Completed', icon: Package },
  { key: 'in_inspection', label: 'In Inspection', icon: FileText },
  { key: 'inspection_passed', label: 'Inspection Passed', icon: CheckCircle },
  { key: 'inspection_failed', label: 'Inspection Failed', icon: XCircle },
  { key: 'refund_completed', label: 'Refund Completed', icon: CreditCard },
];

export function ReturnTimeline({ returnRequest }: ReturnTimelineProps) {
  const statusOrder = [
    'return_requested',
    'return_approved',
    'return_rejected',
    'pickup_scheduled',
    'pickup_completed',
    'in_inspection',
    'inspection_passed',
    'inspection_failed',
    'refund_completed',
  ];

  const currentIndex = statusOrder.indexOf(returnRequest.status);

  const getStepStatus = (stepKey: string) => {
    const stepIndex = statusOrder.indexOf(stepKey);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStepDate = (stepKey: string) => {
    switch (stepKey) {
      case 'return_requested':
        return returnRequest.requestedAt;
      case 'return_approved':
        return returnRequest.approvedAt;
      case 'return_rejected':
        return returnRequest.rejectedAt;
      case 'refund_completed':
        return returnRequest.refundCompletedAt;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Return Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineSteps.map((step, index) => {
            const status = getStepStatus(step.key);
            const StepIcon = step.icon;
            const date = getStepDate(step.key);

            // Skip rejected step if not rejected
            if (
              step.key === 'return_rejected' &&
              returnRequest.status !== 'return_rejected'
            ) {
              return null;
            }

            return (
              <div key={step.key} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      status === 'completed'
                        ? 'bg-green-100 text-green-600'
                        : status === 'current'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div
                      className={`w-0.5 h-12 mt-2 ${
                        status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <p
                      className={`font-medium ${
                        status === 'current'
                          ? 'text-blue-600'
                          : status === 'completed'
                            ? 'text-green-600'
                            : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {status === 'current' && (
                      <Badge variant="neutral" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  {date && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(date).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
