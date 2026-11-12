import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Loader2 } from 'lucide-react';

interface QrViewProps {
  value: string;
  size?: number;
  label?: string;
  className?: string;
}

export const QrView: React.FC<QrViewProps> = ({
  value,
  size = 200,
  label,
  className = '',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    if (!value) {
      setDataUrl('');
      return;
    }

    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: '#0F172A', // Using Terpvate ink color
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to generate QR code:', err);
          setError('Could not render QR code');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid rgba(15, 23, 42, 0.15)',
        width: 'fit-content',
        margin: '0 auto',
      }}
      className={`tip-qr-container ${className}`}
    >
      {error ? (
        <div style={{ color: 'var(--color-error)', fontSize: '13px', padding: '16px' }}>
          {error}
        </div>
      ) : dataUrl ? (
        <img
          src={dataUrl}
          alt={label || 'QR Code'}
          width={size}
          height={size}
          style={{ display: 'block', borderRadius: '4px' }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Loader2 className="animate-spin" size={28} style={{ color: 'var(--color-secondary)' }} />
        </div>
      )}

      {label && (
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-secondary)',
            marginTop: '8px',
            maxWidth: `${size}px`,
            textAlign: 'center',
            wordBreak: 'break-all',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

