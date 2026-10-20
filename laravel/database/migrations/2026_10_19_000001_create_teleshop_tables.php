<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for TeleShop Standalone - Made by Flotraq.com
     */
    public function up(): void
    {
        // 1. Tenants & Stores (WooCommerce, Shopify)
        Schema::create('teleshop_tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('store_type')->default('woocommerce'); // woocommerce or shopify
            $table->string('store_url');
            $table->string('stripe_account_id')->nullable(); // Stripe Connect Custom/Express ID
            $table->string('stripe_charges_enabled')->default(false);
            $table->string('stripe_payouts_enabled')->default(false);
            $table->string('telegram_bot_username')->nullable();
            $table->text('encrypted_telegram_token')->nullable();
            $table->text('encrypted_api_secret')->nullable();
            $table->integer('commission_bps')->default(500); // 5.0%
            $table->integer('fixed_fee_cents')->default(30); // $0.30
            $table->integer('holding_period_business_days')->default(3); // Shopee-style 3 business days
            $table->timestamps();
        });

        // 2. Orders & Delivery-Confirmed Payout Tracking
        Schema::create('teleshop_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('teleshop_tenants')->cascadeOnDelete();
            $table->string('order_number');
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->bigInteger('telegram_chat_id')->nullable();
            $table->string('source')->default('telegram_mini_app');
            $table->decimal('total_amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->decimal('platform_commission', 12, 2)->default(0.00);
            $table->decimal('merchant_net_proceeds', 12, 2)->default(0.00);
            
            // Financial & Delivery States
            $table->enum('order_state', [
                'PENDING_PAYMENT',
                'PAID',
                'PROCESSING',
                'SHIPPED',
                'DELIVERED',
                'DELIVERY_CONFIRMED',
                'RELEASE_PENDING',
                'TRANSFER_PROCESSING',
                'TRANSFERRED',
                'PAYOUT_PROCESSING',
                'PAID_OUT',
                'PAYMENT_FAILED',
                'CANCELLED',
                'REFUNDED',
                'DISPUTED'
            ])->default('PENDING_PAYMENT');

            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_transfer_id')->nullable();
            $table->string('tracking_carrier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('delivery_confirmed_at')->nullable();
            $table->timestamp('release_eligible_at')->nullable();
            $table->timestamp('transferred_at')->nullable();
            $table->timestamps();
        });

        // 3. Immutable Financial Ledger
        Schema::create('teleshop_ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('order_id')->constrained('teleshop_orders');
            $table->foreignUuid('tenant_id')->constrained('teleshop_tenants');
            $table->string('entry_type'); // charge, commission, transfer, reversal, refund
            $table->integer('amount_cents');
            $table->string('currency', 3);
            $table->string('stripe_reference_id')->nullable();
            $table->text('description');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teleshop_ledger_entries');
        Schema::dropIfExists('teleshop_orders');
        Schema::dropIfExists('teleshop_tenants');
    }
};
