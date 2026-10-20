/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { 
  OrderPaymentState, OrderFinancialLedger, 
  StripeConnectedAccount, DeliveryEvidence, 
  PaymentAuditLog, WebhookEventRecord, 
  DisputeRecord, BusinessDayConfig 
} from '@/backend/stripe/types.ts';
import { calculateReleaseEligibilityDate, isTransferEligibleNow, DEFAULT_PLATFORM_HOLIDAYS } from '@/backend/stripe/businessDayCalculator.ts';
import { validateStateTransition } from '@/backend/stripe/stateMachine.ts';

export interface MarketplaceOrder {
  id: string;
  orderNumber: string;
  tenantId: string;
  merchantStoreName: string;
  customerName: string;
  customerEmail: string;
  state: OrderPaymentState;
  itemsSummary: string;
  ledger: OrderFinancialLedger;
  deliveryEvidence?: DeliveryEvidence;
  dispute?: DisputeRecord;
  createdAt: string;
}

interface PaymentsStore {
  // Platform Configuration
  isConfigured: boolean;
  isTestMode: boolean;
  commissionRateBps: number;
  fixedFeeCents: number;
  holdingPeriodBusinessDays: number;
  holidays: string[];
  simulatedClockOffsetDays: number; // for time travel testing

  // State Collections
  connectedAccounts: Record<string, StripeConnectedAccount>;
  orders: MarketplaceOrder[];
  disputes: DisputeRecord[];
  auditLogs: PaymentAuditLog[];
  webhookLogs: WebhookEventRecord[];
  processedWebhookIds: Set<string>;

  // Configuration Actions
  updatePlatformSettings: (settings: {
    commissionRateBps?: number;
    fixedFeeCents?: number;
    holdingPeriodBusinessDays?: number;
    isTestMode?: boolean;
    isConfigured?: boolean;
  }) => void;
  advanceSimulatedClock: (days: number) => void;
  resetSimulatedClock: () => void;

  // Merchant Account Actions
  onboardMerchantAccount: (tenantId: string, businessName: string, email: string) => StripeConnectedAccount;
  updateAccountStatus: (tenantId: string, status: StripeConnectedAccount['status']) => void;

  // Order Lifecycle Actions
  createOrderWithPaymentIntent: (order: {
    orderNumber: string;
    tenantId: string;
    merchantStoreName: string;
    customerName: string;
    customerEmail: string;
    grossAmountCents: number;
    itemsSummary: string;
  }) => MarketplaceOrder;

  confirmDelivery: (orderId: string, evidence: DeliveryEvidence) => void;
  executeTransfer: (orderId: string) => { success: boolean; error?: string };
  triggerPayout: (orderId: string) => void;
  issueRefund: (orderId: string, amountCents: number, reason: string) => void;
  openDispute: (orderId: string, reason: DisputeRecord['reason'], notes: string) => void;
  resolveDispute: (disputeId: string, outcome: DisputeRecord['resolutionOutcome']) => void;

  // Webhook Testing Actions
  dispatchWebhookEvent: (eventType: string, eventId: string, payload: Record<string, any>) => {
    isDuplicate: boolean;
    status: string;
  };
}

const initialHolidays = [...DEFAULT_PLATFORM_HOLIDAYS];

const initialAccounts: Record<string, StripeConnectedAccount> = {
  tenant_demo_shop: {
    id: 'acct_1N9aX24ArtisanGoods',
    tenantId: 'tenant_demo_shop',
    businessName: 'Artisan Goods & Co.',
    email: 'merchant@artisangoods.com',
    country: 'US',
    defaultCurrency: 'usd',
    chargesEnabled: true,
    payoutsEnabled: true,
    detailsSubmitted: true,
    capabilities: {
      transfers: 'active',
      card_payments: 'active',
    },
    requirements: {
      currentlyDue: [],
      eventuallyDue: [],
      pastDue: [],
    },
    payoutSchedule: {
      interval: 'daily',
      delayDays: 2,
    },
    status: 'active',
    createdAt: new Date(Date.now() - 86400 * 1000 * 30).toISOString(),
  },
  tenant_roaster_lab: {
    id: 'acct_2M8bK88RoasterLab',
    tenantId: 'tenant_roaster_lab',
    businessName: 'Roaster Lab Coffee Co.',
    email: 'admin@roasterlab.coffee',
    country: 'US',
    defaultCurrency: 'usd',
    chargesEnabled: true,
    payoutsEnabled: false, // Verification pending
    detailsSubmitted: false,
    capabilities: {
      transfers: 'pending',
      card_payments: 'active',
    },
    requirements: {
      currentlyDue: ['individual.verification.document', 'business_profile.url'],
      eventuallyDue: [],
      pastDue: [],
      disabledReason: 'requirements.past_due',
    },
    payoutSchedule: {
      interval: 'weekly',
      delayDays: 7,
    },
    status: 'restricted',
    createdAt: new Date(Date.now() - 86400 * 1000 * 5).toISOString(),
  },
};

// Seed sample orders across various mandatory states
const initialOrders: MarketplaceOrder[] = [
  {
    id: 'ord_1042',
    orderNumber: '#1042',
    tenantId: 'tenant_demo_shop',
    merchantStoreName: 'Artisan Goods & Co.',
    customerName: 'Elena Rostova',
    customerEmail: 'elena@telegram.org',
    state: 'RELEASE_PENDING',
    itemsSummary: 'Minimalist Canvas Tote (Natural Ecru) x1',
    createdAt: new Date(Date.now() - 86400 * 1000 * 4).toISOString(),
    deliveryEvidence: {
      carrier: 'USPS',
      trackingNumber: '9400111899223190821',
      source: 'CARRIER_TRACKING',
      carrierStatusCode: 'DELIVERED',
      carrierDeliveredAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
      confirmedByActorId: 'carrier_webhook_usps',
      confirmedByActorRole: 'carrier_webhook',
      notes: 'Delivered in/at mailbox. Electronic delivery signature verified.',
      timestamp: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    },
    ledger: {
      orderId: 'ord_1042',
      tenantId: 'tenant_demo_shop',
      currency: 'USD',
      grossAmountCents: 3400,
      taxesCents: 0,
      shippingCents: 0,
      stripeProcessingFeeCents: 129, // 2.9% + 30¢
      platformCommissionRateBps: 500, // 5%
      platformFixedFeeCents: 30, // 30¢
      platformCommissionTotalCents: 200, // $2.00
      merchantEligibleProceedsCents: 3200, // $32.00
      refundedAmountCents: 0,
      transferredAmountCents: 0,
      paidOutAmountCents: 0,
      stripePaymentIntentId: 'pi_3P0001ArtisanGoods1042',
      stripeChargeId: 'ch_3P0001ArtisanGoods1042',
      stripeTransferGroup: 'ord_1042',
      stripeConnectedAccountId: 'acct_1N9aX24ArtisanGoods',
      paidAt: new Date(Date.now() - 86400 * 1000 * 4).toISOString(),
      deliveredAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
      deliveryConfirmedAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
      // 3 business days from 2 days ago = upcoming tomorrow
      releaseEligibilityDate: new Date(Date.now() + 86400 * 1000 * 1).toISOString(),
    },
  },
  {
    id: 'ord_1041',
    orderNumber: '#1041',
    tenantId: 'tenant_demo_shop',
    merchantStoreName: 'Artisan Goods & Co.',
    customerName: 'David Kim',
    customerEmail: 'david@kinto.dev',
    state: 'TRANSFERRED',
    itemsSummary: 'Ceramic Pour-Over Dripper + Waffle Knit Overshirt',
    createdAt: new Date(Date.now() - 86400 * 1000 * 10).toISOString(),
    deliveryEvidence: {
      carrier: 'UPS',
      trackingNumber: '1Z9999999999999999',
      source: 'CUSTOMER_CONFIRMATION',
      confirmedByActorId: 'customer_david_kim',
      confirmedByActorRole: 'customer',
      notes: 'Customer confirmed complete receipt and five-star satisfaction in Telegram Mini App.',
      timestamp: new Date(Date.now() - 86400 * 1000 * 6).toISOString(),
    },
    ledger: {
      orderId: 'ord_1041',
      tenantId: 'tenant_demo_shop',
      currency: 'USD',
      grossAmountCents: 13050,
      taxesCents: 0,
      shippingCents: 0,
      stripeProcessingFeeCents: 408,
      platformCommissionRateBps: 500,
      platformFixedFeeCents: 30,
      platformCommissionTotalCents: 683,
      merchantEligibleProceedsCents: 12367,
      refundedAmountCents: 0,
      transferredAmountCents: 12367,
      paidOutAmountCents: 0,
      stripePaymentIntentId: 'pi_3P0002ArtisanGoods1041',
      stripeChargeId: 'ch_3P0002ArtisanGoods1041',
      stripeTransferGroup: 'ord_1041',
      stripeTransferId: 'tr_1N9aX24_transferred_1041',
      stripeConnectedAccountId: 'acct_1N9aX24ArtisanGoods',
      paidAt: new Date(Date.now() - 86400 * 1000 * 10).toISOString(),
      deliveredAt: new Date(Date.now() - 86400 * 1000 * 6).toISOString(),
      deliveryConfirmedAt: new Date(Date.now() - 86400 * 1000 * 6).toISOString(),
      releaseEligibilityDate: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
      transferredAt: new Date(Date.now() - 86400 * 1000 * 1).toISOString(),
    },
  },
  {
    id: 'ord_1043',
    orderNumber: '#1043',
    tenantId: 'tenant_demo_shop',
    merchantStoreName: 'Artisan Goods & Co.',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus@example.com',
    state: 'SHIPPED',
    itemsSummary: 'Borosilicate Glass Cold Brew Bottle x1',
    createdAt: new Date(Date.now() - 86400 * 1000 * 1).toISOString(),
    ledger: {
      orderId: 'ord_1043',
      tenantId: 'tenant_demo_shop',
      currency: 'USD',
      grossAmountCents: 3600,
      taxesCents: 0,
      shippingCents: 0,
      stripeProcessingFeeCents: 134,
      platformCommissionRateBps: 500,
      platformFixedFeeCents: 30,
      platformCommissionTotalCents: 210,
      merchantEligibleProceedsCents: 3390,
      refundedAmountCents: 0,
      transferredAmountCents: 0,
      paidOutAmountCents: 0,
      stripePaymentIntentId: 'pi_3P0003ArtisanGoods1043',
      stripeChargeId: 'ch_3P0003ArtisanGoods1043',
      stripeTransferGroup: 'ord_1043',
      stripeConnectedAccountId: 'acct_1N9aX24ArtisanGoods',
      paidAt: new Date(Date.now() - 86400 * 1000 * 1).toISOString(),
    },
  },
  {
    id: 'ord_1044',
    orderNumber: '#1044',
    tenantId: 'tenant_roaster_lab',
    merchantStoreName: 'Roaster Lab Coffee Co.',
    customerName: 'Liam O’Connor',
    customerEmail: 'liam@example.com',
    state: 'PAID',
    itemsSummary: 'Ethiopian Yirgacheffe 250g x2',
    createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    ledger: {
      orderId: 'ord_1044',
      tenantId: 'tenant_roaster_lab',
      currency: 'USD',
      grossAmountCents: 3700,
      taxesCents: 0,
      shippingCents: 0,
      stripeProcessingFeeCents: 137,
      platformCommissionRateBps: 500,
      platformFixedFeeCents: 30,
      platformCommissionTotalCents: 215,
      merchantEligibleProceedsCents: 3485,
      refundedAmountCents: 0,
      transferredAmountCents: 0,
      paidOutAmountCents: 0,
      stripePaymentIntentId: 'pi_3P0004RoasterLab1044',
      stripeChargeId: 'ch_3P0004RoasterLab1044',
      stripeTransferGroup: 'ord_1044',
      stripeConnectedAccountId: 'acct_2M8bK88RoasterLab',
      paidAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    },
  },
  {
    id: 'ord_1045',
    orderNumber: '#1045',
    tenantId: 'tenant_demo_shop',
    merchantStoreName: 'Artisan Goods & Co.',
    customerName: 'Sofia Ramirez',
    customerEmail: 'sofia.r@outlook.com',
    state: 'DISPUTED',
    itemsSummary: 'Waffle Knit Overshirt x1',
    createdAt: new Date(Date.now() - 86400 * 1000 * 8).toISOString(),
    dispute: {
      id: 'disp_991823',
      orderId: 'ord_1045',
      stripeDisputeId: 'dp_1N9aX24_dispute_1045',
      reason: 'customer_contested_delivery',
      status: 'under_review',
      amountCents: 8800,
      currency: 'USD',
      evidenceNotes: 'Customer states package marked delivered but front porch CCTV shows no USPS arrival. Transfer locked pending carrier investigation.',
      openedAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    },
    ledger: {
      orderId: 'ord_1045',
      tenantId: 'tenant_demo_shop',
      currency: 'USD',
      grossAmountCents: 8800,
      taxesCents: 0,
      shippingCents: 0,
      stripeProcessingFeeCents: 285,
      platformCommissionRateBps: 500,
      platformFixedFeeCents: 30,
      platformCommissionTotalCents: 470,
      merchantEligibleProceedsCents: 8330,
      refundedAmountCents: 0,
      transferredAmountCents: 0,
      paidOutAmountCents: 0,
      stripePaymentIntentId: 'pi_3P0005ArtisanGoods1045',
      stripeChargeId: 'ch_3P0005ArtisanGoods1045',
      stripeTransferGroup: 'ord_1045',
      stripeConnectedAccountId: 'acct_1N9aX24ArtisanGoods',
      paidAt: new Date(Date.now() - 86400 * 1000 * 8).toISOString(),
      deliveredAt: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
      deliveryConfirmedAt: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
      disputedAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    },
  },
  {
    id: 'ord_1040',
    orderNumber: '#1040',
    tenantId: 'tenant_demo_shop',
    merchantStoreName: 'Artisan Goods & Co.',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@gmail.com',
    state: 'PAID_OUT',
    itemsSummary: 'Minimalist Canvas Tote x2',
    createdAt: new Date(Date.now() - 86400 * 1000 * 15).toISOString(),
    ledger: {
      orderId: 'ord_1040',
      tenantId: 'tenant_demo_shop',
      currency: 'USD',
      grossAmountCents: 6800,
      taxesCents: 0,
      shippingCents: 0,
      stripeProcessingFeeCents: 227,
      platformCommissionRateBps: 500,
      platformFixedFeeCents: 30,
      platformCommissionTotalCents: 370,
      merchantEligibleProceedsCents: 6430,
      refundedAmountCents: 0,
      transferredAmountCents: 6430,
      paidOutAmountCents: 6430,
      stripePaymentIntentId: 'pi_3P0000ArtisanGoods1040',
      stripeChargeId: 'ch_3P0000ArtisanGoods1040',
      stripeTransferGroup: 'ord_1040',
      stripeTransferId: 'tr_1N9aX24_transferred_1040',
      stripePayoutId: 'po_1N9aX24_payout_1040',
      stripeConnectedAccountId: 'acct_1N9aX24ArtisanGoods',
      paidAt: new Date(Date.now() - 86400 * 1000 * 15).toISOString(),
      deliveredAt: new Date(Date.now() - 86400 * 1000 * 12).toISOString(),
      deliveryConfirmedAt: new Date(Date.now() - 86400 * 1000 * 12).toISOString(),
      releaseEligibilityDate: new Date(Date.now() - 86400 * 1000 * 8).toISOString(),
      transferredAt: new Date(Date.now() - 86400 * 1000 * 7).toISOString(),
      paidOutAt: new Date(Date.now() - 86400 * 1000 * 5).toISOString(),
    },
  },
];

export const usePaymentsStore = create<PaymentsStore>((set, get) => ({
  isConfigured: true, // test mode active by default
  isTestMode: true,
  commissionRateBps: 500, // 5%
  fixedFeeCents: 30, // 30¢
  holdingPeriodBusinessDays: 3,
  holidays: initialHolidays,
  simulatedClockOffsetDays: 0,

  connectedAccounts: initialAccounts,
  orders: initialOrders,
  disputes: [
    initialOrders[4].dispute!,
  ],
  auditLogs: [
    {
      id: 'audit_init_1',
      orderId: 'ord_1042',
      action: 'DELIVERY_CONFIRMED',
      previousState: 'DELIVERED',
      newState: 'DELIVERY_CONFIRMED',
      actor: 'carrier_webhook_usps',
      actorRole: 'carrier_webhook',
      evidence: 'USPS tracking 9400111899223190821 delivered event. Holding period 3 business days started.',
      timestamp: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    },
    {
      id: 'audit_init_2',
      orderId: 'ord_1045',
      action: 'DISPUTE_OPENED',
      previousState: 'RELEASE_PENDING',
      newState: 'DISPUTED',
      actor: 'customer_sofia_ramirez',
      actorRole: 'customer',
      evidence: 'Delivery contested. Automatic hold placed on Stripe transfer.',
      timestamp: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    },
  ],
  webhookLogs: [
    {
      id: 'wh_log_1',
      type: 'payment_intent.succeeded',
      stripeEventId: 'evt_1N9aX24_pi_succeeded_1042',
      status: 'processed',
      payloadSummary: 'Centralized PaymentIntent for $34.00 captured on platform account. Transfer group: ord_1042.',
      receivedAt: new Date(Date.now() - 86400 * 1000 * 4).toISOString(),
      processedAt: new Date(Date.now() - 86400 * 1000 * 4).toISOString(),
      retryCount: 0,
    },
  ],
  processedWebhookIds: new Set(['evt_1N9aX24_pi_succeeded_1042']),

  updatePlatformSettings: (settings) =>
    set((state) => ({
      commissionRateBps: settings.commissionRateBps ?? state.commissionRateBps,
      fixedFeeCents: settings.fixedFeeCents ?? state.fixedFeeCents,
      holdingPeriodBusinessDays: settings.holdingPeriodBusinessDays ?? state.holdingPeriodBusinessDays,
      isTestMode: settings.isTestMode ?? state.isTestMode,
      isConfigured: settings.isConfigured ?? state.isConfigured,
    })),

  advanceSimulatedClock: (days) =>
    set((state) => ({
      simulatedClockOffsetDays: state.simulatedClockOffsetDays + days,
    })),

  resetSimulatedClock: () =>
    set(() => ({
      simulatedClockOffsetDays: 0,
    })),

  onboardMerchantAccount: (tenantId, businessName, email) => {
    const id = `acct_live_${Date.now().toString(36)}`;
    const newAcct: StripeConnectedAccount = {
      id,
      tenantId,
      businessName,
      email,
      country: 'US',
      defaultCurrency: 'usd',
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
      capabilities: {
        transfers: 'active',
        card_payments: 'active',
      },
      requirements: {
        currentlyDue: [],
        eventuallyDue: [],
        pastDue: [],
      },
      payoutSchedule: {
        interval: 'daily',
        delayDays: 2,
      },
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      connectedAccounts: {
        ...state.connectedAccounts,
        [tenantId]: newAcct,
      },
    }));

    return newAcct;
  },

  updateAccountStatus: (tenantId, status) =>
    set((state) => {
      const acct = state.connectedAccounts[tenantId];
      if (!acct) return state;
      return {
        connectedAccounts: {
          ...state.connectedAccounts,
          [tenantId]: {
            ...acct,
            status,
            payoutsEnabled: status === 'active',
          },
        },
      };
    }),

  createOrderWithPaymentIntent: (orderData) => {
    const state = get();
    const orderId = `ord_${Date.now()}`;
    const split = {
      platformFeeCents: Math.round((orderData.grossAmountCents * state.commissionRateBps) / 10000) + state.fixedFeeCents,
      stripeFeeCents: Math.round((orderData.grossAmountCents * 290) / 10000) + 30,
      merchantProceedsCents: 0,
    };
    split.merchantProceedsCents = Math.max(0, orderData.grossAmountCents - split.platformFeeCents);

    const connectedAccountId = state.connectedAccounts[orderData.tenantId]?.id || 'acct_unlinked';

    const ledger: OrderFinancialLedger = {
      orderId,
      tenantId: orderData.tenantId,
      currency: 'USD',
      grossAmountCents: orderData.grossAmountCents,
      taxesCents: 0,
      shippingCents: 0,
      stripeProcessingFeeCents: split.stripeFeeCents,
      platformCommissionRateBps: state.commissionRateBps,
      platformFixedFeeCents: state.fixedFeeCents,
      platformCommissionTotalCents: split.platformFeeCents,
      merchantEligibleProceedsCents: split.merchantProceedsCents,
      refundedAmountCents: 0,
      transferredAmountCents: 0,
      paidOutAmountCents: 0,
      stripePaymentIntentId: `pi_live_${Date.now()}`,
      stripeChargeId: `ch_live_${Date.now()}`,
      stripeTransferGroup: orderId,
      stripeConnectedAccountId: connectedAccountId,
      paidAt: new Date().toISOString(),
    };

    const newOrder: MarketplaceOrder = {
      id: orderId,
      orderNumber: orderData.orderNumber,
      tenantId: orderData.tenantId,
      merchantStoreName: orderData.merchantStoreName,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      state: 'PAID',
      itemsSummary: orderData.itemsSummary,
      ledger,
      createdAt: new Date().toISOString(),
    };

    set((s) => ({
      orders: [newOrder, ...s.orders],
      auditLogs: [
        {
          id: `audit_${Date.now()}`,
          orderId,
          action: 'PAYMENT_CAPTURED_CENTRALIZED',
          previousState: 'PENDING_PAYMENT',
          newState: 'PAID',
          actor: 'stripe_webhook',
          actorRole: 'stripe_webhook',
          evidence: `Platform PaymentIntent captured: $${(orderData.grossAmountCents / 100).toFixed(2)}. Commission: $${(split.platformFeeCents / 100).toFixed(2)}.`,
          timestamp: new Date().toISOString(),
        },
        ...s.auditLogs,
      ],
    }));

    return newOrder;
  },

  confirmDelivery: (orderId, evidence) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;

    validateStateTransition(order.state, 'DELIVERY_CONFIRMED', {
      hasDeliveryEvidence: true,
    });

    const config: BusinessDayConfig = {
      holdingPeriodBusinessDays: state.holdingPeriodBusinessDays,
      timezone: 'UTC',
      holidays: state.holidays,
    };

    const calculation = calculateReleaseEligibilityDate(new Date(), config);
    const releaseEligibilityDate = calculation.eligibilityDate.toISOString();

    const auditLog: PaymentAuditLog = {
      id: `audit_${Date.now()}`,
      orderId,
      action: 'DELIVERY_CONFIRMED',
      previousState: order.state,
      newState: 'DELIVERY_CONFIRMED',
      actor: evidence.confirmedByActorId,
      actorRole: evidence.confirmedByActorRole,
      evidence: `Source: ${evidence.source}. Note: ${evidence.notes || 'None'}. Excluded ${calculation.excludedDates.length} weekend/holiday day(s). Eligibility Date: ${new Date(releaseEligibilityDate).toLocaleDateString()}`,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              state: 'RELEASE_PENDING',
              deliveryEvidence: evidence,
              ledger: {
                ...o.ledger,
                deliveredAt: o.ledger.deliveredAt || new Date().toISOString(),
                deliveryConfirmedAt: new Date().toISOString(),
                releaseEligibilityDate,
              },
            }
          : o
      ),
      auditLogs: [auditLog, ...s.auditLogs],
    }));
  },

  executeTransfer: (orderId) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const effectiveNow = new Date(Date.now() + state.simulatedClockOffsetDays * 86400 * 1000);
    const isEligible = order.ledger.releaseEligibilityDate
      ? isTransferEligibleNow(order.ledger.releaseEligibilityDate, effectiveNow)
      : false;

    const isDisputed = Boolean(order.dispute && order.dispute.status !== 'won');

    try {
      validateStateTransition(order.state, 'TRANSFER_PROCESSING', {
        isDisputed,
        isReleasePeriodExpired: isEligible,
      });
    } catch (err: any) {
      return { success: false, error: err.message };
    }

    const stripeTransferId = `tr_live_${Date.now().toString(36)}`;

    const auditLog: PaymentAuditLog = {
      id: `audit_${Date.now()}`,
      orderId,
      action: 'STRIPE_TRANSFER_CREATED',
      previousState: order.state,
      newState: 'TRANSFERRED',
      actor: 'platform_release_cron',
      actorRole: 'system_cron',
      evidence: `Stripe Transfer ${stripeTransferId} completed. Amount: $${(order.ledger.merchantEligibleProceedsCents / 100).toFixed(2)} to destination ${order.ledger.stripeConnectedAccountId}`,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              state: 'TRANSFERRED',
              ledger: {
                ...o.ledger,
                stripeTransferId,
                transferredAmountCents: o.ledger.merchantEligibleProceedsCents,
                transferredAt: new Date().toISOString(),
              },
            }
          : o
      ),
      auditLogs: [auditLog, ...s.auditLogs],
    }));

    return { success: true };
  },

  triggerPayout: (orderId) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;

    validateStateTransition(order.state, 'PAYOUT_PROCESSING');

    const stripePayoutId = `po_live_${Date.now().toString(36)}`;

    const auditLog: PaymentAuditLog = {
      id: `audit_${Date.now()}`,
      orderId,
      action: 'STRIPE_PAYOUT_SETTLED',
      previousState: order.state,
      newState: 'PAID_OUT',
      actor: 'stripe_connect_network',
      actorRole: 'stripe_webhook',
      evidence: `Stripe Payout ${stripePayoutId} settled to merchant bank account.`,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              state: 'PAID_OUT',
              ledger: {
                ...o.ledger,
                stripePayoutId,
                paidOutAmountCents: o.ledger.transferredAmountCents,
                paidOutAt: new Date().toISOString(),
              },
            }
          : o
      ),
      auditLogs: [auditLog, ...s.auditLogs],
    }));
  },

  issueRefund: (orderId, amountCents, reason) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;

    validateStateTransition(order.state, 'REFUND_PENDING');

    const stripeRefundId = `re_live_${Date.now().toString(36)}`;
    const isPostTransfer = order.state === 'TRANSFERRED' || order.state === 'PAID_OUT';
    const reversalId = isPostTransfer ? `trr_${Date.now().toString(36)}` : undefined;

    const auditLog: PaymentAuditLog = {
      id: `audit_${Date.now()}`,
      orderId,
      action: 'ORDER_REFUND_PROCESSED',
      previousState: order.state,
      newState: 'REFUNDED',
      actor: 'admin_support',
      actorRole: 'admin',
      evidence: `Refund ${stripeRefundId} issued for $${(amountCents / 100).toFixed(2)}. Reason: ${reason}.${reversalId ? ` Transfer reversal initiated: ${reversalId}` : ''}`,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              state: 'REFUNDED',
              ledger: {
                ...o.ledger,
                stripeRefundId,
                refundedAmountCents: amountCents,
                refundedAt: new Date().toISOString(),
              },
            }
          : o
      ),
      auditLogs: [auditLog, ...s.auditLogs],
    }));
  },

  openDispute: (orderId, reason, notes) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;

    const dispute: DisputeRecord = {
      id: `disp_${Date.now()}`,
      orderId,
      stripeDisputeId: `dp_live_${Date.now().toString(36)}`,
      reason,
      status: 'under_review',
      amountCents: order.ledger.grossAmountCents,
      currency: order.ledger.currency,
      evidenceNotes: notes,
      openedAt: new Date().toISOString(),
    };

    const auditLog: PaymentAuditLog = {
      id: `audit_${Date.now()}`,
      orderId,
      action: 'PAYMENT_DISPUTE_OPENED',
      previousState: order.state,
      newState: 'DISPUTED',
      actor: 'cardholder_bank',
      actorRole: 'customer',
      evidence: `Dispute opened: ${reason}. Notes: ${notes}. Outbound transfer automatically frozen.`,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              state: 'DISPUTED',
              dispute,
            }
          : o
      ),
      disputes: [dispute, ...s.disputes],
      auditLogs: [auditLog, ...s.auditLogs],
    }));
  },

  resolveDispute: (disputeId, outcome) => {
    const state = get();
    const dispute = state.disputes.find((d) => d.id === disputeId);
    if (!dispute) return;

    const order = state.orders.find((o) => o.id === dispute.orderId);
    if (!order) return;

    const isWon = outcome === 'transfer_proceeded_to_merchant';
    const newState: OrderPaymentState = isWon ? 'RELEASE_PENDING' : 'REFUNDED';

    const auditLog: PaymentAuditLog = {
      id: `audit_${Date.now()}`,
      orderId: order.id,
      action: 'DISPUTE_RESOLVED',
      previousState: 'DISPUTED',
      newState,
      actor: 'admin_dispute_arbiter',
      actorRole: 'admin',
      evidence: `Dispute ${disputeId} decided: ${outcome}. Order moved to ${newState}.`,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      disputes: s.disputes.map((d) =>
        d.id === disputeId
          ? { ...d, status: isWon ? 'won' : 'lost', resolvedAt: new Date().toISOString(), resolutionOutcome: outcome }
          : d
      ),
      orders: s.orders.map((o) =>
        o.id === order.id
          ? {
              ...o,
              state: newState,
            }
          : o
      ),
      auditLogs: [auditLog, ...s.auditLogs],
    }));
  },

  dispatchWebhookEvent: (eventType, eventId, payload) => {
    const state = get();
    if (state.processedWebhookIds.has(eventId)) {
      const duplicateRecord: WebhookEventRecord = {
        id: `wh_${Date.now()}`,
        type: eventType,
        stripeEventId: eventId,
        status: 'duplicate_ignored',
        payloadSummary: `Duplicate delivery of ${eventId} safely ignored. Idempotent state preserved.`,
        receivedAt: new Date().toISOString(),
        retryCount: 1,
      };

      set((s) => ({
        webhookLogs: [duplicateRecord, ...s.webhookLogs],
      }));

      return { isDuplicate: true, status: 'duplicate_ignored' };
    }

    const processedRecord: WebhookEventRecord = {
      id: `wh_${Date.now()}`,
      type: eventType,
      stripeEventId: eventId,
      status: 'processed',
      payloadSummary: `Stripe webhook ${eventType} verified and applied. Payload: ${JSON.stringify(payload).substring(0, 80)}...`,
      receivedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      retryCount: 0,
    };

    const newProcessedIds = new Set(state.processedWebhookIds);
    newProcessedIds.add(eventId);

    set((s) => ({
      processedWebhookIds: newProcessedIds,
      webhookLogs: [processedRecord, ...s.webhookLogs],
    }));

    return { isDuplicate: false, status: 'processed' };
  },
}));
