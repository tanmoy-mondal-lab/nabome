/**
 * Shop Customers Page
 *
 * Customer management page for shop owners
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useEffect, useState } from 'react';

import { Search, User, Phone, ChevronLeft, ChevronRight } from 'lucide-react';

import { setDocumentMeta } from '@/lib/seo';
import { Button, Table, Badge, Input } from '@nabome/ui';

import { useShopCustomers, useCustomerPurchaseHistory } from '../hooks';

export default function CustomersPage() {
  useEffect(() => {
    setDocumentMeta({ title: 'Customers — নবME Shop' });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: customersData, isLoading } = useShopCustomers({
    search: searchQuery || undefined,
    limit,
    offset: (page - 1) * limit,
  });

  const { data: purchaseHistory } = useCustomerPurchaseHistory(
    selectedCustomer || '',
  );

  const customers = (customersData as any)?.customers || [];
  const total = (customersData as any)?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--text-primary)">
            Customers
          </h1>
          <p className="text-sm text-(--text-secondary)">
            Manage your customer directory
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="h-4 w-4 text-(--text-secondary) absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-(--color-neutral-100) rounded animate-pulse"
            />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-(--text-secondary)">No customers found</p>
        </div>
      ) : (
        <Table variant="bordered">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Last Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer: any) => (
              <tr
                key={customer.id}
                className="cursor-pointer hover:bg-(--color-neutral-50)"
                onClick={() => setSelectedCustomer(customer.id)}
              >
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-(--color-brand-100) flex items-center justify-center">
                      <User className="h-5 w-5 text-(--color-brand-600)" />
                    </div>
                    <div>
                      <p className="font-medium text-(--text-primary)">
                        {customer.name}
                      </p>
                      <p className="text-xs text-(--text-secondary)">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="space-y-1">
                    {customer.phone && (
                      <p className="text-sm text-(--text-secondary) flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </p>
                    )}
                  </div>
                </td>
                <td className="text-sm text-(--text-primary)">
                  {customer.totalOrders || 0}
                </td>
                <td className="text-sm font-medium text-(--text-primary)">
                  ₹{customer.totalSpent?.toLocaleString() || '0'}
                </td>
                <td className="text-sm text-(--text-secondary)">
                  {customer.lastOrderDate
                    ? new Date(customer.lastOrderDate).toLocaleDateString()
                    : 'Never'}
                </td>
                <td>
                  <Button variant="secondary" size="sm">
                    View Profile
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-(--text-secondary)">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{' '}
            of {total} customers
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Customer Detail Panel */}
      {selectedCustomer && (
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-(--text-primary) mb-4">
            Purchase History
          </h3>
          {purchaseHistory?.orders?.length > 0 ? (
            <Table variant="bordered">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.orders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="text-sm text-(--text-primary)">
                      {order.orderNumber}
                    </td>
                    <td className="text-sm text-(--text-secondary)">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-sm font-medium text-(--text-primary)">
                      ₹{order.amount?.toLocaleString()}
                    </td>
                    <td>
                      <Badge variant="info">{order.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-sm text-(--text-secondary)">
              No purchase history
            </p>
          )}
        </div>
      )}
    </div>
  );
}
