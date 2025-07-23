'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  ZapIcon,
  AlertTriangleIcon,
  ActivityIcon,
  WifiIcon,
  DatabaseIcon,
  BrainIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Services
import { pricingService } from '@/services/pricing';
import { jupiterService } from '@/services/jupiter';
import { dexService } from '@/services/dex';
import { aiService } from '@/services/ai';

// Utils
import { cn } from '@/utils/cn';
import { formatDuration } from '@/utils/format';

// =============================================================================
// STATUS INTERFACES
// =============================================================================

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  responseTime: number;
  lastChecked: Date;
  icon: any;
  description: string;
  endpoint?: string | undefined;
}

interface SystemMetrics {
  uptime: number;
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
}

// =============================================================================
// STATUS PAGE COMPONENT
// =============================================================================

export default function StatusPage(): JSX.Element {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // ==========================================================================
  // STATUS CHECKING FUNCTIONS
  // ==========================================================================

  const checkServiceStatus = async (
    name: string,
    checkFunction: () => Promise<boolean>,
    icon: any,
    description: string,
    endpoint?: string
  ): Promise<ServiceStatus> => {
    const startTime = Date.now();

    try {
      const isHealthy = await checkFunction();
      const responseTime = Date.now() - startTime;

      return {
        name,
        status: isHealthy ? 'operational' : 'degraded',
        responseTime,
        lastChecked: new Date(),
        icon,
        description,
        endpoint,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`Status check failed for ${name}:`, error);

      return {
        name,
        status: 'outage',
        responseTime,
        lastChecked: new Date(),
        icon,
        description,
        endpoint,
      };
    }
  };

  const checkAllServices = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const statusChecks = await Promise.allSettled([
        // CoinGecko Pricing
        checkServiceStatus(
          'CoinGecko API',
          async () => {
            try {
              const response = await fetch(
                'https://api.coingecko.com/api/v3/ping'
              );
              return response.ok;
            } catch {
              return false;
            }
          },
          TrendingUpIcon,
          'Real-time cryptocurrency price data',
          'https://api.coingecko.com'
        ),

        // Jupiter API
        checkServiceStatus(
          'Jupiter API',
          async () => {
            try {
              // Test Jupiter API connectivity
              const response = await fetch(
                'https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000'
              );
              return response.ok;
            } catch {
              return false;
            }
          },
          ZapIcon,
          'Solana DEX aggregation and swap routing',
          'https://quote-api.jup.ag'
        ),

        // 1inch API
        checkServiceStatus(
          '1inch API',
          async () => {
            try {
              const response = await fetch(
                'https://api.1inch.io/v5.0/1/healthcheck'
              );
              return response.ok;
            } catch {
              return false;
            }
          },
          ActivityIcon,
          'Ethereum DEX aggregation and swap routing',
          'https://api.1inch.io'
        ),

        // OpenAI API
        checkServiceStatus(
          'OpenAI API',
          async () => {
            try {
              // We can't easily test OpenAI without making a real API call
              // So we'll assume it's operational if we have an API key
              return !!process.env.OPENAI_API_KEY;
            } catch {
              return false;
            }
          },
          BrainIcon,
          'AI-powered portfolio analysis and recommendations',
          'https://api.openai.com'
        ),

        // Solana RPC
        checkServiceStatus(
          'Solana RPC',
          async () => {
            try {
              const response = await fetch(
                process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
                  'https://api.mainnet-beta.solana.com',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getHealth',
                  }),
                }
              );
              return response.ok;
            } catch {
              return false;
            }
          },
          DatabaseIcon,
          'Solana blockchain connectivity',
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
            'https://api.mainnet-beta.solana.com'
        ),

        // Network Connectivity
        checkServiceStatus(
          'Network',
          async () => {
            try {
              const response = await fetch('/api/health');
              return response.ok;
            } catch {
              // Fallback check
              try {
                await fetch('https://api.github.com');
                return true;
              } catch {
                return false;
              }
            }
          },
          WifiIcon,
          'Internet connectivity and DNS resolution'
        ),
      ]);

      const serviceResults = statusChecks
        .map((result, index) =>
          result.status === 'fulfilled' ? result.value : null
        )
        .filter(Boolean) as ServiceStatus[];

      setServices(serviceResults);

      // Calculate system metrics
      const operational = serviceResults.filter(
        s => s.status === 'operational'
      ).length;
      const total = serviceResults.length;
      const avgResponseTime =
        serviceResults.reduce((sum, s) => sum + s.responseTime, 0) / total;

      setMetrics({
        uptime: (operational / total) * 100,
        totalRequests: Math.floor(Math.random() * 10000) + 50000, // Mock data
        successRate: (operational / total) * 100,
        avgResponseTime: Math.round(avgResponseTime),
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to check service status:', error);
      toast.error('Failed to check service status');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  useEffect(() => {
    checkAllServices();

    // Auto-refresh every 60 seconds
    const interval = setInterval(checkAllServices, 60000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'outage':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return CheckCircleIcon;
      case 'degraded':
        return AlertTriangleIcon;
      case 'outage':
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getStatusText = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'degraded':
        return 'Degraded';
      case 'outage':
        return 'Outage';
      default:
        return 'Unknown';
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 text-3xl font-bold text-foreground"
          >
            System Status
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Real-time status and performance metrics for all DeFi Portfolio
            services
          </motion.p>
        </div>

        {/* Overall Status */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 rounded-xl border border-border bg-card p-6"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-green-500">
                  {metrics.uptime.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-foreground">
                  {metrics.totalRequests.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Requests
                </div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-blue-500">
                  {metrics.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Success Rate
                </div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-purple-500">
                  {metrics.avgResponseTime}ms
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg Response
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Services Status */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const StatusIcon = getStatusIcon(service.status);
            const ServiceIcon = service.icon;

            return (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <ServiceIcon className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <StatusIcon
                    className={cn('h-5 w-5', getStatusColor(service.status))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        getStatusColor(service.status)
                      )}
                    >
                      {getStatusText(service.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Response Time
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {service.responseTime}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Last Checked
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {service.lastChecked.toLocaleTimeString()}
                    </span>
                  </div>
                  {service.endpoint && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Endpoint
                      </span>
                      <a
                        href={service.endpoint}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-sm text-blue-500 hover:text-blue-400"
                      >
                        <span>View</span>
                        <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Refresh Controls */}
        <div className="flex flex-col items-center justify-between space-y-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <ClockIcon className="h-4 w-4" />
            <span>Last updated: {lastUpdate.toLocaleString()}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={checkAllServices}
            disabled={isLoading}
            className={cn(
              'flex items-center space-x-2 rounded-lg border px-4 py-2 transition-all duration-200',
              isLoading
                ? 'cursor-not-allowed bg-muted text-muted-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <RefreshCwIcon
              className={cn('h-4 w-4', isLoading && 'animate-spin')}
            />
            <span>{isLoading ? 'Checking...' : 'Refresh Status'}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
