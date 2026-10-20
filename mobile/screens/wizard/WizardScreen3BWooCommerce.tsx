/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, ArrowRight, ArrowLeft, Loader2, CheckCircle, Copy, Check } from 'lucide-react';
import { useMerchantStore } from '../../store/useMerchantStore.ts';

/**
 * Screen 3B. WooCommerce
 * Exact Copy:
 * Button: "Download Plugin (.zip)"
 * Instruction: "Install in WordPress → Plugins → Add New → Upload"
 * Action: paste connection code
 * Button: "Verify Connection"
 * On success show: "✅ Connected: [Site Name]"
 * Button: Continue.
 */
export const WizardScreen3BWooCommerce: React.FC = () => {
  const { setWizardStep, tenant, updateTenant } = useMerchantStore();
  const [siteUrl, setSiteUrl] = useState('https://roasterlab.coffee');
  const [connectionCode, setConnectionCode] = useState('WC-8829-TELE');
  const [isVerifying, setIsVerifying] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [connectedSite, setConnectedSite] = useState<string | null>(
    tenant.platform === 'woocommerce' && tenant.storeName ? tenant.storeName : null
  );

  const handleDownload = () => {
    setDownloaded(true);
    // Create quick downloadable blob
    const element = document.createElement('a');
    const file = new Blob(['TeleShop Connector WordPress Plugin Stub Package v1.0.0'], {
      type: 'application/zip',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'teleshop-woocommerce-connector.zip';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const siteName = 'Roaster Lab Coffee Co.';
      setConnectedSite(siteName);
      updateTenant({
        platform: 'woocommerce',
        storeName: siteName,
        productCount: 18,
        currency: 'USD',
        siteUrl,
        connectionCode,
      });
      setIsVerifying(false);
    }, 1100);
  };

  const handleContinue = () => {
    setWizardStep(5); // proceed to Step 4 (Bot Creation)
  };

  return (
    <div className="flex flex-col justify-between h-full p-6 text-slate-900 bg-white">
      <div className="space-y-5 pt-2 overflow-y-auto">
        <button
          onClick={() => setWizardStep(2)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-sky-600 tracking-wide uppercase">
            Step 3 of 6 · WooCommerce Plugin
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Connect WooCommerce
          </h1>
          <p className="text-xs text-slate-600">
            Follow the 2 simple steps below to link your WordPress site securely.
          </p>
        </div>

        {/* Step A: Download */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="text-xs font-semibold text-slate-800">
            Step 1: Install Companion Plugin
          </div>
          <button
            onClick={handleDownload}
            className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Plugin (.zip)</span>
          </button>
          {downloaded && (
            <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Downloaded teleshop-woocommerce-connector.zip
            </div>
          )}
          <div className="text-xs text-slate-600 font-medium">
            Install in WordPress → Plugins → Add New → Upload
          </div>
        </div>

        {/* Step B: Paste code & verify */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Site URL
            </label>
            <input
              type="text"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://yourstore.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                paste connection code
              </label>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(connectionCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="text-[11px] text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy sample'}</span>
              </button>
            </div>
            <input
              type="text"
              value={connectionCode}
              onChange={(e) => setConnectionCode(e.target.value)}
              placeholder="e.g. WC-8829-TELE"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 font-mono uppercase tracking-widest text-center text-sm font-bold"
            />
          </div>

          {!connectedSite ? (
            <button
              onClick={handleVerify}
              disabled={isVerifying || !connectionCode}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying connection...</span>
                </>
              ) : (
                <span>Verify Connection</span>
              )}
            </button>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>✅ Connected: {connectedSite}</span>
              </div>
              <p className="text-[11px] text-emerald-700 pl-5">
                WooCommerce REST endpoints verified and active.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 pb-2">
        <button
          onClick={handleContinue}
          disabled={!connectedSite}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
