import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Shield, Lock, ArrowLeft } from 'lucide-react';

interface SupportProps {
  onBack: () => void;
}

export const HowItWorksScreen: React.FC<SupportProps> = ({ onBack }) => (
  <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
    <button type="button" onClick={onBack} style={backBtnStyle}>
      <ArrowLeft size={16} /> Back
    </button>
    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>How Tip Works</h1>
    <Card style={{ marginBottom: '16px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>1. The Sealed Envelope</h3>
      <p style={{ fontSize: '14px', color: 'var(--color-secondary)', lineHeight: 1.5 }}>
        When you create a gift, Tip generates a brand-new shielded Zcash key inside your browser. The key is kept exclusively in the URL link fragment (after the <code>#</code>). Web browsers never send fragments to web servers.
      </p>
    </Card>
    <Card style={{ marginBottom: '16px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>2. On-Chain Funding</h3>
      <p style={{ fontSize: '14px', color: 'var(--color-secondary)', lineHeight: 1.5 }}>
        You send ZEC from your wallet directly to the gift envelope on-chain. Tip monitors the shielded blockchain for 3 confirmations (~4 minutes) so the recipient gets guaranteed, un-reversable funds.
      </p>
    </Card>
    <Card style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>3. One-Tap Claim</h3>
      <p style={{ fontSize: '14px', color: 'var(--color-secondary)', lineHeight: 1.5 }}>
        The receiver opens your link in any browser, provides their shielded address, and sweeps the funds in a single tap. No accounts, no seed phrase backups, and no transaction data shared with us.
      </p>
    </Card>
    <Button variant="primary" onClick={onBack}>Got it</Button>
  </div>
);

export const PrivacyScreen: React.FC<SupportProps> = ({ onBack }) => (
  <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
    <button type="button" onClick={onBack} style={backBtnStyle}>
      <ArrowLeft size={16} /> Back
    </button>
    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>What is and isn't private</h1>
    <Card style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', marginBottom: '8px', fontWeight: 700 }}>
        <Shield size={18} />
        <span>What is Private</span>
      </div>
      <ul style={{ fontSize: '14px', color: 'var(--color-secondary)', paddingLeft: '20px', lineHeight: 1.6 }}>
        <li>Amounts, sender, and receiver are completely encrypted on-chain.</li>
        <li>The gift key and private message never touch Tip servers.</li>
        <li>No user accounts, no identity verification (KYC), no telemetry analytics, and no cookies.</li>
      </ul>
    </Card>
    <Card style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', marginBottom: '8px', fontWeight: 700 }}>
        <Lock size={18} />
        <span>Honest Limits (Not Private)</span>
      </div>
      <ul style={{ fontSize: '14px', color: 'var(--color-secondary)', paddingLeft: '20px', lineHeight: 1.6 }}>
        <li>Anyone who gets the link can claim it, unless you set a passcode.</li>
        <li>The light-wallet server sees your IP address (use a VPN/Tor if you need IP privacy).</li>
        <li>Transparent (<code>t1...</code>) addresses are blocked because they reveal amounts to the public ledger.</li>
      </ul>
    </Card>
    <Button variant="primary" onClick={onBack}>Understood</Button>
  </div>
);

export const WalletsGuideScreen: React.FC<SupportProps> = ({ onBack }) => (
  <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
    <button type="button" onClick={onBack} style={backBtnStyle}>
      <ArrowLeft size={16} /> Back
    </button>
    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>Get a Shielded Wallet</h1>
    <p style={{ fontSize: '14px', color: 'var(--color-secondary)', marginBottom: '20px' }}>
      To keep your gift completely private, you need a wallet that supports Zcash shielded addresses (starting with <code>u1</code> or <code>zs1</code>).
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
      <Card style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>1. Zashi (Recommended)</h3>
        <p style={{ fontSize: '13px', color: 'var(--color-secondary)', margin: '4px 0 10px 0' }}>
          Official, friendly mobile wallet built by Electric Coin Co. Available on iOS & Android.
        </p>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-info)' }}>Search "Zashi Zcash" on App Store or Google Play</span>
      </Card>

      <Card style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>2. Zingo!</h3>
        <p style={{ fontSize: '13px', color: 'var(--color-secondary)', margin: '4px 0 10px 0' }}>
          Fast, open-source shielded light client for Android and desktop.
        </p>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-info)' }}>Available on Google Play</span>
      </Card>

      <Card style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>3. YWallet</h3>
        <p style={{ fontSize: '13px', color: 'var(--color-secondary)', margin: '4px 0 10px 0' }}>
          High-performance shielded wallet for power users, handles large note syncs seamlessly.
        </p>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-info)' }}>Available on Android, iOS, Desktop</span>
      </Card>
    </div>

    <Button variant="primary" onClick={onBack}>I have my address ready</Button>
  </div>
);

export const HelpFaqScreen: React.FC<SupportProps> = ({ onBack }) => (
  <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
    <button type="button" onClick={onBack} style={backBtnStyle}>
      <ArrowLeft size={16} /> Back
    </button>
    <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>Help & FAQ</h1>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
      <Card style={{ padding: '16px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>How long does a gift take to be ready?</h4>
        <p style={{ fontSize: '13px', color: 'var(--color-secondary)', lineHeight: 1.5 }}>
          Zcash blocks are mined roughly every 75 seconds. Tip waits for 3 confirmations (~4 minutes) before confirming the gift is ready, ensuring funds cannot be reversed.
        </p>
      </Card>

      <Card style={{ padding: '16px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>What if I close my browser tab while waiting?</h4>
        <p style={{ fontSize: '13px', color: 'var(--color-secondary)', lineHeight: 1.5 }}>
          Your gift is automatically saved on this device. Just tap "My gifts" in the top navigation to see your progress or retrieve your link.
        </p>
      </Card>

      <Card style={{ padding: '16px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Can I take the money back if I sent it to the wrong chat?</h4>
        <p style={{ fontSize: '13px', color: 'var(--color-secondary)', lineHeight: 1.5 }}>
          Yes! As long as the recipient has not claimed it yet, open "My gifts", tap "Take back", and sweep the ZEC to your address.
        </p>
      </Card>
    </div>

    <Button variant="primary" onClick={onBack}>Back</Button>
  </div>
);

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-secondary)',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer',
  marginBottom: '16px',
};
