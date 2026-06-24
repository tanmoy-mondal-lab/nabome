import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cart-store";
import { useAuthStore } from "../../stores/auth-store";
import { PriceDisplay } from "./PriceDisplay";
import { formatPrice } from "../../lib/utils/format";
import { SafeImage } from "../../components/SafeImage";

interface FrequentlyBoughtTogetherProps {
  products: Record<string, unknown>[];
  mainProduct: Record<string, unknown>;
}

export function FrequentlyBoughtTogether({ products, mainProduct }: FrequentlyBoughtTogetherProps) {
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!products.length) return null;

  const mainPrice = Number(mainProduct.basePrice ?? 0);
  const total = products.reduce((sum, p) => sum + Number(p.basePrice ?? 0), mainPrice);
  const discount = Math.round(total * 0.1);
  const bundlePrice = total - discount;

  function handleAddAll() {
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: window.location.pathname } });
      return;
    }
    const all = [mainProduct, ...products];
    all.forEach((p) => {
      const images = (p.images as { url: string }[]) ?? [];
      const variants = (p.variants as Record<string, unknown>[]) ?? [];
      const v = variants[0];
      if (!v) return;
      addItem({
        productId: p.id as string,
        variantId: v.id as string,
        name: p.name as string,
        slug: p.slug as string,
        sku: v.sku as string || "",
        size: v.size as string || "One Size",
        color: v.color as string || "",
        colorHex: v.colorHex as string || "",
        image: images[0]?.url || "",
        price: Number(p.basePrice ?? 0) + Number((v.priceAdjustment as number) ?? 0),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        quantity: 1,
        maxQuantity: (v.stock as number) || 99,
      });
    });
  }

  return (
    <div className="bg-neutral-50 border p-6">
      <h3 className="text-sm font-medium text-neutral-900 mb-4">Frequently Bought Together</h3>
      <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
        {[mainProduct, ...products.slice(0, 3)].map((p, i) => {
          const images = (p.images as { url: string }[]) ?? [];
          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-neutral-300 text-lg">+</span>}
              <SafeImage src={images[0]?.url || "/placeholder.svg"} alt={p.name as string} className="w-16 h-20 object-cover bg-neutral-100" />
            </div>
          );
        })}
      </div>
      <p className="text-sm text-neutral-600 mb-3">
        Total: <span className="line-through text-neutral-400">{formatPrice(total)}</span>
        <span className="text-brand-600 font-medium ml-2">{formatPrice(bundlePrice)}</span>
        <span className="text-xs text-green-600 ml-2">Save {formatPrice(discount)}</span>
      </p>
      <button onClick={handleAddAll} className="bg-neutral-900 text-white px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors">
        Add All to Cart
      </button>
    </div>
  );
}
