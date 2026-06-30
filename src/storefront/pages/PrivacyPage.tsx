import { Helmet } from "react-helmet-async";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { canonical } from "../../lib/seo";

export default function PrivacyPage() {
  return (
    <div className="container-page section-padding">
      <Helmet>
        <title>Privacy Policy — নবME</title>
        <meta name="description" content="Read our privacy policy." />
        <link rel="canonical" href={canonical("/privacy")} />
        <meta property="og:title" content="Privacy Policy — নবME" />
        <meta property="og:description" content="Read our privacy policy." />
      </Helmet>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} className="mb-8" />
      <div className="max-w-3xl">
        <h1 className="font-display text-display-3 text-neutral-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-neutral space-y-6 text-body-base text-neutral-600 font-editorial leading-relaxed">
          <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
          <h2 className="font-display text-heading-3 text-neutral-900 mt-8">Information We Collect</h2>
          <p>We may collect information about you in a variety of ways, including personal data such as your name, email address, shipping address, and payment information.</p>
          <h2 className="font-display text-heading-3 text-neutral-900 mt-8">How We Use Your Information</h2>
          <p>We use the information we collect to process transactions, send order updates, improve our services, and communicate with you about products and promotions.</p>
          <h2 className="font-display text-heading-3 text-neutral-900 mt-8">Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at support@nabome.com.</p>
        </div>
      </div>
    </div>
  );
}
