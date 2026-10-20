/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, Globe, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useMerchantStore } from '../../store/useMerchantStore.ts';
import { EcomPlatform } from '../../types.ts';

/**
 * Screen 2. Platform select
 * Exact Copy:
 * Headline: "Where is your store hosted?"
 * Options: "Shopify" | "WordPress/WooCommerce"
 */
export const WizardScreen2PlatformSelect: React.FC = () => {
  const { setWizardStep, setPlatform, tenant } = useMerchantStore();
  const [selected, setSelected] = useState<EcomPlatform>(tenant.platform || 'shopify');

  const handleContinue = () => {
    setPlatform(selected);
    if (selected === 'shopify') {
      setWizardStep(3); // 3A
    } else {
      setWizardStep(4); // 3B (mapped in navigator as step 3B)
    }
  };

  return (
    <div className="flex flex-col justify-between h-full p-6 text-slate-900 bg-white">
      <div className="space-y-6 pt-2">
        <button
          onClick={() => setWizardStep(1)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-sky-600 tracking-wide uppercase">
            Step 2 of 6 · Platform Integration
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Where is your store hosted?
          </h1>
          <p className="text-sm text-slate-600">
            Select your e-commerce platform. TeleShop Connector provides native APIs for catalog sync, cart creation, and order alerts.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Option: Shopify */}
          <div
            onClick={() => setSelected('shopify')}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              selected === 'shopify'
                ? 'border-sky-600 bg-sky-50/40 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">Shopify</div>
                <div className="text-xs text-slate-500">Native Storefront &amp; Admin GraphQL APIs</div>
              </div>
            </div>
            {selected === 'shopify' ? (
              <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0" />
            )}
          </div>

          {/* Option: WordPress/WooCommerce */}
          <div
            onClick={() => setSelected('woocommerce')}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              selected === 'woocommerce'
                ? 'border-sky-600 bg-sky-50/40 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">WordPress/WooCommerce</div>
                <div className="text-xs text-slate-500">Lightweight companion WordPress plugin</div>
              </div>
            </div>
            {selected === 'woocommerce' ? (
              <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0" />
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 pb-2">
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
