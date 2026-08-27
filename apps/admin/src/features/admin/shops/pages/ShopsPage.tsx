/**
 * Shop Management Page
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 * Features: Shop List, Shop Approval, Shop Suspension, Shop Verification, Shop Performance, Shop Settings Override, Shop Audit History
 */

import { useState, useEffect } from 'react';

import { Grid } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Badge } from '@nabome/ui';
import { Button } from '@nabome/ui';
import { Input } from '@nabome/ui';
import {
  Store,
  Search,
  MoreVertical,
  Check,
  RotateCcw,
  X,
  Shield,
} from 'lucide-react';

import { useShops } from '../../hooks/use-shops';
import { useAdminPermissions } from '../../hooks/use-admin-permissions';

interface Shop {
  id: string;
  name: string;
  slug: string;
  status: string;
  logoUrl?: string;
  owner?: {
    email: string;
  };
  totalProducts: number;
  totalOrders: number;
  totalRevenue: {
    amount: string;
    currency: string;
  };
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export default function ShopsPage() {
  const {
    data: shops,
    isLoading,
    approveShop,
    suspendShop,
    activateShop,
    verifyShop,
  } = useShops();
  const { hasPermission } = useAdminPermissions();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShops, setSelectedShops] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [bulkErrors, setBulkErrors] = useState<
    Array<{ shopId: string; error: string }>
  >([]);
  const [undoHistory, setUndoHistory] = useState<
    Array<{ action: string; shopIds: string[]; timestamp: number }>
  >([]);

  useEffect(() => {
    document.title = 'Shop Management — নবME Admin';
  }, []);

  const filteredShops = shops?.filter((shop: Shop) => {
    const matchesStatus =
      statusFilter === 'all' || shop.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.owner?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSelectShop = (shopId: string) => {
    const newSelected = new Set(selectedShops);
    if (newSelected.has(shopId)) {
      newSelected.delete(shopId);
    } else {
      newSelected.add(shopId);
    }
    setSelectedShops(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedShops.size === filteredShops?.length) {
      setSelectedShops(new Set());
    } else {
      setSelectedShops(
        new Set(filteredShops?.map((shop: Shop) => shop.id) || []),
      );
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedShops.size === 0) return;

    const shopIds = Array.from(selectedShops);
    setBulkProgress({ current: 0, total: shopIds.length });
    setBulkErrors([]);

    const results = await Promise.allSettled(
      shopIds.map(async (shopId, index) => {
        try {
          setBulkProgress({ current: index + 1, total: shopIds.length });

          switch (bulkAction) {
            case 'approve':
              await approveShop.mutateAsync(shopId);
              break;
            case 'suspend':
              const suspendReason = prompt(
                `Enter suspension reason for shop ${index + 1}/${shopIds.length}:`,
              );
              if (suspendReason) {
                await suspendShop.mutateAsync({
                  shopId,
                  reason: suspendReason,
                });
              }
              break;
            case 'activate':
              await activateShop.mutateAsync(shopId);
              break;
            case 'verify':
              await verifyShop.mutateAsync(shopId);
              break;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          setBulkErrors((prev) => [...prev, { shopId, error: errorMessage }]);
          throw error;
        }
      }),
    );

    setBulkProgress(null);
    setSelectedShops(new Set());

    // Add to undo history stack
    setUndoHistory((prev) => [
      { action: bulkAction, shopIds, timestamp: Date.now() },
      ...prev.slice(0, 9),
    ]); // Keep last 10 actions
    setBulkAction('');

    // Show summary of results
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed > 0) {
      alert(
        `Bulk action completed: ${successful} successful, ${failed} failed. Check errors for details.`,
      );
    } else {
      alert(`Bulk action completed successfully for ${successful} shops.`);
    }
  };

  const handleUndoBulkAction = async (historyIndex: number = 0) => {
    const actionToUndo = undoHistory[historyIndex];
    if (!actionToUndo) return;

    const { action, shopIds } = actionToUndo;
    const undoAction = getUndoAction(action);

    if (!undoAction) {
      alert('Cannot undo this action');
      return;
    }

    if (!confirm(`Undo ${action} for ${shopIds.length} shops?`)) {
      return;
    }

    setBulkProgress({ current: 0, total: shopIds.length });
    setBulkErrors([]);

    const results = await Promise.allSettled(
      shopIds.map(async (shopId: string, index: number) => {
        try {
          setBulkProgress({ current: index + 1, total: shopIds.length });

          switch (undoAction) {
            case 'suspend':
              const suspendReason = prompt(`Enter suspension reason for undo:`);
              if (suspendReason) {
                await suspendShop.mutateAsync({
                  shopId,
                  reason: `Undo: ${suspendReason}`,
                });
              }
              break;
            case 'activate':
              await activateShop.mutateAsync(shopId);
              break;
            case 'approve':
              await approveShop.mutateAsync(shopId);
              break;
            case 'verify':
              await verifyShop.mutateAsync(shopId);
              break;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          setBulkErrors((prev) => [...prev, { shopId, error: errorMessage }]);
          throw error;
        }
      }),
    );

    setBulkProgress(null);
    setSelectedShops(new Set());

    // Remove from undo history
    setUndoHistory((prev) => prev.filter((_, i) => i !== historyIndex));

    // Show summary of results
    const successful = results.filter(
      (r: any) => r.status === 'fulfilled',
    ).length;
    const failed = results.filter((r: any) => r.status === 'rejected').length;

    if (failed > 0) {
      alert(
        `Undo completed: ${successful} successful, ${failed} failed. Check errors for details.`,
      );
    } else {
      alert(`Undo completed successfully for ${successful} shops.`);
    }
  };

  const getUndoAction = (action: string): string | null => {
    const undoMap: Record<string, string> = {
      approve: 'suspend',
      suspend: 'activate',
      activate: 'suspend',
      verify: 'unverify',
    };
    return undoMap[action] || null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'suspended':
        return <Badge variant="warning">Suspended</Badge>;
      case 'banned':
        return <Badge variant="error">Banned</Badge>;
      case 'under_review':
        return <Badge variant="info">Under Review</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(parseFloat(amount));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Shop Management</Heading>
          <Text size="sm" className="text-gray-600">
            Manage shop applications, approvals, and performance
          </Text>
        </div>
        {hasPermission('governance:shop:create') && (
          <Button variant="primary">
            <Store className="mr-2 h-4 w-4" />
            Add Shop
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card padding="md" elevated>
        <Grid cols={1} colsSm={2} colsMd={4} gap="sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
            <option value="under_review">Under Review</option>
          </select>
          {selectedShops.size > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Bulk Action...</option>
                <option value="approve">Approve Selected</option>
                <option value="suspend">Suspend Selected</option>
                <option value="activate">Activate Selected</option>
                <option value="verify">Verify Selected</option>
              </select>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkAction}
                disabled={!bulkAction}
              >
                Apply ({selectedShops.size})
              </Button>
            </div>
          )}
          {undoHistory.length > 0 && !bulkProgress && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleUndoBulkAction(0)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Undo Last Action ({undoHistory.length})
            </Button>
          )}
        </Grid>
      </Card>

      {/* Bulk Action Progress */}
      {bulkProgress && (
        <Card padding="md" elevated className="border-blue-200 bg-blue-50">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-blue-900">
                Processing {bulkProgress.current} of {bulkProgress.total}{' '}
                shops...
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
            {bulkErrors.length > 0 && (
              <div className="mt-2 text-xs text-red-600">
                {bulkErrors.length} error{bulkErrors.length > 1 ? 's' : ''}{' '}
                encountered
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Shop List */}
      <Card padding="lg" elevated>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  <input
                    type="checkbox"
                    checked={
                      selectedShops.size === filteredShops?.length &&
                      filteredShops?.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Shop
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Owner
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Products
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Orders
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Revenue
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Rating
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Created
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-500">
                    Loading shops...
                  </td>
                </tr>
              ) : filteredShops && filteredShops.length > 0 ? (
                filteredShops.map((shop: Shop) => (
                  <tr key={shop.id} className="border-b border-gray-100">
                    <td className="py-4">
                      <input
                        type="checkbox"
                        checked={selectedShops.has(shop.id)}
                        onChange={() => handleSelectShop(shop.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        {shop.logoUrl && (
                          <img
                            src={shop.logoUrl}
                            alt={shop.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <Text size="sm" weight="medium">
                            {shop.name}
                          </Text>
                          <Text size="xs" className="text-gray-500">
                            {shop.slug}
                          </Text>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <Text size="sm">{shop.owner?.email}</Text>
                    </td>
                    <td className="py-4">{getStatusBadge(shop.status)}</td>
                    <td className="py-4">
                      <Text size="sm">{shop.totalProducts}</Text>
                    </td>
                    <td className="py-4">
                      <Text size="sm">{shop.totalOrders}</Text>
                    </td>
                    <td className="py-4">
                      <Text size="sm" weight="medium">
                        {formatCurrency(shop.totalRevenue.amount)}
                      </Text>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-1">
                        <Text size="sm">{shop.rating.toFixed(1)}</Text>
                        <Text size="xs" className="text-gray-400">
                          ({shop.reviewCount})
                        </Text>
                      </div>
                    </td>
                    <td className="py-4">
                      <Text size="sm" className="text-gray-500">
                        {new Date(shop.createdAt).toLocaleDateString()}
                      </Text>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        {shop.status === 'pending' &&
                          hasPermission('governance:shop:approve') && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                title="Approve"
                                onClick={() => approveShop.mutate(shop.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                title="Reject"
                                onClick={() => {
                                  const reason = prompt(
                                    'Enter rejection reason:',
                                  );
                                  if (reason) {
                                    suspendShop.mutate({
                                      shopId: shop.id,
                                      reason,
                                    });
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        {shop.status === 'active' &&
                          hasPermission('governance:shop:suspend') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-yellow-600 hover:text-yellow-700"
                              title="Suspend"
                              onClick={() => {
                                const reason = prompt(
                                  'Enter suspension reason:',
                                );
                                if (reason) {
                                  suspendShop.mutate({
                                    shopId: shop.id,
                                    reason,
                                  });
                                }
                              }}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          )}
                        {shop.status === 'suspended' &&
                          hasPermission('governance:shop:activate') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              title="Activate"
                              onClick={() => activateShop.mutate(shop.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        <Button variant="ghost" size="sm" title="More options">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No shops found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
