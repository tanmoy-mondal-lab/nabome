import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { EmptyState } from "../common/EmptyState";
import { Heart, Search } from "lucide-react";

interface WishlistItem {
  id: string;
  profileId: string;
  variantId: string;
  createdAt: string;
  profile: { firstName: string; lastName: string; email: string };
  variant: { id: string; sku: string; price: number; product: { name: string; slug: string } };
}

export default function WishlistsPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [profileId, setProfileId] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, limit: 25 };
      if (profileId) params.profileId = profileId;
      const res = await adminApi.getWishlists(params) as { wishlistItems: WishlistItem[]; pagination?: { totalPages: number } };
      setItems(res.wishlistItems ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [page, profileId]);

  useEffect(() => { setPage(1); }, [profileId]);
  useEffect(() => { fetch(); }, [fetch]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Wishlists</h1>
          <p className="text-sm text-neutral-500 mt-1">{items.length} wishlist items</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input value={profileId} onChange={(e) => setProfileId(e.target.value)}
          placeholder="Filter by profile ID..."
          className="w-full max-w-xs pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={Heart} title="No wishlist items" />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Added Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-900">{item.profile.firstName} {item.profile.lastName}</td>
                  <td className="px-4 py-3 text-neutral-500">{item.profile.email}</td>
                  <td className="px-4 py-3 text-neutral-900">{item.variant.product.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">{item.variant.sku}</td>
                  <td className="px-4 py-3 text-neutral-900">${item.variant.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-neutral-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 text-sm text-neutral-600 bg-neutral-100 rounded hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
              <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 text-sm text-neutral-600 bg-neutral-100 rounded hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
