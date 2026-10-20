/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileCode, Terminal, Shield, Copy, Check, 
  ExternalLink, Layers, Database, Code2, DollarSign
} from 'lucide-react';

export const ArchitectureViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<
    'tree' | 'rules' | 'adapters' | 'functions' | 'stripe_marketplace' | 'plugin' | 'readme'
  >('stripe_marketplace');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const repoTree = `teleshop-connector/
├── firestore.rules                     # Deliverable 2: Production Firestore security rules
├── README.md                           # Deliverable 6: Production Firebase setup guide
├── adapters/                           # Deliverable 4: E-commerce platform adapters
│   ├── types.ts                        # Universal PlatformAdapter interface & domain models
│   ├── ShopifyAdapter.ts               # Storefront & Admin API integration
│   ├── WooCommerceAdapter.ts           # Companion REST & Telegram payment integration
│   └── companion-plugin/
│       └── teleshop-woocommerce-connector.php # WordPress companion plugin contract stub
├── functions/                          # Deliverable 5: Cloud Functions & Crons
│   ├── rateLimiter.ts                  # Outbound Telegram queue (max 30 msg/s global)
│   ├── shopifyWebhook.ts               # Orders, inventory & tracking webhook handler
│   ├── wooCommerceWebhook.ts           # WooCommerce webhook listener
│   ├── telegramWebhook.ts              # grammY bot webhook router (commands, inline, GDPR)
│   ├── abandonedCartCron.ts            # 2-hour configurable cart recovery cron
│   ├── dailySummaryCron.ts             # Scheduled 08:00 AM daily store sales briefing
│   ├── lowStockCheck.ts                # Inventory threshold monitor & admin alert
│   └── deadLetterQueueWorker.ts        # Exponential backoff retry handler & DLQ
├── backend/                            # Fastify / Express backend server
│   ├── server.ts                       # REST API contract (POST /tenants, /launch, etc.)
│   └── crypto.ts                       # AES-256-GCM credential encryption at rest
├── mobile/                             # Deliverable 3: React Native + Expo App
│   ├── types.ts                        # App types and tenant state
│   ├── store/
│   │   └── useMerchantStore.ts         # Zustand store for wizard & dashboard
│   ├── screens/
│   │   ├── wizard/
│   │   │   ├── WizardScreen1Welcome.tsx        # Screen 1 (Exact copy)
│   │   │   ├── WizardScreen2PlatformSelect.tsx # Screen 2 (Exact copy)
│   │   │   ├── WizardScreen3AShopify.tsx       # Screen 3A (Exact copy)
│   │   │   ├── WizardScreen3BWooCommerce.tsx   # Screen 3B (Exact copy)
│   │   │   ├── WizardScreen4BotCreation.tsx    # Screen 4 (Exact copy)
│   │   │   ├── WizardScreen5FeatureToggles.tsx # Screen 5 (Exact copy)
│   │   │   ├── WizardScreen6Launch.tsx         # Screen 6 (Exact copy)
│   │   │   └── SetupWizardNavigator.tsx
│   │   └── dashboard/
│   │       └── MerchantDashboard.tsx           # Full 35-benefits dashboard
│   └── components/
│       └── TelegramBotSimulator.tsx            # Live bot chat & inline query simulator
└── mini-app/                           # Telegram Mini App Storefront (Next.js / WebApp)
    └── MiniAppStorefront.tsx           # Full catalog, cart, 1-tap reorder & loyalty
`;

  const filesMap: Record<string, string> = {
    tree: repoTree,
    rules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isTenantUser(tenantId) {
      return isAuthenticated() && (request.auth.token.tenantId == tenantId || request.auth.uid == tenantId);
    }
    function isTenantStaff(tenantId) {
      return isTenantUser(tenantId) && (request.auth.token.role in ['owner', 'staff']);
    }

    match /tenants/{tenantId} {
      allow read: if isTenantUser(tenantId);
      allow create, update: if isTenantUser(tenantId);
      allow delete: if false;

      // STRICT: Server-only! Deny all client access (AES-256 credentials)
      match /credentials/{document=**} {
        allow read, write: if false;
      }
      match /features/{featureId} {
        allow read: if isTenantUser(tenantId);
        allow write: if isTenantStaff(tenantId);
      }
      match /customers/{customerId} {
        allow read, write: if isTenantStaff(tenantId);
      }
      match /carts/{cartId} {
        allow read, write: if isTenantStaff(tenantId);
      }
      match /orders_cache/{orderId} {
        allow read: if isTenantUser(tenantId);
        allow write: if false; // Server Admin SDK only
      }
      match /events/{eventId} {
        allow read: if isTenantUser(tenantId);
        allow write: if false;
      }
    }
    match /telegram_bots/{botId} { allow read, write: if false; }
    match /platform_webhooks/{webhookId} { allow read, write: if false; }
    match /dead_letter_queue/{queueId} { allow read, write: if false; }
  }
}`,
    adapters: `// PlatformAdapter interface (adapters/types.ts)
export interface PlatformAdapter {
  readonly platformName: 'shopify' | 'woocommerce';
  fetchProducts(limit?: number, cursor?: string, query?: string): Promise<{ products: Product[]; hasNextPage: boolean }>;
  fetchProduct(productId: string): Promise<Product | null>;
  createCart(items: Array<{ variantId: string; quantity: number }>, customerInfo?: { telegramChatId?: number; email?: string }): Promise<Cart>;
  getCheckoutUrl(cartId: string, items: CartItem[], telegramChatId?: number): Promise<CheckoutResult>;
  fetchOrders(params?: { limit?: number; customerEmail?: string; orderNumber?: string }): Promise<Order[]>;
  fetchOrderById(orderIdOrNumber: string): Promise<Order | null>;
  registerWebhooks(targetWebhookUrl: string, secret: string): Promise<WebhookRegistrationResult>;
  checkInventory(variantIds: string[]): Promise<InventoryLevel[]>;
}`,
    functions: `// Cloud Functions:
1. handleShopifyWebhook: Verifies X-Shopify-Hmac-Sha256 -> orders/create, orders/updated, inventory_levels/update.
2. handleWooCommerceWebhook: Verifies X-WC-Webhook-Signature -> order.created, order.updated.
3. handleTelegramWebhook: grammY bot webhook listener -> /start welcome incentive, inline queries @bot, /orders lookup, /faq Q&A, /refund, /support escalation, /delete_my_data GDPR.
4. processAbandonedCarts: Scheduled cron (every 15 min) -> scans carts >= 2 hours -> sends Telegram nudge.
5. sendDailySalesSummary: Scheduled cron (daily 08:00 AM) -> compiles GMV & bot conversion -> sends to store owner.
6. dispatchLowStockAlert: Triggers when quantity <= threshold (default 5 units).
7. DeadLetterQueueWorker: Exponential backoff (30s, 2m, 8m, 32m) with max 5 retries.`,
    stripe_marketplace: `# Centralized Stripe Connect Marketplace Architecture

## 1. Core Model: Separate Charges & Transfers
- Central Platform Account: Operates primary Stripe Connect account.
- Connected Merchant Accounts: Stripe Express onboarded per merchant.
- Centralized Customer Checkout: Charges collected via PaymentIntent with transfer_group: orderId.
- Platform Commission: Deducted in integer minor units (cents). e.g. 5% + $0.30 fixed fee.
- Merchant Disbursement: Conditional on verified delivery + 3-business-day release period.

## 2. 18 Order-Payment States Matrix
Sequential States (11):
1.  PENDING_PAYMENT      -> Customer initiated checkout
2.  PAID                 -> PaymentIntent captured on platform account
3.  PROCESSING           -> Merchant packing order
4.  SHIPPED              -> Carrier tracking dispatched
5.  DELIVERED            -> Package delivered event received
6.  DELIVERY_CONFIRMED   -> Verified carrier event, customer receipt, or admin audit
7.  RELEASE_PENDING      -> 3-business-day clock ticking (excludes weekends & holidays)
8.  TRANSFER_PROCESSING  -> Eligibility rechecked, transfer initiated
9.  TRANSFERRED          -> stripe.transfers.create settled into connected account
10. PAYOUT_PROCESSING    -> Bank payout scheduled
11. PAID_OUT             -> Payout confirmed to merchant bank account

Exceptional / Alternative States (7):
- PAYMENT_FAILED         -> Card declined or authorization error
- CANCELLED              -> Order cancelled before fulfillment
- REFUND_PENDING         -> Customer return/refund under review
- REFUNDED               -> Refund issued (pre-transfer or via transfer reversal)
- DISPUTED               -> Contested delivery / chargeback; outbound transfer FROZEN
- PAYOUT_FAILED          -> Bank routing or verification document issue
- MANUAL_REVIEW          -> Admin intervention required

## 3. Delivery Confirmation & 3-Business-Day Release Period
- Business-Day Math: Excludes Saturdays, Sundays, and platform public holidays.
- Example: Confirmed Friday 2pm -> Day 1 (Mon), Day 2 (Tue), Day 3 (Wed 2pm).
- Automated Re-evaluation: Before executing transfer, checks whether disputes or refunds occurred.
- Fraud & Dispute Lock: Transfers are strictly blocked while any dispute is open.
- Integer Minor Units: All ledger values computed in integer cents (no floating point drift).
- Legal Compliance: Contractual holding policy under Stripe Connect Marketplace terms (not simulated escrow).`,
    plugin: `<?php
// WordPress Companion Plugin Stub Contract
// Path: adapters/companion-plugin/teleshop-woocommerce-connector.php
add_action('rest_api_init', function() {
    register_rest_route('teleshop/v1', '/verify', ['methods' => 'POST', 'callback' => 'teleshop_verify']);
    register_rest_route('teleshop/v1', '/products', ['methods' => 'GET', 'callback' => 'teleshop_get_products']);
    register_rest_route('teleshop/v1', '/cart', ['methods' => 'POST', 'callback' => 'teleshop_create_cart']);
    register_rest_route('teleshop/v1', '/orders', ['methods' => 'GET', 'callback' => 'teleshop_get_orders']);
    register_rest_route('teleshop/v1', '/webhooks/register', ['methods' => 'POST', 'callback' => 'teleshop_register_webhooks']);
});`,
    readme: `# TeleShop Connector - Production Setup Guide`,
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 font-mono text-xs select-none">
      {/* Top File Selector Strip */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between overflow-x-auto shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedFile('stripe_marketplace')}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedFile === 'stripe_marketplace' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Stripe Marketplace Spec</span>
          </button>
          <button
            onClick={() => setSelectedFile('tree')}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedFile === 'tree' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Repo Tree</span>
          </button>
          <button
            onClick={() => setSelectedFile('rules')}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedFile === 'rules' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>firestore.rules</span>
          </button>
          <button
            onClick={() => setSelectedFile('adapters')}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedFile === 'adapters' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Adapters</span>
          </button>
          <button
            onClick={() => setSelectedFile('functions')}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedFile === 'functions' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Cloud Functions</span>
          </button>
          <button
            onClick={() => setSelectedFile('plugin')}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedFile === 'plugin' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>WC Plugin Stub</span>
          </button>
          <button
            onClick={() => setSelectedFile('readme')}
            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedFile === 'readme' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>README.md</span>
          </button>
        </div>

        <button
          onClick={() => copyToClipboard(filesMap[selectedFile])}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Display Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-900 leading-relaxed text-slate-300">
        <pre className="whitespace-pre font-mono text-[11px] select-text">
          {filesMap[selectedFile]}
        </pre>
      </div>
    </div>
  );
};
