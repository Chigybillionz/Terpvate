import React from 'react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        padding: '24px 16px',
        borderTop: '1px solid rgba(15, 23, 42, 0.08)',
        backgroundColor: 'var(--color-card)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate('how')}
          style={linkStyle}
        >
          How it works
        </button>
        <button
          type="button"
          onClick={() => onNavigate('privacy')}
          style={linkStyle}
        >
          What is private
        </button>
        <button
          type="button"
          onClick={() => onNavigate('wallets')}
          style={linkStyle}
        >
          Get a wallet (3 steps)
        </button>
        <button
          type="button"
          onClick={() => onNavigate('help')}
          style={linkStyle}
        >
          Help & FAQ
        </button>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>
        No custody · No database · No tracking · Zcash Shielded (Orchard/Sapling)
      </p>
    </footer>
  );
};

const linkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-info)',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  padding: '4px',
};

