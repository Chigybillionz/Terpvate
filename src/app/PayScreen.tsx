import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StepBar } from '../ui/StepBar';
import { QrView } from '../ui/QrView';
import { PayViewModel, PayState } from '../viewmodels/PayVM';
import { GiftRecord } from '../services/StorageService';
import { LightwalletdService } from '../services/LightwalletdService';
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
  AlertTriangle,
  Globe,
} from 'lucide-react';

interface PayScreenProps {
  gift: GiftRecord;
  onPaymentConfirmed: (gift: GiftRecord) => void;
}

export const PayScreen: React.FC<PayScreenProps> = ({ gift, onPaymentConfirmed }) => {
  const [viewModel] = useState(() => new PayViewModel(gift));
  const [state, setState] = useState<PayState>(() => {
    const requiredZat = gift.amountZat + gift.claimFeeZat;
    const receivedZat = gift.receivedZat || 0;
    const isUnderfunded = gift.state === 'UNDERFUNDED';
    const remainingZat = Math.max(0, requiredZat - receivedZat);

    return {
      gift,
      fundingUri: '',
      confirmations: gift.confirmations || 0,
      requiredConfirmations: 3,
      isConfirmed: gift.state === 'READY',
      isWatching: false,
      timeRemainingSeconds: 240,
      isUnderfunded,
      receivedZat,
      remainingZat,
    };
  });

  const [showQr, setShowQr] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [walletAttemptFailed, setWalletAttemptFailed] = useState(false);
  const activeEndpoint = LightwalletdService.getActiveEndpoint();

  useEffect(() => {
    const unsub = viewModel.subscribe(setState);
    viewModel.startWatching(() => {
      onPaymentConfirmed(gift);
    });
    return unsub;
  }, [viewModel, gift, onPaymentConfirmed]);

  const giftZec = zatoshisToZec(gift.amountZat);
  const feeZec = zatoshisToZec(gift.claimFeeZat);
  const totalZat = gift.amountZat + gift.claimFeeZat;
  const totalZec = zatoshisToZec(totalZat);
  const remainingZec = zatoshisToZec(state.remainingZat);
  const receivedZec = zatoshisToZec(state.receivedZat);

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

      {/* Lightwalletd Network Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '11px',
          color: 'var(--color-secondary)',
          marginBottom: '14px',
          fontWeight: 600,
        }}
      >
        <Globe size={13} color="var(--color-success)" />
        <span>Live sync: {activeEndpoint.name}</span>
      </div>

      <h1
        style={{
          fontSize: '20px',
          fontWeight: 800,
          textAlign: 'center',
          marginBottom: '16px',
        }}
      >
        {state.isUnderfunded ? 'Additional Payment Needed' : 'Fund your gift'}
      </h1>

      {/* Underfunded / Partial Payment Alert Banner (PRD §8.3) */}
      {state.isUnderfunded && (
        <div
          role="alert"
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FEF3C7',
            border: '1.5px solid #F59E0B',
            marginBottom: '20px',
            color: '#92400E',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px', marginBottom: '6px' }}>
            <AlertTriangle size={20} color="#D97706" />
            <span>Partial Payment Received</span>
          </div>
          <p style={{ fontSize: '14px', margin: '4px 0 10px 0', lineHeight: 1.5 }}>
            We received <strong>{receivedZec} ZEC</strong> but needed <strong>{totalZec} ZEC</strong>. Send the remaining <strong>{remainingZec} ZEC</strong> to this address.
          </p>
          <div style={{ fontSize: '12px', color: '#78350F' }}>
            The wallet button and QR code below have been updated to request the remaining <strong>{remainingZec} ZEC</strong>.
          </div>
        </div>
      )}

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

        {state.isUnderfunded ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(15,23,42,0.06)', color: 'var(--color-secondary)' }}>
              <span>Received so far</span>
              <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{receivedZec} ZEC</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px 0', fontSize: '18px', fontWeight: 800, color: '#B45309' }}>
              <span>Remaining to send</span>
              <span>{remainingZec} ZEC</span>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px 0', fontSize: '18px', fontWeight: 800 }}>
            <span>Total to send</span>
            <span style={{ color: '#0F172A' }}>{totalZec} ZEC</span>
          </div>
        )}
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
            {state.isUnderfunded
              ? `Partial payment seen · Awaiting remaining ${remainingZec} ZEC`
              : state.confirmations === 0
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
              backgroundColor: state.isUnderfunded ? '#F59E0B' : 'var(--color-action)',
              width: state.isUnderfunded
                ? `${Math.min(95, Math.max(15, (state.receivedZat / totalZat) * 100))}%`
                : `${(state.confirmations / 3) * 100}%`,
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
          <span>
            {state.isUnderfunded
              ? `Open wallet to send remaining ${remainingZec} ZEC`
              : 'Open my Zcash wallet'}
          </span>
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
                  background: 'none',
                  border: 'none',
                  color: '#92400E',
                  textDecoration: 'underline',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Choose a wallet
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleCopyAddress}
                style={{
                  background: 'none',
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
              label={`${state.isUnderfunded ? remainingZec : totalZec} ZEC to ${gift.depositAddress.slice(0, 16)}...`}
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
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(15, 23, 42, 0.04)',
          border: '1px dashed rgba(15, 23, 42, 0.15)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Testing / Prototype Mode
        </span>
        <p style={{ fontSize: '12px', color: 'var(--color-secondary)', margin: '0 0 6px 0' }}>
          Test the payment lifecycle and edge cases without real ZEC:
        </p>

        <Button
          variant="primary"
          onClick={() => {
            viewModel.simulateFullPayment(() => onPaymentConfirmed(gift));
          }}
        >
          <PlayCircle size={16} />
          <span>Simulate Testnet Payment (Mines 1 ZEC to Ready)</span>
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            viewModel.simulateUnderpayment();
          }}
        >
          <AlertTriangle size={16} />
          <span>Simulate Underpayment (e.g. received 0.9 ZEC of 1.0001 ZEC)</span>
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
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid rgba(15, 23, 42, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'var(--color-ink)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>Zashi (Recommended)</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>
                      By Electric Coin Co. Simple, fast, official shielded wallet.
                    </div>
                  </div>
                  <ExternalLink size={16} />
                </div>
              </a>

              <a
                href="https://zingo.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid rgba(15, 23, 42, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'var(--color-ink)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>Zingo!</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>
                      Mobile wallet for Android and iOS. Lightweight and fast.
                    </div>
                  </div>
                  <ExternalLink size={16} />
                </div>
              </a>

              <a
                href="https://ywallet.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid rgba(15, 23, 42, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'var(--color-ink)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>YWallet</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>
                      Advanced high-speed wallet for mobile and desktop.
                    </div>
                  </div>
                  <ExternalLink size={16} />
                </div>
              </a>
            </div>

            <Button variant="primary" onClick={() => setShowWalletModal(false)}>
              Got it, thanks!
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
