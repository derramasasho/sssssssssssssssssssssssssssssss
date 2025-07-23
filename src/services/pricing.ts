import axios, { AxiosInstance } from 'axios';
import { PriceData, Token, MarketData, ChartDataPoint, ApiResponse } from '@/types';

// =============================================================================
// PRICE SERVICE INTERFACES
// =============================================================================

interface CoinGeckoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

interface CoinGeckoChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

// =============================================================================
// PRICING SERVICE CLASS
// =============================================================================

export class PricingService {
  private static instance: PricingService;
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private rateLimitTracker: Map<string, number[]> = new Map();

  private constructor() {
    this.client = axios.create({
      baseURL: 'https://api.coingecko.com/api/v3',
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        ...(process.env.NEXT_PUBLIC_COINGECKO_API_KEY && {
          'x-cg-pro-api-key': process.env.NEXT_PUBLIC_COINGECKO_API_KEY
        })
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('CoinGecko API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  static getInstance(): PricingService {
    if (!PricingService.instance) {
      PricingService.instance = new PricingService();
    }
    return PricingService.instance;
  }

  // ==========================================================================
  // RATE LIMITING
  // ==========================================================================

  private checkRateLimit(endpoint: string): void {
    const now = Date.now();
    const requests = this.rateLimitTracker.get(endpoint) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = requests.filter(timestamp => now - timestamp < 60000);
    
    // Free tier: 10-30 calls per minute depending on endpoint
    const limit = process.env.NEXT_PUBLIC_COINGECKO_API_KEY ? 500 : 10;
    
    if (recentRequests.length >= limit) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }
    
    recentRequests.push(now);
    this.rateLimitTracker.set(endpoint, recentRequests);
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
  // TOKEN ID RESOLUTION
  // ==========================================================================

  private readonly TOKEN_ID_MAP: Record<string, string> = {
    'ETH': 'ethereum',
    'BTC': 'bitcoin',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'DAI': 'dai',
    'UNI': 'uniswap',
    'LINK': 'chainlink',
    'AAVE': 'aave',
    'COMP': 'compound-governance-token',
    'SUSHI': 'sushi',
    'CRV': 'curve-dao-token',
    'SNX': 'havven',
    'MKR': 'maker',
    'WETH': 'weth',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'SOL': 'solana',
    'ADA': 'cardano',
    'DOT': 'polkadot',
    'ATOM': 'cosmos',
  };

  private getTokenId(tokenSymbol: string): string {
    return this.TOKEN_ID_MAP[tokenSymbol.toUpperCase()] || tokenSymbol.toLowerCase();
  }

  // ==========================================================================
  // PRICE DATA FETCHING
  // ==========================================================================

  async getTokenPrice(tokenSymbol: string): Promise<PriceData> {
    const tokenId = this.getTokenId(tokenSymbol);
    const cacheKey = `price_${tokenId}`;
    
    // Check cache first
    const cached = this.getCachedData<PriceData>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      this.checkRateLimit('coins');
      
      const response = await this.client.get(`/coins/${tokenId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false
        }
      });

      const coin = response.data;
      const marketData = coin.market_data;

      const priceData: PriceData = {
        tokenId,
        price: marketData.current_price?.usd || 0,
        priceChange1h: marketData.price_change_percentage_1h_in_currency?.usd || 0,
        priceChange24h: marketData.price_change_percentage_24h || 0,
        priceChange7d: marketData.price_change_percentage_7d || 0,
        marketCap: marketData.market_cap?.usd || 0,
        volume24h: marketData.total_volume?.usd || 0,
        circulatingSupply: marketData.circulating_supply || 0,
        totalSupply: marketData.total_supply || 0,
        lastUpdated: new Date(),
      };

      this.setCachedData(cacheKey, priceData);
      return priceData;
    } catch (error) {
      console.error(`Failed to fetch price for ${tokenSymbol}:`, error);
      throw new Error(`Unable to fetch price data for ${tokenSymbol}`);
    }
  }

  async getMultipleTokenPrices(tokenSymbols: string[]): Promise<Record<string, PriceData>> {
    const tokenIds = tokenSymbols.map(symbol => this.getTokenId(symbol));
    const cacheKey = `multi_price_${tokenIds.sort().join(',')}`;
    
    // Check cache first
    const cached = this.getCachedData<Record<string, PriceData>>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      this.checkRateLimit('coins/markets');
      
      const response = await this.client.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          ids: tokenIds.join(','),
          order: 'market_cap_desc',
          per_page: tokenIds.length,
          page: 1,
          sparkline: false,
          price_change_percentage: '1h,24h,7d'
        }
      });

      const coins: CoinGeckoPrice[] = response.data;
      const priceData: Record<string, PriceData> = {};

      for (const coin of coins) {
        const symbol = coin.symbol.toUpperCase();
        priceData[symbol] = {
          tokenId: coin.id,
          price: coin.current_price,
          priceChange1h: coin.price_change_percentage_24h || 0, // CoinGecko doesn't always provide 1h
          priceChange24h: coin.price_change_percentage_24h || 0,
          priceChange7d: coin.price_change_percentage_7d_in_currency || 0,
          marketCap: coin.market_cap || 0,
          volume24h: coin.total_volume || 0,
          circulatingSupply: coin.circulating_supply || 0,
          totalSupply: coin.total_supply || 0,
          lastUpdated: new Date(),
        };
      }

      this.setCachedData(cacheKey, priceData);
      return priceData;
    } catch (error) {
      console.error('Failed to fetch multiple token prices:', error);
      throw new Error('Unable to fetch multiple token prices');
    }
  }

  // ==========================================================================
  // CHART DATA
  // ==========================================================================

  async getTokenChart(
    tokenSymbol: string, 
    timeframe: '1h' | '24h' | '7d' | '30d' | '90d' | '1y'
  ): Promise<ChartDataPoint[]> {
    const tokenId = this.getTokenId(tokenSymbol);
    const cacheKey = `chart_${tokenId}_${timeframe}`;
    
    // Check cache first
    const cached = this.getCachedData<ChartDataPoint[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      this.checkRateLimit('coins/chart');
      
      const days = this.getChartDays(timeframe);
      const interval = this.getChartInterval(timeframe);
      
      const response = await this.client.get(`/coins/${tokenId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days,
          interval
        }
      });

      const chartData: CoinGeckoChart = response.data;
      
      const dataPoints: ChartDataPoint[] = chartData.prices.map(([timestamp, price], index) => ({
        timestamp: new Date(timestamp),
        price,
        volume: chartData.total_volumes[index]?.[1] || 0
      }));

      this.setCachedData(cacheKey, dataPoints);
      return dataPoints;
    } catch (error) {
      console.error(`Failed to fetch chart data for ${tokenSymbol}:`, error);
      throw new Error(`Unable to fetch chart data for ${tokenSymbol}`);
    }
  }

  private getChartDays(timeframe: string): string {
    switch (timeframe) {
      case '1h': return '1';
      case '24h': return '1';
      case '7d': return '7';
      case '30d': return '30';
      case '90d': return '90';
      case '1y': return '365';
      default: return '7';
    }
  }

  private getChartInterval(timeframe: string): string {
    switch (timeframe) {
      case '1h': return 'minutely';
      case '24h': return 'hourly';
      case '7d': return 'hourly';
      case '30d': return 'daily';
      case '90d': return 'daily';
      case '1y': return 'daily';
      default: return 'daily';
    }
  }

  // ==========================================================================
  // MARKET DATA
  // ==========================================================================

  async getMarketData(tokenSymbols: string[]): Promise<MarketData[]> {
    const priceData = await this.getMultipleTokenPrices(tokenSymbols);
    const marketData: MarketData[] = [];

    for (const symbol of tokenSymbols) {
      const price = priceData[symbol];
      if (!price) continue;

      try {
        const chartData = await this.getTokenChart(symbol, '7d');
        const token: Token = {
          id: price.tokenId,
          address: '0x0000000000000000000000000000000000000000' as any, // Will be resolved later
          symbol,
          name: symbol, // Will be resolved later
          decimals: 18,
          price: price.price,
          priceChange24h: price.priceChange24h,
          marketCap: price.marketCap,
          volume24h: price.volume24h,
          isVerified: true,
        };

        marketData.push({
          token,
          price,
          chartData,
          timeframe: '7d',
        });
      } catch (error) {
        console.warn(`Failed to get complete market data for ${symbol}:`, error);
      }
    }

    return marketData;
  }

  // ==========================================================================
  // TRENDING TOKENS
  // ==========================================================================

  async getTrendingTokens(): Promise<Token[]> {
    const cacheKey = 'trending_tokens';
    
    // Check cache first
    const cached = this.getCachedData<Token[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      this.checkRateLimit('search/trending');
      
      const response = await this.client.get('/search/trending');
      const trending = response.data.coins || [];

      const tokens: Token[] = trending.slice(0, 10).map((item: any) => ({
        id: item.item.id,
        address: '0x0000000000000000000000000000000000000000' as any,
        symbol: item.item.symbol,
        name: item.item.name,
        decimals: 18,
        logoURI: item.item.large,
        isVerified: true,
        tags: ['trending'],
      }));

      this.setCachedData(cacheKey, tokens);
      return tokens;
    } catch (error) {
      console.error('Failed to fetch trending tokens:', error);
      return [];
    }
  }

  // ==========================================================================
  // TOP TOKENS BY MARKET CAP
  // ==========================================================================

  async getTopTokens(limit: number = 50): Promise<Token[]> {
    const cacheKey = `top_tokens_${limit}`;
    
    // Check cache first
    const cached = this.getCachedData<Token[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      this.checkRateLimit('coins/markets');
      
      const response = await this.client.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        }
      });

      const coins: CoinGeckoPrice[] = response.data;
      
      const tokens: Token[] = coins.map(coin => ({
        id: coin.id,
        address: '0x0000000000000000000000000000000000000000' as any,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        decimals: 18,
        price: coin.current_price,
        priceChange24h: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
        isVerified: true,
        tags: ['top'],
      }));

      this.setCachedData(cacheKey, tokens);
      return tokens;
    } catch (error) {
      console.error('Failed to fetch top tokens:', error);
      return [];
    }
  }

  // ==========================================================================
  // SEARCH TOKENS
  // ==========================================================================

  async searchTokens(query: string): Promise<Token[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const cacheKey = `search_${query.toLowerCase()}`;
    
    // Check cache first
    const cached = this.getCachedData<Token[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      this.checkRateLimit('search');
      
      const response = await this.client.get('/search', {
        params: { query }
      });

      const results = response.data.coins || [];
      
      const tokens: Token[] = results.slice(0, 20).map((coin: any) => ({
        id: coin.id,
        address: '0x0000000000000000000000000000000000000000' as any,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        decimals: 18,
        logoURI: coin.large,
        isVerified: true,
      }));

      this.setCachedData(cacheKey, tokens);
      return tokens;
    } catch (error) {
      console.error('Failed to search tokens:', error);
      return [];
    }
  }

  // ==========================================================================
  // GLOBAL MARKET DATA
  // ==========================================================================

  async getGlobalMarketData(): Promise<{
    totalMarketCap: number;
    totalVolume: number;
    btcDominance: number;
    ethDominance: number;
    marketCapChange24h: number;
  }> {
    const cacheKey = 'global_market_data';
    
    // Check cache first
    const cached = this.getCachedData<any>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      this.checkRateLimit('global');
      
      const response = await this.client.get('/global');
      const data = response.data.data;

      const globalData = {
        totalMarketCap: data.total_market_cap?.usd || 0,
        totalVolume: data.total_volume?.usd || 0,
        btcDominance: data.market_cap_percentage?.btc || 0,
        ethDominance: data.market_cap_percentage?.eth || 0,
        marketCapChange24h: data.market_cap_change_percentage_24h_usd || 0,
      };

      this.setCachedData(cacheKey, globalData);
      return globalData;
    } catch (error) {
      console.error('Failed to fetch global market data:', error);
      throw new Error('Unable to fetch global market data');
    }
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
      const response = await this.client.get('/ping');
      return response.status === 200;
    } catch (error) {
      console.error('Pricing service health check failed:', error);
      return false;
    }
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const pricingService = PricingService.getInstance();