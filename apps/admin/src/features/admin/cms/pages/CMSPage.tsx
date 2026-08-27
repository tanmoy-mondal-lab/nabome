/**
 * CMS Governance Page
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 * Features: Homepage Management, Banner Scheduling, Featured Products, Section Publishing, Version History
 */

import { useState } from 'react';

import { Grid } from '@nabome/ui';
import { Stack } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Button } from '@nabome/ui';
import {
  Layout,
  Image,
  Package,
  Calendar,
  History,
  Plus,
  RefreshCw,
  Loader2,
} from 'lucide-react';

import {
  useCMSContent,
  useCMSContentById,
  useVersionHistory,
  useCreateContent,
  useUpdateContent,
} from '../hooks/useCMS';

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState<
    'homepage' | 'banners' | 'featured' | 'sections'
  >('homepage');

  const {
    data: homepageContent,
    isLoading: homepageLoading,
    refetch: refetchHomepage,
  } = useCMSContent('homepage');
  const {
    data: bannerContent,
    isLoading: bannerLoading,
    refetch: refetchBanners,
  } = useCMSContent('banner');
  const {
    data: featuredContent,
    isLoading: featuredLoading,
    refetch: refetchFeatured,
  } = useCMSContent('featured');
  const {
    data: sectionContent,
    isLoading: sectionLoading,
    refetch: refetchSections,
  } = useCMSContent('section');

  const createContent = useCreateContent();
  const updateContent = useUpdateContent();

  const handleRefresh = () => {
    refetchHomepage();
    refetchBanners();
    refetchFeatured();
    refetchSections();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">CMS Governance</Heading>
          <Text size="sm" className="text-gray-600">
            Manage homepage, banners, featured products, and content publishing
          </Text>
        </div>
        <Button
          variant="primary"
          onClick={() => createContent.mutate({ type: activeTab })}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Content
        </Button>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <Grid cols={1} colsMd={4} gap="md">
        <Card padding="lg" elevated>
          <Stack gap="sm">
            <Layout className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Homepage Sections
            </Text>
            <Text size="lg" weight="medium">
              {homepageLoading ? '...' : homepageContent?.length || 0}
            </Text>
          </Stack>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="sm">
            <Image className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Active Banners
            </Text>
            <Text size="lg" weight="medium">
              {bannerLoading ? '...' : bannerContent?.length || 0}
            </Text>
          </Stack>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="sm">
            <Package className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Featured Products
            </Text>
            <Text size="lg" weight="medium">
              {featuredLoading ? '...' : featuredContent?.length || 0}
            </Text>
          </Stack>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="sm">
            <Calendar className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Scheduled Content
            </Text>
            <Text size="lg" weight="medium">
              {sectionLoading ? '...' : sectionContent?.length || 0}
            </Text>
          </Stack>
        </Card>
      </Grid>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('homepage')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'homepage'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Homepage
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'banners'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Banners
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'featured'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Featured Products
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'sections'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sections
          </button>
        </div>
      </div>

      {/* Homepage Tab */}
      {activeTab === 'homepage' && (
        <Card padding="lg" elevated>
          {homepageLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : homepageContent && homepageContent.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Heading level="h3">Homepage Management</Heading>
              </div>
              {homepageContent.map((item: any) => (
                <div key={item.id} className="border-b pb-4 last:border-0">
                  <Text size="sm" weight="medium">
                    {item.title || item.id}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    {item.status}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <Heading level="h3">Homepage Management</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <Card padding="lg" elevated>
          {bannerLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : bannerContent && bannerContent.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Heading level="h3">Banner Scheduling</Heading>
              </div>
              {bannerContent.map((item: any) => (
                <div key={item.id} className="border-b pb-4 last:border-0">
                  <Text size="sm" weight="medium">
                    {item.title || item.id}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    {item.status}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <Heading level="h3">Banner Scheduling</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Featured Products Tab */}
      {activeTab === 'featured' && (
        <Card padding="lg" elevated>
          {featuredLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : featuredContent && featuredContent.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Heading level="h3">Featured Products</Heading>
              </div>
              {featuredContent.map((item: any) => (
                <div key={item.id} className="border-b pb-4 last:border-0">
                  <Text size="sm" weight="medium">
                    {item.title || item.id}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    {item.status}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <Heading level="h3">Featured Products</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <Card padding="lg" elevated>
          {sectionLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : sectionContent && sectionContent.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Heading level="h3">Section Publishing</Heading>
              </div>
              {sectionContent.map((item: any) => (
                <div key={item.id} className="border-b pb-4 last:border-0">
                  <Text size="sm" weight="medium">
                    {item.title || item.id}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    {item.status}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <Heading level="h3">Section Publishing</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Version History */}
      <Card padding="lg" elevated>
        <div className="flex items-center justify-between mb-4">
          <Heading level="h3">Version History</Heading>
          <Button variant="ghost" size="sm">
            <History className="mr-2 h-4 w-4" />
            View All
          </Button>
        </div>
        <Text size="sm" className="text-gray-500">
          Content version history will be displayed here
        </Text>
      </Card>
    </div>
  );
}
