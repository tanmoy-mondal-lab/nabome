/**
 * Carrier Abstraction Layer
 *
 * This file defines the provider-agnostic interface for logistics integrations.
 * No logistics provider is hardcoded - this is a pure abstraction layer.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

import { CarrierType, type ShippingMethod } from './enums';
import type {
  CarrierConfig,
  ShippingRate,
  ShippingAddress,
  TrackingUpdateInput,
} from './types';

/**
 * Rate Calculation Request
 * Input for calculating shipping rates
 */
export type RateCalculationRequest = {
  origin: ShippingAddress;
  destination: ShippingAddress;
  weight: number; // in grams
  dimensions: {
    length: number; // in cm
    width: number; // in cm
    height: number; // in cm
  };
  shippingMethods?: ShippingMethod[];
  declaredValue?: number;
  isFragile?: boolean;
};

/**
 * Shipment Booking Request
 * Input for booking a shipment with a carrier
 */
export type ShipmentBookingRequest = {
  orderId: string;
  carrierCode: CarrierType;
  shippingMethod: ShippingMethod;
  origin: ShippingAddress;
  destination: ShippingAddress;
  weight: number; // in grams
  dimensions: {
    length: number; // in cm
    width: number; // in cm
    height: number; // in cm
  };
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    value: number;
  }>;
  declaredValue?: number;
  isFragile?: boolean;
  specialInstructions?: string;
};

/**
 * Shipment Booking Result
 * Result of booking a shipment
 */
export type ShipmentBookingResult = {
  success: boolean;
  trackingNumber?: string;
  labelUrl?: string;
  estimatedDeliveryDate?: Date;
  cost?: number;
  error?: string;
};

/**
 * Label Generation Request
 * Input for generating a shipping label
 */
export type LabelGenerationRequest = {
  trackingNumber: string;
  carrierCode: CarrierType;
  shipmentData: ShipmentBookingRequest;
};

/**
 * Label Generation Result
 * Result of generating a shipping label
 */
export type LabelGenerationResult = {
  success: boolean;
  labelUrl?: string;
  labelData?: string; // base64 encoded PDF
  error?: string;
};

/**
 * Tracking Update Result
 * Result of processing a tracking update
 */
export type TrackingUpdateResult = {
  success: boolean;
  error?: string;
};

/**
 * Carrier Health Check Result
 * Result of checking carrier health/status
 */
export type CarrierHealthCheckResult = {
  isHealthy: boolean;
  latency?: number; // in milliseconds
  error?: string;
};

/**
 * Carrier Adapter Interface
 *
 * This interface must be implemented by all carrier integrations.
 * It provides a unified API for interacting with different logistics providers.
 *
 * Implementation Guidelines:
 * - Do not hardcode any provider-specific logic outside the adapter
 * - All adapters must implement the same interface
 * - Use the config object for provider-specific settings
 * - Handle errors gracefully and return appropriate error messages
 * - Log all external API calls for audit purposes
 */
export interface CarrierAdapter {
  /**
   * Get the carrier type this adapter handles
   */
  getCarrierType(): CarrierType;

  /**
   * Initialize the carrier adapter with configuration
   */
  initialize(config: CarrierConfig): Promise<void>;

  /**
   * Calculate shipping rates for a shipment
   */
  calculateRates(request: RateCalculationRequest): Promise<ShippingRate[]>;

  /**
   * Book a shipment with the carrier
   */
  bookShipment(request: ShipmentBookingRequest): Promise<ShipmentBookingResult>;

  /**
   * Generate a shipping label
   */
  generateLabel(
    request: LabelGenerationRequest,
  ): Promise<LabelGenerationResult>;

  /**
   * Cancel a shipment booking
   */
  cancelShipment(
    trackingNumber: string,
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Get tracking information for a shipment
   */
  getTrackingInfo(trackingNumber: string): Promise<TrackingUpdateInput | null>;

  /**
   * Process a tracking update from carrier webhook
   */
  processTrackingUpdate(
    update: TrackingUpdateInput,
  ): Promise<TrackingUpdateResult>;

  /**
   * Validate a tracking number format
   */
  validateTrackingNumber(trackingNumber: string): boolean;

  /**
   * Get the tracking URL for a shipment
   */
  getTrackingUrl(trackingNumber: string): string;

  /**
   * Health check for the carrier API
   */
  healthCheck(): Promise<CarrierHealthCheckResult>;

  /**
   * Check if the adapter supports a specific shipping method
   */
  supportsShippingMethod(method: ShippingMethod): boolean;
}

/**
 * Carrier Registry
 *
 * Registry for managing carrier adapters.
 * Allows dynamic registration and retrieval of carrier implementations.
 */
export class CarrierRegistry {
  private static adapters: Map<CarrierType, CarrierAdapter> = new Map();

  /**
   * Register a carrier adapter
   */
  static register(adapter: CarrierAdapter): void {
    const carrierType = adapter.getCarrierType();
    CarrierRegistry.adapters.set(carrierType, adapter);
  }

  /**
   * Get a carrier adapter by type
   */
  static get(carrierType: CarrierType): CarrierAdapter | undefined {
    return CarrierRegistry.adapters.get(carrierType);
  }

  /**
   * Check if a carrier adapter is registered
   */
  static has(carrierType: CarrierType): boolean {
    return CarrierRegistry.adapters.has(carrierType);
  }

  /**
   * Get all registered carrier types
   */
  static getAllRegistered(): CarrierType[] {
    return Array.from(CarrierRegistry.adapters.keys());
  }

  /**
   * Unregister a carrier adapter
   */
  static unregister(carrierType: CarrierType): boolean {
    return CarrierRegistry.adapters.delete(carrierType);
  }

  /**
   * Clear all registered adapters (useful for testing)
   */
  static clear(): void {
    CarrierRegistry.adapters.clear();
  }
}

/**
 * Manual Carrier Adapter
 *
 * Default implementation for manual shipping (no carrier integration).
 * Used when shipments are handled manually without carrier API integration.
 */
export class ManualCarrierAdapter implements CarrierAdapter {
  getCarrierType(): CarrierType {
    return CarrierType.MANUAL;
  }

  async initialize(_config: CarrierConfig): Promise<void> {
    // Config accepted for interface compliance but not used in manual mode
  }

  async calculateRates(
    _request: RateCalculationRequest,
  ): Promise<ShippingRate[]> {
    // Manual shipping doesn't provide rate calculation
    return [];
  }

  async bookShipment(
    _request: ShipmentBookingRequest,
  ): Promise<ShipmentBookingResult> {
    // Manual shipping doesn't support booking
    return {
      success: false,
      error: 'Manual shipping does not support automated booking',
    };
  }

  async generateLabel(
    _request: LabelGenerationRequest,
  ): Promise<LabelGenerationResult> {
    // Manual shipping doesn't support label generation
    return {
      success: false,
      error: 'Manual shipping does not support automated label generation',
    };
  }

  async cancelShipment(
    _trackingNumber: string,
  ): Promise<{ success: boolean; error?: string }> {
    // Manual shipping doesn't support cancellation
    return {
      success: false,
      error: 'Manual shipping does not support automated cancellation',
    };
  }

  async getTrackingInfo(
    _trackingNumber: string,
  ): Promise<TrackingUpdateInput | null> {
    // Manual shipping doesn't provide tracking
    return null;
  }

  async processTrackingUpdate(
    _update: TrackingUpdateInput,
  ): Promise<TrackingUpdateResult> {
    // Manual shipping doesn't process tracking updates
    return {
      success: false,
      error: 'Manual shipping does not process tracking updates',
    };
  }

  validateTrackingNumber(trackingNumber: string): boolean {
    // Manual tracking numbers are free-form
    return trackingNumber.length > 0;
  }

  getTrackingUrl(_trackingNumber: string): string {
    // Manual shipping doesn't have a tracking URL
    return '';
  }

  async healthCheck(): Promise<CarrierHealthCheckResult> {
    // Manual shipping is always healthy
    return { isHealthy: true };
  }

  supportsShippingMethod(_method: ShippingMethod): boolean {
    // Manual shipping supports all methods
    return true;
  }
}

/**
 * Register the manual carrier adapter by default
 */
CarrierRegistry.register(new ManualCarrierAdapter());
