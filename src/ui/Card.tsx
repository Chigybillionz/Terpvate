import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'flat';
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  style = {},
}) => {
  const baseStyles: React.CSSProperties = {
    backgroundColor: variant === 'gold' ? 'var(--color-card-gold-bg)' : 'var(--color-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    border: variant === 'gold' ? '2px solid var(--color-action)' : '1px solid var(--color-card-border)',
    boxShadow: variant === 'flat' ? 'none' : 'var(--shadow-card)',
    color: 'var(--color-ink)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    width: '100%',
    ...style,
  };

  return (
    <div style={baseStyles} className={`tip-card ${className}`}>
      {children}
    </div>
  );
};

