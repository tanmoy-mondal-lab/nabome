/**
 * Shop Detail Page
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 * Features: Shop Detail, Shop Performance, Shop Settings Override, Shop Audit History
 */

import { useParams } from 'react-router';
import { useEffect } from 'react';

import { Grid } from '@nabome/ui';
import { Stack } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Badge } from '@nabome/ui';
import { Button } from '@nabome/ui';
import {
  ArrowLeft,
  TrendingUp,
  Package,
  ShoppingCart,
  Star,
  Shield,
  AlertTriangle,
  Check,
  X,
  MoreVertical,
} from 'lucide-react';

import { useShops } from '@/features/admin/hooks/use-shops';
import { useAdminPermissions } from '@/features/admin/hooks/use-admin-permissions';
import { setDocumentMeta } from '@/lib/seo';

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: shops } = useShops();
  const shop = shops?.find((s) => s.id === id);
  const { hasPermission } = useAdminPermissions();

  useEffect(() => {
    if (shop) {
      setDocumentMeta({ title: `${shop.name} — নবME Admin` });
    }
  }, [shop]);

  if (!shop) {
    return (
      <div className="flex items-center justify-center py-12">
        <Text size="lg" className="text-gray-500">
          Shop not found
        </Text>
      </div>
    );
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(parseFloat(amount));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Heading level="h1">{shop.name}</Heading>
            <Text size="sm" className="text-gray-600">
              {shop.slug}
            </Text>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(shop.status)}
          {shop.status === 'pending' &&
            hasPermission('governance:shop:approve') && (
              <>
                <Button variant="primary" size="sm">
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button variant="outline" size="sm">
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
          {shop.status === 'active' &&
            hasPermission('governance:shop:suspend') && (
              <Button variant="outline" size="sm">
                <Shield className="mr-2 h-4 w-4" />
                Suspend
              </Button>
            )}
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Shop Overview */}
      <Grid cols={1} colsMd={3} gap="md">
        <Card padding="lg" elevated>
          <div className="flex items-center space-x-3">
            {shop.logoUrl && (
              <img
                src={shop.logoUrl}
                alt={shop.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            )}
            <div>
              <Text size="sm" className="text-gray-600">
                Owner
              </Text>
              <Text size="sm" weight="medium">
                {shop.owner?.email}
              </Text>
              {shop.owner?.firstName && (
                <Text size="xs" className="text-gray-500">
                  {shop.owner.firstName} {shop.owner.lastName}
                </Text>
              )}
            </div>
          </div>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="sm">
            <div className="flex items-center justify-between">
              <Text size="sm" className="text-gray-600">
                Commission Rate
              </Text>
              <Text size="sm" weight="medium">
                {shop.commissionRate}%
              </Text>
            </div>
            <div className="flex items-center justify-between">
              <Text size="sm" className="text-gray-600">
                Rating
              </Text>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Text size="sm" weight="medium">
                  {shop.rating.toFixed(1)}
                </Text>
                <Text size="xs" className="text-gray-400">
                  ({shop.reviewCount})
                </Text>
              </div>
            </div>
          </Stack>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="sm">
            <div className="flex items-center justify-between">
              <Text size="sm" className="text-gray-600">
                Created
              </Text>
              <Text size="sm" weight="medium">
                {new Date(shop.createdAt).toLocaleDateString()}
              </Text>
            </div>
            <div className="flex items-center justify-between">
              <Text size="sm" className="text-gray-600">
                Verified
              </Text>
              <Text size="sm" weight="medium">
                {shop.verifiedAt
                  ? new Date(shop.verifiedAt).toLocaleDateString()
                  : 'Not verified'}
              </Text>
            </div>
          </Stack>
        </Card>
      </Grid>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button className="border-b-2 border-brand-500 pb-2 text-sm font-medium text-brand-600">
            Overview
          </button>
          <button className="border-b-2 border-transparent pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Performance
          </button>
          <button className="border-b-2 border-transparent pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Settings
          </button>
          <button className="border-b-2 border-transparent pb-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Audit History
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      <div>
        <Grid cols={1} colsMd={2} gap="md">
          <Card padding="lg" elevated>
            <Heading level="h3" className="mb-4">
              Shop Statistics
            </Heading>
            <Stack gap="md">
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-gray-400" />
                <div>
                  <Text size="sm" className="text-gray-600">
                    Total Products
                  </Text>
                  <Text size="lg" weight="medium">
                    {shop.totalProducts}
                  </Text>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-5 w-5 text-gray-400" />
                <div>
                  <Text size="sm" className="text-gray-600">
                    Total Orders
                  </Text>
                  <Text size="lg" weight="medium">
                    {shop.totalOrders}
                  </Text>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                <div>
                  <Text size="sm" className="text-gray-600">
                    Total Revenue
                  </Text>
                  <Text size="lg" weight="medium">
                    {formatCurrency(shop.totalRevenue.amount)}
                  </Text>
                </div>
              </div>
            </Stack>
          </Card>

          <Card padding="lg" elevated>
            <Heading level="h3" className="mb-4">
              Shop Status
            </Heading>
            <Stack gap="md">
              {shop.suspendedAt && (
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="mt-1 h-5 w-5 text-yellow-500" />
                  <div>
                    <Text size="sm" weight="medium">
                      Suspended
                    </Text>
                    <Text size="xs" className="text-gray-500">
                      {new Date(shop.suspendedAt).toLocaleDateString()}
                    </Text>
                    {shop.suspendedReason && (
                      <Text size="xs" className="text-gray-600">
                        Reason: {shop.suspendedReason}
                      </Text>
                    )}
                  </div>
                </div>
              )}
              {shop.verifiedAt && (
                <div className="flex items-start space-x-3">
                  <Check className="mt-1 h-5 w-5 text-green-500" />
                  <div>
                    <Text size="sm" weight="medium">
                      Verified
                    </Text>
                    <Text size="xs" className="text-gray-500">
                      {new Date(shop.verifiedAt).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              )}
            </Stack>
          </Card>
        </Grid>
      </div>

      {/* Performance Tab */}
      <Card padding="lg" elevated>
        <Heading level="h3" className="mb-4">
          Performance Metrics
        </Heading>
        <Text size="sm" className="text-gray-500">
          Performance data will be displayed here
        </Text>
      </Card>

      {/* Settings Tab */}
      <Card padding="lg" elevated>
        <Heading level="h3" className="mb-4">
          Shop Settings
        </Heading>
        <Text size="sm" className="text-gray-500">
          Shop settings override will be displayed here
        </Text>
      </Card>

      {/* Audit Tab */}
      <Card padding="lg" elevated>
        <Heading level="h3" className="mb-4">
          Audit History
        </Heading>
        <Text size="sm" className="text-gray-500">
          Audit timeline will be displayed here
        </Text>
      </Card>
    </div>
  );
}
