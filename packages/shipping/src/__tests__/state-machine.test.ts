import { describe, it, expect } from 'vitest';

import { ShipmentStatus, ActorType } from '../enums';
import { ShipmentStateMachine } from '../state-machine';

describe('ShipmentStateMachine', () => {
  const sm = new ShipmentStateMachine();

  describe('Positional API — Valid Transitions', () => {
    it('SHIPMENT_CREATED -> READY_TO_PACK', () => {
      const r = sm.transition(
        ShipmentStatus.SHIPMENT_CREATED,
        ShipmentStatus.READY_TO_PACK,
        ActorType.SHOP_OWNER,
        'shop-owner-id',
      );
      expect(r.success).toBe(true);
      expect(r.newStatus).toBe(ShipmentStatus.READY_TO_PACK);
    });
    it('READY_FOR_PICKUP (AWAITING_PICKUP alias) -> PICKED_UP', () => {
      const r = sm.transition(
        ShipmentStatus.AWAITING_PICKUP,
        ShipmentStatus.PICKED_UP,
        ActorType.CARRIER,
        'carrier-id',
      );
      expect(r.success).toBe(true);
      expect(r.newStatus).toBe(ShipmentStatus.PICKED_UP);
    });
    it('aliases resolve: CARRIER === COURIER', () => {
      expect(ActorType.CARRIER).toBe(ActorType.COURIER);
      const a = sm.transition(
        ShipmentStatus.READY_FOR_PICKUP,
        ShipmentStatus.PICKED_UP,
        ActorType.COURIER,
        'c',
      );
      const b = sm.transition(
        ShipmentStatus.READY_FOR_PICKUP,
        ShipmentStatus.PICKED_UP,
        ActorType.CARRIER,
        'c',
      );
      expect(a.success).toBe(true);
      expect(b.success).toBe(true);
    });
    it('AWAITING_PICKUP === READY_FOR_PICKUP value', () => {
      expect(ShipmentStatus.AWAITING_PICKUP).toBe(
        ShipmentStatus.READY_FOR_PICKUP,
      );
    });
    it('PICKED_UP -> IN_TRANSIT', () => {
      const r = sm.transition(
        ShipmentStatus.PICKED_UP,
        ShipmentStatus.IN_TRANSIT,
        ActorType.CARRIER,
        'carrier-id',
      );
      expect(r.success).toBe(true);
    });
    it('IN_TRANSIT -> OUT_FOR_DELIVERY', () => {
      const r = sm.transition(
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.OUT_FOR_DELIVERY,
        ActorType.CARRIER,
        'c',
      );
      expect(r.success).toBe(true);
    });
    it('OUT_FOR_DELIVERY -> DELIVERED', () => {
      const r = sm.transition(
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.DELIVERED,
        ActorType.CARRIER,
        'c',
      );
      expect(r.success).toBe(true);
    });
    it('OUT_FOR_DELIVERY -> DELIVERY_FAILED with reason', () => {
      const r = sm.transition(
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.DELIVERY_FAILED,
        ActorType.CARRIER,
        'c',
        'Address not found',
      );
      expect(r.success).toBe(true);
    });
    it('DELIVERY_FAILED -> RETURNED_TO_SENDER with reason', () => {
      const r = sm.transition(
        ShipmentStatus.DELIVERY_FAILED,
        ShipmentStatus.RETURNED_TO_SENDER,
        ActorType.ADMIN,
        'admin-id',
        'Customer refused',
      );
      expect(r.success).toBe(true);
    });
    it('AWAITING_PICKUP -> CANCELLED by ADMIN', () => {
      const r = sm.transition(
        ShipmentStatus.AWAITING_PICKUP,
        ShipmentStatus.CANCELLED,
        ActorType.ADMIN,
        'admin-id',
      );
      expect(r.success).toBe(true);
    });
  });

  describe('Positional API — Invalid / Unauthorized / Reason', () => {
    it('rejects DELIVERED -> IN_TRANSIT', () => {
      const r = sm.transition(
        ShipmentStatus.DELIVERED,
        ShipmentStatus.IN_TRANSIT,
        ActorType.CARRIER,
        'c',
      );
      expect(r.success).toBe(false);
    });
    it('rejects CANCELLED -> any', () => {
      const r = sm.transition(
        ShipmentStatus.CANCELLED,
        ShipmentStatus.AWAITING_PICKUP,
        ActorType.ADMIN,
        'a',
      );
      expect(r.success).toBe(false);
    });
    it('rejects unauthorized CUSTOMER for READY_FOR_PICKUP -> PICKED_UP', () => {
      const r = sm.transition(
        ShipmentStatus.READY_FOR_PICKUP,
        ShipmentStatus.PICKED_UP,
        ActorType.CUSTOMER,
        'customer-id',
      );
      expect(r.success).toBe(false);
      expect(r.error).toMatch(/not authorized/i);
    });
    it('requires reason for IN_TRANSIT -> DELIVERY_FAILED', () => {
      const r = sm.transition(
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.DELIVERY_FAILED,
        ActorType.CARRIER,
        'c',
      );
      expect(r.success).toBe(false);
      expect(r.error).toMatch(/Reason is required/i);
    });
    it('requires reason for DELIVERY_FAILED -> RETURNED_TO_SENDER', () => {
      const r = sm.transition(
        ShipmentStatus.DELIVERY_FAILED,
        ShipmentStatus.RETURNED_TO_SENDER,
        ActorType.ADMIN,
        'a',
      );
      expect(r.success).toBe(false);
    });
    it('SYSTEM authorized for PICKED_UP -> IN_TRANSIT', () => {
      const r = sm.transition(
        ShipmentStatus.PICKED_UP,
        ShipmentStatus.IN_TRANSIT,
        ActorType.SYSTEM,
        'system-id',
      );
      expect(r.success).toBe(true);
    });
    it('ADMIN can cancel READY_TO_PACK', () => {
      const r = sm.transition(
        ShipmentStatus.READY_TO_PACK,
        ShipmentStatus.CANCELLED,
        ActorType.ADMIN,
        'a',
      );
      expect(r.success).toBe(true);
    });
  });

  describe('Object API — requires currentStatus loaded from DB', () => {
    it('succeeds when currentStatus provided', () => {
      const r = sm.transition({
        shipmentId: 'shp_123',
        status: ShipmentStatus.READY_TO_PACK,
        currentStatus: ShipmentStatus.SHIPMENT_CREATED,
        actorType: ActorType.SHOP_OWNER,
        actorId: 'shop-owner-id',
      } as any);
      expect(r.success).toBe(true);
      expect(r.previousStatus).toBe(ShipmentStatus.SHIPMENT_CREATED);
      expect(r.newStatus).toBe(ShipmentStatus.READY_TO_PACK);
    });
    it('succeeds with AWAITING_PICKUP alias in object API', () => {
      const r = sm.transition({
        shipmentId: 'shp_2',
        status: ShipmentStatus.PICKED_UP,
        currentStatus: ShipmentStatus.AWAITING_PICKUP,
        actorType: ActorType.CARRIER,
        actorId: 'c',
      } as any);
      expect(r.success).toBe(true);
    });
    it('CARRIER alias authorized in object API', () => {
      const r = sm.transition({
        shipmentId: 'shp_3',
        status: ShipmentStatus.PICKED_UP,
        currentStatus: ShipmentStatus.READY_FOR_PICKUP,
        actorType: ActorType.CARRIER,
        actorId: 'c',
      } as any);
      expect(r.success).toBe(true);
    });
    it('fails when currentStatus missing — no hardcoded SHIPMENT_CREATED fallback', () => {
      const r = sm.transition({
        shipmentId: 'shp_123',
        status: ShipmentStatus.IN_TRANSIT,
        actorType: ActorType.CARRIER,
        actorId: 'c',
      } as any);
      expect(r.success).toBe(false);
      expect(r.error).toMatch(/Current shipment status is required/i);
    });
    it('rejects invalid transition via object API', () => {
      const r = sm.transition({
        shipmentId: 'shp_123',
        status: ShipmentStatus.IN_TRANSIT,
        currentStatus: ShipmentStatus.DELIVERED,
        actorType: ActorType.CARRIER,
        actorId: 'c',
      } as any);
      expect(r.success).toBe(false);
    });
    it('rejects unauthorized actor via object API', () => {
      const r = sm.transition({
        shipmentId: 'shp_123',
        status: ShipmentStatus.PICKED_UP,
        currentStatus: ShipmentStatus.READY_FOR_PICKUP,
        actorType: ActorType.CUSTOMER,
        actorId: 'cust',
      } as any);
      expect(r.success).toBe(false);
      expect(r.error).toMatch(/not authorized/i);
    });
    it('requires reason via object API', () => {
      const r = sm.transition({
        shipmentId: 'shp_123',
        status: ShipmentStatus.DELIVERY_FAILED,
        currentStatus: ShipmentStatus.OUT_FOR_DELIVERY,
        actorType: ActorType.CARRIER,
        actorId: 'c',
      } as any);
      expect(r.success).toBe(false);
      expect(r.error).toMatch(/Reason is required/i);
    });
    it('accepts reason via object API', () => {
      const r = sm.transition({
        shipmentId: 'shp_123',
        status: ShipmentStatus.DELIVERY_FAILED,
        currentStatus: ShipmentStatus.OUT_FOR_DELIVERY,
        actorType: ActorType.CARRIER,
        actorId: 'c',
        reason: 'Address not found',
      } as any);
      expect(r.success).toBe(true);
    });
    it('supports previousStatus alias field', () => {
      const r = sm.transition({
        shipmentId: 'shp_123',
        status: ShipmentStatus.READY_TO_PACK,
        previousStatus: ShipmentStatus.SHIPMENT_CREATED,
        actorType: ActorType.SHOP_OWNER,
        actorId: 's',
      } as any);
      expect(r.success).toBe(true);
    });
  });

  describe('helpers', () => {
    it('isTerminal for CANCELLED/CLOSED', () => {
      expect(sm.isTerminalStatus(ShipmentStatus.CANCELLED)).toBe(true);
      expect(sm.isTerminalStatus(ShipmentStatus.CLOSED)).toBe(true);
      expect(sm.isTerminalStatus(ShipmentStatus.IN_TRANSIT)).toBe(false);
    });
    it('getCustomerVisibleStatus', () => {
      expect(sm.getCustomerVisibleStatus(ShipmentStatus.SHIPMENT_CREATED)).toBe(
        'processing',
      );
      expect(sm.getCustomerVisibleStatus(ShipmentStatus.DELIVERED)).toBe(
        'delivered',
      );
    });
  });
});
