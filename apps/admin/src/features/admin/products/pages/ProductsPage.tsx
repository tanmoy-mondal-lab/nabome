/**
 * Product Governance Page
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 * Features: Global Search, Moderation Queue, Flagged Products, Publish Control, Bulk Moderation
 */

import { useState, useEffect } from 'react';

import { Stack } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Badge } from '@nabome/ui';
import { Button } from '@nabome/ui';
import { Input } from '@nabome/ui';
import {
  Package,
  Search,
  Check,
  X,
  AlertTriangle,
  MoreVertical,
  Filter,
} from 'lucide-react';

import { useProductSearch } from '@/features/admin/hooks/use-products-governance';
import { useModerationQueue } from '@/features/admin/hooks/use-products-governance';
import { useFlaggedProducts } from '@/features/admin/hooks/use-products-governance';
import { useAdminPermissions } from '@/features/admin/hooks/use-admin-permissions';
import { setDocumentMeta } from '@/lib/seo';

export default function ProductsPage() {
  const { hasPermission } = useAdminPermissions();
  const [activeTab, setActiveTab] = useState<
    'search' | 'moderation' | 'flagged'
  >('moderation');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: searchResults, isLoading: searchLoading } = useProductSearch({
    search: searchQuery,
  });
  const {
    data: moderationQueue,
    isLoading: moderationLoading,
    approveProduct,
    rejectProduct,
  } = useModerationQueue();
  const { data: flaggedProducts, isLoading: flaggedLoading } =
    useFlaggedProducts();

  useEffect(() => {
    setDocumentMeta({ title: 'Product Governance — নবME Admin' });
  }, []);

  const getModerationBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'flagged':
        return <Badge variant="error">Flagged</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleApprove = async (productId: string) => {
    await approveProduct.mutateAsync(productId);
  };

  const handleReject = async (productId: string, reason: string) => {
    await rejectProduct.mutateAsync({ productId, reason });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Product Governance</Heading>
          <Text size="sm" className="text-gray-600">
            Moderate products, manage flags, and enforce content policies
          </Text>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'moderation'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Moderation Queue
            {moderationQueue && moderationQueue.length > 0 && (
              <Badge variant="warning" className="ml-2">
                {moderationQueue.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'flagged'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Flagged Products
            {flaggedProducts && flaggedProducts.length > 0 && (
              <Badge variant="error" className="ml-2">
                {flaggedProducts.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'search'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Search Products
          </button>
        </div>
      </div>

      {/* Moderation Queue Tab */}
      {activeTab === 'moderation' && (
        <Card padding="lg" elevated>
          <div className="flex items-center justify-between mb-4">
            <Heading level="h3">Products Awaiting Approval</Heading>
            {hasPermission('governance:product:moderate') &&
              moderationQueue &&
              moderationQueue.length > 0 && (
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Bulk Actions
                </Button>
              )}
          </div>
          {moderationLoading ? (
            <Text size="sm" className="text-gray-500">
              Loading moderation queue...
            </Text>
          ) : moderationQueue && moderationQueue.length > 0 ? (
            <Stack gap="sm">
              {moderationQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <Text size="sm" weight="medium">
                          Product ID: {item.productId}
                        </Text>
                        <Text size="xs" className="text-gray-500">
                          Shop ID: {item.shopId}
                        </Text>
                      </div>
                    </div>
                    <div className="mt-2">
                      {getModerationBadge(item.status)}
                    </div>
                    {item.flags && item.flags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.flags.map((flag) => (
                          <Badge
                            key={flag.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {flag.flagType}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {hasPermission('governance:product:moderate') &&
                    item.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApprove(item.productId)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() =>
                            handleReject(
                              item.productId,
                              'Violates content policy',
                            )
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                </div>
              ))}
            </Stack>
          ) : (
            <Text size="sm" className="text-gray-500">
              No products awaiting moderation
            </Text>
          )}
        </Card>
      )}

      {/* Flagged Products Tab */}
      {activeTab === 'flagged' && (
        <Card padding="lg" elevated>
          <div className="flex items-center justify-between mb-4">
            <Heading level="h3">Flagged Products</Heading>
          </div>
          {flaggedLoading ? (
            <Text size="sm" className="text-gray-500">
              Loading flagged products...
            </Text>
          ) : flaggedProducts && flaggedProducts.length > 0 ? (
            <Stack gap="sm">
              {flaggedProducts.map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-start justify-between border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <Text size="sm" weight="medium">
                          Product ID: {flag.productId}
                        </Text>
                        <Text size="xs" className="text-gray-500">
                          Flag Type: {flag.flagType}
                        </Text>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Text size="sm" className="text-gray-600">
                        {flag.reason}
                      </Text>
                    </div>
                    <div className="mt-2">
                      <Badge
                        variant={
                          flag.status === 'pending'
                            ? 'warning'
                            : flag.status === 'reviewed'
                              ? 'info'
                              : flag.status === 'resolved'
                                ? 'success'
                                : 'error'
                        }
                      >
                        {flag.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </Stack>
          ) : (
            <Text size="sm" className="text-gray-500">
              No flagged products
            </Text>
          )}
        </Card>
      )}

      {/* Search Products Tab */}
      {activeTab === 'search' && (
        <Card padding="lg" elevated>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products by name, SKU, or shop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {searchLoading ? (
            <Text size="sm" className="text-gray-500">
              Searching products...
            </Text>
          ) : searchResults && searchResults.length > 0 ? (
            <Stack gap="sm">
              {searchResults.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-start justify-between border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <Text size="sm" weight="medium">
                          {product.name || 'Product Name'}
                        </Text>
                        <Text size="xs" className="text-gray-500">
                          SKU: {product.sku || 'N/A'}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </Stack>
          ) : searchQuery ? (
            <Text size="sm" className="text-gray-500">
              No products found matching "{searchQuery}"
            </Text>
          ) : (
            <Text size="sm" className="text-gray-500">
              Enter a search term to find products
            </Text>
          )}
        </Card>
      )}
    </div>
  );
}
