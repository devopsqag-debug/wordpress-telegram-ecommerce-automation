/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, Bot, Sparkles, Star, Package, HelpCircle, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { useMerchantStore } from '../store/useMerchantStore.ts';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  keyboard?: Array<Array<{ label: string; action: string; isWebApp?: boolean }>>;
}

export const TelegramBotSimulator: React.FC = () => {
  const { tenant, faqs } = useMerchantStore();
  const [input, setInput] = useState('/start');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: `👋 Welcome to *${tenant.storeName || 'Artisan Goods'}* on Telegram!\n\nBrowse our full catalog, build your cart, and checkout seamlessly without ever leaving Telegram.\n\n🎁 *Welcome Gift:* Use code *WELCOME10* at checkout for *10% off* your first order!`,
      timestamp: '10:00 AM',
      keyboard: [
        [
          { label: '🛍️ Open Mini App Storefront', action: 'open_miniapp', isWebApp: true },
        ],
        [
          { label: '📦 /orders 1042', action: 'cmd_orders' },
          { label: '❓ /faq', action: 'cmd_faq' },
        ],
        [
          { label: '🙋 /support', action: 'cmd_support' },
          { label: '🔄 /refund', action: 'cmd_refund' },
        ],
      ],
    },
  ]);

  const handleSend = (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: time,
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInput('');

    // Simulate server-side bot responses (Benefit 18)
    setTimeout(() => {
      const lower = userText.toLowerCase();

      if (lower.startsWith('/start')) {
        setMessages((prev) => [
          ...prev,
          {
            id: `b_${Date.now()}`,
            sender: 'bot',
            text: `👋 Welcome to *${tenant.storeName || 'Artisan Goods'}* on Telegram!\n\n🎁 *Welcome Gift:* Use code *WELCOME10* at checkout for *10% off* your first order!\n\nTap below to open the Mini App:`,
            timestamp: time,
            keyboard: [
              [{ label: '🛍️ Open Mini App Storefront', action: 'open_miniapp', isWebApp: true }],
              [{ label: '📦 My Orders', action: 'cmd_orders' }, { label: '❓ FAQs', action: 'cmd_faq' }],
            ],
          },
        ]);
        return;
      }

      if (lower.startsWith('/orders') || lower.startsWith('/order')) {
        setMessages((prev) => [
          ...prev,
          {
            id: `b_${Date.now()}`,
            sender: 'bot',
            text: `📦 *Order #1042 Status: In Transit 🚚*\nCarrier: *USPS Priority Mail*\nTracking: \`9400111899223190821\`\nEstimated Delivery: *Tomorrow by 5:00 PM*\n\nItems:\n• Minimalist Canvas Tote (x1) - $34.00\nTotal: *$34.00 (Paid)*`,
            timestamp: time,
            keyboard: [
              [{ label: '⭐ Rate Delivered Items', action: 'rate_order' }],
              [{ label: '🔄 Request Return / Refund', action: 'cmd_refund' }],
            ],
          },
        ]);
        return;
      }

      if (lower.startsWith('/faq')) {
        const topFaq = faqs[0] || { question: 'When will my order ship?', answer: 'Orders ship in 24 hours.' };
        setMessages((prev) => [
          ...prev,
          {
            id: `b_${Date.now()}`,
            sender: 'bot',
            text: `❓ *FAQ: ${topFaq.question}*\n\n${topFaq.answer}\n\n_Type /support anytime if you want to reach our human staff._`,
            timestamp: time,
            keyboard: [
              [{ label: '🙋 Speak with Human Staff', action: 'cmd_support' }],
            ],
          },
        ]);
        return;
      }

      if (lower.startsWith('/refund')) {
        setMessages((prev) => [
          ...prev,
          {
            id: `b_${Date.now()}`,
            sender: 'bot',
            text: `🔄 *Return & Refund Request Initiated*\nWe're here to help! Please reply with your Order # and item reason. Our support team generates prepaid labels within 2 hours.`,
            timestamp: time,
          },
        ]);
        return;
      }

      if (lower.startsWith('/support')) {
        setMessages((prev) => [
          ...prev,
          {
            id: `b_${Date.now()}`,
            sender: 'bot',
            text: `🚨 *Human Support Escalation Triggered*\nYour chat session has been escalated to the store manager. A staff member will reply in Telegram shortly.`,
            timestamp: time,
          },
        ]);
        return;
      }

      if (lower.startsWith('/delete_my_data')) {
        setMessages((prev) => [
          ...prev,
          {
            id: `b_${Date.now()}`,
            sender: 'bot',
            text: `🛡️ *GDPR Data Deletion Complete*\nAll your stored delivery addresses, cart history, and personal data have been permanently erased from our Firestore database per GDPR standards.`,
            timestamp: time,
          },
        ]);
        return;
      }

      if (lower.includes('@') || lower.includes('inline') || lower.includes('share')) {
        setMessages((prev) => [
          ...prev,
          {
            id: `b_${Date.now()}`,
            sender: 'bot',
            text: `🛍️ *Inline Mode Sharing Ready!*\nType \`@${tenant.botUsername} tote\` in any chat or channel to share interactive product cards instantly with friends!`,
            timestamp: time,
          },
        ]);
        return;
      }

      // Default reply
      setMessages((prev) => [
        ...prev,
        {
          id: `b_${Date.now()}`,
          sender: 'bot',
          text: `Got your message: "${userText}".\n\nNeed assistance? Tap a quick option below:`,
          timestamp: time,
          keyboard: [
            [{ label: '🛍️ Open Mini App Storefront', action: 'open_miniapp', isWebApp: true }],
            [{ label: '📦 Track Order #1042', action: 'cmd_orders' }],
          ],
        },
      ]);
    }, 450);
  };

  const handleAction = (action: string) => {
    if (action === 'open_miniapp') {
      alert('In Telegram, this button launches the fullscreen Telegram Mini App storefront seamlessly!');
    } else if (action === 'cmd_orders') {
      handleSend('/orders 1042');
    } else if (action === 'cmd_faq') {
      handleSend('/faq');
    } else if (action === 'cmd_support') {
      handleSend('/support');
    } else if (action === 'cmd_refund') {
      handleSend('/refund');
    } else if (action === 'rate_order') {
      setMessages((prev) => [
        ...prev,
        {
          id: `b_${Date.now()}`,
          sender: 'bot',
          text: `⭐ *How was your order #1042?*\nPlease rate your experience from 1 to 5 stars:`,
          timestamp: 'Just now',
          keyboard: [
            [
              { label: '⭐ 1', action: 'rate_1' },
              { label: '⭐ 2', action: 'rate_2' },
              { label: '⭐ 3', action: 'rate_3' },
              { label: '⭐ 4', action: 'rate_4' },
              { label: '⭐ 5', action: 'rate_5' },
            ],
          ],
        },
      ]);
    } else if (action.startsWith('rate_')) {
      const star = action.split('_')[1];
      setMessages((prev) => [
        ...prev,
        {
          id: `b_${Date.now()}`,
          sender: 'bot',
          text: `🎉 *Thank you for your rating of ${star}/5 stars!*\n50 bonus loyalty points have been deposited to your account.`,
          timestamp: 'Just now',
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0e1621] text-white font-sans overflow-hidden select-none">
      {/* Telegram Chat Header */}
      <div className="bg-[#17212b] px-4 py-2.5 flex items-center justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{tenant.storeName || 'TeleShop Bot'}</span>
              <span className="text-[10px] text-sky-400 font-normal">bot</span>
            </div>
            <div className="text-[11px] text-slate-400">
              @{tenant.botUsername || 'ArtisanGoodsShopBot'} · server-side 24/7
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'm1',
                sender: 'bot',
                text: `👋 Chat reset. Type /start to test the welcome sequence.`,
                timestamp: 'Just now',
              },
            ]);
          }}
          className="text-xs text-slate-400 hover:text-white p-1 rounded cursor-pointer"
          title="Reset chat"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0e1621]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-[#2b5278] text-white rounded-br-xs'
                  : 'bg-[#182533] text-slate-100 rounded-bl-xs border border-white/5'
              }`}
            >
              {m.text}
              <div
                className={`text-[9px] mt-1 text-right ${
                  m.sender === 'user' ? 'text-sky-200' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </div>
            </div>

            {/* Telegram In-Chat Inline Keyboard */}
            {m.keyboard && (
              <div className="mt-1.5 w-full max-w-[85%] space-y-1">
                {m.keyboard.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-1.5">
                    {row.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => handleAction(btn.action)}
                        className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold text-center transition-colors cursor-pointer ${
                          btn.isWebApp
                            ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-xs'
                            : 'bg-[#242f3d] hover:bg-[#2e3b4d] text-sky-400 border border-white/5'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Suggested Quick Command Chips */}
      <div className="px-3 py-1.5 bg-[#17212b] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
        <button
          onClick={() => handleSend('/start')}
          className="px-2 py-1 rounded bg-[#242f3d] hover:bg-[#2b394a] text-slate-300 whitespace-nowrap cursor-pointer"
        >
          /start
        </button>
        <button
          onClick={() => handleSend('/orders 1042')}
          className="px-2 py-1 rounded bg-[#242f3d] hover:bg-[#2b394a] text-slate-300 whitespace-nowrap cursor-pointer"
        >
          /orders 1042
        </button>
        <button
          onClick={() => handleSend('/faq')}
          className="px-2 py-1 rounded bg-[#242f3d] hover:bg-[#2b394a] text-slate-300 whitespace-nowrap cursor-pointer"
        >
          /faq
        </button>
        <button
          onClick={() => handleSend('/refund')}
          className="px-2 py-1 rounded bg-[#242f3d] hover:bg-[#2b394a] text-slate-300 whitespace-nowrap cursor-pointer"
        >
          /refund
        </button>
        <button
          onClick={() => handleSend('/support')}
          className="px-2 py-1 rounded bg-[#242f3d] hover:bg-[#2b394a] text-slate-300 whitespace-nowrap cursor-pointer"
        >
          /support
        </button>
        <button
          onClick={() => handleSend('/delete_my_data')}
          className="px-2 py-1 rounded bg-[#242f3d] hover:bg-[#2b394a] text-red-300 whitespace-nowrap cursor-pointer"
        >
          /delete_my_data (GDPR)
        </button>
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 bg-[#17212b] flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message or /command..."
          className="flex-1 px-3 py-2 rounded-xl bg-[#242f3d] text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white cursor-pointer transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
