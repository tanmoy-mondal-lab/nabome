/**
 * Shop Shipping Page
 *
 * Shipping management page for shop owners
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useEffect, useState } from 'react';

import { Truck, Package, MapPin } from 'lucide-react';

import { setDocumentMeta } from '@/lib/seo';
import { Button, Card, Badge, Table, Input } from '@nabome/ui';

import { useShipments, useCarrierRates, useFulfillmentQueue } from './hooks';

export default function ShippingPage() {
  useEffect(() => {
    setDocumentMeta({ title: 'Shipping — নবME Shop' });
  }, []);

  const [activeTab, setActiveTab] = useState('shipments');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: shipments, isLoading: shipmentsLoading } = useShipments({
    search: searchQuery || undefined,
  });

  const { data: fulfillmentQueue, isLoading: fulfillmentLoading } =
    useFulfillmentQueue();
  const { data: carriers, isLoading: carriersLoading } = useCarrierRates();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--text-primary)">
            Shipping
          </h1>
          <p className="text-sm text-(--text-secondary)">
            Manage shipments, tracking, and fulfillment
          </p>
        </div>
        <Button variant="primary">
          <Package className="h-4 w-4 mr-2" />
          Create Shipment
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('shipments')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'shipments'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Truck className="h-4 w-4 inline mr-2" />
          Shipments
        </button>
        <button
          onClick={() => setActiveTab('fulfillment')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'fulfillment'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Package className="h-4 w-4 inline mr-2" />
          Fulfillment Queue
        </button>
        <button
          onClick={() => setActiveTab('carriers')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'carriers'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <MapPin className="h-4 w-4 inline mr-2" />
          Carriers
        </button>
      </div>

      {/* Shipments Tab */}
      {activeTab === 'shipments' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search shipments by tracking number or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Shipments Table */}
          {shipmentsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-(--color-neutral-100) rounded animate-pulse"
                />
              ))}
            </div>
          ) : shipments && shipments.length > 0 ? (
            <Table variant="bordered">
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Order ID</th>
                  <th>Carrier</th>
                  <th>Status</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Estimated Delivery</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment: any) => (
                  <tr key={shipment.id}>
                    <td className="font-medium text-(--text-primary)">
                      {shipment.trackingNumber}
                    </td>
                    <td className="text-sm text-(--text-secondary)">
                      {shipment.orderId}
                    </td>
                    <td className="text-sm text-(--text-primary)">
                      {shipment.carrier}
                    </td>
                    <td>
                      <Badge
                        variant={
                          shipment.status === 'delivered'
                            ? 'success'
                            : shipment.status === 'in_transit'
                              ? 'info'
                              : shipment.status === 'exception'
                                ? 'error'
                                : 'neutral'
                        }
                      >
                        {shipment.status}
                      </Badge>
                    </td>
                    <td className="text-sm text-(--text-secondary)">
                      {shipment.origin}
                    </td>
                    <td className="text-sm text-(--text-secondary)">
                      {shipment.destination}
                    </td>
                    <td className="text-sm text-(--text-primary)">
                      {shipment.estimatedDelivery
                        ? new Date(
                            shipment.estimatedDelivery,
                          ).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>
                      <Button variant="secondary" size="sm">
                        Track
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-(--text-secondary)">
                No shipments found
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fulfillment Queue Tab */}
      {activeTab === 'fulfillment' && (
        <div className="space-y-4">
          {fulfillmentLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-(--color-neutral-100) rounded animate-pulse"
                />
              ))}
            </div>
          ) : fulfillmentQueue && fulfillmentQueue.length > 0 ? (
            <div className="space-y-4">
              {fulfillmentQueue.map((item: any) => (
                <Card padding="lg" key={item.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-(--color-brand-100) flex items-center justify-center">
                          <Package className="h-5 w-5 text-(--color-brand-600)" />
                        </div>
                        <div>
                          <p className="font-medium text-(--text-primary)">
                            Order #{item.orderNumber}
                          </p>
                          <p className="text-sm text-(--text-secondary)">
                            {item.items?.length || 0} items
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-(--text-secondary)">Customer</p>
                          <p className="text-(--text-primary)">
                            {item.customerName}
                          </p>
                        </div>
                        <div>
                          <p className="text-(--text-secondary)">
                            Shipping Address
                          </p>
                          <p className="text-(--text-primary)">
                            {item.shippingAddress}
                          </p>
                        </div>
                        <div>
                          <p className="text-(--text-secondary)">Priority</p>
                          <Badge
                            variant={
                              item.priority === 'high' ? 'error' : 'info'
                            }
                          >
                            {item.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm">
                        <Package className="h-4 w-4 mr-2" />
                        Pack
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Truck className="h-4 w-4 mr-2" />
                        Ship
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-(--text-secondary)">
                No items in fulfillment queue
              </p>
            </div>
          )}
        </div>
      )}

      {/* Carriers Tab */}
      {activeTab === 'carriers' && (
        <div className="space-y-4">
          {carriersLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-(--color-neutral-100) rounded animate-pulse"
                />
              ))}
            </div>
          ) : carriers && carriers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {carriers.map((carrier: any) => (
                <Card padding="lg" key={carrier.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-lg bg-(--color-brand-100) flex items-center justify-center">
                      <Truck className="h-6 w-6 text-(--color-brand-600)" />
                    </div>
                    <Badge variant={carrier.active ? 'success' : 'neutral'}>
                      {carrier.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-(--text-primary) mb-2">
                    {carrier.name}
                  </h3>
                  <p className="text-sm text-(--text-secondary) mb-4">
                    {carrier.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-(--text-secondary)">Base Rate</span>
                      <span className="text-(--text-primary)">
                        ₹{carrier.baseRate?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-(--text-secondary)">Per KG</span>
                      <span className="text-(--text-primary)">
                        ₹{carrier.perKgRate?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-(--text-secondary)">
                        Delivery Time
                      </span>
                      <span className="text-(--text-primary)">
                        {carrier.deliveryDays} days
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="secondary" size="sm" className="w-full">
                      Configure
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-(--text-secondary)">
                No carriers configured
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
