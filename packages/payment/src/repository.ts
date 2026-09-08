/**
 * Payment Repository - Data access layer with Prisma integration
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §1.6 (Payment Ownership),
 * DATABASE_ARCHITECTURE.md (Database Conventions)
 *
 * This module provides the data access layer for payment operations:
 * - Payment CRUD operations
 * - Refund CRUD operations
 * - Settlement CRUD operations
 * - Ledger entry operations
 * - Transaction logging
 * - Idempotency handling
 */

import type {
  PaymentStatus,
  RefundStatus,
  RefundType,
  SettlementStatus,
  PaymentTransactionType,
  PaymentTransactionStatus,
  WebhookEventStatus,
} from './enums';

/**
 * Payment entity (from Prisma schema)
 */
export interface Payment {
  id: string;
  orderId: string;
  method: string;
  status: PaymentStatus;
  amount: number; // Decimal(10,2) as number (paise)
  currency: string;
  provider?: string;
  gatewayReference?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  failureReason?: string;
  expiresAt?: Date;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Refund entity (from Prisma schema)
 */
export interface Refund {
  id: string;
  orderId: string;
  paymentId?: string;
  type: RefundType;
  amount: number; // Decimal(10,2) as number (paise)
  currency: string;
  status: RefundStatus;
  reason?: string;
  gatewayReference?: string;
  idempotencyKey?: string;
  completedAt?: Date;
  razorpayRefundId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Settlement entity (from Prisma schema)
 */
export interface Settlement {
  id: string;
  settlementNumber: string;
  shopId: string;
  status: SettlementStatus;
  periodStart: Date;
  periodEnd: Date;
  totalAmount: number; // Decimal(10,2) as number (paise)
  commissionAmount: number;
  taxAmount: number;
  platformFeeAmount: number;
  netAmount: number;
  refundAmount: number;
  chargebackAmount: number;
  currency: string;
  payoutMethod?: string;
  payoutAccountDetails?: Record<string, unknown>;
  processedAt?: Date;
  paidAt?: Date;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment transaction entity (from Prisma schema)
 */
export interface PaymentTransaction {
  id: string;
  paymentId: string;
  type: PaymentTransactionType;
  status: PaymentTransactionStatus;
  amount: number; // Decimal(10,2) as number (paise)
  currency: string;
  gatewayReference?: string;
  failureCode?: string;
  failureMessage?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Webhook event entity (from Prisma schema)
 */
export interface WebhookEvent {
  id: string;
  provider: string;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  signature?: string;
  status: WebhookEventStatus;
  processedAt?: Date;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Finance record entity (from Prisma schema)
 */
export interface FinanceRecordEntity {
  id: string;
  type: string;
  status: string;
  amount: number; // Decimal(10,2) as number (paise)
  currency: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  postedAt?: Date;
}

/**
 * Ledger entry entity (from Prisma schema)
 */
export interface LedgerEntryEntity {
  id: string;
  financeRecordId: string;
  account: string;
  side: string;
  amount: number; // Decimal(10,2) as number (paise)
  currency: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: Date;
}

/**
 * Payment Repository interface
 * This is a pure TypeScript interface - actual Prisma implementation
 * will be in the API app where Prisma client is available
 */
export interface PaymentRepository {
  // Payment operations
  createPayment(
    data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Payment>;
  getPaymentById(id: string): Promise<Payment | null>;
  getPaymentByOrderId(orderId: string): Promise<Payment | null>;
  getPaymentByIdempotencyKey(idempotencyKey: string): Promise<Payment | null>;
  updatePayment(id: string, data: Partial<Payment>): Promise<Payment>;
  updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment>;
  listPayments(filters?: PaymentFilters): Promise<Payment[]>;

  // Refund operations
  createRefund(
    data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Refund>;
  getRefundById(id: string): Promise<Refund | null>;
  getRefundByIdempotencyKey?(idempotencyKey: string): Promise<Refund | null>;
  getRefundsByPaymentId(paymentId: string): Promise<Refund[]>;
  getRefundsByOrderId(orderId: string): Promise<Refund[]>;
  updateRefund(id: string, data: Partial<Refund>): Promise<Refund>;
  updateRefundStatus(id: string, status: RefundStatus): Promise<Refund>;
  listRefunds(filters?: RefundFilters): Promise<Refund[]>;

  // Settlement operations
  createSettlement(
    data: Omit<Settlement, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Settlement>;
  getSettlementById(id: string): Promise<Settlement | null>;
  getSettlementByNumber(settlementNumber: string): Promise<Settlement | null>;
  getSettlementsByShopId(shopId: string): Promise<Settlement[]>;
  updateSettlement(id: string, data: Partial<Settlement>): Promise<Settlement>;
  updateSettlementStatus(
    id: string,
    status: SettlementStatus,
  ): Promise<Settlement>;
  listSettlements(filters?: SettlementFilters): Promise<Settlement[]>;

  // Transaction operations
  createTransaction(
    data: Omit<PaymentTransaction, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PaymentTransaction>;
  getTransactionsByPaymentId(paymentId: string): Promise<PaymentTransaction[]>;
  updateTransaction(
    id: string,
    data: Partial<PaymentTransaction>,
  ): Promise<PaymentTransaction>;

  // Webhook operations
  createWebhookEvent(
    data: Omit<WebhookEvent, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<WebhookEvent>;
  getWebhookEventById(id: string): Promise<WebhookEvent | null>;
  getWebhookEventByProviderEventId(
    provider: string,
    eventId: string,
  ): Promise<WebhookEvent | null>;
  updateWebhookEvent(
    id: string,
    data: Partial<WebhookEvent>,
  ): Promise<WebhookEvent>;
  listWebhookEvents(filters?: WebhookFilters): Promise<WebhookEvent[]>;

  // Finance operations
  createFinanceRecord(
    data: Omit<FinanceRecordEntity, 'id' | 'createdAt'>,
  ): Promise<FinanceRecordEntity>;
  getFinanceRecordById(id: string): Promise<FinanceRecordEntity | null>;
  updateFinanceRecord(
    id: string,
    data: Partial<FinanceRecordEntity>,
  ): Promise<FinanceRecordEntity>;

  // Ledger operations
  createLedgerEntry(
    data: Omit<LedgerEntryEntity, 'id' | 'createdAt'>,
  ): Promise<LedgerEntryEntity>;
  getLedgerEntriesByFinanceRecordId(
    financeRecordId: string,
  ): Promise<LedgerEntryEntity[]>;
  getLedgerEntriesByReference(
    referenceType: string,
    referenceId: string,
  ): Promise<LedgerEntryEntity[]>;
}

/**
 * Payment filters
 */
export interface PaymentFilters {
  orderId?: string;
  status?: PaymentStatus;
  provider?: string;
  method?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
  offset?: number;
}

/**
 * Refund filters
 */
export interface RefundFilters {
  orderId?: string;
  paymentId?: string;
  status?: RefundStatus;
  type?: RefundType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Settlement filters
 */
export interface SettlementFilters {
  shopId?: string;
  status?: SettlementStatus;
  periodStart?: Date;
  periodEnd?: Date;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Webhook filters
 */
export interface WebhookFilters {
  provider?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Mock Payment Repository for testing
 * This is a simple in-memory implementation for development/testing
 * Production implementation will use Prisma client
 */
export class MockPaymentRepository implements PaymentRepository {
  private payments: Map<string, Payment> = new Map();
  private refunds: Map<string, Refund> = new Map();
  private settlements: Map<string, Settlement> = new Map();
  private transactions: Map<string, PaymentTransaction> = new Map();
  private webhookEvents: Map<string, WebhookEvent> = new Map();
  private financeRecords: Map<string, FinanceRecordEntity> = new Map();
  private ledgerEntries: Map<string, LedgerEntryEntity> = new Map();

  private generateId(): string {
    return `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Payment operations
  async createPayment(
    data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Payment> {
    const payment: Payment = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return this.payments.get(id) || null;
  }

  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    return (
      Array.from(this.payments.values()).find((p) => p.orderId === orderId) ||
      null
    );
  }

  async getPaymentByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<Payment | null> {
    return (
      Array.from(this.payments.values()).find(
        (p) => p.idempotencyKey === idempotencyKey,
      ) || null
    );
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    const payment = this.payments.get(id);
    if (!payment) throw new Error(`Payment not found: ${id}`);
    const updated = { ...payment, ...data, updatedAt: new Date() };
    this.payments.set(id, updated);
    return updated;
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<Payment> {
    return this.updatePayment(id, { status });
  }

  async listPayments(filters?: PaymentFilters): Promise<Payment[]> {
    let results = Array.from(this.payments.values());

    if (filters) {
      if (filters.orderId)
        results = results.filter((p) => p.orderId === filters.orderId);
      if (filters.status)
        results = results.filter((p) => p.status === filters.status);
      if (filters.provider)
        results = results.filter((p) => p.provider === filters.provider);
      if (filters.method)
        results = results.filter((p) => p.method === filters.method);
      if (filters.startDate)
        results = results.filter((p) => p.createdAt >= filters.startDate!);
      if (filters.endDate)
        results = results.filter((p) => p.createdAt <= filters.endDate!);
      if (filters.minAmount)
        results = results.filter((p) => p.amount >= filters.minAmount!);
      if (filters.maxAmount)
        results = results.filter((p) => p.amount <= filters.maxAmount!);
      if (filters.offset) results = results.slice(filters.offset);
      if (filters.limit) results = results.slice(0, filters.limit);
    }

    return results;
  }

  // Refund operations
  async createRefund(
    data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Refund> {
    const refund: Refund = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.refunds.set(refund.id, refund);
    return refund;
  }

  async getRefundById(id: string): Promise<Refund | null> {
    return this.refunds.get(id) || null;
  }

  async getRefundByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<Refund | null> {
    return (
      Array.from(this.refunds.values()).find(
        (r) => r.idempotencyKey === idempotencyKey,
      ) || null
    );
  }

  async getRefundsByPaymentId(paymentId: string): Promise<Refund[]> {
    return Array.from(this.refunds.values()).filter(
      (r) => r.paymentId === paymentId,
    );
  }

  async getRefundsByOrderId(orderId: string): Promise<Refund[]> {
    return Array.from(this.refunds.values()).filter(
      (r) => r.orderId === orderId,
    );
  }

  async updateRefund(id: string, data: Partial<Refund>): Promise<Refund> {
    const refund = this.refunds.get(id);
    if (!refund) throw new Error(`Refund not found: ${id}`);
    const updated = { ...refund, ...data, updatedAt: new Date() };
    this.refunds.set(id, updated);
    return updated;
  }

  async updateRefundStatus(id: string, status: RefundStatus): Promise<Refund> {
    return this.updateRefund(id, { status });
  }

  async listRefunds(filters?: RefundFilters): Promise<Refund[]> {
    let results = Array.from(this.refunds.values());

    if (filters) {
      if (filters.orderId)
        results = results.filter((r) => r.orderId === filters.orderId);
      if (filters.paymentId)
        results = results.filter((r) => r.paymentId === filters.paymentId);
      if (filters.status)
        results = results.filter((r) => r.status === filters.status);
      if (filters.type)
        results = results.filter((r) => r.type === filters.type);
      if (filters.startDate)
        results = results.filter((r) => r.createdAt >= filters.startDate!);
      if (filters.endDate)
        results = results.filter((r) => r.createdAt <= filters.endDate!);
      if (filters.offset) results = results.slice(filters.offset);
      if (filters.limit) results = results.slice(0, filters.limit);
    }

    return results;
  }

  // Settlement operations
  async createSettlement(
    data: Omit<Settlement, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Settlement> {
    const settlement: Settlement = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.settlements.set(settlement.id, settlement);
    return settlement;
  }

  async getSettlementById(id: string): Promise<Settlement | null> {
    return this.settlements.get(id) || null;
  }

  async getSettlementByNumber(
    settlementNumber: string,
  ): Promise<Settlement | null> {
    return (
      Array.from(this.settlements.values()).find(
        (s) => s.settlementNumber === settlementNumber,
      ) || null
    );
  }

  async getSettlementsByShopId(shopId: string): Promise<Settlement[]> {
    return Array.from(this.settlements.values()).filter(
      (s) => s.shopId === shopId,
    );
  }

  async updateSettlement(
    id: string,
    data: Partial<Settlement>,
  ): Promise<Settlement> {
    const settlement = this.settlements.get(id);
    if (!settlement) throw new Error(`Settlement not found: ${id}`);
    const updated = { ...settlement, ...data, updatedAt: new Date() };
    this.settlements.set(id, updated);
    return updated;
  }

  async updateSettlementStatus(
    id: string,
    status: SettlementStatus,
  ): Promise<Settlement> {
    return this.updateSettlement(id, { status });
  }

  async listSettlements(filters?: SettlementFilters): Promise<Settlement[]> {
    let results = Array.from(this.settlements.values());

    if (filters) {
      if (filters.shopId)
        results = results.filter((s) => s.shopId === filters.shopId);
      if (filters.status)
        results = results.filter((s) => s.status === filters.status);
      if (filters.periodStart)
        results = results.filter((s) => s.periodStart >= filters.periodStart!);
      if (filters.periodEnd)
        results = results.filter((s) => s.periodEnd <= filters.periodEnd!);
      if (filters.startDate)
        results = results.filter((s) => s.createdAt >= filters.startDate!);
      if (filters.endDate)
        results = results.filter((s) => s.createdAt <= filters.endDate!);
      if (filters.offset) results = results.slice(filters.offset);
      if (filters.limit) results = results.slice(0, filters.limit);
    }

    return results;
  }

  // Transaction operations
  async createTransaction(
    data: Omit<PaymentTransaction, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PaymentTransaction> {
    const transaction: PaymentTransaction = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  async getTransactionsByPaymentId(
    paymentId: string,
  ): Promise<PaymentTransaction[]> {
    return Array.from(this.transactions.values()).filter(
      (t) => t.paymentId === paymentId,
    );
  }

  async updateTransaction(
    id: string,
    data: Partial<PaymentTransaction>,
  ): Promise<PaymentTransaction> {
    const transaction = this.transactions.get(id);
    if (!transaction) throw new Error(`Transaction not found: ${id}`);
    const updated = { ...transaction, ...data, updatedAt: new Date() };
    this.transactions.set(id, updated);
    return updated;
  }

  // Webhook operations
  async createWebhookEvent(
    data: Omit<WebhookEvent, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<WebhookEvent> {
    const event: WebhookEvent = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.webhookEvents.set(event.id, event);
    return event;
  }

  async getWebhookEventById(id: string): Promise<WebhookEvent | null> {
    return this.webhookEvents.get(id) || null;
  }

  async getWebhookEventByProviderEventId(
    provider: string,
    eventId: string,
  ): Promise<WebhookEvent | null> {
    return (
      Array.from(this.webhookEvents.values()).find(
        (e) => e.provider === provider && e.eventId === eventId,
      ) || null
    );
  }

  async updateWebhookEvent(
    id: string,
    data: Partial<WebhookEvent>,
  ): Promise<WebhookEvent> {
    const event = this.webhookEvents.get(id);
    if (!event) throw new Error(`Webhook event not found: ${id}`);
    const updated = { ...event, ...data, updatedAt: new Date() };
    this.webhookEvents.set(id, updated);
    return updated;
  }

  async listWebhookEvents(filters?: WebhookFilters): Promise<WebhookEvent[]> {
    let results = Array.from(this.webhookEvents.values());

    if (filters) {
      if (filters.provider)
        results = results.filter((e) => e.provider === filters.provider);
      if (filters.status)
        results = results.filter((e) => e.status === filters.status);
      if (filters.startDate)
        results = results.filter((e) => e.createdAt >= filters.startDate!);
      if (filters.endDate)
        results = results.filter((e) => e.createdAt <= filters.endDate!);
      if (filters.offset) results = results.slice(filters.offset);
      if (filters.limit) results = results.slice(0, filters.limit);
    }

    return results;
  }

  // Finance operations
  async createFinanceRecord(
    data: Omit<FinanceRecordEntity, 'id' | 'createdAt'>,
  ): Promise<FinanceRecordEntity> {
    const record: FinanceRecordEntity = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.financeRecords.set(record.id, record);
    return record;
  }

  async getFinanceRecordById(id: string): Promise<FinanceRecordEntity | null> {
    return this.financeRecords.get(id) || null;
  }

  async updateFinanceRecord(
    id: string,
    data: Partial<FinanceRecordEntity>,
  ): Promise<FinanceRecordEntity> {
    const record = this.financeRecords.get(id);
    if (!record) throw new Error(`Finance record not found: ${id}`);
    const updated = { ...record, ...data };
    this.financeRecords.set(id, updated);
    return updated;
  }

  // Ledger operations
  async createLedgerEntry(
    data: Omit<LedgerEntryEntity, 'id' | 'createdAt'>,
  ): Promise<LedgerEntryEntity> {
    const entry: LedgerEntryEntity = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.ledgerEntries.set(entry.id, entry);
    return entry;
  }

  async getLedgerEntriesByFinanceRecordId(
    financeRecordId: string,
  ): Promise<LedgerEntryEntity[]> {
    return Array.from(this.ledgerEntries.values()).filter(
      (e) => e.financeRecordId === financeRecordId,
    );
  }

  async getLedgerEntriesByReference(
    referenceType: string,
    referenceId: string,
  ): Promise<LedgerEntryEntity[]> {
    return Array.from(this.ledgerEntries.values()).filter(
      (e) => e.referenceType === referenceType && e.referenceId === referenceId,
    );
  }
}

/**
 * Repository factory
 */
export function createPaymentRepository(): PaymentRepository {
  return new MockPaymentRepository();
}
