'use client';

import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { wagmiConfig, chains } from '@/lib/wagmi';
import { PortfolioProvider } from '@/stores/portfolio';
import { TradingProvider } from '@/stores/trading';
import { NotificationProvider } from '@/stores/notifications';
import { SettingsProvider } from '@/stores/settings';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import SolanaProvider from './SolanaProvider';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

// =============================================================================
// QUERY CLIENT CONFIGURATION
// =============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 429 (rate limit)
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500 && status !== 429) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// =============================================================================
// RAINBOWKIT THEME
// =============================================================================

const rainbowKitTheme = {
  blurs: {
    modalOverlay: 'blur(8px)',
  },
  colors: {
    accentColor: '#0ea5e9',
    accentColorForeground: '#ffffff',
    actionButtonBorder: 'rgba(255, 255, 255, 0.04)',
    actionButtonBorderMobile: 'rgba(255, 255, 255, 0.08)',
    actionButtonSecondaryBackground: 'rgba(255, 255, 255, 0.08)',
    closeButton: 'rgba(224, 232, 255, 0.6)',
    closeButtonBackground: 'rgba(255, 255, 255, 0.08)',
    connectButtonBackground: '#0ea5e9',
    connectButtonBackgroundError: '#ef4444',
    connectButtonInnerBackground: 'linear-gradient(0deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.15))',
    connectButtonText: '#ffffff',
    connectButtonTextError: '#ffffff',
    connectionIndicator: '#22c55e',
    downloadBottomCardBackground: 'linear-gradient(126deg, rgba(255, 255, 255, 0.2) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), #1e293b',
    downloadTopCardBackground: 'linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0.04) 71.04%), #0f172a',
    error: '#ef4444',
    generalBorder: 'rgba(255, 255, 255, 0.08)',
    generalBorderDim: 'rgba(255, 255, 255, 0.04)',
    menuItemBackground: 'rgba(224, 232, 255, 0.1)',
    modalBackdrop: 'rgba(0, 0, 0, 0.3)',
    modalBackground: '#0f172a',
    modalBorder: 'rgba(255, 255, 255, 0.08)',
    modalText: '#f8fafc',
    modalTextDim: 'rgba(224, 232, 255, 0.3)',
    modalTextSecondary: 'rgba(255, 255, 255, 0.6)',
    profileAction: 'rgba(224, 232, 255, 0.1)',
    profileActionHover: 'rgba(224, 232, 255, 0.2)',
    profileForeground: '#1e293b',
    selectedOptionBorder: 'rgba(224, 232, 255, 0.1)',
    standby: '#f59e0b',
  },
  fonts: {
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  radii: {
    actionButton: '12px',
    connectButton: '12px',
    menuButton: '12px',
    modal: '16px',
    modalMobile: '16px',
  },
  shadows: {
    connectButton: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    dialog: '0px 8px 32px rgba(0, 0, 0, 0.32)',
    profileDetailsAction: '0px 2px 6px rgba(37, 41, 46, 0.04)',
    selectedOption: '0px 2px 6px rgba(0, 0, 0, 0.24)',
    selectedWallet: '0px 2px 6px rgba(0, 0, 0, 0.12)',
    walletLogo: '0px 2px 16px rgba(0, 0, 0, 0.16)',
  },
};

// =============================================================================
// ERROR BOUNDARY
// =============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
    
    // Log to external error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
          <div className="max-w-md w-full mx-4">
            <div className="card text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We apologize for the inconvenience. Please refresh the page to try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary w-full"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// MAIN PROVIDERS COMPONENT
// =============================================================================

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider
              chains={chains}
              theme={rainbowKitTheme}
              modalSize="compact"
              coolMode
            >
              <SolanaProvider>
                <SettingsProvider>
                <NotificationProvider>
                  <PortfolioProvider>
                    <TradingProvider>
                      {children}
                      {process.env.NODE_ENV === 'development' && (
                        <ReactQueryDevtools
                          initialIsOpen={false}
                          position="bottom-right"
                        />
                      )}
                    </TradingProvider>
                  </PortfolioProvider>
                </NotificationProvider>
              </SettingsProvider>
            </SolanaProvider>
            </RainbowKitProvider>
          </WagmiConfig>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Add performance monitoring in development
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure') {
        console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
      }
    }
  });
  
  observer.observe({ entryTypes: ['measure'] });
}

// =============================================================================
// EXPORTS
// =============================================================================

export { queryClient };