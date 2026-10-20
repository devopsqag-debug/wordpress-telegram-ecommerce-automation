/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingCart, RefreshCw, Megaphone, 
  HelpCircle, Settings, Bell, ArrowUpRight, Shield, 
  Users, QrCode, Plus, Check, Clock, TrendingUp, AlertTriangle, 
  Truck, Star, Send, RotateCw, ExternalLink, Search, Filter,
  DollarSign, CheckCircle2, ChevronRight, Download, Eye, Sparkles,
  Smartphone, Monitor, ShieldCheck, Database, Layers, ArrowRight,
  PackageCheck, Info, X
} from 'lucide-react';
import { useMerchantStore } from '@/mobile/store/useMerchantStore.ts';
import { usePaymentsStore } from '@/mobile/store/usePaymentsStore.ts';
import { AdminRole } from '@/mobile/types.ts';

export const DesktopMerchantPortal: React.FC<{
  onOpenWizard: () => void;
  onSwitchToMobile?: () => void;
}> = ({ onOpenWizard, onSwitchToMobile }) => {
  const { 
    tenant, updateTenant, orders, abandonedCarts, triggerCartRecoveryNudge,
    broadcasts, addBroadcast, faqs, addFaq, removeFaq,
    supportTickets, resolveTicket, reviews, dlqEvents, retryDlqEvent,
    notifications, markNotificationsAsRead, addNotification, setAdminRole,
    addOrder
  } = useMerchantStore();

  const { confirmDelivery, executeTransfer } = usePaymentsStore();

  const [activeNav, setActiveNav] = useState<
    'analytics' | 'orders' | 'recovery' | 'broadcasts' | 'support' | 'inventory' | 'settings' | 'dlq'
  >('analytics');

  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'unfulfilled' | 'fulfilled' | 'delivered'>('all');
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

  // New broadcast form
  const [bcTitle, setBcTitle] = useState('');
  const [bcContent, setBcContent] = useState('');
  const [bcSegment, setBcSegment] = useState<'all' | 'repeat_buyers' | 'vip_spenders' | 'inactive'>('all');

  // New FAQ form
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [faqCat, setFaqCat] = useState('General');

  // Low stock inventory threshold
  const [stockThreshold, setStockThreshold] = useState(5);

  // Analytics Math (Benefit 27)
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const botOrders = orders.filter((o) => o.source === 'telegram_bot');
  const botRevenue = botOrders.reduce((sum, o) => sum + o.total, 0);
  const botSharePct = orders.length > 0 ? Math.round((botOrders.length / orders.length) * 100) : 0;
  const abandonedRate = '31.4%';
  const supportDeflectionRate = '78.2%';

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      (o.customer?.name || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      (o.customer?.email || '').toLowerCase().includes(orderSearchQuery.toLowerCase());
    
    if (orderStatusFilter === 'all') return matchesSearch;
    return matchesSearch && o.fulfillmentStatus === orderStatusFilter;
  });

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
    addNotification('FAQ Added', `Question "${faqQ}" is now live in Telegram bot auto-reply.`, 'system');
  };

  const handleSimulateIncomingOrder = () => {
    const randomOrderNum = `#${Math.floor(1050 + Math.random() * 500)}`;
    const randomNames = ['Liam O’Connor', 'Sofia Ramirez', 'Chloe Nguyen', 'Noah Patel', 'Elena Rostova'];
    const selectedName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const price = Math.floor(30 + Math.random() * 60);

    addOrder({
      id: String(Date.now()),
      orderNumber: randomOrderNum,
      source: 'telegram_bot',
      customer: {
        name: selectedName,
        email: `${selectedName.toLowerCase().replace(/['\s]/g, '.')}@example.com`,
        telegramChatId: 9812491,
        telegramUsername: selectedName.toLowerCase().replace(/['\s]/g, '_'),
        shippingAddress: {
          address1: '100 Pine Street',
          city: 'San Francisco',
          postalCode: '94111',
          country: 'US',
        },
      },
      items: [
        { id: '1', title: 'Minimalist Canvas Tote (Natural Ecru)', quantity: 1, price },
      ],
      total: price,
      currency: 'USD',
      financialStatus: 'paid',
      fulfillmentStatus: 'unfulfilled',
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="flex h-full bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR NAVIGATION */}
      {/* ------------------------------------------------------------- */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        {/* Workspace Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              TC
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white tracking-tight truncate flex items-center gap-1.5">
                <span>{tenant.storeName || 'Artisan Goods'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Bot Live" />
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                @{tenant.botUsername || 'teleshop_bot'} · <span className="text-sky-400 capitalize">{tenant.platform}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Store Connection Status Banner */}
        <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Webhook Live (24/7)</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
            30 msg/s Max
          </span>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
          <button
            onClick={() => setActiveNav('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-left ${
              activeNav === 'analytics'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="flex-1">Analytics &amp; Overview</span>
            <span className="text-[10px] text-sky-200 bg-sky-700/60 px-1.5 py-0.2 rounded font-mono">
              B27
            </span>
          </button>

          <button
            onClick={() => setActiveNav('orders')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-left ${
              activeNav === 'orders'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="flex-1">Live Orders</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveNav('recovery')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-left ${
              activeNav === 'recovery'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="flex-1">Cart Recovery (2h)</span>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800/60 px-1.5 py-0.5 rounded-full font-mono">
              {abandonedCarts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveNav('broadcasts')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-left ${
              activeNav === 'broadcasts'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span className="flex-1">Broadcasts &amp; Segments</span>
            <span className="text-[10px] text-slate-400">B20</span>
          </button>

          <button
            onClick={() => setActiveNav('support')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-left ${
              activeNav === 'support'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="flex-1">Support, FAQ &amp; Reviews</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
              {supportTickets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveNav('inventory')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-left ${
              activeNav === 'inventory'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="flex-1">Low-Stock &amp; Restock</span>
            <span className="text-[10px] text-slate-400">B4</span>
          </button>

          <div className="pt-2 pb-1 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Configuration
          </div>

          <button
            onClick={() => setActiveNav('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-left ${
              activeNav === 'settings'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="flex-1">Bot &amp; 35 Feature Toggles</span>
            <span className="text-[10px] text-emerald-400 font-mono">35/35</span>
          </button>

          <button
            onClick={() => setActiveNav('dlq')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-left ${
              activeNav === 'dlq'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="flex-1">Webhooks &amp; DLQ Retries</span>
            <span className="text-[10px] text-slate-400 font-mono">{dlqEvents.length}</span>
          </button>
        </nav>

        {/* Role Switcher & Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-900/60">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-slate-400 font-medium">Admin Role (B25):</span>
              <span className="font-bold text-sky-400 uppercase text-[10px]">{tenant.adminRole}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(['owner', 'staff', 'viewer'] as AdminRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setAdminRole(r)}
                  className={`py-1 text-[10px] font-semibold rounded capitalize transition-colors cursor-pointer ${
                    tenant.adminRole === r
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code</span>
            </button>
            <button
              onClick={onOpenWizard}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-sky-950 border border-sky-800 hover:bg-sky-900 text-sky-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              <span>Setup Wizard</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN DESKTOP CONTENT WORKSPACE */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* Top Header Bar */}
        <header className="h-14 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-white tracking-tight capitalize">
              {activeNav === 'analytics' && 'Executive Commerce & Bot Analytics'}
              {activeNav === 'orders' && 'Real-Time Order Stream & Carrier Logistics'}
              {activeNav === 'recovery' && 'Automated 2-Hour Cart Recovery Engine'}
              {activeNav === 'broadcasts' && 'Telegram Customer Segmentation & Broadcasts'}
              {activeNav === 'support' && 'Customer Support, Automated FAQ & Review Center'}
              {activeNav === 'inventory' && 'Inventory Replenishment & Low-Stock Alerts'}
              {activeNav === 'settings' && 'Bot Configuration & 35 Tier-1/2 Benefit Toggles'}
              {activeNav === 'dlq' && 'Webhook Reliability, Exponential Backoff & DLQ'}
            </h1>
            <span className="hidden xl:inline-block text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
              Desktop Merchant View
            </span>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Quick Simulate In-Store Order Button */}
            <button
              onClick={handleSimulateIncomingOrder}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Simulate incoming order from Telegram to trigger admin push & group alert (Benefit 1)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Order</span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={markNotificationsAsRead}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors border border-slate-800"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            {onSwitchToMobile && (
              <button
                onClick={onSwitchToMobile}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Switch to Mobile Phone Simulator"
              >
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Mobile Frame</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ANALYTICS & OVERVIEW */}
          {activeNav === 'analytics' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* 4-Column KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span className="font-medium">Telegram Bot GMV</span>
                    <ShoppingCart className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">
                    ${botRevenue.toFixed(2)}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{botSharePct}% of total store orders</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Total revenue across all channels: ${totalRevenue.toFixed(2)}</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span className="font-medium">Cart Abandonment Rate</span>
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">
                    {abandonedRate}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>2-Hour recovery active</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{abandonedCarts.length} carts queued for nudges</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span className="font-medium">Support Deflection</span>
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">
                    {supportDeflectionRate}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-indigo-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Automated in-chat FAQ</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{faqs.length} active Q&amp;A knowledge rules</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span className="font-medium">Per-Message Messaging Cost</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                    $0.00
                  </div>
                  <div className="mt-2 text-xs font-semibold text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>100% Telegram Bot API</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Zero third-party SMS or email fees (Benefit 29)</div>
                </div>
              </div>

              {/* 2-Column Split: Daily Cron Briefing & Quick Launch Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Sales Summary Card (Benefit 24) */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white">Daily Sales Cron Briefing (Benefit 24)</h2>
                        <p className="text-xs text-slate-400">Scheduled automated daily push at 08:00 AM</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addNotification('Daily Summary Sent', 'Scheduled briefing pushed to merchant Telegram chat.', 'system');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Test Summary</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs space-y-2 text-slate-300">
                    <div className="text-sky-400 font-bold flex items-center justify-between">
                      <span>📊 Daily Summary: {tenant.storeName || 'Artisan Goods'}</span>
                      <span className="text-[10px] text-slate-500">Scheduled 08:00 AM</span>
                    </div>
                    <div>• Total Orders: <span className="text-white font-semibold">{orders.length}</span> (via Telegram: {botOrders.length})</div>
                    <div>• Total Gross Revenue: <span className="text-emerald-400 font-semibold">${totalRevenue.toFixed(2)}</span></div>
                    <div>• Bot GMV Share: <span className="text-sky-300 font-semibold">{botSharePct}%</span></div>
                    <div>• Abandoned Carts Recovered: <span className="text-amber-300 font-semibold">4 (${136.00})</span></div>
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                      Dispatched to Owner Telegram Chat via rate-limited queue
                    </div>
                  </div>
                </div>

                {/* Instant Alert Controls & Telegram Group Sync (Benefit 1 & 17) */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">Instant Order &amp; Support Alerts (Benefit 1 &amp; 17)</h2>
                      <p className="text-xs text-slate-400">Merchant push notification &amp; Telegram admin group sync</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">New-Order Admin Alerts (Benefit 1)</div>
                        <div className="text-[11px] text-slate-400">Push notification + immediate group alert</div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        Active
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Human Support Escalation (Benefit 17)</div>
                        <div className="text-[11px] text-slate-400">Customer requests in chat forward to staff chat</div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        Active
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Delivery Review Collector (Benefit 19)</div>
                        <div className="text-[11px] text-slate-400">Sends 1–5 star prompt upon carrier delivery</div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders Preview on Desktop */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">Recent Orders Stream</h2>
                    <p className="text-xs text-slate-400">Real-time sync from Telegram Mini App &amp; Bot checkouts</p>
                  </div>
                  <button
                    onClick={() => setActiveNav('orders')}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all {orders.length} orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="py-2.5 px-3">Order</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Channel</th>
                        <th className="py-2.5 px-3">Items</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Fulfillment</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-white">{o.orderNumber}</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white">{o.customer?.name}</div>
                            <div className="text-[10px] text-slate-500">@{o.customer?.telegramUsername || 'user'}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60">
                              Telegram Bot
                            </span>
                          </td>
                          <td className="py-3 px-3">{o.items.map((i) => `${i.title} (x${i.quantity})`).join(', ')}</td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-400">${o.total.toFixed(2)}</td>
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                              o.fulfillmentStatus === 'fulfilled' || o.fulfillmentStatus === 'delivered'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}>
                              {o.fulfillmentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setSelectedOrderDetails(o)}
                              className="text-xs text-sky-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS FULL WORKSPACE */}
          {activeNav === 'orders' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              {/* Filter Strip */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search orders by number, customer, or email..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['all', 'unfulfilled', 'fulfilled'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setOrderStatusFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                          orderStatusFilter === filter ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Showing {filteredOrders.length} of {orders.length} orders
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Customer Details</th>
                        <th className="py-3 px-4">Items Summary</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Tracking (Benefit 26)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {o.orderNumber}
                            <div className="text-[10px] text-slate-500 font-normal">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{o.customer?.name}</div>
                            <div className="text-[11px] text-slate-400">{o.customer?.email}</div>
                            <div className="text-[10px] text-sky-400">Chat ID: {o.customer?.telegramChatId}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="max-w-xs truncate">
                              {o.items.map((i) => `${i.title} x${i.quantity}`).join(', ')}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                            ${o.total.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            {o.trackingUrl ? (
                              <a
                                href={o.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-mono"
                              >
                                <span>{o.trackingNumber || 'Track Shipment'}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <button
                                onClick={() => {
                                  addNotification(
                                    'Tracking Link Pushed',
                                    `Tracking number UPS-891238 pushed to customer Telegram chat for ${o.orderNumber}.`,
                                    'order'
                                  );
                                }}
                                className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded cursor-pointer transition-colors"
                              >
                                Push Tracking (B26)
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                              o.fulfillmentStatus === 'delivered'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : o.fulfillmentStatus === 'fulfilled'
                                ? 'bg-sky-950 text-sky-400 border border-sky-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}>
                              {o.fulfillmentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedOrderDetails(o)}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                                title="Inspect Order"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CART RECOVERY */}
          {activeNav === 'recovery' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <h2 className="text-base font-bold text-white">Abandoned Cart Recovery Engine (Benefit 2)</h2>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Automatically monitors customers who added items to their cart inside Telegram but did not complete checkout. After the configured 2-hour holding period, TeleShop dispatches a personalized recovery nudge with an optional first-order incentive.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Recovery Timer</div>
                    <div className="text-sm font-bold text-amber-400 font-mono">2 Hours (Configurable)</div>
                  </div>
                </div>
              </div>

              {/* Abandoned Carts Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Queued Abandoned Carts ({abandonedCarts.length})
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Scheduled Cron: Runs every 15 minutes
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Telegram Chat</th>
                        <th className="py-3 px-4">Items in Cart</th>
                        <th className="py-3 px-4">Cart Value</th>
                        <th className="py-3 px-4">Abandoned Since</th>
                        <th className="py-3 px-4 text-right">Manual Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {abandonedCarts.map((cart) => (
                        <tr key={cart.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-semibold text-white">{cart.customerName}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">Telegram Chat</td>
                          <td className="py-3 px-4">{cart.itemsSummary}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">${cart.amount.toFixed(2)}</td>
                          <td className="py-3 px-4 text-amber-400 font-mono">{cart.hoursAgo}h ago</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => triggerCartRecoveryNudge(cart.id)}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Send Nudge Now</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BROADCASTS & SEGMENTATION */}
          {activeNav === 'broadcasts' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {/* Left 2 Cols: Broadcast Composer */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-sky-400" />
                    <div>
                      <h2 className="text-sm font-bold text-white">Create Telegram Broadcast (Benefit 20 &amp; 21)</h2>
                      <p className="text-xs text-slate-400">Zero per-message cost through official Telegram Bot API queue</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Broadcast Title / Campaign</label>
                      <input
                        type="text"
                        placeholder="e.g. Flash Restock: Ceramic Pour-Over Drippers"
                        value={bcTitle}
                        onChange={(e) => setBcTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Target Segment (Benefit 21)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['all', 'repeat_buyers', 'vip_spenders', 'inactive'] as const).map((seg) => (
                          <button
                            key={seg}
                            type="button"
                            onClick={() => setBcSegment(seg)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                              bcSegment === seg
                                ? 'bg-sky-950 border-sky-500 text-white font-semibold'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <div className="capitalize text-xs font-bold">{seg.replace('_', ' ')}</div>
                            <div className="text-[10px] opacity-75">
                              {seg === 'all' && 'All subscribers'}
                              {seg === 'repeat_buyers' && '>= 2 orders'}
                              {seg === 'vip_spenders' && 'Spent > $150'}
                              {seg === 'inactive' && 'No order > 30d'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Broadcast Message Body (Markdown)</label>
                      <textarea
                        rows={4}
                        placeholder="Type your message here... markdown supported like *bold* and _italic_."
                        value={bcContent}
                        onChange={(e) => setBcContent(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 font-mono text-xs"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleCreateBroadcast}
                        className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>Queue Broadcast via 30 msg/s Queue</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sent Broadcasts Log */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Broadcast History ({broadcasts.length})
                  </h3>
                  <div className="space-y-3">
                    {broadcasts.map((b) => (
                      <div key={b.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{b.title}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                            Delivered ({b.deliveredCount} chats)
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-mono leading-relaxed">{b.content}</p>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>Segment: <span className="text-sky-400 capitalize">{b.segment.replace('_', ' ')}</span></span>
                          <span>·</span>
                          <span>{b.sentAt || 'Recently'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Live Telegram Preview */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-sky-400" />
                    <span>In-Chat Subscriber Preview</span>
                  </h3>
                  <div className="p-4 rounded-2xl bg-[#0e1621] border border-slate-800 text-white space-y-3 font-sans text-xs">
                    <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                      <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-xs font-bold">
                        TC
                      </div>
                      <div>
                        <div className="font-bold text-xs">{tenant.storeName || 'Artisan Goods'}</div>
                        <div className="text-[10px] text-slate-400">bot</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#182533] space-y-2">
                      <div className="font-bold text-sky-400">{bcTitle || 'Sample Broadcast Headline'}</div>
                      <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {bcContent || 'Exclusive 24-hour flash restock on our best-selling ceramic pour-overs! Tap below to order inside Telegram.'}
                      </div>
                      <div className="pt-2">
                        <div className="w-full py-1.5 rounded-lg bg-[#2b5278] hover:bg-[#2b5278]/80 text-center font-bold text-xs cursor-pointer">
                          🛍️ Open Mini App Store
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORT & FAQS */}
          {activeNav === 'support' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
              {/* FAQ Knowledge Base Editor (Benefit 14) */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">Automated FAQ Knowledge Base (Benefit 14)</h2>
                    <p className="text-xs text-slate-400">Configurable Q&amp;A pairs answered automatically in bot chat</p>
                  </div>
                  <span className="text-xs text-sky-400 font-mono font-bold">{faqs.length} Rules</span>
                </div>

                {/* Add new FAQ */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="font-bold text-slate-200">Add New FAQ Match Rule</div>
                  <div>
                    <input
                      type="text"
                      placeholder="Customer Question (e.g. What is your return policy?)"
                      value={faqQ}
                      onChange={(e) => setFaqQ(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      placeholder="Automated Answer (e.g. We accept returns within 30 days of delivery...)"
                      value={faqA}
                      onChange={(e) => setFaqA(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleCreateFaq}
                      className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold cursor-pointer transition-colors"
                    >
                      Save FAQ Rule
                    </button>
                  </div>
                </div>

                {/* Existing FAQs */}
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {faqs.map((f) => (
                    <div key={f.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 relative group">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{f.question}</span>
                        <button
                          onClick={() => removeFaq(f.id)}
                          className="text-[10px] text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-xs text-slate-300">{f.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Tickets Escalation Queue (Benefit 16 & 17) */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-white">Escalated Human Support Tickets (Benefit 17)</h2>
                  <p className="text-xs text-slate-400">Customer requests forwarded from Telegram chat to merchant staff</p>
                </div>

                <div className="space-y-3">
                  {supportTickets.map((t) => (
                    <div key={t.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{t.customerName}</span>
                          <span className="text-[10px] text-slate-500">(@{t.telegramUsername})</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                          t.status === 'open'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 italic">"{t.message}"</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500">{t.createdAt}</span>
                        {t.status === 'open' && (
                          <button
                            onClick={() => resolveTicket(t.id)}
                            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-400 cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Reviews (Benefit 19) */}
                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                    Delivered Customer Ratings (Benefit 19)
                  </h3>
                  <div className="space-y-2">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-white">{r.customerName} · Order {r.orderNumber}</div>
                          {r.comment && <div className="text-[11px] text-slate-400 italic">"{r.comment}"</div>}
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{r.rating}.0</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INVENTORY & LOW-STOCK */}
          {activeNav === 'inventory' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <h2 className="text-base font-bold text-white">Low-Stock &amp; Back-in-Stock Alerts (Benefit 3 &amp; 4)</h2>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Automatically checks Shopify and WooCommerce inventory levels. When product variant quantity falls at or below threshold, alerts are dispatched to the merchant. When restocked, subscribed customers receive back-in-stock notifications.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-400">Alert Threshold:</label>
                  <select
                    value={stockThreshold}
                    onChange={(e) => setStockThreshold(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  >
                    <option value={3}>3 units</option>
                    <option value={5}>5 units (Default)</option>
                    <option value={10}>10 units</option>
                  </select>
                </div>
              </div>

              {/* Sample Inventory Items */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-3 px-4">Product Variant</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Stock On Hand</th>
                      <th className="py-3 px-4">Threshold</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-white">Japanese Ceramic Pour-Over Dripper (Matte White)</td>
                      <td className="py-3 px-4 font-mono text-slate-400">CERAM-DRP-01</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">3 units</td>
                      <td className="py-3 px-4 font-mono">{stockThreshold} units</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                          Low Stock Alert Dispatched
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            addNotification('Back-in-Stock Alert Sent', '34 subscribed customers notified of Ceramic Dripper restock.', 'system');
                          }}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white text-xs font-semibold cursor-pointer"
                        >
                          Simulate Restock (B3)
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-white">Heavyweight Waffle Knit Overshirt (Olive / M)</td>
                      <td className="py-3 px-4 font-mono text-slate-400">WFL-SHT-OLV-M</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">6 units</td>
                      <td className="py-3 px-4 font-mono">{stockThreshold} units</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          Adequate Stock
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[11px] text-slate-500">Monitoring</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-white">Minimalist Canvas Tote (Natural Ecru)</td>
                      <td className="py-3 px-4 font-mono text-slate-400">TOTE-CAN-ECR</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">14 units</td>
                      <td className="py-3 px-4 font-mono">{stockThreshold} units</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          Adequate Stock
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[11px] text-slate-500">Monitoring</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: BOT SETTINGS & 35 FEATURE TOGGLES */}
          {activeNav === 'settings' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Bot Info Header */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white">Telegram Bot &amp; E-Commerce Store Integration</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Store: <span className="text-white font-semibold">{tenant.storeName}</span> ({tenant.platform}) · Bot: <span className="text-sky-400">@{tenant.botUsername}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenWizard}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    Re-Run 6-Screen Setup Wizard
                  </button>
                </div>
              </div>

              {/* 35 Feature Toggles Checklist */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Active Feature Capabilities</h3>
                    <p className="text-xs text-slate-400">Tier 1 &amp; Tier 2 Benefits Checklist</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                    35/35 Activated
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {[
                    'Instant new-order alerts (B1)',
                    'Abandoned cart recovery (B2)',
                    'Back-in-stock / price-drop alerts (B3)',
                    'Low-stock alerts to admin (B4)',
                    'Saved addresses & 1-tap reorder (B5)',
                    'Loyalty points & repeat nudges (B6)',
                    'Referral program automation (B7)',
                    'In-chat catalog browsing (B8)',
                    'In-chat checkout & Stripe Connect (B9)',
                    'Payment links & invoices (B10)',
                    'Wishlist & customer favorites (B11)',
                    'Inline mode sharing @bot (B12)',
                    'Order status notifications (B13)',
                    'Automated FAQ Q&A answers (B14)',
                    'Order lookup /orders command (B15)',
                    'Refund / return request handling (B16)',
                    'Escalation to human support (B17)',
                    '24/7 server-side availability (B18)',
                    'Post-delivery reviews 1-5 star (B19)',
                    'Broadcast announcements (B20)',
                    'Customer segmentation (B21)',
                    'Personalized recommendations (B22)',
                    'Store QR code generation (B23)',
                    'Daily sales summary cron (B24)',
                    'Role-based admin access (B25)',
                    'Shipping tracking auto-push (B26)',
                    'Basic analytics dashboard (B27)',
                    'Webhook retry & DLQ (B28)',
                    'Zero per-message cost (B29)',
                    'Multi-language EN+ES (B30)',
                    '6-screen guided setup wizard (B31)',
                    'Platform-native adapters (B32)',
                    'AES-256 credential storage (B33)',
                    'GDPR /delete_my_data (B34)',
                    'Welcome sequence & 10% incentive (B35)',
                  ].map((benefit, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium text-slate-200">{benefit}</span>
                      </div>
                      <span className="text-[10px] text-emerald-500 font-bold uppercase">ON</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: DLQ & WEBHOOK RELIABILITY */}
          {activeNav === 'dlq' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-sky-400" />
                    <h2 className="text-base font-bold text-white">Webhook Reliability &amp; Dead-Letter Queue (Benefit 28)</h2>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Incoming Shopify, WooCommerce, and Telegram webhooks are verified via HMAC SHA-256 signatures. Transient errors trigger exponential backoff retry schedules (30s, 2m, 8m, 32m). Failed payloads route to the dead-letter queue for inspection and replay.
                  </p>
                </div>
              </div>

              {/* DLQ Events Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Recent Webhook Events &amp; DLQ Retries ({dlqEvents.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="py-3 px-4">Event ID</th>
                        <th className="py-3 px-4">Source</th>
                        <th className="py-3 px-4">Topic</th>
                        <th className="py-3 px-4">Retry Attempts</th>
                        <th className="py-3 px-4">Error / Status</th>
                        <th className="py-3 px-4 text-right">Replay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {dlqEvents.map((evt) => (
                        <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-white">{evt.id}</td>
                          <td className="py-3 px-4 uppercase font-semibold text-sky-400">Webhook</td>
                          <td className="py-3 px-4 font-mono">{evt.topic}</td>
                          <td className="py-3 px-4 font-mono">{evt.attempt} of 5</td>
                          <td className="py-3 px-4 text-amber-400">{evt.lastError}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => retryDlqEvent(evt.id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                              <span>Retry Now</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* QR CODE MODAL (Benefit 23) */}
      {/* ------------------------------------------------------------- */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Store QR Code (Benefit 23)</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Print or share this QR code in-store or on social media so customers can start shopping immediately inside Telegram.
            </p>
            {/* SVG QR Code Simulation */}
            <div className="p-6 bg-white rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                <rect width="100" height="100" fill="white" />
                {/* QR Finder patterns */}
                <rect x="10" y="10" width="25" height="25" fill="black" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="18" y="18" width="9" height="9" fill="black" />

                <rect x="65" y="10" width="25" height="25" fill="black" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="73" y="18" width="9" height="9" fill="black" />

                <rect x="10" y="65" width="25" height="25" fill="black" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="18" y="73" width="9" height="9" fill="black" />

                {/* QR Data Grid Matrix */}
                <rect x="40" y="12" width="6" height="6" fill="black" />
                <rect x="52" y="12" width="6" height="6" fill="black" />
                <rect x="45" y="24" width="6" height="6" fill="black" />
                <rect x="40" y="38" width="8" height="8" fill="black" />
                <rect x="54" y="38" width="6" height="6" fill="black" />
                <rect x="12" y="44" width="6" height="6" fill="black" />
                <rect x="24" y="44" width="6" height="6" fill="black" />
                <rect x="70" y="44" width="6" height="6" fill="black" />
                <rect x="80" y="44" width="6" height="6" fill="black" />
                <rect x="40" y="55" width="6" height="6" fill="black" />
                <rect x="52" y="55" width="8" height="8" fill="black" />
                <rect x="45" y="70" width="8" height="8" fill="black" />
                <rect x="65" y="70" width="6" height="6" fill="black" />
                <rect x="78" y="70" width="8" height="8" fill="black" />
                <rect x="40" y="82" width="6" height="6" fill="black" />
                <rect x="55" y="82" width="6" height="6" fill="black" />
                <rect x="70" y="82" width="6" height="6" fill="black" />
                <rect x="85" y="82" width="6" height="6" fill="black" />
              </svg>
            </div>
            <div className="font-mono text-xs text-sky-400 font-bold">
              https://t.me/{tenant.botUsername || 'teleshop_bot'}?start=ref_store
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://t.me/${tenant.botUsername || 'teleshop_bot'}?start=ref_store`);
                  addNotification('QR Link Copied', 'Telegram bot link copied to clipboard.', 'system');
                  setShowQrModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Copy Bot Sharing Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ORDER INSPECTOR MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  Order {selectedOrderDetails.orderNumber}
                </h3>
                <span className="text-xs text-slate-400">
                  Channel: Telegram Bot · {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium">Customer Information</div>
                <div className="text-white font-semibold">{selectedOrderDetails.customer?.name}</div>
                <div className="text-slate-400">{selectedOrderDetails.customer?.email}</div>
                <div className="text-sky-400 font-mono">Telegram ID: {selectedOrderDetails.customer?.telegramChatId}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="text-slate-400 font-medium">Order Items</div>
                {selectedOrderDetails.items.map((i: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-white">
                    <span>{i.title} (x{i.quantity})</span>
                    <span className="font-mono font-bold">${i.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
                  <span>Total Gross</span>
                  <span className="text-emerald-400 font-mono">${selectedOrderDetails.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    confirmDelivery(selectedOrderDetails.id, {
                      source: 'ADMIN_MANUAL',
                      notes: 'Manual delivery confirmation from Desktop Merchant Portal',
                      confirmedByActorId: 'merchant_portal',
                      confirmedByActorRole: 'platform_admin',
                      timestamp: new Date().toISOString()
                    });
                    addNotification('Delivery Confirmed', `Order ${selectedOrderDetails.orderNumber} delivery confirmed. 3-day release countdown started.`, 'order');
                    setSelectedOrderDetails(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors"
                >
                  Confirm Delivery
                </button>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
