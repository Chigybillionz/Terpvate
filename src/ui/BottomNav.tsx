import React from 'react';
import { Gift, Package, HelpCircle, Globe } from 'lucide-react';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  giftsCount?: number;
  network?: 'mainnet' | 'testnet';
  onOpenNetworkModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentRoute,
  onNavigate,
  giftsCount = 0,
  network = 'mainnet',
  onOpenNetworkModal,
}) => {
  // Do not show bottom nav on receiver claim page to keep the experience calm and focused
  if (currentRoute === 'claim') {
    return null;
  }

  const isSendActive = ['send', 'preview', 'pay', 'ready'].includes(currentRoute);
  const isGiftsActive = currentRoute === 'gifts';
  const isGuideActive = ['how', 'wallets', 'privacy', 'help'].includes(currentRoute);

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-card)',
        borderTop: '1px solid rgba(15, 23, 42, 0.09)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '6px 12px calc(6px + env(safe-area-inset-bottom, 0px)) 12px',
        zIndex: 40,
        boxShadow: '0 -4px 16px -2px rgba(15, 23, 42, 0.05)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* 1. Send Tab */}
      <button
        type="button"
        onClick={() => onNavigate('send')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '48px', // Fitts's Law >= 48px
          minWidth: '64px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 'var(--radius-md)',
          color: isSendActive ? 'var(--color-action)' : 'var(--color-secondary)',
          position: 'relative',
        }}
      >
        <div
          style={{
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isSendActive ? 'rgba(244, 183, 40, 0.2)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 150ms ease',
          }}
        >
          <Gift size={20} strokeWidth={isSendActive ? 2.5 : 2} color={isSendActive ? 'var(--color-action)' : 'var(--color-secondary)'} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: isSendActive ? 800 : 600, marginTop: '2px' }}>
          Send
        </span>
      </button>

      {/* 2. My Gifts Tab */}
      <button
        type="button"
        onClick={() => onNavigate('gifts')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '48px',
          minWidth: '64px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 'var(--radius-md)',
          color: isGiftsActive ? 'var(--color-action)' : 'var(--color-secondary)',
          position: 'relative',
        }}
      >
        <div
          style={{
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isGiftsActive ? 'rgba(244, 183, 40, 0.2)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'background-color 150ms ease',
          }}
        >
          <Package size={20} strokeWidth={isGiftsActive ? 2.5 : 2} color={isGiftsActive ? 'var(--color-action)' : 'var(--color-secondary)'} />
          {giftsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '4px',
                backgroundColor: 'var(--color-action)',
                color: '#0F172A',
                fontSize: '10px',
                fontWeight: 800,
                borderRadius: 'var(--radius-full)',
                padding: '1px 5px',
                border: '1px solid var(--color-outline)',
                lineHeight: 1.2,
              }}
            >
              {giftsCount}
            </span>
          )}
        </div>
        <span style={{ fontSize: '11px', fontWeight: isGiftsActive ? 800 : 600, marginTop: '2px' }}>
          My Gifts
        </span>
      </button>

      {/* 3. Guide & Wallets Tab */}
      <button
        type="button"
        onClick={() => onNavigate('how')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '48px',
          minWidth: '64px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 'var(--radius-md)',
          color: isGuideActive ? 'var(--color-action)' : 'var(--color-secondary)',
        }}
      >
        <div
          style={{
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isGuideActive ? 'rgba(244, 183, 40, 0.2)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 150ms ease',
          }}
        >
          <HelpCircle size={20} strokeWidth={isGuideActive ? 2.5 : 2} color={isGuideActive ? 'var(--color-action)' : 'var(--color-secondary)'} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: isGuideActive ? 800 : 600, marginTop: '2px' }}>
          Guide
        </span>
      </button>

      {/* 4. Network Modal Trigger */}
      <button
        type="button"
        onClick={onOpenNetworkModal}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '48px',
          minWidth: '64px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-secondary)',
        }}
      >
        <div
          style={{
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Globe
            size={20}
            color={network === 'testnet' ? '#7E22CE' : '#15803D'}
            strokeWidth={2}
          />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: network === 'testnet' ? '#7E22CE' : '#15803D', marginTop: '2px' }}>
          {network === 'testnet' ? 'Testnet' : 'Mainnet'}
        </span>
      </button>
    </nav>
  );
};

