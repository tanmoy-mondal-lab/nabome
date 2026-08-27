/**
 * Shop Settings Page Component Tests
 *
 * Component tests for the settings page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import SettingsPage from './SettingsPage';

// Mock the hooks
vi.mock('../hooks', () => ({
  useShopSettings: () => ({
    data: {
      name: 'Test Shop',
      description: 'Test Description',
      email: 'test@example.com',
      phone: '+1234567890',
      address: '123 Test St',
    },
  }),
  useTaxSettings: () => ({ data: { gstRate: 18 } }),
  useNotificationSettings: () => ({ data: { email: true, sms: false } }),
  useStaffMembers: () => ({
    data: {
      staff: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
      ],
    },
  }),
}));

// Mock the SEO function
vi.mock('@/lib/seo', () => ({
  setDocumentMeta: vi.fn(),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the settings page with tabs', () => {
    render(React.createElement(SettingsPage));

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(
      screen.getByText('Manage your shop configuration'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('Business Profile').length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('Tax')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Staff')).toBeInTheDocument();
    expect(screen.getByText('Coupons')).toBeInTheDocument();
  });

  it('should display business profile tab by default', () => {
    render(React.createElement(SettingsPage));

    expect(
      screen.getAllByText('Business Profile').length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByDisplayValue('Test Shop')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Test St')).toBeInTheDocument();
  });

  it('should switch to shipping tab when clicked', () => {
    render(React.createElement(SettingsPage));

    const shippingTab = screen.getByText('Shipping');
    fireEvent.click(shippingTab);

    expect(screen.getByText('Shipping Settings')).toBeInTheDocument();
  });

  it('should switch to tax tab when clicked', () => {
    render(React.createElement(SettingsPage));

    const taxTab = screen.getByText('Tax');
    fireEvent.click(taxTab);

    expect(screen.getByText('Tax Settings')).toBeInTheDocument();
    expect(screen.getByDisplayValue('18')).toBeInTheDocument();
  });

  it('should switch to payments tab when clicked', () => {
    render(React.createElement(SettingsPage));

    const paymentsTab = screen.getByText('Payments');
    fireEvent.click(paymentsTab);

    expect(screen.getByText('Payment Configuration')).toBeInTheDocument();
  });

  it('should switch to notifications tab when clicked', () => {
    render(React.createElement(SettingsPage));

    const notificationsTab = screen.getByText('Notifications');
    fireEvent.click(notificationsTab);

    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    expect(screen.getByText('SMS Notifications')).toBeInTheDocument();
  });

  it('should switch to staff tab when clicked', () => {
    render(React.createElement(SettingsPage));

    const staffTab = screen.getByText('Staff');
    fireEvent.click(staffTab);

    expect(screen.getByText('Staff Members')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should switch to coupons tab when clicked', () => {
    render(React.createElement(SettingsPage));

    const couponsTab = screen.getByText('Coupons');
    fireEvent.click(couponsTab);

    expect(screen.getByText('Coupons & Discounts')).toBeInTheDocument();
    expect(screen.getByText('Create Coupon')).toBeInTheDocument();
    expect(screen.getByText('WELCOME10')).toBeInTheDocument();
    expect(screen.getByText('10% off first order')).toBeInTheDocument();
    expect(screen.getByText('SUMMER25')).toBeInTheDocument();
    expect(screen.getByText('₹250 off orders above ₹1000')).toBeInTheDocument();
  });

  it('should display active and expired badges for coupons', () => {
    render(React.createElement(SettingsPage));

    const couponsTab = screen.getByText('Coupons');
    fireEvent.click(couponsTab);

    const badges = screen.getAllByText(/Active|Expired/);
    expect(badges.length).toBeGreaterThan(0);
  });
});
