/**
 * Payment Methods Seed
 * Seeds supported payment methods configuration
 * Note: Payment methods are configured via Razorpay
 * This seed documents the supported payment methods
 */

import { prisma } from '../utils/helpers';

export async function seedPaymentMethods() {
  console.log('💳 Seeding payment methods...');

  // Payment methods are configured via Razorpay
  // This documents the supported methods
  const supportedPaymentMethods = {
    razorpay: {
      name: 'Razorpay',
      key_id: process.env.RAZORPAY_KEY_ID || '',
      enabled: true,
      methods: ['card', 'upi', 'netbanking', 'wallet', 'emi'],
    },
  };

  console.log('Supported payment methods:', Object.keys(supportedPaymentMethods));

  return supportedPaymentMethods;
}
