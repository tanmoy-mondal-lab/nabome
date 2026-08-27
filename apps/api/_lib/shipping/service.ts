/**
 * Shipping Service
 *
 * Business logic for shipping rate calculation
 * Calculates shipping rates based on weight, location, and carrier settings
 */

import { ApiError } from '../http/errors.ts';
import { getPrisma } from '../prisma.ts';

const prisma = getPrisma() as any;

export interface ShippingRateRequest {
  origin: {
    postalCode: string;
    country: string;
    state?: string;
  };
  destination: {
    postalCode: string;
    country: string;
    state?: string;
  };
  weight: number; // in kg
  dimensions?: {
    length: number; // in cm
    width: number; // in cm
    height: number; // in cm
  };
  shippingMethods?: string[];
}

export interface ShippingRate {
  carrier: string;
  method: string;
  rate: number;
  currency: string;
  estimatedDays: number;
}

export class ShippingService {
  /**
   * Calculate shipping rates for a shipment
   */
  static async calculateRates(
    request: ShippingRateRequest,
  ): Promise<ShippingRate[]> {
    const { origin, destination, weight, dimensions, shippingMethods } =
      request;

    // Validate required fields
    if (!origin?.postalCode || !origin?.country) {
      throw ApiError.validation('Origin postal code and country are required');
    }

    if (!destination?.postalCode || !destination?.country) {
      throw ApiError.validation(
        'Destination postal code and country are required',
      );
    }

    if (!weight || weight <= 0) {
      throw ApiError.validation('Weight must be greater than 0');
    }

    // Calculate volumetric weight if dimensions provided
    let volumetricWeight = 0;
    if (dimensions?.length && dimensions?.width && dimensions?.height) {
      volumetricWeight =
        (dimensions.length * dimensions.width * dimensions.height) / 5000; // Standard volumetric divisor
    }

    // Use the greater of actual weight or volumetric weight
    const chargeableWeight = Math.max(weight, volumetricWeight);

    // Default shipping rates for India (V1)
    const rates: ShippingRate[] = [];

    // Standard shipping
    if (!shippingMethods || shippingMethods.includes('standard')) {
      rates.push({
        carrier: 'standard',
        method: 'standard',
        rate: this.calculateStandardRate(
          chargeableWeight,
          origin.country,
          destination.country,
        ),
        currency: 'INR',
        estimatedDays: 5,
      });
    }

    // Express shipping
    if (!shippingMethods || shippingMethods.includes('express')) {
      rates.push({
        carrier: 'express',
        method: 'express',
        rate: this.calculateExpressRate(
          chargeableWeight,
          origin.country,
          destination.country,
        ),
        currency: 'INR',
        estimatedDays: 2,
      });
    }

    // Free shipping threshold check
    const freeShippingThreshold = 500; // ₹500
    const orderValue = request as any; // Order value would be passed in real implementation

    // For V1, we'll add a simple free shipping option if weight is under 2kg
    if (
      chargeableWeight <= 2 &&
      (!shippingMethods || shippingMethods.includes('free'))
    ) {
      rates.push({
        carrier: 'standard',
        method: 'free',
        rate: 0,
        currency: 'INR',
        estimatedDays: 7,
      });
    }

    return rates;
  }

  /**
   * Calculate standard shipping rate
   */
  private static calculateStandardRate(
    weight: number,
    originCountry: string,
    destCountry: string,
  ): number {
    // Base rate + per kg rate
    const baseRate = 50; // ₹50 base
    const perKgRate = 10; // ₹10 per kg

    // International shipping surcharge
    const isInternational = originCountry !== destCountry;
    const internationalSurcharge = isInternational ? 200 : 0;

    return baseRate + weight * perKgRate + internationalSurcharge;
  }

  /**
   * Calculate express shipping rate
   */
  private static calculateExpressRate(
    weight: number,
    originCountry: string,
    destCountry: string,
  ): number {
    // Express is typically 2x standard rate
    const standardRate = this.calculateStandardRate(
      weight,
      originCountry,
      destCountry,
    );
    return standardRate * 2;
  }

  /**
   * Get available carriers
   */
  static async getCarriers(): Promise<any[]> {
    // For V1, return default carriers
    return [
      {
        code: 'standard',
        name: 'Standard Shipping',
        displayName: 'Standard Delivery',
        isActive: true,
      },
      {
        code: 'express',
        name: 'Express Shipping',
        displayName: 'Express Delivery',
        isActive: true,
      },
    ];
  }

  /**
   * Get carrier by code
   */
  static async getCarrierByCode(code: string): Promise<any> {
    const carriers = await this.getCarriers();
    return carriers.find((c) => c.code === code) || null;
  }
}
