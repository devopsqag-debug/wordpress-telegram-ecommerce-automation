<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Class WordPressPluginDemoController
 * Handles WordPress WooCommerce plugin communication, demo status, and edge syncing.
 * Built by Flotraq.com
 */
class WordPressPluginDemoController extends Controller
{
    /**
     * System health check for Cloudflare Worker & GitLab CI integration.
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'engine' => 'Laravel 11 Standalone',
            'edge_runtime' => 'Cloudflare Worker / Pages',
            'project' => 'TeleShop Connector',
            'author' => 'Flotraq.com',
            'timestamp' => now()->toISOString(),
            'version' => '1.0.0',
            'database' => 'connected',
            'redis_queue' => 'active',
        ]);
    }

    /**
     * Flotraq.com agency engineering details.
     */
    public function flotraqInfo(): JsonResponse
    {
        return response()->json([
            'made_by' => 'Flotraq.com',
            'site' => 'https://flotraq.com',
            'description' => 'Enterprise full-stack and cloud automation architecture by Flotraq.',
            'capabilities' => [
                'Laravel Standalone Microservices & Core Platforms',
                'Custom WordPress / WooCommerce Companion Plugins',
                'Cloudflare Workers / Pages Edge Deployment',
                'Telegram Bot & Mini App Interactive Storefronts',
                'Stripe Connect Marketplace & Delivery-Confirmed Escrow-Style Holding Engine',
                'GitLab CI/CD Automated Pipelines with Multi-Environment Deployment',
            ],
            'gitlab_repo_ready' => true,
            'cloudflare_deploy_ready' => true,
        ]);
    }

    /**
     * Handle handshake verification from the WooCommerce Plugin.
     */
    public function verifyHandshake(Request $request): JsonResponse
    {
        $code = $request->input('connection_code');
        $siteUrl = $request->input('site_url', 'https://demo-store.example.com');

        if (empty($code)) {
            return response()->json([
                'success' => false,
                'message' => 'Missing connection code',
            ], 400);
        }

        $secret = bin2hex(random_bytes(32));

        return response()->json([
            'success' => true,
            'status' => 'verified',
            'site_url' => $siteUrl,
            'site_name' => 'Demo Artisan Store (WooCommerce)',
            'teleshop_secret' => $secret,
            'webhook_endpoint' => url('/api/v1/wp-bridge/orders'),
            'catalog_synced' => true,
            'products_count' => 14,
            'message' => 'Successfully connected WooCommerce with TeleShop Laravel Backend via Cloudflare Edge',
        ]);
    }

    /**
     * Return demo state and live stats for the WordPress Plugin simulation.
     */
    public function getDemoState(): JsonResponse
    {
        return response()->json([
            'plugin' => [
                'name' => 'TeleShop Connector for WooCommerce',
                'version' => '1.0.0',
                'author' => 'Flotraq.com',
                'status' => 'Active',
                'connected_store' => 'Artisan Goods & Apparel (WooCommerce 8.7+)',
                'store_url' => 'https://artisan-demo.wp-store.example',
                'rest_namespace' => 'teleshop/v1',
                'active_secret' => 'sk_live_wc_teleshop_b3a88f729e1',
            ],
            'cloudflare_edge' => [
                'worker_url' => 'https://teleshop-worker.flotraq.workers.dev',
                'pages_url' => 'https://teleshop-wp-demo.pages.dev',
                'edge_region' => 'Cloudflare Anycast (Asia-Pacific / North America)',
                'latency_ms' => 14,
                'ssl' => 'Strict TLS 1.3',
            ],
            'gitlab_ci' => [
                'repo' => 'gitlab.com/flotraq-private/teleshop-connector',
                'pipeline_status' => 'passed',
                'last_commit' => 'feat(wp-cloudflare): package wordpress plugin and deploy worker demo',
                'artifacts' => [
                    'teleshop-woocommerce-connector-v1.0.0.zip',
                    'cloudflare-pages-dist.tar.gz',
                ],
            ],
        ]);
    }

    /**
     * Sync products catalog from WooCommerce.
     */
    public function syncProducts(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'total' => 4,
            'products' => [
                [
                    'id' => 'wc_101',
                    'title' => 'Handcrafted Ceramic Pour-Over Dripper',
                    'price' => 38.00,
                    'currency' => 'USD',
                    'stock' => 15,
                    'status' => 'publish',
                    'image' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
                    'telegram_mini_app_url' => 'https://t.me/teleshop_demo_bot/shop?startapp=prod_wc_101',
                ],
                [
                    'id' => 'wc_102',
                    'title' => 'Single-Origin Ethiopian Yirgacheffe Beans (250g)',
                    'price' => 22.00,
                    'currency' => 'USD',
                    'stock' => 42,
                    'status' => 'publish',
                    'image' => 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80',
                    'telegram_mini_app_url' => 'https://t.me/teleshop_demo_bot/shop?startapp=prod_wc_102',
                ],
                [
                    'id' => 'wc_103',
                    'title' => 'Minimalist Heavy Canvas Tote (Ecru)',
                    'price' => 34.00,
                    'currency' => 'USD',
                    'stock' => 28,
                    'status' => 'publish',
                    'image' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
                    'telegram_mini_app_url' => 'https://t.me/teleshop_demo_bot/shop?startapp=prod_wc_103',
                ],
                [
                    'id' => 'wc_104',
                    'title' => 'Japanese Precision Gooseneck Kettle (Matte Black)',
                    'price' => 65.00,
                    'currency' => 'USD',
                    'stock' => 9,
                    'status' => 'publish',
                    'image' => 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
                    'telegram_mini_app_url' => 'https://t.me/teleshop_demo_bot/shop?startapp=prod_wc_104',
                ],
            ],
        ]);
    }
}
