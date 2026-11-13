import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StepBar } from '../ui/StepBar';
import { QrView } from '../ui/QrView';
import { useToast } from '../ui/Toast';
import { GiftRecord } from '../services/StorageService';
import { liveAnnouncer } from '../a11y/liveAnnouncer';
import { CheckCircle2, Copy, Share2, ShieldAlert, QrCode } from 'lucide-react';

interface ReadyScreenProps {
  gift: GiftRecord;
  onTakeItBack: (gift: GiftRecord) => void;
}

export const ReadyScreen: React.FC<ReadyScreenProps> = ({
  gift,
  onTakeItBack,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const shareableUrl = gift.shareableLink || window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      showToast('Gift link copied to clipboard! Share it in WhatsApp or Signal.');
      liveAnnouncer.announce('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'A private gift for you on Zcash',
          text: gift.messagePlain
            ? `Here is a private gift: "${gift.messagePlain}". Open the link to claim it:`
            : 'Here is a private gift. Open the link to claim it:',
          url: shareableUrl,
        });
      } catch {
        // Share cancelled or dismissed
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
      <StepBar currentStep={4} />

      {/* Success Hero State (§1.5 OPay instant checkmark lesson) */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-success-bg)',
            border: '2px solid var(--color-success)',
            color: 'var(--color-success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}
        >
          <CheckCircle2 size={36} />
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800 }}>Your private gift is ready</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-secondary)', marginTop: '4px' }}>
          Only the person with this link can claim it.
        </p>
      </div>

      {/* Link Display Box (§10.4 Chunking & §13.2 RFC 3986) */}
      <Card style={{ marginBottom: '20px', padding: '16px' }}>
        <div
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-canvas)',
            border: '1px solid rgba(15, 23, 42, 0.15)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            wordBreak: 'break-all',
            color: 'var(--color-ink)',
            marginBottom: '12px',
          }}
        >
          {shareableUrl}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={handleCopy}>
            <Copy size={16} />
            <span>{copied ? 'Copied! ✓' : 'Copy Link'}</span>
          </Button>

          <Button
            variant="secondary"
            fullWidth={false}
            onClick={() => setShowQr(!showQr)}
            aria-label="Toggle QR code"
          >
            <QrCode size={18} />
          </Button>

          <Button variant="primary" onClick={handleShare}>
            <Share2 size={16} />
            <span>Share</span>
          </Button>
        </div>

        {showQr && (
          <div style={{ marginTop: '16px', textAlign: 'center', borderTop: '1px solid rgba(15,23,42,0.06)', paddingTop: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary)', marginBottom: '8px' }}>
              Scan with phone camera or QR scanner
            </p>
            <QrView value={shareableUrl} size={180} />
          </div>
        )}
      </Card>

      {/* Safe Sharing Caution Alert (§14.2 Link intercepted mitigation) */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#FFFBEB',
          border: '1px solid #FCD34D',
          marginBottom: '28px',
        }}
      >
        <ShieldAlert size={20} style={{ color: '#B45309', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.4 }}>
          <strong>Keep this link between you two:</strong> Anyone who opens this link can sweep the funds. Share it in a private chat.
        </p>
      </div>

      {/* Destructive Action: "Take it back" (Deliberately separated per Fitts's Law §11) */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <button
          type="button"
          onClick={() => onTakeItBack(gift)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-secondary)',
            fontSize: '13px',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '8px 16px',
          }}
        >
          Made a mistake? Take it back
        </button>
      </div>
    </div>
  );
};
