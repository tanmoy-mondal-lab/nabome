/**
 * Address Book Component
 *
 * Displays customer's saved addresses with add/edit/delete functionality.
 * Mobile-first, accessible, and follows the official component library.
 *
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 * Source: FRONTEND_APPLICATION_IMPLEMENTATION_SPECIFICATION.md (binding)
 */

import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  Home,
  Briefcase,
  Building2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { useAddressBook } from '@nabome/customer';
import type { CustomerAddress } from '@nabome/customer';
import { Button } from '@nabome/ui';

interface AddressBookProps {
  userId: string;
}

export function AddressBook({ userId }: AddressBookProps) {
  const {
    addresses,
    addressesLoading,
    addressesError,
    defaultShippingAddressId,
    defaultBillingAddressId,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefault,
    fetchAddresses,
  } = useAddressBook();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load addresses on mount
  useEffect(() => {
    if (userId) {
      fetchAddresses(userId);
    }
  }, [userId, fetchAddresses]);

  const handleAdd = () => {
    setIsAdding(true);
  };

  const handleEdit = (addressId: string) => {
    setEditingId(addressId);
  };

  const handleDelete = async (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(addressId);
    }
  };

  const handleSetDefault = async (
    addressId: string,
    type: 'shipping' | 'billing',
  ) => {
    await setDefault({ addressId, type });
  };

  const getAddressIcon = (usageType?: string) => {
    switch (usageType) {
      case 'shipping':
        return <Home className="w-4 h-4" />;
      case 'billing':
        return <Briefcase className="w-4 h-4" />;
      case 'both':
        return <Building2 className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  if (addressesLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg" />
        <div className="h-32 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (addressesError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
        {addressesError}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
        <Button
          onClick={handleAdd}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No saved addresses yet</p>
          <Button onClick={handleAdd} variant="outline">
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                    {getAddressIcon(address.usageType)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{address.label}</p>
                    {(address.isDefaultShipping ||
                      address.isDefaultBilling) && (
                      <div className="flex gap-1 mt-1">
                        {address.isDefaultShipping && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            Default Shipping
                          </span>
                        )}
                        {address.isDefaultBilling && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Default Billing
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(address.id, 'shipping')}
                    title="Set as default shipping"
                    disabled={address.id === defaultShippingAddressId}
                  >
                    <Star
                      className={`w-4 h-4 ${address.id === defaultShippingAddressId ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(address.id)}
                    title="Edit address"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium">{address.recipientName}</p>
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p>{address.country}</p>
                <p>{address.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TODO: Add Address Form Modal */}
      {/* TODO: Edit Address Form Modal */}
    </div>
  );
}
