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
      className="w-full max-w-[340px] sm:max-w-[360px] mx-auto mb-4 sm:mb-6 flex items-center justify-between relative"
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
              className={`flex flex-col items-center z-10 select-none ${
                isClickable ? 'cursor-pointer group' : 'cursor-default'
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 ${
                  isCurrent
                    ? 'bg-action text-slate-950 ring-4 ring-amber-400/25 scale-105 shadow-md shadow-amber-500/30'
                    : isDone
                    ? 'bg-white text-slate-950 group-hover:scale-105'
                    : 'bg-white/5 text-white/40 border border-white/15'
                }`}
              >
                {isDone ? <Check size={14} strokeWidth={3} /> : step.num}
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1.5 font-semibold transition-colors ${
                  isCurrent
                    ? 'text-white font-bold'
                    : isDone
                    ? 'text-slate-300 group-hover:text-white'
                    : 'text-white/40'
                } ${isClickable ? 'underline underline-offset-2 decoration-dotted' : ''}`}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-[2px] mx-1.5 sm:mx-2 -mt-4 transition-colors ${
                  currentStep > step.num ? 'bg-amber-400' : 'bg-white/15'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
