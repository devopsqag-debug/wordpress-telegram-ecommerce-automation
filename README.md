# TeleShop Connector

Production-ready mobile merchant app (React Native + Expo) and backend system connecting Shopify and WooCommerce stores to Telegram bots, allowing small-business customers to browse, cart, and shop entirely inside Telegram.

---

## 1. Full Repository Structure

```
teleshop-connector/
├── firestore.rules                     # Production Firestore security rules (strict tenant isolation & RBAC)
├── README.md                           # Firebase production setup and operations guide
├── package.json                        # Dependencies (@google/genai, express, lucide-react, motion, zustand)
├── tsconfig.json                       # TypeScript compiler options
├── vite.config.ts                      # Vite build configuration
│
├── adapters/                           # Platform-native e-commerce adapters
│   ├── types.ts                        # Universal PlatformAdapter interface & domain models
│   ├── ShopifyAdapter.ts               # Storefront GraphQL & Admin REST API integration
│   ├── WooCommerceAdapter.ts           # Companion REST & Telegram payment integration
│   └── companion-plugin/
│       └── teleshop-woocommerce-connector.php # Official companion WordPress plugin stub
│
├── backend/                            # Fastify / Express API Service
│   ├── server.ts                       # REST API routes (POST /tenants, /connect, /bot, /launch)
│   └── crypto.ts                       # AES-256-GCM encryption for credentials at rest
│
├── functions/                          # Cloud Functions & Scheduled Crons (24/7 server-side)
│   ├── rateLimiter.ts                  # Outbound Telegram message queue (max 30 msg/s global)
│   ├── shopifyWebhook.ts               # Orders/create, inventory & shipping tracking listener
│   ├── wooCommerceWebhook.ts           # WooCommerce order created & updated listener
│   ├── telegramWebhook.ts              # grammY bot webhook router (commands, inline sharing, GDPR)
│   ├── abandonedCartCron.ts            # Configurable 2-hour abandoned cart recovery cron
│   ├── dailySummaryCron.ts             # Scheduled 08:00 AM daily store sales briefing
│   ├── lowStockCheck.ts                # Inventory threshold monitor & admin alert
│   └── deadLetterQueueWorker.ts        # Exponential backoff retry handler & dead-letter queue
│
├── mobile/                             # React Native + Expo Merchant Dashboard & Setup Wizard
│   ├── types.ts                        # Tenant state, broadcast, review, and ticket models
│   ├── store/
│   │   └── useMerchantStore.ts         # Zustand store for wizard & merchant operations
│   ├── screens/
│   │   ├── wizard/                     # 6-Screen Guided Setup Wizard (Exact Copy)
│   │   │   ├── WizardScreen1Welcome.tsx
│   │   │   ├── WizardScreen2PlatformSelect.tsx
│   │   │   ├── WizardScreen3AShopify.tsx
│   │   │   ├── WizardScreen3BWooCommerce.tsx
│   │   │   ├── WizardScreen4BotCreation.tsx
│   │   │   ├── WizardScreen5FeatureToggles.tsx
│   │   │   ├── WizardScreen6Launch.tsx
│   │   │   └── SetupWizardNavigator.tsx
│   │   └── dashboard/
│   │       └── MerchantDashboard.tsx   # All 35 benefits across 6 merchant management tabs
│   └── components/
│       ├── TelegramBotSimulator.tsx    # Live Telegram bot in-chat simulator
│       └── ArchitectureViewer.tsx      # Source code & architecture inspector
│
└── mini-app/                           # Telegram Mini App Storefront (Next.js / WebApp)
    └── MiniAppStorefront.tsx           # Full catalog, cart, 1-tap reorder & loyalty
```

---

## 2. All 35 Benefits Matrix (Tier 1 & Tier 2)

| # | Benefit | Implementation Location |
|---|---------|--------------------------|
| 1 | Instant new-order alerts to admin (push + group) | `functions/shopifyWebhook.ts`, `functions/wooCommerceWebhook.ts` |
| 2 | Abandoned cart recovery (2-hour timer, configurable) | `functions/abandonedCartCron.ts` |
| 3 | Back-in-stock / price-drop alerts | `functions/lowStockCheck.ts`, `mobile/screens/dashboard/MerchantDashboard.tsx` |
| 4 | Low-stock alerts to admin | `functions/lowStockCheck.ts` |
| 5 | Saved addresses & one-tap reorder | `mini-app/MiniAppStorefront.tsx`, `firestore.rules` |
| 6 | Loyalty points / repeat-purchase nudges | `mini-app/MiniAppStorefront.tsx`, `functions/telegramWebhook.ts` |
| 7 | Referral program automation (unique link per customer) | `mini-app/MiniAppStorefront.tsx`, `functions/telegramWebhook.ts` |
| 8 | In-chat product browsing (Mini App catalog) | `mini-app/MiniAppStorefront.tsx`, `functions/telegramWebhook.ts` |
| 9 | In-chat checkout (Shopify URL / Telegram native payment) | `adapters/ShopifyAdapter.ts`, `adapters/WooCommerceAdapter.ts` |
| 10 | Payment links / invoice generation | `adapters/types.ts`, `adapters/WooCommerceAdapter.ts` |
| 11 | Wishlist / favorites | `mini-app/MiniAppStorefront.tsx` |
| 12 | Inline mode product sharing (`@bot query` in any chat) | `functions/telegramWebhook.ts` |
| 13 | Order status notifications to customers | `functions/shopifyWebhook.ts` |
| 14 | Automated FAQ answers (configurable Q&A pairs) | `functions/telegramWebhook.ts`, `mobile/screens/dashboard/MerchantDashboard.tsx` |
| 15 | Order lookup by order number (`/orders` command) | `functions/telegramWebhook.ts` |
| 16 | Refund/return request handling in chat | `functions/telegramWebhook.ts` |
| 17 | Graceful fallback to human support (escalation) | `functions/telegramWebhook.ts` |
| 18 | 24/7 availability (bot runs server-side, not on phone) | `functions/telegramWebhook.ts`, Cloud Functions runtime |
| 19 | Review/feedback collection after delivery (1–5 rating) | `functions/telegramWebhook.ts` |
| 20 | Broadcast announcements with scheduling | `mobile/screens/dashboard/MerchantDashboard.tsx`, `functions/rateLimiter.ts` |
| 21 | Customer segmentation for broadcasts | `mobile/screens/dashboard/MerchantDashboard.tsx` |
| 22 | Basic personalized recommendations | `mini-app/MiniAppStorefront.tsx` |
| 23 | QR code generation for in-store/social bot link | `mobile/screens/dashboard/MerchantDashboard.tsx` |
| 24 | Daily sales summary to owner (scheduled cron message) | `functions/dailySummaryCron.ts` |
| 25 | Role-based admin access (owner / staff / viewer) | `firestore.rules`, `mobile/screens/dashboard/MerchantDashboard.tsx` |
| 26 | Shipping tracking links pushed automatically | `functions/shopifyWebhook.ts` |
| 27 | Basic analytics dashboard (orders, bot share, cart recovery) | `mobile/screens/dashboard/MerchantDashboard.tsx` |
| 28 | Webhook retry / reliability handling (exponential backoff, DLQ) | `functions/deadLetterQueueWorker.ts` |
| 29 | Zero per-message cost (Telegram Bot API only) | `functions/rateLimiter.ts` |
| 30 | Multi-language / auto-detect (EN + ES via `language_code`) | `functions/telegramWebhook.ts`, `mini-app/MiniAppStorefront.tsx` |
| 31 | Guided setup (no code) — 6-screen wizard | `mobile/screens/wizard/*` |
| 32 | Platform-native integration (Shopify + WooCommerce companion) | `adapters/ShopifyAdapter.ts`, `adapters/WooCommerceAdapter.ts` |
| 33 | Secure credential storage (AES-256 at rest, never log tokens) | `backend/crypto.ts`, `firestore.rules` |
| 34 | GDPR consent + data deletion (`/delete_my_data` command) | `functions/telegramWebhook.ts` |
| 35 | Welcome sequence for new subscribers (`/start` + incentive) | `functions/telegramWebhook.ts` |

---

## 3. Step-by-Step Production Firebase Setup Guide

Follow these steps to deploy TeleShop Connector to Google Cloud & Firebase:

### Step 1: Create Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com).
2. Click **Add project**, name it `teleshop-connector-prod`, and click **Continue**.
3. (Optional) Enable Google Analytics and create the project.

### Step 2: Enable Cloud Firestore in Production Mode
1. In the Firebase console left sidebar, navigate to **Build** → **Firestore Database**.
2. Click **Create database**.
3. Choose a Firestore Cloud location (e.g. `us-central1` or `europe-west1`).
4. **CRITICAL**: Select **Start in production mode** (this denies all client access by default). Click **Enable**.

### Step 3: Enable Firebase Authentication
1. Navigate to **Build** → **Authentication** → **Get started**.
2. Under the **Sign-in method** tab, click **Email/Password**.
3. Toggle **Enable** on and click **Save**.
4. (Optional) Create your first merchant owner admin account in the **Users** tab.

### Step 4: Deploy Firestore Security Rules
Install the Firebase CLI and login:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore # Select your project: teleshop-connector-prod
```
Deploy the security rules from this repository:
```bash
firebase deploy --only firestore:rules
```
The rules in `firestore.rules` enforce:
- Strict tenant-scoped data isolation via custom claims (`request.auth.token.tenantId`).
- Complete lock down on `credentials/private` subcollection (`allow read, write: if false;`), ensuring Shopify tokens, WooCommerce secrets, and Telegram bot tokens are only accessible via the server Admin SDK.

### Step 5: Generate Admin Service Account Key
1. In Firebase Console, click the **Gear Icon (Project Settings)** → **Service accounts**.
2. Click **Generate new private key** and download the resulting JSON file.
3. Save this file securely. Never commit this file to Git.

### Step 6: Configure Environment Variables
Set the following environment variables in your server environment (Cloud Run, Cloud Functions, or Docker container):

```bash
# Server & App URL
PORT=3000
APP_URL="https://your-cloud-run-service.a.run.app"

# Master Encryption Key for AES-256-GCM (32 random bytes hex)
ENCRYPTION_MASTER_KEY="9f82ab48209e2019488a02c8190348bc9281a0e9821734918239018471928340"

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID="teleshop-connector-prod"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@teleshop-connector-prod.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...-----END PRIVATE KEY-----\n"
```

---

## 4. Telegram Bot & Store Webhook Setup

1. **Bot Registration**:
   - Message `@BotFather` on Telegram and send `/newbot`.
   - Name your store bot and choose a handle ending in `bot`.
   - Copy the bot token provided by BotFather.
2. **Setup Wizard**:
   - Launch TeleShop Connector mobile app.
   - Run the 6-screen setup wizard to connect either Shopify or WooCommerce and paste your Bot token.
3. **Automated Webhook Registration**:
   - On Step 6 ("You're ready to launch"), TeleShop automatically calls:
     - `https://api.telegram.org/bot<TOKEN>/setWebhook?url=<APP_URL>/api/webhooks/telegram?tenant=<TENANT_ID>`
     - Shopify Admin API `POST /admin/api/2024-04/webhooks.json`
     - WooCommerce companion plugin `/wp-json/teleshop/v1/webhooks/register`
   - All outbound messages are throttled by the internal rate-limited queue (max 30 msgs/second global).
