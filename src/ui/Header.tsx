import React, { useState, useEffect } from 'react';
import {
  Infinity,
  Menu,
  X,
  Sun,
  Moon,
  Gift,
  HelpCircle,
  Shield,
  FileText,
  LifeBuoy,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  giftsCount?: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  network?: 'mainnet' | 'testnet';
  onToggleNetwork?: () => void;
  onOpenNetworkModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  giftsCount = 0,
  theme,
  onToggleTheme,
  network = 'mainnet',
  onToggleNetwork,
  onOpenNetworkModal,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile drawer on route change or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isSendActive = ['send', 'preview', 'pay', 'ready'].includes(currentRoute);

  const desktopNavLinks = [
    { id: 'send', label: 'Send a Gift', active: isSendActive },
    { id: 'gifts', label: 'My Gifts', count: giftsCount, active: currentRoute === 'gifts' },
    { id: 'how', label: 'How It Works', active: currentRoute === 'how' },
    { id: 'wallets', label: 'Wallets', active: currentRoute === 'wallets' },
  ];

  const mobileNavLinks = [
    { id: 'send', label: 'Send a Gift', icon: Infinity, active: isSendActive },
    { id: 'gifts', label: 'My Gifts', icon: Gift, count: giftsCount, active: currentRoute === 'gifts' },
    { id: 'how', label: 'How It Works', icon: HelpCircle, active: currentRoute === 'how' },
    { id: 'wallets', label: 'Supported Wallets', icon: Shield, active: currentRoute === 'wallets' },
    { id: 'privacy', label: 'Privacy Policy', icon: FileText, active: currentRoute === 'privacy' },
    { id: 'help', label: 'Help & FAQ', icon: LifeBuoy, active: currentRoute === 'help' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  const handleNetworkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenNetworkModal) {
      onOpenNetworkModal();
    } else if (onToggleNetwork) {
      onToggleNetwork();
    }
  };

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div
            onClick={() => handleNavClick('send')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl liquid-glass flex items-center justify-center text-action group-hover:scale-105 transition-transform shadow-md shadow-amber-500/10">
              <Infinity size={22} strokeWidth={2} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Terpvate
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-action/15 text-action border border-action/30 uppercase">
                Shielded
              </span>
            </div>
          </div>

          {/* Center: Liquid Glass Nav Pill (Desktop Only) */}
          <nav className="hidden md:flex liquid-glass items-center gap-1.5 p-1.5 rounded-full shadow-lg">
            {desktopNavLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  link.active
                    ? 'bg-action text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.id === 'gifts' && <Gift size={15} />}
                <span>{link.label}</span>
                {Boolean(link.count && link.count > 0) && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-0.5 ${
                      link.active ? 'bg-slate-950/20 text-slate-950' : 'bg-action text-slate-950'
                    }`}
                  >
                    {link.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right: Network Pill, Theme Toggle, Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Network Switcher Button */}
            <button
              type="button"
              onClick={handleNetworkClick}
              title="Click to view node and network settings"
              className={`liquid-glass text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all hover:scale-[1.02] cursor-pointer ${
                network === 'testnet'
                  ? 'text-purple-300 border-purple-500/40'
                  : 'text-emerald-300 border-emerald-500/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  network === 'testnet' ? 'bg-purple-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              <span className="text-[10px] sm:text-xs tracking-wider font-bold">
                {network === 'testnet' ? 'TESTNET' : 'MAINNET'}
              </span>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle light / dark theme"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full liquid-glass text-white/80 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl liquid-glass text-white transition-colors flex items-center justify-center cursor-pointer md:hidden"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop Scrim */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 md:hidden animate-fade-in"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Up Bottom Sheet Drawer (HCI & Fitts's Law Aligned) */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-slate-950/98 text-white border-t border-white/20 rounded-t-[32px] p-6 shadow-2xl backdrop-blur-2xl animate-slide-up max-h-[85vh] overflow-y-auto"
        >
          {/* Bottom Sheet Drag Handle */}
          <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-5" />

          {/* Menu Header with Close */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center text-action">
                <Infinity size={20} strokeWidth={2} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-base font-bold tracking-tight text-white leading-tight">Terpvate</span>
                <span className="text-xs text-white/50">Shielded Zcash Ecosystem</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* Nav Links List */}
          <div className="flex flex-col gap-2">
            {mobileNavLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center justify-between w-full px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                    link.active
                      ? 'bg-action/20 text-amber-300 border border-action/40 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10 active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        link.active ? 'bg-action/30 text-amber-300' : 'bg-white/5 text-action'
                      }`}
                    >
                      <IconComponent size={18} />
                    </div>
                    <span className="text-sm font-medium">{link.label}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {Boolean(link.count && link.count > 0) && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-action text-slate-950">
                        {link.count}
                      </span>
                    )}
                    <ChevronRight size={16} className="opacity-40" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Network Switcher Card in Sheet */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  network === 'testnet' ? 'bg-purple-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white">Zcash {network.toUpperCase()}</span>
                <span className="text-[11px] text-white/50 font-mono">
                  {network === 'testnet' ? 'ECC Testnet Node' : 'zec.rocks Mainnet Node'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleNetworkClick}
              className="text-xs font-bold text-action px-4 py-2 rounded-full liquid-glass hover:bg-white/10 transition-colors cursor-pointer"
            >
              Switch Node
            </button>
          </div>
        </div>
      )}
    </>
  );
};
