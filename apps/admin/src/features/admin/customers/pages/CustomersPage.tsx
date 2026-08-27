/**
 * Customer Management Page
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 * Features: Customer Directory, Customer Detail, Customer Status, Account Lock, Account Unlock, Login History, Audit Timeline
 */

import { useState, useEffect } from 'react';

import { Grid } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Badge } from '@nabome/ui';
import { Button } from '@nabome/ui';
import { Input } from '@nabome/ui';
import { Users, Search, Lock, Unlock, MoreVertical } from 'lucide-react';

import { useCustomers } from '../../hooks/use-customers';
import { useAdminPermissions } from '../../hooks/use-admin-permissions';

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  totalSpent?: {
    amount: string;
    currency: string;
  };
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export default function CustomersPage() {
  const {
    data: customers,
    isLoading,
    lockCustomer,
    unlockCustomer,
    verifyEmail,
    sendPasswordReset,
    suspendCustomer,
    activateCustomer,
    exportCustomerData,
  } = useCustomers();
  const { hasPermission } = useAdminPermissions();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(
    new Set(),
  );
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [bulkErrors, setBulkErrors] = useState<
    Array<{ customerId: string; error: string }>
  >([]);

  useEffect(() => {
    document.title = 'Customer Management — নবME Admin';
  }, []);

  const filteredCustomers = customers?.filter((customer: Customer) => {
    const matchesStatus =
      statusFilter === 'all' || customer.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${customer.firstName} ${customer.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSelectCustomer = (customerId: string) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCustomers.size === filteredCustomers?.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(
        new Set(
          filteredCustomers?.map((customer: Customer) => customer.id) || [],
        ),
      );
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedCustomers.size === 0) return;

    const customerIds = Array.from(selectedCustomers);
    setBulkProgress({ current: 0, total: customerIds.length });
    setBulkErrors([]);

    const results = await Promise.allSettled(
      customerIds.map(async (customerId, index) => {
        try {
          setBulkProgress({ current: index + 1, total: customerIds.length });

          switch (bulkAction) {
            case 'lock':
              const lockReason = prompt(
                `Enter lock reason for customer ${index + 1}/${customerIds.length}:`,
              );
              if (lockReason) {
                await lockCustomer.mutateAsync({
                  customerId,
                  reason: lockReason,
                });
              }
              break;
            case 'unlock':
              const unlockReason = prompt(
                `Enter unlock reason for customer ${index + 1}/${customerIds.length}:`,
              );
              if (unlockReason) {
                await unlockCustomer.mutateAsync({
                  customerId,
                  reason: unlockReason,
                });
              }
              break;
            case 'verify':
              await verifyEmail.mutateAsync(customerId);
              break;
            case 'reset_password':
              await sendPasswordReset.mutateAsync(customerId);
              break;
            case 'suspend':
              const suspendReason = prompt(
                `Enter suspension reason for customer ${index + 1}/${customerIds.length}:`,
              );
              if (suspendReason) {
                await suspendCustomer.mutateAsync({
                  customerId,
                  reason: suspendReason,
                });
              }
              break;
            case 'activate':
              await activateCustomer.mutateAsync(customerId);
              break;
            case 'export':
              await exportCustomerData.mutateAsync(customerId);
              break;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          setBulkErrors((prev) => [
            ...prev,
            { customerId, error: errorMessage },
          ]);
          throw error;
        }
      }),
    );

    setBulkProgress(null);
    setSelectedCustomers(new Set());
    setBulkAction('');

    // Show summary of results
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed > 0) {
      alert(
        `Bulk action completed: ${successful} successful, ${failed} failed. Check errors for details.`,
      );
    } else {
      alert(`Bulk action completed successfully for ${successful} customers.`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'locked':
        return <Badge variant="warning">Locked</Badge>;
      case 'suspended':
        return <Badge variant="error">Suspended</Badge>;
      case 'pending':
        return <Badge variant="info">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Customer Management</Heading>
          <Text size="sm" className="text-gray-600">
            Manage customer accounts, status, and access
          </Text>
        </div>
      </div>

      {/* Filters */}
      <Card padding="md" elevated>
        <Grid cols={1} colsSm={2} colsMd={4} gap="sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search customers..."
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
            <option value="active">Active</option>
            <option value="locked">Locked</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
          {selectedCustomers.size > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Bulk Action...</option>
                <option value="lock">Lock Selected</option>
                <option value="unlock">Unlock Selected</option>
                <option value="verify">Verify Email</option>
                <option value="reset_password">Send Password Reset</option>
                <option value="suspend">Suspend Selected</option>
                <option value="activate">Activate Selected</option>
                <option value="export">Export Data</option>
              </select>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkAction}
                disabled={!bulkAction}
              >
                Apply ({selectedCustomers.size})
              </Button>
            </div>
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
                customers...
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

      {/* Customer List */}
      <Card padding="lg" elevated>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  <input
                    type="checkbox"
                    checked={
                      selectedCustomers.size === filteredCustomers?.length &&
                      filteredCustomers?.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Customer
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Email
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Orders
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Total Spent
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Joined
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Last Login
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers && filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer: Customer) => (
                  <tr key={customer.id} className="border-b border-gray-100">
                    <td className="py-4">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.has(customer.id)}
                        onChange={() => handleSelectCustomer(customer.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-brand-600" />
                        </div>
                        <div>
                          <Text size="sm" weight="medium">
                            {customer.firstName} {customer.lastName}
                          </Text>
                          <Text size="xs" className="text-gray-500">
                            {customer.phone || 'No phone'}
                          </Text>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <Text size="sm">{customer.email}</Text>
                    </td>
                    <td className="py-4">{getStatusBadge(customer.status)}</td>
                    <td className="py-4">
                      <Text size="sm">0</Text>
                    </td>
                    <td className="py-4">
                      <Text size="sm" weight="medium">
                        {customer.totalSpent
                          ? new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                            }).format(parseFloat(customer.totalSpent.amount))
                          : '₹0'}
                      </Text>
                    </td>
                    <td className="py-4">
                      <Text size="sm" className="text-gray-500">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </Text>
                    </td>
                    <td className="py-4">
                      <Text size="sm" className="text-gray-500">
                        Never
                      </Text>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        {customer.isActive &&
                          hasPermission('governance:customer:lock') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-yellow-600 hover:text-yellow-700"
                              title="Lock Account"
                              onClick={() => {
                                const reason = prompt('Enter lock reason:');
                                if (reason) {
                                  lockCustomer.mutate({
                                    customerId: customer.id,
                                    reason,
                                  });
                                }
                              }}
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          )}
                        {!customer.isActive &&
                          hasPermission('governance:customer:unlock') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              title="Unlock Account"
                              onClick={() => {
                                const reason = prompt('Enter unlock reason:');
                                if (reason) {
                                  unlockCustomer.mutate({
                                    customerId: customer.id,
                                    reason,
                                  });
                                }
                              }}
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                        <Button variant="ghost" size="sm" title="View Details">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No customers found
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
