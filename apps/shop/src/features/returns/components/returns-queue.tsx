/**
 * Returns Queue - Shop Owner Dashboard
 *
 * Displays pending return requests for shop owner approval.
 * Mobile-first design with accessible action buttons.
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
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface ReturnsQueueProps {
  shopId: string;
}

// Mock data - in production, this would come from API
const mockPendingReturns = [
  {
    id: 'return-1',
    orderNumber: 'ORD-12345',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    status: 'return_requested',
    requestedAt: new Date('2024-01-15'),
    reason: 'damaged',
    reasonDetail: 'Product arrived damaged in transit',
    totalRefundAmount: 1500,
    items: [
      { productName: 'Product A', quantity: 1, totalPrice: 1000 },
      { productName: 'Product B', quantity: 1, totalPrice: 500 },
    ],
    evidenceUrls: ['https://example.com/evidence1.jpg'],
  },
  {
    id: 'return-2',
    orderNumber: 'ORD-12346',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    status: 'return_requested',
    requestedAt: new Date('2024-01-16'),
    reason: 'wrong_item',
    reasonDetail: 'Received wrong variant',
    totalRefundAmount: 800,
    items: [{ productName: 'Product C', quantity: 1, totalPrice: 800 }],
    evidenceUrls: [],
  },
];

export function ReturnsQueue({ shopId }: ReturnsQueueProps) {
  const [returns, setReturns] = useState(mockPendingReturns);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async (returnId: string) => {
    setLoading(true);
    // In production, this would call the API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setReturns(returns.filter((r) => r.id !== returnId));
    setLoading(false);
  };

  const handleReject = async () => {
    if (!selectedReturn || !rejectReason) return;

    setLoading(true);
    // In production, this would call the API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setReturns(returns.filter((r) => r.id !== selectedReturn.id));
    setSelectedReturn(null);
    setRejectReason('');
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pending Returns</h2>
        <Badge variant="secondary">{returns.length} pending</Badge>
      </div>

      {returns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pending returns</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {returns.map((returnRequest) => (
            <Card key={returnRequest.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {returnRequest.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {returnRequest.customerName} •{' '}
                      {returnRequest.customerEmail}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {new Date(returnRequest.requestedAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Items</p>
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

                <div>
                  <p className="text-sm font-medium mb-1">Reason</p>
                  <p className="text-sm">
                    {returnRequest.reason.replace('_', ' ')}
                  </p>
                  {returnRequest.reasonDetail && (
                    <p className="text-sm text-muted-foreground">
                      {returnRequest.reasonDetail}
                    </p>
                  )}
                </div>

                {returnRequest.evidenceUrls.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Evidence</p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Evidence ({returnRequest.evidenceUrls.length})
                    </Button>
                  </div>
                )}

                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between font-medium">
                    <span>Refund Amount</span>
                    <span>₹{returnRequest.totalRefundAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(returnRequest.id)}
                    disabled={loading}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={loading}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Return Request</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Order: {returnRequest.orderNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Customer: {returnRequest.customerName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Reason for Rejection
                          </label>
                          <Textarea
                            placeholder="Please provide a reason for rejecting this return..."
                            value={rejectReason}
                            onChange={(e: any) =>
                              setRejectReason(e.target.value)
                            }
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedReturn(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!rejectReason || loading}
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
