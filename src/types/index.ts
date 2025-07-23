import { Address } from 'viem';

// =============================================================================
// CORE TYPES
// =============================================================================

export type ChainType = 'evm' | 'solana';

export interface User {
  id: string;
  address: Address;
  ens?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Token {
  id: string;
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
  isVerified?: boolean;
  tags?: string[];
}

export interface TokenBalance {
  token: Token;
  balance: string;
  balanceFormatted: string;
  balanceUSD: number;
  price: number;
  priceChange24h: number;
}

// =============================================================================
// PORTFOLIO TYPES
// =============================================================================

export interface PortfolioPosition {
  id: string;
  token: Token;
  balance: string;
  balanceUSD: number;
  entryPrice?: number;
  currentPrice: number;
  pnl?: number;
  pnlPercentage?: number;
  allocation: number; // Percentage of total portfolio
  lastUpdated: Date;
}

export interface Portfolio {
  id: string;
  userId: string;
  totalValueUSD: number;
  totalPnlUSD: number;
  totalPnlPercentage: number;
  positions: PortfolioPosition[];
  performanceHistory: PerformanceDataPoint[];
  lastUpdated: Date;
}

export interface PerformanceDataPoint {
  timestamp: Date;
  totalValueUSD: number;
  pnlUSD: number;
  pnlPercentage: number;
}

// =============================================================================
// TRADING TYPES
// =============================================================================

export interface SwapQuote {
  id: string;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  price: number;
  priceImpact: number;
  gasEstimate: string;
  route: RouteStep[];
  aggregator: string;
  slippage: number;
  validUntil: Date;
  raw?: any; // Raw response data for swap execution
}

export interface RouteStep {
  protocol: string;
  poolAddress: Address;
  percentage: number;
  tokenIn: Token;
  tokenOut: Token;
}

export interface Trade {
  id: string;
  userId: string;
  type: 'swap' | 'add_liquidity' | 'remove_liquidity';
  fromToken: Token;
  toToken?: Token;
  fromAmount: string;
  toAmount?: string;
  price: number;
  gasUsed: string;
  gasFee: string;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  blockNumber?: number;
}

// =============================================================================
// DEFI PROTOCOL TYPES
// =============================================================================

export interface LiquidityPool {
  id: string;
  address: Address;
  protocol: string;
  name: string;
  tokens: Token[];
  reserves: string[];
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apy: number;
  isVerified: boolean;
}

export interface LiquidityPosition {
  id: string;
  poolId: string;
  pool: LiquidityPool;
  userAddress: Address;
  liquidity: string;
  token0Amount: string;
  token1Amount: string;
  valueUSD: number;
  feesEarned: number;
  apy: number;
  createdAt: Date;
}

export interface StakingPool {
  id: string;
  address: Address;
  protocol: string;
  name: string;
  stakingToken: Token;
  rewardTokens: Token[];
  totalStaked: string;
  apy: number;
  lockPeriod?: number; // in seconds
  isActive: boolean;
}

export interface StakingPosition {
  id: string;
  poolId: string;
  pool: StakingPool;
  userAddress: Address;
  stakedAmount: string;
  pendingRewards: { token: Token; amount: string }[];
  apy: number;
  lockedUntil?: Date;
  createdAt: Date;
}

// =============================================================================
// PRICE & MARKET DATA TYPES
// =============================================================================

export interface PriceData {
  tokenId: string;
  price: number;
  priceChange1h: number;
  priceChange24h: number;
  priceChange7d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number;
  lastUpdated: Date;
}

export interface ChartDataPoint {
  timestamp: Date;
  price: number;
  volume: number;
}

export interface MarketData {
  token: Token;
  price: PriceData;
  chartData: ChartDataPoint[];
  timeframe: '1h' | '24h' | '7d' | '30d' | '90d' | '1y';
}

// =============================================================================
// AI ASSISTANT TYPES
// =============================================================================

export interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: Token[];
    trades?: Trade[];
    analysis?: string;
  };
}

export interface AIAnalysis {
  id: string;
  type: 'portfolio' | 'market' | 'token' | 'risk';
  title: string;
  summary: string;
  insights: string[];
  recommendations: string[];
  confidence: number; // 0-1
  createdAt: Date;
}

export interface AIRecommendation {
  id: string;
  type: 'buy' | 'sell' | 'hold' | 'rebalance';
  token?: Token;
  action: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number;
  createdAt: Date;
}

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: 'price_alert' | 'trade_update' | 'portfolio_change' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface PriceAlert {
  id: string;
  userId: string;
  tokenId: string;
  token: Token;
  condition: 'above' | 'below' | 'change_percentage';
  value: number;
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// =============================================================================
// FORM & UI TYPES
// =============================================================================

export interface SwapFormData {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  slippage: number;
  autoSlippage: boolean;
}

export interface StakeFormData {
  pool: StakingPool;
  amount: string;
  lockPeriod?: number;
}

export interface AlertFormData {
  token: Token;
  condition: 'above' | 'below' | 'change_percentage';
  value: number;
}

// =============================================================================
// CHART & ANALYTICS TYPES
// =============================================================================

export interface ChartConfig {
  type: 'line' | 'area' | 'candlestick' | 'bar';
  timeframe: '1h' | '24h' | '7d' | '30d' | '90d' | '1y';
  showVolume: boolean;
  showMA: boolean;
  indicators: string[];
}

export interface AnalyticsMetrics {
  totalValue: number;
  totalPnl: number;
  totalPnlPercentage: number;
  bestPerformer: PortfolioPosition;
  worstPerformer: PortfolioPosition;
  diversificationScore: number;
  riskScore: number;
  sharpeRatio: number;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

export type ErrorCode =
  | 'WALLET_NOT_CONNECTED'
  | 'INSUFFICIENT_BALANCE'
  | 'SLIPPAGE_TOO_HIGH'
  | 'TRADE_FAILED'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type Status = 'idle' | 'loading' | 'success' | 'error';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface FilterConfig {
  search?: string;
  minValue?: number;
  maxValue?: number;
  protocols?: string[];
  verified?: boolean;
  tags?: string[];
}

// =============================================================================
// HOOK RETURN TYPES
// =============================================================================

export interface UseWalletReturn {
  address?: Address;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  chain?: { id: number; name: string };
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: number) => Promise<void>;
}

export interface UseTokenBalancesReturn {
  balances: TokenBalance[];
  totalValueUSD: number;
  isLoading: boolean;
  error?: Error;
  refetch: () => Promise<void>;
}

export interface UseSwapQuoteReturn {
  quote?: SwapQuote;
  isLoading: boolean;
  error?: Error;
  refetch: () => Promise<void>;
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children: React.ReactNode;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}
