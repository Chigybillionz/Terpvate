import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ClaimViewModel, ClaimState } from '../viewmodels/ClaimVM';
import { CheckCircle2, ShieldCheck, AlertCircle, ArrowLeft, Lock, HelpCircle } from 'lucide-react';

interface ClaimScreenProps {
  fragment: string;
  onNavigateToWallets: () => void;
  onNavigateToHome: () => void;
}

export const ClaimScreen: React.FC<ClaimScreenProps> = ({
  fragment,
  onNavigateToWallets,
  onNavigateToHome,
}) => {
  const [viewModel] = useState(() => new ClaimViewModel(fragment));
  const [state, setState] = useState<ClaimState>(() => viewModel.getState());

  // Step sub-state within receiver journey: 'landing' -> 'address' -> 'confirm' -> 'done'
  const [subStep, setSubStep] = useState<'landing' | 'address' | 'confirm' | 'done'>('landing');

  useEffect(() => {
    const unsub = viewModel.subscribe(setState);
    viewModel.parseAndVerify();
    return unsub;
  }, [viewModel]);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await viewModel.submitPasscode(state.passcodeInput);
  };

  const handleConfirmClaim = async () => {
    try {
      await viewModel.executeClaim();
      setSubStep('done');
    } catch {
      // Error in state
    }
  };

  // If link is corrupted / truncated (PRD §8.3 E10)
  if (state.error && !state.decoded) {
    return (
      <div style={{ maxWidth: '440px', margin: '40px auto', textAlign: 'center' }}>
        <Card style={{ padding: '32px' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-error)', margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Invalid Gift Link</h2>
          <p style={{ color: 'var(--color-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            {state.error}
          </p>
          <Button variant="secondary" onClick={onNavigateToHome}>
            Go to Tip Home
          </Button>
        </Card>
      </div>
    );
  }

  // R7: Success Screen
  if (subStep === 'done' || state.isClaimed) {
    const last4 = state.receiverAddress.slice(-4);
    return (
      <div style={{ maxWidth: '440px', margin: '20px auto', width: '100%' }}>
        <Card variant="gold" style={{ textAlign: 'center', padding: '36px 20px', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Gift claimed</h1>
          <p style={{ fontSize: '15px', color: 'var(--color-ink)', marginTop: '8px' }}>
            {viewModel.getDisplayZec()} ZEC is on its way to your wallet ending <strong style={{ fontFamily: 'var(--font-mono)' }}>…{last4}</strong>.
          </p>

          <div
            style={{
              marginTop: '24px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(15, 23, 42, 0.1)',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>
              Confirming 1 of 3
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-secondary)', marginTop: '2px' }}>
              Usually about 4 minutes
            </div>
          </div>
        </Card>

        <div style={{ textAlign: 'center' }}>
          <Button variant="ghost" onClick={onNavigateToHome}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // R1-R3: Receiver Landing
  if (subStep === 'landing') {
    return (
      <div style={{ maxWidth: '440px', margin: '20px auto', width: '100%' }}>
        <Card variant="gold" style={{ textAlign: 'center', padding: '36px 20px', marginBottom: '24px' }}>
          <p style={{ fontSize: '15px', color: 'var(--color-secondary)', marginBottom: '8px' }}>
            You received a private gift
          </p>

          {/* Decrypted or placeholder message */}
          {state.messagePlain ? (
            <p style={{ fontSize: '18px', fontStyle: 'italic', fontWeight: 700, margin: '12px 0' }}>
              "{state.messagePlain}"
            </p>
          ) : (
            <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--color-secondary)', margin: '8px 0' }}>
              (No message attached)
            </p>
          )}

          {/* Amount: checking... until verified on-chain (§2 A11) */}
          <div style={{ fontSize: '40px', fontWeight: 800, color: '#0F172A', margin: '16px 0' }}>
            {state.isVerifying ? (
              <span style={{ fontSize: '24px', color: 'var(--color-secondary)' }}>checking…</span>
            ) : (
              <span>{viewModel.getDisplayZec()} ZEC</span>
            )}
          </div>

          <div style={{ fontSize: '13px', color: state.isVerified ? 'var(--color-success)' : 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ShieldCheck size={16} />
            <span>{state.isVerified ? 'Verified on Zcash blockchain' : 'Verifying on the Zcash blockchain…'}</span>
          </div>
        </Card>

        {/* Passcode Unlock if protected (§14.2) */}
        {state.isPasscodeProtected && !state.unwrappedSecretHex && (
          <Card style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 700 }}>
              <Lock size={18} />
              <span>Passcode Required</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary)', marginBottom: '12px' }}>
              The sender set a secret passcode for this gift envelope.
            </p>
            <form onSubmit={handlePasscodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="password"
                value={state.passcodeInput}
                onChange={(e) => setState((s) => ({ ...s, passcodeInput: e.target.value }))}
                placeholder="Enter passcode..."
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(15, 23, 42, 0.2)',
                  fontSize: '15px',
                }}
              />
              {state.passcodeError && (
                <p style={{ fontSize: '13px', color: 'var(--color-error)' }}>{state.passcodeError}</p>
              )}
              <Button variant="secondary" type="submit">
                Unlock Gift
              </Button>
            </form>
          </Card>
        )}

        {/* Claim Action Button (Norman Stage 2/3 §7.3) */}
        <Button
          variant="primary"
          disabled={state.isVerifying || (state.isPasscodeProtected && !state.unwrappedSecretHex)}
          onClick={() => setSubStep('address')}
        >
          Claim Gift
        </Button>
      </div>
    );
  }

  // R4: Address Input Screen
  if (subStep === 'address') {
    return (
      <div style={{ maxWidth: '440px', margin: '20px auto', width: '100%' }}>
        <button
          type="button"
          onClick={() => setSubStep('landing')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-secondary)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Where should we send it?</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-secondary)', marginBottom: '20px' }}>
          Enter your private shielded address (Unified Address starting with <code>u1</code> or Sapling starting with <code>zs1</code>).
        </p>

        <Card style={{ marginBottom: '20px' }}>
          <label htmlFor="receiver-addr" style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
            Zcash Shielded Address
          </label>
          <textarea
            id="receiver-addr"
            rows={3}
            value={state.receiverAddress}
            onChange={(e) => viewModel.setReceiverAddress(e.target.value)}
            placeholder="Paste your address (u1... or zs1...)"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: state.addressValidation.errorMessage
                ? '1.5px solid var(--color-error)'
                : '1px solid rgba(15, 23, 42, 0.2)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              resize: 'none',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-ink)',
            }}
          />

          {/* Validation Feedback (§8.3 E5, E6, E7) */}
          {state.addressValidation.errorMessage && (
            <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--color-error)', lineHeight: 1.4 }}>
              {state.addressValidation.errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <Button
              variant="secondary"
              fullWidth={false}
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  viewModel.setReceiverAddress(text);
                } catch {}
              }}
            >
              Paste
            </Button>
            <Button
              variant="ghost"
              fullWidth={false}
              onClick={onNavigateToWallets}
            >
              <HelpCircle size={16} />
              <span>I don't have a wallet</span>
            </Button>
          </div>
        </Card>

        <Button
          variant="primary"
          disabled={!state.addressValidation.isValid}
          onClick={() => setSubStep('confirm')}
        >
          Continue
        </Button>
      </div>
    );
  }

  // R5: One-Tap Confirm
  const last4 = state.receiverAddress.slice(-4);
  return (
    <div style={{ maxWidth: '440px', margin: '20px auto', width: '100%' }}>
      <button
        type="button"
        onClick={() => setSubStep('address')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-secondary)',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          marginBottom: '16px',
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>Confirm & Claim</h1>

      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
          <span style={{ color: 'var(--color-secondary)' }}>You receive</span>
          <span style={{ fontWeight: 800, fontSize: '18px' }}>{viewModel.getDisplayZec()} ZEC</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
          <span style={{ color: 'var(--color-secondary)' }}>Destination</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>…{last4}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
          <span style={{ color: 'var(--color-secondary)' }}>Network fee</span>
          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Covered by gift</span>
        </div>
      </Card>

      <p style={{ fontSize: '13px', color: 'var(--color-secondary)', marginBottom: '24px', textAlign: 'center' }}>
        You can't undo this action after sending.
      </p>

      <Button
        variant="primary"
        onClick={handleConfirmClaim}
        isLoading={state.isClaiming}
      >
        Confirm & Claim
      </Button>
    </div>
  );
};
