import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  CheckoutSession,
  Address,
  Coupon,
  ShippingRate,
  CheckoutTotals,
  CheckoutValidationResult,
  CheckoutSummaryResponse,
} from '../features/checkout/types';
import { api } from '../lib/api/client';

interface CheckoutState {
  // State
  checkoutSession: CheckoutSession | null;
  addresses: Address[];
  defaultAddress: Address | null;
  shippingRates: ShippingRate[];
  selectedShippingRate: ShippingRate | null;
  appliedCoupon: Coupon | null;
  validation: CheckoutValidationResult | null;
  summary: CheckoutSummaryResponse | null;

  // UI State
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  currentStep: 'address' | 'shipping' | 'payment' | 'review';
  isCheckoutOpen: boolean;

  // Actions
  startCheckout: (
    cartId: string,
    userId?: string,
    guestId?: string,
  ) => Promise<void>;
  resumeCheckout: (
    checkoutSessionId: string,
    userId?: string,
    guestId?: string,
  ) => Promise<void>;
  validateCheckout: (
    checkoutSessionId: string,
    userId?: string,
    guestId?: string,
  ) => Promise<CheckoutValidationResult>;
  updateCheckout: (
    checkoutSessionId: string,
    updates: any,
    userId?: string,
    guestId?: string,
  ) => Promise<void>;
  lockCheckout: (
    checkoutSessionId: string,
    userId?: string,
    guestId?: string,
  ) => Promise<void>;
  completeCheckout: (
    checkoutSessionId: string,
    paymentData: any,
    userId?: string,
    guestId?: string,
  ) => Promise<unknown>;

  // Address Actions
  fetchAddresses: (userId: string) => Promise<void>;
  createAddress: (address: any, userId: string) => Promise<void>;
  updateAddress: (
    addressId: string,
    address: any,
    userId: string,
  ) => Promise<void>;
  deleteAddress: (addressId: string, userId: string) => Promise<void>;
  setDefaultAddress: (addressId: string, userId: string) => Promise<void>;

  // Coupon Actions
  applyCoupon: (
    code: string,
    checkoutSessionId: string,
    userId?: string,
    guestId?: string,
  ) => Promise<void>;
  removeCoupon: (
    checkoutSessionId: string,
    userId?: string,
    guestId?: string,
  ) => Promise<void>;

  // Shipping Actions
  fetchShippingRates: (userId?: string, guestId?: string) => Promise<void>;
  selectShippingRate: (
    rate: ShippingRate,
    checkoutSessionId: string,
    userId?: string,
    guestId?: string,
  ) => Promise<void>;

  // UI Actions
  setCurrentStep: (step: 'address' | 'shipping' | 'payment' | 'review') => void;
  setIsCheckoutOpen: (isOpen: boolean) => void;
  resetCheckout: () => void;

  // Computed
  canProceed: () => boolean;
  getTotals: () => CheckoutTotals | null;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      // Initial State
      checkoutSession: null,
      addresses: [],
      defaultAddress: null,
      shippingRates: [],
      selectedShippingRate: null,
      appliedCoupon: null,
      validation: null,
      summary: null,
      isLoading: false,
      isProcessing: false,
      error: null,
      currentStep: 'address',
      isCheckoutOpen: false,

      // Checkout Actions
      startCheckout: async (cartId, userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          const data = await api.post<{ session: CheckoutSession }>(
            '/checkout/start',
            { cartId },
            { headers },
          );
          set({
            checkoutSession: data.session,
            isLoading: false,
            currentStep: 'address',
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to start checkout',
            isLoading: false,
          });
        }
      },

      resumeCheckout: async (checkoutSessionId, userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          const data = await api.post<{ session: CheckoutSession }>(
            '/checkout/resume',
            { checkoutSessionId },
            { headers },
          );
          set({
            checkoutSession: data.session,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to resume checkout',
            isLoading: false,
          });
        }
      },

      validateCheckout: async (checkoutSessionId, userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          const data = await api.post<CheckoutValidationResult>(
            '/checkout/validate',
            { checkoutSessionId },
            { headers },
          );
          set({ validation: data, isLoading: false });
          return data;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to validate checkout',
            isLoading: false,
          });
          throw error;
        }
      },

      updateCheckout: async (checkoutSessionId, updates, userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          const data = await api.patch<{ session: CheckoutSession }>(
            `/checkout/${checkoutSessionId}`,
            updates,
            { headers },
          );
          set({
            checkoutSession: data.session,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update checkout',
            isLoading: false,
          });
        }
      },

      lockCheckout: async (checkoutSessionId, userId, guestId) => {
        set({ isProcessing: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          const data = await api.post<{ session: CheckoutSession }>(
            `/checkout/${checkoutSessionId}/lock`,
            {},
            { headers },
          );
          set({
            checkoutSession: data.session,
            isProcessing: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to lock checkout',
            isProcessing: false,
          });
        }
      },

      completeCheckout: async (
        checkoutSessionId,
        paymentData,
        userId,
        guestId,
      ) => {
        set({ isProcessing: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          const data = await api.post(
            `/checkout/${checkoutSessionId}/complete`,
            paymentData,
            { headers },
          );
          set({
            isProcessing: false,
            checkoutSession: null,
          });
          return data;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to complete checkout',
            isProcessing: false,
          });
          throw error;
        }
      },

      // Address Actions
      fetchAddresses: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.get<{
            addresses: Address[];
            defaultAddress: Address | null;
          }>('/checkout/addresses');
          set({
            addresses: data.addresses,
            defaultAddress: data.defaultAddress,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch addresses',
            isLoading: false,
          });
        }
      },

      createAddress: async (address, userId) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/checkout/addresses', address);
          await get().fetchAddresses(userId);
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create address',
            isLoading: false,
          });
        }
      },

      updateAddress: async (addressId, address, userId) => {
        set({ isLoading: true, error: null });
        try {
          await api.patch(`/checkout/addresses/${addressId}`, address);
          await get().fetchAddresses(userId);
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update address',
            isLoading: false,
          });
        }
      },

      deleteAddress: async (addressId, userId) => {
        set({ isLoading: true, error: null });
        try {
          await api.del(`/checkout/addresses/${addressId}`);
          await get().fetchAddresses(userId);
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete address',
            isLoading: false,
          });
        }
      },

      setDefaultAddress: async (addressId, userId) => {
        set({ isLoading: true, error: null });
        try {
          await api.post(`/checkout/addresses/${addressId}/default`, {});
          await get().fetchAddresses(userId);
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to set default address',
            isLoading: false,
          });
        }
      },

      // Coupon Actions
      applyCoupon: async (code, checkoutSessionId, userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          const data = await api.post<{ coupon: Coupon }>(
            '/checkout/coupons/apply',
            { code, checkoutSessionId },
            { headers },
          );
          set({
            appliedCoupon: data.coupon,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to apply coupon',
            isLoading: false,
          });
        }
      },

      removeCoupon: async (checkoutSessionId, userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          await api.post(
            '/checkout/coupons/remove',
            { checkoutSessionId },
            { headers },
          );
          set({
            appliedCoupon: null,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to remove coupon',
            isLoading: false,
          });
        }
      },

      // Shipping Actions
      fetchShippingRates: async (userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          const headers: Record<string, string> = {};
          if (guestId) headers['x-guest-id'] = guestId;

          const data = await api.get<{ rates: ShippingRate[] }>(
            '/checkout/shipping/rates',
            { headers },
          );
          set({
            shippingRates: data.rates,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch shipping rates',
            isLoading: false,
          });
        }
      },

      selectShippingRate: async (rate, checkoutSessionId, userId, guestId) => {
        set({ isLoading: true, error: null });
        try {
          await get().updateCheckout(
            checkoutSessionId,
            { shippingRateId: rate.id },
            userId,
            guestId,
          );
          set({
            selectedShippingRate: rate,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to select shipping rate',
            isLoading: false,
          });
        }
      },

      // UI Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      setIsCheckoutOpen: (isOpen) => set({ isCheckoutOpen: isOpen }),
      resetCheckout: () =>
        set({
          checkoutSession: null,
          addresses: [],
          defaultAddress: null,
          shippingRates: [],
          selectedShippingRate: null,
          appliedCoupon: null,
          validation: null,
          summary: null,
          isLoading: false,
          isProcessing: false,
          error: null,
          currentStep: 'address',
        }),

      // Computed
      canProceed: () => {
        const validation = get().validation;
        return validation?.canProceed || false;
      },

      getTotals: () => {
        const summary = get().summary;
        return summary?.totals || null;
      },
    }),
    {
      name: 'nabome-checkout',
      partialize: (state) => ({
        isCheckoutOpen: state.isCheckoutOpen,
        currentStep: state.currentStep,
      }),
    },
  ),
);
