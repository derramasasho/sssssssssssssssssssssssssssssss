'use client';

import React, { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import styles for wallet modal
require('@solana/wallet-adapter-react-ui/styles.css');

// =============================================================================
// SOLANA PROVIDER COMPONENT
// =============================================================================

interface SolanaProviderProps {
  children: React.ReactNode;
}

export default function SolanaProvider({
  children,
}: SolanaProviderProps): JSX.Element {
  // Network configuration
  const network = WalletAdapterNetwork.Mainnet;

  // RPC endpoint configuration
  const endpoint = useMemo(() => {
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    if (customRpc) {
      return customRpc;
    }

    // Always use mainnet for production
    return (
      process.env.NEXT_PUBLIC_HELIUS_RPC_URL ||
      process.env.NEXT_PUBLIC_QUICKNODE_SOLANA_RPC ||
      'https://api.mainnet-beta.solana.com'
    );
  }, [network]);

  // Wallet adapters configuration
  const wallets = useMemo(
    () => [
      // Popular wallets
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),

      // Additional wallets
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={{
        commitment: 'confirmed',
        wsEndpoint: endpoint
          .replace('https://', 'wss://')
          .replace('http://', 'ws://'),
      }}
    >
      <WalletProvider
        wallets={wallets}
        autoConnect={true}
        onError={error => {
          console.error('Solana wallet error:', error);
        }}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

// =============================================================================
// WALLET DETECTION UTILITIES
// =============================================================================

export function detectSolanaWallets(): {
  phantom: boolean;
  solflare: boolean;
  torus: boolean;
  others: string[];
} {
  if (typeof window === 'undefined') {
    return { phantom: false, solflare: false, torus: false, others: [] };
  }

  const phantom = !!(window as any).phantom?.solana;
  const solflare = !!(window as any).solflare;
  const torus = !!(window as any).torus;

  // Check for other Solana wallets
  const others: string[] = [];
  if ((window as any).sollet) others.push('Sollet');
  if ((window as any).coin98) others.push('Coin98');
  if ((window as any).slope) others.push('Slope');

  return { phantom, solflare, torus, others };
}

export function isSolanaWalletInstalled(): boolean {
  const detected = detectSolanaWallets();
  return (
    detected.phantom ||
    detected.solflare ||
    detected.torus ||
    detected.others.length > 0
  );
}

// =============================================================================
// WALLET INSTALLATION HELPERS
// =============================================================================

export const SOLANA_WALLET_URLS = {
  phantom: 'https://phantom.app/',
  solflare: 'https://solflare.com/',
  torus: 'https://tor.us/',
} as const;

export function getSolanaWalletInstallUrl(
  walletName: keyof typeof SOLANA_WALLET_URLS
): string {
  return SOLANA_WALLET_URLS[walletName];
}
