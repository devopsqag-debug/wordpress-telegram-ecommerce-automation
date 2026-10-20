/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Outbound Telegram Rate Limiter Queue
 * Non-negotiable constraint:
 * "Every outbound Telegram message goes through a rate-limited queue (max 30 msg/sec global, per-chat limits respected)."
 * Zero per-message cost (Telegram Bot API only - no paid SMS/email).
 */

interface QueuedMessage {
  botToken: string;
  chatId: number | string;
  method: 'sendMessage' | 'sendInvoice' | 'sendPhoto';
  payload: Record<string, any>;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  enqueuedAt: number;
  retryCount: number;
}

class TelegramMessageQueue {
  private queue: QueuedMessage[] = [];
  private isProcessing = false;
  private lastGlobalSendTimes: number[] = [];
  private lastChatSendTime: Map<string | number, number> = new Map();

  // Constraints: 30 msgs per second global, 1 msg per second per single chat
  private readonly MAX_GLOBAL_PER_SEC = 30;
  private readonly MIN_CHAT_INTERVAL_MS = 1050; // > 1 sec per chat

  /**
   * Enqueue a Telegram API outbound call
   */
  async enqueue(
    botToken: string,
    chatId: number | string,
    method: 'sendMessage' | 'sendInvoice' | 'sendPhoto',
    payload: Record<string, any>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        botToken,
        chatId,
        method,
        payload,
        resolve,
        reject,
        enqueuedAt: Date.now(),
        retryCount: 0,
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const now = Date.now();

      // Clean up global timestamps older than 1000ms
      this.lastGlobalSendTimes = this.lastGlobalSendTimes.filter((t) => now - t < 1000);

      // Check global limit
      if (this.lastGlobalSendTimes.length >= this.MAX_GLOBAL_PER_SEC) {
        const oldest = this.lastGlobalSendTimes[0];
        const waitMs = Math.max(10, 1000 - (now - oldest));
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      // Find first message that respects per-chat throttling
      let targetIndex = -1;
      for (let i = 0; i < this.queue.length; i++) {
        const item = this.queue[i];
        const lastChatTime = this.lastChatSendTime.get(item.chatId) || 0;
        if (now - lastChatTime >= this.MIN_CHAT_INTERVAL_MS) {
          targetIndex = i;
          break;
        }
      }

      if (targetIndex === -1) {
        // Wait slightly for next available chat slot
        await new Promise((r) => setTimeout(r, 50));
        continue;
      }

      const [item] = this.queue.splice(targetIndex, 1);
      const sendTime = Date.now();
      this.lastGlobalSendTimes.push(sendTime);
      this.lastChatSendTime.set(item.chatId, sendTime);

      // Execute request to Telegram Bot API
      try {
        const url = `https://api.telegram.org/bot${item.botToken}/${item.method}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: item.chatId, ...item.payload }),
        });

        const data = await res.json();
        if (data.ok) {
          item.resolve(data.result);
        } else {
          // Handle 429 Too Many Requests with retry_after
          if (data.error_code === 429 && item.retryCount < 3) {
            const retryAfterSec = data.parameters?.retry_after || 1;
            item.retryCount++;
            setTimeout(() => {
              this.queue.unshift(item);
            }, retryAfterSec * 1000);
          } else {
            item.reject(new Error(data.description || 'Telegram API Error'));
          }
        }
      } catch (err) {
        if (item.retryCount < 3) {
          item.retryCount++;
          this.queue.push(item);
        } else {
          item.reject(err);
        }
      }
    }

    this.isProcessing = false;
  }
}

export const telegramQueue = new TelegramMessageQueue();
