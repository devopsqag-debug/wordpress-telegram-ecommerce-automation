/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { telegramQueue } from './rateLimiter.ts';

/**
 * Cloud Function: WooCommerce Webhook Handler
 * Endpoint: /api/webhooks/woocommerce?tenant=...
 */
export async function handleWooCommerceWebhook(
  rawBody: string,
  headers: Record<string, string | undefined>,
  tenantConfig: {
    tenantId: string;
    webhookSecret: string;
    botToken: string;
    adminChatId: string | number;
    adminGroupChatId?: string | number;
  }
) {
  const signature = headers['x-wc-webhook-signature'];
  if (!signature) {
    throw new Error('Missing X-WC-Webhook-Signature header');
  }

  const generatedSignature = crypto
    .createHmac('sha256', tenantConfig.webhookSecret)
    .update(rawBody, 'utf8')
    .digest('base64');

  if (!crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(signature))) {
    throw new Error('Invalid WooCommerce signature');
  }

  const topic = headers['x-wc-webhook-topic'] || 'action.woocommerce_new_order';
  const data = JSON.parse(rawBody);

  console.log(`[WooCommerceWebhook] Received event "${topic}" for tenant ${tenantConfig.tenantId}. Order: ${data.id || data.order_id}`);

  if (topic.includes('order.created') || topic.includes('woocommerce_new_order')) {
    const orderNum = data.number || data.order_number || `#${data.id || data.order_id}`;
    const total = `${data.currency || 'USD'} ${parseFloat(data.total || '0').toFixed(2)}`;

    const adminMsg = `🔔 *New WooCommerce Order!*
Order: *${orderNum}*
Total: *${total}*
Status: *${data.status || 'processing'}*

_Customer checkout verified_`;

    await telegramQueue.enqueue(tenantConfig.botToken, tenantConfig.adminChatId, 'sendMessage', {
      text: adminMsg,
      parse_mode: 'Markdown',
    });

    if (tenantConfig.adminGroupChatId) {
      await telegramQueue.enqueue(tenantConfig.botToken, tenantConfig.adminGroupChatId, 'sendMessage', {
        text: `🏬 *Store Alert:* WooCommerce Order ${orderNum} for ${total} placed.`,
        parse_mode: 'Markdown',
      });
    }

    return { status: 'processed', orderNumber: orderNum };
  }

  return { status: 'ignored' };
}
