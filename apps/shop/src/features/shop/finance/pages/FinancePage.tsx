/**
 * Shop Finance Page
 *
 * Finance management page for shop owners
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useEffect, useState } from 'react';

import {
  IndianRupee,
  CreditCard,
  TrendingUp,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { setDocumentMeta } from '@/lib/seo';
import { Button, Card, Badge, Table } from '@nabome/ui';

import {
  useEarningsSummary,
  useSettlements,
  useTransactions,
  useRefundQueue,
} from './hooks';

export default function FinancePage() {
  useEffect(() => {
    setDocumentMeta({ title: 'Finance — নবME Shop' });
  }, []);

  const [activeTab, setActiveTab] = useState('overview');
  const [settlementsPage, setSettlementsPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const limit = 20;

  const { data: earnings } = useEarningsSummary();
  const { data: settlements, isLoading: settlementsLoading } = useSettlements({
    page: settlementsPage,
    limit,
  });
  const { data: transactions, isLoading: transactionsLoading } =
    useTransactions({ page: transactionsPage, limit });
  const { data: refundQueue, isLoading: refundLoading } = useRefundQueue();

  const settlementsData = (settlements as any)?.settlements || [];
  const settlementsTotal = (settlements as any)?.total || 0;
  const settlementsTotalPages = Math.ceil(settlementsTotal / limit);

  const transactionsData = (transactions as any)?.transactions || [];
  const transactionsTotal = (transactions as any)?.total || 0;
  const transactionsTotalPages = Math.ceil(transactionsTotal / limit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--text-primary)">
            Finance
          </h1>
          <p className="text-sm text-(--text-secondary)">
            Earnings, settlements, and transactions
          </p>
        </div>
        <Button variant="primary">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <TrendingUp className="h-4 w-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('settlements')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'settlements'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <CreditCard className="h-4 w-4 inline mr-2" />
          Settlements
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <IndianRupee className="h-4 w-4 inline mr-2" />
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('refunds')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'refunds'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Refunds
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Earnings Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-(--text-secondary)">
                  Total Earnings
                </p>
                <IndianRupee className="h-4 w-4 text-(--color-brand-600)" />
              </div>
              <p className="text-2xl font-bold text-(--text-primary)">
                ₹{earnings?.gross?.toLocaleString() || '0'}
              </p>
            </Card>
            <Card padding="lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-(--text-secondary)">Commission</p>
                <TrendingUp className="h-4 w-4 text-(--color-warning-600)" />
              </div>
              <p className="text-2xl font-bold text-(--text-primary)">
                ₹{earnings?.commission?.toLocaleString() || '0'}
              </p>
            </Card>
            <Card padding="lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-(--text-secondary)">Net Earnings</p>
                <CreditCard className="h-4 w-4 text-(--color-success-600)" />
              </div>
              <p className="text-2xl font-bold text-(--text-primary)">
                ₹{earnings?.net?.toLocaleString() || '0'}
              </p>
            </Card>
            <Card padding="lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-(--text-secondary)">
                  Pending Settlement
                </p>
                <FileText className="h-4 w-4 text-(--color-info-600)" />
              </div>
              <p className="text-2xl font-bold text-(--text-primary)">
                ₹{earnings?.pending?.toLocaleString() || '0'}
              </p>
            </Card>
          </div>

          {/* Settlement Countdown */}
          {earnings?.nextSettlement && (
            <Card padding="lg">
              <h3 className="font-semibold text-(--text-primary) mb-4">
                Next Settlement
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-(--text-secondary)">
                    Estimated Amount
                  </p>
                  <p className="text-xl font-bold text-(--text-primary)">
                    ₹{earnings.nextSettlement.amount?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-(--text-secondary)">
                    Estimated Date
                  </p>
                  <p className="text-xl font-bold text-(--text-primary)">
                    {earnings.nextSettlement.estimatedDate
                      ? new Date(
                          earnings.nextSettlement.estimatedDate,
                        ).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Settlements */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-(--text-primary)">
                Recent Settlements
              </h3>
              <Button variant="secondary" size="sm">
                View All
              </Button>
            </div>
            {settlementsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-(--color-neutral-100) rounded animate-pulse"
                  />
                ))}
              </div>
            ) : settlementsData && settlementsData.length > 0 ? (
              <Table variant="bordered">
                <thead>
                  <tr>
                    <th>Settlement ID</th>
                    <th>Period</th>
                    <th>Gross Amount</th>
                    <th>Commission</th>
                    <th>Net Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {settlementsData.slice(0, 5).map((settlement: any) => (
                    <tr key={settlement.id}>
                      <td className="font-medium text-(--text-primary)">
                        {settlement.settlementNumber}
                      </td>
                      <td className="text-sm text-(--text-secondary)">
                        {new Date(settlement.periodStart).toLocaleDateString()}{' '}
                        - {new Date(settlement.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="text-sm text-(--text-primary)">
                        ₹{settlement.grossAmount?.toLocaleString()}
                      </td>
                      <td className="text-sm text-(--text-secondary)">
                        ₹{settlement.commissionAmount?.toLocaleString()}
                      </td>
                      <td className="text-sm font-medium text-(--text-primary)">
                        ₹{settlement.netAmount?.toLocaleString()}
                      </td>
                      <td>
                        <Badge
                          variant={
                            settlement.status === 'paid'
                              ? 'success'
                              : settlement.status === 'processing'
                                ? 'info'
                                : 'neutral'
                          }
                        >
                          {settlement.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-sm text-(--text-secondary)">
                No settlements yet
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Settlements Tab */}
      {activeTab === 'settlements' && (
        <>
          <Card padding="lg">
            <h3 className="font-semibold text-(--text-primary) mb-4">
              All Settlements
            </h3>
            {settlementsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-(--color-neutral-100) rounded animate-pulse"
                  />
                ))}
              </div>
            ) : settlementsData && settlementsData.length > 0 ? (
              <Table variant="bordered">
                <thead>
                  <tr>
                    <th>Settlement ID</th>
                    <th>Period</th>
                    <th>Gross Amount</th>
                    <th>Commission</th>
                    <th>Net Amount</th>
                    <th>Status</th>
                    <th>Payout Method</th>
                  </tr>
                </thead>
                <tbody>
                  {settlementsData.map((settlement: any) => (
                    <tr key={settlement.id}>
                      <td className="font-medium text-(--text-primary)">
                        {settlement.settlementNumber}
                      </td>
                      <td className="text-sm text-(--text-secondary)">
                        {new Date(settlement.periodStart).toLocaleDateString()}{' '}
                        - {new Date(settlement.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="text-sm text-(--text-primary)">
                        ₹{settlement.grossAmount?.toLocaleString()}
                      </td>
                      <td className="text-sm text-(--text-secondary)">
                        ₹{settlement.commissionAmount?.toLocaleString()}
                      </td>
                      <td className="text-sm font-medium text-(--text-primary)">
                        ₹{settlement.netAmount?.toLocaleString()}
                      </td>
                      <td>
                        <Badge
                          variant={
                            settlement.status === 'paid'
                              ? 'success'
                              : settlement.status === 'processing'
                                ? 'info'
                                : 'neutral'
                          }
                        >
                          {settlement.status}
                        </Badge>
                      </td>
                      <td className="text-sm text-(--text-secondary)">
                        {settlement.payoutMethod}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-sm text-(--text-secondary)">
                No settlements yet
              </p>
            )}
          </Card>
          {settlementsTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-(--text-secondary)">
                Showing {(settlementsPage - 1) * limit + 1} to{' '}
                {Math.min(settlementsPage * limit, settlementsTotal)} of{' '}
                {settlementsTotal} settlements
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSettlementsPage((p) => Math.max(1, p - 1))}
                  disabled={settlementsPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setSettlementsPage((p) =>
                      Math.min(settlementsTotalPages, p + 1),
                    )
                  }
                  disabled={settlementsPage === settlementsTotalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <>
          <Card padding="lg">
            <h3 className="font-semibold text-(--text-primary) mb-4">
              Transactions
            </h3>
            {transactionsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-(--color-neutral-100) rounded animate-pulse"
                  />
                ))}
              </div>
            ) : transactionsData && transactionsData.length > 0 ? (
              <Table variant="bordered">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsData.map((transaction: any) => (
                    <tr key={transaction.id}>
                      <td className="font-medium text-(--text-primary)">
                        {transaction.transactionId}
                      </td>
                      <td className="text-sm text-(--text-secondary)">
                        {transaction.type}
                      </td>
                      <td className="text-sm font-medium text-(--text-primary)">
                        ₹{transaction.amount?.toLocaleString()}
                      </td>
                      <td>
                        <Badge
                          variant={
                            transaction.status === 'completed'
                              ? 'success'
                              : transaction.status === 'pending'
                                ? 'info'
                                : 'error'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="text-sm text-(--text-secondary)">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-sm text-(--text-secondary)">
                No transactions yet
              </p>
            )}
          </Card>
          {transactionsTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-(--text-secondary)">
                Showing {(transactionsPage - 1) * limit + 1} to{' '}
                {Math.min(transactionsPage * limit, transactionsTotal)} of{' '}
                {transactionsTotal} transactions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setTransactionsPage((p) => Math.max(1, p - 1))}
                  disabled={transactionsPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setTransactionsPage((p) =>
                      Math.min(transactionsTotalPages, p + 1),
                    )
                  }
                  disabled={transactionsPage === transactionsTotalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Refunds Tab */}
      {activeTab === 'refunds' && (
        <Card padding="lg">
          <h3 className="font-semibold text-(--text-primary) mb-4">
            Refund Queue
          </h3>
          {refundLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-(--color-neutral-100) rounded animate-pulse"
                />
              ))}
            </div>
          ) : refundQueue && refundQueue.length > 0 ? (
            <Table variant="bordered">
              <thead>
                <tr>
                  <th>Refund ID</th>
                  <th>Order ID</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {refundQueue.map((refund: any) => (
                  <tr key={refund.id}>
                    <td className="font-medium text-(--text-primary)">
                      {refund.refundId}
                    </td>
                    <td className="text-sm text-(--text-secondary)">
                      {refund.orderId}
                    </td>
                    <td className="text-sm font-medium text-(--text-primary)">
                      ₹{refund.amount?.toLocaleString()}
                    </td>
                    <td className="text-sm text-(--text-secondary)">
                      {refund.reason}
                    </td>
                    <td>
                      <Badge
                        variant={
                          refund.status === 'approved'
                            ? 'success'
                            : refund.status === 'pending'
                              ? 'info'
                              : 'error'
                        }
                      >
                        {refund.status}
                      </Badge>
                    </td>
                    <td>
                      {refund.status === 'pending' && (
                        <Button variant="primary" size="sm">
                          Process
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-sm text-(--text-secondary)">
              No refunds pending
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
