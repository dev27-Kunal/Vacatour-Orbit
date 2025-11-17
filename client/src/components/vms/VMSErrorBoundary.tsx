/**
 * Error Boundary Component for VMS Pages
 *
 * Catches errors in VMS pages and displays a user-friendly error message
 * with options to retry or navigate back to dashboard.
 */

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class VMSErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error('VMS Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const { fallbackMessage } = this.props;

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                <CardTitle className="text-2xl">Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                {fallbackMessage ||
                  'We encountered an error while loading this VMS feature. This has been logged and will be investigated.'}
              </p>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-2">
                    Error Details:
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-300 font-mono">
                    {error.message}
                  </p>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>What you can do:</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-300 mt-2 space-y-1">
                  <li>Try refreshing the page</li>
                  <li>Check your internet connection</li>
                  <li>Clear your browser cache</li>
                  <li>Contact support if the problem persists</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    Developer Info (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper for functional components
 */
export const withVMSErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallbackMessage?: string
) => {
  return (props: P) => (
    <VMSErrorBoundary fallbackMessage={fallbackMessage}>
      <Component {...props} />
    </VMSErrorBoundary>
  );
};
