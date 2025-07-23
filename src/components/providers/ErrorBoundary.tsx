'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangleIcon,
  RefreshCwIcon,
  HomeIcon,
  BugIcon,
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// =============================================================================
// ERROR BOUNDARY INTERFACES
// =============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isExpanded: boolean;
}

// =============================================================================
// ERROR BOUNDARY COMPONENT
// =============================================================================

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isExpanded: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isExpanded: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Report error to monitoring service (e.g., Sentry)
    if (typeof window !== 'undefined') {
      // In a real app, you'd send this to your error tracking service
      console.group('🚨 Error Boundary Report');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error Boundary:', errorInfo);
      console.groupEnd();
    }
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isExpanded: false,
    });
  };

  private copyErrorDetails = (): void => {
    const errorDetails = {
      error: this.state.error?.toString(),
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    navigator.clipboard
      .writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        toast.success('Error details copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy error details');
      });
  };

  private toggleExpanded = (): void => {
    this.setState(prev => ({ isExpanded: !prev.isExpanded }));
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10"
            >
              <AlertTriangleIcon className="h-8 w-8 text-red-500" />
            </motion.div>

            {/* Error Message */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-2 text-xl font-bold text-foreground"
            >
              Something went wrong
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6 text-muted-foreground"
            >
              We encountered an unexpected error. This has been logged and we'll
              look into it.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center space-x-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <RefreshCwIcon className="h-4 w-4" />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center space-x-2 rounded-lg bg-muted px-4 py-2 text-foreground transition-colors hover:bg-muted/80"
                >
                  <HomeIcon className="h-4 w-4" />
                  <span>Go Home</span>
                </button>
              </div>

              <button
                onClick={this.handleReload}
                className="flex w-full items-center justify-center space-x-2 rounded-lg border border-border px-4 py-2 transition-colors hover:bg-muted"
              >
                <RefreshCwIcon className="h-4 w-4" />
                <span>Reload Page</span>
              </button>

              {/* Error Details Toggle */}
              {this.props.showErrorDetails !== false && (
                <button
                  onClick={this.toggleExpanded}
                  className="flex w-full items-center justify-center space-x-2 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <BugIcon className="h-4 w-4" />
                  <span>Error Details</span>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${
                      this.state.isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
            </motion.div>

            {/* Error Details Panel */}
            {this.state.isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 rounded-lg bg-muted p-4 text-left"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">
                    Technical Details
                  </h3>
                  <button
                    onClick={this.copyErrorDetails}
                    className="flex items-center space-x-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <CopyIcon className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {this.state.error && (
                    <div>
                      <div className="mb-1 font-medium text-red-500">
                        Error:
                      </div>
                      <div className="overflow-x-auto rounded border bg-background p-2 font-mono text-muted-foreground">
                        {this.state.error.toString()}
                      </div>
                    </div>
                  )}

                  {this.state.error?.stack && (
                    <div>
                      <div className="mb-1 font-medium text-foreground">
                        Stack Trace:
                      </div>
                      <div className="max-h-32 overflow-x-auto overflow-y-auto rounded border bg-background p-2 font-mono text-muted-foreground">
                        {this.state.error.stack}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-2 text-xs text-muted-foreground">
                    Time: {new Date().toLocaleString()}
                    <br />
                    URL: {window.location.href}
                  </div>
                </div>

                {/* Report Issue Link */}
                <div className="mt-4 border-t border-border pt-3">
                  <a
                    href="https://github.com/your-repo/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-xs text-blue-500 transition-colors hover:text-blue-400"
                  >
                    <ExternalLinkIcon className="h-3 w-3" />
                    <span>Report this issue on GitHub</span>
                  </a>
                </div>
              </motion.div>
            )}

            {/* Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground"
            >
              Error ID: {Date.now().toString(36)}
            </motion.div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// HOC FOR FUNCTIONAL COMPONENTS
// =============================================================================

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// =============================================================================
// HOOK FOR ERROR REPORTING
// =============================================================================

export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: any) => {
    console.error('Caught error:', error, errorInfo);

    // In a real app, report to error tracking service
    if (typeof window !== 'undefined') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }, []);
}
