<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * TelegramWebhookController
 * High-speed webhook handler for incoming Telegram Bot commands and Mini App data.
 * Made by Flotraq.com
 */
class TelegramWebhookController extends Controller
{
    public function handle(Request $request, string $tenant_id): JsonResponse
    {
        $update = $request->json()->all();
        $message = $update['message'] ?? [];
        $text = $message['text'] ?? '';
        $chatId = $message['chat']['id'] ?? null;
        $username = $message['from']['username'] ?? 'User';

        $reply = "Hello {$username}! Welcome to our store. Use /shop to open our Telegram Mini App.";

        if ($text === '/start') {
            $reply = "Welcome to our store! Browse curated artisan products and checkout securely via Stripe Connect.";
        } elseif ($text === '/shop') {
            $reply = "Tap the button below to launch our full Mini App storefront with real-time stock sync.";
        }

        return response()->json([
            'ok' => true,
            'tenant_id' => $tenant_id,
            'processed_by' => 'Laravel Standalone Engine',
            'chat_id' => $chatId,
            'reply' => $reply,
            'handled_at' => now()->toISOString(),
        ]);
    }

    public function handleSimulatedUpdate(Request $request): JsonResponse
    {
        return response()->json([
            'ok' => true,
            'status' => 'simulated_success',
            'author' => 'Flotraq.com',
            'time' => now()->toISOString(),
        ]);
    }
}
