import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";
import { api } from "../../lib/api/client";
import { ProductGrid } from "../components/ProductGrid";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { canonical } from "../../lib/seo";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q || q.length < 2) return;
    setLoading(true);
    api.get("/api/products", { params: { action: "search", q } })
      .then((res) => {
        const data = res as { products: Record<string, unknown>[]; total: number };
        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
      }).catch(() => {}).finally(() => setLoading(false));
  }, [q]);

  const pageTitle = q ? `Search: "${q}" — নবME` : "Search — নবME";
  const pageDesc = q ? `Search results for "${q}" on নবME — premium fashion.` : "Search নবME for premium fashion.";

  return (
    <div className="container-page py-8">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={canonical(window.location.pathname + window.location.search)} />
        <meta name="robots" content="noindex, follow" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical(window.location.pathname + window.location.search)} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
      </Helmet>
      <Breadcrumbs items={[q ? { label: `Search: "${q}"` } : { label: "Search" }]} className="mb-6" />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display text-neutral-900 mb-1">
            {q ? `Results for "${q}"` : "Search"}
          </h1>
          {q && total > 0 && (
            <p className="text-sm text-neutral-500">{total} {total === 1 ? "product" : "products"} found</p>
          )}
        </div>
      </div>

      {total === 0 && !loading && q.length >= 2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
            <Search className="w-7 h-7 text-neutral-400" />
          </div>
          <h2 className="text-xl font-display text-neutral-900 mb-2">No results found</h2>
          <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto leading-relaxed">
            We couldn't find any products matching "{q}". Try different keywords or browse our collections.
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Browse All Products
          </Link>
        </motion.div>
      )}

      <ProductGrid products={products} isLoading={loading} columns={4} />
    </div>
  );
}
