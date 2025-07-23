import { PublicClient, Address, formatUnits } from 'viem';
import { mainnet } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import {
  Portfolio,
  PortfolioPosition,
  Token,
  TokenBalance,
  PerformanceDataPoint,
  PriceData,
} from '@/types';
import { pricingService } from './pricing';
import { POPULAR_TOKENS } from '@/lib/constants';

// =============================================================================
// ERC20 ABI
// =============================================================================

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const;

// =============================================================================
// PORTFOLIO SERVICE CLASS
// =============================================================================

export class PortfolioService {
  private static instance: PortfolioService;
  private clients: Map<number, PublicClient> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60 * 1000; // 1 minute

  private constructor() {
    this.initializeClients();
  }

  static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  private initializeClients(): void {
    // Ethereum mainnet
    this.clients.set(
      1,
      createPublicClient({
        chain: mainnet,
        transport: http(this.getRpcUrl(1)),
      })
    );

    // Add more chains as needed
    // Polygon, Arbitrum, etc.
  }

  private getRpcUrl(chainId: number): string {
    const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

    switch (chainId) {
      case 1: // Ethereum
        return alchemyKey
          ? `https://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`
          : 'https://ethereum.publicnode.com';
      case 137: // Polygon
        return alchemyKey
          ? `https://polygon-mainnet.alchemyapi.io/v2/${alchemyKey}`
          : 'https://polygon.publicnode.com';
      case 42161: // Arbitrum
        return alchemyKey
          ? `https://arb-mainnet.alchemyapi.io/v2/${alchemyKey}`
          : 'https://arbitrum.publicnode.com';
      default:
        return 'https://ethereum.publicnode.com';
    }
  }

  // ==========================================================================
  // CACHE MANAGEMENT
  // ==========================================================================

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // ==========================================================================
  // TOKEN BALANCE FETCHING
  // ==========================================================================

  async getTokenBalances(
    address: Address,
    tokens: Token[],
    chainId: number = 1
  ): Promise<TokenBalance[]> {
    const cacheKey = `balances_${address}_${chainId}`;

    // Check cache first
    const cached = this.getCachedData<TokenBalance[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const client = this.clients.get(chainId);
    if (!client) {
      throw new Error(`No client configured for chain ${chainId}`);
    }

    const balances: TokenBalance[] = [];

    try {
      // Get native token balance (ETH, MATIC, etc.)
      const nativeBalance = await client.getBalance({ address });
      const nativeToken = this.getNativeToken(chainId);

      if (nativeToken) {
        const formattedBalance = formatUnits(
          nativeBalance,
          nativeToken.decimals
        );
        const priceData = await this.getTokenPrice(nativeToken.symbol);

        balances.push({
          token: nativeToken,
          balance: nativeBalance.toString(),
          balanceFormatted: formattedBalance,
          balanceUSD: parseFloat(formattedBalance) * (priceData?.price || 0),
          price: priceData?.price || 0,
          priceChange24h: priceData?.priceChange24h || 0,
        });
      }

      // Get ERC20 token balances
      const erc20Balances = await Promise.allSettled(
        tokens
          .filter(
            token =>
              token.address !== '0x0000000000000000000000000000000000000000'
          )
          .map(async token => {
            try {
              const balance = await client.readContract({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [address],
              });

              const formattedBalance = formatUnits(
                balance as bigint,
                token.decimals
              );
              const balanceNum = parseFloat(formattedBalance);

              // Only include tokens with non-zero balance
              if (balanceNum > 0) {
                const priceData = await this.getTokenPrice(token.symbol);

                return {
                  token,
                  balance: (balance as bigint).toString(),
                  balanceFormatted: formattedBalance,
                  balanceUSD: balanceNum * (priceData?.price || 0),
                  price: priceData?.price || 0,
                  priceChange24h: priceData?.priceChange24h || 0,
                };
              }
              return null;
            } catch (error) {
              console.warn(
                `Failed to fetch balance for ${token.symbol}:`,
                error
              );
              return null;
            }
          })
      );

      // Add successful ERC20 balances
      erc20Balances.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          balances.push(result.value);
        }
      });

      // Sort by USD value
      balances.sort((a, b) => b.balanceUSD - a.balanceUSD);

      this.setCachedData(cacheKey, balances);
      return balances;
    } catch (error) {
      console.error('Failed to fetch token balances:', error);
      throw new Error('Unable to fetch portfolio balances');
    }
  }

  // ==========================================================================
  // PORTFOLIO CONSTRUCTION
  // ==========================================================================

  async getPortfolio(
    address: Address,
    chainId: number = 1
  ): Promise<Portfolio> {
    const cacheKey = `portfolio_${address}_${chainId}`;

    // Check cache first
    const cached = this.getCachedData<Portfolio>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get default token list
      const tokens = Object.values(POPULAR_TOKENS);

      // Fetch current balances
      const balances = await this.getTokenBalances(address, tokens, chainId);

      // Convert balances to positions
      const positions: PortfolioPosition[] = balances
        .filter(balance => balance.balanceUSD > 0.01) // Filter dust
        .map(balance => this.createPortfolioPosition(balance));

      // Calculate totals
      const totalValueUSD = positions.reduce(
        (sum, pos) => sum + pos.balanceUSD,
        0
      );

      // Calculate allocations
      positions.forEach(position => {
        position.allocation =
          totalValueUSD > 0 ? (position.balanceUSD / totalValueUSD) * 100 : 0;
      });

      // Get historical performance (simplified - in production you'd store this)
      const performanceHistory = await this.getPerformanceHistory(
        address,
        chainId
      );

      // Calculate PnL (simplified - would need historical cost basis)
      const totalPnlUSD = this.calculateTotalPnL(positions);
      const totalPnlPercentage =
        totalValueUSD > 0 ? (totalPnlUSD / totalValueUSD) * 100 : 0;

      const portfolio: Portfolio = {
        id: `portfolio_${address}_${chainId}`,
        userId: address,
        totalValueUSD,
        totalPnlUSD,
        totalPnlPercentage,
        positions,
        performanceHistory,
        lastUpdated: new Date(),
      };

      this.setCachedData(cacheKey, portfolio);
      return portfolio;
    } catch (error) {
      console.error('Failed to construct portfolio:', error);
      throw new Error('Unable to construct portfolio');
    }
  }

  // ==========================================================================
  // PORTFOLIO ANALYTICS
  // ==========================================================================

  calculatePortfolioMetrics(portfolio: Portfolio): {
    diversificationScore: number;
    riskScore: number;
    largestPosition: PortfolioPosition | null;
    volatility: number;
  } {
    const { positions } = portfolio;

    if (positions.length === 0) {
      return {
        diversificationScore: 0,
        riskScore: 0,
        largestPosition: null,
        volatility: 0,
      };
    }

    // Diversification score (0-100, higher is better)
    const largestAllocation = Math.max(...positions.map(p => p.allocation));
    const diversificationScore = Math.max(0, 100 - largestAllocation);

    // Find largest position
    const largestPosition = positions.reduce((largest, current) =>
      current.balanceUSD > largest.balanceUSD ? current : largest
    );

    // Calculate volatility based on price changes
    const avgVolatility = positions.reduce((sum, pos) => {
      const priceChange = Math.abs(pos.token.priceChange24h || 0);
      return sum + priceChange * (pos.allocation / 100);
    }, 0);

    // Risk score (0-100, higher is riskier)
    const riskScore = Math.min(
      100,
      avgVolatility * 2 + (100 - diversificationScore) * 0.3
    );

    return {
      diversificationScore,
      riskScore,
      largestPosition,
      volatility: avgVolatility,
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private async getTokenPrice(symbol: string): Promise<PriceData | null> {
    try {
      return await pricingService.getTokenPrice(symbol);
    } catch (error) {
      console.warn(`Failed to get price for ${symbol}:`, error);
      return null;
    }
  }

  private getNativeToken(chainId: number): Token | null {
    switch (chainId) {
      case 1:
        return POPULAR_TOKENS.ETH || null;
      case 137:
        return {
          id: 'matic',
          address: '0x0000000000000000000000000000000000000000' as Address,
          symbol: 'MATIC',
          name: 'Polygon',
          decimals: 18,
          logoURI: '',
          isVerified: true,
        };
      case 42161:
        return POPULAR_TOKENS.ETH || null; // Arbitrum uses ETH
      default:
        return POPULAR_TOKENS.ETH || null;
    }
  }

  private createPortfolioPosition(balance: TokenBalance): PortfolioPosition {
    // Simplified PnL calculation - in production you'd need historical cost basis
    const mockEntryPrice = (balance.price || 0) * 0.9; // Assume 10% profit for demo
    const currentPrice = balance.price || 0;
    const pnl =
      currentPrice > 0 && mockEntryPrice > 0
        ? (currentPrice - mockEntryPrice) * parseFloat(balance.balanceFormatted)
        : 0;
    const pnlPercentage =
      mockEntryPrice > 0
        ? ((currentPrice - mockEntryPrice) / mockEntryPrice) * 100
        : 0;

    return {
      id: `position_${balance.token.address}`,
      token: balance.token,
      balance: balance.balance,
      balanceUSD: balance.balanceUSD,
      entryPrice: mockEntryPrice,
      currentPrice,
      pnl,
      pnlPercentage,
      allocation: 0, // Will be calculated later
      lastUpdated: new Date(),
    };
  }

  private calculateTotalPnL(positions: PortfolioPosition[]): number {
    return positions.reduce((sum, pos) => sum + (pos.pnl || 0), 0);
  }

  private async getPerformanceHistory(
    address: Address,
    chainId: number
  ): Promise<PerformanceDataPoint[]> {
    // In production, you'd fetch historical data from your database
    // For now, generate mock historical data
    const history: PerformanceDataPoint[] = [];
    const now = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const baseValue = 10000; // Mock starting value
      const randomChange = (Math.random() - 0.5) * 1000;
      const totalValueUSD = baseValue + randomChange;
      const pnlUSD = totalValueUSD - baseValue;
      const pnlPercentage = (pnlUSD / baseValue) * 100;

      history.push({
        timestamp: date,
        totalValueUSD,
        pnlUSD,
        pnlPercentage,
      });
    }

    return history;
  }

  // ==========================================================================
  // REAL-TIME UPDATES
  // ==========================================================================

  async refreshPortfolio(
    address: Address,
    chainId: number = 1
  ): Promise<Portfolio> {
    // Clear cache to force fresh data
    const cacheKey = `portfolio_${address}_${chainId}`;
    this.cache.delete(cacheKey);
    this.cache.delete(`balances_${address}_${chainId}`);

    return this.getPortfolio(address, chainId);
  }

  // ==========================================================================
  // DEFI PROTOCOL INTEGRATION
  // ==========================================================================

  async getDeFiPositions(
    address: Address,
    chainId: number = 1
  ): Promise<{
    lending: PortfolioPosition[];
    liquidity: PortfolioPosition[];
    staking: PortfolioPosition[];
  }> {
    // This would integrate with various DeFi protocols
    // For now, return empty arrays
    return {
      lending: [],
      liquidity: [],
      staking: [],
    };
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const client = this.clients.get(1);
      if (!client) return false;

      const blockNumber = await client.getBlockNumber();
      return blockNumber > 0;
    } catch (error) {
      console.error('Portfolio service health check failed:', error);
      return false;
    }
  }
}

// =============================================================================
// PORTFOLIO CALCULATION UTILITIES
// =============================================================================

export function calculatePositionPnL(
  currentPrice: number,
  entryPrice: number,
  quantity: number
): { pnl: number; pnlPercentage: number } {
  if (entryPrice <= 0) {
    return { pnl: 0, pnlPercentage: 0 };
  }

  const pnl = (currentPrice - entryPrice) * quantity;
  const pnlPercentage = ((currentPrice - entryPrice) / entryPrice) * 100;

  return { pnl, pnlPercentage };
}

export function calculatePortfolioDiversification(
  positions: PortfolioPosition[]
): {
  score: number;
  breakdown: { protocol: string; allocation: number }[];
} {
  if (positions.length === 0) {
    return { score: 0, breakdown: [] };
  }

  // Group by protocol/category
  const protocolAllocations: Record<string, number> = {};

  positions.forEach(position => {
    const protocol = position.token.tags?.[0] || 'other';
    protocolAllocations[protocol] =
      (protocolAllocations[protocol] || 0) + position.allocation;
  });

  const breakdown = Object.entries(protocolAllocations).map(
    ([protocol, allocation]) => ({
      protocol,
      allocation,
    })
  );

  // Calculate Herfindahl-Hirschman Index for diversification
  const hhi = Object.values(protocolAllocations).reduce(
    (sum, allocation) => sum + Math.pow(allocation, 2),
    0
  );

  // Convert to 0-100 score (higher is more diversified)
  const score = Math.max(0, 100 - hhi / 100);

  return { score, breakdown };
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const portfolioService = PortfolioService.getInstance();
