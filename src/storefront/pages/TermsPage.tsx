import { Helmet } from "react-helmet-async";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { canonical } from "../../lib/seo";

export default function TermsPage() {
  return (
    <div className="container-page section-padding">
      <Helmet>
        <title>Terms of Service — নবME</title>
        <meta name="description" content="Terms of service for নবME online fashion store." />
        <link rel="canonical" href={canonical("/terms")} />
      </Helmet>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]} className="mb-8" />
      <div className="max-w-3xl">
        <h1 className="font-display text-display-3 text-neutral-900 mb-6">Terms of Service</h1>
        <div className="prose prose-neutral space-y-6 text-body-base text-neutral-600 font-editorial leading-relaxed">
          <p>By accessing or using our website, you agree to be bound by these Terms of Service.</p>
          <h2 className="font-display text-heading-3 text-neutral-900 mt-8">Products & Orders</h2>
          <p>We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products and pricing are subject to change at any time without notice.</p>
          <h2 className="font-display text-heading-3 text-neutral-900 mt-8">Returns & Refunds</h2>
          <p>We offer a 30-day return policy on most items. Items must be in their original condition with tags attached.</p>
          <h2 className="font-display text-heading-3 text-neutral-900 mt-8">Contact Us</h2>
          <p>If you have questions about these Terms, please contact us at support@nabome.com.</p>
        </div>
      </div>
    </div>
  );
}
