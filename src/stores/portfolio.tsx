'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Portfolio, PortfolioPosition, Token, TokenBalance, PerformanceDataPoint } from '@/types';
import { useWallet } from '@/hooks/useWallet';
import { formatCurrency } from '@/utils/format';

// =============================================================================
// TYPES
// =============================================================================

export interface PortfolioState {
  portfolio: Portfolio | null;
  positions: PortfolioPosition[];
  balances: TokenBalance[];
  totalValueUSD: number;
  totalPnlUSD: number;
  totalPnlPercentage: number;
  performanceHistory: PerformanceDataPoint[];
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

export interface PortfolioActions {
  setPortfolio: (portfolio: Portfolio) => void;
  updatePosition: (position: PortfolioPosition) => void;
  removePosition: (positionId: string) => void;
  updateBalances: (balances: TokenBalance[]) => void;
  addPerformancePoint: (point: PerformanceDataPoint) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshPortfolio: () => Promise<void>;
  clearPortfolio: () => void;
}

export type PortfolioStore = PortfolioState & PortfolioActions;

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: PortfolioState = {
  portfolio: null,
  positions: [],
  balances: [],
  totalValueUSD: 0,
  totalPnlUSD: 0,
  totalPnlPercentage: 0,
  performanceHistory: [],
  isLoading: false,
  lastUpdated: null,
  error: null,
};

// =============================================================================
// STORE CREATION
// =============================================================================

const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setPortfolio: (portfolio) => {
        set({
          portfolio,
          positions: portfolio.positions,
          totalValueUSD: portfolio.totalValueUSD,
          totalPnlUSD: portfolio.totalPnlUSD,
          totalPnlPercentage: portfolio.totalPnlPercentage,
          performanceHistory: portfolio.performanceHistory,
          lastUpdated: portfolio.lastUpdated,
          error: null,
        });
      },
      
      updatePosition: (position) => {
        set((state) => {
          const existingIndex = state.positions.findIndex(p => p.id === position.id);
          let newPositions;
          
          if (existingIndex >= 0) {
            newPositions = [...state.positions];
            newPositions[existingIndex] = position;
          } else {
            newPositions = [...state.positions, position];
          }
          
          // Recalculate totals
          const totalValueUSD = newPositions.reduce((sum, p) => sum + p.balanceUSD, 0);
          const totalPnlUSD = newPositions.reduce((sum, p) => sum + (p.pnl || 0), 0);
          const totalPnlPercentage = totalValueUSD > 0 ? (totalPnlUSD / totalValueUSD) * 100 : 0;
          
          return {
            ...state,
            positions: newPositions,
            totalValueUSD,
            totalPnlUSD,
            totalPnlPercentage,
            lastUpdated: new Date(),
          };
        });
      },
      
      removePosition: (positionId) => {
        set((state) => {
          const newPositions = state.positions.filter(p => p.id !== positionId);
          
          // Recalculate totals
          const totalValueUSD = newPositions.reduce((sum, p) => sum + p.balanceUSD, 0);
          const totalPnlUSD = newPositions.reduce((sum, p) => sum + (p.pnl || 0), 0);
          const totalPnlPercentage = totalValueUSD > 0 ? (totalPnlUSD / totalValueUSD) * 100 : 0;
          
          return {
            ...state,
            positions: newPositions,
            totalValueUSD,
            totalPnlUSD,
            totalPnlPercentage,
            lastUpdated: new Date(),
          };
        });
      },
      
      updateBalances: (balances) => {
        set((state) => ({
          ...state,
          balances,
          totalValueUSD: balances.reduce((sum, b) => sum + b.balanceUSD, 0),
          lastUpdated: new Date(),
        }));
      },
      
      addPerformancePoint: (point) => {
        set((state) => ({
          ...state,
          performanceHistory: [...state.performanceHistory, point].slice(-1000), // Keep last 1000 points
        }));
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error, isLoading: false }),
      
      refreshPortfolio: async () => {
        const state = get();
        if (state.isLoading) return;
        
        set({ isLoading: true, error: null });
        
        try {
          // This would typically call an API to refresh portfolio data
          // For now, we'll simulate the refresh
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Add current state as performance point
          const now = new Date();
          const performancePoint: PerformanceDataPoint = {
            timestamp: now,
            totalValueUSD: state.totalValueUSD,
            pnlUSD: state.totalPnlUSD,
            pnlPercentage: state.totalPnlPercentage,
          };
          
          set((state) => ({
            ...state,
            performanceHistory: [...state.performanceHistory, performancePoint],
            lastUpdated: now,
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to refresh portfolio',
            isLoading: false 
          });
        }
      },
      
      clearPortfolio: () => set(initialState),
    }),
    {
      name: 'defi-portfolio-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        portfolio: state.portfolio,
        positions: state.positions,
        balances: state.balances,
        totalValueUSD: state.totalValueUSD,
        totalPnlUSD: state.totalPnlUSD,
        totalPnlPercentage: state.totalPnlPercentage,
        performanceHistory: state.performanceHistory,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// =============================================================================
// CONTEXT PROVIDER
// =============================================================================

const PortfolioContext = createContext<PortfolioStore | null>(null);

interface PortfolioProviderProps {
  children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const { address, isConnected } = useWallet();
  const portfolioStore = usePortfolioStore();
  
  // Clear portfolio when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      portfolioStore.clearPortfolio();
    }
  }, [isConnected, portfolioStore]);
  
  // Auto-refresh portfolio when address changes
  useEffect(() => {
    if (isConnected && address) {
      portfolioStore.refreshPortfolio();
    }
  }, [address, isConnected, portfolioStore]);
  
  return (
    <PortfolioContext.Provider value={portfolioStore}>
      {children}
    </PortfolioContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function usePortfolio(): PortfolioStore {
  return usePortfolioStore();
}

export function usePortfolioPositions() {
  const { positions, isLoading, error } = usePortfolio();
  
  return {
    positions,
    isLoading,
    error,
    totalPositions: positions.length,
    hasPositions: positions.length > 0,
  };
}

export function usePortfolioValue() {
  const { totalValueUSD, totalPnlUSD, totalPnlPercentage, isLoading } = usePortfolio();
  
  return {
    totalValueUSD,
    totalPnlUSD,
    totalPnlPercentage,
    isLoading,
    formattedValue: formatCurrency(totalValueUSD),
    formattedPnl: formatCurrency(totalPnlUSD),
    isPositive: totalPnlUSD > 0,
    isNegative: totalPnlUSD < 0,
  };
}

export function usePortfolioPerformance() {
  const { performanceHistory, isLoading } = usePortfolio();
  
  const chartData = performanceHistory.map(point => ({
    timestamp: point.timestamp,
    value: point.totalValueUSD,
    pnl: point.pnlUSD,
    pnlPercentage: point.pnlPercentage,
  }));
  
  return {
    performanceHistory,
    chartData,
    isLoading,
    hasData: performanceHistory.length > 0,
  };
}

export function useTokenBalances() {
  const { balances, isLoading, error } = usePortfolio();
  
  const sortedBalances = [...balances].sort((a, b) => b.balanceUSD - a.balanceUSD);
  
  return {
    balances: sortedBalances,
    isLoading,
    error,
    totalBalance: balances.reduce((sum, b) => sum + b.balanceUSD, 0),
    tokenCount: balances.length,
  };
}

// =============================================================================
// PORTFOLIO ANALYTICS
// =============================================================================

export function usePortfolioAnalytics() {
  const { positions, performanceHistory } = usePortfolio();
  
  const analytics = React.useMemo(() => {
    if (positions.length === 0) {
      return {
        diversificationScore: 0,
        riskScore: 0,
        bestPerformer: null,
        worstPerformer: null,
        averageReturn: 0,
        volatility: 0,
      };
    }
    
    // Calculate diversification score (0-100)
    const totalValue = positions.reduce((sum, p) => sum + p.balanceUSD, 0);
    const largestAllocation = Math.max(...positions.map(p => p.allocation));
    const diversificationScore = Math.max(0, 100 - largestAllocation);
    
    // Find best and worst performers
    const performersWithPnl = positions.filter(p => p.pnlPercentage !== undefined);
    const bestPerformer = performersWithPnl.reduce((best, current) => 
      (current.pnlPercentage || 0) > (best?.pnlPercentage || -Infinity) ? current : best
    );
    const worstPerformer = performersWithPnl.reduce((worst, current) => 
      (current.pnlPercentage || 0) < (worst?.pnlPercentage || Infinity) ? current : worst
    );
    
    // Calculate average return
    const averageReturn = performersWithPnl.length > 0 
      ? performersWithPnl.reduce((sum, p) => sum + (p.pnlPercentage || 0), 0) / performersWithPnl.length
      : 0;
    
    // Calculate volatility from performance history
    let volatility = 0;
    if (performanceHistory.length > 1) {
      const returns = performanceHistory.slice(1).map((point, index) => {
        const prevValue = performanceHistory[index].totalValueUSD;
        return prevValue > 0 ? (point.totalValueUSD - prevValue) / prevValue : 0;
      });
      
      const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
      volatility = Math.sqrt(variance) * 100; // Convert to percentage
    }
    
    // Calculate risk score (0-100, higher = riskier)
    const riskScore = Math.min(100, volatility * 10 + (100 - diversificationScore) * 0.5);
    
    return {
      diversificationScore,
      riskScore,
      bestPerformer,
      worstPerformer,
      averageReturn,
      volatility,
    };
  }, [positions, performanceHistory]);
  
  return analytics;
}

// =============================================================================
// PORTFOLIO UTILITIES
// =============================================================================

export function usePortfolioUtils() {
  const { updatePosition, removePosition, addPerformancePoint } = usePortfolio();
  
  const addToken = React.useCallback((token: Token, balance: string, price: number) => {
    const balanceNum = parseFloat(balance);
    const balanceUSD = balanceNum * price;
    
    const position: PortfolioPosition = {
      id: `${token.address}_${Date.now()}`,
      token,
      balance,
      balanceUSD,
      currentPrice: price,
      allocation: 0, // Will be calculated in updatePosition
      lastUpdated: new Date(),
    };
    
    updatePosition(position);
  }, [updatePosition]);
  
  const recordPerformance = React.useCallback((totalValueUSD: number, pnlUSD: number) => {
    const pnlPercentage = totalValueUSD > 0 ? (pnlUSD / totalValueUSD) * 100 : 0;
    
    const point: PerformanceDataPoint = {
      timestamp: new Date(),
      totalValueUSD,
      pnlUSD,
      pnlPercentage,
    };
    
    addPerformancePoint(point);
  }, [addPerformancePoint]);
  
  return {
    addToken,
    removeToken: removePosition,
    recordPerformance,
  };
}