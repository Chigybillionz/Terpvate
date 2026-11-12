import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StepBar } from '../ui/StepBar';
import { QrView } from '../ui/QrView';
import { PayViewModel, PayState } from '../viewmodels/PayVM';
import { GiftRecord } from '../services/StorageService';
import { zatoshisToZec } from '../zcash/units';
import { liveAnnouncer } from '../a11y/liveAnnouncer';
import {
  ExternalLink,
  QrCode,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  HelpCircle,
  PlayCircle,
  X,
  Download,
} from 'lucide-react';

interface PayScreenProps {
  gift: GiftRecord;
  onPaymentConfirmed: (gift: GiftRecord) => void;
}

export const PayScreen: React.FC<PayScreenProps> = ({ gift, onPaymentConfirmed }) => {
  const [viewModel] = useState(() => new PayViewModel(gift));
  const [state, setState] = useState<PayState>(() => ({
    gift,
    fundingUri: '',
    confirmations: gift.confirmations || 0,
    requiredConfirmations: 3,
    isConfirmed: gift.state === 'READY',
    isWatching: false,
    timeRemainingSeconds: 240,
  }));

  const [showQr, setShowQr] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [walletAttemptFailed, setWalletAttemptFailed] = useState(false);

  useEffect(() => {
    const unsub = viewModel.subscribe(setState);
    viewModel.startWatching(() => {
      onPaymentConfirmed(gift);
    });
    return unsub;
  }, [viewModel, gift, onPaymentConfirmed]);

  const giftZec = zatoshisToZec(gift.amountZat);
  const feeZec = zatoshisToZec(gift.claimFeeZat);
  const totalZec = zatoshisToZec(gift.amountZat + gift.claimFeeZat);

  const handleOpenWallet = () => {
    setWalletAttemptFailed(false);

    // Attempt to invoke system handler for zcash: URI
    window.location.href = state.fundingUri;

    // Fallback: If after 1.5 seconds the tab is still focused, the OS likely had no app for zcash:
    setTimeout(() => {
      if (document.hasFocus()) {
        setWalletAttemptFailed(true);
      }
    }, 1500);
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(gift.depositAddress);
      setCopiedAddress(true);
      liveAnnouncer.announce('Deposit address copied to clipboard');
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {}
  };

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
      <StepBar currentStep={3} />

      <h1
        style={{
          fontSize: '20px',
          fontWeight: 800,
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        Fund your gift
      </h1>

      {/* Breakdown Card (§5.1 F4, §10.4) */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
          <span style={{ color: 'var(--color-secondary)' }}>Gift amount</span>
          <span style={{ fontWeight: 600 }}>{giftZec} ZEC</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
          <span style={{ color: 'var(--color-secondary)' }}>Network fee (ZIP 317)</span>
          <span style={{ fontWeight: 600 }}>{feeZec} ZEC</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px 0', fontSize: '18px', fontWeight: 800 }}>
          <span>Total to send</span>
          <span style={{ color: '#0F172A' }}>{totalZec} ZEC</span>
        </div>
      </Card>

      {/* Reassurance & Live Status Card (§7.4 Evaluation Gulf) */}
      <Card
        style={{
          textAlign: 'center',
          padding: '20px',
          marginBottom: '24px',
          backgroundColor: '#F8FAFC',
          border: '1.5px dashed rgba(15, 23, 42, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <Clock size={18} className="animate-pulse" style={{ color: '#92400E' }} />
          <span style={{ fontWeight: 700, fontSize: '15px' }}>
            {state.confirmations === 0
              ? 'Waiting for your payment…'
              : `Payment seen · ${state.confirmations} of 3 confirmations`}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.1)',
            borderRadius: '999px',
            overflow: 'hidden',
            margin: '12px 0',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: 'var(--color-action)',
              width: `${(state.confirmations / 3) * 100}%`,
              transition: 'width 300ms ease',
            }}
          />
        </div>

        <p style={{ fontSize: '13px', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <ShieldCheck size={14} />
          Your money is safe. Nothing has been lost.
        </p>
      </Card>

      {/* Payment Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {/* Primary Wallet Action */}
        <Button variant="primary" onClick={handleOpenWallet}>
          <ExternalLink size={18} />
          <span>Open my Zcash wallet</span>
        </Button>

        {/* Fallback Warning if zcash: handler was not found */}
        {walletAttemptFailed && (
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              fontSize: '13px',
              color: '#92400E',
              lineHeight: 1.4,
            }}
          >
            <strong>No wallet opened?</strong> Your browser may not have a Zcash app installed yet.
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowWalletModal(true)}
                style={{
                  background: '#92400E',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Get a Zcash Wallet
              </button>
              <button
                type="button"
                onClick={handleCopyAddress}
                style={{
                  background: 'transparent',
                  color: '#92400E',
                  border: '1px solid #92400E',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {copiedAddress ? 'Address Copied! ✓' : 'Copy Address'}
              </button>
            </div>
          </div>
        )}

        {/* Show QR Toggle */}
        <Button
          variant="secondary"
          onClick={() => setShowQr(!showQr)}
        >
          <QrCode size={18} />
          <span>{showQr ? 'Hide QR code' : 'Show QR code'}</span>
        </Button>

        {showQr && (
          <Card style={{ alignItems: 'center', textAlign: 'center', marginTop: '6px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary)', marginBottom: '12px' }}>
              Scan with Zashi, Zingo, or YWallet
            </p>
            <QrView
              value={state.fundingUri}
              size={190}
              label={`${totalZec} ZEC to ${gift.depositAddress.slice(0, 16)}...`}
            />

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <Button variant="secondary" fullWidth={false} onClick={handleCopyAddress}>
                {copiedAddress ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedAddress ? 'Copied' : 'Copy address'}</span>
              </Button>
            </div>
          </Card>
        )}

        {/* Guided "Don't have a wallet?" Button */}
        <div style={{ textAlign: 'center', marginTop: '4px' }}>
          <button
            type="button"
            onClick={() => setShowWalletModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-info)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <HelpCircle size={15} />
            <span>Don't have a Zcash wallet yet? Get one here</span>
          </button>
        </div>
      </div>

      {/* Dev / Testing Quick Simulator (§16.2 Usability testing) */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(15, 23, 42, 0.04)',
          border: '1px dashed rgba(15, 23, 42, 0.15)',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Testing / Prototype Mode
        </span>
        <p style={{ fontSize: '12px', color: 'var(--color-secondary)', margin: '4px 0 10px 0' }}>
          Want to test the full gift lifecycle without real ZEC?
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            // Trigger confirmation directly
            onPaymentConfirmed(gift);
          }}
        >
          <PlayCircle size={16} />
          <span>Simulate Payment & Jump to Ready (Test)</span>
        </Button>
      </div>

      {/* "Get a Wallet" Modal Dialog */}
      {showWalletModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 100,
          }}
        >
          <Card style={{ maxWidth: '420px', width: '100%', padding: '24px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowWalletModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-secondary)',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
              Get a Zcash Shielded Wallet
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary)', marginBottom: '16px' }}>
              Choose any of these free shielded wallets to hold and spend ZEC:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <a
                href="https://zashi.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div style={walletOptionStyle}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#0F172A' }}>1. Zashi (Recommended)</strong>
                    <div style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>Official easy mobile wallet by Electric Coin Co.</div>
                  </div>
                  <Download size={16} style={{ color: 'var(--color-info)' }} />
                </div>
              </a>

              <a
                href="https://zingo.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div style={walletOptionStyle}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#0F172A' }}>2. Zingo!</strong>
                    <div style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>Lightweight shielded wallet for Android and PC.</div>
                  </div>
                  <Download size={16} style={{ color: 'var(--color-info)' }} />
                </div>
              </a>

              <a
                href="https://ywallet.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div style={walletOptionStyle}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#0F172A' }}>3. YWallet</strong>
                    <div style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>Fast multi-platform wallet (iOS, Android, Windows, Mac).</div>
                  </div>
                  <Download size={16} style={{ color: 'var(--color-info)' }} />
                </div>
              </a>
            </div>

            <Button variant="primary" onClick={() => setShowWalletModal(false)}>
              I Have My Wallet Ready
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

const walletOptionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid rgba(15, 23, 42, 0.12)',
  backgroundColor: '#FFFFFF',
  cursor: 'pointer',
};
