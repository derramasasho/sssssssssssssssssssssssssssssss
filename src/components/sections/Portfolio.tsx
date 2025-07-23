'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  RefreshCcwIcon,
  BarChart3Icon,
  PieChartIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  InfoIcon,
  SparklesIcon,
} from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';

// Types and Services
import {
  Portfolio as PortfolioType,
  PortfolioPosition,
  AIAnalysis,
  PerformanceDataPoint,
} from '@/types';
import { usePortfolio } from '@/stores/portfolio';
import { portfolioService } from '@/services/portfolio';
import { aiService } from '@/services/ai';
import { pricingService } from '@/services/pricing';

// Utils
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

// =============================================================================
// PORTFOLIO OVERVIEW COMPONENT
// =============================================================================

export default function Portfolio(): JSX.Element {
  const { address } = useAccount();
  const chainId = useChainId();
  const {
    portfolio,
    isLoading,
    error,
    lastRefresh,
    loadPortfolio,
    refreshPortfolio,
  } = usePortfolio();

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [showPositions, setShowPositions] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Load portfolio data on mount
  useEffect(() => {
    if (address && !portfolio && !isLoading) {
      loadPortfolio(address, chainId);
    }
  }, [address, chainId, portfolio, isLoading, loadPortfolio]);

  // Generate AI analysis when portfolio loads
  useEffect(() => {
    if (portfolio && !aiAnalysis && !aiLoading) {
      generateAIAnalysis();
    }
  }, [portfolio, aiAnalysis, aiLoading]);

  const generateAIAnalysis = useCallback(async () => {
    if (!portfolio) return;

    setAiLoading(true);
    try {
      // Get current market data for context
      const marketData = await pricingService.getMarketData([
        'ETH',
        'BTC',
        'USDC',
        'UNI',
      ]);
      const analysis = await aiService.analyzePortfolio(portfolio, marketData);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Failed to generate AI analysis:', error);
    } finally {
      setAiLoading(false);
    }
  }, [portfolio]);

  const handleRefresh = useCallback(async () => {
    if (!address || refreshing) return;

    setRefreshing(true);
    try {
      await refreshPortfolio(address, chainId);
      if (portfolio) {
        await generateAIAnalysis();
      }
    } catch (error) {
      console.error('Failed to refresh portfolio:', error);
    } finally {
      setRefreshing(false);
    }
  }, [
    address,
    chainId,
    refreshing,
    refreshPortfolio,
    portfolio,
    generateAIAnalysis,
  ]);

  if (!address) {
    return (
      <div className="card p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">Portfolio Overview</h2>
        <p className="text-muted-foreground">
          Connect your wallet to view your portfolio
        </p>
      </div>
    );
  }

  if (isLoading && !portfolio) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Portfolio Overview</h2>
          <div className="skeleton h-10 w-24 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="skeleton mb-2 h-6 w-24"></div>
              <div className="skeleton mb-4 h-8 w-32"></div>
              <div className="skeleton h-4 w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <AlertTriangleIcon className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h3 className="mb-2 text-lg font-semibold">Failed to Load Portfolio</h3>
        <p className="mb-4 text-muted-foreground">{error}</p>
        <button onClick={handleRefresh} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="card p-8 text-center">
        <PieChartIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No Portfolio Data</h3>
        <p className="text-muted-foreground">No tokens found in this wallet</p>
      </div>
    );
  }

  const portfolioMetrics =
    portfolioService.calculatePortfolioMetrics(portfolio);
  const isPositive = portfolio.totalPnlUSD >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Portfolio Overview</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              'btn btn-outline btn-sm',
              refreshing && 'animate-spin'
            )}
          >
            <RefreshCcwIcon className="h-4 w-4" />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {lastRefresh && (
            <span className="text-sm text-muted-foreground">
              Updated {new Date(lastRefresh).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Value
            </h3>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mb-1 text-2xl font-bold">
            {formatCurrency(portfolio.totalValueUSD)}
          </div>
          <div
            className={cn(
              'flex items-center text-sm',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {isPositive ? (
              <TrendingUpIcon className="mr-1 h-4 w-4" />
            ) : (
              <TrendingDownIcon className="mr-1 h-4 w-4" />
            )}
            {formatCurrency(portfolio.totalPnlUSD)} (
            {formatPercentage(portfolio.totalPnlPercentage)})
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Positions
            </h3>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mb-1 text-2xl font-bold">
            {portfolio.positions.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Diversification: {portfolioMetrics.diversificationScore.toFixed(0)}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Risk Score
            </h3>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mb-1 text-2xl font-bold">
            {portfolioMetrics.riskScore.toFixed(0)}%
          </div>
          <div
            className={cn(
              'text-sm',
              portfolioMetrics.riskScore < 30
                ? 'text-green-600'
                : portfolioMetrics.riskScore < 60
                  ? 'text-yellow-600'
                  : 'text-red-600'
            )}
          >
            {portfolioMetrics.riskScore < 30
              ? 'Low Risk'
              : portfolioMetrics.riskScore < 60
                ? 'Medium Risk'
                : 'High Risk'}
          </div>
        </motion.div>
      </div>

      {/* AI Analysis */}
      <AnimatePresence>
        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card bg-gradient-to-r from-purple-50 to-blue-50 p-6 dark:from-purple-950/20 dark:to-blue-950/20"
          >
            <div className="mb-4 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">AI Portfolio Analysis</h3>
              <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                Confidence: {formatPercentage(aiAnalysis.confidence * 100)}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">{aiAnalysis.summary}</p>

              {aiAnalysis.insights.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Key Insights:</h4>
                  <ul className="space-y-1">
                    {aiAnalysis.insights.map((insight, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <InfoIcon className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-600" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiAnalysis.recommendations.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Recommendations:</h4>
                  <ul className="space-y-1">
                    {aiAnalysis.recommendations.map((rec, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <ArrowUpRightIcon className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-600" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={generateAIAnalysis}
                disabled={aiLoading}
                className="btn btn-outline btn-sm"
              >
                {aiLoading ? 'Analyzing...' : 'Refresh Analysis'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portfolio Positions */}
      <div className="card">
        <div className="border-b border-border p-6">
          <button
            onClick={() => setShowPositions(!showPositions)}
            className="flex w-full items-center gap-2 text-left"
          >
            <h3 className="text-lg font-semibold">Positions</h3>
            {showPositions ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {showPositions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="divide-y divide-border"
            >
              {portfolio.positions.map((position, index) => (
                <PositionRow
                  key={position.id}
                  position={position}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Portfolio Analytics Toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="btn btn-outline"
        >
          {showAnalytics ? 'Hide' : 'Show'} Advanced Analytics
        </button>
      </div>

      {/* Advanced Analytics */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            <PerformanceChart performanceData={portfolio.performanceHistory} />
            <AllocationChart positions={portfolio.positions} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// POSITION ROW COMPONENT
// =============================================================================

interface PositionRowProps {
  position: PortfolioPosition;
  index: number;
}

function PositionRow({ position, index }: PositionRowProps): JSX.Element {
  const isPositive = (position.pnl || 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-6 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
            <span className="text-sm font-semibold">
              {position.token.symbol[0]}
            </span>
          </div>
          <div>
            <div className="font-semibold">{position.token.symbol}</div>
            <div className="text-sm text-muted-foreground">
              {position.token.name}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="font-semibold">
            {formatCurrency(position.balanceUSD)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatNumber(
              parseFloat(position.balance) /
                Math.pow(10, position.token.decimals)
            )}{' '}
            {position.token.symbol}
          </div>
        </div>

        <div className="text-right">
          <div className="font-semibold">{position.allocation.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Allocation</div>
        </div>

        <div className="text-right">
          <div
            className={cn(
              'flex items-center font-semibold',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {isPositive ? (
              <ArrowUpRightIcon className="mr-1 h-4 w-4" />
            ) : (
              <ArrowDownRightIcon className="mr-1 h-4 w-4" />
            )}
            {formatPercentage(position.pnlPercentage || 0)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(position.pnl || 0)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// PERFORMANCE CHART COMPONENT
// =============================================================================

interface PerformanceChartProps {
  performanceData: PerformanceDataPoint[];
}

function PerformanceChart({
  performanceData,
}: PerformanceChartProps): JSX.Element {
  return (
    <div className="card p-6">
      <h3 className="mb-4 text-lg font-semibold">Performance History</h3>
      <div className="flex h-64 items-center justify-center rounded-lg bg-muted/50">
        <p className="text-muted-foreground">
          Chart visualization would go here
        </p>
        <p className="ml-2 text-xs text-muted-foreground">
          ({performanceData.length} data points)
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// ALLOCATION CHART COMPONENT
// =============================================================================

interface AllocationChartProps {
  positions: PortfolioPosition[];
}

function AllocationChart({ positions }: AllocationChartProps): JSX.Element {
  return (
    <div className="card p-6">
      <h3 className="mb-4 text-lg font-semibold">Portfolio Allocation</h3>
      <div className="space-y-3">
        {positions.slice(0, 5).map(position => (
          <div key={position.id} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
              <span className="text-xs font-semibold">
                {position.token.symbol[0]}
              </span>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium">{position.token.symbol}</span>
                <span className="text-sm text-muted-foreground">
                  {position.allocation.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${position.allocation}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
