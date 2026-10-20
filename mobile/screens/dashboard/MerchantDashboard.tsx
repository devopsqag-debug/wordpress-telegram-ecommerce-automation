/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingCart, RefreshCw, Megaphone, 
  HelpCircle, Settings, Bell, ArrowUpRight, Shield, 
  Users, QrCode, Plus, Check, Clock, TrendingUp, AlertTriangle, 
  Truck, Star, Send, RotateCw, ExternalLink
} from 'lucide-react';
import { useMerchantStore } from '../../store/useMerchantStore.ts';
import { AdminRole } from '../../types.ts';

export const MerchantDashboard: React.FC<{ onOpenWizard: () => void }> = ({ onOpenWizard }) => {
  const { 
    tenant, updateTenant, orders, abandonedCarts, triggerCartRecoveryNudge,
    broadcasts, addBroadcast, faqs, addFaq, removeFaq,
    supportTickets, resolveTicket, reviews, dlqEvents, retryDlqEvent,
    notifications, markNotificationsAsRead, addNotification, setAdminRole
  } = useMerchantStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'recovery' | 'marketing' | 'support' | 'settings'>('overview');
  const [showQrModal, setShowQrModal] = useState(false);

  // New broadcast form
  const [bcTitle, setBcTitle] = useState('');
  const [bcContent, setBcContent] = useState('');
  const [bcSegment, setBcSegment] = useState<'all' | 'repeat_buyers' | 'vip_spenders' | 'inactive'>('all');

  // New FAQ form
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [faqCat, setFaqCat] = useState('General');

  // Analytics Math (Benefit 27)
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const botOrders = orders.filter((o) => o.source === 'telegram_bot');
  const botRevenue = botOrders.reduce((sum, o) => sum + o.total, 0);
  const botSharePct = orders.length > 0 ? Math.round((botOrders.length / orders.length) * 100) : 0;
  const abandonedRate = '31.4%';
  const supportDeflectionRate = '78.2%';

  const handleCreateBroadcast = () => {
    if (!bcTitle || !bcContent) return;
    addBroadcast({
      title: bcTitle,
      content: bcContent,
      segment: bcSegment,
    });
    setBcTitle('');
    setBcContent('');
    addNotification('Broadcast Queued', `Message sent to ${bcSegment} segment via rate-limited queue.`, 'system');
  };

  const handleCreateFaq = () => {
    if (!faqQ || !faqA) return;
    addFaq({
      question: faqQ,
      answer: faqA,
      category: faqCat,
    });
    setFaqQ('');
    setFaqA('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 overflow-hidden font-sans select-none">
      {/* Top Merchant App Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            TC
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
              <span>{tenant.storeName}</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                Live
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              @{tenant.botUsername} · Role: <span className="font-semibold text-slate-700 capitalize">{tenant.adminRole}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications bell */}
          <button
            onClick={markNotificationsAsRead}
            className="relative p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.some((n) => !n.read) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {/* Quick QR button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Generate Store QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Setup wizard re-run */}
          <button
            onClick={onOpenWizard}
            className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg cursor-pointer"
          >
            Wizard
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-3 flex items-center gap-1 overflow-x-auto text-xs shrink-0 py-1.5">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'recovery' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recovery ({abandonedCarts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'marketing' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Broadcasts</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'support' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Support &amp; FAQ</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Main Tab Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Telegram GMV</div>
                <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                  ${botRevenue.toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>{botSharePct}% of total orders</span>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Cart Abandonment</div>
                <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                  {abandonedRate}
                </div>
                <div className="text-[10px] text-sky-600 font-semibold mt-1">
                  2h timer recovery active
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Support Deflection</div>
                <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                  {supportDeflectionRate}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Automated FAQ answers
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Per-Message Cost</div>
                <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">
                  $0.00
                </div>
                <div className="text-[10px] text-emerald-700 mt-1">
                  100% Telegram Bot API
                </div>
              </div>
            </div>

            {/* Daily Summary Box (Benefit 24) */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold">Daily Sales Cron Briefing (Benefit 24)</span>
                </div>
                <button
                  onClick={() => {
                    addNotification('Daily Summary Sent', 'Scheduled briefing pushed to merchant Telegram chat.', 'system');
                  }}
                  className="text-[10px] font-semibold bg-white/20 hover:bg-white/30 px-2 py-1 rounded cursor-pointer transition-colors"
                >
                  Trigger Test Cron
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated daily executive summary is scheduled to dispatch to the owner's Telegram every day at 8:00 AM, detailing revenue, order breakdown, and cart recoveries.
              </p>
            </div>

            {/* Recent Orders List Preview */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-2">
                {orders.map((o) => (
                  <div key={o.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{o.orderNumber}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          o.source === 'telegram_bot' ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {o.source === 'telegram_bot' ? 'Telegram' : 'Web'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {o.customer.name} · {o.items.length} item(s)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 font-mono">${o.total.toFixed(2)}</div>
                      <div className="text-[10px] font-medium text-emerald-600 capitalize">{o.fulfillmentStatus}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS & TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Store Orders</h3>
                <p className="text-xs text-slate-500">Track shipments, dispatch tracking URLs, and handle returns.</p>
              </div>
            </div>

            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{o.orderNumber}</span>
                        <span className="text-[10px] bg-sky-50 text-sky-700 font-semibold px-2 py-0.5 rounded">
                          {o.source === 'telegram_bot' ? '📱 Telegram' : '🌐 Web'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Customer: <span className="font-medium text-slate-800">{o.customer.name}</span> {o.customer.telegramUsername ? `(@${o.customer.telegramUsername})` : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 font-mono">${o.total.toFixed(2)}</div>
                      <div className="text-xs font-semibold text-emerald-600 uppercase">{o.financialStatus}</div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-2.5 rounded-lg bg-slate-50 text-xs space-y-1">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>{it.title} x{it.quantity}</span>
                        <span className="font-mono">${it.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tracking Link (Benefit 26) */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Truck className="w-4 h-4 text-sky-600" />
                      <span>{o.trackingNumber ? `USPS: ${o.trackingNumber}` : 'Awaiting fulfillment'}</span>
                    </div>

                    {o.fulfillmentStatus === 'unfulfilled' ? (
                      <button
                        onClick={() => {
                          addNotification('Tracking Pushed', `Order ${o.orderNumber} fulfilled with tracking. Customer notified on Telegram!`, 'order');
                        }}
                        className="py-1.5 px-3 rounded-lg bg-sky-600 text-white text-xs font-semibold cursor-pointer hover:bg-sky-500"
                      >
                        Push Tracking Link
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        ✓ Tracking Sent to Telegram
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RECOVERY & RETENTION */}
        {activeTab === 'recovery' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Abandoned Cart Recovery (Benefit 2)</h3>
                  <p className="text-xs text-slate-500">Automated 2-hour timer sends Telegram nudges with discount incentives.</p>
                </div>
                <div className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded">
                  Timer: {tenant.recoveryTimerHours} hours
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                {abandonedCarts.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{c.customerName}</div>
                      <div className="text-[11px] text-slate-600">{c.itemsSummary}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Abandoned {c.hoursAgo} hours ago · Cart: ${c.amount.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      {c.nudged ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                          ✓ Nudge Dispatched
                        </span>
                      ) : (
                        <button
                          onClick={() => triggerCartRecoveryNudge(c.id)}
                          className="py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs cursor-pointer shadow-xs"
                        >
                          Send Recovery Nudge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Back in stock alerts info (Benefit 3) */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Back-in-Stock &amp; Price-Drop Alerts (Benefit 3)</h3>
              <p className="text-xs text-slate-600">
                14 customers currently subscribed to restock notifications for <em>Japanese Ceramic Pour-Over Dripper</em>. Automated Telegram alerts trigger whenever inventory replenishes.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: MARKETING & REACH */}
        {activeTab === 'marketing' && (
          <div className="space-y-4">
            {/* New Broadcast Composer */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Broadcast Announcement (Benefit 20 &amp; 21)</h3>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Segment (Benefit 21)
                  </label>
                  <select
                    value={bcSegment}
                    onChange={(e: any) => setBcSegment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="all">All Subscribers (412 customers)</option>
                    <option value="repeat_buyers">Repeat Buyers (&gt;2 orders)</option>
                    <option value="vip_spenders">VIP Spenders (&gt;$100 lifetime)</option>
                    <option value="inactive">Inactive (&gt;30 days without order)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Weekend Flash Sale & Free Shipping"
                    value={bcTitle}
                    onChange={(e) => setBcTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
                  <textarea
                    rows={3}
                    placeholder="Write announcement with discount codes or new arrival links..."
                    value={bcContent}
                    onChange={(e) => setBcContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  onClick={handleCreateBroadcast}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Schedule &amp; Broadcast (30 msg/sec queue)</span>
                </button>
              </div>
            </div>

            {/* Past broadcasts */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Broadcast History
              </h3>
              <div className="space-y-2">
                {broadcasts.map((bc) => (
                  <div key={bc.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{bc.title}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold uppercase">✓ Sent</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{bc.content}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Delivered to {bc.deliveredCount} customers · Segment: {bc.segment}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SUPPORT & REVIEWS */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            {/* FAQ Manager (Benefit 14) */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Automated FAQ Q&amp;A Pairs (Benefit 14)</h3>
              <div className="space-y-2">
                {faqs.map((f) => (
                  <div key={f.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 relative group">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Q: {f.question}</span>
                      <button
                        onClick={() => removeFaq(f.id)}
                        className="text-[11px] text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-slate-600 text-[11px]">A: {f.answer}</p>
                  </div>
                ))}
              </div>

              {/* Add FAQ form */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <input
                  type="text"
                  placeholder="New Question (e.g. How long does shipping take?)"
                  value={faqQ}
                  onChange={(e) => setFaqQ(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
                <input
                  type="text"
                  placeholder="Answer..."
                  value={faqA}
                  onChange={(e) => setFaqA(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={handleCreateFaq}
                  className="py-2 px-3 rounded-xl bg-slate-900 text-white font-semibold text-xs cursor-pointer hover:bg-slate-800"
                >
                  Add FAQ Pair
                </button>
              </div>
            </div>

            {/* Human Escalations (Benefit 17) */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Human Escalation Inbox (Benefit 17)</h3>
              {supportTickets.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">{t.customerName} (@{t.telegramUsername})</span>
                    <span className="text-[10px] font-semibold text-amber-700 uppercase">{t.status}</span>
                  </div>
                  <div className="font-semibold text-slate-800">{t.subject}</div>
                  <p className="text-slate-600 text-[11px]">{t.message}</p>
                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => window.open(`https://t.me/${t.telegramUsername}`, '_blank')}
                      className="py-1 px-2.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold cursor-pointer"
                    >
                      Reply in Telegram
                    </button>
                    {t.status === 'open' && (
                      <button
                        onClick={() => resolveTicket(t.id)}
                        className="py-1 px-2.5 rounded bg-white border border-slate-300 text-slate-700 text-[11px] font-semibold cursor-pointer hover:bg-slate-50"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reviews (Benefit 19) */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Delivery Feedback &amp; Reviews (Benefit 19)</h3>
              <div className="space-y-2">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{rev.customerName} · Order {rev.orderNumber}</span>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-[11px] italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & OPERATIONS */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Role-Based Admin Access (Benefit 25) */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Role-Based Admin Access (Benefit 25)</h3>
              <p className="text-xs text-slate-600">
                Switch or grant roles: Owner (full settings &amp; webhooks), Staff (orders &amp; support), Viewer (read-only analytics).
              </p>
              <div className="flex gap-2 pt-1">
                {(['owner', 'staff', 'viewer'] as AdminRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setAdminRole(role)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                      tenant.adminRole === role
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* DLQ / Reliability (Benefit 28) */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Webhook Retry &amp; Dead-Letter Queue (Benefit 28)</h3>
                  <p className="text-xs text-slate-500">Exponential backoff with automatic retry.</p>
                </div>
              </div>

              <div className="space-y-2">
                {dlqEvents.map((evt) => (
                  <div key={evt.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">{evt.topic} ({evt.id})</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        evt.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {evt.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">{evt.lastError}</div>
                    {evt.status === 'pending_retry' && (
                      <button
                        onClick={() => retryDlqEvent(evt.id)}
                        className="py-1 px-3 rounded-lg bg-sky-600 text-white text-[11px] font-semibold cursor-pointer hover:bg-sky-500 flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Force Immediate Retry</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Low-stock Threshold */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Low Stock Safety Threshold (Benefit 4)</h3>
              <p className="text-xs text-slate-600">
                Pushes a Telegram notification whenever any product drops to or below this quantity.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="number"
                  value={tenant.lowStockThreshold}
                  onChange={(e) => updateTenant({ lowStockThreshold: parseInt(e.target.value) || 5 })}
                  className="w-24 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                />
                <span className="text-xs text-slate-500">units remaining</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal (Benefit 23) */}
      {showQrModal && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">
              Bot QR Code (Benefit 23)
            </h3>
            <p className="text-xs text-slate-500">
              Print for in-store displays or share on social media.
            </p>

            {/* Clean SVG QR Code */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block mx-auto">
              <svg viewBox="0 0 120 120" className="w-36 h-36 mx-auto">
                {/* Visual stylised QR pattern */}
                <rect x="0" y="0" width="120" height="120" fill="#ffffff" />
                {/* Top left corner */}
                <rect x="10" y="10" width="30" height="30" fill="#0f172a" />
                <rect x="16" y="16" width="18" height="18" fill="#ffffff" />
                <rect x="20" y="20" width="10" height="10" fill="#0f172a" />
                {/* Top right corner */}
                <rect x="80" y="10" width="30" height="30" fill="#0f172a" />
                <rect x="86" y="16" width="18" height="18" fill="#ffffff" />
                <rect x="90" y="20" width="10" height="10" fill="#0f172a" />
                {/* Bottom left corner */}
                <rect x="10" y="80" width="30" height="30" fill="#0f172a" />
                <rect x="16" y="86" width="18" height="18" fill="#ffffff" />
                <rect x="20" y="90" width="10" height="10" fill="#0f172a" />
                {/* QR matrix dots */}
                <rect x="50" y="20" width="8" height="8" fill="#0f172a" />
                <rect x="62" y="20" width="8" height="8" fill="#0f172a" />
                <rect x="50" y="32" width="8" height="8" fill="#0f172a" />
                <rect x="20" y="50" width="8" height="8" fill="#0f172a" />
                <rect x="32" y="50" width="8" height="8" fill="#0f172a" />
                <rect x="50" y="50" width="20" height="20" fill="#0284c7" />
                <rect x="80" y="50" width="8" height="8" fill="#0f172a" />
                <rect x="92" y="62" width="8" height="8" fill="#0f172a" />
                <rect x="50" y="80" width="8" height="8" fill="#0f172a" />
                <rect x="62" y="92" width="8" height="8" fill="#0f172a" />
                <rect x="80" y="80" width="8" height="8" fill="#0f172a" />
                <rect x="92" y="92" width="8" height="8" fill="#0f172a" />
              </svg>
            </div>

            <div className="text-xs font-mono text-slate-700">
              t.me/{tenant.botUsername}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
