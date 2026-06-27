import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Clock, Sparkles } from "lucide-react";
import { useUIStore } from "../stores/ui-store";
import { useSearch } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { SafeImage } from "../../components/SafeImage";
import { formatPrice } from "../../lib/utils/format";

const TRENDING = ["Summer Dresses", "Linen Shirts", "Leather Bags", "Sneakers", "Silk Scarves"];

function getUserKey(): string {
  try {
    const raw = localStorage.getItem("nabome-auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.user?.id ?? "guest";
    }
  } catch {}
  return "guest";
}

const SEARCH_KEY = "nabome-recent-searches";

export function SearchOverlay() {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data } = useSearch(debouncedQuery);
  const { data: categories = [] } = useCategories();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem(`${SEARCH_KEY}-${getUserKey()}`) || "[]")); } catch {}
  }, []);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => inputRef.current?.focus(), 100);
    if (!isSearchOpen) setQuery("");
  }, [isSearchOpen]);

  function handleSearch(term: string) {
    const updated = [term, ...recent.filter((s) => s !== term)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem(`${SEARCH_KEY}-${getUserKey()}`, JSON.stringify(updated));
    closeSearch();
  }

  const results = data?.products as Record<string, unknown>[] ?? [];
  const matchingCategories = query.length >= 1
    ? categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div className="container-page py-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative flex-1 max-w-3xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && query.trim()) handleSearch(query.trim()); }}
                  placeholder="Search products, categories, collections..."
                  className="w-full pl-12 pr-4 py-4 text-lg border-b-2 border-neutral-900 focus:outline-none focus:border-accent-gold bg-transparent"
                />
              </div>
              <button onClick={closeSearch} className="p-2.5 hover:text-neutral-600 transition-colors" aria-label="Close search"><X className="w-6 h-6" /></button>
            </div>

            {!query && (
              <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 mb-4 editorial-caption">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </div>
                  <ul className="space-y-3">
                    {TRENDING.map((t) => (
                      <li key={t}>
                        <button onClick={() => { setQuery(t); handleSearch(t); }} className="text-sm text-neutral-700 hover:text-brand-500 transition-colors tracking-fashion">
                          {t}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 mb-4 editorial-caption">
                    <Sparkles className="w-3 h-3" /> Categories
                  </div>
                  <ul className="space-y-3">
                    {categories.slice(0, 6).map((c) => (
                      <li key={c.slug}>
                        <Link to={`/products?category=${c.slug}`} onClick={closeSearch} className="text-sm text-neutral-700 hover:text-brand-500 transition-colors tracking-fashion">
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                {recent.length > 0 && (
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 mb-4 editorial-caption">
                      <Clock className="w-3 h-3" /> Recent Searches
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recent.map((r) => (
                        <button key={r} onClick={() => { setQuery(r); handleSearch(r); }}
                          className="text-xs bg-neutral-100 px-3 py-1.5 rounded-full text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 transition-colors">
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {query && matchingCategories.length > 0 && results.length === 0 && (
              <div className="max-w-3xl mx-auto mb-6">
                <p className="text-xs uppercase tracking-widest text-neutral-400 mb-3">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {matchingCategories.map((c) => (
                    <Link key={c.slug} to={`/products?category=${c.slug}`} onClick={closeSearch}
                      className="text-sm bg-neutral-100 px-4 py-2 rounded text-neutral-700 hover:bg-neutral-900 hover:text-white transition-all">
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {query && results.length > 0 && (
              <div className="max-w-5xl mx-auto space-y-6">
                <p className="text-xs text-neutral-400">{(data as Record<string, unknown>)?.pagination ? ((data as Record<string, unknown>).pagination as { total?: number }).total ?? 0 : 0} results for "{query}"</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {results.slice(0, 8).map((p) => {
                    const images = p.images as { url: string }[] ?? [];
                    return (
                      <Link key={p.id as string} to={`/products/${p.slug}`} onClick={closeSearch} className="group premium-card p-3 shadow-subtle hover:shadow-card transition-shadow">
                        <div className="aspect-[3/4] bg-neutral-50 mb-2 overflow-hidden rounded">
                          <SafeImage src={images[0]?.url} alt={p.name as string} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <p className="text-sm font-medium text-neutral-900 truncate">{p.name as string}</p>
                        <p className="text-sm text-brand-600">{formatPrice(Number(p.basePrice))}</p>
                      </Link>
                    );
                  })}
                </div>
                {((((data as Record<string, unknown>)?.pagination as { total?: number })?.total ?? 0) > 8) && (
                  <Link to={`/search?q=${encodeURIComponent(query)}`} onClick={closeSearch} className="block text-center text-sm text-brand-600 hover:underline py-4">
                    View all {((data as Record<string, unknown>)?.pagination as { total?: number })?.total ?? 0} results
                  </Link>
                )}
              </div>
            )}

            {query && results.length === 0 && query.length >= 2 && (
              <div className="max-w-3xl mx-auto text-center py-12">
                <Search className="w-10 h-10 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500">No products found for "{query}"</p>
                <p className="text-xs text-neutral-400 mt-1">Try a different search term or browse categories.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
