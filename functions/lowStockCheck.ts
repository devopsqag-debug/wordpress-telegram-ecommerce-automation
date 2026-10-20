/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { telegramQueue } from './rateLimiter.ts';

export interface LowStockItem {
  title: string;
  variantTitle?: string;
  sku: string;
  remainingQuantity: number;
  threshold: number;
  productId: string;
}

/**
 * Cloud Function: Low-Stock Check (Benefit 4)
 * Runs periodically or triggered by inventory_levels webhook.
 * Dispatches targeted alerts to admin when stock is depleted.
 */
export async function dispatchLowStockAlert(
  botToken: string,
  adminChatId: string | number,
  storeName: string,
  lowStockItems: LowStockItem[]
) {
  if (lowStockItems.length === 0) return { notified: false };

  const itemList = lowStockItems
    .map(
      (item) =>
        `• *${item.title}${item.variantTitle ? ` (${item.variantTitle})` : ''}*\n  Stock: *${item.remainingQuantity} left* (SKU: \`${item.sku || 'N/A'}\`)`
    )
    .join('\n');

  const alertMessage = `⚠️ *Low Stock Warning · ${storeName}*
The following item(s) have dropped below your safety threshold:

${itemList}

_Consider reordering from your supplier to prevent stockouts._`;

  await telegramQueue.enqueue(botToken, adminChatId, 'sendMessage', {
    text: alertMessage,
    parse_mode: 'Markdown',
  });

  return { notified: true, count: lowStockItems.length };
}
