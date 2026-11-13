import React from 'react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full mt-16 sm:mt-24 lg:mt-32 pt-10 pb-16 sm:pb-12 border-t border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Navigation Links */}
        <div className="flex justify-center gap-6 sm:gap-10 flex-wrap mb-4">
          <button
            type="button"
            onClick={() => onNavigate('how')}
            className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer font-medium px-2 py-1"
          >
            How it works
          </button>
          <button
            type="button"
            onClick={() => onNavigate('privacy')}
            className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer font-medium px-2 py-1"
          >
            What is private
          </button>
          <button
            type="button"
            onClick={() => onNavigate('wallets')}
            className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer font-medium px-2 py-1"
          >
            Get a wallet (3 steps)
          </button>
          <button
            type="button"
            onClick={() => onNavigate('help')}
            className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer font-medium px-2 py-1"
          >
            Help & FAQ
          </button>
        </div>

        {/* Security & Protocol Disclaimer */}
        <p className="text-xs text-slate-400 text-center leading-relaxed max-w-xl">
          Non-custodial · No database · No tracking · Powered by Zcash Shielded Orchard & Sapling Pools
        </p>
      </div>
    </footer>
  );
};
