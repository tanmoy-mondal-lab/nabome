import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { AlertCircle, ChevronDown, Search, Minus, Plus } from "lucide-react";
import { cn } from "../../lib/utils/cn";
import { canonical } from "../../lib/seo";
import { api } from "../../lib/api/client";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FaqResponse {
  faqs: Record<string, FaqItem[]>;
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-amber-200 text-neutral-900 px-0.5">{part}</mark>
      : part
  );
}

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    document.title = "FAQ — নবME";
  }, []);

  const { data: faqData, isLoading, isError, error } = useQuery<FaqResponse>({
    queryKey: ["cms", "faq"],
    queryFn: () => api.get<FaqResponse>("/api/faq"),
    staleTime: 1000 * 60 * 10,
  });

  const faqGroups = faqData?.faqs ?? {};
  const hasFaqs = Object.keys(faqGroups).length > 0;

  const allCategories = useMemo(() => {
    return Object.keys(faqGroups).filter((key) => faqGroups[key].some((item) => item.category));
  }, [faqGroups]);

  const filteredFaqs = useMemo(() => {
    const all = Object.values(faqGroups).flat();
    const query = searchQuery.trim().toLowerCase();
    return all.filter((item) => {
      const matchesSearch = !query
        || item.question.toLowerCase().includes(query)
        || item.answer.toLowerCase().includes(query);
      const matchesCategory = !activeCategory || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [faqGroups, searchQuery, activeCategory]);

  const resultCount = filteredFaqs.length;

  const allExpanded = openIdx === -2;

  function toggleExpandAll() {
    if (allExpanded) {
      setOpenIdx(null);
    } else {
      setOpenIdx(-2);
    }
  }

  function handleToggle(idx: number) {
    if (openIdx === idx) {
      setOpenIdx(null);
    } else if (allExpanded) {
      setOpenIdx(idx);
    } else {
      setOpenIdx(idx);
    }
  }

  return (
    <div className="container-page section-padding">
      <Helmet>
        <title>FAQ — নবME</title>
        <meta name="description" content="Frequently asked questions about orders, shipping, returns, and payments at নবME." />
        <link rel="canonical" href={canonical("/faq")} />
      </Helmet>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} className="mb-8" />
      <div className="max-w-3xl">
        <h1 className="font-display text-display-3 text-neutral-900 mb-10">Frequently Asked Questions</h1>

        {!isLoading && !isError && hasFaqs && (
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setOpenIdx(null); }}
                placeholder="Search FAQs..."
                className="w-full pl-11 pr-4 py-3 border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                aria-label="Search FAQs"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                  className={cn(
                    "px-3 py-1.5 text-xs uppercase tracking-wider transition-all duration-200",
                    activeCategory === category
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  {category}
                </button>
              ))}
              {activeCategory && (
                <button
                  onClick={() => setActiveCategory(null)}
                  className="px-3 py-1.5 text-xs uppercase tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">
                {resultCount} {resultCount === 1 ? "result" : "results"}
              </p>
              <button
                onClick={toggleExpandAll}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                {allExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {allExpanded ? "Collapse All" : "Expand All"}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Unable to load FAQs</p>
              <p className="mt-1 text-red-600">{error instanceof Error ? error.message : "Please try again later."}</p>
            </div>
          </div>
        ) : !hasFaqs ? (
          <div className="border border-neutral-100 bg-neutral-50 px-5 py-8 text-center">
            <p className="text-sm font-medium text-neutral-900">No FAQs are published yet.</p>
            <p className="mt-2 text-sm text-neutral-500">Published FAQ items from the admin panel will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 border-t border-neutral-100">
            {filteredFaqs.map((item, i) => {
              const isOpen = openIdx === i || allExpanded;
              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleToggle(i)}
                    className="w-full flex items-center justify-between py-5 text-left gap-4"
                  >
                    <span className="text-body-base font-body font-medium text-neutral-900">
                      {searchQuery.trim() ? highlightText(item.question, searchQuery) : item.question}
                    </span>
                    <ChevronDown className={cn("w-4 h-4 text-neutral-400 shrink-0 transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <p className="pb-5 text-body-sm text-neutral-500 font-editorial leading-relaxed">{item.answer}</p>
                  )}
                </div>
              );
            })}
            {resultCount === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-neutral-500">No FAQs match your search.</p>
                <button
                  onClick={() => { setSearchQuery(""); setActiveCategory(null); }}
                  className="mt-2 text-xs text-brand-500 hover:underline uppercase tracking-wider"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
