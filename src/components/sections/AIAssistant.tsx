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
  BotIcon
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
      const aiResponse = await aiService.chat(userMessage, portfolio || undefined, {
        marketData,
      });

      // Update local messages state
      setMessages(prev => [
        ...prev,
        {
          id: `user_${Date.now()}`,
          type: 'user',
          content: userMessage,
          timestamp: new Date(),
        },
        aiResponse
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
          content: 'Sorry, I encountered an error processing your message. Please try again.',
          timestamp: new Date(),
        }
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
      action: () => setInputMessage('Analyze my current portfolio performance and provide insights.'),
    },
    {
      label: 'Market outlook',
      action: () => setInputMessage('What is the current market outlook for DeFi tokens?'),
    },
    {
      label: 'Trading suggestions',
      action: () => setInputMessage('Suggest some trading opportunities based on my portfolio.'),
    },
    {
      label: 'Risk assessment',
      action: () => setInputMessage('Assess the risk level of my current portfolio.'),
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
        "flex gap-3 p-4 rounded-lg",
        message.type === 'user' 
          ? "bg-primary/10 ml-8" 
          : "bg-muted/50 mr-8"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        message.type === 'user'
          ? "bg-primary text-primary-foreground"
          : "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
      )}>
        {message.type === 'user' ? (
          <UserIcon className="w-4 h-4" />
        ) : (
          <BotIcon className="w-4 h-4" />
        )}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="text-sm text-muted-foreground">
          {message.type === 'user' ? 'You' : 'AI Assistant'} • {message.timestamp.toLocaleTimeString()}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.content}
        </div>
        
        {message.metadata?.tokens && message.metadata.tokens.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.metadata.tokens.map(token => (
              <span
                key={token.id}
                className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
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
          <BrainIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI Assistant Unavailable</h3>
          <p className="text-muted-foreground mb-4">
            The AI assistant requires an OpenAI API key to function. Please configure your environment variables.
          </p>
          <div className="text-sm text-muted-foreground">
            Set <code className="bg-muted px-2 py-1 rounded">OPENAI_API_KEY</code> in your environment
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
          <SparklesIcon className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold">AI Assistant</h2>
        </div>
        
        <button
          onClick={clearConversation}
          className="btn btn-outline btn-sm"
          disabled={messages.length === 0}
        >
          <RefreshCwIcon className="w-4 h-4 mr-2" />
          Clear Chat
        </button>
      </div>

      {/* Chat Interface */}
      <div className="card overflow-hidden">
        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircleIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Welcome to your AI Assistant</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                I can help you analyze your portfolio, provide market insights, suggest trading strategies, and answer DeFi-related questions.
              </p>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
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
                  className="flex gap-3 p-4 rounded-lg bg-muted/50 mr-8"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 flex items-center justify-center">
                    <BotIcon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                activeWallet 
                  ? "Ask me about your portfolio, market trends, or trading strategies..."
                  : "Connect your wallet for personalized advice, or ask general DeFi questions..."
              }
              className="flex-1 resize-none border border-border rounded-lg px-3 py-2 min-h-[44px] max-h-32 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="btn btn-primary px-4"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {activeWallet && (
              <span>Connected: {activeWallet.address.slice(0, 6)}...{activeWallet.address.slice(-4)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Context Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h4 className="font-semibold mb-2">Portfolio Context</h4>
          <p className="text-sm text-muted-foreground">
            {portfolio 
              ? `Analyzing ${portfolio.positions.length} positions worth ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(portfolio.totalValueUSD)}`
              : "Connect your wallet for personalized portfolio analysis"
            }
          </p>
        </div>
        
        <div className="card p-4">
          <h4 className="font-semibold mb-2">AI Capabilities</h4>
          <p className="text-sm text-muted-foreground">
            Portfolio analysis, market insights, trading suggestions, risk assessment, DeFi education
          </p>
        </div>
      </div>
    </div>
  );
}