import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';
import type { GiftState } from '../services/StorageService';

interface StatusBadgeProps {
  state: GiftState;
  confirmations?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ state, confirmations = 0 }) => {
  let label = state as string;
  let icon = <Clock size={14} />;
  let bg = '#F1F5F9';
  let text = 'var(--color-ink)';
  let border = 'rgba(15, 23, 42, 0.15)';

  switch (state) {
    case 'CONFIRMING':
      label = `Securing (${confirmations}/3)`;
      icon = <Clock size={14} />;
      bg = 'var(--color-warning-bg)';
      text = 'var(--color-warning)';
      border = 'rgba(146, 64, 14, 0.3)';
      break;

    case 'READY':
      label = 'Ready to Claim';
      icon = <CheckCircle2 size={14} />;
      bg = 'var(--color-success-bg)';
      text = 'var(--color-success)';
      border = 'rgba(21, 128, 61, 0.3)';
      break;

    case 'CLAIMED':
      label = 'Claimed';
      icon = <CheckCircle2 size={14} />;
      bg = 'var(--color-success-bg)';
      text = 'var(--color-success)';
      border = 'rgba(21, 128, 61, 0.3)';
      break;

    case 'TAKEN_BACK':
      label = 'Refunded to You';
      icon = <CheckCircle2 size={14} />;
      bg = '#F1F5F9';
      text = 'var(--color-secondary)';
      border = 'rgba(15, 23, 42, 0.2)';
      break;

    case 'UNDERFUNDED':
      label = 'Underfunded';
      icon = <AlertTriangle size={14} />;
      bg = 'var(--color-error-bg)';
      text = 'var(--color-error)';
      border = 'rgba(185, 28, 28, 0.3)';
      break;

    case 'AWAITING_PAYMENT':
      label = 'Waiting for Payment';
      icon = <Clock size={14} />;
      bg = '#F1F5F9';
      text = 'var(--color-secondary)';
      border = 'rgba(15, 23, 42, 0.2)';
      break;

    case 'EXPIRED':
      label = 'Expired (Unclaimed)';
      icon = <XCircle size={14} />;
      bg = '#F1F5F9';
      text = 'var(--color-secondary)';
      border = 'rgba(15, 23, 42, 0.2)';
      break;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
      }}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};

