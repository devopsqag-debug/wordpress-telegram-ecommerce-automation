/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { telegramQueue } from './rateLimiter.ts';

export interface AbandonedCartRecord {
  id: string;
  tenantId: string;
  telegramChatId: number;
  customerFirstName?: string;
  itemCount: number;
  totalAmount: number;
  currency: string;
  firstItemTitle: string;
  firstItemImage?: string;
  checkoutUrl: string;
  createdAt: number; // timestamp
  recoveryNudgeSent?: boolean;
}

/**
 * Cloud Function: Abandoned Cart Recovery Cron (Benefit 2)
 * Scheduled to run every 15 minutes.
 * Scans tenants/{tenantId}/carts for carts older than the configurable threshold (default: 2 hours),
 * whose status is 'active' and recoveryNudgeSent is false.
 */
export async function processAbandonedCarts(
  carts: AbandonedCartRecord[],
  tenantSettings: {
    botToken: string;
    storeName: string;
    recoveryTimerHours: number; // default: 2 hours
    recoveryDiscountCode?: string; // e.g. "SAVE5"
  }
) {
  const { botToken, storeName, recoveryTimerHours = 2, recoveryDiscountCode = 'CART5' } = tenantSettings;
  const thresholdMs = recoveryTimerHours * 3600 * 1000;
  const now = Date.now();

  const candidates = carts.filter((c) => {
    return !c.recoveryNudgeSent && (now - c.createdAt) >= thresholdMs;
  });

  const results: string[] = [];

  for (const cart of candidates) {
    const greeting = cart.customerFirstName ? `Hey ${cart.customerFirstName}!` : `Hey there!`;
    const nudgeMessage = `🛍️ *${greeting} You left items in your cart at ${storeName}*

You were checking out *${cart.firstItemTitle}*${cart.itemCount > 1 ? ` and ${cart.itemCount - 1} other item(s)` : ''} for *${cart.currency} ${cart.totalAmount.toFixed(2)}*.

We saved your bag! Complete your checkout now and take an extra *5% off* with code \`${recoveryDiscountCode}\`:`;

    try {
      await telegramQueue.enqueue(botToken, cart.telegramChatId, 'sendMessage', {
        text: nudgeMessage,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '⚡ Resume & Complete Order', url: cart.checkoutUrl },
            ],
            [
              { text: '🛍️ Return to Mini App', web_app: { url: cart.checkoutUrl } },
            ],
          ],
        },
      });

      cart.recoveryNudgeSent = true;
      results.push(`Nudged cart ${cart.id}`);
    } catch (err) {
      console.error(`Failed to send abandoned cart nudge for cart ${cart.id}:`, err);
    }
  }

  return {
    processedCount: candidates.length,
    recoveredCandidateIds: candidates.map((c) => c.id),
    details: results,
  };
}
