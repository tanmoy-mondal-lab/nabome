import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { Receipt, Search } from "lucide-react";

interface Redemption {
  id: string;
  couponId: string;
  orderId: string;
  profileId: string;
  discountAmount: number;
  createdAt: string;
  coupon: { code: string };
  order: { orderNumber: string; total: number };
  profile: { firstName: string; lastName: string; email: string };
}

export default function CouponRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; perPage: number; total: number; totalPages: number } | null>(null);
  const [search, setSearch] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, limit: 20 };
      if (search) params.search = search;
      const res = await adminApi.getCouponRedemptions(params);
      setRedemptions((res.redemptions as Redemption[]) ?? []);
      setPagination((res.pagination as typeof pagination) ?? null);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Coupon Redemptions</h1>
          <p className="text-sm text-neutral-500 mt-1">{pagination?.total ?? redemptions.length} redemptions</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search redemptions..."
            className="pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 w-60"
          />
        </div>
      </div>

      {redemptions.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={Receipt} title="No redemptions found" description={search ? "Try a different search term" : undefined} />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Coupon Code</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Customer</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Discount Amount</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{r.coupon.code}</td>
                  <td className="px-4 py-3 text-neutral-700">#{r.order.orderNumber}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {r.profile.firstName} {r.profile.lastName}
                    <p className="text-xs text-neutral-400">{r.profile.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-900">{formatCurrency(r.discountAmount)}</td>
                  <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-neutral-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
