/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OrderPaymentState } from './types.ts';

/**
 * Valid state transition matrix
 * Dictates all permissible transitions across the 18 states.
 * Rejects illegal or client-tampered state jumps.
 */
const ALLOWED_TRANSITIONS: Record<OrderPaymentState, OrderPaymentState[]> = {
  PENDING_PAYMENT: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED', 'DISPUTED'],
  PROCESSING: ['SHIPPED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED', 'DISPUTED', 'MANUAL_REVIEW'],
  SHIPPED: ['DELIVERED', 'REFUND_PENDING', 'DISPUTED', 'MANUAL_REVIEW'],
  DELIVERED: ['DELIVERY_CONFIRMED', 'DISPUTED', 'REFUND_PENDING', 'MANUAL_REVIEW'],
  DELIVERY_CONFIRMED: ['RELEASE_PENDING', 'DISPUTED', 'MANUAL_REVIEW'],
  RELEASE_PENDING: ['TRANSFER_PROCESSING', 'DISPUTED', 'MANUAL_REVIEW', 'REFUND_PENDING'],
  TRANSFER_PROCESSING: ['TRANSFERRED', 'MANUAL_REVIEW', 'DISPUTED'],
  TRANSFERRED: ['PAYOUT_PROCESSING', 'REFUND_PENDING', 'DISPUTED'], // Can refund via transfer reversal if supported
  PAYOUT_PROCESSING: ['PAID_OUT', 'PAYOUT_FAILED', 'DISPUTED'],
  PAID_OUT: ['DISPUTED'], // Terminal success, but chargeback dispute can still arrive

  // Exceptional / Alternative States
  PAYMENT_FAILED: ['PENDING_PAYMENT', 'CANCELLED'],
  CANCELLED: [], // Terminal
  REFUND_PENDING: ['REFUNDED', 'MANUAL_REVIEW'],
  REFUNDED: [], // Terminal
  DISPUTED: ['RELEASE_PENDING', 'REFUNDED', 'TRANSFERRED', 'MANUAL_REVIEW'], // Can resume upon dispute win
  PAYOUT_FAILED: ['PAYOUT_PROCESSING', 'MANUAL_REVIEW'],
  MANUAL_REVIEW: ['PROCESSING', 'RELEASE_PENDING', 'TRANSFER_PROCESSING', 'REFUND_PENDING', 'CANCELLED'],
};

export class InvalidStateTransitionError extends Error {
  constructor(public from: OrderPaymentState, public to: OrderPaymentState, reason?: string) {
    super(
      `Forbidden Order-Payment State Transition: '${from}' -> '${to}'. ${
        reason || 'Transition violates marketplace release integrity constraints.'
      }`
    );
    this.name = 'InvalidStateTransitionError';
  }
}

/**
 * Validates whether a state transition is authorized under marketplace rules.
 * Throws InvalidStateTransitionError if unauthorized.
 */
export function validateStateTransition(
  currentState: OrderPaymentState,
  targetState: OrderPaymentState,
  context?: {
    isDisputed?: boolean;
    hasDeliveryEvidence?: boolean;
    isReleasePeriodExpired?: boolean;
    isStripeConfirmed?: boolean;
  }
): void {
  const allowedNext = ALLOWED_TRANSITIONS[currentState] || [];
  
  if (!allowedNext.includes(targetState)) {
    throw new InvalidStateTransitionError(currentState, targetState);
  }

  // Guard: Never transfer while in dispute
  if (targetState === 'TRANSFER_PROCESSING' || targetState === 'TRANSFERRED') {
    if (context?.isDisputed) {
      throw new InvalidStateTransitionError(
        currentState,
        targetState,
        'Active delivery or payment dispute is open. Transfers are blocked.'
      );
    }
    if (context?.isReleasePeriodExpired === false) {
      throw new InvalidStateTransitionError(
        currentState,
        targetState,
        'Three-business-day holding period has not yet elapsed. Early transfer unauthorized.'
      );
    }
  }

  // Guard: Cannot mark delivery confirmed without verified delivery evidence
  if (targetState === 'DELIVERY_CONFIRMED' && context?.hasDeliveryEvidence === false) {
    throw new InvalidStateTransitionError(
      currentState,
      targetState,
      'Delivery confirmation requires auditable evidence (carrier tracking event, customer receipt, or authorized admin review).'
    );
  }
}
