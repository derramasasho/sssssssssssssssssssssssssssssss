'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

// =============================================================================
// FEATURES DATA
// =============================================================================

const features = [
  {
    icon: ChartBarIcon,
    title: 'Real-time Portfolio Tracking',
    description:
      'Monitor your DeFi positions across multiple protocols with live price updates and performance analytics.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'DEX Aggregation',
    description:
      'Get the best swap rates by comparing prices across all major decentralized exchanges.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Security First',
    description:
      'Non-custodial design means your funds never leave your wallet. Trade with confidence.',
  },
  {
    icon: SparklesIcon,
    title: 'AI-Powered Insights',
    description:
      'Get intelligent portfolio recommendations and market insights powered by advanced AI.',
  },
];

const stats = [
  { label: 'Total Volume', value: '$2.4B+' },
  { label: 'Active Users', value: '150K+' },
  { label: 'Protocols Integrated', value: '50+' },
  { label: 'Uptime', value: '99.9%' },
];

// =============================================================================
// HERO COMPONENT
// =============================================================================

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-purple-50 to-pink-50 dark:from-dark-950 dark:via-purple-950 dark:to-pink-950"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-brand-400/20"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="container relative mx-auto px-4 py-20 lg:py-32">
        {/* Main Hero Content */}
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              <span className="gradient-text">DeFi Portfolio</span>
              <br />
              <span className="text-gray-900 dark:text-gray-100">
                Made Simple
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mb-12 max-w-3xl text-xl text-gray-600 dark:text-gray-300 md:text-2xl"
          >
            Track, trade, and optimize your DeFi investments with our
            ultra-modern platform. Get real-time analytics, AI insights, and
            seamless trading across all major protocols.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  onClick={openConnectModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex items-center space-x-2 px-8 py-4 text-lg"
                >
                  <span>Connect Wallet</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </motion.button>
              )}
            </ConnectButton.Custom>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary flex items-center space-x-2 px-8 py-4 text-lg"
            >
              <PlayIcon className="h-5 w-5" />
              <span>Watch Demo</span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-20 grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="text-center"
              >
                <div className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100 md:text-4xl">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card-hover text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="mx-auto max-w-2xl rounded-2xl p-8 glass dark:glass-dark">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Ready to optimize your DeFi journey?
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Join thousands of traders who trust our platform for their DeFi
              operations.
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  onClick={openConnectModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                >
                  Get Started Now
                </motion.button>
              )}
            </ConnectButton.Custom>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// =============================================================================
// FLOATING ACTION BUTTON (Mobile)
// =============================================================================

export function FloatingConnectButton() {
  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <motion.button
            onClick={openConnectModal}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: 1,
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25"
          >
            <CurrencyDollarIcon className="h-6 w-6" />
          </motion.button>
        )}
      </ConnectButton.Custom>
    </div>
  );
}

// =============================================================================
// SOCIAL PROOF SECTION
// =============================================================================

export function SocialProof() {
  const logos = [
    { name: 'Uniswap', src: '/images/dex/uniswap.svg' },
    { name: 'Aave', src: '/images/protocols/aave.svg' },
    { name: 'Compound', src: '/images/protocols/compound.svg' },
    { name: 'Curve', src: '/images/dex/curve.svg' },
    { name: 'SushiSwap', src: '/images/dex/sushiswap.svg' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="border-t border-gray-200 py-12 dark:border-dark-700"
    >
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Integrated with leading DeFi protocols
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
        {logos.map((logo, index) => (
          <motion.div
            key={logo.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.1 + index * 0.1 }}
            className="grayscale filter transition-all duration-300 hover:grayscale-0"
          >
            <img
              src={logo.src}
              alt={logo.name}
              className="h-8 w-auto"
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
