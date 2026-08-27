import {
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

import type { RefundStatus } from '@nabome/types';
import { Button } from '@nabome/ui';

interface ReturnItem {
  id: string;
  productName: string;
  quantity: number;
}

interface ReturnRequest {
  id: string;
  orderNumber: string;
  orderId: string;
  reason: string;
  refundStatus: RefundStatus | string;
  totalRefundAmount: number;
  createdAt: string | Date;
  items: ReturnItem[];
}

interface ReturnsIntegrationProps {
  userId: string;
}

export function ReturnsIntegration({
  userId: _userId,
}: ReturnsIntegrationProps) {
  void _userId;
  const [returns] = useState<ReturnRequest[]>([]);
  const returnsLoading = false;
  const returnsError: string | null = null;

  const [showPolicy, setShowPolicy] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(
    null,
  );
  void selectedReturn;

  const handleCreateReturn = () => {
    void 0;
  };

  const handleCancelReturn = async (_returnId: string) => {
    void _returnId;
    if (confirm('Are you sure you want to cancel this return request?')) {
      void 0;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      dateStyle: 'medium',
    });
  };

  const getRefundStatusColor = (status: RefundStatus | string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'initiated':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'settled':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRefundStatusIcon = (status: RefundStatus | string) => {
    switch (status) {
      case 'completed':
      case 'settled':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'initiated':
      case 'pending':
      case 'processing':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (returnsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (returnsError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
        {returnsError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Returns & Refunds
        </h2>
        <Button
          onClick={handleCreateReturn}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Request Return
        </Button>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-1">Return Policy</h3>
            <p className="text-sm text-blue-700 mb-2">
              You can return items within 7 days of delivery for a full refund.
              Items must be unused and in original packaging.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPolicy(!showPolicy)}
              className="text-blue-600 p-0 h-auto"
            >
              {showPolicy ? 'Hide Details' : 'View Full Policy'}
            </Button>
          </div>
        </div>

        {showPolicy && (
          <div className="mt-4 pt-4 border-t border-blue-200 text-sm text-blue-700 space-y-2">
            <p>
              <strong>Return Window:</strong> 7 days from delivery date
            </p>
            <p>
              <strong>Condition:</strong> Items must be unused, unworn, and in
              original packaging
            </p>
            <p>
              <strong>Refund Method:</strong> Original payment method within 5-7
              business days
            </p>
            <p>
              <strong>Non-returnable:</strong> Personal care items, customized
              products, final sale items
            </p>
            <p>
              <strong>Return Shipping:</strong> Free for defective items;
              customer pays for change of mind returns
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
          Return History
        </h3>

        {returns.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <RotateCcw className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No return requests yet</p>
            <Button variant="outline">Request a Return</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {returns.map((returnRequest: ReturnRequest) => (
              <div
                key={returnRequest.id}
                className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {returnRequest.orderNumber}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getRefundStatusColor(returnRequest.refundStatus)}`}
                      >
                        {getRefundStatusIcon(returnRequest.refundStatus)}
                        {returnRequest.refundStatus}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Order {returnRequest.orderNumber} •{' '}
                      {formatDate(returnRequest.createdAt)}
                    </p>
                  </div>
                  {(returnRequest.refundStatus === 'pending' ||
                    returnRequest.refundStatus === 'initiated') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelReturn(returnRequest.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Reason
                  </p>
                  <p className="text-sm text-gray-600">
                    {returnRequest.reason}
                  </p>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Items
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {returnRequest.items.slice(0, 2).map((item: ReturnItem) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <span>{item.productName}</span>
                        <span>×{item.quantity}</span>
                      </div>
                    ))}
                    {returnRequest.items.length > 2 && (
                      <span className="text-sm text-gray-600">
                        +{returnRequest.items.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Refund Amount</p>
                    <p className="font-semibold text-gray-900">
                      ₹
                      {returnRequest.totalRefundAmount?.toLocaleString() ||
                        'N/A'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReturn(returnRequest)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
