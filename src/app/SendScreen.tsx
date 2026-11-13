import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Keypad } from '../ui/Keypad';
import { StepBar } from '../ui/StepBar';
import { SendViewModel, SendState } from '../viewmodels/SendVM';
import { PriceService } from '../services/PriceService';
import { Lock, Shield, HelpCircle, Wallet } from 'lucide-react';

interface SendScreenProps {
  viewModel: SendViewModel;
  onContinueToPreview: () => void;
  onExploreHow?: () => void;
  onExploreWallets?: () => void;
}

const TEMPLATES = ['Happy Birthday! 🎉', 'Thank you so much! 🙏', 'Enjoy your lunch! ☕', 'Great work! 🚀'];

export const SendScreen: React.FC<SendScreenProps> = ({
  viewModel,
  onContinueToPreview,
  onExploreHow,
  onExploreWallets,
}) => {
  const [state, setState] = useState<SendState>(() => ({
    zecAmount: '0.05',
    fiatEstimate: PriceService.estimateNgn('0.05'),
    message: '',
    passcode: '',
    isPasscodeEnabled: false,
    isCreating: false,
  }));

  React.useEffect(() => {
    return viewModel.subscribe(setState);
  }, [viewModel]);

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        
        {/* Left Column: Hero Section (Liquid Glass Aesthetic) */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Glowing Shielded Badge */}
          <div className="liquid-glass inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-amber-300 mb-4 border border-amber-400/20 shadow-lg shadow-amber-500/10">
            <Shield size={14} className="text-amber-400" />
            <span>Shielded Zcash Gifting</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink mb-4 leading-tight">
            Give Freely. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              Stay Truly Private.
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-secondary text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
            Create non-custodial, zero-knowledge gift links funded with shielded ZEC.
            No accounts or KYC required. Encrypted end-to-end and shareable via WhatsApp, Signal, or QR.
          </p>

          {/* Feature Micro-Badges */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
            <div className="liquid-glass px-3 py-1.5 rounded-full text-xs text-ink/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Non-Custodial</span>
            </div>
            <div className="liquid-glass px-3 py-1.5 rounded-full text-xs text-ink/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Zero-Knowledge</span>
            </div>
            <div className="liquid-glass px-3 py-1.5 rounded-full text-xs text-ink/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Secret # URL Hash</span>
            </div>
          </div>

          {/* Hero CTAs (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {onExploreHow && (
              <button
                type="button"
                onClick={onExploreHow}
                className="liquid-glass text-ink text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <HelpCircle size={16} />
                <span>How It Works</span>
              </button>
            )}
            {onExploreWallets && (
              <button
                type="button"
                onClick={onExploreWallets}
                className="liquid-glass text-ink text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Wallet size={16} />
                <span>Supported Wallets</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Send Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="liquid-glass rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/10">
            {/* Step Bar */}
            <StepBar currentStep={1} />

            <h2 className="text-lg font-bold text-center text-ink mb-4">
              How much would you like to send?
            </h2>

            {/* Amount Hero Card (Direct Manipulation §7.1) */}
            <Card style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink">
                {state.zecAmount}{' '}
                <span className="text-xl sm:text-2xl font-bold text-action">ZEC</span>
              </div>
              <div className="text-sm text-secondary mt-1.5 font-semibold">
                {state.fiatEstimate.displayString}
              </div>
            </Card>

            {/* Direct Manipulation Keypad with Chips */}
            <Keypad
              value={state.zecAmount}
              onChange={(val) => viewModel.setAmount(val)}
            />

            {/* Optional Private Message */}
            <div className="mt-5">
              <label
                htmlFor="gift-message"
                className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2"
              >
                Private encrypted note (optional)
              </label>
              <textarea
                id="gift-message"
                rows={2}
                value={state.message}
                onChange={(e) => viewModel.setMessage(e.target.value)}
                placeholder="Happy Birthday! 🎉"
                className="liquid-glass w-full p-3 rounded-xl text-ink text-sm placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action/50 transition-all resize-none border border-white/10"
              />

              {/* Quick Message Exemplar Chips (Dan Brown §6.4) */}
              <div className="flex gap-1.5 flex-wrap mt-2">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => viewModel.setMessage(tmpl)}
                    className="liquid-glass text-xs font-semibold px-2.5 py-1 rounded-full text-secondary hover:text-ink hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Passcode (§2 #8, §14.2) */}
            <div className="liquid-glass rounded-2xl p-3.5 mt-5 border border-white/10">
              <div
                onClick={() => viewModel.togglePasscode()}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-ink">
                  <Lock size={15} className="text-action" />
                  <span>Protect with Passcode</span>
                </div>
                <input
                  type="checkbox"
                  checked={state.isPasscodeEnabled}
                  onChange={(e) => viewModel.togglePasscode(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 cursor-pointer"
                />
              </div>

              {state.isPasscodeEnabled && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <input
                    type="text"
                    value={state.passcode}
                    onChange={(e) => viewModel.setPasscode(e.target.value)}
                    placeholder="Enter secret passcode..."
                    className="liquid-glass w-full p-2.5 rounded-xl text-ink text-sm placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action/50 border border-white/10"
                  />
                  <p className="text-[11px] text-secondary mt-1">
                    The receiver will need this passcode to open the envelope.
                  </p>
                </div>
              )}
            </div>

            {/* Primary Action Button (Thumb Zone §11) */}
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={onContinueToPreview}
                disabled={parseFloat(state.zecAmount) <= 0}
              >
                <span>Continue</span>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
