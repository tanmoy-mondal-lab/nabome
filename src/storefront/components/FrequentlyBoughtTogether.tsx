import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cart-store";
import { useAuthStore } from "../../stores/auth-store";
import { formatPrice } from "../../lib/utils/format";
import { SafeImage } from "../../components/SafeImage";
import { useSettings } from "../hooks/useSettings";
import type { Product } from "../../types/product";

interface FrequentlyBoughtTogetherProps {
  products: Product[];
  mainProduct: Product;
}

export function FrequentlyBoughtTogether({ products, mainProduct }: FrequentlyBoughtTogetherProps) {
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: settingsData } = useSettings();
  if (!products.length) return null;

  const bundleDiscountPercent = Number(settingsData?.preferences?.bundleDiscountPercent ?? 10);
  const mainPrice = Number(mainProduct.basePrice ?? 0);
  const total = products.reduce((sum, p) => sum + Number(p.basePrice ?? 0), mainPrice);
  const discount = Math.round(total * bundleDiscountPercent / 100);
  const bundlePrice = total - discount;

  function handleAddAll() {
    if (!isAuthenticated) {
      void navigate("/auth/login", { state: { from: typeof window !== 'undefined' ? window.location.pathname : '/' } });
      return;
    }
    const all = [mainProduct, ...products];
    const store = useCartStore.getState();
    const bundleFactor = 1 - bundleDiscountPercent / 100;

    all.forEach((p) => {
      const images = p.images ?? [];
      const variants = p.variants ?? [];
      const v = variants[0];
      if (!v) return;

      const variantId = v.id;
      const fullPrice = Number(p.basePrice ?? 0) + Number(v.priceAdjustment ?? 0);
      const discountedPrice = Math.round(fullPrice * bundleFactor * 100) / 100;

      const existing = store.items.find((i) => i.variantId === variantId);
      if (existing) {
        store.removeItem(variantId);
      }

      void addItem({
        productId: p.id,
        variantId,
        name: p.name,
        slug: p.slug,
        sku: v.sku || "",
        size: v.size || "One Size",
        color: v.color || "",
        colorHex: v.colorHex || "",
        image: images[0]?.url || "",
        price: discountedPrice,
        compareAtPrice: fullPrice,
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
            <div key={i} className="flex items-center gap-2 shrink-0">
              {i > 0 && <span className="text-neutral-300 text-lg">+</span>}
              <div className="flex flex-col items-center gap-1">
                <SafeImage src={images[0]?.url || "/placeholder.svg"} alt={p.name as string} responsive className="w-16 h-20 object-cover bg-neutral-100" />
                <p className="text-[10px] text-neutral-500 text-center max-w-[64px] truncate">{p.name as string}</p>
              </div>
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
