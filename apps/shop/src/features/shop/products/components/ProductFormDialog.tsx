/**
 * Product Form Dialog
 *
 * Dialog for creating and editing products in the Shop Owner Dashboard
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, Plus, Trash2 } from 'lucide-react';

import { Dialog } from '@nabome/ui';
import { Button, Input, Label, Textarea, Select } from '@nabome/ui';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
  basePrice: z.string().min(0, 'Price must be non-negative'),
  compareAtPrice: z.string().optional(),
  costPrice: z.string().optional(),
  trackInventory: z.boolean().default(true),
  requiresShipping: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: Partial<ProductFormData>;
  mode: 'create' | 'edit';
  categories?: Array<{ id: string; name: string }>;
  brands?: Array<{ id: string; name: string }>;
}

export function ProductFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
  categories = [],
  brands = [],
}: ProductFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      status: 'draft',
      trackInventory: true,
      requiresShipping: true,
    },
  });

  useEffect(() => {
    if (open && initialData) {
      reset(initialData);
    } else if (open) {
      reset({
        status: 'draft',
        trackInventory: true,
        requiresShipping: true,
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: ProductFormData) => {
    onSubmit(data);
    onClose();
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Create Product' : 'Edit Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-6 space-y-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter product name"
                className="mt-1"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="product-slug"
                className="mt-1"
              />
              {errors.slug && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter product description"
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Classification</h3>

            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select
                id="categoryId"
                {...register('categoryId')}
                className="mt-1"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="brandId">Brand</Label>
              <Select id="brandId" {...register('brandId')} className="mt-1">
                <option value="">Select brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Selling Price *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  {...register('basePrice')}
                  placeholder="0.00"
                  className="mt-1"
                />
                {errors.basePrice && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.basePrice.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="compareAtPrice">Compare At Price</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  {...register('compareAtPrice')}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                {...register('costPrice')}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Settings</h3>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register('status')} className="mt-1">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('trackInventory')}
                  className="rounded"
                />
                <span>Track Inventory</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('requiresShipping')}
                  className="rounded"
                />
                <span>Requires Shipping</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Create Product' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
