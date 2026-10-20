<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TelegramWebhookController;
use App\Http\Controllers\StripeConnectController;
use App\Http\Controllers\WordPressPluginDemoController;

/*
|--------------------------------------------------------------------------
| TeleShop Connector API Routes - Made by Flotraq.com
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Health & System Info
    Route::get('/health', [WordPressPluginDemoController::class, 'health']);
    Route::get('/flotraq-info', [WordPressPluginDemoController::class, 'flotraqInfo']);

    // Cloudflare Edge & Telegram Webhook
    Route::post('/webhooks/telegram/{tenant_id}', [TelegramWebhookController::class, 'handle']);
    Route::post('/webhooks/telegram-test', [TelegramWebhookController::class, 'handleSimulatedUpdate']);

    // Stripe Connect Marketplace & Delivery Confirmed Payouts
    Route::post('/stripe/webhook', [StripeConnectController::class, 'handleWebhook']);
    Route::post('/stripe/create-checkout', [StripeConnectController::class, 'createCheckoutSession']);
    Route::post('/stripe/confirm-delivery', [StripeConnectController::class, 'confirmDelivery']);
    Route::get('/stripe/transfers/pending-release', [StripeConnectController::class, 'getPendingReleases']);
    Route::post('/stripe/transfers/process-batch', [StripeConnectController::class, 'processBatchTransfers']);
    Route::get('/stripe/merchant/finance-summary', [StripeConnectController::class, 'getMerchantFinanceSummary']);

    // WordPress Plugin Bridge & WooCommerce Catalog Sync
    Route::prefix('wp-bridge')->group(function () {
        Route::post('/handshake', [WordPressPluginDemoController::class, 'verifyHandshake']);
        Route::get('/products', [WordPressPluginDemoController::class, 'syncProducts']);
        Route::post('/orders', [WordPressPluginDemoController::class, 'createTelegramOrder']);
        Route::post('/orders/{order_id}/status', [WordPressPluginDemoController::class, 'updateOrderStatus']);
        Route::get('/demo-state', [WordPressPluginDemoController::class, 'getDemoState']);
    });
});
