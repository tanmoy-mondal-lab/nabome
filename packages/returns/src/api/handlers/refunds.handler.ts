/**
 * Refunds API Handlers
 *
 * REST API endpoints for refunds following the approved REST specification.
 */

import { Request, Response, NextFunction } from 'express';
import { refundsService } from '../service';
import { CreateRefundInput } from '../types';

/**
 * POST /api/v1/refunds
 * Create a new refund
 */
export async function createRefund(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input: CreateRefundInput = req.body;
    const initiatedBy = req.user?.id;

    const refund = await refundsService.createRefund({
      ...input,
      initiatedBy,
    });

    res.status(201).json({
      data: refund,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/refunds/:id
 * Get refund by ID
 */
export async function getRefund(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const refund = await refundsService.getRefund(id);

    if (!refund) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Refund not found',
        },
      });
    }

    res.json({
      data: refund,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/refunds/return/:returnRequestId
 * Get refunds for a return request
 */
export async function getReturnRefunds(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { returnRequestId } = req.params;
    const refunds = await refundsService.getReturnRefunds(returnRequestId);

    res.json({
      data: refunds,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/refunds/order/:orderId
 * Get refunds for an order
 */
export async function getOrderRefunds(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { orderId } = req.params;
    const refunds = await refundsService.getOrderRefunds(orderId);

    res.json({
      data: refunds,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/refunds/:id/complete
 * Complete a refund (webhook handler)
 */
export async function completeRefund(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { gatewayRef, gatewayStatus } = req.body;

    const refund = await refundsService.completeRefund(
      id,
      gatewayRef,
      gatewayStatus,
    );

    res.json({
      data: refund,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/refunds/:id/fail
 * Mark refund as failed (webhook handler)
 */
export async function failRefund(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { failureReason } = req.body;

    const refund = await refundsService.failRefund(id, failureReason);

    res.json({
      data: refund,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/refunds/pending/:shopId
 * Get pending refunds for a shop
 */
export async function getPendingRefunds(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { shopId } = req.params;
    const refunds = await refundsService.getPendingRefunds(shopId);

    res.json({
      data: refunds,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/refunds/statistics
 * Get refund statistics
 */
export async function getRefundStatistics(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const shopId = req.query.shopId as string;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    const statistics = await refundsService.getStatistics(
      shopId,
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
