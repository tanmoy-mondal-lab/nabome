import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { DataTable } from "../common/DataTable";
import { ShoppingBag, Eye } from "lucide-react";
import { formatPrice } from "../../lib/utils/format";

interface CartItem {
  id: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    price: number;
    product: { name: string };
  };
}

interface Cart {
  id: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
  profile: { firstName: string; lastName: string; email: string; phone: string };
  items: CartItem[];
}

export default function AbandonedCartsPage() {
  const [page, setPage] = useState(1);
  const [minAge, setMinAge] = useState("24");
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "abandonedCarts", page, minAge],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = {
        minAge: Number(minAge) || 24,
        page,
        limit,
      };
      const res = await adminApi.getAbandonedCarts(params);
      return {
        carts: (res.carts as Cart[]) ?? [],
        pagination: (res.pagination as { total: number; totalPages: number }) ?? { total: 0, totalPages: 1 },
      };
    },
  });

  const carts = data?.carts ?? [];
  const pagination = data?.pagination;

  const total = (item: Cart) =>
    item.items.reduce((sum, i) => sum + i.quantity * i.variant.price, 0);

  const relativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Less than an hour ago";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const columns = [
    {
      key: "profile", label: "Customer",
      render: (c: Cart) => <span className="font-medium text-neutral-900">{c.profile.firstName} {c.profile.lastName}</span>,
    },
    {
      key: "email", label: "Email",
      render: (c: Cart) => <span className="text-neutral-600">{c.profile.email}</span>,
    },
    {
      key: "items", label: "Items",
      render: (c: Cart) => <span className="text-neutral-600 text-center">{c.items.reduce((s, i) => s + i.quantity, 0)}</span>,
    },
    {
      key: "total", label: "Total",
      render: (c: Cart) => <span className="text-neutral-900 font-medium">{formatPrice(total(c))}</span>,
    },
    {
      key: "updatedAt", label: "Last Active",
      render: (c: Cart) => <span className="text-neutral-500 text-xs">{relativeTime(c.updatedAt)}</span>,
    },
    {
      key: "actions", label: "",
      render: (c: Cart) => (
        <button onClick={(ev) => { ev.stopPropagation(); setSelectedCart(c); }}
          className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100" title="View items">
          <Eye size={14} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Abandoned Carts</h1>
          <p className="text-sm text-neutral-500 mt-1">{pagination?.total ?? 0} abandoned carts</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Min hours inactive</label>
            <input
              type="number"
              min="1"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              className="w-28 px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {carts.length === 0 && !isLoading ? (
        <EmptyState
          icon={ShoppingBag}
          title="No abandoned carts"
          description="Carts will appear here when customers leave items in their cart for too long."
        />
      ) : (
        <DataTable columns={columns} data={carts} isLoading={isLoading}
          page={page} totalPages={pagination?.totalPages ?? 1} onPageChange={setPage}
          emptyMessage="No abandoned carts" />
      )}

      <Modal
        open={!!selectedCart}
        onClose={() => setSelectedCart(null)}
        title={selectedCart ? `${selectedCart.profile.firstName} ${selectedCart.profile.lastName}'s Cart` : "Cart Details"}
        size="lg"
      >
        {selectedCart && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-200">
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Customer</p>
                <p className="text-sm text-neutral-900">{selectedCart.profile.firstName} {selectedCart.profile.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Email</p>
                <p className="text-sm text-neutral-900">{selectedCart.profile.email}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Phone</p>
                <p className="text-sm text-neutral-900">{selectedCart.profile.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Last Active</p>
                <p className="text-sm text-neutral-900">{relativeTime(selectedCart.updatedAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium mb-2">Cart Items ({selectedCart.items.length})</p>
              <div className="space-y-2">
                {selectedCart.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{item.variant.product.name}</p>
                      <p className="text-xs text-neutral-500">SKU: {item.variant.sku} - {formatPrice(item.variant.price)} each</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-sm text-neutral-900">{item.quantity} x {formatPrice(item.variant.price)}</p>
                      <p className="text-xs text-neutral-500">{formatPrice(item.quantity * item.variant.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
              <p className="text-sm text-neutral-600">Cart Total</p>
              <p className="text-lg font-display text-neutral-900">{formatPrice(total(selectedCart))}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
