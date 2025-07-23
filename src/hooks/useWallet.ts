'use client';

import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UseWalletReturn } from '@/types';
import { NETWORK_LABELS, isChainSupported } from '@/lib/wagmi';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants';

export function useWallet(): UseWalletReturn {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { connect, connectors, isLoading: isConnectLoading } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { switchNetwork, isLoading: isSwitchLoading } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  // =============================================================================
  // CONNECTION HANDLERS
  // =============================================================================

  const handleConnect = useCallback(async () => {
    try {
      if (openConnectModal) {
        openConnectModal();
      } else {
        // Fallback to programmatic connection
        const injectedConnector = connectors.find(
          connector => connector.id === 'injected'
        );
        if (injectedConnector) {
          await connect({ connector: injectedConnector });
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }, [openConnectModal, connect, connectors]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Disconnection error:', error);
      toast.error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }, [disconnect]);

  const handleSwitchChain = useCallback(async (chainId: number) => {
    try {
      if (!isChainSupported(chainId)) {
        throw new Error(`Unsupported chain: ${chainId}`);
      }

      if (!switchNetwork) {
        throw new Error('Chain switching not supported');
      }

      await switchNetwork(chainId);
      
      const networkName = NETWORK_LABELS[chainId] || `Chain ${chainId}`;
      toast.success(`Switched to ${networkName}`);
    } catch (error) {
      console.error('Chain switch error:', error);
      toast.error(`Failed to switch network: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [switchNetwork]);

  // =============================================================================
  // CONNECTION STATUS MONITORING
  // =============================================================================

  useEffect(() => {
    if (isConnected && address) {
      toast.success(SUCCESS_MESSAGES.WALLET_CONNECTED);
    }
  }, [isConnected, address]);

  useEffect(() => {
    // Check if connected to unsupported network
    if (isConnected && chain && !isChainSupported(chain.id)) {
      toast.error(`Unsupported network: ${chain.name}. Please switch to a supported network.`);
    }
  }, [isConnected, chain]);

  // =============================================================================
  // NETWORK VALIDATION
  // =============================================================================

  const validateNetwork = useCallback(() => {
    if (!isConnected || !chain) {
      return false;
    }

    if (!isChainSupported(chain.id)) {
      toast.error(`Please switch to a supported network`);
      return false;
    }

    return true;
  }, [isConnected, chain]);

  // =============================================================================
  // RETURN VALUES
  // =============================================================================

  return {
    // Account info
    address,
    isConnected,
    isConnecting: isConnecting || isConnectLoading,
    isDisconnected,
    
    // Network info
    chain: chain ? { id: chain.id, name: chain.name } : undefined,
    
    // Actions
    connect: handleConnect,
    disconnect: handleDisconnect,
    switchChain: handleSwitchChain,
    
    // Validation
    validateNetwork,
    
    // Loading states
    isSwitchingChain: isSwitchLoading,
  } as UseWalletReturn & {
    validateNetwork: () => boolean;
    isSwitchingChain: boolean;
  };
}

// =============================================================================
// WALLET UTILITIES
// =============================================================================

export function useWalletAddress() {
  const { address } = useWallet();
  return address;
}

export function useIsWalletConnected() {
  const { isConnected } = useWallet();
  return isConnected;
}

export function useRequireWallet() {
  const { isConnected, connect } = useWallet();
  
  const requireWallet = useCallback(async () => {
    if (!isConnected) {
      toast.error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
      await connect();
      return false;
    }
    return true;
  }, [isConnected, connect]);
  
  return requireWallet;
}

export function useWalletChain() {
  const { chain, switchChain } = useWallet();
  
  const requireChain = useCallback(async (chainId: number) => {
    if (!chain || chain.id !== chainId) {
      await switchChain(chainId);
      return false;
    }
    return true;
  }, [chain, switchChain]);
  
  return {
    chain,
    switchChain,
    requireChain,
  };
}

// =============================================================================
// WALLET CONNECTION STATUS HOOK
// =============================================================================

export function useWalletConnectionStatus() {
  const { isConnected, isConnecting, isDisconnected } = useWallet();
  
  const status = isConnecting 
    ? 'connecting' 
    : isConnected 
    ? 'connected' 
    : isDisconnected 
    ? 'disconnected' 
    : 'idle';
  
  return {
    status,
    isConnecting,
    isConnected,
    isDisconnected,
    isIdle: status === 'idle',
  };
}