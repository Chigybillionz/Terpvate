import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = true,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'var(--target-min-height)', // >= 48px per Fitts's Law §11
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    width: fullWidth ? '100%' : 'auto',
    transition: 'all var(--transition-fast)',
    textDecoration: 'none',
    gap: '8px',
  };

  let variantStyles: React.CSSProperties = {};

  if (variant === 'primary') {
    variantStyles = {
      backgroundColor: 'var(--color-action)',
      color: '#0F172A',
      border: '2px solid var(--color-outline)', // 2px ink outline guarantees 17.85:1 contrast
      boxShadow: 'var(--shadow-sm)',
    };
  } else if (variant === 'secondary') {
    variantStyles = {
      backgroundColor: 'var(--color-card)',
      color: 'var(--color-ink)',
      border: '1.5px solid var(--color-ink)',
    };
  } else if (variant === 'ghost') {
    variantStyles = {
      backgroundColor: 'transparent',
      color: 'var(--color-ink)',
      border: 'none',
    };
  } else if (variant === 'danger') {
    variantStyles = {
      backgroundColor: 'var(--color-card)',
      color: 'var(--color-error)',
      border: '1.5px solid var(--color-error)',
    };
  }

  return (
    <button
      disabled={disabled || isLoading}
      style={{ ...baseStyles, ...variantStyles }}
      className={`tip-btn tip-btn-${variant} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin" size={20} /> : children}
    </button>
  );
};

