/**
 * Returns Governance Page
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 * Features: Global Returns Queue, Policy Overrides, Dispute Resolution, Fraud Review, Refund Oversight
 */

import { useState, useEffect } from 'react';

import { Grid } from '@nabome/ui';
import { Stack } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Button } from '@nabome/ui';
import {
  RotateCcw,
  AlertTriangle,
  Shield,
  DollarSign,
  RefreshCw,
  Loader2,
} from 'lucide-react';

import {
  useReturnsQueue,
  useDisputes,
  useFraudReview,
} from '../hooks/useReturnsGovernance';

export default function ReturnsPage() {
  const [activeTab, setActiveTab] = useState<
    'queue' | 'disputes' | 'fraud' | 'overrides'
  >('queue');

  const {
    data: queueData,
    isLoading: queueLoading,
    refetch: refetchQueue,
  } = useReturnsQueue();
  const {
    data: disputesData,
    isLoading: disputesLoading,
    refetch: refetchDisputes,
  } = useDisputes();
  const {
    data: fraudData,
    isLoading: fraudLoading,
    refetch: refetchFraud,
  } = useFraudReview();

  const handleRefresh = () => {
    refetchQueue();
    refetchDisputes();
    refetchFraud();
  };

  const pendingReturns = queueData?.length || 0;
  const openDisputes = disputesData?.length || 0;
  const fraudReview = fraudData?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Returns Governance</Heading>
          <Text size="sm" className="text-gray-600">
            Manage return requests, disputes, fraud review, and policy overrides
          </Text>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <Grid cols={1} colsMd={4} gap="md">
        <Card padding="lg" elevated>
          <Stack gap="sm">
            <RotateCcw className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Pending Returns
            </Text>
            {queueLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              <Text size="lg" weight="medium">
                {pendingReturns}
              </Text>
            )}
          </Stack>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="sm">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <Text size="sm" className="text-gray-600">
              Open Disputes
            </Text>
            {disputesLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              <Text size="lg" weight="medium">
                {openDisputes}
              </Text>
            )}
          </Stack>
        </Card>

        <Card padding="lg" elevated>
          <Stack gap="sm">
            <Shield className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Fraud Review
            </Text>
            {fraudLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              <Text size="lg" weight="medium">
                {fraudReview}
              </Text>
            )}
          </Stack>
        </Card>

        <Card padding="lg" elevated className="opacity-50">
          <Stack gap="sm">
            <DollarSign className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Refund Amount (7d)
            </Text>
            <Text size="lg" weight="medium">
              —
            </Text>
          </Stack>
        </Card>
      </Grid>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('queue')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'queue'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Returns Queue
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'disputes'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Disputes
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'fraud'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Fraud Review
          </button>
          <button
            onClick={() => setActiveTab('overrides')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'overrides'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Policy Overrides
          </button>
        </div>
      </div>

      {/* Returns Queue Tab */}
      {activeTab === 'queue' && (
        <Card padding="lg" elevated>
          <Heading level="h3" className="mb-4">
            Global Returns Queue
          </Heading>
          {queueLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : queueData && queueData.length > 0 ? (
            <div className="space-y-4">
              {queueData.map((returnItem: any) => (
                <div
                  key={returnItem.id}
                  className="border-b pb-4 last:border-0"
                >
                  <Text size="sm" weight="medium">
                    {returnItem.orderNumber}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    {returnItem.reason}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <Text size="sm" className="text-gray-500">
              No pending returns in queue
            </Text>
          )}
        </Card>
      )}

      {/* Disputes Tab */}
      {activeTab === 'disputes' && (
        <Card padding="lg" elevated>
          <Heading level="h3" className="mb-4">
            Dispute Resolution
          </Heading>
          {disputesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : disputesData && disputesData.length > 0 ? (
            <div className="space-y-4">
              {disputesData.map((dispute: any) => (
                <div key={dispute.id} className="border-b pb-4 last:border-0">
                  <Text size="sm" weight="medium">
                    {dispute.orderNumber}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    {dispute.reason}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <Text size="sm" className="text-gray-500">
              No open disputes
            </Text>
          )}
        </Card>
      )}

      {/* Fraud Review Tab */}
      {activeTab === 'fraud' && (
        <Card padding="lg" elevated>
          <Heading level="h3" className="mb-4">
            Fraud Review
          </Heading>
          {fraudLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : fraudData && fraudData.length > 0 ? (
            <div className="space-y-4">
              {fraudData.map((fraud: any) => (
                <div key={fraud.id} className="border-b pb-4 last:border-0">
                  <Text size="sm" weight="medium">
                    {fraud.orderNumber}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    {fraud.reason}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <Text size="sm" className="text-gray-500">
              No returns flagged for fraud review
            </Text>
          )}
        </Card>
      )}

      {/* Policy Overrides Tab */}
      {activeTab === 'overrides' && (
        <Card padding="lg" elevated>
          <Heading level="h3" className="mb-4">
            Policy Overrides
          </Heading>
          <Text size="sm" className="text-gray-500">
            Policy override history will be displayed here
          </Text>
        </Card>
      )}
    </div>
  );
}
