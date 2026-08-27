/**
 * Carrier Service
 *
 * This file implements the carrier service for managing logistics providers.
 * Handles carrier registration, configuration, and health monitoring.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

// @ts-ignore - Prisma client will be generated after schema migration
import type { PrismaClient } from '@prisma/client';

import { CarrierRegistry } from './carrier-abstraction';
import type {
  RateCalculationRequest,
  ShipmentBookingRequest,
  ShipmentBookingResult,
  LabelGenerationRequest,
  LabelGenerationResult,
  CarrierHealthCheckResult,
} from './carrier-abstraction';
import { type CarrierType, ShippingMethod } from './enums';
import { ShipmentRepository } from './repository';
import type { Carrier, CarrierConfig, ShippingRate } from './types';

/**
 * Carrier Service
 *
 * Manages carrier operations including registration, rate calculation,
 * shipment booking, and health monitoring.
 */
export class CarrierService {
  private repository: ShipmentRepository;

  constructor(prisma: PrismaClient) {
    this.repository = new ShipmentRepository(prisma);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Carrier Management
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Get all carriers
   */
  async getCarriers(): Promise<Carrier[]> {
    return this.repository.getCarriers();
  }

  /**
   * Get a carrier by code
   */
  async getCarrierByCode(code: CarrierType): Promise<Carrier | null> {
    return this.repository.getCarrierByCode(code);
  }

  /**
   * Register a new carrier
   */
  async registerCarrier(
    code: CarrierType,
    name: string,
    displayName: string,
    config: CarrierConfig,
    trackingUrlTemplate?: string,
  ): Promise<Carrier> {
    return this.repository.createCarrier(
      code,
      name,
      displayName,
      config as Record<string, unknown>,
      trackingUrlTemplate,
    );
  }

  /**
   * Update carrier configuration
   */
  async updateCarrierConfig(
    code: CarrierType,
    _config: CarrierConfig,
  ): Promise<Carrier | null> {
    const carrier = await this.repository.getCarrierByCode(code);
    if (!carrier) return null;

    // In a real implementation, this would update the carrier in the database
    // For now, return the existing carrier
    return carrier;
  }

  /**
   * Enable carrier API integration
   */
  async enableCarrierApi(code: CarrierType): Promise<boolean> {
    const carrier = await this.repository.getCarrierByCode(code);
    if (!carrier) return false;

    // In a real implementation, this would update the carrier in the database
    // For now, return true
    return true;
  }

  /**
   * Disable carrier API integration
   */
  async disableCarrierApi(code: CarrierType): Promise<boolean> {
    const carrier = await this.repository.getCarrierByCode(code);
    if (!carrier) return false;

    // In a real implementation, this would update the carrier in the database
    // For now, return true
    return true;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Rate Calculation
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Calculate shipping rates for a shipment
   */
  async calculateRates(
    request: RateCalculationRequest,
  ): Promise<ShippingRate[]> {
    const rates: ShippingRate[] = [];

    // Get all active carriers
    const carriers = await this.repository.getCarriers();

    for (const carrier of carriers) {
      const adapter = CarrierRegistry.get(carrier.code as any);
      if (
        !adapter ||
        !adapter.supportsShippingMethod(
          request.shippingMethods?.[0] || ShippingMethod.STANDARD,
        )
      ) {
        continue;
      }

      try {
        const carrierRates = await adapter.calculateRates(request);
        rates.push(...carrierRates);
      } catch (error) {
        // Log error but continue with other carriers
        console.error(
          `Error calculating rates for carrier ${carrier.code}:`,
          error,
        );
      }
    }

    return rates;
  }

  /**
   * Get rates for a specific carrier
   */
  async getCarrierRates(
    carrierCode: CarrierType,
    request: RateCalculationRequest,
  ): Promise<ShippingRate[]> {
    const adapter = CarrierRegistry.get(carrierCode as any);
    if (!adapter) {
      return [];
    }

    return adapter.calculateRates(request);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Shipment Booking
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Book a shipment with a carrier
   */
  async bookShipment(
    request: ShipmentBookingRequest,
  ): Promise<ShipmentBookingResult> {
    const adapter = CarrierRegistry.get(request.carrierCode as any);
    if (!adapter) {
      return {
        success: false,
        error: 'Carrier not found or not registered',
      };
    }

    return adapter.bookShipment(request);
  }

  /**
   * Cancel a shipment booking
   */
  async cancelShipment(
    trackingNumber: string,
    carrierCode: CarrierType,
  ): Promise<{ success: boolean; error?: string }> {
    const adapter = CarrierRegistry.get(carrierCode as any);
    if (!adapter) {
      return {
        success: false,
        error: 'Carrier not found or not registered',
      };
    }

    return adapter.cancelShipment(trackingNumber);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Label Generation
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Generate a shipping label
   */
  async generateLabel(
    request: LabelGenerationRequest,
  ): Promise<LabelGenerationResult> {
    const adapter = CarrierRegistry.get(request.carrierCode as any);
    if (!adapter) {
      return {
        success: false,
        error: 'Carrier not found or not registered',
      };
    }

    return adapter.generateLabel(request);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Health Monitoring
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Check health of a specific carrier
   */
  async checkCarrierHealth(
    carrierCode: CarrierType,
  ): Promise<CarrierHealthCheckResult> {
    const adapter = CarrierRegistry.get(carrierCode as any);
    if (!adapter) {
      return {
        isHealthy: false,
        error: 'Carrier not found or not registered',
      };
    }

    return adapter.healthCheck();
  }

  /**
   * Check health of all carriers
   */
  async checkAllCarriersHealth(): Promise<
    Record<CarrierType, CarrierHealthCheckResult>
  > {
    const carriers = await this.repository.getCarriers();
    const results: Record<string, CarrierHealthCheckResult> = {};

    for (const carrier of carriers) {
      results[carrier.code] = await this.checkCarrierHealth(
        carrier.code as any,
      );
    }

    return results as Record<CarrierType, CarrierHealthCheckResult>;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Carrier Registry Management
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Get all registered carrier types
   */
  getRegisteredCarrierTypes(): CarrierType[] {
    return CarrierRegistry.getAllRegistered();
  }

  /**
   * Check if a carrier is registered
   */
  isCarrierRegistered(carrierCode: CarrierType): boolean {
    return CarrierRegistry.has(carrierCode);
  }

  /**
   * Unregister a carrier (useful for testing)
   */
  unregisterCarrier(carrierCode: CarrierType): boolean {
    return CarrierRegistry.unregister(carrierCode);
  }
}

/**
 * Singleton instance of the carrier service
 * Note: In production, this would be instantiated with a Prisma client
 */
export const createCarrierService = (prisma: PrismaClient): CarrierService => {
  return new CarrierService(prisma);
};
