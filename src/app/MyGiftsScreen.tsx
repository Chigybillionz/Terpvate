import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { MyGiftsViewModel, MyGiftsState } from '../viewmodels/MyGiftsVM';
import { GiftRecord } from '../services/StorageService';
import { zatoshisToZec } from '../zcash/units';
import { useToast } from '../ui/Toast';
import { Copy, RotateCcw, Check, AlertTriangle } from 'lucide-react';

interface MyGiftsScreenProps {
  viewModel: MyGiftsViewModel;
  onNavigateToSend: () => void;
}

export const MyGiftsScreen: React.FC<MyGiftsScreenProps> = ({ viewModel, onNavigateToSend }) => {
  const { showToast } = useToast();
  const [state, setState] = useState<MyGiftsState>({
    gifts: [],
    filter: 'ALL',
    isLoading: true,
    isRefunding: false,
  });

  const [refundingGift, setRefundingGift] = useState<GiftRecord | null>(null);
  const [refundAddress, setRefundAddress] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = viewModel.subscribe(setState);
    viewModel.loadGifts();
    return unsub;
  }, [viewModel]);

  const handleCopy = (gift: GiftRecord) => {
    if (gift.shareableLink) {
      navigator.clipboard.writeText(gift.shareableLink);
      setCopiedId(gift.id);
      showToast('Gift link copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExecuteRefund = async () => {
    if (!refundingGift || !refundAddress.trim()) return;
    try {
      await viewModel.refundGift(refundingGift, refundAddress);
      setRefundingGift(null);
      setRefundAddress('');
    } catch {}
  };

  const filteredGifts = viewModel.getFilteredGifts();

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800 }}>My Gifts</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary)' }}>
            Stored securely on this device only.
          </p>
        </div>
        <Button variant="secondary" fullWidth={false} onClick={onNavigateToSend}>
          + New Gift
        </Button>
      </div>

      {/* Filter Tabs (Dan Brown #6 Multiple classification §6.4) */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {(['ALL', 'WAITING', 'READY', 'CLAIMED'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => viewModel.setFilter(tab)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: state.filter === tab ? '1.5px solid var(--color-ink)' : '1px solid rgba(15, 23, 42, 0.15)',
              backgroundColor: state.filter === tab ? 'var(--color-ink)' : 'var(--color-card)',
              color: state.filter === tab ? '#FFFFFF' : 'var(--color-ink)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Gifts List */}
      {filteredGifts.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '36px 16px' }}>
          <p style={{ color: 'var(--color-secondary)', fontSize: '14px', marginBottom: '16px' }}>
            No gifts found in this view.
          </p>
          <Button variant="primary" onClick={onNavigateToSend}>
            Create your first gift
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredGifts.map((gift) => {
            const zecAmount = zatoshisToZec(gift.amountZat);
            const dateStr = new Date(gift.createdAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });

            return (
              <Card key={gift.id} style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 800 }}>{zecAmount} ZEC</span>
                    <div style={{ fontSize: '12px', color: 'var(--color-secondary)', marginTop: '2px' }}>
                      Created {dateStr}
                    </div>
                  </div>
                  <StatusBadge state={gift.state} confirmations={gift.confirmations} />
                </div>

                {gift.messagePlain && (
                  <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--color-ink)', margin: '8px 0' }}>
                    "{gift.messagePlain}"
                  </p>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid rgba(15,23,42,0.06)', paddingTop: '12px' }}>
                  {gift.shareableLink && (
                    <Button
                      variant="secondary"
                      onClick={() => handleCopy(gift)}
                    >
                      {copiedId === gift.id ? <Check size={16} /> : <Copy size={16} />}
                      <span>{copiedId === gift.id ? 'Copied' : 'Copy link'}</span>
                    </Button>
                  )}

                  {/* "Take it back" allowed for unclaimed gifts (F10) */}
                  {(gift.state === 'READY' || gift.state === 'EXPIRED') && (
                    <Button
                      variant="danger"
                      fullWidth={false}
                      onClick={() => setRefundingGift(gift)}
                    >
                      <RotateCcw size={16} />
                      <span>Take back</span>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* "Take It Back" Refund Modal Dialog */}
      {refundingGift && (
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
          <Card style={{ maxWidth: '420px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-error)', marginBottom: '12px', fontWeight: 800 }}>
              <AlertTriangle size={20} />
              <span>Take This Gift Back?</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-secondary)', marginBottom: '16px' }}>
              The gift link will stop working and the funds will be swept to your Zcash wallet.
            </p>

            <label htmlFor="refund-addr" style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Your Shielded Zcash Address
            </label>
            <input
              id="refund-addr"
              type="text"
              value={refundAddress}
              onChange={(e) => setRefundAddress(e.target.value)}
              placeholder="u1... or zs1..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(15, 23, 42, 0.2)',
                marginBottom: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
              }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="ghost"
                onClick={() => setRefundingGift(null)}
                disabled={state.isRefunding}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExecuteRefund}
                isLoading={state.isRefunding}
                disabled={!refundAddress.trim()}
              >
                Confirm Refund
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
