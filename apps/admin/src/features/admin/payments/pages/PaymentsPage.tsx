/**
 * Payments Governance Page
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 * Features: Provider Health, Transaction Search, Settlement Monitoring, Refund Monitoring, Financial Exceptions
 */

import { useState } from 'react';

import { Grid } from '@nabome/ui';
import { Stack } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Badge } from '@nabome/ui';
import { Button } from '@nabome/ui';
import { Input } from '@nabome/ui';
import {
  CreditCard,
  Search,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Loader2,
} from 'lucide-react';

import {
  usePaymentProviderHealth,
  useSearchTransactions,
  useSettlements,
  useRefunds,
  useFinancialExceptions,
} from '../hooks/usePaymentsGovernance';

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<
    'providers' | 'transactions' | 'settlements' | 'refunds' | 'exceptions'
  >('providers');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: providerHealth,
    isLoading: providerLoading,
    refetch: refetchProviders,
  } = usePaymentProviderHealth();
  const {
    data: transactions,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useSearchTransactions();
  const {
    data: settlements,
    isLoading: settlementsLoading,
    refetch: refetchSettlements,
  } = useSettlements();
  const {
    data: refunds,
    isLoading: refundsLoading,
    refetch: refetchRefunds,
  } = useRefunds();
  const {
    data: exceptions,
    isLoading: exceptionsLoading,
    refetch: refetchExceptions,
  } = useFinancialExceptions();

  const handleRefresh = () => {
    refetchProviders();
    refetchTransactions();
    refetchSettlements();
    refetchRefunds();
    refetchExceptions();
  };

  const handleSearch = () => {
    refetchTransactions();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Payments Governance</Heading>
          <Text size="sm" className="text-gray-600">
            Monitor payment providers, transactions, settlements, and financial
            exceptions
          </Text>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <Grid cols={1} colsMd={4} gap="md">
        <Card padding="lg" elevated className="opacity-50">
          <Stack gap="sm">
            <CreditCard className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Provider Status
            </Text>
            <Badge variant="outline">Awaiting Data</Badge>
          </Stack>
        </Card>

        <Card padding="lg" elevated className="opacity-50">
          <Stack gap="sm">
            <DollarSign className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Today's Volume
            </Text>
            <Text size="lg" weight="medium">
              —
            </Text>
          </Stack>
        </Card>

        <Card padding="lg" elevated className="opacity-50">
          <Stack gap="sm">
            <TrendingUp className="h-5 w-5 text-brand-500" />
            <Text size="sm" className="text-gray-600">
              Success Rate
            </Text>
            <Text size="lg" weight="medium">
              —
            </Text>
          </Stack>
        </Card>

        <Card padding="lg" elevated className="opacity-50">
          <Stack gap="sm">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <Text size="sm" className="text-gray-600">
              Exceptions
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
            onClick={() => setActiveTab('providers')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'providers'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Providers
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'transactions'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('settlements')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'settlements'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Settlements
          </button>
          <button
            onClick={() => setActiveTab('refunds')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'refunds'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Refunds
          </button>
          <button
            onClick={() => setActiveTab('exceptions')}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === 'exceptions'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Exceptions
          </button>
        </div>
      </div>

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <Card padding="lg" elevated>
          <Heading level="h3" className="mb-4">
            Payment Provider Health
          </Heading>
          {providerLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : providerHealth && providerHealth.length > 0 ? (
            <div className="space-y-4">
              {providerHealth.map((provider: any) => (
                <div key={provider.id} className="border-b pb-4 last:border-0">
                  <Text size="sm" weight="medium">
                    {provider.name}
                  </Text>
                  <Badge
                    variant={
                      provider.status === 'healthy' ? 'success' : 'error'
                    }
                  >
                    {provider.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <Text size="sm" className="text-gray-500">
              No payment provider data available
            </Text>
          )}
        </Card>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <Card padding="lg" elevated>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search transactions by ID, order, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="border-b pb-4 last:border-0"
                >
                  <Text size="sm" weight="medium">
                    {transaction.id}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    {transaction.status}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <Text size="sm" className="text-gray-500">
              No transactions found
            </Text>
          )}
        </Card>
      )}

      {/* Settlements Tab */}
      {activeTab === 'settlements' && (
        <Card padding="lg" elevated>
          <Heading level="h3" className="mb-4">
            Settlement Monitoring
          </Heading>
          {settlementsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : settlements && settlements.length > 0 ? (
            <div className="space-y-4">
              {settlements.map((settlement: any) => (
                <div
                  key={settlement.id}
                  className="border-b pb-4 last:border-0"
                >
                  <Text size="sm" weight="medium">
                    {settlement.id}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    {settlement.status}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <Text size="sm" className="text-gray-500">
              No settlement data available
            </Text>
          )}
        </Card>
      )}

      {/* Refunds Tab */}
      {activeTab === 'refunds' && (
        <Card padding="lg" elevated>
          <Heading level="h3" className="mb-4">
            Refund Monitoring
          </Heading>
          {refundsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : refunds && refunds.length > 0 ? (
            <div className="space-y-4">
              {refunds.map((refund: any) => (
                <div key={refund.id} className="border-b pb-4 last:border-0">
                  <Text size="sm" weight="medium">
                    {refund.id}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    {refund.status}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <Text size="sm" className="text-gray-500">
              No refund data available
            </Text>
          )}
        </Card>
      )}

      {/* Exceptions Tab */}
      {activeTab === 'exceptions' && (
        <Card padding="lg" elevated>
          <Heading level="h3" className="mb-4">
            Financial Exceptions
          </Heading>
          {exceptionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : exceptions && exceptions.length > 0 ? (
            <div className="space-y-4">
              {exceptions.map((exception: any) => (
                <div key={exception.id} className="border-b pb-4 last:border-0">
                  <Text size="sm" weight="medium">
                    {exception.id}
                  </Text>
                  <Text size="sm" className="text-gray-500">
                    {exception.type}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <Text size="sm" className="text-gray-500">
              No financial exceptions
            </Text>
          )}
        </Card>
      )}
    </div>
  );
}
