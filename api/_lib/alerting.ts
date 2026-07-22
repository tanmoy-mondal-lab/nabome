import type { Env } from "./env";
import { logger } from "./logger";

export interface AlertContext {
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, unknown>;
}

interface AlertCooldown {
  lastSent: number;
}

const COOLDOWN_MS = 60_000; // 1 minute per alert type

export class AlertService {
  private env: Env | undefined;
  private cooldowns: Map<string, AlertCooldown> = new Map();

  constructor(env?: Env) {
    this.env = env;
  }

  private isDevelopment(): boolean {
    return this.env?.NODE_ENV !== "production";
  }

  private canSend(alertType: string): boolean {
    const cooldown = this.cooldowns.get(alertType);
    if (!cooldown) return true;
    return Date.now() - cooldown.lastSent >= COOLDOWN_MS;
  }

  private markSent(alertType: string): void {
    this.cooldowns.set(alertType, { lastSent: Date.now() });
  }

  private async send(alertType: string, context: AlertContext): Promise<void> {
    if (!this.canSend(alertType)) {
      return;
    }

    const payload = {
      alertType,
      severity: context.severity,
      message: context.message,
      metadata: context.metadata ?? {},
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment()) {
      logger.warn(`[ALERT:${alertType}]`, { payload });
      this.markSent(alertType);
      return;
    }

    const webhookUrl = this.env?.ALERT_WEBHOOK_URL;
    if (!webhookUrl) {
      logger.error("[AlertService] ALERT_WEBHOOK_URL not configured, dropping alert", { payload });
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        logger.error(`[AlertService] Webhook returned ${response.status}`);
        return;
      }

      this.markSent(alertType);
    } catch (error) {
      logger.error(
        "[AlertService] Failed to send alert:",
        { error: error instanceof Error ? error.message : error },
      );
    }
  }

  async alertError(context: AlertContext): Promise<void> {
    await this.send("error", context);
  }

  async alertRateLimit(context: AlertContext): Promise<void> {
    await this.send("rate_limit", context);
  }

  async alertPaymentFailure(context: AlertContext): Promise<void> {
    await this.send("payment_failure", context);
  }
}
