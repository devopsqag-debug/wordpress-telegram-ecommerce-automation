/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bot, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { useMerchantStore } from '../../store/useMerchantStore.ts';

/**
 * Screen 1. Welcome
 * Exact Copy:
 * Headline: "Connect Your Store to Telegram"
 * Subtitle: "In the next few minutes, you'll create a Telegram bot for your store, connect your e-commerce platform, and go live. No code required."
 * Button: "Get Started"
 */
export const WizardScreen1Welcome: React.FC = () => {
  const { setWizardStep } = useMerchantStore();

  return (
    <div className="flex flex-col justify-between h-full p-6 text-slate-900 bg-white">
      <div className="space-y-6 pt-6">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
          <Bot className="w-9 h-9" />
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold text-sky-600 tracking-wide uppercase">
            Step 1 of 6 · Quick Setup
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Connect Your Store to Telegram
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            In the next few minutes, you'll create a Telegram bot for your store, connect your e-commerce platform, and go live. No code required.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Zero per-message cost</span> — operate your customer storefront and notifications directly via the official Telegram Bot API.
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Bank-grade security</span> — AES-256 encrypted credential storage and server-authoritative webhooks.
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 pb-2">
        <button
          onClick={() => setWizardStep(2)}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
