// ─────────────────────────────────────────────────────────────
// RELATED PRODUCTS COMPONENT
// ─────────────────────────────────────────────────────────────
// Displays related products based on category or tags
// ─────────────────────────────────────────────────────────────

import { Link } from "react-router-dom";
import { cn } from "../../lib/utils/cn";
import { LoadingSpinner } from "./LoadingSpinner";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category?: string;
}

interface RelatedProductsProps {
  products: Product[];
  isLoading?: boolean;
  title?: string;
  className?: string;
}

export function RelatedProducts({
  products,
  isLoading = false,
  title = "Related Products",
  className,
}: RelatedProductsProps) {
  if (isLoading) {
    return (
      <div className={cn("py-8", className)}>
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={cn("py-8", className)}>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.slug}`}
            className="group"
          >
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 mb-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-semibold">${product.price.toFixed(2)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
