import { Link } from 'react-router';

import type { Product } from '@nabome/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.compareAtPrice &&
    parseFloat(product.compareAtPrice.amount) >
      parseFloat(product.basePrice.amount);
  const discountPercentage =
    hasDiscount && product.compareAtPrice
      ? Math.round(
          ((parseFloat(product.compareAtPrice.amount) -
            parseFloat(product.basePrice.amount)) /
            parseFloat(product.compareAtPrice.amount)) *
            100,
        )
      : 0;

  return (
    <Link to={`/product/${product.slug}`} className="group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-indigo-200">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.media && product.media.length > 0 && product.media[0] ? (
            <>
              <img
                src={product.media[0].url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {discountPercentage}% OFF
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
        <div className="p-5">
          <h3
            className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
          <p
            className="text-sm text-gray-500 mb-3 line-clamp-2"
            title={product.description || undefined}
          >
            {product.description || ''}
          </p>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-lg text-indigo-600">
              ₹{parseFloat(product.basePrice.amount).toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{parseFloat(product.compareAtPrice.amount).toFixed(2)}
              </span>
            )}
          </div>
          {product.status === 'published' ? (
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              In Stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200">
              <span className="w-2 h-2 bg-gray-400 rounded-full" />
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
