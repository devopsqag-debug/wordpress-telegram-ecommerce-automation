<?php
/**
 * Plugin Name: TeleShop Connector for WooCommerce
 * Plugin URI: https://teleshop.connector.dev
 * Description: Official companion plugin for TeleShop Connector. Connects WooCommerce stores to Telegram bots and Telegram Mini App storefronts.
 * Version: 1.0.0
 * Author: TeleShop Engineering
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * License: Apache-2.0
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class TeleShop_WooCommerce_Connector {
    const OPTION_SECRET = 'teleshop_connector_secret';
    const OPTION_TENANT = 'teleshop_connector_tenant_id';
    const REST_NAMESPACE = 'teleshop/v1';

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('woocommerce_new_order', array($this, 'on_order_created'), 10, 1);
        add_action('woocommerce_order_status_changed', array($this, 'on_order_status_changed'), 10, 4);
    }

    /**
     * Register REST API routes for TeleShop Adapter
     */
    public function register_rest_routes() {
        // GET /wp-json/teleshop/v1/verify
        register_rest_route(self::REST_NAMESPACE, '/verify', array(
            'methods' => 'POST',
            'callback' => array($this, 'verify_connection'),
            'permission_callback' => '__return_true',
        ));

        // GET /wp-json/teleshop/v1/products
        register_rest_route(self::REST_NAMESPACE, '/products', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_products'),
            'permission_callback' => array($this, 'check_auth'),
        ));

        // POST /wp-json/teleshop/v1/cart
        register_rest_route(self::REST_NAMESPACE, '/cart', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_cart'),
            'permission_callback' => array($this, 'check_auth'),
        ));

        // GET /wp-json/teleshop/v1/orders
        register_rest_route(self::REST_NAMESPACE, '/orders', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_orders'),
            'permission_callback' => array($this, 'check_auth'),
        ));

        // POST /wp-json/teleshop/v1/webhooks/register
        register_rest_route(self::REST_NAMESPACE, '/webhooks/register', array(
            'methods' => 'POST',
            'callback' => array($this, 'register_webhooks'),
            'permission_callback' => array($this, 'check_auth'),
        ));
    }

    /**
     * Validate X-TeleShop-Secret header
     */
    public function check_auth($request) {
        $client_secret = $request->get_header('X-TeleShop-Secret');
        $stored_secret = get_option(self::OPTION_SECRET);
        if (empty($stored_secret) || empty($client_secret)) {
            return new WP_Error('unauthorized', 'Invalid TeleShop Secret Header', array('status' => 401));
        }
        return hash_equals($stored_secret, $client_secret);
    }

    /**
     * Handshake verification during Wizard Step 3B
     */
    public function verify_connection($request) {
        $params = $request->get_json_params();
        $code = sanitize_text_field($params['connection_code'] ?? '');
        $stored_code = get_transient('teleshop_connection_code');

        if ($code && $stored_code && hash_equals($stored_code, $code)) {
            $secret = bin2hex(random_bytes(32));
            update_option(self::OPTION_SECRET, $secret);
            delete_transient('teleshop_connection_code');

            $products_count = wp_count_posts('product')->publish ?? 0;

            return rest_ensure_response(array(
                'status' => 'verified',
                'site_name' => get_bloginfo('name'),
                'site_url' => get_site_url(),
                'product_count' => (int)$products_count,
                'secret' => $secret,
            ));
        }

        return new WP_Error('invalid_code', 'Connection code is invalid or has expired', array('status' => 400));
    }

    /**
     * Return formatted product catalog for Telegram Mini App
     */
    public function get_products($request) {
        $per_page = (int)($request->get_param('per_page') ?: 20);
        $search = sanitize_text_field($request->get_param('search') ?: '');

        $args = array(
            'status' => 'publish',
            'limit' => $per_page,
            's' => $search,
        );

        $products = wc_get_products($args);
        $items = array();

        foreach ($products as $p) {
            $items[] = array(
                'id' => (string)$p->get_id(),
                'title' => $p->get_name(),
                'description' => wp_strip_all_tags($p->get_short_description() ?: $p->get_description()),
                'handle' => $p->get_slug(),
                'price' => (float)$p->get_price(),
                'currency' => get_woocommerce_currency(),
                'images' => array(wp_get_attachment_url($p->get_image_id()) ?: ''),
                'tags' => wp_get_post_terms($p->get_id(), 'product_tag', array('fields' => 'names')),
                'category' => wp_get_post_terms($p->get_id(), 'product_cat', array('fields' => 'names'))[0] ?? 'General',
                'totalInventory' => (int)($p->get_stock_quantity() ?? 99),
            );
        }

        return rest_ensure_response(array('data' => $items, 'has_more' => count($items) >= $per_page));
    }

    public function create_cart($request) {
        $params = $request->get_json_params();
        $cart_id = 'wc_' . wp_generate_uuid4();
        return rest_ensure_response(array(
            'cart' => array(
                'id' => $cart_id,
                'checkoutUrl' => wc_get_checkout_url() . '?teleshop_cart=' . $cart_id,
                'subtotal' => 0.00,
            )
        ));
    }

    public function get_orders($request) {
        $orders = wc_get_orders(array('limit' => 20, 'orderby' => 'date', 'order' => 'DESC'));
        $data = array();
        foreach ($orders as $order) {
            $data[] = array(
                'id' => (string)$order->get_id(),
                'orderNumber' => '#' . $order->get_order_number(),
                'total' => (float)$order->get_total(),
                'currency' => $order->get_currency(),
                'financialStatus' => $order->is_paid() ? 'paid' : 'pending',
                'fulfillmentStatus' => $order->get_status() === 'completed' ? 'delivered' : 'unfulfilled',
                'createdAt' => $order->get_date_created()->date('c'),
            );
        }
        return rest_ensure_response(array('orders' => $data));
    }

    public function register_webhooks($request) {
        $params = $request->get_json_params();
        update_option('teleshop_webhook_url', esc_url_raw($params['target_url'] ?? ''));
        return rest_ensure_response(array('success' => true, 'webhook_ids' => array('wc_wh_' . time())));
    }

    public function on_order_created($order_id) {
        $webhook_url = get_option('teleshop_webhook_url');
        if (!$webhook_url) return;
        $order = wc_get_order($order_id);
        if (!$order) return;

        wp_remote_post($webhook_url, array(
            'headers' => array('Content-Type' => 'application/json', 'X-WC-Webhook-Source' => get_site_url()),
            'body' => json_encode(array(
                'event' => 'order.created',
                'order_id' => $order_id,
                'order_number' => $order->get_order_number(),
                'total' => $order->get_total(),
                'currency' => $order->get_currency(),
            )),
            'timeout' => 5,
        ));
    }

    public function on_order_status_changed($order_id, $old_status, $new_status, $order) {
        $webhook_url = get_option('teleshop_webhook_url');
        if (!$webhook_url) return;

        wp_remote_post($webhook_url, array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode(array(
                'event' => 'order.updated',
                'order_id' => $order_id,
                'status' => $new_status,
            )),
            'timeout' => 5,
        ));
    }

    public function add_admin_menu() {
        add_submenu_page(
            'woocommerce',
            'TeleShop Connector',
            'TeleShop Connector',
            'manage_woocommerce',
            'teleshop-connector',
            array($this, 'render_admin_page')
        );
    }

    public function render_admin_page() {
        if (!get_transient('teleshop_connection_code')) {
            set_transient('teleshop_connection_code', strtoupper(wp_generate_password(8, false)), 3600);
        }
        $code = get_transient('teleshop_connection_code');
        echo '<div class="wrap">';
        echo '<h1>TeleShop Connector</h1>';
        echo '<p>Paste this Connection Code into your TeleShop Mobile App Setup Wizard (Step 3B):</p>';
        echo '<div style="background:#fff;padding:15px;border:1px solid #ccd0d4;font-size:24px;font-family:monospace;letter-spacing:4px;display:inline-block;"><strong>' . esc_html($code) . '</strong></div>';
        echo '</div>';
    }
}

new TeleShop_WooCommerce_Connector();
