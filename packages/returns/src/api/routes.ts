/**
 * Returns API Routes
 *
 * REST API routes following the approved REST specification.
 * All routes follow kebab-case URLs and are versioned under /api/v1.
 */

import { Router } from 'express';
import * as returnsHandlers from './handlers/returns.handler';
import * as refundsHandlers from './handlers/refunds.handler';
import * as inspectionsHandlers from './handlers/inspections.handler';
import * as disputesHandlers from './handlers/disputes.handler';
import * as policiesHandlers from './handlers/policies.handler';
import * as reverseLogisticsHandlers from './handlers/reverse-logistics.handler';

const router = Router();

// ── Returns Routes ────────────────────────────────────────────────────────
router.post('/returns', returnsHandlers.createReturnRequest);
router.get('/returns', returnsHandlers.queryReturnRequests);
router.get('/returns/:id', returnsHandlers.getReturnRequest);
router.get('/returns/profile/:profileId', returnsHandlers.getProfileReturns);
router.get('/returns/shop/:shopId', returnsHandlers.getShopReturns);
router.patch('/returns/:id/status', returnsHandlers.updateReturnStatus);
router.post('/returns/:id/approve', returnsHandlers.approveReturnRequest);
router.post('/returns/:id/reject', returnsHandlers.rejectReturnRequest);
router.post('/returns/:id/notes', returnsHandlers.addReturnNotes);
router.post('/returns/check-eligibility', returnsHandlers.checkEligibility);
router.get('/returns/statistics', returnsHandlers.getReturnStatistics);

// ── Refunds Routes ─────────────────────────────────────────────────────────
router.post('/refunds', refundsHandlers.createRefund);
router.get('/refunds/:id', refundsHandlers.getRefund);
router.get(
  '/refunds/return/:returnRequestId',
  refundsHandlers.getReturnRefunds,
);
router.get('/refunds/order/:orderId', refundsHandlers.getOrderRefunds);
router.post('/refunds/:id/complete', refundsHandlers.completeRefund);
router.post('/refunds/:id/fail', refundsHandlers.failRefund);
router.get('/refunds/pending/:shopId', refundsHandlers.getPendingRefunds);
router.get('/refunds/statistics', refundsHandlers.getRefundStatistics);

// ── Inspections Routes ─────────────────────────────────────────────────────
router.post('/inspections', inspectionsHandlers.createInspection);
router.get('/inspections/:id', inspectionsHandlers.getInspection);
router.get(
  '/inspections/return/:returnRequestId',
  inspectionsHandlers.getReturnInspections,
);
router.get(
  '/inspections/item/:returnItemId',
  inspectionsHandlers.getItemInspections,
);
router.post(
  '/inspections/return/:returnRequestId/complete',
  inspectionsHandlers.completeReturnInspection,
);
router.get('/inspections/pending', inspectionsHandlers.getPendingInspections);
router.get(
  '/inspections/statistics',
  inspectionsHandlers.getInspectionStatistics,
);

// ── Disputes Routes ────────────────────────────────────────────────────────
router.post('/disputes', disputesHandlers.createDispute);
router.get('/disputes/:id', disputesHandlers.getDispute);
router.get(
  '/disputes/return/:returnRequestId',
  disputesHandlers.getReturnDisputes,
);
router.get('/disputes/profile/:profileId', disputesHandlers.getProfileDisputes);
router.get('/disputes/shop/:shopId', disputesHandlers.getShopDisputes);
router.patch('/disputes/:id', disputesHandlers.updateDispute);
router.post('/disputes/:id/escalate', disputesHandlers.escalateDispute);
router.post('/disputes/:id/messages', disputesHandlers.addDisputeMessage);
router.get('/disputes/open', disputesHandlers.getOpenDisputes);
router.get('/disputes/escalated', disputesHandlers.getEscalatedDisputes);
router.get('/disputes/statistics', disputesHandlers.getDisputeStatistics);

// ── Policies Routes ─────────────────────────────────────────────────────────
router.post('/return-policies', policiesHandlers.createPolicy);
router.get('/return-policies/:id', policiesHandlers.getPolicy);
router.get(
  '/return-policies/shop/:shopId/active',
  policiesHandlers.getActivePolicy,
);
router.get('/return-policies/shop/:shopId', policiesHandlers.getShopPolicies);
router.patch('/return-policies/:id', policiesHandlers.updatePolicy);
router.post(
  '/return-policies/:id/deactivate',
  policiesHandlers.deactivatePolicy,
);
router.post(
  '/return-policies/evaluate-eligibility',
  policiesHandlers.evaluateEligibility,
);
router.post(
  '/return-policies/check-item-eligibility',
  policiesHandlers.checkItemEligibility,
);

// ── Reverse Logistics Routes ────────────────────────────────────────────────
router.post(
  '/reverse-logistics/initialize',
  reverseLogisticsHandlers.initializeReverseLogistics,
);
router.get(
  '/reverse-logistics/return/:returnRequestId',
  reverseLogisticsHandlers.getReverseLogistics,
);
router.post(
  '/reverse-logistics/:id/schedule-pickup',
  reverseLogisticsHandlers.schedulePickup,
);
router.post(
  '/reverse-logistics/:id/complete-pickup',
  reverseLogisticsHandlers.completePickup,
);
router.post(
  '/reverse-logistics/:id/warehouse-receipt',
  reverseLogisticsHandlers.markWarehouseReceipt,
);
router.post(
  '/reverse-logistics/:id/start-inspection',
  reverseLogisticsHandlers.startInspection,
);
router.post(
  '/reverse-logistics/:id/complete-inspection',
  reverseLogisticsHandlers.completeInspection,
);
router.post(
  '/reverse-logistics/:id/start-restocking',
  reverseLogisticsHandlers.startRestocking,
);
router.post(
  '/reverse-logistics/:id/complete-restocking',
  reverseLogisticsHandlers.completeRestocking,
);
router.post(
  '/reverse-logistics/:id/process-disposal',
  reverseLogisticsHandlers.processDisposal,
);
router.get(
  '/reverse-logistics/pending-pickups',
  reverseLogisticsHandlers.getPendingPickups,
);
router.get(
  '/reverse-logistics/in-transit',
  reverseLogisticsHandlers.getInTransitReturns,
);
router.get(
  '/reverse-logistics/warehouse-pending',
  reverseLogisticsHandlers.getWarehousePendingReceipts,
);
router.get(
  '/reverse-logistics/statistics',
  reverseLogisticsHandlers.getReverseLogisticsStatistics,
);

export default router;
