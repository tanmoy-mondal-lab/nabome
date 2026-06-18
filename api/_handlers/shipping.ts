import { prisma } from "../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleShippingRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "listZones": return handleListZones();
    case "calculateRates": return handleCalculateRates(req);
    case "adminListZones": return handleAdminListZones();
    case "createZone": return handleCreateZone(req);
    case "updateZone": return handleUpdateZone(params[0], req);
    case "deleteZone": return handleDeleteZone(params[0]);
    case "addRate": return handleAddRate(params[0], req);
    case "updateRate": return handleUpdateRate(params[0], req);
    case "deleteRate": return handleDeleteRate(params[0]);
    default: return badRequest("Unknown action");
  }
}

async function handleListZones(): Promise<Response> {
  try {
    const zones = await prisma.shippingZone.findMany({
      where: { isActive: true },
      include: {
        rates: {
          where: { isActive: true },
          orderBy: { baseRate: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
    return success({ zones });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCalculateRates(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pincode = url.searchParams.get("pincode");
  const orderValue = parseFloat(url.searchParams.get("orderValue") ?? "0");

  if (!pincode) return badRequest("Pincode is required");

  try {
    const zones = await prisma.shippingZone.findMany({
      where: {
        isActive: true,
        OR: [
          { pincodes: { has: pincode } },
          { pincodes: { isEmpty: true } },
        ],
      },
      include: {
        rates: {
          where: { isActive: true },
        },
      },
    });

    const eligibleRates = [];
    for (const zone of zones) {
      for (const rate of zone.rates) {
        if (rate.minOrderValue !== null && orderValue < Number(rate.minOrderValue)) continue;
        if (rate.maxOrderValue !== null && orderValue > Number(rate.maxOrderValue)) continue;

        let calculatedRate = Number(rate.baseRate);

        if (rate.freeAbove !== null && orderValue >= Number(rate.freeAbove)) {
          calculatedRate = 0;
        }

        eligibleRates.push({
          zoneId: zone.id,
          zoneName: zone.name,
          id: rate.id,
          name: rate.name,
          method: rate.method,
          cost: calculatedRate,
          estimatedDays: rate.estimatedDays,
        });
      }
    }

    return success({ rates: eligibleRates });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminListZones(): Promise<Response> {
  try {
    const zones = await prisma.shippingZone.findMany({
      include: {
        rates: { orderBy: { baseRate: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    });
    return success({ zones });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateZone(req: Request): Promise<Response> {
  const body = await req.json();
  const { name, countries, states, pincodes, sortOrder } = body;

  if (!name) return badRequest("Zone name is required");

  try {
    const zone = await prisma.shippingZone.create({
      data: {
        name,
        countries: countries ?? [],
        states: states ?? [],
        pincodes: pincodes ?? [],
        sortOrder: sortOrder ?? 0,
      },
      include: { rates: true },
    });
    return created(zone);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateZone(zoneId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { name, countries, states, pincodes, isActive, sortOrder } = body;

  try {
    const existing = await prisma.shippingZone.findUnique({ where: { id: zoneId } });
    if (!existing) return notFound("Shipping zone not found");

    const zone = await prisma.shippingZone.update({
      where: { id: zoneId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(countries !== undefined ? { countries } : {}),
        ...(states !== undefined ? { states } : {}),
        ...(pincodes !== undefined ? { pincodes } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
      },
      include: { rates: true },
    });
    return success(zone);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteZone(zoneId: string): Promise<Response> {
  try {
    const existing = await prisma.shippingZone.findUnique({ where: { id: zoneId } });
    if (!existing) return notFound("Shipping zone not found");

    await prisma.shippingZone.delete({ where: { id: zoneId } });
    return success({ deleted: true });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAddRate(zoneId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { name, method, minOrderValue, maxOrderValue, baseRate, perKgRate, freeAbove, estimatedDays } = body;

  if (!name) return badRequest("Rate name is required");

  try {
    const zone = await prisma.shippingZone.findUnique({ where: { id: zoneId } });
    if (!zone) return notFound("Shipping zone not found");

    const rate = await prisma.shippingRate.create({
      data: {
        zoneId,
        name,
        method: method ?? "standard",
        minOrderValue: minOrderValue ?? null,
        maxOrderValue: maxOrderValue ?? null,
        baseRate: baseRate ?? 0,
        perKgRate: perKgRate ?? 0,
        freeAbove: freeAbove ?? null,
        estimatedDays: estimatedDays ?? null,
      },
    });
    return created(rate);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateRate(rateId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { name, method, minOrderValue, maxOrderValue, baseRate, perKgRate, freeAbove, estimatedDays, isActive } = body;

  try {
    const existing = await prisma.shippingRate.findUnique({ where: { id: rateId } });
    if (!existing) return notFound("Shipping rate not found");

    const rate = await prisma.shippingRate.update({
      where: { id: rateId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(method !== undefined ? { method } : {}),
        ...(minOrderValue !== undefined ? { minOrderValue } : {}),
        ...(maxOrderValue !== undefined ? { maxOrderValue } : {}),
        ...(baseRate !== undefined ? { baseRate } : {}),
        ...(perKgRate !== undefined ? { perKgRate } : {}),
        ...(freeAbove !== undefined ? { freeAbove } : {}),
        ...(estimatedDays !== undefined ? { estimatedDays } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
    return success(rate);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteRate(rateId: string): Promise<Response> {
  try {
    const existing = await prisma.shippingRate.findUnique({ where: { id: rateId } });
    if (!existing) return notFound("Shipping rate not found");

    await prisma.shippingRate.delete({ where: { id: rateId } });
    return success({ deleted: true });
  } catch (err) {
    return serverError(err);
  }
}
