/**
 * Main Checkout Component
 *
 * Multi-step checkout flow orchestrator.
 * Mobile-first, accessible, following official Component Library patterns.
 */

import React from 'react';
import { useNavigate } from 'react-router';

import { useCheckout, useCheckoutStep } from '../hooks';

import { AddressForm } from './AddressForm';
import type { AddressFormData } from './AddressForm';
import { AddressSelector } from './AddressSelector';
import { CheckoutStepper } from './CheckoutStepper';
import { CheckoutSummary } from './CheckoutSummary';
import { CouponInput } from './CouponInput';
import { ShippingSelector } from './ShippingSelector';

export function Checkout() {
  const navigate = useNavigate();
  const {
    checkoutSession,
    addresses,
    shippingRates,
    selectedShippingRate,
    appliedCoupon,
    summary,
    isLoading,
    isProcessing,
    error,
    currentStep,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    applyCoupon,
    removeCoupon,
    fetchShippingRates,
    selectShippingRate,
    updateCheckout,
    lockCheckout,
    completeCheckout,
    setCurrentStep,
    canProceed,
  } = useCheckout();

  const { goToNextStep, goToPreviousStep } = useCheckoutStep();

  const [showAddressForm, setShowAddressForm] = React.useState(false);
  const [editingAddressId, setEditingAddressId] = React.useState<string | null>(
    null,
  );
  const [selectedAddressId, setSelectedAddressId] = React.useState<
    string | null
  >(null);

  const completedSteps = React.useMemo(() => {
    const steps = new Set<string>();
    if (selectedAddressId) steps.add('address');
    if (selectedShippingRate) steps.add('shipping');
    if (appliedCoupon) steps.add('coupon');
    return steps;
  }, [selectedAddressId, selectedShippingRate, appliedCoupon]);

  React.useEffect(() => {
    fetchAddresses();
    fetchShippingRates();
  }, [fetchAddresses, fetchShippingRates]);

  const handleAddressSubmit = async (addressData: AddressFormData) => {
    if (editingAddressId) {
      await updateAddress(editingAddressId, addressData);
    } else {
      await createAddress(addressData);
    }
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (checkoutSession) {
      // Update checkout with selected address
      // This would call the API to update the checkout session
    }
  };

  const handleStepClick = (
    step: 'address' | 'shipping' | 'payment' | 'review',
  ) => {
    if (completedSteps.has(step) || step === 'address') {
      setCurrentStep(step);
    }
  };

  const handleProceed = () => {
    if (canProceed()) {
      goToNextStep();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'address':
        return (
          <div className="space-y-6">
            {showAddressForm ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
                </h2>
                <AddressForm
                  onSubmit={handleAddressSubmit}
                  onCancel={() => {
                    setShowAddressForm(false);
                    setEditingAddressId(null);
                  }}
                  initialData={
                    editingAddressId
                      ? {
                          ...addresses.find((a) => a.id === editingAddressId),
                          line2:
                            addresses.find((a) => a.id === editingAddressId)
                              ?.line2 || undefined,
                        }
                      : undefined
                  }
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <AddressSelector
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={handleSelectAddress}
                onAddNewAddress={() => {
                  setEditingAddressId(null);
                  setShowAddressForm(true);
                }}
                onEditAddress={(id) => {
                  setEditingAddressId(id);
                  setShowAddressForm(true);
                }}
                onDeleteAddress={deleteAddress}
                onSetDefault={setDefaultAddress}
                isLoading={isLoading}
              />
            )}
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-6">
            <ShippingSelector
              shippingRates={shippingRates}
              selectedRateId={selectedShippingRate?.id}
              onSelectRate={(rate) =>
                checkoutSession && selectShippingRate(rate, checkoutSession.id)
              }
              isLoading={isLoading}
              subtotal={summary?.totals?.itemsSubtotal || 0}
            />
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Method
              </h2>
              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-brand-500 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    defaultChecked
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        Razorpay
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Pay securely with cards, UPI, net banking, or wallets
                    </p>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-brand-500 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">
                      Cash on Delivery
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Pay when your order arrives
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            {summary && (
              <>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Review
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Shipping Address
                      </p>
                      <p className="text-sm text-gray-600">
                        {
                          addresses.find((a) => a.id === selectedAddressId)
                            ?.line1
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Shipping Method
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedShippingRate?.name}
                      </p>
                    </div>
                    {appliedCoupon && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Applied Coupon
                        </p>
                        <p className="text-sm text-green-600">
                          {typeof appliedCoupon === 'string'
                            ? appliedCoupon
                            : appliedCoupon.code}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <CheckoutSummary
                  items={summary.items.map((item) => ({
                    id: item.variantId,
                    productName: item.productName,
                    variantName: item.variantName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    lineTotal: item.lineTotal,
                    imageUrl: item.imageUrl,
                  }))}
                  subtotal={summary.totals.itemsSubtotal}
                  discountTotal={summary.totals.discountTotal}
                  shippingTotal={summary.totals.shippingTotal}
                  taxTotal={summary.totals.taxTotal}
                  grandTotal={summary.totals.grandTotal}
                  couponCode={
                    typeof appliedCoupon === 'string'
                      ? appliedCoupon
                      : appliedCoupon?.code || null
                  }
                />
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">Complete your order</p>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
            role="alert"
          >
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Stepper */}
        <div className="mb-8">
          <CheckoutStepper
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Steps */}
          <div className="lg:col-span-2">{renderStepContent()}</div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Coupon Input */}
              <CouponInput
                appliedCoupon={
                  typeof appliedCoupon === 'string'
                    ? appliedCoupon
                    : appliedCoupon?.code || null
                }
                onApplyCoupon={async (code) => {
                  if (checkoutSession) {
                    await applyCoupon(code, checkoutSession.id);
                    return { success: true };
                  }
                  return { success: false, error: 'No checkout session' };
                }}
                onRemoveCoupon={async () => {
                  if (checkoutSession) {
                    await removeCoupon(checkoutSession.id);
                    return { success: true };
                  }
                  return { success: false, error: 'No checkout session' };
                }}
                isLoading={isLoading}
              />

              {/* Order Summary */}
              {summary && (
                <CheckoutSummary
                  items={summary.items.map((item) => ({
                    id: item.variantId,
                    productName: item.productName,
                    variantName: item.variantName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    lineTotal: item.lineTotal,
                    imageUrl: item.imageUrl,
                  }))}
                  subtotal={summary.totals.itemsSubtotal}
                  discountTotal={summary.totals.discountTotal}
                  shippingTotal={summary.totals.shippingTotal}
                  taxTotal={summary.totals.taxTotal}
                  grandTotal={summary.totals.grandTotal}
                  couponCode={
                    typeof appliedCoupon === 'string'
                      ? appliedCoupon
                      : appliedCoupon?.code || null
                  }
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {currentStep !== 'address' && (
                  <button
                    onClick={goToPreviousStep}
                    disabled={isProcessing}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Back
                  </button>
                )}
                {currentStep !== 'review' ? (
                  <button
                    onClick={handleProceed}
                    disabled={!canProceed() || isProcessing}
                    className="flex-1 bg-brand-500 text-white px-4 py-3 rounded-md font-medium hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? 'Processing...' : 'Continue'}
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      const selectedPaymentMethod =
                        (
                          document.querySelector(
                            'input[name="payment"]:checked',
                          ) as HTMLInputElement
                        )?.value || 'razorpay';
                      if (checkoutSession && selectedAddressId) {
                        try {
                          // Update checkout with shipping address and payment method
                          await updateCheckout(checkoutSession.id, {
                            shippingAddressId: selectedAddressId,
                            paymentMethod: selectedPaymentMethod,
                          });

                          // Lock checkout before completing
                          await lockCheckout(checkoutSession.id);

                          // Complete checkout
                          const result = (await completeCheckout(
                            checkoutSession.id,
                            {
                              paymentMethod: selectedPaymentMethod,
                            },
                          )) as any;

                          // Navigate to order confirmation page
                          const orderId =
                            result?.orderId ||
                            result?.order?.id ||
                            checkoutSession.id;
                          navigate(`/order-confirmation/${orderId}`);
                        } catch (err) {
                          console.error('Checkout failed:', err);
                        }
                      }
                    }}
                    disabled={isProcessing || !selectedAddressId}
                    className="flex-1 bg-green-500 text-white px-4 py-3 rounded-md font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
