'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useAccount,
  useChainId,
  useDisconnect as useDisconnectEVM,
} from 'wagmi';
import {
  useWallet as useSolanaWallet,
  useConnection,
} from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Address } from 'viem';

// =============================================================================
// TYPES
// =============================================================================

export type ChainType = 'evm' | 'solana';

export interface WalletInfo {
  address: string;
  chainType: ChainType;
  chainId?: number;
  walletName: string;
  isConnected: boolean;
}

export interface MultiChainWalletState {
  // Current active wallet
  activeWallet: WalletInfo | null;
  activeChainType: ChainType | null;

  // EVM wallet state
  evmWallet: {
    address: Address | undefined;
    chainId: number;
    isConnected: boolean;
    walletName?: string;
  };

  // Solana wallet state
  solanaWallet: {
    address: string | null;
    publicKey: PublicKey | null;
    isConnected: boolean;
    walletName?: string;
  };

  // Connection states
  isConnecting: boolean;
  error: string | null;

  // Available wallets
  hasEVMWallet: boolean;
  hasSolanaWallet: boolean;
  hasBothWallets: boolean;
}

export interface MultiChainWalletActions {
  // Chain switching
  switchToEVM: () => void;
  switchToSolana: () => void;
  switchChainType: (chainType: ChainType) => void;

  // Wallet connection
  connectEVM: () => Promise<void>;
  connectSolana: () => Promise<void>;
  disconnectEVM: () => Promise<void>;
  disconnectSolana: () => Promise<void>;
  disconnectAll: () => Promise<void>;

  // Utilities
  getActiveAddress: () => string | null;
  getActiveChainId: () => number | null;
  isWalletConnected: (chainType?: ChainType) => boolean;
  refresh: () => Promise<void>;
}

// =============================================================================
// MULTI-CHAIN WALLET HOOK
// =============================================================================

export function useMultiChainWallet(): MultiChainWalletState &
  MultiChainWalletActions {
  // EVM wallet hooks
  const {
    address: evmAddress,
    isConnected: evmConnected,
    connector: evmConnector,
  } = useAccount();
  const evmChainId = useChainId();
  const { disconnect: disconnectEVM } = useDisconnectEVM();

  // Solana wallet hooks
  const {
    publicKey: solanaPublicKey,
    connected: solanaConnected,
    wallet: solanaWallet,
    connect: connectSolanaWallet,
    disconnect: disconnectSolanaWallet,
    connecting: solanaConnecting,
  } = useSolanaWallet();
  const { connection } = useConnection();

  // Local state
  const [activeChainType, setActiveChainType] = useState<ChainType | null>(
    null
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const evmWalletState = useMemo(
    () => ({
      address: evmAddress,
      chainId: evmChainId,
      isConnected: evmConnected,
      walletName: evmConnector?.name,
    }),
    [evmAddress, evmChainId, evmConnected, evmConnector]
  );

  const solanaWalletState = useMemo(
    () => ({
      address: solanaPublicKey?.toString() || null,
      publicKey: solanaPublicKey,
      isConnected: solanaConnected,
      walletName: solanaWallet?.adapter.name,
    }),
    [solanaPublicKey, solanaConnected, solanaWallet]
  );

  const hasEVMWallet = evmWalletState.isConnected;
  const hasSolanaWallet = solanaWalletState.isConnected;
  const hasBothWallets = hasEVMWallet && hasSolanaWallet;

  // Determine active wallet
  const activeWallet = useMemo(() => {
    if (!activeChainType) {
      // Auto-detect based on what's connected
      if (hasEVMWallet && !hasSolanaWallet) {
        setActiveChainType('evm');
        return {
          address: evmWalletState.address!,
          chainType: 'evm' as ChainType,
          chainId: evmWalletState.chainId,
          walletName: evmWalletState.walletName || '',
          isConnected: true,
        };
      } else if (hasSolanaWallet && !hasEVMWallet) {
        setActiveChainType('solana');
        return {
          address: solanaWalletState.address!,
          chainType: 'solana' as ChainType,
          walletName: String(solanaWalletState.walletName) || '',
          isConnected: true,
        };
      } else if (hasBothWallets) {
        // Default to EVM if both are connected
        setActiveChainType('evm');
        return {
          address: evmWalletState.address!,
          chainType: 'evm' as ChainType,
          chainId: evmWalletState.chainId,
          walletName: evmWalletState.walletName || '',
          isConnected: true,
        };
      }
      return null;
    }

    // Use explicitly set active chain
    if (activeChainType === 'evm' && hasEVMWallet) {
      return {
        address: evmWalletState.address!,
        chainType: 'evm' as ChainType,
        chainId: evmWalletState.chainId,
        walletName: evmWalletState.walletName || '',
        isConnected: true,
      };
    } else if (activeChainType === 'solana' && hasSolanaWallet) {
      return {
        address: solanaWalletState.address!,
        chainType: 'solana' as ChainType,
        walletName: String(solanaWalletState.walletName) || '',
        isConnected: true,
      };
    }

    return null;
  }, [
    activeChainType,
    hasEVMWallet,
    hasSolanaWallet,
    evmWalletState,
    solanaWalletState,
    hasBothWallets,
  ]);

  // ==========================================================================
  // WALLET CONNECTION ACTIONS
  // ==========================================================================

  const connectEVM = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // EVM connection is handled by RainbowKit/Wagmi
      // This would trigger the wallet connection modal
      console.log('EVM connection should be handled by RainbowKit');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to connect EVM wallet'
      );
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectSolana = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await connectSolanaWallet();
      setActiveChainType('solana');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to connect Solana wallet'
      );
    } finally {
      setIsConnecting(false);
    }
  }, [connectSolanaWallet]);

  const handleDisconnectEVM = useCallback(async () => {
    try {
      await disconnectEVM();
      if (activeChainType === 'evm') {
        setActiveChainType(hasSolanaWallet ? 'solana' : null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to disconnect EVM wallet'
      );
    }
  }, [disconnectEVM, activeChainType, hasSolanaWallet]);

  const handleDisconnectSolana = useCallback(async () => {
    try {
      await disconnectSolanaWallet();
      if (activeChainType === 'solana') {
        setActiveChainType(hasEVMWallet ? 'evm' : null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to disconnect Solana wallet'
      );
    }
  }, [disconnectSolanaWallet, activeChainType, hasEVMWallet]);

  const disconnectAll = useCallback(async () => {
    setError(null);
    try {
      await Promise.all([
        hasEVMWallet ? disconnectEVM() : Promise.resolve(),
        hasSolanaWallet ? disconnectSolanaWallet() : Promise.resolve(),
      ]);
      setActiveChainType(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to disconnect wallets'
      );
    }
  }, [hasEVMWallet, hasSolanaWallet, disconnectEVM, disconnectSolanaWallet]);

  // ==========================================================================
  // CHAIN SWITCHING ACTIONS
  // ==========================================================================

  const switchToEVM = useCallback(() => {
    if (hasEVMWallet) {
      setActiveChainType('evm');
      setError(null);
    } else {
      setError('EVM wallet not connected');
    }
  }, [hasEVMWallet]);

  const switchToSolana = useCallback(() => {
    if (hasSolanaWallet) {
      setActiveChainType('solana');
      setError(null);
    } else {
      setError('Solana wallet not connected');
    }
  }, [hasSolanaWallet]);

  const switchChainType = useCallback(
    (chainType: ChainType) => {
      if (chainType === 'evm') {
        switchToEVM();
      } else {
        switchToSolana();
      }
    },
    [switchToEVM, switchToSolana]
  );

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  const getActiveAddress = useCallback(() => {
    return activeWallet?.address || null;
  }, [activeWallet]);

  const getActiveChainId = useCallback(() => {
    if (activeChainType === 'evm') {
      return evmWalletState.chainId;
    }
    return null; // Solana doesn't have chainId concept
  }, [activeChainType, evmWalletState.chainId]);

  const isWalletConnected = useCallback(
    (chainType?: ChainType) => {
      if (!chainType) {
        return hasEVMWallet || hasSolanaWallet;
      }
      return chainType === 'evm' ? hasEVMWallet : hasSolanaWallet;
    },
    [hasEVMWallet, hasSolanaWallet]
  );

  const refresh = useCallback(async () => {
    setError(null);
    // Force re-evaluation of wallet states
    // This is mainly for development/debugging
    console.log('Refreshing wallet states...');
  }, []);

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  // Auto-connect effects
  useEffect(() => {
    if (evmConnected && !activeChainType) {
      setActiveChainType('evm');
    }
  }, [evmConnected, activeChainType]);

  useEffect(() => {
    if (solanaConnected && !activeChainType && !evmConnected) {
      setActiveChainType('solana');
    }
  }, [solanaConnected, activeChainType, evmConnected]);

  // Clear error after successful connection
  useEffect(() => {
    if (activeWallet?.isConnected) {
      setError(null);
    }
  }, [activeWallet?.isConnected]);

  // Update connecting state
  useEffect(() => {
    setIsConnecting(solanaConnecting);
  }, [solanaConnecting]);

  // ==========================================================================
  // RETURN HOOK INTERFACE
  // ==========================================================================

  return {
    // State
    activeWallet,
    activeChainType,
    evmWallet: {
      ...evmWalletState,
      walletName: evmWalletState.walletName || '',
    },
    solanaWallet: {
      ...solanaWalletState,
      walletName: String(solanaWalletState.walletName) || '',
    },
    isConnecting,
    error,
    hasEVMWallet,
    hasSolanaWallet,
    hasBothWallets,

    // Actions
    switchToEVM,
    switchToSolana,
    switchChainType,
    connectEVM,
    connectSolana,
    disconnectEVM: handleDisconnectEVM,
    disconnectSolana: handleDisconnectSolana,
    disconnectAll,
    getActiveAddress,
    getActiveChainId,
    isWalletConnected,
    refresh,
  };
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

export function useActiveChainType(): ChainType | null {
  const { activeChainType } = useMultiChainWallet();
  return activeChainType;
}

export function useActiveWalletAddress(): string | null {
  const { getActiveAddress } = useMultiChainWallet();
  return getActiveAddress();
}

export function useIsWalletConnected(chainType?: ChainType): boolean {
  const { isWalletConnected } = useMultiChainWallet();
  return isWalletConnected(chainType);
}
