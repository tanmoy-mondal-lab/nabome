/**
 * Refund Approval Queue - Shop Owner Dashboard
 *
 * Displays refunds awaiting approval after inspection passed.
 * Mobile-first design with accessible approval actions.
 */

'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

interface RefundApprovalQueueProps {
  shopId: string;
}

// Mock data - in production, this would come from API
const mockPendingRefunds = [
  {
    id: 'refund-1',
    returnId: 'return-1',
    orderNumber: 'ORD-12345',
    customerName: 'John Doe',
    inspectionPassedAt: new Date('2024-01-19'),
    refundAmount: 1500,
    refundMethod: 'original_payment',
    items: [
      { productName: 'Product A', quantity: 1, totalPrice: 1000 },
      { productName: 'Product B', quantity: 1, totalPrice: 500 },
    ],
  },
  {
    id: 'refund-2',
    returnId: 'return-2',
    orderNumber: 'ORD-12346',
    customerName: 'Jane Smith',
    inspectionPassedAt: new Date('2024-01-20'),
    refundAmount: 800,
    refundMethod: 'store_credit',
    items: [{ productName: 'Product C', quantity: 1, totalPrice: 800 }],
  },
];

export function RefundApprovalQueue({ shopId }: RefundApprovalQueueProps) {
  const [refunds, setRefunds] = useState(mockPendingRefunds);
  const [loading, setLoading] = useState(false);

  const handleApproveRefund = async (refundId: string) => {
    setLoading(true);
    // In production, this would call the API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefunds(refunds.filter((r) => r.id !== refundId));
    setLoading(false);
  };

  const handleRejectRefund = async (refundId: string) => {
    setLoading(true);
    // In production, this would call the API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefunds(refunds.filter((r) => r.id !== refundId));
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Refund Approvals</h2>
        <Badge variant="secondary">{refunds.length} pending</Badge>
      </div>

      {refunds.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No refunds pending approval</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {refunds.map((refund) => (
            <Card key={refund.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {refund.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {refund.customerName}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {new Date(refund.inspectionPassedAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Items</p>
                  {refund.items.map((item, index) => (
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      Refund Amount
                    </p>
                    <p className="text-lg font-bold">
                      ₹{refund.refundAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      Refund Method
                    </p>
                    <p className="text-sm font-medium">
                      {refund.refundMethod.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproveRefund(refund.id)}
                    disabled={loading}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Refund
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRejectRefund(refund.id)}
                    disabled={loading}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
