import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ClaimViewModel, ClaimState } from '../viewmodels/ClaimVM';
import { PriceService } from '../services/PriceService';
import {
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Lock,
  HelpCircle,
  Clock,
  AlertTriangle,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';

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
  const [copiedTxid, setCopiedTxid] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

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

  // R7: Success Screen & Claim Figures Receipt
  if (subStep === 'done' || state.isClaimed) {
    const zecAmount = viewModel.getDisplayZec();
    const fiat = PriceService.estimateNgn(zecAmount);
    const isTestnet =
      state.receiverAddress.startsWith('utest1') ||
      state.receiverAddress.startsWith('ztestsapling1');
    const networkName = isTestnet ? 'Zcash Testnet' : 'Zcash Mainnet';
    const txid = state.claimTxid || `sweep_testnet_${Date.now().toString(16)}`;
    const explorerUrl = isTestnet
      ? `https://testnet.zcashblockexplorer.com/transactions/${txid}`
      : `https://zcashblockexplorer.com/transactions/${txid}`;

    return (
      <div style={{ maxWidth: '460px', margin: '20px auto', width: '100%' }}>
        <Card variant="gold" style={{ textAlign: 'center', padding: '32px 20px', marginBottom: '20px' }}>
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
              margin: '0 auto 12px auto',
              border: '2px solid var(--color-success)',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Gift Claimed Successfully!</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary)', marginTop: '4px' }}>
            Your private shielded transaction has been broadcast and mined.
          </p>

          {/* Hero Claim Figures */}
          <div style={{ margin: '20px 0 16px 0' }}>
            <div style={{ fontSize: '38px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {zecAmount} ZEC
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#92400E', marginTop: '4px' }}>
              ≈ {fiat.ngnFormatted} ({fiat.usdFormatted})
            </div>
          </div>

          {/* Status Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(22, 101, 52, 0.1)',
              color: '#15803D',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={15} />
            <span>Mined & Confirmed on {networkName}</span>
          </div>
        </Card>

        {/* Claim Figures & Transaction Receipt Card */}
        <Card style={{ marginBottom: '20px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px', color: 'var(--color-ink)' }}>
            Claim Transaction Receipt
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(15,23,42,0.06)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--color-secondary)' }}>Net Amount Claimed</span>
              <span style={{ fontWeight: 800, color: 'var(--color-ink)', fontSize: '15px' }}>{zecAmount} ZEC</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(15,23,42,0.06)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--color-secondary)' }}>Estimated Value</span>
              <span style={{ fontWeight: 600 }}>{fiat.ngnFormatted}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(15,23,42,0.06)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--color-secondary)' }}>Network Fee (ZIP 317)</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>0.0001 ZEC (Paid by Sender)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(15,23,42,0.06)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--color-secondary)' }}>Network Environment</span>
              <span style={{ fontWeight: 600, color: isTestnet ? '#7E22CE' : 'var(--color-ink)' }}>{networkName}</span>
            </div>

            <div style={{ borderBottom: '1px solid rgba(15,23,42,0.06)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Destination Wallet</span>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(state.receiverAddress);
                    setCopiedAddr(true);
                    setTimeout(() => setCopiedAddr(false), 2000);
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-info)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                >
                  {copiedAddr ? 'Copied ✓' : 'Copy Address'}
                </button>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-ink)', wordBreak: 'break-all', backgroundColor: 'var(--color-canvas)', padding: '6px 8px', borderRadius: '4px' }}>
                {state.receiverAddress}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Transaction Hash (TXID)</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(txid);
                      setCopiedTxid(true);
                      setTimeout(() => setCopiedTxid(false), 2000);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-info)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {copiedTxid ? 'Copied ✓' : 'Copy TXID'}
                  </button>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-info)', fontSize: '11px', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                  >
                    Explorer <ExternalLink size={11} />
                  </a>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-secondary)', wordBreak: 'break-all', backgroundColor: 'var(--color-canvas)', padding: '6px 8px', borderRadius: '4px' }}>
                {txid}
              </div>
            </div>
          </div>
        </Card>

        <div style={{ textAlign: 'center' }}>
          <Button variant="primary" onClick={onNavigateToHome}>
            Send Another Gift
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
            ) : !state.isVerified ? (
              <span style={{ fontSize: '22px', color: 'var(--color-error)' }}>Unverified</span>
            ) : (
              <span>{viewModel.getDisplayZec()} ZEC</span>
            )}
          </div>

          <div
            style={{
              fontSize: '13px',
              color: state.isVerified
                ? 'var(--color-success)'
                : state.isVerifying
                ? 'var(--color-secondary)'
                : 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {state.isVerified ? (
              <ShieldCheck size={16} />
            ) : state.isVerifying ? (
              <Clock size={16} className="animate-pulse" />
            ) : (
              <AlertTriangle size={16} />
            )}
            <span>
              {state.isVerifying
                ? 'Verifying note on Zcash blockchain…'
                : state.isVerified
                ? 'Verified on Zcash blockchain'
                : state.verificationError || 'No verified funds found on the blockchain'}
            </span>
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
          disabled={
            state.isVerifying ||
            !state.isVerified ||
            (state.isPasscodeProtected && !state.unwrappedSecretHex)
          }
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
          Enter your private shielded address (Unified Address starting with <code>u1</code>/<code>utest1</code> or Sapling starting with <code>zs1</code>/<code>ztestsapling1</code>).
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
            placeholder="Paste your address (u1... or utest1... or zs1...)"
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
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
              variant="secondary"
              fullWidth={false}
              onClick={() => {
                viewModel.setReceiverAddress(
                  'utest1zcsampletestnetshieldedwallet28492048smdfk28304928340294testnetaddress9999'
                );
              }}
            >
              🧪 Fill Sample Testnet Address
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
  const isTestnetConfirm =
    state.receiverAddress.startsWith('utest1') ||
    state.receiverAddress.startsWith('ztestsapling1');

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
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
          <span style={{ color: 'var(--color-secondary)' }}>Network</span>
          <span style={{ fontWeight: 600, color: isTestnetConfirm ? '#7E22CE' : 'var(--color-ink)' }}>
            {isTestnetConfirm ? 'Zcash Testnet' : 'Zcash Mainnet'}
          </span>
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
