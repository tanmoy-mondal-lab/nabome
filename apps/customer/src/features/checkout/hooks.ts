/**
 * Checkout React Hooks
 *
 * Custom React hooks for checkout operations.
 * These hooks provide a convenient interface for components to interact with the checkout system.
 */

import { useCallback, useEffect } from 'react';

import { getOrCreateGuestId } from '../../lib/guest-id';
import { useAuthStore } from '../../stores/auth-store';
import { useCheckoutStore } from '../../stores/checkout-store';

/**
 * Hook for checkout operations
 */
export function useCheckout() {
  const {
    checkoutSession,
    addresses,
    defaultAddress,
    shippingRates,
    selectedShippingRate,
    appliedCoupon,
    validation,
    summary,
    isLoading,
    isProcessing,
    error,
    currentStep,
    isCheckoutOpen,
    startCheckout,
    resumeCheckout,
    validateCheckout,
    updateCheckout,
    lockCheckout,
    completeCheckout,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    applyCoupon,
    removeCoupon,
    fetchShippingRates,
    selectShippingRate,
    setCurrentStep,
    setIsCheckoutOpen,
    resetCheckout,
    canProceed,
    getTotals,
  } = useCheckoutStore();

  const handleStartCheckout = useCallback(
    async (cartId: string) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      const guestId = userId ? undefined : getOrCreateGuestId();
      await startCheckout(cartId, userId, guestId);
    },
    [startCheckout],
  );

  const handleResumeCheckout = useCallback(
    async (checkoutSessionId: string) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      const guestId = userId ? undefined : getOrCreateGuestId();
      await resumeCheckout(checkoutSessionId, userId, guestId);
    },
    [resumeCheckout],
  );

  const handleValidateCheckout = useCallback(
    async (checkoutSessionId: string) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      const guestId = userId ? undefined : getOrCreateGuestId();
      return validateCheckout(checkoutSessionId, userId, guestId);
    },
    [validateCheckout],
  );

  const handleUpdateCheckout = useCallback(
    async (checkoutSessionId: string, updates: any) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      const guestId = userId ? undefined : getOrCreateGuestId();
      await updateCheckout(checkoutSessionId, updates, userId, guestId);
    },
    [updateCheckout],
  );

  const handleLockCheckout = useCallback(
    async (checkoutSessionId: string) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      const guestId = userId ? undefined : getOrCreateGuestId();
      await lockCheckout(checkoutSessionId, userId, guestId);
    },
    [lockCheckout],
  );

  const handleCompleteCheckout = useCallback(
    async (checkoutSessionId: string, paymentData: any) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      const guestId = userId ? undefined : getOrCreateGuestId();
      return completeCheckout(checkoutSessionId, paymentData, userId, guestId);
    },
    [completeCheckout],
  );

  const handleFetchAddresses = useCallback(async () => {
    const user = useAuthStore.getState().user;
    const userId = user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    await fetchAddresses(userId);
  }, [fetchAddresses]);

  const handleCreateAddress = useCallback(
    async (address: any) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      await createAddress(address, userId);
    },
    [createAddress],
  );

  const handleUpdateAddress = useCallback(
    async (addressId: string, address: any) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      await updateAddress(addressId, address, userId);
    },
    [updateAddress],
  );

  const handleDeleteAddress = useCallback(
    async (addressId: string) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      await deleteAddress(addressId, userId);
    },
    [deleteAddress],
  );

  const handleSetDefaultAddress = useCallback(
    async (addressId: string) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      await setDefaultAddress(addressId, userId);
    },
    [setDefaultAddress],
  );

  const handleApplyCoupon = useCallback(
    async (code: string, checkoutSessionId: string) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      const guestId = userId ? undefined : getOrCreateGuestId();
      await applyCoupon(code, checkoutSessionId, userId, guestId);
    },
    [applyCoupon],
  );

  const handleRemoveCoupon = useCallback(
    async (checkoutSessionId: string) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      const guestId = userId ? undefined : getOrCreateGuestId();
      await removeCoupon(checkoutSessionId, userId, guestId);
    },
    [removeCoupon],
  );

  const handleFetchShippingRates = useCallback(async () => {
    const user = useAuthStore.getState().user;
    const userId = user?.id;
    const guestId = userId ? undefined : getOrCreateGuestId();
    await fetchShippingRates(userId, guestId);
  }, [fetchShippingRates]);

  const handleSelectShippingRate = useCallback(
    async (rate: any, checkoutSessionId: string) => {
      const user = useAuthStore.getState().user;
      const userId = user?.id;
      const guestId = userId ? undefined : getOrCreateGuestId();
      await selectShippingRate(rate, checkoutSessionId, userId, guestId);
    },
    [selectShippingRate],
  );

  return {
    checkoutSession,
    addresses,
    defaultAddress,
    shippingRates,
    selectedShippingRate,
    appliedCoupon,
    validation,
    summary,
    isLoading,
    isProcessing,
    error,
    currentStep,
    isCheckoutOpen,
    startCheckout: handleStartCheckout,
    resumeCheckout: handleResumeCheckout,
    validateCheckout: handleValidateCheckout,
    updateCheckout: handleUpdateCheckout,
    lockCheckout: handleLockCheckout,
    completeCheckout: handleCompleteCheckout,
    fetchAddresses: handleFetchAddresses,
    createAddress: handleCreateAddress,
    updateAddress: handleUpdateAddress,
    deleteAddress: handleDeleteAddress,
    setDefaultAddress: handleSetDefaultAddress,
    applyCoupon: handleApplyCoupon,
    removeCoupon: handleRemoveCoupon,
    fetchShippingRates: handleFetchShippingRates,
    selectShippingRate: handleSelectShippingRate,
    setCurrentStep,
    setIsCheckoutOpen,
    resetCheckout,
    canProceed,
    getTotals,
  };
}

/**
 * Hook for checkout step management
 */
export function useCheckoutStep() {
  const { currentStep, setCurrentStep } = useCheckoutStore();

  const goToNextStep = useCallback(() => {
    const steps: ('address' | 'shipping' | 'payment' | 'review')[] = [
      'address',
      'shipping',
      'payment',
      'review',
    ];
    const currentIndex = currentStep ? steps.indexOf(currentStep as any) : 0;
    const validIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = validIndex + 1;
    if (nextIndex < steps.length) {
      const nextStep = steps[nextIndex];
      if (nextStep) {
        setCurrentStep(nextStep);
      }
    }
  }, [currentStep, setCurrentStep]);

  const goToPreviousStep = useCallback(() => {
    const steps: ('address' | 'shipping' | 'payment' | 'review')[] = [
      'address',
      'shipping',
      'payment',
      'review',
    ];
    const currentIndex = currentStep ? steps.indexOf(currentStep as any) : 0;
    const validIndex = currentIndex >= 0 ? currentIndex : 0;
    const prevIndex = validIndex - 1;
    if (prevIndex >= 0) {
      const prevStep = steps[prevIndex];
      if (prevStep) {
        setCurrentStep(prevStep);
      }
    }
  }, [currentStep, setCurrentStep]);

  const goToStep = useCallback(
    (step: 'address' | 'shipping' | 'payment' | 'review') => {
      setCurrentStep(step);
    },
    [setCurrentStep],
  );

  return {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
  };
}

/**
 * Hook for checkout totals
 */
export function useCheckoutTotals() {
  const { getTotals } = useCheckoutStore();
  const totals = getTotals();

  return totals;
}

/**
 * Hook for address management
 */
export function useAddressManagement() {
  const {
    addresses,
    defaultAddress,
    isLoading,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useCheckoutStore();

  useEffect(() => {
    // Fetch addresses on mount if user is authenticated
    const user = useAuthStore.getState().user;
    const userId = user?.id;
    if (userId) {
      fetchAddresses(userId);
    }
  }, [fetchAddresses]);

  return {
    addresses,
    defaultAddress,
    isLoading,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
}

/**
 * Hook for coupon management
 */
export function useCouponManagement() {
  const { appliedCoupon, isLoading, error, applyCoupon, removeCoupon } =
    useCheckoutStore();

  const handleApplyCoupon = useCallback(
    async (code: string, checkoutSessionId: string) => {
      try {
        await applyCoupon(code, checkoutSessionId);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to apply coupon',
        };
      }
    },
    [applyCoupon],
  );

  const handleRemoveCoupon = useCallback(
    async (checkoutSessionId: string) => {
      try {
        await removeCoupon(checkoutSessionId);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to remove coupon',
        };
      }
    },
    [removeCoupon],
  );

  return {
    appliedCoupon,
    isLoading,
    error,
    applyCoupon: handleApplyCoupon,
    removeCoupon: handleRemoveCoupon,
  };
}

/**
 * Hook for shipping management
 */
export function useShippingManagement() {
  const {
    shippingRates,
    selectedShippingRate,
    isLoading,
    error,
    fetchShippingRates,
    selectShippingRate,
  } = useCheckoutStore();

  useEffect(() => {
    // Fetch shipping rates on mount
    fetchShippingRates();
  }, [fetchShippingRates]);

  const handleSelectRate = useCallback(
    async (rate: any, checkoutSessionId: string) => {
      try {
        await selectShippingRate(rate, checkoutSessionId);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : 'Failed to select shipping rate',
        };
      }
    },
    [selectShippingRate],
  );

  return {
    shippingRates,
    selectedShippingRate,
    isLoading,
    error,
    fetchShippingRates,
    selectShippingRate: handleSelectRate,
  };
}

/**
 * Hook for checkout drawer/sheet state
 */
export function useCheckoutDrawer() {
  const { isCheckoutOpen, setIsCheckoutOpen } = useCheckoutStore();

  const open = useCallback(() => setIsCheckoutOpen(true), [setIsCheckoutOpen]);
  const close = useCallback(
    () => setIsCheckoutOpen(false),
    [setIsCheckoutOpen],
  );
  const toggle = useCallback(() => {
    const { isCheckoutOpen: currentIsOpen } = useCheckoutStore.getState();
    setIsCheckoutOpen(!currentIsOpen);
  }, [setIsCheckoutOpen]);

  return {
    isCheckoutOpen,
    open,
    close,
    toggle,
  };
}
