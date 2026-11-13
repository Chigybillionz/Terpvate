import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  text: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (text: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((text: string, type: ToastType = 'success', duration = 3000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, text, type, duration };

    setToasts((prev) => [...prev.slice(-2), newToast]); // Keep at most 3 toasts

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="polite"
        role="status"
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none',
          maxWidth: '92vw',
          width: 'max-content',
        }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          let bg = 'rgba(15, 23, 42, 0.94)';
          let text = '#FFFFFF';
          let border = '1px solid rgba(255, 255, 255, 0.15)';
          let icon = <CheckCircle2 size={17} color="#4ADE80" />;

          if (isSuccess) {
            bg = '#0F172A';
            border = '1px solid rgba(74, 222, 128, 0.3)';
            icon = <CheckCircle2 size={17} color="#4ADE80" />;
          } else if (isWarning) {
            bg = '#78350F';
            border = '1px solid #F59E0B';
            icon = <AlertTriangle size={17} color="#FBBF24" />;
          } else if (isError) {
            bg = '#7F1D1D';
            border = '1px solid #EF4444';
            icon = <AlertCircle size={17} color="#F87171" />;
          } else {
            bg = '#1E293B';
            border = '1px solid #3B82F6';
            icon = <Info size={17} color="#60A5FA" />;
          }

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                backgroundColor: bg,
                color: text,
                border,
                borderRadius: 'var(--radius-full)',
                padding: '10px 18px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.3)',
                fontSize: '13.5px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                backdropFilter: 'blur(12px)',
                animation: 'toastSlideDown 250ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {icon}
              <span>{toast.text}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  marginLeft: '4px',
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      showToast: (text: string) => {
        console.log('[Toast fallback]:', text);
      },
    };
  }
  return context;
};
