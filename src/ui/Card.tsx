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
  const glassVariant = variant === 'gold' ? 'liquid-glass-gold' : 'liquid-glass';

  const baseStyles: React.CSSProperties = {
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    color: 'var(--color-ink)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    width: '100%',
    ...style,
  };

  return (
    <div style={baseStyles} className={`tip-card ${glassVariant} ${className}`}>
      {children}
    </div>
  );
};

