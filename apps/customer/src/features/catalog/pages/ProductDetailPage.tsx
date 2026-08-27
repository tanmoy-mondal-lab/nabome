import { useState, useEffect } from 'react';
import { useParams } from 'react-router';

import { useCart } from '@/features/cart/hooks';
import { WishlistButton } from '@/features/wishlist/WishlistButton';

import { setDocumentMeta } from '@/lib/seo';

import { useProductBySlug } from '../hooks/use-products';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProductBySlug(slug || '');
  const { addItem } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addError, setAddError] = useState('');

  // Auto-select first variant if available
  useEffect(() => {
    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      const firstAvailable = product.variants.find((v) => v.availableStock > 0);
      setSelectedVariant(firstAvailable?.id ?? product.variants[0]?.id ?? null);
    }
  }, [product?.variants, selectedVariant]);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setAddError('Please select a variant');
      return;
    }

    const variant = product?.variants?.find((v) => v.id === selectedVariant);
    if (!variant || variant.availableStock <= 0) {
      setAddError('Selected variant is out of stock');
      return;
    }

    setAddingToCart(true);
    setAddError('');

    try {
      await addItem(selectedVariant, quantity);
      setQuantity(1);
    } catch (err: any) {
      setAddError(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  useEffect(() => {
    setDocumentMeta({ title: slug ?? 'Product — নবME' });
  }, [slug]);

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-8"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600">
          {typeof error === 'string' ? error : 'Product not found'}
        </div>
      </div>
    );
  }

  const currentVariant = product.variants?.find(
    (v) => v.id === selectedVariant,
  );
  const displayPrice = currentVariant?.price || product.basePrice;
  const inStock = currentVariant
    ? currentVariant.availableStock > 0
    : product.status === 'published';

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
            {product.media && product.media.length > 0 && product.media[0] ? (
              <img
                src={product.media[0].url}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-gray-400">No image</span>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            {product.id && (
              <WishlistButton
                productId={product.id}
                variantId={selectedVariant || undefined}
              />
            )}
          </div>
          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="flex items-center space-x-4 mb-6">
            <span className="text-3xl font-bold text-indigo-600">
              ₹{parseFloat(displayPrice.amount).toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xl text-gray-500 line-through">
                ₹{parseFloat(product.compareAtPrice.amount).toFixed(2)}
              </span>
            )}
          </div>

          {inStock ? (
            <span className="inline-block mb-6 text-sm bg-green-100 text-green-800 px-3 py-1 rounded">
              In Stock
            </span>
          ) : (
            <span className="inline-block mb-6 text-sm bg-red-100 text-red-800 px-3 py-1 rounded">
              Out of Stock
            </span>
          )}

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Variant
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    disabled={variant.availableStock <= 0}
                    className={`px-4 py-2 rounded border ${
                      selectedVariant === variant.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${variant.availableStock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {variant.name}
                    {variant.availableStock <= 0 && ' (Out of Stock)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                -
              </button>
              <span className="px-4 py-2 border border-gray-300 rounded min-w-[60px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 10}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>

          {product.shop && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Sold by <span className="font-medium">{product.shop.name}</span>
              </p>
            </div>
          )}

          {addError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {addError}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!inStock || addingToCart || !selectedVariant}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart
              ? 'Adding...'
              : inStock
                ? 'Add to Cart'
                : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
