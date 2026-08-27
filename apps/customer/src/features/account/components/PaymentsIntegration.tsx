import {
  CreditCard,
  Wallet,
  ArrowDownUp,
  History,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import type { Refund } from '@nabome/types';
import { Button } from '@nabome/ui';

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  last4?: string;
  identifier?: string;
  isDefault?: boolean;
}

interface Transaction {
  id: string;
  description: string;
  type: 'debit' | 'credit';
  status: string;
  amount: number;
  createdAt: string;
}

interface PaymentsIntegrationProps {
  userId: string;
}

export function PaymentsIntegration({
  userId: _userId,
}: PaymentsIntegrationProps) {
  void _userId;
  const [paymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions] = useState<Transaction[]>([]);
  const [refunds] = useState<Refund[]>([]);
  const loading = false;
  const error: string | null = null;

  const [activeTab, setActiveTab] = useState<
    'methods' | 'transactions' | 'refunds'
  >('methods');

  const handleRemoveMethod = async (_methodId: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      void _methodId;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      dateStyle: 'medium',
    });
  };

  const formatAmount = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'upi':
        return <Wallet className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Payments</h2>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('methods')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'methods'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Saved Methods
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'transactions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('refunds')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'refunds'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Refunds
        </button>
      </div>

      {activeTab === 'methods' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Saved Payment Methods
            </h3>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Method
            </Button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
              <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No saved payment methods</p>
              <Button variant="outline">Add Payment Method</Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {paymentMethods.map((method: PaymentMethod) => (
                <div
                  key={method.id}
                  className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        {getPaymentMethodIcon(method.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {method.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {method.type === 'card'
                            ? `**** ${method.last4}`
                            : method.identifier}
                        </p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1">
                      Set Default
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMethod(method.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Transaction History
          </h3>

          {transactions.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
              <History className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction: Transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === 'debit'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      <ArrowDownUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === 'debit'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {transaction.type === 'debit' ? '-' : '+'}
                      {formatAmount(transaction.amount)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getTransactionStatusColor(transaction.status)}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'refunds' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Refund History
          </h3>

          {refunds.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
              <ArrowDownUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No refunds yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {refunds.map((refund: Refund) => (
                <div
                  key={refund.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                      <ArrowDownUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {refund.reason}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(refund.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +{formatAmount(Number(refund.amount.amount))}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getTransactionStatusColor(refund.status)}`}
                    >
                      {refund.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
