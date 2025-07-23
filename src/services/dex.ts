import axios, { AxiosInstance } from 'axios';
import { SwapQuote, Token, RouteStep, ApiResponse } from '@/types';
import { Address } from 'viem';

// =============================================================================
// DEX AGGREGATOR INTERFACES
// =============================================================================

interface OneInchQuote {
  fromToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI?: string;
  };
  toToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI?: string;
  };
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: Array<{
    name: string;
    part: number;
    fromTokenAddress: string;
    toTokenAddress: string;
  }>;
  estimatedGas: number;
}

// =============================================================================
// DEX SERVICE CLASS
// =============================================================================

export class DexService {
  private static instance: DexService;
  private oneInchClient: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds for quotes
  private readonly SUPPORTED_CHAIN_IDS = [1, 137, 56, 42161]; // Ethereum, Polygon, BSC, Arbitrum

  private constructor() {
    // 1inch API client
    this.oneInchClient = axios.create({
      baseURL: 'https://api.1inch.io/v5.0',
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        ...(process.env.NEXT_PUBLIC_1INCH_API_KEY && {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`,
        }),
      },
    });

    this.setupInterceptors();
  }

  static getInstance(): DexService {
    if (!DexService.instance) {
      DexService.instance = new DexService();
    }
    return DexService.instance;
  }

  private setupInterceptors(): void {
    this.oneInchClient.interceptors.response.use(
      response => response,
      error => {
        console.error(
          '1inch API Error:',
          error.response?.data || error.message
        );
        throw error;
      }
    );
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
  // TOKEN LISTS
  // ==========================================================================

  async getSupportedTokens(chainId: number = 1): Promise<Token[]> {
    if (!this.SUPPORTED_CHAIN_IDS.includes(chainId)) {
      throw new Error(`Chain ID ${chainId} not supported`);
    }

    const cacheKey = `tokens_${chainId}`;
    const cached = this.getCachedData<Token[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.oneInchClient.get(`/${chainId}/tokens`);
      const tokens: Token[] = Object.values(response.data.tokens).map(
        (token: any) => ({
          id: token.address.toLowerCase(),
          address: token.address as Address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURI: token.logoURI,
          isVerified: true,
        })
      );

      this.setCachedData(cacheKey, tokens);
      return tokens;
    } catch (error) {
      console.error(
        `Failed to fetch supported tokens for chain ${chainId}:`,
        error
      );
      return [];
    }
  }

  // ==========================================================================
  // SWAP QUOTE FETCHING
  // ==========================================================================

  async getSwapQuote(
    fromToken: Token,
    toToken: Token,
    amount: string,
    slippage: number = 1,
    chainId: number = 1
  ): Promise<SwapQuote[]> {
    if (!this.SUPPORTED_CHAIN_IDS.includes(chainId)) {
      throw new Error(`Chain ID ${chainId} not supported`);
    }

    const cacheKey = `quote_${fromToken.address}_${toToken.address}_${amount}_${slippage}_${chainId}`;

    // Check cache first
    const cached = this.getCachedData<SwapQuote[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const quotes: SwapQuote[] = [];

    try {
      const oneInchQuote = await this.get1InchQuote(
        fromToken,
        toToken,
        amount,
        slippage,
        chainId
      );
      if (oneInchQuote) {
        quotes.push(oneInchQuote);
      }

      // Sort by best price (highest output amount)
      quotes.sort((a, b) => parseFloat(b.toAmount) - parseFloat(a.toAmount));

      this.setCachedData(cacheKey, quotes);
      return quotes;
    } catch (error) {
      console.error('Failed to fetch swap quotes:', error);
      throw new Error('Unable to fetch swap quotes');
    }
  }

  // ==========================================================================
  // 1INCH INTEGRATION
  // ==========================================================================

  private async get1InchQuote(
    fromToken: Token,
    toToken: Token,
    amount: string,
    slippage: number,
    chainId: number
  ): Promise<SwapQuote | null> {
    try {
      const response = await this.oneInchClient.get(`/${chainId}/quote`, {
        params: {
          fromTokenAddress: fromToken.address,
          toTokenAddress: toToken.address,
          amount: this.parseTokenAmount(amount, fromToken.decimals),
          fee: 0,
          gasLimit: 750000,
          connectorTokens: this.getConnectorTokens(chainId),
          complexityLevel: 3,
          mainRouteParts: 10,
          parts: 50,
        },
      });

      const quote: OneInchQuote = response.data;

      const routes: RouteStep[] = quote.protocols.map(protocol => ({
        protocol: protocol.name,
        poolAddress: protocol.fromTokenAddress as Address,
        percentage: protocol.part,
        tokenIn: fromToken,
        tokenOut: toToken,
      }));

      const priceImpact = this.calculatePriceImpact(
        parseFloat(amount),
        parseFloat(
          this.formatTokenAmount(quote.toTokenAmount, toToken.decimals)
        )
      );

      return {
        id: `1inch_${Date.now()}`,
        fromToken,
        toToken,
        fromAmount: amount,
        toAmount: this.formatTokenAmount(quote.toTokenAmount, toToken.decimals),
        price: parseFloat(quote.toTokenAmount) / parseFloat(amount),
        priceImpact,
        gasEstimate: quote.estimatedGas.toString(),
        route: routes,
        aggregator: '1inch',
        slippage,
        validUntil: new Date(Date.now() + 30000), // 30 seconds
      };
    } catch (error) {
      console.warn('1inch quote failed:', error);
      return null;
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  private parseTokenAmount(amount: string, decimals: number): string {
    const num = parseFloat(amount);
    return (num * Math.pow(10, decimals)).toString();
  }

  private formatTokenAmount(amount: string, decimals: number): string {
    const num = parseFloat(amount);
    return (num / Math.pow(10, decimals)).toString();
  }

  private calculatePriceImpact(
    inputAmount: number,
    outputAmount: number
  ): number {
    // Simplified price impact calculation
    let impact = 0.3;

    if (inputAmount > 1000) impact += 0.2;
    if (inputAmount > 10000) impact += 0.5;
    if (inputAmount > 100000) impact += 1.0;

    return Math.min(impact, 15); // Cap at 15%
  }

  private getConnectorTokens(chainId: number): string {
    const connectors: Record<number, string[]> = {
      1: [
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        '0xA0b86a33E6441e17b5B8aBA5B40Cc0e30Eda1b9B', // USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
      ],
      137: [
        '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
        '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
      ],
    };

    return (connectors[chainId] || connectors[1] || []).join(',');
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const dexService = DexService.getInstance();
