import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StepBar } from '../ui/StepBar';
import { SendViewModel, SendState } from '../viewmodels/SendVM';
import { GiftRecord } from '../services/StorageService';
import { ArrowLeft } from 'lucide-react';

interface PreviewScreenProps {
  viewModel: SendViewModel;
  onBackToEdit: () => void;
  onProceedToPay: (gift: GiftRecord) => void;
}

export const PreviewScreen: React.FC<PreviewScreenProps> = ({
  viewModel,
  onBackToEdit,
  onProceedToPay,
}) => {
  const [state, setState] = React.useState<SendState>({
    zecAmount: '0.05',
    fiatEstimate: {
      fiatAmount: '0',
      currency: 'NGN',
      displayString: '',
      formattedRate: '',
      isFallback: false,
    },
    message: '',
    passcode: '',
    isPasscodeEnabled: false,
    isCreating: false,
  });

  React.useEffect(() => {
    return viewModel.subscribe(setState);
  }, [viewModel]);

  const handleCreateAndPay = async () => {
    try {
      const gift = await viewModel.createGift();
      onProceedToPay(gift);
    } catch {
      // Error handled in ViewModel
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
      <StepBar currentStep={2} />

      <h1
        style={{
          fontSize: '18px',
          fontWeight: 700,
          textAlign: 'center',
          color: 'var(--color-secondary)',
          marginBottom: '20px',
        }}
      >
        This is what they will see
      </h1>

      {/* Receiver View Simulation (F3: Preview matches the real claim page) */}
      <Card variant="gold" style={{ textAlign: 'center', padding: '36px 20px', marginBottom: '24px' }}>
        <p style={{ fontSize: '15px', color: 'var(--color-secondary)', marginBottom: '8px' }}>
          You received a private gift
        </p>

        {state.message && (
          <p
            style={{
              fontSize: '18px',
              fontStyle: 'italic',
              fontWeight: 600,
              color: '#0F172A',
              marginBottom: '16px',
            }}
          >
            "{state.message}"
          </p>
        )}

        <div style={{ fontSize: '42px', fontWeight: 800, color: '#0F172A', margin: '12px 0' }}>
          {state.zecAmount} <span style={{ fontSize: '24px' }}>ZEC</span>
        </div>

        <div style={{ fontSize: '14px', color: '#92400E', fontWeight: 600 }}>
          {state.fiatEstimate.displayString}
        </div>
      </Card>

      {/* Edit Action (Reversible without losing data §7.1) */}
      <div style={{ marginBottom: '16px' }}>
        <Button variant="secondary" onClick={onBackToEdit}>
          <ArrowLeft size={16} />
          <span>Edit</span>
        </Button>
      </div>

      {/* Continue to Payment (A1: Replaced premature "Gift is ready") */}
      <div style={{ marginBottom: '32px' }}>
        <Button
          variant="primary"
          onClick={handleCreateAndPay}
          isLoading={state.isCreating}
        >
          <span>Continue to payment</span>
        </Button>
      </div>
    </div>
  );
};

