/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { telegramQueue } from './rateLimiter.ts';

export interface DailyMetrics {
  date: string;
  totalRevenue: number;
  currency: string;
  totalOrders: number;
  telegramOrdersCount: number;
  telegramRevenue: number;
  botConversionRate: number;
  cartsRecoveredCount: number;
  recoveredRevenue: number;
  topSellingItem: string;
  unfulfilledOrdersCount: number;
}

/**
 * Cloud Function: Daily Sales Summary Cron (Benefit 24)
 * Scheduled to run once per day (e.g. 08:00 AM store local time).
 * Gathers previous 24h metrics from Firestore orders_cache and carts subcollections,
 * and sends an executive markdown summary to the store owner's Telegram.
 */
export async function sendDailySalesSummary(
  botToken: string,
  ownerTelegramChatId: string | number,
  storeName: string,
  metrics: DailyMetrics
) {
  const telegramShare = metrics.totalRevenue > 0
    ? ((metrics.telegramRevenue / metrics.totalRevenue) * 100).toFixed(1)
    : '0';

  const summaryText = `📊 *Daily Store Summary · ${storeName}*
📅 *${metrics.date}*

💰 *Total Sales:* *${metrics.currency} ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}*
📦 *Total Orders:* *${metrics.totalOrders}*

📱 *Telegram Commerce Channel:*
• Bot Orders: *${metrics.telegramOrdersCount}* (${telegramShare}% of total)
• Bot Revenue: *${metrics.currency} ${metrics.telegramRevenue.toFixed(2)}*
• Bot Conversion Rate: *${metrics.botConversionRate.toFixed(1)}%*
• Cart Recovery: *${metrics.cartsRecoveredCount}* orders recovered (*${metrics.currency} ${metrics.recoveredRevenue.toFixed(2)}*)

🌟 *Top Product:* ${metrics.topSellingItem}
⚠️ *Unfulfilled Pending:* ${metrics.unfulfilledOrdersCount} orders

_TeleShop Connector automated daily briefing_`;

  await telegramQueue.enqueue(botToken, ownerTelegramChatId, 'sendMessage', {
    text: summaryText,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📊 Open Merchant Dashboard', url: 'https://teleshop.connector.dev/dashboard' },
        ],
      ],
    },
  });

  return { success: true, deliveredTo: ownerTelegramChatId };
}
