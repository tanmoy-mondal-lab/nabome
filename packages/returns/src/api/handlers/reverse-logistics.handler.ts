/**
 * Reverse Logistics API Handlers
 *
 * REST API endpoints for reverse logistics following the approved REST specification.
 */

import { Request, Response, NextFunction } from 'express';
import { reverseLogisticsService } from '../service';
import { SchedulePickupInput } from '../types';

/**
 * POST /api/v1/reverse-logistics/initialize
 * Initialize reverse logistics for a return
 */
export async function initializeReverseLogistics(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { returnRequestId, pickupAddress } = req.body;

    const reverseLogistics =
      await reverseLogisticsService.initializeReverseLogistics(
        returnRequestId,
        pickupAddress,
      );

    res.status(201).json({
      data: reverseLogistics,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/reverse-logistics/return/:returnRequestId
 * Get reverse logistics for a return
 */
export async function getReverseLogistics(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { returnRequestId } = req.params;
    const reverseLogistics =
      await reverseLogisticsService.getReverseLogistics(returnRequestId);

    if (!reverseLogistics) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Reverse logistics record not found',
        },
      });
    }

    res.json({
      data: reverseLogistics,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/reverse-logistics/:id/schedule-pickup
 * Schedule pickup for return
 */
export async function schedulePickup(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { courier, trackingNumber, scheduledDate } = req.body;

    const reverseLogistics = await reverseLogisticsService.schedulePickup(
      id,
      courier,
      trackingNumber,
      new Date(scheduledDate),
    );

    res.json({
      data: reverseLogistics,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/reverse-logistics/:id/complete-pickup
 * Mark pickup as completed
 */
export async function completePickup(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const reverseLogistics = await reverseLogisticsService.completePickup(id);

    res.json({
      data: reverseLogistics,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/reverse-logistics/:id/warehouse-receipt
 * Mark warehouse receipt
 */
export async function markWarehouseReceipt(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { warehouseId } = req.body;

    const reverseLogistics = await reverseLogisticsService.markWarehouseReceipt(
      id,
      warehouseId,
    );

    res.json({
      data: reverseLogistics,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/reverse-logistics/:id/start-inspection
 * Start inspection
 */
export async function startInspection(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const reverseLogistics = await reverseLogisticsService.startInspection(id);

    res.json({
      data: reverseLogistics,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/reverse-logistics/:id/complete-inspection
 * Complete inspection
 */
export async function completeInspection(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const reverseLogistics =
      await reverseLogisticsService.completeInspection(id);

    res.json({
      data: reverseLogistics,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/reverse-logistics/:id/start-restocking
 * Start restocking
 */
export async function startRestocking(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const reverseLogistics = await reverseLogisticsService.startRestocking(id);

    res.json({
      data: reverseLogistics,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/reverse-logistics/:id/complete-restocking
 * Complete restocking
 */
export async function completeRestocking(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const reverseLogistics =
      await reverseLogisticsService.completeRestocking(id);

    res.json({
      data: reverseLogistics,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/reverse-logistics/:id/process-disposal
 * Process disposal of non-restockable items
 */
export async function processDisposal(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const reverseLogistics = await reverseLogisticsService.processDisposal(
      id,
      reason,
    );

    res.json({
      data: reverseLogistics,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/reverse-logistics/pending-pickups
 * Get pending pickups
 */
export async function getPendingPickups(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const pendingPickups = await reverseLogisticsService.getPendingPickups();

    res.json({
      data: pendingPickups,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/reverse-logistics/in-transit
 * Get in-transit returns
 */
export async function getInTransitReturns(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const inTransit = await reverseLogisticsService.getInTransitReturns();

    res.json({
      data: inTransit,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/reverse-logistics/warehouse-pending
 * Get warehouse pending receipts
 */
export async function getWarehousePendingReceipts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const warehouseId = req.query.warehouseId as string;
    const pendingReceipts =
      await reverseLogisticsService.getWarehousePendingReceipts(warehouseId);

    res.json({
      data: pendingReceipts,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/reverse-logistics/statistics
 * Get reverse logistics statistics
 */
export async function getReverseLogisticsStatistics(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    const statistics = await reverseLogisticsService.getStatistics(
      startDate,
      endDate,
    );

    res.json({
      data: statistics,
    });
  } catch (error) {
    next(error);
  }
}
