# TeleShop Connector: GitLab Private Repo & Cloudflare Deployment Guide
**Engineered by [Flotraq.com](https://flotraq.com)**

This project provides a complete multi-tier architecture:
1. **Laravel Standalone Backend (`/laravel`)**: High-throughput order management, Telegram bot polling/webhooks, database migrations, and Stripe Connect marketplace with delivery-confirmed release.
2. **WordPress / WooCommerce Plugin (`/wordpress-plugin`)**: Companion plugin for WooCommerce that exposes secure REST endpoints and pairs stores with Telegram Mini Apps.
3. **Cloudflare Worker & Pages Edge (`/worker`, `wrangler.toml`)**: High-performance edge routing with sub-15ms worldwide response times.
4. **GitLab CI/CD (`.gitlab-ci.yml`)**: Automated pipeline to build, test, package plugin zip, and deploy directly to Cloudflare Pages and Workers.

---

## 1. Pushing to your GitLab Private Repository

Run the following commands in your terminal:

```bash
# Initialize git if not already present
git init

# Add all files
git add .
git commit -m "feat: complete Laravel standalone, WordPress plugin & Cloudflare worker demo by Flotraq.com"

# Set main branch
git branch -M main

# Add your private GitLab remote repository
git remote add origin git@gitlab.com:YOUR_GROUP/YOUR_PRIVATE_REPO.git

# Push to your private repository
git push -u origin main
```

---

## 2. Setting Up GitLab CI/CD Variables

In your GitLab project, navigate to **Settings > CI/CD > Variables** and add the following protected variables:

| Variable Name | Description | Example Value |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token with Workers & Pages Edit permissions | `v1.0-xxxx...` |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID from dashboard | `a1b2c3d4e5f6...` |
| `CLOUDFLARE_PAGES_PROJECT` | Name of your Pages project | `teleshop-wp-demo` |
| `STRIPE_SECRET_KEY` | Platform Stripe secret key | `sk_live_...` |
| `TELEGRAM_BOT_TOKEN` | Production bot token from @BotFather | `123456789:ABC...` |

---

## 3. Deploying to Cloudflare Manually & Custom Domain Setup

Custom domain targeted: **`wpgram.flotraq.com`**

```bash
# Login to Cloudflare
npx wrangler login

# 1. Build and deploy frontend to Cloudflare Pages
npm run build
npx wrangler pages deploy dist --project-name=teleshop-wp-demo

# 2. Attach Custom Domain (wpgram.flotraq.com) to Pages
npx wrangler pages domain set teleshop-wp-demo wpgram.flotraq.com

# 3. Deploy Cloudflare Worker edge function with custom domain
npx wrangler deploy
```

### DNS / Cloudflare Dashboard Setup:
- **For Cloudflare Pages**: In your Cloudflare dashboard, go to **Workers & Pages > teleshop-wp-demo > Custom Domains > Add a domain** and type `wpgram.flotraq.com`. Cloudflare automatically provisions the SSL certificate and adds the DNS CNAME record.
- **For Cloudflare Worker**: `wrangler.toml` binds `wpgram.flotraq.com` directly via:
  ```toml
  routes = [
    { pattern = "wpgram.flotraq.com/*", zone_name = "flotraq.com" },
    { pattern = "wpgram.flotraq.com", custom_domain = true }
  ]
  ```

---

## 4. Installing the WordPress Plugin

1. Download or zip the `/wordpress-plugin` folder into `teleshop-woocommerce-connector-v1.0.0.zip`.
2. In WordPress Admin, navigate to **Plugins > Add New > Upload Plugin**.
3. Choose the `.zip` file and click **Install Now**, then **Activate Plugin**.
4. Navigate to the new **TeleShop Telegram** menu item in your WordPress admin sidebar.
5. Copy the 8-character handshake code and paste it into the TeleShop setup wizard!

---

*Need custom enterprise features or cloud scaling? Visit [Flotraq.com](https://flotraq.com).*
