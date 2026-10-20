/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, ExternalLink, X, Check, Copy, 
  Terminal, ShieldCheck, Server, Globe, Cpu, GitBranch
} from 'lucide-react';

export function FlotraqFloatingBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const gitlabPushScript = `# 1. Initialize and add files
git init
git add .
git commit -m "feat: complete Laravel standalone, WordPress plugin & Cloudflare deploy by Flotraq.com"

# 2. Add your GitLab private repository remote
git branch -M main
git remote add origin git@gitlab.com:YOUR_ORGANIZATION/YOUR_PRIVATE_REPO.git

# 3. Push code to trigger GitLab CI/CD Pipeline
git push -u origin main`;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <>
      {/* Floating Button at bottom center/right */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-900 text-slate-100 border border-sky-500/50 hover:border-sky-400 shadow-xl shadow-sky-950/40 backdrop-blur-md transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer text-xs md:text-sm font-medium"
          aria-label="Flotraq Project Information"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
          </span>
          
          <span className="font-semibold text-white tracking-tight">
            This project made by <span className="text-sky-400 underline decoration-sky-400/40 underline-offset-2">Flotraq.com</span> | Click for info
          </span>

          <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
        </button>
      </div>

      {/* Info Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-slate-200">
            {/* Header */}
            <div className="p-5 md:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                  FQ
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Architected by Flotraq.com
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">
                      Verified Production Grade
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Enterprise SaaS, Laravel Standalone, WordPress Plugins & Cloudflare Edge Engineering
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Architecture Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg shrink-0 mt-0.5">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">1. Laravel 11 Standalone Backend</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Located in <code className="text-sky-300">/laravel</code>. Includes Artisan routes, multi-tenant DB migrations, Stripe Connect Marketplace controller, and 3-business-day delivery release engine.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0 mt-0.5">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">2. WordPress / WooCommerce Plugin</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Located in <code className="text-sky-300">/wordpress-plugin</code>. Production-ready PHP plugin exposing secure REST routes (<code className="text-slate-300">/wp-json/teleshop/v1</code>) and WooCommerce event hooks.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">3. Cloudflare Worker & Pages Edge</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Configured in <code className="text-sky-300">worker/index.ts</code> & <code className="text-sky-300">wrangler.toml</code> with custom domain <code className="text-emerald-400 font-bold">wpgram.flotraq.com</code>. Sub-15ms edge gateway for Telegram webhooks and WordPress REST caching.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">4. GitLab Private Repo Pipeline</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Configured in <code className="text-sky-300">.gitlab-ci.yml</code>. Automates tests, builds Cloudflare Pages dist, zips the WordPress plugin, and deploys to Cloudflare via Wrangler.
                    </p>
                  </div>
                </div>
              </div>

              {/* GitLab Push Terminal Command */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Terminal className="w-4 h-4 text-sky-400" />
                    <span>Push to your Private GitLab Repository</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(gitlabPushScript, 'gitlab')}
                    className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20 transition-colors cursor-pointer"
                  >
                    {copiedSection === 'gitlab' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Commands</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs text-slate-300 font-mono overflow-x-auto p-3 bg-slate-900/80 rounded-lg border border-slate-800/80">
                  {gitlabPushScript}
                </pre>
              </div>

              {/* Agency Callout */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/50 to-indigo-950/50 border border-sky-800/40 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Need Custom Development or Cloud Scaling?</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Flotraq builds high-performance fintech platforms, WooCommerce integrations, and custom bots.
                  </p>
                </div>
                <a
                  href="https://flotraq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shrink-0 shadow-sm"
                >
                  <span>Visit Flotraq.com</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>TeleShop Connector Architecture v1.0.0</span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
