import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ShipmentStatus, ActorType } from '../enums';
import { ShipmentService } from '../service';

function makePrismaMock(overrides: any = {}) {
  return {
    shipment: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    shipmentItem: { create: vi.fn(), findMany: vi.fn() },
    shipmentEvent: { create: vi.fn(), findMany: vi.fn() },
    carrier: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    fulfillmentQueue: { create: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    pickListItem: { createMany: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    shippingLabel: { create: vi.fn(), findUnique: vi.fn() },
    shippingException: { create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    deliveryConfirmation: { create: vi.fn() },
    ...overrides,
  } as any;
}

function shipmentRow(status: ShipmentStatus) {
  return {
    id: 'shp_1',
    orderId: 'ord_1',
    status,
    trackingNumber: null,
    carrierCode: null,
    carrierName: null,
    shippingMethod: 'standard',
    estimatedDeliveryDate: null,
    actualDeliveryDate: null,
    shippedAt: null,
    deliveredAt: null,
    weight: 200,
    length: 0,
    width: 0,
    height: 0,
    shippingAddress: {},
    shippingCost: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    events: [],
  };
}

describe('ShipmentService — DB-backed transitions', () => {
  let prisma: any;
  let svc: ShipmentService;

  beforeEach(() => {
    prisma = makePrismaMock();
    svc = new ShipmentService(prisma);
  });

  it('valid transition loads current status from DB and persists atomically', async () => {
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.SHIPMENT_CREATED),
    );
    prisma.shipment.updateMany.mockResolvedValueOnce({ count: 1 });
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.READY_TO_PACK),
    );
    prisma.shipmentEvent.create.mockResolvedValueOnce({
      id: 'evt_1',
      shipmentId: 'shp_1',
      status: ShipmentStatus.READY_TO_PACK,
      createdAt: new Date(),
    });

    const r = await svc.updateShipmentStatus({
      shipmentId: 'shp_1',
      status: ShipmentStatus.READY_TO_PACK,
      actorType: ActorType.SHOP_OWNER,
      actorId: 'shop-id',
    });
    expect(r.success).toBe(true);
    expect(r.previousStatus).toBe(ShipmentStatus.SHIPMENT_CREATED);
    expect(r.newStatus).toBe(ShipmentStatus.READY_TO_PACK);
    expect(prisma.shipment.updateMany).toHaveBeenCalledWith({
      where: { id: 'shp_1', status: ShipmentStatus.SHIPMENT_CREATED },
      data: expect.objectContaining({ status: ShipmentStatus.READY_TO_PACK }),
    });
  });

  it('object API uses real DB state — not hardcoded SHIPMENT_CREATED (invalid transition rejected)', async () => {
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.PACKED),
    );
    const r = await svc.updateShipmentStatus({
      shipmentId: 'shp_1',
      status: ShipmentStatus.READY_TO_PACK,
      actorType: ActorType.SHOP_OWNER,
      actorId: 'shop-id',
    });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/Invalid state transition/);
    expect(prisma.shipment.updateMany).not.toHaveBeenCalled();
  });

  it('missing shipment returns error', async () => {
    prisma.shipment.findUnique.mockResolvedValueOnce(null);
    const r = await svc.updateShipmentStatus({
      shipmentId: 'missing',
      status: ShipmentStatus.READY_TO_PACK,
      actorType: ActorType.SHOP_OWNER,
      actorId: 'shop-id',
    });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/Shipment not found/);
  });

  it('unauthorized actor rejected', async () => {
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.READY_FOR_PICKUP),
    );
    const r = await svc.updateShipmentStatus({
      shipmentId: 'shp_1',
      status: ShipmentStatus.PICKED_UP,
      actorType: ActorType.CUSTOMER,
      actorId: 'cust-id',
    });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/not authorized/i);
  });

  it('reason required enforced', async () => {
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.OUT_FOR_DELIVERY),
    );
    const r = await svc.updateShipmentStatus({
      shipmentId: 'shp_1',
      status: ShipmentStatus.DELIVERY_FAILED,
      actorType: ActorType.CARRIER,
      actorId: 'c-id',
    });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/Reason is required/);
  });

  it('reason provided succeeds', async () => {
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.OUT_FOR_DELIVERY),
    );
    prisma.shipment.updateMany.mockResolvedValueOnce({ count: 1 });
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.DELIVERY_FAILED),
    );
    prisma.shipmentEvent.create.mockResolvedValueOnce({
      id: 'evt_2',
      shipmentId: 'shp_1',
      status: ShipmentStatus.DELIVERY_FAILED,
      createdAt: new Date(),
    });
    const r = await svc.updateShipmentStatus({
      shipmentId: 'shp_1',
      status: ShipmentStatus.DELIVERY_FAILED,
      actorType: ActorType.CARRIER,
      actorId: 'c-id',
      reason: 'Address not found',
    });
    expect(r.success).toBe(true);
  });

  it('concurrent conflict returns error (updateMany count 0)', async () => {
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.READY_TO_PACK),
    );
    prisma.shipment.updateMany.mockResolvedValueOnce({ count: 0 });
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.PACKED),
    );
    const r = await svc.updateShipmentStatus({
      shipmentId: 'shp_1',
      status: ShipmentStatus.PACKED,
      actorType: ActorType.SHOP_OWNER,
      actorId: 's',
    });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/Concurrent transition conflict/);
  });

  it('AWAITING_PICKUP alias equivalent to READY_FOR_PICKUP', async () => {
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.READY_FOR_PICKUP),
    );
    prisma.shipment.updateMany.mockResolvedValueOnce({ count: 1 });
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.PICKED_UP),
    );
    prisma.shipmentEvent.create.mockResolvedValueOnce({
      id: 'evt_3',
      shipmentId: 'shp_1',
      status: ShipmentStatus.PICKED_UP,
      createdAt: new Date(),
    });
    const r = await svc.updateShipmentStatus({
      shipmentId: 'shp_1',
      status: ShipmentStatus.PICKED_UP,
      actorType: ActorType.CARRIER,
      actorId: 'c',
    });
    expect(r.success).toBe(true);
  });

  it('CARRIER alias authorized as COURIER', async () => {
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.READY_FOR_PICKUP),
    );
    prisma.shipment.updateMany.mockResolvedValueOnce({ count: 1 });
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.PICKED_UP),
    );
    prisma.shipmentEvent.create.mockResolvedValueOnce({
      id: 'evt_4',
      shipmentId: 'shp_1',
      status: ShipmentStatus.PICKED_UP,
      createdAt: new Date(),
    });
    const r = await svc.updateShipmentStatus({
      shipmentId: 'shp_1',
      status: ShipmentStatus.PICKED_UP,
      actorType: ActorType.CARRIER,
      actorId: 'carrier-id',
    });
    expect(r.success).toBe(true);
  });

  it('transitionShipmentAtomic helper works for valid transition', async () => {
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.PICKED_UP),
    );
    prisma.shipment.updateMany.mockResolvedValueOnce({ count: 1 });
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.IN_TRANSIT),
    );
    prisma.shipmentEvent.create.mockResolvedValueOnce({
      id: 'evt_5',
      shipmentId: 'shp_1',
      status: ShipmentStatus.IN_TRANSIT,
      createdAt: new Date(),
    });
    const svc2 = new ShipmentService(prisma);
    const r = await svc2.transitionShipmentAtomic(
      'shp_1',
      ShipmentStatus.IN_TRANSIT,
      ActorType.CARRIER,
      'c',
    );
    expect(r.success).toBe(true);
  });

  it('records reason and actor metadata in event', async () => {
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.OUT_FOR_DELIVERY),
    );
    prisma.shipment.updateMany.mockResolvedValueOnce({ count: 1 });
    prisma.shipment.findUnique.mockResolvedValueOnce(
      shipmentRow(ShipmentStatus.DELIVERY_FAILED),
    );
    prisma.shipmentEvent.create.mockResolvedValueOnce({
      id: 'evt_6',
      shipmentId: 'shp_1',
      status: ShipmentStatus.DELIVERY_FAILED,
      createdAt: new Date(),
    });
    await svc.updateShipmentStatus({
      shipmentId: 'shp_1',
      status: ShipmentStatus.DELIVERY_FAILED,
      actorType: ActorType.CARRIER,
      actorId: 'carrier-1',
      reason: 'Road blocked',
      metadata: { attempt: 1 },
    });
    expect(prisma.shipmentEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shipmentId: 'shp_1',
          actorType: ActorType.CARRIER,
          actorId: 'carrier-1',
          description: 'Road blocked',
        }),
      }),
    );
  });
});
