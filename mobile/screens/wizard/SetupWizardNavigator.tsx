/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useMerchantStore } from '../../store/useMerchantStore.ts';
import { WizardScreen1Welcome } from './WizardScreen1Welcome.tsx';
import { WizardScreen2PlatformSelect } from './WizardScreen2PlatformSelect.tsx';
import { WizardScreen3AShopify } from './WizardScreen3AShopify.tsx';
import { WizardScreen3BWooCommerce } from './WizardScreen3BWooCommerce.tsx';
import { WizardScreen4BotCreation } from './WizardScreen4BotCreation.tsx';
import { WizardScreen5FeatureToggles } from './WizardScreen5FeatureToggles.tsx';
import { WizardScreen6Launch } from './WizardScreen6Launch.tsx';

interface SetupWizardNavigatorProps {
  onFinish?: () => void;
}

export const SetupWizardNavigator: React.FC<SetupWizardNavigatorProps> = ({ onFinish }) => {
  const { wizardStep, tenant } = useMerchantStore();

  const renderCurrentStep = () => {
    switch (wizardStep) {
      case 1:
        return <WizardScreen1Welcome />;
      case 2:
        return <WizardScreen2PlatformSelect />;
      case 3:
        return <WizardScreen3AShopify />;
      case 4:
        return <WizardScreen3BWooCommerce />;
      case 5:
        return <WizardScreen4BotCreation />;
      case 6:
        return <WizardScreen5FeatureToggles />;
      case 7:
        return <WizardScreen6Launch onViewDashboard={onFinish} />;
      default:
        // If higher or reset, fallback to Screen 1
        return <WizardScreen1Welcome />;
    }
  };

  // Calculate friendly visual progress (1 to 6)
  const getProgressNumber = () => {
    if (wizardStep === 1) return 1;
    if (wizardStep === 2) return 2;
    if (wizardStep === 3 || wizardStep === 4) return 3;
    if (wizardStep === 5) return 4;
    if (wizardStep === 6) return 5;
    return 6;
  };

  const currentProgress = getProgressNumber();

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Visual step indicator bar */}
      <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div
              key={num}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                num < currentProgress
                  ? 'w-6 bg-sky-600'
                  : num === currentProgress
                  ? 'w-8 bg-sky-500'
                  : 'w-4 bg-slate-200'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          Step {currentProgress} / 6
        </span>
      </div>

      {/* Screen container */}
      <div className="flex-1 overflow-hidden">
        {renderCurrentStep()}
      </div>
    </div>
  );
};
