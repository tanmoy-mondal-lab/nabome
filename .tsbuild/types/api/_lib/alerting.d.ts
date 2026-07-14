import type { Env } from "./env";
export interface AlertContext {
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    metadata?: Record<string, unknown>;
}
export declare class AlertService {
    private env;
    private cooldowns;
    constructor(env?: Env);
    private isDevelopment;
    private canSend;
    private markSent;
    private send;
    alertError(context: AlertContext): Promise<void>;
    alertRateLimit(context: AlertContext): Promise<void>;
    alertPaymentFailure(context: AlertContext): Promise<void>;
}
