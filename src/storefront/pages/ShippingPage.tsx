import { Breadcrumbs } from "../components/Breadcrumbs";
import { Truck } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import { formatPrice } from "../../lib/utils/format";

export default function ShippingPage() {
  const { data: settingsData } = useSettings();
  const freeShippingThreshold = Number((settingsData?.preferences as Record<string, unknown>)?.freeShippingThreshold ?? 500);
  const shippingCost = Number((settingsData?.preferences as Record<string, unknown>)?.shippingCost ?? 99);

  return (
    <div className="container-page section-padding">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shipping Information" }]} className="mb-8" />
      <div className="max-w-3xl">
        <h1 className="font-display text-display-3 text-neutral-900 mb-6">Shipping Information</h1>
        <div className="prose prose-neutral space-y-6 text-body-base text-neutral-600 font-editorial leading-relaxed">
          <div className="flex items-center gap-3 bg-luxe-ivory p-5 border mb-8">
            <Truck className="w-6 h-6 text-brand-500 shrink-0" />
            <p className="text-body-sm font-body font-medium text-neutral-900">Free shipping on orders above {formatPrice(freeShippingThreshold)}</p>
          </div>
          <h2 className="font-display text-heading-3 text-neutral-900 mt-8">Standard Shipping</h2>
          <p>Estimated delivery in 5-7 business days. A flat rate of {formatPrice(shippingCost)} applies for orders below the free shipping threshold.</p>
          <h2 className="font-display text-heading-3 text-neutral-900 mt-8">Express Shipping</h2>
          <p>Estimated delivery in 2-3 business days. Available at checkout for select pin codes.</p>
          <h2 className="font-display text-heading-3 text-neutral-900 mt-8">Order Tracking</h2>
          <p>You will receive tracking details via email and SMS once your order has been dispatched.</p>
          <h2 className="font-display text-heading-3 text-neutral-900 mt-8">Contact Us</h2>
          <p>For shipping inquiries, reach out to support@nabome.com.</p>
        </div>
      </div>
    </div>
  );
}
