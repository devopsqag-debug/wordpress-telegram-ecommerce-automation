/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  inventoryQuantity: number;
  availableForSale: boolean;
  selectedOptions?: Array<{ name: string; value: string }>;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  handle: string;
  price: number;
  currency: string;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  category: string;
  totalInventory: number;
  vendor?: string;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  unitPrice: number;
  image?: string;
}

export interface Cart {
  id: string;
  tenantId: string;
  telegramChatId: number;
  telegramUserId: number;
  items: CartItem[];
  subtotal: number;
  currency: string;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'abandoned' | 'converted';
  checkoutUrl?: string;
  recoveryNudgeSent?: boolean;
}

export interface CheckoutResult {
  checkoutUrl: string;
  expiresAt?: string;
  paymentProvider: 'shopify_web' | 'telegram_native_invoice' | 'woocommerce_hosted';
  invoiceDetails?: {
    title: string;
    description: string;
    payload: string;
    providerToken: string;
    currency: string;
    prices: Array<{ label: string; amount: number }>;
  };
}

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  source: 'telegram_bot' | 'web_storefront' | 'pos';
  customer: {
    name: string;
    email?: string;
    phone?: string;
    telegramChatId?: number;
    telegramUsername?: string;
    shippingAddress?: {
      address1: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
  items: OrderItem[];
  total: number;
  currency: string;
  financialStatus: 'paid' | 'pending' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'fulfilled' | 'in_transit' | 'delivered';
  trackingNumber?: string;
  trackingCompany?: string;
  trackingUrl?: string;
  createdAt: string;
  feedbackRequested?: boolean;
  rating?: number;
}

export interface InventoryLevel {
  productId: string;
  variantId: string;
  sku?: string;
  title: string;
  available: number;
  lowStockThreshold: number;
  isLowStock: boolean;
}

export interface WebhookRegistrationResult {
  success: boolean;
  webhookIds: string[];
  topicsRegistered: string[];
}

/**
 * Universal PlatformAdapter Interface
 * Defines platform-native e-commerce integration for Shopify and WooCommerce
 */
export interface PlatformAdapter {
  readonly platformName: 'shopify' | 'woocommerce';
  
  // Catalog & Product search
  fetchProducts(limit?: number, cursor?: string, query?: string): Promise<{ products: Product[]; hasNextPage: boolean }>;
  fetchProduct(productId: string): Promise<Product | null>;
  
  // Cart & Checkout
  createCart(items: Array<{ variantId: string; quantity: number }>, customerInfo?: { telegramChatId?: number; email?: string }): Promise<Cart>;
  getCheckoutUrl(cartId: string, items: CartItem[], telegramChatId?: number): Promise<CheckoutResult>;
  
  // Orders & Tracking
  fetchOrders(params?: { limit?: number; customerEmail?: string; orderNumber?: string }): Promise<Order[]>;
  fetchOrderById(orderIdOrNumber: string): Promise<Order | null>;
  
  // Webhooks & Inventory
  registerWebhooks(targetWebhookUrl: string, secret: string): Promise<WebhookRegistrationResult>;
  checkInventory(variantIds: string[]): Promise<InventoryLevel[]>;
}
