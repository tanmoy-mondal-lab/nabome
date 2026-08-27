/**
 * Inventory Table Component
 *
 * Displays inventory items with filtering and pagination.
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAddStock, useDecreaseStock, useSetStock } from '../hooks';

interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  availableStock: number;
  reservedStock: number;
  realAvailableStock: number;
  inventoryStatus: string;
  lowStockThreshold: number;
  price: number;
}

interface InventoryTableProps {
  items?: InventoryItem[];
  loading?: boolean;
  onBulkStockUpdate?: (variantIds: string[], stockChange: number) => void;
}

export function InventoryTable({
  items = [],
  loading,
  onBulkStockUpdate,
}: InventoryTableProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [stockAmount, setStockAmount] = useState<number>(0);
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const addStockMutation = useAddStock();
  const decreaseStockMutation = useDecreaseStock();
  const setStockMutation = useSetStock();

  if (loading) {
    return (
      <div className="rounded-lg border p-6">
        <div className="text-muted-foreground">Loading inventory...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  const handleBulkStockUpdate = async () => {
    if (selectedItems.size === 0) return;

    // Validate stock amount
    if (stockAmount < 0) {
      alert('Stock amount cannot be negative');
      return;
    }

    if (stockAmount === 0) {
      alert('Please enter a valid stock amount');
      return;
    }

    const variantIds = Array.from(selectedItems);
    setBulkLoading(true);
    setBulkProgress({ current: 0, total: variantIds.length });

    try {
      // Use parallel processing for better performance with large batches
      const BATCH_SIZE = 10; // Process 10 items at a time to avoid overwhelming the API

      if (bulkAction === 'add') {
        for (let i = 0; i < variantIds.length; i += BATCH_SIZE) {
          const batch = variantIds.slice(i, i + BATCH_SIZE);
          await Promise.all(
            batch.map(async (variantId) => {
              try {
                await addStockMutation.mutateAsync({
                  variantId,
                  quantity: stockAmount,
                  type: 'manual',
                  reason: 'Bulk stock update',
                });
              } catch (error) {
                console.error(
                  `Failed to add stock to variant ${variantId}:`,
                  error,
                );
              }
            }),
          );
          setBulkProgress({
            current: Math.min(i + BATCH_SIZE, variantIds.length),
            total: variantIds.length,
          });
        }
      } else if (bulkAction === 'set') {
        for (let i = 0; i < variantIds.length; i += BATCH_SIZE) {
          const batch = variantIds.slice(i, i + BATCH_SIZE);
          await Promise.all(
            batch.map(async (variantId) => {
              const item = items.find((i) => i.id === variantId);
              if (item) {
                const currentStock = item.availableStock;
                const difference = stockAmount - currentStock;

                if (difference > 0) {
                  // Increase stock
                  try {
                    await addStockMutation.mutateAsync({
                      variantId,
                      quantity: difference,
                      type: 'manual',
                      reason: 'Bulk stock level set (increase)',
                    });
                  } catch (error) {
                    console.error(
                      `Failed to increase stock for variant ${variantId}:`,
                      error,
                    );
                  }
                } else if (difference < 0) {
                  // Decrease stock using the new decrease mutation
                  try {
                    await decreaseStockMutation.mutateAsync({
                      variantId,
                      quantity: Math.abs(difference),
                      type: 'manual',
                      reason: 'Bulk stock level set (decrease)',
                    });
                  } catch (error) {
                    console.error(
                      `Failed to decrease stock for variant ${variantId}:`,
                      error,
                    );
                  }
                }
              }
            }),
          );
          setBulkProgress({
            current: Math.min(i + BATCH_SIZE, variantIds.length),
            total: variantIds.length,
          });
        }
      }

      setSelectedItems(new Set());
      setBulkAction('');
      setStockAmount(0);
      alert('Bulk stock update completed');
    } catch (error) {
      console.error('Bulk stock update failed:', error);
      alert('Bulk stock update failed. Please try again.');
    } finally {
      setBulkLoading(false);
      setBulkProgress(null);
    }
  };

  return (
    <div className="rounded-lg border">
      {/* Bulk Actions Bar */}
      {selectedItems.size > 0 && (
        <div className="border-b bg-muted/50 p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedItems.size} items selected
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Bulk Action...</option>
              <option value="add">Add Stock</option>
              <option value="set">Set Stock Level</option>
            </select>
            {bulkAction && (
              <>
                <input
                  type="number"
                  min="0"
                  value={stockAmount}
                  onChange={(e) =>
                    setStockAmount(parseInt(e.target.value) || 0)
                  }
                  placeholder="Amount"
                  className="w-24 rounded-md border px-3 py-2 text-sm"
                />
                <button
                  onClick={handleBulkStockUpdate}
                  disabled={stockAmount < 0 || bulkLoading}
                  className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {bulkLoading ? 'Updating...' : 'Apply'}
                </button>
              </>
            )}
            <button
              onClick={() => setSelectedItems(new Set())}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Bulk Progress */}
      {bulkProgress && (
        <div className="border-b bg-blue-50 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-blue-900">
                Updating {bulkProgress.current} of {bulkProgress.total} items...
              </span>
              <span className="text-blue-700">
                {Math.round((bulkProgress.current / bulkProgress.total) * 100)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                style={{
                  width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.size === items.length && items.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Product
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Available
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Reserved
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Real Available
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium">
                Status
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3 text-sm">{item.sku}</td>
                <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                <td className="px-4 py-3 text-right text-sm">
                  {item.availableStock}
                </td>
                <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                  {item.reservedStock}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold">
                  {item.realAvailableStock}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.inventoryStatus)}`}
                  >
                    {item.inventoryStatus.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  ${item.price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length === 0 && (
        <div className="p-6 text-center text-muted-foreground">
          No inventory items found
        </div>
      )}
    </div>
  );
}
