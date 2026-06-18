import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { StatusBadge } from "../common/StatusBadge";
import { Modal } from "../common/Modal";
import { Mail, Phone, MapPin, ShoppingBag } from "lucide-react";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
}

interface CustomerDetail extends Customer {
  orders: { id: string; orderNumber: string; total: number; status: string; createdAt: string }[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CustomerDetail | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers({ page, limit: 20 });
      setCustomers((res.customers as Customer[]) ?? []);
      const pag = res.pagination as { totalPages?: number } | undefined;
      setTotalPages(pag?.totalPages ?? 1);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const viewDetail = async (c: Customer) => {
    try {
      const res = await adminApi.getCustomer(c.id);
      setSelected(res.customer as CustomerDetail);
    } catch { /* ignore */ }
  };

  const columns = [
    { key: "name", label: "Customer", sortable: true,
      render: (c: Customer) => (
        <div>
          <p className="font-medium text-neutral-900">{c.firstName} {c.lastName}</p>
          <p className="text-xs text-neutral-400">{c.email}</p>
        </div>
      ),
    },
    { key: "phone", label: "Phone",
      render: (c: Customer) => <span className="text-sm text-neutral-500">{c.phone || "—"}</span>,
    },
    { key: "isActive", label: "Status",
      render: (c: Customer) => <StatusBadge status={c.isActive ? "active" : "inactive"} />,
    },
    { key: "_count", label: "Orders",
      render: (c: Customer) => <span className="text-sm text-neutral-500">{c._count?.orders ?? 0}</span>,
    },
    { key: "createdAt", label: "Joined", sortable: true,
      render: (c: Customer) => (
        <span className="text-sm text-neutral-500">
          {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Customers</h1>
        <p className="text-sm text-neutral-500 mt-1">View and manage customers</p>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchPlaceholder="Search customers…"
        onRowClick={viewDetail}
        emptyMessage="No customers yet"
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Customer Details" size="lg">
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-display text-xl">
                {selected.firstName[0]}{selected.lastName[0]}
              </div>
              <div>
                <h3 className="font-medium text-lg text-neutral-900">{selected.firstName} {selected.lastName}</h3>
                <StatusBadge status={selected.isActive ? "active" : "inactive"} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Mail size={14} className="shrink-0 text-neutral-400" /> {selected.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Phone size={14} className="shrink-0 text-neutral-400" /> {selected.phone || "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <ShoppingBag size={14} className="shrink-0 text-neutral-400" /> {selected._count?.orders ?? 0} orders
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-neutral-900 mb-3">Order History</h4>
              {selected.orders?.length ? (
                <div className="space-y-2">
                  {selected.orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded text-sm">
                      <div>
                        <span className="font-medium text-neutral-900">#{o.orderNumber}</span>
                        <span className="text-neutral-400 ml-2">· {new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">₹{o.total?.toLocaleString()}</span>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400">No orders yet</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
