/**
 * Add to Cart Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Provides quantity selector and add to cart button for products.
 * Used on product detail pages and product cards.
 */

import { useState } from 'react';

import { Button, Input } from './index';

interface AddToCartProps {
  variantId: string;
  maxQuantity?: number;
  onAddToCart: (variantId: string, quantity: number) => void;
  disabled?: boolean;
  loading?: boolean;
  showQuantity?: boolean;
  className?: string;
}

export function AddToCart({
  variantId,
  maxQuantity = 99,
  onAddToCart,
  disabled = false,
  loading = false,
  showQuantity = true,
  className = '',
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxQuantity) {
      setQuantity(numValue);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(variantId, quantity);
  };

  return (
    <div className={`add-to-cart ${className}`}>
      {showQuantity && (
        <div className="add-to-cart__quantity">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1 || disabled}
            className="add-to-cart__quantity-btn"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <Input
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            disabled={disabled}
            className="add-to-cart__quantity-input"
            aria-label="Quantity"
          />
          <button
            type="button"
            onClick={handleIncrement}
            disabled={quantity >= maxQuantity || disabled}
            className="add-to-cart__quantity-btn"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      )}

      <Button
        variant="primary"
        size="md"
        onClick={handleAddToCart}
        disabled={disabled || loading}
        isLoading={loading}
        fullWidth={!showQuantity}
        className="add-to-cart__button"
      >
        {showQuantity ? 'Add to Cart' : 'Add'}
      </Button>
    </div>
  );
}
