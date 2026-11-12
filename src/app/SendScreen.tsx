import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Keypad } from '../ui/Keypad';
import { StepBar } from '../ui/StepBar';
import { SendViewModel, SendState } from '../viewmodels/SendVM';
import { PriceService } from '../services/PriceService';
import { Lock } from 'lucide-react';

interface SendScreenProps {
  viewModel: SendViewModel;
  onContinueToPreview: () => void;
}

const TEMPLATES = ['Happy Birthday! 🎉', 'Thank you so much! 🙏', 'Enjoy your lunch! ☕', 'Great work! 🚀'];

export const SendScreen: React.FC<SendScreenProps> = ({ viewModel, onContinueToPreview }) => {
  const [state, setState] = useState<SendState>(() => ({
    zecAmount: '0.05',
    fiatEstimate: PriceService.estimateNgn('0.05'),
    message: '',
    passcode: '',
    isPasscodeEnabled: false,
    isCreating: false,
  }));

  React.useEffect(() => {
    return viewModel.subscribe(setState);
  }, [viewModel]);

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
      <StepBar currentStep={1} />

      <h1
        style={{
          fontSize: '20px',
          fontWeight: 800,
          textAlign: 'center',
          marginBottom: '16px',
        }}
      >
        How much would you like to send?
      </h1>

      {/* Amount Hero Card (Direct Manipulation §7.1) */}
      <Card style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '36px', fontWeight: 800, color: '#0F172A' }}>
          {state.zecAmount} <span style={{ fontSize: '20px', fontWeight: 600 }}>ZEC</span>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--color-secondary)', marginTop: '4px' }}>
          {state.fiatEstimate.displayString}
        </div>
      </Card>

      {/* Direct Manipulation Keypad with Chips */}
      <Keypad
        value={state.zecAmount}
        onChange={(val) => viewModel.setAmount(val)}
      />

      {/* Optional Private Message */}
      <div style={{ marginTop: '24px' }}>
        <label
          htmlFor="gift-message"
          style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}
        >
          Write a private message (optional)
        </label>
        <textarea
          id="gift-message"
          rows={2}
          value={state.message}
          onChange={(e) => viewModel.setMessage(e.target.value)}
          placeholder="Happy Birthday!"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(15, 23, 42, 0.2)',
            fontFamily: 'inherit',
            fontSize: '15px',
            backgroundColor: 'var(--color-card)',
            color: 'var(--color-ink)',
            resize: 'none',
          }}
        />

        {/* Quick Message Exemplar Chips (Dan Brown §6.4) */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl}
              type="button"
              onClick={() => viewModel.setMessage(tmpl)}
              style={{
                background: 'rgba(15, 23, 42, 0.05)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                color: 'var(--color-ink)',
              }}
            >
              {tmpl}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Passcode (§2 #8, §14.2) */}
      <div style={{ marginTop: '20px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.03)' }}>
        <div
          onClick={() => viewModel.togglePasscode()}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
            <Lock size={16} />
            <span>Protect with Passcode</span>
          </div>
          <input
            type="checkbox"
            checked={state.isPasscodeEnabled}
            onChange={(e) => viewModel.togglePasscode(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </div>

        {state.isPasscodeEnabled && (
          <div style={{ marginTop: '10px' }}>
            <input
              type="text"
              value={state.passcode}
              onChange={(e) => viewModel.setPasscode(e.target.value)}
              placeholder="Enter secret passcode..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(15, 23, 42, 0.2)',
                backgroundColor: 'var(--color-card)',
                color: 'var(--color-ink)',
                fontSize: '14px',
              }}
            />
            <p style={{ fontSize: '12px', color: 'var(--color-secondary)', marginTop: '4px' }}>
              The receiver will need this passcode to open the envelope.
            </p>
          </div>
        )}
      </div>

      {/* Primary Action Button (Thumb Zone §11) */}
      <div style={{ marginTop: '28px', marginBottom: '32px' }}>
        <Button
          variant="primary"
          onClick={onContinueToPreview}
          disabled={parseFloat(state.zecAmount) <= 0}
        >
          <span>Continue</span>
        </Button>
      </div>
    </div>
  );
};
