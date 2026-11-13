import React from 'react';
import { Delete } from 'lucide-react';
import { PriceService } from '../services/PriceService';

interface KeypadProps {
  value: string;
  onChange: (val: string) => void;
  presetChips?: number[];
}

export const Keypad: React.FC<KeypadProps> = ({
  value,
  onChange,
  presetChips = [0.01, 0.05, 0.1],
}) => {
  const handleDigit = (digit: string) => {
    if (value === '0' && digit !== '.') {
      onChange(digit);
      return;
    }
    // Prevent multiple decimals
    if (digit === '.' && value.includes('.')) {
      return;
    }
    // Limit to 8 decimal places for ZEC
    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1] && parts[1].length >= 8) {
        return;
      }
    }
    onChange(value + digit);
  };

  const handleBackspace = () => {
    if (value.length <= 1) {
      onChange('0');
    } else {
      onChange(value.slice(0, -1));
    }
  };

  const handleChip = (val: number) => {
    onChange(val.toString());
  };

  const keyStyle: React.CSSProperties = {
    minHeight: 'var(--keypad-min-height)', // 56px per Ergonomics §11
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--color-border)',
    backgroundColor: 'var(--color-card)',
    color: 'var(--color-ink)',
    fontSize: '22px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    boxShadow: 'var(--shadow-sm)',
    transition: 'background-color 100ms ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Preset Chips with Instant Fiat Hints (§5.1 F1) */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {presetChips.map((chip) => {
          const fiat = PriceService.estimateNgn(chip);
          const fiatNum = Number(fiat.fiatAmount);
          const shortFiat = fiatNum >= 1000 ? `₦${Math.round(fiatNum / 1000)}k` : `₦${fiatNum}`;
          const isSelected = value === chip.toString();

          return (
            <button
              key={chip}
              type="button"
              onClick={() => handleChip(chip)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? '2px solid var(--color-action)' : '1.5px solid var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-action)' : 'var(--color-chip-bg)',
                color: isSelected ? '#0F172A' : 'var(--color-ink)',
                cursor: 'pointer',
                minHeight: '38px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isSelected ? '0 0 0 2px rgba(244, 183, 40, 0.3)' : 'none',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '13px' }}>{chip} ZEC</span>
              <span style={{ fontSize: '11px', opacity: isSelected ? 0.85 : 0.8, fontWeight: 600 }}>({shortFiat})</span>
            </button>
          );
        })}
      </div>

      {/* 3x4 Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          width: '100%',
        }}
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((d) => (
          <button
            key={d}
            type="button"
            style={keyStyle}
            onClick={() => handleDigit(d)}
            aria-label={`Digit ${d}`}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          style={keyStyle}
          onClick={handleBackspace}
          aria-label="Backspace"
        >
          <Delete size={22} />
        </button>
      </div>
    </div>
  );
};

