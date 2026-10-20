/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DLQWebhookEvent {
  id: string;
  tenantId: string;
  source: 'shopify' | 'woocommerce' | 'telegram';
  topic: string;
  payload: Record<string, any>;
  headers: Record<string, string>;
  attemptCount: number;
  maxRetries: number;
  lastAttemptAt: number;
  nextRetryAt: number;
  lastError: string;
  status: 'pending_retry' | 'dead_lettered' | 'resolved';
}

/**
 * Cloud Function: Dead Letter Queue & Exponential Backoff Retry Worker (Benefit 28)
 * Ensures high reliability for store webhooks.
 * Uses backoff delays: 1st retry = 30s, 2nd = 2m, 3rd = 8m, 4th = 32m, 5th = dead-lettered.
 */
export class DeadLetterQueueWorker {
  private static calculateNextBackoffMs(attemptCount: number): number {
    // base 30s * 4^(attemptCount)
    const baseMs = 30 * 1000;
    return Math.min(baseMs * Math.pow(4, attemptCount), 3600 * 1000); // capped at 1 hour
  }

  /**
   * Record a failed webhook attempt into the retry queue
   */
  static enqueueFailedEvent(
    tenantId: string,
    source: 'shopify' | 'woocommerce' | 'telegram',
    topic: string,
    payload: Record<string, any>,
    headers: Record<string, string>,
    error: Error
  ): DLQWebhookEvent {
    const nextRetryMs = this.calculateNextBackoffMs(0);
    const event: DLQWebhookEvent = {
      id: `dlq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tenantId,
      source,
      topic,
      payload,
      headers,
      attemptCount: 1,
      maxRetries: 5,
      lastAttemptAt: Date.now(),
      nextRetryAt: Date.now() + nextRetryMs,
      lastError: error.message || 'Unknown network error',
      status: 'pending_retry',
    };

    console.warn(`[DLQ] Enqueued failed webhook ${event.id} for topic "${topic}". Retrying in ${nextRetryMs / 1000}s.`);
    return event;
  }

  /**
   * Process all events that are ready for retry
   */
  static async processRetries(
    events: DLQWebhookEvent[],
    retryHandler: (event: DLQWebhookEvent) => Promise<boolean>
  ): Promise<{ resolved: number; failedAgain: number; deadLettered: number }> {
    const now = Date.now();
    let resolved = 0;
    let failedAgain = 0;
    let deadLettered = 0;

    for (const event of events) {
      if (event.status !== 'pending_retry' || event.nextRetryAt > now) {
        continue;
      }

      try {
        const success = await retryHandler(event);
        if (success) {
          event.status = 'resolved';
          resolved++;
          console.log(`[DLQ] Successfully resolved event ${event.id} on attempt ${event.attemptCount}`);
        } else {
          throw new Error('Handler returned unsuccessful');
        }
      } catch (err: any) {
        event.attemptCount++;
        event.lastAttemptAt = Date.now();
        event.lastError = err.message || 'Retry failed';

        if (event.attemptCount >= event.maxRetries) {
          event.status = 'dead_lettered';
          deadLettered++;
          console.error(`[DLQ] Webhook ${event.id} reached max retries (${event.maxRetries}). Moved to Dead-Letter Queue.`);
        } else {
          const backoff = this.calculateNextBackoffMs(event.attemptCount);
          event.nextRetryAt = Date.now() + backoff;
          failedAgain++;
          console.warn(`[DLQ] Retry failed for ${event.id}. Next retry in ${backoff / 1000}s.`);
        }
      }
    }

    return { resolved, failedAgain, deadLettered };
  }
}
