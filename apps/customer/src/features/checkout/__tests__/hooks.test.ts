import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useCheckoutStore } from '../../../stores/checkout-store';
import { useCheckout, useCheckoutStep, useCheckoutDrawer } from '../hooks';

vi.mock('../../../stores/checkout-store', () => ({
  useCheckoutStore: vi.fn(),
}));
const mocked = vi.mocked(useCheckoutStore);

describe('useCheckout', () => {
  beforeEach(() => vi.clearAllMocks());
  it('should return checkout state and actions', () => {
    const mockStore: any = {
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
      startCheckout: vi.fn(),
      resumeCheckout: vi.fn(),
      validateCheckout: vi.fn(),
      updateCheckout: vi.fn(),
      lockCheckout: vi.fn(),
      completeCheckout: vi.fn(),
      fetchAddresses: vi.fn(),
      createAddress: vi.fn(),
      updateAddress: vi.fn(),
      deleteAddress: vi.fn(),
      setDefaultAddress: vi.fn(),
      applyCoupon: vi.fn(),
      removeCoupon: vi.fn(),
      fetchShippingRates: vi.fn(),
      selectShippingRate: vi.fn(),
      setCurrentStep: vi.fn(),
      setIsCheckoutOpen: vi.fn(),
      resetCheckout: vi.fn(),
      canProceed: vi.fn(() => true),
      getTotals: vi.fn(() => ({
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      })),
    };
    mocked.mockReturnValue(mockStore);
    const { result } = renderHook(() => useCheckout());
    expect(result.current.checkoutSession).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
  it('should call startCheckout with correct parameters', async () => {
    const mockStore: any = {
      startCheckout: vi.fn().mockResolvedValue(undefined),
      checkoutSession: null,
      isLoading: false,
      error: null,
      addresses: [],
      defaultAddress: null,
      shippingRates: [],
      selectedShippingRate: null,
      appliedCoupon: null,
      validation: null,
      summary: null,
      isProcessing: false,
      currentStep: 'address',
      isCheckoutOpen: false,
      resumeCheckout: vi.fn(),
      validateCheckout: vi.fn(),
      updateCheckout: vi.fn(),
      lockCheckout: vi.fn(),
      completeCheckout: vi.fn(),
      fetchAddresses: vi.fn(),
      createAddress: vi.fn(),
      updateAddress: vi.fn(),
      deleteAddress: vi.fn(),
      setDefaultAddress: vi.fn(),
      applyCoupon: vi.fn(),
      removeCoupon: vi.fn(),
      fetchShippingRates: vi.fn(),
      selectShippingRate: vi.fn(),
      setCurrentStep: vi.fn(),
      setIsCheckoutOpen: vi.fn(),
      resetCheckout: vi.fn(),
      canProceed: vi.fn(),
      getTotals: vi.fn(),
    };
    mocked.mockReturnValue(mockStore);
    const { result } = renderHook(() => useCheckout());
    await act(async () => {
      await result.current.startCheckout('cart-1');
    });
    expect(mockStore.startCheckout).toHaveBeenCalled();
    expect(mockStore.startCheckout.mock.calls[0][0]).toBe('cart-1');
  });
});

describe('useCheckoutStep', () => {
  beforeEach(() => vi.clearAllMocks());
  it('should return current step and navigation actions', () => {
    const mockStore: any = { currentStep: 'address', setCurrentStep: vi.fn() };
    mocked.mockReturnValue(mockStore);
    const { result } = renderHook(() => useCheckoutStep());
    expect(result.current.currentStep).toBe('address');
  });
  it('should navigate to next step', () => {
    const mockStore: any = { currentStep: 'address', setCurrentStep: vi.fn() };
    mocked.mockReturnValue(mockStore);
    const { result } = renderHook(() => useCheckoutStep());
    act(() => {
      result.current.goToNextStep();
    });
    expect(mockStore.setCurrentStep).toHaveBeenCalledWith('shipping');
  });
  it('should navigate to previous step', () => {
    const mockStore: any = { currentStep: 'shipping', setCurrentStep: vi.fn() };
    mocked.mockReturnValue(mockStore);
    const { result } = renderHook(() => useCheckoutStep());
    act(() => {
      result.current.goToPreviousStep();
    });
    expect(mockStore.setCurrentStep).toHaveBeenCalledWith('address');
  });
  it('should navigate to specific step', () => {
    const mockStore: any = { currentStep: 'address', setCurrentStep: vi.fn() };
    mocked.mockReturnValue(mockStore);
    const { result } = renderHook(() => useCheckoutStep());
    act(() => {
      result.current.goToStep('payment');
    });
    expect(mockStore.setCurrentStep).toHaveBeenCalledWith('payment');
  });
});

describe('useCheckoutDrawer', () => {
  beforeEach(() => vi.clearAllMocks());
  it('should return drawer state and actions', () => {
    const mockStore: any = {
      isCheckoutOpen: false,
      setIsCheckoutOpen: vi.fn(),
    };
    mocked.mockReturnValue(mockStore);
    const { result } = renderHook(() => useCheckoutDrawer());
    expect(result.current.isCheckoutOpen).toBe(false);
  });
  it('should open drawer', () => {
    const mockStore: any = {
      isCheckoutOpen: false,
      setIsCheckoutOpen: vi.fn(),
    };
    mocked.mockReturnValue(mockStore);
    const { result } = renderHook(() => useCheckoutDrawer());
    act(() => {
      result.current.open();
    });
    expect(mockStore.setIsCheckoutOpen).toHaveBeenCalledWith(true);
  });
  it('should close drawer', () => {
    const mockStore: any = { isCheckoutOpen: true, setIsCheckoutOpen: vi.fn() };
    mocked.mockReturnValue(mockStore);
    const { result } = renderHook(() => useCheckoutDrawer());
    act(() => {
      result.current.close();
    });
    expect(mockStore.setIsCheckoutOpen).toHaveBeenCalledWith(false);
  });
  it('should toggle drawer state', () => {
    const mockStore: any = {
      isCheckoutOpen: false,
      setIsCheckoutOpen: vi.fn(),
    };
    mocked.mockReturnValue(mockStore);
    (mocked as any).getState = vi.fn(() => ({ isCheckoutOpen: false }));
    const { result } = renderHook(() => useCheckoutDrawer());
    act(() => {
      result.current.toggle();
    });
    expect(mockStore.setIsCheckoutOpen).toHaveBeenCalledWith(true);
  });
});
