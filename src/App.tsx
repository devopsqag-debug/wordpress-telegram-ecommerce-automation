/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Smartphone, ShoppingBag, Bot, Code2, 
  RotateCcw, Sparkles, Plus, ExternalLink, 
  CheckCircle2, AlertTriangle, ArrowRight, Layers,
  DollarSign, Building2, ShieldCheck, Monitor, Globe
} from 'lucide-react';
import { useMerchantStore } from '@/mobile/store/useMerchantStore.ts';
import { SetupWizardNavigator } from '@/mobile/screens/wizard/SetupWizardNavigator.tsx';
import { MerchantDashboard } from '@/mobile/screens/dashboard/MerchantDashboard.tsx';
import { DesktopMerchantPortal } from '@/src/components/desktop/DesktopMerchantPortal.tsx';
import { MiniAppStorefront } from '@/mini-app/MiniAppStorefront.tsx';
import { TelegramBotSimulator } from '@/mobile/components/TelegramBotSimulator.tsx';
import { ArchitectureViewer } from '@/mobile/components/ArchitectureViewer.tsx';
import { SaaSPlatformPaymentsHub } from '@/src/components/payments/SaaSPlatformPaymentsHub.tsx';
import { MerchantPaymentsDashboard } from '@/src/components/payments/MerchantPaymentsDashboard.tsx';
import { PaymentsTestHarness } from '@/src/components/payments/PaymentsTestHarness.tsx';
import { WordPressPluginCloudflareDemo } from '@/src/components/demo/WordPressPluginCloudflareDemo.tsx';
import { FlotraqFloatingBanner } from '@/src/components/common/FlotraqFloatingBanner.tsx';

export default function App() {
  const { 
    wizardStep, setWizardStep, tenant, 
    notifications, addNotification, addOrder, orders 
  } = useMerchantStore();

  const [activeView, setActiveView] = useState<
    'desktop_merchant' | 'wp_cloudflare_demo' | 'merchant' | 'payments_admin' | 'merchant_finance' | 'miniapp' | 'bot' | 'qa_harness' | 'code'
  >('desktop_merchant');
  const [deviceFrame, setDeviceFrame] = useState(true);
  const [isWizardMode, setIsWizardMode] = useState(false);
  const [showChecklistSidebar, setShowChecklistSidebar] = useState(false);

  // Quick Action to simulate incoming new order from Telegram (Benefit 1)
  const handleSimulateNewOrder = () => {
    const randomOrderNum = `#${Math.floor(1050 + Math.random() * 500)}`;
    const randomNames = ['Liam O’Connor', 'Sofia Ramirez', 'Chloe Nguyen', 'Noah Patel'];
    const selectedName = randomNames[Math.floor(Math.random() * randomNames.length)];

    addOrder({
      id: String(Date.now()),
      orderNumber: randomOrderNum,
      source: 'telegram_bot',
      customer: {
        name: selectedName,
        email: `${selectedName.toLowerCase().replace(' ', '.')}@example.com`,
        telegramChatId: 9812491,
        telegramUsername: selectedName.toLowerCase().replace(' ', '_'),
        shippingAddress: {
          address1: '100 Pine Street',
          city: 'San Francisco',
          postalCode: '94111',
          country: 'US',
        },
      },
      items: [
        { id: '1', title: 'Minimalist Canvas Tote (Natural Ecru)', quantity: 1, price: 34.00 },
      ],
      total: 34.00,
      currency: 'USD',
      financialStatus: 'paid',
      fulfillmentStatus: 'unfulfilled',
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Bar Contract (Zone 1: Brand, Zone 2: Navigation Links, Zone 3: Primary Action) */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between gap-8 shrink-0">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            TC
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            TeleShop Connector
          </span>
          <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400 border border-slate-700/60 rounded px-1.5 py-0.5">
            React Native + Expo
          </span>
        </div>

        {/* Zone 2: Navigation controls */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setActiveView('desktop_merchant')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'desktop_merchant'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop Portal</span>
          </button>

          <button
            onClick={() => setActiveView('wp_cloudflare_demo')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'wp_cloudflare_demo'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>WP &amp; Cloudflare Demo</span>
          </button>

          <button
            onClick={() => {
              setActiveView('merchant');
              setDeviceFrame(true);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'merchant'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>

          <button
            onClick={() => setActiveView('payments_admin')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'payments_admin'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Payments Hub</span>
          </button>

          <button
            onClick={() => setActiveView('merchant_finance')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'merchant_finance'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Merchant Finance</span>
          </button>

          <button
            onClick={() => setActiveView('qa_harness')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'qa_harness'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Section 10 QA</span>
          </button>

          <button
            onClick={() => setActiveView('miniapp')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'miniapp'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Mini App Store</span>
          </button>

          <button
            onClick={() => setActiveView('bot')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'bot'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Bot Simulator</span>
          </button>

          <button
            onClick={() => setActiveView('code')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'code'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Deliverables</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowChecklistSidebar(!showChecklistSidebar)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs ${
              showChecklistSidebar
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle 35 Benefits Checklist Sidebar"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>35 Benefits (35/35)</span>
          </button>

          <button
            onClick={handleSimulateNewOrder}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            title="Simulate incoming order from Telegram to trigger admin push & group alert (Benefit 1)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulate</span> Order Alert
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
        {/* Full-width view for Desktop Merchant Portal, Dashboard and QA views */}
        {activeView === 'desktop_merchant' && (
          <div className="flex-1 overflow-hidden">
            <DesktopMerchantPortal
              onOpenWizard={() => {
                setActiveView('merchant');
                setIsWizardMode(true);
                setWizardStep(1);
              }}
              onSwitchToMobile={() => {
                setActiveView('merchant');
                setDeviceFrame(true);
              }}
            />
          </div>
        )}

        {activeView === 'wp_cloudflare_demo' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <WordPressPluginCloudflareDemo />
          </div>
        )}

        {activeView === 'payments_admin' && (
          <div className="flex-1 overflow-hidden">
            <SaaSPlatformPaymentsHub />
          </div>
        )}

        {activeView === 'merchant_finance' && (
          <div className="flex-1 overflow-hidden">
            <MerchantPaymentsDashboard />
          </div>
        )}

        {activeView === 'qa_harness' && (
          <div className="flex-1 overflow-hidden">
            <PaymentsTestHarness />
          </div>
        )}

        {activeView === 'code' && (
          <div className="flex-1 overflow-hidden p-2 sm:p-4 bg-slate-950 flex flex-col">
            <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
              <ArchitectureViewer />
            </div>
          </div>
        )}

        {/* Mobile/Device Frame Canvas for Merchant App, Mini App, or Bot */}
        {(activeView === 'merchant' || activeView === 'miniapp' || activeView === 'bot') && (
          <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden bg-slate-950/80">
            {/* Sub Toolbar */}
            <div className="mb-3 flex items-center gap-3 text-xs text-slate-400">
              {activeView === 'merchant' && (
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setIsWizardMode(false)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      !isWizardMode ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dashboard View
                  </button>
                  <button
                    onClick={() => {
                      setIsWizardMode(true);
                      setWizardStep(1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      isWizardMode ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    6-Screen Setup Wizard
                  </button>
                </div>
              )}

              <button
                onClick={() => setDeviceFrame(!deviceFrame)}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[11px] text-slate-300 transition-colors cursor-pointer"
              >
                <Smartphone className="w-3 h-3" />
                <span>{deviceFrame ? 'Device Frame: ON' : 'Device Frame: OFF'}</span>
              </button>
            </div>

            {/* Device Mockup Shell */}
            <div
              className={`transition-all duration-300 bg-black flex flex-col overflow-hidden shadow-2xl relative ${
                deviceFrame
                  ? 'w-full max-w-[395px] h-[720px] rounded-[42px] border-[10px] border-slate-800 ring-1 ring-slate-700/50'
                  : 'w-full h-full rounded-2xl border border-slate-800'
              }`}
            >
              {/* Mobile Notch / Dynamic Island */}
              {deviceFrame && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-40 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                </div>
              )}

              {/* Inner App Container */}
              <div className="flex-1 overflow-hidden relative">
                {activeView === 'merchant' && (
                  isWizardMode ? (
                    <SetupWizardNavigator onFinish={() => setIsWizardMode(false)} />
                  ) : (
                    <MerchantDashboard onOpenWizard={() => {
                      setIsWizardMode(true);
                      setWizardStep(1);
                    }} />
                  )
                )}

                {activeView === 'miniapp' && <MiniAppStorefront />}

                {activeView === 'bot' && <TelegramBotSimulator />}
              </div>

              {/* Home indicator bar on phone */}
              {deviceFrame && (
                <div className="h-5 bg-black flex items-center justify-center shrink-0">
                  <div className="w-32 h-1 bg-slate-600 rounded-full opacity-60" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Side: Architecture & 35 Benefits Inspector Sidebar */}
        {(showChecklistSidebar || activeView === 'merchant' || activeView === 'bot') && (
          <aside className="w-full md:w-80 lg:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                35 Benefits Checklist
              </h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              35/35 Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Section A: Revenue Protection & Recovery */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">
                A. Revenue &amp; Recovery (7)
              </div>
              <ul className="space-y-1 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1. Instant new-order admin alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>2. Abandoned cart recovery (2h timer)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>3. Back-in-stock / price drop alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>4. Low-stock alerts to admin</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>5. Saved addresses &amp; 1-tap reorder</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>6. Loyalty points &amp; repeat nudges</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>7. Referral program automation</span>
                </li>
              </ul>
            </div>

            {/* Section B: Sales & Checkout */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">
                B. Sales &amp; Checkout (5)
              </div>
              <ul className="space-y-1 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>8. In-chat product browsing (Mini App)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>9. In-chat checkout (Shopify/WC Native)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>10. Payment links / invoice generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>11. Wishlist / favorites</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>12. Inline mode sharing (@bot query)</span>
                </li>
              </ul>
            </div>

            {/* Section C: Customer Support */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">
                C. Support &amp; Communication (7)
              </div>
              <ul className="space-y-1 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>13. Order status notifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>14. Automated FAQ answers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>15. Order lookup (/orders command)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>16. Refund/return handling in chat</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>17. Graceful fallback to human support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>18. 24/7 server-side availability</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>19. Review collection (1–5 rating)</span>
                </li>
              </ul>
            </div>

            {/* Section D: Marketing & Reach */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">
                D. Marketing &amp; Reach (4)
              </div>
              <ul className="space-y-1 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>20. Broadcasts with scheduling</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>21. Customer segmentation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>22. Personalized recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>23. In-store QR code generator</span>
                </li>
              </ul>
            </div>

            {/* Section E: Operations & Admin */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">
                E. Operations &amp; Admin (5)
              </div>
              <ul className="space-y-1 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>24. Daily sales summary to owner</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>25. Role-based admin access (RBAC)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>26. Automatic shipping tracking links</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>27. Basic analytics dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>28. Webhook retry &amp; dead-letter queue</span>
                </li>
              </ul>
            </div>

            {/* Section F: Foundations */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">
                F. Foundations (7)
              </div>
              <ul className="space-y-1 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>29. Zero per-message cost (TG Bot API)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>30. Multi-language (EN + ES)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>31. Guided setup (6-screen wizard)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>32. Native Shopify + WooCommerce</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>33. AES-256 secure credential storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>34. GDPR /delete_my_data command</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>35. /start welcome + discount incentive</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      )}
      </main>

      {/* Live Toast Notifications Overlay */}
      {notifications.length > 0 && notifications[0] && (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              {notifications[0].title}
            </span>
            <span className="text-[10px] text-slate-400">{notifications[0].timestamp}</span>
          </div>
          <p className="text-slate-300 text-[11px]">{notifications[0].message}</p>
        </div>
      )}

      {/* Floating Flotraq Banner & Architecture Info (Click for info) */}
      <FlotraqFloatingBanner />
    </div>
  );
}
