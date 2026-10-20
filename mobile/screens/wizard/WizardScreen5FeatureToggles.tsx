/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckSquare, Square, Globe } from 'lucide-react';
import { useMerchantStore } from '../../store/useMerchantStore.ts';

/**
 * Screen 5. Feature toggles
 * Exact Copy:
 * Checkboxes for:
 * - Mini App storefront
 * - order alerts
 * - abandoned cart recovery
 * - customer tracking
 * - AI Q&A (off by default)
 * Language dropdown
 * Button: Continue.
 */
export const WizardScreen5FeatureToggles: React.FC = () => {
  const { setWizardStep, tenant, updateTenant } = useMerchantStore();

  const [miniAppStorefront, setMiniAppStorefront] = useState(tenant.features.miniAppStorefront ?? true);
  const [orderAlerts, setOrderAlerts] = useState(tenant.features.orderAlerts ?? true);
  const [abandonedCartRecovery, setAbandonedCartRecovery] = useState(tenant.features.abandonedCartRecovery ?? true);
  const [customerTracking, setCustomerTracking] = useState(tenant.features.customerTracking ?? true);
  const [aiQa, setAiQa] = useState(tenant.features.aiQa ?? false); // off by default as specified
  const [language, setLanguage] = useState(tenant.language || 'en');

  const handleContinue = () => {
    updateTenant({
      features: {
        miniAppStorefront,
        orderAlerts,
        abandonedCartRecovery,
        customerTracking,
        aiQa,
      },
      language,
    });
    setWizardStep(7); // proceed to Step 6 (Launch)
  };

  return (
    <div className="flex flex-col justify-between h-full p-6 text-slate-900 bg-white">
      <div className="space-y-5 pt-2 overflow-y-auto">
        <button
          onClick={() => setWizardStep(5)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="space-y-1">
          <div className="text-xs font-semibold text-sky-600 tracking-wide uppercase">
            Step 5 of 6 · Capabilities
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Configure Features
          </h1>
          <p className="text-xs text-slate-600">
            Enable the capabilities you want your Telegram bot to support. You can adjust these anytime in Settings.
          </p>
        </div>

        {/* Feature Checkboxes list */}
        <div className="space-y-2.5 pt-1">
          {/* 1. Mini App storefront */}
          <div
            onClick={() => setMiniAppStorefront(!miniAppStorefront)}
            className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer select-none"
          >
            {miniAppStorefront ? (
              <CheckSquare className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-sm font-semibold text-slate-900">Mini App storefront</div>
              <div className="text-xs text-slate-500">
                Interactive catalog inside Telegram with cart, search, and instant checkout.
              </div>
            </div>
          </div>

          {/* 2. Order alerts */}
          <div
            onClick={() => setOrderAlerts(!orderAlerts)}
            className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer select-none"
          >
            {orderAlerts ? (
              <CheckSquare className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-sm font-semibold text-slate-900">order alerts</div>
              <div className="text-xs text-slate-500">
                Instant push notifications and group message pings to admin on new orders.
              </div>
            </div>
          </div>

          {/* 3. Abandoned cart recovery */}
          <div
            onClick={() => setAbandonedCartRecovery(!abandonedCartRecovery)}
            className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer select-none"
          >
            {abandonedCartRecovery ? (
              <CheckSquare className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-sm font-semibold text-slate-900">abandoned cart recovery</div>
              <div className="text-xs text-slate-500">
                2-hour timer cron triggers Telegram recovery nudge with discount incentive.
              </div>
            </div>
          </div>

          {/* 4. Customer tracking */}
          <div
            onClick={() => setCustomerTracking(!customerTracking)}
            className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer select-none"
          >
            {customerTracking ? (
              <CheckSquare className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-sm font-semibold text-slate-900">customer tracking</div>
              <div className="text-xs text-slate-500">
                Track repeat customers, segment broadcasts, and store saved shipping addresses.
              </div>
            </div>
          </div>

          {/* 5. AI Q&A (off by default) */}
          <div
            onClick={() => setAiQa(!aiQa)}
            className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer select-none"
          >
            {aiQa ? (
              <CheckSquare className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">AI Q&amp;A</span>
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  off by default
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Synthesize smart responses from your store policy and FAQ questions.
              </div>
            </div>
          </div>
        </div>

        {/* Language dropdown */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Store Language</span>
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <option value="en">English (auto-detects Telegram language_code)</option>
            <option value="es">Español (Spanish)</option>
            <option value="fr">Français (French)</option>
            <option value="de">Deutsch (German)</option>
          </select>
        </div>
      </div>

      <div className="pt-4 pb-2">
        <button
          onClick={handleContinue}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
