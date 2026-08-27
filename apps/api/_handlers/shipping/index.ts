/**
 * Shipping API Handlers Registration
 *
 * Registers all shipping-related API endpoints.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

import { register } from '../register.ts';

import {
  getCarriers,
  getCarrierById,
  registerCarrier,
  updateCarrier,
  calculateRates,
} from './carriers.ts';
import {
  getFulfillmentQueue,
  getFulfillmentById,
  updateFulfillment,
  createFulfillment,
} from './fulfillment.ts';
import {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipmentStatus,
  deleteShipment,
  getShipmentsByOrder,
} from './shipments.ts';
import {
  getTrackingTimeline,
  getTrackingByNumber,
  addTrackingEvent,
} from './tracking.ts';

// ──────────────────────────────────────────────────────────────────────────────
// Shipment APIs
// ──────────────────────────────────────────────────────────────────────────────
register('GET', 'shipments', getShipments);
register('GET', 'shipments/{id}', getShipmentById);
register('POST', 'shipments', createShipment);
register('PATCH', 'shipments/{id}/status', updateShipmentStatus);
register('DELETE', 'shipments/{id}', deleteShipment);
register('GET', 'orders/{orderId}/shipments', getShipmentsByOrder);

// ──────────────────────────────────────────────────────────────────────────────
// Tracking APIs
// ──────────────────────────────────────────────────────────────────────────────
register('GET', 'shipments/{id}/tracking', getTrackingTimeline);
register('GET', 'tracking/{trackingNumber}', getTrackingByNumber);
register('POST', 'shipments/{id}/tracking/events', addTrackingEvent);

// ──────────────────────────────────────────────────────────────────────────────
// Fulfillment APIs
// ──────────────────────────────────────────────────────────────────────────────
register('GET', 'fulfillment/queue', getFulfillmentQueue);
register('GET', 'fulfillment/{id}', getFulfillmentById);
register('PATCH', 'fulfillment/{id}', updateFulfillment);
register('POST', 'fulfillment', createFulfillment);

// ──────────────────────────────────────────────────────────────────────────────
// Carrier APIs
// ──────────────────────────────────────────────────────────────────────────────
register('GET', 'carriers', getCarriers);
register('GET', 'carriers/{code}', getCarrierById);
register('POST', 'carriers', registerCarrier);
register('PATCH', 'carriers/{code}', updateCarrier);
register('POST', 'carriers/rates', calculateRates);
