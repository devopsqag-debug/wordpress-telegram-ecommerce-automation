/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, DollarSign, Clock, ShieldCheck, 
  AlertTriangle, Download, CheckCircle2, ArrowUpRight, 
  Truck, ExternalLink, RefreshCw 
} from 'lucide-react';
import { usePaymentsStore } from '@/mobile/store/usePaymentsStore.ts';
import { useMerchantStore } from '@/mobile/store/useMerchantStore.ts';

export const MerchantPaymentsDashboard: React.FC = () => {
  const { tenant } = useMerchantStore();
  const { 
    connectedAccounts, orders, disputes, 
    simulatedClockOffsetDays, onboardMerchantAccount 
  } = usePaymentsStore();

  const [activeSection, setActiveSection] = useState<'summary' | 'orders' | 'disputes' | 'onboarding'>('summary');

  // STRICT TENANT ISOLATION: Filter strictly by active merchant tenantId
  const merchantTenantId = tenant.tenantId || 'tenant_demo_shop';
  const myAccount = connectedAccounts[merchantTenantId] || connectedAccounts['tenant_demo_shop'];
  const myOrders = orders.filter((o) => o.tenantId === merchantTenantId);
  const myDisputes = disputes.filter((d) => {
    const matchedOrder = orders.find((o) => o.id === d.orderId);
    return matchedOrder?.tenantId === merchantTenantId;
  });

  // Calculate clearly separated amounts as requested in Section 6 & 8
  const grossSalesCents = myOrders.reduce((sum, o) => sum + o.ledger.grossAmountCents, 0);
  const refundsCents = myOrders.reduce((sum, o) => sum + o.ledger.refundedAmountCents, 0);
  const platformFeesCents = myOrders.reduce((sum, o) => sum + o.ledger.platformCommissionTotalCents, 0);

  const pendingReleaseCents = myOrders
    .filter((o) => o.state === 'RELEASE_PENDING' || o.state === 'DELIVERY_CONFIRMED')
    .reduce((sum, o) => sum + o.ledger.merchantEligibleProceedsCents, 0);

  const transferInProgressCents = myOrders
    .filter((o) => o.state === 'TRANSFER_PROCESSING')
    .reduce((sum, o) => sum + o.ledger.merchantEligibleProceedsCents, 0);

  const transferredBalanceCents = myOrders
    .filter((o) => o.state === 'TRANSFERRED')
    .reduce((sum, o) => sum + o.ledger.transferredAmountCents, 0);

  const payoutInProgressCents = myOrders
    .filter((o) => o.state === 'PAYOUT_PROCESSING')
    .reduce((sum, o) => sum + o.ledger.transferredAmountCents, 0);

  const completedPayoutsCents = myOrders
    .filter((o) => o.state === 'PAID_OUT')
    .reduce((sum, o) => sum + o.ledger.paidOutAmountCents, 0);

  const failedPayoutsCents = myOrders
    .filter((o) => o.state === 'PAYOUT_FAILED')
    .reduce((sum, o) => sum + o.ledger.transferredAmountCents, 0);

  // Orders queues
  const awaitingFulfillment = myOrders.filter((o) => o.state === 'PAID' || o.state === 'PROCESSING');
  const awaitingDelivery = myOrders.filter((o) => o.state === 'SHIPPED');
  const awaitingRelease = myOrders.filter((o) => o.state === 'RELEASE_PENDING' || o.state === 'DELIVERY_CONFIRMED');

  const downloadCsvReport = () => {
    const headers = [
      'Order Number',
      'Created Date',
      'Status',
      'Gross Amount ($)',
      'Platform Fee ($)',
      'Eligible Proceeds ($)',
      'Release Eligibility Date',
      'Stripe PaymentIntent',
      'Stripe Transfer ID',
    ];

    const rows = myOrders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      o.state,
      (o.ledger.grossAmountCents / 100).toFixed(2),
      (o.ledger.platformCommissionTotalCents / 100).toFixed(2),
      (o.ledger.merchantEligibleProceedsCents / 100).toFixed(2),
      o.ledger.releaseEligibilityDate ? new Date(o.ledger.releaseEligibilityDate).toLocaleDateString() : 'N/A',
      o.ledger.stripePaymentIntentId || '',
      o.ledger.stripeTransferId || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `teleshop_payout_ledger_${merchantTenantId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Merchant Finance Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Merchant Payments &amp; Payouts
            </h1>
            <span className="text-[11px] text-sky-400 font-mono bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
              {tenant.storeName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Powered by centralized Stripe Connect · Direct daily bank deposits after delivery confirmation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={downloadCsvReport}
            className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* Stripe Connect Onboarding Status Banner */}
      {myAccount && (
        <div className={`px-6 py-3 border-b text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 ${
          myAccount.status === 'active'
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
            : 'bg-amber-950/50 border-amber-800/80 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            {myAccount.status === 'active' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>
              Connected Stripe Account: <strong>{myAccount.id}</strong> (Status: <strong>{myAccount.status.toUpperCase()}</strong>) · Payout schedule: {myAccount.payoutSchedule.interval} ({myAccount.payoutSchedule.delayDays}d settlement delay).
            </span>
          </div>

          {myAccount.status !== 'active' && (
            <button
              onClick={() => onboardMerchantAccount(merchantTenantId, tenant.storeName, 'merchant@example.com')}
              className="py-1 px-3 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] cursor-pointer shrink-0"
            >
              Complete Stripe Verification
            </button>
          )}
        </div>
      )}

      {/* View Selector Tabs */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-6 flex items-center gap-2 overflow-x-auto text-xs py-2 shrink-0">
        <button
          onClick={() => setActiveSection('summary')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'summary' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Financial Breakdown (9 Categories)
        </button>
        <button
          onClick={() => setActiveSection('orders')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'orders' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          My Orders &amp; Release Dates ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveSection('disputes')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'disputes' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Disputes &amp; Inquiries ({myDisputes.length})
        </button>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* SECTION 1: 9 CLEARLY SEPARATED AMOUNTS */}
        {activeSection === 'summary' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white mb-1">
                Merchant Accounting Summary (Strictly Integer Minor Units)
              </h2>
              <p className="text-xs text-slate-400">
                Separated ledger breakdown for store <strong>{tenant.storeName}</strong>. Zero floating-point rounding.
              </p>
            </div>

            {/* 9 Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Gross Sales */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">1. Gross Sales</div>
                <div className="text-xl font-bold text-white font-mono mt-1">
                  ${(grossSalesCents / 100).toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Total revenue collected</div>
              </div>

              {/* 2. Refunds */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">2. Refunds</div>
                <div className="text-xl font-bold text-rose-400 font-mono mt-1">
                  ${(refundsCents / 100).toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Returned to customers</div>
              </div>

              {/* 3. Platform Fees */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">3. Platform Fees</div>
                <div className="text-xl font-bold text-slate-300 font-mono mt-1">
                  ${(platformFeesCents / 100).toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Central marketplace commission</div>
              </div>

              {/* 4. Pending Release */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-900/60 bg-amber-950/20">
                <div className="text-xs text-amber-300 font-medium">4. Pending Release</div>
                <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                  ${(pendingReleaseCents / 100).toFixed(2)}
                </div>
                <div className="text-[11px] text-amber-500/80 mt-1">Delivery confirmed · 3-day hold</div>
              </div>

              {/* 5. Transfer In Progress */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">5. Transfer In Progress</div>
                <div className="text-xl font-bold text-sky-400 font-mono mt-1">
                  ${(transferInProgressCents / 100).toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Routing via Stripe Connect</div>
              </div>

              {/* 6. Transferred Balance */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">6. Transferred Balance</div>
                <div className="text-xl font-bold text-sky-300 font-mono mt-1">
                  ${(transferredBalanceCents / 100).toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">In connected account balance</div>
              </div>

              {/* 7. Payout In Progress */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">7. Payout In Progress</div>
                <div className="text-xl font-bold text-indigo-400 font-mono mt-1">
                  ${(payoutInProgressCents / 100).toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">In transit to bank account</div>
              </div>

              {/* 8. Completed Payouts */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-900/60 bg-emerald-950/20">
                <div className="text-xs text-emerald-300 font-medium">8. Completed Payouts</div>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                  ${(completedPayoutsCents / 100).toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-500/80 mt-1">Deposited into bank account</div>
              </div>

              {/* 9. Failed Payouts */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">9. Failed Payouts</div>
                <div className="text-xl font-bold text-slate-400 font-mono mt-1">
                  ${(failedPayoutsCents / 100).toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Requires bank detail update</div>
              </div>
            </div>

            {/* Release Policy Explanation */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-200">How You Get Paid on TeleShop:</div>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Customer completes checkout through central Stripe marketplace.</li>
                <li>You fulfill the order and upload/scan carrier tracking.</li>
                <li>Once delivered and confirmed, the 3-business-day inspection window starts.</li>
                <li>Upon expiration, eligible net proceeds are automatically transferred to your Stripe account and settled to your bank.</li>
              </ol>
            </div>
          </div>
        )}

        {/* SECTION 2: MY ORDERS & RELEASE STATUS */}
        {activeSection === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white">
              My Orders &amp; Payment Release Tracker
            </h2>

            <div className="space-y-3">
              {myOrders.map((o) => (
                <div key={o.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white text-sm">{o.orderNumber}</span>
                      <span className="text-xs text-slate-400 font-mono">({o.customerName})</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        o.state === 'PAID_OUT' ? 'bg-emerald-950 text-emerald-400' :
                        o.state === 'TRANSFERRED' ? 'bg-sky-950 text-sky-400' :
                        o.state === 'RELEASE_PENDING' ? 'bg-amber-950 text-amber-400' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {o.state}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-sky-400 font-mono">
                        Net: ${(o.ledger.merchantEligibleProceedsCents / 100).toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-500 font-mono ml-2">
                        (Gross: ${(o.ledger.grossAmountCents / 100).toFixed(2)})
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300">{o.itemsSummary}</div>

                  {/* Financial & Release Metadata */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1 font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-500">Platform Commission:</span>
                      <span className="text-slate-300">${(o.ledger.platformCommissionTotalCents / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-500">Expected Release Date:</span>
                      <span className="text-amber-400">
                        {o.ledger.releaseEligibilityDate
                          ? new Date(o.ledger.releaseEligibilityDate).toLocaleDateString()
                          : 'Awaiting delivery confirmation'}
                      </span>
                    </div>
                    {o.ledger.stripeTransferId && (
                      <div className="flex justify-between">
                        <span className="font-sans text-slate-500">Stripe Transfer ID:</span>
                        <span className="text-sky-400">{o.ledger.stripeTransferId}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: DISPUTES */}
        {activeSection === 'disputes' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white">
              Customer Disputes &amp; Inquiries
            </h2>

            {myDisputes.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">No Open Disputes</div>
                <p className="text-xs text-slate-400">
                  Your store has maintained zero chargebacks and 100% on-time verified delivery.
                </p>
              </div>
            ) : (
              myDisputes.map((d) => (
                <div key={d.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">Dispute on Order {d.orderId}</span>
                    <span className="text-[10px] font-bold bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-800">
                      {d.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {d.evidenceNotes}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
