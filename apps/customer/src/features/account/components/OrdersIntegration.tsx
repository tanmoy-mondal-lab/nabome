import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { useState } from 'react';

import type { Order, OrderStatus } from '@nabome/types';
import { Button } from '@nabome/ui';

import { useOrderStore } from '@/stores/order-store';

interface OrdersIntegrationProps {
  userId: string;
}

export function OrdersIntegration({ userId: _userId }: OrdersIntegrationProps) {
  const {
    orders,
    isLoading: ordersLoading,
    error: ordersError,
    cancelOrder,
  } = useOrderStore();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>(
    'all',
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  void selectedOrder;
  void _userId;

  const handleCancel = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      await cancelOrder(orderId, 'Customer requested cancellation');
    }
  };

  const handleReorder = async (_orderId: string) => {
    void _orderId;
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders =
    selectedStatus === 'all'
      ? (orders as unknown as Order[])
      : (orders as unknown as Order[]).filter(
          (order: Order) => order.status === selectedStatus,
        );

  if (ordersLoading) {
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

  if (ordersError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
        {ordersError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Orders</h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as OrderStatus | 'all')
            }
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No orders found</p>
          <Button variant="outline">Start Shopping</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: Order) => (
            <div
              key={order.id}
              className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {order.orderNumber}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.customerVisibleStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      dateStyle: 'medium',
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(order)}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Details
                </Button>
              </div>

              <div className="mb-4">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-gray-600">
                        +{order.items.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-semibold text-gray-900">
                    ₹
                    {order.amounts?.grandTotal?.amount?.toLocaleString() ||
                      'N/A'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {order.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(order.id)}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reorder
                    </Button>
                  )}
                  {(order.status === 'pending' ||
                    order.status === 'processing') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(order.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
