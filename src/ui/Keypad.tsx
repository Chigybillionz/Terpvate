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

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Preset Chips with Instant Fiat Hints (§5.1 F1) */}
      <div className="flex gap-2 justify-center flex-wrap">
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
              className={`min-h-[40px] px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 cursor-pointer transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-action text-slate-950 font-extrabold shadow-lg shadow-amber-500/30 ring-2 ring-amber-300'
                  : 'liquid-glass text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="font-extrabold text-sm">{chip} ZEC</span>
              <span className={`text-xs font-semibold ${isSelected ? 'text-slate-900' : 'text-white/60'}`}>
                ({shortFiat})
              </span>
            </button>
          );
        })}
      </div>

      {/* 3x4 Grid */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            aria-label={`Digit ${d}`}
            className="liquid-glass h-14 rounded-2xl flex items-center justify-center font-bold text-2xl text-white hover:bg-white/10 active:scale-95 transition-all select-none cursor-pointer"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={handleBackspace}
          aria-label="Backspace"
          className="liquid-glass h-14 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all select-none cursor-pointer"
        >
          <Delete size={22} />
        </button>
      </div>
    </div>
  );
};

