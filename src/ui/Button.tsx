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
    fontSize: '15px',
    fontWeight: 700,
    borderRadius: 'var(--radius-full)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    width: fullWidth ? '100%' : 'auto',
    transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    gap: '8px',
  };

  let variantStyles: React.CSSProperties = {};
  let glassClass = '';

  if (variant === 'primary') {
    variantStyles = {
      backgroundColor: 'var(--color-action)',
      backgroundImage: 'linear-gradient(135deg, #F5BA31 0%, #E5A81E 100%)',
      color: '#0F172A',
      border: 'none',
      boxShadow: '0 4px 14px -2px rgba(244, 183, 40, 0.4)',
    };
  } else if (variant === 'secondary') {
    glassClass = 'liquid-glass';
    variantStyles = {
      color: 'var(--color-ink)',
      border: 'none',
    };
  } else if (variant === 'ghost') {
    variantStyles = {
      backgroundColor: 'transparent',
      color: 'var(--color-ink)',
      border: 'none',
    };
  } else if (variant === 'danger') {
    glassClass = 'liquid-glass';
    variantStyles = {
      color: 'var(--color-error)',
      border: 'none',
    };
  }

  return (
    <button
      disabled={disabled || isLoading}
      style={{ ...baseStyles, ...variantStyles }}
      className={`tip-btn tip-btn-${variant} ${glassClass} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin" size={20} /> : children}
    </button>
  );
};

