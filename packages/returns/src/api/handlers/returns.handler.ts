/**
 * Returns API Handlers
 *
 * REST API endpoints for return requests following the approved REST specification.
 * All endpoints follow kebab-case URLs, camelCase fields, and snake_case enum values.
 */

import { Request, Response, NextFunction } from 'express';
import {
  returnsService,
  refundsService,
  reverseLogisticsService,
  inspectionsService,
  disputesService,
  policyService,
} from '../service';
import {
  CreateReturnRequestInput,
  UpdateReturnStatusInput,
  ReturnQueryOptions,
} from '../types';
import { ActorType } from '../enums';

/**
 * POST /api/v1/returns
 * Create a new return request
 */
export async function createReturnRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input: CreateReturnRequestInput = req.body;
    const profileId = req.user?.id; // From auth middleware
    const shopId = req.body.shopId;
    const orderNumber = req.body.orderNumber;

    const returnRequest = await returnsService.createReturnRequest(
      {
        ...input,
        orderNumber,
        profileId,
        shopId,
      },
      profileId,
    );

    res.status(201).json({
      data: returnRequest,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/returns/:id
 * Get return request by ID
 */
export async function getReturnRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const returnRequest = await returnsService.getReturnRequest(id);

    if (!returnRequest) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Return request not found',
        },
      });
    }

    res.json({
      data: returnRequest,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/returns
 * Query return requests with filters
 */
export async function queryReturnRequests(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const options: ReturnQueryOptions = {
      filters: {
        status: req.query.status as string,
        profileId: req.query.profileId as string,
        shopId: req.query.shopId as string,
        orderId: req.query.orderId as string,
        reason: req.query.reason as string,
        dateFrom: req.query.dateFrom
          ? new Date(req.query.dateFrom as string)
          : undefined,
        dateTo: req.query.dateTo
          ? new Date(req.query.dateTo as string)
          : undefined,
        search: req.query.search as string,
      },
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      sort: (req.query.sort as string) || 'requestedAt',
      order: (req.query.order as 'asc' | 'desc') || 'desc',
    };

    const result = await returnsService.queryReturnRequests(options);

    res.json({
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/returns/profile/:profileId
 * Get return requests for a profile
 */
export async function getProfileReturns(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { profileId } = req.params;
    const returnRequests = await returnsService.getProfileReturns(profileId);

    res.json({
      data: returnRequests,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/returns/shop/:shopId
 * Get return requests for a shop
 */
export async function getShopReturns(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { shopId } = req.params;
    const returnRequests = await returnsService.getShopReturns(shopId);

    res.json({
      data: returnRequests,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/returns/:id/status
 * Update return request status
 */
export async function updateReturnStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const input: UpdateReturnStatusInput = req.body;
    const actorId = req.user?.id;
    const actorType = req.user?.role as ActorType;

    const returnRequest = await returnsService.updateStatus(
      id,
      input,
      actorId,
      actorType,
    );

    res.json({
      data: returnRequest,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/returns/:id/approve
 * Approve a return request
 */
export async function approveReturnRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const actorId = req.user?.id;

    const returnRequest = await returnsService.approveReturnRequest(
      id,
      actorId,
      reason,
    );

    res.json({
      data: returnRequest,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/returns/:id/reject
 * Reject a return request
 */
export async function rejectReturnRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const actorId = req.user?.id;

    const returnRequest = await returnsService.rejectReturnRequest(
      id,
      actorId,
      reason,
    );

    res.json({
      data: returnRequest,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/returns/:id/notes
 * Add internal notes to return request
 */
export async function addReturnNotes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const returnRequest = await returnsService.addInternalNotes(id, notes);

    res.json({
      data: returnRequest,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/returns/check-eligibility
 * Check return eligibility for an order
 */
export async function checkEligibility(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { orderId, orderItems } = req.body;
    const profileId = req.user?.id;

    const eligibility = await returnsService.checkEligibility(
      orderId,
      profileId,
      orderItems,
    );

    res.json({
      data: eligibility,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/returns/statistics
 * Get return statistics
 */
export async function getReturnStatistics(
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

    const statistics = await returnsService.getStatistics(
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
