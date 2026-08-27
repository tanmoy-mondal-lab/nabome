/**
 * Tax Service
 *
 * Business logic layer for tax operations.
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §4
 *
 * This service handles:
 * - Tax calculation
 * - Tax rule application
 * - Regional tax support
 * - GST/VAT readiness
 */

import { CheckoutRepository } from './repository';
import type { TaxCalculationResult, TaxBreakdown, TaxRule } from './types';

export class TaxService {
  /**
   * Calculate tax for given subtotal
   */
  static async calculateTax(input: {
    subtotal: number;
    region?: string;
  }): Promise<TaxCalculationResult> {
    const { subtotal, region = 'IN' } = input;

    // Get applicable tax rules for region
    const taxRules = await CheckoutRepository.findTaxRulesByRegion(region);

    // Default to standard GST if no rules found
    if (taxRules.length === 0) {
      const defaultRate = 0.18; // 18% GST
      const taxAmount = subtotal * defaultRate;

      return {
        subtotal,
        taxAmount,
        taxRate: defaultRate,
        taxBreakdown: [
          {
            taxName: 'CGST',
            taxRate: 0.09,
            taxAmount: taxAmount / 2,
            isInclusive: false,
          },
          {
            taxName: 'SGST',
            taxRate: 0.09,
            taxAmount: taxAmount / 2,
            isInclusive: false,
          },
        ],
        currency: 'INR',
      };
    }

    // Calculate tax based on rules
    let totalTaxAmount = 0;
    const taxBreakdown: TaxBreakdown[] = [];

    for (const rule of taxRules) {
      const ruleTaxAmount = subtotal * Number(rule.rate);
      totalTaxAmount += ruleTaxAmount;

      taxBreakdown.push({
        taxName: rule.name,
        taxRate: Number(rule.rate),
        taxAmount: ruleTaxAmount,
        isInclusive: rule.isInclusive,
      });
    }

    return {
      subtotal,
      taxAmount: totalTaxAmount,
      taxRate: taxRules.reduce((sum, rule) => sum + Number(rule.rate), 0),
      taxBreakdown,
      currency: 'INR',
    };
  }

  /**
   * Get all active tax rules
   */
  static async getTaxRules(): Promise<TaxRule[]> {
    return await CheckoutRepository.getActiveTaxRules();
  }

  /**
   * Get tax rules by region
   */
  static async getTaxRulesByRegion(region: string): Promise<TaxRule[]> {
    return await CheckoutRepository.findTaxRulesByRegion(region);
  }
}
