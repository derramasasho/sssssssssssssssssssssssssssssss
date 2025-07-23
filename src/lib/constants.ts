import { Token } from '@/types';
import { Address } from 'viem';

// =============================================================================
// BLOCKCHAIN NETWORKS
// =============================================================================

export const SUPPORTED_CHAINS = {
  ETHEREUM: {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/',
    blockExplorer: 'https://etherscan.io',
    coingeckoId: 'ethereum',
    logo: '/images/chains/ethereum.png'
  },
  POLYGON: {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-mainnet.alchemyapi.io/v2/',
    blockExplorer: 'https://polygonscan.com',
    coingeckoId: 'polygon-pos',
    logo: '/images/chains/polygon.png'
  },
  BSC: {
    id: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com',
    coingeckoId: 'binancecoin',
    logo: '/images/chains/bsc.png'
  },
  ARBITRUM: {
    id: 42161,
    name: 'Arbitrum',
    symbol: 'ETH',
    rpcUrl: 'https://arb-mainnet.alchemyapi.io/v2/',
    blockExplorer: 'https://arbiscan.io',
    coingeckoId: 'ethereum',
    logo: '/images/chains/arbitrum.png'
  }
} as const;

export const DEFAULT_CHAIN = SUPPORTED_CHAINS.ETHEREUM;

// =============================================================================
// POPULAR TOKENS
// =============================================================================

export const POPULAR_TOKENS: Record<string, Token> = {
  // Ethereum Mainnet
  ETH: {
    id: 'ethereum',
    address: '0x0000000000000000000000000000000000000000' as Address,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    isVerified: true,
    tags: ['native', 'layer1']
  },
  WETH: {
    id: 'weth',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address,
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
    isVerified: true,
    tags: ['wrapped', 'defi']
  },
  USDC: {
    id: 'usd-coin',
    address: '0xA0b86a33E6441e17b5B8aBA5B40Cc0e30Eda1b9B' as Address,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    isVerified: true,
    tags: ['stablecoin', 'fiat']
  },
  USDT: {
    id: 'tether',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png',
    isVerified: true,
    tags: ['stablecoin', 'fiat']
  },
  DAI: {
    id: 'dai',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' as Address,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
    isVerified: true,
    tags: ['stablecoin', 'defi']
  },
  UNI: {
    id: 'uniswap',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' as Address,
    symbol: 'UNI',
    name: 'Uniswap',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
    isVerified: true,
    tags: ['governance', 'dex']
  },
  LINK: {
    id: 'chainlink',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' as Address,
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    isVerified: true,
    tags: ['oracle', 'infrastructure']
  },
  AAVE: {
    id: 'aave',
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9' as Address,
    symbol: 'AAVE',
    name: 'Aave',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',
    isVerified: true,
    tags: ['lending', 'governance']
  },
  COMP: {
    id: 'compound-governance-token',
    address: '0xc00e94Cb662C3520282E6f5717214004A7f26888' as Address,
    symbol: 'COMP',
    name: 'Compound',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/10775/small/COMP.png',
    isVerified: true,
    tags: ['lending', 'governance']
  }
};

// =============================================================================
// DEX AGGREGATORS
// =============================================================================

export const DEX_AGGREGATORS = {
  UNISWAP: {
    name: 'Uniswap',
    logo: '/images/dex/uniswap.png',
    url: 'https://uniswap.org',
    protocols: ['Uniswap V2', 'Uniswap V3']
  },
  SUSHISWAP: {
    name: 'SushiSwap',
    logo: '/images/dex/sushiswap.png',
    url: 'https://sushi.com',
    protocols: ['SushiSwap']
  },
  '1INCH': {
    name: '1inch',
    logo: '/images/dex/1inch.png',
    url: 'https://1inch.io',
    protocols: ['1inch Aggregator']
  },
  CURVE: {
    name: 'Curve',
    logo: '/images/dex/curve.png',
    url: 'https://curve.fi',
    protocols: ['Curve']
  },
  BALANCER: {
    name: 'Balancer',
    logo: '/images/dex/balancer.png',
    url: 'https://balancer.fi',
    protocols: ['Balancer V1', 'Balancer V2']
  }
} as const;

// =============================================================================
// DEFI PROTOCOLS
// =============================================================================

export const DEFI_PROTOCOLS = {
  LENDING: {
    AAVE: {
      name: 'Aave',
      logo: '/images/protocols/aave.png',
      url: 'https://aave.com',
      category: 'lending',
      description: 'Decentralized lending and borrowing protocol'
    },
    COMPOUND: {
      name: 'Compound',
      logo: '/images/protocols/compound.png',
      url: 'https://compound.finance',
      category: 'lending',
      description: 'Algorithmic money market protocol'
    },
    MAKER: {
      name: 'MakerDAO',
      logo: '/images/protocols/maker.png',
      url: 'https://makerdao.com',
      category: 'lending',
      description: 'Decentralized credit platform'
    }
  },
  YIELD_FARMING: {
    YEARN: {
      name: 'Yearn Finance',
      logo: '/images/protocols/yearn.png',
      url: 'https://yearn.finance',
      category: 'yield',
      description: 'Yield optimization protocol'
    },
    CONVEX: {
      name: 'Convex Finance',
      logo: '/images/protocols/convex.png',
      url: 'https://convexfinance.com',
      category: 'yield',
      description: 'Curve yield booster'
    }
  },
  INSURANCE: {
    NEXUS: {
      name: 'Nexus Mutual',
      logo: '/images/protocols/nexus.png',
      url: 'https://nexusmutual.io',
      category: 'insurance',
      description: 'Decentralized insurance platform'
    }
  }
} as const;

// =============================================================================
// CONFIGURATION
// =============================================================================

export const APP_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3
  },
  
  // Trading Configuration
  TRADING: {
    DEFAULT_SLIPPAGE: 0.5, // 0.5%
    MAX_SLIPPAGE: 50, // 50%
    MIN_SLIPPAGE: 0.1, // 0.1%
    SLIPPAGE_OPTIONS: [0.1, 0.5, 1, 3, 5],
    GAS_LIMIT_BUFFER: 1.2 // 20% buffer
  },
  
  // UI Configuration
  UI: {
    ANIMATION_DURATION: 200,
    TOAST_DURATION: 4000,
    POLLING_INTERVAL: 30000, // 30 seconds
    CHART_UPDATE_INTERVAL: 60000, // 1 minute
    MAX_RECENT_TOKENS: 10,
    ITEMS_PER_PAGE: 20
  },
  
  // Price Configuration
  PRICE: {
    UPDATE_INTERVAL: 60000, // 1 minute
    CACHE_DURATION: 300000, // 5 minutes
    SIGNIFICANT_CHANGE_THRESHOLD: 5 // 5%
  },
  
  // AI Configuration
  AI: {
    MAX_MESSAGES: 50,
    ANALYSIS_COOLDOWN: 300000, // 5 minutes
    RECOMMENDATION_LIMIT: 5
  }
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const FEATURES = {
  AI_ASSISTANT: process.env.NEXT_PUBLIC_ENABLE_AI_ASSISTANT === 'true',
  ADVANCED_CHARTS: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_CHARTS === 'true',
  SOCIAL_FEATURES: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES === 'true',
  NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  DARK_MODE: true,
  PORTFOLIO_TRACKING: true,
  PRICE_ALERTS: true,
  YIELD_FARMING: true,
  LENDING_BORROWING: true
} as const;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  SLIPPAGE_TOO_HIGH: 'Price impact too high. Try reducing your trade size',
  TRADE_FAILED: 'Trade failed. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  INVALID_AMOUNT: 'Please enter a valid amount',
  TOKEN_NOT_FOUND: 'Token not found',
  UNKNOWN_ERROR: 'An unexpected error occurred'
} as const;

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  TRADE_SUBMITTED: 'Trade submitted successfully',
  TRADE_CONFIRMED: 'Trade confirmed on blockchain',
  ALERT_CREATED: 'Price alert created successfully',
  SETTINGS_SAVED: 'Settings saved successfully'
} as const;

// =============================================================================
// EXTERNAL LINKS
// =============================================================================

export const EXTERNAL_LINKS = {
  DOCS: 'https://docs.defiportfolio.app',
  SUPPORT: 'https://support.defiportfolio.app',
  TWITTER: 'https://twitter.com/defiportfolio',
  DISCORD: 'https://discord.gg/defiportfolio',
  GITHUB: 'https://github.com/defiportfolio/app',
  TERMS: 'https://defiportfolio.app/terms',
  PRIVACY: 'https://defiportfolio.app/privacy'
} as const;

// =============================================================================
// REGEX PATTERNS
// =============================================================================

export const REGEX_PATTERNS = {
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NUMBER: /^\d*\.?\d+$/,
  PERCENTAGE: /^(?:100|[1-9]?\d)(?:\.\d+)?$/
} as const;