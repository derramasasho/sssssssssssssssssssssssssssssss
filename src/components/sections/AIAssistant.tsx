'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  SendIcon,
  RefreshCwIcon,
  BrainIcon,
  MessageCircleIcon,
  UserIcon,
  BotIcon,
} from 'lucide-react';

// Types and Services
import { AIMessage, Portfolio, MarketData } from '@/types';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { usePortfolio } from '@/stores/portfolio';
import { aiService } from '@/services/ai';
import { pricingService } from '@/services/pricing';

// Utils
import { cn } from '@/utils/cn';

// =============================================================================
// AI ASSISTANT COMPONENT
// =============================================================================

export default function AIAssistant(): JSX.Element {
  const { activeWallet } = useMultiChainWallet();
  const { portfolio } = usePortfolio();

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isServiceAvailable, setIsServiceAvailable] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check AI service availability on mount
  useEffect(() => {
    aiService.isServiceAvailable().then(setIsServiceAvailable);
  }, []);

  // Load conversation history
  useEffect(() => {
    const history = aiService.getConversationHistory();
    setMessages(history);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ==========================================================================
  // MESSAGE HANDLING
  // ==========================================================================

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isServiceAvailable) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get market context if available
      let marketData: MarketData[] = [];
      if (portfolio) {
        const symbols = portfolio.positions.map(p => p.token.symbol);
        marketData = await pricingService.getMarketData(symbols.slice(0, 5));
      }

      // Send message to AI service
      const aiResponse = await aiService.chat(
        userMessage,
        portfolio || undefined,
        {
          marketData,
        }
      );

      // Update local messages state
      setMessages(prev => [
        ...prev,
        {
          id: `user_${Date.now()}`,
          type: 'user',
          content: userMessage,
          timestamp: new Date(),
        },
        aiResponse,
      ]);
    } catch (error) {
      console.error('Failed to send message:', error);

      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: `user_${Date.now()}`,
          type: 'user',
          content: userMessage,
          timestamp: new Date(),
        },
        {
          id: `error_${Date.now()}`,
          type: 'assistant',
          content:
            'Sorry, I encountered an error processing your message. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    aiService.clearConversation();
    setMessages([]);
  };

  // ==========================================================================
  // QUICK ACTIONS
  // ==========================================================================

  const quickActions = [
    {
      label: 'Analyze my portfolio',
      action: () =>
        setInputMessage(
          'Analyze my current portfolio performance and provide insights.'
        ),
    },
    {
      label: 'Market outlook',
      action: () =>
        setInputMessage('What is the current market outlook for DeFi tokens?'),
    },
    {
      label: 'Trading suggestions',
      action: () =>
        setInputMessage(
          'Suggest some trading opportunities based on my portfolio.'
        ),
    },
    {
      label: 'Risk assessment',
      action: () =>
        setInputMessage('Assess the risk level of my current portfolio.'),
    },
  ];

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const renderMessage = (message: AIMessage) => (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-3 rounded-lg p-4',
        message.type === 'user' ? 'ml-8 bg-primary/10' : 'mr-8 bg-muted/50'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
          message.type === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
        )}
      >
        {message.type === 'user' ? (
          <UserIcon className="h-4 w-4" />
        ) : (
          <BotIcon className="h-4 w-4" />
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="text-sm text-muted-foreground">
          {message.type === 'user' ? 'You' : 'AI Assistant'} •{' '}
          {message.timestamp.toLocaleTimeString()}
        </div>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {message.content}
        </div>

        {message.metadata?.tokens && message.metadata.tokens.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.metadata.tokens.map(token => (
              <span
                key={token.id}
                className="rounded-full bg-primary/20 px-2 py-1 text-xs text-primary"
              >
                {token.symbol}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  if (!isServiceAvailable) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">AI Assistant</h2>

        <div className="card p-8 text-center">
          <BrainIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            AI Assistant Unavailable
          </h3>
          <p className="mb-4 text-muted-foreground">
            The AI assistant requires an OpenAI API key to function. Please
            configure your environment variables.
          </p>
          <div className="text-sm text-muted-foreground">
            Set{' '}
            <code className="rounded bg-muted px-2 py-1">OPENAI_API_KEY</code>{' '}
            in your environment
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SparklesIcon className="h-8 w-8 text-purple-600" />
          <h2 className="text-2xl font-bold">AI Assistant</h2>
        </div>

        <button
          onClick={clearConversation}
          className="btn btn-outline btn-sm"
          disabled={messages.length === 0}
        >
          <RefreshCwIcon className="mr-2 h-4 w-4" />
          Clear Chat
        </button>
      </div>

      {/* Chat Interface */}
      <div className="card overflow-hidden">
        {/* Messages Area */}
        <div className="h-96 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageCircleIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                Welcome to your AI Assistant
              </h3>
              <p className="mb-6 max-w-md text-muted-foreground">
                I can help you analyze your portfolio, provide market insights,
                suggest trading strategies, and answer DeFi-related questions.
              </p>

              {/* Quick Actions */}
              <div className="grid w-full max-w-lg grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="btn btn-outline btn-sm text-left"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map(renderMessage)}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mr-8 flex gap-3 rounded-lg bg-muted/50 p-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                    <BotIcon className="h-4 w-4" />
                  </div>
                  <div className="flex items-center">
                    <div className="flex space-x-1">
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-purple-600"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-purple-600"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-purple-600"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-3">
            <textarea
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                activeWallet
                  ? 'Ask me about your portfolio, market trends, or trading strategies...'
                  : 'Connect your wallet for personalized advice, or ask general DeFi questions...'
              }
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-lg border border-border px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="btn btn-primary px-4"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {activeWallet && (
              <span>
                Connected: {activeWallet.address.slice(0, 6)}...
                {activeWallet.address.slice(-4)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Context Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h4 className="mb-2 font-semibold">Portfolio Context</h4>
          <p className="text-sm text-muted-foreground">
            {portfolio
              ? `Analyzing ${portfolio.positions.length} positions worth ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(portfolio.totalValueUSD)}`
              : 'Connect your wallet for personalized portfolio analysis'}
          </p>
        </div>

        <div className="card p-4">
          <h4 className="mb-2 font-semibold">AI Capabilities</h4>
          <p className="text-sm text-muted-foreground">
            Portfolio analysis, market insights, trading suggestions, risk
            assessment, DeFi education
          </p>
        </div>
      </div>
    </div>
  );
}
