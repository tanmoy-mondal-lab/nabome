/**
 * Policies API Handlers
 *
 * REST API endpoints for return policies following the approved REST specification.
 */

import { Request, Response, NextFunction } from 'express';
import { policyService } from '../service';
import { ReturnPolicyInput } from '../types';

/**
 * POST /api/v1/return-policies
 * Create a new return policy
 */
export async function createPolicy(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input: ReturnPolicyInput = req.body;

    const policy = await policyService.createPolicy(input);

    res.status(201).json({
      data: policy,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/return-policies/:id
 * Get policy by ID
 */
export async function getPolicy(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const policy = await policyService.getPolicy(id);

    if (!policy) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Policy not found',
        },
      });
    }

    res.json({
      data: policy,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/return-policies/shop/:shopId/active
 * Get active policy for a shop
 */
export async function getActivePolicy(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { shopId } = req.params;
    const policy = await policyService.getActivePolicy(shopId);

    if (!policy) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'No active policy found',
        },
      });
    }

    res.json({
      data: policy,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/return-policies/shop/:shopId
 * Get all policies for a shop
 */
export async function getShopPolicies(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { shopId } = req.params;
    const policies = await policyService.getShopPolicies(shopId);

    res.json({
      data: policies,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/return-policies/:id
 * Update return policy
 */
export async function updatePolicy(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const input: Partial<ReturnPolicyInput> = req.body;

    const policy = await policyService.updatePolicy(id, input);

    res.json({
      data: policy,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/return-policies/:id/deactivate
 * Deactivate return policy
 */
export async function deactivatePolicy(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const policy = await policyService.deactivatePolicy(id);

    res.json({
      data: policy,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/return-policies/evaluate-eligibility
 * Evaluate return eligibility
 */
export async function evaluateEligibility(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { shopId, orderData } = req.body;

    const eligibility = await policyService.evaluateEligibility(
      shopId,
      orderData,
    );

    res.json({
      data: eligibility,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/return-policies/check-item-eligibility
 * Check if a specific item is eligible for return
 */
export async function checkItemEligibility(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { shopId, categoryId, deliveryDate } = req.body;

    const eligibility = await policyService.isItemEligible(
      shopId,
      categoryId,
      deliveryDate ? new Date(deliveryDate) : undefined,
    );

    res.json({
      data: eligibility,
    });
  } catch (error) {
    next(error);
  }
}
