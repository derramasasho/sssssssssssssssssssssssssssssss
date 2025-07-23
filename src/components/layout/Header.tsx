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
  HomeIcon
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
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-dark-700 bg-white/80 dark:bg-dark-900/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="font-bold text-xl gradient-text hidden sm:block">
                DeFi Portfolio
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
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
              className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 transition-all duration-200"
            >
              <BellIcon className="w-5 h-5" />
              {hasUnread && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
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
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 transition-all duration-200"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
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
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
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
              className="md:hidden border-t border-gray-200 dark:border-dark-700 py-4"
            >
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      whileHover={{ x: 4 }}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 transition-all duration-200"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </motion.a>
                  );
                })}
              </nav>

              {/* Mobile Wallet Details */}
              {isConnected && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
                  <div className="px-3 py-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connected Wallet</p>
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
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-dark-700 bg-white/80 dark:bg-dark-900/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 dark:bg-dark-700 rounded-lg animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 dark:bg-dark-700 rounded animate-pulse hidden sm:block"></div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-dark-700 rounded-lg animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-dark-700 rounded-lg animate-pulse"></div>
            <div className="w-24 h-8 bg-gray-200 dark:bg-dark-700 rounded-lg animate-pulse"></div>
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
    <div className={clsx(
      'flex items-center space-x-2 px-2 py-1 rounded-md text-xs font-medium',
      'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      className
    )}>
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span>{chain.name}</span>
    </div>
  );
}