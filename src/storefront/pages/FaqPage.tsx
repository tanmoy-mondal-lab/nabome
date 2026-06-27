import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils/cn";
import { canonical } from "../../lib/seo";

const FAQ_ITEMS = [
  { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI, net banking, and Cash on Delivery (COD)." },
  { q: "How long does shipping take?", a: "Standard shipping takes 5-7 business days. Express shipping delivers within 2-3 business days." },
  { q: "What is your return policy?", a: "We offer a 30-day return policy. Items must be unworn with original tags attached." },
  { q: "How can I track my order?", a: "Once your order ships, you'll receive a tracking link via email and SMS." },
  { q: "Do you offer free shipping?", a: "Yes! Free shipping is available on orders above ₹500." },
];

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

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
        <div className="divide-y divide-neutral-100 border-t border-neutral-100">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left"
              >
                <span className="text-body-base font-body font-medium text-neutral-900">{item.q}</span>
                <ChevronDown className={cn("w-4 h-4 text-neutral-400 shrink-0 transition-transform", openIdx === i && "rotate-180")} />
              </button>
              {openIdx === i && (
                <p className="pb-5 text-body-sm text-neutral-500 font-editorial leading-relaxed">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
