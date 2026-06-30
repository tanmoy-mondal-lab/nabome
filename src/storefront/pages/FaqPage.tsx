import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { AlertCircle, ChevronDown } from "lucide-react";
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

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const { data: faqData, isLoading, isError, error } = useQuery<FaqResponse>({
    queryKey: ["cms", "faq"],
    queryFn: () => api.get<FaqResponse>("/api/faq"),
    staleTime: 1000 * 60 * 10,
  });

  const faqGroups = faqData?.faqs ?? {};
  const hasFaqs = Object.keys(faqGroups).length > 0;
  const allFaqs = Object.values(faqGroups).flat();

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
            {allFaqs.map((item, i) => (
              <div key={item.id}>
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <span className="text-body-base font-body font-medium text-neutral-900">{item.question}</span>
                  <ChevronDown className={cn("w-4 h-4 text-neutral-400 shrink-0 transition-transform", openIdx === i && "rotate-180")} />
                </button>
                {openIdx === i && (
                  <p className="pb-5 text-body-sm text-neutral-500 font-editorial leading-relaxed">{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
