import { Edit3, Trash2, Copy, Eye, EyeOff, Package } from "lucide-react";
import { SafeImage } from "../../../components/SafeImage";
import { StatusBadge } from "../../common/StatusBadge";
import { formatPrice } from "../../../lib/utils/format";
import { cn } from "../../../lib/utils/cn";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice?: number | null;
  compareAtPrice?: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  gender: string;
  category?: { name: string } | null;
  brand?: { name: string; logoUrl?: string } | null;
  images: { url: string; isPrimary: boolean }[];
  variants: { stock: number; sku: string }[];
}

interface ProductGridCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function ProductGridCard({ product, onEdit, onDelete, onDuplicate }: ProductGridCardProps) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const primaryImage = product.images.find((img) => img.isPrimary)?.url ?? product.images[0]?.url;

  return (
    <div className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-card transition-all duration-300">
      <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden">
        {primaryImage ? (
          <SafeImage
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-neutral-300" />
          </div>
        )}

        <div className="absolute top-2 left-2 flex gap-1">
          {product.isFeatured && (
            <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-amber-500 text-white rounded">
              Featured
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-blue-500 text-white rounded">
              New
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2">
          {product.isActive ? (
            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-green-500 text-white rounded">
              <Eye className="w-3 h-3" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-neutral-500 text-white rounded">
              <EyeOff className="w-3 h-3" /> Draft
            </span>
          )}
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-neutral-700" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
          >
            <Copy className="w-3.5 h-3.5 text-neutral-700" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-medium text-neutral-900 line-clamp-1">{product.name}</h3>
        </div>

        <p className="text-xs text-neutral-500 mb-2">
          {product.category?.name ?? "Uncategorized"}
          {product.brand ? ` · ${product.brand.name}` : ""}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-neutral-900">
              {formatPrice(product.salePrice ?? product.basePrice)}
            </span>
            {product.salePrice && product.compareAtPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className={cn(
            "text-xs font-medium",
            totalStock === 0 ? "text-red-600" : totalStock <= 5 ? "text-amber-600" : "text-neutral-500"
          )}>
            {totalStock === 0 ? "OOS" : `${totalStock} in stock`}
          </div>
        </div>
      </div>
    </div>
  );
}
