import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';

import {
  useProducts,
  type ProductListParams,
} from '@/features/catalog/hooks/use-products';
import { WishlistButton } from '@/features/wishlist/WishlistButton';

import { setDocumentMeta } from '@/lib/seo';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const [sortBy, setSortBy] = useState('relevance');

  // Build params for the useProducts hook
  const params: ProductListParams = {};
  if (category) params.category = category;
  if (sortBy === 'price-asc') {
    params.sort = 'price';
    params.order = 'asc';
  }
  if (sortBy === 'price-desc') {
    params.sort = 'price';
    params.order = 'desc';
  }
  if (sortBy === 'newest') {
    params.sort = 'createdAt';
    params.order = 'desc';
  }
  if (sortBy === 'popular') {
    params.sort = 'popularity';
    params.order = 'desc';
  }

  const { data, isLoading, error } = useProducts(params);

  const products = data?.products || [];

  useEffect(() => {
    setDocumentMeta({ title: `Search: ${query} — নবME` });
  }, [query]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {query
              ? `Search Results for "${query}"`
              : category
                ? `${category}`
                : 'All Products'}
          </h1>
          <p className="text-gray-600">
            {products.length === 0
              ? 'No results found'
              : `${products.length} result${products.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              defaultValue={query}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  navigate(`/search?q=${encodeURIComponent(value)}`);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No results found
            </h2>
            <p className="text-gray-600 mb-6">
              {query
                ? `We couldn't find any products matching "${query}"`
                : 'Try adjusting your search terms'}
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/product/${product.slug}`)}
              >
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                  {/* Wishlist Button */}
                  <div
                    className="absolute top-2 right-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <WishlistButton
                      productId={product.id}
                      variantId={undefined}
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.category && (
                    <p className="text-sm text-gray-600 mb-2">
                      {typeof product.category === 'string'
                        ? product.category
                        : product.category.name}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">
                      {product.price
                        ? `₹${parseFloat(product.price).toFixed(2)}`
                        : 'Price not available'}
                    </p>
                    {product.inStock !== false && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        In Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
