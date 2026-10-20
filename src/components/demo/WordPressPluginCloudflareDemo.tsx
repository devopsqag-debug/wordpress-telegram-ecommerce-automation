/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Globe, Server, Cpu, GitBranch, Terminal, 
  CheckCircle2, ArrowRight, RefreshCw, Send, 
  ExternalLink, Download, Shield, Copy, Check,
  Zap, Database, Eye, Code, Layers
} from 'lucide-react';

export function WordPressPluginCloudflareDemo() {
  const [activeTab, setActiveTab] = useState<'wp_admin' | 'cloudflare_worker' | 'laravel_core' | 'gitlab_ci'>('wp_admin');
  const [handshakeCode, setHandshakeCode] = useState('TK94B7X1');
  const [isConnected, setIsConnected] = useState(true);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const simulateCloudflareTelegram = () => {
    setIsTesting(true);
    setTimeout(() => {
      setTestResponse(JSON.stringify({
        ok: true,
        edge_runtime: "Cloudflare Worker (V8)",
        flotraq_architecture: "Verified",
        latency_ms: 12,
        route: "/webhook/telegram",
        status: 200,
        result: {
          chat_id: 84920194,
          handled_command: "/shop",
          reply: "Opening TeleShop Mini App connected to WooCommerce store...",
          store_url: "https://artisan-demo.wp-store.example",
          synced_products: 4
        }
      }, null, 2));
      setIsTesting(false);
    }, 600);
  };

  const simulateWpCatalogSync = () => {
    setIsTesting(true);
    setTimeout(() => {
      setTestResponse(JSON.stringify({
        success: true,
        plugin_version: "1.0.0",
        author: "Flotraq.com",
        woocommerce_version: "8.7.0",
        endpoint: "/wp-json/teleshop/v1/products",
        synced_count: 4,
        synced_products: [
          { id: 101, name: "Handcrafted Ceramic Pour-Over Dripper", price: 38.00, stock: 15 },
          { id: 102, name: "Single-Origin Ethiopian Yirgacheffe (250g)", price: 22.00, stock: 42 },
          { id: 103, name: "Minimalist Heavy Canvas Tote (Ecru)", price: 34.00, stock: 28 },
          { id: 104, name: "Japanese Precision Gooseneck Kettle", price: 65.00, stock: 9 }
        ]
      }, null, 2));
      setIsTesting(false);
    }, 500);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-800/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Flotraq.com Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Cloudflare Worker & Pages Demo
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              WordPress Plugin + Laravel Standalone Demo
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Turn any WooCommerce store into a Telegram Mini App with centralized Stripe Connect marketplace payments, deployed at Cloudflare edge and ready for your GitLab private repository.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://flotraq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
            >
              <span>Flotraq.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('wp_admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'wp_admin'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>WordPress Plugin Admin</span>
          </button>

          <button
            onClick={() => setActiveTab('cloudflare_worker')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'cloudflare_worker'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Cloudflare Worker Edge</span>
          </button>

          <button
            onClick={() => setActiveTab('laravel_core')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'laravel_core'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Laravel 11 Standalone</span>
          </button>

          <button
            onClick={() => setActiveTab('gitlab_ci')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'gitlab_ci'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>GitLab CI/CD Pipeline</span>
          </button>
        </div>

        {/* Tab 1: WordPress Plugin Admin Screen Preview */}
        {activeTab === 'wp_admin' && (
          <div className="space-y-6 animate-fade-in">
            {/* WordPress Admin Simulator Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="ml-2 font-mono text-slate-400">
                    https://artisan-demo.wp-store.example/wp-admin/admin.php?page=teleshop-connector
                  </span>
                </div>
                <span className="font-semibold text-sky-400">WooCommerce 8.7.0 Active</span>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-white">TeleShop Connector for WooCommerce</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Plugin Version 1.0.0 &bull; Author: <strong className="text-sky-400">Flotraq.com</strong> &bull; Requires WooCommerce 7.0+
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Plugin Connected</span>
                    </span>
                    <button
                      onClick={simulateWpCatalogSync}
                      disabled={isTesting}
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>Test Catalog Sync</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Handshake Code */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🔑 Store Pairing & Handshake</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Enter this code into your Laravel Standalone onboarding wizard to establish end-to-end HMAC synchronization:
                    </p>
                    <div className="my-4 p-4 rounded-lg bg-slate-900 border border-sky-500/30 text-center font-mono text-2xl font-black text-sky-400 tracking-widest flex items-center justify-center gap-3">
                      <span>{handshakeCode}</span>
                      <button
                        onClick={() => copyText(handshakeCode, 'handshake')}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      >
                        {copiedKey === 'handshake' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Refreshes every 2 hours</span>
                      <span className="text-emerald-400 font-medium">Valid until confirmed</span>
                    </div>
                  </div>

                  {/* Card 2: Cloudflare Edge Endpoints */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>⚡ Cloudflare Edge Gateway</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Your WooCommerce store orders & webhooks route through Cloudflare Workers for sub-15ms edge dispatch:
                    </p>
                    <div className="my-3 space-y-2">
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
                        <span className="text-sky-400">Worker/Page:</span> https://wpgram.flotraq.com
                      </div>
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
                        <span className="text-emerald-400">REST:</span> /wp-json/teleshop/v1/products
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ✓ TLS 1.3 Strict Mode
                      </span>
                      <span className="text-[11px] text-sky-400 font-semibold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        wpgram.flotraq.com
                      </span>
                    </div>
                  </div>
                </div>

                {/* REST API Endpoints Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-3 bg-slate-800/50 text-xs font-bold text-slate-300">
                    Exposed WordPress REST API Routes (`/wp-json/teleshop/v1/`)
                  </div>
                  <div className="divide-y divide-slate-800 text-xs">
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-blue-500/20 text-blue-400 font-bold">GET</span>
                        <code className="text-slate-200">/wp-json/teleshop/v1/products</code>
                      </div>
                      <span className="text-slate-400">Returns real-time WooCommerce stock & variations</span>
                    </div>

                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">POST</span>
                        <code className="text-slate-200">/wp-json/teleshop/v1/orders/create-from-telegram</code>
                      </div>
                      <span className="text-slate-400">Creates WooCommerce order with Telegram customer metadata</span>
                    </div>

                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-purple-500/20 text-purple-400 font-bold">POST</span>
                        <code className="text-slate-200">/wp-json/teleshop/v1/orders/&#123;id&#125;/delivery-confirm</code>
                      </div>
                      <span className="text-slate-400">Triggers 3-business-day Stripe Connect payout release</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Cloudflare Worker Edge Gateway */}
        {activeTab === 'cloudflare_worker' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Edge Gateway Latency</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">11 ~ 14 ms</div>
                <span className="text-[11px] text-slate-500">Cloudflare Anycast Network</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Telegram Webhook Throughput</span>
                <div className="text-2xl font-black text-sky-400 mt-1">50,000 req/sec</div>
                <span className="text-[11px] text-slate-500">V8 Serverless Worker</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Deployment Target</span>
                <div className="text-2xl font-black text-purple-400 mt-1">Worker + Pages</div>
                <span className="text-[11px] text-slate-500">Configured in wrangler.toml</span>
              </div>
            </div>

            {/* Live Cloudflare Worker Simulator */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Live Cloudflare Edge Route Tester</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Send synthetic Telegram bot updates or WooCommerce proxy requests to the edge runtime:
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={simulateCloudflareTelegram}
                    disabled={isTesting}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Simulate /shop Command</span>
                  </button>
                </div>
              </div>

              {testResponse && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                  <pre>{testResponse}</pre>
                </div>
              )}
            </div>

            {/* wrangler.toml Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-800/60 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300 font-semibold">wrangler.toml (Cloudflare Configuration)</span>
                <button
                  onClick={() => copyText('name = "teleshop-connector-edge"\nmain = "worker/index.ts"\ncompatibility_date = "2024-09-23"\ncompatibility_flags = ["nodejs_compat"]\n\npages_build_output_dir = "dist"\n\n[assets]\ndirectory = "dist"\n\n[vars]\nENVIRONMENT = "production"\nCUSTOM_DOMAIN = "wpgram.flotraq.com"\nWORDPRESS_STORE_URL = "https://demo-woocommerce.flotraq.dev"\nLARAVEL_API_URL = "https://teleshop-api.flotraq.dev"\nAUTHOR = "Flotraq.com"\n\nroutes = [\n  { pattern = "wpgram.flotraq.com/*", zone_name = "flotraq.com" },\n  { pattern = "wpgram.flotraq.com", custom_domain = true }\n]', 'wrangler')}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedKey === 'wrangler' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy TOML</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-slate-300 bg-slate-950 overflow-x-auto">
{`name = "teleshop-connector-edge"
main = "worker/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

pages_build_output_dir = "dist"

[assets]
directory = "dist"

[vars]
ENVIRONMENT = "production"
CUSTOM_DOMAIN = "wpgram.flotraq.com"
WORDPRESS_STORE_URL = "https://demo-woocommerce.flotraq.dev"
LARAVEL_API_URL = "https://teleshop-api.flotraq.dev"
AUTHOR = "Flotraq.com"

routes = [
  { pattern = "wpgram.flotraq.com/*", zone_name = "flotraq.com" },
  { pattern = "wpgram.flotraq.com", custom_domain = true }
]`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Laravel 11 Standalone Core */}
        {activeTab === 'laravel_core' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-rose-400" />
                <span>Laravel 11 Standalone Architecture Overview</span>
              </h3>
              <p className="text-xs text-slate-300">
                The standalone Laravel engine is fully decoupled from WordPress. It handles persistent multi-tenant merchant accounts, scheduled tasks, high-capacity webhook queues, and the centralized Stripe Connect Marketplace with delivery-based holding rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>Migrations in /laravel/database/migrations</span>
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><code className="text-slate-200">teleshop_tenants</code>: Stores WooCommerce & Shopify credentials with AES-256-GCM.</li>
                  <li><code className="text-slate-200">teleshop_orders</code>: Tracks order states from PENDING_PAYMENT to PAID_OUT.</li>
                  <li><code className="text-slate-200">teleshop_ledger_entries</code>: Double-entry audit ledger for gross, commission, and merchant net.</li>
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Controllers in /laravel/app/Http/Controllers</span>
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><code className="text-slate-200">StripeConnectController</code>: Separate charges & transfers with 3-business-day release.</li>
                  <li><code className="text-slate-200">TelegramWebhookController</code>: High-throughput bot routing and Mini App deep links.</li>
                  <li><code className="text-slate-200">WordPressPluginDemoController</code>: Handshake verification and REST proxy.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: GitLab CI/CD Pipeline */}
        {activeTab === 'gitlab_ci' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <span>GitLab CI/CD Automated Workflow (`.gitlab-ci.yml`)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Pushing to your private GitLab repository automatically executes all 5 stages: test, build Cloudflare Pages dist, package WordPress plugin zip, deploy to Cloudflare Worker, and publish GitLab release.
              </p>
            </div>

            {/* Pipeline Stage Visualizer */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center text-xs font-bold mb-1.5">1</div>
                <span className="text-xs font-bold text-white block">Test</span>
                <span className="text-[10px] text-slate-400">TypeScript & Lint</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 mx-auto flex items-center justify-center text-xs font-bold mb-1.5">2</div>
                <span className="text-xs font-bold text-white block">Build</span>
                <span className="text-[10px] text-slate-400">Vite & Pages Dist</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center text-xs font-bold mb-1.5">3</div>
                <span className="text-xs font-bold text-white block">Package</span>
                <span className="text-[10px] text-slate-400">Plugin .zip Archive</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center text-xs font-bold mb-1.5">4</div>
                <span className="text-xs font-bold text-white block">Deploy</span>
                <span className="text-[10px] text-slate-400">Cloudflare Worker</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-xs font-bold mb-1.5">5</div>
                <span className="text-xs font-bold text-white block">Release</span>
                <span className="text-[10px] text-slate-400">GitLab Assets</span>
              </div>
            </div>

            {/* Copy GitLab commands */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <span className="text-slate-400 font-sans font-semibold block text-xs">Run this to push to your GitLab private repository:</span>
              <pre className="text-sky-300">
{`git init
git add .
git commit -m "feat: complete Laravel standalone, WordPress plugin & Cloudflare deploy by Flotraq.com"
git branch -M main
git remote add origin git@gitlab.com:YOUR_ORGANIZATION/YOUR_PRIVATE_REPO.git
git push -u origin main`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
