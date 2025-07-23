'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SwapQuote, Trade, Token, SwapFormData } from '@/types';
import { APP_CONFIG } from '@/lib/constants';

// =============================================================================
// TYPES
// =============================================================================

export interface TradingState {
  // Current swap
  currentQuote: SwapQuote | null;
  swapForm: SwapFormData;
  isLoadingQuote: boolean;
  quoteError: string | null;
  
  // Trade history
  trades: Trade[];
  pendingTrades: Trade[];
  
  // Recently used tokens
  recentTokens: Token[];
  
  // Settings
  slippage: number;
  autoSlippage: boolean;
  expertMode: boolean;
  
  // State
  isLoading: boolean;
  error: string | null;
}

export interface TradingActions {
  // Quote management
  setCurrentQuote: (quote: SwapQuote | null) => void;
  updateSwapForm: (formData: Partial<SwapFormData>) => void;
  setQuoteLoading: (loading: boolean) => void;
  setQuoteError: (error: string | null) => void;
  
  // Trade management
  addTrade: (trade: Trade) => void;
  updateTrade: (tradeId: string, updates: Partial<Trade>) => void;
  
  // Token management
  addRecentToken: (token: Token) => void;
  clearRecentTokens: () => void;
  
  // Settings
  updateSlippage: (slippage: number) => void;
  toggleAutoSlippage: () => void;
  toggleExpertMode: () => void;
  
  // Actions
  refreshQuote: () => Promise<void>;
  executeTrade: (quote: SwapQuote) => Promise<string>;
  clearError: () => void;
}

export type TradingStore = TradingState & TradingActions;

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: TradingState = {
  currentQuote: null,
  swapForm: {
    fromToken: undefined,
    toToken: undefined,
    fromAmount: '',
    slippage: APP_CONFIG.TRADING.DEFAULT_SLIPPAGE,
    autoSlippage: true,
  },
  isLoadingQuote: false,
  quoteError: null,
  trades: [],
  pendingTrades: [],
  recentTokens: [],
  slippage: APP_CONFIG.TRADING.DEFAULT_SLIPPAGE,
  autoSlippage: true,
  expertMode: false,
  isLoading: false,
  error: null,
};

// =============================================================================
// STORE CREATION
// =============================================================================

const useTradingStore = create<TradingStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Quote management
      setCurrentQuote: (quote) => {
        set({ currentQuote: quote });
      },
      
      updateSwapForm: (formData) => {
        set((state) => ({
          swapForm: { ...state.swapForm, ...formData },
        }));
      },
      
      setQuoteLoading: (loading) => {
        set({ isLoadingQuote: loading });
      },
      
      setQuoteError: (error) => {
        set({ quoteError: error, isLoadingQuote: false });
      },
      
      // Trade management
      addTrade: (trade) => {
        set((state) => ({
          trades: [trade, ...state.trades].slice(0, 100), // Keep last 100 trades
          pendingTrades: trade.status === 'pending' 
            ? [...state.pendingTrades, trade]
            : state.pendingTrades,
        }));
      },
      
      updateTrade: (tradeId, updates) => {
        set((state) => ({
          trades: state.trades.map(trade => 
            trade.id === tradeId ? { ...trade, ...updates } : trade
          ),
          pendingTrades: state.pendingTrades.map(trade => 
            trade.id === tradeId ? { ...trade, ...updates } : trade
          ).filter(trade => trade.status === 'pending'),
        }));
      },
      
      // Token management
      addRecentToken: (token) => {
        set((state) => {
          const filtered = state.recentTokens.filter(t => t.id !== token.id);
          return {
            recentTokens: [token, ...filtered].slice(0, APP_CONFIG.UI.MAX_RECENT_TOKENS),
          };
        });
      },
      
      clearRecentTokens: () => {
        set({ recentTokens: [] });
      },
      
      // Settings
      updateSlippage: (slippage) => {
        set((state) => ({
          slippage,
          swapForm: { ...state.swapForm, slippage },
        }));
      },
      
      toggleAutoSlippage: () => {
        set((state) => ({
          autoSlippage: !state.autoSlippage,
          swapForm: { ...state.swapForm, autoSlippage: !state.autoSlippage },
        }));
      },
      
      toggleExpertMode: () => {
        set((state) => ({ expertMode: !state.expertMode }));
      },
      
      // Actions
      refreshQuote: async () => {
        const state = get();
        const { fromToken, toToken, fromAmount } = state.swapForm;
        
        if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
          return;
        }
        
        set({ isLoadingQuote: true, quoteError: null });
        
        try {
          // This would typically call a DEX aggregator API
          // For now, we'll simulate getting a quote
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockQuote: SwapQuote = {
            id: `quote_${Date.now()}`,
            fromToken,
            toToken,
            fromAmount,
            toAmount: (parseFloat(fromAmount) * 0.95).toString(), // Mock 5% slippage
            price: 0.95,
            priceImpact: 5,
            gasEstimate: '150000',
            route: [],
            aggregator: 'Mock DEX',
            slippage: state.slippage,
            validUntil: new Date(Date.now() + 30000), // Valid for 30 seconds
          };
          
          set({ currentQuote: mockQuote, isLoadingQuote: false });
        } catch (error) {
          set({
            quoteError: error instanceof Error ? error.message : 'Failed to get quote',
            isLoadingQuote: false,
          });
        }
      },
      
      executeTrade: async (quote) => {
        set({ isLoading: true, error: null });
        
        try {
          // This would typically execute the trade on-chain
          // For now, we'll simulate the trade execution
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const trade: Trade = {
            id: `trade_${Date.now()}`,
            userId: 'current_user', // This would come from auth
            type: 'swap',
            fromToken: quote.fromToken,
            toToken: quote.toToken,
            fromAmount: quote.fromAmount,
            toAmount: quote.toAmount,
            price: quote.price,
            gasUsed: quote.gasEstimate,
            gasFee: '0.005', // Mock gas fee
            txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
            status: 'pending',
            timestamp: new Date(),
          };
          
          // Add trade to history
          get().addTrade(trade);
          
          // Add tokens to recent list
          get().addRecentToken(quote.fromToken);
          get().addRecentToken(quote.toToken);
          
          set({ isLoading: false, currentQuote: null });
          
          // Simulate trade confirmation after 5 seconds
          setTimeout(() => {
            get().updateTrade(trade.id, { 
              status: Math.random() > 0.1 ? 'confirmed' : 'failed',
              blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
            });
          }, 5000);
          
          return trade.txHash;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Trade execution failed',
            isLoading: false,
          });
          throw error;
        }
      },
      
      clearError: () => {
        set({ error: null, quoteError: null });
      },
    }),
    {
      name: 'defi-trading-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        trades: state.trades,
        recentTokens: state.recentTokens,
        slippage: state.slippage,
        autoSlippage: state.autoSlippage,
        expertMode: state.expertMode,
      }),
    }
  )
);

// =============================================================================
// CONTEXT PROVIDER
// =============================================================================

const TradingContext = createContext<TradingStore | null>(null);

interface TradingProviderProps {
  children: ReactNode;
}

export function TradingProvider({ children }: TradingProviderProps) {
  return (
    <TradingContext.Provider value={useTradingStore.getState()}>
      {children}
    </TradingContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function useTrading(): TradingStore {
  return useTradingStore();
}

export function useSwapQuote() {
  const { 
    currentQuote, 
    isLoadingQuote, 
    quoteError, 
    refreshQuote,
    setCurrentQuote,
    clearError 
  } = useTrading();
  
  return {
    quote: currentQuote,
    isLoading: isLoadingQuote,
    error: quoteError,
    refreshQuote,
    clearQuote: () => setCurrentQuote(null),
    clearError,
    hasQuote: !!currentQuote,
    isValidQuote: currentQuote && new Date() < currentQuote.validUntil,
  };
}

export function useSwapForm() {
  const { swapForm, updateSwapForm, slippage, updateSlippage, autoSlippage, toggleAutoSlippage } = useTrading();
  
  const resetForm = React.useCallback(() => {
    updateSwapForm({
      fromToken: undefined,
      toToken: undefined,
      fromAmount: '',
    });
  }, [updateSwapForm]);
  
  const swapTokens = React.useCallback(() => {
    updateSwapForm({
      fromToken: swapForm.toToken,
      toToken: swapForm.fromToken,
      fromAmount: '',
    });
  }, [swapForm.fromToken, swapForm.toToken, updateSwapForm]);
  
  return {
    form: swapForm,
    updateForm: updateSwapForm,
    resetForm,
    swapTokens,
    slippage,
    updateSlippage,
    autoSlippage,
    toggleAutoSlippage,
    isFormValid: !!(swapForm.fromToken && swapForm.toToken && swapForm.fromAmount),
  };
}

export function useTrades() {
  const { trades, pendingTrades, isLoading, error } = useTrading();
  
  const recentTrades = React.useMemo(() => 
    trades.slice(0, 10), [trades]
  );
  
  const confirmedTrades = React.useMemo(() => 
    trades.filter(trade => trade.status === 'confirmed'), [trades]
  );
  
  const failedTrades = React.useMemo(() => 
    trades.filter(trade => trade.status === 'failed'), [trades]
  );
  
  return {
    allTrades: trades,
    recentTrades,
    confirmedTrades,
    failedTrades,
    pendingTrades,
    isLoading,
    error,
    totalTrades: trades.length,
    hasTrades: trades.length > 0,
  };
}

export function useRecentTokens() {
  const { recentTokens, addRecentToken, clearRecentTokens } = useTrading();
  
  return {
    tokens: recentTokens,
    addToken: addRecentToken,
    clearTokens: clearRecentTokens,
    hasTokens: recentTokens.length > 0,
  };
}

// =============================================================================
// TRADING UTILITIES
// =============================================================================

export function calculatePriceImpact(quote: SwapQuote): number {
  // This would calculate actual price impact based on market prices
  return quote.priceImpact;
}

export function calculateMinimumReceived(quote: SwapQuote, slippage: number): string {
  const slippageMultiplier = 1 - (slippage / 100);
  const minimumReceived = parseFloat(quote.toAmount) * slippageMultiplier;
  return minimumReceived.toString();
}

export function isQuoteExpired(quote: SwapQuote): boolean {
  return new Date() >= quote.validUntil;
}

export function formatRouteDescription(quote: SwapQuote): string {
  if (quote.route.length === 0) {
    return 'Direct swap';
  }
  
  const protocols = quote.route.map(step => step.protocol);
  const uniqueProtocols = [...new Set(protocols)];
  
  if (uniqueProtocols.length === 1) {
    return `via ${uniqueProtocols[0]}`;
  }
  
  return `via ${uniqueProtocols.slice(0, 2).join(', ')}${uniqueProtocols.length > 2 ? '...' : ''}`;
}