import React, { useState, useEffect } from 'react';
import { Header } from '../ui/Header';
import { Footer } from '../ui/Footer';
import { BottomNav } from '../ui/BottomNav';
import { NetworkModal } from '../ui/NetworkModal';
import { ToastProvider, useToast } from '../ui/Toast';
import { SendScreen } from './SendScreen';
import { PreviewScreen } from './PreviewScreen';
import { PayScreen } from './PayScreen';
import { ReadyScreen } from './ReadyScreen';
import { ClaimScreen } from './ClaimScreen';
import { MyGiftsScreen } from './MyGiftsScreen';
import {
  HowItWorksScreen,
  PrivacyScreen,
  WalletsGuideScreen,
  HelpFaqScreen,
} from './SupportScreens';

import { SendViewModel } from '../viewmodels/SendVM';
import { MyGiftsViewModel } from '../viewmodels/MyGiftsVM';
import { GiftRecord, StorageService } from '../services/StorageService';
import { LightwalletdService } from '../services/LightwalletdService';
import { liveAnnouncer } from '../a11y/liveAnnouncer';
import { focusHeading } from '../a11y/focusManager';

const BG_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4';

const AppContent: React.FC = () => {
  const { showToast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>(() => {
    return LightwalletdService.getActiveEndpoint().network;
  });
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [route, setRoute] = useState<string>('send');
  const [giftHashFragment, setGiftHashFragment] = useState<string>('');
  const [activeGift, setActiveGift] = useState<GiftRecord | null>(null);
  const [giftsCount, setGiftsCount] = useState<number>(0);

  // Singletons for Send and MyGifts ViewModels
  const [sendVM] = useState(() => new SendViewModel());
  const [myGiftsVM] = useState(() => new MyGiftsViewModel());

  // Initialize accessibility live region & detect theme/route
  useEffect(() => {
    liveAnnouncer.init();

    // Load initial settings
    StorageService.getSettings()
      .then((settings) => {
        setTheme(settings.theme === 'dark' ? 'dark' : 'light');
      })
      .catch(() => {});

    // Check gifts count
    StorageService.getAllGifts()
      .then((gifts) => {
        setGiftsCount(gifts.length);
      })
      .catch(() => {});

    // Front Doors Rule (Dan Brown §6.3 & §6.4): check hash for receiver claim
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#1.')) {
        setGiftHashFragment(hash);
        setRoute('claim');
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Update theme on HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Manage focus on route change (WCAG 2.2 §15)
  useEffect(() => {
    focusHeading();
  }, [route]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    StorageService.saveSettings({ theme: next });
  };

  const toggleNetwork = () => {
    const next = network === 'mainnet' ? 'testnet' : 'mainnet';
    setNetwork(next);
    LightwalletdService.setActiveEndpoint(next === 'testnet' ? 'ecc-testnet' : 'zec-rocks');
    showToast(`Switched to Zcash ${next === 'testnet' ? 'Testnet' : 'Mainnet'}`);
    liveAnnouncer.announce(`Switched to Zcash ${next === 'testnet' ? 'Testnet' : 'Mainnet'}`);
  };

  const navigate = (nextRoute: string) => {
    setRoute(nextRoute);
    if (nextRoute === 'send') {
      setActiveGift(null);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden selection:bg-amber-400 selection:text-slate-950">
      {/* Background Looping Video Layer */}
      <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover scale-105"
          src={BG_VIDEO}
        />
        {/* Atmospheric Dark / Light Vignette Overlay */}
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(7, 11, 20, 0.82)' : 'rgba(248, 250, 252, 0.86)',
            backgroundImage:
              theme === 'dark'
                ? 'radial-gradient(ellipse at 50% 0%, rgba(244, 183, 40, 0.08) 0%, rgba(10, 15, 29, 0.82) 55%, rgba(4, 7, 15, 0.95) 100%)'
                : 'radial-gradient(ellipse at 50% 0%, rgba(244, 183, 40, 0.12) 0%, rgba(248, 250, 252, 0.82) 55%, rgba(241, 245, 249, 0.94) 100%)',
          }}
        />
      </div>

      {/* Skip Link for Keyboard / Screen Reader users (§15 POUR) */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Persistent Navigation Header */}
      <Header
        currentRoute={route}
        onNavigate={navigate}
        giftsCount={giftsCount}
        theme={theme}
        onToggleTheme={toggleTheme}
        network={network}
        onToggleNetwork={toggleNetwork}
        onOpenNetworkModal={() => setIsNetworkModalOpen(true)}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full flex flex-col items-center justify-center px-3 sm:px-6 py-6 pb-28 md:pb-14 outline-none"
      >
        {route === 'send' && (
          <SendScreen
            viewModel={sendVM}
            onContinueToPreview={() => setRoute('preview')}
            onExploreHow={() => setRoute('how')}
            onExploreWallets={() => setRoute('wallets')}
          />
        )}

        {route === 'preview' && (
          <PreviewScreen
            viewModel={sendVM}
            onBackToEdit={() => setRoute('send')}
            onProceedToPay={(gift) => {
              setActiveGift(gift);
              setRoute('pay');
            }}
          />
        )}

        {route === 'pay' && activeGift && (
          <PayScreen
            gift={activeGift}
            onPaymentConfirmed={(confirmedGift) => {
              setActiveGift(confirmedGift);
              setGiftsCount((c) => c + 1);
              setRoute('ready');
            }}
          />
        )}

        {route === 'ready' && activeGift && (
          <ReadyScreen
            gift={activeGift}
            onTakeItBack={() => setRoute('gifts')}
          />
        )}

        {route === 'claim' && (
          <ClaimScreen
            key={giftHashFragment}
            fragment={giftHashFragment}
            onNavigateToWallets={() => setRoute('wallets')}
            onNavigateToHome={() => {
              window.location.hash = '';
              setRoute('send');
            }}
          />
        )}

        {route === 'gifts' && (
          <MyGiftsScreen
            viewModel={myGiftsVM}
            onNavigateToSend={() => setRoute('send')}
          />
        )}

        {route === 'how' && <HowItWorksScreen onBack={() => setRoute('send')} />}
        {route === 'privacy' && <PrivacyScreen onBack={() => setRoute('send')} />}
        {route === 'wallets' && <WalletsGuideScreen onBack={() => setRoute('claim')} />}
        {route === 'help' && <HelpFaqScreen onBack={() => setRoute('send')} />}
      </main>

      {/* Informative Footer */}
      <Footer onNavigate={navigate} />

      {/* Mobile Ergonomic Bottom Navigation Dock (Fitts's Law §11) */}
      <BottomNav
        currentRoute={route}
        onNavigate={navigate}
        giftsCount={giftsCount}
        network={network}
        onOpenNetworkModal={() => setIsNetworkModalOpen(true)}
      />

      {/* Network & Node Settings Drawer Modal */}
      <NetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        network={network}
        onSwitchNetwork={toggleNetwork}
        onAnnounceToast={(msg) => showToast(msg)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};
