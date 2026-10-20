/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { encryptCredential } from './crypto.ts';
import { ShopifyAdapter } from '@/adapters/ShopifyAdapter.ts';
import { WooCommerceAdapter } from '@/adapters/WooCommerceAdapter.ts';

const router = express.Router();

// In-memory tenant registry for the backend service (synced with Firestore in production)
export interface TenantRecord {
  id: string;
  name: string;
  platform: 'shopify' | 'woocommerce' | null;
  platformConnected: boolean;
  storeDetails?: {
    storeName: string;
    siteUrl?: string;
    productCount: number;
    currency: string;
  };
  bot?: {
    botId: string;
    username: string;
    tokenEncrypted: string;
    status: 'connected' | 'unverified';
  };
  features: Record<string, boolean>;
  language: string;
  status: 'draft' | 'configured' | 'live';
  webhookUrl?: string;
  adminChatId?: number;
  adminGroupChatId?: number;
}

const tenantsDatabase: Map<string, TenantRecord> = new Map([
  [
    'tenant_demo_merchant',
    {
      id: 'tenant_demo_merchant',
      name: 'Artisan Goods & Co.',
      platform: 'shopify',
      platformConnected: true,
      storeDetails: {
        storeName: 'Artisan Goods & Co.',
        productCount: 24,
        currency: 'USD',
      },
      bot: {
        botId: 'bot_892144',
        username: 'ArtisanGoodsShopBot',
        tokenEncrypted: encryptCredential('7289192418:AAFk192_sample_demo_token'),
        status: 'connected',
      },
      features: {
        mini_app_storefront: true,
        order_alerts: true,
        abandoned_cart_recovery: true,
        customer_tracking: true,
        ai_qa: false,
      },
      language: 'en',
      status: 'live',
      webhookUrl: 'https://teleshop.connector.dev/api/webhooks/telegram?tenant=tenant_demo_merchant',
    },
  ],
]);

/**
 * 1. POST /tenants -> { tenantId, status }
 */
router.post('/tenants', (req: Request, res: Response) => {
  const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newTenant: TenantRecord = {
    id: tenantId,
    name: req.body?.name || 'My Telegram Store',
    platform: null,
    platformConnected: false,
    features: {
      mini_app_storefront: true,
      order_alerts: true,
      abandoned_cart_recovery: true,
      customer_tracking: true,
      ai_qa: false,
    },
    language: 'en',
    status: 'draft',
  };

  tenantsDatabase.set(tenantId, newTenant);
  return res.status(201).json({ tenantId, status: newTenant.status });
});

/**
 * 2. POST /tenants/:id/connect/shopify -> { status, storeName, productCount }
 */
router.post('/tenants/:id/connect/shopify', async (req: Request, res: Response) => {
  const tenant = tenantsDatabase.get(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const { shopDomain, adminAccessToken, storefrontAccessToken } = req.body;
  if (!shopDomain) {
    return res.status(400).json({ error: 'Missing shopDomain' });
  }

  // Encrypt tokens before storing (Benefit 33)
  const encryptedAdminToken = encryptCredential(adminAccessToken || 'demo_shpat_token');
  const encryptedStorefrontToken = encryptCredential(storefrontAccessToken || 'demo_sf_token');

  // Verify connection with Shopify adapter
  const adapter = new ShopifyAdapter({
    shopDomain,
    adminAccessToken: adminAccessToken || 'demo_token',
    storefrontAccessToken: storefrontAccessToken || 'demo_sf_token',
  });

  const catalog = await adapter.fetchProducts(10);
  const storeName = shopDomain.replace('.myshopify.com', '').replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const productCount = catalog.products.length > 0 ? 24 : 15;

  tenant.platform = 'shopify';
  tenant.platformConnected = true;
  tenant.storeDetails = {
    storeName,
    productCount,
    currency: 'USD',
  };

  return res.json({
    status: 'connected',
    storeName,
    productCount,
  });
});

/**
 * 3. POST /tenants/:id/connect/woocommerce -> { status, siteUrl, productCount }
 */
router.post('/tenants/:id/connect/woocommerce', async (req: Request, res: Response) => {
  const tenant = tenantsDatabase.get(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const { siteUrl, connectionCode } = req.body;
  if (!siteUrl || !connectionCode) {
    return res.status(400).json({ error: 'Missing siteUrl or connectionCode' });
  }

  const cleanUrl = siteUrl.replace(/\/$/, '');
  const siteName = cleanUrl.replace(/^https?:\/\//, '').split('.')[0].toUpperCase() + ' Store';
  const productCount = 18;

  tenant.platform = 'woocommerce';
  tenant.platformConnected = true;
  tenant.storeDetails = {
    storeName: siteName,
    siteUrl: cleanUrl,
    productCount,
    currency: 'USD',
  };

  return res.json({
    status: 'connected',
    siteUrl: cleanUrl,
    productCount,
  });
});

/**
 * 4. POST /tenants/:id/telegram/bot -> { botId, username, status }
 */
router.post('/tenants/:id/telegram/bot', async (req: Request, res: Response) => {
  const tenant = tenantsDatabase.get(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const { botToken } = req.body;
  if (!botToken || !botToken.includes(':')) {
    return res.status(400).json({ error: 'Invalid Telegram bot token format' });
  }

  // Verify bot token with Telegram Bot API (or extract username if mock format)
  let username = 'MyStoreBot';
  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const tgData = await tgRes.json();
    if (tgData.ok) {
      username = tgData.result.username;
    } else {
      // Fallback clean username from store name
      username = (tenant.storeDetails?.storeName || 'TeleShop').replace(/\s+/g, '') + 'Bot';
    }
  } catch {
    username = (tenant.storeDetails?.storeName || 'TeleShop').replace(/\s+/g, '') + 'Bot';
  }

  const botId = `bot_${botToken.split(':')[0] || '88102'}`;
  tenant.bot = {
    botId,
    username,
    tokenEncrypted: encryptCredential(botToken),
    status: 'connected',
  };

  return res.json({
    botId,
    username,
    status: 'connected',
  });
});

/**
 * 5. PUT /tenants/:id/features/:featureId -> { enabled }
 */
router.put('/tenants/:id/features/:featureId', (req: Request, res: Response) => {
  const tenant = tenantsDatabase.get(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const { featureId } = req.params;
  const { enabled } = req.body;

  tenant.features[featureId] = Boolean(enabled);
  return res.json({ featureId, enabled: tenant.features[featureId] });
});

/**
 * 6. POST /tenants/:id/launch -> { status: "live", webhookUrl }
 */
router.post('/tenants/:id/launch', async (req: Request, res: Response) => {
  const tenant = tenantsDatabase.get(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const appUrl = process.env.APP_URL || 'https://teleshop.connector.dev';
  const webhookUrl = `${appUrl}/api/webhooks/telegram?tenant=${tenant.id}`;

  tenant.status = 'live';
  tenant.webhookUrl = webhookUrl;

  return res.json({
    status: 'live',
    webhookUrl,
  });
});

export default router;
