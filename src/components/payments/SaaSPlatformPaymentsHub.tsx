/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, AlertCircle, Clock, ArrowRight, DollarSign, 
  CheckCircle2, AlertTriangle, RefreshCw, Send, Lock, 
  ExternalLink, FileText, ChevronRight, Eye, Check, X, 
  Calendar, RotateCcw, Building2, Truck, Users, Radio
} from 'lucide-react';
import { usePaymentsStore, MarketplaceOrder } from '@/mobile/store/usePaymentsStore.ts';
import { DeliveryConfirmationSource, OrderPaymentState } from '@/backend/stripe/types.ts';

export const SaaSPlatformPaymentsHub: React.FC = () => {
  const {
    isConfigured, isTestMode, commissionRateBps, fixedFeeCents,
    holdingPeriodBusinessDays, holidays, simulatedClockOffsetDays,
    connectedAccounts, orders, disputes, auditLogs, webhookLogs,
    confirmDelivery, executeTransfer, triggerPayout, issueRefund,
    resolveDispute, updatePlatformSettings, advanceSimulatedClock, resetSimulatedClock
  } = usePaymentsStore();

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'accounts' | 'delivery' | 'release_queue' | 'transfers_payouts' | 'disputes_refunds' | 'webhooks_audit'
  >('overview');

  // Selected order for manual delivery modal
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<MarketplaceOrder | null>(null);
  const [manualDeliveryNotes, setManualDeliveryNotes] = useState('');
  const [manualDeliverySource, setManualDeliverySource] = useState<DeliveryConfirmationSource>('ADMIN_MANUAL');

  // Refund modal state
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<MarketplaceOrder | null>(null);
  const [refundReason, setRefundReason] = useState('Customer return requested');

  // Transfer execution feedback
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Compute Platform Totals in integer cents
  const totalGrossCents = orders.reduce((sum, o) => sum + o.ledger.grossAmountCents, 0);
  const totalPlatformCommissionsCents = orders.reduce((sum, o) => sum + o.ledger.platformCommissionTotalCents, 0);
  const totalTransferredCents = orders.reduce((sum, o) => sum + o.ledger.transferredAmountCents, 0);
  const totalPaidOutCents = orders.reduce((sum, o) => sum + o.ledger.paidOutAmountCents, 0);
  const totalPendingReleaseCents = orders
    .filter((o) => o.state === 'RELEASE_PENDING' || o.state === 'DELIVERY_CONFIRMED')
    .reduce((sum, o) => sum + o.ledger.merchantEligibleProceedsCents, 0);

  // Filter queues
  const awaitingDeliveryOrders = orders.filter((o) => o.state === 'PAID' || o.state === 'PROCESSING' || o.state === 'SHIPPED');
  const awaitingReleaseOrders = orders.filter((o) => o.state === 'RELEASE_PENDING' || o.state === 'DELIVERY_CONFIRMED');
  const transferredOrders = orders.filter((o) => o.state === 'TRANSFERRED' || o.state === 'PAYOUT_PROCESSING' || o.state === 'PAID_OUT');

  const simulatedDate = new Date(Date.now() + simulatedClockOffsetDays * 86400 * 1000);

  const handleManualDeliveryConfirm = () => {
    if (!selectedOrderForDelivery) return;
    confirmDelivery(selectedOrderForDelivery.id, {
      source: manualDeliverySource,
      notes: manualDeliveryNotes || 'Authorized manual delivery confirmation by platform administrator.',
      confirmedByActorId: 'admin_console_usr1',
      confirmedByActorRole: 'platform_admin',
      timestamp: new Date().toISOString(),
    });
    setSelectedOrderForDelivery(null);
    setManualDeliveryNotes('');
    setActionSuccess(`Order ${selectedOrderForDelivery.orderNumber} delivery confirmed. 3-business-day release period started.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleTriggerTransfer = (orderId: string) => {
    setActionError(null);
    const result = executeTransfer(orderId);
    if (!result.success) {
      setActionError(result.error || 'Transfer failed');
      setTimeout(() => setActionError(null), 5000);
    } else {
      setActionSuccess(`Stripe Transfer executed successfully for order ${orderId}. Funds routed to merchant connected account.`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleExecuteRefund = () => {
    if (!selectedOrderForRefund) return;
    issueRefund(selectedOrderForRefund.id, selectedOrderForRefund.ledger.grossAmountCents, refundReason);
    setSelectedOrderForRefund(null);
    setActionSuccess(`Refund processed for order ${selectedOrderForRefund.orderNumber}.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Platform Payments Header & Live Status */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Payments &amp; Payouts Control Center
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded">
              Stripe Connect Marketplace
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized payment intermediary · Separate charges and transfers · 3-business-day delivery release
          </p>
        </div>

        {/* Integration Status Badges & Time Travel */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Configured status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Connect: Active ({isTestMode ? 'Test Mode' : 'Live'})</span>
          </div>

          {/* Simulated Clock Widget */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-300 font-mono">
              {simulatedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            {simulatedClockOffsetDays > 0 && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800">
                +{simulatedClockOffsetDays}d
              </span>
            )}
            <button
              onClick={() => advanceSimulatedClock(1)}
              className="text-[10px] font-bold bg-sky-600 hover:bg-sky-500 text-white px-2 py-0.5 rounded cursor-pointer transition-colors"
              title="Advance simulated platform clock by 1 day to test release period expiration"
            >
              +1 Day
            </button>
            <button
              onClick={() => advanceSimulatedClock(3)}
              className="text-[10px] font-bold bg-sky-600 hover:bg-sky-500 text-white px-2 py-0.5 rounded cursor-pointer transition-colors"
              title="Advance clock by 3 days"
            >
              +3 Days
            </button>
            {simulatedClockOffsetDays > 0 && (
              <button
                onClick={resetSimulatedClock}
                className="text-[10px] text-slate-400 hover:text-white p-0.5 cursor-pointer"
                title="Reset to current real time"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications / Toast Feedback */}
      {actionSuccess && (
        <div className="bg-emerald-950 border-b border-emerald-800 px-6 py-2.5 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="bg-rose-950 border-b border-rose-800 px-6 py-2.5 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub Navigation Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-6 flex items-center gap-2 overflow-x-auto text-xs py-2 shrink-0">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'overview' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>Financial Overview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'accounts' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Connected Merchants ({Object.keys(connectedAccounts).length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('delivery')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'delivery' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Awaiting Delivery ({awaitingDeliveryOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('release_queue')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'release_queue' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Release Queue ({awaitingReleaseOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('transfers_payouts')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'transfers_payouts' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Transfers &amp; Payouts ({transferredOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('disputes_refunds')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'disputes_refunds' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Disputes &amp; Refunds ({disputes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('webhooks_audit')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'webhooks_audit' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Webhooks &amp; Audit ({auditLogs.length})</span>
        </button>
      </div>

      {/* Main Tab Content Viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* SUBTAB 1: FINANCIAL OVERVIEW */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            {/* Primary KPI Strip (Integer Cents Converted to Formatted USD) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Platform Gross Processed</div>
                <div className="text-2xl font-bold text-white font-mono mt-1">
                  ${(totalGrossCents / 100).toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Across {orders.length} orders
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Platform Commissions Earned</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                  ${(totalPlatformCommissionsCents / 100).toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-500/80 mt-1">
                  {(commissionRateBps / 100).toFixed(1)}% + ${(fixedFeeCents / 100).toFixed(2)} fixed fee
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Funds in Release Period</div>
                <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                  ${(totalPendingReleaseCents / 100).toFixed(2)}
                </div>
                <div className="text-[11px] text-amber-500/80 mt-1">
                  Held on platform awaiting 3-day release
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Merchant Transfers Disbursed</div>
                <div className="text-2xl font-bold text-sky-400 font-mono mt-1">
                  ${(totalTransferredCents / 100).toFixed(2)}
                </div>
                <div className="text-[11px] text-sky-500/80 mt-1">
                  Paid out: ${(totalPaidOutCents / 100).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Configurable Marketplace Settings Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Centralized Commission &amp; Release Policy</h3>
                  <p className="text-xs text-slate-400">
                    Configured by the platform administrator. Governs all tenant stores uniformly.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Platform Commission Rate (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={(commissionRateBps / 100).toFixed(1)}
                      onChange={(e) => updatePlatformSettings({ commissionRateBps: Math.round(parseFloat(e.target.value || '0') * 100) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-sky-500"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Fixed Transaction Fee ($)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.05"
                      value={(fixedFeeCents / 100).toFixed(2)}
                      onChange={(e) => updatePlatformSettings({ fixedFeeCents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-sky-500"
                    />
                    <span className="text-xs text-slate-400">USD</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Holding Period (Business Days)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={holdingPeriodBusinessDays}
                      onChange={(e) => updatePlatformSettings({ holdingPeriodBusinessDays: parseInt(e.target.value) || 3 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-sky-500"
                    />
                    <span className="text-xs text-slate-400">days</span>
                  </div>
                </div>
              </div>

              {/* Regulatory Notice */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-200">Legal Architecture Note:</span> This marketplace operates under Stripe Connect's Separate Charges and Transfers model. The 3-business-day release period is the platform's contractual holding policy before initiating merchant disbursement. It is not licensed legal escrow. All funds remain in the platform's Stripe balance until transfer execution.
              </div>
            </div>

            {/* Recent Orders Ledger Table */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">All Orders &amp; Financial Ledger</h3>
                <span className="text-xs text-slate-400">Tabular minor units (cents) aligned</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">Order</th>
                      <th className="py-2.5 px-3">Merchant</th>
                      <th className="py-2.5 px-3">State</th>
                      <th className="py-2.5 px-3 text-right">Gross</th>
                      <th className="py-2.5 px-3 text-right">Commission</th>
                      <th className="py-2.5 px-3 text-right">Merchant Net</th>
                      <th className="py-2.5 px-3">Release Date</th>
                      <th className="py-2.5 px-3">Stripe IDs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-white">{o.orderNumber}</td>
                        <td className="py-3 px-3 font-sans text-slate-300">{o.merchantStoreName}</td>
                        <td className="py-3 px-3 font-sans">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            o.state === 'PAID_OUT' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            o.state === 'TRANSFERRED' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                            o.state === 'RELEASE_PENDING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                            o.state === 'DISPUTED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {o.state}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-200">
                          ${(o.ledger.grossAmountCents / 100).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400">
                          ${(o.ledger.platformCommissionTotalCents / 100).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-sky-400">
                          ${(o.ledger.merchantEligibleProceedsCents / 100).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 font-sans text-slate-400 text-[11px]">
                          {o.ledger.releaseEligibilityDate
                            ? new Date(o.ledger.releaseEligibilityDate).toLocaleDateString()
                            : 'Pending delivery'}
                        </td>
                        <td className="py-3 px-3 text-[10px] text-slate-500 truncate max-w-[140px]">
                          {o.ledger.stripeTransferId || o.ledger.stripePaymentIntentId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: CONNECTED MERCHANTS */}
        {activeSubTab === 'accounts' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Stripe Connected Merchant Accounts</h3>
                <p className="text-xs text-slate-400">
                  Each merchant operates as an onboarded Stripe Express connected account.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(connectedAccounts).map((acct) => (
                <div key={acct.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{acct.businessName}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{acct.id}</div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      acct.status === 'active'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      {acct.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Charges Enabled:</span>
                      <span className={acct.chargesEnabled ? 'text-emerald-400' : 'text-rose-400'}>
                        {acct.chargesEnabled ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Payouts Enabled:</span>
                      <span className={acct.payoutsEnabled ? 'text-emerald-400' : 'text-rose-400'}>
                        {acct.payoutsEnabled ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Transfers Capability:</span>
                      <span className="text-sky-400">{acct.capabilities.transfers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Payout Schedule:</span>
                      <span className="text-slate-300">{acct.payoutSchedule.interval} ({acct.payoutSchedule.delayDays}d delay)</span>
                    </div>
                  </div>

                  {acct.requirements.currentlyDue.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Outstanding Verification Requirements:</span>
                      </div>
                      <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                        {acct.requirements.currentlyDue.map((req, idx) => (
                          <li key={idx} className="font-mono">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 3: AWAITING DELIVERY CONFIRMATION */}
        {activeSubTab === 'delivery' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-white">Orders Awaiting Delivery Confirmation</h3>
              <p className="text-xs text-slate-400">
                Release clock does not start until delivery is confirmed via carrier tracking webhook, customer receipt confirmation, or authorized admin review.
              </p>
            </div>

            <div className="space-y-3">
              {awaitingDeliveryOrders.map((o) => (
                <div key={o.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{o.orderNumber}</span>
                      <span className="text-xs text-slate-400">· {o.merchantStoreName}</span>
                      <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {o.state}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{o.itemsSummary}</div>
                    <div className="text-xs text-slate-500">
                      Customer: {o.customerName} ({o.customerEmail})
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold text-white font-mono">
                        ${(o.ledger.grossAmountCents / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-sky-400 font-mono">
                        Net: ${(o.ledger.merchantEligibleProceedsCents / 100).toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedOrderForDelivery(o)}
                      className="py-2 px-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                    >
                      Confirm Delivery Evidence
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 4: RELEASE QUEUE (3 BUSINESS DAYS COUNTDOWN) */}
        {activeSubTab === 'release_queue' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-white">Payment Release Queue (3-Business-Day Rule)</h3>
              <p className="text-xs text-slate-400">
                Delivery confirmed orders awaiting expiration of holding period before transfer can be executed.
              </p>
            </div>

            <div className="space-y-3">
              {awaitingReleaseOrders.map((o) => {
                const targetDate = new Date(o.ledger.releaseEligibilityDate || Date.now());
                const isReady = simulatedDate.getTime() >= targetDate.getTime();
                const isDisputed = o.state === 'DISPUTED';

                return (
                  <div key={o.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{o.orderNumber}</span>
                          <span className="text-xs text-slate-400">· {o.merchantStoreName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isReady ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {isReady ? 'ELIGIBLE FOR TRANSFER' : 'HOLDING PERIOD ACTIVE'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{o.itemsSummary}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-bold text-white font-mono">
                            ${(o.ledger.merchantEligibleProceedsCents / 100).toFixed(2)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Release: {targetDate.toLocaleDateString()}
                          </div>
                        </div>

                        <button
                          onClick={() => handleTriggerTransfer(o.id)}
                          disabled={!isReady || isDisputed}
                          className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold cursor-pointer disabled:cursor-not-allowed transition-colors"
                        >
                          Execute Transfer
                        </button>
                      </div>
                    </div>

                    {/* Delivery Evidence Audit Strip */}
                    {o.deliveryEvidence && (
                      <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-400 space-y-1 font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-sans">Evidence Source:</span>
                          <span className="text-slate-300">{o.deliveryEvidence.source}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-sans">Confirmed By:</span>
                          <span className="text-slate-300">{o.deliveryEvidence.confirmedByActorId} ({o.deliveryEvidence.confirmedByActorRole})</span>
                        </div>
                        {o.deliveryEvidence.trackingNumber && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-sans">Tracking Number:</span>
                            <span className="text-sky-400">{o.deliveryEvidence.carrier} {o.deliveryEvidence.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 5: TRANSFERS & PAYOUTS */}
        {activeSubTab === 'transfers_payouts' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-white">Completed Transfers &amp; Bank Payout Tracking</h3>
              <p className="text-xs text-slate-400">
                Stripe transfer IDs, destination connected accounts, and bank payout reconciliation.
              </p>
            </div>

            <div className="space-y-3">
              {transferredOrders.map((o) => (
                <div key={o.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{o.orderNumber}</span>
                      <span className="text-xs text-slate-400">· {o.merchantStoreName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        o.state === 'PAID_OUT' ? 'bg-emerald-950 text-emerald-400' : 'bg-sky-950 text-sky-400'
                      }`}>
                        {o.state}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Transfer ID: {o.ledger.stripeTransferId || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Destination: {o.ledger.stripeConnectedAccountId}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold text-white font-mono">
                        ${(o.ledger.transferredAmountCents / 100).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-emerald-400">
                        {o.ledger.stripePayoutId ? `Payout: ${o.ledger.stripePayoutId}` : 'Awaiting daily bank payout'}
                      </div>
                    </div>

                    {o.state !== 'PAID_OUT' && (
                      <button
                        onClick={() => triggerPayout(o.id)}
                        className="py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                      >
                        Settle Payout
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrderForRefund(o)}
                      className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Refund / Reversal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 6: DISPUTES & REFUNDS */}
        {activeSubTab === 'disputes_refunds' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-bold text-white">Dispute &amp; Chargeback Management</h3>
              <p className="text-xs text-slate-400">
                Opening a dispute immediately freezes merchant transfers until formal evidence review.
              </p>
            </div>

            {disputes.map((d) => (
              <div key={d.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">Dispute for Order {d.orderId}</div>
                    <div className="text-xs text-rose-400 font-semibold uppercase mt-0.5">
                      Reason: {d.reason.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded">
                    STATUS: {d.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {d.evidenceNotes}
                </p>

                {d.status === 'under_review' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => resolveDispute(d.id, 'transfer_proceeded_to_merchant')}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Resolve in Merchant's Favor (Unfreeze Transfer)
                    </button>
                    <button
                      onClick={() => resolveDispute(d.id, 'funds_refunded_to_customer')}
                      className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Resolve in Customer's Favor (Issue Refund)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SUBTAB 7: WEBHOOKS & AUDIT LOGS */}
        {activeSubTab === 'webhooks_audit' && (
          <div className="space-y-6">
            {/* Audit Logs */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Immutable Financial &amp; State Audit Trail</h3>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1 font-mono">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sky-400">{log.action}</span>
                      <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-300 font-sans">
                      Order: <strong>{log.orderId}</strong> · State: <span className="text-slate-400">{log.previousState}</span> → <span className="text-emerald-400 font-bold">{log.newState}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] font-sans">
                      Actor: {log.actor} ({log.actorRole})
                    </div>
                    {log.evidence && (
                      <div className="text-slate-500 text-[10px] truncate">{log.evidence}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Webhook Events */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Stripe Webhook Delivery &amp; Idempotency Log</h3>
              <div className="space-y-2">
                {webhookLogs.map((wh) => (
                  <div key={wh.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 font-mono">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-400">{wh.type}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                        wh.status === 'processed' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {wh.status}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">{wh.payloadSummary}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Delivery Confirmation Modal */}
      {selectedOrderForDelivery && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Confirm Delivery Evidence · {selectedOrderForDelivery.orderNumber}
            </h3>
            <p className="text-xs text-slate-400">
              Only authorized delivery confirmation initiates the 3-business-day release period.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Confirmation Source
                </label>
                <select
                  value={manualDeliverySource}
                  onChange={(e: any) => setManualDeliverySource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="ADMIN_MANUAL">Authorized Admin Manual Review</option>
                  <option value="CARRIER_TRACKING">Verified Carrier Webhook / Tracking</option>
                  <option value="CUSTOMER_CONFIRMATION">Customer Confirmation of Receipt</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Auditable Evidence Notes
                </label>
                <textarea
                  rows={3}
                  value={manualDeliveryNotes}
                  onChange={(e) => setManualDeliveryNotes(e.target.value)}
                  placeholder="Record carrier tracking verification, customer confirmation screenshot, or inspection notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleManualDeliveryConfirm}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs cursor-pointer"
              >
                Confirm &amp; Start 3-Day Release
              </button>
              <button
                onClick={() => setSelectedOrderForDelivery(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {selectedOrderForRefund && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Process Refund / Reversal · {selectedOrderForRefund.orderNumber}
            </h3>
            <p className="text-xs text-slate-400">
              Amount to refund: ${(selectedOrderForRefund.ledger.grossAmountCents / 100).toFixed(2)}
              {selectedOrderForRefund.state === 'TRANSFERRED' && ' (Will initiate Stripe Transfer Reversal from merchant connected account)'}
            </p>

            <input
              type="text"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Reason for refund..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleExecuteRefund}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs cursor-pointer"
              >
                Execute Refund
              </button>
              <button
                onClick={() => setSelectedOrderForRefund(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
