/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Rocket, ArrowLeft, Loader2, Copy, Check, ExternalLink, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useMerchantStore } from '../../store/useMerchantStore.ts';

interface WizardScreen6LaunchProps {
  onViewDashboard?: () => void;
}

/**
 * Screen 6. Launch
 * Exact Copy:
 * Headline: "You're ready to launch"
 * Button: "Launch Bot"
 * Action: registers webhook + platform webhooks
 * On success show: "🎉 Your bot is live! @[username] connected to [Store Name]"
 * Actions:
 * - "Open in Telegram"
 * - "Copy link"
 * - "View dashboard"
 */
export const WizardScreen6Launch: React.FC<WizardScreen6LaunchProps> = ({ onViewDashboard }) => {
  const { setWizardStep, tenant, updateTenant } = useMerchantStore();
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLiveSuccess, setIsLiveSuccess] = useState(tenant.isLive ?? false);
  const [copiedLink, setCopiedLink] = useState(false);

  const botUsername = tenant.botUsername || 'ArtisanGoodsShopBot';
  const storeName = tenant.storeName || 'Artisan Goods & Co.';
  const botLink = `https://t.me/${botUsername}`;

  const handleLaunchBot = async () => {
    setIsLaunching(true);

    // Simulate webhook registration with Telegram API + Shopify/WooCommerce webhooks
    setTimeout(() => {
      updateTenant({
        isLive: true,
        webhookUrl: `https://teleshop.connector.dev/api/webhooks/telegram?tenant=${tenant.tenantId}`,
      });
      setIsLiveSuccess(true);
      setIsLaunching(false);
    }, 1500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(botLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenTelegram = () => {
    window.open(botLink, '_blank');
  };

  return (
    <div className="flex flex-col justify-between h-full p-6 text-slate-900 bg-white">
      <div className="space-y-5 pt-2 overflow-y-auto">
        {!isLiveSuccess && (
          <button
            onClick={() => setWizardStep(6)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        <div className="space-y-1">
          <div className="text-xs font-semibold text-sky-600 tracking-wide uppercase">
            Step 6 of 6 · Go Live
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            You're ready to launch
          </h1>
          <p className="text-xs text-slate-600">
            Click below to register server-side webhooks for Shopify/WooCommerce and activate the Telegram Bot API listener.
          </p>
        </div>

        {!isLiveSuccess ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
              <div className="font-semibold text-slate-800">Launch Sequence Summary:</div>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Store: <strong>{storeName}</strong> ({tenant.platform?.toUpperCase()})</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Bot Handle: <strong>@{botUsername}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Webhook URL: <strong>registers webhook + platform webhooks</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLaunchBot}
              disabled={isLaunching}
              className="w-full py-4 px-6 rounded-xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isLaunching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering Webhooks &amp; Launching...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  <span>Launch Bot</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {/* Exact Copy Announcement Banner */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3 shadow-xs">
              <div className="text-base sm:text-lg font-bold leading-snug">
                🎉 Your bot is live! @{botUsername} connected to {storeName}
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Your store is officially live on Telegram. Customers can now browse the Mini App catalog, search products inline, checkout, and receive instant tracking updates.
              </p>
            </div>

            {/* Actions required */}
            <div className="space-y-2.5 pt-1">
              {/* Action 1: Open in Telegram */}
              <button
                onClick={handleOpenTelegram}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-xs text-white bg-sky-600 hover:bg-sky-500 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Open in Telegram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {/* Action 2: Copy link */}
              <button
                onClick={handleCopyLink}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy link'}</span>
              </button>

              {/* Action 3: View dashboard */}
              <button
                onClick={onViewDashboard || (() => setWizardStep(100))}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-600" />
                <span>View dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 text-center">
        <span className="text-[11px] text-slate-400">
          TeleShop Connector · 35 Benefits Included · Zero Per-Message Cost
        </span>
      </div>
    </div>
  );
};
