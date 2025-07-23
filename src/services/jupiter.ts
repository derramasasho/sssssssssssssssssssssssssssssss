import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import axios, { AxiosInstance } from 'axios';
import { SwapQuote, Token, RouteStep } from '@/types';

// =============================================================================
// JUPITER API INTERFACES
// =============================================================================

interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: {
    amount: string;
    feeBps: number;
  };
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot: number;
  timeTaken: number;
}

interface JupiterSwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

interface JupiterToken {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
  verified?: boolean;
  daily_volume?: number;
}

// =============================================================================
// JUPITER SERVICE CLASS
// =============================================================================

export class JupiterService {
  private static instance: JupiterService;
  private client: AxiosInstance;
  private connection: Connection;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds for quotes
  private readonly TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for token lists

  private constructor() {
    this.client = axios.create({
      baseURL: 'https://quote-api.jup.ag/v6',
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    // Initialize Solana connection
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');

    this.setupInterceptors();
  }

  static getInstance(): JupiterService {
    if (!JupiterService.instance) {
      JupiterService.instance = new JupiterService();
    }
    return JupiterService.instance;
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('Jupiter API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // ==========================================================================
  // CACHE MANAGEMENT
  // ==========================================================================

  private getCachedData<T>(key: string, duration: number = this.CACHE_DURATION): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < duration) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // ==========================================================================
  // TOKEN MANAGEMENT
  // ==========================================================================

  async getAllTokens(): Promise<Token[]> {
    const cacheKey = 'jupiter_tokens';
    
    // Check cache first
    const cached = this.getCachedData<Token[]>(cacheKey, this.TOKEN_CACHE_DURATION);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.client.get('/tokens');
      const jupiterTokens: JupiterToken[] = response.data;
      
      const tokens: Token[] = jupiterTokens
        .filter(token => token.verified !== false) // Only include verified tokens
        .map(token => ({
          id: token.address,
          address: token.address as any,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURI: token.logoURI,
          isVerified: token.verified !== false,
          tags: token.tags || ['solana'],
          volume24h: token.daily_volume,
        }));

      this.setCachedData(cacheKey, tokens);
      return tokens;
    } catch (error) {
      console.error('Failed to fetch Jupiter tokens:', error);
      return this.getFallbackSolanaTokens();
    }
  }

  async getPopularTokens(): Promise<Token[]> {
    const allTokens = await this.getAllTokens();
    
    // Filter for most popular Solana tokens
    const popularMints = [
      'So11111111111111111111111111111111111111112', // SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // Bonk
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
      'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',  // SRM
      'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac',  // MNGO
      'So11111111111111111111111111111111111111112', // Wrapped SOL
    ];

    return allTokens.filter(token => 
      popularMints.includes(token.address) || 
      token.volume24h && token.volume24h > 100000 // High volume tokens
    ).slice(0, 50);
  }

  // ==========================================================================
  // QUOTE FETCHING
  // ==========================================================================

  async getSwapQuote(
    fromToken: Token,
    toToken: Token,
    amount: string,
    slippage: number = 1
  ): Promise<SwapQuote[]> {
    const cacheKey = `jupiter_quote_${fromToken.address}_${toToken.address}_${amount}_${slippage}`;
    
    // Check cache first
    const cached = this.getCachedData<SwapQuote[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const amountInSmallestUnit = this.parseTokenAmount(amount, fromToken.decimals);
      const slippageBps = Math.floor(slippage * 100); // Convert percentage to basis points

      const response = await this.client.get('/quote', {
        params: {
          inputMint: fromToken.address,
          outputMint: toToken.address,
          amount: amountInSmallestUnit,
          slippageBps,
          swapMode: 'ExactIn',
          onlyDirectRoutes: false,
          asLegacyTransaction: false,
        }
      });

      const jupiterQuote: JupiterQuoteResponse = response.data;
      
      // Convert Jupiter route to our RouteStep format
      const routes: RouteStep[] = jupiterQuote.routePlan.map(step => ({
        protocol: step.swapInfo.label,
        poolAddress: step.swapInfo.ammKey as any,
        percentage: step.percent,
        tokenIn: fromToken,
        tokenOut: toToken,
      }));

      const outputAmount = this.formatTokenAmount(jupiterQuote.outAmount, toToken.decimals);
      const priceImpact = parseFloat(jupiterQuote.priceImpactPct);

      const quote: SwapQuote = {
        id: `jupiter_${Date.now()}`,
        fromToken,
        toToken,
        fromAmount: amount,
        toAmount: outputAmount,
        price: parseFloat(outputAmount) / parseFloat(amount),
        priceImpact,
        gasEstimate: jupiterQuote.platformFee?.amount || '0',
        route: routes,
        aggregator: 'Jupiter',
        slippage,
        validUntil: new Date(Date.now() + 30000), // 30 seconds
        raw: jupiterQuote, // Store raw response for swap execution
      };

      const quotes = [quote];
      this.setCachedData(cacheKey, quotes);
      return quotes;
    } catch (error) {
      console.error('Failed to fetch Jupiter quote:', error);
      throw new Error('Unable to fetch Jupiter swap quote');
    }
  }

  // ==========================================================================
  // SWAP EXECUTION
  // ==========================================================================

  async executeSwap(
    quote: SwapQuote,
    userPublicKey: PublicKey,
    priorityFee?: number
  ): Promise<string> {
    if (!quote.raw || quote.aggregator !== 'Jupiter') {
      throw new Error('Invalid quote for Jupiter swap execution');
    }

    try {
      const swapResponse = await this.client.post('/swap', {
        quoteResponse: quote.raw,
        userPublicKey: userPublicKey.toString(),
        wrapAndUnwrapSol: true,
        useSharedAccounts: true,
        feeAccount: process.env.NEXT_PUBLIC_FEE_ACCOUNT || undefined,
        trackingAccount: process.env.NEXT_PUBLIC_TRACKING_ACCOUNT || undefined,
        ...(priorityFee && { prioritizationFeeLamports: priorityFee }),
      });

      const { swapTransaction }: JupiterSwapResponse = swapResponse.data;
      
      // The swapTransaction is base64 encoded
      return swapTransaction;
    } catch (error) {
      console.error('Failed to execute Jupiter swap:', error);
      throw new Error('Unable to execute swap transaction');
    }
  }

  // ==========================================================================
  // SOLANA WALLET INTEGRATION
  // ==========================================================================

  async getSolanaTokenBalances(walletAddress: PublicKey): Promise<{
    sol: number;
    tokens: Array<{
      mint: string;
      amount: number;
      decimals: number;
      uiAmount: number;
    }>;
  }> {
    const cacheKey = `solana_balances_${walletAddress.toString()}`;
    
    // Check cache first
    const cached = this.getCachedData<any>(cacheKey, 60000); // 1 minute cache
    if (cached) {
      return cached;
    }

    try {
      // Get SOL balance
      const solBalance = await this.connection.getBalance(walletAddress);
      const solBalanceFormatted = solBalance / 1e9; // Convert lamports to SOL

      // Get SPL token accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        walletAddress,
        { programId: TOKEN_PROGRAM_ID }
      );

      const tokens = tokenAccounts.value
        .map(account => {
          const parsedInfo = account.account.data.parsed.info;
          return {
            mint: parsedInfo.mint,
            amount: parseInt(parsedInfo.tokenAmount.amount),
            decimals: parsedInfo.tokenAmount.decimals,
            uiAmount: parsedInfo.tokenAmount.uiAmount || 0,
          };
        })
        .filter(token => token.uiAmount > 0); // Only non-zero balances

      const result = {
        sol: solBalanceFormatted,
        tokens,
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to fetch Solana balances:', error);
      throw new Error('Unable to fetch Solana wallet balances');
    }
  }

  async getTokenMetadata(mintAddress: string): Promise<Token | null> {
    const cacheKey = `token_metadata_${mintAddress}`;
    
    const cached = this.getCachedData<Token>(cacheKey, this.TOKEN_CACHE_DURATION);
    if (cached) {
      return cached;
    }

    try {
      // Try to get from our token list first
      const allTokens = await this.getAllTokens();
      const token = allTokens.find(t => t.address === mintAddress);
      
      if (token) {
        this.setCachedData(cacheKey, token);
        return token;
      }

      // If not found, create basic token info
      const basicToken: Token = {
        id: mintAddress,
        address: mintAddress as any,
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 6, // Default for most SPL tokens
        isVerified: false,
        tags: ['solana'],
      };

      this.setCachedData(cacheKey, basicToken);
      return basicToken;
    } catch (error) {
      console.error('Failed to fetch token metadata:', error);
      return null;
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  private parseTokenAmount(amount: string, decimals: number): string {
    const num = parseFloat(amount);
    return Math.floor(num * Math.pow(10, decimals)).toString();
  }

  private formatTokenAmount(amount: string, decimals: number): string {
    const num = parseFloat(amount);
    return (num / Math.pow(10, decimals)).toString();
  }

  private getFallbackSolanaTokens(): Token[] {
    return [
      {
        id: 'solana',
        address: 'So11111111111111111111111111111111111111112' as any,
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        isVerified: true,
        tags: ['solana', 'native'],
      },
      {
        id: 'usd-coin',
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' as any,
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        isVerified: true,
        tags: ['solana', 'stablecoin'],
      },
      {
        id: 'tether',
        address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' as any,
        symbol: 'USDT',
        name: 'Tether',
        decimals: 6,
        isVerified: true,
        tags: ['solana', 'stablecoin'],
      },
    ];
  }

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  async healthCheck(): Promise<{
    api: boolean;
    rpc: boolean;
    overall: boolean;
  }> {
    const checks = await Promise.allSettled([
      this.client.get('/tokens').then(() => true).catch(() => false),
      this.connection.getSlot().then(() => true).catch(() => false),
    ]);

    const api = checks[0].status === 'fulfilled' ? checks[0].value : false;
    const rpc = checks[1].status === 'fulfilled' ? checks[1].value : false;

    return {
      api,
      rpc,
      overall: api && rpc,
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  getConnection(): Connection {
    return this.connection;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function calculateMinimumReceivedSolana(quote: SwapQuote, userSlippage?: number): string {
  const slippage = userSlippage || quote.slippage;
  const outputAmount = parseFloat(quote.toAmount);
  const slippageMultiplier = 1 - (slippage / 100);
  return (outputAmount * slippageMultiplier).toString();
}

export function isValidSolanaMint(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const jupiterService = JupiterService.getInstance();