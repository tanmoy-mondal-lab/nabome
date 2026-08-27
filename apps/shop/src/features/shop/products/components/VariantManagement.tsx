/**
 * Variant Management Component
 *
 * Component for managing product variants (SKUs, pricing, inventory)
 */

import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';

import { Button, Input, Label, Table, Badge } from '@nabome/ui';

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  availableStock: number;
  reservedStock: number;
  lowStockThreshold: number;
  inventoryStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  isActive: boolean;
}

interface VariantManagementProps {
  productId: string;
  variants: Variant[];
  onAddVariant: (variant: Partial<Variant>) => void;
  onUpdateVariant: (variantId: string, data: Partial<Variant>) => void;
  onDeleteVariant: (variantId: string) => void;
}

export function VariantManagement({
  productId,
  variants,
  onAddVariant,
  onUpdateVariant,
  onDeleteVariant,
}: VariantManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [newVariant, setNewVariant] = useState<Partial<Variant>>({
    name: '',
    sku: '',
    price: 0,
    availableStock: 0,
    lowStockThreshold: 10,
    isActive: true,
  });

  const handleAddVariant = () => {
    if (newVariant.name && newVariant.sku && newVariant.price !== undefined) {
      onAddVariant(newVariant);
      setNewVariant({
        name: '',
        sku: '',
        price: 0,
        availableStock: 0,
        lowStockThreshold: 10,
        isActive: true,
      });
      setIsAdding(false);
    }
  };

  const handleUpdateVariant = (
    variantId: string,
    field: keyof Variant,
    value: any,
  ) => {
    onUpdateVariant(variantId, { [field]: value });
  };

  const getInventoryStatus = (variant: Variant) => {
    const realAvailable = variant.availableStock - variant.reservedStock;
    if (realAvailable <= 0) return 'out_of_stock';
    if (realAvailable <= variant.lowStockThreshold) return 'low_stock';
    return 'in_stock';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Product Variants</h3>
          <p className="text-sm text-gray-600">
            Manage SKUs, pricing, and inventory
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {/* Add Variant Form */}
      {isAdding && (
        <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
          <h4 className="font-medium">Add New Variant</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="variant-name">Variant Name *</Label>
              <Input
                id="variant-name"
                value={newVariant.name}
                onChange={(e) =>
                  setNewVariant({ ...newVariant, name: e.target.value })
                }
                placeholder="e.g., Size M, Color Red"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="variant-sku">SKU *</Label>
              <Input
                id="variant-sku"
                value={newVariant.sku}
                onChange={(e) =>
                  setNewVariant({ ...newVariant, sku: e.target.value })
                }
                placeholder="e.g., PROD-M-RED"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="variant-price">Price *</Label>
              <Input
                id="variant-price"
                type="number"
                step="0.01"
                value={newVariant.price}
                onChange={(e) =>
                  setNewVariant({
                    ...newVariant,
                    price: parseFloat(e.target.value),
                  })
                }
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="variant-stock">Initial Stock</Label>
              <Input
                id="variant-stock"
                type="number"
                value={newVariant.availableStock}
                onChange={(e) =>
                  setNewVariant({
                    ...newVariant,
                    availableStock: parseInt(e.target.value),
                  })
                }
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleAddVariant}>
              Add Variant
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Variants Table */}
      {variants.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-gray-600">No variants added yet</p>
          <p className="text-sm text-gray-500">
            Click "Add Variant" to create your first SKU
          </p>
        </div>
      ) : (
        <Table variant="bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Available</th>
              <th>Reserved</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.id}>
                <td>
                  {editingVariant === variant.id ? (
                    <Input
                      value={variant.name}
                      onChange={(e) =>
                        handleUpdateVariant(variant.id, 'name', e.target.value)
                      }
                      className="w-full"
                    />
                  ) : (
                    <span className="font-medium">{variant.name}</span>
                  )}
                </td>
                <td>
                  {editingVariant === variant.id ? (
                    <Input
                      value={variant.sku}
                      onChange={(e) =>
                        handleUpdateVariant(variant.id, 'sku', e.target.value)
                      }
                      className="w-full"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">{variant.sku}</span>
                  )}
                </td>
                <td>
                  {editingVariant === variant.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) =>
                        handleUpdateVariant(
                          variant.id,
                          'price',
                          parseFloat(e.target.value),
                        )
                      }
                      className="w-24"
                    />
                  ) : (
                    <span className="font-medium">
                      ₹{variant.price.toFixed(2)}
                    </span>
                  )}
                </td>
                <td>
                  {editingVariant === variant.id ? (
                    <Input
                      type="number"
                      value={variant.availableStock}
                      onChange={(e) =>
                        handleUpdateVariant(
                          variant.id,
                          'availableStock',
                          parseInt(e.target.value),
                        )
                      }
                      className="w-20"
                    />
                  ) : (
                    <span className="text-sm">{variant.availableStock}</span>
                  )}
                </td>
                <td className="text-sm text-gray-600">
                  {variant.reservedStock}
                </td>
                <td>
                  <Badge
                    variant={
                      getInventoryStatus(variant) === 'in_stock'
                        ? 'success'
                        : getInventoryStatus(variant) === 'low_stock'
                          ? 'warning'
                          : 'error'
                    }
                  >
                    {getInventoryStatus(variant).replace('_', ' ')}
                  </Badge>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {editingVariant === variant.id ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setEditingVariant(null)}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingVariant(variant.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteVariant(variant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
