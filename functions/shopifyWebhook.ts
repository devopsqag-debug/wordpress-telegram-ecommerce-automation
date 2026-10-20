/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { telegramQueue } from './rateLimiter.ts';

/**
 * Cloud Function: Shopify Webhook Handler
 * Endpoint: /api/webhooks/shopify?tenant=...
 * Topics handled:
 * - orders/create (Benefit 1: Instant new-order alert to admin + group message)
 * - orders/updated (Benefit 26: Shipping tracking links pushed)
 * - inventory_levels/update (Benefit 4: Low-stock alert to admin)
 */
export async function handleShopifyWebhook(
  rawBody: string,
  headers: Record<string, string | undefined>,
  tenantConfig: {
    tenantId: string;
    webhookSecret: string;
    botToken: string;
    adminChatId: string | number;
    adminGroupChatId?: string | number;
    lowStockThreshold?: number;
  }
) {
  // 1. Verify Shopify HMAC signature
  const hmacHeader = headers['x-shopify-hmac-sha256'];
  if (!hmacHeader) {
    throw new Error('Missing X-Shopify-Hmac-Sha256 header');
  }

  const generatedHmac = crypto
    .createHmac('sha256', tenantConfig.webhookSecret)
    .update(rawBody, 'utf8')
    .digest('base64');

  if (!crypto.timingSafeEqual(Buffer.from(generatedHmac), Buffer.from(hmacHeader))) {
    throw new Error('Invalid Shopify HMAC signature');
  }

  const topic = headers['x-shopify-topic'] || 'orders/create';
  const orderData = JSON.parse(rawBody);

  // Note: No customer PII in console logs (Rule: No customer PII in logs)
  console.log(`[ShopifyWebhook] Received topic "${topic}" for tenant ${tenantConfig.tenantId}. ID: ${orderData.id}`);

  if (topic === 'orders/create') {
    // Instant new-order alert to admin (Push + Telegram group message)
    const orderNumber = orderData.name || `#${orderData.order_number}`;
    const total = `${orderData.currency || 'USD'} ${parseFloat(orderData.total_price || '0').toFixed(2)}`;
    const lineItemCount = (orderData.line_items || []).length;
    const sourceTag = orderData.source_name === 'telegram' ? '📱 Telegram Bot' : '🌐 Web Storefront';

    const adminMessage = `🔔 *New Order Received!*
Order: *${orderNumber}*
Total: *${total}*
Items: *${lineItemCount}* item(s)
Source: *${sourceTag}*
Status: *${orderData.financial_status || 'paid'}*

_Customer notified via Telegram Mini App_`;

    // 1. Direct message to admin
    await telegramQueue.enqueue(tenantConfig.botToken, tenantConfig.adminChatId, 'sendMessage', {
      text: adminMessage,
      parse_mode: 'Markdown',
    });

    // 2. Telegram group message (Benefit 1)
    if (tenantConfig.adminGroupChatId) {
      await telegramQueue.enqueue(tenantConfig.botToken, tenantConfig.adminGroupChatId, 'sendMessage', {
        text: `🏬 *Store Alert:* New order ${orderNumber} for ${total} placed.`,
        parse_mode: 'Markdown',
      });
    }

    return { status: 'processed', orderId: orderData.id, orderNumber };
  }

  if (topic === 'orders/updated') {
    // Shipping tracking link pushed automatically (Benefit 26)
    const fulfillments = orderData.fulfillments || [];
    const latestFulfillment = fulfillments[fulfillments.length - 1];
    const customerChatId = orderData.note_attributes?.find((a: any) => a.name === 'telegram_chat_id')?.value;

    if (latestFulfillment && latestFulfillment.tracking_number && customerChatId) {
      const trackingMsg = `📦 *Your Order is On the Way!*
Order: *${orderData.name || orderData.id}*
Carrier: *${latestFulfillment.tracking_company || 'Standard Carrier'}*
Tracking Number: \`${latestFulfillment.tracking_number}\`

Track here: ${latestFulfillment.tracking_url || 'https://www.google.com/search?q=' + latestFulfillment.tracking_number}`;

      await telegramQueue.enqueue(tenantConfig.botToken, customerChatId, 'sendMessage', {
        text: trackingMsg,
        parse_mode: 'Markdown',
      });
    }

    return { status: 'fulfillment_updated' };
  }

  if (topic === 'inventory_levels/update') {
    const available = orderData.available ?? 0;
    const threshold = tenantConfig.lowStockThreshold || 5;

    if (available <= threshold) {
      // Benefit 4: Low-stock alerts to admin
      const lowStockMsg = `⚠️ *Low Stock Alert!*
Inventory Item ID: \`${orderData.inventory_item_id}\`
Remaining Units: *${available}* (Threshold: ${threshold})
Please replenish inventory soon.`;

      await telegramQueue.enqueue(tenantConfig.botToken, tenantConfig.adminChatId, 'sendMessage', {
        text: lowStockMsg,
        parse_mode: 'Markdown',
      });
    }

    return { status: 'inventory_checked', available };
  }

  return { status: 'ignored_topic' };
}
