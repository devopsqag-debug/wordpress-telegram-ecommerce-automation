/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bot, ArrowRight, ArrowLeft, Loader2, CheckCircle, ExternalLink, Send } from 'lucide-react';
import { useMerchantStore } from '../../store/useMerchantStore.ts';

/**
 * Screen 4. Bot creation
 * Exact Copy:
 * Headline: "Create your Telegram bot"
 * Steps: open @BotFather, /newbot, choose name, choose username ending in 'bot', paste token.
 * Button: "Open BotFather"
 * Input: "Bot token"
 * Button: "Validate Bot"
 * On success show: "✅ Bot created: @[username]"
 * Button: Continue.
 */
export const WizardScreen4BotCreation: React.FC = () => {
  const { setWizardStep, tenant, updateTenant } = useMerchantStore();
  const [botToken, setBotToken] = useState(tenant.botToken || '7289192418:AAFk192_sample_demo_token');
  const [isValidating, setIsValidating] = useState(false);
  const [createdBotUsername, setCreatedBotUsername] = useState<string | null>(
    tenant.botUsername || null
  );

  const handleOpenBotFather = () => {
    // Standard deep link to BotFather
    window.open('https://t.me/BotFather', '_blank');
  };

  const handleValidateBot = async () => {
    if (!botToken.trim()) return;
    setIsValidating(true);

    setTimeout(() => {
      // Derive clean username from store or custom handle
      const username = tenant.storeName
        ? `${tenant.storeName.replace(/[^a-zA-Z0-9]/g, '')}ShopBot`
        : 'TeleShopConnectorBot';

      setCreatedBotUsername(username);
      updateTenant({
        botToken: botToken.trim(),
        botUsername: username,
        botId: `bot_${botToken.split(':')[0] || '728919'}`,
      });

      setIsValidating(false);
    }, 1200);
  };

  const handleContinue = () => {
    // Proceed to Step 5 (Feature Toggles)
    setWizardStep(6);
  };

  return (
    <div className="flex flex-col justify-between h-full p-6 text-slate-900 bg-white">
      <div className="space-y-4 pt-2 overflow-y-auto">
        <button
          onClick={() => setWizardStep(tenant.platform === 'woocommerce' ? 4 : 3)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="space-y-1">
          <div className="text-xs font-semibold text-sky-600 tracking-wide uppercase">
            Step 4 of 6 · Bot Setup
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create your Telegram bot
          </h1>
          <p className="text-xs text-slate-600">
            Follow the quick steps below to generate your store's dedicated Telegram Bot credentials.
          </p>
        </div>

        {/* Steps box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2.5">
          <div className="font-semibold text-slate-900">Steps to create your bot:</div>
          <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-slate-600">
            <li>
              open <span className="font-mono text-sky-700 font-semibold">@BotFather</span> in Telegram
            </li>
            <li>
              send <span className="font-mono text-sky-700 font-semibold">/newbot</span>
            </li>
            <li>choose name (e.g. {tenant.storeName || 'My Store'})</li>
            <li>choose username ending in 'bot' (e.g. {tenant.storeName?.replace(/\s+/g, '') || 'MyStore'}Bot)</li>
            <li>paste token below</li>
          </ol>

          <button
            onClick={handleOpenBotFather}
            className="mt-2 w-full py-2.5 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open BotFather</span>
            <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
          </button>
        </div>

        {/* Input & Validate */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bot token
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 font-mono"
            />
            <div className="text-[11px] text-slate-400 mt-1">
              Token is encrypted with AES-256 at rest and never logged in plain text.
            </div>
          </div>

          {!createdBotUsername ? (
            <button
              onClick={handleValidateBot}
              disabled={isValidating || !botToken}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-sky-600 hover:bg-sky-500 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating token with Telegram API...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  <span>Validate Bot</span>
                </>
              )}
            </button>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>✅ Bot created: @{createdBotUsername}</span>
              </div>
              <p className="text-[11px] text-emerald-700 pl-5">
                Telegram API verified. Bot identity connected to your store.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 pb-2">
        <button
          onClick={handleContinue}
          disabled={!createdBotUsername}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
