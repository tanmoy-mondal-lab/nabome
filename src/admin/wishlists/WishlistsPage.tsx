import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { EmptyState } from "../common/EmptyState";
import { Heart, Search, ExternalLink } from "lucide-react";
import { formatPrice } from "../../lib/utils/format";
import { SafeImage } from "../../components/SafeImage";

interface ProductWishlist {
  productId: string;
  name: string;
  slug: string;
  basePrice: number;
  gender: string;
  imageUrl: string | null;
  wishlistCount: number;
  variantCount: number;
  variants: { sku: string; size: string; color: string }[];
}

interface WishlistsResponse {
  products: ProductWishlist[];
  pagination: { total: number; totalPages: number; page: number; pageSize: number };
}

export default function WishlistsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => { setPage(1); }, [search]);

  const { data, isLoading } = useQuery<WishlistsResponse>({
    queryKey: ["admin", "wishlists", page, search],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = { page, limit: 25 };
      if (search) params.search = search;
      return adminApi.getWishlists(params) as Promise<WishlistsResponse>;
    },
  });

  const products = data?.products ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="premium-card rounded-2xl px-6 py-5 flex items-center gap-3 shadow-subtle">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Loading wishlists…</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Wishlisted Products</h1>
          <p className="text-sm text-neutral-500 mt-1">{total} product{total !== 1 ? "s" : ""} wishlisted by customers</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full max-w-xs pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {products.length === 0 ? (
        <div className="premium-card rounded-2xl">
          <EmptyState icon={Heart} title="No wishlisted products" description="Products added to wishlists by customers will appear here." />
        </div>
      ) : (
        <div className="premium-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Product</th>
                  <th className="text-center px-4 py-3 font-medium text-neutral-600">Wishlists</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Gender</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Variants</th>
                  <th className="text-center px-4 py-3 font-medium text-neutral-600">Link</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.productId} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-neutral-100 overflow-hidden flex-shrink-0">
                          <SafeImage src={product.imageUrl ?? undefined} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{product.name}</p>
                          <p className="text-xs text-neutral-400">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-semibold ${
                        product.wishlistCount >= 10
                          ? "bg-red-100 text-red-700"
                          : product.wishlistCount >= 5
                            ? "bg-amber-100 text-amber-700"
                            : "bg-neutral-100 text-neutral-600"
                      }`}>
                        {product.wishlistCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-900">{formatPrice(product.basePrice)}</td>
                    <td className="px-4 py-3 text-neutral-500 capitalize">{product.gender}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      {product.variants.slice(0, 3).map((v) => `${v.size}/${v.color}`).join(", ")}
                      {product.variants.length > 3 && ` +${product.variants.length - 3}`}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/products/${product.slug}`}
                        target="_blank"
                        className="text-brand-600 hover:text-brand-700"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
              <p className="text-xs text-neutral-500">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 text-sm text-neutral-600 bg-neutral-100 rounded hover:bg-neutral-200 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 text-sm text-neutral-600 bg-neutral-100 rounded hover:bg-neutral-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
