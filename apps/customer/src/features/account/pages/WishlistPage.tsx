import { useEffect, useState } from 'react';

import { WishlistSortOrder } from '@/features/wishlist/types';

import { appConfig } from '@/lib/config';
import { setDocumentMeta } from '@/lib/seo';

import { useWishlistStore } from '@/stores/wishlist-store';

const API_BASE = `${appConfig.PUBLIC_API_URL}/api/v1`;

export default function WishlistPage() {
  const {
    items,
    isLoading,
    error,
    isGuest,
    guestItems,
    getItemCount,
    clearGuestItems,
  } = useWishlistStore();

  const [sortOrder, setSortOrder] = useState<WishlistSortOrder>(
    WishlistSortOrder.ADDED_DESC,
  );
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDocumentMeta({ title: 'My Wishlist — নবME' });
  }, []);

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkRemove = async () => {
    try {
      const res = await fetch(`${API_BASE}/wishlist/bulk-remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: Array.from(selectedItems) }),
      });
      if (!res.ok) throw new Error('Bulk remove failed');
      setSelectedItems(new Set());
      location.reload();
    } catch (e) {
      console.error(e);
    }
  };
  const handleMoveToCart = async (itemId: string) => {
    try {
      const res = await fetch(`${API_BASE}/wishlist/bulk-move-to-cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: [itemId] }),
      });
      if (!res.ok) throw new Error('Move failed');
    } catch (e) {
      console.error(e);
    }
  };
  const handleBulkMoveToCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/wishlist/bulk-move-to-cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: Array.from(selectedItems) }),
      });
      if (!res.ok) throw new Error('Bulk move failed');
      setSelectedItems(new Set());
      location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    switch (sortOrder) {
      case WishlistSortOrder.ADDED_DESC:
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case WishlistSortOrder.ADDED_ASC:
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      case WishlistSortOrder.PRICE_ASC:
        return (a.product.basePrice || 0) - (b.product.basePrice || 0);
      case WishlistSortOrder.PRICE_DESC:
        return (b.product.basePrice || 0) - (a.product.basePrice || 0);
      case WishlistSortOrder.NAME_ASC:
        return a.product.name.localeCompare(b.product.name);
      case WishlistSortOrder.NAME_DESC:
        return b.product.name.localeCompare(a.product.name);
      default:
        return 0;
    }
  });

  const itemCount = getItemCount();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <p className="mt-2 text-gray-600">
          {itemCount === 0
            ? 'Your wishlist is empty'
            : `${itemCount} item${itemCount !== 1 ? 's' : ''} saved`}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
          <p>{error}</p>
        </div>
      )}

      {itemCount === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Your wishlist is empty
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Save items you love by clicking the heart icon on any product.
          </p>
          <div className="mt-6">
            <a
              href="/shop"
              className="inline-flex items-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Browse Products
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.size === items.length && items.length > 0
                  }
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-sm text-gray-700">Select all</span>
              </label>

              {selectedItems.size > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkMoveToCart}
                    className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Move to Cart ({selectedItems.size})
                  </button>
                  <button
                    onClick={handleBulkRemove}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-gray-700">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as WishlistSortOrder)
                }
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                <option value={WishlistSortOrder.ADDED_DESC}>
                  Recently Added
                </option>
                <option value={WishlistSortOrder.ADDED_ASC}>
                  Oldest First
                </option>
                <option value={WishlistSortOrder.PRICE_ASC}>
                  Price: Low to High
                </option>
                <option value={WishlistSortOrder.PRICE_DESC}>
                  Price: High to Low
                </option>
                <option value={WishlistSortOrder.NAME_ASC}>Name: A to Z</option>
                <option value={WishlistSortOrder.NAME_DESC}>
                  Name: Z to A
                </option>
              </select>
            </div>
          </div>

          {/* Wishlist Items Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 aspect-square overflow-hidden rounded-md bg-gray-100">
                  {item.product.primaryImage ? (
                    <img
                      src={item.product.primaryImage}
                      alt={item.product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <svg
                        className="h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
                    <a
                      href={`/product/${item.product.slug}`}
                      className="hover:underline"
                    >
                      {item.product.name}
                    </a>
                  </h3>
                  {item.variant && (
                    <p className="mt-1 text-xs text-gray-500">
                      {item.variant.name}
                    </p>
                  )}
                </div>

                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{item.product.basePrice.toLocaleString('en-IN')}
                    </p>
                    {item.product.compareAtPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        ₹{item.product.compareAtPrice.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  {item.priceDrop && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      {item.priceDrop.dropPercentage}% off
                    </span>
                  )}
                </div>

                {item.stockStatus?.outOfStock && (
                  <div className="mb-3 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-800">
                    Out of Stock
                  </div>
                )}

                {item.stockStatus?.lowStock && !item.stockStatus.outOfStock && (
                  <div className="mb-3 rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800">
                    Low Stock
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                  </label>

                  <button
                    onClick={() => handleMoveToCart(item.id)}
                    disabled={item.stockStatus?.outOfStock}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {item.stockStatus?.outOfStock
                      ? 'Out of Stock'
                      : 'Add to Cart'}
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await fetch(`${API_BASE}/wishlist/bulk-remove`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ itemIds: [item.id] }),
                        });
                        location.reload();
                      } catch {}
                    }}
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                    aria-label="Remove from wishlist"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {isGuest && guestItems.length > 0 && (
            <div className="mt-8 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You're viewing a guest wishlist.{' '}
                <a
                  href="/login"
                  className="font-medium underline hover:text-blue-900"
                >
                  Sign in
                </a>{' '}
                to save your wishlist permanently and sync across devices.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
