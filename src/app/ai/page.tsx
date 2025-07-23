'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SendIcon,
  BrainIcon,
  UserIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  SparklesIcon,
  BarChart3Icon,
  PieChartIcon,
  TrendingDownIcon,
  InfoIcon,
  ArrowLeftIcon,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// Types and Hooks
import { AIMessage } from '@/types';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
import { usePortfolio } from '@/stores/portfolio';

// Services
import { AIService } from '@/services/ai';

// Utils
import { cn } from '@/utils/cn';

// =============================================================================
// AI ASSISTANT PAGE COMPONENT
// =============================================================================

export default function AIAssistantPage(): JSX.Element {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { hasBothWallets } = useMultiChainWallet();
  const { portfolio } = usePortfolio();
  const hasWallet = hasBothWallets;

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Send welcome message
    if (!hasWelcomed) {
      const welcomeMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: hasWallet
          ? "Hello! I'm your AI assistant, ready to help you analyze your DeFi portfolio and make informed trading decisions. I can provide insights on your holdings, suggest optimization strategies, analyze market trends, and answer any questions about DeFi. What would you like to explore today?"
          : "Hello! I'm your AI assistant for DeFi portfolio management. To provide personalized insights, please connect your wallet first. Once connected, I can analyze your holdings, suggest optimization strategies, and help you make informed trading decisions. For now, I can still answer general questions about DeFi and cryptocurrency markets.",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setHasWelcomed(true);
    }
  }, [hasWelcomed, hasWallet]);

  // ==========================================================================
  // MESSAGE HANDLING
  // ==========================================================================

  const sendMessage = async (): Promise<void> => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get AI response - Mock response for now
      const response = {
        content:
          "I understand you'd like to chat with the AI assistant. The AI integration is currently being set up to provide you with personalized DeFi insights and recommendations.",
        recommendations: [],
        analysis: undefined,
      };

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI message failed:', error);

      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content:
          "I apologize, but I'm having trouble processing your request right now. This could be due to API limitations or a temporary service issue. Please try again in a moment, or ask a different question.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('AI assistant temporarily unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = (): void => {
    setMessages([]);
    setHasWelcomed(false);
    toast.success('Conversation cleared');
  };

  // ==========================================================================
  // QUICK ACTIONS
  // ==========================================================================

  const quickActions = [
    {
      icon: BarChart3Icon,
      label: 'Analyze Portfolio',
      query:
        'Please analyze my current portfolio performance and provide insights.',
      color: 'from-blue-500 to-blue-600',
      disabled: !hasWallet,
    },
    {
      icon: TrendingUpIcon,
      label: 'Market Insights',
      query:
        'What are the current market trends and opportunities I should know about?',
      color: 'from-green-500 to-green-600',
      disabled: false,
    },
    {
      icon: PieChartIcon,
      label: 'Rebalancing',
      query:
        'Should I rebalance my portfolio? What changes would you recommend?',
      color: 'from-purple-500 to-purple-600',
      disabled: !hasWallet,
    },
    {
      icon: TrendingDownIcon,
      label: 'Risk Analysis',
      query: 'What are the potential risks in my current portfolio allocation?',
      color: 'from-red-500 to-red-600',
      disabled: !hasWallet,
    },
  ];

  const handleQuickAction = (query: string): void => {
    if (isLoading) return;
    setInputValue(query);
    // Auto-send the query
    setTimeout(() => sendMessage(), 100);
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Portfolio</span>
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearConversation}
            className="flex items-center space-x-2 rounded-lg border border-border bg-background px-4 py-2 transition-colors hover:bg-muted"
          >
            <RefreshCwIcon className="h-4 w-4" />
            <span>Clear Chat</span>
          </motion.button>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center justify-center space-x-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
              <BrainIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              AI Portfolio Assistant
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-muted-foreground"
          >
            Get personalized insights, market analysis, and trading
            recommendations powered by advanced AI
          </motion.p>
        </div>

        {/* Wallet Status */}
        {!hasWallet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start space-x-3 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4"
          >
            <InfoIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
            <div>
              <h3 className="mb-1 font-medium text-orange-500">
                Connect Wallet for Personalized Insights
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect your wallet to unlock portfolio analysis, risk
                assessment, and personalized recommendations.
              </p>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                whileHover={{ scale: action.disabled ? 1 : 1.02 }}
                whileTap={{ scale: action.disabled ? 1 : 0.98 }}
                onClick={() =>
                  !action.disabled && handleQuickAction(action.query)
                }
                disabled={action.disabled || isLoading}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all duration-200',
                  action.disabled
                    ? 'cursor-not-allowed border-border/50 bg-muted/50 text-muted-foreground opacity-50'
                    : 'border-border bg-card hover:border-border/80 hover:shadow-lg'
                )}
              >
                <div
                  className={cn(
                    'mb-3 flex h-10 w-10 items-center justify-center rounded-lg',
                    action.disabled
                      ? 'bg-muted text-muted-foreground'
                      : `bg-gradient-to-r ${action.color} text-white`
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-medium">{action.label}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {action.query}
                </p>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          {/* Messages */}
          <div className="h-96 space-y-4 overflow-y-auto p-6">
            <AnimatePresence>
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    'flex space-x-3',
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.type === 'assistant' && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                      <BrainIcon className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-xs rounded-xl px-4 py-3 lg:max-w-md',
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-green-600">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex space-x-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                  <BrainIcon className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-xl bg-muted px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground"></div>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground delay-75"></div>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground delay-150"></div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex space-x-3">
              <textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about DeFi, your portfolio, or market trends..."
                className="flex-1 resize-none rounded-lg border border-border bg-background px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                rows={1}
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={cn(
                  'rounded-lg px-4 py-3 transition-all duration-200',
                  inputValue.trim() && !isLoading
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'cursor-not-allowed bg-muted text-muted-foreground'
                )}
              >
                <SendIcon className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <div className="mb-2 flex items-center justify-center space-x-2">
            <SparklesIcon className="h-4 w-4" />
            <span>Powered by OpenAI GPT-4</span>
          </div>
          <p>
            AI responses are for informational purposes only and should not be
            considered as financial advice.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
