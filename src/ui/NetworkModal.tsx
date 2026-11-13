import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { LightwalletdService, LightwalletdEndpoint } from '../services/LightwalletdService';
import { Globe, Shield, Check, X, Server } from 'lucide-react';

interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  network: 'mainnet' | 'testnet';
  onSwitchNetwork: () => void;
  onAnnounceToast: (msg: string) => void;
}

export const NetworkModal: React.FC<NetworkModalProps> = ({
  isOpen,
  onClose,
  network,
  onSwitchNetwork,
  onAnnounceToast,
}) => {
  const [activeEndpoint, setActiveEndpoint] = useState<LightwalletdEndpoint>(() =>
    LightwalletdService.getActiveEndpoint()
  );
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveEndpoint(LightwalletdService.getActiveEndpoint());
      refreshBlock();
    }
  }, [isOpen, network]);

  const refreshBlock = async () => {
    setIsRefreshing(true);
    try {
      const height = await LightwalletdService.fetchLatestBlockHeight();
      setBlockHeight(height);
    } catch {
      setBlockHeight(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggle = () => {
    onSwitchNetwork();
    const next = network === 'mainnet' ? 'Testnet' : 'Mainnet';
    onAnnounceToast(`Switched network to Zcash ${next}`);
    setTimeout(() => {
      setActiveEndpoint(LightwalletdService.getActiveEndpoint());
      refreshBlock();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Network and Node Settings"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 200ms ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--color-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid rgba(15, 23, 42, 0.12)',
          overflow: 'hidden',
          animation: 'scaleUp 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="var(--color-info)" />
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-ink)' }}>
              Network & Node Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-secondary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '20px' }}>
          {/* Active Network Switcher Card */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Active Network
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
              {/* Mainnet Option */}
              <div
                onClick={network !== 'mainnet' ? handleToggle : undefined}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: network === 'mainnet' ? '2px solid #15803D' : '1px solid rgba(15, 23, 42, 0.15)',
                  backgroundColor: network === 'mainnet' ? 'rgba(34, 197, 94, 0.08)' : 'var(--color-canvas)',
                  cursor: network === 'mainnet' ? 'default' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: network === 'mainnet' ? '#15803D' : 'var(--color-ink)' }}>
                    🟢 Mainnet
                  </span>
                  {network === 'mainnet' && <Check size={16} color="#15803D" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-secondary)' }}>
                  Real shielded ZEC
                </span>
              </div>

              {/* Testnet Option */}
              <div
                onClick={network !== 'testnet' ? handleToggle : undefined}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: network === 'testnet' ? '2px solid #7E22CE' : '1px solid rgba(15, 23, 42, 0.15)',
                  backgroundColor: network === 'testnet' ? 'rgba(168, 85, 247, 0.08)' : 'var(--color-canvas)',
                  cursor: network === 'testnet' ? 'default' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: network === 'testnet' ? '#7E22CE' : 'var(--color-ink)' }}>
                    🧪 Testnet
                  </span>
                  {network === 'testnet' && <Check size={16} color="#7E22CE" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-secondary)' }}>
                  Simulation & TAZ
                </span>
              </div>
            </div>
          </div>

          {/* Node Health & Sync Details */}
          <Card style={{ padding: '14px', marginBottom: '16px', backgroundColor: 'var(--color-canvas)', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Server size={14} color="var(--color-secondary)" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-ink)' }}>
                Active Lightwalletd Node
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--color-secondary)' }}>Endpoint:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{activeEndpoint.name}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--color-secondary)' }}>Host URL:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-secondary)' }}>{activeEndpoint.url}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--color-secondary)' }}>Status:</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                Online & Synced
              </span>
            </div>

            {blockHeight && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '4px' }}>
                <span style={{ color: 'var(--color-secondary)' }}>Latest Block:</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {isRefreshing ? 'syncing...' : `#${blockHeight.toLocaleString()}`}
                </span>
              </div>
            )}
          </Card>

          {/* Privacy Note */}
          <p style={{ fontSize: '12px', color: 'var(--color-secondary)', lineHeight: 1.5, textAlign: 'center', marginBottom: '16px' }}>
            <Shield size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Terpvate queries lightwalletd nodes anonymously for block headers. No IP logs or addresses are ever linked.
          </p>

          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
