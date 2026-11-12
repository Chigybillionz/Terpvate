import { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Terpvate UI:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: '440px', margin: '40px auto', padding: '16px' }}>
          <Card style={{ textAlign: 'center', padding: '24px' }}>
            <AlertCircle size={48} style={{ color: 'var(--color-error)', margin: '0 auto 12px auto' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              Something went wrong loading the screen
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary)', marginBottom: '16px' }}>
              {this.state.error?.message || 'Unknown render error'}
            </p>
            <Button variant="primary" onClick={this.handleReset}>
              <RefreshCw size={16} />
              <span>Reload App</span>
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
