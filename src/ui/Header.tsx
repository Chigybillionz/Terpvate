import React from 'react';
import { Gift, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  giftsCount?: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  giftsCount = 0,
  theme,
  onToggleTheme,
}) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        backgroundColor: 'var(--color-card)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        onClick={() => onNavigate('send')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-action)',
            border: '2px solid var(--color-outline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            color: '#0F172A',
          }}
        >
          ⓩ
        </div>
        <div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>Tip</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: 'rgba(244, 183, 40, 0.25)',
              color: '#92400E',
              padding: '2px 6px',
              borderRadius: '6px',
              marginLeft: '6px',
            }}
          >
            SHIELDED
          </span>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={() => onNavigate('send')}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: currentRoute === 'send' ? 'rgba(15, 23, 42, 0.06)' : 'transparent',
            color: 'var(--color-ink)',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Send a gift
        </button>

        <button
          type="button"
          onClick={() => onNavigate('gifts')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: currentRoute === 'gifts' ? 'rgba(15, 23, 42, 0.06)' : 'transparent',
            color: 'var(--color-ink)',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Gift size={16} />
          <span>My gifts</span>
          {giftsCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--color-action)',
                color: '#0F172A',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                padding: '1px 6px',
                border: '1px solid var(--color-outline)',
              }}
            >
              {giftsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-ink)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </nav>
    </header>
  );
};
