/**
 * Inspections API Handlers
 *
 * REST API endpoints for inspections following the approved REST specification.
 */

import { Request, Response, NextFunction } from 'express';
import { inspectionsService } from '../service';
import { InspectionInput } from '../types';

/**
 * POST /api/v1/inspections
 * Create a new inspection
 */
export async function createInspection(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input: InspectionInput = req.body;
    const { returnRequestId } = req.body;
    const inspectedBy = req.user?.id;

    const inspection = await inspectionsService.createInspection({
      ...input,
      returnRequestId,
      inspectedBy,
    });

    res.status(201).json({
      data: inspection,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/inspections/:id
 * Get inspection by ID
 */
export async function getInspection(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const inspection = await inspectionsService.getInspection(id);

    if (!inspection) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Inspection not found',
        },
      });
    }

    res.json({
      data: inspection,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/inspections/return/:returnRequestId
 * Get inspections for a return request
 */
export async function getReturnInspections(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { returnRequestId } = req.params;
    const inspections =
      await inspectionsService.getReturnInspections(returnRequestId);

    res.json({
      data: inspections,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/inspections/item/:returnItemId
 * Get inspections for a return item
 */
export async function getItemInspections(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { returnItemId } = req.params;
    const inspections =
      await inspectionsService.getItemInspections(returnItemId);

    res.json({
      data: inspections,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/inspections/return/:returnRequestId/complete
 * Complete inspection for a return
 */
export async function completeReturnInspection(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { returnRequestId } = req.params;
    const inspectedBy = req.user?.id;

    await inspectionsService.completeReturnInspection(
      returnRequestId,
      inspectedBy,
    );

    res.json({
      data: { message: 'Inspection completed successfully' },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/inspections/pending
 * Get pending inspections
 */
export async function getPendingInspections(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const warehouseId = req.query.warehouseId as string;
    const inspections =
      await inspectionsService.getPendingInspections(warehouseId);

    res.json({
      data: inspections,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/inspections/statistics
 * Get inspection statistics
 */
export async function getInspectionStatistics(
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

    const statistics = await inspectionsService.getStatistics(
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
