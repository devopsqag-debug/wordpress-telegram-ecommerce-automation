/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Mandatory 18 Order-Payment States
 * 11 sequential states + 7 alternative/exceptional states
 */
export type OrderPaymentState =
  // 11 Sequential States
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'DELIVERY_CONFIRMED'
  | 'RELEASE_PENDING'
  | 'TRANSFER_PROCESSING'
  | 'TRANSFERRED'
  | 'PAYOUT_PROCESSING'
  | 'PAID_OUT'
  // Exceptional / Alternative States
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'DISPUTED'
  | 'PAYOUT_FAILED'
  | 'MANUAL_REVIEW';

export type DeliveryConfirmationSource =
  | 'CARRIER_TRACKING'
  | 'CUSTOMER_CONFIRMATION'
  | 'ADMIN_MANUAL'
  | 'MERCHANT_PROOF';

export interface DeliveryEvidence {
  carrier?: string;
  trackingNumber?: string;
  carrierStatusCode?: string;
  carrierDeliveredAt?: string;
  customerSignature?: string;
  proofDocumentUrl?: string;
  notes?: string;
  confirmedByActorId: string;
  confirmedByActorRole: 'platform_admin' | 'carrier_webhook' | 'customer' | 'merchant';
  source: DeliveryConfirmationSource;
  timestamp: string;
}

export interface StripeConnectedAccount {
  id: string; // acct_...
  tenantId: string;
  businessName: string;
  email: string;
  country: string;
  defaultCurrency: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  capabilities: {
    transfers: 'active' | 'inactive' | 'pending';
    card_payments: 'active' | 'inactive' | 'pending';
  };
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    disabledReason?: string;
  };
  payoutSchedule: {
    interval: 'daily' | 'weekly' | 'manual';
    delayDays: number;
  };
  status: 'pending_onboarding' | 'restricted' | 'active' | 'disabled';
  createdAt: string;
}

/**
 * Financial Transaction Ledger Entry
 * All monetary calculations use integer minor units (cents)
 * Floating point arithmetic is strictly forbidden for financial calculations.
 */
export interface OrderFinancialLedger {
  orderId: string;
  tenantId: string;
  currency: string;
  // All monetary values in integer cents (e.g. $100.00 = 10000)
  grossAmountCents: number;
  taxesCents: number;
  shippingCents: number;
  stripeProcessingFeeCents: number; // e.g. 2.9% + 30¢
  platformCommissionRateBps: number; // basis points, e.g. 500 = 5%
  platformFixedFeeCents: number; // e.g. 30¢ = 30
  platformCommissionTotalCents: number;
  merchantEligibleProceedsCents: number;
  refundedAmountCents: number;
  transferredAmountCents: number;
  paidOutAmountCents: number;

  // Stripe Object Identifiers
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeTransferGroup?: string;
  stripeTransferId?: string;
  stripeRefundId?: string;
  stripePayoutId?: string;
  stripeConnectedAccountId: string;

  // Timestamps
  paidAt?: string;
  deliveredAt?: string;
  deliveryConfirmedAt?: string;
  releaseEligibilityDate?: string;
  transferredAt?: string;
  paidOutAt?: string;
  refundedAt?: string;
  disputedAt?: string;
}

export interface DisputeRecord {
  id: string;
  orderId: string;
  stripeDisputeId?: string;
  reason: 'product_not_received' | 'not_as_described' | 'fraudulent' | 'duplicate' | 'customer_contested_delivery';
  status: 'needs_response' | 'under_review' | 'won' | 'lost';
  amountCents: number;
  currency: string;
  evidenceNotes: string;
  openedAt: string;
  resolvedAt?: string;
  resolutionOutcome?: 'funds_refunded_to_customer' | 'transfer_proceeded_to_merchant' | 'partial_resolution';
}

export interface PaymentAuditLog {
  id: string;
  orderId: string;
  action: string;
  previousState: OrderPaymentState;
  newState: OrderPaymentState;
  actor: string;
  actorRole: 'admin' | 'customer' | 'merchant' | 'stripe_webhook' | 'system_cron' | 'carrier_webhook' | 'platform_admin';
  evidence?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface WebhookEventRecord {
  id: string; // evt_...
  type: string;
  stripeEventId: string;
  status: 'processed' | 'duplicate_ignored' | 'failed' | 'signature_invalid';
  payloadSummary: string;
  receivedAt: string;
  processedAt?: string;
  retryCount: number;
  error?: string;
}

export interface BusinessDayConfig {
  holdingPeriodBusinessDays: number; // default: 3
  timezone: string; // e.g. "America/New_York" or "UTC"
  holidays: string[]; // YYYY-MM-DD format
}
