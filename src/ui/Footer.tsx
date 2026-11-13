import React from 'react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full mt-auto py-5 px-4 text-center border-t border-white/10 backdrop-blur-xl">
      <div className="flex justify-center gap-4 sm:gap-6 flex-wrap mb-2">
        <button
          type="button"
          onClick={() => onNavigate('how')}
          className="text-xs text-ink/70 hover:text-ink transition-colors cursor-pointer font-medium"
        >
          How it works
        </button>
        <button
          type="button"
          onClick={() => onNavigate('privacy')}
          className="text-xs text-ink/70 hover:text-ink transition-colors cursor-pointer font-medium"
        >
          What is private
        </button>
        <button
          type="button"
          onClick={() => onNavigate('wallets')}
          className="text-xs text-ink/70 hover:text-ink transition-colors cursor-pointer font-medium"
        >
          Get a wallet (3 steps)
        </button>
        <button
          type="button"
          onClick={() => onNavigate('help')}
          className="text-xs text-ink/70 hover:text-ink transition-colors cursor-pointer font-medium"
        >
          Help & FAQ
        </button>
      </div>

      <p className="text-[11px] text-secondary/60">
        No custody · No database · No tracking · Zcash Shielded (Orchard/Sapling)
      </p>
    </footer>
  );
};
