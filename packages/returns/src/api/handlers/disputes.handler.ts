/**
 * Disputes API Handlers
 *
 * REST API endpoints for disputes following the approved REST specification.
 */

import { Request, Response, NextFunction } from 'express';
import { disputesService } from '../service';
import { CreateDisputeInput, UpdateDisputeInput } from '../types';
import { ActorType } from '../enums';

/**
 * POST /api/v1/disputes
 * Create a new dispute
 */
export async function createDispute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input: CreateDisputeInput = req.body;
    const { orderId, shopId } = req.body;
    const profileId = req.user?.id;
    const raisedBy = profileId;

    const dispute = await disputesService.createDispute({
      ...input,
      orderId,
      profileId,
      shopId,
      raisedBy,
    });

    res.status(201).json({
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/disputes/:id
 * Get dispute by ID
 */
export async function getDispute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const dispute = await disputesService.getDispute(id);

    if (!dispute) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Dispute not found',
        },
      });
    }

    res.json({
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/disputes/return/:returnRequestId
 * Get disputes for a return request
 */
export async function getReturnDisputes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { returnRequestId } = req.params;
    const disputes = await disputesService.getReturnDisputes(returnRequestId);

    res.json({
      data: disputes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/disputes/profile/:profileId
 * Get disputes for a profile
 */
export async function getProfileDisputes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { profileId } = req.params;
    const disputes = await disputesService.getProfileDisputes(profileId);

    res.json({
      data: disputes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/disputes/shop/:shopId
 * Get disputes for a shop
 */
export async function getShopDisputes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { shopId } = req.params;
    const disputes = await disputesService.getShopDisputes(shopId);

    res.json({
      data: disputes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/disputes/:id
 * Update dispute
 */
export async function updateDispute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const input: UpdateDisputeInput = req.body;

    const dispute = await disputesService.updateDispute(id, input);

    res.json({
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/disputes/:id/escalate
 * Escalate dispute
 */
export async function escalateDispute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { escalationReason } = req.body;
    const escalatedBy = req.user?.id;

    const dispute = await disputesService.escalateDispute(
      id,
      escalatedBy,
      escalationReason,
    );

    res.json({
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/disputes/:id/messages
 * Add message to dispute
 */
export async function addDisputeMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { message, isInternal, attachments } = req.body;
    const senderId = req.user?.id;
    const senderType = req.user?.role as ActorType;

    const disputeMessage = await disputesService.addMessage(
      id,
      senderId,
      senderType,
      message,
      isInternal,
      attachments,
    );

    res.status(201).json({
      data: disputeMessage,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/disputes/open
 * Get open disputes
 */
export async function getOpenDisputes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const shopId = req.query.shopId as string;
    const disputes = await disputesService.getOpenDisputes(shopId);

    res.json({
      data: disputes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/disputes/escalated
 * Get escalated disputes
 */
export async function getEscalatedDisputes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const disputes = await disputesService.getEscalatedDisputes();

    res.json({
      data: disputes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/disputes/statistics
 * Get dispute statistics
 */
export async function getDisputeStatistics(
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

    const statistics = await disputesService.getStatistics(
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
