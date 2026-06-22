import { Truck, RotateCcw, Shield, Headphones } from "lucide-react";

interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface TrustBarSectionProps {
  section: SectionData;
}

interface TrustItem {
  title: string;
  description: string;
}

const defaultItems: TrustItem[] = [
  { title: "Free Shipping", description: "On orders above ₹999" },
  { title: "Easy Returns", description: "30-day return policy" },
  { title: "Secure Payment", description: "100% secure checkout" },
  { title: "Premium Service", description: "Dedicated support" },
];

const iconMap: Record<string, typeof Truck> = {
  Truck,
  RotateCcw,
  Shield,
  Headphones,
};

const defaultIcons = [Truck, RotateCcw, Shield, Headphones];

export default function TrustBarSection({ section }: TrustBarSectionProps) {
  const content = section.content ?? {};
  const items = (content.items as TrustItem[] | undefined) ?? defaultItems;
  const icons = items.map((_, i) => defaultIcons[i] ?? Truck);

  return (
    <section className="container-wide section-padding-sm border-t border-neutral-100">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-10">
        {items.map((item, i) => {
          const Icon = iconMap[item.title.replace(/\s+/g, "")] ?? icons[i];
          return (
            <div key={item.title} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-600 mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-900 mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-neutral-500">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
