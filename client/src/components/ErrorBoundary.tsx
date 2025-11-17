/**
 * Error Boundary Component
 *
 * Catches React errors and displays fallback UI
 *
 * @module client/components/ErrorBoundary
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service (if configured)
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service (Sentry, etc.)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Er is iets misgegaan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Er is een onverwachte fout opgetreden. Probeer de pagina te vernieuwen.
              </p>

              {this.state.error && import.meta.env.DEV && (
                <div className="mt-4">
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                      Foutdetails (alleen zichtbaar in ontwikkelmodus)
                    </summary>
                    <div className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto">
                      <p className="font-mono text-xs text-red-600">
                        {this.state.error.toString()}
                      </p>
                      {this.state.errorInfo && (
                        <pre className="mt-2 font-mono text-xs text-gray-700 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Probeer opnieuw
                </Button>
                <Button onClick={() => window.location.href = '/'}>
                  Naar homepagina
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
