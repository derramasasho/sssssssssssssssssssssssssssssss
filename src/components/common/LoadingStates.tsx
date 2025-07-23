'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  LoaderIcon,
  TrendingUpIcon,
  WalletIcon,
  BrainIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// =============================================================================
// LOADING SHIMMER COMPONENT
// =============================================================================

export function LoadingShimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]',
        className
      )}
      style={{
        animation: 'shimmer 2s infinite linear',
      }}
    />
  );
}

// =============================================================================
// SKELETON LOADERS
// =============================================================================

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-card p-6', className)}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <LoadingShimmer className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <LoadingShimmer className="h-4 w-3/4 rounded" />
            <LoadingShimmer className="h-3 w-1/2 rounded" />
          </div>
        </div>
        <LoadingShimmer className="h-8 w-full rounded" />
        <div className="flex space-x-2">
          <LoadingShimmer className="h-6 w-16 rounded-full" />
          <LoadingShimmer className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex space-x-4">
          <LoadingShimmer className="h-4 w-24 rounded" />
          <LoadingShimmer className="h-4 w-20 rounded" />
          <LoadingShimmer className="h-4 w-16 rounded" />
          <LoadingShimmer className="h-4 w-18 rounded" />
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border p-4 last:border-b-0">
          <div className="flex items-center space-x-4">
            <LoadingShimmer className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <LoadingShimmer className="h-4 w-32 rounded" />
              <LoadingShimmer className="h-3 w-20 rounded" />
            </div>
            <LoadingShimmer className="h-4 w-24 rounded" />
            <LoadingShimmer className="h-4 w-16 rounded" />
            <LoadingShimmer className="h-6 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-card p-6', className)}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <LoadingShimmer className="h-6 w-32 rounded" />
          <LoadingShimmer className="h-8 w-24 rounded-lg" />
        </div>

        {/* Chart area */}
        <div className="flex h-64 items-end space-x-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            >
              <LoadingShimmer className="h-full w-full" />
            </div>
          ))}
        </div>

        <div className="flex space-x-4">
          <LoadingShimmer className="h-3 w-16 rounded" />
          <LoadingShimmer className="h-3 w-20 rounded" />
          <LoadingShimmer className="h-3 w-14 rounded" />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SPECIALIZED LOADING STATES
// =============================================================================

export function PortfolioLoading() {
  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Portfolio Table */}
      <SkeletonTable rows={8} />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>
    </div>
  );
}

export function TradingPanelLoading() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <LoadingShimmer className="h-6 w-24 rounded" />
          <LoadingShimmer className="h-8 w-20 rounded-lg" />
        </div>

        {/* Token inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <LoadingShimmer className="h-4 w-16 rounded" />
            <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
              <LoadingShimmer className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <LoadingShimmer className="mb-1 h-4 w-20 rounded" />
                <LoadingShimmer className="h-3 w-16 rounded" />
              </div>
              <LoadingShimmer className="h-6 w-24 rounded" />
            </div>
          </div>

          <div className="flex justify-center">
            <LoadingShimmer className="h-10 w-10 rounded-full" />
          </div>

          <div className="space-y-2">
            <LoadingShimmer className="h-4 w-16 rounded" />
            <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
              <LoadingShimmer className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <LoadingShimmer className="mb-1 h-4 w-20 rounded" />
                <LoadingShimmer className="h-3 w-16 rounded" />
              </div>
              <LoadingShimmer className="h-6 w-24 rounded" />
            </div>
          </div>
        </div>

        {/* Quote details */}
        <div className="space-y-3 rounded-lg bg-muted p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <LoadingShimmer className="h-3 w-20 rounded" />
              <LoadingShimmer className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>

        {/* Action button */}
        <LoadingShimmer className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

// =============================================================================
// FULL PAGE LOADING
// =============================================================================

export function FullPageLoading({
  message = 'Loading DeFi Portfolio...',
  icon: Icon = TrendingUpIcon,
}: {
  message?: string;
  icon?: any;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600"
        >
          <Icon className="h-8 w-8 text-white" />
        </motion.div>

        {/* Loading Message */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-2 text-xl font-semibold text-foreground"
        >
          {message}
        </motion.h2>

        {/* Loading Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center space-x-1"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
              className="h-2 w-2 rounded-full bg-primary"
            />
          ))}
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-sm text-muted-foreground"
        >
          Connecting to DeFi protocols...
        </motion.p>
      </motion.div>
    </div>
  );
}

// =============================================================================
// INLINE LOADING STATES
// =============================================================================

export function InlineLoading({
  size = 'sm',
  message,
  className,
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <LoaderIcon
        className={cn('animate-spin text-primary', sizeClasses[size])}
      />
      {message && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
}

export function ButtonLoading({
  children,
  isLoading,
  disabled,
  ...props
}: {
  children: React.ReactNode;
  isLoading: boolean;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center',
        props.className
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoaderIcon className="h-4 w-4 animate-spin" />
        </div>
      )}
      <div className={cn(isLoading && 'opacity-0')}>{children}</div>
    </button>
  );
}

// =============================================================================
// CSS FOR SHIMMER ANIMATION
// =============================================================================

export const shimmerStyles = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;
