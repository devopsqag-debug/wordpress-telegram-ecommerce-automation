/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EcomPlatform = 'shopify' | 'woocommerce';
export type AdminRole = 'owner' | 'staff' | 'viewer';

export interface TenantState {
  tenantId: string;
  storeName: string;
  platform: EcomPlatform | null;
  currency: string;
  productCount: number;
  siteUrl?: string;
  adminAccessToken?: string;
  storefrontAccessToken?: string;
  connectionCode?: string;
  botUsername: string;
  botToken: string;
  botId: string;
  features: {
    miniAppStorefront: boolean;
    orderAlerts: boolean;
    abandonedCartRecovery: boolean;
    customerTracking: boolean;
    aiQa: boolean;
  };
  language: string;
  isLive: boolean;
  webhookUrl: string;
  adminRole: AdminRole;
  recoveryTimerHours: number;
  lowStockThreshold: number;
}

export interface BroadcastItem {
  id: string;
  title: string;
  content: string;
  scheduledFor?: string;
  segment: 'all' | 'repeat_buyers' | 'vip_spenders' | 'inactive';
  sentAt?: string;
  deliveredCount: number;
  status: 'draft' | 'scheduled' | 'sent';
}

export interface SupportTicketItem {
  id: string;
  customerName: string;
  telegramUsername?: string;
  chatId: number;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ReviewItem {
  id: string;
  orderNumber: string;
  customerName: string;
  rating: number; // 1-5
  comment?: string;
  date: string;
}
