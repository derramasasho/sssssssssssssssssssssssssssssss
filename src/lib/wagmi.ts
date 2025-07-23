import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon, arbitrum, bsc } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import {
  getDefaultWallets,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import { ledgerWallet } from '@rainbow-me/rainbowkit/wallets';

// =============================================================================
// CHAIN CONFIGURATION
// =============================================================================

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, arbitrum, bsc],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID! }),
    publicProvider(),
  ]
);

// =============================================================================
// WALLET CONFIGURATION
// =============================================================================

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

const { wallets } = getDefaultWallets({
  appName: 'DeFi Portfolio',
  projectId,
  chains,
});

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Hardware',
    wallets: [ledgerWallet({ projectId, chains })],
  },
]);

// =============================================================================
// WAGMI CONFIG
// =============================================================================

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { chains };

// =============================================================================
// CHAIN HELPERS
// =============================================================================

export function getChainById(chainId: number) {
  return chains.find(chain => chain.id === chainId);
}

export function getBlockExplorerUrl(
  chainId: number,
  hash: string,
  type: 'tx' | 'address' = 'tx'
) {
  const chain = getChainById(chainId);
  if (!chain?.blockExplorers?.default?.url) return null;

  const baseUrl = chain.blockExplorers.default.url;
  return `${baseUrl}/${type}/${hash}`;
}

export function isChainSupported(chainId: number): boolean {
  return chains.some(chain => chain.id === chainId);
}

// =============================================================================
// RPC HELPERS
// =============================================================================

export function getRpcUrl(chainId: number): string {
  const chain = getChainById(chainId);
  if (!chain) throw new Error(`Unsupported chain: ${chainId}`);

  // Use Alchemy for supported chains
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (alchemyKey) {
    switch (chainId) {
      case mainnet.id:
        return `https://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`;
      case polygon.id:
        return `https://polygon-mainnet.alchemyapi.io/v2/${alchemyKey}`;
      case arbitrum.id:
        return `https://arb-mainnet.alchemyapi.io/v2/${alchemyKey}`;
      default:
        break;
    }
  }

  // Use Infura as fallback
  const infuraKey = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
  if (infuraKey) {
    switch (chainId) {
      case mainnet.id:
        return `https://mainnet.infura.io/v3/${infuraKey}`;
      case polygon.id:
        return `https://polygon-mainnet.infura.io/v3/${infuraKey}`;
      case arbitrum.id:
        return `https://arbitrum-mainnet.infura.io/v3/${infuraKey}`;
      default:
        break;
    }
  }

  // Fallback to public RPC
  return chain.rpcUrls.default.http[0] || chain.rpcUrls.public.http[0];
}

// =============================================================================
// NETWORK CONSTANTS
// =============================================================================

export const NETWORK_LABELS: Record<number, string> = {
  [mainnet.id]: 'Ethereum',
  [polygon.id]: 'Polygon',
  [arbitrum.id]: 'Arbitrum',
  [bsc.id]: 'BNB Chain',
};

export const NETWORK_COLORS: Record<number, string> = {
  [mainnet.id]: '#627EEA',
  [polygon.id]: '#8247E5',
  [arbitrum.id]: '#28A0F0',
  [bsc.id]: '#F0B90B',
};

export const NATIVE_CURRENCY: Record<
  number,
  { name: string; symbol: string; decimals: number }
> = {
  [mainnet.id]: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  [polygon.id]: { name: 'Polygon', symbol: 'MATIC', decimals: 18 },
  [arbitrum.id]: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  [bsc.id]: { name: 'BNB', symbol: 'BNB', decimals: 18 },
};

// =============================================================================
// GAS SETTINGS
// =============================================================================

export const GAS_LIMITS: Record<string, number> = {
  TRANSFER: 21000,
  ERC20_TRANSFER: 65000,
  ERC20_APPROVE: 45000,
  SWAP: 150000,
  ADD_LIQUIDITY: 200000,
  REMOVE_LIQUIDITY: 150000,
  STAKE: 100000,
  UNSTAKE: 80000,
  CLAIM_REWARDS: 60000,
};

export const GAS_PRICE_LEVELS = {
  SLOW: 1,
  STANDARD: 1.25,
  FAST: 1.5,
  INSTANT: 2,
} as const;

// =============================================================================
// TOKEN CONTRACTS
// =============================================================================

export const TOKEN_CONTRACTS: Record<number, Record<string, string>> = {
  [mainnet.id]: {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86a33E6441e17b5B8aBA5B40Cc0e30Eda1b9B',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  },
  [polygon.id]: {
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  },
  [arbitrum.id]: {
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    UNI: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
  },
  [bsc.id]: {
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    DAI: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    ETH: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
  },
};

// =============================================================================
// DEX ROUTER CONTRACTS
// =============================================================================

export const DEX_ROUTERS: Record<number, Record<string, string>> = {
  [mainnet.id]: {
    UNISWAP_V2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    UNISWAP_V3: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    SUSHISWAP: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    CURVE: '0x99a58482BD75cbab83b27EC03CA68fF489b5788f',
    BALANCER: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  },
  [polygon.id]: {
    QUICKSWAP: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    SUSHISWAP: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    CURVE: '0x445FE580eF8d70FF569aB36e80c647af338db351',
  },
  [arbitrum.id]: {
    UNISWAP_V3: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    SUSHISWAP: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    CURVE: '0x445FE580eF8d70FF569aB36e80c647af338db351',
    BALANCER: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  },
  [bsc.id]: {
    PANCAKESWAP: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    SUSHISWAP: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  },
};

// =============================================================================
// MULTICALL CONTRACTS
// =============================================================================

export const MULTICALL_CONTRACTS: Record<number, string> = {
  [mainnet.id]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  [polygon.id]: '0x275617327c958bD06b5D6b871E7f491D76113dd8',
  [arbitrum.id]: '0x842eC2c7D803033Edf55E478F461FC547Bc54EB2',
  [bsc.id]: '0x38ce767d81de3e5c6133a9a8c8c92e16fb2b7341',
};

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export function validateChainId(chainId: number): void {
  if (!isChainSupported(chainId)) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

export function validateAddress(address: string): void {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`Invalid address: ${address}`);
  }
}
