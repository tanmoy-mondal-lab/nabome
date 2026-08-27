/**
 * Shop Products Page
 *
 * Product management page for shop owners
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useEffect, useState } from 'react';

import { Plus, Search } from 'lucide-react';

import { setDocumentMeta } from '@/lib/seo';
import { Button, Table, Badge, Input } from '@nabome/ui';

import {
  useShopProducts,
  useDeleteProduct,
  usePublishProduct,
  useCreateProduct,
  useUpdateProduct,
} from '../hooks';
import { ProductFormDialog } from '../components/ProductFormDialog';

export default function ProductsPage() {
  useEffect(() => {
    setDocumentMeta({ title: 'Products — নবME Shop' });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { data: productsData, isLoading } = useShopProducts({
    search: searchQuery || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const deleteProductMutation = useDeleteProduct();
  const publishProductMutation = usePublishProduct();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const products = productsData?.products || [];

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleProductSubmit = async (data: any) => {
    if (editingProduct) {
      await updateProductMutation.mutateAsync({
        productId: editingProduct.id,
        data,
      });
    } else {
      await createProductMutation.mutateAsync(data);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handlePublishProduct = (productId: string) => {
    publishProductMutation.mutate(productId);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p: any) => p.id));
    }
  };

  const handleBulkPublish = () => {
    selectedProducts.forEach((id) => publishProductMutation.mutate(id));
    setSelectedProducts([]);
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedProducts.length} products?`,
      )
    ) {
      selectedProducts.forEach((id) => deleteProductMutation.mutate(id));
      setSelectedProducts([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--text-primary)">
            Products
          </h1>
          <p className="text-sm text-(--text-secondary)">
            Manage your product catalog
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedProducts.length > 0 && (
            <>
              <Button variant="secondary" size="sm" onClick={handleBulkPublish}>
                Publish ({selectedProducts.length})
              </Button>
              <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                Delete ({selectedProducts.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProducts([])}
              >
                Clear Selection
              </Button>
            </>
          )}
          <Button variant="primary" onClick={handleCreateProduct}>
            <Plus className="h-4 w-4" />
            Create Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 text-(--text-secondary) absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-md bg-(--bg-primary) text-(--text-primary)"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-(--color-neutral-100) rounded animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-(--text-secondary)">No products found</p>
        </div>
      ) : (
        <Table variant="bordered">
          <thead>
            <tr>
              <th className="w-10">
                <input
                  type="checkbox"
                  checked={
                    selectedProducts.length === products.length &&
                    products.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Status</th>
              <th>Inventory</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: any) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="rounded"
                  />
                </td>
                <td>
                  <div>
                    <p className="font-medium text-(--text-primary)">
                      {product.name}
                    </p>
                    <p className="text-xs text-(--text-secondary)">
                      {product.slug}
                    </p>
                  </div>
                </td>
                <td className="text-sm text-(--text-secondary)">
                  {product.sku || '-'}
                </td>
                <td className="text-sm font-medium text-(--text-primary)">
                  ₹{product.price}
                </td>
                <td>
                  <Badge
                    variant={
                      product.status === 'published'
                        ? 'success'
                        : product.status === 'draft'
                          ? 'neutral'
                          : 'info'
                    }
                  >
                    {product.status}
                  </Badge>
                </td>
                <td className="text-sm text-(--text-secondary)">
                  {product.trackInventory ? 'Tracked' : 'Not tracked'}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </Button>
                    {product.status === 'draft' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePublishProduct(product.id)}
                      >
                        Publish
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleProductSubmit}
        initialData={editingProduct}
        mode={editingProduct ? 'edit' : 'create'}
        categories={[]} // Categories will be fetched when API is ready
        brands={[]} // Brands will be fetched when API is ready
      />
    </div>
  );
}
