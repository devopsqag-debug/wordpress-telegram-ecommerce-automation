/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, ArrowLeft, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { useMerchantStore } from '../../store/useMerchantStore.ts';

/**
 * Screen 3A. Shopify
 * Exact Copy:
 * OAuth button: "Connect to Shopify"
 * On success show: "✅ Connected: [Store Name] — [X] products, currency [Y]"
 * Button: Continue.
 */
export const WizardScreen3AShopify: React.FC = () => {
  const { setWizardStep, tenant, updateTenant } = useMerchantStore();
  const [shopDomain, setShopDomain] = useState('artisangoods.myshopify.com');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedState, setConnectedState] = useState<{
    storeName: string;
    productCount: number;
    currency: string;
  } | null>(
    tenant.platform === 'shopify' && tenant.storeName
      ? {
          storeName: tenant.storeName,
          productCount: tenant.productCount || 24,
          currency: tenant.currency || 'USD',
        }
      : null
  );

  const handleOAuthConnect = async () => {
    setIsConnecting(true);
    // Simulate real OAuth handshake with Shopify Admin API
    setTimeout(() => {
      const storeName = 'Artisan Goods & Co.';
      const productCount = 24;
      const currency = 'USD';

      setConnectedState({
        storeName,
        productCount,
        currency,
      });

      updateTenant({
        platform: 'shopify',
        storeName,
        productCount,
        currency,
        siteUrl: `https://${shopDomain}`,
      });

      setIsConnecting(false);
    }, 1200);
  };

  const handleContinue = () => {
    // Proceed to Step 4 (Bot Creation)
    setWizardStep(5);
  };

  return (
    <div className="flex flex-col justify-between h-full p-6 text-slate-900 bg-white">
      <div className="space-y-6 pt-2">
        <button
          onClick={() => setWizardStep(2)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-sky-600 tracking-wide uppercase">
            Step 3 of 6 · Shopify Store
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Connect your Shopify store
          </h1>
          <p className="text-sm text-slate-600">
            Authorize TeleShop Connector to read your catalog via Storefront API and listen for new order webhooks.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Shopify domain (.myshopify.com)
            </label>
            <div className="relative">
              <input
                type="text"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="storename.myshopify.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {!connectedState ? (
            <button
              onClick={handleOAuthConnect}
              disabled={isConnecting}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-emerald-700 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-75"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Shopify OAuth...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Connect to Shopify</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                </>
              )}
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  ✅ Connected: {connectedState.storeName} — {connectedState.productCount} products, currency {connectedState.currency}
                </span>
              </div>
              <p className="text-xs text-emerald-700 pl-6">
                Storefront API &amp; order webhooks successfully authenticated.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 pb-2">
        <button
          onClick={handleContinue}
          disabled={!connectedState}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
