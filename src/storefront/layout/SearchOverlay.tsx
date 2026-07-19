import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Clock, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "../stores/ui-store";
import { useSearch } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { SafeImage } from "../../components/SafeImage";
import { formatPrice } from "../../lib/utils/format";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { api } from "../../lib/api/client";

const FALLBACK_TRENDING = ["Summer Dresses", "Linen Shirts", "Leather Bags", "Sneakers", "Silk Scarves"];

function getUserKey(): string {
  try {
    const raw = localStorage.getItem("nabome-auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.user?.id ?? "guest";
    }
  } catch (err) { /* non-critical */ if (import.meta.env.DEV) console.debug("Failed to parse auth store:", err); }
  return "guest";
}

const SEARCH_KEY = "nabome-recent-searches";

export function SearchOverlay() {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useFocusTrap<HTMLDivElement>(isSearchOpen, closeSearch);
  const { data, isFetching, isError } = useSearch(debouncedQuery);
  const { data: categories = [] } = useCategories();

  const { data: trendingData } = useQuery({
    queryKey: ["search-trending"],
    queryFn: () => api.get<{ trending: string[] }>("/api/search/trending"),
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  const { data: autocompleteData } = useQuery({
    queryKey: ["search-autocomplete", debouncedQuery],
    queryFn: () => api.get<{ suggestions: Array<{ id: string; name: string; slug: string; price: number; image: string | null }> }>("/api/products/autocomplete", { params: { q: debouncedQuery } }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const trending = trendingData?.trending ?? FALLBACK_TRENDING;
  const suggestions = autocompleteData?.suggestions ?? [];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem(`${SEARCH_KEY}-${getUserKey()}`) || "[]")); } catch (err) { /* non-critical */ if (import.meta.env.DEV) console.debug("Failed to load recent searches:", err); }
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => inputRef.current?.focus(), 100);
    if (!isSearchOpen) setQuery("");
  }, [isSearchOpen]);

  function handleSearch(term: string) {
    const updated = [term, ...recent.filter((s) => s !== term)].slice(0, 5);
    setRecent(updated);
    try { localStorage.setItem(`${SEARCH_KEY}-${getUserKey()}`, JSON.stringify(updated)); } catch (err) { /* non-critical */ if (import.meta.env.DEV) console.debug("Failed to save recent searches:", err); }
    closeSearch();
  }

  const results = data?.products ?? [];
  const matchingCategories = query.length >= 1
    ? categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          tabIndex={-1}
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
                  aria-label="Search products"
                  className="w-full md:py-5 md:text-xl md:border-b md:border-neutral-200 md:focus:border-neutral-900 pl-12 pr-4 py-4 text-lg border-b border-neutral-200 focus:outline-none focus:border-neutral-900 bg-transparent"
                />
              </div>
              <button onClick={closeSearch} className="p-2.5 md:text-neutral-400 md:hover:text-neutral-700 hover:text-neutral-600 transition-colors" aria-label="Close search"><X className="md:w-5 md:h-5 w-6 h-6" /></button>
            </div>

            {!query && (
              <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 md:gap-12 gap-8">
                <div>
                  <div className="flex items-center gap-2 md:text-[10px] md:tracking-[0.2em] md:text-neutral-400 md:mb-5 text-xs uppercase tracking-widest text-neutral-500 mb-4 editorial-caption">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </div>
                  <ul className="md:space-y-4 space-y-3">
                    {trending.map((t) => (
                      <li key={t}>
                        <button onClick={() => { setQuery(t); handleSearch(t); }} className="md:text-[13px] md:text-neutral-600 md:hover:text-neutral-900 md:tracking-wide text-sm text-neutral-700 hover:text-brand-500 transition-colors tracking-fashion" aria-label={`Search for ${t}`}>
                          {t}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 md:text-[10px] md:tracking-[0.2em] md:text-neutral-400 md:mb-5 text-xs uppercase tracking-widest text-neutral-500 mb-4 editorial-caption">
                    <Sparkles className="w-3 h-3" /> Categories
                  </div>
                  <ul className="md:space-y-4 space-y-3">
                    {categories.slice(0, 6).map((c) => (
                      <li key={c.slug}>
                        <Link to={`/products?category=${c.slug}`} onClick={closeSearch} className="md:text-[13px] md:text-neutral-600 md:hover:text-neutral-900 md:tracking-wide text-sm text-neutral-700 hover:text-brand-500 transition-colors tracking-fashion">
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                {recent.length > 0 && (
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 md:text-[10px] md:tracking-[0.2em] md:text-neutral-400 md:mb-5 text-xs uppercase tracking-widest text-neutral-500 mb-4 editorial-caption">
                      <Clock className="w-3 h-3" /> Recent Searches
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recent.map((r) => (
                        <button key={r} onClick={() => { setQuery(r); handleSearch(r); }}
                          className="md:text-[11px] md:bg-transparent md:border md:border-neutral-200 md:px-4 md:py-2 md:text-neutral-600 md:hover:border-neutral-400 md:transition-all md:rounded-none text-xs bg-neutral-100 px-3 py-1.5 rounded-full text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 transition-colors">
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
                <p className="md:text-[10px] md:tracking-[0.2em] text-xs uppercase tracking-widest text-neutral-400 mb-3">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {matchingCategories.map((c) => (
                    <Link key={c.slug} to={`/products?category=${c.slug}`} onClick={closeSearch}
                      className="md:text-[12px] md:bg-transparent md:border md:border-neutral-200 md:px-5 md:py-2.5 md:text-neutral-600 md:hover:border-neutral-900 md:hover:text-neutral-900 md:rounded-none text-sm bg-neutral-100 px-4 py-2 rounded text-neutral-700 hover:bg-neutral-900 hover:text-white transition-all">
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {query && suggestions.length > 0 && (
              <div className="max-w-3xl mx-auto mb-6">
                <p className="md:text-[10px] md:tracking-[0.2em] text-xs uppercase tracking-widest text-neutral-400 mb-3">Suggestions</p>
                <div className="space-y-2">
                  {suggestions.map((s) => (
                    <Link key={s.id} to={`/products/${s.slug}`} onClick={closeSearch} className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                      {s.image && (
                        <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                          <SafeImage src={s.image} alt={s.name} premium className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="md:text-[13px] text-sm font-medium text-neutral-900 truncate">{s.name}</p>
                        <p className="md:text-[12px] text-xs text-neutral-500">{formatPrice(s.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {query && isFetching && (
              <div className="max-w-5xl mx-auto flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
              </div>
            )}

            {query && !isFetching && results.length > 0 && (
              <div className="max-w-5xl mx-auto space-y-6">
                <p className="md:text-[11px] text-xs text-neutral-400">{data?.pagination?.total ?? 0} results for &ldquo;{query}&rdquo;</p>
                <div className="grid grid-cols-2 md:grid-cols-4 md:gap-6 gap-4">
                  {results.slice(0, 8).map((p) => {
                    const images = p.images ?? [];
                    return (
                      <Link key={p.id} to={`/products/${p.slug}`} onClick={closeSearch} className="group md:p-0 p-3 premium-card md:border-0 md:shadow-none">
                        <div className="aspect-[3/4] bg-neutral-50 mb-2 overflow-hidden md:rounded-none rounded">
                          <SafeImage src={images[0]?.url} alt={p.name} premium className="w-full h-full object-cover md:group-hover:scale-[1.03] group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <p className="md:text-[13px] md:font-normal text-sm font-medium text-neutral-900 truncate">{p.name}</p>
                        <p className="md:text-[13px] md:text-neutral-500 text-sm text-brand-600">{formatPrice(Number(p.basePrice))}</p>
                      </Link>
                    );
                  })}
                </div>
                {((data?.pagination?.total ?? 0) > 8) && (
                  <Link to={`/search?q=${encodeURIComponent(query)}`} onClick={closeSearch} className="block text-center md:text-[12px] md:text-neutral-500 md:hover:text-neutral-900 md:py-6 text-sm text-brand-600 hover:underline py-4">
                    View all {data?.pagination?.total ?? 0} results
                  </Link>
                )}
              </div>
            )}

            {query && !isFetching && isError && (
              <div className="max-w-3xl mx-auto text-center py-12">
                <Search className="w-10 h-10 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500">Search failed. Please try again.</p>
                <p className="text-xs text-neutral-400 mt-1">Check your connection and try again.</p>
              </div>
            )}

            {query && !isFetching && results.length === 0 && debouncedQuery.length >= 2 && !isError && (
              <div className="max-w-3xl mx-auto text-center py-12">
                <Search className="w-10 h-10 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500">No products found for &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-neutral-400 mt-1">Try a different search term or browse categories.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
