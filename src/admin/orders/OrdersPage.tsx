import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { StatusBadge } from "../common/StatusBadge";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string };
  _count: { items: number };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({ page, limit: 20 });
      setOrders((res.orders as Order[]) ?? []);
      const pag = res.pagination as { totalPages?: number } | undefined;
      setTotalPages(pag?.totalPages ?? 1);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const columns = [
    { key: "orderNumber", label: "Order", sortable: true,
      render: (o: Order) => <span className="font-medium text-neutral-900">#{o.orderNumber}</span>,
    },
    { key: "customer", label: "Customer",
      render: (o: Order) => (
        <div>
          <p className="text-sm text-neutral-900">{o.customer?.firstName} {o.customer?.lastName}</p>
          <p className="text-xs text-neutral-400">{o.customer?.email}</p>
        </div>
      ),
    },
    { key: "status", label: "Status",
      render: (o: Order) => <StatusBadge status={o.status} />,
    },
    { key: "paymentStatus", label: "Payment",
      render: (o: Order) => <StatusBadge status={o.paymentStatus} />,
    },
    { key: "total", label: "Total", sortable: true,
      render: (o: Order) => <span className="font-medium">₹{o.total?.toLocaleString()}</span>,
    },
    { key: "createdAt", label: "Date", sortable: true,
      render: (o: Order) => (
        <span className="text-sm text-neutral-500">
          {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Orders</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage customer orders</p>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchPlaceholder="Search orders…"
        onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
        emptyMessage="No orders yet"
      />
    </div>
  );
}
