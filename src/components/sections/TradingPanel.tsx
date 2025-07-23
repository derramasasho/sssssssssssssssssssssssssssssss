'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpDownIcon, 
  RefreshCwIcon,
  SettingsIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExternalLinkIcon,
  WalletIcon,
  ChevronDownIcon,
  InfoIcon,
  ZapIcon
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'react-hot-toast';

// Types and Hooks
import { 
  SwapQuote, 
  Token, 
  ChainType,
  AIRecommendation 
} from '@/types';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { useTrading } from '@/stores/trading';

// Services
import { dexService } from '@/services/dex';
import { jupiterService } from '@/services/jupiter';
import { aiService } from '@/services/ai';
import { pricingService } from '@/services/pricing';

// Utils
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

// =============================================================================
// TRADING PANEL COMPONENT
// =============================================================================

export default function TradingPanel(): JSX.Element {
  const {
    activeWallet,
    activeChainType,
    hasEVMWallet,
    hasSolanaWallet,
    hasBothWallets,
    switchToEVM,
    switchToSolana,
    isConnecting,
    error: walletError
  } = useMultiChainWallet();

  const {
    fromToken,
    toToken,
    amount,
    slippage,
    quotes,
    selectedQuote,
    isLoadingQuotes,
    lastQuoteUpdate,
    setFromToken,
    setToToken,
    setAmount,
    setSlippage,
    getQuotes,
    selectQuote,
    executeSwap,
    swapTokens,
    clearQuotes
  } = useTrading();

  // Solana wallet modal
  const { setVisible: setSolanaModalVisible } = useWalletModal();
  const { openConnectModal } = useConnectModal();

  // Local state
  const [showSettings, setShowSettings] = useState(false);
  const [showChainSelector, setShowChainSelector] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // ==========================================================================
  // TOKEN LOADING
  // ==========================================================================

  const loadTokensForChain = useCallback(async (chainType: ChainType) => {
    setLoadingTokens(true);
    try {
      let tokenList: Token[] = [];
      
      if (chainType === 'solana') {
        tokenList = await jupiterService.getPopularTokens();
      } else {
        tokenList = await dexService.getSupportedTokens(1); // Ethereum mainnet
      }
      
      setTokens(tokenList);
    } catch (error) {
      console.error('Failed to load tokens:', error);
      toast.error('Failed to load token list');
    } finally {
      setLoadingTokens(false);
    }
  }, []);

  // Load tokens when chain type changes
  useEffect(() => {
    if (activeChainType) {
      loadTokensForChain(activeChainType);
    }
  }, [activeChainType, loadTokensForChain]);

  // Set default tokens based on chain
  useEffect(() => {
    if (tokens.length > 0 && !fromToken) {
      if (activeChainType === 'solana') {
        const sol = tokens.find(t => t.symbol === 'SOL');
        const usdc = tokens.find(t => t.symbol === 'USDC');
        if (sol) setFromToken(sol);
        if (usdc) setToToken(usdc);
      } else {
        const eth = tokens.find(t => t.symbol === 'ETH');
        const usdc = tokens.find(t => t.symbol === 'USDC');
        if (eth) setFromToken(eth);
        if (usdc) setToToken(usdc);
      }
    }
  }, [tokens, fromToken, activeChainType, setFromToken, setToToken]);

  // ==========================================================================
  // QUOTE FETCHING
  // ==========================================================================

  const fetchQuotes = useCallback(async () => {
    if (!fromToken || !toToken || !amount || parseFloat(amount) <= 0 || !activeChainType) {
      return;
    }

    clearQuotes();
    
    try {
      let newQuotes: SwapQuote[] = [];
      
      if (activeChainType === 'solana') {
        newQuotes = await jupiterService.getSwapQuote(fromToken, toToken, amount, slippage);
      } else {
        newQuotes = await dexService.getSwapQuote(fromToken, toToken, amount, slippage, 1);
      }

      // Update store with new quotes
      await getQuotes(fromToken, toToken, amount, slippage);
      
      // Auto-select best quote
      if (newQuotes.length > 0) {
        selectQuote(newQuotes[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      toast.error('Failed to get swap quotes');
    }
  }, [fromToken, toToken, amount, slippage, activeChainType, getQuotes, selectQuote, clearQuotes]);

  // Auto-fetch quotes when inputs change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (fromToken && toToken && amount && parseFloat(amount) > 0) {
        fetchQuotes();
      }
    }, 1000); // Debounce by 1 second

    return () => clearTimeout(timeoutId);
  }, [fetchQuotes]);

  // ==========================================================================
  // AI RECOMMENDATIONS
  // ==========================================================================

  const getAiRecommendations = useCallback(async () => {
    if (!fromToken || !toToken || !selectedQuote) return;

    try {
      const marketData = await pricingService.getMarketData([fromToken.symbol, toToken.symbol]);
      const recommendations = await aiService.generateTradingRecommendations(
        {} as any, // Would need actual portfolio
        marketData,
        `Swapping ${amount} ${fromToken.symbol} for ${toToken.symbol}`
      );
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
    }
  }, [fromToken, toToken, selectedQuote, amount]);

  // ==========================================================================
  // SWAP EXECUTION
  // ==========================================================================

  const handleSwap = useCallback(async () => {
    if (!selectedQuote || !activeWallet) {
      toast.error('No quote selected or wallet not connected');
      return;
    }

    try {
      let txHash: string;
      
      if (activeChainType === 'solana') {
        const { publicKey } = useWallet();
        if (!publicKey) {
          toast.error('Solana wallet not connected');
          return;
        }
        
        const swapTransaction = await jupiterService.executeSwap(selectedQuote, publicKey);
        // Here you would send the transaction with the wallet
        txHash = 'solana_tx_hash'; // Placeholder
      } else {
        // EVM swap execution would go here
        txHash = await executeSwap(selectedQuote);
      }

      toast.success(`Swap executed! Transaction: ${txHash.slice(0, 8)}...`);
      
      // Clear form after successful swap
      setAmount('');
      clearQuotes();
    } catch (error) {
      console.error('Swap failed:', error);
      toast.error('Swap failed. Please try again.');
    }
  }, [selectedQuote, activeWallet, activeChainType, executeSwap, setAmount, clearQuotes]);

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const renderChainSelector = () => (
    <div className="relative">
      <button
        onClick={() => setShowChainSelector(!showChainSelector)}
        className="btn btn-outline btn-sm flex items-center gap-2"
      >
        <div className={cn(
          "w-2 h-2 rounded-full",
          activeChainType === 'solana' ? "bg-purple-500" : "bg-blue-500"
        )} />
        {activeChainType === 'solana' ? 'Solana' : 'Ethereum'}
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {showChainSelector && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50"
          >
            <div className="p-2">
              <button
                onClick={() => {
                  switchToEVM();
                  setShowChainSelector(false);
                }}
                disabled={!hasEVMWallet}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Ethereum (1inch)</span>
                {!hasEVMWallet && <span className="text-xs text-muted-foreground ml-auto">Not connected</span>}
              </button>
              
              <button
                onClick={() => {
                  switchToSolana();
                  setShowChainSelector(false);
                }}
                disabled={!hasSolanaWallet}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Solana (Jupiter)</span>
                {!hasSolanaWallet && <span className="text-xs text-muted-foreground ml-auto">Not connected</span>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderWalletConnection = () => {
    if (!activeWallet) {
      return (
        <div className="card p-6 text-center">
          <WalletIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Wallet to Trade</h3>
          <p className="text-muted-foreground mb-4">
            Connect your {activeChainType === 'solana' ? 'Solana' : 'Ethereum'} wallet to start trading
          </p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                if (activeChainType === 'solana') {
                  setSolanaModalVisible(true);
                } else {
                  openConnectModal?.();
                }
              }}
              className="btn btn-primary"
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : `Connect ${activeChainType === 'solana' ? 'Phantom/Solflare' : 'MetaMask'}`}
            </button>
          </div>

          {hasBothWallets && (
            <div className="mt-4 text-sm text-muted-foreground">
              <button
                onClick={() => switchToSolana()}
                className="text-purple-600 hover:underline mr-2"
              >
                Switch to Solana
              </button>
              <span>•</span>
              <button
                onClick={() => switchToEVM()}
                className="text-blue-600 hover:underline ml-2"
              >
                Switch to Ethereum
              </button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderTokenSelector = (token: Token | null, onSelect: (token: Token) => void, label: string) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <button
        onClick={() => {/* Open token selector modal */}}
        className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
      >
        {token ? (
          <>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="text-sm font-semibold">{token.symbol[0]}</span>
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold">{token.symbol}</div>
              <div className="text-sm text-muted-foreground">{token.name}</div>
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm">?</span>
            </div>
            <span className="text-muted-foreground">Select token</span>
          </>
        )}
        <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );

  const renderQuoteCard = (quote: SwapQuote, isSelected: boolean) => (
    <motion.div
      key={quote.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 border rounded-lg cursor-pointer transition-all",
        isSelected 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50"
      )}
      onClick={() => selectQuote(quote.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="font-semibold">{quote.aggregator}</div>
          {quote.priceImpact < 1 && (
            <CheckCircleIcon className="w-4 h-4 text-green-600" />
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {formatNumber(parseFloat(quote.toAmount), 6)} {quote.toToken.symbol}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Price Impact: {formatPercentage(quote.priceImpact)}
        </span>
        <span className="text-muted-foreground">
          Gas: ~{formatCurrency(parseFloat(quote.gasEstimate) * 0.00001)}
        </span>
      </div>

      {quote.route.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Route: {quote.route.map(r => r.protocol).join(' → ')}
        </div>
      )}
    </motion.div>
  );

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  if (!activeWallet) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Trading</h2>
          {renderChainSelector()}
        </div>
        {renderWalletConnection()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trading</h2>
        <div className="flex items-center gap-3">
          {renderChainSelector()}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-outline btn-sm"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Wallet Status */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold">
              {activeWallet.walletName?.[0] || 'W'}
            </div>
            <div>
              <div className="font-semibold">
                {activeWallet.address.slice(0, 6)}...{activeWallet.address.slice(-4)}
              </div>
              <div className="text-sm text-muted-foreground">
                {activeChainType === 'solana' ? 'Solana' : `Chain ${activeWallet.chainId}`} • {activeWallet.walletName}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">Connected</span>
          </div>
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Swap Interface */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="space-y-4">
              {/* From Token */}
              {renderTokenSelector(fromToken, setFromToken, "From")}
              
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="input w-full text-lg"
                />
              </div>

              {/* Swap Arrow */}
              <div className="flex justify-center">
                <button
                  onClick={swapTokens}
                  className="btn btn-outline btn-sm rounded-full p-2"
                >
                  <ArrowUpDownIcon className="w-4 h-4" />
                </button>
              </div>

              {/* To Token */}
              {renderTokenSelector(toToken, setToToken, "To")}

              {/* Quotes */}
              {quotes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Best Quotes</h4>
                    <button
                      onClick={fetchQuotes}
                      disabled={isLoadingQuotes}
                      className="btn btn-outline btn-sm"
                    >
                      <RefreshCwIcon className={cn("w-4 h-4", isLoadingQuotes && "animate-spin")} />
                      Refresh
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {quotes.slice(0, 3).map(quote => 
                      renderQuoteCard(quote, quote.id === selectedQuote?.id)
                    )}
                  </div>
                </div>
              )}

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                disabled={!selectedQuote || isLoadingQuotes}
                className="btn btn-primary w-full py-3 text-lg"
              >
                {isLoadingQuotes ? 'Getting quotes...' : 'Swap'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">AI Trading Assistant</h3>
              <button
                onClick={() => setShowAiPanel(!showAiPanel)}
                className="btn btn-outline btn-sm"
              >
                <ZapIcon className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence>
              {showAiPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <button
                    onClick={getAiRecommendations}
                    className="btn btn-outline w-full"
                  >
                    Get AI Analysis
                  </button>

                  {aiRecommendations.length > 0 && (
                    <div className="space-y-2">
                      {aiRecommendations.map((rec, index) => (
                        <div key={rec.id} className="p-3 border border-border rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <InfoIcon className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-sm">{rec.type.toUpperCase()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6"
          >
            <h3 className="font-semibold mb-4">Trading Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Slippage Tolerance: {slippage}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={slippage}
                  onChange={(e) => setSlippage(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.1%</span>
                  <span>5%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}