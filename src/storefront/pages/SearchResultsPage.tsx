import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search } from "lucide-react";
import { useSearch } from "../hooks/useProducts";
import { ProductGrid } from "../components/ProductGrid";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { canonical } from "../../lib/seo";

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(q);

  const { data: searchRes, isLoading: loading, error: queryError } = useSearch(q);

  const products = (searchRes as Record<string, unknown>)?.products as Record<string, unknown>[] ?? [];
  const total = ((searchRes as Record<string, unknown>)?.pagination as { total?: number })?.total ?? 0;

  const pageTitle = q ? `Search: "${q}" — নবME` : "Search — নবME";
  const pageDesc = q ? `Search results for "${q}" on নবME — premium fashion.` : "Search নবME for premium fashion.";

  useEffect(() => {
    setSearchTerm(q);
  }, [q]);

  function handleSubmit() {
    const next = searchTerm.trim();
    const params = new URLSearchParams(searchParams);
    if (next) params.set("q", next);
    else params.delete("q");
    params.set("page", "1");
    setSearchParams(params);
  }

  return (
    <div className="container-page py-8">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={canonical(window.location.pathname + window.location.search)} />
        <meta name="robots" content="noindex, follow" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
      </Helmet>

      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Search" },
      ]} className="mb-6" />

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display text-neutral-900">
          {q ? <>Results for &ldquo;{q}&rdquo;</> : "Search"}
        </h1>
        {q && !loading && (
          <p className="text-neutral-500 text-sm mt-1">{total} {total === 1 ? "result" : "results"} found</p>
        )}
      </div>

      <div className="max-w-2xl mb-8">
        <label className="block text-xs uppercase tracking-[0.15em] text-neutral-500 mb-2" htmlFor="search-results-input">
          Search
        </label>
        <div className="flex gap-3">
          <input
            id="search-results-input"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            placeholder="Search products, categories, collections..."
            className="flex-1 input-field"
          />
          <button type="button" onClick={handleSubmit} className="btn-primary px-5">
            Search
          </button>
        </div>
      </div>

      {queryError ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <Search size={28} className="text-red-400" />
          </div>
          <p className="text-neutral-500 text-lg mb-2">Failed to load search results.</p>
          <p className="text-neutral-400 text-sm mb-4">Please try again or browse our collections.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <ProductGrid products={products} />
      ) : q ? (
        <div className="text-center py-20">
          <Search size={48} className="mx-auto text-neutral-300 mb-4" />
          <p className="text-neutral-500 text-lg">No results found for &ldquo;{q}&rdquo;</p>
          <p className="text-neutral-400 text-sm mt-2">Try a different search term or browse our collections.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/collections" className="text-brand-500 hover:underline text-sm">Browse collections</Link>
            <Link to="/products" className="text-brand-500 hover:underline text-sm">View all products</Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <Search size={48} className="mx-auto text-neutral-300 mb-4" />
          <p className="text-neutral-500 text-lg">Enter a search term to find products</p>
        </div>
      )}
    </div>
  );
}
