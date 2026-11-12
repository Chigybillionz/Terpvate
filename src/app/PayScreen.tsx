import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StepBar } from '../ui/StepBar';
import { PayViewModel, PayState } from '../viewmodels/PayVM';
import { GiftRecord } from '../services/StorageService';
import { zatoshisToZec } from '../zcash/units';
import { ExternalLink, QrCode, Clock, ShieldCheck } from 'lucide-react';

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

      {/* Reassurance & Live Status Card (§7.4 Evaluation Gulf & POS error lesson) */}
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

      {/* Payment Options (§13.1 ZIP 321) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        <a
          href={state.fundingUri}
          style={{ textDecoration: 'none' }}
        >
          <Button variant="primary">
            <ExternalLink size={18} />
            <span>Open my Zcash wallet</span>
          </Button>
        </a>

        <Button
          variant="secondary"
          onClick={() => setShowQr(!showQr)}
        >
          <QrCode size={18} />
          <span>{showQr ? 'Hide QR code' : 'Show QR code'}</span>
        </Button>

        {showQr && (
          <Card style={{ alignItems: 'center', textAlign: 'center', marginTop: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary)', marginBottom: '12px' }}>
              Scan with Zashi, Zingo, or YWallet
            </p>
            <div
              style={{
                width: '180px',
                height: '180px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #0F172A',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                fontWeight: 600,
                fontSize: '11px',
                wordBreak: 'break-all',
              }}
            >
              [ZIP-321 QR]
              <br />
              {state.gift.depositAddress.slice(0, 16)}...
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

