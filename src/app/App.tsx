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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        style={{
          flex: 1,
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          outline: 'none',
        }}
      >
        {route === 'send' && (
          <SendScreen
            viewModel={sendVM}
            onContinueToPreview={() => setRoute('preview')}
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
