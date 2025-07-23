'use client';

import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { useWallet } from '@/hooks/useWallet';
import { useNotificationList } from '@/stores/notifications';
import { formatAddress } from '@/utils/format';
import { clsx } from 'clsx';

// =============================================================================
// NAVIGATION ITEMS
// =============================================================================

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Trading', href: '/trading', icon: CurrencyDollarIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

// =============================================================================
// HEADER COMPONENT
// =============================================================================

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { address, isConnected } = useWallet();
  const { unreadCount, hasUnread } = useNotificationList();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-dark-700 dark:bg-dark-900/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-600">
                <span className="text-lg font-bold text-white">D</span>
              </div>
              <span className="gradient-text hidden text-xl font-bold sm:block">
                DeFi Portfolio
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden space-x-1 md:flex">
              {navigation.map(item => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-dark-800 dark:hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </motion.a>
                );
              })}
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-dark-800 dark:hover:text-white"
            >
              <BellIcon className="h-5 w-5" />
              {hasUnread && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-dark-800 dark:hover:text-white"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </motion.button>

            {/* Wallet Connection */}
            <div className="hidden sm:block">
              <ConnectButton
                chainStatus="icon"
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
                showBalance={{
                  smallScreen: false,
                  largeScreen: true,
                }}
              />
            </div>

            {/* Mobile Wallet (simplified) */}
            <div className="sm:hidden">
              {isConnected ? (
                <div className="flex items-center space-x-2 rounded-lg bg-green-100 px-3 py-2 dark:bg-green-900">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {formatAddress(address!)}
                  </span>
                </div>
              ) : (
                <ConnectButton chainStatus="none" accountStatus="avatar" />
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-dark-800 dark:hover:text-white md:hidden"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200 py-4 dark:border-dark-700 md:hidden"
            >
              <nav className="space-y-1">
                {navigation.map(item => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      whileHover={{ x: 4 }}
                      className="flex items-center space-x-3 rounded-lg px-3 py-3 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-dark-800 dark:hover:text-white"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </motion.a>
                  );
                })}
              </nav>

              {/* Mobile Wallet Details */}
              {isConnected && (
                <div className="mt-4 border-t border-gray-200 pt-4 dark:border-dark-700">
                  <div className="px-3 py-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Connected Wallet
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatAddress(address!)}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

// =============================================================================
// LOADING HEADER (for SSR)
// =============================================================================

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-dark-700 dark:bg-dark-900/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-dark-700"></div>
            <div className="hidden h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-dark-700 sm:block"></div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-dark-700"></div>
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-dark-700"></div>
            <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-dark-700"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

// =============================================================================
// NETWORK STATUS INDICATOR
// =============================================================================

interface NetworkStatusProps {
  className?: string;
}

export function NetworkStatus({ className }: NetworkStatusProps) {
  const { chain, isConnected } = useWallet();

  if (!isConnected || !chain) return null;

  return (
    <div
      className={clsx(
        'flex items-center space-x-2 rounded-md px-2 py-1 text-xs font-medium',
        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        className
      )}
    >
      <div className="h-2 w-2 rounded-full bg-green-500"></div>
      <span>{chain.name}</span>
    </div>
  );
}
