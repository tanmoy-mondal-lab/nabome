import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { ShoppingBag, Search, Eye } from "lucide-react";

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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [minAge, setMinAge] = useState("24");
  const [page, setPage] = useState(1);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const limit = 10;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {
        minAge: Number(minAge) || 24,
        page,
        limit,
      };
      const res = await adminApi.getAbandonedCarts(params);
      setCarts((res.carts as Cart[]) ?? []);
      setPagination((res.pagination as Pagination) ?? null);
    } catch {
      /* non-critical: failed to fetch abandoned carts */
    } finally {
      setLoading(false);
    }
  }, [minAge, page]);

  useEffect(() => {
    fetch();
  }, [fetch]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">
            Abandoned Carts
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {pagination?.total ?? 0} abandoned carts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="number"
              min="1"
              value={minAge}
              onChange={(e) => {
                setMinAge(e.target.value);
                setPage(1);
              }}
              className="w-32 pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Min hours"
            />
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
          </div>
        </div>
      </div>

      {carts.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState
            icon={ShoppingBag}
            title="No abandoned carts"
            description="Carts will appear here when customers leave items in their cart."
          />
        </div>
      ) : (
        <>
          <div className="bg-white border border-neutral-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Email
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-neutral-600">
                    Items
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">
                    Last Active
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {carts.map((cart) => (
                  <tr
                    key={cart.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {cart.profile.firstName} {cart.profile.lastName}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {cart.profile.email}
                    </td>
                    <td className="px-4 py-3 text-center text-neutral-600">
                      {cart.items.reduce((s, i) => s + i.quantity, 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-900 font-medium">
                      ${total(cart).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">
                      {relativeTime(cart.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedCart(cart)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded"
                        title="View items"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-neutral-500">
                Page {pagination.page} of {pagination.totalPages} (
                {pagination.total} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded disabled:opacity-30 hover:bg-neutral-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded disabled:opacity-30 hover:bg-neutral-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={!!selectedCart}
        onClose={() => setSelectedCart(null)}
        title={
          selectedCart
            ? `${selectedCart.profile.firstName} ${selectedCart.profile.lastName}'s Cart`
            : "Cart Details"
        }
        size="lg"
      >
        {selectedCart && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-200">
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Customer</p>
                <p className="text-sm text-neutral-900">
                  {selectedCart.profile.firstName}{" "}
                  {selectedCart.profile.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Email</p>
                <p className="text-sm text-neutral-900">
                  {selectedCart.profile.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Phone</p>
                <p className="text-sm text-neutral-900">
                  {selectedCart.profile.phone || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Last Active</p>
                <p className="text-sm text-neutral-900">
                  {relativeTime(selectedCart.updatedAt)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium mb-2">
                Cart Items ({selectedCart.items.length})
              </p>
              <div className="space-y-2">
                {selectedCart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-neutral-50 rounded px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {item.variant.product.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        SKU: {item.variant.sku} &middot; $
                        {item.variant.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-sm text-neutral-900">
                        {item.quantity} &times; ${
                          item.variant.price.toFixed(2)
                        }
                      </p>
                      <p className="text-xs text-neutral-500">
                        ${(item.quantity * item.variant.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
              <p className="text-sm text-neutral-600">Cart Total</p>
              <p className="text-lg font-display text-neutral-900">
                ${total(selectedCart).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
