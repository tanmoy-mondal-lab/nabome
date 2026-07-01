import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { StatusBadge } from "../common/StatusBadge";
import { Modal } from "../common/Modal";
import { SafeImage } from "../../components/SafeImage";
import { formatPrice, formatDate } from "../../lib/utils/format";
import { Mail, Phone, ShoppingBag, Edit3, Clock, UserCheck } from "lucide-react";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role?: string;
  isActive: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  marketingOptIn?: boolean;
  lastLoginAt?: string;
  loginCount?: number;
  createdAt: string;
  _count: { orders: number };
}

interface CustomerDetail extends Customer {
  addresses?: unknown[];
  orders: { id: string; orderNumber: string; total: number; status: string; createdAt: string }[];
  lifetimeValue?: number;
  updatedAt?: string;
  _count: { orders: number; reviews: number; wishlistItems: number };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CustomerDetail | null>(null);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", phone: "", isActive: true, role: "customer", marketingOptIn: false, avatarUrl: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editError, setEditError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await adminApi.getCustomers({ page, limit: 20 });
      setCustomers((res.customers as Customer[]) ?? []);
      const pag = res.pagination as { totalPages?: number } | undefined;
      setTotalPages(pag?.totalPages ?? 1);
    } catch {
      setFetchError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const viewDetail = async (c: Customer) => {
    try {
      const res = await adminApi.getCustomer(c.id);
      setSelected(res.customer as CustomerDetail);
    } catch {
      setFetchError("Failed to load customer detail");
    }
  };

  const openEdit = (c: Customer) => {
    setEditTarget(c);
    setEditForm({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone ?? "", isActive: c.isActive, role: c.role ?? "customer", marketingOptIn: c.marketingOptIn ?? false, avatarUrl: c.avatarUrl ?? "" });
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setEditError(null);
    try {
      await adminApi.updateCustomer(editTarget.id, editForm);
      setEditTarget(null);
      fetchCustomers();
    } catch (err) { setEditError(`Failed to update customer: ${(err as Error).message ?? "Unknown error"}`); }
  };

  const columns = [
    { key: "name", label: "Customer", sortable: true,
      render: (c: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-medium text-neutral-500 shrink-0">
            {c.avatarUrl ? <SafeImage src={c.avatarUrl} alt={`${c.firstName} ${c.lastName} avatar`} className="w-full h-full rounded-full object-cover" useTransform={false} /> : `${c.firstName[0]}${c.lastName[0]}`}
          </div>
          <div>
            <p className="font-medium text-neutral-900">{c.firstName} {c.lastName}</p>
            <p className="text-xs text-neutral-400">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", label: "Phone",
      render: (c: Customer) => <span className="text-sm text-neutral-500">{c.phone || "—"}</span>,
    },
    { key: "role", label: "Role",
      render: (c: Customer) => <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 capitalize">{c.role ?? "customer"}</span>,
    },
    { key: "isActive", label: "Status",
      render: (c: Customer) => <StatusBadge status={c.isActive ? "active" : "inactive"} />,
    },
    { key: "emailVerified", label: "Verified",
      render: (c: Customer) => <span className={`text-xs ${c.emailVerified ? "text-green-600" : "text-neutral-300"}`}>{c.emailVerified ? "Yes" : "No"}</span>,
    },
    { key: "_count", label: "Orders",
      render: (c: Customer) => <span className="text-sm text-neutral-500">{c._count?.orders ?? 0}</span>,
    },
    { key: "lastLoginAt", label: "Last Login",
      render: (c: Customer) => <span className="text-xs text-neutral-400">{c.lastLoginAt ? formatDate(c.lastLoginAt) : "—"}</span>,
    },
    { key: "createdAt", label: "Joined", sortable: true,
      render: (c: Customer) => <span className="text-sm text-neutral-500">{formatDate(c.createdAt)}</span>,
    },
  ];

  return (
    <div>
      {fetchError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{fetchError}</div>
      )}
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
        actions={(c) => (
          <button onClick={(e) => { e.stopPropagation(); openEdit(c as Customer); }} className="p-1.5 text-neutral-400 hover:text-neutral-600">
            <Edit3 size={14} />
          </button>
        )}
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Customer Details" size="lg">
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-700 font-display text-xl">
                {selected.avatarUrl ? <SafeImage src={selected.avatarUrl} alt={`${selected.firstName} ${selected.lastName} avatar`} className="w-full h-full rounded-full object-cover" useTransform={false} /> : `${selected.firstName[0]}${selected.lastName[0]}`}
              </div>
              <div>
                <h3 className="font-medium text-lg text-neutral-900">{selected.firstName} {selected.lastName}</h3>
                <div className="flex gap-2 mt-1">
                  <StatusBadge status={selected.isActive ? "active" : "inactive"} />
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 capitalize">{selected.role}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Mail size={14} className="shrink-0 text-neutral-400" /> {selected.email}
                {selected.emailVerified && <UserCheck size={12} className="text-green-500" />}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Phone size={14} className="shrink-0 text-neutral-400" /> {selected.phone || "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <ShoppingBag size={14} className="shrink-0 text-neutral-400" /> {selected._count?.orders ?? 0} orders
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Clock size={14} className="shrink-0 text-neutral-400" /> Last login: {selected.lastLoginAt ? formatDate(selected.lastLoginAt) : "—"}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-neutral-50 rounded p-3"><span className="block text-lg font-medium text-neutral-900">{formatPrice(selected.lifetimeValue ?? 0)}</span>Lifetime Value</div>
              <div className="bg-neutral-50 rounded p-3"><span className="block text-lg font-medium text-neutral-900">{selected._count?.reviews ?? 0}</span>Reviews</div>
              <div className="bg-neutral-50 rounded p-3"><span className="block text-lg font-medium text-neutral-900">{selected._count?.wishlistItems ?? 0}</span>Wishlist</div>
            </div>

            {selected.addresses && selected.addresses.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-neutral-900 mb-3">Addresses ({selected.addresses.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(selected.addresses as Array<Record<string, unknown>>).map((a, i) => (
                    <div key={i} className="p-3 bg-neutral-50 rounded text-xs text-neutral-600">
                      <p className="font-medium text-neutral-900">{String(a.label ?? "") || `Address ${i + 1}`}</p>
                      <p>{String(a.line1 ?? "")}{a.line2 ? `, ${String(a.line2)}` : ""}</p>
                      <p>{String(a.city ?? "")}{a.district ? `, ${String(a.district)}` : ""}, {String(a.state ?? "")} — {String(a.pincode ?? "")}</p>
                      {Boolean(a.isDefault) && <span className="text-green-600">Default</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-sm text-neutral-900 mb-3">Order History</h4>
              {selected.orders?.length ? (
                <div className="space-y-2">
                  {selected.orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded text-sm">
                      <div>
                        <span className="font-medium text-neutral-900">#{o.orderNumber}</span>
                        <span className="text-neutral-400 ml-2">· {formatDate(o.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{formatPrice(o.total ?? 0)}</span>
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

      <Modal open={!!editTarget} onClose={() => { setEditTarget(null); setEditError(null); }} title="Edit Customer">
        <div className="space-y-4">
          {editError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{editError}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-neutral-500 mb-1">First Name</label><input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Last Name</label><input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
          </div>
          <div><label className="block text-xs text-neutral-500 mb-1">Email</label><input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Phone</label><input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Avatar URL</label><input value={editForm.avatarUrl} onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Role</label>
              <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors">
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Status</label>
              <select value={editForm.isActive ? "active" : "inactive"} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "active" })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editForm.marketingOptIn} onChange={(e) => setEditForm({ ...editForm, marketingOptIn: e.target.checked })} className="rounded border-neutral-300" />
            <span className="text-sm text-neutral-700">Marketing Opt-In</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setEditTarget(null)} className="border border-neutral-200 px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors">Cancel</button>
            <button onClick={handleEditSave} className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
