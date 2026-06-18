import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api/client";
import { formatDate, formatPrice } from "../lib/utils/format";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  items: { productName: string; quantity: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<{ orders: Order[] }>("/orders")
      .then((res) => setOrders(res.orders))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-xl text-neutral-500">No orders yet</p>
        <p className="text-sm text-neutral-400 mt-2">Your order history will appear here</p>
        <Link to="/collections" className="btn-primary inline-block mt-6">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          to={`/account/orders/${order.id}`}
          className="premium-card p-6 block hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-sm text-neutral-500">{order.orderNumber}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-neutral-100 text-neutral-600"}`}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              {order.items.slice(0, 2).map((item) => item.productName).join(", ")}
              {order.items.length > 2 && ` +${order.items.length - 2} more`}
            </div>
            <div className="text-right">
              <p className="font-body font-semibold text-neutral-900">{formatPrice(order.total)}</p>
              <p className="text-xs text-neutral-400">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
