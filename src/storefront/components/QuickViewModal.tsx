import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Eye } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";
import { ColorSelector } from "./ColorSelector";
import { SizeSelector } from "./SizeSelector";
import { QuantitySelector } from "./QuantitySelector";
import { useCartStore } from "../stores/cart-store";
import { useAuthStore } from "../../stores/auth-store";
import { cn } from "../../lib/utils/cn";
import { SafeImage } from "../../components/SafeImage";

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Record<string, any> | null;
}

export function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedColor("");
    setSelectedSize("");
    setQuantity(1);
  }, [product?.id]);

  if (!product) return null;

  const name = product.name as string;
  const slug = product.slug as string;
  const basePrice = Number(product.basePrice ?? 0);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const price = salePrice && salePrice > 0 ? salePrice : basePrice;
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const images = (product.images as { url: string }[]) ?? [];
  const variants = (product.variants as Record<string, unknown>[]) ?? [];
  const shortDescription = product.shortDescription as string;

  const colorMap = new Map<string, { hex: string; name: string }>();
  variants.forEach((v) => {
    const hex = v.colorHex as string;
    const name = v.color as string || hex;
    if (hex && !colorMap.has(hex)) {
      colorMap.set(hex, { hex, name });
    }
  });
  const colorOptions = Array.from(colorMap.values());

  const filteredVariants = selectedColor
    ? variants.filter((v) => (v.colorHex as string) === selectedColor)
    : variants;
  const sizes = [...new Set(filteredVariants.map((v) => v.size as string).filter(Boolean))];

  const stock: Record<string, number> = {};
  filteredVariants.forEach((v) => {
    const s = v.size as string;
    if (s) stock[s] = Number(v.stock ?? 0);
  });

  const selectedVariant = variants.find(
    (v) => (v.colorHex as string) === selectedColor && (v.size as string) === selectedSize
  );

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    if (!isAuthenticated) {
      onClose();
      navigate("/auth/login", { state: { from: window.location.pathname } });
      return;
    }
    addItem({
      productId: product.id as string,
      variantId: (selectedVariant.id as string) || (selectedVariant.sku as string),
      name,
      slug,
      sku: selectedVariant.sku as string,
      size: selectedSize,
      color: colorOptions.find((c) => c.hex === selectedColor)?.name || selectedColor,
      colorHex: selectedColor,
      image: images[0]?.url || "",
      price: price + Number(selectedVariant.priceAdjustment ?? 0),
      compareAtPrice,
      quantity,
      maxQuantity: Number(selectedVariant.stock ?? 99),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 h-full z-50 bg-white shadow-2xl overflow-y-auto",
              "w-full md:w-[480px] lg:w-[560px]"
            )}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative">
              <div className="aspect-[4/5] bg-neutral-50">
                <SafeImage
                  src={images[selectedImage]?.url}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((image, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        "w-16 h-20 shrink-0 border-2 overflow-hidden transition-all",
                        selectedImage === i ? "border-neutral-900" : "border-transparent hover:border-neutral-300"
                      )}
                    >
                      <SafeImage src={image.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 pb-8 space-y-6">
              <div>
                <h2 className="text-xl font-display text-neutral-900">{name}</h2>
                <PriceDisplay price={price} compareAtPrice={compareAtPrice} size="lg" className="mt-2" />
              </div>

              {shortDescription && (
                <p className="text-sm text-neutral-500 leading-relaxed">{shortDescription}</p>
              )}

              {!!selectedVariant?.sku && (
                <p className="text-xs text-neutral-400 font-mono">SKU: {String(selectedVariant.sku)}</p>
              )}

              {selectedVariant && (selectedVariant.stock as number) > 0 && (selectedVariant.stock as number) <= 5 && (
                <p className="text-xs text-amber-600 font-medium">Only {(selectedVariant.stock as number)} left</p>
              )}
              {selectedVariant && (selectedVariant.stock as number) === 0 && (
                <p className="text-xs text-red-500 font-medium">Out of stock</p>
              )}

              {colorOptions.length > 0 && (
                <ColorSelector
                  colors={colorOptions}
                  selected={selectedColor}
                  onChange={(hex) => {
                    setSelectedColor(hex);
                    setSelectedSize("");
                  }}
                />
              )}

              {sizes.length > 0 && (
                <SizeSelector
                  sizes={sizes}
                  selected={selectedSize}
                  onChange={setSelectedSize}
                  stock={stock}
                />
              )}

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-neutral-700 font-medium">Quantity</p>
                <QuantitySelector value={quantity} onChange={setQuantity} />
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant}
                className="w-full py-3.5 bg-neutral-900 text-white text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                {selectedVariant ? "Add to Cart" : "Select options"}
              </button>

              <Link
                to={`/products/${slug}`}
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Full Details
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
