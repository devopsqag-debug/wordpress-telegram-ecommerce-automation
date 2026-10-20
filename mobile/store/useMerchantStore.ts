/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { AdminRole, BroadcastItem, EcomPlatform, FaqItem, ReviewItem, SupportTicketItem, TenantState } from '../types.ts';
import { Order } from '@/adapters/types.ts';

interface MerchantStore {
  // Wizard State
  wizardStep: number;
  setWizardStep: (step: number) => void;

  // Tenant / Config State
  tenant: TenantState;
  updateTenant: (partial: Partial<TenantState>) => void;
  setPlatform: (platform: EcomPlatform) => void;
  setAdminRole: (role: AdminRole) => void;

  // Orders State (Benefit 1, 13, 15, 26)
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderFulfillment: (orderId: string, status: Order['fulfillmentStatus'], trackingNum?: string) => void;

  // Abandoned Carts (Benefit 2)
  abandonedCarts: Array<{
    id: string;
    customerName: string;
    itemsSummary: string;
    amount: number;
    hoursAgo: number;
    nudged: boolean;
  }>;
  triggerCartRecoveryNudge: (cartId: string) => void;

  // Marketing & Broadcasts (Benefit 20, 21, 23)
  broadcasts: BroadcastItem[];
  addBroadcast: (broadcast: Omit<BroadcastItem, 'id' | 'deliveredCount' | 'status'>) => void;

  // FAQs (Benefit 14)
  faqs: FaqItem[];
  addFaq: (faq: Omit<FaqItem, 'id'>) => void;
  removeFaq: (id: string) => void;

  // Support Escalations (Benefit 16, 17)
  supportTickets: SupportTicketItem[];
  resolveTicket: (id: string) => void;

  // Customer Reviews (Benefit 19)
  reviews: ReviewItem[];

  // DLQ / Webhook Retries (Benefit 28)
  dlqEvents: Array<{
    id: string;
    topic: string;
    attempt: number;
    lastError: string;
    status: 'pending_retry' | 'resolved' | 'dead_lettered';
    timestamp: string;
  }>;
  retryDlqEvent: (id: string) => void;

  // Notifications (Benefit 1, 4)
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'order' | 'stock' | 'system';
    timestamp: string;
    read: boolean;
  }>;
  markNotificationsAsRead: () => void;
  addNotification: (title: string, message: string, type: 'order' | 'stock' | 'system') => void;
}

const initialTenant: TenantState = {
  tenantId: 'tenant_demo_shop',
  storeName: 'Artisan Goods & Co.',
  platform: 'shopify',
  currency: 'USD',
  productCount: 24,
  siteUrl: 'https://artisangoods.myshopify.com',
  botUsername: 'ArtisanGoodsShopBot',
  botToken: '7289192418:AAFk192_sample_demo_token',
  botId: 'bot_728919',
  features: {
    miniAppStorefront: true,
    orderAlerts: true,
    abandonedCartRecovery: true,
    customerTracking: true,
    aiQa: false,
  },
  language: 'en',
  isLive: true,
  webhookUrl: 'https://teleshop.connector.dev/api/webhooks/telegram?tenant=tenant_demo_shop',
  adminRole: 'owner',
  recoveryTimerHours: 2,
  lowStockThreshold: 5,
};

const initialOrders: Order[] = [
  {
    id: '1042',
    orderNumber: '#1042',
    source: 'telegram_bot',
    customer: {
      name: 'Elena Rostova',
      email: 'elena@telegram.org',
      telegramChatId: 88219412,
      telegramUsername: 'elena_r',
      shippingAddress: {
        address1: '450 Sutter St Suite 12',
        city: 'San Francisco',
        postalCode: '94108',
        country: 'US',
      },
    },
    items: [{ id: '1', title: 'Minimalist Canvas Tote (Natural Ecru)', quantity: 1, price: 34.00 }],
    total: 34.00,
    currency: 'USD',
    financialStatus: 'paid',
    fulfillmentStatus: 'in_transit',
    trackingNumber: '9400111899223190821',
    trackingCompany: 'USPS Priority',
    trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899223190821',
    createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    feedbackRequested: true,
    rating: 5,
  },
  {
    id: '1041',
    orderNumber: '#1041',
    source: 'telegram_bot',
    customer: {
      name: 'David Kim',
      email: 'david@kinto.dev',
      telegramChatId: 9182390,
      telegramUsername: 'dkim_sf',
      shippingAddress: {
        address1: '782 Market St',
        city: 'San Francisco',
        postalCode: '94103',
        country: 'US',
      },
    },
    items: [
      { id: '2', title: 'Japanese Ceramic Pour-Over Dripper', quantity: 1, price: 42.50 },
      { id: '3', title: 'Waffle Knit Overshirt', quantity: 1, price: 88.00 },
    ],
    total: 130.50,
    currency: 'USD',
    financialStatus: 'paid',
    fulfillmentStatus: 'delivered',
    createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    rating: 5,
  },
  {
    id: '1040',
    orderNumber: '#1040',
    source: 'web_storefront',
    customer: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@gmail.com',
    },
    items: [{ id: '1', title: 'Minimalist Canvas Tote', quantity: 2, price: 68.00 }],
    total: 68.00,
    currency: 'USD',
    financialStatus: 'paid',
    fulfillmentStatus: 'delivered',
    createdAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
];

export const useMerchantStore = create<MerchantStore>((set, get) => ({
  wizardStep: 6, // default to live dashboard, with instant ability to re-enter wizard from step 1
  setWizardStep: (step) => set({ wizardStep: step }),

  tenant: initialTenant,
  updateTenant: (partial) =>
    set((state) => ({
      tenant: { ...state.tenant, ...partial },
    })),
  setPlatform: (platform) =>
    set((state) => ({
      tenant: { ...state.tenant, platform },
    })),
  setAdminRole: (role) =>
    set((state) => ({
      tenant: { ...state.tenant, adminRole: role },
    })),

  orders: initialOrders,
  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
      notifications: [
        {
          id: `notif_${Date.now()}`,
          title: `New Order ${order.orderNumber}!`,
          message: `${order.customer.name} placed an order for $${order.total.toFixed(2)} via ${order.source === 'telegram_bot' ? 'Telegram' : 'Web'}.`,
          type: 'order',
          timestamp: 'Just now',
          read: false,
        },
        ...state.notifications,
      ],
    })),
  updateOrderFulfillment: (orderId, status, trackingNum) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              fulfillmentStatus: status,
              trackingNumber: trackingNum || o.trackingNumber,
            }
          : o
      ),
    })),

  abandonedCarts: [
    {
      id: 'cart_rec_01',
      customerName: 'Maya Lin (@mayal)',
      itemsSummary: 'Waffle Knit Overshirt (x1)',
      amount: 88.00,
      hoursAgo: 2.4,
      nudged: false,
    },
    {
      id: 'cart_rec_02',
      customerName: 'Carlos Morales',
      itemsSummary: 'Minimalist Canvas Tote (x1)',
      amount: 34.00,
      hoursAgo: 3.1,
      nudged: true,
    },
  ],
  triggerCartRecoveryNudge: (cartId) =>
    set((state) => ({
      abandonedCarts: state.abandonedCarts.map((c) =>
        c.id === cartId ? { ...c, nudged: true } : c
      ),
      notifications: [
        {
          id: `notif_nudge_${Date.now()}`,
          title: 'Recovery Nudge Sent',
          message: `Telegram nudge with 5% discount dispatched to ${state.abandonedCarts.find((c) => c.id === cartId)?.customerName}.`,
          type: 'system',
          timestamp: 'Just now',
          read: false,
        },
        ...state.notifications,
      ],
    })),

  broadcasts: [
    {
      id: 'bc_01',
      title: 'Mid-Season Restock & Free Shipping',
      content: '⚡ Restock alert! Canvas totes and ceramic drippers are back in stock. Free shipping this weekend with code SHIPFREE.',
      segment: 'all',
      sentAt: '2 days ago',
      deliveredCount: 412,
      status: 'sent',
    },
  ],
  addBroadcast: (bc) =>
    set((state) => ({
      broadcasts: [
        {
          ...bc,
          id: `bc_${Date.now()}`,
          status: 'sent',
          deliveredCount: 385,
        },
        ...state.broadcasts,
      ],
    })),

  faqs: [
    {
      id: 'faq_1',
      question: 'When will my order ship?',
      answer: 'All orders ship within 24 hours Monday through Friday via USPS or UPS.',
      category: 'Shipping',
    },
    {
      id: 'faq_2',
      question: 'What is your return policy?',
      answer: 'We offer hassle-free 30-day returns. Type /refund anytime to request a prepaid label.',
      category: 'Returns',
    },
    {
      id: 'faq_3',
      question: 'How do loyalty points work?',
      answer: 'Earn 5 points for every $1 spent. 100 points = $5 discount at checkout!',
      category: 'Loyalty',
    },
  ],
  addFaq: (faq) =>
    set((state) => ({
      faqs: [{ ...faq, id: `faq_${Date.now()}` }, ...state.faqs],
    })),
  removeFaq: (id) =>
    set((state) => ({
      faqs: state.faqs.filter((f) => f.id !== id),
    })),

  supportTickets: [
    {
      id: 'tick_101',
      customerName: 'Alex Thorne',
      telegramUsername: 'athorne',
      chatId: 781923,
      subject: 'Exchange size request for Waffle Knit Overshirt',
      message: 'Hello! I ordered Large but would like to exchange for Medium before shipment.',
      status: 'open',
      createdAt: '45m ago',
    },
  ],
  resolveTicket: (id) =>
    set((state) => ({
      supportTickets: state.supportTickets.map((t) =>
        t.id === id ? { ...t, status: 'resolved' } : t
      ),
    })),

  reviews: [
    {
      id: 'rev_1',
      orderNumber: '#1042',
      customerName: 'Elena Rostova',
      rating: 5,
      comment: 'Arrived super fast! The canvas tote quality exceeded my expectations. Buying another for my sister.',
      date: 'Yesterday',
    },
    {
      id: 'rev_2',
      orderNumber: '#1041',
      customerName: 'David Kim',
      rating: 5,
      comment: 'The ceramic dripper brews the best morning cup. Checkout in Telegram was literally 10 seconds.',
      date: '3 days ago',
    },
  ],

  dlqEvents: [
    {
      id: 'dlq_evt_991',
      topic: 'orders/create',
      attempt: 1,
      lastError: 'HTTP 503 Service Unavailable (Shopify store maintenance window)',
      status: 'pending_retry',
      timestamp: '12m ago',
    },
  ],
  retryDlqEvent: (id) =>
    set((state) => ({
      dlqEvents: state.dlqEvents.map((e) =>
        e.id === id ? { ...e, status: 'resolved' } : e
      ),
      notifications: [
        {
          id: `notif_dlq_${Date.now()}`,
          title: 'DLQ Webhook Reprocessed',
          message: `Webhook ${id} successfully delivered on retry attempt.`,
          type: 'system',
          timestamp: 'Just now',
          read: false,
        },
        ...state.notifications,
      ],
    })),

  notifications: [
    {
      id: 'notif_1',
      title: 'New Order #1042',
      message: 'Elena Rostova placed an order for $34.00 via Telegram Bot.',
      type: 'order',
      timestamp: '3 hours ago',
      read: true,
    },
    {
      id: 'notif_2',
      title: 'Low Stock Alert',
      message: 'Ceramic Pour-Over Dripper (Matte White) has only 3 units left!',
      type: 'stock',
      timestamp: '5 hours ago',
      read: false,
    },
  ],
  markNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  addNotification: (title, message, type) =>
    set((state) => ({
      notifications: [
        {
          id: `notif_${Date.now()}`,
          title,
          message,
          type,
          timestamp: 'Just now',
          read: false,
        },
        ...state.notifications,
      ],
    })),
}));
