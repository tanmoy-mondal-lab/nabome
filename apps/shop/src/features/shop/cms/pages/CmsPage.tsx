/**
 * Shop CMS Page
 *
 * CMS management page for shop owners
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useEffect, useState } from 'react';

import {
  Layout,
  Image,
  Text,
  Calendar,
  Eye,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';

import { setDocumentMeta } from '@/lib/seo';
import { Button, Card, Badge, Table, Input } from '@nabome/ui';

import {
  useHomepageSections,
  useFeaturedProducts,
  usePromotionalBanners,
} from './hooks';

export default function CmsPage() {
  useEffect(() => {
    setDocumentMeta({ title: 'CMS — নবME Shop' });
  }, []);

  const [activeTab, setActiveTab] = useState('homepage');

  const { data: sections, isLoading: sectionsLoading } = useHomepageSections();
  const { data: featuredProducts, isLoading: featuredLoading } =
    useFeaturedProducts();
  const { data: banners, isLoading: bannersLoading } = usePromotionalBanners();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--text-primary)">
            CMS
          </h1>
          <p className="text-sm text-(--text-secondary)">
            Manage homepage, featured products, and promotions
          </p>
        </div>
        <Button variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('homepage')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'homepage'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Layout className="h-4 w-4 inline mr-2" />
          Homepage
        </button>
        <button
          onClick={() => setActiveTab('featured')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'featured'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Image className="h-4 w-4 inline mr-2" />
          Featured Products
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'banners'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Text className="h-4 w-4 inline mr-2" />
          Promotional Banners
        </button>
      </div>

      {/* Homepage Sections Tab */}
      {activeTab === 'homepage' && (
        <div className="space-y-4">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-(--text-primary)">
                Homepage Sections
              </h3>
              <Button variant="secondary" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
            {sectionsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-(--color-neutral-100) rounded animate-pulse"
                  />
                ))}
              </div>
            ) : sections && sections.length > 0 ? (
              <div className="space-y-4">
                {sections.map((section: any) => (
                  <Card padding="md" key={section.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Layout className="h-5 w-5 text-(--color-brand-600)" />
                          <h4 className="font-medium text-(--text-primary)">
                            {section.title}
                          </h4>
                          <Badge
                            variant={section.visible ? 'success' : 'neutral'}
                          >
                            {section.visible ? 'Visible' : 'Hidden'}
                          </Badge>
                        </div>
                        <p className="text-sm text-(--text-secondary) mb-3">
                          {section.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-(--text-secondary)">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {section.viewCount || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {section.updatedAt
                              ? new Date(section.updatedAt).toLocaleDateString()
                              : '-'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-(--text-secondary)">
                No homepage sections configured
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Featured Products Tab */}
      {activeTab === 'featured' && (
        <div className="space-y-4">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-(--text-primary)">
                Featured Products
              </h3>
              <Button variant="secondary" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
            {featuredLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-(--color-neutral-100) rounded animate-pulse"
                  />
                ))}
              </div>
            ) : featuredProducts && featuredProducts.length > 0 ? (
              <Table variant="bordered">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Position</th>
                    <th>Visibility</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {featuredProducts.map((item: any) => (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-(--color-neutral-100) flex items-center justify-center">
                            <Image className="h-5 w-5 text-(--text-secondary)" />
                          </div>
                          <div>
                            <p className="font-medium text-(--text-primary)">
                              {item.productName}
                            </p>
                            <p className="text-xs text-(--text-secondary)">
                              {item.productSku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-(--text-primary)">
                        {item.position}
                      </td>
                      <td>
                        <Badge variant={item.visible ? 'success' : 'neutral'}>
                          {item.visible ? 'Visible' : 'Hidden'}
                        </Badge>
                      </td>
                      <td className="text-sm text-(--text-secondary)">
                        {item.startDate
                          ? new Date(item.startDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="text-sm text-(--text-secondary)">
                        {item.endDate
                          ? new Date(item.endDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-sm text-(--text-secondary)">
                No featured products configured
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Promotional Banners Tab */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-(--text-primary)">
                Promotional Banners
              </h3>
              <Button variant="secondary" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Banner
              </Button>
            </div>
            {bannersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-(--color-neutral-100) rounded animate-pulse"
                  />
                ))}
              </div>
            ) : banners && banners.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {banners.map((banner: any) => (
                  <Card padding="md" key={banner.id}>
                    <div className="aspect-video bg-(--color-neutral-100) rounded-lg mb-4 flex items-center justify-center">
                      <Image className="h-8 w-8 text-(--text-secondary)" />
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-(--text-primary) mb-1">
                          {banner.title}
                        </h4>
                        <p className="text-sm text-(--text-secondary) mb-2">
                          {banner.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-(--text-secondary)">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {banner.startDate
                              ? new Date(banner.startDate).toLocaleDateString()
                              : '-'}
                          </span>
                          <span>→</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {banner.endDate
                              ? new Date(banner.endDate).toLocaleDateString()
                              : '-'}
                          </span>
                        </div>
                      </div>
                      <Badge variant={banner.active ? 'success' : 'neutral'}>
                        {banner.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-(--text-secondary)">
                No promotional banners configured
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
