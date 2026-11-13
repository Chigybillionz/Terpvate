import React from 'react';
import { Check } from 'lucide-react';

interface StepBarProps {
  currentStep: number; // 1 to 4
  totalSteps?: number;
  onStepClick?: (stepNum: number) => void;
}

const STEPS = [
  { num: 1, label: 'Amount' },
  { num: 2, label: 'Preview' },
  { num: 3, label: 'Pay' },
  { num: 4, label: 'Share' },
];

export const StepBar: React.FC<StepBarProps> = ({ currentStep, totalSteps = 4, onStepClick }) => {
  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep} of ${totalSteps}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '360px',
        margin: '0 auto 24px auto',
        position: 'relative',
      }}
    >
      {STEPS.map((step, idx) => {
        const isDone = currentStep > step.num;
        const isCurrent = currentStep === step.num;
        const isClickable = isDone && Boolean(onStepClick);

        return (
          <React.Fragment key={step.num}>
            <div
              onClick={() => {
                if (isClickable && onStepClick) {
                  onStepClick(step.num);
                }
              }}
              title={isClickable ? `Jump back to Step ${step.num} (${step.label})` : undefined}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
                cursor: isClickable ? 'pointer' : 'default',
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  backgroundColor: isDone
                    ? 'var(--color-ink)'
                    : isCurrent
                    ? 'var(--color-action)'
                    : 'var(--color-card)',
                  color: isDone ? '#FFFFFF' : '#0F172A',
                  border: isCurrent
                    ? '2px solid var(--color-outline)'
                    : isDone
                    ? '2px solid var(--color-ink)'
                    : '1px solid rgba(15, 23, 42, 0.2)',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(244, 183, 40, 0.25)' : 'none',
                  transition: 'all 200ms ease',
                  transform: isCurrent ? 'scale(1.05)' : 'none',
                }}
              >
                {isDone ? <Check size={16} strokeWidth={3} /> : step.num}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  marginTop: '4px',
                  fontWeight: isCurrent ? 800 : isDone ? 600 : 500,
                  color: isCurrent ? 'var(--color-ink)' : 'var(--color-secondary)',
                  textDecoration: isClickable ? 'underline dotted' : 'none',
                }}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: currentStep > step.num ? 'var(--color-ink)' : 'rgba(15, 23, 42, 0.15)',
                  margin: '0 4px',
                  marginBottom: '16px',
                  zIndex: 1,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

