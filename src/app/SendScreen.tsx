import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Keypad } from '../ui/Keypad';
import { StepBar } from '../ui/StepBar';
import { SendViewModel, SendState } from '../viewmodels/SendVM';
import { PriceService } from '../services/PriceService';
import { Lock, Shield, HelpCircle, Wallet, MessageSquare } from 'lucide-react';

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

  const [showNoteAccordion, setShowNoteAccordion] = useState(false);

  React.useEffect(() => {
    return viewModel.subscribe(setState);
  }, [viewModel]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
      {/* Mobile-Only Scaled Introduction (Stacked Vertically §2) */}
      <div className="flex lg:hidden flex-col items-center text-center mb-6 sm:mb-8">
        <div className="liquid-glass inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold text-amber-300 mb-3 border border-amber-400/20 shadow-md shadow-amber-500/10">
          <Shield size={13} className="text-amber-400" />
          <span>Shielded Zcash Gifting</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 leading-snug">
          Give Freely.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
            Stay Truly Private.
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
          Create non-custodial, zero-knowledge gift links funded with shielded ZEC.
          No accounts or KYC required.
        </p>
      </div>

      {/* Main Two-Column Desktop Grid / Single-Column Mobile Grid (§1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
        
        {/* Left Column: Full Hero Introduction (Desktop Only §1) */}
        <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col items-start text-left">
          {/* Glowing Shielded Badge */}
          <div className="liquid-glass inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-amber-300 mb-6 border border-amber-400/25 shadow-lg shadow-amber-500/10">
            <Shield size={14} className="text-amber-400" />
            <span>Shielded Zcash Gifting</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.12]">
            Give Freely. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
              Stay Truly Private.
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base lg:text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
            Create non-custodial, zero-knowledge gift links funded with shielded ZEC.
            No accounts or KYC required. Encrypted end-to-end and shareable via WhatsApp, Signal, Telegram, or QR.
          </p>

          {/* Feature Micro-Badges */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="liquid-glass px-3.5 py-1.5 rounded-full text-xs text-white/85 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Non-Custodial</span>
            </div>
            <div className="liquid-glass px-3.5 py-1.5 rounded-full text-xs text-white/85 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Zero-Knowledge Proofs</span>
            </div>
            <div className="liquid-glass px-3.5 py-1.5 rounded-full text-xs text-white/85 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Secret # URL Hash</span>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="flex items-center gap-4">
            {onExploreHow && (
              <button
                type="button"
                onClick={onExploreHow}
                className="bg-white text-slate-950 font-semibold text-sm sm:text-base px-7 py-3.5 rounded-full hover:bg-slate-100 active:scale-95 transition-all shadow-lg shadow-white/10 flex items-center gap-2 cursor-pointer"
              >
                <HelpCircle size={17} />
                <span>How It Works</span>
              </button>
            )}
            {onExploreWallets && (
              <button
                type="button"
                onClick={onExploreWallets}
                className="liquid-glass text-white font-medium text-sm sm:text-base px-7 py-3.5 rounded-full hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Wallet size={17} />
                <span>Supported Wallets</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Gift Creation Card (§4) */}
        <div className="lg:col-span-5 xl:col-span-5 w-full max-w-[440px] mx-auto lg:ml-auto">
          <div className="liquid-glass rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl border border-white/15 backdrop-blur-2xl">
            {/* Progress Step Bar */}
            <StepBar currentStep={1} />

            {/* Amount Hero Card (Direct Manipulation §7.1) */}
            <div className="bg-white/5 rounded-2xl py-4 sm:py-5 px-4 text-center my-3 sm:my-4 border border-white/10 shadow-inner">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                {state.zecAmount}{' '}
                <span className="text-lg sm:text-xl font-bold text-action">ZEC</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-300 mt-1 font-semibold">
                {state.fiatEstimate.displayString}
              </div>
            </div>

            {/* Direct Manipulation Keypad with Chips */}
            <Keypad
              value={state.zecAmount}
              onChange={(val) => viewModel.setAmount(val)}
            />

            {/* Optional Note & Passcode Collapsible Accordion (Clean Ergonomics §4) */}
            <div className="mt-4 border-t border-white/10 pt-3">
              {!showNoteAccordion ? (
                <button
                  type="button"
                  onClick={() => setShowNoteAccordion(true)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-action" />
                    <span>Attach note or secret passcode (optional)</span>
                  </span>
                  <span className="text-action font-bold text-sm">+</span>
                </button>
              ) : (
                <div className="space-y-3 pt-1 animate-slide-down">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/90">Secret Note & Passcode</span>
                    <button
                      type="button"
                      onClick={() => setShowNoteAccordion(false)}
                      className="text-xs text-white/50 hover:text-white cursor-pointer px-2 py-0.5"
                    >
                      Hide
                    </button>
                  </div>

                  <div>
                    <textarea
                      id="gift-message"
                      rows={2}
                      value={state.message}
                      onChange={(e) => viewModel.setMessage(e.target.value)}
                      placeholder="Happy Birthday! 🎉"
                      className="liquid-glass w-full p-2.5 rounded-xl text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-action transition-all resize-none border border-white/10"
                    />

                    {/* Quick Exemplar Templates */}
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl}
                          type="button"
                          onClick={() => viewModel.setMessage(tmpl)}
                          className="liquid-glass text-[11px] font-medium px-2.5 py-1 rounded-full text-white/75 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                        >
                          {tmpl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Passcode Protection Toggle */}
                  <div className="liquid-glass rounded-xl p-3 border border-white/10">
                    <div
                      onClick={() => viewModel.togglePasscode()}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Lock size={13} className="text-action" />
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
                      <div className="mt-2.5 pt-2.5 border-t border-white/10">
                        <input
                          type="text"
                          value={state.passcode}
                          onChange={(e) => viewModel.setPasscode(e.target.value)}
                          placeholder="Enter secret passcode..."
                          className="liquid-glass w-full p-2 rounded-lg text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-action border border-white/10"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button (Thumb Zone §11) */}
            <div className="mt-5">
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
